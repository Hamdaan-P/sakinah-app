/**
 * Mushaf scripts (page-scan styles)
 *
 * The Mushaf reader renders printed-page scans (not reflowed text). Each
 * "script" is a different printed copy of the Quran; pages live in Firebase
 * Storage under  mushaf/{script}/page{NNN}.jpg  (NNN zero-padded, 1..pages).
 *
 * `pages`      — number of readable pages in that edition (not all are 604).
 * `aligned604` — true when the edition follows the standard 604-page Madani
 *                layout, so the surah/juz quick-jump (which is keyed to that
 *                layout) lands correctly. IndoPak has its own pagination, so
 *                its surah/juz jump is disabled (page-number nav still works).
 * `available`  — whether the scans have been uploaded yet.
 */

export type MushafScript = 'hafs' | 'tajweed' | 'warsh' | 'indopak';

export interface MushafScriptMeta {
  id: MushafScript;
  label: string;
  arabic: string;
  available: boolean;
  pages: number;
  aligned604: boolean;
  /** File extension of the uploaded pages. Hafs is a lossless PNG render
   *  (crisp line art); the photographic editions are JPEG. */
  ext: 'png' | 'jpg';
}

export const MUSHAF_SCRIPTS: MushafScriptMeta[] = [
  { id: 'hafs', label: 'Madani (Hafs)', arabic: 'حفص', available: true, pages: 604, aligned604: true, ext: 'jpg' },
  { id: 'tajweed', label: 'Tajweed', arabic: 'تجويد', available: true, pages: 604, aligned604: true, ext: 'jpg' },
  { id: 'warsh', label: 'Warsh', arabic: 'ورش', available: true, pages: 604, aligned604: true, ext: 'jpg' },
  { id: 'indopak', label: 'IndoPak', arabic: 'هندي', available: true, pages: 548, aligned604: false, ext: 'jpg' },
];

export const DEFAULT_MUSHAF_SCRIPT: MushafScript = 'hafs';

export function mushafScriptMeta(script: MushafScript): MushafScriptMeta {
  return MUSHAF_SCRIPTS.find((s) => s.id === script) ?? MUSHAF_SCRIPTS[0];
}

export function isScriptAvailable(script: MushafScript): boolean {
  return mushafScriptMeta(script).available;
}

const BUCKET = import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string | undefined;

/**
 * Bumped whenever the uploaded scans are re-rendered (e.g. higher resolution).
 * Appended to the URL so clients refetch instead of serving the old immutable-
 * cached image. Bump this any time the bucket contents change in place.
 */
const ASSET_VERSION = 4;

/**
 * Public download URL for a page scan. Relies on the public-read rule for
 * `mushaf/**` in storage.rules — the `?alt=media` endpoint then needs no
 * auth token. Bucket comes from the env so staging/prod resolve correctly.
 */
export function mushafImageUrl(script: MushafScript, page: number): string {
  const padded = String(page).padStart(3, '0');
  const ext = mushafScriptMeta(script).ext;
  const objectPath = encodeURIComponent(`mushaf/${script}/page${padded}.${ext}`);
  return `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${objectPath}?alt=media&v=${ASSET_VERSION}`;
}
