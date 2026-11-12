/**
 * @file Types and loader for quality.json, the report the pipeline writes (CR-24).
 * The report is produced by tools/quality-report.mjs in the CI/CD build job and deployed with the site.
 */
import { useEffect, useState } from 'react';
import type { LoadStatus } from '../../types/content';

export interface PassCount {
  passed: number;
  total: number;
}

export interface QualityReport {
  generatedAt: string;
  commit: string;
  runUrl: string | null;
  tests: { unit: (PassCount & { files: number }) | null; api: PassCount | null; e2e: PassCount | null };
  coverage: { lines: number; statements: number; functions: number; branches: number } | null;
  lint: { errors: number; warnings: number; filesChecked: number };
  complexity: {
    functions: number;
    average: number;
    max: number;
    buckets: Record<string, number>;
    top: { name: string; file: string; line: number; complexity: number }[];
  };
  source: {
    files: number;
    lines: number;
    commentShare: number;
    filesWithHeader: number;
    headerShare: number;
    testFiles: number;
    linesByFolder: [string, number][];
  };
  bundle: {
    chunks: number;
    totalKb: number;
    totalGzipKb: number;
    mainGzipKb: number;
    largest: { name: string; kb: number; gzipKb: number }[];
  } | null;
  architecture: {
    parts: string[];
    imports: number;
    convergences: { from: string; to: string; imports: number }[];
    divergences: { from: string; to: string; imports: number }[];
    absences: { from: string; to: string }[];
  };
  evolution: {
    versions: { ref: string; sourceFiles: number; sourceLines: number; runtimeDependencies: number; commits: number }[];
    phase2CommitsByType: Record<string, number>;
  };
}

/** Loads ./quality.json once. A missing file is normal in development (only the pipeline writes it). */
export function useQualityReport() {
  const [state, setState] = useState<{ status: LoadStatus; data?: QualityReport; error?: string }>({ status: 'loading' });
  useEffect(() => {
    let live = true;
    fetch('./quality.json')
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`quality.json: the server returned ${res.status}`))))
      .then((data: QualityReport) => live && setState({ status: 'ready', data }))
      .catch(
        () =>
          live &&
          setState({
            status: 'error',
            error: 'The quality report is created by the CI/CD pipeline. Run npm run quality after a build to see it locally.',
          }),
      );
    return () => {
      live = false;
    };
  }, []);
  return state;
}

/** "passed / total" as a percentage, or null. */
export const passRate = (p: PassCount | null): number | null => (p && p.total ? Math.round((p.passed / p.total) * 100) : null);
