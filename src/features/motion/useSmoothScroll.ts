/**
 * @file useSmoothScroll: smooth, eased page scrolling with Lenis, tied to GSAP ScrollTrigger (CR-43).
 * Also makes ".magnetic" buttons lean towards the mouse. Both are skipped for reduced motion,
 * and Lenis leaves touch scrolling native, so phones scroll as usual.
 */
import { useEffect } from 'react';
import { loadMotion, reducedMotion } from './gsap';

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
      lenis.on('scroll', ScrollTrigger.update);
      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);
      stop = () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
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
