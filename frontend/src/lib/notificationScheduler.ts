/**
 * notificationScheduler — wraps @capacitor/local-notifications to schedule
 * client-side reminders that fire even when the app is closed:
 *
 *   - Daily Qur'an read reminder (configurable time, default 9am)
 *   - "Streak about to end" warning when last reading was >18h ago
 *   - Hifz revision nudge if there are weak ayahs and user hasn't tested
 *     in 24h+
 *
 * Local notifications work without any server-side push setup — perfect for
 * v1. Server-pushed notifications (someone posted, halaqah update, etc.)
 * use Firebase Cloud Messaging and require google-services.json on Android +
 * APNs cert on iOS — separate setup, see registerPushReceiver() below.
 */

import { Capacitor } from '@capacitor/core';
import { LocalNotifications, type ScheduleOptions } from '@capacitor/local-notifications';
import { getStreakInfo } from '@/features/quran/services/quranStreakService';

const PREF_KEY = 'zp_notification_prefs_v1';
const SCHEDULED_KEY = 'zp_scheduled_notifications_v1';
const PRAYER_TIMES_KEY = 'zp_prayer_times_v1';

export interface NotificationPrefs {
  enabled: boolean;
  dailyQuranTime: string; // "HH:MM" 24h
  streakWarning: boolean;
  hifzReminder: boolean;
  prayerNotifications: boolean;
}

const DEFAULT_PREFS: NotificationPrefs = {
  enabled: true,
  dailyQuranTime: '09:00',
  streakWarning: true,
  hifzReminder: true,
  prayerNotifications: false,
};

// Reserved IDs so re-scheduling overwrites instead of stacking duplicates.
const ID_DAILY_QURAN = 1001;
const ID_STREAK_WARNING = 1002;
const ID_HIFZ_REMINDER = 1003;
const ID_PRAYER_FAJR = 2001;
const ID_PRAYER_DHUHR = 2002;
const ID_PRAYER_ASR = 2003;
const ID_PRAYER_MAGHRIB = 2004;
const ID_PRAYER_ISHA = 2005;

export interface CachedPrayerTimes {
  fajr: string;     // "HH:MM" 24h, local time
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  /** ms timestamp when cached — used to invalidate after a day */
  cachedAt: number;
}

/** Persist prayer times so the scheduler can read them without re-fetching. */
export function cachePrayerTimes(times: Omit<CachedPrayerTimes, 'cachedAt'>): void {
  try {
    const payload: CachedPrayerTimes = { ...times, cachedAt: Date.now() };
    localStorage.setItem(PRAYER_TIMES_KEY, JSON.stringify(payload));
  } catch {
    // ignore
  }
}

