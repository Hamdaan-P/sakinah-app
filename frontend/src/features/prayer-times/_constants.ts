/**
 * Prayer-times constants + types.
 *
 * Phase 5 split — these used to live inline at the top of PrayerTimesPage.tsx.
 * Pure data (and one Sun-icon-typed mapping); moving them out trimmed
 * 70+ lines from the page component without touching any logic.
 */

import { Sun, SunHorizon, Moon, CloudSun } from '@phosphor-icons/react';

// ── Types ──────────────────────────────────────────────────

export interface PrayerData {
  times: Record<string, string>;
  locationName: string;
  source: 'api' | 'cache' | 'defaults';
  errorMessage?: string;
  date: string;
  hijriDate?: string;
  method?: string;
}

export interface DayCompletion {
  date: string;
  completed: string[];
}

// ── Theme palette (page-scoped — re-exported from a sibling rather
//    than from a shared theme file so this page's look stays self-
//    contained and doesn't accidentally drift when the global theme
//    changes). ───────────────────────────────────────────────────

export const NAVY_BG = '#10151F';
export const NAVY_CARD = '#10151F';
export const NAVY_HOVER = '#161D2C';
export const NAVY_BORDER = 'rgba(212,168,83,0.2)';
export const GOLD = '#D4A853';
export const GOLD_LIGHT = '#E8C97A';
export const CREAM = '#F5E8C7';
export const TEXT_SECONDARY = '#C9C0A8';
export const TEXT_MUTED = '#7A7363';

// ── Data ──────────────────────────────────────────────────

export const PRAYER_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

export const PRAYER_META: Record<string, { icon: typeof Sun; arabicName: string; color: string }> = {
  Fajr: { icon: SunHorizon, arabicName: 'الفجر', color: '#818CF8' },
  Dhuhr: { icon: Sun, arabicName: 'الظهر', color: '#F59E0B' },
  Asr: { icon: CloudSun, arabicName: 'العصر', color: '#FB923C' },
  Maghrib: { icon: SunHorizon, arabicName: 'المغرب', color: '#F87171' },
  Isha: { icon: Moon, arabicName: 'العشاء', color: '#A78BFA' },
};

export const DEFAULT_TIMES: Record<string, string> = {
  Fajr: '05:30',
  Dhuhr: '12:15',
  Asr: '15:30',
  Maghrib: '18:00',
  Isha: '19:30',
};

export const CALCULATION_METHODS: Record<number, string> = {
  1: 'South Asia (Karachi 18°/18°)',
  2: 'North America — ISNA (15°/15°)',
  3: 'Muslim World League (18°/17°)',
  4: 'Umm Al-Qura, Makkah (18.5°/90min)',
  5: 'Egypt (19.5°/17.5°)',
  7: 'Tehran (17.7°/14°)',
  8: 'Gulf Region (19.5°/90min)',
  9: 'Kuwait (18°/17.5°)',
  10: 'Qatar (18°/90min)',
  11: 'Singapore / SE Asia (20°/18°)',
  12: 'France (12°/12°)',
  13: 'Turkey — Diyanet (18°/17°)',
  14: 'Russia (16°/15°)',
  15: 'Moonsighting Committee',
  16: 'Dubai (18.2°/18.2°)',
  17: 'Malaysia — JAKIM (20°/18°)',
  20: 'Indonesia — Kemenag (20°/18°)',
  21: 'Morocco (19°/17°)',
  23: 'Jordan (18°/18°)',
};

export const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
