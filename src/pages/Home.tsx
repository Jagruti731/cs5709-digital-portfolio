/**
 * @file Home page: who I am, key numbers, selected work, how I build software, and a contact call to action.
 * Content: profile.json, projects.json and changelog.json; the status strip reads quality.json from the pipeline (CR-33).
 * CR-41: "clean corporate" redesign. Home is for employers and clients; the assignment material
 * (lecturer feedback, peer review, iterations) lives on the Readme page, linked from the footer.
 */
import { Link } from 'react-router-dom';
import { LoadState } from '../components/LoadState';
import { Section } from '../components/Section';
import { SITE } from '../config/site';
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
            <p className="eyebrow">Tech Consultant · .NET · Azure · Agentic AI</p>
            <h1>
              {profile.name.split(' ')[0]} <span>{profile.name.split(' ').slice(1).join(' ')}</span>
            </h1>
            <p className="intro">{profile.intro}</p>
            <div className="btn-row">
              <Link className="btn" to="/knowledge">
                View my work
              </Link>
              <Link className="btn outline" to="/messages">
                Contact me
              </Link>
            </div>
          </div>
          {profile.photo && (
            <figure className="hero-photo">
              <img src={imagePath(profile.photo)} alt={profile.name} width={400} height={400} decoding="async" />
              <figcaption>
                <b>{profile.name}</b>
                <span>MSc Software Engineering, University of Limerick</span>
              </figcaption>
            </figure>
          )}
        </div>
        <div className="container">
          <div className="numbers">
            {profile.numbers.map((n) => (
              <div key={n.label}>
                <b>{n.value}</b>
                <span>{n.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Section kicker="Selected work" title="Systems I have built and led">
        <div className="grid g3">
          {featured.map((c) => (
            <article className="work-card" key={c.id}>
              <img src={imagePath(c.image)} alt={c.title} loading="lazy" decoding="async" width={1200} height={800} />
              <div className="body">
                <span className="kind">{c.kind}</span>
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
        <p className="center-link">
          <Link className="btn outline" to="/knowledge">
            All case studies
          </Link>
        </p>
      </Section>

      <Section kicker="How I build software" title="Every change tracked, typed and tested" alt>
        <EvolutionLog />
        <SiteStatus />
      </Section>

      <section className="cta-band">
        <div className="container">
          <div>
            <h2>Let's work together</h2>
            <p>Have a question about my work, or a role in mind? I would like to hear from you.</p>
          </div>
          <div className="btn-row">
            <a className="btn" href={SITE.linkedin} target="_blank" rel="noopener">
              Message me on LinkedIn
            </a>
            <Link className="btn outline" to="/about">
              About me
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
