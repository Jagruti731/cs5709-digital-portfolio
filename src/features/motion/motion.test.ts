/**
 * @file Tests for the motion helpers that do not need a browser.
 */
import { expect, it } from 'vitest';
import { reducedMotion } from './gsap';
import { splitNumber } from './useCountUp';

it('finds the number to count up in a label', () => {
  expect(splitNumber('6+ years')).toEqual({ before: '', value: 6, after: '+ years' });
  expect(splitNumber('4 banks')).toEqual({ before: '', value: 4, after: ' banks' });
  expect(splitNumber('about 12%')).toEqual({ before: 'about ', value: 12, after: '%' });
  expect(splitNumber('one team')).toBeNull();
});

it('never animates where there is no window', () => {
  expect(reducedMotion()).toBe(true);
});
