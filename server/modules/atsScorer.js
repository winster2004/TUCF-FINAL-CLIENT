import { scoreExperienceAlignment } from './ats/experienceAnalyzer.js';
import { extractJobKeywords } from './ats/jobKeywordExtractor.js';
import { matchKeywords } from './ats/keywordMatcher.js';
import { scoreSectionCompleteness, calculateWeightedScore } from './ats/scoring.js';
import { parseResumeSections } from './ats/sectionParser.js';
import { computeSemanticSimilarity } from './ats/semanticMatcher.js';
import { buildSkillGapAnalysis, buildSuggestions } from './ats/suggestionsEngine.js';
import { detectKeywordStuffing } from './ats/stuffingAnalyzer.js';
import { countWords } from './ats/textUtils.js';

/** Converts parsed section data into a smaller API-friendly structure. */
function serializeSections(sections) {
  return Object.fromEntries(
    Object.entries(sections).map(([key, value]) => [
      key,
      {
        preview: value.lines.slice(0, 4),
        wordCount: value.wordCount,
      },
    ]),
  );
}

/** Runs the full ATS analysis pipeline for a resume and job description pair. */
export async function analyzeResumeAgainstJob(resumeText, jobDescription) {
  const sections = parseResumeSections(resumeText);
  const keywords = extractJobKeywords(jobDescription);
  const keywordAnalysis = matchKeywords(resumeText, keywords);
  const semanticAnalysis = await computeSemanticSimilarity(jobDescription, resumeText, sections);
  const experienceAnalysis = scoreExperienceAlignment(jobDescription, resumeText);
  const sectionCompleteness = scoreSectionCompleteness(sections);
  const stuffingAnalysis = detectKeywordStuffing(resumeText, keywords);
  const resumeWordCount = countWords(resumeText);

  const score = calculateWeightedScore({
    keywordCoverage: keywordAnalysis.keywordCoverage,
    semanticScore: semanticAnalysis.score,
    experienceScore: experienceAnalysis.score,
    sectionCompleteness: sectionCompleteness.score,
    stuffingPenalty: stuffingAnalysis.penalty,
  });

  const skillGapAnalysis = buildSkillGapAnalysis(keywordAnalysis.missingKeywords);
  const suggestions = buildSuggestions({
    missingKeywords: keywordAnalysis.missingKeywords,
    semanticScore: semanticAnalysis.score,
    experienceScore: experienceAnalysis.score,
    stuffing: stuffingAnalysis,
    sections,
    synonymMatches: keywordAnalysis.synonymMatches,
    resumeWordCount,
  });

  return {
    score,
    matchedKeywords: keywordAnalysis.matchedKeywords,
    missingKeywords: keywordAnalysis.missingKeywords,
    suggestions,
    sections: serializeSections(sections),
    synonymsMatched: keywordAnalysis.synonymMatches,
    skillGapAnalysis,
    semanticSimilarity: semanticAnalysis,
    experienceAnalysis,
    keywordStuffing: stuffingAnalysis,
    scoringBreakdown: {
      keywordCoverage: Math.round(keywordAnalysis.keywordCoverage),
      semanticSimilarity: semanticAnalysis.score,
      experienceAlignment: experienceAnalysis.score,
      sectionCompleteness: sectionCompleteness.score,
      stuffingPenalty: stuffingAnalysis.penalty,
    },
    totals: {
      requiredKeywords: keywords.length,
      matchedKeywords: keywordAnalysis.matchedKeywords.length,
      resumeWordCount,
      missingSections: sectionCompleteness.missingSections.length,
    },
  };
}
