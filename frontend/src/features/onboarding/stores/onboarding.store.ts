/**
 * Onboarding state machine — drives the A → E → B → C → D → E flow.
 *
 * Stage A lives at /welcome. After the user taps "Begin", we flip stage→'b'
 * and route to '/'. DashboardPage mounts the OnboardingTakeover overlay
 * which advances B→C→D off this `stage` field, then settles to 'done' which
 * leaves the home page visible underneath.
 *
 * Persisted to localStorage so a reload mid-flow keeps the user on the same
 * stage. Existing users (those who never visit /welcome) never trigger a
 * transition out of the default 'a', and the overlay only renders for
 * stages b/c/d — so they see the home directly.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { saveFirstShukr, markOnboardingComplete } from '../services/shukrOnboardingService';

export type OnboardingStage = 'a' | 'b' | 'c' | 'd' | 'done';

interface OnboardingState {
  stage: OnboardingStage;
  firstShukrText: string | null;
  firstShukrSubmittedAt: number | null;

  setStage: (s: OnboardingStage) => void;
  submitShukr: (text: string, uid: string | null) => Promise<void>;
  finish: (uid: string | null) => void;
  reset: () => void;
}

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      stage: 'a',
      firstShukrText: null,
      firstShukrSubmittedAt: null,

      setStage: (s) => set({ stage: s }),

      submitShukr: async (text, uid) => {
        const trimmed = text.trim();
        const now = Date.now();
        set({ firstShukrText: trimmed, firstShukrSubmittedAt: now, stage: 'd' });
        if (uid) {
          try {
            await saveFirstShukr(uid, trimmed);
          } catch {
            // Firestore write is best-effort — the local state is the source
            // of truth for the immediate UI transition. A later session can
            // retry or the user can re-submit from Barakah Labs.
          }
        }
      },

      finish: (uid) => {
        set({ stage: 'done' });
        if (uid) {
          markOnboardingComplete(uid).catch(() => {
            // Same best-effort posture as submitShukr.
          });
        }
      },

      reset: () =>
        set({ stage: 'a', firstShukrText: null, firstShukrSubmittedAt: null }),
    }),
    {
      name: 'zaryah:onboarding',
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({
        stage: s.stage,
        firstShukrText: s.firstShukrText,
        firstShukrSubmittedAt: s.firstShukrSubmittedAt,
      }),
    },
  ),
);

export function shouldShowTakeover(stage: OnboardingStage): boolean {
  return stage === 'b' || stage === 'c' || stage === 'd';
}
