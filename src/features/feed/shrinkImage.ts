/**
 * @file shrinkImage: makes a picture small enough for the shared feed (CR-31).
 *
 * A Firestore document can hold at most 1 MiB, and every visitor downloads every
 * picture, so before a picture goes to the cloud it is redrawn on a canvas at most
 * MAX_SIDE pixels wide or high and saved as JPEG, lowering the quality until the
 * data URL is under the limit.
 */
import { CLOUD_LIMITS } from '../../config/firebase';

const MAX_SIDE = 1000;
const QUALITIES = [0.8, 0.65, 0.5, 0.35];

/** Width and height that fit inside a max × max box, keeping the shape. */
export function fitInside(width: number, height: number, max: number = MAX_SIDE): { width: number; height: number } {
  const scale = Math.min(1, max / Math.max(width, height));
  return { width: Math.round(width * scale), height: Math.round(height * scale) };
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Could not read the image.'));
    img.src = src;
  });
}

/** Returns a JPEG data URL under maxChars, or rejects when even the lowest quality is too big. */
export async function shrinkImage(dataUrl: string, maxChars: number = CLOUD_LIMITS.imageChars): Promise<string> {
  const img = await loadImage(dataUrl);
  const size = fitInside(img.naturalWidth, img.naturalHeight);
  const canvas = document.createElement('canvas');
  canvas.width = size.width;
  canvas.height = size.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not prepare the image.');
  ctx.fillStyle = '#fff'; // transparent PNGs get a white background, not black
  ctx.fillRect(0, 0, size.width, size.height);
  ctx.drawImage(img, 0, 0, size.width, size.height);
  for (const q of QUALITIES) {
    const out = canvas.toDataURL('image/jpeg', q);
    if (out.length <= maxChars) return out;
  }
  throw new Error('This image is too detailed to share. Try a smaller one.');
}
