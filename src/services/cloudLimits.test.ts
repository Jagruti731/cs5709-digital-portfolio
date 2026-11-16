/**
 * @file Tests of the site-side rate-limit check (CR-58). firestore.rules enforces the same
 * intervals on the server; these tests check the friendly "please wait" part.
 */
import { describe, expect, it } from 'vitest';
import { RATE_LIMIT_SECONDS } from '../config/firebase';
import { TooSoonError, waitSeconds } from './cloud';

describe('rate limits', () => {
  it('lets a visitor write when nothing was sent yet', () => {
    expect(waitSeconds('post')).toBe(0);
    expect(waitSeconds('lounge')).toBe(0);
  });

  it('uses the same intervals as firestore.rules: posts 30 s, comments 10 s, lounge 3 s', () => {
    expect(RATE_LIMIT_SECONDS).toEqual({ post: 30, comment: 10, lounge: 3 });
  });

  it('explains how long to wait', () => {
    const err = new TooSoonError(12);
    expect(err.message).toBe('Please wait 12 s before sending again.');
    expect(err.seconds).toBe(12);
  });
});

describe('firestore.rules', () => {
  it('enforces the same intervals as the site shows', async () => {
    const { readFileSync } = await import('node:fs');
    const rules = readFileSync(new URL('../../firestore.rules', import.meta.url), 'utf8');
    const { post, comment, lounge } = RATE_LIMIT_SECONDS;
    expect(rules).toContain(`kind == 'post' ? ${post} : (kind == 'comment' ? ${comment} : ${lounge})`);
    for (const kind of ['post', 'comment', 'lounge']) expect(rules).toContain(`stamped('${kind}')`);
  });
});
