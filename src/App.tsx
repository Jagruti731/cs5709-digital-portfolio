/**
 * @file App: the router.
 *
 * HashRouter keeps every route inside index.html (/#/about), so GitHub Pages
 * and any other static host work without server rewrite rules.
 */
import { HashRouter, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import NotFound from './pages/NotFound';
import { routes } from './routes';

/**
 * Version 1.0 replaces the starter's useState + switch page selection with
 * URL routing. HashRouter keeps every route inside index.html (/#/about), so
 * any static host works without rewrite rules.
 */
export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<Layout />}>
          {routes.map((r) =>
            r.path === '/' ? <Route key={r.id} index element={r.element} /> : <Route key={r.id} path={r.path} element={r.element} />,
          )}
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}
