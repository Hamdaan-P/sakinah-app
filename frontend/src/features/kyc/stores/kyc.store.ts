/**
 * KYC Store
 * Manages 2-tier KYC state: tier tracking, Tier 1/2 completion, migration, draft persistence
 */

import { create } from 'zustand';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db, isFirebaseStubbed } from '@/config/firebase.config';
import { useAuthStore } from '@/core/stores/auth.store';
import { claimReferralOnboardingReward, claimDeepKycReward } from '@/features/wallet/services/walletService';
import type { KycTier, KycStatus, KycLevel, Tier1Data, DeepKycData, DeepKycDraft } from '../types/kyc.types';

interface KycState {
  kycTier: KycTier;
  kycStatus: KycStatus;
  kycLevel: KycLevel;
  initialized: boolean;
  loading: boolean;
  deepKycDraft: DeepKycDraft | null;
}

interface KycActions {
  initialize: () => Promise<void>;
  completeTier1: (data: Tier1Data) => Promise<void>;
  completeTier2: (data: DeepKycData, rayaWelcome?: string) => Promise<void>;
  saveDraft: (draft: DeepKycDraft) => Promise<void>;
  loadDraft: () => Promise<DeepKycDraft | null>;
  clearDraft: () => Promise<void>;
  reset: () => void;
}

function getUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

