import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Screen =
  | 's01' | 's02' | 's03' | 's05' | 's06' | 's07'
  | 's09' | 's10'
  | 's11' | 's12' | 's13' | 's14'
  | 's16' | 's17' | 's18'
  | 's19' | 's20' | 's21';

export type Heart = 'still' | 'tender' | 'heavy' | 'bright' | 'restless' | 'numb';

// Doors redesigned 2026-05-23. See zaryah-brain/projects/doors-redesign-2026.md.
// Old keys 'memory' / 'body' / 'others' are no longer valid. `door` is not in
// partialize() below, so persisted stale values can't survive a reload —
// no migration needed.
export type Door = 'trials' | 'tohfa' | 'fear' | 'dua' | 'silence' | 'action';

export type Recipient = { id: string; name: string; role?: string };

export type TafSeed = { context: string; prompt: string };

type State = {
  screen: Screen;
  heart: Heart | null;
  heartHistory: { day: string; heart: Heart }[];
  // Timestamp (ms) of the most recent heart check-in. Used to gate the
  // "Notice a blessing" CTA: if it's been more than an hour, S01 routes
  // the user through S02 first.
  heartCheckedAt: number | null;
  // Transient: when the user clicks a CTA that requires a fresh heart,
  // we stash the intent so S02 can carry them straight there after they
  // pick. Not persisted — clears on reload.
  pendingIntent: 'blessing' | null;

  noticing: string;
  door: Door | null;
  // Door extrapolation — the user's deeper text inside a door (Trials, Fear,
  // Dua, Action). Tohfa uses tohfaLetter, Silence uses tafReflection.
  doorReflection: string;

  tohfaRecipient: Recipient | null;
  tohfaLetter: string;

  tafDuration: 3 | 7 | 15;
  tafSeed: TafSeed | null;
  tafReflection: string;

  shareTarget: Recipient | null;

  researchOptIn: boolean;

  // Tafakkur — set when a session is started so end-screen can finalize it.
  tafSessionId: string | null;
  tafSessionEndedNaturally: boolean;

  // Selected circle for s18 to load.
  selectedCircleId: string | null;
};

type Actions = {
  go: (s: Screen) => void;
  setHeart: (h: Heart) => void;
  setPendingIntent: (i: 'blessing' | null) => void;
  setNoticing: (t: string) => void;
  setDoor: (d: Door | null) => void;
  setDoorReflection: (t: string) => void;
  setTohfaRecipient: (r: Recipient | null) => void;
  setTohfaLetter: (t: string) => void;
  setTafDuration: (d: 3 | 7 | 15) => void;
  setTafSeed: (s: TafSeed | null) => void;
  setTafReflection: (t: string) => void;
  setShareTarget: (r: Recipient | null) => void;
  setResearchOptIn: (v: boolean) => void;
  setTafSession: (id: string | null) => void;
  setTafSessionEndedNaturally: (v: boolean) => void;
  setSelectedCircleId: (id: string | null) => void;
  resetFlow: () => void;
};

const DEFAULTS: State = {
  screen: 's01',
  heart: null,
  heartHistory: [],
  heartCheckedAt: null,
  pendingIntent: null,
  noticing: '',
  door: null,
  doorReflection: '',
  tohfaRecipient: null,
  tohfaLetter: '',
  tafDuration: 7,
  tafSeed: null,
  tafReflection: '',
  shareTarget: null,
  researchOptIn: false,
  tafSessionId: null,
  tafSessionEndedNaturally: false,
  selectedCircleId: null,
};

/**
 * Heart freshness window. If the user last picked a heart-state more than
 * this long ago, S01's "Notice a blessing" CTA re-routes through S02
 * before letting them proceed.
 */
export const HEART_FRESH_MS = 60 * 60 * 1000; // 1 hour

export function isHeartFresh(heartCheckedAt: number | null): boolean {
  if (heartCheckedAt == null) return false;
  return Date.now() - heartCheckedAt < HEART_FRESH_MS;
}

export const useBarakahFlow = create<State & Actions>()(
  persist(
    (set) => ({
      ...DEFAULTS,
      go: (screen) => set({ screen }),
      setHeart: (heart) =>
        set((s) => {
          const today = new Date().toISOString().slice(0, 10);
          const others = s.heartHistory.filter((x) => x.day !== today);
          return {
            heart,
            heartHistory: [...others, { day: today, heart }],
            heartCheckedAt: Date.now(),
          };
        }),
      setPendingIntent: (pendingIntent) => set({ pendingIntent }),
      setNoticing: (noticing) => set({ noticing }),
      setDoor: (door) => set({ door }),
      setDoorReflection: (doorReflection) => set({ doorReflection }),
      setTohfaRecipient: (tohfaRecipient) => set({ tohfaRecipient }),
      setTohfaLetter: (tohfaLetter) => set({ tohfaLetter }),
      setTafDuration: (tafDuration) => set({ tafDuration }),
      setTafSeed: (tafSeed) => set({ tafSeed }),
      setTafReflection: (tafReflection) => set({ tafReflection }),
      setShareTarget: (shareTarget) => set({ shareTarget }),
      setResearchOptIn: (researchOptIn) => set({ researchOptIn }),
      setTafSession: (tafSessionId) => set({ tafSessionId }),
      setTafSessionEndedNaturally: (tafSessionEndedNaturally) => set({ tafSessionEndedNaturally }),
      setSelectedCircleId: (selectedCircleId) => set({ selectedCircleId }),
      resetFlow: () =>
        set({
          noticing: '',
          door: null,
          doorReflection: '',
          tohfaRecipient: null,
          tohfaLetter: '',
          tafSeed: null,
          tafReflection: '',
        }),
    }),
    {
      name: 'barakah-flow',
      partialize: (s) => ({
        heart: s.heart,
        heartHistory: s.heartHistory,
        heartCheckedAt: s.heartCheckedAt,
        researchOptIn: s.researchOptIn,
      }),
    },
  ),
);
