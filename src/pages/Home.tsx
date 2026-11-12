/**
 * @file Home page: introduction, key numbers, three featured projects, career path and other work.
 * Content: profile.json, projects.json and career.json.
 */
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { LoadState } from '../components/LoadState';
import { Section } from '../components/Section';
import { useCountUp } from '../features/motion/useCountUp';
import { useContent } from '../hooks/useContent';
import { imagePath } from '../lib/assets';

export default function Home() {
  const profileFile = useContent('profile');
  const projectsFile = useContent('projects');
  const careerFile = useContent('career');
  const profile = profileFile.data;
  const numbersRef = useRef<HTMLDivElement>(null);
  useCountUp(numbersRef, Boolean(profile && projectsFile.data && careerFile.data));
  if (!profile || !projectsFile.data || !careerFile.data) {
    const failed = [profileFile, projectsFile, careerFile].find((f) => f.status === 'error');
    return <LoadState status={failed ? 'error' : 'loading'} error={failed?.error} retry={failed?.retry} />;
  }
  const featured = projectsFile.data.caseStudies.slice(0, 3);
  const { careerPath } = careerFile.data;
  const { extras } = profile;
  return (
    <>
      <section className="hero">
        <div className="container">
          <div>
            <p className="hello">Software engineer and MSc student</p>
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
              <Link className="btn outline" to="/about">
                About me
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Section alt>
        <div className="numbers" ref={numbersRef}>
          {profile.numbers.map((n) => (
            <div key={n.label}>
              <b data-count={n.value}>{n.value}</b>
              <span>{n.label}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        title="What I have worked on"
        intro="Three projects that show the kind of work I do. The Professional Knowledge page has the full list."
      >
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

      <Section title="My career so far" alt>
        <ol className="path">
          {careerPath.map((step, i) => (
            <li key={step.when} className={i === careerPath.length - 1 ? 'now' : undefined}>
              <time>{step.when}</time>
              <b>{step.title}</b>
              <span>{step.text}</span>
            </li>
          ))}
        </ol>
      </Section>

      <Section title="Other things I have done">
        <ul className="extras">
          {extras.map((x) => (
            <li key={x.code}>
              <span className="ic" aria-hidden="true">
                {x.code}
              </span>
              <div>
                <b>{x.title}</b>
                <span>{x.text}</span>
              </div>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
