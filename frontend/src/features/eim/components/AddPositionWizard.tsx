/**
 * Three-step add-position wizard for the open-universe simulator.
 *
 *   Step 1 — Search:  ticker autocomplete (any yfinance-listed stock).
 *                     Suggested starters (the curated ASSETS) are shown above
 *                     the autocomplete so users have one-click on-ramps.
 *   Step 2 — Date & qty: buy-date picker + quantity field. Renders the
 *                     <TimeframeComparePanel> below so the user can see
 *                     historical context the moment they pick a date.
 *   Step 3 — Confirm: summary + a loud Shariah warning if status ≠ pass.
 *                     User can still proceed — this is a *learning*
 *                     simulator, not a gatekeeper (per project decision).
 */

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, MagnifyingGlass, X } from '@phosphor-icons/react';
import { eimService } from '../services/eim.service';
import type {
  Asset,
  StockSnapshot,
  TickerSearchResult,
  TripleShariah,
} from '../types/eim.types';
import { DataQualityStrip } from './DataQualityStrip';
import { InvestabilityRing } from './InvestabilityRing';
import { TimeframeComparePanel } from './TimeframeComparePanel';
import { useCurrencyFormat } from '../hooks/useCurrencyFormat';
import type { Currency } from '../stores/currency.store';

/** ISO country code → regional-indicator flag emoji. Falls back to a globe
 *  for unknown codes so the row never breaks. */
function _flag(code: string): string {
  if (!code || code.length !== 2) return '🌐';
  const A = 0x1f1e6;
  const upper = code.toUpperCase();
  const cp1 = A + (upper.charCodeAt(0) - 'A'.charCodeAt(0));
  const cp2 = A + (upper.charCodeAt(1) - 'A'.charCodeAt(0));
  if (cp1 < A || cp2 < A) return '🌐';
  return String.fromCodePoint(cp1) + String.fromCodePoint(cp2);
}

/** Lazy preview of the investability score for the picked ticker. Stays
 *  visually subordinate to the Shariah verdict (which is the loudest
 *  signal in the confirm step) but gives a quick five-pillar snapshot. */
function InvestabilityPreview({ ticker }: { ticker: string }) {
  const q = useQuery({
    queryKey: ['eim', 'investability', ticker],
    queryFn: () => eimService.getInvestability(ticker),
    staleTime: 5 * 60_000,
  });
  return (
    <div className="rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.14)] p-3">
      <InvestabilityRing score={q.data} loading={q.isLoading} size="sm" drilldown="collapsed" />
    </div>
  );
}

interface Props {
  /** Curated starter assets shown above the autocomplete. */
  suggestedStarters: Asset[];
  onCancel: () => void;
  onSubmit: (input: {
    ticker: string;
    qty: number;
    buy_price: number;
    buy_date: string;
  }) => void;
}

type Step = 'search' | 'date_qty' | 'confirm';

interface PickedTicker {
  ticker: string;
  name: string;
}

function _todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

// Earliest date the picker allows. Older audiences may have held a stock for
// 20+ years (e.g. MSFT bought in the 90s, TCS bought at IPO in 2004). yfinance
// returns whatever data the exchange has on file. If the user picks a date
// before the ticker existed, the historical-at API returns `available: false`
// and the wizard surfaces a "no data" cell — no error, no block.
const _EARLIEST_BUY_DATE = '1970-01-01';

function _shariahLabel(triple: TripleShariah | null | undefined): {
  pass: boolean;
  copy: string;
  tone: 'pass' | 'warn' | 'unknown';
} {
  if (!triple) return { pass: false, copy: 'Shariah status unknown', tone: 'unknown' };
  // Pass = composite ≥ 60 across the triple — same threshold the screener uses.
  const ok = triple.composite >= 60;
  if (ok) return { pass: true, copy: `Shariah composite ${triple.composite}/100`, tone: 'pass' };
  return {
    pass: false,
    copy: `Fails Shariah screen (composite ${triple.composite}/100)`,
    tone: 'warn',
  };
}

