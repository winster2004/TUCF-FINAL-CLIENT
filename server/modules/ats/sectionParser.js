import { SECTION_ALIASES } from './constants.js';
import { countWords, normalizeText, toLines } from './textUtils.js';

function buildHeadingLookup() {
  const lookup = new Map();
  for (const [section, aliases] of Object.entries(SECTION_ALIASES)) {
    for (const alias of aliases) {
      lookup.set(normalizeText(alias), section);
    }
  }

  return lookup;
}

const HEADING_LOOKUP = buildHeadingLookup();

/** Determines whether a resume line behaves like a section heading. */
function detectHeading(line) {
  const normalized = normalizeText(line.replace(/[:\-]+$/, ''));
  return HEADING_LOOKUP.get(normalized) || null;
}

/** Parses resume text into consistent logical sections. */
export function parseResumeSections(resumeText) {
  const lines = toLines(resumeText);
  const sections = {
    summary: [],
    skills: [],
    experience: [],
    education: [],
    projects: [],
    certifications: [],
    other: [],
  };

  let currentSection = 'summary';

  for (const line of lines) {
    const heading = detectHeading(line);
    if (heading) {
      currentSection = heading;
      continue;
    }

    sections[currentSection].push(line);
  }

  return Object.fromEntries(
    Object.entries(sections).map(([key, value]) => [
      key,
      {
        text: value.join('\n').trim(),
        lines: value,
        wordCount: countWords(value.join(' ')),
      },
    ]),
  );
}

