import { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  ArrowsClockwise,
  Mosque,
  Info,
  Sun,
  CloudSun,
  SunHorizon,
  MoonStars,
  Moon,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { PrayerTimesData, PrayerWidgetState } from '../types/home.types';
import { getPrayerTimes, refreshPrayerTimes } from '../services/prayerTimeService';
import { GlassmorphicCard, ErrorCard } from './IslamicWidgetComponents';
import { PrayerTimesLoadingState } from './prayer-times-widget/PrayerCard';

interface PrayerTimesWidgetProps {
  onTap?: () => void;
  autoRefresh?: boolean;
  className?: string;
}

const PRAYER_ORDER = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const;
type PrayerName = typeof PRAYER_ORDER[number];

const PRAYER_ICONS: Record<PrayerName, typeof Sun> = {
  Fajr: CloudSun,
  Dhuhr: Sun,
  Asr: SunHorizon,
  Maghrib: MoonStars,
  Isha: Moon,
};

function formatTo12Hour(time24: string): string {
  const [hours, minutes] = time24.split(':').map(Number);
  if (isNaN(hours) || isNaN(minutes)) return time24;
  const period = hours >= 12 ? 'PM' : 'AM';
  const h = hours % 12 || 12;
  return `${h}:${minutes.toString().padStart(2, '0')} ${period}`;
}

function toMinutesOfDay(time24: string): number {
  const [h, m] = time24.split(':').map(Number);
  if (isNaN(h) || isNaN(m)) return -1;
  return h * 60 + m;
}

export function PrayerTimesWidget({
  onTap,
  autoRefresh = true,
  className,
}: PrayerTimesWidgetProps) {
  const [data, setData] = useState<PrayerTimesData | null>(null);
  const [state, setState] = useState<PrayerWidgetState>('loading');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [, setTickNow] = useState(Date.now());

  const loadPrayerTimes = useCallback(async () => {
    setState('loading');
    try {
      const result = await getPrayerTimes();
      setData(result);
      setState('loaded');
    } catch {
      setState('error');
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const result = await refreshPrayerTimes();
      setData(result);
      setState('loaded');
    } catch {
      // keep current
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadPrayerTimes();
  }, [loadPrayerTimes]);

  useEffect(() => {
    if (!autoRefresh || state !== 'loaded') return;
    const interval = setInterval(() => {
      getPrayerTimes().then(setData).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [autoRefresh, state]);

  // Tick every 30s so the "past/upcoming" classification stays fresh
  useEffect(() => {
    const t = setInterval(() => setTickNow(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  // Derive per-prayer status (passed / next / upcoming) from current time
  const prayerStatuses = useMemo(() => {
    if (!data) return {} as Record<PrayerName, 'passed' | 'next' | 'upcoming'>;
    const now = new Date();
    const nowMin = now.getHours() * 60 + now.getMinutes();
    const result = {} as Record<PrayerName, 'passed' | 'next' | 'upcoming'>;
    for (const p of PRAYER_ORDER) {
      if (p === data.nextPrayer) {
        result[p] = 'next';
      } else {
        const t = toMinutesOfDay(data.times[p] || '');
        result[p] = t >= 0 && t < nowMin ? 'passed' : 'upcoming';
      }
    }
    return result;
  }, [data]);

  if (state === 'loading') {
    return <PrayerTimesLoadingState className={className} />;
  }

  if (state === 'error') {
    return (
      <ErrorCard message="Unable to load prayer times" onRetry={loadPrayerTimes} className={className} />
    );
  }

  if (!data) return null;

  const nextIcon = PRAYER_ICONS[data.nextPrayer as PrayerName] ?? Sun;
  const NextIcon = nextIcon;
  const nextTime = formatTo12Hour(data.times[data.nextPrayer] || '');

  return (
    <GlassmorphicCard onClick={onTap} className={className}>
      {/* Header — slim */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Mosque size={15} weight="fill" className="text-[#D4A853]" />
          <span className="text-[11px] uppercase tracking-[0.14em] text-[#D4A853]/85 font-semibold">
            Prayer Times
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <MapPin size={12} className="text-[#D4A853]/60" />
          <span className="text-white/55 text-[11px] truncate max-w-[120px]">{data.locationName}</span>
          <button
            onClick={(e) => { e.stopPropagation(); handleRefresh(); }}
            className="p-1 hover:bg-white/10 rounded transition-colors"
            disabled={isRefreshing}
            aria-label="Refresh prayer times"
          >
            <ArrowsClockwise size={13} className={cn('text-[#D4A853]/60', isRefreshing && 'animate-spin')} />
          </button>
        </div>
      </div>

      {/* Hero — next prayer (single most important info) */}
      <div
        className="relative rounded-2xl p-5 mb-4 overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, rgba(212,168,83,0.18) 0%, rgba(212,168,83,0.04) 60%, rgba(10,14,22,0.4) 100%)',
          border: '1px solid rgba(212,168,83,0.28)',
        }}
      >
        {/* Soft glow accent in corner */}
        <motion.div
          className="absolute -top-12 -right-12 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.18), transparent 70%)' }}
          animate={{ opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative flex items-center gap-4">
          {/* Icon disc */}
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, rgba(212,168,83,0.25), rgba(212,168,83,0.08))',
              border: '1px solid rgba(212,168,83,0.3)',
              boxShadow: '0 0 24px rgba(212,168,83,0.12)',
            }}
          >
            <NextIcon size={26} weight="fill" className="text-[#E8C97A]" />
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#D4A853]/80 font-semibold mb-1">
              Next prayer
            </p>
            <p className="font-display text-[22px] font-bold text-[#F5E8C7] leading-tight">
              {data.nextPrayer}
            </p>
            <p className="text-[12px] text-[#7A7363] mt-0.5">
              in <span className="text-[#E8C97A] font-semibold">{data.timeUntilNext}</span>
            </p>
          </div>

          <div className="text-right shrink-0">
            <p className="font-display text-[20px] font-bold text-[#F5E8C7] tabular-nums leading-tight">
              {nextTime.replace(/\s(AM|PM)/, '')}
            </p>
            <p className="text-[10px] text-[#5C5749] uppercase tracking-wider mt-0.5">
              {nextTime.includes('PM') ? 'PM' : 'AM'}
            </p>
          </div>
        </div>
      </div>

      {/* Warning if applicable */}
      <AnimatePresence>
        {data.hasError && data.errorMessage && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/25"
          >
            <div className="flex items-center gap-1.5">
              <Info size={12} className="text-emerald-500 flex-shrink-0" />
              <span className="text-white/70 text-[11px]">{data.errorMessage}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Schedule — each prayer in its own bordered card, all equally readable */}
      <div className="flex flex-col gap-2">
        {PRAYER_ORDER.map((prayer) => {
          const status = prayerStatuses[prayer];
          const Icon = PRAYER_ICONS[prayer];
          const time = formatTo12Hour(data.times[prayer] || '--:--');
          const isNext = status === 'next';

          return (
            <div
              key={prayer}
              className={cn(
                'flex items-center justify-between px-3.5 py-3 rounded-xl border transition-colors',
                isNext
                  ? 'bg-[#D4A853]/10 border-[#D4A853]/40'
                  : 'bg-[#0F141F]/55 border-white/10'
              )}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center shrink-0',
                    isNext ? 'bg-[#D4A853]/18 text-[#E8C97A]' : 'bg-white/[0.06] text-[#9BB8D9]'
                  )}
                >
                  <Icon size={15} weight={isNext ? 'fill' : 'regular'} />
                </div>
                <span
                  className={cn(
                    'text-[14px]',
                    isNext ? 'text-[#F5E8C7] font-semibold' : 'text-[#F5E8C7]/90'
                  )}
                >
                  {prayer}
                </span>
              </div>
              <span
                className={cn(
                  'text-[14px] tabular-nums',
                  isNext ? 'text-[#E8C97A] font-bold' : 'text-[#F5E8C7]/90 font-medium'
                )}
              >
                {time}
              </span>
            </div>
          );
        })}
      </div>
    </GlassmorphicCard>
  );
}
