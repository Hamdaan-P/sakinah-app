/**
 * Streaks, Achievements, Activity Timeline sections for ProfileSettingsPage.
 * Verbatim — no behavior changes.
 */

import { motion } from 'framer-motion';
import {
  BookOpen, ChatCircleDots, ClockCounterClockwise, Confetti, Fire, Gift,
  Lightning, Lock, Medal, Trophy, Wallet,
} from '@phosphor-icons/react';
import { COMPANIONS } from '@/features/chatbot/types/chatbot.types';

interface Conversation {
  companionId: string;
  messageCount?: number;
  updatedAt?: number | Date;
}

interface AchievementsRowProps {
  quranStreak: number;
  quranLongestStreak: number;
  loginStreakActive: boolean;
  totalMessages: number;
  profileCompletion: number;
  lifetimeEarned: number;
  referralsCount: number;
  kycTier: number;
  conversations: Conversation[];
  loginClaimedToday: boolean;
}

export function ProfileAchievementsRow(props: AchievementsRowProps) {
  const {
    quranStreak, quranLongestStreak, loginStreakActive, totalMessages, profileCompletion,
    lifetimeEarned, referralsCount, kycTier, conversations, loginClaimedToday,
  } = props;

  return (
    <>
      {/* ── Streaks (Quran is real, Login is today-only) ── */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-[#0F1724]/60 border border-[rgba(212,168,83,0.15)] p-4"
        >
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#D4A853]/60 mb-3">Streaks</p>
          <div className="grid grid-cols-2 gap-3">
            <div
              className="text-center p-3 rounded-xl"
              style={{ background: 'rgba(79,184,146,0.06)', border: '1px solid rgba(79,184,146,0.2)' }}
            >
              <BookOpen size={24} weight="fill" className="text-[#4FB892] mx-auto mb-1.5" />
              <p className="text-[#F5E8C7] text-lg font-bold">{quranStreak}</p>
              <p className="text-[#5C5749] text-[10px]">
                {quranStreak === 0 ? 'start today' : quranStreak === 1 ? 'day' : 'days'}
              </p>
              <p className="text-[10px] font-medium mt-0.5 text-[#4FB892]">Quran</p>
              {quranLongestStreak > quranStreak && (
                <p className="text-[#5C5749] text-[9px] mt-1">Best: {quranLongestStreak}</p>
              )}
            </div>
            <div
              className="text-center p-3 rounded-xl"
              style={{
                background: loginStreakActive ? 'rgba(245,158,11,0.06)' : 'rgba(127,138,154,0.04)',
                border: `1px solid ${loginStreakActive ? 'rgba(245,158,11,0.2)' : 'rgba(127,138,154,0.1)'}`,
              }}
            >
              <Fire
                size={24}
                weight={loginStreakActive ? 'fill' : 'regular'}
                style={{ color: loginStreakActive ? '#F59E0B' : '#5C5749' }}
                className="mx-auto mb-1.5"
              />
              <p className="text-[#F5E8C7] text-lg font-bold">{loginStreakActive ? '✓' : '–'}</p>
              <p className="text-[#5C5749] text-[10px]">
                {loginStreakActive ? "today's claim" : 'not yet today'}
              </p>
              <p className="text-[10px] font-medium mt-0.5" style={{ color: loginStreakActive ? '#F59E0B' : '#5C5749' }}>
                Daily Login
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Achievements (all real-data based) ── */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-[#0F1724]/60 border border-[rgba(212,168,83,0.15)] p-4"
        >
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#D4A853]/60 mb-3">Achievements</p>
          <div className="grid grid-cols-4 gap-2">
            {[
              { icon: ChatCircleDots, label: 'First Chat', unlocked: totalMessages > 0, color: '#4FB892' },
              { icon: Fire, label: '7-Day Quran', unlocked: quranStreak >= 7, color: '#F59E0B' },
              { icon: BookOpen, label: 'Quran Reader', unlocked: quranStreak >= 1, color: '#22C55E' },
              { icon: Trophy, label: 'Profile Done', unlocked: profileCompletion >= 100, color: '#D4A853' },
              { icon: Wallet, label: 'First DNZ', unlocked: lifetimeEarned > 0, color: '#D4A853' },
              { icon: Gift, label: 'Referrer', unlocked: referralsCount > 0, color: '#A78BFA' },
              { icon: Medal, label: '100 Messages', unlocked: totalMessages >= 100, color: '#F59E0B' },
              { icon: Confetti, label: 'KYC Verified', unlocked: kycTier >= 2, color: '#22C55E' },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <div
                  key={badge.label}
                  className="flex flex-col items-center text-center p-2.5 rounded-xl relative"
                  style={{
                    background: badge.unlocked ? `${badge.color}08` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${badge.unlocked ? `${badge.color}25` : 'rgba(255,255,255,0.05)'}`,
                  }}
                >
                  {!badge.unlocked && (
                    <div className="absolute inset-0 rounded-xl bg-[#0F1724]/60 flex items-center justify-center z-10">
                      <Lock size={14} className="text-[#5C5749]/40" />
                    </div>
                  )}
                  <Icon
                    size={22}
                    weight={badge.unlocked ? 'fill' : 'regular'}
                    style={{ color: badge.unlocked ? badge.color : '#5C574930' }}
                    className="mb-1"
                  />
                  <p
                    className="text-[9px] leading-tight"
                    style={{ color: badge.unlocked ? '#C9C0A8' : '#5C574940' }}
                  >
                    {badge.label}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>

      {/* ── Activity Timeline ── */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-[#0F1724]/60 border border-[rgba(212,168,83,0.15)] p-4"
        >
          <p className="text-[9px] font-bold uppercase tracking-widest text-[#D4A853]/60 mb-3">Recent Activity</p>
          <div className="space-y-0">
            {[
              ...(loginClaimedToday
                ? [{ icon: Lightning, text: 'Claimed daily login reward', time: 'Today', color: '#F59E0B' }]
                : []),
              ...conversations.slice(0, 4).map((c) => {
                const comp = COMPANIONS.find((x) => x.id === c.companionId);
                return {
                  icon: ChatCircleDots,
                  text: `Chatted with ${comp?.name || 'Raya'}`,
                  time: c.updatedAt ? new Date(c.updatedAt).toLocaleDateString() : '',
                  color: '#4FB892',
                };
              }),
              ...(lifetimeEarned > 0 ? [{ icon: Wallet, text: `Earned ${lifetimeEarned} DNZ total`, time: '', color: '#D4A853' }] : []),
            ].slice(0, 5).map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-start gap-3 py-2.5 relative">
                  {i < 4 && <div className="absolute left-[15px] top-[38px] w-px h-[calc(100%-22px)] bg-[rgba(212,168,83,0.1)]" />}
                  <div
                    className="w-8 h-8 rounded-lg shrink-0 flex items-center justify-center z-10"
                    style={{ background: `${item.color}12`, border: `1px solid ${item.color}25` }}
                  >
                    <Icon size={14} weight="fill" style={{ color: item.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[#C9C0A8] text-sm">{item.text}</p>
                    {item.time && <p className="text-[#5C5749] text-[10px] mt-0.5">{item.time}</p>}
                  </div>
                </div>
              );
            })}
            {conversations.length === 0 && !loginClaimedToday && (
              <div className="text-center py-4">
                <ClockCounterClockwise size={24} className="text-[#5C5749]/30 mx-auto mb-2" />
                <p className="text-[#5C5749] text-xs">Start using the app to see your activity here</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}
