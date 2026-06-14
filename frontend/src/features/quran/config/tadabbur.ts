/**
 * Tadabbur pilot scope — single source of truth.
 *
 * Curated tadabbur surfaces (Deep Dive non-Ask tabs, X-Ray, Depth FAQs,
 * Tafsir, Scholar commentary, Apply, word-level Morphology) ship with a
 * piloted dataset covering only the surahs listed here. Everything else
 * either shows a "piloting on surahs X & Y" message or routes the user
 * to the Ask tab (which works on every ayah via Raya).
 *
 * To expand the pilot, add the surah id here AND backfill the
 * corresponding data files:
 *   - backend/langchain_backend/app/data/tafsirs.json
 *   - backend/langchain_backend/app/data/xray_surahs.json
 *   - backend/langchain_backend/app/data/depth_faqs.json
 *   - backend/langchain_backend/app/data/word_index.json
 *   - frontend/src/features/quran/data/scholarCommentary.json
 *   - frontend/src/features/quran/data/ayahApplications.json
 */

export const TADABBUR_PILOT_SURAHS: ReadonlySet<number> = new Set([1, 2]);

export const TADABBUR_PILOT_SURAH_NAMES = 'Al-Fātiḥah & Al-Baqarah';

export function isSurahInTadabburPilot(surahId: number | null | undefined): boolean {
  return typeof surahId === 'number' && TADABBUR_PILOT_SURAHS.has(surahId);
}

export function isAyahInTadabburPilot(verseKey: string | null | undefined): boolean {
  if (!verseKey) return false;
  const surahPart = verseKey.split(':')[0];
  const surahId = surahPart ? parseInt(surahPart, 10) : NaN;
  return isSurahInTadabburPilot(surahId);
}

/**
 * Standard empty-state message for unsupported surahs. Surfaces that have
 * special copy (e.g. "Try the Ask tab" for tafsir) prepend their own line.
 */
export const PILOT_SCOPE_MESSAGE =
  `Curated content is currently piloting on ${TADABBUR_PILOT_SURAH_NAMES}. ` +
  `We're expanding to more surahs soon.`;
