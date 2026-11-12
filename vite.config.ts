/**
 * @file Vite build and Vitest test configuration.
 */
import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative asset paths: the same build works on GitHub Pages under any
  // repository name (jagruti731.github.io/cs5709-digital-portfolio/), on any
  // static host, or from a sub-folder. HashRouter needs no server rewrites.
  base: './',
  plugins: [react()],
  build: {
    target: 'es2020',
    outDir: 'build',
  },
  server: {
    port: 3000,
    open: true,
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
    reporters: ['default', 'json'],
    outputFile: { json: 'coverage/test-results.json' },
    coverage: {
      provider: 'v8',
      // Logic layer only: pages are covered by the browser walkthrough test (tools/browser-test.mjs).
      include: ['src/{store,services,features,lib,hooks,config}/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/main.tsx', 'src/vite-env.d.ts', 'src/types/**'],
      reporter: ['text-summary', 'json-summary', 'html'],
      // CI fails if coverage of the logic layer drops below these numbers.
      thresholds: { lines: 50, functions: 50 },
    },
  },
});
