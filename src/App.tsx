/**
 * @file App: the router.
 *
 * HashRouter keeps every route inside index.html (/#/about), so GitHub Pages
 * and any other static host work without server rewrite rules. Each page is
 * loaded lazily, only when it is first visited (CR-19).
 * CR-44: every page is preloaded in the background (routes.ts), so a page change does not wait
 * for a download or flash a loading placeholder.
 */
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { NotFound, routes } from './routes';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          {routes.map(({ id, path, Component }) =>
            path === '/' ? <Route key={id} index element={<Component />} /> : <Route key={id} path={path} element={<Component />} />,
          )}
          {/* The old Videos page (merged into Gallery in CR-30, removed in CR-47) opens the gallery. */}
          <Route path="/videos" element={<Navigate to="/gallery" replace />} />
          {/* Education became a section of About (CR-33). */}
          <Route path="/education" element={<Navigate to="/about?section=education" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
