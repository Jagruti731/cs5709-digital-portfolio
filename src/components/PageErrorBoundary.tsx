/**
 * @file PageErrorBoundary: catches an error while a page loads or renders (CR-19).
 *
 * With lazy loading, a page's code is fetched on demand. If that request
 * fails (offline, or a new version was deployed and the old chunk is gone),
 * the visitor sees a short message and a reload button instead of a blank screen.
 */
import { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Changing this value (the route) clears a previous error. */
  resetKey: string;
}
interface State {
  error: Error | null;
  key: string;
}

export class PageErrorBoundary extends Component<Props, State> {
  state: State = { error: null, key: this.props.resetKey };

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error };
  }

  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    return props.resetKey !== state.key ? { error: null, key: props.resetKey } : null;
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="container section" role="alert">
        <h1>This page could not be loaded</h1>
        <p className="note">Check your connection, then reload. ({this.state.error.message})</p>
        <button className="btn" type="button" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    );
  }
}
