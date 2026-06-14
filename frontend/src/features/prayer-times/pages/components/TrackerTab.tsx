/**
 * "Tracker" tab content for PrayerTimesPage — extracted verbatim.
 */

import { motion } from 'framer-motion';
import { Check } from '@phosphor-icons/react';
import {
  CREAM, DAYS_OF_WEEK, GOLD, NAVY_BG, NAVY_BORDER, NAVY_CARD,
  PRAYER_META, PRAYER_ORDER, TEXT_MUTED, TEXT_SECONDARY,
  type DayCompletion,
} from '../../_constants';
import { getDateString, getWeekDates } from '../../_helpers';

interface TrackerTabProps {
  completedPrayers: DayCompletion[];
}

export function TrackerTab({ completedPrayers }: TrackerTabProps) {
  return (
    <motion.div
      key="tracker"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* Streak info */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: `linear-gradient(135deg, ${NAVY_CARD} 0%, ${GOLD}15 100%)`,
          borderRadius: '16px',
          border: `1px solid ${GOLD}30`,
          padding: '24px',
          textAlign: 'center',
          marginBottom: '24px',
        }}
      >
        <div style={{ fontSize: '48px', fontWeight: '700', color: GOLD, lineHeight: 1 }}>
          {completedPrayers.filter((d) => d.completed.length === 5).length}
        </div>
        <div style={{ fontSize: '14px', color: TEXT_SECONDARY, marginTop: '8px' }}>
          Perfect Days (All 5 Prayers)
        </div>
      </motion.div>

      {/* This week's tracking */}
      <h3 style={{ fontSize: '16px', fontWeight: '700', color: CREAM, marginBottom: '16px' }}>
        This Week
      </h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {getWeekDates(new Date()).map((date, i) => {
          const dateStr = getDateString(date);
          const isToday = dateStr === getDateString(new Date());
          const dayCompleted = completedPrayers.find((d) => d.date === dateStr)?.completed || [];
          const isFuture = date > new Date() && !isToday;

          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '14px 16px',
                background: isToday ? `${GOLD}10` : NAVY_CARD,
                borderRadius: '12px',
                border: `1px solid ${isToday ? GOLD + '30' : NAVY_BORDER}`,
                gap: '16px',
              }}
            >
              <div style={{ minWidth: '60px' }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: isToday ? GOLD : CREAM }}>
                  {isToday ? 'Today' : DAYS_OF_WEEK[date.getDay()]}
                </div>
                <div style={{ fontSize: '11px', color: TEXT_MUTED }}>
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '6px', flex: 1 }}>
                {PRAYER_ORDER.map((prayer) => {
                  const completed = dayCompleted.includes(prayer);
                  const meta = PRAYER_META[prayer];
                  return (
                    <div
                      key={prayer}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '8px',
                        background: completed
                          ? `${meta.color}30`
                          : isFuture
                            ? `${NAVY_BG}50`
                            : NAVY_BG,
                        border: `1.5px solid ${completed ? meta.color : isFuture ? NAVY_BORDER + '50' : NAVY_BORDER}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '10px',
                        fontWeight: '600',
                        color: completed ? meta.color : TEXT_MUTED,
                      }}
                      title={prayer}
                    >
                      {completed ? <Check size={14} /> : prayer.charAt(0)}
                    </div>
                  );
                })}
              </div>

              <span
                style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: dayCompleted.length === 5 ? GOLD : TEXT_MUTED,
                  minWidth: '32px',
                  textAlign: 'right',
                }}
              >
                {isFuture ? '-' : `${dayCompleted.length}/5`}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Legend */}
      <div
        style={{
          marginTop: '20px',
          padding: '16px',
          background: NAVY_CARD,
          borderRadius: '12px',
          border: `1px solid ${NAVY_BORDER}`,
        }}
      >
        <span style={{ fontSize: '13px', fontWeight: '600', color: TEXT_SECONDARY, marginBottom: '10px', display: 'block' }}>
          Prayer Legend
        </span>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
          {PRAYER_ORDER.map((prayer) => {
            const meta = PRAYER_META[prayer];
            const Icon = meta.icon;
            return (
              <div key={prayer} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Icon size={14} color={meta.color} />
                <span style={{ fontSize: '12px', color: TEXT_MUTED }}>{prayer}</span>
              </div>
            );
          })}
        </div>
      </div>

      <p style={{ fontSize: '12px', color: TEXT_MUTED, textAlign: 'center', marginTop: '16px' }}>
        Tap a prayer on the Today tab to mark it as completed.
      </p>
    </motion.div>
  );
}
