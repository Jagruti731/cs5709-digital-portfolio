import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { pages, type PageMeta, type PageType } from './lib/navigation';
// Iteration 1, step 1: the starter's page components are kept and given URLs.
import { About } from './components/About';
import { Blog } from './components/Blog';
import { Contact } from './components/Contact';
import { Education } from './components/Education';
import { Gallery } from './components/Gallery';
import { PostFeed } from './components/PostFeed';
import { Projects } from './components/Projects';
import { Search } from './components/Search';
import { VideoGallery } from './components/VideoGallery';

// The starter's Search reports a page id; translate it into a URL.
const legacyPaths: Partial<Record<PageType, string>> = {
  about: '/about', projects: '/knowledge', contact: '/messages', gallery: '/gallery', blog: '/blog',
  'video-gallery': '/videos', education: '/education', post: '/', search: '/search',
};
function LegacySearch() {
  const navigate = useNavigate();
  return <Search onNavigate={(page) => navigate(legacyPaths[page] ?? '/')} />;
}

const elements: Record<string, ReactElement> = {
  home: <PostFeed />,
  about: <About />,
  education: <Education />,
  knowledge: <Projects />,
  gallery: <Gallery />,
  videos: <VideoGallery />,
  blog: <Blog />,
  messages: <Contact />,
  search: <LegacySearch />,
  readme: <About />,
};

export interface AppRoute extends PageMeta {
  element: ReactElement;
}

/** Page metadata joined with the component that renders each page. */
export const routes: AppRoute[] = pages.map((p) => ({ ...p, element: elements[p.id] }));
