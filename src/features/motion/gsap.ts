/**
 * @file Loads GSAP on demand and decides whether to animate at all (CR-20).
 *
 * GSAP and its plugins (ScrollTrigger, Flip) are about 70 kB of JavaScript.
 * They are imported dynamically, so they become a separate chunk that is
 * downloaded after the page is already usable, and never for visitors who
 * ask their system for reduced motion (WCAG 2.2, criterion 2.3.3).
 */
import type { gsap as GsapType } from 'gsap';
import type { Flip as FlipType } from 'gsap/Flip';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';

export interface Motion {
  gsap: typeof GsapType;
  ScrollTrigger: typeof ScrollTriggerType;
  Flip: typeof FlipType;
}

/** True when the visitor's system asks for reduced motion, or when there is no window (tests). */
export const reducedMotion = (): boolean =>
  typeof window === 'undefined' || !window.matchMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches;

let loading: Promise<Motion> | null = null;

/**
 * Resolves once the page has loaded and the browser is idle (CR-50), so animation code never
 * competes with the first paint of the page or with the visitor's first taps.
 */
function afterLoad(): Promise<void> {
  return new Promise((resolve) => {
    const idle = () =>
      window.requestIdleCallback ? window.requestIdleCallback(() => resolve(), { timeout: 1500 }) : window.setTimeout(resolve, 300);
    if (document.readyState === 'complete') idle();
    else window.addEventListener('load', idle, { once: true });
  });
}

/** Imports GSAP once and registers the plugins. Every caller gets the same promise. */
export function loadMotion(): Promise<Motion> {
  loading ??= afterLoad()
    .then(() => Promise.all([import('gsap'), import('gsap/ScrollTrigger'), import('gsap/Flip')]))
    .then(([g, s, f]) => {
      g.gsap.registerPlugin(s.ScrollTrigger, f.Flip);
      return { gsap: g.gsap, ScrollTrigger: s.ScrollTrigger, Flip: f.Flip };
    });
  return loading;
}

/** Timings shared by every animation, so the site moves in one consistent rhythm. */
export const MOTION = {
  revealSeconds: 0.6,
  revealDistance: 28,
  staggerSeconds: 0.08,
  flipSeconds: 0.5,
  countSeconds: 1.4,
  ease: 'power2.out',
} as const;
