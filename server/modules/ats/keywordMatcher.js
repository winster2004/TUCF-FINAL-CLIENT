import { canonicalizeKeyword, expandKeyword, containsKeyword, normalizeText } from './textUtils.js';

/** Matches keywords and synonym coverage between a resume and a job description. */
export function matchKeywords(resumeText, keywords) {
  const normalizedResume = normalizeText(resumeText);
  const canonicalKeywords = [...new Set(keywords.map((keyword) => canonicalizeKeyword(keyword)))];
  const matchedKeywords = [];
  const missingKeywords = [];
  const synonymMatches = [];

  for (const keyword of canonicalKeywords) {
    const variants = expandKeyword(keyword);
    const directMatch = normalizedResume.includes(normalizeText(keyword));

    if (directMatch) {
      matchedKeywords.push(keyword);
      continue;
    }

    const matchedVariant = variants.find((variant) => containsKeyword(normalizedResume, variant));
    if (matchedVariant) {
      matchedKeywords.push(keyword);
      synonymMatches.push({
        keyword,
        matchedVia: matchedVariant,
      });
      continue;
    }

    missingKeywords.push(keyword);
  }

  const totalKeywords = Math.max(keywords.length, 1);
  const keywordCoverage = (matchedKeywords.length / totalKeywords) * 100;

  return {
    matchedKeywords,
    missingKeywords,
    synonymMatches,
    keywordCoverage: Number(keywordCoverage.toFixed(2)),
  };
}
