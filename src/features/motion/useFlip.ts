/**
 * @file useFlip: smooth re-ordering when a filter changes which cards are shown (CR-20).
 *
 * GSAP Flip records where the cards are, React re-renders with the new filter,
 * then Flip animates each card from its old position to its new one and fades
 * in the cards that appear. Without GSAP (still loading, or reduced motion)
 * the filter simply applies at once.
 *
 * Usage:
 *   const { ref, run } = useFlip<HTMLDivElement>('.case');
 *   <button onClick={() => run(() => setFilter('Azure'))}>
 *   <div ref={ref}>…cards…</div>
 */
import { useLayoutEffect, useRef } from 'react';
import { loadMotion, MOTION, reducedMotion, type Motion } from './gsap';

export function useFlip<T extends HTMLElement>(selector: string) {
  const ref = useRef<T>(null);
  const motion = useRef<Motion | null>(null);
  const pending = useRef<ReturnType<Motion['Flip']['getState']> | null>(null);

  useLayoutEffect(() => {
    if (!reducedMotion())
      loadMotion().then((m) => {
        motion.current = m;
      });
  }, []);

  // After every render: if a filter change is waiting, animate from the recorded state.
  useLayoutEffect(() => {
    const state = pending.current;
    const m = motion.current;
    if (!state || !m || !ref.current) return;
    pending.current = null;
    m.Flip.from(state, {
      targets: ref.current.querySelectorAll(selector),
      duration: MOTION.flipSeconds,
      ease: 'power1.inOut',
      absolute: true,
      onEnter: (els) => m.gsap.fromTo(els, { opacity: 0, scale: 0.95 }, { opacity: 1, scale: 1, duration: MOTION.flipSeconds }),
    });
  });

  /** Records the current layout, then applies the change that will re-render the list. */
  const run = (change: () => void) => {
    if (motion.current && ref.current) pending.current = motion.current.Flip.getState(ref.current.querySelectorAll(selector));
    change();
  };

  return { ref, run };
}
