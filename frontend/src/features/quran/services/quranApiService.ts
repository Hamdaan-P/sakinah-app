/**
 * Quran API Service
 * Mirrors Flutter's quran_reader_service.dart + quran_api_service.dart
 * Uses Quran.com API v4 for content
 */

import type { Surah, QuranLine, QuranSearchResult, QuranWord, MushafWord, MushafLine } from '../types/quran.types';

const BASE_URL = import.meta.env.VITE_QURAN_API_URL || 'https://api.quran.com/api/v4';

// Audio CDN mapping (reciterId → folder)
const RECITER_FOLDERS: Record<number, string> = {
  7: 'Alafasy_128kbps',
  2: 'Abdul_Basit_Mujawwad_128kbps',
  14: 'Ghamadi_40kbps',
};

// Chapter name cache
let chaptersCache: Map<number, string> | null = null;
let chaptersLastFetch = 0;
const CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

/** Fetch all surahs (chapters) */
export async function fetchSurahs(): Promise<Surah[]> {
  const res = await fetch(`${BASE_URL}/chapters?language=en`);
  if (!res.ok) throw new Error('Failed to fetch surahs');

  const data = await res.json();
  return (data.chapters as Array<Record<string, unknown>>).map((ch) => ({
    id: ch.id as number,
    nameSimple: ch.name_simple as string,
    nameArabic: ch.name_arabic as string,
    nameEnglish: (ch.translated_name as Record<string, string>)?.name ?? (ch.name_simple as string),
    versesCount: ch.verses_count as number,
    revelationType: (ch.revelation_place as string) === 'makkah' ? 'Meccan' as const : 'Medinan' as const,
  }));
}

/**
 * Fetch a single verse by surah/ayah number. Lightweight fallback that uses
 * the by_key endpoint — for screens that only need one ayah (e.g. Daily Ayah).
 */
export async function fetchVerse(surahId: number, ayahNumber: number, translationId = 20): Promise<QuranLine | null> {
  const verseKey = `${surahId}:${ayahNumber}`;
  const params = new URLSearchParams({
    language: 'en',
    fields: 'text_uthmani,text_indopak,text_imlaei,verse_key,page_number',
    translations: translationId.toString(),
    translation_fields: 'resource_name,language_name',
  });
  try {
    const res = await fetch(`${BASE_URL}/verses/by_key/${verseKey}?${params}`);
    if (!res.ok) return null;
    const data = await res.json();
    const v = data.verse as Record<string, unknown> | undefined;
    if (!v) return null;
    const translations = (v.translations as Array<Record<string, unknown>>) ?? [];
    const translationText = translations.length > 0 ? cleanHtml(translations[0].text as string) : '';
    return {
      verseNumber: (v.verse_number as number) ?? ayahNumber,
      verseKey: (v.verse_key as string) ?? verseKey,
      arabic: stripVerseEndMarker((v.text_uthmani as string) ?? ''),
      arabicIndopak: v.text_indopak as string | undefined,
      arabicImla: v.text_imlaei as string | undefined,
      translation: translationText,
      transliteration: '',
      rootWords: [],
      wordBreakdown: [],
      pageNumber: (v.page_number as number) ?? 1,
    };
  } catch {
    return null;
  }
}

/** Fetch verses for a surah with translations and word-level data */
export async function fetchLines(surahId: number, translationId = 20): Promise<QuranLine[]> {
  const params = new URLSearchParams({
    language: 'en',
    words: 'true',
    per_page: '300',
    fields: 'text_uthmani,text_indopak,text_imlaei,verse_key,page_number',
    word_fields: 'text_uthmani,transliteration,translation,root',
    translations: translationId.toString(),
    translation_fields: 'resource_name,language_name',
  });

  const res = await fetch(`${BASE_URL}/verses/by_chapter/${surahId}?${params}`);
  if (!res.ok) throw new Error('Failed to fetch verses');

  const data = await res.json();
  const verses = data.verses as Array<Record<string, unknown>>;

  return verses.map((v) => {
    const words = (v.words as Array<Record<string, unknown>>) ?? [];
    const translitParts: string[] = [];
    const rootSet = new Set<string>();
    const breakdownParts: string[] = [];

    for (const w of words) {
      const tlit = (w.transliteration as Record<string, string>)?.text;
      const trans = (w.translation as Record<string, string>)?.text;
      const root = w.root as string | undefined;
      const arabic = w.text_uthmani as string | undefined;

      if (tlit) translitParts.push(tlit);
      if (root) rootSet.add(root);
      if (arabic && tlit) {
        breakdownParts.push(`${arabic} - ${tlit}${trans ? ` (${trans})` : ''}`);
      }
    }

    const translations = (v.translations as Array<Record<string, unknown>>) ?? [];
    const translationText = translations.length > 0 ? cleanHtml(translations[0].text as string) : '';

    return {
      verseNumber: v.verse_number as number,
      verseKey: v.verse_key as string,
      arabic: stripVerseEndMarker((v.text_uthmani as string) ?? ''),
      arabicIndopak: v.text_indopak as string | undefined,
      arabicImla: v.text_imlaei as string | undefined,
      translation: translationText,
      transliteration: translitParts.join(' '),
      rootWords: Array.from(rootSet),
      wordBreakdown: breakdownParts,
      pageNumber: (v.page_number as number) ?? 1,
    };
  });
}

