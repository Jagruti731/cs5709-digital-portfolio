/**
 * @file The Redux store: one place for state shared between pages.
 *
 * - content: JSON content files and their loading status (CR-12)
 * - posts / auth: the community feed and its optional sign-in (from the starter)
 * - github: live data from the GitHub REST API (innovation, CR-22)
 */
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import contentReducer from './contentSlice';
import githubReducer from './githubSlice';
import postsReducer from './postsSlice';

export const store = configureStore({
  reducer: {
    content: contentReducer,
    posts: postsReducer,
    auth: authReducer,
    github: githubReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
