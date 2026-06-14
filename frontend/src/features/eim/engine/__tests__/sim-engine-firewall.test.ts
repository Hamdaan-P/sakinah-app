/**
 * SimEngine — STATE FIREWALL test (Sprint 2 exit gate per D34).
 *
 * Load-bearing CI test: the entire pedagogical value of the Time Machine
 * depends on the persona / UI / metrics NEVER seeing future-dated data
 * even though the engine eagerly loads the full historical OHLC + events.
 *
 * The test loads a synthetic dataset spanning 2005–2026, instantiates the
 * engine at start_date=2008-01-01, advances to 2008-06-01, and asserts:
 *   - visiblePrices never includes any bar with time > 2008-06-01
 *   - currentPrice returns the latest bar at-or-before 2008-06-01
 *   - currentPrices keys are subset of tickers; values are correctly bounded
 *   - visibleEvents never includes any event with date > 2008-06-01
 *   - the private rawOhlc / rawEvents fields are not enumerable
 *     (real JS private fields, not just TS `private` keyword)
 */

import { describe, expect, it } from 'vitest';
import { SimEngine, SimEngineError } from '../eimSimEngine';
import type { MonthlyOhlcBar, SimEventCard } from '../../types/eim.types';

function makeMonthlyBars(_ticker: string, startYear: number, endYear: number): MonthlyOhlcBar[] {
  const bars: MonthlyOhlcBar[] = [];
  let price = 100;
  for (let y = startYear; y <= endYear; y++) {
    for (let m = 1; m <= 12; m++) {
      price *= 1 + (Math.sin(y * 12 + m) * 0.05); // synthetic walk
      const mm = m.toString().padStart(2, '0');
      bars.push({
        time: `${y}-${mm}-01`,
        open: price * 0.98,
        high: price * 1.03,
        low: price * 0.96,
        close: price,
        volume: 1_000_000,
      });
    }
  }
  return bars;
}

function makeEvents(): SimEventCard[] {
  return [
    { id: 'pre-sim-1', date: '2005-08-29', category: 'geopolitical', severity: 'extreme', headline: 'Katrina', context: 'before sim window' },
    { id: 'within-1', date: '2008-03-16', category: 'financial_crisis', severity: 'high', headline: 'Bear Stearns', context: 'within visible window' },
    { id: 'within-2', date: '2008-05-30', category: 'central_bank', severity: 'moderate', headline: 'Fed cut', context: 'within visible window' },
    { id: 'just-after', date: '2008-06-15', category: 'commodity', severity: 'low', headline: 'oil at $140', context: 'after sim_date — MUST NOT LEAK' },
    { id: 'lehman', date: '2008-09-15', category: 'financial_crisis', severity: 'extreme', headline: 'Lehman', context: 'after sim_date — MUST NOT LEAK' },
    { id: 'covid', date: '2020-03-12', category: 'pandemic', severity: 'extreme', headline: 'COVID', context: 'far future — MUST NOT LEAK' },
  ];
}

function makeEngine() {
  const ohlc = new Map<string, MonthlyOhlcBar[]>([
    ['AAPL', makeMonthlyBars('AAPL', 2005, 2026)],
    ['MSFT', makeMonthlyBars('MSFT', 2005, 2026)],
  ]);
  return new SimEngine({
    startDate: '2008-01-01',
    endDate: '2026-01-01',
    ohlc,
    events: makeEvents(),
  });
}

