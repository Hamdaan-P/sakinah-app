/**
 * CircleFollowReader
 *
 * Compact pinned card shown at the bottom of any Quran reader page when a
 * member is following a host's reading position during a live circle call.
 * Subscribes to subscribeToCurrentReading; when the host advances, this
 * fires onTarget(verseKey) so the page can scroll the new ayah into view.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Broadcast } from '@phosphor-icons/react';
import {
  subscribeToCurrentReading,
  type CurrentReading,
} from '../services/hifzCirclesService';

interface Props {
  circleId: string;
  myUid: string;
  /** Called whenever the host advances to a new ayah. */
  onTarget: (surahId: number, verseKey: string) => void;
  /** User can stop following — parent removes the URL ?follow=1 etc. */
  onStop: () => void;
}

export function CircleFollowReader({ circleId, myUid, onTarget, onStop }: Props) {
  const [reading, setReading] = useState<CurrentReading | null>(null);

  useEffect(() => {
    const unsub = subscribeToCurrentReading(circleId, (r) => {
      setReading(r);
      if (r && r.hostUid !== myUid) onTarget(r.surahId, r.ayahKey);
    });
    return () => unsub();
  }, [circleId, myUid, onTarget]);

  if (!reading || reading.hostUid === myUid) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed left-1/2 -translate-x-1/2 bottom-4 z-40 flex items-center gap-2 px-3 py-2 rounded-full bg-[#0A0E16]/95 border border-[#D4A853]/40 shadow-2xl backdrop-blur-md"
        style={{ boxShadow: '0 12px 40px -10px rgba(212,168,83, 0.4)' }}
      >
        <span className="relative flex w-7 h-7 items-center justify-center rounded-full bg-[#D4A853]/15">
          <span className="absolute inset-0 rounded-full bg-[#D4A853]/25 animate-ping" />
          <Broadcast size={14} weight="fill" className="text-[#D4A853] relative" />
        </span>
        <div className="text-[11px] leading-tight">
          <p className="text-[#D4A853] font-semibold">Following host</p>
          <p className="text-white/60">Ayah {reading.ayahKey}</p>
        </div>
        <button
          onClick={onStop}
          className="ml-1 p-1 rounded-full bg-white/5 hover:bg-white/10 text-white/60"
          aria-label="Stop following"
        >
          <X size={12} weight="bold" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
