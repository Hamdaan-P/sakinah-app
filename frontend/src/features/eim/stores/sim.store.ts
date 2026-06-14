/**
 * EIM Simulator — sessions Zustand store (Sprint 2).
 *
 * Distinct from the main `eim.store.ts` because:
 *   - SimSessions live in their own Firestore collection (D32 — separate
 *     from EIM Portfolios).
 *   - The SimEngine instances are transient (not persisted); they hold
 *     eager-loaded OHLC + the state firewall, and are rebuilt when a
 *     session is hydrated from the server.
 *   - The legacy `eim.store` handles localStorage-only portfolios; this
 *     store is server-first (Firestore via eimSim.service.ts).
 *
 * Per master plan §6.R + D26/D32/D33/D34. Per-session engine instances
 * live in a module-scope WeakMap so they don't bloat the Zustand state
 * tree (which the persist middleware would otherwise try to serialise).
 */

import { create } from 'zustand';
import type {
  MonthlyOhlcBar,
  SimEventCard,
  SimSession,
  SimSpeed,
  SimSurface,
  SimTransactionKind,
} from '../types/eim.types';
import { SimEngine } from '../engine/eimSimEngine';
import { eimSimService } from '../services/eimSim.service';

/** Module-scope engine registry — keyed by session id. Engines are
 *  transient state (OHLC + sim_date) and intentionally NOT persisted by
 *  Zustand. Recreated on hydration after `loadSession` re-fetches OHLC. */
const engineRegistry = new Map<string, SimEngine>();

export function getEngine(sessionId: string): SimEngine | undefined {
  return engineRegistry.get(sessionId);
}

/**
 * PATCH throttle — sim_date updates during play are rate-limited so we
 * don't blow past the backend's standard 30/60s ceiling. The engine
 * advances locally on every tick (free); we flush the latest sim_date
 * to the backend at most every PATCH_THROTTLE_MS. Status transitions
 * (pause / end) + decisions always flush immediately by calling the
 * PATCH outside this throttle path.
 */
const PATCH_THROTTLE_MS = 5_000;
const lastPatchedAt = new Map<string, number>();

/**
 * Pending deferred flushes — keyed by sessionId. When a step PATCH is
 * skipped because we're inside the throttle window, we schedule a timer
 * that will fire the PATCH once the window closes. Rapid clicks replace
 * the pending timer so only the LATEST engine state is flushed; the
 * backend never sees the intermediate dates.
 */
const pendingFlushTimers = new Map<string, ReturnType<typeof setTimeout>>();

function clearPendingFlush(sessionId: string): void {
  const t = pendingFlushTimers.get(sessionId);
  if (t) {
    clearTimeout(t);
    pendingFlushTimers.delete(sessionId);
  }
}

interface SimStoreState {
  /** All loaded sessions (metadata + portfolio + decisions). */
  sessions: SimSession[];
  /** id of the session the user is currently viewing, or null. */
  currentSessionId: string | null;
  /** Loading/error state for the UI. */
  loading: boolean;
  error: string | null;
  /** Monotonic counter bumped whenever an engine is attached or its
   *  internal state advances. Engines live in a module-scope WeakMap
   *  (transient, non-reactive) — components subscribe to this counter
   *  so they re-render when an engine becomes available or its sim_date
   *  changes. The actual engine is still read via `getEngine(id)`. */
  engineVersion: number;

