import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
// Calibri where installed (Windows, Office); Carlito, its metric-compatible open twin, elsewhere.
import '@fontsource/carlito/400.css';
import '@fontsource/carlito/700.css';
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
