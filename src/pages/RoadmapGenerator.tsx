import React, { useEffect, useMemo, useState } from 'react';
import { Milestone } from 'lucide-react';
import { getGroqApiKey } from '../lib/groq';
import { safeParseJSON as parseSafeJSON } from '../lib/safeJson';

type RoadmapLevel = 'Beginner' | 'Intermediate' | 'Advanced';

interface RoadmapResource {
  label: string;
  url: string;
}

interface RoadmapTopic {
  name: string;
  description: string;
  resources: RoadmapResource[];
}

interface RoadmapPhase {
  phase: string;
  weeks: string;
  color: string;
  topics: RoadmapTopic[];
}

interface RoadmapResponse {
  title: string;
  totalWeeks: number;
  phases: RoadmapPhase[];
}

const ROADMAP_PROGRESS_STORAGE_KEY = 'roadmap_generator_progress';
const ROADMAP_MODEL = 'llama-3.3-70b-versatile';

function parseRoadmapResponse<T>(raw: string): T | null {
  if (!raw || raw.trim() === '') return null;

  let cleaned = raw.trim();
  cleaned = cleaned.replace(/^```json\s*/i, '');
  cleaned = cleaned.replace(/^```\s*/i, '');
  cleaned = cleaned.replace(/```\s*$/i, '');
  cleaned = cleaned.trim();
  cleaned = cleaned.replace(/,\s*([}\]])/g, '$1');

  const direct = parseSafeJSON<T>(cleaned, 'roadmap.direct');
  if (direct) {
    return direct;
  }

  console.warn('Direct parse failed, trying recovery...');

  if (cleaned.trimStart().startsWith('[')) {
    const lastComplete = cleaned.lastIndexOf('},');
    const lastSingle = cleaned.lastIndexOf('}');
    const cutPoint = Math.max(lastComplete, lastSingle);
    if (cutPoint > 0) {
      let recovered = cleaned.substring(0, cutPoint + 1);
      recovered = recovered.replace(/,\s*$/, '');
      recovered += ']';
      recovered = recovered.replace(/,\s*([}\]])/g, '$1');
      return parseSafeJSON<T>(recovered, 'roadmap.recover-array');
    }
  }

  if (cleaned.trimStart().startsWith('{')) {
    let braces = 0;
    let lastSafePos = 0;
    let inString = false;
    let escape = false;

    for (let i = 0; i < cleaned.length; i += 1) {
      const c = cleaned[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (c === '\\' && inString) {
        escape = true;
        continue;
      }
      if (c === '"') {
        inString = !inString;
        continue;
      }
      if (inString) {
        continue;
      }
      if (c === '{') braces += 1;
      if (c === '}') {
        braces -= 1;
        if (braces === 0) lastSafePos = i;
      }
    }

    if (lastSafePos > 0) {
      let recovered = cleaned.substring(0, lastSafePos + 1);
      recovered = recovered.replace(/,\s*([}\]])/g, '$1');
      return parseSafeJSON<T>(recovered, 'roadmap.recover-object');
    }
  }

  console.error('Recovery also failed. Raw response length:', raw.length);
  return null;
}

async function callGroqAPI(prompt: string, maxTokens: number) {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('Add Groq API key in Settings');
  }

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: ROADMAP_MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'user', content: prompt }],
    }),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Groq API error ${response.status}`);
  }

  return payload?.choices?.[0]?.message?.content || '';
}

async function generateWithRetry(prompt: string, maxRetries = 1) {
  let nextPrompt = prompt;

  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      const response = await callGroqAPI(nextPrompt, 4096);
      const parsed = parseRoadmapResponse<RoadmapResponse>(response);
      if (parsed) {
        return parsed;
      }
      if (attempt < maxRetries) {
        console.log('Retrying with shorter prompt...');
        nextPrompt = nextPrompt
          .replace('Maximum 3 phases', 'Maximum 2 phases')
          .replace('Maximum 4 topics per phase', 'Maximum 3 topics per phase')
          .replace('Maximum 2 resources per topic', 'Maximum 2 resources per topic')
          .replace('"totalWeeks": 12,', '"totalWeeks": 8,');
      }
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }

  return null;
}

