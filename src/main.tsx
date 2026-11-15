/**
 * @file Entry point: loads the fonts and stylesheet, creates the Redux store provider and renders the app.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
// CR-33: self-hosted fonts, so the installed offline app looks the same with no network.
// Space Grotesk for headings, JetBrains Mono for labels, numbers and the status panel.
import '@fontsource-variable/space-grotesk';
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
