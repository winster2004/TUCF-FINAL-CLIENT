import { countKeywordOccurrences, countWords } from './textUtils.js';

/** Detects when the same keywords appear too often for the resume length. */
export function detectKeywordStuffing(resumeText, trackedKeywords) {
  const wordCount = Math.max(countWords(resumeText), 1);
  const repeatedKeywords = [];
  let penalty = 0;

  for (const keyword of trackedKeywords.slice(0, 15)) {
    const occurrences = countKeywordOccurrences(resumeText, keyword);
    const density = occurrences / wordCount;

    if (occurrences >= 6 || density >= 0.035) {
      repeatedKeywords.push({
        keyword,
        occurrences,
        density: Number((density * 100).toFixed(2)),
      });
      penalty += 4;
    }
  }

  return {
    penalty: Math.min(penalty, 18),
    repeatedKeywords,
    flagged: repeatedKeywords.length > 0,
  };
}

