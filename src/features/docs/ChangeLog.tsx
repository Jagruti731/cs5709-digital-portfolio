/**
 * @file ChangeLog: every change request (CR-01 ...) with its maintenance type and commit.
 * Content: public/data/changelog.json. Filter by phase or by maintenance type (Lientz & Swanson, 1980).
 */
import { useState } from 'react';
import { LoadState } from '../../components/LoadState';
import { useContent } from '../../hooks/useContent';
import type { ChangeType } from '../../types/content';

const TYPES: ('all' | ChangeType)[] = ['all', 'corrective', 'adaptive', 'perfective', 'preventive'];

export function ChangeLog() {
  const { data, status, error, retry } = useContent('changelog');
  const [type, setType] = useState<'all' | ChangeType>('all');
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  if (!data) return <LoadState status={status} error={error} retry={retry} />;
  const shown = data.filter((c) => (type === 'all' || c.type === type) && (phase === 0 || c.phase === phase));

  return (
    <div>
      <div className="filters" role="group" aria-label="Filter changes by phase">
        {([0, 1, 2] as const).map((p) => (
          <button key={p} type="button" className="chip" aria-pressed={phase === p} onClick={() => setPhase(p)}>
            {p === 0 ? 'Both phases' : `Phase ${p}`}
          </button>
        ))}
      </div>
      <div className="filters" role="group" aria-label="Filter changes by maintenance type">
        {TYPES.map((t) => (
          <button key={t} type="button" className="chip" aria-pressed={type === t} onClick={() => setType(t)}>
            {t === 'all' ? 'All types' : t} (
            {data.filter((c) => (t === 'all' || c.type === t) && (phase === 0 || c.phase === phase)).length})
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table className="skill-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Change</th>
              <th>Type</th>
              <th>Closes</th>
              <th>Commit</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((c) => (
              <tr key={c.id}>
                <td>
                  <b>{c.id}</b>
                </td>
                <td>{c.change}</td>
                <td>
                  <span className={`pill ${c.type}`}>{c.type}</span>
                </td>
                <td>{c.closes}</td>
                <td>
                  <code>{c.commit}</code>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
