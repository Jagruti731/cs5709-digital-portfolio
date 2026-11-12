/**
 * @file usePwa: everything the page needs from the service worker (CR-23, innovation).
 *
 *  - registers the service worker built by vite-plugin-pwa (Workbox)
 *  - `canInstall` / `install()`: the browser's "Install app" prompt, offered by our own button
 *  - `offline`: true while the device has no connection
 *  - `updateReady` / `update()`: a new version was deployed; reload when the visitor chooses
 *  - `offlineReady`: the app shell is cached, so the site now opens with no connection
 */
import { useEffect, useState } from 'react';

/** The non-standard event Chromium fires when the site can be installed. */
interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function usePwa() {
  const [installEvent, setInstallEvent] = useState<InstallPromptEvent | null>(null);
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && !navigator.onLine);
  const [updateSW, setUpdateSW] = useState<((reload?: boolean) => Promise<void>) | null>(null);
  const [offlineReady, setOfflineReady] = useState(false);

  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault(); // show our own button instead of the browser's mini bar
      setInstallEvent(e as InstallPromptEvent);
    };
    const onOnline = () => setOffline(false);
    const onOffline = () => setOffline(true);
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('online', onOnline);
    window.addEventListener('offline', onOffline);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('online', onOnline);
      window.removeEventListener('offline', onOffline);
    };
  }, []);

  // Only in a production build: the dev server has no service worker.
  useEffect(() => {
    if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return;
    import('virtual:pwa-register').then(({ registerSW }) => {
      const update = registerSW({
        onNeedRefresh: () => setUpdateSW(() => update),
        onOfflineReady: () => setOfflineReady(true),
      });
    });
  }, []);

  const install = async () => {
    if (!installEvent) return;
    await installEvent.prompt();
    await installEvent.userChoice;
    setInstallEvent(null);
  };

  return {
    canInstall: installEvent !== null,
    install,
    offline,
    offlineReady,
    dismissOfflineReady: () => setOfflineReady(false),
    updateReady: updateSW !== null,
    update: () => updateSW?.(true),
  };
}
