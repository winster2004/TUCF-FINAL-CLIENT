/** Combines ATS signals into a weighted final score. */
export function calculateWeightedScore({
  keywordCoverage,
  semanticScore,
  experienceScore,
  sectionCompleteness,
  stuffingPenalty,
}) {
  const weighted =
    keywordCoverage * 0.4 +
    semanticScore * 0.25 +
    experienceScore * 0.2 +
    sectionCompleteness * 0.15 -
    stuffingPenalty;

  return Math.max(0, Math.min(100, Math.round(weighted)));
}

/** Converts resume section coverage into a normalized score. */
export function scoreSectionCompleteness(sections) {
  const trackedSections = ['summary', 'skills', 'experience', 'education', 'projects'];
  const presentSections = trackedSections.filter((section) => (sections[section]?.wordCount || 0) > 0);
  return {
    score: Math.round((presentSections.length / trackedSections.length) * 100),
    presentSections,
    missingSections: trackedSections.filter((section) => !presentSections.includes(section)),
  };
}

