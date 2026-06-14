/**
 * "Weekly" tab content for PrayerTimesPage — extracted verbatim.
 */

import { motion } from 'framer-motion';
import { CaretLeft, CaretRight } from '@phosphor-icons/react';
import {
  CREAM, DAYS_OF_WEEK, GOLD, NAVY_BORDER, NAVY_CARD, NAVY_HOVER,
  PRAYER_META, PRAYER_ORDER, TEXT_MUTED, TEXT_SECONDARY,
  type PrayerData,
} from '../../_constants';
import { getDateString } from '../../_helpers';

interface WeeklyTabProps {
  prayerData: PrayerData;
  weekDates: Date[];
  formatDisplayTime: (time: string) => string;
  onPrevWeek: () => void;
  onNextWeek: () => void;
}

export function WeeklyTab({ prayerData, weekDates, formatDisplayTime, onPrevWeek, onNextWeek }: WeeklyTabProps) {
  return (
    <motion.div
      key="weekly"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* Week navigation */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <button
          onClick={onPrevWeek}
          style={{
            padding: '8px',
            background: NAVY_CARD,
            border: `1px solid ${NAVY_BORDER}`,
            borderRadius: '8px',
            color: TEXT_SECONDARY,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <CaretLeft size={18} />
        </button>
        <span style={{ fontSize: '15px', fontWeight: '600', color: CREAM }}>
          {weekDates[0].toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} -{' '}
          {weekDates[6].toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
        <button
          onClick={onNextWeek}
          style={{
            padding: '8px',
            background: NAVY_CARD,
            border: `1px solid ${NAVY_BORDER}`,
            borderRadius: '8px',
            color: TEXT_SECONDARY,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <CaretRight size={18} />
        </button>
      </div>

      {/* Day selector */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(7, 1fr)',
          gap: '6px',
          marginBottom: '24px',
        }}
      >
        {weekDates.map((date, i) => {
          const isToday = getDateString(date) === getDateString(new Date());
          return (
            <div
              key={i}
              style={{
                padding: '10px 4px',
                borderRadius: '10px',
                background: isToday ? `${GOLD}20` : NAVY_CARD,
                border: `1px solid ${isToday ? GOLD + '40' : NAVY_BORDER}`,
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: '11px', color: TEXT_MUTED, fontWeight: '600', marginBottom: '4px' }}>
                {DAYS_OF_WEEK[date.getDay()]}
              </div>
              <div style={{ fontSize: '16px', fontWeight: '700', color: isToday ? GOLD : CREAM }}>
                {date.getDate()}
              </div>
            </div>
          );
        })}
      </div>

      {/* Weekly prayer times table */}
      <div
        style={{
          background: NAVY_CARD,
          borderRadius: '14px',
          border: `1px solid ${NAVY_BORDER}`,
          overflow: 'hidden',
        }}
      >
        {/* Table header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '80px repeat(5, 1fr)',
            padding: '14px 16px',
            borderBottom: `1px solid ${NAVY_BORDER}`,
            background: NAVY_HOVER,
          }}
        >
          <span style={{ fontSize: '12px', fontWeight: '700', color: TEXT_MUTED }}>DAY</span>
          {PRAYER_ORDER.map((prayer) => (
            <span
              key={prayer}
              style={{
                fontSize: '12px',
                fontWeight: '700',
                color: PRAYER_META[prayer].color,
                textAlign: 'center',
              }}
            >
              {prayer.substring(0, 3).toUpperCase()}
            </span>
          ))}
        </div>

        {/* Table rows */}
        {weekDates.map((date, i) => {
          const isToday = getDateString(date) === getDateString(new Date());
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'grid',
                gridTemplateColumns: '80px repeat(5, 1fr)',
                padding: '12px 16px',
                borderBottom: i < 6 ? `1px solid ${NAVY_BORDER}` : 'none',
                background: isToday ? `${GOLD}08` : 'transparent',
              }}
            >
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: isToday ? GOLD : TEXT_SECONDARY }}>
                  {DAYS_OF_WEEK[date.getDay()]}
                </span>
                <span style={{ fontSize: '11px', color: TEXT_MUTED, display: 'block' }}>
                  {date.getDate()}/{date.getMonth() + 1}
                </span>
              </div>
              {PRAYER_ORDER.map((prayer) => {
                // For today use actual times, for other days show approximate (same times)
                const time = prayerData.times[prayer];
                return (
                  <span
                    key={prayer}
                    style={{
                      fontSize: '13px',
                      fontWeight: isToday ? '600' : '400',
                      color: isToday ? CREAM : TEXT_MUTED,
                      textAlign: 'center',
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {formatDisplayTime(time)}
                  </span>
                );
              })}
            </motion.div>
          );
        })}
      </div>

      <p style={{ fontSize: '12px', color: TEXT_MUTED, textAlign: 'center', marginTop: '12px' }}>
        Note: Times shown are based on your current location. Times for other days are approximate.
      </p>
    </motion.div>
  );
}
