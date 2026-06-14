/**
 * MushafReadStyleChooser
 *
 * Font-style chooser for the verse-by-verse reader (/quran/read). Distinct from
 * MushafStyleChooser, which picks a scanned-page edition for /quran/mushaf.
 *
 * Two modes over one set of four script-style cards:
 *   - `gate`   — first-run, full-screen "choose how you'd like to read".
 *               Picking sets the global default and enters the reader.
 *   - `switch` — reopened from the reader to change the style for the current
 *               surah at any time, with an optional "make this my default".
 *
 * Each card renders a live sample in that style's actual font (the QCF cards
 * load page-1 glyph fonts so the preview is the real typeface, not a fallback).
 */

import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X } from '@phosphor-icons/react';
import {
  MUSHAF_STYLES,
  MUSHAF_STYLE_ORDER,
  SINGLE_FONTS,
  type MushafStyleId,
  type MushafStyleDef,
} from '../config/mushafStyles';
import { ensureFontForPage, qcfPageFamily } from '../services/mushafFontLoader';
import type { MushafTokens } from '../hooks/useMushafTheme';

interface Props {
  open: boolean;
  mode: 'gate' | 'switch';
  /** Currently-effective style (highlighted). */
  currentStyle: MushafStyleId;
  /** Surah the change applies to, in `switch` mode (for the heading). */
  surahName?: string;
  tokens: MushafTokens;
  /** Called with the picked style and whether to also set it as default. */
  onPick: (styleId: MushafStyleId, applyAsDefault: boolean) => void;
  /** Dismiss without choosing — only available in `switch` mode. */
  onClose?: () => void;
}

function previewFamily(def: MushafStyleDef): string {
  if (def.rendering === 'glyph') {
    return `'${qcfPageFamily(def.id as 'qcf_v1' | 'qcf_v2', 1)}', ${def.fontStack}`;
  }
  const family = def.id === 'uthmani_hafs' ? SINGLE_FONTS.uthmaniHafs.family : SINGLE_FONTS.indopak.family;
  return `'${family}', ${def.fontStack}`;
}

export function MushafReadStyleChooser({
  open,
  mode,
  currentStyle,
  surahName,
  tokens,
  onPick,
  onClose,
}: Props) {
  // Warm every style's preview font when the chooser opens.
  useEffect(() => {
    if (!open) return;
    for (const id of MUSHAF_STYLE_ORDER) ensureFontForPage(id, 1);
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 pt-safe pb-safe"
          style={{ background: 'rgba(6,9,16,0.82)', backdropFilter: 'blur(8px)' }}
        >
          <motion.div
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 24, opacity: 0, scale: 0.98 }}
            transition={{ type: 'spring', damping: 24, stiffness: 280 }}
            className="w-full max-w-lg rounded-2xl overflow-hidden max-h-[92vh] flex flex-col"
            style={{
              background: 'linear-gradient(180deg, #11161F 0%, #0C1019 100%)',
              border: `1px solid ${tokens.frame}44`,
              boxShadow: '0 40px 80px -24px rgba(0,0,0,0.7)',
            }}
            role="dialog"
            aria-modal="true"
            aria-label="Choose Mushaf style"
          >
            {/* Header */}
            <div className="px-5 pt-5 pb-3 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold" style={{ color: tokens.frameAccent }}>
                  {mode === 'gate' ? 'Choose your Mushaf style' : 'Change Mushaf style'}
                </h2>
                <p className="text-xs mt-0.5 opacity-60" style={{ color: tokens.frameAccent }}>
                  {mode === 'gate'
                    ? 'Pick the script you read best in. You can change it any time — even per surah.'
                    : surahName
                      ? `Applies to ${surahName}. You can keep a different style for other surahs.`
                      : 'Applies to this surah. You can keep a different style for other surahs.'}
                </p>
              </div>
              {mode === 'switch' && onClose && (
                <button
                  onClick={onClose}
                  className="p-1.5 rounded-lg hover:bg-white/10 transition-colors shrink-0"
                  aria-label="Close"
                >
                  <X size={18} style={{ color: tokens.frameAccent }} />
                </button>
              )}
            </div>

            {/* Cards */}
            <div className="px-4 pb-4 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MUSHAF_STYLE_ORDER.map((id) => {
                const def = MUSHAF_STYLES[id];
                const active = id === currentStyle;
                return (
                  <button
                    key={id}
                    onClick={() => onPick(id, mode === 'gate')}
                    className="text-left rounded-xl p-3.5 transition-all relative"
                    style={{
                      background: active ? `${tokens.gold}14` : 'rgba(255,255,255,0.03)',
                      border: `1.5px solid ${active ? tokens.gold : 'rgba(255,255,255,0.08)'}`,
                    }}
                  >
                    {active && (
                      <span
                        className="absolute top-2.5 left-2.5 inline-flex items-center justify-center rounded-full"
                        style={{ width: 20, height: 20, background: tokens.gold }}
                      >
                        <Check size={13} weight="bold" color="#1A1208" />
                      </span>
                    )}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold" style={{ color: tokens.frameAccent }}>
                        {def.label}
                      </span>
                      <span
                        className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ background: `${tokens.frame}1A`, color: `${tokens.frameAccent}99` }}
                      >
                        15 lines
                      </span>
                    </div>
                    {/* Live preview in the real font */}
                    <div
                      dir="rtl"
                      className="rounded-lg py-3 px-2 text-center mb-2"
                      style={{
                        background: 'rgba(0,0,0,0.25)',
                        color: tokens.frameAccent,
                        fontFamily: previewFamily(def),
                        fontSize: 26,
                        lineHeight: 1.9,
                        minHeight: 56,
                      }}
                    >
                      {def.preview}
                    </div>
                    <p className="text-[11px] leading-snug opacity-55" style={{ color: tokens.frameAccent }}>
                      {def.blurb}
                    </p>
                  </button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default MushafReadStyleChooser;
