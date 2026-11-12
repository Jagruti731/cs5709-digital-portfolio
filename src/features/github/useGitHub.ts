/**
 * @file useGitHub: reads live GitHub data from the store and loads it on first use (CR-22).
 */
import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { fetchGitHub } from '../../store/githubSlice';

export function useGitHub() {
  const dispatch = useAppDispatch();
  const state = useAppSelector((s) => s.github);
  useEffect(() => {
    if (state.status === 'idle') void dispatch(fetchGitHub());
  }, [dispatch, state.status]);
  const refresh = useCallback(() => void dispatch(fetchGitHub()), [dispatch]);
  return { ...state, refresh };
}
