/**
 * Lightweight feature usage tracker.
 * Logs page visits to Firestore `feature_usage` collection.
 */
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '@/config/firebase.config';

// Route path → human-readable feature name
const FEATURE_NAMES: Record<string, string> = {
  '/': 'Dashboard',
  '/dashboard': 'Dashboard',
  '/ai-assistant': 'AI Assistant (Raya)',
  '/quran': 'Quran',
  '/quran/read': 'Quran Reading',
  '/quran/recitation': 'Quran Recitation',
  '/quran/streak': 'Quran Streak',
  '/prayer-times': 'Prayer Times',
  '/zakat': 'Zakat Calculator',
  '/calendar': 'Hijri Calendar',
  '/education': 'Education',
  '/qibla': 'Qibla Compass',
  '/faith': 'Faith',
  '/faith/masjid-finder': 'Masjid Finder',
  '/screener': 'Stock Screener',
  '/islamic-banking': 'Islamic Banking',
  '/wallet': 'Wallet',
  '/commerce': 'Commerce',
  '/matrimony': 'Matrimony',
  '/real-estate': 'Real Estate',
  '/digital-id': 'Digital ID',
  '/halaqah': 'Halaqah',
  '/events': 'Events',
  '/media': 'Media',
  '/bait-ul-maal': 'Bait-ul-Maal',
  '/voice-companion': 'Voice Companion',
  '/settings': 'Settings',
  '/profile': 'Profile',
  '/support': 'Support',
  '/notifications': 'Notifications',
  '/ramadan-kids': 'Ramadan Kids',
  '/debt': 'Debt Restructuring',
  '/purification': 'Purification Calculator',
  '/shark-tank': 'Shark Tank',
  '/chamber': 'Chamber',
  '/halal-intimacy': 'Halal Intimacy',
  '/tiswa': 'TISWA',
};

// Throttle: don't log same feature more than once per 60s
const _lastLogged = new Map<string, number>();
const THROTTLE_MS = 60_000;

/**
 * Deprecated — kept as no-op so existing imports don't break during cleanup.
 * logFeatureVisit (called from MainLayout) handles all tracking now.
 */
export function trackFeature(_feature: string): void {
  // no-op — MainLayout.logFeatureVisit handles all tracking
}

export async function logFeatureVisit(pathname: string): Promise<void> {
  try {
    const user = auth.currentUser;
    const userId = user?.uid;
    if (!userId) return;

    // Normalize path (strip trailing slash)
    const path = pathname.replace(/\/$/, '') || '/';

    // Skip admin, auth, kyc paths
    if (path.startsWith('/admin') || path.startsWith('/login') || path.startsWith('/signup') || path.startsWith('/quick-kyc') || path.startsWith('/deep-kyc')) return;

    const featureName = FEATURE_NAMES[path];
    if (!featureName) return;

    // Throttle check
    const key = `${userId}:${path}`;
    const now = Date.now();
    const last = _lastLogged.get(key) || 0;
    if (now - last < THROTTLE_MS) return;
    _lastLogged.set(key, now);

    // Write to Firestore with user name for admin feed
    addDoc(collection(db, 'feature_usage'), {
      userId,
      userName: user.displayName || user.email?.split('@')[0] || 'Unknown',
      path,
      feature: featureName,
      timestamp: serverTimestamp(),
    }).catch(() => {});
  } catch {
    // Never break the app for analytics
  }
}
