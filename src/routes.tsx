import type { ReactElement } from 'react';
import { useNavigate } from 'react-router-dom';
import { pages, type PageMeta, type PageType } from './lib/navigation';
import About from './pages/About';
import Education from './pages/Education';
import Gallery from './pages/Gallery';
import Home from './pages/Home';
import Knowledge from './pages/Knowledge';
// Starter pages still to be evolved in iteration 2:
import { Blog } from './components/Blog';
import { Contact } from './components/Contact';
import { PostFeed } from './components/PostFeed';
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
  home: <Home />,
  about: <About />,
  education: <Education />,
  knowledge: <Knowledge />,
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