export function getCachedPrayerTimes(): CachedPrayerTimes | null {
  try {
    const raw = localStorage.getItem(PRAYER_TIMES_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedPrayerTimes;
    if (!parsed.fajr) return null;
    return parsed;
  } catch {
    return null;
  }
}

// ── Prefs persistence ─────────────────────────────────────────────

export function getPrefs(): NotificationPrefs {
  try {
    const raw = localStorage.getItem(PREF_KEY);
    if (!raw) return DEFAULT_PREFS;
    return { ...DEFAULT_PREFS, ...(JSON.parse(raw) as Partial<NotificationPrefs>) };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: Partial<NotificationPrefs>): NotificationPrefs {
  const next = { ...getPrefs(), ...prefs };
  try { localStorage.setItem(PREF_KEY, JSON.stringify(next)); } catch { /* ignore */ }
  void rescheduleAll(); // re-arm with the new settings
  return next;
}

// ── Permission ────────────────────────────────────────────────────

export async function ensurePermission(): Promise<boolean> {
  if (!Capacitor.isNativePlatform()) {
    // Browser — use the standard Notification API as a best-effort proxy.
    if (typeof Notification === 'undefined') return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;
    const result = await Notification.requestPermission();
    return result === 'granted';
  }

  const status = await LocalNotifications.checkPermissions();
  if (status.display === 'granted') return true;
  if (status.display === 'denied') return false;
  const ask = await LocalNotifications.requestPermissions();
  return ask.display === 'granted';
}

// ── Scheduling helpers ────────────────────────────────────────────

function nextOccurrence(timeHHMM: string): Date {
  const [h, m] = timeHHMM.split(':').map(Number);
  const now = new Date();
  const target = new Date(now);
  target.setHours(Number.isFinite(h) ? h : 9, Number.isFinite(m) ? m : 0, 0, 0);
  if (target.getTime() <= now.getTime()) target.setDate(target.getDate() + 1);
  return target;
}

async function scheduleNotifications(opts: ScheduleOptions['notifications']): Promise<void> {
  if (!Capacitor.isNativePlatform()) return; // No-op on web — browser API is too limited for daily-repeating reliable alerts
  await LocalNotifications.schedule({ notifications: opts });
}

async function cancelById(id: number): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try { await LocalNotifications.cancel({ notifications: [{ id }] }); } catch { /* ignore */ }
}

// ── Specific reminders ────────────────────────────────────────────

/**
 * Daily Qur'an reminder — fires every day at the user's preferred time.
 * Overwrites any previous schedule via fixed ID.
 */
async function scheduleDailyQuranReminder(): Promise<void> {
  const prefs = getPrefs();
  if (!prefs.enabled) return;

  const next = nextOccurrence(prefs.dailyQuranTime);
  await scheduleNotifications([
    {
      id: ID_DAILY_QURAN,
      title: '📖 Time to read the Qur\'an',
      body: 'A few ayahs each day keeps your streak alive — and your heart at peace.',
      schedule: { at: next, repeats: true, every: 'day' },
      smallIcon: 'ic_launcher',
      sound: undefined,
    },
  ]);
}

/**
 * Streak warning — fires when user hasn't read in ≥18 hours and the streak
 * would break at midnight. Cancels itself once user reads (next reschedule
 * detects fresh read date).
 */
async function scheduleStreakWarning(): Promise<void> {
  const prefs = getPrefs();
  if (!prefs.enabled || !prefs.streakWarning) {
    await cancelById(ID_STREAK_WARNING);
    return;
  }
  const streak = getStreakInfo();
  if (streak.streakCount === 0) {
    await cancelById(ID_STREAK_WARNING);
    return;
  }

  // Last activity: streak.lastReadDate is YYYY-MM-DD; assume completed by 23:59
  // Schedule warning 2 hours before next midnight if streak still active and
  // user hasn't met today's daily target.
  if (streak.dailyReadCount >= streak.dailyTarget) {
    await cancelById(ID_STREAK_WARNING);
    return;
  }

  const tonight = new Date();
  tonight.setHours(22, 0, 0, 0);
  if (tonight.getTime() <= Date.now()) {
    // Already past 10pm today; warning would fire after midnight which is too late
    await cancelById(ID_STREAK_WARNING);
    return;
  }

  await scheduleNotifications([
    {
      id: ID_STREAK_WARNING,
      title: `🔥 Your ${streak.streakCount}-day streak is at risk`,
      body: `Just ${Math.max(1, streak.dailyTarget - streak.dailyReadCount)} more ayahs to keep it alive tonight.`,
      schedule: { at: tonight, repeats: false },
      smallIcon: 'ic_launcher',
    },
  ]);
}

/**
 * Hifz revision reminder — if user has weak ayahs and hasn't tested in
 * 24 hours, nudge them to revise. Fires once tomorrow morning.
 */
async function scheduleHifzReminder(): Promise<void> {
  const prefs = getPrefs();
  if (!prefs.enabled || !prefs.hifzReminder) {
    await cancelById(ID_HIFZ_REMINDER);
    return;
  }

  let weakCount = 0;
  let lastSessionAt = 0;
  try {
    // Lazy import to avoid pulling hifzEngine on every app boot.
    const mod = await import('@/features/quran/services/hifzEngine');
    weakCount = mod.getWeakAyahs(50).length;
    const sessions = mod.getSessions();
    lastSessionAt = sessions[0]?.startedAt ?? 0;
  } catch {
    return;
  }

  const sinceLastTest = Date.now() - lastSessionAt;
  if (weakCount === 0 || sinceLastTest < 24 * 60 * 60 * 1000) {
    await cancelById(ID_HIFZ_REMINDER);
    return;
  }

  const tomorrowMorning = new Date();
  tomorrowMorning.setDate(tomorrowMorning.getDate() + 1);
  tomorrowMorning.setHours(8, 30, 0, 0);

  await scheduleNotifications([
    {
      id: ID_HIFZ_REMINDER,
      title: '🧠 Hifz revision waiting',
      body: `${weakCount} ayah${weakCount > 1 ? 's' : ''} need a quick revision — 5 minutes is enough.`,
      schedule: { at: tomorrowMorning, repeats: false },
      smallIcon: 'ic_launcher',
    },
  ]);
}

/**
 * Five daily prayer notifications at the user's local Fajr/Dhuhr/Asr/
 * Maghrib/Isha times. Reschedules every day (Capacitor's daily-repeat
 * locks the time-of-day, so on-day-N we'll get the correct minute even
 * as the source data shifts a few minutes per week).
 */
async function schedulePrayerNotifications(): Promise<void> {
  const prefs = getPrefs();
  const ids = [ID_PRAYER_FAJR, ID_PRAYER_DHUHR, ID_PRAYER_ASR, ID_PRAYER_MAGHRIB, ID_PRAYER_ISHA];
  if (!prefs.enabled || !prefs.prayerNotifications) {
    for (const id of ids) await cancelById(id);
    return;
  }
  const times = getCachedPrayerTimes();
  if (!times) return; // no cached data yet — PrayerTimesPage will trigger a reschedule once it loads

  const entries: Array<{ id: number; name: string; emoji: string; hhmm: string }> = [
    { id: ID_PRAYER_FAJR, name: 'Fajr', emoji: '🌄', hhmm: times.fajr },
    { id: ID_PRAYER_DHUHR, name: 'Dhuhr', emoji: '☀️', hhmm: times.dhuhr },
    { id: ID_PRAYER_ASR, name: 'Asr', emoji: '🌤️', hhmm: times.asr },
    { id: ID_PRAYER_MAGHRIB, name: 'Maghrib', emoji: '🌅', hhmm: times.maghrib },
    { id: ID_PRAYER_ISHA, name: 'Isha', emoji: '🌙', hhmm: times.isha },
  ];

  await scheduleNotifications(
    entries.map(({ id, name, emoji, hhmm }) => ({
      id,
      title: `${emoji} ${name} prayer`,
      body: `It's time for ${name}.`,
      schedule: { at: nextOccurrence(hhmm), repeats: true, every: 'day' },
      smallIcon: 'ic_launcher',
    })),
  );
}

/**
 * Recompute and arm all reminders. Cheap to call frequently — Capacitor
 * dedupes by id. Call on app boot, on user activity, and whenever prefs
 * change.
 */
export async function rescheduleAll(): Promise<void> {
  const granted = await ensurePermission();
  if (!granted) return;
  await Promise.all([
    scheduleDailyQuranReminder(),
    scheduleStreakWarning(),
    scheduleHifzReminder(),
    schedulePrayerNotifications(),
  ]);
  try { localStorage.setItem(SCHEDULED_KEY, String(Date.now())); } catch { /* ignore */ }
}

/**
 * Disable everything (used by Settings toggle). Cancels pending notifications
 * but keeps the user's prefs so they can re-enable later.
 */
export async function cancelAll(): Promise<void> {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const pending = await LocalNotifications.getPending();
    if (pending.notifications.length > 0) {
      await LocalNotifications.cancel({ notifications: pending.notifications });
    }
  } catch { /* ignore */ }
}

