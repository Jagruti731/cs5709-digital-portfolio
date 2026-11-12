/**
 * @file Readme page: how the portfolio is structured and how it evolved (CR-17).
 *
 * Three tabs:
 *  - Readme: README.md from the repository root, rendered (the single source of documentation)
 *  - Requirements: personas, scenarios, user stories and traced features (requirements.json)
 *  - Change log: every change request with its maintenance type and commit (changelog.json)
 * Phase 1 hand-wrote the whole report in a 551-line component, which drifted from the README.
 */
import { useMemo, useState } from 'react';
import readmeSource from '../../README.md?raw';
import { PageHeader } from '../components/PageHeader';
import { ChangeLog } from '../features/docs/ChangeLog';
import { renderMarkdown } from '../features/docs/markdown';
import { Requirements } from '../features/docs/Requirements';

type Tab = 'readme' | 'requirements' | 'changes';
const TABS: { id: Tab; label: string }[] = [
  { id: 'readme', label: 'Readme' },
  { id: 'requirements', label: 'Requirements' },
  { id: 'changes', label: 'Change log' },
];

export default function Readme() {
  const [tab, setTab] = useState<Tab>('readme');
  const { html, headings } = useMemo(() => renderMarkdown(readmeSource), []);

  // In-page links must not change the HashRouter route.
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

  return (
    <>
      <PageHeader
        title="Readme"
        crumb="Readme"
        intro="How this portfolio is built and how it evolved: the same README.md that is on GitHub, plus the requirements and the change log."
      />
      <div className="container section">
        <div className="tabs" role="tablist" aria-label="Readme sections">
          {TABS.map((t) => (
            <button key={t.id} role="tab" type="button" aria-selected={tab === t.id} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
        {tab === 'readme' && (
          <div className="readme-layout">
            <nav className="readme-toc" aria-label="Contents">
              <b>Contents</b>
              <ol>
                {headings.map((h) => (
                  <li key={h.id} className={`l${h.level}`}>
                    <a
                      href={`#${h.id}`}
                      onClick={(e) => {
                        e.preventDefault();
                        jump(h.id);
                      }}
                    >
                      {h.text}
                    </a>
                  </li>
                ))}
              </ol>
            </nav>
            <article
              className="markdown"
              dangerouslySetInnerHTML={{ __html: html }}
              onClick={(e) => {
                const a = (e.target as HTMLElement).closest('a');
                const href = a?.getAttribute('href') ?? '';
                if (href.startsWith('#')) {
                  e.preventDefault();
                  jump(href.slice(1));
                }
              }}
            />
          </div>
        )}
        {tab === 'requirements' && <Requirements />}
        {tab === 'changes' && <ChangeLog />}
      </div>
    </>
  );
}
