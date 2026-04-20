import { pipeline } from '@huggingface/transformers';
import { normalizeText } from './textUtils.js';

let extractorPromise = null;

/** Lazily loads the local Hugging Face embedding pipeline once. */
async function getExtractor() {
  if (!extractorPromise) {
    extractorPromise = pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }

  return extractorPromise;
}

/** Averages token embeddings into a single vector. */
function meanPool(tensorOutput) {
  const raw = Array.isArray(tensorOutput) ? tensorOutput : tensorOutput.tolist();
  if (!Array.isArray(raw) || raw.length === 0) {
    return [];
  }

  if (typeof raw[0] === 'number') {
    return raw;
  }

  const tokenVectors = Array.isArray(raw[0]?.[0]) ? raw[0] : raw;
  if (!Array.isArray(tokenVectors) || tokenVectors.length === 0 || typeof tokenVectors[0] === 'number') {
    return [];
  }

  const dimensions = tokenVectors[0].length;
  const pooled = new Array(dimensions).fill(0);

  for (const vector of tokenVectors) {
    for (let index = 0; index < dimensions; index += 1) {
      pooled[index] += vector[index];
    }
  }

  return pooled.map((value) => value / tokenVectors.length);
}

/** Computes cosine similarity between two numeric vectors. */
function cosineSimilarity(vectorA, vectorB) {
  if (!vectorA.length || !vectorB.length || vectorA.length !== vectorB.length) {
    return 0;
  }

  let dot = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let index = 0; index < vectorA.length; index += 1) {
    dot += vectorA[index] * vectorB[index];
    magnitudeA += vectorA[index] ** 2;
    magnitudeB += vectorB[index] ** 2;
  }

  if (!magnitudeA || !magnitudeB) {
    return 0;
  }

  return dot / (Math.sqrt(magnitudeA) * Math.sqrt(magnitudeB));
}

/** Uses local Hugging Face embeddings to compare resume and job text semantically. */
export async function computeSemanticSimilarity(jobDescription, resumeText, sections) {
  const jobSummary = normalizeText(jobDescription).slice(0, 2500);
  const resumeSummary = [
    sections.summary?.text,
    sections.skills?.text,
    sections.experience?.text,
    sections.projects?.text,
    resumeText,
  ]
    .filter(Boolean)
    .join('\n')
    .slice(0, 3000);

  try {
    const extractor = await getExtractor();
    const [jobEmbedding, resumeEmbedding] = await Promise.all([
      extractor(jobSummary, { pooling: 'mean', normalize: true }),
      extractor(resumeSummary, { pooling: 'mean', normalize: true }),
    ]);

    const similarity = cosineSimilarity(meanPool(jobEmbedding), meanPool(resumeEmbedding));
    return {
      score: Math.max(0, Math.min(100, Math.round(similarity * 100))),
      provider: 'huggingface-local',
      fallbackUsed: false,
    };
  } catch (error) {
    const jobTokens = new Set(jobSummary.split(' ').filter(Boolean));
    const resumeTokens = new Set(resumeSummary.split(' ').filter(Boolean));
    const overlap = [...jobTokens].filter((token) => resumeTokens.has(token)).length;
    const union = new Set([...jobTokens, ...resumeTokens]).size || 1;
    const similarity = overlap / union;

    return {
      score: Math.max(0, Math.min(100, Math.round(similarity * 100))),
      provider: 'token-overlap-fallback',
      fallbackUsed: true,
      warning: error instanceof Error ? error.message : 'Semantic fallback used.',
    };
  }
}
