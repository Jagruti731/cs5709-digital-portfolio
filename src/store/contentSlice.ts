/**
 * @file Redux state for the JSON content files (CR-12).
 *
 * State management for dynamic data: each file has a status
 * (idle → loading → ready | error). A file is fetched at most once per visit;
 * every later page that needs it reads the cached copy from the store, so
 * moving between pages is instant and does not repeat network requests.
 */
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { loadContent } from '../services/contentApi';
import type { ContentMap, ContentName } from '../types/content';

export type LoadStatus = 'idle' | 'loading' | 'ready' | 'error';

export interface ContentEntry {
  status: LoadStatus;
  data?: unknown;
  error?: string;
}

export type ContentState = Partial<Record<ContentName, ContentEntry>>;

/** Loads one content file. Skipped when the file is already loading or loaded. */
export const fetchContent = createAsyncThunk<ContentMap[ContentName], ContentName, { state: { content: ContentState } }>(
  'content/fetch',
  (name) => loadContent(name),
  {
    condition: (name, { getState }) => {
      const status = getState().content[name]?.status;
      return status !== 'loading' && status !== 'ready';
    },
  },
);

const contentSlice = createSlice({
  name: 'content',
  initialState: {} as ContentState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchContent.pending, (state, action) => {
        state[action.meta.arg] = { status: 'loading' };
      })
      .addCase(fetchContent.fulfilled, (state, action) => {
        state[action.meta.arg] = { status: 'ready', data: action.payload };
      })
      .addCase(fetchContent.rejected, (state, action) => {
        state[action.meta.arg] = { status: 'error', error: action.error.message ?? 'Could not load content.' };
      });
  },
});

export default contentSlice.reducer;
