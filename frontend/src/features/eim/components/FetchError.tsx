/**
 * Inline fetch-error banner — surfaces query failures instead of silently
 * showing an empty list. Used by EIM pages that depend on /api/eim/* data.
 */

import { WarningCircle } from '@phosphor-icons/react';
import { BACKEND_URL } from '@/lib/api';

interface Props {
  error: unknown;
  retry?: () => void;
  context?: string; // e.g., "library", "scholar opinions"
}

export function FetchError({ error, retry, context = 'data' }: Props) {
  const msg = error instanceof Error ? error.message : String(error);
  const isAuth = msg.includes('401') || msg.toLowerCase().includes('unauthorized');
  const isOffline = msg.toLowerCase().includes('failed to fetch') || msg.toLowerCase().includes('networkerror');
  return (
    <div className="mx-3 my-4 rounded-xl border border-[rgba(232,67,147,0.25)] bg-[rgba(232,67,147,0.06)] p-4">
      <div className="flex items-start gap-2.5">
        <WarningCircle size={16} weight="bold" className="text-[#E84393] shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-[#E84393]">
            Couldn&rsquo;t load {context}
          </div>
          <div className="text-[11px] text-[#7A7363] mt-1 leading-relaxed">
            {isOffline
              ? `Network error — is the backend running on ${BACKEND_URL}?`
              : isAuth
                ? 'The backend is rejecting the request. Try restarting the dev server.'
                : msg}
          </div>
          {retry && (
            <button
              onClick={retry}
              className="mt-2.5 text-[11px] font-semibold text-[#D4A853] hover:underline"
            >
              Try again →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