/**
 * Fire a fake prayer notification N seconds from now — for testing the
 * adhan flow without waiting for the actual prayer time. Surfaced as a
 * "Test in 15s" button on the Notification Settings screen.
 */
export async function scheduleTestPrayerNotification(secondsFromNow = 15): Promise<void> {
  const granted = await ensurePermission();
  if (!granted) return;
  const at = new Date(Date.now() + secondsFromNow * 1000);
  await scheduleNotifications([{
    id: 9999,
    title: '🌄 Fajr prayer',
    body: "It's time for Fajr. (test)",
    schedule: { at },
    smallIcon: 'ic_launcher',
  }]);
}

// ── Server-pushed notifications (FCM) ─────────────────────────────

/**
 * Register for FCM push notifications. Currently a no-op — the
 * @capacitor/push-notifications plugin is uninstalled until google-services.json
 * is added. To re-enable:
 *   1. add google-services.json to frontend/android/app/
 *   2. npm install @capacitor/push-notifications
 *   3. restore the native call (see git log for previous body, or below)
 *
 * Why removed: without google-services.json, PushNotifications.register() calls
 * FirebaseMessaging.getInstance() on the native side, which throws
 * IllegalStateException (default FirebaseApp not initialized). Capacitor's
 * Bridge wraps it as RuntimeException and re-throws on the main thread —
 * crashing the entire app process. This produced the Samsung "this app has
 * a bug, clear cache" cold-start crash on every reopen after first sign-in.
 */
