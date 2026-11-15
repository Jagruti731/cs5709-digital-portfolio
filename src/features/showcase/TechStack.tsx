/**
 * @file TechStack: my stack as an AI-era architecture (CR-46), replacing the radar of CR-43.
 *
 * Four layers, from AI and agents at the top down to delivery and automation, each technology
 * marked core (shipped in production), growing or learning now. A row of 2026 trends sits above:
 * picking a trend lights up the technologies behind it, dims the rest and shows one line of real
 * evidence from my work. A signal runs up through the layers when motion is allowed (CSS).
 */
import { useState } from 'react';
import type { Showcase } from '../../types/content';
import { countLevels, matches } from './stackFilter';

const LAYER_ICONS = ['✦', '{ }', '☁', '⟳'];

export function TechStack({ stack }: { stack: Showcase['stack'] }) {
  const [trend, setTrend] = useState<string | null>(null);
  const counts = countLevels(stack);
  const active = stack.trends.find((t) => t.id === trend);
  return (
    <div className="stack">
      <div className="trend-bar" role="group" aria-label="Filter by 2026 trend">
        <span className="mono-label">2026 trends I work with</span>
        <div className="trend-chips">
          <button type="button" className="trend" aria-pressed={trend === null} onClick={() => setTrend(null)}>
            All
          </button>
          {stack.trends.map((t) => (
            <button
              key={t.id}
              type="button"
              className="trend"
              aria-pressed={trend === t.id}
              onClick={() => setTrend(trend === t.id ? null : t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <p className="trend-evidence" aria-live="polite">
          {active ? (
            <>
              <b>{active.label}:</b> {active.evidence}
            </>
          ) : (
            'Pick a trend to see the technologies behind it and what I have done with them.'
          )}
        </p>
      </div>
      <div className="layers">
        <i className="signal" aria-hidden="true" />
        {stack.layers.map((layer, i) => (
          <section className={`layer layer-${i}`} key={layer.name} aria-label={layer.name}>
            <header>
              <span className="layer-ic" aria-hidden="true">
                {LAYER_ICONS[i] ?? '•'}
              </span>
              <div>
                <h3>{layer.name}</h3>
                <p>{layer.note}</p>
              </div>
            </header>
            <ul>
              {layer.items.map(([name, level, trends]) => (
                <li key={name} className={`tech ${level}${matches(trends, trend) ? '' : ' dim'}`}>
                  <i aria-hidden="true" />
                  {name}
                  <span className="sr-only"> ({stack.levels.find((l) => l.id === level)?.name})</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <ul className="levels">
        {stack.levels.map((l) => (
          <li key={l.id} className={l.id}>
            <i aria-hidden="true" />
            <b>{l.name}</b> {l.note} · {counts[l.id]}
          </li>
        ))}
      </ul>
    </div>
  );
}
