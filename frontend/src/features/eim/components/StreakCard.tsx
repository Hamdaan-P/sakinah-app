/**
 * StreakCard — EIM learning-streak visualisation. Fire icon + current day
 * count + progress bar to 100 + the milestone target line.
 *
 * Reads the streak via the read-only /streak/{uid} endpoint — never writes.
 * The writing is done once-per-day by `useEimStreakHeartbeat` on page mount.
 */

import { useQuery } from '@tanstack/react-query';
import { Flame, Trophy } from '@phosphor-icons/react';
import { useAuthStore } from '@/core/stores/auth.store';
import { eimService } from '../services/eim.service';

const MILESTONE_DAYS = 100;
const MILESTONE_REWARD = 120;

export function StreakCard() {
  const userId = useAuthStore((s) => s.user?.id);

  const q = useQuery({
    queryKey: ['eim', 'streak', userId],
    queryFn: () => eimService.getStreak(userId!),
    enabled: !!userId,
    staleTime: 60_000,  // 1 minute — heartbeats from page mounts will invalidate
  });

  if (!userId) return null;

  const state = q.data;
  const current = state?.current_streak ?? 0;
  const longest = state?.longest_streak ?? 0;
  const milestoneReached = state?.milestone_reached ?? false;

  const progressPct = milestoneReached
    ? 100
    : Math.min(100, (current / MILESTONE_DAYS) * 100);

  // Variant: post-milestone celebration vs pre-milestone progress
  const celebrating = milestoneReached;

  return (
    <div
      className="rounded-2xl border p-4"
      style={{
        background: celebrating
          ? 'linear-gradient(135deg, rgba(212,168,83,0.18) 0%, rgba(245,158,11,0.10) 100%)'
          : 'linear-gradient(135deg, rgba(245,158,11,0.10) 0%, rgba(212,168,83,0.04) 100%)',
        borderColor: celebrating ? 'rgba(212,168,83,0.40)' : 'rgba(245,158,11,0.25)',
      }}
    >
      <div className="flex items-start gap-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: celebrating ? 'rgba(212,168,83,0.20)' : 'rgba(245,158,11,0.18)',
          }}
        >
          {celebrating ? (
            <Trophy size={24} weight="fill" color="#D4A853" />
          ) : (
            <Flame size={24} weight="fill" color="#F59E0B" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 mb-0.5">
            <span className="text-[10px] uppercase tracking-widest font-bold text-[#F59E0B]">
              Learning streak
            </span>
            {longest > 0 && current < longest && (
              <span className="text-[10px] text-[#5C5749]">· longest {longest}</span>
            )}
          </div>

          {q.isLoading ? (
            <div className="text-[22px] font-extrabold text-[#5C5749]">…</div>
          ) : (
            <div className="flex items-baseline gap-1.5">
              <span className="text-[26px] font-extrabold text-[#F5E8C7] leading-none">
                {current}
              </span>
              <span className="text-[12px] text-[#7A7363] font-semibold">
                day{current === 1 ? '' : 's'}
              </span>
            </div>
          )}

          {celebrating ? (
            <div className="text-[11.5px] text-[#D4A853] mt-1 font-semibold">
              🏆 100-day milestone reached — +{MILESTONE_REWARD} DNZ banked.
            </div>
          ) : (
            <>
              <div className="text-[11px] text-[#7A7363] mt-1 leading-snug">
                Open EIM each day to keep the streak alive.
              </div>
              {/* Progress bar to 100-day milestone */}
              <div className="mt-2.5">
                <div className="flex items-center justify-between mb-1 text-[10px]">
                  <span className="text-[#5C5749] font-semibold uppercase tracking-wider">
                    Progress to 100 days
                  </span>
                  <span className="text-[#F59E0B] font-bold">
                    {current}/{MILESTONE_DAYS}
                  </span>
                </div>
                <div className="h-1.5 rounded-full bg-[rgba(245,158,11,0.10)] overflow-hidden">
                  <div
                    className="h-full transition-all duration-500"
                    style={{
                      width: `${progressPct}%`,
                      background: 'linear-gradient(90deg, #F59E0B, #FBBF24)',
                    }}
                  />
                </div>
                <div className="text-[10.5px] text-[#5C5749] italic mt-1.5">
                  Reach 100 days for{' '}
                  <span className="text-[#D4A853] font-bold not-italic">+{MILESTONE_REWARD} DNZ</span>{' '}
                  — paid in full, outside the daily cap.
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default StreakCard;
