/**
 * @file Home page: introduction with my photo, a live system status strip, four key numbers and three featured projects.
 * Content: profile.json and projects.json; the status strip reads quality.json from the pipeline (CR-33).
 * CR-40: redesigned around the CS5709 assignments: version log, three assignments, evolution numbers.
 */
import { Link } from 'react-router-dom';
import { LoadState } from '../components/LoadState';
import { Section } from '../components/Section';
import { Assignments, GitLog } from '../features/evolution/Parts';
import { EvolutionLog } from '../features/evolution/EvolutionLog';
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
            <p className="route" aria-label="CS5709 Software Engineering Evolution, University of Limerick">
              <span>CS5709</span>
              <i aria-hidden="true" />
              <span>evolution</span>
            </p>
            <h1>
              <span className="line">Software is never finished.</span>
              <span className="line">
                It <em>evolves.</em>
              </span>
            </h1>
            <p className="hello">{profile.name} · Tech Consultant · .NET · Azure · Agentic AI · MSc @ UL</p>
            <p className="intro">
              This portfolio is my evolution project. I took my Phase 1 site, listened to the lecturer and to my peer reviewer, and changed
              it one change request at a time, with a type, a commit and a test for each.
            </p>
            <div className="btn-row">
              <Link className="btn" to="/readme">
                See the evolution
              </Link>
              <Link className="btn outline" to="/knowledge">
                See my work
              </Link>
            </div>
          </div>
          <GitLog name={profile.name} photo={profile.photo} />
        </div>
      </section>
      <div className="status-band">
        <div className="container">
          <SiteStatus />
        </div>
      </div>

      <Section kicker="01 / the three assignments" title="Every assignment became a change on this site">
        <Assignments />
      </Section>

      <Section kicker="02 / evolution in numbers" title="Four kinds of maintenance, one change log" alt>
        <EvolutionLog />
      </Section>

      <Section>
        <div className="numbers">
          {profile.numbers.map((n) => (
            <div key={n.label}>
              <b>{n.value}</b>
              <span>{n.label}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section kicker="03 / selected work" title="Systems I have built and led">
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
