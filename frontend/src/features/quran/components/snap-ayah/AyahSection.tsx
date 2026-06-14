/**
 * AyahSection — single one-ayah-per-viewport snap section used by
 * SnapAyahReader. Pure presentational; parent owns refs and state.
 */

import { motion } from 'framer-motion';
import { Heart } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { QuranLine } from '../../types/quran.types';
import { TajweedText } from '../TajweedText';
import { AyahOrnament } from '../AyahOrnament';
import { AyahActionRow } from './AyahActionRow';

const VIEWPORT_FRACTION = 0.85;

interface Props {
  line: QuranLine;
  index: number;
  total: number;
  isPlaying: boolean;
  isSelected: boolean;
  isBookmarked: boolean;
  getArabic: (line: QuranLine) => string;
  getTajweedHtml?: (line: QuranLine) => string | undefined;
  showTranslation: boolean;
  showTransliteration: boolean;
  arabicFontSize: number;
  arabicLineHeight: number;
  tajweedEnabled: boolean;
  onPlay: (line: QuranLine) => void;
  onStop: () => void;
  onBookmark: (line: QuranLine) => void;
  onSelectAyah: (verseKey: string | null) => void;
  registerRef: (key: string, el: HTMLElement | null) => void;
}

function toArabicNumeral(n: number): string {
  const map = ['٠', '١', '٢', '٣', '٤', '٥', '٦', '٧', '٨', '٩'];
  return String(n).split('').map((d) => map[parseInt(d, 10)] ?? d).join('');
}

export function AyahSection({
  line,
  index,
  total,
  isPlaying,
  isSelected,
  isBookmarked,
  getArabic,
  getTajweedHtml,
  showTranslation,
  showTransliteration,
  arabicFontSize,
  arabicLineHeight,
  tajweedEnabled,
  onPlay,
  onStop,
  onBookmark,
  onSelectAyah,
  registerRef,
}: Props) {
  const navigate = useNavigate();

  return (
    <section
      data-verse-key={line.verseKey}
      ref={(el) => registerRef(line.verseKey, el)}
      className="relative flex flex-col items-center justify-center px-5 sm:px-10 py-8"
      style={{
        minHeight: `${VIEWPORT_FRACTION * 100}vh`,
        scrollSnapAlign: 'start',
      }}
    >
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 24, scale: 0.985 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: false, amount: 0.4 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Top: ayah ornament + meta */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-[10px] uppercase tracking-[0.2em] text-white/35">
            Ayah {index + 1} of {total}
          </span>
          <span className="text-[10px] uppercase tracking-wider text-[#D4A853]/70">{line.verseKey}</span>
        </div>

        {/* Centre: ornament + Arabic */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ rotate: -45, opacity: 0 }}
            whileInView={{ rotate: 0, opacity: 1 }}
            viewport={{ once: false, amount: 0.4 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="mb-4"
          >
            <AyahOrnament
              number={toArabicNumeral(line.verseNumber)}
              color="#D4A853"
              size={36}
              glow={isPlaying}
            />
          </motion.div>

          <div
            role="button"
            tabIndex={0}
            dir="rtl"
            onClick={() => onSelectAyah(isSelected ? null : line.verseKey)}
            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelectAyah(isSelected ? null : line.verseKey); } }}
            className={cn(
              'cursor-pointer rounded-2xl px-2 py-2 transition-colors w-full',
              isSelected ? 'bg-[#D4A853]/8' : 'hover:bg-white/[0.03]',
            )}
          >
            {tajweedEnabled ? (
              <TajweedText
                html={getTajweedHtml?.(line)}
                fallback={getArabic(line)}
                className="font-arabic"
                fontSize={arabicFontSize}
                lineHeight={arabicLineHeight}
              />
            ) : (
              <p
                className="font-arabic text-[#F5E8C7]"
                style={{ fontSize: arabicFontSize, lineHeight: arabicLineHeight }}
              >
                {getArabic(line)}
              </p>
            )}
          </div>

          {showTransliteration && line.transliteration && (
            <p className="text-[12px] text-white/55 italic mt-3 leading-relaxed">{line.transliteration}</p>
          )}
          {showTranslation && line.translation && (
            <p className="text-[14px] text-white/85 mt-4 leading-relaxed max-w-xl">
              {line.translation.replace(/<[^>]+>/g, '')}
            </p>
          )}
        </div>

        {/* Action row */}
        <AyahActionRow
          line={line}
          isPlaying={isPlaying}
          isBookmarked={isBookmarked}
          onPlay={onPlay}
          onStop={onStop}
          onBookmark={onBookmark}
          onSelectAyah={onSelectAyah}
          navigate={navigate}
        />

        {/* Decorative footer divider */}
        <div className="mt-8 flex items-center justify-center gap-2 text-[#D4A853]/30">
          <span className="block h-px w-12 bg-current" />
          <Heart size={8} weight="fill" />
          <span className="block h-px w-12 bg-current" />
        </div>

        {/* Hint at next ayah */}
        {index < total - 1 && (
          <p className="mt-4 text-center text-[10px] uppercase tracking-widest text-white/25">
            scroll for ayah {index + 2}
          </p>
        )}
      </motion.div>
    </section>
  );
}

