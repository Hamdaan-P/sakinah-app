/**
 * Shared cache, KYC loader, and request builder used by RayaWish/RayaNickname.
 */

import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase.config';

export interface KycFields {
  full_name?: string;
  date_of_birth?: string;
  occupation?: string;
  country?: string;
  city?: string;
  life_stage?: string;
  iman_level?: number;
  school_of_thought?: string;
  pascoArchetype?: string;
  pascoTraits?: string[];
  money_motivation?: string;
  crisis_instinct?: string;
  biggest_stress?: string;
  advice_style?: string;
  conversation_pref?: string;
  raya_help_goal?: string;
  deep_repeating_pattern?: string;
  deep_night_thoughts?: string;
  deep_trying_to_change?: string;
  deep_feared_self?: string;
  deep_real_self?: string;
  deep_five_year_test?: string;
  deep_whose_life?: string;
  deep_younger_self?: string;
}

export const CACHE_KEY_WISH = 'zaryah:raya_wish';
export const CACHE_KEY_NICKNAME = 'zaryah:raya_nickname';
const CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24h

interface CachedValue {
  value: string;
  userId: string;
  ts: number;
}

export function readCache(key: string, userId: string): string | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed: CachedValue = JSON.parse(raw);
    if (parsed.userId !== userId) return null;
    if (Date.now() - parsed.ts > CACHE_TTL_MS) return null;
    return parsed.value;
  } catch {
    return null;
  }
}

export function writeCache(key: string, userId: string, value: string) {
  try {
    localStorage.setItem(key, JSON.stringify({ value, userId, ts: Date.now() }));
  } catch { /* best-effort */ }
}

export async function loadKyc(userId: string): Promise<KycFields> {
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return {};
    return snap.data() as KycFields;
  } catch {
    return {};
  }
}

export function buildRequest(kyc: KycFields, userName: string) {
  const age = kyc.date_of_birth
    ? Math.floor((Date.now() - new Date(kyc.date_of_birth).getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    : null;
  return {
    name: kyc.full_name ?? userName,
    age,
    occupation: kyc.occupation ?? '',
    location: [kyc.city, kyc.country].filter(Boolean).join(', '),
    life_stage: kyc.life_stage ?? '',
    iman_level: kyc.iman_level,
    school_of_thought: kyc.school_of_thought ?? '',
    pasco_archetype: kyc.pascoArchetype ?? '',
    pasco_traits: kyc.pascoTraits ?? [],
    money_motivation: kyc.money_motivation ?? '',
    crisis_instinct: kyc.crisis_instinct ?? '',
    biggest_stress: kyc.biggest_stress ?? '',
    advice_style: kyc.advice_style ?? '',
    conversation_pref: kyc.conversation_pref ?? '',
    raya_help_goal: kyc.raya_help_goal ?? '',
    deep_reflections: {
      repeating_pattern: kyc.deep_repeating_pattern ?? '',
      night_thoughts: kyc.deep_night_thoughts ?? '',
      trying_to_change: kyc.deep_trying_to_change ?? '',
      feared_self: kyc.deep_feared_self ?? '',
      real_self: kyc.deep_real_self ?? '',
      five_year_test: kyc.deep_five_year_test ?? '',
      whose_life: kyc.deep_whose_life ?? '',
      younger_self: kyc.deep_younger_self ?? '',
    },
  };
}
