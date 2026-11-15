/**
 * @file ScanHero: the Home hero (CR-43). My profile is read like a scanned document, the way the
 * Document AI systems I build read bank statements: a beam sweeps the card, boxes snap round each
 * field with a confidence score, the extracted JSON appears and an EXTRACTED stamp lands.
 * The greeting cycles Hello / नमस्कार (Marathi, Nashik) / Dia duit (Irish, Limerick).
 * With reduced motion everything is shown at rest and nothing moves.
 */
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { SITE } from '../../config/site';
import { imagePath } from '../../lib/assets';
import type { Showcase } from '../../types/content';
import { loadMotion, reducedMotion } from '../motion/gsap';
import { Headline } from './Headline';

interface Props {
  hero: Showcase['hero'];
  name: string;
  photo?: string;
}

export function ScanHero({ hero, name, photo }: Props) {
  const root = useRef<HTMLElement>(null);
  const [word, setWord] = useState(0);
  const [pct, setPct] = useState(100);

  useEffect(() => {
    if (reducedMotion()) return;
    const timer = window.setInterval(() => setWord((w) => (w + 1) % hero.greetings.length), 2200);
    return () => window.clearInterval(timer);
  }, [hero.greetings.length]);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    let ctx: { revert: () => void } | undefined;
    loadMotion().then(({ gsap }) => {
      ctx = gsap.context(() => {
        gsap.from('.hero h1 .ln > span', { yPercent: 110, duration: 1.2, stagger: 0.09, ease: 'expo.out' });
        gsap.from('.hero .lead, .hero .ctas, .greet', { y: 24, opacity: 0, duration: 1, stagger: 0.08, delay: 0.35, ease: 'expo.out' });
        gsap.fromTo('.hero h1 em', { '--hls': 0 }, { '--hls': 1, duration: 0.9, delay: 0.95, ease: 'power3.inOut' });
        const counter = { v: 0 };
        gsap
          .timeline({ delay: 0.6 })
          .set('.box', { opacity: 0, scale: 1.25 })
          .set('.stamp', { opacity: 0, scale: 2.2 })
          .set('.json', { clipPath: 'inset(0 0 100% 0)' })
          .to('.beam', { opacity: 1, duration: 0.2 })
          .to('.beam', { top: '100%', duration: 1.6, ease: 'power1.inOut' }, '<')
          .to(counter, { v: 100, duration: 1.6, ease: 'power1.inOut', onUpdate: () => setPct(Math.round(counter.v)) }, '<')
          .to('.box', { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2)', stagger: 0.32 }, '<0.2')
          .to('.beam', { opacity: 0, duration: 0.3 })
          .to('.json', { clipPath: 'inset(0 0 0% 0)', duration: 1.1, ease: 'steps(7)' })
          .to('.stamp', { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(3)' });
      }, el);
    });
    return () => ctx?.revert();
  }, []);

  const json = hero.fields.map(([k, v]) => `  "${k.replace(' ', '_')}": "${v}"`).join(',\n');
  return (
    <section className="hero" ref={root}>
      <div className="container hero-grid">
        <div className="hero-text">
          <p className="greet">
            <span>Nashik → Limerick</span>
            <span className="word" aria-live="off">
              {hero.greetings.map((g, i) => (
                <span
                  key={g}
                  style={{ transform: `translateY(${(i - word) * 110}%)`, opacity: i === word ? 1 : 0 }}
                  aria-hidden={i !== word}
                >
                  {g}
                </span>
              ))}
            </span>
          </p>
          <h1 aria-label={hero.lines.join(' ').replace(/\*/g, '')}>
            {hero.lines.map((line) => (
              <span className="ln" key={line} aria-hidden="true">
                <span>
                  <Headline text={line} />
                </span>
              </span>
            ))}
          </h1>
          <p className="lead">{hero.lead}</p>
          <div className="ctas btn-row">
            <Link className="btn magnetic" to="/knowledge">
              See the work ↓
            </Link>
            <a className="btn outline magnetic" href={SITE.linkedin} target="_blank" rel="noopener">
              LinkedIn ↗
            </a>
          </div>
        </div>
        <figure className="scan" aria-label="My profile, read like a scanned document">
          <div className="scan-top">
            <span className="mono-label">profile.pdf</span>
            <span className="mono-label">scan {pct}%</span>
          </div>
          <div className="doc">
            {photo && <img src={imagePath(photo)} alt={name} width={112} height={136} decoding="async" />}
            <div>
              {hero.fields.map(([k, v, c]) => (
                <span className="scan-field" key={k}>
                  <span className="k">{k}</span>
                  <span className="v">{v}</span>
                  <span className="box" aria-hidden="true">
                    <em>{c}</em>
                  </span>
                </span>
              ))}
            </div>
            <div className="beam" aria-hidden="true" />
          </div>
          <pre className="json">{`{\n${json}\n}`}</pre>
          <span className="stamp" aria-hidden="true">
            EXTRACTED
          </span>
        </figure>
      </div>
    </section>
  );
}
