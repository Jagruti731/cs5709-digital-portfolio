/**
 * @file CareerPath: six roles from intern to consultant, on a line that draws itself as you scroll (CR-43).
 */
import { useEffect, useRef } from 'react';
import { loadMotion, reducedMotion } from '../motion/gsap';

export function CareerPath({ path }: { path: [string, string][] }) {
  const fill = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = fill.current;
    if (!el || reducedMotion()) return;
    let kill = () => {};
    loadMotion().then(({ gsap }) => {
      const tween = gsap.from(el, {
        scaleX: 0,
        ease: 'none',
        scrollTrigger: { trigger: el.parentElement, start: 'top 80%', end: 'bottom 55%', scrub: true },
      });
      kill = () => tween.scrollTrigger?.kill();
    });
    return () => kill();
  }, []);
  return (
    <div className="career-path">
      <i className="fill" ref={fill} aria-hidden="true" />
      {path.map(([title, note]) => (
        <div className="career-step" key={title}>
          <b>{title}</b>
          <span>{note}</span>
        </div>
      ))}
    </div>
  );
}
