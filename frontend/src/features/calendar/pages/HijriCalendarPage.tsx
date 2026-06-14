/**
 * HijriCalendarPage
 * Mirrors Flutter's hijri_calendar_page.dart
 * Interactive Hijri (Islamic lunar) calendar with special day highlighting
 */

import { useState, useMemo, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretLeft, CaretRight, Star } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { trackFeature } from '@/lib/analytics';

// ==================== Hijri Date Utilities ====================

const HIJRI_MONTHS = [
  'Muharram', 'Safar', 'Rabi al-Awwal', 'Rabi al-Thani',
  'Jumada al-Ula', 'Jumada al-Thani', 'Rajab', 'Shaban',
  'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah',
];

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Special days for each Hijri month (1-indexed month → array of {day, name}) */
const SPECIAL_DAYS: Record<number, Array<{ day: number; name: string }>> = {
  1: [
    { day: 1, name: 'Islamic New Year' },
    { day: 10, name: 'Day of Ashura' },
  ],
  3: [
    { day: 12, name: 'Mawlid an-Nabi (Sunni)' },
    { day: 17, name: 'Mawlid an-Nabi (Shia)' },
  ],
  7: [
    { day: 27, name: "Isra' and Mi'raj" },
  ],
  8: [
    { day: 15, name: 'Shab-e-Barat' },
  ],
  9: [
    { day: 1, name: 'Start of Ramadan' },
    { day: 27, name: 'Laylat al-Qadr (estimated)' },
  ],
  10: [
    { day: 1, name: 'Eid al-Fitr' },
    { day: 2, name: 'Eid al-Fitr (2nd day)' },
    { day: 3, name: 'Eid al-Fitr (3rd day)' },
  ],
  12: [
    { day: 8, name: 'Day of Tarwiyah' },
    { day: 9, name: 'Day of Arafah' },
    { day: 10, name: 'Eid al-Adha' },
    { day: 11, name: 'Days of Tashreeq' },
    { day: 12, name: 'Days of Tashreeq' },
    { day: 13, name: 'Days of Tashreeq' },
  ],
};

/**
 * Simple Hijri date converter (Tabular Islamic Calendar algorithm).
 * Returns { year, month, day } in Hijri.
 */
function gregorianToHijri(gDate: Date): { year: number; month: number; day: number } {
  const y = gDate.getFullYear();
  const m = gDate.getMonth() + 1;
  const d = gDate.getDate();

  // Julian day number
  const jd = Math.floor((1461 * (y + 4800 + Math.floor((m - 14) / 12))) / 4)
    + Math.floor((367 * (m - 2 - 12 * Math.floor((m - 14) / 12))) / 12)
    - Math.floor((3 * Math.floor((y + 4900 + Math.floor((m - 14) / 12)) / 100)) / 4)
    + d - 32075;

  const l = jd - 1948440 + 10632;
  const n = Math.floor((l - 1) / 10631);
  const lRem = l - 10631 * n + 354;
  const j = Math.floor((10985 - lRem) / 5316) * Math.floor((50 * lRem) / 17719)
    + Math.floor(lRem / 5670) * Math.floor((43 * lRem) / 15238);
  const lFinal = lRem - Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50)
    - Math.floor(j / 16) * Math.floor((15238 * j) / 43) + 29;
  const hMonth = Math.floor((24 * lFinal) / 709);
  const hDay = lFinal - Math.floor((709 * hMonth) / 24);
  const hYear = 30 * n + j - 30;

  return { year: hYear, month: hMonth, day: hDay };
}

/** Get the Gregorian date for Hijri 1st of a given month/year */
function hijriToGregorian(hYear: number, hMonth: number, hDay: number): Date {
  const n = hDay + Math.ceil(29.5001 * (hMonth - 1)) + (hYear - 1) * 354
    + Math.floor((3 + 11 * hYear) / 30) + 1948439 - 385;

  // Convert Julian day to Gregorian
  const a = n + 68569;
  const b = Math.floor((4 * a) / 146097);
  const c = a - Math.floor((146097 * b + 3) / 4);
  const d = Math.floor((4000 * (c + 1)) / 1461001);
  const e = c - Math.floor((1461 * d) / 4) + 31;
  const f = Math.floor((80 * e) / 2447);
  const gDay = e - Math.floor((2447 * f) / 80);
  const g = Math.floor(f / 11);
  const gMonth = f + 2 - 12 * g;
  const gYear = 100 * (b - 49) + d + g;

  return new Date(gYear, gMonth - 1, gDay);
}

/** Get number of days in a Hijri month (tabular: alternating 30/29, with leap adjustment) */
function hijriMonthDays(hYear: number, hMonth: number): number {
  if (hMonth % 2 === 1) return 30;
  if (hMonth === 12) {
    // Leap year check (tabular)
    const remainder = (11 * hYear + 14) % 30;
    return remainder < 11 ? 30 : 29;
  }
  return 29;
}

// ==================== Component ====================

