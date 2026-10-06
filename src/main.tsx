import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Provider } from 'react-redux';
import '@fontsource/libre-caslon-display/400.css';
import '@fontsource/karla/400.css';
import '@fontsource/karla/500.css';
import '@fontsource/karla/700.css';
import '@fontsource/courier-prime/400.css';
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
