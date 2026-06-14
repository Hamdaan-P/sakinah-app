/**
 * RootOccurrencesSheet
 *
 * Bottom sheet listing every Quranic occurrence of a triliteral/quadriliteral
 * root. Tapping an occurrence jumps the reader to that verse (via the
 * onJumpToVerse callback supplied by the page).
 */

import { useEffect, useState } from 'react';
import { fetchRootOccurrences, type RootOccurrence } from '../services/morphologyService';

interface Props {
  root: string | null;
  open: boolean;
  onClose: () => void;
  onJumpToVerse?: (verseKey: string) => void;
}

export function RootOccurrencesSheet({ root, open, onClose, onJumpToVerse }: Props) {
  const [items, setItems] = useState<RootOccurrence[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !root) return;
    let cancelled = false;
    setLoading(true);
    fetchRootOccurrences(root, 200)
      .then((r) => { if (!cancelled) setItems(r); })
      .catch(() => { if (!cancelled) setItems([]); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, root]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open || !root) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Occurrences of root ${root}`}
      className="fixed inset-0 z-50 flex items-end justify-center"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 bg-black/60"
      />
      <div className="relative w-full md:max-w-lg max-h-[80vh] bg-[#0A0E16] border-t border-[rgba(212,168,83,0.20)] rounded-t-2xl flex flex-col shadow-2xl">
        <header className="flex items-center justify-between px-4 py-3 border-b border-[rgba(212,168,83,0.15)]">
          <div>
            <p className="text-xs uppercase tracking-wide text-[#7A7363]">Arabic Root</p>
            <h2 className="text-lg font-arabic text-[#D4A853]" dir="rtl">{root}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[#7A7363] hover:text-[#F5E8C7] text-xl"
          >
            ×
          </button>
        </header>

        <div className="overflow-y-auto p-4">
          {loading && <p className="text-sm text-[#7A7363]" aria-busy="true">Loading occurrences…</p>}
          {!loading && items && items.length === 0 && (
            <p className="text-sm text-[#7A7363]">
              No occurrences indexed for this root yet.
            </p>
          )}
          {!loading && items && items.length > 0 && (
            <>
              <p className="text-xs text-[#7A7363] mb-3">
                {items.length} occurrence{items.length === 1 ? '' : 's'} in the Quran.
              </p>
              <ul className="space-y-2">
                {items.map((occ, i) => (
                  <li key={`${occ.verse_key}-${occ.word_index}-${i}`}>
                    <button
                      type="button"
                      onClick={() => {
                        onJumpToVerse?.(occ.verse_key);
                        onClose();
                      }}
                      className="w-full text-left rounded-md border border-[rgba(212,168,83,0.15)] bg-[#10151F]/40 px-3 py-2 hover:bg-[#10151F]/70"
                    >
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <span className="text-xs text-[#D4A853] font-semibold">{occ.verse_key}</span>
                        <span className="text-xs text-[#7A7363]">{occ.surah_name}</span>
                      </div>
                      <p className="text-base font-arabic text-[#F5E8C7] mb-0.5" dir="rtl">
                        {occ.snippet}
                      </p>
                      <p className="text-[11px] italic text-[#7A7363]">
                        Form: {occ.form}
                      </p>
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
