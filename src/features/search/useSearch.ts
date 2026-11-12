/**
 * @file useSearch: loads what can be searched, builds the index once, and runs queries (CR-21).
 *
 * Two collections:
 *  - site: pages, case studies, projects, skills, articles, education, experience, pictures, videos
 *  - code: every source file (concept location), from codeindex.json
 * Each index is built only when its content has loaded, and rebuilt only if that content changes.
 */
import { useMemo } from 'react';
import { useContent } from '../../hooks/useContent';
import { codeDocs, siteDocs } from './documents';
import { buildIndex, search, type SearchResult } from './searchIndex';

export type Scope = 'site' | 'code';

export function useSearch(scope: Scope, query: string) {
  const projects = useContent('projects').data;
  const blog = useContent('blog').data;
  const education = useContent('education').data;
  const career = useContent('career').data;
  const gallery = useContent('gallery').data;
  const videos = useContent('videos').data;
  const code = useContent('codeindex');

  const siteIndex = useMemo(
    () => buildIndex(siteDocs({ projects, blog, education, career, gallery, videos })),
    [projects, blog, education, career, gallery, videos],
  );
  const codeIndex = useMemo(() => buildIndex(codeDocs(code.data)), [code.data]);
  const index = scope === 'site' ? siteIndex : codeIndex;

  const result: SearchResult = useMemo(() => search(index, query), [index, query]);
  return { ...result, total: index.docs.length, codeCommit: code.data?.commit, codeStatus: code.status };
}
