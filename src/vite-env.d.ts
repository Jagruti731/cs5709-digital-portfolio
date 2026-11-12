/**
 * @file Type declarations for Vite: import.meta.env, and imports of ?raw files such as README.md.
 */
/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/** package.json "version", injected by vite.config.ts. */
declare const __APP_VERSION__: string;

declare module '*.md?raw' {
  const content: string;
  export default content;
}
