/**
 * @file Pillars: three cards on how I am ready for agentic work (CR-43), each with one line of proof.
 */
import type { ShowcasePillar } from '../../types/content';

const ICONS: Record<ShowcasePillar['icon'], JSX.Element> = {
  doc: (
    <>
      <rect x="16" y="14" width="20" height="24" rx="2" />
      <path d="M20 21h12M20 26h12M20 31h7" />
    </>
  ),
  pair: (
    <>
      <circle cx="18" cy="26" r="7" />
      <circle cx="34" cy="26" r="7" />
    </>
  ),
  shield: (
    <>
      <path d="M26 10l14 6v9c0 9-6 15-14 18-8-3-14-9-14-18v-9z" />
      <path d="M20 26l4 4 8-8" />
    </>
  ),
};

export function Pillars({ pillars }: { pillars: ShowcasePillar[] }) {
  return (
    <div className="pillars">
      {pillars.map((p, i) => (
        <article className="pillar" key={p.title}>
          <div className="ic" aria-hidden="true">
            <svg width="52" height="52" viewBox="0 0 52 52">
              <g fill="none" stroke="currentColor" strokeWidth="2">
                {ICONS[p.icon]}
              </g>
              <g className="orbit">
                <circle cx="26" cy="5" r="3" fill="currentColor" />
              </g>
            </svg>
          </div>
          <span className="mono-label">
            {String(i + 1).padStart(2, '0')} · {p.label}
          </span>
          <h3>{p.title}</h3>
          <ul>
            {p.points.map((x) => (
              <li key={x}>{x}</li>
            ))}
          </ul>
          <p className="proof">
            <b>✓</b> {p.proof}
          </p>
        </article>
      ))}
    </div>
  );
}
