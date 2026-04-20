import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, MessageSquareText, Target } from 'lucide-react';
import { getGroqApiKey, parseGroqJson, requestGroqChat } from '../lib/groq';
import { safeParseJSON } from '../lib/safeJson';

type InterviewDifficulty = 'Beginner' | 'Intermediate' | 'Advanced' | 'Startup Interview Mode';
type InterviewTechnology =
  | 'Full Stack'
  | 'Backend'
  | 'Frontend'
  | 'Data Structures'
  | 'System Design'
  | 'DevOps'
  | 'Java'
  | 'Python'
  | 'React'
  | 'Node.js';

type InterviewQuestionType =
  | 'conceptual'
  | 'coding'
  | 'system_design'
  | 'debugging'
  | 'behavioral';

interface InterviewQuestion {
  type: InterviewQuestionType;
  question: string;
  hint?: string;
}

interface InterviewAnswerGuide {
  title: string;
  detailedExplanation: string;
  stepByStep: string[];
  asciiDiagram: string;
  codeImplementation: {
    language: string;
    code: string;
  };
  edgeCases: string[];
  bestPractices: string[];
  finalSummary: string[];
}

interface MockFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
  followUp: string;
}

const PRACTICED_STORAGE_KEY = 'interview_prep_practiced';
const INTERVIEW_MODEL = 'llama-3.3-70b-versatile';
const difficulties: InterviewDifficulty[] = [
  'Beginner',
  'Intermediate',
  'Advanced',
  'Startup Interview Mode',
];
const technologies: InterviewTechnology[] = [
  'Full Stack',
  'Backend',
  'Frontend',
  'Data Structures',
  'System Design',
  'DevOps',
  'Java',
  'Python',
  'React',
  'Node.js',
];

function getTechnologyGuidance(technology: InterviewTechnology) {
  const guidance: Record<InterviewTechnology, string> = {
    'Full Stack':
      'Focus on frontend/backend integration, API contracts, authentication, database flow, caching, performance, deployment, and architecture tradeoffs.',
    Backend:
      'Focus on APIs, databases, transactions, scalability, queues, caching, observability, reliability, and debugging production issues.',
    Frontend:
      'Focus on rendering behavior, state management, accessibility, browser behavior, performance, architecture, and debugging UI issues.',
    'Data Structures':
      'Focus on complexity, tradeoffs, implementation details, edge cases, and explaining solutions clearly.',
    'System Design':
      'Focus on scalable architecture, reliability, data modeling, traffic handling, queues, storage, caching, and tradeoffs.',
    DevOps:
      'Focus on CI/CD, containers, orchestration, monitoring, deployment strategy, incident handling, infrastructure, and debugging.',
    Java:
      'Focus on JVM internals, collections, concurrency, Spring, memory model, performance tuning, APIs, and backend architecture.',
    Python:
      'Focus on Python internals, async behavior, packaging, backend use, data handling, performance, testing, and debugging.',
    React:
      'Focus on reconciliation, rendering, state flow, hooks, performance, architecture, accessibility, and frontend debugging.',
    'Node.js':
      'Focus on event loop, async behavior, streams, APIs, performance, observability, scaling, and backend debugging.',
  };

  return guidance[technology];
}

function getDifficultyGuidance(difficulty: InterviewDifficulty) {
  if (difficulty === 'Beginner') {
    return 'Ask approachable but real interview questions that still require explanation, examples, and reasoning. Avoid trivia.';
  }

  if (difficulty === 'Intermediate') {
    return 'Ask practical company-style questions that test problem solving, architecture understanding, debugging, and tradeoffs.';
  }

  if (difficulty === 'Advanced') {
    return 'Ask deep technical questions similar to senior engineer interviews, focusing on internals, scale, failure modes, design, and optimization.';
  }

  return 'Simulate a real startup interview. Ask high-signal, practical, product-minded questions with ambiguity, speed, ownership, debugging, and system tradeoffs.';
}

