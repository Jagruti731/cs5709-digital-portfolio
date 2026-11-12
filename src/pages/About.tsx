/**
 * @file About page: short story, quick facts, what I do, experience and recognition.
 * Content: profile.json and career.json (from my LinkedIn profile, CR-30).
 */
import { Card } from '../components/Card';
import { LoadState } from '../components/LoadState';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/Section';
import { Timeline } from '../components/Timeline';
import { SITE } from '../config/site';
import { useContent } from '../hooks/useContent';

export default function About() {
  const profileFile = useContent('profile');
  const careerFile = useContent('career');
  const profile = profileFile.data;
  if (!profile || !careerFile.data) {
    const failed = profileFile.status === 'error' ? profileFile : careerFile;
    return <LoadState status={failed.status === 'error' ? 'error' : 'loading'} error={failed.error} retry={failed.retry} />;
  }
  return (
    <>
      <PageHeader title="About me" crumb="About" intro="Systems that scale, software that thinks." />
      <Section>
        <div className="grid g2 start">
          <div className="prose">
            {profile.story.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </div>
          <div className="card">
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
      <Section title="What I do" alt>
        <div className="grid g4">
          {profile.roles.map((r) => (
            <Card key={r.title} title={r.title}>
              <p>{r.text}</p>
            </Card>
          ))}
        </div>
      </Section>
      <Section title="Experience">
        <Timeline items={careerFile.data.experience} />
      </Section>
      <Section title="Recognition" alt>
        <div className="grid g4">
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
