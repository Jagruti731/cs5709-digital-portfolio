/**
 * @file useCountUp: numbers count up from zero when they scroll into view (CR-20).
 *
 * Used for the key numbers on Home ("6+ years", "4 banks"). Only the leading
 * number is animated; the rest of the text stays as written in profile.json.
 */
import { useEffect, type RefObject } from 'react';
import { loadMotion, MOTION, reducedMotion } from './gsap';

/** Splits "6+ years" into { value: 6, before: '', after: '+ years' }; null if there is no number. */
export function splitNumber(text: string): { before: string; value: number; after: string } | null {
  const match = /^(\D*)(\d+)(.*)$/.exec(text);
  return match ? { before: match[1], value: Number(match[2]), after: match[3] } : null;
}

/** Animates every `[data-count]` element inside `root` once `ready` is true. */
export function useCountUp(root: RefObject<HTMLElement>, ready: boolean) {
  useEffect(() => {
    const container = root.current;
    if (!ready || !container || reducedMotion()) return;
    let revert: (() => void) | undefined;
    let cancelled = false;
    loadMotion().then(({ gsap }) => {
      if (cancelled) return;
      const ctx = gsap.context(() => {
        container.querySelectorAll<HTMLElement>('[data-count]').forEach((el) => {
          const parts = splitNumber(el.dataset.count ?? '');
          if (!parts) return;
          const counter = { n: 0 };
          gsap.to(counter, {
            n: parts.value,
            duration: MOTION.countSeconds,
            ease: MOTION.ease,
            scrollTrigger: { trigger: el, start: 'top 95%', once: true },
            onUpdate: () => {
              el.textContent = `${parts.before}${Math.round(counter.n)}${parts.after}`;
            },
          });
        });
      }, container);
      revert = () => ctx.revert();
    });
    return () => {
      cancelled = true;
      revert?.();
    };
  }, [root, ready]);
}
