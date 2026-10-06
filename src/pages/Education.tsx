import { Card } from '../components/Card';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/Section';
import { Timeline } from '../components/Timeline';
import { certifications, education } from '../data/education';

export default function Education() {
  return (
    <>
      <PageHeader title="Education" crumb="Education" intro="From a diploma in Nashik to an MSc in Limerick." />
      <Section>
        <Timeline items={education} />
      </Section>
      <Section title="Certifications I'm working on" alt>
        <div className="grid g2">
          {certifications.map((c) => (
            <Card key={c.title} title={c.title} tags={['In progress']}>
              <p>{c.text}</p>
            </Card>
          ))}
        </div>
      </Section>
    </>
  );
}