/**
 * Fetch verses WITH structured word-level data (for tap-word interactions).
 * Returns both the verse list and a map verseKey -> words[].
 */
export async function fetchLinesWithWords(
  surahId: number,
  translationId = 20,
): Promise<{ lines: QuranLine[]; wordsByKey: Record<string, QuranWord[]> }> {
  const params = new URLSearchParams({
    language: 'en',
    words: 'true',
    per_page: '300',
    fields: 'text_uthmani,text_uthmani_tajweed,text_indopak,text_imlaei,text_qpc_hafs,verse_key,page_number,juz_number,hizb_number,rub_number',
    word_fields: 'text_uthmani,transliteration,translation,root,position,char_type_name',
    translations: translationId.toString(),
    translation_fields: 'resource_name,language_name',
  });

  const res = await fetch(`${BASE_URL}/verses/by_chapter/${surahId}?${params}`);
  if (!res.ok) throw new Error('Failed to fetch verses');

  const data = await res.json();
  const verses = data.verses as Array<Record<string, unknown>>;

  const lines: QuranLine[] = [];
  const wordsByKey: Record<string, QuranWord[]> = {};

  for (const v of verses) {
    const verseKey = v.verse_key as string;
    const words = (v.words as Array<Record<string, unknown>>) ?? [];
    const translitParts: string[] = [];
    const rootSet = new Set<string>();
    const breakdownParts: string[] = [];
    const structured: QuranWord[] = [];

    words.forEach((w, idx) => {
      const charType = w.char_type_name as string | undefined;
      // Skip verse-end ornaments so they aren't tappable as "words"
      if (charType === 'end') return;

      const tlit = (w.transliteration as Record<string, string>)?.text ?? '';
      const trans = (w.translation as Record<string, string>)?.text ?? '';
      const root = (w.root as string | undefined) ?? undefined;
      const arabic = (w.text_uthmani as string | undefined) ?? '';
      const position = (w.position as number | undefined) ?? idx + 1;

      if (tlit) translitParts.push(tlit);
      if (root) rootSet.add(root);
      if (arabic) {
        breakdownParts.push(`${arabic} - ${tlit}${trans ? ` (${trans})` : ''}`);
        if (arabic.trim() && tlit) {
          structured.push({ verseKey, position, arabic, transliteration: tlit, translation: trans, root });
        }
      }
    });

    const translations = (v.translations as Array<Record<string, unknown>>) ?? [];
    const translationText = translations.length > 0 ? cleanHtml(translations[0].text as string) : '';

    const tajweedRaw = v.text_uthmani_tajweed as string | undefined;
    lines.push({
      verseNumber: v.verse_number as number,
      verseKey,
      arabic: stripVerseEndMarker((v.text_uthmani as string) ?? ''),
      arabicTajweed: tajweedRaw ? stripVerseEndMarker(tajweedRaw) : undefined,
      arabicIndopak: v.text_indopak as string | undefined,
      arabicImla: v.text_imlaei as string | undefined,
      arabicHafs: v.text_qpc_hafs ? stripVerseEndMarker(v.text_qpc_hafs as string) : undefined,
      translation: translationText,
      transliteration: translitParts.join(' '),
      rootWords: Array.from(rootSet),
      wordBreakdown: breakdownParts,
      pageNumber: (v.page_number as number) ?? 1,
      juzNumber: v.juz_number as number | undefined,
      hizbNumber: v.hizb_number as number | undefined,
      rubNumber: v.rub_number as number | undefined,
    });

    wordsByKey[verseKey] = structured;
  }

  return { lines, wordsByKey };
}

