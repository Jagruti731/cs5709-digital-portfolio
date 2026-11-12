/**
 * @file usePageIntro: a short entrance animation for each new page (CR-20).
 * The banner title and summary slide in; on Home, the hero lines follow one after another.
 */
import { useEffect, type RefObject } from 'react';
import { loadMotion, MOTION, reducedMotion } from './gsap';

export function usePageIntro(root: RefObject<HTMLElement>, routeKey: string) {
  useEffect(() => {
    const container = root.current;
    if (!container || reducedMotion()) return;
    let revert: (() => void) | undefined;
    let cancelled = false;
    // Wait one frame so the lazily loaded page has rendered its banner.
    const frame = requestAnimationFrame(() => {
      loadMotion().then(({ gsap }) => {
        if (cancelled) return;
        const ctx = gsap.context(() => {
          gsap.from('.page-banner .crumbs, .page-banner h1, .page-banner p, .hero .container > div > *', {
            opacity: 0,
            y: 18,
            duration: MOTION.revealSeconds,
            ease: MOTION.ease,
            stagger: MOTION.staggerSeconds,
            clearProps: 'all',
          });
        }, container);
        revert = () => ctx.revert();
      });
    });
    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      revert?.();
    };
  }, [root, routeKey]);
}
