/**
 * LeaderboardList — podium (top 3) + rest-of-the-rankings rows + the user's
 * own row pinned to the bottom.
 */

import { Sparkle, Fire } from '@phosphor-icons/react';
import { C, cardStyle } from '../../barka-labs.constants';
import type { BarkaLabsStats, LeaderboardEntry } from '../../types/barka-labs.types';
import { PODIUM_COLORS, PODIUM_GLOW } from './_data';

interface LeaderboardListProps {
  leaderboard: LeaderboardEntry[];
  userName: string;
  userRank: number;
  userCreativity: number;
  stats: BarkaLabsStats;
}

export function LeaderboardList({ leaderboard, userName, userRank, userCreativity, stats }: LeaderboardListProps) {
  const top3 = leaderboard.slice(0, 3);
  const podiumOrder = top3.length >= 3 ? [top3[1], top3[0], top3[2]] : top3;

  if (leaderboard.length === 0) {
    return (
      <div className="rounded-2xl p-8 text-center" style={cardStyle}>
        <Sparkle size={32} weight="duotone" className="mx-auto mb-3" style={{ color: C.gold, opacity: 0.5 }} />
        <p className="text-sm font-semibold mb-1" style={{ color: C.t1 }}>Be the first to join the leaderboard!</p>
        <p className="text-xs" style={{ color: C.t3 }}>Log 3 blessings to get ranked.</p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {podiumOrder.length >= 3 && (
        <div className="flex items-end justify-center gap-3 pt-4 pb-2">
          {podiumOrder.map((entry, i) => {
            const isFirst = i === 1;
            const podiumIdx = i === 0 ? 1 : i === 1 ? 0 : 2;
            const rank = leaderboard.indexOf(entry) + 1;
            return (
              <div key={entry.user_id} className="flex flex-col items-center" style={{ width: isFirst ? 120 : 100 }}>
                <div className="relative mb-2">
                  <div
                    className="rounded-2xl flex items-center justify-center font-black"
                    style={{
                      width: isFirst ? 64 : 52,
                      height: isFirst ? 64 : 52,
                      fontSize: isFirst ? 24 : 20,
                      background: PODIUM_GLOW[podiumIdx],
                      border: `2px solid ${PODIUM_COLORS[podiumIdx]}40`,
                      color: PODIUM_COLORS[podiumIdx],
                      boxShadow: isFirst ? `0 0 30px ${PODIUM_GLOW[podiumIdx]}` : undefined,
                    }}
                  >
                    {(entry.display_name || '?')[0]}
                  </div>
                  <div
                    className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
                    style={{ background: PODIUM_COLORS[podiumIdx], color: '#1E293A' }}
                  >
                    {rank}
                  </div>
                </div>
                <p className="text-xs font-bold mt-1 text-center truncate w-full" style={{ color: C.t1 }}>{entry.display_name}</p>
                <p className="text-[10px]" style={{ color: C.t3 }}>{entry.country}</p>
                <div
                  className="w-full rounded-t-xl mt-2 flex flex-col items-center justify-center"
                  style={{
                    height: isFirst ? 80 : i === 0 ? 60 : 48,
                    background: `linear-gradient(180deg, ${PODIUM_COLORS[podiumIdx]}15, ${PODIUM_COLORS[podiumIdx]}08)`,
                    border: `1px solid ${PODIUM_COLORS[podiumIdx]}25`,
                    borderBottom: 'none',
                  }}
                >
                  <div className="flex items-center gap-1 text-xs font-bold" style={{ color: C.gold }}>
                    <Fire size={12} weight="fill" /> {entry.streak}
                  </div>
                  <p className="text-[10px] font-semibold" style={{ color: C.t3 }}>{entry.total_blessings.toLocaleString()} blessings</p>
                  <p className="text-[9px]" style={{ color: C.t3 }}>{Math.round(entry.composite_score * 20)} creativity</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="rounded-2xl overflow-hidden" style={cardStyle}>
        {leaderboard.slice(3).map((entry, i) => (
          <div
            key={entry.user_id}
            className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-[rgba(215,181,106,0.03)]"
            style={{ borderBottom: i < leaderboard.length - 4 ? '1px solid rgba(215,181,106,0.08)' : undefined }}
          >
            <span className="text-sm font-bold w-6 text-center" style={{ color: C.t3 }}>{i + 4}</span>
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0"
              style={{ background: 'rgba(215,181,106,0.08)', color: C.t2 }}
            >
              {(entry.display_name || '?')[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-semibold" style={{ color: C.t1 }}>{entry.display_name}</span>
                <span className="text-[8px] px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(42,157,111,0.1)', color: C.emL }}>L{entry.level}</span>
                <span className="text-[9px]" style={{ color: C.t3 }}>{entry.country}</span>
              </div>
              <div className="flex items-center gap-3 text-[10px] mt-0.5" style={{ color: C.t3 }}>
                <span>{Math.round(entry.composite_score * 20)} creativity</span>
                <span>{entry.total_blessings.toLocaleString()} blessings</span>
              </div>
            </div>
            <span className="flex items-center gap-1 text-xs font-semibold shrink-0" style={{ color: C.gold }}>
              <Fire size={12} weight="fill" /> {entry.streak}
            </span>
          </div>
        ))}

        {/* You */}
        <div
          className="flex items-center gap-3 px-4 py-3.5"
          style={{ background: 'rgba(215,181,106,0.06)', borderTop: '1px solid rgba(215,181,106,0.15)' }}
        >
          <span className="text-sm font-bold w-6 text-center" style={{ color: C.gold }}>{userRank}</span>
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0" style={{ background: `${C.gold}20`, color: C.gold }}>
            {userName[0]}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm font-bold" style={{ color: C.gold }}>{userName} <span className="text-[10px] font-normal" style={{ color: C.t3 }}>(You)</span></span>
            <div className="flex items-center gap-3 text-[10px] mt-0.5" style={{ color: C.t3 }}>
              <span>{userCreativity} creativity</span>
              <span>{stats.total_blessings} blessings</span>
            </div>
          </div>
          {stats.current_streak > 0 && (
            <span className="flex items-center gap-1 text-xs font-semibold shrink-0" style={{ color: C.gold }}>
              <Fire size={12} weight="fill" /> {stats.current_streak}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
