/**
 * @file Professional Knowledge ("Work") page: case studies with a technology filter and text search.
 * Content: public/data/projects.json. Deep link: /knowledge?case=<id> scrolls to that case study.
 * Phase 2 (CR-20, user story US2): case studies can be filtered by technology and by text;
 * GSAP Flip moves the cards smoothly to their new places.
 * CR-33: the "Other projects" and "Skills" lists were removed; they repeated the case studies,
 * and each case study already lists its tools.
 * CR-34: seven case studies, each with my role and, where I have them, real results.
 */
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/Section';
import { LoadState } from '../components/LoadState';
import { useFlip } from '../features/motion/useFlip';
import { ALL, filterCases, technologies } from '../features/projects/filterProjects';
import { useContent } from '../hooks/useContent';
import { imagePath } from '../lib/assets';

export default function Knowledge() {
  const { data, status, error, retry } = useContent('projects');
  const [params] = useSearchParams();
  const target = params.get('case');
  const [tech, setTech] = useState(ALL);
  const [text, setText] = useState('');
  const flip = useFlip<HTMLDivElement>('.case');
  // The ten most used technologies keep the filter row short.
  const techs = useMemo(() => technologies(data?.caseStudies ?? []).slice(0, 10), [data]);

  // Deep link: /knowledge?case=ocr scrolls to that case study.
  useEffect(() => {
    if (!target) return;
    const timer = window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' }), 60);
    return () => window.clearTimeout(timer);
  }, [target, data]);

  if (!data) return <LoadState status={status} error={error} retry={retry} />;
  const caseStudies = filterCases(data.caseStudies, tech, text);

  return (
    <>
      <PageHeader
        title="Professional knowledge"
        crumb="Professional Knowledge"
        intro="Seven systems I have built and led: the problem, my role, what I did, the results and the tools."
      />
      <Section kicker="case studies" title="Filter by technology or search">
        <div className="filter-bar">
          <div className="filters" role="group" aria-label="Filter case studies by technology">
            {[ALL, ...techs].map((t) => (
              <button key={t} type="button" className="chip" aria-pressed={tech === t} onClick={() => flip.run(() => setTech(t))}>
                {t}
              </button>
            ))}
          </div>
          <label className="filter-search">
            <span>Search case studies</span>
            <input type="search" value={text} onChange={(e) => flip.run(() => setText(e.target.value))} placeholder="e.g. Gemini, bank" />
          </label>
        </div>
        <p className="note" aria-live="polite">
          {caseStudies.length} of {data.caseStudies.length} case studies shown
          {tech !== ALL ? ` for ${tech}` : ''}
          {text.trim() ? ` matching “${text.trim()}”` : ''}.
        </p>
        <div ref={flip.ref}>
          {caseStudies.map((c) => (
            <article className="case" id={c.id} key={c.id}>
              <img src={imagePath(c.image)} alt={c.title} loading="lazy" decoding="async" width={1200} height={800} />
              <div>
                <h3 className="case-title">{c.title}</h3>
                <p className="meta">{c.meta}</p>
                {c.impact && (
                  <ul className="impact" aria-label="Results">
                    {c.impact.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
                  </ul>
                )}
                <dl>
                  <dt>The problem</dt>
                  <dd>{c.problem}</dd>
                  {c.role && (
                    <>
                      <dt>My role</dt>
                      <dd>{c.role}</dd>
                    </>
                  )}
                  <dt>What I did</dt>
                  <dd>
                    <ul>
                      {c.did.map((d) => (
                        <li key={d}>{d}</li>
                      ))}
                    </ul>
                  </dd>
                  <dt>Tools</dt>
                  <dd>
                    <ul className="tags">
                      {c.tools.map((t) => (
                        <li key={t}>{t}</li>
                      ))}
                    </ul>
                  </dd>
                </dl>
              </div>
            </article>
          ))}
        </div>
      </Section>
    </>
  );
}
