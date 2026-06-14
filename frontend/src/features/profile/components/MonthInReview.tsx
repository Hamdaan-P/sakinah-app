/**
 * Month In Review — Spotify Wrapped-style 30-day snapshot.
 * Bold, shareable, screenshottable.
 */

import { motion } from 'framer-motion';
import { ChatCircleDots, Users, Heart, TrendUp, CalendarBlank } from '@phosphor-icons/react';
import type { Icon } from '@phosphor-icons/react';
import { useAuthStore } from '@/core/stores/auth.store';
import { useMonthStats } from './month-in-review/_useMonthStats';

export function MonthInReview() {
  const { user } = useAuthStore();
  const { stats, loading } = useMonthStats(user?.id);

  if (loading) return null;

  // Don't show if nothing meaningful happened
  const hasMeaningfulData = stats && (stats.messages > 5 || stats.daysActive >= 3 || stats.topEmotion);
  if (!hasMeaningfulData) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="relative rounded-2xl overflow-hidden p-5"
      style={{
        background: 'linear-gradient(135deg, #1a2340 0%, #2C1E3F 50%, #3A1E2F 100%)',
        border: '1px solid rgba(212,168,83,0.25)',
      }}
    >
      {/* Decorative gold glow */}
      <div
        className="absolute -top-20 -right-20 w-64 h-64 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.15), transparent 70%)' }}
      />
      <div
        className="absolute -bottom-10 -left-10 w-48 h-48 pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(236,72,153,0.08), transparent 70%)' }}
      />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center gap-2 mb-1">
          <CalendarBlank size={14} className="text-[#D4A853]" />
          <p className="text-[#D4A853] text-[10px] font-bold uppercase tracking-widest">Last 30 Days</p>
        </div>
        <h3 className="text-[#F5E8C7] text-[20px] font-bold mb-4" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
          Your Month In Review
        </h3>

        {/* Big stats grid */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <StatCard icon={ChatCircleDots} value={stats!.messages} label="Messages with Raya" color="#D4A853" />
          <StatCard icon={CalendarBlank} value={stats!.daysActive} label="Active Days" color="#4FB892" />
          {stats!.newRelationships > 0 && (
            <StatCard icon={Users} value={stats!.newRelationships} label="People in your life" color="#EC4899" />
          )}
          {stats!.conversations > 0 && (
            <StatCard icon={Heart} value={stats!.conversations} label="Conversations" color="#A78BFA" />
          )}
        </div>

        {/* Narrative highlights */}
        {(stats!.topEmotion || stats!.moodShift) && (
          <div className="space-y-2 pt-3" style={{ borderTop: '1px solid rgba(212,168,83,0.1)' }}>
            {stats!.topEmotion && (
              <div className="flex items-center gap-2">
                <Heart size={14} weight="fill" className="text-[#EC4899]" />
                <p className="text-[#C9C0A8] text-[13px]">
                  You felt <span className="text-[#F5E8C7] font-semibold capitalize">{stats!.topEmotion}</span> most often
                </p>
              </div>
            )}
            {stats!.moodShift && (
              <div className="flex items-center gap-2">
                <TrendUp size={14} weight="fill" className="text-[#2A9D6F]" />
                <p className="text-[#C9C0A8] text-[13px]">
                  Mood shifted <span className="capitalize text-[#7A7363]">{stats!.moodShift.from}</span>
                  {' → '}
                  <span className="capitalize text-[#F5E8C7] font-semibold">{stats!.moodShift.to}</span>
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function StatCard({
  icon: IconCmp,
  value,
  label,
  color,
}: {
  icon: Icon;
  value: number;
  label: string;
  color: string;
}) {
  return (
    <div
      className="rounded-xl p-3"
      style={{
        background: `${color}0f`,
        border: `1px solid ${color}20`,
      }}
    >
      <IconCmp size={16} weight="fill" style={{ color }} className="mb-1" />
      <p className="text-[#F5E8C7] text-[22px] font-bold leading-none mb-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        {value}
      </p>
      <p className="text-[#5C5749] text-[10px]">{label}</p>
    </div>
  );
}
