/**
 * Mushaf script-style registry.
 *
 * The user can read the Quran in four print styles. quran.com's free API
 * always paginates on the same 604-page / 15-line Madinah grid regardless of
 * the `mushaf` query param (verified: mushaf=6 has no pages 605-610, and page
 * 50 is byte-identical across mushafs). So all four styles share identical
 * page boundaries and line breaks — only the per-word glyph/text field and the
 * font differ. That means a single page fetch carries every style's data and
 * switching style is a pure client re-render (no refetch, no page remap).
 *
 * - `glyph` styles (QCF V1/V2) render the per-word glyph codes (`code_v1` /
 *   `code_v2`) in a *per-page* font downloaded on demand. This is the
 *   authentic Madinah-mushaf rendering quran.com itself uses.
 * - `text` styles (Uthmani Hafs, IndoPak) render a Unicode text field in a
 *   single bundled font.
 */

export type MushafStyleId = 'qcf_v2' | 'qcf_v1' | 'uthmani_hafs' | 'indopak15';

export type MushafWordField = 'code_v1' | 'code_v2' | 'text_qpc_hafs' | 'text_indopak';

export interface MushafStyleDef {
  id: MushafStyleId;
  /** Short label for chips / buttons. */
  label: string;
  /** One-line description shown on the chooser card. */
  blurb: string;
  /** How the page renders: per-page glyph font, or a single Unicode font. */
  rendering: 'glyph' | 'text';
  /** Which word field carries this style's text/glyph. */
  wordField: MushafWordField;
  /**
   * CSS font-family stack for `text` styles. For `glyph` styles this is the
   * fallback stack only — the active family is the per-page font injected at
   * runtime (see mushafFontLoader).
   */
  fontStack: string;
  /** A short Arabic sample for the chooser preview (rendered in the style font). */
  preview: string;
}

/** Per-page QCF font CDN (quran.com's own static host, CORS: *). */
export const QCF_FONT_CDN = {
  v1: (page: number) => `https://static.qurancdn.com/fonts/quran/hafs/v1/woff2/p${page}.woff2`,
  v2: (page: number) => `https://static.qurancdn.com/fonts/quran/hafs/v2/woff2/p${page}.woff2`,
} as const;

/**
 * Single fonts for the text styles. **Self-hosted** under /public/fonts so
 * they always load (no CDN/region/CORS flakiness — the cause of the missing-
 * glyph "boxes" when the remote font failed and a fallback lacking IndoPak
 * marks rendered instead). Same-origin also means faster first paint.
 * Sources: KFGQPC Uthmanic Hafs v18; quran.com IndoPak Nastaʿlīq (waqf-lazim).
 */
export const SINGLE_FONTS = {
  uthmaniHafs: {
    family: 'UthmanicHafs',
    url: '/fonts/uthmanic-hafs.woff2',
  },
  indopak: {
    family: 'IndoPakNastaleeq',
    url: '/fonts/indopak-nastaleeq.woff2',
  },
} as const;

export const MUSHAF_STYLES: Record<MushafStyleId, MushafStyleDef> = {
  qcf_v2: {
    id: 'qcf_v2',
    label: 'QCF V2',
    blurb: 'King Fahd Complex glyph font, v2 — the crisp default Madinah mushaf.',
    rendering: 'glyph',
    wordField: 'code_v2',
    fontStack: "'KFGQPC HAFS Uthmanic Script', 'Amiri Quran', serif",
    preview: 'ﱁﱂﱃﱄ',
  },
  qcf_v1: {
    id: 'qcf_v1',
    label: 'QCF V1',
    blurb: 'King Fahd Complex glyph font, v1 — the original Madinah typeface.',
    rendering: 'glyph',
    wordField: 'code_v1',
    fontStack: "'KFGQPC HAFS Uthmanic Script', 'Amiri Quran', serif",
    preview: 'ﭑﭒﭓﭔ',
  },
  uthmani_hafs: {
    id: 'uthmani_hafs',
    label: 'Uthmani Hafs',
    blurb: 'Standard Uthmani Hafs Unicode script (KFGQPC Uthmanic Hafs).',
    rendering: 'text',
    wordField: 'text_qpc_hafs',
    fontStack: "'UthmanicHafs', 'Amiri Quran', 'KFGQPC HAFS Uthmanic Script', serif",
    preview: 'بِسۡمِ ٱللَّهِ ٱلرَّحۡمَٰنِ',
  },
  indopak15: {
    id: 'indopak15',
    label: 'IndoPak',
    blurb: 'IndoPak Nastaʿlīq script, familiar across South Asia.',
    rendering: 'text',
    wordField: 'text_indopak',
    fontStack: "'IndoPakNastaleeq', 'Noto Naskh Arabic', serif",
    preview: 'بِسۡمِ اللهِ الرَّحۡمٰنِ',
  },
};

export const MUSHAF_STYLE_ORDER: MushafStyleId[] = ['qcf_v2', 'qcf_v1', 'uthmani_hafs', 'indopak15'];

export const DEFAULT_MUSHAF_STYLE: MushafStyleId = 'qcf_v2';

export function isMushafStyleId(v: unknown): v is MushafStyleId {
  return typeof v === 'string' && v in MUSHAF_STYLES;
}

// --- Verse-mode (ayah list / focus) rendering helpers ---
// In the verse-by-verse modes we render a single Unicode string per ayah, so
// the two QCF glyph styles fall back to the visually-equivalent Uthmani-Hafs
// text + font (the authentic per-page QCF glyph layout lives in page mode).

interface AyahTextSource {
  arabic: string;
  arabicHafs?: string;
  arabicIndopak?: string;
}

/** The Arabic string to show for an ayah in the chosen style. */
export function ayahTextForStyle(line: AyahTextSource, style: MushafStyleId): string {
  switch (style) {
    case 'indopak15':
      return line.arabicIndopak || line.arabic;
    case 'uthmani_hafs':
    case 'qcf_v2':
    case 'qcf_v1':
      return line.arabicHafs || line.arabic;
    default:
      return line.arabic;
  }
}

/** The CSS font-family stack to render an ayah in the chosen style. */
export function ayahFontForStyle(style: MushafStyleId): string {
  switch (style) {
    case 'indopak15':
      return "'IndoPakNastaleeq', 'Noto Naskh Arabic', serif";
    case 'uthmani_hafs':
    case 'qcf_v2':
    case 'qcf_v1':
      return "'UthmanicHafs', 'Amiri Quran', 'KFGQPC HAFS Uthmanic Script', serif";
    default:
      return "'Amiri Quran', 'Amiri', 'KFGQPC Hafs', serif";
  }
}
