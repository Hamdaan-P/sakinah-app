/**
 * TajweedRenderer
 * Parses text_uthmani_tajweed (HTML with <tajweed class="..."> spans) from Quran.com
 * and produces structured segments, plus a class→color/label map for rendering.
 *
 * Rule classes returned by the API (known set):
 *   ham_wasl, slnt, laam_shamsiyah, madda_normal, madda_permissible,
 *   madda_necessary, qalaqah, madda_obligatory, ikhafa_shafawi, ikhafa,
 *   idgham_shafawi, iqlab, idgham_with_ghunnah, idgham_without_ghunnah,
 *   idgham_mutajanisayn, idgham_mutaqaribayn, ghunnah
 */

export interface TajweedSegment {
  text: string;
  rule: string | null;
}

export interface TajweedRule {
  color: string;
  label: string;
  description: string;
}

// Color map aligned with Quran.com / Tanzil conventions.
export const TAJWEED_RULES: Record<string, TajweedRule> = {
  ham_wasl: { color: '#AAAAAA', label: 'Hamzat al-Wasl', description: 'Silent alif at start of a word — drop on continuation.' },
  slnt: { color: '#888888', label: 'Silent', description: 'Letters written but not pronounced.' },
  laam_shamsiyah: { color: '#E0C000', label: 'Lām Shamsiyyah', description: 'Sun letter — lām of "al" is silent, next letter is doubled.' },
  madda_normal: { color: '#4B8BE0', label: 'Madd 2', description: 'Natural prolongation — 2 counts.' },
  madda_permissible: { color: '#2F78C4', label: 'Madd 4-5', description: 'Permissible prolongation — 4 to 5 counts.' },
  madda_necessary: { color: '#0A4F8A', label: 'Madd Lazim', description: 'Necessary prolongation — 6 counts.' },
  madda_obligatory: { color: '#1A60A8', label: 'Madd Wājib', description: 'Obligatory connected prolongation — 4-5 counts.' },
  qalaqah: { color: '#DD3333', label: 'Qalqalah', description: 'Echoing bounce on ق ط ب ج د when sukūn.' },
  ikhafa_shafawi: { color: '#C65CC6', label: 'Ikhfā Shafawī', description: 'Light concealment — م before ب.' },
  ikhafa: { color: '#A050A0', label: 'Ikhfā', description: 'Concealment — nūn sākinah / tanwīn before 15 letters, 2-count ghunnah.' },
  idgham_shafawi: { color: '#8040A0', label: 'Idghām Shafawī', description: 'Lip merger — م + م.' },
  iqlab: { color: '#A64AA6', label: 'Iqlāb', description: 'Conversion — nūn sākinah / tanwīn → م before ب.' },
  idgham_with_ghunnah: { color: '#6A3A8A', label: 'Idghām w/ Ghunnah', description: 'Merge with nasal — before ي ن م و.' },
  idgham_without_ghunnah: { color: '#4A2A6A', label: 'Idghām w/o Ghunnah', description: 'Merge without nasal — before ل ر.' },
  idgham_mutajanisayn: { color: '#8A4A2A', label: 'Idghām Mutajānisayn', description: 'Merger of like-articulation letters.' },
  idgham_mutaqaribayn: { color: '#6A4A2A', label: 'Idghām Mutaqāribayn', description: 'Merger of close-articulation letters.' },
  ghunnah: { color: '#4FA34F', label: 'Ghunnah', description: 'Nasal sound — doubled ن or م, 2 counts.' },
};

/**
 * Parse a tajweed-annotated HTML string into [text, rule?] segments.
 *
 * Quran.com's `text_uthmani_tajweed` uses UNQUOTED classes, e.g.:
 *   `<tajweed class=ham_wasl>ٱ</tajweed>`
 *
 * So the class attribute may be quoted ("...") or unquoted. Any unknown tag
 * (e.g. stray <span class=end>) is stripped but its text content preserved.
 */
export function parseTajweed(html: string): TajweedSegment[] {
  if (!html) return [];
  const segments: TajweedSegment[] = [];
  let i = 0;

  while (i < html.length) {
    // Look for the start of any tag
    if (html[i] === '<') {
      // Is it a <tajweed ...> open tag?
      const tajOpen = /^<tajweed\b[^>]*?\bclass=(?:"([^"]+)"|'([^']+)'|([^\s>]+))[^>]*>/i.exec(html.slice(i));
      if (tajOpen) {
        const rule = (tajOpen[1] ?? tajOpen[2] ?? tajOpen[3] ?? '').trim();
        const afterOpen = i + tajOpen[0].length;
        const closeIdx = html.toLowerCase().indexOf('</tajweed>', afterOpen);
        if (closeIdx !== -1) {
          const inner = html.slice(afterOpen, closeIdx);
          // Recursively strip any nested tags inside the rule (rare but safe)
          const innerText = decode(stripTags(inner));
          if (innerText) segments.push({ text: innerText, rule });
          i = closeIdx + '</tajweed>'.length;
          continue;
        }
      }
      // Any other tag (e.g. <span>, <span class=end>, </span>) — skip the tag and keep inner text as plain
      const anyTag = /^<\/?[a-zA-Z][^>]*>/.exec(html.slice(i));
      if (anyTag) {
        i += anyTag[0].length;
        continue;
      }
      // Lone `<` — consume as text
      segments.push({ text: '<', rule: null });
      i += 1;
      continue;
    }
    // Plain text until next '<'
    const nextLt = html.indexOf('<', i);
    const chunk = nextLt === -1 ? html.slice(i) : html.slice(i, nextLt);
    const decoded = decode(chunk);
    if (decoded) segments.push({ text: decoded, rule: null });
    i = nextLt === -1 ? html.length : nextLt;
  }

  return segments;
}

function stripTags(s: string): string {
  return s.replace(/<[^>]*>/g, '');
}

function decode(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

export function getRuleColor(rule: string): string {
  return TAJWEED_RULES[rule]?.color ?? '#D4A853';
}

export function getRuleLabel(rule: string): string {
  return TAJWEED_RULES[rule]?.label ?? rule;
}

/** Unique rules that actually appear in a verse's tajweed text (used for legends). */
export function rulesInSegments(segments: TajweedSegment[]): string[] {
  const set = new Set<string>();
  for (const s of segments) if (s.rule) set.add(s.rule);
  return Array.from(set);
}
