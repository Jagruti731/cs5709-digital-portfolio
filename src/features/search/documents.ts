/**
 * @file Turns the site's content files and the code index into search documents (CR-21).
 * One function per source, so adding new content to search is one more function.
 */
import { pages } from '../../lib/navigation';
import type { Article, CareerData, CodeIndex, EducationData, GalleryData, ProjectsData, Video } from '../../types/content';
import type { SearchDoc } from './searchIndex';

export interface SiteContent {
  projects?: ProjectsData;
  blog?: Article[];
  education?: EducationData;
  career?: CareerData;
  gallery?: GalleryData;
  videos?: Video[];
}

/** Every page in the menu, with its keywords. */
export const pageDocs = (): SearchDoc[] =>
  pages
    .filter((p) => p.id !== 'search')
    .map((p) => ({ id: `page-${p.id}`, kind: 'Page', title: p.title, to: p.path, text: p.description, tags: p.keywords }));

const projectDocs = (p?: ProjectsData): SearchDoc[] =>
  p
    ? [
        ...p.caseStudies.map((s) => ({
          id: `case-${s.id}`,
          kind: 'Case study',
          title: s.title,
          to: `/knowledge?case=${s.id}`,
          text: s.summary,
          tags: s.tools,
          body: [s.kind, s.problem, ...s.did].join(' '),
        })),
        ...p.otherProjects.map((o) => ({ id: `project-${o.title}`, kind: 'Project', title: o.title, to: '/knowledge', text: o.text })),
        ...p.skillGroups.map((g) => ({
          id: `skills-${g.title}`,
          kind: 'Skills',
          title: `Skills: ${g.title}`,
          to: '/knowledge',
          text: g.items.join(', '),
          tags: g.items,
        })),
      ]
    : [];

const articleDocs = (blog: Article[] = []): SearchDoc[] =>
  blog.map((a) => ({
    id: `article-${a.id}`,
    kind: 'Article',
    title: a.title,
    to: `/blog?article=${a.id}`,
    text: a.body[0],
    tags: a.tags,
    body: a.body.join(' '),
  }));

const educationDocs = (e?: EducationData): SearchDoc[] =>
  e
    ? [
        ...e.education.map((x) => ({
          id: `edu-${x.title}`,
          kind: 'Education',
          title: x.title,
          to: '/education',
          text: x.text,
          tags: x.badge ? [x.badge] : [],
        })),
        ...e.certifications.map((x) => ({ id: `cert-${x.title}`, kind: 'Education', title: x.title, to: '/education', text: x.text })),
      ]
    : [];

const careerDocs = (c?: CareerData): SearchDoc[] =>
  (c?.experience ?? []).map((x) => ({
    id: `job-${x.title}`,
    kind: 'Experience',
    title: x.title,
    to: '/about',
    text: `${x.when}. ${x.text}`,
  }));

const mediaDocs = (gallery?: GalleryData, videos: Video[] = []): SearchDoc[] => [
  ...(gallery?.pictures ?? []).map((p) => ({
    id: `pic-${p.file}`,
    kind: 'Picture',
    title: p.title,
    to: '/gallery',
    text: p.caption,
    tags: [p.category],
  })),
  ...videos.map((v) => ({ id: `video-${v.id}`, kind: 'Video', title: v.title, to: '/videos', text: v.description })),
];

/** Everything a visitor can read on the site. */
export const siteDocs = (c: SiteContent): SearchDoc[] => [
  ...pageDocs(),
  ...projectDocs(c.projects),
  ...articleDocs(c.blog),
  ...educationDocs(c.education),
  ...careerDocs(c.career),
  ...mediaDocs(c.gallery, c.videos),
];

/** Every source file, for concept location in the code. Links open the file on GitHub. */
export const codeDocs = (index: CodeIndex | undefined): SearchDoc[] =>
  (index?.files ?? []).map((f) => ({
    id: `code-${f.path}`,
    kind: f.path.split('/').slice(0, -1).join('/') || 'root',
    title: f.path,
    to: f.url,
    text: f.summary,
    tags: [
      ...f.exports,
      f.path
        .split('/')
        .pop()!
        .replace(/\.\w+$/, ''),
    ],
    body: `${f.doc} ${f.comments}`,
  }));
