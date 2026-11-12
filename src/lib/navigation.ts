/**
 * @file Page list: one entry per page with its path, menu label, title, description and search keywords.
 *
 * One list drives the router, the navigation bar and the search index, so a
 * page cannot exist without a menu entry (the starter's menu had lost Blog).
 * Phase 2 (CR-30): seven menu items; Readme and Dashboard are linked from the footer.
 */
// ---------------------------------------------------------------------------
// Page metadata for the router, the navigation bar and Search (version 1.0).
// One list drives all three, so a page cannot exist without a menu entry.
// ---------------------------------------------------------------------------
export interface PageMeta {
  id: string;
  path: string;
  label: string;
  title: string;
  description: string;
  keywords: string[];
  inNav: boolean;
}

export const pages: PageMeta[] = [
  {
    id: 'home',
    path: '/',
    label: 'Home',
    title: 'Home',
    description: 'Introduction, key numbers and selected work.',
    keywords: ['start', 'intro', 'overview'],
    inNav: true,
  },
  {
    id: 'about',
    path: '/about',
    label: 'About',
    title: 'About Me',
    description: 'My story, what I do, experience and recognition.',
    keywords: ['profile', 'experience', 'winjit', 'career', 'consultant', 'awards'],
    inNav: true,
  },
  {
    id: 'education',
    path: '/education',
    label: 'Education',
    title: 'Education',
    description: 'MSc, AI & ML diploma, BE, diploma and certifications.',
    keywords: ['msc', 'be', 'diploma', 'university', 'limerick', 'nit warangal', 'certifications'],
    inNav: true,
  },
  {
    id: 'knowledge',
    path: '/knowledge',
    label: 'Work',
    title: 'Professional Knowledge',
    description: 'Case studies, other projects and skills.',
    keywords: ['projects', 'skills', 'ocr', 'loan', '.net', 'professional knowledge', 'case studies'],
    inNav: true,
  },
  {
    id: 'gallery',
    path: '/gallery',
    label: 'Gallery',
    title: 'Gallery',
    description: 'Pictures and videos: places, work and life.',
    keywords: ['photos', 'images', 'pictures', 'video', 'film'],
    inNav: true,
  },
  {
    id: 'blog',
    path: '/blog',
    label: 'Blog',
    title: 'Blog',
    description: 'Articles, plus a community feed with posts, likes and comments.',
    keywords: ['articles', 'posts', 'comments', 'feed'],
    inNav: true,
  },
  {
    id: 'messages',
    path: '/messages',
    label: 'Contact',
    title: 'Contact',
    description: 'Instant messaging and contact details.',
    keywords: ['chat', 'contact', 'linkedin', 'message'],
    inNav: true,
  },
  {
    id: 'dashboard',
    path: '/dashboard',
    label: 'Dashboard',
    title: 'Dashboard',
    description: 'Live GitHub activity, CI/CD pipeline runs and the code quality report.',
    keywords: ['github', 'repositories', 'pipeline', 'ci', 'cd', 'actions', 'quality', 'coverage', 'tests'],
    inNav: false,
  },
  {
    id: 'readme',
    path: '/readme',
    label: 'Readme',
    title: 'Readme',
    description: 'How the portfolio is structured and how it evolved from the starter: discovery, design, development and evaluation.',
    keywords: ['report', 'structure', 'architecture', 'diagram', 'evolution', 'lehman'],
    inNav: false,
  },
  {
    id: 'search',
    path: '/search',
    label: 'Search',
    title: 'Search',
    description: 'Find any page of the portfolio.',
    keywords: ['find', 'lookup'],
    inNav: false,
  },
];