export const useKycStore = create<KycState & KycActions>((set, get) => ({
  kycTier: 0,
  kycStatus: 'none',
  kycLevel: 'none',
  initialized: false,
  loading: false,
  deepKycDraft: null,

  initialize: async () => {
    const userId = getUserId();
    if (!userId) return;
    if (get().initialized) return;

    // Dev-only bypass: Firebase is stubbed → there's no Firestore doc to
    // read. Mark KYC fully complete so AuthGuard doesn't bounce us to
    // /quick-kyc on every load.
    if (isFirebaseStubbed && import.meta.env.DEV) {
      set({ kycTier: 2, kycStatus: 'tier2_complete', kycLevel: 'full', initialized: true, loading: false });
      return;
    }

    set({ loading: true });
    try {
      const docRef = doc(db, 'users', userId);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        set({ kycTier: 0, kycStatus: 'none', kycLevel: 'none', initialized: true, loading: false });
        return;
      }

      const data = snap.data();
      const rawTier = data.kyc_tier;

      // Defensive coercion: we've seen reports of users completing Deep KYC,
      // having full tier-2 evidence on the doc, but kyc_tier coming back as
      // a string, null, or otherwise not strictly === 2. Treat any of those
      // as tier-2 if there's corroborating evidence (deep_kyc_completed_at
      // is the strongest signal; intent_primary + raya_help_goal both set is
      // a fallback for legacy docs missing the timestamp).
      const numericTier =
        typeof rawTier === 'number' ? rawTier
        : typeof rawTier === 'string' && /^[012]$/.test(rawTier) ? parseInt(rawTier, 10)
        : NaN;

      // Broad evidence: any of
      //   - explicit deep_kyc_completed_at timestamp
      //   - intent_primary + raya_help_goal (step 1 + step 8)
      //   - intent_primary + iman_level + life_stage (covers users seen in
      //     prod whose deep_kyc_completed_at field went missing but who
     //     clearly completed Deep KYC — these three together cannot all
      //     come from a partial draft).
      const hasTier2Evidence =
        !!data.deep_kyc_completed_at ||
        (typeof data.intent_primary === 'string' && data.intent_primary.length > 0
          && typeof data.raya_help_goal === 'string' && data.raya_help_goal.length > 0) ||
        (typeof data.intent_primary === 'string' && data.intent_primary.length > 0
          && typeof data.iman_level === 'number'
          && typeof data.life_stage === 'string' && data.life_stage.length > 0);

      console.log('[KycStore] init', {
        userId,
        rawTier,
        rawTierType: typeof rawTier,
        numericTier,
        hasTier2Evidence,
        deepKycCompletedAt: data.deep_kyc_completed_at ?? null,
      });

      if (numericTier === 2 || hasTier2Evidence) {
        if (numericTier !== 2) {
          console.warn('[KycStore] tier-2 evidence on doc but kyc_tier was', rawTier, '— self-healing to 2');
          try {
            await setDoc(docRef, { kyc_tier: 2, kyc_status: 'tier2_complete', kyc_level: 'full' }, { merge: true });
          } catch (healErr) {
            console.warn('[KycStore] self-heal write failed; treating as tier 2 locally anyway:', healErr);
          }
        }
        set({ kycTier: 2, kycStatus: 'tier2_complete', kycLevel: 'full', initialized: true, loading: false });
        return;
      }

      if (numericTier === 1) {
        set({ kycTier: 1, kycStatus: 'tier1_complete', kycLevel: 'basic', initialized: true, loading: false });
        return;
      }

      if (numericTier === 0) {
        set({ kycTier: 0, kycStatus: 'none', kycLevel: 'none', initialized: true, loading: false });
        return;
      }

      // ── Legacy migration (kyc_tier field absent or unrecognized) ──

      if (data.profile_completed && data.onboarding_completed_at) {
        await setDoc(docRef, {
          kyc_tier: 2,
          kyc_status: 'tier2_complete',
          kyc_level: 'full',
          tier1_completed_at: data.onboarding_completed_at || serverTimestamp(),
          deep_kyc_completed_at: data.onboarding_completed_at || serverTimestamp(),
        }, { merge: true });

        set({ kycTier: 2, kycStatus: 'tier2_complete', kycLevel: 'full', initialized: true, loading: false });
        return;
      }

      if (data.full_name && data.gender && data.date_of_birth && data.country) {
        await setDoc(docRef, {
          kyc_tier: 1,
          kyc_status: 'tier1_complete',
          kyc_level: 'basic',
          tier1_completed_at: serverTimestamp(),
          profile_completed: true,
        }, { merge: true });

        set({ kycTier: 1, kycStatus: 'tier1_complete', kycLevel: 'basic', initialized: true, loading: false });
        return;
      }

      await setDoc(docRef, { kyc_tier: 0 }, { merge: true });
      set({ kycTier: 0, kycStatus: 'none', kycLevel: 'none', initialized: true, loading: false });
    } catch (err) {
      console.error('[KycStore] init error:', err);
      set({ initialized: true, loading: false });
    }
  },

  completeTier1: async (data: Tier1Data) => {
    const userId = getUserId();
    if (!userId) return;

    set({ loading: true });
    try {
      // Guard: never downgrade a user who already has Tier 2 evidence on
      // their doc. We've seen reports where init misread kyc_tier, AuthGuard
      // bounced the user to /quick-kyc, and re-submitting Quick KYC stomped
      // their kyc_tier from 2 back to 1. Read first, then promote—don't
      // demote.
      const docRef = doc(db, 'users', userId);
      const existing = await getDoc(docRef);
      const existingData = existing.exists() ? (existing.data() ?? {}) : {};
      const existingTier = typeof existingData.kyc_tier === 'number' ? existingData.kyc_tier : 0;
      const existingHasTier2Evidence =
        !!existingData.deep_kyc_completed_at ||
        (typeof existingData.intent_primary === 'string' && existingData.intent_primary.length > 0
          && typeof existingData.iman_level === 'number');
      const targetTier: KycTier = (existingTier >= 2 || existingHasTier2Evidence) ? 2 : 1;
      const targetStatus: KycStatus = targetTier === 2 ? 'tier2_complete' : 'tier1_complete';
      const targetLevel: KycLevel = targetTier === 2 ? 'full' : 'basic';

      await setDoc(docRef, {
        full_name: data.full_name,
        name: data.full_name,
        gender: data.gender,
        date_of_birth: data.date_of_birth,
        country: data.country,
        city: data.city,
        kyc_tier: targetTier,
        kyc_status: targetStatus,
        kyc_level: targetLevel,
        tier1_completed_at: serverTimestamp(),
        profile_completed: true,
        updated_at: serverTimestamp(),
      }, { merge: true });

      // Trigger one-time referral reward for the inviter after successful onboarding.
      try {
        await claimReferralOnboardingReward(userId);
      } catch (referralError) {
        // Non-blocking: onboarding should still complete if reward API is unavailable.
        console.warn('KycStore: referral reward trigger failed:', referralError);
      }

      set({ kycTier: targetTier, kycStatus: targetStatus, kycLevel: targetLevel, loading: false });
    } catch (err) {
      console.error('KycStore: Tier 1 error:', err);
      set({ loading: false });
      throw err;
    }
  },

  completeTier2: async (data: DeepKycData, rayaWelcome?: string) => {
    const userId = getUserId();
    if (!userId) return;

    set({ loading: true });
    try {
      const fields: Record<string, unknown> = {
        // Step 1: What brought you here
        intent_primary: data.intent_primary,
        intent_secondary: data.intent_secondary,
        deep_planning_to_start: data.deep_planning_to_start,
        // Step 2: Where are you with your deen
        iman_level: data.iman_level,
        deep_deen_struggle: data.deep_deen_struggle,
        // Step 3: Your money story
        money_motivation: data.money_motivation,
        deep_five_year_test: data.deep_five_year_test,
        deep_emptier_purchase: data.deep_emptier_purchase,
        // Step 4: How you're wired
        crisis_instinct: data.crisis_instinct,
        deep_repeating_pattern: data.deep_repeating_pattern,
        deep_feared_self: data.deep_feared_self,
        // Step 5: What keeps you up
        biggest_stress: data.biggest_stress,
        stress_sharing: data.stress_sharing,
        deep_night_thoughts: data.deep_night_thoughts,
        // Step 6: How you connect
        conversation_pref: data.conversation_pref,
        advice_style: data.advice_style,
        deep_real_self: data.deep_real_self,
        // Step 7: Your world
        occupation: data.occupation,
        life_stage: data.life_stage,
        deep_whose_life: data.deep_whose_life,
        // Step 8: One last thing
        raya_help_goal: data.raya_help_goal,
        deep_trying_to_change: data.deep_trying_to_change,
        deep_younger_self: data.deep_younger_self,
        // Tier status
        kyc_tier: 2,
        kyc_status: 'tier2_complete',
        kyc_level: 'full',
        deep_kyc_completed_at: serverTimestamp(),
        updated_at: serverTimestamp(),
      };

      if (rayaWelcome) {
        fields.deep_kyc_raya_welcome = rayaWelcome;
      }

      await setDoc(doc(db, 'users', userId), fields, { merge: true });

      // One-time 50 DNZ reward for completing Deep KYC. Idempotent server-side
      // (dnz_claims subcollection), so a retry/re-submit can't double-award.
      // Non-blocking: KYC completion must still succeed if the reward API is
      // unavailable.
      try {
        await claimDeepKycReward(userId);
      } catch (rewardError) {
        console.warn('KycStore: deep KYC reward trigger failed:', rewardError);
      }

      // Clear draft
      await get().clearDraft();

      set({ kycTier: 2, kycStatus: 'tier2_complete', kycLevel: 'full', loading: false, deepKycDraft: null });
    } catch (err) {
      console.error('KycStore: Tier 2 error:', err);
      set({ loading: false });
      throw err;
    }
  },

  saveDraft: async (draft: DeepKycDraft) => {
    const userId = getUserId();
    if (!userId) return;

    set({ deepKycDraft: draft });
    try {
      await setDoc(doc(db, 'users', userId), {
        deep_kyc_draft: draft,
        updated_at: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('KycStore: save draft error:', err);
    }
  },

  loadDraft: async () => {
    const userId = getUserId();
    if (!userId) return null;

    try {
      const snap = await getDoc(doc(db, 'users', userId));
      if (snap.exists()) {
        const draft = snap.data().deep_kyc_draft as DeepKycDraft | undefined;
        if (draft) {
          set({ deepKycDraft: draft });
          return draft;
        }
      }
    } catch (err) {
      console.error('KycStore: load draft error:', err);
    }
    return null;
  },

  clearDraft: async () => {
    const userId = getUserId();
    if (!userId) return;

    set({ deepKycDraft: null });
    try {
      await setDoc(doc(db, 'users', userId), {
        deep_kyc_draft: null,
        updated_at: serverTimestamp(),
      }, { merge: true });
    } catch (err) {
      console.error('KycStore: clear draft error:', err);
    }
  },

  reset: () => {
    set({ kycTier: 0, kycStatus: 'none', kycLevel: 'none', initialized: false, loading: false, deepKycDraft: null });
  },
}));
