/**
 * @file Education page: qualifications timeline and certifications. Content: public/data/education.json.
 */
import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/Section';
import { LoadState } from '../components/LoadState';
import { Timeline } from '../components/Timeline';
import { useContent } from '../hooks/useContent';

export default function Education() {
  const { data, status, error, retry } = useContent('education');
  if (!data) return <LoadState status={status} error={error} retry={retry} />;
  const { education, certifications } = data;
  return (
    <>
      <PageHeader
        title="Education"
        crumb="Education"
        intro="From a diploma in Nashik to an MSc in Limerick, with AI and ML along the way."
      />
      <Section>
        <Timeline items={education} />
      </Section>
      <Section title="Certifications" alt>
        <div className="grid g2">
          {certifications.map((c) => (
            <Card key={c.title} title={c.title} tags={[c.text.replace('.', '')]} />
          ))}
        </div>
      </Section>
    </>
  );
}
