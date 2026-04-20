import { normalizeText } from './textUtils.js';

/** Reads an experience requirement like "3+ years" from a job description. */
export function detectRequiredExperience(jobDescription) {
  const normalized = normalizeText(jobDescription);
  const match = normalized.match(/(\d+)\+?\s*(?:years|year|yrs|yr)/);
  if (!match) {
    return {
      requiredYears: null,
      evidence: null,
    };
  }

  return {
    requiredYears: Number(match[1]),
    evidence: match[0],
  };
}

/** Estimates resume experience years from explicit year ranges and mentions. */
export function detectResumeExperienceYears(resumeText) {
  const currentYear = new Date().getFullYear();
  const normalized = normalizeText(resumeText);
  const yearRanges = [...normalized.matchAll(/\b(20\d{2}|19\d{2})\s*(?:-|to|–)\s*(present|current|20\d{2}|19\d{2})\b/g)];

  let derivedYears = 0;
  for (const match of yearRanges) {
    const start = Number(match[1]);
    const end = match[2] === 'present' || match[2] === 'current' ? currentYear : Number(match[2]);
    if (Number.isFinite(start) && Number.isFinite(end) && end >= start) {
      derivedYears += Math.max(0, end - start);
    }
  }

  const explicitMention = normalized.match(/(\d+)\+?\s*(?:years|year|yrs|yr)\s+of\s+experience/);
  const explicitYears = explicitMention ? Number(explicitMention[1]) : null;
  const estimatedYears = Math.max(derivedYears, explicitYears || 0);

  return {
    estimatedYears,
    evidence: explicitMention?.[0] || yearRanges[0]?.[0] || null,
  };
}

/** Scores how well resume experience aligns with the job requirement. */
export function scoreExperienceAlignment(jobDescription, resumeText) {
  const requirement = detectRequiredExperience(jobDescription);
  const resumeExperience = detectResumeExperienceYears(resumeText);

  if (!requirement.requiredYears) {
    return {
      score: resumeExperience.estimatedYears > 0 ? 100 : 70,
      requirement,
      resumeExperience,
      gapYears: 0,
    };
  }

  const gapYears = requirement.requiredYears - resumeExperience.estimatedYears;
  if (gapYears <= 0) {
    return {
      score: 100,
      requirement,
      resumeExperience,
      gapYears: 0,
    };
  }

  const score = Math.max(20, 100 - gapYears * 20);
  return {
    score,
    requirement,
    resumeExperience,
    gapYears,
  };
}

