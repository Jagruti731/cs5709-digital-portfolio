/**
 * @file Home page (CR-43): a scanned-profile hero, skills ticker, key numbers, how I am ready for
 * agentic work, every system I have built as a live automated run, my tech stack as a radar,
 * my career path and a contact band. Content: profile.json and showcase.json.
 * Home speaks to employers and clients; the assignment material (lecturer feedback, peer review,
 * iterations) lives on the Readme page, linked from the footer.
 */
import { LoadState } from '../components/LoadState';
import { Section } from '../components/Section';
import { SITE } from '../config/site';
import { CareerPath } from '../features/showcase/CareerPath';
import { Numbers } from '../features/showcase/Numbers';
import { Pillars } from '../features/showcase/Pillars';
import { ScanHero } from '../features/showcase/ScanHero';
import { SkillTicker } from '../features/showcase/SkillTicker';
import { SystemsPlayer } from '../features/showcase/SystemsPlayer';
import { TechRadar } from '../features/showcase/TechRadar';
import { SiteStatus } from '../features/quality/SiteStatus';
import { useContent } from '../hooks/useContent';

export default function Home() {
  const profileFile = useContent('profile');
  const showcaseFile = useContent('showcase');
  const profile = profileFile.data;
  const show = showcaseFile.data;
  if (!profile || !show) {
    const failed = profileFile.status === 'error' ? profileFile : showcaseFile;
    return <LoadState status={failed.status === 'error' ? 'error' : 'loading'} error={failed.error} retry={failed.retry} />;
  }
  return (
    <>
      <ScanHero hero={show.hero} name={profile.name} photo={profile.photo} />
      <SkillTicker skills={show.skills} />
      <Section>
        <Numbers numbers={show.numbers} />
      </Section>
      <Section id="agentic" kicker="Ready for agentic work" title="AI in the product. AI in the workflow. A person in the loop.">
        <Pillars pillars={show.pillars} />
      </Section>
      <section className="section band" id="systems">
        <div className="container">
          <div className="section-title split">
            <h2>
              {show.systems.length} systems.
              <br />
              Watch them run.
            </h2>
            <p>Every project I have built, as a live run. Pick one, or let them play.</p>
          </div>
          <SystemsPlayer systems={show.systems} />
          <SiteStatus />
        </div>
      </section>
      <Section kicker="Tech stack" title="My stack, mapped for what’s next." id="stack" alt>
        <TechRadar radar={show.radar} />
      </Section>
      <Section kicker="Career" title="Intern to consultant. Six roles, one company." intro="Then Nashik to Limerick for the MSc.">
        <CareerPath path={show.path} />
      </Section>
      <section className="cta-band">
        <div className="container">
          <p className="kicker">Contact</p>
          <h2>
            Let’s build <em>what’s next.</em>
          </h2>
          <p>Have a question about my work, or a role in mind? The quickest way to reach me is LinkedIn.</p>
          <a className="btn magnetic" href={SITE.linkedin} target="_blank" rel="noopener">
            Message me on LinkedIn ↗
          </a>
        </div>
      </section>
    </>
  );
}
