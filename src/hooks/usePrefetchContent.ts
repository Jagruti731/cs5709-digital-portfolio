/**
 * @file usePrefetchContent: returns a function that starts loading content files in the background (CR-50).
 * Layout uses it to fetch the main content files a few seconds after the first page has loaded.
 */
import { useCallback } from 'react';
import { fetchContent } from '../store/contentSlice';
import type { ContentName } from '../types/content';
import { useAppDispatch } from './redux';

export function usePrefetchContent(): (names: ContentName[]) => void {
  const dispatch = useAppDispatch();
  return useCallback((names) => names.forEach((n) => void dispatch(fetchContent(n))), [dispatch]);
}
