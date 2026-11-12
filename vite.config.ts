/**
 * @file Vite build and Vitest test configuration.
 */
import react from '@vitejs/plugin-react-swc';
import { VitePWA } from 'vite-plugin-pwa';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  // Relative asset paths: the same build works on GitHub Pages under any
  // repository name (jagruti731.github.io/cs5709-digital-portfolio/), on any
  // static host, or from a sub-folder. HashRouter needs no server rewrites.
  base: './',
  plugins: [
    react(),
    // Progressive Web App (CR-23, innovation): installable, and works offline.
    VitePWA({
      registerType: 'prompt', // a new version is offered to the visitor, never forced mid-read
      injectRegister: false, // registered in src/features/pwa/usePwa.ts
      includeAssets: ['favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: 'Jagruti Badgujar – Portfolio',
        short_name: 'Jagruti',
        description: 'Software engineer and MSc Software Engineering student at the University of Limerick.',
        lang: 'en-IE',
        start_url: './',
        scope: './',
        display: 'standalone',
        theme_color: '#1c1f26',
        background_color: '#f4f5f7',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
        shortcuts: [
          { name: 'Search', url: './#/search' },
          { name: 'Professional knowledge', url: './#/knowledge' },
          { name: 'Blog', url: './#/blog' },
        ],
      },
      workbox: {
        // App shell: HTML, every JS chunk, CSS, fonts, icons and the JSON content are cached at install,
        // so every page works offline even if it was never opened.
        globPatterns: ['**/*.{js,css,html,svg,woff2,png,ico,webmanifest,json}'],
        globIgnores: ['**/images/**', '**/videos/**', '**/diagrams/**'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // Content: fresh when online, last copy when offline.
            urlPattern: ({ url }) => url.pathname.includes('/data/') && url.pathname.endsWith('.json'),
            handler: 'NetworkFirst',
            options: { cacheName: 'content', networkTimeoutSeconds: 4, expiration: { maxEntries: 30 } },
          },
          {
            // Pictures and diagrams rarely change: cache first, refresh after 30 days.
            urlPattern: ({ url }) => /\/(images|diagrams)\//.test(url.pathname),
            handler: 'CacheFirst',
            options: { cacheName: 'images', expiration: { maxEntries: 60, maxAgeSeconds: 30 * 24 * 3600 } },
          },
        ],
      },
    }),
  ],
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
