/**
 * RiseTogetherCard — community-wide goal banner (e.g. 10k blessings this week).
 */

import { Target } from '@phosphor-icons/react';
import { C } from '../../barka-labs.constants';
import { RISE_CHALLENGE } from './_data';
import { SourceChip } from '../common/SourceChip';

export function RiseTogetherCard() {
  const risePct = Math.round((RISE_CHALLENGE.current / RISE_CHALLENGE.goal) * 100);

  return (
    <div
      className="rounded-2xl p-5 relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, rgba(27,107,74,0.18) 0%, rgba(42,157,111,0.08) 50%, rgba(215,181,106,0.06) 100%)',
        border: '1px solid rgba(42,157,111,0.25)',
      }}
    >
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full" style={{ background: 'radial-gradient(circle, rgba(42,157,111,0.12) 0%, transparent 70%)', transform: 'translate(30%, -40%)' }} />
      <div className="absolute bottom-0 left-0 w-28 h-28 rounded-full" style={{ background: 'radial-gradient(circle, rgba(215,181,106,0.08) 0%, transparent 70%)', transform: 'translate(-30%, 40%)' }} />

      <div className="relative">
        <div className="flex items-center gap-2 mb-1">
          <Target size={20} weight="fill" className="text-[#2A9D6F]" />
          <span className="text-[11px] font-bold uppercase tracking-[2px]" style={{ color: C.emL }}>
            <SourceChip kind="others" />Rise Together
          </span>
        </div>

        <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: C.t1 }}>
          {RISE_CHALLENGE.title}
        </h3>
        <p className="text-xs mb-4" style={{ color: C.t3 }}>
          {RISE_CHALLENGE.desc}
        </p>

        <div className="mb-3">
          <div className="h-3 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
            <div
              className="h-full rounded-full transition-all duration-1000 relative"
              style={{
                width: `${risePct}%`,
                background: `linear-gradient(90deg, ${C.em}, ${C.emL}, ${C.gold})`,
                boxShadow: '0 0 12px rgba(42,157,111,0.4)',
              }}
            >
              <div className="absolute right-0 top-0 h-full w-2 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,0.6)' }} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <span className="text-2xl font-black" style={{ fontFamily: 'Cormorant Garamond, serif', color: C.emL }}>
                {RISE_CHALLENGE.current.toLocaleString()}
              </span>
              <span className="text-sm font-medium" style={{ color: C.t3 }}> / {RISE_CHALLENGE.goal.toLocaleString()}</span>
            </div>
            <div className="h-8 w-px" style={{ background: 'rgba(255,255,255,0.08)' }} />
            <div className="text-center">
              <p className="text-sm font-bold" style={{ color: C.t1 }}>{RISE_CHALLENGE.contributors.toLocaleString()}</p>
              <p className="text-[9px]" style={{ color: C.t3 }}>contributing</p>
            </div>
          </div>
          <div
            className="px-3 py-1.5 rounded-xl text-xs font-bold"
            style={{ background: 'rgba(215,181,106,0.12)', color: C.gold, border: '1px solid rgba(215,181,106,0.2)' }}
          >
            {RISE_CHALLENGE.daysLeft}d left
          </div>
        </div>
      </div>
    </div>
  );
}