export async function registerPushReceiver(_uid: string): Promise<void> {
  return;
}

// ── Generic user reminders (Barakah Labs doors etc.) ───────────────
// Used by Dua + Action doors when the user accepts Raya's "set a reminder"
// offer. IDs 5000-5999 are reserved for this purpose so they never collide
// with the fixed-ID schedules above (1001/1002/1003/2001-2005/9999).

const USER_REMINDER_ID_MIN = 5000;
const USER_REMINDER_ID_MAX = 5999;

/** Pick a stable-enough numeric ID from a string seed. Same seed → same ID
 *  so re-scheduling overwrites instead of stacking. djb2 hash, then folded
 *  into the reserved 5000-5999 band. */
export function userReminderIdFor(seed: string): number {
  let h = 5381;
  for (let i = 0; i < seed.length; i++) h = ((h << 5) + h + seed.charCodeAt(i)) | 0;
  const band = USER_REMINDER_ID_MAX - USER_REMINDER_ID_MIN + 1;
  return USER_REMINDER_ID_MIN + (Math.abs(h) % band);
}

export interface UserReminderResult {
  scheduled: boolean;
  /** Why the reminder didn't schedule, if it didn't. */
  reason?: 'web-unsupported' | 'no-permission' | 'in-past' | 'error';
  id?: number;
}

/**
 * Schedule a one-shot user reminder. Native only — on web returns
 * `{ scheduled: false, reason: 'web-unsupported' }` so the UI can show
 * "available on mobile" rather than pretending to schedule something it
 * can't reliably deliver. (Web in-app banner fallback is deferred — see
 * zaryah-brain/projects/doors-redesign-2026.md.)
 */
export async function scheduleUserReminder(opts: {
  id: number;
  title: string;
  body: string;
  at: Date;
}): Promise<UserReminderResult> {
  if (!Capacitor.isNativePlatform()) {
    return { scheduled: false, reason: 'web-unsupported' };
  }
  if (opts.at.getTime() <= Date.now()) {
    return { scheduled: false, reason: 'in-past' };
  }
  const granted = await ensurePermission();
  if (!granted) return { scheduled: false, reason: 'no-permission' };
  try {
    await LocalNotifications.schedule({
      notifications: [{
        id: opts.id,
        title: opts.title,
        body: opts.body,
        schedule: { at: opts.at },
        smallIcon: 'ic_launcher',
      }],
    });
    return { scheduled: true, id: opts.id };
  } catch {
    return { scheduled: false, reason: 'error' };
  }
}

/** Cancel a previously-scheduled user reminder. Safe to call even if no
 *  reminder with that id exists. */
export async function cancelUserReminder(id: number): Promise<void> {
  await cancelById(id);
}
