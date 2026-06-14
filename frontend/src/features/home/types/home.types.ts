// Home Feature Types

export interface PrayerTimesData {
  times: Record<string, string>;
  nextPrayer: string;
  timeUntilNext: string;
  locationName: string;
  hijriDate?: string;
  hasError?: boolean;
  errorMessage?: string;
}

export interface NavItem {
  icon: React.ReactNode;
  activeIcon: React.ReactNode;
  label: string;
  gradient: [string, string];
  path: string;
}

export interface AISuggestion {
  text: string;
  icon: React.ReactNode;
  color: string;
  prompt: string;
}

export interface SahabaWisdomData {
  companionId: CompanionId;
  companionName: string;
  companionTitle: string;
  wisdom: string;
  topic: string;
  gradientColors: [string, string];
  question: string;
}

export type CompanionId =
  | 'abuBakr'
  | 'umar'
  | 'uthman'
  | 'ali'
  | 'khadijah'
  | 'aisha'
  | 'fatimah';

/** Maps camelCase CompanionId (used in SahabaWisdomCarousel) to snake_case route IDs (used by chatbot) */
export const COMPANION_ROUTE_IDS: Record<string, string> = {
  raya: 'raya',
  abuBakr: 'abu_bakr',
  abu_bakr: 'abu_bakr',
  umar: 'umar',
  uthman: 'uthman',
  ali: 'ali',
  khadijah: 'khadijah',
  aisha: 'aisha',
  fatimah: 'fatimah',
  imam_abu_hanifa: 'imam_abu_hanifa',
  imam_malik: 'imam_malik',
  imam_shafii: 'imam_shafii',
  imam_ahmad: 'imam_ahmad',
};

export interface DailyWisdomEntry {
  companionId: string;      // snake_case route ID
  companionName: string;
  companionTitle: string;
  companionIcon: string;
  accentColor: string;
  wisdom: string;
  source: string;           // e.g. "Sahih al-Bukhari 3668"
  topic: string;
}

export interface QiblaData {
  qiblaDegrees: number;
  compassDirection: string;
  distanceKm: number;
  userLatitude: number;
  userLongitude: number;
}

export type PrayerWidgetState = 'loading' | 'loaded' | 'error';
