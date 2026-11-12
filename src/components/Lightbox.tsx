/**
 * @file Lightbox: full-size picture viewer for the gallery. Escape closes it; the arrow keys move between pictures; focus returns to the picture that opened it.
 */
import { useEffect, useRef } from 'react';
import { imagePath } from '../lib/assets';
import type { Picture } from '../types/content';

interface LightboxProps {
  pictures: Picture[];
  index: number;
  onClose: () => void;
  onMove: (index: number) => void;
}

/** Full-size picture viewer. Escape closes it; the arrow keys move between pictures. */
export function Lightbox({ pictures, index, onClose, onMove }: LightboxProps) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const picture = pictures[index];
  const step = (by: number) => onMove((index + by + pictures.length) % pictures.length);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onMove((index + 1) % pictures.length);
      if (e.key === 'ArrowLeft') onMove((index - 1 + pictures.length) % pictures.length);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [index, pictures.length, onClose, onMove]);

  return (
    <div
      className="lightbox"
      role="dialog"
      aria-modal="true"
      aria-label="Picture viewer"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <button ref={closeRef} className="lb-btn lb-close" type="button" onClick={onClose}>
        Close ✕
      </button>
      <button className="lb-btn lb-nav prev" type="button" aria-label="Previous picture" onClick={() => step(-1)}>
        ←
      </button>
      <figure>
        <img src={imagePath(picture.file)} alt={`${picture.title}: ${picture.caption}`} />
        <figcaption>
          {picture.title}: {picture.caption} ({index + 1} of {pictures.length})
        </figcaption>
      </figure>
      <button className="lb-btn lb-nav next" type="button" aria-label="Next picture" onClick={() => step(1)}>
        →
      </button>
    </div>
  );
}
