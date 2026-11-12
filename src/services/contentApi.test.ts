/**
 * @file Tests for the JSON content layer (CR-12/CR-15).
 *
 * The first block checks every real file in public/data against its shape
 * rule, so a broken edit to the content fails CI before it reaches the site.
 */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import type { ContentName } from '../types/content';
import contentReducer, { fetchContent } from '../store/contentSlice';
import { ContentError, contentRules, loadContent, validateContent } from './contentApi';

const names = Object.keys(contentRules) as ContentName[];
const readFile = (name: string) => JSON.parse(readFileSync(new URL(`../../public/data/${name}.json`, import.meta.url), 'utf8'));

describe('every content file in public/data', () => {
  it.each(names)('%s.json has the expected shape', (name) => {
    expect(() => validateContent(name, readFile(name))).not.toThrow();
  });

  it('every case study and gallery picture points to an image that exists', () => {
    const files = [
      ...readFile('projects').caseStudies.map((c: { image: string }) => c.image),
      ...readFile('gallery').pictures.map((p: { file: string }) => p.file),
    ];
    for (const file of files) expect(() => readFileSync(new URL(`../../public/images/${file}`, import.meta.url))).not.toThrow();
  });

  it('every user story traces to a persona and to features that exist', () => {
    const { personas, stories, features } = readFile('requirements');
    const personaIds = new Set(personas.map((p: { id: string }) => p.id));
    const featureIds = new Set(features.map((f: { id: string }) => f.id));
    for (const s of stories) {
      expect(personaIds.has(s.persona)).toBe(true);
      for (const f of s.features) expect(featureIds.has(f)).toBe(true);
    }
  });
});

const fakeFetch = (body: string, status = 200) => (async () => new Response(body, { status })) as unknown as typeof fetch;

describe('loadContent', () => {
  it('returns checked data', async () => {
    const data = await loadContent('videos', fakeFetch('[{"id":"v","title":"t","description":"d","duration":"0:10"}]'));
    expect(data[0].id).toBe('v');
  });

  it('explains a missing file', async () => {
    await expect(loadContent('videos', fakeFetch('', 404))).rejects.toThrow('videos.json: the server returned 404');
  });

  it('explains a file that is not JSON', async () => {
    await expect(loadContent('blog', fakeFetch('{oops'))).rejects.toThrow('not valid JSON');
  });

  it('explains a file with the wrong shape', async () => {
    await expect(loadContent('blog', fakeFetch('[{"id":"x"}]'))).rejects.toBeInstanceOf(ContentError);
  });

  it('explains a network failure', async () => {
    const offline = (async () => {
      throw new TypeError('offline');
    }) as unknown as typeof fetch;
    await expect(loadContent('blog', offline)).rejects.toThrow('network request failed');
  });
});

describe('contentSlice', () => {
  it('moves a file from idle to error when loading fails, and keeps the reason', async () => {
    const store = configureStore({ reducer: { content: contentReducer } });
    globalThis.fetch = fakeFetch('', 500);
    await store.dispatch(fetchContent('blog'));
    expect(store.getState().content.blog).toMatchObject({ status: 'error', error: 'blog.json: the server returned 500' });
  });

  it('does not fetch a file again once it is ready', async () => {
    const store = configureStore({ reducer: { content: contentReducer } });
    let calls = 0;
    globalThis.fetch = (async () => {
      calls += 1;
      return new Response('[]');
    }) as unknown as typeof fetch;
    await store.dispatch(fetchContent('videos'));
    await store.dispatch(fetchContent('videos'));
    expect(calls).toBe(1);
    expect(store.getState().content.videos?.status).toBe('ready');
  });
});
