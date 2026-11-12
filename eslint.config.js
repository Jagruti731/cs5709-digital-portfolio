/**
 * ESLint flat configuration (CR-11, peer review: "add Prettier and ESLint, run them in CI").
 * TypeScript-aware rules for src/, React hooks rules, and Node globals for tools/ and server/.
 * Formatting is left to Prettier, so no stylistic rules are enabled here.
 */
import js from '@eslint/js';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['build', 'coverage', 'node_modules', 'legacy', 'server/node_modules', 'public/sw.js'] },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { ecmaVersion: 2022, globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      complexity: ['warn', 12],
      'max-lines-per-function': ['warn', { max: 120, skipBlankLines: true, skipComments: true }],
      'no-magic-numbers': 'off',
    },
  },
  {
    files: ['tools/**/*.{js,mjs}', 'server/**/*.js', '*.config.{js,ts}', 'scripts/**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: { ecmaVersion: 2022, globals: { ...globals.node } },
  },
  { files: ['server/**/*.js'], languageOptions: { sourceType: 'commonjs' } },
  // Playwright evaluates these callbacks inside the browser page.
  { files: ['tools/browser-test.mjs', 'tools/walkthrough.mjs'], languageOptions: { globals: { ...globals.node, ...globals.browser } } },
);
