/**
 * @file useSmoothScroll: smooth, eased page scrolling with Lenis, tied to GSAP ScrollTrigger (CR-43).
 * Also makes ".magnetic" buttons lean towards the mouse. Both are skipped for reduced motion,
 * and Lenis leaves touch scrolling native, so phones scroll as usual.
 */
import { useEffect } from 'react';
import { loadMotion, reducedMotion } from './gsap';

interface Scroller {
  scrollTo: (target: number, options?: { immediate?: boolean; force?: boolean }) => void;
  resize: () => void;
  stop: () => void;
  start: () => void;
}
let restart = 0;
let active: Scroller | null = null;

/**
 * Jumps to the top of a new page (CR-44). With Lenis running, the jump must go through Lenis,
 * or Lenis would glide back to the old position. Lenis is also paused for a moment, so the
 * leftover momentum of a trackpad swipe on the old page cannot scroll the new page down.
 */
export function scrollToTop(): void {
  if (!active) {
    window.scrollTo(0, 0);
    return;
  }
  const lenis = active;
  lenis.stop();
  lenis.resize();
  lenis.scrollTo(0, { immediate: true, force: true });
  window.clearTimeout(restart);
  restart = window.setTimeout(() => lenis.start(), 450);
}

function magnetic(e: MouseEvent) {
  const b = (e.target as Element | null)?.closest?.<HTMLElement>('.magnetic');
  document.querySelectorAll<HTMLElement>('.magnetic').forEach((m) => {
    if (m !== b) m.style.translate = '';
  });
  if (!b) return;
  const r = b.getBoundingClientRect();
  b.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.25}px ${(e.clientY - r.top - r.height / 2) * 0.35}px`;
}

export function useSmoothScroll() {
  useEffect(() => {
    if (reducedMotion()) return;
    let stop = () => {};
    let cancelled = false;
    Promise.all([loadMotion(), import('lenis')]).then(([{ gsap, ScrollTrigger }, { default: Lenis }]) => {
      if (cancelled) return;
      const lenis = new Lenis({ lerp: 0.1 });
      active = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      stop = () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
        active = null;
      };
    });
    window.addEventListener('mousemove', magnetic);
    return () => {
      cancelled = true;
      stop();
      window.removeEventListener('mousemove', magnetic);
    };
  }, []);
}
