/**
 * @file Dashboard page: live GitHub activity and the code quality report (CR-22, CR-24; innovation).
 * Two tabs, so the menu stays short. The tab is kept in the URL (/dashboard?tab=quality).
 */
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { GitHubPanel } from '../features/github/GitHubPanel';

type Tab = 'github';
const TABS: { id: Tab; label: string }[] = [{ id: 'github', label: 'GitHub (live)' }];

export default function Dashboard() {
  const [params, setParams] = useSearchParams();
  const tab: Tab = TABS.some((t) => t.id === params.get('tab')) ? (params.get('tab') as Tab) : 'github';
  return (
    <>
      <PageHeader
        title="Dashboard"
        crumb="Dashboard"
        intro="Live activity from GitHub: my repositories, the pipeline that tests and deploys this site, and its latest commits."
      />
      <div className="container section">
        <div className="tabs" role="tablist" aria-label="Dashboard sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              type="button"
              aria-selected={tab === t.id}
              onClick={() => setParams({ tab: t.id }, { replace: true })}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'github' && <GitHubPanel />}
      </div>
    </>
  );
}
