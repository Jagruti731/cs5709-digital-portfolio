/**
 * @file Builds public/data/codeindex.json: a search index of the source code (CR-21, innovation).
 *
 * This is automated concept location (Rajlich & Wilde, 2002): given a concept
 * such as "skip link" or "comment author", find the files that implement it.
 * For every source file the index keeps its path, its @file JSDoc header, the
 * names it exports and the other comments in it. The Search page then ranks
 * the files with the same BM25 engine it uses for site content.
 * Run automatically before `npm run dev`, `npm test` and `npm run build`.
 */
import { execSync } from 'node:child_process';
import { readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const REPO = 'https://github.com/Jagruti731/cs5709-digital-portfolio/blob/main/';
const INCLUDE = /\.(ts|tsx|mjs|js|css|yml|sh)$/;
const SKIP = /(node_modules|\.test\.|vite-env\.d\.ts)/;

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

/** The first comment block in a file: /** ... *\/ or consecutive # / // lines. */
function headerOf(text) {
  const block = /\/\*\*([\s\S]*?)\*\//.exec(text);
  if (block)
    return block[1]
      .replace(/^\s*\* ?/gm, '')
      .replace('@file', '')
      .trim();
  const lines = [];
  for (const line of text.split('\n')) {
    const m = /^\s*(#|\/\/)\s?(.*)$/.exec(line);
    if (!m) break;
    lines.push(m[2]);
  }
  return lines.join(' ').replace('@file', '').trim();
}

const files = [
  ...walk(join(root, 'src')),
  ...walk(join(root, 'tools')),
  join(root, 'server/index.js'),
  join(root, '.github/workflows/ci-cd.yml'),
  join(root, 'eslint.config.js'),
  join(root, 'vite.config.ts'),
]
  .filter((p) => INCLUDE.test(p) && !SKIP.test(p))
  .map((path) => {
    const text = readFileSync(path, 'utf8');
    const rel = relative(root, path);
    const doc = headerOf(text);
    const exports = [...text.matchAll(/export\s+(?:default\s+)?(?:async\s+)?(?:function|const|class|interface|type)\s+(\w+)/g)].map(
      (m) => m[1],
    );
    const comments = [...text.matchAll(/\/\/\s?(.+)|\/\*\*([\s\S]*?)\*\//g)]
      .slice(1)
      .map((m) => (m[1] ?? m[2] ?? '').replace(/^\s*\* ?/gm, ' ').trim())
      .join(' ')
      .slice(0, 1500);
    return {
      path: rel,
      summary: doc.split(/\.\s|\n\n/)[0].slice(0, 220),
      doc: doc.slice(0, 1200),
      exports,
      comments,
      lines: text.split('\n').length,
      url: REPO + rel,
    };
  })
  .sort((a, b) => a.path.localeCompare(b.path));

let commit = 'working copy';
try {
  commit = execSync('git rev-parse --short HEAD', { cwd: root, encoding: 'utf8' }).trim();
} catch {
  /* not a git checkout */
}
writeFileSync(join(root, 'public/data/codeindex.json'), JSON.stringify({ generatedAt: new Date().toISOString(), commit, files }) + '\n');
console.log(`code index: ${files.length} files`);
