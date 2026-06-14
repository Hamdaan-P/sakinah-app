/**
 * "Today" tab content for PrayerTimesPage — extracted verbatim.
 */

import { motion } from 'framer-motion';
import {
  Bell, BellSlash, Check, Compass, NavigationArrow, Timer,
} from '@phosphor-icons/react';
import {
  CREAM, GOLD, GOLD_LIGHT, NAVY_BG, NAVY_BORDER, NAVY_CARD, NAVY_HOVER,
  PRAYER_META, PRAYER_ORDER, TEXT_MUTED, TEXT_SECONDARY,
  type PrayerData,
} from '../../_constants';

interface TodayTabProps {
  prayerData: PrayerData;
  nextPrayer: string;
  currentPrayer: string;
  countdown: { hours: number; minutes: number; seconds: number; totalSeconds: number };
  progressPercent: number;
  todayCompleted: string[];
  notifications: Set<string>;
  onTogglePrayer: (prayer: string) => void;
  onToggleNotification: (prayer: string) => void;
  onShowMethodPicker: () => void;
  formatDisplayTime: (time: string) => string;
}

export function TodayTab({
  prayerData, nextPrayer, currentPrayer, countdown, progressPercent, todayCompleted,
  notifications, onTogglePrayer, onToggleNotification, onShowMethodPicker, formatDisplayTime,
}: TodayTabProps) {
  return (
    <motion.div
      key="today"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
    >
      {/* Next Prayer Countdown */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        style={{
          background: `linear-gradient(135deg, ${NAVY_CARD} 0%, ${NAVY_HOVER} 100%)`,
          borderRadius: '16px',
          border: `1px solid ${GOLD}33`,
          padding: '28px',
          marginBottom: '24px',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Decorative circle */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: '-40px',
            width: '160px',
            height: '160px',
            borderRadius: '50%',
            background: `${GOLD}08`,
            border: `1px solid ${GOLD}15`,
          }}
        />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' }}>
            <Timer size={18} color={GOLD} />
            <span style={{ fontSize: '14px', color: TEXT_MUTED, fontWeight: '500' }}>
              Next Prayer
            </span>
          </div>

          <h2 style={{ fontSize: '32px', fontWeight: '700', color: GOLD, margin: '0 0 4px 0' }}>
            {nextPrayer}
          </h2>
          <p style={{ fontSize: '14px', color: TEXT_MUTED, margin: '0 0 20px 0' }}>
            {PRAYER_META[nextPrayer]?.arabicName} &bull; Starts at {formatDisplayTime(prayerData.times[nextPrayer])}
          </p>

          {/* Countdown digits */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            {[
              { value: countdown.hours, label: 'Hours' },
              { value: countdown.minutes, label: 'Min' },
              { value: countdown.seconds, label: 'Sec' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div
                  style={{
                    width: '72px',
                    height: '72px',
                    borderRadius: '16px',
                    background: NAVY_BG,
                    border: `1px solid ${NAVY_BORDER}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '28px',
                    fontWeight: '700',
                    color: CREAM,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {item.value.toString().padStart(2, '0')}
                </div>
                <span style={{ fontSize: '11px', color: TEXT_MUTED, marginTop: '6px', fontWeight: '500' }}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Progress bar */}
          <div
            style={{
              marginTop: '20px',
              height: '4px',
              background: NAVY_BG,
              borderRadius: '2px',
              overflow: 'hidden',
            }}
          >
            <motion.div
              animate={{ width: `${Math.min(progressPercent, 100)}%` }}
              transition={{ duration: 1 }}
              style={{
                height: '100%',
                background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`,
                borderRadius: '2px',
              }}
            />
          </div>
        </div>
      </motion.div>

      {/* Current Prayer indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '12px 16px',
          background: `${PRAYER_META[currentPrayer]?.color}15`,
          border: `1px solid ${PRAYER_META[currentPrayer]?.color}30`,
          borderRadius: '10px',
          marginBottom: '16px',
        }}
      >
        <NavigationArrow size={16} color={PRAYER_META[currentPrayer]?.color} />
        <span style={{ fontSize: '14px', color: TEXT_SECONDARY, fontWeight: '500' }}>
          You can pray <span style={{ color: PRAYER_META[currentPrayer]?.color, fontWeight: '700' }}>{currentPrayer}</span> now
        </span>
      </motion.div>

      {/* Prayer Times List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {PRAYER_ORDER.map((prayer, index) => {
          const meta = PRAYER_META[prayer];
          const Icon = meta.icon;
          const time = prayerData.times[prayer];
          const isNext = prayer === nextPrayer;
          const isCurrent = prayer === currentPrayer;
          const isCompleted = todayCompleted.includes(prayer);
          const hasNotification = notifications.has(prayer);

          return (
            <motion.div
              key={prayer}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 + index * 0.05 }}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '16px 20px',
                background: isNext
                  ? `linear-gradient(135deg, ${NAVY_CARD} 0%, ${meta.color}15 100%)`
                  : NAVY_CARD,
                borderRadius: '14px',
                border: `1px solid ${isNext ? meta.color + '40' : NAVY_BORDER}`,
                gap: '16px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden',
              }}
              whileHover={{ scale: 1.01, backgroundColor: NAVY_HOVER }}
              onClick={() => onTogglePrayer(prayer)}
            >
              {/* Next prayer indicator */}
              {isNext && (
                <motion.div
                  animate={{
                    boxShadow: [
                      `0 0 8px ${meta.color}40`,
                      `0 0 16px ${meta.color}60`,
                      `0 0 8px ${meta.color}40`,
                    ],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 0,
                    width: '3px',
                    background: meta.color,
                    borderRadius: '0 2px 2px 0',
                  }}
                />
              )}

              {/* Icon */}
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  background: `${meta.color}20`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon size={22} color={meta.color} />
              </div>

              {/* Prayer info */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      color: isNext ? CREAM : TEXT_SECONDARY,
                    }}
                  >
                    {prayer}
                  </span>
                  <span style={{ fontSize: '13px', color: TEXT_MUTED, fontFamily: 'serif' }}>
                    {meta.arabicName}
                  </span>
                  {isNext && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        color: meta.color,
                        background: `${meta.color}20`,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Next
                    </span>
                  )}
                  {isCurrent && !isNext && (
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: '700',
                        color: '#14B8A6',
                        background: 'rgba(20,184,166,0.15)',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      Now
                    </span>
                  )}
                </div>
              </div>

              {/* Time */}
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '10px', color: TEXT_MUTED, display: 'block', marginBottom: '2px' }}>
                  Starts at
                </span>
                <span
                  style={{
                    fontSize: '18px',
                    fontWeight: '700',
                    color: isNext ? CREAM : TEXT_SECONDARY,
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {formatDisplayTime(time)}
                </span>
              </div>

              {/* Completion check */}
              <div
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '10px',
                  background: isCompleted ? `${meta.color}30` : `${NAVY_BG}`,
                  border: `1.5px solid ${isCompleted ? meta.color : NAVY_BORDER}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  transition: 'all 0.2s',
                }}
              >
                {isCompleted && <Check size={16} color={meta.color} />}
              </div>

              {/* Notification toggle */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleNotification(prayer);
                }}
                style={{
                  padding: '6px',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: hasNotification ? GOLD : TEXT_MUTED,
                  opacity: hasNotification ? 1 : 0.5,
                  flexShrink: 0,
                }}
              >
                {hasNotification ? <Bell size={16} /> : <BellSlash size={16} />}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Today's Completion */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        style={{
          marginTop: '20px',
          padding: '16px 20px',
          background: NAVY_CARD,
          borderRadius: '14px',
          border: `1px solid ${NAVY_BORDER}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '14px', fontWeight: '600', color: TEXT_SECONDARY }}>
            Today&apos;s Progress
          </span>
          <span style={{ fontSize: '14px', fontWeight: '700', color: GOLD }}>
            {todayCompleted.length}/5
          </span>
        </div>
        <div
          style={{
            height: '8px',
            background: NAVY_BG,
            borderRadius: '4px',
            overflow: 'hidden',
          }}
        >
          <motion.div
            animate={{ width: `${(todayCompleted.length / 5) * 100}%` }}
            transition={{ duration: 0.5 }}
            style={{
              height: '100%',
              background: `linear-gradient(90deg, ${GOLD}, ${GOLD_LIGHT})`,
              borderRadius: '4px',
            }}
          />
        </div>
        {todayCompleted.length === 5 && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{
              fontSize: '13px',
              color: GOLD,
              textAlign: 'center',
              marginTop: '12px',
              fontWeight: '600',
            }}
          >
            MashaAllah! All prayers completed today!
          </motion.p>
        )}
      </motion.div>

      {/* Quick Links */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.65 }}
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '10px',
          marginTop: '16px',
        }}
      >
        <button
          onClick={onShowMethodPicker}
          style={{
            padding: '14px',
            background: NAVY_CARD,
            border: `1px solid ${NAVY_BORDER}`,
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: TEXT_SECONDARY,
            fontSize: '13px',
            fontWeight: '600',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = NAVY_HOVER)}
          onMouseLeave={(e) => (e.currentTarget.style.background = NAVY_CARD)}
        >
          <Compass size={18} color={GOLD} />
          Calculation Method
        </button>
        <a
          href="/qibla"
          style={{
            padding: '14px',
            background: NAVY_CARD,
            border: `1px solid ${NAVY_BORDER}`,
            borderRadius: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            color: TEXT_SECONDARY,
            fontSize: '13px',
            fontWeight: '600',
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = NAVY_HOVER)}
          onMouseLeave={(e) => (e.currentTarget.style.background = NAVY_CARD)}
        >
          <NavigationArrow size={18} color={GOLD} />
          Qibla Direction
        </a>
      </motion.div>
    </motion.div>
  );
}
