/**
 * @file useRun: plays one system run inside the SystemsPlayer (CR-43). It draws the wires between the
 * step cards, moves the packet from step to step, lights each step and its log line, and calls
 * `onDone` when the run ends. Returns the progress of the run (0 to 1) for the list's progress bar.
 */
import { useEffect, useState, type RefObject } from 'react';
import type { ShowcaseSystem } from '../../types/content';
import { loadMotion, reducedMotion } from '../motion/gsap';

/** Draws one straight wire between the centres of consecutive step cards. Returns the centres. */
function drawWires(pipe: HTMLElement): [number, number][] {
  const svg = pipe.querySelector('svg');
  const box = pipe.getBoundingClientRect();
  const pts = [...pipe.querySelectorAll('.node')].map((n) => {
    const r = n.getBoundingClientRect();
    return [r.left - box.left + r.width / 2, r.top - box.top + r.height / 2] as [number, number];
  });
  if (svg) {
    svg.setAttribute('viewBox', `0 0 ${box.width} ${box.height}`);
    svg.innerHTML = pts
      .slice(1)
      .map((p, k) => `<path d="M${pts[k][0]},${pts[k][1]} L${p[0]},${p[1]}"/>`)
      .join('');
  }
  return pts;
}

export function useRun(root: RefObject<HTMLElement>, system: ShowcaseSystem, play: boolean, onDone: () => void) {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const pipe = root.current?.querySelector<HTMLElement>('.pipe');
    if (!pipe) return;
    const redraw = () => drawWires(pipe);
    redraw();
    window.addEventListener('resize', redraw);
    if (reducedMotion() || !play) return () => window.removeEventListener('resize', redraw);
    let tl: { kill: () => void } | undefined;
    let cancelled = false;
    loadMotion().then(({ gsap }) => {
      if (cancelled) return;
      const pts = drawWires(pipe);
      const nodes = [...pipe.querySelectorAll('.node')];
      const wires = [...pipe.querySelectorAll('path')];
      const lines = [...(root.current?.querySelectorAll('.log li') ?? [])];
      const packet = pipe.querySelector('.packet');
      gsap.set(lines, { opacity: 0.12 });
      const t = gsap.timeline({ onUpdate: () => setProgress(t.progress()), onComplete: () => void gsap.delayedCall(1.6, onDone) });
      t.set(packet, { opacity: 1, scale: 1, x: pts[0][0], y: pts[0][1] });
      nodes.forEach((n, j) => {
        if (j > 0)
          t.add(() => wires[j - 1]?.classList.add('live')).to(packet, { x: pts[j][0], y: pts[j][1], duration: 0.6, ease: 'power2.inOut' });
        t.add(() => n.classList.add('on'));
        if (lines[j]) t.to(lines[j], { opacity: 1, duration: 0.2 }, '+=0.05');
        t.add(() => void n.classList.replace('on', 'done'), n.classList.contains('human') ? '+=0.9' : '+=0.45');
      });
      t.to(packet, { scale: 2.6, opacity: 0, duration: 0.5 });
      tl = t;
    });
    return () => {
      cancelled = true;
      tl?.kill();
      window.removeEventListener('resize', redraw);
      pipe.querySelectorAll('.node').forEach((n) => n.classList.remove('on', 'done'));
      setProgress(0);
    };
    // onDone changes identity every render; the run restarts only when the system or visibility changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [root, system, play]);
  return progress;
}