function getTypeLabel(type: InterviewQuestionType) {
  const labels: Record<InterviewQuestionType, string> = {
    conceptual: 'Conceptual',
    coding: 'Coding',
    system_design: 'System Design',
    debugging: 'Debugging',
    behavioral: 'Behavioral',
  };

  return labels[type];
}

function getTypeStyles(type: InterviewQuestionType) {
  const styles: Record<InterviewQuestionType, { background: string; color: string }> = {
    conceptual: { background: 'rgba(249,115,22,0.16)', color: 'var(--accent)' },
    coding: { background: 'rgba(59,130,246,0.16)', color: '#93c5fd' },
    system_design: { background: 'rgba(168,85,247,0.16)', color: '#d8b4fe' },
    debugging: { background: 'rgba(239,68,68,0.16)', color: '#fca5a5' },
    behavioral: { background: 'rgba(34,197,94,0.16)', color: '#86efac' },
  };

  return styles[type];
}

async function generateInterviewQuestions(
  role: string,
  technology: InterviewTechnology,
  difficulty: InterviewDifficulty,
): Promise<InterviewQuestion[]> {
  const content = await requestGroqChat({
    model: INTERVIEW_MODEL,
    temperature: 0.7,
    maxTokens: 1800,
    messages: [
      {
        role: 'system',
        content:
          'You are a senior technical interviewer. Generate realistic interview questions used by companies and startups. Avoid MCQs, trivia, one-word questions, and toy prompts. Return only valid JSON.',
      },
      {
        role: 'user',
        content: [
          `Generate 6 interview questions for a ${role || technology} candidate.`,
          `Technology/domain: ${technology}.`,
          `Difficulty: ${difficulty}.`,
          getTechnologyGuidance(technology),
          getDifficultyGuidance(difficulty),
          'Return strict JSON in this format:',
          '{ "questions": [ { "type": "conceptual|coding|system_design|debugging|behavioral", "question": "real interview question", "hint": "short actionable hint" } ] }',
          'Requirements:',
          '- Produce a balanced mix of conceptual, coding, system design, debugging, and behavioral questions when relevant.',
          '- Questions must require explanation, reasoning, architecture thinking, debugging ability, or design tradeoffs.',
          '- Each hint must be short and useful.',
          '- Return ONLY valid JSON. Do not include text outside JSON. Escape all newlines and control characters properly.',
          '- Do not include answers.',
        ].join('\n'),
      },
    ],
  });

  const parsed = parseGroqJson<{ questions: InterviewQuestion[] }>(content);
  if (!parsed?.questions || !Array.isArray(parsed.questions)) {
    throw new Error('Model did not return valid interview questions.');
  }

  return parsed.questions.slice(0, 8);
}

async function generateMockFeedback(
  technology: InterviewTechnology,
  difficulty: InterviewDifficulty,
  question: string,
  answer: string,
): Promise<MockFeedback> {
  const content = await requestGroqChat({
    model: INTERVIEW_MODEL,
    temperature: 0.4,
    maxTokens: 900,
    messages: [
      {
        role: 'system',
        content:
          'You are a senior interviewer giving direct, useful feedback on a candidate answer. Return only valid JSON.',
      },
      {
        role: 'user',
        content: [
          `Technology/domain: ${technology}`,
          `Difficulty: ${difficulty}`,
          `Interview question: ${question}`,
          `Candidate answer: ${answer}`,
          'Evaluate the answer realistically and return strict JSON:',
          '{ "score": 1-10, "strengths": ["..."], "improvements": ["..."], "followUp": "one strong follow-up question" }',
          'Return ONLY valid JSON. Do not include text outside JSON. Escape all newlines and control characters properly.',
          'Keep strengths and improvements concise.',
        ].join('\n'),
      },
    ],
  });

  return parseGroqJson<MockFeedback>(content);
}

