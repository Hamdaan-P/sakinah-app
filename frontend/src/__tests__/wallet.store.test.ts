/**
 * Wallet store unit tests.
 *
 * Strategy: use the real Zustand store but mock the service layer
 * (walletService) at the network boundary. Reset state per test via
 * setState(initialState).
 *
 * Focus: the pure state-machine logic — pending/loading flags, lastAward
 * toast set/clear, reset. These are the parts that affect UI behavior.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock Firebase config (the wallet store transitively imports it via authStore).
vi.mock('@/config/firebase.config', () => ({
  auth: { currentUser: null },
  db: {},
}));

// Mock the wallet service so no network calls happen.
vi.mock('@/features/wallet/services/walletService', () => ({
  fetchDNZBalance: vi.fn(),
  claimDailyLogin: vi.fn(),
  fetchDNZHistory: vi.fn(),
  fetchDNZDailySummary: vi.fn(),
  subscribeDNZBalance: vi.fn(() => () => {}),
}));

// Mock auth store so getState() returns a fixed user.
vi.mock('@/core/stores/auth.store', () => ({
  useAuthStore: {
    getState: () => ({ user: { id: 'test-user', email: 't@x.com', emailVerified: true, isAnonymous: false } }),
  },
}));

import { useWalletStore } from '@/features/wallet/stores/wallet.store';
import * as svc from '@/features/wallet/services/walletService';

const initialSnapshot = useWalletStore.getState();

describe('walletStore — initial state', () => {
  beforeEach(() => {
    useWalletStore.setState(initialSnapshot, true);
  });

  it('starts with zero balance', () => {
    const s = useWalletStore.getState();
    expect(s.balance).toBe(0);
    expect(s.lifetimeEarned).toBe(0);
  });

  it('starts with default daily cap of 50', () => {
    expect(useWalletStore.getState().dailyCap).toBe(50);
    expect(useWalletStore.getState().todayRemaining).toBe(50);
  });

  it('starts with no lastAward (no toast on cold mount)', () => {
    expect(useWalletStore.getState().lastAward).toBeNull();
  });

  it('starts with no error', () => {
    expect(useWalletStore.getState().error).toBeNull();
  });
});

describe('walletStore — clearLastAward', () => {
  beforeEach(() => {
    useWalletStore.setState(initialSnapshot, true);
  });

  it('clearLastAward wipes a set lastAward', () => {
    useWalletStore.setState({ lastAward: { awarded: true, amount: 5, new_balance: 5, reason: 'test', daily_total: 5, daily_remaining: 45 } });
    expect(useWalletStore.getState().lastAward).not.toBeNull();
    useWalletStore.getState().clearLastAward();
    expect(useWalletStore.getState().lastAward).toBeNull();
  });

  it('clearLastAward is a no-op when nothing is set', () => {
    useWalletStore.getState().clearLastAward();
    expect(useWalletStore.getState().lastAward).toBeNull();
  });
});

describe('walletStore — reset', () => {
  beforeEach(() => {
    useWalletStore.setState(initialSnapshot, true);
  });

  it('reset wipes balance + transactions back to initial', () => {
    useWalletStore.setState({
      balance: 1234,
      lifetimeEarned: 9999,
      transactions: [{ id: 't1', type: 'login', amount: 5, description: 'x', date: '2026-05-06', timestamp: null, metadata: {} }],
    });
    useWalletStore.getState().reset();
    expect(useWalletStore.getState().balance).toBe(0);
    expect(useWalletStore.getState().lifetimeEarned).toBe(0);
    expect(useWalletStore.getState().transactions).toEqual([]);
  });
});

describe('walletStore — refreshBalance happy path', () => {
  beforeEach(() => {
    useWalletStore.setState(initialSnapshot, true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('refreshBalance updates balance + lifetimeEarned from service response', async () => {
    vi.mocked(svc.fetchDNZBalance).mockResolvedValueOnce({
      total: 250, lifetime_earned: 1000, today_earned: 5,
      today_remaining: 45, daily_cap: 50, login_claimed_today: true,
    });

    await useWalletStore.getState().refreshBalance();

    const s = useWalletStore.getState();
    expect(s.balance).toBe(250);
    expect(s.lifetimeEarned).toBe(1000);
    expect(s.todayEarned).toBe(5);
    expect(s.todayRemaining).toBe(45);
    expect(s.loginClaimedToday).toBe(true);
    expect(s.balanceLoading).toBe(false);
    expect(s.error).toBeNull();
  });

  it('refreshBalance sets loading flag during the call', async () => {
    let resolveBalance: (v: any) => void = () => {};
    const pending = new Promise<any>((r) => { resolveBalance = r; });
    vi.mocked(svc.fetchDNZBalance).mockReturnValueOnce(pending);

    const refresh = useWalletStore.getState().refreshBalance();
    // While the promise is pending, loading should be true
    expect(useWalletStore.getState().balanceLoading).toBe(true);
    resolveBalance({ total: 0, lifetime_earned: 0, today_earned: 0, today_remaining: 50, daily_cap: 50, login_claimed_today: false });
    await refresh;
    expect(useWalletStore.getState().balanceLoading).toBe(false);
  });

  it('refreshBalance captures error in state on failure', async () => {
    vi.mocked(svc.fetchDNZBalance).mockRejectedValueOnce(new Error('network down'));

    await useWalletStore.getState().refreshBalance();

    const s = useWalletStore.getState();
    expect(s.balanceLoading).toBe(false);
    expect(s.error).toBeTruthy();
  });
});

describe('walletStore — claimLogin', () => {
  beforeEach(() => {
    useWalletStore.setState(initialSnapshot, true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('successful claim sets lastAward (drives the +5 DNZ toast)', async () => {
    vi.mocked(svc.claimDailyLogin).mockResolvedValueOnce({
      awarded: true, amount: 5, new_balance: 5, reason: 'Awarded',
      daily_total: 5, daily_remaining: 45,
    });

    const result = await useWalletStore.getState().claimLogin();

    expect(result?.awarded).toBe(true);
    expect(result?.amount).toBe(5);
    const s = useWalletStore.getState();
    expect(s.lastAward).not.toBeNull();
    expect(s.lastAward?.amount).toBe(5);
    expect(s.loginClaimedToday).toBe(true);
  });

  it('already-claimed response does NOT set a celebratory toast', async () => {
    vi.mocked(svc.claimDailyLogin).mockResolvedValueOnce({
      awarded: false, amount: 0, new_balance: 5, reason: 'Already claimed today',
      daily_total: 5, daily_remaining: 45,
    });

    await useWalletStore.getState().claimLogin();
    // lastAward should not show a 0-amount toast
    const s = useWalletStore.getState();
    expect(s.lastAward?.awarded).not.toBe(true);
  });

  it('claimLogin returns null when already claimed today (early-return)', async () => {
    useWalletStore.setState({ loginClaimedToday: true });
    const result = await useWalletStore.getState().claimLogin();
    expect(result).toBeNull();
    // Service must not have been called.
    expect(svc.claimDailyLogin).not.toHaveBeenCalled();
  });

  it('claimLogin throws → returns null + clears claimLoading', async () => {
    vi.mocked(svc.claimDailyLogin).mockRejectedValueOnce(new Error('network'));
    const result = await useWalletStore.getState().claimLogin();
    expect(result).toBeNull();
    expect(useWalletStore.getState().claimLoading).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Coverage push: refreshBalance reward-toast branch, startLiveBalance,
// fetchHistory, fetchDailySummary, no-userId early-returns.
// Goal: take wallet.store.ts coverage from ~60% to ≥90%.
// ---------------------------------------------------------------------------

describe('walletStore — refreshBalance toast detection', () => {
  beforeEach(() => useWalletStore.setState(initialSnapshot, true));
  afterEach(() => vi.clearAllMocks());

  it('detects new earnings (prev > 0, total > prev) → sets lastAward', async () => {
    useWalletStore.setState({ balance: 10 });
    vi.mocked(svc.fetchDNZBalance).mockResolvedValueOnce({
      total: 15, lifetime_earned: 100, today_earned: 5,
      today_remaining: 45, daily_cap: 50, login_claimed_today: false,
    });
    await useWalletStore.getState().refreshBalance();
    const s = useWalletStore.getState();
    expect(s.lastAward?.awarded).toBe(true);
    expect(s.lastAward?.amount).toBe(5);
  });

  it('does NOT set lastAward when prev was 0 (cold mount)', async () => {
    useWalletStore.setState({ balance: 0, lastAward: null });
    vi.mocked(svc.fetchDNZBalance).mockResolvedValueOnce({
      total: 50, lifetime_earned: 50, today_earned: 50,
      today_remaining: 0, daily_cap: 50, login_claimed_today: true,
    });
    await useWalletStore.getState().refreshBalance();
    expect(useWalletStore.getState().lastAward).toBeNull();
  });

  it('does NOT set lastAward when balance unchanged', async () => {
    useWalletStore.setState({ balance: 10, lastAward: null });
    vi.mocked(svc.fetchDNZBalance).mockResolvedValueOnce({
      total: 10, lifetime_earned: 100, today_earned: 0,
      today_remaining: 50, daily_cap: 50, login_claimed_today: false,
    });
    await useWalletStore.getState().refreshBalance();
    expect(useWalletStore.getState().lastAward).toBeNull();
  });
});

describe('walletStore — fetchHistory', () => {
  beforeEach(() => useWalletStore.setState(initialSnapshot, true));
  afterEach(() => vi.clearAllMocks());

  it('happy path: populates transactions array', async () => {
    vi.mocked(svc.fetchDNZHistory).mockResolvedValueOnce({
      transactions: [
        { id: 't1', type: 'login', amount: 5, description: 'x', date: '2026-05-06', timestamp: null, metadata: {} },
      ],
    } as any);
    await useWalletStore.getState().fetchHistory();
    expect(useWalletStore.getState().transactions).toHaveLength(1);
    expect(useWalletStore.getState().transactionsLoading).toBe(false);
  });

  it('passes custom limit through', async () => {
    vi.mocked(svc.fetchDNZHistory).mockResolvedValueOnce({ transactions: [] } as any);
    await useWalletStore.getState().fetchHistory(25);
    expect(svc.fetchDNZHistory).toHaveBeenCalledWith('test-user', 25);
  });

  it('throws → clears loading without crashing', async () => {
    vi.mocked(svc.fetchDNZHistory).mockRejectedValueOnce(new Error('boom'));
    await useWalletStore.getState().fetchHistory();
    expect(useWalletStore.getState().transactionsLoading).toBe(false);
  });
});

describe('walletStore — fetchDailySummary', () => {
  beforeEach(() => useWalletStore.setState(initialSnapshot, true));
  afterEach(() => vi.clearAllMocks());

  it('happy path: stores summary on state', async () => {
    const fakeSummary = {
      date: '2026-05-07',
      earned_today: 10,
      cap: 50,
      remaining: 40,
      login_claimed: true,
      chat_messages_count: 0,
      chat_rewards_awarded: 0,
      breakdown: {},
    };
    vi.mocked(svc.fetchDNZDailySummary).mockResolvedValueOnce(fakeSummary as any);
    await useWalletStore.getState().fetchDailySummary();
    expect(useWalletStore.getState().dailySummary).toEqual(fakeSummary);
  });

  it('throws → quietly logs (no state mutation)', async () => {
    useWalletStore.setState({ dailySummary: null });
    vi.mocked(svc.fetchDNZDailySummary).mockRejectedValueOnce(new Error('boom'));
    await useWalletStore.getState().fetchDailySummary();
    expect(useWalletStore.getState().dailySummary).toBeNull();
  });
});

describe('walletStore — startLiveBalance', () => {
  beforeEach(() => useWalletStore.setState(initialSnapshot, true));
  afterEach(() => vi.clearAllMocks());

  it('returns an unsubscribe function and sets up listener', () => {
    const unsub = vi.fn();
    vi.mocked(svc.subscribeDNZBalance).mockReturnValueOnce(unsub);
    const teardown = useWalletStore.getState().startLiveBalance();
    expect(typeof teardown).toBe('function');
    expect(svc.subscribeDNZBalance).toHaveBeenCalledWith('test-user', expect.any(Function));
  });

  it('listener callback updates balance + lifetime + today_earned', () => {
    let captured: ((live: any) => void) | null = null;
    vi.mocked(svc.subscribeDNZBalance).mockImplementationOnce((_uid, cb) => {
      captured = cb as any;
      return () => {};
    });
    useWalletStore.setState({ balance: 10 });
    useWalletStore.getState().startLiveBalance();
    captured!({ total: 15, lifetime_earned: 100, today_earned: 5 });
    const s = useWalletStore.getState();
    expect(s.balance).toBe(15);
    expect(s.lifetimeEarned).toBe(100);
    expect(s.todayEarned).toBe(5);
    expect(s.lastAward?.amount).toBe(5);
  });

  it('listener does NOT toast on cold start (prev=0)', () => {
    let captured: ((live: any) => void) | null = null;
    vi.mocked(svc.subscribeDNZBalance).mockImplementationOnce((_uid, cb) => {
      captured = cb as any;
      return () => {};
    });
    useWalletStore.setState({ balance: 0, lastAward: null });
    useWalletStore.getState().startLiveBalance();
    captured!({ total: 50, lifetime_earned: 50 });
    expect(useWalletStore.getState().lastAward).toBeNull();
  });
});

describe('walletStore — no-userId early-returns', () => {
  beforeEach(() => useWalletStore.setState(initialSnapshot, true));
  afterEach(() => vi.clearAllMocks());

  it('refreshBalance no-ops when there is no user', async () => {
    const { useAuthStore } = await import('@/core/stores/auth.store');
    const orig = useAuthStore.getState;
    (useAuthStore as { getState: () => unknown }).getState = () => ({ user: null });
    await useWalletStore.getState().refreshBalance();
    expect(svc.fetchDNZBalance).not.toHaveBeenCalled();
    (useAuthStore as { getState: () => unknown }).getState = orig;
  });

  it('claimLogin returns null when there is no user', async () => {
    const { useAuthStore } = await import('@/core/stores/auth.store');
    const orig = useAuthStore.getState;
    (useAuthStore as { getState: () => unknown }).getState = () => ({ user: null });
    const result = await useWalletStore.getState().claimLogin();
    expect(result).toBeNull();
    (useAuthStore as { getState: () => unknown }).getState = orig;
  });

  it('startLiveBalance returns no-op unsub when no user', async () => {
    const { useAuthStore } = await import('@/core/stores/auth.store');
    const orig = useAuthStore.getState;
    (useAuthStore as { getState: () => unknown }).getState = () => ({ user: null });
    const teardown = useWalletStore.getState().startLiveBalance();
    expect(typeof teardown).toBe('function');
    expect(svc.subscribeDNZBalance).not.toHaveBeenCalled();
    (useAuthStore as { getState: () => unknown }).getState = orig;
  });
});
