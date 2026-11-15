/**
 * @file About page: short story, quick facts, experience, education, certifications and recognition.
 * Content: profile.json, career.json and education.json (from my LinkedIn profile, CR-30).
 * CR-33: the Education page was merged in here; /education and ?section=education scroll to it.
 * CR-34: photo, and "How I work" in three tracks (engineering, leadership and presales, AI adoption).
 */
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Card } from '../components/Card';
import { LoadState } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/Section';
import { Timeline } from '../components/Timeline';
import { SITE } from '../config/site';
import { useContent } from '../hooks/useContent';
import { imagePath } from '../lib/assets';

export default function About() {
  const profileFile = useContent('profile');
  const careerFile = useContent('career');
  const educationFile = useContent('education');
  const [params] = useSearchParams();
  const section = params.get('section');
  const profile = profileFile.data;
  const ready = Boolean(profile && careerFile.data && educationFile.data);

  // Deep link: /about?section=education (old /education links land here too).
  useEffect(() => {
    if (!section || !ready) return;
    const timer = window.setTimeout(() => document.getElementById(section)?.scrollIntoView({ behavior: 'smooth' }), 60);
    return () => window.clearTimeout(timer);
  }, [section, ready]);

  if (!profile || !careerFile.data || !educationFile.data) {
    const failed = [profileFile, careerFile, educationFile].find((f) => f.status === 'error');
    return <LoadState status={failed ? 'error' : 'loading'} error={failed?.error} retry={failed?.retry} />;
  }
  const { education, certifications } = educationFile.data;
  return (
    <>
      <PageHeader title="About me" crumb="About" intro="Six years from intern to consultant, now an MSc student in Limerick." />
      <Section>
        <div className="grid g2 start">
          <div className="prose lead">
            {profile.story.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </div>
          <div className="card facts-card">
            {profile.photo && (
              <img className="portrait" src={imagePath(profile.photo)} alt={profile.name} width={400} height={400} decoding="async" />
            )}
            <table className="facts-table">
              <tbody>
                {profile.quickFacts.map(([label, value]) => (
                  <tr key={label}>
                    <th scope="row">{label}</th>
                    <td>{value}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row">LinkedIn</th>
                  <td>
                    <a href={SITE.linkedin}>{profile.linkedinLabel}</a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Section>
      <Section kicker="01 / how I work" title="Engineering, leadership and AI adoption" alt>
        <div className="tracks">
          {profile.tracks.map((t, i) => (
            <article className="track" key={t.title}>
              <span className="track-no">{String(i + 1).padStart(2, '0')}</span>
              <h3>{t.title}</h3>
              <ul>
                {t.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </Section>
      <Section kicker="02 / experience" title="Experience">
        <Timeline items={careerFile.data.experience} />
      </Section>
      <Section kicker="03 / education" title="Education" id="education" alt>
        <Timeline items={education} />
        <h3 className="sub-head">Certifications</h3>
        <ul className="cert-list">
          {certifications.map((c) => (
            <li key={c.title}>
              <b>{c.title}</b>
              <span>{c.text}</span>
            </li>
          ))}
        </ul>
      </Section>
      <Section kicker="04 / recognition" title="Recognition and talks">
        <div className="grid g3">
          {profile.extras.map((x) => (
            <Card key={x.code} title={x.title}>
              <p>{x.text}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
