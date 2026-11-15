/**
 * @file EvolutionLog: Home section that shows the software-evolution work behind this site (CR-40).
 * Left: the four kinds of maintenance with their share of all change requests. Right: the newest commits as a
 * commit rail. Both read changelog.json, so they grow with every change request.
 */
import { Link } from 'react-router-dom';
import { useContent } from '../../hooks/useContent';
import { countByType, latest } from './summary';

const LABEL = {
  corrective: 'fix what is broken',
  adaptive: 'adapt to a new environment',
  perfective: 'improve what works',
  preventive: 'reduce future cost',
} as const;

export function EvolutionLog() {
  const { data } = useContent('changelog');
  if (!data) return null;
  const shares = countByType(data);
  return (
    <div className="evo">
      <div className="evo-types" role="list" aria-label="Change requests by maintenance type">
        {shares.map((s, i) => (
          <div
            className={`evo-bar t-${s.type}`}
            role="listitem"
            key={s.type}
            style={{ ['--w' as string]: `${s.percent}%`, ['--i' as string]: i }}
          >
            <p>
              <b>{s.type}</b>
              <span>{LABEL[s.type]}</span>
            </p>
            <div className="evo-track" aria-hidden="true">
              <i />
            </div>
            <strong>
              {s.count}
              <small> · {s.percent}%</small>
            </strong>
          </div>
        ))}
        <p className="evo-note">
          {data.length} change requests since v1.0, each one with a type, a commit and the problem it closes.{' '}
          <Link to="/readme">Read the change log →</Link>
        </p>
      </div>
      <ol className="commit-rail" aria-label="Newest commits">
        {latest(data, 6).map((c, i) => (
          <li className={`t-${c.type}`} key={c.id} style={{ ['--i' as string]: i }}>
            <code>{c.id}</code>
            <span className="tag">{c.type}</span>
            <p>{c.change}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
