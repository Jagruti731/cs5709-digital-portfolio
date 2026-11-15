/**
 * @file Paths to files in public/ (images, data).
 *
 * Every path is relative to the page (`./...`) because Vite builds with
 * base './': the same build then works on GitHub Pages under a repository
 * sub-folder, on any other static host, and in `vite preview`.
 */

/** A picture in public/images. */
export const imagePath = (file: string): string => `./images/${file}`;

/** A JSON content file in public/data. */
export const dataPath = (name: string): string => `./data/${name}.json`;
