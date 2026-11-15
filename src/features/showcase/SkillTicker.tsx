/**
 * @file SkillTicker: a band of skills that scrolls sideways (CR-43). CR-50: the movement is a CSS
 * animation, which runs off the main thread, instead of a script that moved it every frame.
 * Still for visitors who ask for reduced motion, and paused on hover.
 */
export function SkillTicker({ skills }: { skills: string[] }) {
  return (
    <div className="ticker" aria-label="Skills">
      <div className="ticker-track">
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
