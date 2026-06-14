/**
 * EIM Simulator — SimEngine (Sprint 2).
 *
 * The load-bearing piece of the Time Machine: a client-side sim clock with
 * a STATE FIREWALL (D34). The engine eagerly loads the full OHLC + event
 * corpus for the session's tickers, then exposes ONLY data with
 * `date <= simDate` to the rest of the app.
 *
 * Per master plan §6.R + D26 / D34:
 *   - Frontend ticks at user speed; backend stores final state only.
 *   - No UI, persona prompt, or computed metric may receive future-dated
 *     data. Enforced by the privacy of `#rawOhlc` / `#rawEvents` (real
 *     JS private fields, not just `private` keyword) and by the
 *     anti-leakage CI test in `__tests__/sim-engine-firewall.test.ts`.
 *
 * Design notes:
 *   - sim_date advances forward only. Backwards travel would either need
 *     to rebuild the portfolio from start + decisions (architecturally
 *     heavy, deferred to Scenario Lab branching per D31) or risk
 *     leaking future data into the UI. v1 rejects backward moves outright.
 *   - sim_date clamps to end_date; reaching end_date sets status='ended'.
 *   - The engine does NOT persist anything. The store + REST service
 *     handle persistence.
 *
 * Usage:
 *   const engine = new SimEngine({ startDate: '2008-01-01',
 *                                  endDate: '2010-12-31',
 *                                  ohlc, events });
 *   engine.play(); engine.advanceTo('2008-09-15');
 *   engine.visiblePrices('AAPL');   // returns only bars <= 2008-09-15
 *   engine.currentPrice('AAPL');    // returns AAPL close on or before 2008-09-15
 */

import type {
  MonthlyOhlcBar,
  SimEventCard,
  SimSessionStatus,
  SimSpeed,
} from '../types/eim.types';

// ── Errors ─────────────────────────────────────────────────────────────────

export class SimEngineError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SimEngineError';
  }
}

// ── Engine ─────────────────────────────────────────────────────────────────

export interface SimEngineInit {
  /** Inclusive ISO YYYY-MM-DD. */
  startDate: string;
  /** Inclusive ISO YYYY-MM-DD; engine clamps and auto-ends at this date. */
  endDate: string;
  /** Full historical OHLC per ticker, eagerly loaded at session creation.
   *  The engine internally stores a defensive copy keyed by ticker; the
   *  caller may discard the input map after construction. */
  ohlc: ReadonlyMap<string, readonly MonthlyOhlcBar[]> | Record<string, readonly MonthlyOhlcBar[]>;
  /** Tier 1 event corpus (already filtered to the session's date range is fine
   *  but not required — the firewall filters at read time). */
  events?: readonly SimEventCard[];
  /** Optional override; defaults to startDate. */
  initialSimDate?: string;
  /** Optional override; defaults to '1yr_per_sec'. */
  initialSpeed?: SimSpeed;
}

export class SimEngine {
  // Real JS private fields — these are unreachable from outside the class,
  // even via runtime inspection / Object.keys / structuredClone. The
  // state-firewall guarantee depends on this privacy.
  #rawOhlc: Map<string, readonly MonthlyOhlcBar[]>;
  #rawEvents: readonly SimEventCard[];

  // Sim state — readable via public getters but only mutated by methods.
  #startDate: string;
  #endDate: string;
  #simDate: string;
  #status: SimSessionStatus = 'idle';
  #speed: SimSpeed;

  constructor(init: SimEngineInit) {
    this.#startDate = init.startDate;
    this.#endDate = init.endDate;
    this.#simDate = init.initialSimDate ?? init.startDate;
    this.#speed = init.initialSpeed ?? '1yr_per_sec';

    if (this.#endDate < this.#startDate) {
      throw new SimEngineError(
        `endDate ${this.#endDate} must be >= startDate ${this.#startDate}`,
      );
    }
    if (this.#simDate < this.#startDate || this.#simDate > this.#endDate) {
      throw new SimEngineError(
        `initialSimDate ${this.#simDate} must be in [${this.#startDate}, ${this.#endDate}]`,
      );
    }

    // Normalise OHLC input to a Map. We DON'T deep-clone the bars (immutable
    // by convention — the engine never mutates them). Sort each ticker's
    // bars by date so visiblePrices can do an O(log n) bisect later if needed.
    const m = new Map<string, readonly MonthlyOhlcBar[]>();
    const source = init.ohlc instanceof Map
      ? Array.from(init.ohlc.entries())
      : Object.entries(init.ohlc);
    for (const [ticker, bars] of source) {
      const sorted = [...bars].sort((a, b) => a.time.localeCompare(b.time));
      m.set(ticker, sorted);
    }
    this.#rawOhlc = m;

    // Events deduplicated by id + sorted by date.
    const seen = new Set<string>();
    const evs: SimEventCard[] = [];
    for (const ev of init.events ?? []) {
      if (seen.has(ev.id)) continue;
      seen.add(ev.id);
      evs.push(ev);
    }
    evs.sort((a, b) => a.date.localeCompare(b.date));
    this.#rawEvents = evs;
  }

