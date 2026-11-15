/**
 * @file Typed contracts for the JSON content files in public/data (CR-12).
 *
 * Phase 1 kept content in TypeScript modules, so every text change meant a
 * code change and a rebuild. Phase 2 moves the content into JSON files that
 * are fetched at run time; these interfaces are the single description of
 * their shape, and services/contentApi.ts checks each file against them.
 */

/** Loading state of anything fetched: a content file, GitHub data, the quality report. */
export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

/** A label and a short value, e.g. "Now: MSc student, UL". */
export interface Fact {
  label: string;
  value: string;
}

/** The most common content block: a heading and one paragraph. */
export interface TitledText {
  title: string;
  text: string;
}

/** One entry on a vertical timeline (career, education). */
export interface TimelineItem {
  when: string;
  title: string;
  text: string;
  badge?: string;
}

/** profile.json: who I am. Used by Home, About and Messages. */
export interface Profile {
  name: string;
  initials: string;
  linkedin: string;
  linkedinLabel: string;
  intro: string;
  facts: Fact[];
  numbers: { value: string; label: string }[];
  story: string[];
  quickFacts: [string, string][];
  /** profile.jpg in public/images (my LinkedIn photo, CR-34). */
  photo?: string;
  /** "How I work" on About: engineering, leadership and presales, AI adoption (CR-34). */
  tracks: { title: string; items: string[] }[];
  /** Awards and recognition, shown on About. */
  extras: { code: string; title: string; text: string }[];
}

/** One project in depth on the Professional Knowledge page. */
export interface CaseStudy {
  id: string;
  title: string;
  kind: string;
  meta: string;
  summary: string;
  problem: string;
  did: string[];
  tools: string[];
  /** My part in the project, e.g. "Team lead for a team of 15" (CR-34). */
  role?: string;
  /** Results I can state; only numbers I was given, never estimates (CR-34). */
  impact?: string[];
}

/** projects.json */
export interface ProjectsData {
  caseStudies: CaseStudy[];
}

/** One blog article. `date` is an ISO date (yyyy-mm-dd). */
export interface Article {
  id: string;
  title: string;
  date: string;
  tags: string[];
  body: string[];
}

/** career.json */
export interface CareerData {
  experience: TimelineItem[];
}

/** education.json */
export interface EducationData {
  education: TimelineItem[];
  certifications: TitledText[];
}

export type PictureCategory = 'talks' | 'places' | 'work' | 'life';

/** One picture in the gallery; `file` is a name inside public/images. */
export interface Picture {
  file: string;
  category: PictureCategory;
  title: string;
  caption: string;
}

/** gallery.json */
export interface GalleryData {
  filters: { value: 'all' | PictureCategory; label: string }[];
  pictures: Picture[];
}

/** One local video; `id` names both public/videos/<id>.mp4 and its .jpg poster. */
export interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
}

export type ChangeType = 'corrective' | 'adaptive' | 'perfective' | 'preventive';

/** One change request in the change log (CR-01 ... CR-nn). */
export interface Change {
  id: string;
  change: string;
  type: ChangeType;
  closes: string;
  commit: string;
  phase: 1 | 2;
}

/** A persona from requirements discovery (Cooper, 2004). */
export interface Persona {
  id: string;
  name: string;
  role: string;
  goal: string;
  frustration: string;
  scenario: string;
}

/** A user story traced to a persona and to the features that satisfy it. */
export interface UserStory {
  id: string;
  persona: string;
  story: string;
  features: string[];
}

/** A feature with the phase it belongs to (3 = future work after Phase 2) and its status. */
export interface Feature {
  id: string;
  name: string;
  group: string;
  phase: 1 | 2 | 3;
  status: 'done' | 'partial' | 'planned';
}

/** requirements.json: personas, scenarios, user stories and the traced feature list. */
export interface RequirementsData {
  personas: Persona[];
  stories: UserStory[];
  features: Feature[];
}

/** One source file in codeindex.json, built by tools/build-code-index.mjs (CR-21). */
export interface CodeFile {
  path: string;
  summary: string;
  doc: string;
  exports: string[];
  comments: string;
  lines: number;
  url: string;
}

/** codeindex.json: the source code, indexed for concept location. Generated, not hand-written. */
export interface CodeIndex {
  generatedAt: string;
  commit: string;
  files: CodeFile[];
}

/** One step of a system run: icon, title, note and, optionally, who does it ("agent" or "human"). */
export type ShowcaseStep = [icon: string, title: string, note: string, actor?: 'agent' | 'human'];

/** One system shown as a live run on Home (CR-43). Text in *stars* is highlighted. */
export interface ShowcaseSystem {
  id: string;
  name: string;
  kind: string;
  headline: string;
  tools: string[];
  steps: ShowcaseStep[];
  log: string[];
}

/** One "ready for agentic work" pillar on Home. */
export interface ShowcasePillar {
  label: string;
  title: string;
  points: string[];
  proof: string;
  icon: 'doc' | 'pair' | 'shield';
}

/** How well I know a technology: shipped in production, used on real work, or learning now. */
export type StackLevel = 'core' | 'grow' | 'learn';

/** Content of the Home page (CR-43): hero, skills, numbers, pillars, systems, tech stack and career path. */
export interface Showcase {
  hero: { greetings: string[]; lines: string[]; lead: string; fields: [label: string, value: string, confidence: string][] };
  skills: string[];
  numbers: { value: number; prefix?: string; suffix?: string; label: string }[];
  pillars: ShowcasePillar[];
  systems: ShowcaseSystem[];
  stack: {
    trends: { id: string; label: string; evidence: string }[];
    layers: { name: string; note: string; items: [name: string, level: StackLevel, trends: string[]][] }[];
    levels: { id: StackLevel; name: string; note: string }[];
  };
  path: [title: string, note: string][];
}

/** Every content file, by name. The key is the file name without ".json". */
export interface ContentMap {
  profile: Profile;
  projects: ProjectsData;
  blog: Article[];
  career: CareerData;
  education: EducationData;
  gallery: GalleryData;
  videos: Video[];
  changelog: Change[];
  requirements: RequirementsData;
  codeindex: CodeIndex;
  showcase: Showcase;
}

export type ContentName = keyof ContentMap;
