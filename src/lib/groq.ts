import { ensureParsedObject, safeParseJSON } from './safeJson';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_STORAGE_KEY = 'groq_api_key';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export function getGroqApiKey() {
  return localStorage.getItem(GROQ_STORAGE_KEY)?.trim() || '';
}

export function saveGroqApiKey(value: string) {
  localStorage.setItem(GROQ_STORAGE_KEY, value.trim());
}

function extractReplyContent(payload: unknown) {
  if (
    payload &&
    typeof payload === 'object' &&
    'choices' in payload &&
    Array.isArray((payload as { choices?: unknown[] }).choices) &&
    (payload as { choices: Array<{ message?: { content?: string } }> }).choices[0]?.message?.content
  ) {
    return (payload as { choices: Array<{ message: { content: string } }> }).choices[0].message.content;
  }

  throw new Error('Groq response did not include a message.');
}

interface GroqMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqRequestOptions {
  messages: GroqMessage[];
  maxTokens?: number;
  temperature?: number;
  model?: string;
}

export async function requestGroqChat({
  messages,
  maxTokens = 2048,
  temperature = 0.7,
  model = GROQ_MODEL,
}: GroqRequestOptions) {
  const apiKey = getGroqApiKey();
  if (!apiKey) {
    throw new Error('Add Groq API key in Settings');
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model,
      max_tokens: maxTokens,
      temperature,
      messages,
    }),
  });

  const rawPayload = await response.text();
  const payload = safeParseJSON<Record<string, unknown>>(rawPayload, 'groq.chat');

  if (!response.ok) {
    const message =
      payload && typeof (payload as { error?: { message?: unknown } }).error?.message === 'string'
        ? ((payload as { error?: { message?: string } }).error?.message ?? 'API call failed.')
        : 'API call failed.';
    throw new Error(message);
  }

  if (!ensureParsedObject(payload)) {
    throw new Error('Invalid API response format');
  }

  return extractReplyContent(payload).trim();
}

export async function requestGroqContent(prompt: string) {
  return requestGroqChat({
    messages: [{ role: 'user', content: prompt }],
  });
}

function extractFirstJsonBlock(content: string) {
  const trimmed = content
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();

  const objectStart = trimmed.indexOf('{');
  const arrayStart = trimmed.indexOf('[');
  const startIndex =
    objectStart === -1
      ? arrayStart
      : arrayStart === -1
        ? objectStart
        : Math.min(objectStart, arrayStart);

  if (startIndex === -1) {
    throw new Error('Model did not return JSON.');
  }

  const opening = trimmed[startIndex];
  const closing = opening === '{' ? '}' : ']';
  let depth = 0;
  let inString = false;
  let escapeNext = false;

  for (let index = startIndex; index < trimmed.length; index += 1) {
    const char = trimmed[index];

    if (escapeNext) {
      escapeNext = false;
      continue;
    }

    if (char === '\\' && inString) {
      escapeNext = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (char === opening) {
      depth += 1;
    } else if (char === closing) {
      depth -= 1;

      if (depth === 0) {
        return trimmed.slice(startIndex, index + 1);
      }
    }
  }

  throw new Error('Model returned incomplete JSON.');
}

export function parseGroqJson<T>(content: string): T {
  const jsonText = extractFirstJsonBlock(content);
  const parsed = safeParseJSON<T>(jsonText, 'groq.parseGroqJson');
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid API response format');
  }
  return parsed;
}
