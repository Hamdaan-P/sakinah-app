/**
 * QuranShareCard — beautiful share card for any ayah / surah completion / hifz milestone.
 * Renders a gradient card to a PNG via html-to-image, then offers Web Share or download.
 */

import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { motion } from 'framer-motion';
import { ShareNetwork, DownloadSimple, Check, X } from '@phosphor-icons/react';
import { ShareCardBody } from './quran-share-card/ShareCardBody';

export interface QuranShareCardProps {
  open: boolean;
  onClose: () => void;
  /** Heading shown above the Arabic — e.g. "Daily Ayah", "Surah Completed", "Reflection" */
  kicker: string;
  /** Bottom-right label — e.g. "2:255" or "Surah Al-Fatiha" */
  reference: string;
  arabic: string;
  translation?: string;
  /** Optional small note below translation — e.g. user's reflection text */
  note?: string;
  /** Filename suffix when downloaded */
  filenameHint?: string;
}

export function QuranShareCard({
  open, onClose, kicker, reference, arabic, translation, note, filenameHint = 'ayah',
}: QuranShareCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<'shared' | 'downloaded' | null>(null);

  const generatePng = async (): Promise<{ dataUrl: string; blob: Blob } | null> => {
    if (!cardRef.current) return null;
    const dataUrl = await toPng(cardRef.current, { pixelRatio: 3, backgroundColor: '#0A0E16' });
    const blob = await (await fetch(dataUrl)).blob();
    return { dataUrl, blob };
  };

  const handleShare = async () => {
    setBusy(true);
    try {
      const out = await generatePng();
      if (!out) return;
      const file = new File([out.blob], `zaryahplus-${filenameHint}.png`, { type: 'image/png' });
      // navigator.canShare may be undefined on some browsers; guard.
      if ('share' in navigator && (navigator as Navigator).canShare?.({ files: [file] })) {
        await (navigator as Navigator).share({
          files: [file],
          title: 'ZaryahPlus',
          text: `${kicker} — ${reference}`,
        });
        setDone('shared');
      } else {
        // Fallback: download
        const link = document.createElement('a');
        link.download = `zaryahplus-${filenameHint}.png`;
        link.href = out.dataUrl;
        link.click();
        setDone('downloaded');
      }
      setTimeout(() => setDone(null), 1800);
    } catch (e) {
      console.warn('share failed', e);
    } finally {
      setBusy(false);
    }
  };

  const handleDownload = async () => {
    setBusy(true);
    try {
      const out = await generatePng();
      if (!out) return;
      const link = document.createElement('a');
      link.download = `zaryahplus-${filenameHint}.png`;
      link.href = out.dataUrl;
      link.click();
      setDone('downloaded');
      setTimeout(() => setDone(null), 1800);
    } finally {
      setBusy(false);
    }
  };

  if (!open) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }}
        className="w-full max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        {/* The shareable card */}
        <ShareCardBody
          ref={cardRef}
          kicker={kicker}
          reference={reference}
          arabic={arabic}
          translation={translation}
          note={note}
        />

        {/* Actions */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="w-11 h-11 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70"
            aria-label="Close"
          >
            <X size={16} />
          </button>
          <button
            onClick={handleDownload}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/85 text-sm font-medium disabled:opacity-50"
          >
            {done === 'downloaded' ? <Check size={14} className="text-emerald-400" /> : <DownloadSimple size={14} />}
            {done === 'downloaded' ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={handleShare}
            disabled={busy}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#D4A853] text-[#0A0E16] text-sm font-semibold disabled:opacity-50"
          >
            {done === 'shared' ? <Check size={14} /> : <ShareNetwork size={14} weight="bold" />}
            {done === 'shared' ? 'Shared' : 'Share'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default QuranShareCard;
