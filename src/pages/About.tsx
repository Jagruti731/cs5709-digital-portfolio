/**
 * @file About page: my story, quick facts, what I do, work experience and interests. Content: profile.json and career.json.
 */
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/Section';
import { LoadState } from '../components/LoadState';
import { Timeline } from '../components/Timeline';
import { useContent } from '../hooks/useContent';

export default function About() {
  const profileFile = useContent('profile');
  const careerFile = useContent('career');
  const profile = profileFile.data;
  if (!profile || !careerFile.data) {
    const failed = profileFile.status === 'error' ? profileFile : careerFile;
    return <LoadState status={failed.status === 'error' ? 'error' : 'loading'} error={failed.error} retry={failed.retry} />;
  }
  const { experience } = careerFile.data;
  return (
    <>
      <PageHeader title="About me" crumb="About" intro="A bit about who I am, how I got here, and what I'm good at." />
      <Section>
        <div className="grid g2 start">
          <div className="prose">
            {profile.story.map((p) => (
              <p key={p.slice(0, 20)}>{p}</p>
            ))}
          </div>
          <div className="card">
            <h3>Quick facts</h3>
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
                    <a href={profile.linkedin}>{profile.linkedinLabel}</a>
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
      <Section title="Work experience">
        <Timeline items={experience} />
      </Section>
      <Section title="Outside work" alt>
        <div className="grid g2">
          {profile.interests.map((r) => (
            <Card key={r.title} title={r.title}>
              <p>{r.text}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
