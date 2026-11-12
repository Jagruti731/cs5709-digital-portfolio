/**
 * @file Builds the code quality report shown on the Dashboard (CR-24, innovation).
 *
 * Run by the CI/CD pipeline after the tests and the build; writes build/quality.json,
 * which is deployed with the site. Every number comes from a tool, not from a person:
 *
 *  - tests: Vitest (unit, component), the API script and the Playwright walkthrough
 *  - coverage: Vitest v8 coverage summary
 *  - lint: ESLint errors and warnings, run through its Node API
 *  - complexity: cyclomatic complexity of every function (ESLint's complexity rule at 0)
 *  - documentation: share of source files that start with an @file header
 *  - bundle: size and gzip size of every JavaScript chunk in build/assets
 *  - architecture conformance: a reflexion model (Murphy et al., 1995). The intended
 *    "may depend on" rules of README section 4.1 are compared with the real imports:
 *    convergences (allowed and present), divergences (present but not allowed) and
 *    absences (allowed but never used)
 *  - evolution: size of the system at v0-starter, v1.0 and now, and Phase 2 commits by maintenance type
 *
 * Usage: node tools/quality-report.mjs   (after npm run test:coverage, test:api, build and test:e2e)
 */
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { ESLint } from 'eslint';

const root = resolve(new URL('..', import.meta.url).pathname);
const at = (...p) => join(root, ...p);
const readJson = (p) => (existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null);
const git = (cmd) => {
  try {
    return execSync(`git ${cmd}`, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28 }).trim();
  } catch {
    return '';
  }
};
const walk = (dir) => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
const pct = (a, b) => (b ? Math.round((a / b) * 1000) / 10 : 0);

// ---------------------------------------------------------------- tests
function tests() {
  const unit = readJson(at('coverage/test-results.json'));
  const api = readJson(at('coverage/api-results.json'));
  const e2e = readJson(at('coverage/e2e-results.json'));
  const count = (list) => ({ passed: list.filter((r) => r.ok).length, total: list.length });
  return {
    unit: unit ? { passed: unit.numPassedTests, total: unit.numTotalTests, files: unit.testResults.length } : null,
    api: api ? count(api.results) : null,
    e2e: e2e ? count(e2e.results) : null,
  };
}

// ---------------------------------------------------------------- coverage
function coverage() {
  const s = readJson(at('coverage/coverage-summary.json'));
  if (!s) return null;
  const t = s.total;
  return { lines: t.lines.pct, statements: t.statements.pct, functions: t.functions.pct, branches: t.branches.pct };
}

