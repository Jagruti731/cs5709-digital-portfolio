/**
 * @file Entry point: loads the fonts and stylesheet, creates the Redux store provider and renders the app.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
// Self-hosted fonts, so the installed offline app looks the same with no network.
// CR-43: Bricolage Grotesque for display, Instrument Sans for text, JetBrains Mono for labels and code.
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/instrument-sans';
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
