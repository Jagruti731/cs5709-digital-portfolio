/**
 * @file Type declarations for Vite: import.meta.env, and imports of ?raw files such as README.md.
 */
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
