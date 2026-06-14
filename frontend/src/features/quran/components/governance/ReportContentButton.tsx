/**
 * ReportContentButton
 *
 * Inline button + lightweight modal for flagging user-generated content per
 * PDF Section 9. Persists the report to localStorage via
 * `communityReportsService`. Once reported, the button locks into a muted
 * "Reported" state so the user knows it landed.
 *
 * Kept generic over content type so the same component handles circle notes
 * today and (e.g.) shared annotations or chat messages later.
 */

import { useEffect, useState } from 'react';
import { Flag } from '@phosphor-icons/react';
import {
  hasReported,
  submitReport,
  type CommunityReport,
  type ReportCategory,
} from '../../services/communityReportsService';

const CATEGORY_OPTIONS: { value: ReportCategory; label: string; help: string }[] = [
  {
    value: 'unsupervised-interpretation',
    label: 'Unsupervised tafsir / personal interpretation',
    help: 'Content presents an interpretation of Quran or hadith without citing a verified scholarly source.',
  },
  {
    value: 'misinformation',
    label: 'Misinformation or unverified claim',
    help: 'Hadith without grading, fabricated quote, or claim contradicting verified sources.',
  },
  {
    value: 'sensitive-content',
    label: 'Sensitive matter needing scholarly review',
    help: 'Ruling, family-status, or contested topic that should be reviewed before circulating.',
  },
  {
    value: 'disrespectful',
    label: 'Disrespectful or polemical',
    help: 'Sectarian aggression, emotionally manipulative framing, or disrespectful tone.',
  },
  { value: 'other', label: 'Other', help: 'Something else that needs review.' },
];

interface Props {
  contentType: CommunityReport['contentType'];
  contentId: string;
  contextLabel?: string;
  reporterUid?: string;
  className?: string;
}

export function ReportContentButton({
  contentType,
  contentId,
  contextLabel,
  reporterUid,
  className,
}: Props) {
  const [open, setOpen] = useState(false);
  const [reported, setReported] = useState(false);
  const [category, setCategory] = useState<ReportCategory>('unsupervised-interpretation');
  const [note, setNote] = useState('');

  useEffect(() => {
    setReported(hasReported(contentId));
  }, [contentId]);

  if (reported) {
    return (
      <span
        className={`inline-flex items-center gap-1 text-[11px] text-amber-400/80 ${className ?? ''}`}
        aria-label="Already reported"
      >
        <Flag size={11} weight="fill" /> Reported
      </span>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Report this content"
        className={`inline-flex items-center gap-1 text-[11px] text-white/50 hover:text-amber-300 ${
          className ?? ''
        }`}
      >
        <Flag size={11} /> Report
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close dialog"
            className="absolute inset-0 bg-black/50 border-0 cursor-default"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="report-title"
            className="relative w-full max-w-md rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 p-5 space-y-4"
          >
            <header className="space-y-1">
              <h2 id="report-title" className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Flag this for scholarly review
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Reports are queued for review. Per PDF Section 9, community content is moderated and
                sensitive matters may require scholarly oversight.
              </p>
            </header>

            <fieldset className="space-y-2">
              <legend className="text-xs font-medium text-slate-700 dark:text-slate-200">Why?</legend>
              {CATEGORY_OPTIONS.map((opt) => (
                <label
                  key={opt.value}
                  htmlFor={`report-cat-${opt.value}`}
                  aria-label={opt.label}
                  className={`flex items-start gap-2 rounded border p-2 text-xs cursor-pointer ${
                    category === opt.value
                      ? 'border-primaryTeal bg-primaryTeal/5'
                      : 'border-slate-200 dark:border-slate-700'
                  }`}
                >
                  <input
                    id={`report-cat-${opt.value}`}
                    type="radio"
                    name="report-category"
                    value={opt.value}
                    checked={category === opt.value}
                    onChange={() => setCategory(opt.value)}
                    className="mt-0.5"
                  />
                  <span className="flex-1 leading-snug">
                    <span className="block font-medium text-slate-800 dark:text-slate-100">
                      {opt.label}
                    </span>
                    <span className="block text-slate-500 dark:text-slate-400">{opt.help}</span>
                  </span>
                </label>
              ))}
            </fieldset>

            <label className="block">
              <span className="block text-xs font-medium text-slate-700 dark:text-slate-200 mb-1">
                Optional note (max 1000 chars)
              </span>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={1000}
                rows={3}
                className="w-full rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-primaryTeal/30"
              />
            </label>

            <footer className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs text-slate-700 dark:text-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  submitReport({
                    contentType,
                    contentId,
                    category,
                    note,
                    contextLabel,
                    reporterUid,
                  });
                  setReported(true);
                  setOpen(false);
                }}
                className="rounded bg-primaryTeal px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
              >
                Submit report
              </button>
            </footer>
          </div>
        </div>
      )}
    </>
  );
}
