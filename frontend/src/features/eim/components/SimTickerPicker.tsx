/**
 * SimTickerPicker — diverse palette + open-universe search (Sprint 8 follow-up).
 *
 * Replaces the old hardcoded 5-tech-chip selectors in Market Rewind and the
 * Strategy Comparator. Two ways to pick:
 *   1. A grouped, sector-diverse starter palette (one-tap chips).
 *   2. A live search box over the full listed universe (D29) — reuses the
 *      same `lookupTicker` autocomplete the portfolio Add-Position wizard uses.
 *
 * Selected tickers render as removable chips above both. Purely controlled:
 * the parent owns the `selected` array via `onChange`.
 */

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Check, MagnifyingGlass, Plus, X } from '@phosphor-icons/react';
import { eimService } from '../services/eim.service';
import { SPECIAL_ASSETS, STARTER_GROUPS, tickerLabel } from '../data/starterTickers';
import type { TickerSearchResult } from '../types/eim.types';

export function SimTickerPicker({
  selected,
  onChange,
  max,
  filteredOut,
}: {
  selected: string[];
  onChange: (next: string[]) => void;
  /** Optional cap on how many tickers can be selected. */
  max?: number;
  /** ticker -> reason; annotates selected chips not yet listed at the start date. */
  filteredOut?: Map<string, string>;
}) {
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 250);
    return () => window.clearTimeout(t);
  }, [query]);

  const atMax = max != null && selected.length >= max;

  const searchQ = useQuery({
    queryKey: ['eim', 'sim-ticker-search', debounced],
    queryFn: () => eimService.lookupTicker(debounced),
    enabled: debounced.length >= 1,
    staleTime: 5 * 60_000,
  });

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  // Islamic-framing notes for any selected "special" asset (e.g. gold/silver
  // spot). Deduped so picking both metals doesn't repeat the shared caveat.
  const selectedNotes = useMemo(() => {
    const seen = new Set<string>();
    const notes: string[] = [];
    for (const t of selected) {
      const meta = SPECIAL_ASSETS[t.toUpperCase()];
      if (meta && !seen.has(meta.note)) {
        seen.add(meta.note);
        notes.push(meta.note);
      }
    }
    return notes;
  }, [selected]);

  const add = (raw: string) => {
    const t = raw.trim().toUpperCase();
    if (!t || selectedSet.has(t) || atMax) return;
    onChange([...selected, t]);
    setQuery('');
    setDebounced('');
  };
  const remove = (t: string) => onChange(selected.filter((x) => x !== t));
  const toggle = (t: string) => (selectedSet.has(t) ? remove(t) : add(t));

  const results = (searchQ.data ?? []).filter((r) => !selectedSet.has(r.ticker.toUpperCase()));

  return (
    <div className="space-y-2.5">
      {/* Selected chips */}
      <div>
        <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold mb-1.5 flex items-center gap-2">
          <span>Selected ({selected.length}{max ? `/${max}` : ''})</span>
        </div>
        {selected.length === 0 ? (
          <div className="text-[11px] text-[#7A7363]">Search below for any stock, ETF, fund or metal — or tap a starter chip.</div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {selected.map((t) => {
              const reason = filteredOut?.get(t);
              return (
                <span
                  key={t}
                  title={reason}
                  className={
                    'inline-flex items-center gap-1 pl-2.5 pr-1.5 h-8 rounded-lg text-[12px] font-bold border ' +
                    (reason
                      ? 'border-[rgba(232,201,122,0.45)] bg-[rgba(232,201,122,0.10)] text-[#E8C97A]'
                      : 'border-[rgba(212,168,83,0.50)] bg-[rgba(212,168,83,0.15)] text-[#F5E8C7]')
                  }
                >
                  {tickerLabel(t)}
                  <button
                    onClick={() => remove(t)}
                    className="w-5 h-5 rounded flex items-center justify-center hover:bg-[rgba(255,255,255,0.08)]"
                    aria-label={`Remove ${tickerLabel(t)}`}
                  >
                    <X size={11} weight="bold" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
        {selectedNotes.length > 0 && (
          <div className="mt-2 space-y-1">
            {selectedNotes.map((n) => (
              <div
                key={n}
                className="text-[10px] text-[#E8C97A] leading-snug flex items-start gap-1.5"
              >
                <span aria-hidden className="mt-[1px]">◆</span>
                <span>{n}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Search — the primary path. The whole listed universe lives here; the
          palette below is only a shortcut, so signpost search loudly. */}
      <div>
        <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold mb-1">
          Add any investment
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 h-10 px-3 rounded-lg bg-[#0F1724] border border-[rgba(212,168,83,0.35)]">
            <MagnifyingGlass size={14} weight="bold" className="text-[#D4A853] flex-shrink-0" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && results[0]) add(results[0].ticker);
              }}
              placeholder={atMax ? `Max ${max} tickers selected` : 'Search any stock, ETF, fund or metal — 1,000s listed…'}
              disabled={atMax}
              aria-label="Search the full listed universe for an investment to add"
              className="flex-1 bg-transparent text-[13px] text-[#F5E8C7] placeholder:text-[#5C5749] focus:outline-none disabled:opacity-50"
            />
          </div>
        {debounced.length >= 1 && !atMax && (
          <div className="absolute z-20 left-0 right-0 mt-1 rounded-lg border border-[rgba(212,168,83,0.25)] bg-[#101a2a] shadow-xl max-h-64 overflow-y-auto">
            {searchQ.isLoading && (
              <div className="px-3 py-2.5 text-[12px] text-[#7A7363]">Searching…</div>
            )}
            {!searchQ.isLoading && results.length === 0 && (
              <div className="px-3 py-2.5 text-[12px] text-[#7A7363]">No matches for "{debounced}".</div>
            )}
            {results.map((r: TickerSearchResult) => (
              <button
                key={`${r.ticker}-${r.exchange_code}`}
                onClick={() => add(r.ticker)}
                className="w-full text-left px-3 py-2 flex items-center gap-2 hover:bg-[rgba(212,168,83,0.08)] border-b border-[rgba(212,168,83,0.06)] last:border-b-0"
              >
                <Plus size={13} weight="bold" className="text-[#D4A853] flex-shrink-0" />
                <span className="text-[12px] font-bold text-[#F5E8C7] flex-shrink-0">{r.ticker}</span>
                <span className="text-[11px] text-[#9A927E] truncate flex-1">{r.name}</span>
                {(r.type === 'MUTUALFUND' || r.type === 'ETF') && (
                  <span className="text-[8px] uppercase tracking-wider px-1 py-0.5 rounded font-semibold text-[#6AA9D8] bg-[rgba(106,169,216,0.12)] flex-shrink-0">
                    {r.type === 'MUTUALFUND' ? 'Fund' : 'ETF'}
                  </span>
                )}
                <span className="text-[9px] uppercase tracking-wider text-[#5C5749] flex-shrink-0">
                  {r.exchange || r.country}
                </span>
              </button>
            ))}
          </div>
          )}
        </div>
        <p className="text-[10px] text-[#7A7363] mt-1 leading-snug">
          The full listed universe lives here — any stock, ETF, mutual fund, or precious metal.
          Try “islamic fund”, “amana”, or a ticker.
        </p>
      </div>

      {/* Grouped palette — a quick-start shortcut, not the whole universe */}
      <div className="space-y-2">
        <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
          Or tap a starter set
        </div>
        {STARTER_GROUPS.map((group) => (
          <div key={group.label}>
            <div className="text-[9px] uppercase tracking-widest text-[#5C5749] mb-1">{group.label}</div>
            <div className="flex flex-wrap gap-1.5">
              {group.tickers.map((t) => {
                const active = selectedSet.has(t);
                const reason = filteredOut?.get(t);
                const disabled = !active && atMax;
                return (
                  <button
                    key={t}
                    onClick={() => toggle(t)}
                    disabled={disabled}
                    title={reason}
                    className={
                      'inline-flex items-center gap-1 px-2.5 h-8 rounded-lg text-[12px] font-bold border transition-colors disabled:opacity-40 ' +
                      (active
                        ? 'border-[rgba(212,168,83,0.50)] bg-[rgba(212,168,83,0.15)] text-[#F5E8C7]'
                        : 'border-[rgba(212,168,83,0.16)] bg-[#0F1724] text-[#7A7363] hover:border-[rgba(212,168,83,0.30)]')
                    }
                  >
                    {active && <Check size={11} weight="bold" />}
                    {tickerLabel(t)}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SimTickerPicker;
