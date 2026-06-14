/**
 * textFormatter.tsx
 * Rich text formatting for chat messages with Islamic citation highlighting.
 * Handles: bold, italic, code, headers, lists, blockquotes,
 *          Arabic calligraphy, Quran references, Hadith references
 */

import type { ReactNode } from 'react';

// ── Text sanitization ──

/** Replace problematic Unicode ligatures with readable text */
function sanitize(text: string): string {
  return text
    .replace(/\uFDFA/g, ' (peace be upon him) ')  // ﷺ - sallallahu alayhi wa sallam
    .replace(/\uFDF2/g, 'Allah')                   // ﷲ ligature
    .replace(/  +/g, ' ');                          // collapse double spaces
}

/** Strip decorative Unicode circles/ornaments from hadith Arabic text */
function stripOrnaments(text: string): string {
  return text
    .replace(/[\u06DD\u06DE\u06E9\u2022\u25CF\u25CB\u25CE\u25C9\u2219\u22C5\u00B7]/g, '')
    .replace(/  +/g, ' ')
    .trim();
}

// ── Regex patterns ──

/** Matches Arabic text spans (single words or multi-word phrases) */
const ARABIC_RE =
  /[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]+(?:\s+[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]+)*/;

/** Matches Quran references: "Surah Al-Baqarah, 2:153", "(Quran 2:153)", "Surah Ash-Sharh (94:5-6)" */
const QURAN_REF_RE =
  /Surah\s+[A-Z][a-zA-Z'-]*(?:\s+[A-Za-z'-]+)*(?:[,\s]+\d+:\d+(?:-\d+)?|\s*\(\d+:\d+(?:-\d+)?\))?|\(Quran\s+\d+:\d+(?:-\d+)?\)/;

