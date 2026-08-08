/**
 * Builds the prompt for generating a new, non-follow-up interview question.
 * Grounded strictly in the curriculum day handed in via `context.assessment`
 * (already resolved from the real curriculum.json by the caller) — the
 * model is told exactly what material exists and not to go beyond it.
 */
export function buildQuestionPrompt(context) {
  const { assessment, candidateProfile, previousQuestions, memoryContext, avoidHint } = context;

  const system = [
    "You are the question-generation module of an AI technical interviewer.",
    "You generate ONE interview question grounded strictly in the supplied curriculum material.",
    "Respond with ONLY a single JSON object — no prose, no markdown fences — matching exactly:",
    '{"question": string, "focusConcepts": string[]}',
    "focusConcepts should name the specific concepts a strong answer must demonstrate.",
    "Never invent curriculum content that is not provided in the context below.",
  ].join("\n");

  const prompt = [
    `Candidate role: ${candidateProfile.jobRole} (${candidateProfile.yearsExperience} yrs experience, ${candidateProfile.education}).`,
    `Curriculum day ${assessment.curriculumDay} — "${assessment.topic}"${
      assessment.moduleTitle ? ` (module: ${assessment.moduleTitle})` : ""
    }.`,
    `Primary skill/tool: ${assessment.skill}.`,
    `Day objectives: ${(assessment.objectives ?? []).join("; ") || "none provided"}.`,
    `Question type: ${assessment.questionType}. Target difficulty: ${assessment.difficulty}.`,
    previousQuestions?.length > 0
      ? `Already asked this interview (do not repeat or rephrase these): ${previousQuestions.join(" | ")}`
      : "This is the first question of the interview.",
    avoidHint
      ? `Your previous attempt duplicated a prior question: "${avoidHint}". Ask something meaningfully different.`
      : "",
    memoryContext && Object.keys(memoryContext).length > 0
      ? `Longer-term candidate memory context: ${JSON.stringify(memoryContext)}`
      : "",
    "Generate one question that assesses real understanding of the above material at the target difficulty and type. Return only the JSON object.",
  ]
    .filter(Boolean)
    .join("\n");

  return { system, prompt };
}