/**
 * Fetch all verses on a specific mushaf page (15-line pages, 604 total).
 * Returns verses and the page's juz/hizb so the mushaf header can render correctly.
 */
export async function fetchPage(
  pageNumber: number,
  translationId = 20,
): Promise<{
  lines: QuranLine[];
  wordsByKey: Record<string, QuranWord[]>;
  pageLines: MushafLine[];
  meta: { juz: number; hizb: number };
}> {
  const params = new URLSearchParams({
    language: 'en',
    words: 'true',
    per_page: '50',
    fields: 'text_uthmani,text_uthmani_tajweed,text_indopak,verse_key,page_number,juz_number,hizb_number,rub_number,chapter_id',
    // All script variants in one shot so style switching never refetches.
    word_fields:
      'text_uthmani,text_qpc_hafs,text_indopak,code_v1,code_v2,transliteration,translation,root,position,char_type_name,line_number',
    translations: translationId.toString(),
  });
  const res = await fetch(`${BASE_URL}/verses/by_page/${pageNumber}?${params}`);
  if (!res.ok) throw new Error('Failed to fetch page');
  const data = await res.json();
  const verses = data.verses as Array<Record<string, unknown>>;

  const lines: QuranLine[] = [];
  const wordsByKey: Record<string, QuranWord[]> = {};
  // line_number (1..15) -> words in reading order, for authentic page layout.
  const byLine = new Map<number, MushafWord[]>();

  for (const v of verses) {
    const verseKey = v.verse_key as string;
    const verseNumber = parseInt(verseKey.split(':')[1], 10);
    const words = (v.words as Array<Record<string, unknown>>) ?? [];
    const translitParts: string[] = [];
    const rootSet = new Set<string>();
    const structured: QuranWord[] = [];

    words.forEach((w, idx) => {
      const charType = (w.char_type_name as string | undefined) ?? 'word';
      const tlit = (w.transliteration as Record<string, string>)?.text ?? '';
      const trans = (w.translation as Record<string, string>)?.text ?? '';
      const root = (w.root as string | undefined) ?? undefined;
      const arabic = (w.text_uthmani as string | undefined) ?? '';
      const position = (w.position as number | undefined) ?? idx + 1;
      const lineNumber = (w.line_number as number | undefined) ?? 0;

      // Mushaf line layout — every word (incl. ayah-end marker) keeps every
      // script variant so the renderer can swap style with zero refetch.
      const mWord: MushafWord = {
        verseKey,
        verseNumber,
        position,
        lineNumber,
        charType,
        codeV1: w.code_v1 as string | undefined,
        codeV2: w.code_v2 as string | undefined,
        textHafs: w.text_qpc_hafs as string | undefined,
        textIndopak: w.text_indopak as string | undefined,
      };
      if (lineNumber > 0) {
        const arr = byLine.get(lineNumber) ?? [];
        arr.push(mWord);
        byLine.set(lineNumber, arr);
      }

      if (charType === 'end') return; // skip verse-end ornament for word-tap data
      if (tlit) translitParts.push(tlit);
      if (root) rootSet.add(root);
      if (arabic && arabic.trim() && tlit) {
        structured.push({ verseKey, position, arabic, transliteration: tlit, translation: trans, root });
      }
    });

    const translations = (v.translations as Array<Record<string, unknown>>) ?? [];
    const translationText = translations.length > 0 ? cleanHtml(translations[0].text as string) : '';

    const tajweedRaw = v.text_uthmani_tajweed as string | undefined;
    lines.push({
      verseNumber,
      verseKey,
      arabic: stripVerseEndMarker((v.text_uthmani as string) ?? ''),
      arabicTajweed: tajweedRaw ? stripVerseEndMarker(tajweedRaw) : undefined,
      arabicIndopak: v.text_indopak as string | undefined,
      translation: translationText,
      transliteration: translitParts.join(' '),
      rootWords: Array.from(rootSet),
      wordBreakdown: [],
      pageNumber: (v.page_number as number) ?? pageNumber,
      juzNumber: v.juz_number as number | undefined,
      hizbNumber: v.hizb_number as number | undefined,
      rubNumber: v.rub_number as number | undefined,
    });
    wordsByKey[verseKey] = structured;
  }

  const pageLines: MushafLine[] = Array.from(byLine.entries())
    .sort((a, b) => a[0] - b[0])
    .map(([lineNumber, ws]) => ({
      lineNumber,
      words: ws.sort((a, b) => {
        if (a.verseNumber !== b.verseNumber) return a.verseNumber - b.verseNumber;
        return a.position - b.position;
      }),
    }));

  const juz = (lines[0]?.juzNumber ?? 1);
  const hizb = (lines[0]?.hizbNumber ?? 1);
  return { lines, wordsByKey, pageLines, meta: { juz, hizb } };
}

