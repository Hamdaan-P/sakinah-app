/**
 * Past attempts list shown below the 1-min Shukr challenge UI.
 */

import { C, cardStyle } from '../../barka-labs.constants';

const PAST_ATTEMPTS = [
  { date: 'Best Score · Apr 5', count: 23, creativity: 67, positivity: 'A-', metacog: 'High', dnz: 75 },
  { date: 'Attempt · Apr 1', count: 17, creativity: 52, positivity: 'B+', metacog: 'Med', dnz: 50 },
];

export function PastAttemptsList() {
  return (
    <>
      <div className="mt-4 mb-2 px-5 text-[10px] font-semibold uppercase tracking-widest" style={{ color: C.t3 }}>
        Your Past Attempts
      </div>
      <div className=" space-y-2.5">
        {PAST_ATTEMPTS.map((a, i) => (
          <div key={i} className="rounded-[14px] p-3.5" style={cardStyle}>
            <div className="flex items-center justify-between mb-2">
              <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: C.gold }}>{a.date}</div>
              <div className="text-xl font-bold" style={{ fontFamily: 'Cormorant Garamond, serif', color: C.emL }}>{a.count}</div>
            </div>
            <div className="flex gap-2">
              {[
                { v: a.creativity, l: 'Avg Creativity', c: C.gold },
                { v: a.positivity, l: 'Positivity', c: C.emL },
                { v: a.metacog, l: 'Metacognition', c: C.purple },
                { v: `+${a.dnz}`, l: 'DNZ Earned', c: C.dnz },
              ].map((s, j) => (
                <div key={j} className="flex-1 text-center py-1.5 rounded-lg" style={{ background: 'rgba(255,255,255,0.02)' }}>
                  <div className="text-sm font-bold" style={{ color: s.c }}>{s.v}</div>
                  <div className="text-[7px] uppercase tracking-wide mt-0.5" style={{ color: C.t3 }}>{s.l}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Metacognition Insight */}
      <div className=" mt-3">
        <div className="rounded-2xl p-4" style={{ background: 'linear-gradient(135deg, rgba(139,126,200,0.08), rgba(91,141,239,0.04))', border: `1px solid rgba(139,126,200,0.15)` }}>
          <div className="text-[11px] font-semibold mb-2 flex items-center gap-1.5" style={{ color: C.purple }}>
            🧠 Metacognition from 1-Min Challenges
          </div>
          <div className="text-[11px] leading-relaxed" style={{ color: C.t2 }}>
            Your speed-gratitude patterns reveal how your mind works under pressure. In your best attempt (23 entries), the first 10 were surface-level (hands, eyes, food), but entries 15-23 showed a dramatic shift to deeper themes (patience, second chances, lessons from loss). This shows your <strong style={{ color: C.purple }}>cognitive warm-up pattern</strong> — your mind needs 30 seconds to access deeper thought layers.
          </div>
        </div>
      </div>
    </>
  );
}
