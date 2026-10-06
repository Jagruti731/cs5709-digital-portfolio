import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';

export default defineConfig({
  // When deploying to GitHub Pages for a repository site, set the base to the repo name
  // so built assets reference "/Salim-Saay/..." instead of "/..." which breaks on gh-pages.
  base: '/Salim-Saay/',
  plugins: [react()],
  build: {
    target: 'es2020',
    outDir: 'build',
  },
  server: {
    port: 3000,
    open: true,
  },
});
