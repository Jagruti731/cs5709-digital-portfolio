/**
 * @file Loads the JSON content files from public/data (CR-12).
 *
 * This is the only module that knows where content lives. Pages never call
 * fetch() themselves; they ask the Redux content slice, which calls
 * `loadContent()` once per file and caches the result.
 *
 * Every file is checked against a small shape rule before it reaches a page,
 * so a typo in a JSON file shows a clear error message instead of a blank
 * page or a crash deep inside a component.
 */
import { dataPath } from '../lib/assets';
import type { ContentMap, ContentName } from '../types/content';

/** Thrown when a file is missing, is not valid JSON, or has the wrong shape. */
export class ContentError extends Error {
  constructor(
    readonly file: ContentName,
    message: string,
  ) {
    super(`${file}.json: ${message}`);
    this.name = 'ContentError';
  }
}

type Check = (value: unknown) => string | null;

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);

/** Passes when `value` is an array whose items all have the given string fields. */
const arrayOf =
  (...fields: string[]): Check =>
  (value) => {
    if (!Array.isArray(value)) return 'expected a list';
    const bad = value.findIndex((item) => !isObject(item) || fields.some((f) => typeof item[f] !== 'string'));
    return bad === -1 ? null : `item ${bad} needs the text fields ${fields.join(', ')}`;
  };

/** Passes when `value` is an object and each listed key passes its own check. */
const objectWith =
  (shape: Record<string, Check>): Check =>
  (value) => {
    if (!isObject(value)) return 'expected an object';
    for (const [key, check] of Object.entries(shape)) {
      const problem = check(value[key]);
      if (problem) return `${key}: ${problem}`;
    }
    return null;
  };

const text: Check = (v) => (typeof v === 'string' && v.length > 0 ? null : 'expected text');
const list: Check = (v) => (Array.isArray(v) ? null : 'expected a list');

/** One shape rule per content file. Exported so the unit tests can run them against the real files. */
export const contentRules: Record<ContentName, Check> = {
  profile: objectWith({ name: text, intro: text, facts: arrayOf('label', 'value'), story: list, roles: arrayOf('title', 'text') }),
  projects: objectWith({
    caseStudies: arrayOf('id', 'title', 'summary', 'image'),
    otherProjects: arrayOf('title', 'text'),
    skillGroups: arrayOf('title'),
  }),
  blog: arrayOf('id', 'title', 'date'),
  career: objectWith({ experience: arrayOf('when', 'title', 'text') }),
  education: objectWith({ education: arrayOf('when', 'title', 'text'), certifications: arrayOf('title', 'text') }),
  gallery: objectWith({ filters: arrayOf('value', 'label'), pictures: arrayOf('file', 'category', 'title', 'caption') }),
  videos: arrayOf('id', 'title', 'description', 'duration'),
  changelog: arrayOf('id', 'change', 'type', 'commit'),
  requirements: objectWith({
    personas: arrayOf('id', 'name', 'role', 'goal', 'scenario'),
    stories: arrayOf('id', 'persona', 'story'),
    features: arrayOf('id', 'name', 'group'),
  }),
  codeindex: objectWith({ commit: text, files: arrayOf('path', 'summary', 'url') }),
};

/** Checks already-parsed data. Returns it typed, or throws a ContentError. */
export function validateContent<K extends ContentName>(name: K, data: unknown): ContentMap[K] {
  const problem = contentRules[name](data);
  if (problem) throw new ContentError(name, problem);
  return data as ContentMap[K];
}

/**
 * Fetches and checks one content file.
 * @param name file name in public/data without ".json"
 * @param fetcher injectable for tests; defaults to the browser's fetch
 */
export async function loadContent<K extends ContentName>(name: K, fetcher: typeof fetch = fetch): Promise<ContentMap[K]> {
  let response: Response;
  try {
    response = await fetcher(dataPath(name));
  } catch {
    throw new ContentError(name, 'the network request failed');
  }
  if (!response.ok) throw new ContentError(name, `the server returned ${response.status}`);
  let data: unknown;
  try {
    data = await response.json();
  } catch {
    throw new ContentError(name, 'the file is not valid JSON');
  }
  return validateContent(name, data);
}
