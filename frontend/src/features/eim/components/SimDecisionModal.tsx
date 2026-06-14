/**
 * SimDecisionModal — pause-to-decide trading surface (Sprint 2.5).
 *
 * Per master plan §6.R.1: the user pauses the Time Machine, opens this
 * modal, places a buy or sell at the current sim_date's price. All
 * validation client-side mirrors `eim_sim_primitives.py` invariants
 * (cash ≥ 0, sell qty ≤ open shares, no shorting). The backend
 * `recordDecision` route is the authoritative validator — if the
 * client check is wrong, the server rejects with a 400 surfaced inline.
 *
 * Price source: SimEngine.currentPrice(ticker) — already firewalled to
 * sim_date (D34), so no future leak even if the modal is left open
 * while the user resumes briefly and re-pauses.
 *
 * Reflection note is optional but encouraged (the pedagogy bullet in
 * D26 — captures *why* the user made the decision for the Mizan Mirror
 * post-mortem to chew on later).
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { X } from '@phosphor-icons/react';
import { SimEngine } from '../engine/eimSimEngine';
import { useCurrencyFormat } from '../hooks/useCurrencyFormat';
import type { Currency } from '../stores/currency.store';
import type { HoldingSummary, SimSession, SimTransactionKind } from '../types/eim.types';

const FILL_EPSILON = 1e-6;

export interface SimDecisionModalProps {
  session: SimSession;
  engine: SimEngine;
  /** Aggregated open holdings (qty + avg cost per ticker) — used for the
   *  Sell tab. Caller computes this via `useEimStore.holdingsFor` or
   *  similar. Passing it in keeps the modal pure-presentation. */
  holdings: HoldingSummary[];
  onClose: () => void;
  onSubmit: (payload: {
    kind: Extract<SimTransactionKind, 'BUY' | 'SELL'>;
    ticker: string;
    qty: number;
    price: number;
    reflection_note?: string;
  }) => Promise<void>;
}

type Tab = 'buy' | 'sell';

