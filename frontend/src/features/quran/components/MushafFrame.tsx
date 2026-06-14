import type { ReactNode } from 'react';
import type { MushafTokens } from '../hooks/useMushafTheme';

interface Props {
  tokens: MushafTokens;
  surahLabel: string;
  pageNumber: number;
  juz: number;
  hizb?: number;
  /** 0..1 — how far through the surah we are (right-edge progress shimmer) */
  surahProgress?: number;
  children: ReactNode;
}

/**
 * The ornate page frame. Holds:
 *  - the parchment (or navy) background
 *  - a double-line gold border with corner flourishes
 *  - top header row (surah · page · juz/hizb)
 *  - subtle paper-grain overlay
 *  - right-edge shimmer progress indicator
 *
 * Children render inside the bordered area (i.e. the verses).
 */
export function MushafFrame({
  tokens,
  surahLabel,
  pageNumber,
  juz,
  hizb,
  surahProgress,
  children,
}: Props) {
  return (
    <div
      className="relative mx-auto rounded-2xl overflow-hidden"
      style={{
        width: '100%',
        maxWidth: 720,
        background: tokens.paper,
        boxShadow: `0 30px 60px -20px rgba(0,0,0,0.55), 0 0 0 1px ${tokens.frame}33`,
      }}
    >
      {/* Outer gold frame line */}
      <div
        className="absolute inset-2 rounded-xl pointer-events-none"
        style={{ border: `1.5px solid ${tokens.frame}` }}
      />
      {/* Inner accent frame line */}
      <div
        className="absolute inset-[14px] rounded-[10px] pointer-events-none"
        style={{ border: `0.75px solid ${tokens.frameAccent}aa` }}
      />

      {/* Corner flourishes */}
      <Flourish position="tl" color={tokens.frame} />
      <Flourish position="tr" color={tokens.frame} />
      <Flourish position="bl" color={tokens.frame} />
      <Flourish position="br" color={tokens.frame} />

      {/* Paper grain overlay (subtle) */}
      <div
        className="absolute inset-0 pointer-events-none mix-blend-overlay opacity-[0.06]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.5 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
        }}
      />

      {/* Right-edge surah progress shimmer */}
      {typeof surahProgress === 'number' && (
        <div
          className="absolute top-6 bottom-6 w-[3px] rounded-full overflow-hidden"
          style={{ right: 6, background: `${tokens.frame}22` }}
        >
          <div
            className="absolute left-0 right-0 rounded-full mushaf-shimmer"
            style={{
              top: `${(1 - Math.max(0, Math.min(1, surahProgress))) * 100}%`,
              bottom: 0,
              background: `linear-gradient(180deg, ${tokens.frameAccent}, ${tokens.gold})`,
            }}
          />
        </div>
      )}

      {/* Header row */}
      <div
        className="relative flex items-center justify-between px-7 pt-5 pb-2 text-[11px] font-medium tracking-wide uppercase"
        style={{ color: tokens.inkMuted }}
      >
        <span className="truncate max-w-[40%]">{surahLabel}</span>
        <span style={{ color: tokens.gold }}>· {pageNumber} ·</span>
        <span className="truncate max-w-[40%] text-right">
          Juz {juz}
          {hizb ? ` · Ḥizb ${hizb}` : ''}
        </span>
      </div>

      {/* Body */}
      <div className="relative px-6 pt-3 pb-7 sm:px-9 sm:pb-9">{children}</div>
    </div>
  );
}

function Flourish({ position, color }: { position: 'tl' | 'tr' | 'bl' | 'br'; color: string }) {
  const styleMap: Record<typeof position, React.CSSProperties> = {
    tl: { top: 6, left: 6 },
    tr: { top: 6, right: 6, transform: 'scaleX(-1)' },
    bl: { bottom: 6, left: 6, transform: 'scaleY(-1)' },
    br: { bottom: 6, right: 6, transform: 'scale(-1, -1)' },
  };
  return (
    <span className="absolute pointer-events-none" style={styleMap[position]}>
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true">
        {/* Bracket flourish: two arcs + a tiny inner star */}
        <g fill="none" stroke={color} strokeWidth="1.2" strokeLinecap="round">
          <path d="M2 14 Q2 2 14 2" />
          <path d="M6 14 Q6 6 14 6" opacity="0.55" />
        </g>
        <g transform="translate(7 7)">
          <rect x="-2.5" y="-2.5" width="5" height="5" fill="none" stroke={color} strokeWidth="0.8" />
          <rect
            x="-2.5"
            y="-2.5"
            width="5"
            height="5"
            fill="none"
            stroke={color}
            strokeWidth="0.8"
            transform="rotate(45)"
          />
        </g>
      </svg>
    </span>
  );
}
