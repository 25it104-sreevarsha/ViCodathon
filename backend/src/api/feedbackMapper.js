/**
 * Adapts `finalEvaluation.js`'s existing structured output (task brief's
 * internal shape — averages, meetsHackathonMinimums, etc.) into exactly the
 * `feedback` shape the hackathon Technical Specification requires:
 *
 *   { summary: string, strengths: string[], gaps: string[], next: string[] }
 *
 * Deliberately a pure, separate adapter rather than a change to
 * `finalEvaluation.js` — the engine's internal final-evaluation shape stays
 * intact for anything else that depends on it; this is presentation-layer
 * mapping for the HTTP contract only.
 */

function buildSummary(finalEvaluation) {
  const { totalQuestions, curriculumDaysCoveredCount, averageScore } = finalEvaluation;
  return (
    `Completed ${totalQuestions} question(s) across ${curriculumDaysCoveredCount} curriculum day(s) ` +
    `with an average score of ${averageScore}/10.`
  );
}

/** Turns each gap/weakness into a short, actionable "what to work on" line. */
function buildNextSteps(finalEvaluation) {
  const topics = [...new Set([...finalEvaluation.knowledgeGaps, ...finalEvaluation.weaknesses])];
  return topics.map((topic) => `Review and practice: ${topic}`);
}

export function buildFeedback(finalEvaluation) {
  return {
    summary: buildSummary(finalEvaluation),
    strengths: [...finalEvaluation.strengths],
    gaps: [...new Set([...finalEvaluation.knowledgeGaps, ...finalEvaluation.weaknesses])],
    next: buildNextSteps(finalEvaluation),
  };
}