export function SimDecisionModal({ session, engine, holdings, onClose, onSubmit }: SimDecisionModalProps) {
  // All sim cash/price/P&L amounts are denominated in the session currency;
  // `money` converts them into the user's chosen display currency.
  const { format } = useCurrencyFormat();
  const sessionCcy = session.currency as Currency;
  const money = useCallback(
    (n: number) => format(n, sessionCcy, { maxDecimals: 2 }),
    [format, sessionCcy],
  );
  const [tab, setTab] = useState<Tab>('buy');
  // Per item 3: only show tickers that actually have a price at sim_date
  // (engine.currentPrice is the firewall-safe indicator). Tickers selected
  // at creation but not yet listed (e.g. TSLA in a 2008 sim before 2010-06)
  // appear in the "Not yet available" list at the bottom of the modal.
  const tickerAvailability = useMemo(() => {
    const available: string[] = [];
    const pending: string[] = [];
    for (const t of session.tickers) {
      if (engine.currentPrice(t) !== null) available.push(t);
      else pending.push(t);
    }
    return { available, pending };
  }, [session.tickers, engine]);
  const buyableTickers = tickerAvailability.available;
  const [buyTicker, setBuyTicker] = useState<string>(buyableTickers[0] ?? '');
  const [sellTicker, setSellTicker] = useState<string>(holdings[0]?.ticker ?? '');
  const [qtyStr, setQtyStr] = useState<string>('1');
  const [note, setNote] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset error + qty when switching tabs or ticker.
  useEffect(() => {
    setError(null);
  }, [tab, buyTicker, sellTicker, qtyStr]);

  // Default sell qty to the full holding on selection.
  useEffect(() => {
    if (tab !== 'sell') return;
    const h = holdings.find((x) => x.ticker === sellTicker);
    if (h) setQtyStr(String(h.total_qty));
  }, [tab, sellTicker, holdings]);

  const qty = Number(qtyStr) || 0;
  const ticker = tab === 'buy' ? buyTicker : sellTicker;
  const price = ticker ? engine.currentPrice(ticker) : null;

  const validity = useMemo(() => {
    if (!ticker) return { ok: false, reason: 'Pick a ticker.' };
    if (price === null) return { ok: false, reason: `No price for ${ticker} at ${engine.simDate}.` };
    if (qty <= 0) return { ok: false, reason: 'Quantity must be > 0.' };
    if (tab === 'buy') {
      const cost = qty * price;
      if (cost > session.portfolio.cash_balance + FILL_EPSILON) {
        return { ok: false, reason: `Need ${money(cost)}; have ${money(session.portfolio.cash_balance)}.` };
      }
    } else {
      const h = holdings.find((x) => x.ticker === ticker);
      const open = h?.total_qty ?? 0;
      if (qty > open + FILL_EPSILON) {
        return { ok: false, reason: `Selling ${qty}; you hold ${open}. (No shorting in the sim.)` };
      }
    }
    return { ok: true as const, reason: '' };
  }, [tab, ticker, price, qty, session.portfolio.cash_balance, holdings, engine, money]);

  const handleSubmit = async () => {
    if (!validity.ok || !ticker || price === null || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      await onSubmit({
        kind: tab === 'buy' ? 'BUY' : 'SELL',
        ticker,
        qty,
        price,
        reflection_note: note.trim() || undefined,
      });
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  // Preview lines
  const previewLines = (() => {
    if (!ticker || price === null || qty <= 0) return [];
    if (tab === 'buy') {
      const cost = qty * price;
      const cashAfter = session.portfolio.cash_balance - cost;
      return [
        ['Cost', money(cost)],
        ['Cash after', money(cashAfter)],
      ];
    }
    const h = holdings.find((x) => x.ticker === ticker);
    const avgCost = h?.avg_cost ?? 0;
    const proceeds = qty * price;
    const realised = (price - avgCost) * qty;
    return [
      ['Proceeds', money(proceeds)],
      ['Avg cost', money(avgCost)],
      ['Realised P&L', `${realised < 0 ? '-' : '+'}${money(Math.abs(realised))}`],
    ];
  })();

  const realisedPositive = tab === 'sell' && price !== null && (price - (holdings.find((x) => x.ticker === ticker)?.avg_cost ?? 0)) > 0;

  return (
    // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sim-decision-modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 px-3 pb-3 sm:p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md rounded-2xl border border-[rgba(212,168,83,0.30)] bg-[#101a2a] shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(212,168,83,0.18)]">
          <div>
            <h2 id="sim-decision-modal-title" className="text-[14px] font-bold text-[#F5E8C7]">
              Place a trade
            </h2>
            <div className="text-[10px] text-[#7A7363] mt-0.5">
              Sim date: <span className="text-[#D4A853]">{engine.simDate}</span>
              {' · '}
              Cash: {money(session.portfolio.cash_balance)}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#7A7363] hover:text-[#F5E8C7] hover:bg-[rgba(212,168,83,0.10)]"
            aria-label="Close"
          >
            <X size={14} weight="bold" />
          </button>
        </div>

        {/* Tabs */}
        <div role="tablist" aria-label="Trade type" className="flex border-b border-[rgba(212,168,83,0.18)]">
          {(['buy', 'sell'] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => { setTab(t); setQtyStr('1'); }}
              className={
                'flex-1 h-10 text-[12px] font-bold uppercase tracking-wider ' +
                (tab === t
                  ? 'text-[#F5E8C7] border-b-2 border-[#D4A853]'
                  : 'text-[#5C5749] hover:text-[#7A7363]')
              }
            >
              {t === 'buy' ? 'Buy' : 'Sell'}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-4 space-y-3">
          {tab === 'buy' ? (
            buyableTickers.length === 0 ? (
              <div className="text-[12px] text-[#7A7363] py-2">
                No tickers available at {engine.simDate}. Step the sim forward to unlock listings.
              </div>
            ) : (
              <FieldSelect
                label="Ticker"
                value={buyableTickers.includes(buyTicker) ? buyTicker : buyableTickers[0]}
                onChange={setBuyTicker}
                options={buyableTickers.map((t) => ({ value: t, label: t }))}
              />
            )
          ) : holdings.length === 0 ? (
            <div className="text-[12px] text-[#7A7363] py-2">
              No open holdings to sell. Switch to Buy to open a position.
            </div>
          ) : (
            <FieldSelect
              label="Holding"
              value={sellTicker}
              onChange={setSellTicker}
              options={holdings.map((h) => ({
                value: h.ticker,
                label: `${h.ticker} — ${h.total_qty} @ avg ${money(h.avg_cost)}`,
              }))}
            />
          )}

          <FieldText
            label={`Qty${price !== null ? ` (price ${money(price)} per share)` : ''}`}
            type="number"
            value={qtyStr}
            onChange={setQtyStr}
            min="0"
            step="any"
          />

          {previewLines.length > 0 && (
            <div className="rounded-lg bg-[#0F1724] border border-[rgba(212,168,83,0.10)] p-3 space-y-1">
              {previewLines.map(([label, val]) => (
                <div key={label} className="flex justify-between text-[12px]">
                  <span className="text-[#7A7363]">{label}</span>
                  <span className={
                    label === 'Realised P&L'
                      ? (realisedPositive ? 'text-[#5FC986] font-bold' : 'text-[#E84393] font-bold')
                      : 'text-[#F5E8C7] font-semibold'
                  }>
                    {val}
                  </span>
                </div>
              ))}
            </div>
          )}

          <FieldText
            label="Why are you doing this? (optional)"
            type="text"
            value={note}
            onChange={setNote}
            placeholder="e.g. fundamentals strong, long-term hold"
          />

          {!validity.ok && qty > 0 && (
            <div className="text-[11px] text-[#E8C97A] px-2 py-1 rounded bg-[rgba(232,201,122,0.10)]">
              {validity.reason}
            </div>
          )}
          {error && (
            <div className="text-[11px] text-[#E84393] px-2 py-1 rounded bg-[rgba(232,67,147,0.10)]">
              {error}
            </div>
          )}

          {tab === 'buy' && tickerAvailability.pending.length > 0 && (
            <div className="text-[10px] text-[#5C5749] border-t border-[rgba(212,168,83,0.10)] pt-2">
              <div className="uppercase tracking-widest mb-1">Not yet listed:</div>
              <div className="flex flex-wrap gap-1.5">
                {tickerAvailability.pending.map((t) => (
                  <span key={t} className="px-1.5 py-0.5 rounded bg-[#0F1724] text-[#7A7363]">
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-1 text-[10px] text-[#5C5749]">
                These tickers exist in your universe but have no bar at {engine.simDate}. Available once the sim crosses each one's first listing date.
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-2 p-3 border-t border-[rgba(212,168,83,0.18)]">
          <button
            onClick={onClose}
            className="flex-1 h-10 rounded-xl bg-[#0F1724] border border-[rgba(212,168,83,0.18)] text-[12px] text-[#7A7363]"
          >
            Cancel
          </button>
          <button
            onClick={() => void handleSubmit()}
            disabled={!validity.ok || submitting}
            className="flex-1 h-10 rounded-xl text-[12px] font-bold text-[#0A0E16] disabled:opacity-50"
            style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
          >
            {submitting ? 'Recording…' : tab === 'buy' ? 'Buy' : 'Sell'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Small field helpers ──────────────────────────────────────────────────

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  const id = `sim-dm-${label.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <div>
      <label htmlFor={id} className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold block mb-1">
        {label}
      </label>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-2 rounded-lg bg-[#0F1724] border border-[rgba(212,168,83,0.20)] text-[13px] text-[#F5E8C7]"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function FieldText({
  label,
  value,
  onChange,
  type = 'text',
  min,
  step,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: 'text' | 'number';
  min?: string;
  step?: string;
  placeholder?: string;
}) {
  const id = `sim-dm-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 30)}`;
  return (
    <div>
      <label htmlFor={id} className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold block mb-1">
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        min={min}
        step={step}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-lg bg-[#0F1724] border border-[rgba(212,168,83,0.20)] text-[13px] text-[#F5E8C7] placeholder:text-[#5C5749]"
      />
    </div>
  );
}

export default SimDecisionModal;
