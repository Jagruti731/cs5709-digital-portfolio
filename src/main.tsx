/**
 * @file Entry point: loads the fonts and stylesheet, creates the Redux store provider and renders the app.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
// Self-hosted fonts, so the installed offline app looks the same with no network.
// CR-42: Instrument Serif for display headings, Inter for text, JetBrains Mono for code.
import '@fontsource/instrument-serif/latin-400.css';
import '@fontsource/instrument-serif/latin-400-italic.css';
import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono/latin-400.css';
import '@fontsource/jetbrains-mono/latin-500.css';
import './styles/global.css';
import App from './App';
import { store } from './store/store';

// Posts are loaded and saved by CommunityFeed through services/postsApi.
// (The starter also hydrated and persisted them here, so they were saved twice.)
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
