import type { PrayerTimesData } from '../types/home.types';

const DEFAULT_PRAYER_TIMES: Record<string, string> = {
  Fajr: '05:30',
  Dhuhr: '12:15',
  Asr: '15:30',
  Maghrib: '18:00',
  Isha: '19:30',
};

const PRAYER_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;

// ── Auto-detect calculation method by coordinates ─────────

function getMethodForLocation(lat: number, lon: number): number {
  // South Asia (India, Pakistan, Bangladesh, Sri Lanka, Nepal)
  if (lat >= 5 && lat <= 38 && lon >= 60 && lon <= 98) return 1;
  // Southeast Asia — Indonesia
  if (lat >= -11 && lat <= 6 && lon >= 95 && lon <= 141) return 20;
  // Southeast Asia — Malaysia/Singapore
  if (lat >= -1 && lat <= 8 && lon >= 99 && lon <= 120) return 17;
  // Turkey
  if (lat >= 36 && lat <= 42 && lon >= 26 && lon <= 45) return 13;
  // Iran
  if (lat >= 25 && lat <= 40 && lon >= 44 && lon <= 64) return 7;
  // Saudi Arabia
  if (lat >= 16 && lat <= 33 && lon >= 34 && lon <= 56) return 4;
  // UAE / Gulf
  if (lat >= 22 && lat <= 27 && lon >= 51 && lon <= 57) return 16;
  // Kuwait
  if (lat >= 28 && lat <= 31 && lon >= 46 && lon <= 49) return 9;
  // Qatar
  if (lat >= 24 && lat <= 27 && lon >= 50 && lon <= 52) return 10;
  // Egypt
  if (lat >= 22 && lat <= 32 && lon >= 25 && lon <= 37) return 5;
  // North Africa (Morocco, Algeria, Tunisia, Libya)
  if (lat >= 15 && lat <= 38 && lon >= -17 && lon <= 25) return 5;
  // Jordan
  if (lat >= 29 && lat <= 34 && lon >= 34 && lon <= 40) return 23;
  // North America
  if (lat >= 15 && lat <= 72 && lon >= -170 && lon <= -50) return 2;
  // Russia / Central Asia
  if (lat >= 40 && lat <= 75 && lon >= 40 && lon <= 180) return 14;
  // France
  if (lat >= 42 && lat <= 51 && lon >= -5 && lon <= 9) return 12;
  // Default — Muslim World League
  return 3;
}

/** Hijri day adjustment per region to match local moon-sighting authorities */
function getHijriAdjustment(lat: number, lon: number): number {
  // South Asia (India, Pakistan, Bangladesh) — local sighting typically 1 day behind tabular
  if (lat >= 5 && lat <= 38 && lon >= 60 && lon <= 98) return -1;
  return 0;
}

// ── Helpers ───────────────────────────────────────────────

function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function parseTime(timeStr: string): Date {
  const [hours, minutes] = timeStr.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
}

function getNextPrayer(times: Record<string, string>): string {
  const now = new Date();
  const currentTime = formatTime(now);

  for (const prayer of PRAYER_ORDER) {
    if (times[prayer] > currentTime) {
      return prayer;
    }
  }

  return 'Fajr';
}

function getTimeUntilNext(times: Record<string, string>, nextPrayer: string): string {
  const now = new Date();
  const prayerTime = parseTime(times[nextPrayer]);

  if (nextPrayer === 'Fajr' && formatTime(now) > times.Isha) {
    prayerTime.setDate(prayerTime.getDate() + 1);
  }

  const diff = prayerTime.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

// ── API ───────────────────────────────────────────────────

async function fetchFromAladhan(lat: number, lon: number, method: number, hijriAdj: number): Promise<{ times: Record<string, string>; hijriDate: string } | null> {
  try {
    const now = new Date();
    const dateStr = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lon}&method=${method}&school=0`;
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return null;
    const data = await res.json();
    const t = data.data.timings;
    const h = data.data.date?.hijri;
    let hijriDate = '';
    if (h) {
      // Apply regional hijri day adjustment (API doesn't adjust the date field)
      const adjustedDay = Math.max(1, parseInt(h.day, 10) + hijriAdj);
      hijriDate = `${adjustedDay} ${h.month?.en ?? ''} ${h.year} AH`;
    }
    return {
      times: {
        Fajr: t.Fajr.substring(0, 5),
        Dhuhr: t.Dhuhr.substring(0, 5),
        Asr: t.Asr.substring(0, 5),
        Maghrib: t.Maghrib.substring(0, 5),
        Isha: t.Isha.substring(0, 5),
      },
      hijriDate,
    };
  } catch {
    return null;
  }
}

function getCurrentPosition(): Promise<GeolocationPosition | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => resolve(position),
      () => resolve(null),
      { timeout: 5000, maximumAge: 300000 }
    );
  });
}

// Cache to avoid re-fetching on every widget render
let _cachedTimes: { times: Record<string, string>; hijriDate: string; locationName: string; timestamp: number } | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

export async function getPrayerTimes(): Promise<PrayerTimesData> {
  try {
    // Return cached if fresh enough
    if (_cachedTimes && Date.now() - _cachedTimes.timestamp < CACHE_DURATION) {
      const times = _cachedTimes.times;
      const nextPrayer = getNextPrayer(times);
      const timeUntilNext = getTimeUntilNext(times, nextPrayer);
      return { times, nextPrayer, timeUntilNext, locationName: _cachedTimes.locationName, hijriDate: _cachedTimes.hijriDate, hasError: false };
    }

    const position = await getCurrentPosition();

    if (position) {
      const { latitude: lat, longitude: lon } = position.coords;
      const method = getMethodForLocation(lat, lon);
      const hijriAdj = getHijriAdjustment(lat, lon);
      const result = await fetchFromAladhan(lat, lon, method, hijriAdj);

      if (result) {
        _cachedTimes = { times: result.times, hijriDate: result.hijriDate, locationName: 'Current Location', timestamp: Date.now() };
        const nextPrayer = getNextPrayer(result.times);
        const timeUntilNext = getTimeUntilNext(result.times, nextPrayer);
        return { times: result.times, nextPrayer, timeUntilNext, locationName: 'Current Location', hijriDate: result.hijriDate, hasError: false };
      }
    }

    // Fallback to defaults
    const times = DEFAULT_PRAYER_TIMES;
    const nextPrayer = getNextPrayer(times);
    const timeUntilNext = getTimeUntilNext(times, nextPrayer);
    return { times, nextPrayer, timeUntilNext, locationName: 'Default', hasError: true, errorMessage: 'Using default times. Enable location for accurate times.' };
  } catch {
    const times = DEFAULT_PRAYER_TIMES;
    const nextPrayer = getNextPrayer(times);
    const timeUntilNext = getTimeUntilNext(times, nextPrayer);
    return { times, nextPrayer, timeUntilNext, locationName: 'Default', hasError: true, errorMessage: 'Using default times. Enable location for accurate times.' };
  }
}

export async function refreshPrayerTimes(): Promise<PrayerTimesData> {
  _cachedTimes = null; // Force fresh fetch
  return getPrayerTimes();
}

export function getCurrentPrayer(): string {
  const times = _cachedTimes?.times ?? DEFAULT_PRAYER_TIMES;
  const now = new Date();
  const currentTime = formatTime(now);

  let currentPrayer = 'Isha';
  for (const prayer of PRAYER_ORDER) {
    if (times[prayer] <= currentTime) {
      currentPrayer = prayer;
    } else {
      break;
    }
  }
  return currentPrayer;
}
