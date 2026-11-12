/**
 * @file LoadState: what a page shows while its content file is loading or has failed.
 *
 * Usage: `if (!data) return <LoadState status={status} error={error} retry={retry} />;`
 * Loading shows grey placeholder lines (no layout jump); an error shows the
 * reason and a "Try again" button instead of an empty page.
 */
import type { LoadStatus } from '../types/content';

interface LoadStateProps {
  status: LoadStatus;
  error?: string;
  retry?: () => void;
}

export function LoadState({ status, error, retry }: LoadStateProps) {
  if (status === 'error')
    return (
      <div className="container section" role="alert">
        <p className="note">Sorry, this content could not be loaded. {error}</p>
        {retry && (
          <button className="btn" type="button" onClick={retry}>
            Try again
          </button>
        )}
      </div>
    );
  return (
    <div className="container section skeleton" aria-busy="true" aria-label="Loading">
      <span />
      <span />
      <span />
    </div>
  );
}
