/**
 * @file QualityPanel: the code quality dashboard (CR-24, innovation; user story US6).
 *
 * Everything shown comes from quality.json, written by the CI/CD pipeline for
 * the exact commit that is live: test results, coverage, lint, complexity,
 * documentation, bundle size, an architecture conformance check (reflexion
 * model) and the size of the system across versions.
 */
import { Fragment } from 'react';
import { LoadState } from '../../components/LoadState';
import { passRate, useQualityReport, type QualityReport } from './report';

const COVERAGE_THRESHOLD = 60; // same as vite.config.ts

/** Horizontal bars: label, bar scaled to `max`, value. */
function Bars({ rows, max, unit = '', marker }: { rows: [string, number][]; max: number; unit?: string; marker?: number }) {
  return (
    <ul className="bars">
      {rows.map(([label, value]) => (
        <li key={label}>
          <span>{label}</span>
          <span className="bar-track">
            <span className="bar" style={{ width: `${Math.min(100, (value / Math.max(max, 1)) * 100)}%` }} />
            {marker !== undefined && (
              <i className="bar-marker" style={{ left: `${(marker / max) * 100}%` }} title={`threshold ${marker}${unit}`} />
            )}
          </span>
          <b>
            {value}
            {unit}
          </b>
        </li>
      ))}
    </ul>
  );
}

const ZERO = { passed: 0, total: 0 };

/** All automated checks added together: unit, API and browser. */
function allChecks(t: QualityReport['tests']) {
  const parts = [t.unit ?? ZERO, t.api ?? ZERO, t.e2e ?? ZERO];
  return { passed: parts.reduce((n, p) => n + p.passed, 0), total: parts.reduce((n, p) => n + p.total, 0) };
}

/** The six headline numbers: [value, label, meets the target]. */
function headline(r: QualityReport): [string, string, boolean][] {
  const checks = allChecks(r.tests);
  const lines = r.coverage?.lines;
  return [
    [`${checks.passed}/${checks.total}`, 'automated checks passed', checks.passed === checks.total],
    [lines === undefined ? '–' : `${lines}%`, 'line coverage of the logic layer', (lines ?? 0) >= COVERAGE_THRESHOLD],
    [`${r.lint.errors} / ${r.lint.warnings}`, 'lint errors / warnings', r.lint.errors + r.lint.warnings === 0],
    [`${r.complexity.average}`, `average complexity (max ${r.complexity.max})`, r.complexity.max <= 12],
    [`${r.source.headerShare}%`, 'files with an @file header', r.source.headerShare === 100],
    [`${r.architecture.divergences.length}`, 'architecture rule breaks', r.architecture.divergences.length === 0],
  ];
}

