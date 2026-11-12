/**
 * @file Section: a full-width band of page content with an optional heading. `alt` gives the alternate background.
 */
import type { ReactNode } from 'react';

interface SectionProps {
  title?: string;
  intro?: string;
  alt?: boolean;
  id?: string;
  children: ReactNode;
}

/** A full-width band of content with an optional heading. `alt` gives it the alternate background. */
export function Section({ title, intro, alt, id, children }: SectionProps) {
  return (
    <section className={`section${alt ? ' alt' : ''}`} id={id}>
      <div className="container">
        {(title || intro) && (
          <div className="section-title">
            {title && <h2>{title}</h2>}
            {intro && <p>{intro}</p>}
          </div>
        )}
        {children}
      </div>
    </section>
  );
}
