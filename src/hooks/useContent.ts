/**
 * @file useContent: the one way a page reads a JSON content file (CR-12).
 *
 * The first call for a file starts the request; later calls (on this or any
 * other page) get the copy cached in the Redux store.
 */
import { useCallback, useEffect } from 'react';
import { fetchContent, type LoadStatus } from '../store/contentSlice';
import type { ContentMap, ContentName } from '../types/content';
import { useAppDispatch, useAppSelector } from './redux';

export interface ContentResult<T> {
  data: T | undefined;
  status: LoadStatus;
  error?: string;
  /** Tries the request again after an error. */
  retry: () => void;
}

export function useContent<K extends ContentName>(name: K): ContentResult<ContentMap[K]> {
  const dispatch = useAppDispatch();
  const entry = useAppSelector((state) => state.content[name]);
  const status = entry?.status ?? 'idle';

  useEffect(() => {
    if (status === 'idle') void dispatch(fetchContent(name));
  }, [dispatch, name, status]);

  const retry = useCallback(() => void dispatch(fetchContent(name)), [dispatch, name]);
  return { data: entry?.data as ContentMap[K] | undefined, status, error: entry?.error, retry };
}
