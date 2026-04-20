import { SKILL_CATEGORIES } from './constants.js';

/** Groups missing keywords into readable skill-gap buckets. */
export function buildSkillGapAnalysis(missingKeywords) {
  const grouped = Object.entries(SKILL_CATEGORIES).map(([category, skills]) => ({
    category,
    missing: missingKeywords.filter((keyword) => skills.includes(keyword)),
  }));

  return grouped.filter((entry) => entry.missing.length > 0);
}

/** Builds actionable suggestions from the scoring output. */
export function buildSuggestions({
  missingKeywords,
  semanticScore,
  experienceScore,
  stuffing,
  sections,
  synonymMatches,
  resumeWordCount,
}) {
  const suggestions = [];

  if (!sections.summary?.wordCount) {
    suggestions.push('Add a short professional summary near the top of the resume to improve ATS context.');
  }

  if (!sections.skills?.wordCount) {
    suggestions.push('Include a dedicated skills section so recruiters and ATS systems can scan your stack quickly.');
  }

  if (missingKeywords.length > 0) {
    suggestions.push(`Add evidence for missing requirements such as ${missingKeywords.slice(0, 5).join(', ')} where they truthfully apply.`);
  }

  if (synonymMatches.length > 0) {
    suggestions.push('Use the exact wording from the job description for a few matched skills instead of relying only on synonyms.');
  }

  if (semanticScore < 60) {
    suggestions.push('Your resume language is not closely aligned with the job post. Rewrite the summary and experience bullets using the role vocabulary.');
  }

  if (experienceScore < 70) {
    suggestions.push('Highlight tenure, ownership, and measurable outcomes more clearly to close the experience gap.');
  }

  if (resumeWordCount < 250) {
    suggestions.push('The resume is short. Add quantified achievements, project impact, and tool-specific responsibilities.');
  }

  if (stuffing.flagged) {
    suggestions.push('Reduce repeated keyword blocks. ATS systems reward relevance, not unnatural repetition.');
  }

  if (suggestions.length === 0) {
    suggestions.push('Baseline alignment is strong. Tailor project bullets and achievements for this specific role to push the score higher.');
  }

  return suggestions;
}

