/**
 * EIM Zustand store — local state + localStorage persistence.
 *
 * Portfolios + lesson progress persist; analysis reports stay transient.
 *
 * Sprint 1 (master plan §6.R, locked 2026-05-24) adds simulator primitives:
 * cash balance + buy/sell as discrete transactions with FIFO lot accounting
 * + trade journal. The new `buy`/`sell`/`depositCash` actions are the
 * sim-engine surface. The legacy `addPosition` action is preserved unchanged
 * for backwards compat with existing UI flows (Sprint 2 will migrate the
 * AddPositionWizard to call `buy` instead).
 *
 * Mirrors backend invariants from `eim_sim_primitives.py`:
 *   - cash_balance >= 0 always (InsufficientCash error otherwise)
 *   - sell qty <= total open shares for the ticker (no shorting)
 *   - FIFO consumes oldest lots first
 *   - every state mutation appends one transaction
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type {
  AnalysisReport,
  HoldingSummary,
  LessonProgress,
  Portfolio,
  Position,
  SimTransaction,
  SimTransactionKind,
} from '../types/eim.types';

/** Default starting cash for a new sim portfolio (master plan §6.R). */
export const DEFAULT_STARTING_CASH = 10_000;
export const DEFAULT_CURRENCY = 'USD';

/** Float tolerance — matches `eim_sim_primitives._FILL_EPSILON` on the backend. */
const FILL_EPSILON = 1e-6;

// ── Errors ──────────────────────────────────────────────────────────────────

export class SimError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'SimError';
  }
}
export class InsufficientCash extends SimError {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientCash';
  }
}
export class InsufficientShares extends SimError {
  constructor(message: string) {
    super(message);
    this.name = 'InsufficientShares';
  }
}
export class InvalidTradeArguments extends SimError {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidTradeArguments';
  }
}

// ── Action payloads ─────────────────────────────────────────────────────────

export interface CreatePortfolioOptions {
  /** Defaults to DEFAULT_STARTING_CASH ($10,000). */
  startingCash?: number;
  /** Defaults to DEFAULT_CURRENCY ('USD'). */
  currency?: string;
}

export interface BuyArgs {
  portfolioId: string;
  ticker: string;
  qty: number;
  /** In TICKER native currency. */
  price: number;
  /** ISO date — sim-time inside a Time Machine session, wall-time elsewhere. */
  when: string;
  /** Ticker currency → portfolio currency. Defaults to 1.0. */
  fxRate?: number;
  /** Optional "why am I doing this?" reflection. */
  note?: string;
  /** Defaults to 'BUY'. Use 'DCA_BUY' for scheduled recurring buys (Sprint 2). */
  kind?: 'BUY' | 'DCA_BUY';
}

export interface SellArgs {
  portfolioId: string;
  ticker: string;
  qty: number;
  /** In TICKER native currency. */
  price: number;
  when: string;
  fxRate?: number;
  note?: string;
}

export interface CashMovementArgs {
  portfolioId: string;
  /** Signed: positive for deposit/dividend, negative for withdraw. */
  delta: number;
  when: string;
  kind: Extract<SimTransactionKind, 'CASH_DEPOSIT' | 'CASH_WITHDRAW' | 'DIVIDEND'>;
  note?: string;
}

// ── Store state ─────────────────────────────────────────────────────────────

interface EimState {
  portfolios: Portfolio[];
  createPortfolio: (name: string, userId: string, opts?: CreatePortfolioOptions) => Portfolio;
  deletePortfolio: (id: string) => void;
  /** @deprecated Sprint 1: use `buy` instead for new flows. Kept unchanged
   *  for backwards compat with existing UI (AddPositionWizard). Does NOT
   *  debit cash, does NOT append a transaction — it's a raw lot append. */
  addPosition: (portfolioId: string, position: Omit<Position, 'id' | 'portfolio_id' | 'tier'>) => void;
  /** @deprecated Sprint 1: use `sell` instead for proper FIFO + realised P&L. */
  removePosition: (portfolioId: string, positionId: string) => void;

