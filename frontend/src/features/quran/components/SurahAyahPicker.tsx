/**
 * Surah + Ayah Picker Modal
 *
 * Used by the Workspace ("+ New") and Editor ("Insert Ayah") flows.
 * Two-step:
 *   1. Pick a surah (searchable, all 114, shows Makkan/Madinan + verse count)
 *   2. Pick an ayah number → preview Arabic + translation → confirm
 *
 * onSelect returns enough info for an embed: verseKey, surahName, Arabic,
 * translation, so the editor can render an `AyahEmbed` without a second fetch.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { MagnifyingGlass, X, CaretLeft, CheckCircle, ArrowRight } from '@phosphor-icons/react';
import { fetchSurahs, fetchVerse } from '../services/quranApiService';
import type { Surah } from '../types/quran.types';

export interface PickedAyah {
  verseKey: string;        // "25:63"
  surahId: number;
  ayahNumber: number;
  surahName: string;       // "Al-Furqān"
  surahNameArabic: string; // "الفرقان"
  arabic: string;
  translation: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  onSelect: (picked: PickedAyah) => void;
}

type Step = 'surah' | 'ayah';

export function SurahAyahPicker({ open, onClose, onSelect }: Props) {
  const [step, setStep] = useState<Step>('surah');
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loadingSurahs, setLoadingSurahs] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [ayahNumber, setAyahNumber] = useState<number>(1);
  const [preview, setPreview] = useState<{ arabic: string; translation: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewToken = useRef(0);

  // Fetch surahs once on first open
  useEffect(() => {
    if (!open) return;
    if (surahs.length > 0) return;
    setLoadingSurahs(true);
    setError(null);
    fetchSurahs()
      .then((s) => setSurahs(s))
      .catch(() => setError('Could not load surah list. Check your connection.'))
      .finally(() => setLoadingSurahs(false));
  }, [open, surahs.length]);

  // Reset state when reopened
  useEffect(() => {
    if (open) {
      setStep('surah');
      setSearch('');
      setSelectedSurah(null);
      setAyahNumber(1);
      setPreview(null);
    }
  }, [open]);

  // Fetch verse preview whenever (selectedSurah, ayahNumber) changes
  useEffect(() => {
    if (!selectedSurah) return;
    if (step !== 'ayah') return;
    const n = ayahNumber;
    if (n < 1 || n > selectedSurah.versesCount) return;
    const token = ++previewToken.current;
    setPreviewLoading(true);
    fetchVerse(selectedSurah.id, n)
      .then((v) => {
        if (token !== previewToken.current) return;
        if (v) setPreview({ arabic: v.arabic, translation: v.translation });
        else setPreview(null);
      })
      .catch(() => {
        if (token === previewToken.current) setPreview(null);
      })
      .finally(() => {
        if (token === previewToken.current) setPreviewLoading(false);
      });
  }, [selectedSurah, ayahNumber, step]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return surahs;
    if (/^\d+$/.test(q)) {
      const n = Number(q);
      return surahs.filter((s) => s.id === n || String(s.id).startsWith(q));
    }
    return surahs.filter(
      (s) =>
        s.nameSimple.toLowerCase().includes(q) ||
        s.nameEnglish?.toLowerCase().includes(q) ||
        s.nameArabic.includes(q),
    );
  }, [surahs, search]);

  function confirm() {
    if (!selectedSurah || !preview) return;
    const picked: PickedAyah = {
      verseKey: `${selectedSurah.id}:${ayahNumber}`,
      surahId: selectedSurah.id,
      ayahNumber,
      surahName: selectedSurah.nameSimple,
      surahNameArabic: selectedSurah.nameArabic,
      arabic: preview.arabic,
      translation: preview.translation,
    };
    onSelect(picked);
  }

  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 250 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-[min(640px,calc(100vh-24px))] bg-[#0A0E16] border border-[#D4A853]/15 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
              {step === 'ayah' && (
                <button
                  onClick={() => {
                    setStep('surah');
                    setPreview(null);
                  }}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-white/70"
                  aria-label="Back to surah list"
                >
                  <CaretLeft size={18} />
                </button>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-[#D4A853]">
                  {step === 'surah' ? 'Step 1 of 2' : 'Step 2 of 2'}
                </p>
                <h2 className="text-base font-bold text-white truncate">
                  {step === 'surah' ? 'Pick a Surah' : `${selectedSurah?.nameSimple} · ${selectedSurah?.versesCount} ayahs`}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/70"
                aria-label="Close picker"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            {step === 'surah' ? (
              <SurahStep
                loading={loadingSurahs}
                error={error}
                surahs={filtered}
                search={search}
                onSearch={setSearch}
                onPick={(s) => {
                  setSelectedSurah(s);
                  setAyahNumber(1);
                  setStep('ayah');
                }}
              />
            ) : (
              <AyahStep
                surah={selectedSurah!}
                ayahNumber={ayahNumber}
                onAyahChange={setAyahNumber}
                preview={preview}
                loading={previewLoading}
              />
            )}

            {/* Footer */}
            {step === 'ayah' && (
              <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-end gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-2 rounded-lg text-[12px] text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={confirm}
                  disabled={!preview || previewLoading}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold bg-[#D4A853] text-[#0A0E16] hover:bg-[#E8C97A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCircle size={14} weight="fill" />
                  Use this ayah
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function SurahStep({
  loading,
  error,
  surahs,
  search,
  onSearch,
  onPick,
}: {
  loading: boolean;
  error: string | null;
  surahs: Surah[];
  search: string;
  onSearch: (v: string) => void;
  onPick: (s: Surah) => void;
}) {
  const searchRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    // Focus on mount instead of autoFocus prop (eslint jsx-a11y/no-autofocus).
    const t = window.setTimeout(() => searchRef.current?.focus(), 0);
    return () => window.clearTimeout(t);
  }, []);

  return (
    <>
      <div className="px-4 pt-3 pb-2 border-b border-white/[0.04]">
        <div className="flex items-center gap-2 bg-white/[0.04] border border-white/[0.06] rounded-lg px-3 py-2">
          <MagnifyingGlass size={14} className="text-white/40 shrink-0" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder="Search surah… (name or number)"
            aria-label="Search surah"
            // eslint-disable-next-line jsx-a11y/no-autofocus -- deliberate: the picker opens specifically to capture this search input
            autoFocus
            className="flex-1 bg-transparent text-[13px] text-white placeholder-white/30 focus:outline-none"
          />
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-1">
        {loading && (
          <div className="text-center text-[12px] text-white/40 py-8">Loading surahs…</div>
        )}
        {error && (
          <div className="text-center text-[12px] text-rose-300 py-8">{error}</div>
        )}
        {!loading && !error && surahs.length === 0 && (
          <div className="text-center text-[12px] text-white/40 py-8">No matching surahs.</div>
        )}
        {surahs.map((s) => (
          <button
            key={s.id}
            onClick={() => onPick(s)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] transition-colors text-left"
          >
            <div className="w-8 h-8 rounded-md bg-[#D4A853]/10 border border-[#D4A853]/20 flex items-center justify-center shrink-0">
              <span className="font-mono text-[10.5px] font-bold text-[#D4A853]">
                {s.id}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline gap-2">
                <p className="text-[13px] font-semibold text-white truncate">{s.nameSimple}</p>
                <p className="text-[10px] text-white/40 truncate">{s.nameEnglish}</p>
              </div>
              <p className="text-[10px] text-white/40 mt-0.5">
                {s.revelationType} · {s.versesCount} ayahs
              </p>
            </div>
            <p className="font-serif text-[18px] text-[#D4A853] shrink-0" style={{ fontFamily: 'Amiri, serif' }}>
              {s.nameArabic}
            </p>
            <ArrowRight size={14} className="text-white/25 shrink-0" />
          </button>
        ))}
      </div>
    </>
  );
}

function AyahStep({
  surah,
  ayahNumber,
  onAyahChange,
  preview,
  loading,
}: {
  surah: Surah;
  ayahNumber: number;
  onAyahChange: (n: number) => void;
  preview: { arabic: string; translation: string } | null;
  loading: boolean;
}) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-4">
      <div className="rounded-xl border border-[#D4A853]/15 bg-[#D4A853]/[0.04] p-3 mb-4">
        <div className="flex items-baseline justify-between">
          <p className="text-[14px] font-semibold text-white">{surah.nameSimple}</p>
          <p className="text-[16px] text-[#D4A853]" style={{ fontFamily: 'Amiri, serif' }}>
            {surah.nameArabic}
          </p>
        </div>
        <p className="text-[10px] text-white/45 mt-1">
          {surah.revelationType} · {surah.versesCount} ayahs · Surah {surah.id}
        </p>
      </div>

      <label htmlFor="surah-ayah-number" className="block text-[10px] uppercase tracking-wider font-semibold text-white/45 mb-2">
        Ayah number
      </label>
      <div className="flex items-center gap-3">
        <button
          onClick={() => onAyahChange(Math.max(1, ayahNumber - 1))}
          disabled={ayahNumber <= 1}
          className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/70 hover:text-[#D4A853] hover:border-[#D4A853]/30 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          −
        </button>
        <input
          id="surah-ayah-number"
          type="number"
          inputMode="numeric"
          min={1}
          max={surah.versesCount}
          value={ayahNumber}
          onChange={(e) => {
            const n = Number(e.target.value);
            if (!Number.isNaN(n)) onAyahChange(Math.min(surah.versesCount, Math.max(1, n)));
          }}
          className="flex-1 bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-center text-[15px] font-mono font-semibold text-white focus:outline-none focus:border-[#D4A853]/40"
        />
        <button
          onClick={() => onAyahChange(Math.min(surah.versesCount, ayahNumber + 1))}
          disabled={ayahNumber >= surah.versesCount}
          className="w-9 h-9 rounded-lg bg-white/[0.05] border border-white/[0.08] text-white/70 hover:text-[#D4A853] hover:border-[#D4A853]/30 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          +
        </button>
      </div>
      <p className="text-[10px] text-white/35 mt-1.5">1 – {surah.versesCount}</p>

      {/* Preview */}
      <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 min-h-[140px]">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-white/40 mb-3">
          Verse {surah.id}:{ayahNumber}
        </p>
        {loading && <p className="text-[12px] text-white/40">Loading verse…</p>}
        {!loading && !preview && (
          <p className="text-[12px] text-white/40">No preview available.</p>
        )}
        {!loading && preview && (
          <>
            <p
              className="text-[18px] leading-[2] text-right text-white"
              style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }}
            >
              {preview.arabic}
            </p>
            {preview.translation && (
              <p className="mt-3 text-[12.5px] leading-relaxed text-white/65 italic">
                "{preview.translation}"
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default SurahAyahPicker;
