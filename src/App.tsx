/**
 * @file App: the router.
 *
 * HashRouter keeps every route inside index.html (/#/about), so GitHub Pages
 * and any other static host work without server rewrite rules. Each page is
 * loaded lazily, only when it is first visited (CR-19).
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
          {/* Pictures and Videos were merged into Gallery (CR-30); old links still work. */}
          <Route path="/videos" element={<Navigate to="/gallery?tab=videos" replace />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
