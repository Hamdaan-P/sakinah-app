/**
 * Prayer Times Page
 * Full-featured prayer times with Aladhan API integration,
 * next prayer countdown, weekly view, and prayer tracking.
 * Flutter-to-React conversion: prayer_times_widget.dart + unified_prayer_service.dart
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { DisclaimerBanner } from '@/components/shared';
import { trackFeature } from '@/lib/analytics';
import { QiblaCompassPage } from '@/features/qibla/pages/QiblaCompassPage';
import { HijriCalendarPage } from '@/features/calendar/pages/HijriCalendarPage';
import { Check, Compass, Calendar, Clock } from '@phosphor-icons/react';

import {
  CALCULATION_METHODS,
  DEFAULT_TIMES,
  NAVY_BG,
  NAVY_CARD,
  type DayCompletion,
  type PrayerData,
} from '../_constants';
import {
  formatTime24to12,
  getCurrentPrayer,
  getDateString,
  getMethodForCountry,
  getNextPrayer,
  getTimeUntilPrayer,
  getWeekDates,
} from '../_helpers';
import { fetchPrayerTimesFromAPI, getLocation, reverseGeocode } from '../_api';
import { TodayTab } from './components/TodayTab';
import { WeeklyTab } from './components/WeeklyTab';
import { TrackerTab } from './components/TrackerTab';
import { MethodPickerSheet } from './components/MethodPickerSheet';
import { PrayerHeader } from './components/PrayerHeader';

// ── Component ──────────────────────────────────────────────

export function PrayerTimesPage() {
  useEffect(() => { trackFeature('prayer-times'); }, []);
  const [prayerData, setPrayerData] = useState<PrayerData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [countdown, setCountdown] = useState({ hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 });
  const [nextPrayer, setNextPrayer] = useState('Fajr');
  const [currentPrayer, setCurrentPrayerState] = useState('Fajr');
  const [selectedMethod, setSelectedMethod] = useState(3); // Default MWL, auto-detected on load
  const methodAutoDetectedRef = useRef(false);
  const [showMethodPicker, setShowMethodPicker] = useState(false);
  const [use12Hour, setUse12Hour] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [notifications, setNotifications] = useState<Set<string>>(new Set(['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']));
  const [completedPrayers, setCompletedPrayers] = useState<DayCompletion[]>([]);
  const [activeTab, setActiveTab] = useState<'today' | 'weekly' | 'tracker' | 'qibla' | 'calendar'>('today');

  const locationRef = useRef<{ lat: number; lon: number } | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load prayer times
  const loadPrayerTimes = useCallback(async (force = false) => {
    if (!force) setLoading(true);
    else setIsRefreshing(true);

    try {
      const loc = await getLocation();
      locationRef.current = loc;

      let data: PrayerData | null = null;

      if (loc) {
        // Auto-detect calculation method from country on first load
        let method = selectedMethod;
        const geo = await reverseGeocode(loc.lat, loc.lon);
        if (!methodAutoDetectedRef.current && geo.country) {
          method = getMethodForCountry(geo.country);
          setSelectedMethod(method);
          methodAutoDetectedRef.current = true;
        }
        data = await fetchPrayerTimesFromAPI(loc.lat, loc.lon, new Date(), method);
        if (data) {
          data.locationName = geo.name;
        }
      }

      if (!data) {
        const next = getNextPrayer(DEFAULT_TIMES);
        data = {
          times: DEFAULT_TIMES,
          locationName: loc ? 'Current Location' : 'Default Location',
          source: 'defaults',
          date: getDateString(new Date()),
          errorMessage: loc
            ? 'API unavailable. Showing approximate times.'
            : 'Enable location for accurate prayer times.',
          method: CALCULATION_METHODS[selectedMethod],
        };
        setNextPrayer(next);
        setCurrentPrayerState(getCurrentPrayer(DEFAULT_TIMES));
      } else {
        setNextPrayer(getNextPrayer(data.times));
        setCurrentPrayerState(getCurrentPrayer(data.times));
      }

      setPrayerData(data);
      // Cache for the local-notification scheduler so it can arm 5-daily
      // prayer alarms without re-fetching.
      try {
        const { cachePrayerTimes, rescheduleAll } = await import('@/lib/notificationScheduler');
        cachePrayerTimes({
          fajr: data.times.Fajr,
          dhuhr: data.times.Dhuhr,
          asr: data.times.Asr,
          maghrib: data.times.Maghrib,
          isha: data.times.Isha,
        });
        void rescheduleAll();
      } catch {
        // ignore — scheduler is best-effort
      }
    } catch {
      setPrayerData({
        times: DEFAULT_TIMES,
        locationName: 'Default Location',
        source: 'defaults',
        date: getDateString(new Date()),
        errorMessage: 'Unable to load prayer times. Using defaults.',
      });
      setNextPrayer(getNextPrayer(DEFAULT_TIMES));
      setCurrentPrayerState(getCurrentPrayer(DEFAULT_TIMES));
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [selectedMethod]);

  // Initial load
  useEffect(() => {
    loadPrayerTimes();
  }, [loadPrayerTimes]);

  // Countdown timer
  useEffect(() => {
    if (!prayerData) return;

    const update = () => {
      const times = prayerData.times;
      const next = getNextPrayer(times);
      setNextPrayer(next);
      setCurrentPrayerState(getCurrentPrayer(times));
      setCountdown(getTimeUntilPrayer(times, next));
    };

    update();
    countdownRef.current = setInterval(update, 1000);

    return () => {
      if (countdownRef.current) clearInterval(countdownRef.current);
    };
  }, [prayerData]);

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (prayerData && locationRef.current) {
        fetchPrayerTimesFromAPI(locationRef.current.lat, locationRef.current.lon, new Date(), selectedMethod)
          .then((data) => {
            if (data) {
              data.locationName = prayerData.locationName;
              setPrayerData(data);
            }
          })
          .catch(() => {});
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [prayerData, selectedMethod]);

  const toggleNotification = (prayer: string) => {
    setNotifications((prev) => {
      const next = new Set(prev);
      if (next.has(prayer)) next.delete(prayer);
      else next.add(prayer);
      return next;
    });
  };

  const togglePrayerCompletion = (prayer: string) => {
    const today = getDateString(new Date());
    setCompletedPrayers((prev) => {
      const existing = prev.find((d) => d.date === today);
      if (existing) {
        const isCompleted = existing.completed.includes(prayer);
        return prev.map((d) =>
          d.date === today
            ? {
                ...d,
                completed: isCompleted
                  ? d.completed.filter((p) => p !== prayer)
                  : [...d.completed, prayer],
              }
            : d
        );
      }
      return [...prev, { date: today, completed: [prayer] }];
    });
  };

  const todayCompleted = completedPrayers.find((d) => d.date === getDateString(new Date()))?.completed || [];

  const formatDisplayTime = (time: string) => (use12Hour ? formatTime24to12(time) : time);

  // Calculate progress for circular countdown
  const totalSecondsInDay = 24 * 3600;
  const progressPercent = prayerData
    ? ((totalSecondsInDay - countdown.totalSeconds) / totalSecondsInDay) * 100
    : 0;

  const weekDates = getWeekDates(
    (() => {
      const d = new Date();
      d.setDate(d.getDate() + weekOffset * 7);
      return d;
    })()
  );

  const tabs = [
    { id: 'today' as const, label: 'Today', icon: Clock },
    { id: 'weekly' as const, label: 'Weekly', icon: Calendar },
    { id: 'tracker' as const, label: 'Tracker', icon: Check },
    { id: 'qibla' as const, label: 'Qibla', icon: Compass },
    { id: 'calendar' as const, label: 'Hijri', icon: Calendar },
  ];

  // ── Render ─────────────────────────────────────────────
  return (
    <div style={{ flex: 1, padding: '24px', overflowY: 'auto', background: NAVY_BG }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <PrayerHeader
          prayerData={prayerData}
          isRefreshing={isRefreshing}
          use12Hour={use12Hour}
          activeTab={activeTab}
          tabs={tabs}
          onToggleUse12Hour={() => setUse12Hour(!use12Hour)}
          onRefresh={() => loadPrayerTimes(true)}
          onTabChange={setActiveTab}
        />

        {/* Loading state */}
        {loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                style={{
                  height: '72px',
                  background: NAVY_CARD,
                  borderRadius: '12px',
                  animation: 'pulse 2s ease-in-out infinite',
                  animationDelay: `${i * 100}ms`,
                }}
              />
            ))}
          </div>
        )}

        {/* Today Tab */}
        {!loading && activeTab === 'today' && prayerData && (
          <TodayTab
            prayerData={prayerData}
            nextPrayer={nextPrayer}
            currentPrayer={currentPrayer}
            countdown={countdown}
            progressPercent={progressPercent}
            todayCompleted={todayCompleted}
            notifications={notifications}
            onTogglePrayer={togglePrayerCompletion}
            onToggleNotification={toggleNotification}
            onShowMethodPicker={() => setShowMethodPicker(true)}
            formatDisplayTime={formatDisplayTime}
          />
        )}

        {/* Weekly Tab */}
        {!loading && activeTab === 'weekly' && prayerData && (
          <WeeklyTab
            prayerData={prayerData}
            weekDates={weekDates}
            formatDisplayTime={formatDisplayTime}
            onPrevWeek={() => setWeekOffset((p) => p - 1)}
            onNextWeek={() => setWeekOffset((p) => p + 1)}
          />
        )}

        {/* Tracker Tab */}
        {!loading && activeTab === 'tracker' && (
          <TrackerTab completedPrayers={completedPrayers} />
        )}

        {/* Qibla Tab — embedded full page */}
        {activeTab === 'qibla' && (
          <motion.div key="qibla" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <QiblaCompassPage />
          </motion.div>
        )}

        {/* Hijri Calendar Tab — embedded full page */}
        {activeTab === 'calendar' && (
          <motion.div key="calendar" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <HijriCalendarPage />
          </motion.div>
        )}

        <MethodPickerSheet
          open={showMethodPicker}
          selectedMethod={selectedMethod}
          onClose={() => setShowMethodPicker(false)}
          onSelect={(id) => {
            setSelectedMethod(id);
            setShowMethodPicker(false);
            loadPrayerTimes(true);
          }}
        />
      </div>

      <div style={{ padding: '0 16px 16px' }}>
        <DisclaimerBanner contentId="RELIGIOUS" variant="subtle" />
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 0.7; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