async function generateDetailedInterviewAnswer(
  technology: InterviewTechnology,
  difficulty: InterviewDifficulty,
  question: string,
): Promise<InterviewAnswerGuide> {
  const content = await requestGroqChat({
    model: INTERVIEW_MODEL,
    temperature: 0.45,
    maxTokens: 2600,
    messages: [
      {
        role: 'system',
        content:
          'You are a senior software engineer, system designer, and interview mentor with over 10 years of experience in backend systems and distributed architecture. Teach deeply, not briefly. Return only valid JSON.',
      },
      {
        role: 'user',
        content: [
          `Question: ${question}`,
          `Technology/domain: ${technology}`,
          `Difficulty: ${difficulty}`,
          'Follow these rules strictly:',
          '- Never give short answers.',
          '- The detailedExplanation must be roughly 600 to 900 words.',
          '- Explain like in a real technical interview.',
          '- Include practical real-world insights.',
          '- Avoid generic wording.',
          'Return strict JSON with this exact structure:',
          '{',
          '  "title": "string",',
          '  "detailedExplanation": "string",',
          '  "stepByStep": ["step 1", "step 2"],',
          '  "asciiDiagram": "plain text diagram",',
          '  "codeImplementation": { "language": "nodejs|python|sql|javascript", "code": "code here" },',
          '  "edgeCases": ["item"],',
          '  "bestPractices": ["item"],',
          '  "finalSummary": ["item"]',
          '}',
          'Requirements:',
          '- Always include all sections.',
          '- Use ASCII only in the asciiDiagram.',
          '- Provide clean code with comments.',
          '- Return ONLY valid JSON. Do not include text outside JSON. Escape all newlines and control characters properly.',
          '- Prefer Node.js for backend/distributed topics, Python for algorithms/data work, SQL for query topics.',
        ].join('\n'),
      },
    ],
  });

  return parseGroqJson<InterviewAnswerGuide>(content);
}