function Headline({ r }: { r: QualityReport }) {
  return (
    <div className="metrics">
      {headline(r).map(([value, label, good]) => (
        <div className={`metric${good ? '' : ' bad'}`} key={label}>
          <b>{value}</b>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}

/** Reflexion model as a matrix: row depends on column. */
function Conformance({ a }: { a: QualityReport['architecture'] }) {
  const cell = (from: string, to: string) => {
    if (from === to) return <td className="self" />;
    const conv = a.convergences.find((e) => e.from === from && e.to === to);
    const div = a.divergences.find((e) => e.from === from && e.to === to);
    const abs = a.absences.some((e) => e.from === from && e.to === to);
    if (div)
      return (
        <td className="div" title="divergence: present in the code, not allowed">
          ✗ {div.imports}
        </td>
      );
    if (conv)
      return (
        <td className="conv" title="convergence: allowed and present">
          ✓ {conv.imports}
        </td>
      );
    return (
      <td className={abs ? 'abs' : ''} title={abs ? 'absence: allowed, not used' : 'not allowed, not used'}>
        {abs ? '·' : ''}
      </td>
    );
  };
  return (
    <>
      <p className="note">
        Intended rules (README 4.1) compared with {a.imports} real imports between parts: {a.convergences.length} convergences,{' '}
        <b>{a.divergences.length} divergences</b>, {a.absences.length} absences. Row depends on column.
      </p>
      <div className="table-wrap">
        <table className="matrix">
          <thead>
            <tr>
              <th />
              {a.parts.map((p) => (
                <th key={p}>{p}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {a.parts.map((from) => (
              <tr key={from}>
                <th>{from}</th>
                {a.parts.map((to) => (
                  <Fragment key={to}>{cell(from, to)}</Fragment>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/** "70 unit and component tests in 12 files · 16 API checks · 15 browser checks" */
const testSummary = ({ unit, api, e2e }: QualityReport['tests']) =>
  `${unit?.total ?? 0} unit and component tests in ${unit?.files ?? 0} files · ${api?.total ?? 0} API checks · ${e2e?.total ?? 0} browser checks`;

function TestsAndCoverage({ r }: { r: QualityReport }) {
  const tests: [string, number][] = [
    ['Unit + component', passRate(r.tests.unit) ?? 0],
    ['API', passRate(r.tests.api) ?? 0],
    ['Browser walkthrough', passRate(r.tests.e2e) ?? 0],
  ];
  const c = r.coverage;
  return (
    <section>
      <h2>Tests (% passed)</h2>
      <Bars rows={tests} max={100} unit="%" />
      <p className="note">{testSummary(r.tests)}</p>
      <h2>Coverage (logic layer)</h2>
      {c && (
        <Bars
          rows={[
            ['Lines', c.lines],
            ['Statements', c.statements],
            ['Functions', c.functions],
            ['Branches', c.branches],
          ]}
          max={100}
          unit="%"
          marker={COVERAGE_THRESHOLD}
        />
      )}
    </section>
  );
}

function Complexity({ c }: { c: QualityReport['complexity'] }) {
  return (
    <section>
      <h2>Cyclomatic complexity</h2>
      <Bars rows={Object.entries(c.buckets)} max={Math.max(...Object.values(c.buckets))} />
      <div className="table-wrap">
        <table className="skill-table">
          <thead>
            <tr>
              <th>Most complex functions</th>
              <th>File</th>
              <th>CC</th>
            </tr>
          </thead>
          <tbody>
            {c.top.map((f) => (
              <tr key={`${f.file}:${f.line}`}>
                <td>{f.name}</td>
                <td>
                  <code>
                    {f.file.replace('src/', '')}:{f.line}
                  </code>
                </td>
                <td>{f.complexity}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function Bundle({ b }: { b: NonNullable<QualityReport['bundle']> }) {
  return (
    <section>
      <h2>JavaScript bundle (gzip kB)</h2>
      <Bars rows={b.largest.map((c) => [c.name, c.gzipKb])} max={b.largest[0]?.gzipKb ?? 1} unit=" kB" />
      <p className="note">
        {b.chunks} chunks, {b.totalGzipKb} kB in total; the first visit downloads the main chunk ({b.mainGzipKb} kB) and one page.
      </p>
    </section>
  );
}

function Evolution({ e }: { e: QualityReport['evolution'] }) {
  return (
    <section>
      <h2>Evolution of the system</h2>
      <div className="table-wrap">
        <table className="skill-table">
          <thead>
            <tr>
              <th>Version</th>
              <th>Source files</th>
              <th>Lines</th>
              <th>Runtime packages</th>
              <th>Commits</th>
            </tr>
          </thead>
          <tbody>
            {e.versions.map((x) => (
              <tr key={x.ref}>
                <td>{x.ref === 'HEAD' ? 'now (v2)' : x.ref}</td>
                <td>{x.sourceFiles}</td>
                <td>{x.sourceLines.toLocaleString('en-IE')}</td>
                <td>{x.runtimeDependencies}</td>
                <td>{x.commits}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h2>Phase 2 commits by maintenance type</h2>
      <Bars rows={Object.entries(e.phase2CommitsByType)} max={Math.max(...Object.values(e.phase2CommitsByType))} />
    </section>
  );
}

export function QualityPanel() {
  const { status, data: r, error } = useQualityReport();
  if (!r) return <LoadState status={status} error={error} />;
  return (
    <div className="quality">
      <Headline r={r} />
      <p className="note">
        Measured by the CI/CD pipeline for commit <code>{r.commit}</code> on{' '}
        {new Date(r.generatedAt).toLocaleString('en-IE', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
        {r.runUrl && (
          <>
            {' · '}
            <a href={r.runUrl} target="_blank" rel="noopener">
              see the run
            </a>
          </>
        )}
        .
      </p>
      <div className="grid g2 start">
        <TestsAndCoverage r={r} />
        <Complexity c={r.complexity} />
      </div>
      <h2>Architecture conformance (reflexion model)</h2>
      <Conformance a={r.architecture} />
      <div className="grid g2 start">
        {r.bundle && <Bundle b={r.bundle} />}
        <Evolution e={r.evolution} />
      </div>
    </div>
  );
}
