/**
 * @file Unit tests for the sign-in state.
 */
import { expect, it } from 'vitest';
import reducer, { login, logout } from './authSlice';

it('stores the user on login and clears it on logout', () => {
  const signedIn = reducer(undefined, login({ username: 'ann', token: 't1' }));
  expect(signedIn).toEqual({ username: 'ann', token: 't1' });
  expect(reducer(signedIn, logout())).toEqual({ username: null, token: null });
});
