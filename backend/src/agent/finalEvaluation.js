function round1(n) {
  return Math.round(n * 10) / 10;
}

function average(evaluations, key) {
  if (evaluations.length === 0) return 0;
  return round1(evaluations.reduce((sum, e) => sum + (e[key] ?? 0), 0) / evaluations.length);
}

/**
 * Aggregates a completed interview's per-question evaluations into a single
 * structured summary. This is data only (JSON), not a report/UI — the final
 * "assessment report" itself is explicitly out of scope for this stage.
 */
export function buildFinalEvaluation(state) {
  const evaluations = state.evaluations;

  return {
    interviewId: state.interviewId,
    candidateId: state.candidateId,
    totalQuestions: state.questionCount,
    curriculumDaysCovered: state.coveredCurriculumDays,
    curriculumDaysCoveredCount: state.coveredCurriculumDays.length,
    averageScore: average(evaluations, "score"),
    averageCorrectness: average(evaluations, "correctness"),
    averageDepth: average(evaluations, "depth"),
    averageReasoning: average(evaluations, "reasoning"),
    averageClarity: average(evaluations, "clarity"),
    strengths: [...new Set(state.strengths)],
    knowledgeGaps: [...new Set(state.knowledgeGaps)],
    weaknesses: [...new Set(state.weaknesses)],
    meetsHackathonMinimums: {
      atLeast8Questions: state.questionCount >= 8,
      atLeast4Days: state.coveredCurriculumDays.length >= 4,
    },
    generatedAt: new Date().toISOString(),
  };
}
