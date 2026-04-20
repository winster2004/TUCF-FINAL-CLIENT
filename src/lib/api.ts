export interface ATSAnalysis {
  score: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  sections: Record<string, { preview: string[]; wordCount: number }>;
  synonymsMatched: Array<{
    keyword: string;
    matchedVia: string;
  }>;
  skillGapAnalysis: Array<{
    category: string;
    missing: string[];
  }>;
  semanticSimilarity: {
    score: number;
    provider: string;
    fallbackUsed: boolean;
    warning?: string;
  };
  experienceAnalysis: {
    score: number;
    requirement: {
      requiredYears: number | null;
      evidence: string | null;
    };
    resumeExperience: {
      estimatedYears: number;
      evidence: string | null;
    };
    gapYears: number;
  };
  keywordStuffing: {
    penalty: number;
    flagged: boolean;
    repeatedKeywords: Array<{
      keyword: string;
      occurrences: number;
      density: number;
    }>;
  };
  scoringBreakdown: {
    keywordCoverage: number;
    semanticSimilarity: number;
    experienceAlignment: number;
    sectionCompleteness: number;
    stuffingPenalty: number;
  };
  totals: {
    requiredKeywords: number;
    matchedKeywords: number;
    resumeWordCount: number;
    missingSections: number;
  };
}

export interface PortfolioProject {
  name: string;
  description: string;
  link: string;
  techTags: string[];
}

export interface PortfolioEducation {
  degree: string;
  college: string;
  years: string;
}

export interface PortfolioExperience {
  role: string;
  company: string;
  duration: string;
  description: string;
}

export interface PortfolioGenerateRequest {
  fullName: string;
  title: string;
  tagline: string;
  bio: string;
  email: string;
  location: string;
  github: string;
  linkedin: string;
  resumeUrl: string;
  hireLink: string;
  profileImageUrl: string;
  resumeFileName: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  template: string;
  skills: string[];
  projects: PortfolioProject[];
  education: PortfolioEducation[];
  experience: PortfolioExperience[];
  theme: string;
}

export interface PortfolioGenerateResponse {
  html: string;
  theme: string;
  fileName: string;
}

export interface UploadResumeResponse {
  resumeUrl: string;
  resumeFileName: string;
}

async function readJsonOrThrow<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');

  if (!isJson) {
    const text = await response.text();
    const shortBody = text.slice(0, 120).replace(/\s+/g, ' ').trim();
    throw new Error(
      `API returned non-JSON response (${response.status}). ${
        shortBody || 'Backend might be down or route is misconfigured.'
      }`,
    );
  }

  const payload = await response.json();
  if (!response.ok) {
    const message =
      payload && typeof payload.error === 'string'
        ? payload.error
        : `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return payload as T;
}

export async function scoreResume(file: File, jobDescription: string): Promise<ATSAnalysis> {
  const formData = new FormData();
  formData.append('resume', file);
  formData.append('jobDescription', jobDescription);

  const response = await fetch('/api/ats/score', {
    method: 'POST',
    body: formData,
  });

  return readJsonOrThrow<ATSAnalysis>(response);
}

export async function generatePortfolio(
  payload: PortfolioGenerateRequest,
): Promise<PortfolioGenerateResponse> {
  const response = await fetch('/api/portfolio/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  return readJsonOrThrow<PortfolioGenerateResponse>(response);
}

export async function uploadPortfolioResume(file: File): Promise<UploadResumeResponse> {
  const formData = new FormData();
  formData.append('resume', file);

  const response = await fetch('/api/portfolio/resume', {
    method: 'POST',
    body: formData,
  });

  return readJsonOrThrow<UploadResumeResponse>(response);
}