  // ── Read-only state ─────────────────────────────────────────────────────

  get startDate(): string { return this.#startDate; }
  get endDate(): string { return this.#endDate; }
  get simDate(): string { return this.#simDate; }
  get status(): SimSessionStatus { return this.#status; }
  get speed(): SimSpeed { return this.#speed; }
  get tickers(): readonly string[] { return Array.from(this.#rawOhlc.keys()); }

  // ── Firewalled read methods ─────────────────────────────────────────────

  /** All bars for ticker with date <= simDate. Empty array if ticker unknown. */
  visiblePrices(ticker: string): readonly MonthlyOhlcBar[] {
    const bars = this.#rawOhlc.get(ticker);
    if (!bars) return [];
    // Bars are pre-sorted; linear filter is fine for monthly granularity
    // (max ~420 bars / 35yr at 1mo). Switch to bisect if profiling demands.
    return bars.filter((bar) => bar.time <= this.#simDate);
  }

  /** Close price of the last bar at-or-before simDate. Null if no bars yet. */
  currentPrice(ticker: string): number | null {
    const visible = this.visiblePrices(ticker);
    if (visible.length === 0) return null;
    return visible[visible.length - 1].close;
  }

  /** Price lookup object suitable for `unrealisedPnl` / portfolio valuation. */
  currentPrices(): Record<string, number> {
    const out: Record<string, number> = {};
    for (const ticker of this.#rawOhlc.keys()) {
      const p = this.currentPrice(ticker);
      if (p !== null) out[ticker] = p;
    }
    return out;
  }

  /** All events with date <= simDate. Pass `lookbackDays` to narrow to recent
   *  events (useful for the right-rail card display). */
  visibleEvents(opts?: { lookbackDays?: number }): readonly SimEventCard[] {
    const filtered = this.#rawEvents.filter((ev) => ev.date <= this.#simDate);
    if (!opts?.lookbackDays) return filtered;
    const cutoff = subtractDays(this.#simDate, opts.lookbackDays);
    return filtered.filter((ev) => ev.date >= cutoff);
  }

  // ── State-machine mutations ─────────────────────────────────────────────

  play(): void {
    this.#assertTransition('playing');
    this.#status = 'playing';
  }

  pause(): void {
    this.#assertTransition('paused');
    this.#status = 'paused';
  }

  end(): void {
    if (this.#status === 'ended') return;
    this.#status = 'ended';
  }

  setSpeed(speed: SimSpeed): void {
    this.#speed = speed;
  }

  /** Advance sim time. Forward-only. Clamps to endDate and auto-ends. */
  advanceTo(newSimDate: string): void {
    if (this.#status === 'idle' || this.#status === 'ended') {
      throw new SimEngineError(
        `cannot advance from ${this.#status}; must be playing or paused`,
      );
    }
    if (newSimDate < this.#simDate) {
      throw new SimEngineError(
        `sim-date can only advance forward; got ${newSimDate} < ${this.#simDate}`,
      );
    }
    const clamped = newSimDate > this.#endDate ? this.#endDate : newSimDate;
    this.#simDate = clamped;
    if (clamped >= this.#endDate) {
      this.#status = 'ended';
    }
  }

  /** Advance by N calendar months. Convenience for tick callbacks. */
  tickMonths(months: number): void {
    if (months <= 0) {
      throw new SimEngineError(`tickMonths requires months > 0; got ${months}`);
    }
    this.advanceTo(addMonths(this.#simDate, months));
  }

  // ── Internal ─────────────────────────────────────────────────────────────

  #assertTransition(next: SimSessionStatus): void {
    const legal: Record<SimSessionStatus, ReadonlySet<SimSessionStatus>> = {
      idle: new Set(['playing', 'ended']),
      playing: new Set(['paused', 'ended']),
      paused: new Set(['playing', 'ended']),
      ended: new Set(),
    };
    if (!legal[this.#status].has(next)) {
      throw new SimEngineError(`illegal transition ${this.#status} → ${next}`);
    }
  }
}

// ── Date helpers (kept private to the engine module — no Luxon/dayjs dep) ─

function addMonths(isoDate: string, months: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  // JS Date handles month overflow correctly: new Date(2008, 11, 1) + 6 months
  // = 2009-06-01. Day-of-month is preserved unless target month is shorter.
  const dt = new Date(Date.UTC(y, m - 1 + months, d));
  return dt.toISOString().slice(0, 10);
}

function subtractDays(isoDate: string, days: number): string {
  const [y, m, d] = isoDate.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d - days));
  return dt.toISOString().slice(0, 10);
}
