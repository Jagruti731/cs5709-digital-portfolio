/**
 * @file SignInForm: sign in or create an account on the optional API server (CR-13).
 * Only shown when the site is built with VITE_API_URL. Split out of CommunityFeed (peer review).
 */
import { useState } from 'react';

interface SignInFormProps {
  signedInAs: string | null;
  onSignIn: (mode: 'login' | 'register', username: string, password: string) => Promise<void>;
  onSignOut: () => void;
}

export function SignInForm({ signedInAs, onSignIn, onSignOut }: SignInFormProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  if (signedInAs)
    return (
      <p className="note">
        Signed in as {signedInAs}.{' '}
        <button className="text-btn" type="button" onClick={onSignOut}>
          Sign out
        </button>
      </p>
    );

  const go = (mode: 'login' | 'register') =>
    onSignIn(mode, username, password).catch(() => setError('That did not work. Check the name and password.'));

  return (
    <div className="signin">
      <div className="field">
        <label htmlFor="si-u">Username</label>
        <input id="si-u" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" />
      </div>
      <div className="field">
        <label htmlFor="si-p">Password</label>
        <input id="si-p" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
      </div>
      <div className="btn-row">
        <button className="btn" type="button" onClick={() => go('login')}>
          Sign in
        </button>
        <button className="btn outline" type="button" onClick={() => go('register')}>
          Create account
        </button>
      </div>
      {error && <p className="note">{error}</p>}
    </div>
  );
}
