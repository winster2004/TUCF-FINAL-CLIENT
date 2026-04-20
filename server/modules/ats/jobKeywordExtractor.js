import { TECH_KEYWORDS } from './constants.js';
import { canonicalizeKeyword, createBigrams, getTopTokens, normalizeText, tokenize } from './textUtils.js';

/** Extracts prioritized keywords from a job description. */
export function extractJobKeywords(jobDescription) {
  const normalized = normalizeText(jobDescription);
  const tokens = tokenize(jobDescription);
  const topTokens = getTopTokens(jobDescription, 25);
  const bigrams = createBigrams(tokens);
  const bigramFrequency = new Map();

  for (const phrase of bigrams) {
    if (phrase.length < 6) {
      continue;
    }

    bigramFrequency.set(phrase, (bigramFrequency.get(phrase) || 0) + 1);
  }

  const topBigrams = [...bigramFrequency.entries()]
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([phrase]) => phrase);

  const techKeywords = TECH_KEYWORDS.filter((keyword) => normalized.includes(keyword));

  return [...new Set([...techKeywords, ...topBigrams, ...topTokens].map((keyword) => canonicalizeKeyword(keyword)))]
    .filter((keyword) => keyword.length >= 3 && /[a-z]/.test(keyword) && !/^\d/.test(keyword))
    .slice(0, 35);
}
