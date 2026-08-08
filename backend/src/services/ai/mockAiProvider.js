/**
 * Deterministic stand-in for a real LLM.
 *
 * This is what runs when AI_PROVIDER=mock (the default). It exists so local
 * development and the automated tests are fast, free, and reproducible
 * without any API key, while still exercising the exact same code path
 * (questionGenerator -> aiProvider.complete -> JSON parsing/validation) that
 * a real model call would go through.
 *
 * It implements the same `complete({ system, prompt, context })` interface
 * as `anthropicAiProvider`, so swapping providers (see aiProvider.js) never
 * requires touching questionGenerator.js or answerEvaluator.js.
 *
 * Unlike a real provider, the mock reasons over the structured `context`
 * object directly instead of parsing its own prompt text back out — that
 * keeps its behavior decoupled from prompt wording changes.
 */

const QUESTION_TEMPLATES = {
  conceptual: (a) => `Can you explain how ${a.skill} fits into "${a.topic}", and why it matters?`,
  application: (a) => `Walk me through how you'd apply ${a.skill} to solve a real problem from "${a.topic}".`,
  reasoning: (a) =>
    `Suppose ${a.skill} behaved unexpectedly while working on "${a.topic}" — how would you reason through diagnosing it?`,
  debugging: (a) =>
    `A teammate's implementation of "${a.topic}" using ${a.skill} is producing wrong results — how would you debug it?`,
  scenario: (a) =>
    `You're asked to ship a feature depending on "${a.topic}" under a tight deadline — how would you approach it using ${a.skill}?`,
  "system-design": (a) =>
    `How would you design a system that relies on "${a.topic}" (${a.skill}) at production scale?`,
};

function buildQuestionText(assessment) {
  const template = QUESTION_TEMPLATES[assessment.questionType] || QUESTION_TEMPLATES.conceptual;
  const base = template(assessment);
  return assessment.difficulty === "hard" ? `${base} Be specific about edge cases.` : base;
}

function buildFollowUpText(assessment) {
  const gap = assessment.focusConcepts?.[0] || assessment.topic;
  return `Let's go deeper on one part of your last answer — can you elaborate specifically on "${gap}" within "${assessment.topic}"?`;
}

function keywordsFor(day) {
  return [...(day.tools ?? []), ...(day.objectives ?? []).flatMap((o) => o.split(/\s+/))]
    .map((w) => w.toLowerCase().replace(/[^a-z0-9]/g, ""))
    .filter((w) => w.length > 3);
}

/**
 * Very simple keyword-overlap heuristic standing in for real answer
 * understanding: an answer that mentions the day's actual tools/objective
 * words scores higher; hedging language ("I don't know") scores near zero.
 * Good enough to deterministically exercise the adaptive engine's branches
 * in tests without a real model.
 */
function scoreAnswer(answerText, day) {
  const text = answerText.toLowerCase();
  const hedges = ["i don't know", "not sure", "no idea", "no clue", "not familiar", "i dont know"];
  if (hedges.some((h) => text.includes(h))) {
    return { score: 1.5, hits: [], keywords: keywordsFor(day) };
  }

  const keywords = [...new Set(keywordsFor(day))];
  const hits = keywords.filter((k) => text.includes(k));
  const hitRatio = keywords.length > 0 ? hits.length / keywords.length : 0.3;
  const lengthBonus = Math.min(2, answerText.trim().split(/\s+/).length / 40);
  const score = Math.max(0, Math.min(10, hitRatio * 7 + lengthBonus + 1));
  return { score, hits, keywords };
}

function buildEvaluation(context) {
  const { answerText, day } = context;
  const { score, hits, keywords } = scoreAnswer(answerText, day);
  const missing = keywords.filter((k) => !hits.includes(k)).slice(0, 3);
  const objectives = day.objectives ?? [];

  return {
    score: Number(score.toFixed(1)),
    correctness: Number(score.toFixed(1)),
    depth: Number(Math.max(0, score - 1).toFixed(1)),
    reasoning: Number(Math.max(0, score - 0.5).toFixed(1)),
    clarity: Number(Math.min(10, score + 0.5).toFixed(1)),
    missingConcepts: missing.length > 0 ? missing : score < 5 ? objectives.slice(0, 1) : [],
    misconceptions: score < 3 ? [`Answer does not engage with "${day.title}"`] : [],
    strengths: hits.slice(0, 3),
    knowledgeGaps: missing,
    shouldFollowUp: score < 7,
    recommendedDifficulty: score >= 8 ? "hard" : score >= 5 ? "medium" : "easy",
  };
}

async function complete({ context }) {
  if (!context || !context.kind) {
    throw new Error(
      "mockAiProvider requires a `context` object with a `kind` of 'question' | 'followup' | 'evaluation'."
    );
  }

  if (context.kind === "evaluation") {
    return JSON.stringify(buildEvaluation(context));
  }

  const assessment = context.assessment;
  const question = context.kind === "followup" ? buildFollowUpText(assessment) : buildQuestionText(assessment);
  const focusConcepts = assessment.objectives?.slice(0, 2) ?? [];
  return JSON.stringify({ question, focusConcepts });
}

export const mockAiProvider = { complete };
