/**
 * SourceCitationChip
 *
 * The single citation primitive used everywhere AI or research output is
 * displayed in Quran surfaces (Raya panel, Related Hadith panel, Research
 * workspace, Surah Summary). Every claim must be backed by a chip — that's
 * the governance contract documented in Workstream 4 of the plan.
 *
 * Click to expand a small inline popover showing the verified Arabic +
 * English snippet so users can audit the source without leaving the page.
 */

import { useState } from 'react';
import type { SourceCitation } from '../../types/quran.types';

interface Props {
  citation: SourceCitation;
  /** Optional verified Arabic + English to show in the expansion drawer. */
  snippet?: { arabic?: string; english?: string };
  className?: string;
}

function label(c: SourceCitation): string {
  if (c.kind === 'quran') {
    return c.surah_name ? `Quran ${c.verse_key} · ${c.surah_name}` : `Quran ${c.verse_key}`;
  }
  if (c.kind === 'hadith') {
    const grade = c.grade ? ` · ${c.grade}` : '';
    return `${c.collection} #${c.number}${grade}`;
  }
  return c.author ? `${c.book} · ${c.author}` : c.book;
}

export function SourceCitationChip({ citation, snippet, className }: Props) {
  const [open, setOpen] = useState(false);
  const hasSnippet = Boolean(snippet?.arabic || snippet?.english);

  return (
    <span className={`inline-flex flex-col ${className ?? ''}`}>
      <button
        type="button"
        onClick={() => hasSnippet && setOpen((v) => !v)}
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full
          bg-primaryTeal/10 text-primaryTeal text-xs font-medium
          border border-primaryTeal/20
          ${hasSnippet ? 'hover:bg-primaryTeal/20 cursor-pointer' : 'cursor-default'}
          transition-colors`}
        aria-expanded={hasSnippet ? open : undefined}
        aria-label={`Source: ${label(citation)}`}
      >
        <span aria-hidden="true">{citation.kind === 'quran' ? '☾' : citation.kind === 'hadith' ? '◈' : '◇'}</span>
        <span>{label(citation)}</span>
      </button>
      {open && hasSnippet && (
        <span className="mt-1.5 block max-w-md rounded-md border border-primaryTeal/20 bg-white/80 dark:bg-slate-900/60 p-3 text-sm text-slate-700 dark:text-slate-200">
          {snippet?.arabic && (
            <span className="block text-right font-arabic text-base leading-relaxed mb-2">
              {snippet.arabic}
            </span>
          )}
          {snippet?.english && (
            <span className="block italic text-slate-600 dark:text-slate-300">
              {snippet.english}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
