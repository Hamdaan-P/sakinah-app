/**
 * Settings drawer for QuranReadingPage — translation, reciter, tafsir, Mushaf
 * script style, display toggles, and typography sliders.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { TRANSLATION_OPTIONS, RECITER_PRESETS } from '../../types/quran.types';
import type { TafsirOption } from '../../services/quranApiService';
import { MUSHAF_STYLES, MUSHAF_STYLE_ORDER, type MushafStyleId } from '../../config/mushafStyles';

interface SettingsPanelProps {
  open: boolean;
  translationId: number;
  reciterId: number;
  tafsirId: number;
  tafsirOptions: TafsirOption[];
  mushafStyle: MushafStyleId;
  showTranslation: boolean;
  showTransliteration: boolean;
  showRoots: boolean;
  tajweedEnabled: boolean;
  arabicFontSize: number;
  arabicLineHeight: number;
  onReloadTranslation: (id: number) => void;
  onReciterChange: (id: number) => void;
  onTafsirChange: (id: number) => void;
  onMushafStyleChange: (s: MushafStyleId) => void;
  onShowTranslationChange: (v: boolean) => void;
  onShowTransliterationChange: (v: boolean) => void;
  onShowRootsChange: (v: boolean) => void;
  onTajweedChange: (v: boolean) => void;
  onArabicFontSizeChange: (n: number) => void;
  onArabicLineHeightChange: (n: number) => void;
}

export function SettingsPanel({
  open, translationId, reciterId, tafsirId, tafsirOptions, mushafStyle,
  showTranslation, showTransliteration, showRoots, tajweedEnabled,
  arabicFontSize, arabicLineHeight,
  onReloadTranslation, onReciterChange, onTafsirChange, onMushafStyleChange,
  onShowTranslationChange, onShowTransliterationChange, onShowRootsChange,
  onTajweedChange, onArabicFontSizeChange, onArabicLineHeightChange,
}: SettingsPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden bg-[#0A0E16] border-b border-white/10 px-4 py-3"
        >
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <label htmlFor="quranreadingpage-fld-1" className="text-white/40 text-xs mb-1 block">Translation</label>
              <select id="quranreadingpage-fld-1"
                value={translationId}
                onChange={(e) => onReloadTranslation(parseInt(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs"
              >
                {TRANSLATION_OPTIONS.map((t) => (
                  <option key={t.id} value={t.id} className="bg-[#0A0E16]">{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="quranreadingpage-fld-2" className="text-white/40 text-xs mb-1 block">Reciter</label>
              <select id="quranreadingpage-fld-2"
                value={reciterId}
                onChange={(e) => onReciterChange(parseInt(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs"
              >
                {RECITER_PRESETS.map((r) => (
                  <option key={r.id} value={r.id} className="bg-[#0A0E16]">{r.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="quranreadingpage-fld-3" className="text-white/40 text-xs mb-1 block">Tafsir</label>
              <select id="quranreadingpage-fld-3"
                value={tafsirId}
                onChange={(e) => onTafsirChange(parseInt(e.target.value))}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs"
              >
                {(() => {
                  const list = tafsirOptions.length > 0
                    ? tafsirOptions
                    : [{ id: 169, name: 'Ibn Kathir', authorName: '', languageName: 'English', slug: '' }];
                  const byLang = new Map<string, typeof list>();
                  for (const t of list) {
                    const k = t.languageName || 'Other';
                    const arr = byLang.get(k);
                    if (arr) arr.push(t);
                    else byLang.set(k, [t]);
                  }
                  const langs = Array.from(byLang.keys()).sort((a, b) => {
                    if (a.toLowerCase() === 'english') return -1;
                    if (b.toLowerCase() === 'english') return 1;
                    return a.localeCompare(b);
                  });
                  return langs.map((lang) => (
                    <optgroup key={lang} label={lang} className="bg-[#0A0E16]">
                      {byLang.get(lang)!.map((t) => (
                        <option key={t.id} value={t.id} className="bg-[#0A0E16]">
                          {t.name}{t.authorName ? ` — ${t.authorName.split(' ').slice(-1)[0]}` : ''}
                        </option>
                      ))}
                    </optgroup>
                  ));
                })()}
              </select>
            </div>
            <div>
              <label htmlFor="quranreadingpage-fld-4" className="text-white/40 text-xs mb-1 block">Mushaf Script Style</label>
              <select id="quranreadingpage-fld-4"
                value={mushafStyle}
                onChange={(e) => onMushafStyleChange(e.target.value as MushafStyleId)}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-2 py-1.5 text-white text-xs"
              >
                {MUSHAF_STYLE_ORDER.map((s) => (
                  <option key={s} value={s} className="bg-[#0A0E16]">{MUSHAF_STYLES[s].label}</option>
                ))}
              </select>
            </div>
            <fieldset className="flex flex-col gap-1.5 border-0 p-0 m-0">
              <legend className="text-white/40 text-xs">Display</legend>
              <label className="flex items-center gap-2 text-xs text-white/70">
                <input type="checkbox" checked={showTranslation} onChange={(e) => onShowTranslationChange(e.target.checked)} className="accent-amber-500" />
                Translation
              </label>
              <label className="flex items-center gap-2 text-xs text-white/70">
                <input type="checkbox" checked={showTransliteration} onChange={(e) => onShowTransliterationChange(e.target.checked)} className="accent-amber-500" />
                Transliteration
              </label>
              <label className="flex items-center gap-2 text-xs text-white/70">
                <input type="checkbox" checked={showRoots} onChange={(e) => onShowRootsChange(e.target.checked)} className="accent-amber-500" />
                Root words
              </label>
              <label className="flex items-center gap-2 text-xs text-white/70">
                <input type="checkbox" checked={tajweedEnabled} onChange={(e) => onTajweedChange(e.target.checked)} className="accent-amber-500" />
                Tajweed colors
              </label>
            </fieldset>
          </div>
          {/* Typography */}
          <div className="mt-3 pt-3 border-t border-white/5 space-y-2">
            <label className="flex items-center justify-between text-xs text-white/70">
              <span>Arabic size · {arabicFontSize}px</span>
              <input
                type="range"
                min={16}
                max={44}
                value={arabicFontSize}
                onChange={(e) => onArabicFontSizeChange(parseInt(e.target.value))}
                className="accent-amber-500 w-40"
              />
            </label>
            <label className="flex items-center justify-between text-xs text-white/70">
              <span>Line height · {arabicLineHeight}</span>
              <input
                type="range"
                min={1.4}
                max={3.2}
                step={0.1}
                value={arabicLineHeight}
                onChange={(e) => onArabicLineHeightChange(parseFloat(e.target.value))}
                className="accent-amber-500 w-40"
              />
            </label>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
