/**
 * @file Checks on the Content Security Policy (CR-58): strict where it matters most.
 */
import { describe, expect, it } from 'vitest';
import { CSP_DIRECTIVES, contentSecurityPolicy } from './csp';

describe('Content Security Policy', () => {
  it('runs only scripts from this site: no inline scripts, no eval', () => {
    expect(CSP_DIRECTIVES['script-src']).toEqual(["'self'"]);
    expect(contentSecurityPolicy()).not.toMatch(/unsafe-eval/);
  });

  it('blocks plugins and frames, and keeps forms and <base> on this site', () => {
    expect(CSP_DIRECTIVES['object-src']).toEqual(["'none'"]);
    expect(CSP_DIRECTIVES['frame-src']).toEqual(["'none'"]);
    expect(CSP_DIRECTIVES['base-uri']).toEqual(["'self'"]);
    expect(CSP_DIRECTIVES['form-action']).toEqual(["'self'"]);
  });

  it('allows only the APIs the site uses', () => {
    expect(CSP_DIRECTIVES['connect-src']).toEqual(["'self'", 'https://api.github.com', 'https://*.googleapis.com']);
  });
});