  // ── Lifecycle actions ───────────────────────────────────────────────────
  refreshSessions: () => Promise<void>;
  createTimeMachine: (args: {
    startDate: string;
    endDate: string;
    startingCash: number;
    currency?: string;
    tickers?: string[];
    speed?: SimSpeed;
  }) => Promise<SimSession>;
  setCurrentSession: (sessionId: string | null) => void;
  /** Attach a SimEngine to the session — caller provides eager-loaded OHLC
   *  and event corpus. Replaces any existing engine for that session. */
  attachEngine: (
    sessionId: string,
    ohlc: Record<string, readonly MonthlyOhlcBar[]>,
    events?: readonly SimEventCard[],
  ) => SimEngine;
  /** Update engine state-machine: play / pause / end. Also pushes status
   *  to backend so the persisted session matches. */
  setStatus: (sessionId: string, status: 'playing' | 'paused' | 'ended') => Promise<void>;
  /** Advance sim_date locally + on backend (PATCH throttled to avoid the
   *  standard rate-limit during play). Returns the new sim_date the
   *  engine actually moved to (may be clamped). */
  advanceSimDate: (sessionId: string, newSimDate: string) => Promise<string>;
  /** Force-flush the engine's current sim_date to the backend immediately,
   *  bypassing the throttle. Call on pause / end / beforeunload so the
   *  persisted state matches what the user just saw. */
  flushSimDate: (sessionId: string) => Promise<void>;
  recordDecision: (
    sessionId: string,
    payload: {
      kind: SimTransactionKind;
      sim_date: string;
      ticker?: string;
      qty?: number;
      price?: number;
      fx_rate?: number;
      cash_delta?: number;
      reflection_note?: string;
    },
  ) => Promise<SimSession>;
  renameSession: (sessionId: string, name: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
}

export const useSimStore = create<SimStoreState>()((set, get) => ({
  sessions: [],
  currentSessionId: null,
  loading: false,
  error: null,
  engineVersion: 0,

  refreshSessions: async () => {
    set({ loading: true, error: null });
    try {
      const r = await eimSimService.listSessions({ surface: 'time_machine' as SimSurface });
      set({ sessions: r.sessions, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
    }
  },

  createTimeMachine: async (args) => {
    set({ loading: true, error: null });
    try {
      const session = await eimSimService.createSession({
        surface: 'time_machine',
        start_date: args.startDate,
        end_date: args.endDate,
        starting_cash: args.startingCash,
        currency: args.currency ?? 'USD',
        tickers: args.tickers ?? [],
        speed: args.speed ?? '1yr_per_sec',
      });
      set((s) => ({
        sessions: [session, ...s.sessions.filter((x) => x.id !== session.id)],
        currentSessionId: session.id,
        loading: false,
      }));
      return session;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e), loading: false });
      throw e;
    }
  },

  setCurrentSession: (sessionId) => set({ currentSessionId: sessionId }),

  attachEngine: (sessionId, ohlc, events) => {
    const session = get().sessions.find((s) => s.id === sessionId);
    if (!session) {
      throw new Error(`attachEngine: session ${sessionId} not found in store`);
    }
    const engine = new SimEngine({
      startDate: session.start_date,
      endDate: session.end_date,
      initialSimDate: session.current_sim_date,
      initialSpeed: session.speed,
      ohlc,
      events,
    });
    engineRegistry.set(sessionId, engine);
    // Bump the version counter so subscribed components re-render now
    // that the engine is available. Without this, a session re-opened
    // mid-sim would render with the engine still undefined (async load
    // not yet resolved) → holdings table shows no current prices.
    set((s) => ({ engineVersion: s.engineVersion + 1 }));
    return engine;
  },

  setStatus: async (sessionId, status) => {
    const engine = engineRegistry.get(sessionId);
    // Only mutate engine state when the target differs — the engine's
    // state machine throws on idempotent transitions (paused→paused,
    // playing→playing). If a caller (e.g. handleStep) already brought
    // the engine to the target state locally, this would otherwise
    // throw synchronously before the PATCH could fire — leaving the
    // backend permanently out of sync.
    if (engine && engine.status !== status) {
      if (status === 'playing') engine.play();
      else if (status === 'paused') engine.pause();
      else engine.end();
    }

    // Optimistically update Zustand session state from the engine's
    // current view so the UI (sessions list, headers, stats) stays in
    // step even when the backend PATCH is throttled below.
    //
    // EXCEPTION for 'ended': do NOT optimistically set status='ended'
    // here. The Report view (SimReportView) renders when session.status
    // === 'ended' and immediately fires the post-mortem endpoint. If we
    // flip status optimistically, the post-mortem request races ahead of
    // the PATCH that actually transitioned the backend, and the user
    // gets a 400 "current status is 'paused'" + a Report with no numbers.
    // For 'ended' we only update sim_date locally; the status transition
    // is set from the canonical backend response below.
    set((s) => ({
      sessions: s.sessions.map((x) =>
        x.id === sessionId
          ? {
              ...x,
              ...(status === 'ended' ? {} : { status }),
              current_sim_date: engine?.simDate ?? x.current_sim_date,
            }
          : x,
      ),
      engineVersion: s.engineVersion + 1,
    }));

    // Throttle ONLY 'paused' updates — that's the rapid-step case where
    // each click would otherwise burn one PATCH (30 clicks / 60s → 429).
    // 'playing' and 'ended' transitions are infrequent and load-bearing
    // (post-mortem needs an accurate 'ended' at the right date), so they
    // bypass the throttle and PATCH immediately.
    const now = Date.now();
    const last = lastPatchedAt.get(sessionId) ?? 0;
    if (status === 'paused' && now - last < PATCH_THROTTLE_MS) {
      // Inside throttle window — schedule a deferred flush so the LAST
      // step still reaches the backend even if no more steps follow.
      // Replaces any previously-scheduled timer; only the newest engine
      // state is flushed.
      clearPendingFlush(sessionId);
      const delay = PATCH_THROTTLE_MS - (now - last);
      pendingFlushTimers.set(
        sessionId,
        setTimeout(() => {
          pendingFlushTimers.delete(sessionId);
          const e = engineRegistry.get(sessionId);
          if (!e || e.status === 'ended' || e.status === 'idle') return;
          lastPatchedAt.set(sessionId, Date.now());
          void eimSimService
            .updateSession(sessionId, {
              status: e.status,
              current_sim_date: e.simDate,
            })
            .then((updated) => {
              set((s) => ({
                sessions: s.sessions.map((x) => (x.id === sessionId ? updated : x)),
              }));
            })
            .catch((err) => {
              set({ error: err instanceof Error ? err.message : String(err) });
            });
        }, delay),
      );
      return;
    }

    // Cancel any pending deferred flush — we're about to PATCH right now.
    clearPendingFlush(sessionId);
    lastPatchedAt.set(sessionId, now);
    try {
      const updated = await eimSimService.updateSession(sessionId, {
        status,
        current_sim_date: engine?.simDate,
      });
      set((s) => ({
        sessions: s.sessions.map((x) => (x.id === sessionId ? updated : x)),
      }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
  },

  advanceSimDate: async (sessionId, newSimDate) => {
    const engine = engineRegistry.get(sessionId);
    if (engine) {
      engine.advanceTo(newSimDate); // may clamp to endDate
    }
    const effectiveDate = engine?.simDate ?? newSimDate;

    // Local Zustand state advances on every tick so the list view + any
    // observers see the live sim_date without waiting on the backend.
    // engineVersion bump re-renders engine-reading components too.
    set((s) => ({
      sessions: s.sessions.map((x) =>
        x.id === sessionId ? { ...x, current_sim_date: effectiveDate } : x,
      ),
      engineVersion: s.engineVersion + 1,
    }));

    // Throttle backend PATCH. Always flush when the engine just ended so
    // the post-mortem can read the final persisted state immediately.
    const now = Date.now();
    const last = lastPatchedAt.get(sessionId) ?? 0;
    const justEnded = engine?.status === 'ended';
    if (!justEnded && now - last < PATCH_THROTTLE_MS) {
      return effectiveDate;
    }
    lastPatchedAt.set(sessionId, now);
    try {
      const updated = await eimSimService.updateSession(sessionId, {
        current_sim_date: effectiveDate,
      });
      set((s) => ({
        sessions: s.sessions.map((x) => (x.id === sessionId ? updated : x)),
      }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
    }
    return effectiveDate;
  },

  flushSimDate: async (sessionId) => {
    const engine = engineRegistry.get(sessionId);
    if (!engine) return;
    // Skip when the engine is in a non-active state. 'ended' is terminal
    // (backend would 400 on "advance from ended"); 'idle' means no step
    // has happened yet and there's no progress to flush — the backend
    // would 400 with "cannot advance from idle".
    if (engine.status === 'ended' || engine.status === 'idle') return;
    // Cancel any deferred step-flush timer — we're about to do a real,
    // immediate flush so the deferred one would be redundant.
    clearPendingFlush(sessionId);
    lastPatchedAt.set(sessionId, Date.now());
    try {
      // Send BOTH status + current_sim_date — if an earlier step PATCH
      // was dropped, backend session may still be in 'idle' while engine
      // is 'paused'. PATCHing sim_date alone would 400 ("cannot advance
      // from idle"); pairing it with status lets route step 1 transition
      // idle→paused first, then advance the date in step 2.
      const updated = await eimSimService.updateSession(sessionId, {
        status: engine.status,
        current_sim_date: engine.simDate,
      });
      set((s) => ({
        sessions: s.sessions.map((x) => (x.id === sessionId ? updated : x)),
      }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      throw e;  // bubble so callers (recordDecision) can refuse to proceed
    }
  },

  recordDecision: async (sessionId, payload) => {
    // Sync backend sim_date with engine BEFORE the decision POSTs. The
    // decision endpoint validates `body.sim_date === session.current_sim_date`,
    // and any step PATCH that was dropped silently would leave those out
    // of sync — producing the "decision sim_date X must match
    // current_sim_date Y" 400. flushSimDate now sends both status +
    // sim_date so a backend stuck in idle gets re-paired with the engine.
    try {
      await get().flushSimDate(sessionId);
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      set({ error: `couldn't sync sim date before trade: ${msg}` });
      throw e;
    }
    try {
      const r = await eimSimService.recordDecision(sessionId, payload);
      set((s) => ({
        sessions: s.sessions.map((x) => (x.id === sessionId ? r.session : x)),
      }));
      return r.session;
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      throw e;
    }
  },

  renameSession: async (sessionId, name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    try {
      const updated = await eimSimService.updateSession(sessionId, { name: trimmed });
      set((s) => ({
        sessions: s.sessions.map((x) => (x.id === sessionId ? updated : x)),
      }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      throw e;
    }
  },

  deleteSession: async (sessionId) => {
    try {
      await eimSimService.deleteSession(sessionId);
      engineRegistry.delete(sessionId);
      clearPendingFlush(sessionId);
      lastPatchedAt.delete(sessionId);
      set((s) => ({
        sessions: s.sessions.filter((x) => x.id !== sessionId),
        currentSessionId: s.currentSessionId === sessionId ? null : s.currentSessionId,
      }));
    } catch (e) {
      set({ error: e instanceof Error ? e.message : String(e) });
      throw e;
    }
  },
}));
