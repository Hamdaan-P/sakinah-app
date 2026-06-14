interface Props {
  surahName: string;
  surahArabic?: string;
  showBasmala: boolean;
  gold: string;
  ink: string;
  paperEdge: string;
}

/**
 * Decorative surah header used when a new surah begins on a page. Looks
 * like the rectangular header cartouche found in printed Mushafs:
 * an ornate gold frame with corner stars + the surah's Arabic name and
 * the basmala below it.
 */
export function SurahCartouche({ surahName, surahArabic, showBasmala, gold, ink, paperEdge }: Props) {
  return (
    <div className="block w-full my-4 select-none" dir="rtl">
      <div
        className="relative mx-auto px-6 py-3 text-center"
        style={{
          maxWidth: 380,
          background: paperEdge,
          border: `1.5px solid ${gold}`,
          borderRadius: 6,
          boxShadow: `inset 0 0 0 3px ${paperEdge}, inset 0 0 0 4px ${gold}`,
        }}
      >
        {/* Corner stars */}
        <CornerStar position="tl" gold={gold} />
        <CornerStar position="tr" gold={gold} />
        <CornerStar position="bl" gold={gold} />
        <CornerStar position="br" gold={gold} />

        <div
          className="text-[22px] tracking-wide"
          style={{
            fontFamily: "'Amiri Quran', 'Amiri', serif",
            color: ink,
            fontWeight: 600,
          }}
        >
          {surahArabic ?? surahName}
        </div>
      </div>

      {showBasmala && (
        <div
          className="text-center mt-3 mb-1 text-[26px]"
          style={{ color: gold, fontFamily: "'Amiri Quran', 'Amiri', serif" }}
        >
          ﷽
        </div>
      )}
    </div>
  );
}

function CornerStar({ position, gold }: { position: 'tl' | 'tr' | 'bl' | 'br'; gold: string }) {
  const offsets: Record<typeof position, React.CSSProperties> = {
    tl: { top: -7, left: -7 },
    tr: { top: -7, right: -7 },
    bl: { bottom: -7, left: -7 },
    br: { bottom: -7, right: -7 },
  };
  return (
    <span className="absolute" style={offsets[position]}>
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
        <g fill="none" stroke={gold} strokeWidth="1.2">
          <rect x="2" y="2" width="10" height="10" />
          <rect x="2" y="2" width="10" height="10" transform="rotate(45 7 7)" />
        </g>
        <circle cx="7" cy="7" r="1.6" fill={gold} />
      </svg>
    </span>
  );
}