export function HijriCalendarPage() {
  useEffect(() => { trackFeature('hijri-calendar'); }, []);
  const todayHijri = useMemo(() => gregorianToHijri(new Date()), []);
  const [currentMonth, setCurrentMonth] = useState(todayHijri.month);
  const [currentYear, setCurrentYear] = useState(todayHijri.year);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  const daysInMonth = useMemo(() => hijriMonthDays(currentYear, currentMonth), [currentYear, currentMonth]);

  // Day of week for the 1st of the current Hijri month
  const firstDayOfWeek = useMemo(() => {
    const gDate = hijriToGregorian(currentYear, currentMonth, 1);
    return gDate.getDay(); // 0 = Sunday
  }, [currentYear, currentMonth]);

  const specialDaysThisMonth = useMemo(() => SPECIAL_DAYS[currentMonth] ?? [], [currentMonth]);

  const isToday = useCallback(
    (day: number) => day === todayHijri.day && currentMonth === todayHijri.month && currentYear === todayHijri.year,
    [currentMonth, currentYear, todayHijri],
  );

  const isSpecialDay = useCallback(
    (day: number) => specialDaysThisMonth.some((s) => s.day === day),
    [specialDaysThisMonth],
  );

  const getSpecialDayName = useCallback(
    (day: number) => specialDaysThisMonth.find((s) => s.day === day)?.name,
    [specialDaysThisMonth],
  );

  const isFriday = useCallback(
    (day: number) => {
      const gDate = hijriToGregorian(currentYear, currentMonth, day);
      return gDate.getDay() === 5;
    },
    [currentYear, currentMonth],
  );

  const goToPrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
    setSelectedDay(null);
  };

  const goToNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
    setSelectedDay(null);
  };

  const goToToday = () => {
    setCurrentMonth(todayHijri.month);
    setCurrentYear(todayHijri.year);
    setSelectedDay(todayHijri.day);
  };

  // Build calendar grid cells
  const calendarCells = useMemo(() => {
    const cells: Array<{ day: number } | null> = [];
    for (let i = 0; i < firstDayOfWeek; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push({ day: d });
    return cells;
  }, [firstDayOfWeek, daysInMonth]);

  return (
    <div className="min-h-full relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#10151F] via-[#10151F] to-[#0A0E16] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-6 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#D4A853] to-[#E8C97A] bg-clip-text text-transparent">
            Hijri Calendar
          </h1>
          <p className="text-xs text-[#C9C0A8] mt-1">Islamic Lunar Calendar</p>
        </motion.div>

        {/* Month Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center justify-between mb-5"
        >
          <button onClick={goToPrevMonth} className="p-2 rounded-xl border border-[rgba(212,168,83,0.2)] text-[#C9C0A8] hover:border-[#D4A853]/40 transition-colors">
            <CaretLeft size={20} />
          </button>
          <button onClick={goToToday} className="text-center">
            <p className="text-lg font-bold text-[#F5E8C7]">{HIJRI_MONTHS[currentMonth - 1]}</p>
            <p className="text-xs text-[#D4A853]">{currentYear} AH</p>
          </button>
          <button onClick={goToNextMonth} className="p-2 rounded-xl border border-[rgba(212,168,83,0.2)] text-[#C9C0A8] hover:border-[#D4A853]/40 transition-colors">
            <CaretRight size={20} />
          </button>
        </motion.div>

        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((d) => (
            <div key={d} className={cn('text-center text-[10px] font-medium', d === 'Fri' ? 'text-[#D4A853]' : 'text-[#7A7363]')}>
              {d}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-7 gap-1"
        >
          {calendarCells.map((cell, idx) => {
            if (!cell) return <div key={`empty-${idx}`} />;
            const { day } = cell;
            const today = isToday(day);
            const special = isSpecialDay(day);
            const friday = isFriday(day);
            const selected = selectedDay === day;

            return (
              <button
                key={day}
                onClick={() => setSelectedDay(day)}
                className={cn(
                  'relative aspect-square rounded-xl flex items-center justify-center text-sm font-medium transition-all',
                  today && 'bg-[#D4A853] text-black font-bold shadow-[0_0_12px_rgba(212,168,83,0.4)]',
                  !today && special && 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30',
                  !today && !special && friday && 'text-[#D4A853]',
                  !today && !special && !friday && 'text-[#F5E8C7] hover:bg-[#10151F]',
                  selected && !today && 'ring-2 ring-[#D4A853]/50',
                )}
              >
                {day}
                {special && !today && (
                  <Star size={10} className="absolute top-0.5 right-0.5 text-emerald-400 fill-emerald-400" />
                )}
              </button>
            );
          })}
        </motion.div>

        {/* Selected Day Details */}
        <AnimatePresence>
          {selectedDay && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-5 p-4 rounded-xl border bg-gradient-to-br from-[#10151F]/80 to-[#10151F]/60 border-[#D4A853]/20"
            >
              <p className="text-sm font-bold text-[#F5E8C7]">
                {selectedDay} {HIJRI_MONTHS[currentMonth - 1]} {currentYear} AH
              </p>
              <p className="text-xs text-[#7A7363] mt-1">
                {hijriToGregorian(currentYear, currentMonth, selectedDay).toLocaleDateString('en-US', {
                  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                })}
              </p>
              {getSpecialDayName(selectedDay) && (
                <div className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 inline-block">
                  <p className="text-xs font-medium text-emerald-400">{getSpecialDayName(selectedDay)}</p>
                </div>
              )}
              {isFriday(selectedDay) && !getSpecialDayName(selectedDay) && (
                <div className="mt-2 px-3 py-1.5 rounded-lg bg-[#D4A853]/10 border border-[#D4A853]/20 inline-block">
                  <p className="text-xs font-medium text-[#D4A853]">Jumu'ah (Friday Prayer)</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Special Days Legend */}
        {specialDaysThisMonth.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-5"
          >
            <p className="text-xs font-bold text-[#D4A853] mb-2">Special Days This Month</p>
            <div className="space-y-1.5">
              {specialDaysThisMonth.map((s) => (
                <div key={`${s.day}-${s.name}`} className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold flex items-center justify-center">
                    {s.day}
                  </span>
                  <span className="text-xs text-[#C9C0A8]">{s.name}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