/** Get audio URL for a specific ayah */
export function getAyahAudioUrl(verseKey: string, reciterId = 7): string {
  const folder = RECITER_FOLDERS[reciterId] ?? RECITER_FOLDERS[7];
  const [surah, ayah] = verseKey.split(':');
  const surahPadded = surah.padStart(3, '0');
  const ayahPadded = ayah.padStart(3, '0');
  return `https://everyayah.com/data/${folder}/${surahPadded}${ayahPadded}.mp3`;
}

export interface TafsirOption {
  id: number;
  name: string;
  authorName: string;
  languageName: string;
  slug: string;
}

let tafsirsCache: TafsirOption[] | null = null;

/**
 * Fetch the list of available tafsirs from Quran.com.
 *
 * PDF Section 11 — multilingual tafsir support: we no longer filter to
 * English-only. The full list is returned so the picker can group by
 * language (English / Arabic / Urdu / Bengali / etc).
 */
export async function fetchTafsirList(): Promise<TafsirOption[]> {
  if (tafsirsCache) return tafsirsCache;
  try {
    const res = await fetch(`${BASE_URL}/resources/tafsirs`);
    if (!res.ok) throw new Error('Failed to fetch tafsirs');
    const data = await res.json();
    const tafsirs = (data.tafsirs as Array<Record<string, unknown>>) ?? [];
    tafsirsCache = tafsirs.map((t) => ({
      id: t.id as number,
      name: (t.name as string) || (t.translated_name as Record<string, string>)?.name || 'Tafsir',
      authorName: (t.author_name as string) || '',
      languageName: (t.language_name as string) || 'Unknown',
      slug: (t.slug as string) || '',
    }));
    return tafsirsCache;
  } catch {
    // Fallback list across multiple languages so the picker still works
    // when the API is unreachable.
    tafsirsCache = [
      { id: 169, name: 'Ibn Kathir', authorName: 'Hafiz Ibn Kathir', languageName: 'English', slug: 'en-tafisr-ibn-kathir' },
      { id: 168, name: "Ma'ariful Quran", authorName: 'Mufti Muhammad Shafi', languageName: 'English', slug: 'en-tafsir-maarif-ul-quran' },
      { id: 817, name: 'Tazkirul Quran', authorName: 'Maulana Wahid Uddin Khan', languageName: 'English', slug: 'en-tazkirul-quran' },
      { id: 16, name: 'Tafsir Ibn Kathir', authorName: 'Hafiz Ibn Kathir', languageName: 'Arabic', slug: 'ar-tafsir-ibn-kathir' },
      { id: 14, name: "Tafsir al-Sa'di", authorName: "Abdur-Rahman as-Sa'di", languageName: 'Arabic', slug: 'ar-tafsir-as-saddi' },
      { id: 157, name: 'Fi Zilal al-Quran', authorName: 'Sayyid Qutb', languageName: 'Arabic', slug: 'ar-tafsir-fi-zilal-al-quran' },
      { id: 818, name: 'Maududi (Tafhim ul-Quran)', authorName: 'Abul A\'la Maududi', languageName: 'Urdu', slug: 'ur-tafsir-tafhim-ul-quran' },
      { id: 160, name: 'Bayan ul Quran', authorName: 'Dr. Israr Ahmad', languageName: 'Urdu', slug: 'ur-bayan-ul-quran' },
      { id: 819, name: 'Tafsir Fathul Majid', authorName: 'AbdulRahman Bin Hasan Al-Alshaikh', languageName: 'Bengali', slug: 'bn-tafsir-fathul-majid' },
    ];
    return tafsirsCache;
  }
}

