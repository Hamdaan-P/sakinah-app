/**
 * Network-touching helpers for the prayer-times page.
 *
 * Phase 5 split — moved out of PrayerTimesPage.tsx so the page component
 * doesn't carry direct fetch() calls. All three functions are
 * best-effort and return null / a safe fallback on failure; the page is
 * expected to fall back to `DEFAULT_TIMES` when an API call returns
 * null.
 */

import { CALCULATION_METHODS, type PrayerData } from './_constants';
import { getDateString } from './_helpers';

export async function fetchPrayerTimesFromAPI(
  lat: number,
  lon: number,
  date: Date,
  method: number = 2,
): Promise<PrayerData | null> {
  try {
    const dateStr = `${date.getDate()}-${date.getMonth() + 1}-${date.getFullYear()}`;
    const url = `https://api.aladhan.com/v1/timings/${dateStr}?latitude=${lat}&longitude=${lon}&method=${method}&school=0`;
    const response = await fetch(url, { signal: AbortSignal.timeout(10000) });

    if (!response.ok) return null;

    const data = await response.json();
    const timings = data.data.timings;
    const hijri = data.data.date.hijri;

    return {
      times: {
        Fajr: timings.Fajr.substring(0, 5),
        Dhuhr: timings.Dhuhr.substring(0, 5),
        Asr: timings.Asr.substring(0, 5),
        Maghrib: timings.Maghrib.substring(0, 5),
        Isha: timings.Isha.substring(0, 5),
      },
      locationName: 'Current Location',
      source: 'api',
      date: getDateString(date),
      hijriDate: `${hijri.day} ${hijri.month.en} ${hijri.year} AH`,
      method: CALCULATION_METHODS[method] || 'ISNA',
    };
  } catch {
    return null;
  }
}

export async function getLocation(): Promise<{ lat: number; lon: number } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => resolve(null),
      { timeout: 5000, maximumAge: 300000 },
    );
  });
}

export async function reverseGeocode(lat: number, lon: number): Promise<{ name: string; country: string }> {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&zoom=10`;
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    const data = await res.json();
    const city = data.address?.city || data.address?.town || data.address?.village || data.address?.state;
    const country = data.address?.country || '';
    let name = 'Current Location';
    if (city && country) name = `${city}, ${country}`;
    else if (city) name = city;
    else if (country) name = country;
    return { name, country };
  } catch {
    return { name: 'Current Location', country: '' };
  }
}
