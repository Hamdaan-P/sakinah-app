/**
 * CitationPanel — modal for searching the Qur'an or entering a manual
 * (hadith/external) citation. Used by ResearchArticlePage.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlass, Plus, X } from '@phosphor-icons/react';
import { searchQuran, fetchVerse } from '@/features/quran/services/quranApiService';
import { newCitation } from '../../services/researchService';
import type { ResearchCitation } from '../../types/research.types';

interface Props {
  onClose: () => void;
  onAdd: (c: ResearchCitation) => ResearchCitation;
}

export function CitationPanel({ onClose, onAdd }: Props) {
  const [tab, setTab] = useState<'quran' | 'manual'>('quran');
  const [q, setQ] = useState('');
  const [results, setResults] = useState<{ verseKey: string; surahName: string; translation: string }[]>([]);
  const [searching, setSearching] = useState(false);

  // Manual citation
  const [mSource, setMSource] = useState<'hadith' | 'external'>('hadith');
  const [mRef, setMRef] = useState('');
  const [mText, setMText] = useState('');
  const [mAttr, setMAttr] = useState('');

  const runSearch = async () => {
    if (!q.trim()) return;
    setSearching(true);
    try {
      setResults(await searchQuran(q.trim(), 12));
    } finally {
      setSearching(false);
    }
  };

  const addQuranCitation = async (verseKey: string, surahName: string, fallbackTranslation: string) => {
    const [s, a] = verseKey.split(':').map(Number);
    const verse = await fetchVerse(s, a).catch(() => null);
    onAdd(newCitation({
      source: 'quran',
      reference: verseKey,
      arabic: verse?.arabic,
      translation: verse?.translation || fallbackTranslation,
      attribution: surahName,
    }));
  };

  const addManualCitation = () => {
    if (!mRef.trim() || !mText.trim()) return;
    onAdd(newCitation({
      source: mSource,
      reference: mRef.trim(),
      translation: mText.trim().slice(0, 800),
      attribution: mAttr.trim() || undefined,
    }));
    setMRef(''); setMText(''); setMAttr('');
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
      onClick={onClose}
    >
      <motion.div
        initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
        className="w-full sm:max-w-md bg-[#0A0E16] border-t sm:border border-[#D4A853]/25 rounded-t-2xl sm:rounded-2xl p-5 max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-white">Add citation</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center"
          ><X size={14} className="text-white/70" /></button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-3 border-b border-white/5">
          {[{k: 'quran', label: 'Qur\'an'}, {k: 'manual', label: 'Manual'}].map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k as 'quran' | 'manual')}
              className={`px-4 py-2 text-xs font-medium border-b-2 -mb-px transition-colors ${
                tab === t.k ? 'text-[#D4A853] border-[#D4A853]' : 'text-white/50 border-transparent'
              }`}
            >{t.label}</button>
          ))}
        </div>

        {tab === 'quran' ? (
          <>
            <div className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <MagnifyingGlass size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && runSearch()}
                  placeholder="Search Qur'an by translation"
                  className="w-full pl-8 pr-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4A853]/40"
                />
              </div>
              <button
                onClick={runSearch}
                className="px-3 py-2 rounded-lg bg-[#D4A853]/20 border border-[#D4A853]/30 text-[#D4A853] text-xs font-semibold"
              >Search</button>
            </div>
            {searching ? (
              <p className="text-xs text-white/45">Searching…</p>
            ) : results.length === 0 ? (
              <p className="text-xs text-white/40">Type a concept to find verses to cite.</p>
            ) : (
              <div className="space-y-2">
                {results.map((r) => (
                  <button
                    key={r.verseKey}
                    onClick={() => addQuranCitation(r.verseKey, r.surahName, r.translation)}
                    className="w-full text-left p-3 rounded-xl bg-white/3 border border-white/8 hover:border-[#D4A853]/30"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-mono text-[#D4A853]">{r.verseKey} · {r.surahName}</span>
                      <Plus size={12} className="text-emerald-300" />
                    </div>
                    <p className="text-xs text-white/70 leading-snug line-clamp-2">{r.translation}</p>
                  </button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="space-y-3">
            <div className="flex gap-2">
              {(['hadith', 'external'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setMSource(s)}
                  className={`flex-1 py-2 rounded-lg text-xs font-medium border ${
                    mSource === s ? 'bg-[#D4A853]/15 border-[#D4A853]/40 text-[#D4A853]' : 'bg-white/5 border-white/10 text-white/60'
                  }`}
                >{s}</button>
              ))}
            </div>
            <input
              value={mRef}
              onChange={(e) => setMRef(e.target.value)}
              placeholder={mSource === 'hadith' ? 'Reference (e.g. Sahih Bukhari 6018)' : 'URL or reference'}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4A853]/40"
            />
            <textarea
              value={mText}
              onChange={(e) => setMText(e.target.value.slice(0, 800))}
              placeholder="Quoted text"
              rows={4}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 resize-none focus:outline-none focus:border-[#D4A853]/40"
            />
            <input
              value={mAttr}
              onChange={(e) => setMAttr(e.target.value)}
              placeholder="Attribution / translator (optional)"
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4A853]/40"
            />
            <button
              onClick={addManualCitation}
              disabled={!mRef.trim() || !mText.trim()}
              className="w-full py-2.5 rounded-lg bg-[#D4A853] text-[#0A0E16] text-sm font-semibold disabled:opacity-50"
            >Add citation</button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
