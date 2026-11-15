/**
 * @file Section: a full-width band of page content with an optional heading. `alt` gives the alternate background.
 * `kicker` is the small monospace label above the heading, for example "01 / Selected work" (CR-33).
 */
import type { ReactNode } from 'react';

interface SectionProps {
  title?: string;
  kicker?: string;
  intro?: string;
  alt?: boolean;
  id?: string;
  children: ReactNode;
}

/** A full-width band of content with an optional heading. `alt` gives it the alternate background. */
export function Section({ title, kicker, intro, alt, id, children }: SectionProps) {
  return (
    <section className={`section${alt ? ' alt' : ''}`} id={id}>
      <div className="container">
        {(title || intro) && (
          <div className="section-title">
            {kicker && <p className="kicker">{kicker}</p>}
            {title && <h2>{title}</h2>}
            {intro && <p>{intro}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
