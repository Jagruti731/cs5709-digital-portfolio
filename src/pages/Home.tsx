/**
 * @file Home page: introduction with my photo, a live system status strip, four key numbers and three featured projects.
 * Content: profile.json and projects.json; the status strip reads quality.json from the pipeline (CR-33).
 * CR-36: "Nashik to Limerick" design: route line, serif name, arched portrait.
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
          <div className="hero-text">
            <p className="route" aria-label="From Nashik, India to Limerick, Ireland">
              <span>Nashik</span>
              <i aria-hidden="true" />
              <span>Limerick</span>
            </p>
            <h1>
              {profile.name.split(' ')[0]} <em>{profile.name.split(' ').slice(1).join(' ')}</em>
            </h1>
            <p className="hello">Tech Consultant · .NET · Azure · Agentic AI · MSc @ UL</p>
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
          {profile.photo && (
            <figure className="hero-portrait">
              <img src={imagePath(profile.photo)} alt={profile.name} width={400} height={400} decoding="async" />
              <figcaption>MSc Software Engineering · University of Limerick</figcaption>
            </figure>
          )}
        </div>
      </section>
      <div className="status-band">
        <div className="container">
          <SiteStatus />
        </div>
      </div>

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
