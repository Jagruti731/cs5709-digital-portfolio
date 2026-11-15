/**
 * @file Home page: introduction with a live system status panel, four key numbers and three featured projects.
 * Content: profile.json and projects.json; the status panel reads quality.json from the pipeline (CR-33).
 */
import { Link } from 'react-router-dom';
import { LoadState } from '../components/LoadState';
import { Section } from '../components/Section';
import { SiteStatus } from '../features/quality/SiteStatus';
import { useContent } from '../hooks/useContent';
import { imagePath } from '../lib/assets';

export default function Home() {
  const profileFile = useContent('profile');
  const projectsFile = useContent('projects');
  const profile = profileFile.data;
  if (!profile || !projectsFile.data) {
    const failed = profileFile.status === 'error' ? profileFile : projectsFile;
    return <LoadState status={failed.status === 'error' ? 'error' : 'loading'} error={failed.error} retry={failed.retry} />;
  }
  const featured = projectsFile.data.caseStudies.slice(0, 3);
  return (
    <>
      <section className="hero">
        <div className="container hero-grid">
          <div>
            <p className="hello">Consultant · .NET + Azure + AI · MSc @ UL</p>
            <h1>
              {profile.name.split(' ')[0]}
              <br />
              <span>{profile.name.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="intro">{profile.intro}</p>
            <ul className="quick-facts">
              {profile.facts.map((f) => (
                <li key={f.label}>
                  <b>{f.label}</b> {f.value}
                </li>
              ))}
            </ul>
            <div className="btn-row">
              <Link className="btn" to="/knowledge">
                See my work
              </Link>
              <Link className="btn outline" to="/messages">
                Contact me
              </Link>
            </div>
          </div>
          <SiteStatus />
        </div>
      </section>

      <Section alt>
        <div className="numbers">
          {profile.numbers.map((n) => (
            <div key={n.label}>
              <b>{n.value}</b>
              <span>{n.label}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section kicker="01 / selected work" title="Systems I have built and led">
        <div className="grid g3">
          {featured.map((c, i) => (
            <article className="work-card" key={c.id}>
              <img src={imagePath(c.image)} alt={c.title} loading="lazy" decoding="async" width={1200} height={800} />
              <div className="body">
                <span className="kind">
                  {String(i + 1).padStart(2, '0')} · {c.kind}
                </span>
                <h3>{c.title}</h3>
                <p>{c.summary}</p>
                <ul className="tags">
                  {c.tools.slice(0, 3).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
                <Link className="more" to={`/knowledge?case=${c.id}`}>
                  Read the case study →
                </Link>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
