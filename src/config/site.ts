/**
 * @file Site-wide constants (CR-12).
 *
 * Values that the layout needs before any content file has loaded, and the
 * numbers that were "magic" in Phase 1 (peer review: "magic numbers, Chat:98").
 * Keeping them here means one place to change them and one place to read them.
 */

/** Owner details used by the navigation bar and footer. */
export const SITE = {
  owner: 'Jagruti Badgujar',
  initials: 'JB',
  version: '2.0',
  module: 'CS5709 Software Engineering Evolution, University of Limerick',
  linkedin: 'https://in.linkedin.com/in/jagrutibadgujar',
} as const;

/** The GitHub account and repository this site is built from (used by the live GitHub page and the quality dashboard). */
export const GITHUB = {
  user: 'Jagruti731',
  repo: 'cs5709-digital-portfolio',
  get repoUrl() {
    return `https://github.com/${this.user}/${this.repo}`;
  },
  get pagesUrl() {
    return `https://${this.user.toLowerCase()}.github.io/${this.repo}/`;
  },
} as const;

/** Limits that protect the browser and the API from oversized input. */
export const LIMITS = {
  /** Largest image a visitor may attach to a post. Must stay below the server's JSON body limit (2 MB). */
  postImageBytes: 1_000_000,
  postChars: 1000,
  commentChars: 400,
  nameChars: 40,
  chatChars: 1000,
  /** Messages kept per conversation, so localStorage cannot grow without limit. */
  chatHistory: 200,
} as const;

/** Timings for the chat assistant, in milliseconds. */
export const CHAT_TIMING = {
  /** Minimum "typing" delay before the assistant answers. */
  replyBaseMs: 700,
  /** Extra delay per character of the question, so long questions feel considered. */
  replyPerCharMs: 20,
  /** Upper bound on the extra delay. */
  replyMaxExtraMs: 1300,
  /** How long "X is typing..." stays visible without a new keystroke. */
  typingVisibleMs: 1500,
  /** Minimum gap between two "typing" pings to other tabs. */
  typingPingMs: 800,
} as const;
