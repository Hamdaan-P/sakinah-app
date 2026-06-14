/**
 * YourStandingCard — current user's leaderboard summary.
 */

import { Fire } from '@phosphor-icons/react';
import { C, cardStyle } from '../../barka-labs.constants';
import type { BarkaLabsStats } from '../../types/barka-labs.types';

interface YourStandingCardProps {
  userName: string;
  userRank: number;
  userCreativity: number;
  userPct: number | null;
  stats: BarkaLabsStats;
}

export function YourStandingCard({ userName, userRank, userCreativity, userPct, stats }: YourStandingCardProps) {
  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{ ...cardStyle, borderColor: 'rgba(215,181,106,0.3)' }}
    >
      <div className="flex items-center gap-4">
        <div className="relative">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-black"
            style={{ background: `linear-gradient(135deg, ${C.gold}30, ${C.goldD}30)`, color: C.gold }}
          >
            {userName[0]}
          </div>
          {stats.current_streak >= 7 && (
            <div
              className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})` }}
            >
              <Fire size={13} weight="fill" color="#1E293A" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="text-base font-bold" style={{ color: C.t1 }}>{userName}</p>
            <span className="text-[9px] font-bold px-2 py-0.5 rounded-md" style={{ background: 'rgba(215,181,106,0.12)', color: C.gold }}>
              #{userRank}
            </span>
          </div>
          <div className="flex items-center gap-3 text-[11px]" style={{ color: C.t3 }}>
            <span>{userCreativity} creativity</span>
            <span>{stats.total_blessings} blessings</span>
            <span>{stats.current_streak}d streak</span>
          </div>
          {userPct != null && (
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1 h-1.5 rounded-full" style={{ background: 'rgba(215,181,106,0.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-1000"
                  style={{ width: `${userPct}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.emL})` }}
                />
              </div>
              <span className="text-[10px] font-bold" style={{ color: C.gold }}>
                Top {Math.round(100 - userPct)}%
              </span>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-black" style={{ color: C.gold, fontFamily: 'Cormorant Garamond, serif' }}>
            {stats.current_streak}
          </p>
          <p className="text-[10px] font-medium" style={{ color: C.t3 }}>day streak</p>
        </div>
      </div>
    </div>
  );
}
