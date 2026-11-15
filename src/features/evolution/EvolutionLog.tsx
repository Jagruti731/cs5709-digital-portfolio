/**
 * @file EvolutionLog: Home section "How I build software" (CR-40, CR-41).
 * Left: the four kinds of maintenance with their share of all change requests. Right: the engineering practices
 * every change goes through. The bars read changelog.json, so they grow with every change request.
 */
import { Link } from 'react-router-dom';
import { useContent } from '../../hooks/useContent';
import { countByType } from './summary';

const PRACTICES: [string, string][] = [
  ['Automated tests', 'Unit, API, browser and security-rule tests run on every push.'],
  ['CI/CD pipeline', 'Each commit is linted, type-checked, tested, built and deployed by GitHub Actions.'],
  ['Live quality report', 'The pipeline publishes test results, coverage and complexity for the exact version that is live.'],
  ['Architecture check', 'Imports are compared with the planned architecture, so drift shows up early.'],
];

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
      <ul className="practice" aria-label="How every change is checked">
        {PRACTICES.map(([title, text]) => (
          <li key={title}>
            <b>{title}</b>
            <span>{text}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
