/**
 * @file Small helpers shared by the feed and the chat.
 */

/** A short random id that is unique enough for posts, comments and messages in one browser. */
export const newId = (): string => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

/** "12 Nov 2026" in Irish English. */
export const shortDate = (iso: string): string =>
  new Date(iso).toLocaleDateString('en-IE', { day: 'numeric', month: 'short', year: 'numeric' });

/** "14:05" in Irish English. */
export const clockTime = (t: number): string => new Date(t).toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' });