describe('SimEngine — state firewall (D34)', () => {
  it('visiblePrices excludes any bar dated after sim_date', () => {
    const engine = makeEngine();
    engine.play();
    engine.advanceTo('2008-06-01');

    for (const ticker of engine.tickers) {
      const bars = engine.visiblePrices(ticker);
      expect(bars.length).toBeGreaterThan(0); // at least some pre-2008-06 history
      for (const bar of bars) {
        expect(bar.time <= '2008-06-01').toBe(true);
      }
      // Hard assertion: NO future bars leaked
      const future = bars.filter((b) => b.time > '2008-06-01');
      expect(future).toEqual([]);
    }
  });

  it('currentPrice returns the latest bar at or before sim_date', () => {
    const engine = makeEngine();
    engine.play();
    engine.advanceTo('2008-06-01');

    const price = engine.currentPrice('AAPL');
    expect(price).not.toBeNull();

    const bars = engine.visiblePrices('AAPL');
    const lastVisible = bars[bars.length - 1];
    expect(price).toBe(lastVisible.close);
    expect(lastVisible.time <= '2008-06-01').toBe(true);
  });

  it('currentPrices map contains only tickers with visible data and bounded values', () => {
    const engine = makeEngine();
    engine.play();
    engine.advanceTo('2008-06-01');

    const prices = engine.currentPrices();
    for (const [ticker, p] of Object.entries(prices)) {
      expect(engine.tickers).toContain(ticker);
      // Sanity: price equals the firewalled current price
      expect(p).toBe(engine.currentPrice(ticker));
    }
  });

  it('visibleEvents excludes any event dated after sim_date', () => {
    const engine = makeEngine();
    engine.play();
    engine.advanceTo('2008-06-01');

    const visible = engine.visibleEvents();
    const visibleIds = visible.map((ev) => ev.id);
    expect(visibleIds).toContain('within-1');
    expect(visibleIds).toContain('within-2');
    expect(visibleIds).toContain('pre-sim-1');
    // The firewall MUST exclude these
    expect(visibleIds).not.toContain('just-after');
    expect(visibleIds).not.toContain('lehman');
    expect(visibleIds).not.toContain('covid');
  });

  it('visibleEvents lookback window further narrows results', () => {
    const engine = makeEngine();
    engine.play();
    engine.advanceTo('2008-06-01');

    const recent = engine.visibleEvents({ lookbackDays: 30 });
    const recentIds = recent.map((ev) => ev.id);
    // Only events in the last 30 days survive (2008-05-30 fits, 2008-03-16 does not)
    expect(recentIds).toContain('within-2');
    expect(recentIds).not.toContain('within-1');
    expect(recentIds).not.toContain('pre-sim-1');
  });

  it('private fields are not enumerable from the outside', () => {
    const engine = makeEngine();

    // Object.keys / for-in / spread MUST not reveal #rawOhlc / #rawEvents.
    expect(Object.keys(engine)).not.toContain('rawOhlc');
    expect(Object.keys(engine)).not.toContain('rawEvents');
    expect(Object.keys(engine)).not.toContain('#rawOhlc');
    expect(Object.keys(engine)).not.toContain('#rawEvents');

    // JSON serialisation must not include the raw data either — only
    // engine.toJSON() would, and we haven't added one.
    const serialised = JSON.parse(JSON.stringify(engine));
    expect(JSON.stringify(serialised)).not.toContain('AAPL'); // ticker keys
    expect(JSON.stringify(serialised)).not.toContain('Lehman'); // future event headline
    expect(JSON.stringify(serialised)).not.toContain('COVID');
  });

  it('rejects backwards sim-time travel', () => {
    const engine = makeEngine();
    engine.play();
    engine.advanceTo('2008-06-01');
    expect(() => engine.advanceTo('2008-03-01')).toThrow(SimEngineError);
  });

  it('clamps to endDate and auto-ends', () => {
    const engine = makeEngine();
    engine.play();
    engine.advanceTo('2030-01-01');
    expect(engine.simDate).toBe('2026-01-01');
    expect(engine.status).toBe('ended');
  });

  it('rejects advance from idle and ended states', () => {
    const engine = makeEngine();
    expect(engine.status).toBe('idle');
    expect(() => engine.advanceTo('2008-06-01')).toThrow(SimEngineError);

    engine.play();
    engine.end();
    expect(() => engine.advanceTo('2008-07-01')).toThrow(SimEngineError);
  });

  it('full-window scan: advance month-by-month and assert firewall holds at every step', () => {
    // The integration assertion: simulate a real play-through and confirm
    // no leak at any intermediate sim_date.
    const engine = makeEngine();
    engine.play();
    const checkpoints = ['2008-01-01', '2008-06-01', '2008-12-01', '2010-06-01', '2015-01-01', '2020-03-01'];
    for (const cp of checkpoints) {
      engine.advanceTo(cp);
      // Every visible bar dated <= cp
      for (const ticker of engine.tickers) {
        const future = engine.visiblePrices(ticker).filter((b) => b.time > cp);
        expect(future).toEqual([]);
      }
      // Every visible event dated <= cp
      const futureEvents = engine.visibleEvents().filter((ev) => ev.date > cp);
      expect(futureEvents).toEqual([]);
    }
  });
});
