/**
 * @file Numbers: key figures that count up when they scroll into view (CR-43). The final value is in
 * the page from the start, so readers, search and reduced-motion visitors always see the real number.
 */
import { useEffect, useRef } from 'react';
import type { Showcase } from '../../types/content';
import { loadMotion, reducedMotion } from '../motion/gsap';

const format = (n: Showcase['numbers'][number], v: number) => `${n.prefix ?? ''}${Math.round(v).toLocaleString('en-IE')}${n.suffix ?? ''}`;

export function Numbers({ numbers }: { numbers: Showcase['numbers'] }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = root.current;
    if (!el || reducedMotion()) return;
    let ctx: { revert: () => void } | undefined;
    loadMotion().then(({ gsap, ScrollTrigger }) => {
      ctx = gsap.context(() => {
        el.querySelectorAll<HTMLElement>('b[data-i]').forEach((b) => {
          const n = numbers[Number(b.dataset.i)];
          const o = { v: 0 };
          ScrollTrigger.create({
            trigger: b,
            start: 'top 85%',
            once: true,
            onEnter: () =>
              gsap.to(o, {
                v: n.value,
                duration: 1.6,
                ease: 'power3.out',
                onUpdate: () => {
                  b.textContent = format(n, o.v);
                },
              }),
          });
        });
      }, el);
    });
    return () => ctx?.revert();
  }, [numbers]);
  return (
    <div className="numbers" ref={root}>
      {numbers.map((n, i) => (
        <div key={n.label}>
          <b data-i={i}>{format(n, n.value)}</b>
          <span>{n.label}</span>
        </div>
      ))}
    </div>
  );
}
