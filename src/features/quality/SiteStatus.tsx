/**
 * @file SiteStatus: the "system status" panel on the Home hero (CR-33).
 *
 * A portfolio usually says "I care about quality"; this one shows it. The panel reads
 * quality.json, which the CI/CD pipeline writes for the exact commit that is live,
 * and says whether the shared feed is connected. The links lead to the evidence:
 * the quality report, the pipeline run and the Readme.
 */
import { Link } from 'react-router-dom';
import { cloudEnabled } from '../../services/cloud';
import { statusRows, useQualityReport } from './report';

export function SiteStatus() {
  const { data: r } = useQualityReport();
  return (
    <aside className="site-status" aria-label="Live status of this site">
      <p className="site-status-head">
        <span>system status</span>
        <span>{r ? `commit ${r.commit}` : 'local build'}</span>
      </p>
      <ul>
        {statusRows(r, cloudEnabled()).map((row) => (
          <li key={row.label}>
            <span className="k">{row.label}</span>
            <span className={`v${row.ok ? '' : ' warn'}`}>
              <i aria-hidden="true" className={`dot${row.ok ? '' : ' warn'}`} />
              {row.value}
            </span>
          </li>
        ))}
      </ul>
      <p className="site-status-foot">
        <Link to="/dashboard?tab=quality">Quality report</Link>
        {r?.runUrl && (
          <a href={r.runUrl} target="_blank" rel="noopener">
            Pipeline run
          </a>
        )}
        <Link to="/readme">How it is built</Link>
      </p>
    </aside>
  );
}
