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
  { id: 'home', path: '/', label: 'Home', title: 'Home', description: 'Introduction, key numbers, featured projects and career path.', keywords: ['start', 'intro', 'overview'], inNav: true },
  { id: 'about', path: '/about', label: 'About', title: 'About Me', description: 'My story, what I do and my work experience.', keywords: ['profile', 'experience', 'winjit', 'career'], inNav: true },
  { id: 'education', path: '/education', label: 'Education', title: 'Education', description: 'MSc, BE, diploma and certifications.', keywords: ['msc', 'be', 'diploma', 'university', 'limerick'], inNav: true },
  { id: 'knowledge', path: '/knowledge', label: 'Professional Knowledge', title: 'Professional Knowledge', description: 'Case studies, projects, skills and software evolution.', keywords: ['projects', 'skills', 'ocr', 'loan', '.net', 'lehman'], inNav: true },
  { id: 'gallery', path: '/gallery', label: 'Pictures', title: 'Picture Gallery', description: 'Places, work and life in pictures.', keywords: ['photos', 'images', 'gallery'], inNav: true },
  { id: 'videos', path: '/videos', label: 'Videos', title: 'Video Gallery', description: 'Short films about my work and software evolution.', keywords: ['video', 'film', 'lehman', 'ocr'], inNav: true },
  { id: 'blog', path: '/blog', label: 'Blog', title: 'Blog', description: 'Articles, plus a community feed with posts, likes and comments.', keywords: ['articles', 'posts', 'comments', 'feed'], inNav: true },
  { id: 'messages', path: '/messages', label: 'Messages', title: 'Messages', description: 'Instant messaging and contact details.', keywords: ['chat', 'contact', 'linkedin', 'message'], inNav: true },
  { id: 'readme', path: '/readme', label: 'Readme', title: 'Readme', description: 'How the portfolio is structured and how it evolved from the starter: discovery, design, development and evaluation.', keywords: ['report', 'structure', 'architecture', 'diagram', 'evolution', 'lehman'], inNav: true },
  { id: 'search', path: '/search', label: 'Search', title: 'Search', description: 'Find any page of the portfolio.', keywords: ['find', 'lookup'], inNav: false },
];

// ---------------------------------------------------------------------------
// Legacy descriptors from the starter (version 0). Still used by the old
// Search component until it is replaced.
// ---------------------------------------------------------------------------
export type PageType =
  | 'about'
  | 'projects'
  | 'contact'
  | 'gallery'
  | 'blog'
  | 'video-gallery'
  | 'education'
  | 'post'
  | 'publications'
  | 'search'
  | 'analytics'
  | 'github';

export interface PageDescriptor {
  page: PageType;
  label: string;
  description: string;
  keywords: string[];
}

export const pageDescriptors: PageDescriptor[] = [
  {
    page: 'about',
    label: 'About',
    description: 'Academic profile, research background, and professional journey.',
    keywords: ['home', 'profile', 'research', 'journey'],
  },
  {
    page: 'post',
    label: 'Post Feed',
    description: 'Interactive posts, comments, likes, and image sharing.',
    keywords: ['posts', 'feed', 'community', 'comments', 'likes'],
  },
  {
    page: 'projects',
    label: 'Projects',
    description: 'Research, collaboration, and software project portfolio.',
    keywords: ['portfolio', 'github', 'demo', 'research'],
  },
  {
    page: 'publications',
    label: 'Publications',
    description: 'Selected papers, conference outputs, and academic writing.',
    keywords: ['papers', 'journal', 'conference', 'citations'],
  },
  {
    page: 'education',
    label: 'Education',
    description: 'Academic qualifications and international study history.',
    keywords: ['bsc', 'msc', 'phd', 'study'],
  },
  {
    page: 'gallery',
    label: 'Gallery',
    description: 'Visual highlights from projects, teaching, and events.',
    keywords: ['images', 'photos', 'events', 'teaching'],
  },
  {
    page: 'video-gallery',
    label: 'Video Gallery',
    description: 'Recorded lectures, demos, and YouTube-based content.',
    keywords: ['videos', 'youtube', 'lectures', 'tutorials'],
  },
  {
    page: 'blog',
    label: 'Blog',
    description: 'Thoughts and articles on software engineering and web development.',
    keywords: ['articles', 'insights', 'typescript', 'react'],
  },
  {
    page: 'contact',
    label: 'Contact',
    description: 'Contact details, message form, and collaboration links.',
    keywords: ['email', 'phone', 'linkedin', 'location'],
  },
  {
    page: 'search',
    label: 'Search',
    description: 'Global search across portfolio sections and capabilities.',
    keywords: ['find', 'lookup', 'discover', 'quick access'],
  },
  {
    page: 'analytics',
    label: 'Analytics',
    description: 'Local usage analytics including page visits and search activity.',
    keywords: ['insights', 'events', 'stats', 'usage'],
  },
  {
    page: 'github',
    label: 'GitHub',
    description: 'Live GitHub profile and repository integration.',
    keywords: ['repositories', 'stars', 'followers', 'profile'],
  },
];

export const primaryNavItems: PageType[] = [
  'about',
  'post',
  'projects',
  'publications',
  'search',
  'github',
  'analytics',
  'contact',
  'gallery',
  'video-gallery',
  'education',
];