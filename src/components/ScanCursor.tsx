/**
 * @file ScanCursor: a scanner-frame cursor that follows the mouse and says OPEN over a system,
 * a pillar or a case study (CR-43). Only for fine pointers (mouse) and when motion is allowed;
 * the real cursor stays visible underneath, so nothing depends on it.
 */
import { useEffect, useRef, useState } from 'react';
import { loadMotion, reducedMotion } from '../features/motion/gsap';

const HOVER = '.sys-tab, .pillar, .case, .blip, .work-index a';

export function ScanCursor() {
  const el = useRef<HTMLDivElement>(null);
  const [enabled] = useState(() => typeof window !== 'undefined' && !reducedMotion() && window.matchMedia?.('(pointer: fine)').matches);
  useEffect(() => {
    const cur = el.current;
    if (!enabled || !cur) return;
    let off = () => {};
    loadMotion().then(({ gsap }) => {
      const xTo = gsap.quickTo(cur, 'x', { duration: 0.35, ease: 'power3' });
      const yTo = gsap.quickTo(cur, 'y', { duration: 0.35, ease: 'power3' });
      const move = (e: MouseEvent) => {
        cur.classList.add('on');
        xTo(e.clientX);
        yTo(e.clientY);
        cur.classList.toggle('open', Boolean((e.target as Element | null)?.closest?.(HOVER)));
      };
      window.addEventListener('mousemove', move);
      off = () => window.removeEventListener('mousemove', move);
    });
    return () => off();
  }, [enabled]);
  if (!enabled) return null;
  return (
    <div className="cursor" ref={el} aria-hidden="true">
      <span>OPEN</span>
    </div>
  );
}
