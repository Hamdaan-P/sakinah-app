/**
 * TafsirPanel — stacked layered tafsir cards (Ibn Kathir, Al-Tabari,
 * Ma'ariful Qur'an). Curated only. Empty state when no entries exist.
 */

import { useEffect, useState } from 'react';
import { fetchTafsirs, type TafsirEntry } from '../../../services/tafsirService';
import { SourceCitationChip } from '../../governance/SourceCitationChip';
import { AiDisclaimerBanner } from '../../governance/AiDisclaimerBanner';
import { isAyahInTadabburPilot, TADABBUR_PILOT_SURAH_NAMES } from '../../../config/tadabbur';

interface Props {
  verseKey: string;
}

export function TafsirPanel({ verseKey }: Props) {
  const [items, setItems] = useState<TafsirEntry[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetchTafsirs(verseKey)
      .then((r) => { if (!cancelled) setItems(r); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [verseKey]);

  const toggle = (key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key); else next.add(key);
      return next;
    });
  };

  return (
    <div className="p-4 space-y-4">
      <AiDisclaimerBanner compact />

      {loading && (
        <div className="space-y-2" aria-busy="true">
          <div className="h-3 rounded bg-[#10151F] animate-pulse" />
          <div className="h-3 rounded bg-[#10151F] animate-pulse w-5/6" />
          <div className="h-3 rounded bg-[#10151F] animate-pulse w-4/6" />
        </div>
      )}

      {!loading && error && (
        <p className="text-sm text-[#7A7363]">Could not load tafsir for this ayah.</p>
      )}

      {!loading && !error && items && items.length === 0 && (
        <p className="text-sm text-[#A7B1C0]">
          {isAyahInTadabburPilot(verseKey)
            ? 'No curated tafsir is available for this ayah yet. Try the Ask tab to discuss it with Raya.'
            : `Curated tafsir is currently piloting on ${TADABBUR_PILOT_SURAH_NAMES} — expanding to more surahs soon. Use the Ask tab to discuss this ayah with Raya in the meantime.`}
        </p>
      )}

      {!loading && !error && items && items.length > 0 && (
        <ul className="space-y-3">
          {items.map((entry) => {
            const key = `${entry.source}:${entry.author}`;
            const isExpanded = expanded.has(key);
            const previewLength = 240;
            const isLong = entry.text.length > previewLength;
            const shown = isExpanded || !isLong ? entry.text : entry.text.slice(0, previewLength) + '…';
            return (
              <li
                key={key}
                className="rounded-lg border border-[rgba(212,168,83,0.18)] bg-[#10151F]/50 p-4"
              >
                <header className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-[#F5E8C7]">{entry.title}</h3>
                  <SourceCitationChip
                    citation={{ kind: 'book', book: entry.title, author: entry.author }}
                  />
                </header>
                <p className="text-sm text-[#D7D7D7] leading-relaxed whitespace-pre-line">
                  {shown}
                </p>
                {isLong && (
                  <button
                    type="button"
                    onClick={() => toggle(key)}
                    className="mt-2 text-xs text-[#D4A853] hover:underline"
                  >
                    {isExpanded ? 'Show less' : 'Read more'}
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
