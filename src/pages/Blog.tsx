/**
 * @file Blog page: articles with a tag filter, then the community feed. Content: public/data/blog.json.
 * Deep link: /blog?article=<id> scrolls to that article (used by Search).
 */
import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CommunityFeed } from '../features/feed/CommunityFeed';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/Section';
import { LoadState } from '../components/LoadState';
import { useContent } from '../hooks/useContent';

const longDate = (iso: string) =>
  new Date(iso + 'T12:00:00').toLocaleDateString('en-IE', { day: 'numeric', month: 'long', year: 'numeric' });

export default function Blog() {
  const { data: articles, status, error, retry } = useContent('blog');
  const tags = useMemo(() => ['all', ...new Set((articles ?? []).flatMap((a) => a.tags))], [articles]);
  const [tag, setTag] = useState('all');
  const target = useSearchParams()[0].get('article');
  // Articles show their first paragraph only; "Read more" opens the rest (CR-30). A deep-linked article starts open.
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(target ? [target] : []));
  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // Deep link from Search: /blog?article=<id> scrolls to that article.
  useEffect(() => {
    if (!target || !articles) return;
    const timer = window.setTimeout(() => document.getElementById(target)?.scrollIntoView({ behavior: 'smooth' }), 60);
    return () => window.clearTimeout(timer);
  }, [target, articles]);
  if (!articles) return <LoadState status={status} error={error} retry={retry} />;
  const shown = articles.filter((a) => tag === 'all' || a.tags.includes(tag));

  return (
    <>
      <PageHeader title="Blog" crumb="Blog" intro="Short notes on real systems, AI at work and the MSc. Anyone can post below." />
      <Section title="Articles">
        <div className="filters" role="group" aria-label="Filter articles by tag">
          {tags.map((t) => (
            <button key={t} type="button" className="chip" aria-pressed={tag === t} onClick={() => setTag(t)}>
              {t === 'all' ? 'All' : `#${t}`}
            </button>
          ))}
        </div>
        {shown.map((a) => (
          <article className="article" id={a.id} key={a.id}>
            <p className="meta">
              {longDate(a.date)} · {a.tags.map((t) => `#${t}`).join(' ')}
            </p>
            <h3>{a.title}</h3>
            {(expanded.has(a.id) ? a.body : a.body.slice(0, 1)).map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
            {a.body.length > 1 && (
              <button className="text-btn" type="button" aria-expanded={expanded.has(a.id)} onClick={() => toggle(a.id)}>
                {expanded.has(a.id) ? 'Show less' : `Read more (${a.body.length - 1} more paragraphs)`}
              </button>
            )}
          </article>
        ))}
      </Section>
      <Section title="Community feed" alt>
        <CommunityFeed />
      </Section>
    </>
  );
}