function renderParagraphs(text: string) {
  return text
    .split(/\n\s*\n|(?<=[.!?])\s+(?=[A-Z])/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => (
      <p key={`${paragraph.slice(0, 20)}-${index}`} className="leading-7">
        {paragraph}
      </p>
    ));
}

const RoadmapGenerator: React.FC = () => {
  const [role, setRole] = useState('');
  const [level, setLevel] = useState<RoadmapLevel>('Beginner');
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [progress, setProgress] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const hasApiKey = useMemo(() => Boolean(getGroqApiKey()), []);

  useEffect(() => {
    const stored = localStorage.getItem(ROADMAP_PROGRESS_STORAGE_KEY);
    if (stored) {
      const parsed = parseSafeJSON<Record<string, boolean>>(stored, 'roadmap.progress');
      if (parsed && typeof parsed === 'object') {
        setProgress(parsed);
      } else {
        setProgress({});
      }
    }
  }, []);

  const persistProgress = (nextValue: Record<string, boolean>) => {
    setProgress(nextValue);
    localStorage.setItem(ROADMAP_PROGRESS_STORAGE_KEY, JSON.stringify(nextValue));
  };

  const totalTopics = roadmap?.phases.reduce((count, phase) => count + phase.topics.length, 0) || 0;
  const completedTopics = roadmap
    ? roadmap.phases.reduce(
        (count, phase) =>
          count + phase.topics.filter((topic) => progress[`${roadmap.title}:${phase.phase}:${topic.name}`]).length,
        0,
      )
    : 0;
  const progressPercent = totalTopics > 0 ? Math.round((completedTopics / totalTopics) * 100) : 0;

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMessage('');

    try {
      const prompt = [
        'IMPORTANT: Return ONLY a raw valid JSON object. No markdown. No backticks.',
        'No explanation. No trailing commas. Strictly valid JSON only.',
        'Escape all newlines and control characters properly inside JSON string values.',
        'Response MUST be complete - do not cut off.',
        '',
        `Create a concise learning roadmap for a ${level} wanting to become a ${role}.`,
        '',
        'STRICT LIMITS to prevent response cutoff:',
        '- Maximum 3 phases',
        '- Maximum 4 topics per phase',
        '- Maximum 2 resources per topic',
        '- Description: max 1 sentence per topic',
        '- Keep ALL string values under 150 characters',
        '',
        'Return this exact structure:',
        '{',
        '  "title": "Role Roadmap",',
        '  "totalWeeks": 12,',
        '  "phases": [',
        '    {',
        '      "phase": "Phase 1: Name",',
        '      "weeks": "Weeks 1-4",',
        '      "color": "#f97316",',
        '      "topics": [',
        '        {',
        '          "name": "Topic Name",',
        '          "description": "One sentence description only.",',
        '          "resources": [',
        '            {"label": "Resource Name", "url": "https://actual-url.com/page"},',
        '            {"label": "Resource Name", "url": "https://actual-url.com/page"}',
        '          ]',
        '        }',
      '      ]',
        '    }',
        '  ]',
        '}',
        '',
        'Use ONLY these trusted URLs (real working pages):',
        '- https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide',
        '- https://www.freecodecamp.org/learn',
        '- https://www.w3schools.com/js/default.asp',
        '- https://docs.python.org/3/tutorial/index.html',
        '- https://react.dev/learn',
        '- https://nodejs.org/en/docs/guides',
        '- https://docs.mongodb.com/manual/introduction',
        '- https://www.postgresql.org/docs/current/tutorial.html',
        '- https://git-scm.com/docs/gittutorial',
        '- https://javascript.info/first-steps',
        '- https://leetcode.com/explore/learn',
        '- https://www.geeksforgeeks.org/data-structures',
        '- https://docs.docker.com/get-started',
        '- https://kubernetes.io/docs/tutorials/kubernetes-basics',
        '- https://www.kaggle.com/learn/overview',
        '- https://scikit-learn.org/stable/getting_started.html',
        '- https://cs50.harvard.edu/x/2024',
        '',
        'Never invent URLs. Only use exact URLs from this list.',
      ].join('\n');

      let parsed = await generateWithRetry(prompt);

      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.phases)) {
        setErrorMessage('AI response was cut off. Retrying with shorter roadmap...');
        const retryPrompt = prompt
          .replace('Maximum 3 phases', 'Maximum 2 phases')
          .replace('Maximum 4 topics per phase', 'Maximum 3 topics per phase')
          .replace('"totalWeeks": 12,', '"totalWeeks": 8,');
        parsed = await generateWithRetry(retryPrompt, 0);
      }

      if (!parsed || typeof parsed !== 'object' || !Array.isArray(parsed.phases)) {
        throw new Error('AI response was cut off. Retrying with shorter roadmap...');
      }

      setRoadmap(parsed);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'API call failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Roadmap Generator</h1>
        <p className="mt-1">Build a role-specific learning roadmap and track completion across phases.</p>
      </div>

      {!hasApiKey && (
        <div
          className="rounded-xl border px-4 py-3"
          style={{ background: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.3)', color: 'var(--accent)' }}
        >
          Add Groq API key in Settings
        </div>
      )}

      <div className="tucf-card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px] gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Target Role</label>
            <input
              value={role}
              onChange={(event) => setRole(event.target.value)}
              placeholder="e.g. Backend Developer"
              className="px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Level</label>
            <select value={level} onChange={(event) => setLevel(event.target.value as RoadmapLevel)} className="px-4 py-3">
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void handleGenerate()}
          disabled={loading || !role.trim()}
          className="rounded-xl px-4 py-3 text-white font-medium disabled:opacity-50 tucf-btn-primary"
        >
          Generate Roadmap
        </button>

        {errorMessage && <p style={{ color: 'var(--accent)' }}>{errorMessage}</p>}
      </div>

      {loading ? (
        <div className="tucf-card flex items-center gap-4">
          <div className="loading-spinner" />
          <p>Generating roadmap...</p>
        </div>
      ) : roadmap ? (
        <div className="space-y-5">
          <div className="tucf-card">
            <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
              <div>
                <h2 className="text-2xl font-bold">{roadmap.title}</h2>
                <p className="mt-1">{roadmap.totalWeeks} weeks planned</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>
                  {progressPercent}%
                </p>
                <p>{completedTopics} / {totalTopics} topics complete</p>
              </div>
            </div>

            <div className="tucf-progress-track">
              <div className="tucf-progress-fill" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>

          <div className="space-y-4">
            {roadmap.phases.map((phase) => (
              <div
                key={phase.phase}
                className="tucf-card"
                style={{ borderLeft: `4px solid ${phase.color || '#f97316'}` }}
              >
                <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ background: 'rgba(249,115,22,0.12)', color: phase.color || 'var(--accent)' }}
                    >
                      <Milestone className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold">{phase.phase}</h3>
                      <p>{phase.weeks}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {phase.topics.map((topic) => {
                    const topicKey = `${roadmap.title}:${phase.phase}:${topic.name}`;
                    return (
                      <label
                        key={topicKey}
                        className="rounded-xl border p-4 flex items-start gap-3 cursor-pointer"
                        style={{ background: '#1a1a1a', borderColor: '#2a2a2a' }}
                      >
                        <input
                          type="checkbox"
                          checked={Boolean(progress[topicKey])}
                          onChange={(event) => persistProgress({ ...progress, [topicKey]: event.target.checked })}
                          className="mt-1 h-4 w-4"
                        />
                        <div className="space-y-3 min-w-0">
                          <p style={{ color: 'var(--text-primary)' }}>{topic.name}</p>
                          <div className="space-y-2 text-sm">{renderParagraphs(topic.description)}</div>
                          <div className="space-y-2">
                            {Array.isArray(topic.resources) && topic.resources.map((resource) => (
                              <a
                                key={`${topicKey}:${resource.url}`}
                                href={resource.url}
                                target="_blank"
                                rel="noopener"
                                className="block text-sm transition-colors"
                                style={{ color: 'var(--accent)' }}
                                onMouseEnter={(event) => {
                                  event.currentTarget.style.textDecoration = 'underline';
                                }}
                                onMouseLeave={(event) => {
                                  event.currentTarget.style.textDecoration = 'none';
                                }}
                              >
                                {resource.label}
                              </a>
                            ))}
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="tucf-card text-center">
          <Milestone className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--accent)' }} />
          <p>Generated roadmap will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default RoadmapGenerator;