/** Matches Hadith references: "(Sahih Bukhari, narrated by ...)", "(Sahih Muslim)", etc. */
const HADITH_REF_RE =
  /\((?:Sahih|Sunan|Jami['\u2019]?|Muwatta|Musnad)\s[^)]+\)/;

// ── Blockquote classification ──

function classifyBlockquote(lines: string[]): 'quran' | 'hadith' | 'generic' {
  const text = lines.join(' ').toLowerCase();
  if (/surah|quran|\d+:\d+/.test(text)) return 'quran';
  if (/sahih|bukhari|muslim|sunan|tirmidhi|muwatta|musnad|hadith|narrated/.test(text))
    return 'hadith';
  return 'generic';
}

// ── Inline formatter ──

/** Format inline markdown with Islamic citation highlighting */
// eslint-disable-next-line react-refresh/only-export-components -- this is a .tsx file because formatInline returns ReactNode; it is genuinely a utility not a component
export function formatInline(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let remaining = sanitize(text);
  let key = 0;

  while (remaining.length > 0) {
    // All match candidates
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    const codeMatch = remaining.match(/`(.+?)`/);
    const italicMatch = remaining.match(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/);
    const arabicMatch = remaining.match(ARABIC_RE);
    const quranMatch = remaining.match(QURAN_REF_RE);
    const hadithMatch = remaining.match(HADITH_REF_RE);

    // Earliest index wins; on tie, higher specificity (lower priority number) wins
    const matches = [
      quranMatch  ? { m: quranMatch,  type: 'quranRef',  priority: 0 } : null,
      hadithMatch ? { m: hadithMatch, type: 'hadithRef', priority: 1 } : null,
      arabicMatch ? { m: arabicMatch, type: 'arabic',    priority: 2 } : null,
      boldMatch   ? { m: boldMatch,   type: 'bold',      priority: 3 } : null,
      codeMatch   ? { m: codeMatch,   type: 'code',      priority: 4 } : null,
      italicMatch ? { m: italicMatch, type: 'italic',    priority: 5 } : null,
    ]
      .filter(Boolean)
      .sort((a, b) => {
        const idxDiff = a!.m!.index! - b!.m!.index!;
        return idxDiff !== 0 ? idxDiff : a!.priority - b!.priority;
      }) as Array<{ m: RegExpMatchArray; type: string; priority: number }>;

    if (matches.length === 0) {
      parts.push(remaining);
      break;
    }

    const first = matches[0];
    const idx = first.m.index!;

    // Text before the match
    if (idx > 0) parts.push(remaining.slice(0, idx));

    switch (first.type) {
      case 'bold':
        parts.push(
          <strong key={key++} className="font-semibold text-[#F5E8C7]">
            {formatInline(first.m[1])}
          </strong>,
        );
        break;
      case 'code':
        parts.push(
          <code
            key={key++}
            className="px-1 py-0.5 rounded bg-white/10 text-[#D4A853] text-xs font-mono"
          >
            {first.m[1]}
          </code>,
        );
        break;
      case 'italic':
        parts.push(
          <em key={key++} className="italic text-white/80">
            {formatInline(first.m[1])}
          </em>,
        );
        break;
      case 'arabic':
        parts.push(
          <span
            key={key++}
            className="font-arabic text-xl leading-relaxed text-[#E8C97A]"
            dir="rtl"
            style={{ unicodeBidi: 'isolate', wordSpacing: '0.05em' }}
          >
            {first.m[0]}
          </span>,
        );
        break;
      case 'quranRef':
        parts.push(
          <span
            key={key++}
            className="inline-flex items-center bg-[#D4A853]/15 text-[#D4A853] text-xs font-medium rounded px-1.5 py-0.5"
          >
            {first.m[0]}
          </span>,
        );
        break;
      case 'hadithRef':
        parts.push(
          <span
            key={key++}
            className="inline-flex items-center bg-[#C9A85C]/10 text-[#C9A85C] text-xs border border-[#C9A85C]/20 rounded px-1.5 py-0.5"
          >
            {first.m[0]}
          </span>,
        );
        break;
    }

    remaining = remaining.slice(idx + first.m[0].length);
  }

  return parts.length === 1 && typeof parts[0] === 'string' ? parts[0] : <>{parts}</>;
}

// ── Block-level formatter ──

/** Simple markdown-like formatter with Islamic citation support */
export function FormattedText({ text }: { text: string }) {
  const lines = text.split('\n');
  const elements: ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trimStart();

    // Blockquote: group consecutive `> ` lines
    if (trimmed.startsWith('> ')) {
      const startI = i;
      const blockLines: string[] = [];
      while (i < lines.length && lines[i].trimStart().startsWith('> ')) {
        blockLines.push(lines[i].trimStart().slice(2));
        i++;
      }
      const type = classifyBlockquote(blockLines);
      elements.push(
        <Blockquote key={`bq${startI}`} lines={blockLines} type={type} />,
      );
      continue;
    }

    // Headers
    if (trimmed.startsWith('### '))
      elements.push(
        <h4 key={i} className="font-bold text-white text-sm mt-2 mb-1">
          {formatInline(trimmed.slice(4))}
        </h4>,
      );
    else if (trimmed.startsWith('## '))
      elements.push(
        <h3 key={i} className="font-bold text-white text-base mt-2 mb-1">
          {formatInline(trimmed.slice(3))}
        </h3>,
      );
    else if (trimmed.startsWith('# '))
      elements.push(
        <h2 key={i} className="font-bold text-white text-lg mt-2 mb-1">
          {formatInline(trimmed.slice(2))}
        </h2>,
      );
    // Bullet points
    else if (trimmed.startsWith('- ') || trimmed.startsWith('* ') || trimmed.startsWith('• '))
      elements.push(
        <p key={i} className="pl-3 before:content-['•'] before:mr-2 before:text-white/50">
          {formatInline(trimmed.slice(2))}
        </p>,
      );
    // Numbered lists
    else if (/^\d+\.\s/.test(trimmed)) {
      const match = trimmed.match(/^(\d+\.)\s(.*)$/);
      if (match)
        elements.push(
          <p key={i} className="pl-3">
            <span className="text-white/50 mr-1">{match[1]}</span>
            {formatInline(match[2])}
          </p>,
        );
    }
    // Empty line
    else if (trimmed === '') elements.push(<br key={i} />);
    // Regular paragraph — detect Arabic-dominant lines for RTL
    else {
      const arabicChars = (trimmed.match(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
      const isArabicLine = arabicChars > trimmed.length * 0.3;
      elements.push(
        <p key={i} dir={isArabicLine ? 'rtl' : undefined} className={isArabicLine ? 'text-right' : ''}>
          {formatInline(line)}
        </p>,
      );
    }

    i++;
  }

  return <>{elements}</>;
}

// ── Blockquote sub-component ──

function Blockquote({
  lines,
  type,
}: {
  lines: string[];
  type: 'quran' | 'hadith' | 'generic';
}) {
  const styles = {
    quran: 'border-l-[#D4A853] bg-[#D4A853]/5',
    hadith: 'border-l-[#C9A85C]/60 bg-[#C9A85C]/5',
    generic: 'border-l-white/20 bg-white/5',
  };

  /** A line is "Arabic" if >50% of its non-space characters are Arabic script */
  const isArabicDominant = (line: string): boolean => {
    const stripped = line.replace(/\s/g, '');
    if (stripped.length === 0) return false;
    const arabicCount = (stripped.match(/[\u0600-\u06FF\u0750-\u077F\uFB50-\uFDFF\uFE70-\uFEFF]/g) || []).length;
    return arabicCount / stripped.length > 0.5;
  };

  // Quran blocks follow Quran.com style: centred Arabic, translation below,
  // tiny muted citation. When multiple verses are grouped, we render ALL
  // Arabic first in one flowing block, then ALL translations together, then
  // citations — so the reader can recite through the Arabic first, then read
  // the meaning, matching how people naturally engage with the mushaf.
  if (type === 'quran') {
    const citationRe = /^\s*Surah\s.+\(\d+:\d+(?:-\d+)?\)\s*$/;
    const arabicLines: string[] = [];
    const englishLines: string[] = [];
    const citationLines: string[] = [];
    for (const line of lines) {
      if (!line.trim()) continue;
      if (isArabicDominant(line)) arabicLines.push(line.trim());
      else if (citationRe.test(line)) citationLines.push(line.trim());
      else englishLines.push(line.trim());
    }
    return (
      <div
        className="my-4 mx-auto flex flex-col items-center text-center gap-3 px-6 py-5 rounded-2xl"
        style={{
          background:
            'linear-gradient(180deg, rgba(212,168,83,0.08), rgba(212,168,83,0.03))',
          border: '1px solid rgba(212,168,83,0.28)',
          boxShadow:
            '0 4px 20px rgba(0,0,0,0.18), inset 0 1px 0 rgba(232,201,122,0.08)',
        }}
      >
        {arabicLines.length > 0 && (
          <p
            className="font-arabic text-[22px] leading-[2.1] text-[#F5E8C7] max-w-full"
            dir="rtl"
            style={{ unicodeBidi: 'isolate', wordSpacing: '0.05em' }}
          >
            {arabicLines.join(' ')}
          </p>
        )}
        {englishLines.length > 0 && (
          <p className="text-[14px] text-white/85 leading-relaxed max-w-[62ch]">
            {formatInline(englishLines.join(' '))}
          </p>
        )}
        {citationLines.length > 0 && (
          <p className="text-[11px] text-[#D4A853] tracking-wide font-medium">
            {citationLines.length === 1
              ? citationLines[0]
              : `${citationLines[0].replace(/\s*\(.+$/, '')} (${citationLines
                  .map((c) => (c.match(/\((\d+:\d+(?:-\d+)?)\)/) || [])[1])
                  .filter(Boolean)
                  .join(', ')})`}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className={`border-l-2 ${styles[type]} rounded-r-lg pl-3 pr-2 py-2 my-2`}>
      {type === 'hadith'
        ? lines.map((line, j) => {
            const isArabicLine = isArabicDominant(line);
            if (isArabicLine) {
              return (
                <div
                  key={j}
                  className="bg-[#C9A85C]/8 rounded-lg px-4 py-3 my-1 text-right"
                  dir="rtl"
                >
                  <span
                    className="font-hadith-arabic text-xl leading-loose text-[#E8C97A] drop-shadow-[0_0_6px_rgba(212,168,83,0.3)]"
                    style={{ unicodeBidi: 'isolate', wordSpacing: '0.08em', letterSpacing: '0.02em' }}
                  >
                    {stripOrnaments(line)}
                  </span>
                </div>
              );
            }
            return (
              <p key={j} className="text-white/80">
                {formatInline(line)}
              </p>
            );
          })
        : lines.map((line, j) => (
            <p key={j} className="text-white/80">
              {formatInline(line)}
            </p>
          ))}
    </div>
  );
}
