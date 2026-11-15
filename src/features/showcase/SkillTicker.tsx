/**
 * @file SkillTicker: a band of skills that scrolls sideways and speeds up with the page scroll (CR-43).
 * Still for visitors who ask for reduced motion.
 */
import { useEffect, useRef } from 'react';
import { loadMotion, reducedMotion } from '../motion/gsap';

export function SkillTicker({ skills }: { skills: string[] }) {
  const track = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = track.current;
    if (!el || reducedMotion()) return;
    let stop = () => {};
    loadMotion().then(({ gsap, ScrollTrigger }) => {
      let x = 0;
      let speed = 0.6;
      const tick = () => {
        x -= speed;
        const half = el.scrollWidth / 2;
        if (-x >= half) x += half;
        if (x > 0) x -= half;
        el.style.transform = `translateX(${x}px)`;
        speed += (0.6 - speed) * 0.05;
      };
      gsap.ticker.add(tick);
      const st = ScrollTrigger.create({
        onUpdate: (self) => (speed = 0.6 + Math.min(Math.abs(self.getVelocity()) / 220, 12) * (self.direction || 1)),
      });
      stop = () => {
        gsap.ticker.remove(tick);
        st.kill();
      };
    });
    return () => stop();
  }, []);
  return (
    <div className="ticker" aria-label="Skills">
      <div className="ticker-track" ref={track}>
        {[0, 1].map((copy) =>
          skills.map((s, i) => (
            <span key={`${copy}-${s}`} className={i % 2 ? 'outline' : ''} aria-hidden={copy === 1}>
              {s}
            </span>
          )),
        )}
      </div>
    </div>
  );
}
