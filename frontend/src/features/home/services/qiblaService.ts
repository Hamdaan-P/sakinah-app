import type { QiblaData } from '../types/home.types';

// Kaaba coordinates in Makkah
const KAABA_LATITUDE = 21.4225;
const KAABA_LONGITUDE = 39.8262;

function toRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

function toDegrees(radians: number): number {
  return (radians * 180) / Math.PI;
}

function calculateBearing(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δλ = toRadians(lon2 - lon1);

  const x = Math.sin(Δλ) * Math.cos(φ2);
  const y =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);

  let bearing = toDegrees(Math.atan2(x, y));

  if (bearing < 0) {
    bearing += 360;
  }

  return bearing;
}

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371;
  const φ1 = toRadians(lat1);
  const φ2 = toRadians(lat2);
  const Δφ = toRadians(lat2 - lat1);
  const Δλ = toRadians(lon2 - lon1);

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

const DIRECTIONS = [
  'N', 'NNE', 'NE', 'ENE',
  'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW',
  'W', 'WNW', 'NW', 'NNW'
] as const;

function getCompassDirection(bearing: number): string {
  const index = Math.round(((bearing + 11.25) % 360) / 22.5) % 16;
  return DIRECTIONS[index];
}

export function calculateQiblaDirection(
  latitude: number,
  longitude: number
): QiblaData {
  const qiblaDegrees = calculateBearing(
    latitude,
    longitude,
    KAABA_LATITUDE,
    KAABA_LONGITUDE
  );

  const distanceKm = calculateDistance(
    latitude,
    longitude,
    KAABA_LATITUDE,
    KAABA_LONGITUDE
  );

  const compassDirection = getCompassDirection(qiblaDegrees);

  return {
    qiblaDegrees,
    compassDirection,
    distanceKm,
    userLatitude: latitude,
    userLongitude: longitude,
  };
}

export async function getQiblaDirection(): Promise<QiblaData | null> {
  try {
    const position = await getCurrentPosition();

    if (!position) {
      return null;
    }

    return calculateQiblaDirection(
      position.coords.latitude,
      position.coords.longitude
    );
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
      { timeout: 10000, maximumAge: 300000 }
    );
  });
}

export function formatDistance(distanceKm: number): string {
  if (distanceKm < 1) {
    return `${Math.round(distanceKm * 1000)} m`;
  } else if (distanceKm < 10) {
    return `${distanceKm.toFixed(1)} km`;
  } else {
    return `${Math.round(distanceKm)} km`;
  }
}
