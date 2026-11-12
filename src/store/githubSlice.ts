/**
 * @file githubSlice: live GitHub data in the Redux store (CR-22).
 * Loaded once per visit; the Refresh button loads it again.
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loadGitHub, type GitHubData } from '../services/githubApi';
import type { LoadStatus } from './contentSlice';

export interface GitHubState {
  status: LoadStatus;
  data?: GitHubData;
  error?: string;
}

export const fetchGitHub = createAsyncThunk('github/fetch', () => loadGitHub(), {
  condition: (_arg, { getState }) => (getState() as { github: GitHubState }).github.status !== 'loading',
});

const githubSlice = createSlice({
  name: 'github',
  initialState: { status: 'idle' } as GitHubState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchGitHub.pending, (state) => {
        state.status = 'loading';
        state.error = undefined;
      })
      .addCase(fetchGitHub.fulfilled, (state, action) => {
        state.status = 'ready';
        state.data = action.payload;
      })
      .addCase(fetchGitHub.rejected, (state, action) => {
        state.status = 'error';
        state.error = action.error.message;
      });
  },
});

export default githubSlice.reducer;