  // ── Sim primitives (Sprint 1) ────────────────────────────────────────────
  /** Buy: opens a new FIFO lot, debits cash. Throws InsufficientCash / InvalidTradeArguments. */
  buy: (args: BuyArgs) => SimTransaction;
  /** Sell: FIFO-walks lots oldest-first, realises P&L, credits cash. Throws InsufficientShares / InvalidTradeArguments. */
  sell: (args: SellArgs) => SimTransaction;
  /** Cash deposit / withdrawal / dividend. Throws InsufficientCash if withdrawal exceeds balance. */
  cashMovement: (args: CashMovementArgs) => SimTransaction;
  /** Read-only: aggregated open holdings per ticker (qty-weighted avg cost). */
  holdingsFor: (portfolioId: string) => HoldingSummary[];

  // ── Lesson progress ──────────────────────────────────────────────────────
  lessonProgress: Record<string, LessonProgress>;
  setLessonStep: (lessonId: string, step: number) => void;
  completeLesson: (lessonId: string) => void;

  // ── Analysis reports (transient — kept in memory only, not persisted) ────
  lastReport: AnalysisReport | null;
  setLastReport: (report: AnalysisReport | null) => void;

  // ── Persona title progression (Mizan-style) ──────────────────────────────
  currentLevelTitle: string;
  setCurrentLevelTitle: (title: string) => void;

  // ── Per-feature intro cards ("what is this / what it can(’t) do") ─────────
  /** Map of featureId → true once the user has seen that feature's intro card.
   *  Drives the first-visit auto-open; the in-header "i" button reopens on demand. */
  featureIntros: Record<string, boolean>;
  /** Mark a feature's intro as seen (idempotent). */
  markFeatureIntroSeen: (featureId: string) => void;
}

