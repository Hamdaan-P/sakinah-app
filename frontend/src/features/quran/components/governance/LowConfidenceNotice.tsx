/**
 * LowConfidenceNotice
 *
 * Rendered when the backend's retrieval confidence falls below the per-category
 * threshold (see backend `IslamicKnowledgeStore.search_with_confidence`).
 * Copy intentionally avoids emotional language and never suggests speculative
 * interpretation — it nudges the user toward a narrower query instead.
 */

interface Props {
  /** Optional reason for the low-confidence state (e.g. "Aqeedah questions require higher confidence."). */
  reason?: string;
  /** Optional suggestion text the parent surface can offer (e.g. "Try a more specific term"). */
  suggestion?: string;
  className?: string;
}

export function LowConfidenceNotice({ reason, suggestion, className }: Props) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={`rounded-md border border-slate-300/60 bg-slate-50/80 dark:bg-slate-900/40 dark:border-slate-700/60 p-4 text-sm text-slate-700 dark:text-slate-200 ${
        className ?? ''
      }`}
    >
      <p className="font-medium mb-1">No verified source matched this question with enough confidence.</p>
      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
        {reason ??
          'Rather than answer from speculation, the assistant withholds a response when grounded sources are not available.'}
      </p>
      {suggestion && (
        <p className="mt-2 text-slate-600 dark:text-slate-300 leading-relaxed">{suggestion}</p>
      )}
    </div>
  );
}
