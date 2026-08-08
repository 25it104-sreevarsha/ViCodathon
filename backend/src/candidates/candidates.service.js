import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { DataLoadError, NotFoundError, ValidationError } from "../utils/errors.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CANDIDATES_PATH = path.join(__dirname, "..", "data", "candidates.json");

// Module-level cache, same reasoning as curriculum.service.js.
let candidatesCache = null;

/**
 * Checks that the parsed JSON looks like the candidates file we expect.
 * Only validates fields Part 1 actually uses — member.id/name and a
 * missions array. We deliberately don't require every mission to have
 * "passed" or "attempts" because skipped missions legitimately omit them.
 */
function validateCandidatesShape(data) {
  if (!data || typeof data !== "object") {
    throw new DataLoadError("candidates.json did not parse to an object.");
  }
  if (!Array.isArray(data.candidates) || data.candidates.length === 0) {
    throw new DataLoadError("candidates.json is missing a non-empty 'candidates' array.");
  }

  const seenIds = new Set();
  data.candidates.forEach((candidate, index) => {
    const member = candidate.member;
    if (!member || typeof member.id !== "string" || member.id.trim() === "") {
      throw new DataLoadError(`candidates.json candidates[${index}] is missing 'member.id'.`);
    }
    if (typeof member.name !== "string" || member.name.trim() === "") {
      throw new DataLoadError(`candidates.json candidate ${member.id} is missing 'member.name'.`);
    }
    if (!Array.isArray(candidate.missions)) {
      throw new DataLoadError(`candidates.json candidate ${member.id} is missing a 'missions' array.`);
    }
    if (seenIds.has(member.id)) {
      throw new DataLoadError(`candidates.json has a duplicate candidate id: ${member.id}.`);
    }
    seenIds.add(member.id);
  });
}

/**
 * Loads candidates.json from disk, parses, validates, and caches it.
 * Throws DataLoadError on a missing file or malformed JSON.
 */
function loadCandidates() {
  if (candidatesCache) return candidatesCache;

  let raw;
  try {
    raw = readFileSync(CANDIDATES_PATH, "utf-8");
  } catch (err) {
    throw new DataLoadError(`Could not read candidates.json at ${CANDIDATES_PATH}: ${err.message}`);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new DataLoadError(`candidates.json contains invalid JSON: ${err.message}`);
  }

  validateCandidatesShape(parsed);

  candidatesCache = parsed;
  return candidatesCache;
}

/** Confirms the candidates file loads and validates. Used by /health. */
function isAvailable() {
  try {
    loadCandidates();
    return true;
  } catch {
    return false;
  }
}

/** Returns a lightweight summary of every candidate: { id, name, jobRole, status }. */
function listCandidates() {
  return loadCandidates().candidates.map(({ member }) => ({
    id: member.id,
    name: member.name,
    jobRole: member.jobRole,
    status: member.status,
  }));
}

function findCandidate(candidateId) {
  return loadCandidates().candidates.find((c) => c.member.id === candidateId);
}

/**
 * Returns the full candidate record (member + missions + signals) for the
 * identifier actually present in the data ("CAND-001", etc). Throws if the
 * candidate doesn't exist — never returns fake/default candidate data.
 */
function getCandidateById(candidateId) {
  if (typeof candidateId !== "string" || candidateId.trim() === "") {
    throw new ValidationError("candidateId must be a non-empty string.");
  }
  const candidate = findCandidate(candidateId);
  if (!candidate) {
    throw new NotFoundError(`No candidate found with id '${candidateId}'.`);
  }
  return candidate;
}

/** Returns the full missions array for a candidate, in the original order. */
function getCandidateMissions(candidateId) {
  return getCandidateById(candidateId).missions;
}

/** Returns only missions the candidate passed (passed === true). */
function getCompletedMissions(candidateId) {
  return getCandidateMissions(candidateId).filter((m) => m.passed === true);
}

/** Returns only missions the candidate attempted but did not pass (passed === false). */
function getFailedMissions(candidateId) {
  return getCandidateMissions(candidateId).filter((m) => m.passed === false);
}

/** Returns only missions the candidate skipped entirely. */
function getSkippedMissions(candidateId) {
  return getCandidateMissions(candidateId).filter((m) => m.skipped === true);
}

/** Returns the candidate's aggregate learning signals (commitDays, etc), as provided. */
function getCandidateSignals(candidateId) {
  return getCandidateById(candidateId).signals ?? null;
}

export const candidatesService = {
  isAvailable,
  listCandidates,
  getCandidateById,
  getCandidateMissions,
  getCompletedMissions,
  getFailedMissions,
  getSkippedMissions,
  getCandidateSignals,
};
