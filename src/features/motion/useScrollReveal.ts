/**
 * @file useScrollReveal: content blocks fade and slide in as they scroll into view (CR-20).
 *
 * Used once, in Layout, for every page. Pages load their content after the
 * route changes, so a MutationObserver registers new blocks as they appear;
 * each block is animated once. Blocks already on screen when they appear are
 * left alone, so nothing visible ever flickers.
 */
import { useEffect, type RefObject } from 'react';
import { loadMotion, MOTION, reducedMotion } from './gsap';

/** The blocks that are revealed. Anything else on the page is never hidden. */
export const REVEAL_SELECTOR = '.card, .work-card, .case, .shot, .repo';

export function useScrollReveal(root: RefObject<HTMLElement>) {
  useEffect(() => {
    const container = root.current;
    if (!container || reducedMotion()) return;
    let cancelled = false;
    let observer: MutationObserver | undefined;
    const seen = new WeakSet<Element>();
    const triggers: { kill: () => void }[] = [];

    loadMotion().then(({ gsap, ScrollTrigger }) => {
      if (cancelled) return;
      const register = () => {
        const fresh = [...container.querySelectorAll(REVEAL_SELECTOR)].filter((el) => {
          if (seen.has(el)) return false;
          seen.add(el);
          return el.getBoundingClientRect().top > window.innerHeight; // below the fold only
        });
        if (fresh.length === 0) return;
        gsap.set(fresh, { opacity: 0, y: MOTION.revealDistance });
        triggers.push(
          ...ScrollTrigger.batch(fresh, {
            start: 'top 92%',
            once: true,
            onEnter: (batch) =>
              gsap.to(batch, { opacity: 1, y: 0, duration: MOTION.revealSeconds, ease: MOTION.ease, stagger: MOTION.staggerSeconds }),
          }),
        );
      };
      register();
      observer = new MutationObserver(register);
      observer.observe(container, { childList: true, subtree: true });
    });

    return () => {
      cancelled = true;
      observer?.disconnect();
      triggers.forEach((t) => t.kill());
    };
  }, [root]);
}
