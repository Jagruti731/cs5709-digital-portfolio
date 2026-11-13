/**
 * @file Firebase settings for the shared community feed and visitor lounge (CR-31).
 *
 * A Firebase web config is not a secret: it only names the project. What visitors
 * may read and write is decided by the security rules in firestore.rules, which
 * Firebase checks on its servers for every request.
 *
 * When apiKey is empty (for example in a fork of this repository) the site keeps
 * the Phase 1 behaviour: posts in this browser, lounge between open tabs.
 */
export const FIREBASE = {
  apiKey: 'AIzaSyDTvr5v9m-CayTGaIZ0Zqfg2e8Yi7XT30U',
  authDomain: 'cs5709-portfolio-ee934.firebaseapp.com',
  projectId: 'cs5709-portfolio-ee934',
  storageBucket: 'cs5709-portfolio-ee934.firebasestorage.app',
  messagingSenderId: '994474013338',
  appId: '1:994474013338:web:b4f4e2b4e429e1964a2523',
};

/** Set to 'local' (localStorage 'jb.backend') to switch the cloud off, e.g. in the browser test. */
export const BACKEND_FLAG = 'jb.backend';

/** Firestore collection names. */
export const COLLECTIONS = { posts: 'posts', comments: 'comments', lounge: 'lounge' } as const;

/** How many recent items each live subscription keeps. */
export const CLOUD_LIMITS = { posts: 50, comments: 300, lounge: 100, imageChars: 400_000 } as const;
