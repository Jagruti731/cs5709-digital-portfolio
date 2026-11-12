/**
 * @file Pictures page: a filterable picture grid with a full-size viewer. Content: public/data/gallery.json.
 */
import { useCallback, useRef, useState } from 'react';
import { Lightbox } from '../components/Lightbox';
import { PageHeader } from '../components/PageHeader';
import { Section } from '../components/Section';
import { LoadState } from '../components/LoadState';
import { useContent } from '../hooks/useContent';
import { imagePath } from '../lib/assets';
import type { PictureCategory } from '../types/content';

export default function Gallery() {
  const { data, status, error, retry } = useContent('gallery');
  const [filter, setFilter] = useState<'all' | PictureCategory>('all');
  const [open, setOpen] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);

  // Return focus to the picture that opened the viewer.
  const close = useCallback(() => {
    setOpen(null);
    opener.current?.focus();
  }, []);

  if (!data) return <LoadState status={status} error={error} retry={retry} />;
  const { pictures, filters: pictureFilters } = data;
  const shown = pictures.filter((p) => filter === 'all' || p.category === filter);

  return (
    <>
      <PageHeader
        title="Picture gallery"
        crumb="Pictures"
        intro="Places, work and life. Click a picture to see it bigger; use the arrow keys to move between pictures."
      />
      <Section>
        <div className="filters" role="group" aria-label="Filter pictures">
          {pictureFilters.map((f) => (
            <button
              key={f.value}
              type="button"
              className="chip"
              aria-pressed={filter === f.value}
              onClick={() => {
                setFilter(f.value);
                setOpen(null);
              }}
            >
              {f.label}
              {f.value === 'all' ? ` (${pictures.length})` : ''}
            </button>
          ))}
        </div>
        <div className="masonry">
          {shown.map((p, i) => (
            <figure className="shot" key={p.file}>
              <button
                type="button"
                aria-label={`Open ${p.title} full size`}
                onClick={(e) => {
                  opener.current = e.currentTarget;
                  setOpen(i);
                }}
              >
                <img src={imagePath(p.file)} alt={`${p.title}: ${p.caption}`} width={1200} height={800} loading="lazy" />
              </button>
              <figcaption>
                <b>{p.title}</b>
                <span>{p.caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </Section>
      {open !== null && <Lightbox pictures={shown} index={open} onClose={close} onMove={setOpen} />}
    </>
  );
}
