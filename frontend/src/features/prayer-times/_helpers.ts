/**
 * Pure date/time/country helper functions for the prayer-times page.
 *
 * Phase 5 split — moved out of PrayerTimesPage.tsx so the page component
 * carries only the JSX and the React state. No browser API access here
 * (no `navigator`, no `fetch`); see `_api.ts` for the network-touching
 * helpers.
 */

import { PRAYER_ORDER } from './_constants';

export function formatTime24to12(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${minutes.toString().padStart(2, '0')} ${period}`;
}

export function parseTimeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number);
  return h * 60 + m;
}

export function getCurrentMinutes(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function getNextPrayer(times: Record<string, string>): string {
  const currentMins = getCurrentMinutes();
  for (const prayer of PRAYER_ORDER) {
    if (parseTimeToMinutes(times[prayer]) > currentMins) {
      return prayer;
    }
  }
  return 'Fajr';
}

export function getCurrentPrayer(times: Record<string, string>): string {
  const currentMins = getCurrentMinutes();
  let current = 'Isha';
  for (const prayer of PRAYER_ORDER) {
    if (parseTimeToMinutes(times[prayer]) <= currentMins) {
      current = prayer;
    } else {
      break;
    }
  }
  return current;
}

export function getTimeUntilPrayer(
  times: Record<string, string>,
  prayer: string,
): { hours: number; minutes: number; seconds: number; totalSeconds: number } {
  const now = new Date();
  const [h, m] = times[prayer].split(':').map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);

  if (prayer === 'Fajr' && now.getHours() * 60 + now.getMinutes() > parseTimeToMinutes(times.Isha)) {
    target.setDate(target.getDate() + 1);
  }

  const diff = Math.max(0, target.getTime() - now.getTime());
  const totalSeconds = Math.floor(diff / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return { hours, minutes, seconds, totalSeconds };
}

export function getDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function getWeekDates(baseDate: Date): Date[] {
  const dates: Date[] = [];
  const startOfWeek = new Date(baseDate);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    dates.push(d);
  }
  return dates;
}

/**
 * Pick a calculation method by user's detected country. Defaults to
 * Muslim World League (3) when nothing matches. Keep this list aligned
 * with `CALCULATION_METHODS` in `_constants.ts` so a country never maps
 * to a method that doesn't exist.
 */
export function getMethodForCountry(country: string): number {
  const c = country.toLowerCase();
  // Indian subcontinent → South Asia (Karachi 18°/18°)
  if (['india', 'pakistan', 'bangladesh', 'afghanistan', 'sri lanka', 'nepal'].some((x) => c.includes(x))) return 1;
  // North America → ISNA
  if (['united states', 'canada', 'usa', 'mexico'].some((x) => c.includes(x))) return 2;
  // Saudi Arabia → Umm Al-Qura
  if (c.includes('saudi')) return 4;
  // Egypt → Egyptian
  if (c.includes('egypt')) return 5;
  // North Africa (specific)
  if (c.includes('morocco')) return 21;
  if (['algeria', 'tunisia', 'libya', 'sudan'].some((x) => c.includes(x))) return 5;
  // Gulf states
  if (['united arab emirates', 'uae'].some((x) => c.includes(x))) return 16; // Dubai method
  if (c.includes('bahrain') || c.includes('oman') || c.includes('yemen')) return 8;
  if (c.includes('kuwait')) return 9;
  if (c.includes('qatar')) return 10;
  // Jordan
  if (c.includes('jordan')) return 23;
  // Southeast Asia (specific)
  if (c.includes('malaysia') || c.includes('brunei')) return 17; // JAKIM
  if (c.includes('indonesia')) return 20; // Kemenag
  if (['singapore', 'thailand', 'philippines'].some((x) => c.includes(x))) return 11;
  // Turkey
  if (c.includes('turkey') || c.includes('türkiye')) return 13;
  // Iran
  if (c.includes('iran')) return 7;
  // Russia / Central Asia
  if (['russia', 'kazakhstan', 'uzbekistan', 'tajikistan', 'kyrgyzstan'].some((x) => c.includes(x))) return 14;
  // France
  if (c.includes('france')) return 12;
  // Europe / rest of world → Muslim World League
  return 3;
}
