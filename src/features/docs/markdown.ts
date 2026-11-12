/**
 * @file Turns README.md into HTML for the Readme page (CR-17).
 *
 * Peer review (Aggarwal, 2026): "generate the README page from one source so
 * that it cannot drift from the report". README.md in the repository root is
 * now that one source: GitHub shows it on the repository page, and the site
 * shows the same file on its Readme page.
 *
 * Two small adjustments are made for the site:
 *  - image paths written for GitHub (public/diagrams/x.svg) become ./diagrams/x.svg
 *  - every heading gets an id, so the table of contents can link to it
 */
import { Marked } from 'marked';

export interface Heading {
  id: string;
  text: string;
  level: number;
}

/** "2.1 Iteration 3: peer review" -> "2-1-iteration-3-peer-review" */
export const slug = (text: string): string =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

/** Fixes paths that point into public/ so they work from the built site. */
export const sitePath = (href: string): string => href.replace(/^\.?\/?public\//, './');

/** Renders Markdown and collects the level 2 and 3 headings for a table of contents. */
export function renderMarkdown(source: string): { html: string; headings: Heading[] } {
  const headings: Heading[] = [];
  const marked = new Marked({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        // The page banner already shows the title, and a page must have only one h1.
        if (depth === 1) return '';
        const id = slug(text);
        if (depth === 2 || depth === 3) headings.push({ id, text: text.replace(/<[^>]+>/g, ''), level: depth });
        return `<h${depth} id="${id}">${text}</h${depth}>\n`;
      },
      image({ href, title, text }) {
        return `<img src="${sitePath(href)}" alt="${text}"${title ? ` title="${title}"` : ''} loading="lazy">`;
      },
      link({ href, tokens }) {
        const label = this.parser.parseInline(tokens);
        const target = href.startsWith('http') ? ' target="_blank" rel="noopener"' : '';
        return `<a href="${sitePath(href)}"${target}>${label}</a>`;
      },
    },
  });
  const html = marked.parse(source, { async: false }) as string;
  return { html, headings };
}
