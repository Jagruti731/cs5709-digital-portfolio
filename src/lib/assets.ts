/**
 * @file Paths to files in public/ (images, videos, data).
 *
 * Every path is relative to the page (`./...`) because Vite builds with
 * base './': the same build then works on GitHub Pages under a repository
 * sub-folder, on any other static host, and in `vite preview`.
 */

/** A picture in public/images. */
export const imagePath = (file: string): string => `./images/${file}`;

/** A video (mp4) or its poster frame (jpg) in public/videos. */
export const videoFile = (id: string, ext: 'mp4' | 'jpg'): string => `./videos/${id}.${ext}`;

/** A JSON content file in public/data. */
export const dataPath = (name: string): string => `./data/${name}.json`;
