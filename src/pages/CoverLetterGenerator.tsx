import React, { useMemo, useState } from 'react';
import { Copy, FileText, Sparkles } from 'lucide-react';
import { getGroqApiKey, requestGroqContent } from '../lib/groq';

const CoverLetterGenerator: React.FC = () => {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeSkills, setResumeSkills] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [copied, setCopied] = useState(false);

  const hasApiKey = useMemo(() => Boolean(getGroqApiKey()), []);

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const prompt = [
        'You are an expert career coach. Write a professional cover letter under 350 words based on this job description and resume. Output only the letter, no extra text.',
        '',
        `Job Description:\n${jobDescription}`,
        '',
        `Personal Details & Contact Info:\n${resumeSkills}`,
      ].join('\n');

      const reply = await requestGroqContent(prompt);
      setGeneratedLetter(reply);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'API call failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!generatedLetter) {
      return;
    }

    await navigator.clipboard.writeText(generatedLetter);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold" style={{ color: 'var(--text-primary)' }}>
          Cover Letter Generator
        </h1>
        <p className="mt-1" style={{ color: 'var(--text-secondary)' }}>
          Generate a tailored cover letter from a job description and your resume details.
        </p>
      </div>

      {!hasApiKey && (
        <div
          className="rounded-xl border px-4 py-3"
          style={{ background: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.3)', color: 'var(--accent)' }}
        >
          Add Groq API key in Settings
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="tucf-card space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(event) => setJobDescription(event.target.value)}
              placeholder="Paste the job description here..."
              className="min-h-[220px] px-4 py-3 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Personal Details & Contact Info</label>
            <textarea
              value={resumeSkills}
              onChange={(event) => setResumeSkills(event.target.value)}
              placeholder="Paste resume highlights, skills, or achievements..."
              className="min-h-[220px] px-4 py-3 resize-none"
            />
          </div>

          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={loading || !jobDescription.trim() || !resumeSkills.trim()}
            className="w-full rounded-xl px-4 py-3 text-white font-medium disabled:opacity-50 tucf-btn-primary"
          >
            Generate
          </button>

          {errorMessage && <p style={{ color: 'var(--accent)' }}>{errorMessage}</p>}
        </div>

        <div className="tucf-card flex flex-col">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5" style={{ color: 'var(--accent)' }} />
              <h2 className="text-xl font-semibold">Generated Letter</h2>
            </div>

            <button type="button" onClick={() => void handleCopy()} className="px-3 py-2 tucf-btn-ghost">
              <span className="inline-flex items-center gap-2">
                <Copy className="h-4 w-4" />
                {copied ? 'Copied' : 'Copy'}
              </span>
            </button>
          </div>

          <div
            className="flex-1 rounded-xl border p-4 whitespace-pre-wrap"
            style={{ background: '#1a1a1a', borderColor: '#2a2a2a', minHeight: '520px' }}
          >
            {loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-4">
                <div className="loading-spinner" />
                <p>Generating cover letter...</p>
              </div>
            ) : generatedLetter ? (
              generatedLetter
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3 text-center">
                <Sparkles className="h-8 w-8" style={{ color: 'var(--accent)' }} />
                <p>Generated cover letter will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterGenerator;
