/**
 * @file Home page: one-line introduction, four key numbers and three featured projects.
 * Content: profile.json and projects.json. Kept short on purpose (CR-30): details live on About and Work.
 */
import { Link } from 'react-router-dom';
import { LoadState } from '../components/LoadState';
import { Section } from '../components/Section';
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
        <div className="container">
          <div>
            <p className="hello">Tech Consultant · MSc Software Engineering @ UL</p>
            <h1>{profile.name}</h1>
            <p className="intro">{profile.intro}</p>
            <ul className="quick-facts">
              {profile.facts.map((f) => (
                <li key={f.label}>
                  <b>{f.label}:</b> {f.value}
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

      <Section title="Selected work">
        <div className="grid g3">
          {featured.map((c) => (
            <article className="work-card" key={c.id}>
              <img src={imagePath(c.image)} alt={c.title} loading="lazy" decoding="async" width={1200} height={800} />
              <div className="body">
                <span className="kind">{c.kind}</span>
                <h3>{c.title}</h3>
                <p>{c.summary}</p>
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