function uid(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

// ── Pure helpers (mirror eim_sim_primitives.py) ────────────────────────────

function fifoLotsForTicker(positions: Position[], ticker: string): Position[] {
  return positions
    .filter((p) => p.ticker === ticker && p.qty > FILL_EPSILON)
    .sort((a, b) => a.buy_date.localeCompare(b.buy_date));
}

function totalOpenQty(positions: Position[], ticker: string): number {
  return positions
    .filter((p) => p.ticker === ticker && p.qty > FILL_EPSILON)
    .reduce((sum, p) => sum + p.qty, 0);
}

function computeHoldings(portfolio: Portfolio): HoldingSummary[] {
  const byTicker = new Map<string, Position[]>();
  for (const p of portfolio.positions) {
    if (p.qty <= FILL_EPSILON) continue;
    const list = byTicker.get(p.ticker) ?? [];
    list.push(p);
    byTicker.set(p.ticker, list);
  }
  const out: HoldingSummary[] = [];
  for (const [ticker, lots] of byTicker.entries()) {
    const total = lots.reduce((s, l) => s + l.qty, 0);
    if (total <= FILL_EPSILON) continue;
    const weighted = lots.reduce((s, l) => s + l.qty * l.buy_price, 0);
    out.push({
      ticker,
      total_qty: total,
      avg_cost: weighted / total,
      lot_count: lots.length,
    });
  }
  return out.sort((a, b) => a.ticker.localeCompare(b.ticker));
}

// ── Store ───────────────────────────────────────────────────────────────────

export const useEimStore = create<EimState>()(
  persist(
    (set, get) => ({
      portfolios: [],
      createPortfolio: (name, userId, opts) => {
        const startingCash = opts?.startingCash ?? DEFAULT_STARTING_CASH;
        const currency = opts?.currency ?? DEFAULT_CURRENCY;
        const portfolio: Portfolio = {
          id: uid('pf'),
          user_id: userId,
          name,
          created_at: new Date().toISOString(),
          positions: [],
          tier: 'free',
          cash_balance: startingCash,
          currency,
          transactions: [],
        };
        set((s) => ({ portfolios: [...s.portfolios, portfolio] }));
        return portfolio;
      },
      deletePortfolio: (id) =>
        set((s) => ({ portfolios: s.portfolios.filter((p) => p.id !== id) })),

      addPosition: (portfolioId, pos) =>
        set((s) => ({
          portfolios: s.portfolios.map((p) =>
            p.id === portfolioId
              ? {
                  ...p,
                  positions: [
                    ...p.positions,
                    { ...pos, id: uid('pos'), portfolio_id: portfolioId, tier: 'free' as const },
                  ],
                }
              : p,
          ),
        })),
      removePosition: (portfolioId, positionId) =>
        set((s) => ({
          portfolios: s.portfolios.map((p) =>
            p.id === portfolioId
              ? { ...p, positions: p.positions.filter((pos) => pos.id !== positionId) }
              : p,
          ),
        })),

      // ── Sim primitives ─────────────────────────────────────────────────────

      buy: (args) => {
        const fxRate = args.fxRate ?? 1.0;
        const kind = args.kind ?? 'BUY';
        if (args.qty <= 0 || args.price <= 0 || fxRate <= 0) {
          throw new InvalidTradeArguments(
            `buy: qty/price/fxRate must be > 0; got qty=${args.qty} price=${args.price} fx=${fxRate}`,
          );
        }
        const portfolio = get().portfolios.find((p) => p.id === args.portfolioId);
        if (!portfolio) throw new SimError(`portfolio ${args.portfolioId} not found`);
        const cost = args.qty * args.price * fxRate;
        if (cost > portfolio.cash_balance + FILL_EPSILON) {
          throw new InsufficientCash(
            `buy cost ${cost.toFixed(4)} exceeds available cash ${portfolio.cash_balance.toFixed(4)}`,
          );
        }
        const newCash = Math.max(0, portfolio.cash_balance - cost);
        const newPosition: Position = {
          id: uid('pos'),
          portfolio_id: portfolio.id,
          ticker: args.ticker,
          qty: args.qty,
          buy_price: args.price * fxRate, // store in portfolio currency
          buy_date: args.when.slice(0, 10), // ISO date portion
          tier: portfolio.tier,
        };
        const txn: SimTransaction = {
          id: uid('txn'),
          portfolio_id: portfolio.id,
          kind,
          ticker: args.ticker,
          qty: args.qty,
          price: args.price,
          realized_pnl: 0,
          cash_delta: -cost,
          cash_after: newCash,
          fx_rate: fxRate,
          timestamp: args.when,
          reflection_note: args.note ?? '',
          tier: portfolio.tier,
        };
        set((s) => ({
          portfolios: s.portfolios.map((p) =>
            p.id === portfolio.id
              ? {
                  ...p,
                  positions: [...p.positions, newPosition],
                  cash_balance: newCash,
                  transactions: [...p.transactions, txn],
                }
              : p,
          ),
        }));
        return txn;
      },

      sell: (args) => {
        const fxRate = args.fxRate ?? 1.0;
        if (args.qty <= 0 || args.price <= 0 || fxRate <= 0) {
          throw new InvalidTradeArguments(
            `sell: qty/price/fxRate must be > 0; got qty=${args.qty} price=${args.price} fx=${fxRate}`,
          );
        }
        const portfolio = get().portfolios.find((p) => p.id === args.portfolioId);
        if (!portfolio) throw new SimError(`portfolio ${args.portfolioId} not found`);

        const openLots = fifoLotsForTicker(portfolio.positions, args.ticker);
        const totalOpen = totalOpenQty(portfolio.positions, args.ticker);
        if (args.qty > totalOpen + FILL_EPSILON) {
          throw new InsufficientShares(
            `sell qty ${args.qty} exceeds open shares ${totalOpen} for ${args.ticker} (shorting not supported)`,
          );
        }

        const sellPriceInCurrency = args.price * fxRate;
        let remaining = args.qty;
        let realised = 0;
        const otherTickerPositions = portfolio.positions.filter((p) => p.ticker !== args.ticker);
        const newSameTickerPositions: Position[] = [];
        for (const lot of openLots) {
          if (remaining <= FILL_EPSILON) {
            newSameTickerPositions.push(lot);
            continue;
          }
          const take = Math.min(lot.qty, remaining);
          realised += (sellPriceInCurrency - lot.buy_price) * take;
          const leftover = lot.qty - take;
          if (leftover > FILL_EPSILON) {
            newSameTickerPositions.push({ ...lot, qty: leftover });
          }
          remaining -= take;
        }

        const proceeds = args.qty * sellPriceInCurrency;
        const newCash = portfolio.cash_balance + proceeds;
        const txn: SimTransaction = {
          id: uid('txn'),
          portfolio_id: portfolio.id,
          kind: 'SELL',
          ticker: args.ticker,
          qty: args.qty,
          price: args.price,
          realized_pnl: realised,
          cash_delta: proceeds,
          cash_after: newCash,
          fx_rate: fxRate,
          timestamp: args.when,
          reflection_note: args.note ?? '',
          tier: portfolio.tier,
        };
        set((s) => ({
          portfolios: s.portfolios.map((p) =>
            p.id === portfolio.id
              ? {
                  ...p,
                  positions: [...otherTickerPositions, ...newSameTickerPositions],
                  cash_balance: newCash,
                  transactions: [...p.transactions, txn],
                }
              : p,
          ),
        }));
        return txn;
      },

      cashMovement: (args) => {
        const portfolio = get().portfolios.find((p) => p.id === args.portfolioId);
        if (!portfolio) throw new SimError(`portfolio ${args.portfolioId} not found`);
        const newCash = portfolio.cash_balance + args.delta;
        if (newCash < -FILL_EPSILON) {
          throw new InsufficientCash(
            `cash movement of ${args.delta} would push balance to ${newCash.toFixed(4)}`,
          );
        }
        const clampedCash = Math.max(0, newCash);
        const txn: SimTransaction = {
          id: uid('txn'),
          portfolio_id: portfolio.id,
          kind: args.kind,
          ticker: null,
          qty: 0,
          price: 0,
          realized_pnl: 0,
          cash_delta: args.delta,
          cash_after: clampedCash,
          fx_rate: 1,
          timestamp: args.when,
          reflection_note: args.note ?? '',
          tier: portfolio.tier,
        };
        set((s) => ({
          portfolios: s.portfolios.map((p) =>
            p.id === portfolio.id
              ? {
                  ...p,
                  cash_balance: clampedCash,
                  transactions: [...p.transactions, txn],
                }
              : p,
          ),
        }));
        return txn;
      },

      holdingsFor: (portfolioId) => {
        const portfolio = get().portfolios.find((p) => p.id === portfolioId);
        return portfolio ? computeHoldings(portfolio) : [];
      },

      lessonProgress: {},
      setLessonStep: (lessonId, step) =>
        set((s) => ({
          lessonProgress: {
            ...s.lessonProgress,
            [lessonId]: { ...(s.lessonProgress[lessonId] ?? { lessonId, step: 0 }), lessonId, step },
          },
        })),
      completeLesson: (lessonId) =>
        set((s) => ({
          lessonProgress: {
            ...s.lessonProgress,
            [lessonId]: {
              ...(s.lessonProgress[lessonId] ?? { lessonId, step: 0 }),
              lessonId,
              completedAt: new Date().toISOString(),
            },
          },
        })),

      lastReport: null,
      setLastReport: (report) => set({ lastReport: report }),

      currentLevelTitle: 'Foundations',
      setCurrentLevelTitle: (title) => set({ currentLevelTitle: title }),

      featureIntros: {},
      markFeatureIntroSeen: (featureId) =>
        set((s) =>
          s.featureIntros[featureId]
            ? s
            : { featureIntros: { ...s.featureIntros, [featureId]: true } },
        ),
    }),
    {
      name: 'zaryah:eim',
      storage: createJSONStorage(() => localStorage),
      version: 2,
      /**
       * v1 → v2 migration (2026-05-24): backfill sim-primitive fields onto
       * pre-existing portfolios. Old portfolios had no cash/currency/transactions;
       * load them at 0 / USD / [] so the new UI doesn't crash on undefined access.
       * Old portfolios remain "untradeable" in the simulator (cash_balance: 0)
       * until the user explicitly deposits — preserves their watchlist semantics.
       */
      migrate: (persistedState: unknown, version: number) => {
        if (!persistedState || typeof persistedState !== 'object') return persistedState;
        if (version < 2) {
          const state = persistedState as { portfolios?: Portfolio[] };
          if (Array.isArray(state.portfolios)) {
            state.portfolios = state.portfolios.map((p) => ({
              ...p,
              cash_balance: typeof p.cash_balance === 'number' ? p.cash_balance : 0,
              currency: p.currency ?? 'USD',
              transactions: Array.isArray(p.transactions) ? p.transactions : [],
            }));
          }
        }
        return persistedState;
      },
      partialize: (state) => ({
        portfolios: state.portfolios,
        lessonProgress: state.lessonProgress,
        currentLevelTitle: state.currentLevelTitle,
        featureIntros: state.featureIntros,
      }),
    },
  ),
);
