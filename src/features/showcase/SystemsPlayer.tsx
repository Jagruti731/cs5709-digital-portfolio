/**
 * @file SystemsPlayer: every system I have built, shown as a live automated run (CR-43).
 *
 * The list on the left picks a system. On the right, a document (the yellow packet) moves through
 * the steps, each step lights up, and the run log writes a line per step. Agent steps and human
 * steps are labelled, because a person stays in the loop. When a run ends the next system plays.
 * Playback starts only when the player is on screen. With reduced motion every step and log line
 * is shown at rest and the list simply switches systems.
 */
import { useEffect, useRef, useState } from 'react';
import type { ShowcaseSystem } from '../../types/content';
import { loadMotion, reducedMotion } from '../motion/gsap';
import { Headline } from './Headline';
import { useRun } from './useRun';

export function SystemsPlayer({ systems }: { systems: ShowcaseSystem[] }) {
  const [cur, setCur] = useState(0);
  const [onScreen, setOnScreen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const s = systems[cur];
  const next = () => setCur((c) => (c + 1) % systems.length);
  const progress = useRun(root, s, onScreen, next);

  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    let kill = () => {};
    loadMotion().then(({ ScrollTrigger }) => {
      const st = ScrollTrigger.create({ trigger: el, start: 'top 80%', end: 'bottom top', onToggle: (self) => setOnScreen(self.isActive) });
      kill = () => st.kill();
    });
    return () => kill();
  }, []);

  return (
    <div className="sys-player" ref={root}>
      <div className="sys-tabs" role="tablist" aria-label="Systems">
        {systems.map((x, i) => (
          <button key={x.id} className="sys-tab" role="tab" type="button" aria-selected={i === cur} onClick={() => setCur(i)}>
            <span className="no">{String(i + 1).padStart(2, '0')}</span>
            <b>{x.name}</b>
            <small>{x.kind.split(' · ')[0]}</small>
            <i className="sys-bar" style={{ transform: `scaleX(${i === cur ? progress : 0})` }} />
          </button>
        ))}
      </div>
      <div className="stage" role="tabpanel" aria-label={s.name}>
        <div className="stage-top" key={s.id}>
          <span className="mono-label">{s.kind}</span>
          <p className="impact-big">
            <Headline text={s.headline} />
          </p>
        </div>
        <div className="pipe" style={{ ['--n' as string]: s.steps.length }}>
          <svg className="wires" aria-hidden="true" />
          {s.steps.map(([icon, title, note, actor], j) => (
            <div className={`node${actor === 'human' ? ' human' : ''}`} key={s.id + title}>
              <span className="ico" aria-hidden="true">
                {icon}
              </span>
              <span className="n">
                {String(j + 1).padStart(2, '0')}
                {actor === 'agent' ? ' · agent' : ''}
              </span>
              <b>{title}</b>
              <span>{note}</span>
            </div>
          ))}
          <i className="packet" aria-hidden="true" />
        </div>
        <div className="log">
          <div className="log-top">
            <i />
            <i />
            <i />
            <span>{s.id}.log</span>
            <span className="lt-r">example run</span>
          </div>
          <ol>
            {s.log.map((line, j) => (
              <li key={s.id + line}>
                <span className="t">00:0{j}</span>{' '}
                <span className={j === s.log.length - 1 ? 'g' : 'a'}>
                  {(s.steps[j] ?? s.steps[s.steps.length - 1])[1].toLowerCase().padEnd(16).slice(0, 16)}
                </span>{' '}
                {line}
              </li>
            ))}
          </ol>
        </div>
        <ul className="tools">
          {s.tools.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