/** Fetch tafsir (Ibn Kathir by default) for a verse */
export async function fetchTafsir(verseKey: string, tafsirId = 169): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${BASE_URL}/tafsirs/${tafsirId}/by_ayah/${verseKey}`, {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data = await res.json();
    const text = data.tafsir?.text as string | undefined;
    return text ? cleanHtml(text) : null;
  } catch {
    return null;
  }
}

/** Search Quran verses */
export async function searchQuran(query: string, limit = 4): Promise<QuranSearchResult[]> {
  try {
    await ensureChaptersLoaded();
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    // language=en biases the result ranker toward English-translation matches.
    const res = await fetch(
      `${BASE_URL}/search?q=${encodeURIComponent(query)}&size=${limit}&page=1&language=en`,
      { signal: controller.signal },
    );
    clearTimeout(timeout);

    if (!res.ok) return [];
    const data = await res.json();
    const results = (data.search?.results as Array<Record<string, unknown>>) ?? [];

    return results
      .map((r) => {
        const vk = r.verse_key as string;
        const chapterId = parseInt(vk.split(':')[0]);
        // Translations live under r.translations[]. Pick the first English one
        // (highlighted with <em> tags around the query term — strip via cleanHtml).
        const tArr = (r.translations as Array<Record<string, unknown>>) ?? [];
        const firstEn = tArr.find((t) => (t.language_name as string)?.toLowerCase() === 'english') ?? tArr[0];
        const translation = cleanHtml((firstEn?.text as string) ?? '');
        const translationName = (firstEn?.name as string) ?? 'Translation';
        return {
          verseKey: vk,
          surahName: chaptersCache?.get(chapterId) ?? `Surah ${chapterId}`,
          translation,
          translationName,
        };
      })
      .filter((r) => r.translation.length > 0);
  } catch {
    return [];
  }
}

/** Fetch full chapter audio URL for recitation */
export async function fetchChapterAudioUrl(surahId: number, reciterId: number): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/chapter_recitations/${reciterId}/${surahId}`);
    if (!res.ok) return null;
    const data = await res.json();
    return (data.audio_file?.audio_url as string) ?? null;
  } catch {
    return null;
  }
}

/** Fetch list of available reciters */
export async function fetchReciters(): Promise<Array<{ id: number; name: string; style?: string }>> {
  try {
    const res = await fetch(`${BASE_URL}/resources/recitations`);
    if (!res.ok) return [];
    const data = await res.json();
    return ((data.recitations ?? data.reciters) as Array<Record<string, unknown>>).map((r) => ({
      id: r.id as number,
      name: (r.reciter_name ?? r.name) as string,
      style: r.style as string | undefined,
    }));
  } catch {
    return [];
  }
}

// --- Helpers ---

async function ensureChaptersLoaded(): Promise<void> {
  if (chaptersCache && Date.now() - chaptersLastFetch < CACHE_TTL) return;

  const surahs = await fetchSurahs();
  chaptersCache = new Map(surahs.map((s) => [s.id, s.nameSimple]));
  chaptersLastFetch = Date.now();
}

/**
 * Strip the verse-end marker that Quran.com bakes into `text_uthmani` /
 * `text_uthmani_tajweed`. The marker is Arabic-Indic digits (U+0660–U+0669),
 * sometimes preceded by U+06DD (۝), and in the tajweed HTML may be wrapped
 * in a trailing tag like `<span class=end>۝١</span>`. The Mushaf renders its
 * own decorative ayah ornament, so leaving the inline digit produces a
 * duplicate number outside the rosette.
 */
function stripVerseEndMarker(input: string): string {
  if (!input) return input;
  let out = input;
  // Drop a trailing tag whose content is only verse-end characters
  // (covers <span class=end>۝١</span> and similar wrappers in tajweed HTML).
  const trailingTag = /<([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>[\s۝٠-٩]+<\/\1>\s*$/;
  while (trailingTag.test(out)) {
    out = out.replace(trailingTag, '').trimEnd();
  }
  // Drop a plain trailing run of digits / ۝ / whitespace.
  out = out.replace(/[\s۝٠-٩]+$/, '');
  return out.trimEnd();
}

function cleanHtml(input: string): string {
  return input
    // Drop footnote markers entirely — Quran.com wraps them as
    // <sup foot_note=12345>1</sup>; stripping only the tags would leave
    // the bare digit ("easily,1 and when…").
    .replace(/<sup\b[^>]*>[\s\S]*?<\/sup>/gi, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    // Tidy punctuation left behind by removed footnotes ("easily, and"
    // can collapse to "easily and" via a stray comma; remove orphaned
    // commas that now sit before a space-conjunction).
    .replace(/,\s*([,.;:!?])/g, '$1')
    .replace(/\s+([,.;:!?])/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
}
