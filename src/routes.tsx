import type { ReactElement } from 'react';
import { pages, type PageMeta } from './lib/navigation';
import About from './pages/About';
import Blog from './pages/Blog';
import Education from './pages/Education';
import Gallery from './pages/Gallery';
import Home from './pages/Home';
import Knowledge from './pages/Knowledge';
import Messages from './pages/Messages';
import Readme from './pages/Readme';
import Search from './pages/Search';
import Videos from './pages/Videos';

const elements: Record<string, ReactElement> = {
  home: <Home />,
  about: <About />,
  education: <Education />,
  knowledge: <Knowledge />,
  gallery: <Gallery />,
  videos: <Videos />,
  blog: <Blog />,
  messages: <Messages />,
  search: <Search />,
  readme: <Readme />,
};

export interface AppRoute extends PageMeta {
  element: ReactElement;
}

/** Page metadata joined with the component that renders each page. */
export const routes: AppRoute[] = pages.map((p) => ({ ...p, element: elements[p.id] }));