// ---------------------------------------------------------------- lint and complexity
async function lintAndComplexity() {
  const eslint = new ESLint({ cwd: root });
  const results = await eslint.lintFiles(['.']);
  const errors = results.reduce((n, r) => n + r.errorCount, 0);
  const warnings = results.reduce((n, r) => n + r.warningCount, 0);

  // Same rules, but report the complexity of every function (threshold 0).
  const measure = new ESLint({ cwd: root, overrideConfig: { rules: { complexity: ['warn', 0] } } });
  const functions = [];
  for (const r of await measure.lintFiles(['src/**/*.{ts,tsx}'])) {
    if (/\.test\.tsx?$/.test(r.filePath)) continue;
    for (const m of r.messages) {
      const match = /^(.*) has a complexity of (\d+)/.exec(m.message);
      if (m.ruleId === 'complexity' && match) functions.push({ name: match[1].replace(/^(Async )?(Arrow )?(F|f)unction /, '').replace(/'/g, ''), file: relative(root, r.filePath), line: m.line, complexity: Number(match[2]) });
    }
  }
  functions.sort((a, b) => b.complexity - a.complexity);
  const values = functions.map((f) => f.complexity);
  const buckets = { '1–4 (simple)': 0, '5–8 (moderate)': 0, '9–12 (complex)': 0, '13+ (too complex)': 0 };
  for (const v of values) buckets[v <= 4 ? '1–4 (simple)' : v <= 8 ? '5–8 (moderate)' : v <= 12 ? '9–12 (complex)' : '13+ (too complex)'] += 1;
  return {
    lint: { errors, warnings, filesChecked: results.length },
    complexity: {
      functions: values.length,
      average: values.length ? Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10 : 0,
      max: values[0] ?? 0,
      buckets,
      top: functions.slice(0, 6),
    },
  };
}

// ---------------------------------------------------------------- source and documentation
const SOURCE = walk(at('src')).filter((p) => /\.(ts|tsx)$/.test(p) && !/\.test\.|vite-env/.test(p));

function source() {
  let lines = 0;
  let comments = 0;
  let withHeader = 0;
  const byFolder = {};
  for (const file of SOURCE) {
    const text = readFileSync(file, 'utf8');
    const ls = text.split('\n');
    lines += ls.length;
    comments += ls.filter((l) => /^\s*(\/\/|\/\*|\*)/.test(l)).length;
    if (/^\/\*\*[\s\S]*?@file/.test(text)) withHeader += 1;
    const folder = relative(at('src'), dirname(file)).split('/')[0] || '(root)';
    byFolder[folder] = (byFolder[folder] ?? 0) + ls.length;
  }
  const tests = walk(at('src')).filter((p) => /\.test\.tsx?$/.test(p)).length;
  return {
    files: SOURCE.length,
    lines,
    commentShare: pct(comments, lines),
    filesWithHeader: withHeader,
    headerShare: pct(withHeader, SOURCE.length),
    testFiles: tests,
    linesByFolder: Object.entries(byFolder).sort((a, b) => b[1] - a[1]),
  };
}

// ---------------------------------------------------------------- bundle
function bundle() {
  const dir = at('build/assets');
  if (!existsSync(dir)) return null;
  const html = readFileSync(at('build/index.html'), 'utf8');
  const entry = /src="\.\/assets\/(index-[\w-]+\.js)"/.exec(html)?.[1];
  // GSAP's core also builds to a chunk called "index"; name chunks by what they contain.
  const label = (f, text) => (f === entry ? 'main (app shell)' : f.startsWith('index-') && text.includes('GreenSock') ? 'gsap (core)' : f.replace(/-[\w-]{8}\.js$/, ''));
  const chunks = readdirSync(dir)
    .filter((f) => f.endsWith('.js'))
    .map((f) => {
      const buf = readFileSync(join(dir, f));
      return { name: label(f, buf.toString('utf8', 0, 4000)), kb: Math.round(buf.length / 102.4) / 10, gzipKb: Math.round(gzipSync(buf).length / 102.4) / 10 };
    })
    .sort((a, b) => b.kb - a.kb);
  const main = entry ? gzipSync(readFileSync(join(dir, entry))).length : 0;
  return {
    chunks: chunks.length,
    totalKb: Math.round(chunks.reduce((n, c) => n + c.kb, 0)),
    totalGzipKb: Math.round(chunks.reduce((n, c) => n + c.gzipKb, 0)),
    mainGzipKb: Math.round(main / 102.4) / 10,
    largest: chunks.slice(0, 8),
  };
}

// ---------------------------------------------------------------- architecture conformance (reflexion model)
/** Intended architecture: README section 4.1. Each part may depend on the parts listed. */
const ALLOWED = {
  pages: ['components', 'features', 'hooks', 'lib', 'config', 'types'],
  features: ['components', 'hooks', 'store', 'services', 'lib', 'config', 'types'],
  components: ['features', 'hooks', 'lib', 'config', 'types'],
  hooks: ['store', 'lib', 'types'],
  store: ['services', 'types'],
  services: ['lib', 'config', 'types'],
  lib: ['config', 'types'],
  config: [],
  types: [],
};

function architecture() {
  const part = (file) => relative(at('src'), file).split('/')[0];
  const edges = new Map();
  let imports = 0;
  for (const file of SOURCE) {
    const from = part(file);
    if (!(from in ALLOWED)) continue;
    for (const m of readFileSync(file, 'utf8').matchAll(/from '(\.[^']+)'/g)) {
      const target = resolve(dirname(file), m[1]);
      if (!target.startsWith(at('src'))) continue;
      const to = part(target);
      if (!(to in ALLOWED) || to === from) continue;
      imports += 1;
      const key = `${from}→${to}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  }
  const convergences = [];
  const divergences = [];
  const absences = [];
  for (const [from, allowed] of Object.entries(ALLOWED)) {
    for (const to of Object.keys(ALLOWED)) {
      if (to === from) continue;
      const n = edges.get(`${from}→${to}`) ?? 0;
      if (n && allowed.includes(to)) convergences.push({ from, to, imports: n });
      else if (n) divergences.push({ from, to, imports: n });
      else if (allowed.includes(to)) absences.push({ from, to });
    }
  }
  return { parts: Object.keys(ALLOWED), imports, convergences, divergences, absences };
}

// ---------------------------------------------------------------- evolution
function evolution() {
  const measure = (ref) => {
    if (!git(`rev-parse --verify --quiet ${ref}`)) return null;
    const files = git(`ls-tree -r --name-only ${ref}`).split('\n');
    const src = files.filter((f) => /^src\/.*\.(ts|tsx|js|jsx|css)$/.test(f) && !f.startsWith('src/assets/'));
    const lines = src.reduce((n, f) => n + git(`show ${ref}:"${f}"`).split('\n').length, 0);
    const pkg = JSON.parse(git(`show ${ref}:package.json`) || '{}');
    return { ref, sourceFiles: src.length, sourceLines: lines, runtimeDependencies: Object.keys(pkg.dependencies ?? {}).length, commits: Number(git(`rev-list --count ${ref}`)) };
  };
  const types = { corrective: 0, adaptive: 0, perfective: 0, preventive: 0 };
  const range = git('rev-parse --verify --quiet v1.0') ? 'v1.0..HEAD' : 'HEAD';
  for (const subject of git(`log --format=%s ${range}`).split('\n')) {
    const t = /^(corrective|adaptive|perfective|preventive):/.exec(subject)?.[1];
    if (t) types[t] += 1;
  }
  return { versions: ['v0-starter', 'v1.0', 'HEAD'].map(measure).filter(Boolean), phase2CommitsByType: types };
}

// ---------------------------------------------------------------- write
const report = {
  generatedAt: new Date().toISOString(),
  commit: git('rev-parse --short HEAD') || 'unknown',
  runUrl: process.env.GITHUB_RUN_ID ? `${process.env.GITHUB_SERVER_URL}/${process.env.GITHUB_REPOSITORY}/actions/runs/${process.env.GITHUB_RUN_ID}` : null,
  tests: tests(),
  coverage: coverage(),
  ...(await lintAndComplexity()),
  source: source(),
  bundle: bundle(),
  architecture: architecture(),
  evolution: evolution(),
};
const out = existsSync(at('build')) ? at('build/quality.json') : at('public/quality.json');
writeFileSync(out, JSON.stringify(report, null, 2) + '\n');
console.log(`quality report: ${relative(root, out)}`);
console.log(
  `tests ${report.tests.unit?.passed}/${report.tests.unit?.total} unit, ${report.tests.api?.passed}/${report.tests.api?.total} API, ${report.tests.e2e?.passed}/${report.tests.e2e?.total} browser · ` +
    `coverage ${report.coverage?.lines}% · lint ${report.lint.errors}/${report.lint.warnings} · complexity avg ${report.complexity.average} max ${report.complexity.max} · ` +
    `divergences ${report.architecture.divergences.length}`,
);
