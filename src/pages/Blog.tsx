/**
 * @file Blog page: articles with a tag filter, then the community feed. Content: public/data/blog.json.
 */
import { useMemo, useState } from 'react';
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
  if (!articles) return <LoadState status={status} error={error} retry={retry} />;
  const shown = articles.filter((a) => tag === 'all' || a.tags.includes(tag));

  return (
    <>
      <PageHeader
        title="Blog"
        crumb="Blog"
        intro="Notes on keeping real systems alive, and on the MSc. Below the articles, anyone can post, like and comment."
      />
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
            {a.body.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </article>
        ))}
      </Section>
      <Section title="Community feed" intro="Share a thought or a question. Posts support an image, likes and replies." alt>
        <CommunityFeed />
      </Section>
    </>
  );
}
