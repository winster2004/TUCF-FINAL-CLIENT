const CONTROL_CHAR_START = 0x00;
const CONTROL_CHAR_END = 0x1f;

function isControlChar(char: string) {
  const code = char.charCodeAt(0);
  return code >= CONTROL_CHAR_START && code <= CONTROL_CHAR_END;
}

function escapeControlChar(char: string) {
  if (char === '\n') return '\\n';
  if (char === '\r') return '\\r';
  if (char === '\t') return '\\t';
  return `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`;
}

function stripCodeFences(raw: string) {
  return raw
    .trim()
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
}

function escapeControlCharsInsideStrings(raw: string) {
  let output = '';
  let inString = false;
  let escaped = false;

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i];

    if (escaped) {
      output += char;
      escaped = false;
      continue;
    }

    if (char === '\\') {
      output += char;
      if (inString) {
        escaped = true;
      }
      continue;
    }

    if (char === '"') {
      inString = !inString;
      output += char;
      continue;
    }

    if (inString && isControlChar(char)) {
      output += escapeControlChar(char);
      continue;
    }

    output += char;
  }

  return output;
}

function extractFirstJsonBlock(raw: string) {
  const objectStart = raw.indexOf('{');
  const arrayStart = raw.indexOf('[');
  const startIndex =
    objectStart === -1
      ? arrayStart
      : arrayStart === -1
        ? objectStart
        : Math.min(objectStart, arrayStart);

  if (startIndex === -1) {
    return null;
  }

  const opening = raw[startIndex];
  const closing = opening === '{' ? '}' : ']';

  let depth = 0;
  let inString = false;
  let escaped = false;

  for (let i = startIndex; i < raw.length; i += 1) {
    const char = raw[i];

    if (escaped) {
      escaped = false;
      continue;
    }

    if (char === '\\' && inString) {
      escaped = true;
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
      continue;
    }

    if (char === closing) {
      depth -= 1;
      if (depth === 0) {
        return raw.slice(startIndex, i + 1);
      }
    }
  }

  return null;
}

export function sanitizeJSON(raw: string) {
  const withoutBom = raw.replace(/^\uFEFF/, '');
  const withoutFences = stripCodeFences(withoutBom);
  return escapeControlCharsInsideStrings(withoutFences);
}

export function safeParseJSON<T>(raw: string, context = 'unknown'): T | null {
  if (!raw || raw.trim() === '') {
    return null;
  }

  const sanitized = sanitizeJSON(raw);

  try {
    return JSON.parse(sanitized) as T;
  } catch (firstError) {
    const recovered = extractFirstJsonBlock(sanitized);
    if (!recovered) {
      console.error(`[safeParseJSON:${context}] Invalid JSON response.`, firstError, sanitized.slice(0, 400));
      return null;
    }

    try {
      return JSON.parse(recovered) as T;
    } catch (secondError) {
      console.error(`[safeParseJSON:${context}] Invalid extracted JSON response.`, secondError, recovered.slice(0, 400));
      return null;
    }
  }
}

export function ensureParsedObject(value: unknown) {
  return Boolean(value) && typeof value === 'object';
}
