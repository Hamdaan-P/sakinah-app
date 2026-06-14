/**
 * SurahHero
 *
 * The visual centrepiece for the Quran reading page: the surah's Arabic
 * name draws in via calligraphy stroke, sits over a slowly-rotating
 * Islamic geometric watermark, with gold particles drifting upward.
 * A thin reading-progress bar at the bottom tracks scroll position.
 */

import { useEffect, useState } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Compass, BookOpen } from '@phosphor-icons/react';
import type { Surah } from '../types/quran.types';
import { IslamicGeometryBackground } from '@/components/shared/IslamicGeometryBackground';
import { GoldParticles } from '@/components/shared/GoldParticles';
import { CalligraphyStroke } from '@/components/shared/CalligraphyStroke';

interface Props {
  surah: Surah;
  /** Optional juz number for the badge */
  juz?: number;
}

export function SurahHero({ surah, juz }: Props) {
  const { scrollY } = useScroll();
  // Document scroll → 0..1 reading progress in the page (capped at 5000px scroll).
  const progress = useTransform(scrollY, [0, 5000], [0, 1], { clamp: true });
  const widthPct = useTransform(progress, (p) => `${Math.round(p * 100)}%`);

  // Re-trigger calligraphy animation whenever the surah changes.
  const [renderKey, setRenderKey] = useState(0);
  useEffect(() => {
    setRenderKey((k) => k + 1);
  }, [surah.id]);

  return (
    <div className="relative overflow-hidden rounded-2xl mx-3 mt-3 mb-2"
         style={{
           background: 'linear-gradient(135deg, rgba(212,168,83,0.08) 0%, rgba(10,14,22,0.6) 50%, rgba(36,50,70,0.4) 100%)',
           border: '1px solid rgba(212,168,83, 0.22)',
         }}>
      <IslamicGeometryBackground opacity={0.05} color="#D4A853" />
      <GoldParticles count={10} color="#E8C97A" durationSec={16} />

      <div className="relative px-5 py-6 flex flex-col items-center text-center">
        {/* Tiny meta chips */}
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider mb-3">
          <span className="px-2 py-0.5 rounded-full bg-white/5 text-[#D4A853]/85 border border-[#D4A853]/30">
            #{surah.id}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/55 border border-white/10 flex items-center gap-1">
            <Compass size={9} /> {surah.revelationType}
          </span>
          {juz != null && (
            <span className="px-2 py-0.5 rounded-full bg-white/5 text-white/55 border border-white/10">
              Juz {juz}
            </span>
          )}
        </div>

        {/* Calligraphy of the Arabic name */}
        <div key={renderKey} className="mb-2">
          <CalligraphyStroke text={surah.nameArabic} color="#E8C97A" size={56} />
        </div>

        {/* Romanized name + verse count */}
        <p className="text-base font-semibold text-white tracking-wide">
          {surah.nameSimple}
        </p>
        <p className="text-[11px] text-white/50 mt-0.5 flex items-center gap-1.5">
          <BookOpen size={11} /> {surah.versesCount} verses
        </p>
      </div>

      {/* Reading-progress bar */}
      <motion.div
        className="absolute bottom-0 left-0 h-[2px]"
        style={{
          width: widthPct,
          background: 'linear-gradient(90deg, #D4A853, #E8C97A, #B8893A)',
          boxShadow: '0 0 10px rgba(212,168,83, 0.6)',
        }}
      />
    </div>
  );
}
