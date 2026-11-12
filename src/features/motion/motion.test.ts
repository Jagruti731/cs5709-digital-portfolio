/**
 * @file Tests for the motion helpers that do not need a browser.
 */
import { expect, it } from 'vitest';
import { reducedMotion } from './gsap';

it('never animates where there is no window', () => {
  expect(reducedMotion()).toBe(true);
});
