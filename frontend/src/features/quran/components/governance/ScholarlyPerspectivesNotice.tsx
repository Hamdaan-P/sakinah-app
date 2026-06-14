/**
 * ScholarlyPerspectivesNotice
 *
 * Implements PDF Section 7 — "allow valid scholarly differences" — and PDF
 * Section 8 — "avoid forcing a particular line, polemical presentation, or
 * sectarian confrontation". Rendered where multiple distinct classical
 * sources appear on the same screen, so the user understands that the
 * platform surfaces multiple perspectives rather than asserting one.
 *
 * Kept presentational and minimal: a single inline note, no toggles, no
 * scholar-comparison UI. Future expansion (multi-position views per madhab)
 * is in Section 11 and out of scope.
 */

interface Props {
  /** Distinct source names that appear on this surface. Triggers the notice when length > 1. */
  sources: string[];
  className?: string;
}

export function ScholarlyPerspectivesNotice({ sources, className }: Props) {
  const distinct = Array.from(new Set(sources.filter(Boolean)));
  if (distinct.length < 2) return null;

  return (
    <p
      role="note"
      className={`text-xs italic text-slate-500 dark:text-slate-400 leading-relaxed ${className ?? ''}`}
    >
      Multiple scholarly sources cited. Valid differences between trustworthy scholars are presented as-is —
      the assistant does not adjudicate between them.
    </p>
  );
}
