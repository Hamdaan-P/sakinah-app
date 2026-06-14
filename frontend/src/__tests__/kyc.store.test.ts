/**
 * KYC store unit tests.
 *
 * Strategy: real Zustand store, mock Firebase Firestore at the SDK
 * boundary (`firebase/firestore`). Reset state per test.
 *
 * Focus: pure state transitions + reset. Tier promotion logic that
 * touches Firestore is integration territory (covered by rules tests).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/config/firebase.config', () => ({
  auth: { currentUser: null },
  db: {},
  isFirebaseStubbed: false,
}));

vi.mock('firebase/firestore', () => ({
  doc: vi.fn(() => ({})),
  getDoc: vi.fn(),
  setDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'SERVER_TIMESTAMP'),
}));

vi.mock('@/core/stores/auth.store', () => ({
  useAuthStore: {
    getState: () => ({ user: { id: 'test-user', email: 't@x.com', emailVerified: true, isAnonymous: false } }),
  },
}));

vi.mock('@/features/wallet/services/walletService', () => ({
  claimReferralOnboardingReward: vi.fn(),
}));

import { useKycStore } from '@/features/kyc/stores/kyc.store';
import * as fs from 'firebase/firestore';

const initial = {
  kycTier: 0 as const,
  kycStatus: 'none' as const,
  kycLevel: 'none' as const,
  initialized: false,
  loading: false,
  deepKycDraft: null,
};

describe('kycStore — initial state', () => {
  beforeEach(() => {
    useKycStore.setState({ ...initial }, false);
  });

  it('starts at tier 0 / none', () => {
    const s = useKycStore.getState();
    expect(s.kycTier).toBe(0);
    expect(s.kycStatus).toBe('none');
    expect(s.kycLevel).toBe('none');
    expect(s.initialized).toBe(false);
  });

  it('starts with no draft', () => {
    expect(useKycStore.getState().deepKycDraft).toBeNull();
  });
});

describe('kycStore — initialize', () => {
  beforeEach(() => {
    useKycStore.setState({ ...initial }, false);
    vi.clearAllMocks();
  });

  it('reads tier 0 from Firestore and stays at none', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ kyc_tier: 0 }),
    } as any);

    await useKycStore.getState().initialize();
    const s = useKycStore.getState();
    expect(s.kycTier).toBe(0);
    expect(s.kycStatus).toBe('none');
    expect(s.initialized).toBe(true);
  });

  it('reads tier 1 from Firestore and reflects basic level', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ kyc_tier: 1 }),
    } as any);

    await useKycStore.getState().initialize();
    const s = useKycStore.getState();
    expect(s.kycTier).toBe(1);
    expect(s.kycStatus).toBe('tier1_complete');
    expect(s.kycLevel).toBe('basic');
  });

  it('reads tier 2 from Firestore and reflects full level', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ kyc_tier: 2 }),
    } as any);

    await useKycStore.getState().initialize();
    const s = useKycStore.getState();
    expect(s.kycTier).toBe(2);
    expect(s.kycStatus).toBe('tier2_complete');
    expect(s.kycLevel).toBe('full');
  });

  it('initialize is idempotent — second call no-ops', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ kyc_tier: 1 }),
    } as any);

    await useKycStore.getState().initialize();
    expect(fs.getDoc).toHaveBeenCalledTimes(1);

    await useKycStore.getState().initialize();
    // Still 1 — second call early-returns because initialized=true
    expect(fs.getDoc).toHaveBeenCalledTimes(1);
  });

  it('non-existent user doc → tier 0 / initialized', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => false,
      data: () => ({}),
    } as any);

    await useKycStore.getState().initialize();
    const s = useKycStore.getState();
    expect(s.kycTier).toBe(0);
    expect(s.initialized).toBe(true);
  });

  it('Firestore error captured but initialized=true (no infinite-spinner)', async () => {
    vi.mocked(fs.getDoc).mockRejectedValueOnce(new Error('firestore down'));

    await useKycStore.getState().initialize();
    expect(useKycStore.getState().initialized).toBe(true);
    expect(useKycStore.getState().loading).toBe(false);
  });
});

describe('kycStore — reset', () => {
  beforeEach(() => {
    useKycStore.setState({ ...initial }, false);
  });

  it('reset wipes tier + status + level back to defaults', () => {
    useKycStore.setState({
      kycTier: 2,
      kycStatus: 'tier2_complete',
      kycLevel: 'full',
      initialized: true,
    });
    useKycStore.getState().reset();
    const s = useKycStore.getState();
    expect(s.kycTier).toBe(0);
    expect(s.kycStatus).toBe('none');
    expect(s.kycLevel).toBe('none');
    expect(s.initialized).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Action coverage push: drive every Tier 1/2/draft action through happy +
// error paths, and the legacy-migration branches in initialize().
// Goal: take kyc.store.ts coverage from ~30% to ≥90% (plan target).
// ---------------------------------------------------------------------------

import { claimReferralOnboardingReward } from '@/features/wallet/services/walletService';

describe('kycStore — initialize tier-2 evidence + legacy migration branches', () => {
  beforeEach(() => {
    useKycStore.setState({ ...initial }, false);
    vi.clearAllMocks();
  });

  it('treats deep_kyc_completed_at as tier 2 even when kyc_tier is missing', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ deep_kyc_completed_at: 'ts' }),
    } as any);
    await useKycStore.getState().initialize();
    expect(useKycStore.getState().kycTier).toBe(2);
  });

  it('treats intent_primary + raya_help_goal as tier 2 evidence (legacy)', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ intent_primary: 'wealth', raya_help_goal: 'guidance' }),
    } as any);
    await useKycStore.getState().initialize();
    expect(useKycStore.getState().kycTier).toBe(2);
  });

  it('treats intent_primary + iman_level + life_stage as tier 2 evidence', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        intent_primary: 'wealth',
        iman_level: 5,
        life_stage: 'married',
      }),
    } as any);
    await useKycStore.getState().initialize();
    expect(useKycStore.getState().kycTier).toBe(2);
  });

  it('legacy: profile_completed + onboarding_completed_at → migrate to tier 2', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        profile_completed: true,
        onboarding_completed_at: 'ts',
      }),
    } as any);
    await useKycStore.getState().initialize();
    expect(useKycStore.getState().kycTier).toBe(2);
    // setDoc must have been called for the migration write.
    expect(fs.setDoc).toHaveBeenCalled();
  });

  it('legacy: full_name + gender + dob + country → migrate to tier 1', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({
        full_name: 'Test',
        gender: 'male',
        date_of_birth: '1990-01-01',
        country: 'US',
      }),
    } as any);
    await useKycStore.getState().initialize();
    expect(useKycStore.getState().kycTier).toBe(1);
  });

  it('legacy: nothing matches → write tier 0 and continue', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ random_field: 'noise' }),
    } as any);
    await useKycStore.getState().initialize();
    expect(useKycStore.getState().kycTier).toBe(0);
    expect(fs.setDoc).toHaveBeenCalled();
  });

  it('string "1" tier coerces to numeric 1', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ kyc_tier: '1' }),
    } as any);
    await useKycStore.getState().initialize();
    expect(useKycStore.getState().kycTier).toBe(1);
  });

  it('self-heal: tier-2 evidence but kyc_tier=1 → forced to 2 with setDoc', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ kyc_tier: 1, deep_kyc_completed_at: 'ts' }),
    } as any);
    await useKycStore.getState().initialize();
    expect(useKycStore.getState().kycTier).toBe(2);
    expect(fs.setDoc).toHaveBeenCalled();
  });
});

describe('kycStore — completeTier1', () => {
  beforeEach(() => {
    useKycStore.setState({ ...initial }, false);
    vi.clearAllMocks();
  });

  const sampleData = {
    full_name: 'Alice',
    gender: 'Female' as const,
    date_of_birth: '1990-01-01',
    country: 'US',
    city: 'NYC',
  };

  it('happy path: tier 0 → tier 1 + setDoc + referral claim', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({}),
    } as any);
    vi.mocked(fs.setDoc).mockResolvedValueOnce(undefined as any);
    vi.mocked(claimReferralOnboardingReward).mockResolvedValueOnce(undefined as any);

    await useKycStore.getState().completeTier1(sampleData);
    expect(useKycStore.getState().kycTier).toBe(1);
    expect(useKycStore.getState().kycStatus).toBe('tier1_complete');
    expect(claimReferralOnboardingReward).toHaveBeenCalledWith('test-user');
  });

  it('does NOT downgrade tier 2 → completing Tier 1 keeps user at tier 2', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ kyc_tier: 2 }),
    } as any);
    vi.mocked(fs.setDoc).mockResolvedValueOnce(undefined as any);

    await useKycStore.getState().completeTier1(sampleData);
    expect(useKycStore.getState().kycTier).toBe(2);
  });

  it('does NOT downgrade if user has tier-2 evidence (deep_kyc_completed_at)', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ deep_kyc_completed_at: 'ts' }),
    } as any);
    vi.mocked(fs.setDoc).mockResolvedValueOnce(undefined as any);

    await useKycStore.getState().completeTier1(sampleData);
    expect(useKycStore.getState().kycTier).toBe(2);
  });

  it('referral claim failure does NOT block tier 1 completion', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({}),
    } as any);
    vi.mocked(fs.setDoc).mockResolvedValueOnce(undefined as any);
    vi.mocked(claimReferralOnboardingReward).mockRejectedValueOnce(new Error('reward api down'));

    await useKycStore.getState().completeTier1(sampleData);
    expect(useKycStore.getState().kycTier).toBe(1);  // still completes
  });

  it('setDoc throws → re-throws and keeps loading=false', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({}),
    } as any);
    vi.mocked(fs.setDoc).mockRejectedValueOnce(new Error('firestore down'));

    await expect(useKycStore.getState().completeTier1(sampleData)).rejects.toThrow();
    expect(useKycStore.getState().loading).toBe(false);
  });

  it('no userId → no-op (early return)', async () => {
    // Override the auth.store mock to return no user.
    const { useAuthStore } = await import('@/core/stores/auth.store');
    const orig = useAuthStore.getState;
    (useAuthStore as { getState: () => unknown }).getState = () => ({ user: null });

    await useKycStore.getState().completeTier1(sampleData);
    expect(fs.setDoc).not.toHaveBeenCalled();
    (useAuthStore as { getState: () => unknown }).getState = orig;
  });
});

describe('kycStore — completeTier2', () => {
  beforeEach(() => {
    useKycStore.setState({ ...initial }, false);
    vi.clearAllMocks();
  });

  const sampleData = {
    intent_primary: 'wealth',
    intent_secondary: 'family',
    deep_planning_to_start: 'soon',
    iman_level: 5,
    deep_deen_struggle: 'distractions',
    money_motivation: 'security',
    deep_five_year_test: 'home',
    deep_emptier_purchase: 'gadgets',
    crisis_instinct: 'plan',
    deep_repeating_pattern: 'overthinking',
    deep_feared_self: 'lazy',
    biggest_stress: 'finances',
    stress_sharing: 'spouse',
    deep_night_thoughts: 'tomorrow',
    conversation_pref: 'casual',
    advice_style: 'gentle',
    deep_real_self: 'curious',
    occupation: 'engineer',
    life_stage: 'married',
    deep_whose_life: 'parents',
    raya_help_goal: 'discipline',
    deep_trying_to_change: 'habits',
    deep_younger_self: 'patience',
  };

  it('happy path: tier→2 + clears draft', async () => {
    vi.mocked(fs.setDoc).mockResolvedValue(undefined as any);
    await useKycStore.getState().completeTier2(sampleData as any);
    expect(useKycStore.getState().kycTier).toBe(2);
    expect(useKycStore.getState().deepKycDraft).toBeNull();
  });

  it('with rayaWelcome → field is included in setDoc payload', async () => {
    vi.mocked(fs.setDoc).mockResolvedValue(undefined as any);
    await useKycStore.getState().completeTier2(sampleData as any, 'welcome msg');
    // The first setDoc call (tier 2 fields) — payload includes our message.
    const firstCallArgs = vi.mocked(fs.setDoc).mock.calls[0];
    expect((firstCallArgs[1] as Record<string, unknown>).deep_kyc_raya_welcome).toBe(
      'welcome msg',
    );
  });

  it('setDoc throws → re-throws, keeps loading=false', async () => {
    vi.mocked(fs.setDoc).mockRejectedValueOnce(new Error('boom'));
    await expect(
      useKycStore.getState().completeTier2(sampleData as any),
    ).rejects.toThrow();
    expect(useKycStore.getState().loading).toBe(false);
  });
});

describe('kycStore — drafts', () => {
  beforeEach(() => {
    useKycStore.setState({ ...initial }, false);
    vi.clearAllMocks();
  });

  it('saveDraft sets local + writes to Firestore', async () => {
    vi.mocked(fs.setDoc).mockResolvedValue(undefined as any);
    await useKycStore.getState().saveDraft({ step: 1 } as any);
    expect(useKycStore.getState().deepKycDraft).toEqual({ step: 1 });
    expect(fs.setDoc).toHaveBeenCalled();
  });

  it('saveDraft tolerates Firestore write failures (non-throwing)', async () => {
    vi.mocked(fs.setDoc).mockRejectedValueOnce(new Error('boom'));
    await useKycStore.getState().saveDraft({ step: 2 } as any);
    // Local state still set even if remote write failed.
    expect(useKycStore.getState().deepKycDraft).toEqual({ step: 2 });
  });

  it('loadDraft returns null when no doc exists', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => false,
      data: () => ({}),
    } as any);
    const draft = await useKycStore.getState().loadDraft();
    expect(draft).toBeNull();
  });

  it('loadDraft returns the draft when present and updates state', async () => {
    vi.mocked(fs.getDoc).mockResolvedValueOnce({
      exists: () => true,
      data: () => ({ deep_kyc_draft: { step: 5 } }),
    } as any);
    const draft = await useKycStore.getState().loadDraft();
    expect(draft).toEqual({ step: 5 });
    expect(useKycStore.getState().deepKycDraft).toEqual({ step: 5 });
  });

  it('loadDraft tolerates Firestore failure → returns null', async () => {
    vi.mocked(fs.getDoc).mockRejectedValueOnce(new Error('boom'));
    const draft = await useKycStore.getState().loadDraft();
    expect(draft).toBeNull();
  });

  it('clearDraft sets null + writes to Firestore', async () => {
    useKycStore.setState({ deepKycDraft: { step: 1 } as any });
    vi.mocked(fs.setDoc).mockResolvedValue(undefined as any);
    await useKycStore.getState().clearDraft();
    expect(useKycStore.getState().deepKycDraft).toBeNull();
  });

  it('clearDraft tolerates Firestore failure', async () => {
    useKycStore.setState({ deepKycDraft: { step: 1 } as any });
    vi.mocked(fs.setDoc).mockRejectedValueOnce(new Error('boom'));
    await useKycStore.getState().clearDraft();
    expect(useKycStore.getState().deepKycDraft).toBeNull();
  });
});
