/**
 * @file AppStatus: small notices from the service worker, shown above the footer (CR-23).
 * Offline banner, "ready to work offline", "new version available", and the Install button.
 */
import { usePwa } from './usePwa';

export function AppStatus() {
  const pwa = usePwa();
  return (
    <div className="app-status" aria-live="polite">
      {pwa.offline && <p className="toast warn">You are offline. The portfolio still works; live GitHub data needs a connection.</p>}
      {pwa.updateReady && (
        <p className="toast">
          A new version of this site is ready.{' '}
          <button className="btn" type="button" onClick={pwa.update}>
            Reload
          </button>
        </p>
      )}
      {pwa.offlineReady && (
        <p className="toast">
          This site now works offline.{' '}
          <button className="text-btn" type="button" onClick={pwa.dismissOfflineReady}>
            OK
          </button>
        </p>
      )}
      {pwa.canInstall && (
        <p className="toast">
          Install this portfolio as an app?{' '}
          <button className="btn" type="button" onClick={pwa.install}>
            Install
          </button>
        </p>
      )}
    </div>
  );
}
