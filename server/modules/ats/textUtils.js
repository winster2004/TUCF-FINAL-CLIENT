import { KEYWORD_SYNONYMS, STOP_WORDS } from './constants.js';

const CANONICAL_KEYWORD_MAP = new Map();
for (const [canonical, variants] of Object.entries(KEYWORD_SYNONYMS)) {
  CANONICAL_KEYWORD_MAP.set(canonical, canonical);
  for (const variant of variants) {
    CANONICAL_KEYWORD_MAP.set(normalizeText(variant), canonical);
  }
}

/** Normalizes free-form text for matching and scoring. */
export function normalizeText(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/\r/g, '\n')
    .replace(/[^\w+#./\-\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Splits text into lines while preserving meaningful non-empty content. */
export function toLines(text) {
  return String(text || '')
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

/** Tokenizes text for frequency and coverage analysis. */
export function tokenize(text) {
  return normalizeText(text)
    .split(' ')
    .map((token) => token.replace(/^[^a-z0-9+#]+|[^a-z0-9+#./-]+$/g, ''))
    .filter((token) => token.length >= 2 && /^[a-z]/.test(token) && !STOP_WORDS.has(token));
}

/** Counts words in a normalized and predictable way. */
export function countWords(text) {
  const normalized = normalizeText(text);
  return normalized ? normalized.split(' ').length : 0;
}

/** Escapes a string before building a regular expression. */
export function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** Builds a keyword lookup list including the configured synonyms. */
export function expandKeyword(keyword) {
  const normalized = normalizeText(keyword);
  const canonical = CANONICAL_KEYWORD_MAP.get(normalized) || normalized;
  const variants = KEYWORD_SYNONYMS[canonical] || [];
  return [...new Set([canonical, ...variants.map((variant) => normalizeText(variant))])];
}

/** Normalizes a keyword to its canonical ATS form. */
export function canonicalizeKeyword(keyword) {
  const normalized = normalizeText(keyword).replace(/^[^a-z0-9+#]+|[^a-z0-9+#./-]+$/g, '');
  return CANONICAL_KEYWORD_MAP.get(normalized) || normalized;
}

/** Checks whether any variant of a keyword appears in a text block. */
export function containsKeyword(text, keyword) {
  const haystack = ` ${normalizeText(text)} `;
  return expandKeyword(keyword).some((variant) => haystack.includes(` ${variant} `) || haystack.includes(variant));
}

/** Counts approximate keyword repetitions to catch stuffing. */
export function countKeywordOccurrences(text, keyword) {
  const haystack = normalizeText(text);
  return expandKeyword(keyword).reduce((total, variant) => {
    const regex = new RegExp(`\\b${escapeRegExp(variant)}\\b`, 'g');
    const matches = haystack.match(regex);
    return total + (matches ? matches.length : 0);
  }, 0);
}

/** Returns the most frequent tokens in a text block. */
export function getTopTokens(text, limit = 20) {
  const frequency = new Map();
  for (const token of tokenize(text)) {
    frequency.set(token, (frequency.get(token) || 0) + 1);
  }

  return [...frequency.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([token]) => token);
}

/** Creates two-word phrases from a token array. */
export function createBigrams(tokens) {
  const bigrams = [];
  for (let index = 0; index < tokens.length - 1; index += 1) {
    bigrams.push(`${tokens[index]} ${tokens[index + 1]}`);
  }

  return bigrams;
}
