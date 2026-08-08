import { Router } from "express";
import { interviewOrchestrator } from "../agent/interviewOrchestrator.js";
import { candidatesService } from "../candidates/candidates.service.js";
import { sessionStore } from "./sessionStore.js";
import { buildFeedback } from "./feedbackMapper.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ValidationError, NotFoundError } from "../utils/errors.js";

/**
 * POST /api/interview — the hackathon's single conversational endpoint.
 *
 * This file is deliberately thin: it validates the HTTP request, maps
 * `sessionId` to the existing orchestrator's `interviewId`, and translates
 * `interviewOrchestrator.createInterview` / `.submitAnswer` results into the
 * exact `{ reply, done, feedback? }` contract. All actual interview logic
 * (planning, question generation, evaluation, adaptive branching, memory)
 * stays in src/agent and src/memory, untouched.
 */
export const interviewRouter = Router();

/** Pulls a candidate id out of either `{ id }` or `{ member: { id } }` — the
 * two shapes a `candidates.json` entry (or a client echoing one back) could
 * reasonably take. */
function extractCandidateId(candidate) {
  if (typeof candidate?.id === "string" && candidate.id.trim() !== "") {
    return candidate.id.trim();
  }
  if (typeof candidate?.member?.id === "string" && candidate.member.id.trim() !== "") {
    return candidate.member.id.trim();
  }
  return null;
}

function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requireSessionId(body) {
  const { sessionId } = body;
  if (typeof sessionId !== "string" || sessionId.trim() === "") {
    throw new ValidationError("'sessionId' is required and must be a non-empty string.");
  }
  return sessionId.trim();
}

/**
 * Starts a brand-new interview for `sessionId`, using the existing
 * interviewPlanner/questionGenerator/orchestrator exactly as audited —
 * nothing about interview creation is reimplemented here.
 */
async function startInterview(sessionId, candidateInput) {
  if (!isPlainObject(candidateInput)) {
    throw new ValidationError("'candidate' is required to start a new interview and must be an object.");
  }

  const candidateId = extractCandidateId(candidateInput);
  if (!candidateId) {
    throw new ValidationError(
      "'candidate' must include an 'id' (or 'member.id') matching a known candidate record."
    );
  }

  // Confirms the candidate actually exists in the data layer (throws
  // NotFoundError -> 404 if not) rather than trusting arbitrary client-sent
  // candidate data; interviewOrchestrator.createInterview looks the
  // candidate up by id the same way internally.
  const candidate = candidatesService.getCandidateById(candidateId);

  const result = await interviewOrchestrator.createInterview(candidateId);
  sessionStore.set(sessionId, result.interviewId);

  const name = candidate.member?.name ? `, ${candidate.member.name}` : "";
  const reply = `Welcome${name}! Let's begin your interview.\n\n${result.question.question}`;

  return { reply, done: false };
}

/**
 * Continues an existing interview: the candidate's `message` is treated as
 * the answer to the current question and run through the EXISTING
 * evaluate -> memory-write -> memory-retrieve -> adaptive-decide ->
 * generate-next-question flow inside interviewOrchestrator.submitAnswer.
 */
async function continueInterview(sessionId, interviewId, message) {
  if (typeof message !== "string" || message.trim() === "") {
    throw new ValidationError("'message' is required to continue an interview and must be a non-empty string.");
  }

  const result = await interviewOrchestrator.submitAnswer(interviewId, message);

  if (result.status === "completed") {
    return {
      reply: "Interview completed.",
      done: true,
      feedback: buildFeedback(result.finalEvaluation),
    };
  }

  return { reply: result.question.question, done: false };
}

interviewRouter.post(
  "/api/interview",
  asyncHandler(async (req, res) => {
    const body = req.body;
    if (!isPlainObject(body)) {
      throw new ValidationError("Request body must be a JSON object.");
    }

    const sessionId = requireSessionId(body);
    const interviewId = sessionStore.get(sessionId);

    if (!interviewId) {
      // No interview known for this sessionId yet.
      if (body.candidate !== undefined) {
        const response = await startInterview(sessionId, body.candidate);
        return res.status(200).json(response);
      }
      if (body.message !== undefined) {
        // A "continue" shaped request against a sessionId we've never seen
        // (never started, or lost across a server restart — see README
        // "Known limitations"). Handled safely: a clear 404, not a crash.
        throw new NotFoundError(
          `No interview session found for sessionId '${sessionId}'. Start a new interview by including 'candidate' in the request.`
        );
      }
      throw new ValidationError("Request must include 'candidate' (to start) or 'message' (to continue).");
    }

    const response = await continueInterview(sessionId, interviewId, body.message);
    return res.status(200).json(response);
  })
);