export function AddPositionWizard({ suggestedStarters, onCancel, onSubmit }: Props) {
  const [step, setStep] = useState<Step>('search');
  const [query, setQuery] = useState('');
  const [picked, setPicked] = useState<PickedTicker | null>(null);
  const [buyDate, setBuyDate] = useState(_todayIso());
  const [qty, setQty] = useState('1');
  /** Optional country filter applied to the search results. `null` = all. */
  const [countryFilter, setCountryFilter] = useState<string | null>(null);

  // Debounced search query
  const [debounced, setDebounced] = useState('');
  useEffect(() => {
    const t = window.setTimeout(() => setDebounced(query.trim()), 200);
    return () => window.clearTimeout(t);
  }, [query]);

  // Reset the country filter whenever the user types a new query.
  useEffect(() => {
    setCountryFilter(null);
  }, [debounced]);

  const searchQ = useQuery({
    queryKey: ['eim', 'ticker-search', debounced],
    queryFn: () => eimService.lookupTicker(debounced),
    enabled: debounced.length >= 1 && step === 'search',
    staleTime: 5 * 60_000,
  });

  const snapQ = useQuery({
    queryKey: ['eim', 'snapshot', picked?.ticker],
    queryFn: () => eimService.getStockSnapshot(picked!.ticker),
    enabled: !!picked && (step === 'date_qty' || step === 'confirm'),
    staleTime: 5 * 60_000,
  });

  const snap: StockSnapshot | undefined = snapQ.data;
  const shariah = useMemo(() => _shariahLabel(snap?.shariah), [snap]);
  const { format } = useCurrencyFormat();
  const nativeCcy = (snap?.currency as Currency | undefined) || 'USD';

  const handlePick = (t: PickedTicker) => {
    setPicked(t);
    setStep('date_qty');
  };

  const handleNext = () => {
    const n = parseFloat(qty);
    if (!isFinite(n) || n <= 0) return;
    if (!buyDate) return;
    setStep('confirm');
  };

  const handleSubmit = () => {
    if (!picked || !snap) return;
    const n = parseFloat(qty);
    if (!isFinite(n) || n <= 0) return;
    // Use the picked-date close if we have it, else fall back to today's close.
    // The historical-at query is keyed in TimeframeComparePanel; the API also
    // returns price in the snapshot horizons, but those are fixed offsets.
    // Easiest correct approach: fetch the historical-at here too.
    void eimService.getHistoricalAt(picked.ticker, buyDate).then((h) => {
      const buyPrice = h?.price ?? snap.quote.close;
      onSubmit({
        ticker: picked.ticker,
        qty: n,
        buy_price: buyPrice,
        buy_date: buyDate,
      });
    });
  };

  return (
    <div className="rounded-2xl border border-[rgba(212,168,83,0.30)] bg-[#101a2a] p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        {step !== 'search' && (
          <button
            onClick={() => {
              if (step === 'confirm') setStep('date_qty');
              else if (step === 'date_qty') {
                setPicked(null);
                setStep('search');
              }
            }}
            className="w-7 h-7 rounded-lg text-[#7A7363] hover:text-[#F5E8C7] flex items-center justify-center"
            aria-label="Back"
          >
            <ArrowLeft size={14} weight="bold" />
          </button>
        )}
        <div className="flex-1 min-w-0">
          <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
            Add position · step {step === 'search' ? 1 : step === 'date_qty' ? 2 : 3} of 3
          </div>
          <div className="text-[13px] font-bold text-[#F5E8C7]">
            {step === 'search' && 'Pick a stock'}
            {step === 'date_qty' && `${picked?.ticker} — date & quantity`}
            {step === 'confirm' && `Confirm ${picked?.ticker}`}
          </div>
        </div>
        <button
          onClick={onCancel}
          className="w-7 h-7 rounded-lg text-[#5C5749] hover:text-[#F5E8C7] flex items-center justify-center"
          aria-label="Close"
        >
          <X size={14} weight="bold" />
        </button>
      </div>

      {/* Step 1: Search */}
      {step === 'search' && (
        <div className="space-y-3">
          <div className="relative">
            <MagnifyingGlass
              size={14}
              weight="bold"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C5749]"
            />
            <input
              // eslint-disable-next-line jsx-a11y/no-autofocus -- deliberate: search-step entry input in a wizard
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search any stock — AAPL, TCS, RELIANCE…"
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.20)] text-[13px] text-[#F5E8C7] focus:outline-none focus:border-[rgba(212,168,83,0.50)]"
            />
          </div>

          {/* Suggested starters */}
          {!debounced && suggestedStarters.length > 0 && (
            <div>
              <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-1.5">
                Suggested starters
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {suggestedStarters.map((a) => (
                  <button
                    key={a.ticker}
                    onClick={() => handlePick({ ticker: a.ticker, name: a.name })}
                    className="text-left rounded-lg bg-[#0F1724] border border-[rgba(212,168,83,0.14)] p-2 hover:border-[rgba(212,168,83,0.40)]"
                  >
                    <div className="text-[12px] font-bold text-[#F5E8C7]">{a.ticker}</div>
                    <div className="text-[10px] text-[#7A7363] truncate">{a.name}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Search results */}
          {debounced && (
            <SearchResults
              results={searchQ.data ?? []}
              loading={searchQ.isLoading}
              countryFilter={countryFilter}
              onPickCountry={setCountryFilter}
              onPickTicker={handlePick}
            />
          )}
        </div>
      )}

      {/* Step 2: Date + quantity + comparison panel */}
      {step === 'date_qty' && picked && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="add-position-buy-date" className="text-[10px] uppercase tracking-widest text-[#5C5749] font-semibold">
                Buy date
              </label>
              <input
                id="add-position-buy-date"
                type="date"
                value={buyDate}
                min={_EARLIEST_BUY_DATE}
                max={_todayIso()}
                onChange={(e) => setBuyDate(e.target.value)}
                className="w-full mt-1 h-10 px-3 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.20)] text-[12px] text-[#F5E8C7] focus:outline-none focus:border-[rgba(212,168,83,0.50)]"
              />
              <div className="text-[9px] text-[#5C5749] mt-1 leading-tight">
                Any past date. If the stock didn't exist yet, you'll see "no data" below.
              </div>
            </div>
            <div>
              <label htmlFor="add-position-qty" className="text-[10px] uppercase tracking-widest text-[#5C5749] font-semibold">
                Quantity
              </label>
              <input
                id="add-position-qty"
                type="number"
                value={qty}
                step="0.01"
                min="0.01"
                onChange={(e) => setQty(e.target.value)}
                className="w-full mt-1 h-10 px-3 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.20)] text-[12px] text-[#F5E8C7] focus:outline-none focus:border-[rgba(212,168,83,0.50)]"
              />
            </div>
          </div>

          <TimeframeComparePanel ticker={picked.ticker} buyDate={buyDate} />

          <DataQualityStrip dq={snap?.data_quality} />

          <button
            onClick={handleNext}
            disabled={!parseFloat(qty) || !buyDate}
            className="w-full h-10 rounded-xl text-[12px] font-bold text-[#0A0E16] disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
          >
            Review &amp; confirm →
          </button>
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 'confirm' && picked && snap && (
        <div className="space-y-3">
          <div className="rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.14)] p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[13px] font-bold text-[#F5E8C7]">{picked.ticker}</span>
              <span className="text-[10px] text-[#5C5749] truncate">{picked.name}</span>
            </div>
            <div className="text-[11px] text-[#7A7363]">
              {qty} share{parseFloat(qty) !== 1 ? 's' : ''} · bought {buyDate}
            </div>
            <div className="text-[11px] text-[#7A7363] mt-1">
              Current price:{' '}
              <span className="text-[#D4A853] font-semibold">
                {format(snap.quote.close, nativeCcy)}
              </span>
              {snap.quote.pe && (
                <>
                  {' · P/E '}
                  <span className="text-[#F5E8C7]">{Number(snap.quote.pe).toFixed(1)}</span>
                </>
              )}
              {snap.sector && (
                <>
                  {' · '}
                  <span className="text-[#5C5749]">{snap.sector}</span>
                </>
              )}
            </div>
          </div>

          {/* Investability preview — runs the full pillar pipeline against
              this ticker before commit, so the user sees the composite score
              + factor drill-down before adding the position. Lazy-loaded
              with a 5-min staleTime to match the holding-card pattern. */}
          <InvestabilityPreview ticker={picked.ticker} />

          {/* Shariah verdict — loud when not passing */}
          {shariah.tone === 'pass' && (
            <div className="rounded-xl border border-[rgba(34,197,94,0.30)] bg-[rgba(34,197,94,0.06)] p-3 text-[11px] text-[#22C55E]">
              ✓ {shariah.copy}. Position added for learning.
            </div>
          )}
          {shariah.tone === 'warn' && (
            <div className="rounded-xl border border-[rgba(232,67,147,0.40)] bg-[rgba(232,67,147,0.08)] p-3 text-[11px] text-[#E84393]">
              <div className="font-bold mb-1">⚠ {shariah.copy}</div>
              <div className="text-[#FFC2D6] leading-snug">
                You can still add this position — comparing screened vs unscreened
                holdings is a legitimate learning exercise. But this is the kind
                of stock the AI Mentor will flag, and that's the point.
              </div>
            </div>
          )}
          {shariah.tone === 'unknown' && (
            <div className="rounded-xl border border-[rgba(212,168,83,0.30)] bg-[rgba(212,168,83,0.06)] p-3 text-[11px] text-[#D4A853]">
              Shariah composite unavailable for this ticker. The AI Mentor will
              still analyse it through your chosen lens.
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStep('date_qty')}
              className="flex-1 h-10 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.18)] text-[12px] text-[#7A7363]"
            >
              ← Edit
            </button>
            <button
              onClick={handleSubmit}
              className="flex-1 h-10 rounded-xl text-[12px] font-bold text-[#0A0E16]"
              style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
            >
              Add to portfolio
            </button>
          </div>
        </div>
      )}

      {step === 'confirm' && snapQ.isLoading && (
        <div className="text-[12px] text-[#5C5749] py-3 text-center">
          Loading {picked?.ticker} details…
        </div>
      )}
    </div>
  );
}

/** Result list with country-filter chips. The chips only render when the
 *  results span ≥2 countries — single-country searches stay friction-free. */
function SearchResults({
  results,
  loading,
  countryFilter,
  onPickCountry,
  onPickTicker,
}: {
  results: TickerSearchResult[];
  loading: boolean;
  countryFilter: string | null;
  onPickCountry: (c: string | null) => void;
  onPickTicker: (t: PickedTicker) => void;
}) {
  // Count rows per country to drive the chip row.
  const counts = useMemo(() => {
    const m = new Map<string, number>();
    for (const r of results) {
      const k = r.country || 'XX';
      m.set(k, (m.get(k) ?? 0) + 1);
    }
    return Array.from(m.entries()).sort((a, b) => b[1] - a[1]);
  }, [results]);

  const filtered = countryFilter
    ? results.filter((r) => r.country === countryFilter)
    : results;

  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
          {loading ? 'Searching…' : `${results.length} result${results.length === 1 ? '' : 's'}`}
        </div>
      </div>

      {/* Country filter chips — only when ≥2 countries are present */}
      {counts.length >= 2 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          <button
            onClick={() => onPickCountry(null)}
            className={[
              'h-7 px-2.5 rounded-full text-[10px] font-semibold transition-colors',
              countryFilter === null
                ? 'bg-[rgba(212,168,83,0.18)] text-[#F5E8C7] border border-[rgba(212,168,83,0.50)]'
                : 'bg-[#0F1724] text-[#7A7363] border border-[rgba(212,168,83,0.14)] hover:border-[rgba(212,168,83,0.30)]',
            ].join(' ')}
          >
            All {results.length}
          </button>
          {counts.map(([code, n]) => (
            <button
              key={code}
              onClick={() => onPickCountry(countryFilter === code ? null : code)}
              className={[
                'h-7 px-2.5 rounded-full text-[10px] font-semibold transition-colors flex items-center gap-1',
                countryFilter === code
                  ? 'bg-[rgba(212,168,83,0.18)] text-[#F5E8C7] border border-[rgba(212,168,83,0.50)]'
                  : 'bg-[#0F1724] text-[#7A7363] border border-[rgba(212,168,83,0.14)] hover:border-[rgba(212,168,83,0.30)]',
              ].join(' ')}
            >
              <span className="text-[12px] leading-none">{_flag(code)}</span>
              <span>{n}</span>
            </button>
          ))}
        </div>
      )}

      <div className="space-y-1 max-h-72 overflow-y-auto">
        {filtered.map((r) => (
          <button
            key={r.ticker}
            onClick={() => onPickTicker({ ticker: r.ticker, name: r.name })}
            className="w-full text-left rounded-lg bg-[#0F1724] border border-[rgba(212,168,83,0.14)] p-2.5 hover:border-[rgba(212,168,83,0.40)] transition-colors"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[13px] font-bold text-[#F5E8C7] truncate">{r.ticker}</span>
                <span className="text-[10px] text-[#5C5749] truncate">{r.name}</span>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <span className="text-[14px] leading-none">{_flag(r.country)}</span>
                <span className="text-[9px] uppercase tracking-wider text-[#7A7363]">
                  {r.exchange}
                </span>
              </div>
            </div>
            {r.type && r.type !== 'EQUITY' && (
              <div className="text-[9px] text-[#5C5749] mt-0.5">{r.type}</div>
            )}
          </button>
        ))}
        {!loading && filtered.length === 0 && (
          <div className="text-[11px] text-[#5C5749] py-3 text-center">
            {countryFilter
              ? 'No results in this country — clear the filter to see all.'
              : 'No matches. Try a different name or ticker (e.g. NVDA, RELIANCE, TCS).'}
          </div>
        )}
      </div>
    </div>
  );
}

export default AddPositionWizard;
