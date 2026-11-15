/**
 * @file TechRadar: my stack as a radar (CR-43). Four quadrants (kinds of technology), three rings
 * (core, growing, learning now). Hovering or focusing a dot highlights its name in the legend, and
 * the other way round. The sweep beam turns only when motion is allowed (CSS).
 */
import { useMemo, useState } from 'react';
import type { Showcase } from '../../types/content';
import { placeBlips, RADAR } from './radarLayout';

const RING_CLASS = ['core', 'grow', 'learn'];
const QUAD_LABEL: [number, number, 'start' | 'end'][] = [
  [14, 22, 'start'],
  [506, 22, 'end'],
  [506, 506, 'end'],
  [14, 506, 'start'],
];

export function TechRadar({ radar }: { radar: Showcase['radar'] }) {
  const blips = useMemo(() => placeBlips(radar.items), [radar.items]);
  const [hi, setHi] = useState<string | null>(null);
  const { centre: c, rings: r } = RADAR;
  return (
    <div className="radar-wrap">
      <div className="radar">
        <svg viewBox="0 0 520 520" role="img" aria-label="Tech radar: core, growing and learning now">
          <defs>
            <linearGradient id="sweep-grad" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="currentColor" stopOpacity="0" />
              <stop offset="1" stopColor="currentColor" stopOpacity="0.28" />
            </linearGradient>
          </defs>
          {[3, 2, 1].map((i) => (
            <circle key={i} cx={c} cy={c} r={r[i]} className={`ring ring-${i}`} />
          ))}
          <line x1={c - 250} y1={c} x2={c + 250} y2={c} className="axis" />
          <line x1={c} y1={c - 250} x2={c} y2={c + 250} className="axis" />
          {radar.rings.map((ring, i) => (
            <text key={ring.name} x={c + 6} y={c - r[i + 1] + 14} className="rl">
              {ring.name}
            </text>
          ))}
          {radar.quadrants.map((q, i) => (
            <text key={q} x={QUAD_LABEL[i][0]} y={QUAD_LABEL[i][1]} textAnchor={QUAD_LABEL[i][2]} className="ql">
              {q}
            </text>
          ))}
          <g className="sweep">
            <path d={`M${c},${c} L${c},${c - 250} A250,250 0 0,1 ${c + 177},${c - 177} Z`} fill="url(#sweep-grad)" />
          </g>
          {blips.map((b, i) => (
            <g
              key={b.name}
              className={`blip ${RING_CLASS[b.ring]}${hi === b.name ? ' hi' : ''}`}
              tabIndex={0}
              aria-label={`${b.name}: ${radar.rings[b.ring].name}`}
              onMouseEnter={() => setHi(b.name)}
              onMouseLeave={() => setHi(null)}
              onFocus={() => setHi(b.name)}
              onBlur={() => setHi(null)}
            >
              <circle cx={b.x} cy={b.y} r={6} className="pulse" style={{ animationDelay: `${(i * 0.7) % 3}s` }} />
              <circle cx={b.x} cy={b.y} r={6} />
              <text x={b.x} y={b.y - 12} textAnchor="middle">
                {b.name}
              </text>
            </g>
          ))}
        </svg>
      </div>
      <div className="legend">
        {radar.rings.map((ring, i) => (
          <div className={RING_CLASS[i]} key={ring.name}>
            <h3>
              <i aria-hidden="true" />
              {ring.name}
            </h3>
            <p>{ring.note}</p>
            <ul className="chips">
              {radar.items
                .filter((t) => t[2] === i)
                .map(([name]) => (
                  <li key={name} className={hi === name ? 'hi' : ''} onMouseEnter={() => setHi(name)} onMouseLeave={() => setHi(null)}>
                    {name}
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