const InterviewPrep: React.FC = () => {
  const [role, setRole] = useState('');
  const [technology, setTechnology] = useState<InterviewTechnology>('Backend');
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('Intermediate');
  const [questions, setQuestions] = useState<InterviewQuestion[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [answerGuides, setAnswerGuides] = useState<Record<string, InterviewAnswerGuide>>({});
  const [answerLoading, setAnswerLoading] = useState<Record<string, boolean>>({});
  const [practiced, setPracticed] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [mockInterviewMode, setMockInterviewMode] = useState(false);
  const [mockIndex, setMockIndex] = useState(0);
  const [mockAnswer, setMockAnswer] = useState('');
  const [mockFeedback, setMockFeedback] = useState<MockFeedback | null>(null);
  const [feedbackLoading, setFeedbackLoading] = useState(false);

  const hasApiKey = useMemo(() => Boolean(getGroqApiKey()), []);
  const activeMockQuestion = questions[mockIndex] || null;

  useEffect(() => {
    const stored = localStorage.getItem(PRACTICED_STORAGE_KEY);
    if (stored) {
      const parsed = safeParseJSON<Record<string, boolean>>(stored, 'interview.practiced');
      if (parsed && typeof parsed === 'object') {
        setPracticed(parsed);
      } else {
        setPracticed({});
      }
    }
  }, []);

  const persistPracticed = (nextValue: Record<string, boolean>) => {
    setPracticed(nextValue);
    localStorage.setItem(PRACTICED_STORAGE_KEY, JSON.stringify(nextValue));
  };

  const handleGenerate = async () => {
    setLoading(true);
    setErrorMessage('');
    setMockFeedback(null);
    setMockAnswer('');
    setMockIndex(0);

    try {
      const generated = await generateInterviewQuestions(role.trim(), technology, difficulty);
      setQuestions(generated);
      setExpanded({});
      setAnswerGuides({});
      setAnswerLoading({});
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not generate questions.');
    } finally {
      setLoading(false);
    }
  };

  const submitMockAnswer = async () => {
    if (!activeMockQuestion || !mockAnswer.trim()) {
      return;
    }

    setFeedbackLoading(true);
    setErrorMessage('');

    try {
      const feedback = await generateMockFeedback(
        technology,
        difficulty,
        activeMockQuestion.question,
        mockAnswer.trim(),
      );
      setMockFeedback(feedback);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not evaluate answer.');
    } finally {
      setFeedbackLoading(false);
    }
  };

  const goToNextMockQuestion = () => {
    setMockIndex((current) => Math.min(current + 1, Math.max(questions.length - 1, 0)));
    setMockAnswer('');
    setMockFeedback(null);
  };

  const handleToggleExpanded = async (questionKey: string, question: string) => {
    const willExpand = !expanded[questionKey];
    setExpanded((current) => ({ ...current, [questionKey]: willExpand }));

    if (!willExpand || answerGuides[questionKey] || answerLoading[questionKey]) {
      return;
    }

    setAnswerLoading((current) => ({ ...current, [questionKey]: true }));
    try {
      const guide = await generateDetailedInterviewAnswer(technology, difficulty, question);
      setAnswerGuides((current) => ({ ...current, [questionKey]: guide }));
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not generate detailed answer.');
    } finally {
      setAnswerLoading((current) => ({ ...current, [questionKey]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Interview Planner</h1>
        <p className="mt-1">
          Generate deep, realistic interview questions and simulate startup-style interviews.
        </p>
      </div>

      {!hasApiKey && (
        <div
          className="rounded-xl border px-4 py-3"
          style={{
            background: 'rgba(249,115,22,0.08)',
            borderColor: 'rgba(249,115,22,0.3)',
            color: 'var(--accent)',
          }}
        >
          Add Groq API key in Settings
        </div>
      )}

      <div className="tucf-card space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2">Target Role</label>
          <input
            value={role}
            onChange={(event) => setRole(event.target.value)}
            placeholder="e.g. Backend Developer"
            className="px-4 py-3"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Technology</label>
            <select
              value={technology}
              onChange={(event) => setTechnology(event.target.value as InterviewTechnology)}
              className="px-4 py-3"
            >
              {technologies.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Difficulty</label>
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value as InterviewDifficulty)}
              className="px-4 py-3"
            >
              {difficulties.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="inline-flex items-center gap-3 cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={mockInterviewMode}
              onChange={(event) => {
                setMockInterviewMode(event.target.checked);
                setMockIndex(0);
                setMockAnswer('');
                setMockFeedback(null);
              }}
              className="h-4 w-4"
            />
            <span>Mock Interview Mode</span>
          </label>

          <button
            type="button"
            onClick={() => void handleGenerate()}
            disabled={loading || (!role.trim() && !technology)}
            className="rounded-xl px-4 py-3 text-white font-medium disabled:opacity-50 tucf-btn-primary sm:self-auto self-start"
          >
            Generate Questions
          </button>
        </div>

        {errorMessage && <p style={{ color: 'var(--accent)' }}>{errorMessage}</p>}
      </div>

      {loading ? (
        <div className="tucf-card flex items-center gap-4">
          <div className="loading-spinner" />
          <p>Generating interview questions...</p>
        </div>
      ) : mockInterviewMode && activeMockQuestion ? (
        <div className="space-y-4">
          <div className="tucf-card space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <span
                className="px-3 py-1 rounded-full text-sm font-medium"
                style={getTypeStyles(activeMockQuestion.type)}
              >
                {getTypeLabel(activeMockQuestion.type)}
              </span>
              <span className="text-sm">
                Question {mockIndex + 1} of {questions.length}
              </span>
            </div>

            <h3 className="text-xl font-semibold leading-8" style={{ color: 'var(--text-primary)' }}>
              {activeMockQuestion.question}
            </h3>

            {activeMockQuestion.hint && (
              <div
                className="rounded-xl border px-4 py-4"
                style={{
                  background: 'rgba(245,158,11,0.08)',
                  borderColor: 'rgba(245,158,11,0.3)',
                }}
              >
                <p style={{ color: '#fcd34d', fontWeight: 600 }}>Hint</p>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                  {activeMockQuestion.hint}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium mb-2">Your Answer</label>
              <textarea
                value={mockAnswer}
                onChange={(event) => setMockAnswer(event.target.value)}
                rows={6}
                placeholder="Write your interview answer here..."
                className="w-full px-4 py-3 resize-none"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => void submitMockAnswer()}
                disabled={feedbackLoading || !mockAnswer.trim()}
                className="rounded-xl px-4 py-3 text-white font-medium disabled:opacity-50 tucf-btn-primary"
              >
                {feedbackLoading ? 'Evaluating...' : 'Get Feedback'}
              </button>

              {mockFeedback && mockIndex < questions.length - 1 && (
                <button type="button" onClick={goToNextMockQuestion} className="px-4 py-3 tucf-btn-ghost">
                  Next Question
                </button>
              )}
            </div>
          </div>

          {mockFeedback && (
            <div className="tucf-card space-y-4">
              <div className="flex items-center gap-3">
                <MessageSquareText className="h-5 w-5" style={{ color: 'var(--accent)' }} />
                <h3 className="text-xl font-semibold" style={{ color: 'var(--text-primary)' }}>
                  Interview Feedback
                </h3>
              </div>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                Score: <strong style={{ color: 'var(--accent)' }}>{mockFeedback.score}/10</strong>
              </p>

              <div
                className="rounded-xl border px-4 py-4 space-y-3"
                style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.28)' }}
              >
                <p style={{ color: '#86efac', fontWeight: 600 }}>Strengths</p>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                  {mockFeedback.strengths.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div
                className="rounded-xl border px-4 py-4 space-y-3"
                style={{ background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.28)' }}
              >
                <p style={{ color: '#fca5a5', fontWeight: 600 }}>Improvements</p>
                <ul className="space-y-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                  {mockFeedback.improvements.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>

              <div
                className="rounded-xl border px-4 py-4"
                style={{ background: 'rgba(249,115,22,0.08)', borderColor: 'rgba(249,115,22,0.3)' }}
              >
                <p style={{ color: 'var(--accent)', fontWeight: 600 }}>Follow-up Question</p>
                <p className="mt-2 text-sm" style={{ color: 'var(--text-primary)' }}>
                  {mockFeedback.followUp}
                </p>
              </div>
            </div>
          )}
        </div>
      ) : questions.length > 0 ? (
        <div className="space-y-4">
          {questions.map((item, index) => {
            const questionKey = `${technology}:${difficulty}:${role}:${item.question}`;
            const isExpanded = expanded[questionKey];
            const answerGuide = answerGuides[questionKey];
            const isAnswerLoading = answerLoading[questionKey];

            return (
              <div key={questionKey} className="tucf-card">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="space-y-4 flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={getTypeStyles(item.type)}
                      >
                        {getTypeLabel(item.type)}
                      </span>
                      <span className="text-sm">Question {index + 1}</span>
                    </div>

                    <h3 className="text-xl font-semibold leading-8" style={{ color: 'var(--text-primary)' }}>
                      {item.question}
                    </h3>

                    {isExpanded && (
                      <div className="space-y-4">
                        {item.hint && (
                          <div
                            className="rounded-xl border px-4 py-4 space-y-3"
                            style={{ background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.3)' }}
                          >
                            <p style={{ color: '#fcd34d', fontWeight: 600 }}>Hint</p>
                            <div className="space-y-3 text-sm" style={{ color: 'var(--text-primary)' }}>
                              <p className="leading-7">{item.hint}</p>
                            </div>
                          </div>
                        )}

                        {isAnswerLoading ? (
                          <div className="rounded-xl border px-4 py-4" style={{ borderColor: 'var(--border)' }}>
                            <p style={{ color: 'var(--text-secondary)' }}>Generating detailed mentor answer...</p>
                          </div>
                        ) : answerGuide ? (
                          <div className="space-y-4">
                            <div
                              className="rounded-xl border px-4 py-4 space-y-3"
                              style={{ background: 'rgba(34,197,94,0.08)', borderColor: 'rgba(34,197,94,0.28)' }}
                            >
                              <p style={{ color: '#86efac', fontWeight: 600 }}>1. TITLE</p>
                              <h4 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
                                {answerGuide.title}
                              </h4>
                            </div>

                            <div className="rounded-xl border px-4 py-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
                              <p style={{ color: 'var(--accent)', fontWeight: 600 }}>2. DETAILED EXPLANATION</p>
                              <p className="text-sm leading-7" style={{ color: 'var(--text-primary)' }}>
                                {answerGuide.detailedExplanation}
                              </p>
                            </div>

                            <div className="rounded-xl border px-4 py-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
                              <p style={{ color: 'var(--accent)', fontWeight: 600 }}>3. STEP-BY-STEP BREAKDOWN</p>
                              <ol className="space-y-2 text-sm leading-7 list-decimal pl-5" style={{ color: 'var(--text-primary)' }}>
                                {answerGuide.stepByStep.map((step) => (
                                  <li key={step}>{step}</li>
                                ))}
                              </ol>
                            </div>

                            <div className="rounded-xl border px-4 py-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
                              <p style={{ color: 'var(--accent)', fontWeight: 600 }}>4. ASCII DIAGRAM</p>
                              <pre
                                className="overflow-x-auto rounded-lg p-4 text-xs"
                                style={{ background: '#0f0f0f', color: 'var(--text-primary)' }}
                              >
                                {answerGuide.asciiDiagram}
                              </pre>
                            </div>

                            <div className="rounded-xl border px-4 py-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
                              <p style={{ color: 'var(--accent)', fontWeight: 600 }}>5. CODE IMPLEMENTATION</p>
                              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                                {answerGuide.codeImplementation.language}
                              </p>
                              <pre
                                className="overflow-x-auto rounded-lg p-4 text-xs"
                                style={{ background: '#0f0f0f', color: 'var(--text-primary)' }}
                              >
                                {answerGuide.codeImplementation.code}
                              </pre>
                            </div>

                            <div className="rounded-xl border px-4 py-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
                              <p style={{ color: 'var(--accent)', fontWeight: 600 }}>6. EDGE CASES / PITFALLS</p>
                              <ul className="space-y-2 text-sm leading-7 list-disc pl-5" style={{ color: 'var(--text-primary)' }}>
                                {answerGuide.edgeCases.map((itemValue) => (
                                  <li key={itemValue}>{itemValue}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="rounded-xl border px-4 py-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
                              <p style={{ color: 'var(--accent)', fontWeight: 600 }}>7. BEST PRACTICES (PRODUCTION LEVEL)</p>
                              <ul className="space-y-2 text-sm leading-7 list-disc pl-5" style={{ color: 'var(--text-primary)' }}>
                                {answerGuide.bestPractices.map((itemValue) => (
                                  <li key={itemValue}>{itemValue}</li>
                                ))}
                              </ul>
                            </div>

                            <div className="rounded-xl border px-4 py-4 space-y-3" style={{ borderColor: 'var(--border)' }}>
                              <p style={{ color: 'var(--accent)', fontWeight: 600 }}>8. FINAL SUMMARY</p>
                              <ul className="space-y-2 text-sm leading-7 list-disc pl-5" style={{ color: 'var(--text-primary)' }}>
                                {answerGuide.finalSummary.map((itemValue) => (
                                  <li key={itemValue}>{itemValue}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-3 sm:min-w-[130px]">
                    <button
                      type="button"
                      onClick={() => void handleToggleExpanded(questionKey, item.question)}
                      className="px-3 py-2 tucf-btn-ghost"
                    >
                      <span className="inline-flex items-center gap-2">
                        {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        {isExpanded ? 'Hide' : 'Expand'}
                      </span>
                    </button>

                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(practiced[questionKey])}
                        onChange={(event) =>
                          persistPracticed({ ...practiced, [questionKey]: event.target.checked })
                        }
                        className="h-4 w-4"
                      />
                      <span>Practiced</span>
                    </label>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="tucf-card text-center">
          <Target className="h-10 w-10 mx-auto mb-3" style={{ color: 'var(--accent)' }} />
          <p>Generated interview questions will appear here.</p>
        </div>
      )}
    </div>
  );
};

export default InterviewPrep;
