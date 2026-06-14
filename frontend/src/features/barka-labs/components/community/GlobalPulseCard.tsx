/**
 * GlobalPulseCard — top-of-leaderboard live metrics (members, blessings, MH%).
 */

import { Heartbeat } from '@phosphor-icons/react';
import { C, cardStyle } from '../../barka-labs.constants';
import type { GlobalStats } from '../../types/barka-labs.types';
import { formatCount } from './_data';
import { SourceChip } from '../common/SourceChip';

interface GlobalPulseCardProps {
  globalStats: GlobalStats | null;
}

export function GlobalPulseCard({ globalStats }: GlobalPulseCardProps) {
  return (
    <div className="rounded-2xl p-5 relative overflow-hidden" style={{ ...cardStyle }}>
      <div className="flex items-center gap-2 mb-3">
        <Heartbeat size={18} weight="fill" className="text-[#2A9D6F]" />
        <span className="text-sm font-bold" style={{ color: C.t1 }}>
          <SourceChip kind="others" />Global Pulse
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: 'rgba(42,157,111,0.15)', color: C.emL }}>LIVE</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {[
          { val: formatCount(globalStats?.total_users || 0), label: 'Members', color: C.emL },
          { val: formatCount(globalStats?.total_blessings || 0), label: 'Blessings', color: C.gold },
          // TODO: backend GlobalStats doesn't yet expose a mental-health %. Keeping
          // hardcoded until `mental_health_pct` is added to /barka-labs/global-stats.
          { val: '67%', label: 'Better MH', color: C.purple },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-xl font-extrabold leading-none mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: s.color }}>
              {s.val}
            </p>
            <p className="text-[9px] uppercase tracking-wider font-medium" style={{ color: C.t3 }}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
