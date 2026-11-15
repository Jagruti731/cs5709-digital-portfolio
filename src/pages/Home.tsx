/**
 * @file Home page: editorial introduction, skills ticker, key numbers, selected work as a numbered index,
 * how I build software, and a contact call to action.
 * Content: profile.json, projects.json and changelog.json; the status line reads quality.json from the pipeline (CR-33).
 * CR-42: "Editorial" redesign chosen by the owner from three mockups. Home is for employers and clients;
 * the assignment material (lecturer feedback, peer review, iterations) lives on the Readme page.
 */
import { Link } from 'react-router-dom';
import { LoadState } from '../components/LoadState';
import { Section } from '../components/Section';
import { SITE } from '../config/site';
import { EvolutionLog } from '../features/evolution/EvolutionLog';
import { SiteStatus } from '../features/quality/SiteStatus';
import { useContent } from '../hooks/useContent';
import { imagePath } from '../lib/assets';

const SKILLS = ['.NET', 'Azure', 'Microservices', 'Document AI', 'Gemini', 'Team leadership', 'Presales', 'Angular', 'SQL Server'];

export default function Home() {
  const profileFile = useContent('profile');
  const projectsFile = useContent('projects');
  const profile = profileFile.data;
  if (!profile || !projectsFile.data) {
    const failed = profileFile.status === 'error' ? profileFile : projectsFile;
    return <LoadState status={failed.status === 'error' ? 'error' : 'loading'} error={failed.error} retry={failed.retry} />;
  }
  const featured = projectsFile.data.caseStudies.slice(0, 5);
  return (
    <>
      <section className="hero">
        <div className="container">
          <p className="eyebrow">Tech Consultant — .NET · Azure · Agentic AI — Limerick, Ireland</p>
          <h1>
            <span className="line">
              <span>I build the systems</span>
            </span>
            <span className="line">
              <span>
                behind <em>lending</em> &amp;
              </span>
            </span>
            <span className="line">
              <span>
                <em>finance.</em>
              </span>
            </span>
          </h1>
          <div className="hero-foot">
            <div>
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
                <img src={imagePath(profile.photo)} alt={profile.name} width={400} height={500} decoding="async" />
                <figcaption>{profile.name}</figcaption>
              </figure>
            )}
          </div>
        </div>
      </section>

      <div className="ticker" aria-label="Skills">
        <div className="ticker-track">
          {[0, 1].map((copy) => (
            <ul key={copy} aria-hidden={copy === 1}>
              {SKILLS.map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>

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

      <Section kicker="Selected work" title="Systems I have built and led">
        <ol className="work-index">
          {featured.map((c, i) => (
            <li key={c.id}>
              <Link to={`/knowledge?case=${c.id}`}>
                <span className="no">{String(i + 1).padStart(2, '0')}</span>
                <span className="title">{c.title}</span>
                <span className="kind">{c.kind}</span>
                <span className="arrow" aria-hidden="true">
                  ↗
                </span>
              </Link>
            </li>
          ))}
        </ol>
        <p className="center-link">
          <Link className="more" to="/knowledge">
            All {projectsFile.data.caseStudies.length} case studies →
          </Link>
        </p>
      </Section>

      <Section kicker="How I build software" title="Every change tracked, typed and tested" alt>
        <EvolutionLog />
        <SiteStatus />
      </Section>

      <section className="cta-band">
        <div className="container">
          <h2>
            Let’s <em>talk.</em>
          </h2>
          <p>Have a question about my work, or a role in mind? I would like to hear from you.</p>
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
