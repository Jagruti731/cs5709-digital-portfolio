/**
 * @file Requirements: personas, scenarios, user stories and the traced feature list (CR-15, CR-17).
 * Content: public/data/requirements.json. The feature table can be filtered by phase and status.
 */
import { useState } from 'react';
import { Card } from '../../components/Card';
import { LoadState } from '../../components/LoadState';
import { useContent } from '../../hooks/useContent';
import type { Feature } from '../../types/content';

const PHASES = [
  { value: 0, label: 'All' },
  { value: 1, label: 'Phase 1' },
  { value: 2, label: 'Phase 2' },
  { value: 3, label: 'Future' },
] as const;

const statusLabel: Record<Feature['status'], string> = { done: 'Done', partial: 'Partly done', planned: 'Planned' };

export function Requirements() {
  const { data, status, error, retry } = useContent('requirements');
  const [phase, setPhase] = useState<number>(0);
  if (!data) return <LoadState status={status} error={error} retry={retry} />;
  const { personas, stories, features } = data;
  const shown = features.filter((f) => phase === 0 || f.phase === phase);
  const storiesFor = (id: string) => stories.filter((s) => s.features.includes(id)).map((s) => s.id);

  return (
    <div className="requirements">
      <h2>Personas and scenarios</h2>
      <p className="note">Requirements discovery for Phase 2 starts from three people who use the site, not from the brief alone.</p>
      <div className="grid g3">
        {personas.map((p) => (
          <Card key={p.id} title={`${p.id} · ${p.name}`}>
            <p className="meta">{p.role}</p>
            <p>
              <b>Goal:</b> {p.goal}
            </p>
            <p>
              <b>Frustration:</b> {p.frustration}
            </p>
            <p>
              <b>Scenario:</b> {p.scenario}
            </p>
          </Card>
        ))}
      </div>

      <h2>User stories</h2>
      <div className="table-wrap">
        <table className="skill-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Persona</th>
              <th>Story</th>
              <th>Features</th>
            </tr>
          </thead>
          <tbody>
            {stories.map((s) => (
              <tr key={s.id}>
                <td>
                  <b>{s.id}</b>
                </td>
                <td>{s.persona}</td>
                <td>{s.story}</td>
                <td>{s.features.join(', ')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2>Features, grouped by phase</h2>
      <div className="filters" role="group" aria-label="Filter features by phase">
        {PHASES.map((p) => (
          <button key={p.value} type="button" className="chip" aria-pressed={phase === p.value} onClick={() => setPhase(p.value)}>
            {p.label} ({p.value === 0 ? features.length : features.filter((f) => f.phase === p.value).length})
          </button>
        ))}
      </div>
      <div className="table-wrap">
        <table className="skill-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Feature</th>
              <th>Group</th>
              <th>Phase</th>
              <th>Status</th>
              <th>Stories</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((f) => (
              <tr key={f.id}>
                <td>
                  <b>{f.id}</b>
                </td>
                <td>{f.name}</td>
                <td>{f.group}</td>
                <td>{f.phase === 3 ? 'Future' : f.phase}</td>
                <td>
                  <span className={`status ${f.status}`}>{statusLabel[f.status]}</span>
                </td>
                <td>{storiesFor(f.id).join(', ') || '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
