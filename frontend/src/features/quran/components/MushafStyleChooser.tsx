/**
 * MushafStyleChooser
 * Entry screen for the Mushaf reader: shows each available script as a card
 * with a live preview of its first page, so the reader can pick the printed
 * style they're used to before opening the reader.
 */

import { CaretLeft } from '@phosphor-icons/react';
import { MUSHAF_SCRIPTS, mushafImageUrl, type MushafScript } from '../data/mushafScripts';
import type { MushafTokens } from '../hooks/useMushafTheme';

/** Short, human description per script (kept here so the data file stays lean). */
const BLURBS: Record<MushafScript, string> = {
  hafs: 'Madinah Mushaf · Hafs',
  tajweed: 'Hafs · colour-coded tajweed',
  warsh: 'Warsh · coloured Madinah print',
  indopak: 'South-Asian script · black & white',
};

interface Props {
  current: MushafScript;
  tokens: MushafTokens;
  onSelect: (script: MushafScript) => void;
  onBack: () => void;
}

export function MushafStyleChooser({ current, tokens, onSelect, onBack }: Props) {
  const available = MUSHAF_SCRIPTS.filter((s) => s.available);

  return (
    <div className="min-h-screen" style={{ background: tokens.pageBg }}>
      {/* Header */}
      <div className="sticky top-0 z-10 pt-safe px-3 py-3 flex items-center gap-2 backdrop-blur-md"
        style={{ borderBottom: `1px solid ${tokens.frame}33` }}>
        <button onClick={onBack} className="p-1.5 rounded-lg hover:bg-white/10 transition-colors" aria-label="Back">
          <CaretLeft size={20} style={{ color: tokens.frameAccent }} />
        </button>
        <div>
          <h1 className="text-sm font-bold" style={{ color: tokens.frameAccent }}>Choose your Mushaf</h1>
          <p className="text-[10px] opacity-60" style={{ color: tokens.frameAccent }}>
            Pick the printed style you read in
          </p>
        </div>
      </div>

      <div className="px-4 py-5 max-w-3xl mx-auto grid grid-cols-2 gap-4">
        {available.map((s) => {
          const isCurrent = s.id === current;
          return (
            <button
              key={s.id}
              onClick={() => onSelect(s.id)}
              className="group flex flex-col rounded-2xl overflow-hidden text-left transition-transform active:scale-[0.98]"
              style={{
                background: '#FFFFFF',
                border: `2px solid ${isCurrent ? tokens.gold : `${tokens.frame}44`}`,
                boxShadow: isCurrent
                  ? `0 10px 30px -10px ${tokens.gold}aa`
                  : '0 8px 24px -12px rgba(0,0,0,0.5)',
              }}
            >
              {/* First-page preview — top-aligned so the decorative head shows */}
              <div className="w-full overflow-hidden bg-white" style={{ height: 220 }}>
                <img
                  src={mushafImageUrl(s.id, 1)}
                  alt={`${s.label} — first page`}
                  loading="lazy"
                  draggable={false}
                  className="w-full object-cover object-top select-none"
                  style={{ minHeight: 220 }}
                />
              </div>
              {/* Label row */}
              <div className="px-3 py-2.5" style={{ background: isCurrent ? `${tokens.gold}18` : '#FAF7EF' }}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold text-neutral-800">{s.label}</span>
                  <span className="text-base text-neutral-500" style={{ fontFamily: "'Amiri Quran', serif" }}>
                    {s.arabic}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-neutral-500">{BLURBS[s.id]}</span>
                  <span className="text-[10px] text-neutral-400">{s.pages} pp</span>
                </div>
                {isCurrent && (
                  <span className="inline-block mt-1 text-[9px] font-semibold uppercase tracking-wide" style={{ color: tokens.gold }}>
                    Last read
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
