/**
 * ResearchResultCard — single result row in the research workspace.
 *
 * Every result carries a citation chip resolved to one of the three bucket
 * kinds (Quran / hadith / book). The "Save to collection" button delegates
 * to the parent so the workspace can route to the user's chosen collection.
 */

import type { ResearchResult } from '../../types/quran.types';
import { SourceCitationChip } from '../governance/SourceCitationChip';

interface Props {
  result: ResearchResult;
  onSave?: (result: ResearchResult) => void;
  /** Optional "Add to study sheet" action — appears next to Save when provided. */
  onAddToSheet?: (result: ResearchResult) => void;
  className?: string;
}

const BUCKET_LABEL: Record<ResearchResult['bucket'], string> = {
  quran: 'Quran',
  hadith: 'Hadith',
  tafsir: 'Tafsir / Books',
};

export function ResearchResultCard({ result, onSave, onAddToSheet, className }: Props) {
  return (
    <article
      className={`rounded-md border border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/30 p-4 space-y-2 ${className ?? ''}`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
          {BUCKET_LABEL[result.bucket]}
        </span>
        <div className="flex items-center gap-2">
          {onAddToSheet && (
            <button
              type="button"
              onClick={() => onAddToSheet(result)}
              className="text-xs px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              Add to sheet
            </button>
          )}
          {onSave && (
            <button
              type="button"
              onClick={() => onSave(result)}
              className="text-xs px-2.5 py-1 rounded border border-primaryTeal/30 text-primaryTeal hover:bg-primaryTeal/10"
            >
              Save
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
        {result.excerpt}
      </p>

      <div className="flex flex-wrap gap-1.5 pt-1">
        <SourceCitationChip
          citation={result.citation}
          snippet={
            result.citation.kind === 'quran' && result.citation.arabic_text
              ? { arabic: result.citation.arabic_text }
              : undefined
          }
        />
      </div>
    </article>
  );
}
