/**
 * EscalateToScholarModal
 *
 * Implements PDF Section 7 "AI Governance — escalate sensitive matters when
 * required". Opens from any AI response surface (Raya panel, research result
 * card) and routes the user to qualified scholar resources. The platform's
 * AI never issues independent fatwas — this is the explicit hand-off the
 * spec requires.
 *
 * The list is intentionally a curated set of Athari/Salafi-compatible
 * scholar-led platforms (per Section 8) without sectarian framing. Adding /
 * removing entries should happen in this single component so the wording
 * stays consistent across surfaces.
 */

import { useEffect, useRef, useState } from 'react';

interface Props {
  open: boolean;
  onClose: () => void;
  /** The original question + AI answer to include in the prefilled escalation. */
  question?: string;
  aiAnswer?: string;
}

interface ScholarResource {
  name: string;
  url: string;
  description: string;
}

const RESOURCES: ScholarResource[] = [
  {
    name: 'IslamQA',
    url: 'https://islamqa.info',
    description: 'Long-standing fatwa archive supervised by qualified scholars. Strong for fiqh and aqeedah questions.',
  },
  {
    name: 'AskImam (Darul Iftaa)',
    url: 'https://askimam.org',
    description: 'Question-and-answer service from trained muftis. Useful for personal-status and family rulings.',
  },
  {
    name: 'BinBaz.org.sa',
    url: 'https://binbaz.org.sa',
    description: 'Archive of Sheikh Ibn Baz fatawa and lectures. Authoritative for foundational rulings.',
  },
  {
    name: 'Local masjid imam',
    url: '',
    description: 'For personal circumstances — a scholar who knows your local context can weigh detail an online fatwa cannot.',
  },
];

export function EscalateToScholarModal({ open, onClose, question, aiAnswer }: Props) {
  const dialogRef = useRef<HTMLDivElement | null>(null);
  const [copied, setCopied] = useState(false);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  // Focus the dialog on open for accessibility.
  useEffect(() => {
    if (open) dialogRef.current?.focus();
  }, [open]);

  if (!open) return null;

  const copyPayload = [
    question ? `Question:\n${question}` : null,
    aiAnswer ? `\nAI assistant's response (for context — please verify):\n${aiAnswer}` : null,
    '\nI would value a scholarly review of this answer.',
  ]
    .filter(Boolean)
    .join('\n');

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(copyPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Best-effort — clipboard can be blocked
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close dialog"
        className="absolute inset-0 bg-black/40 backdrop-blur-sm border-0 cursor-default"
        onClick={onClose}
      />
      <div
        ref={dialogRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="escalate-title"
        className="relative w-full max-w-lg rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-2xl p-5 space-y-4"
      >
        <header className="space-y-1">
          <h2 id="escalate-title" className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Confirm with a qualified scholar
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Sensitive matters — rulings, family situations, contested topics — should be reviewed by a scholar
            who can weigh your context. The assistant never issues independent fatwas. Below are trusted
            scholar-led resources.
          </p>
        </header>

        <ul className="space-y-2.5">
          {RESOURCES.map((r) => (
            <li
              key={r.name}
              className="rounded border border-slate-200 dark:border-slate-700 p-3 text-sm"
            >
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium text-slate-800 dark:text-slate-100">{r.name}</span>
                {r.url && (
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-primaryTeal hover:underline"
                  >
                    Open ↗
                  </a>
                )}
              </div>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {r.description}
              </p>
            </li>
          ))}
        </ul>

        {(question || aiAnswer) && (
          <div className="rounded border border-slate-200 dark:border-slate-700 p-3 text-xs space-y-2 bg-slate-50 dark:bg-slate-950">
            <p className="font-medium text-slate-700 dark:text-slate-200">
              Copy a prefilled message to send the scholar:
            </p>
            <pre className="text-[11px] whitespace-pre-wrap text-slate-600 dark:text-slate-300 max-h-32 overflow-y-auto">
              {copyPayload}
            </pre>
            <button
              type="button"
              onClick={onCopy}
              className="rounded bg-primaryTeal px-3 py-1.5 text-xs font-medium text-white hover:opacity-90"
            >
              {copied ? 'Copied' : 'Copy message'}
            </button>
          </div>
        )}

        <footer className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Close
          </button>
        </footer>
      </div>
    </div>
  );
}
