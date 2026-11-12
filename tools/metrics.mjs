// Measures the size of the system at two git refs and writes public/data/metrics.json.
// Usage: node tools/metrics.mjs [oldRef=v0-starter] [newRef=HEAD]
import { execSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';

const [oldRef = 'v0-starter', newRef = 'HEAD'] = process.argv.slice(2);
const git = (cmd) => execSync(`git ${cmd}`, { encoding: 'utf8', maxBuffer: 1 << 28 });
const SOURCE = /^src\/.*\.(ts|tsx|js|jsx|css)$/;

function measure(ref) {
  const tree = git(`ls-tree -r -l ${ref}`)
    .trim()
    .split('\n')
    .map((line) => {
      const [meta, path] = line.split('\t');
      return { path, size: Number(meta.trim().split(/\s+/)[3]) || 0 };
    });
  const source = tree.filter((f) => SOURCE.test(f.path) && !f.path.startsWith('src/assets/'));
  const lines = source.reduce((n, f) => n + git(`show ${ref}:"${f.path}"`).split('\n').length - 1, 0);
  const pkg = JSON.parse(git(`show ${ref}:package.json`));
  return {
    ref,
    commit: git(`rev-parse --short ${ref}`).trim(),
    filesInRepository: tree.length,
    trackedMB: Math.round((tree.reduce((n, f) => n + f.size, 0) / 1048576) * 10) / 10,
    sourceFiles: source.length,
    sourceLines: lines,
    runtimeDependencies: Object.keys(pkg.dependencies || {}).length,
  };
}

const result = { measuredOn: new Date().toISOString().slice(0, 10), before: measure(oldRef), after: measure(newRef) };
writeFileSync(new URL('../public/data/metrics.json', import.meta.url), JSON.stringify(result, null, 2) + '\n');
console.log(JSON.stringify(result, null, 2));
