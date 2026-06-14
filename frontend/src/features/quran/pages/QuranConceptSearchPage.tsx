/**
 * QuranConceptSearchPage
 * AI-powered thematic search. User types a concept (e.g. "patience",
 * "repentance", "mercy") — we combine:
 *   1. Quran.com keyword search (fast, direct translation matches)
 *   2. A seeded prompt for Ask Raya (handoff) that asks for thematic ayahs
 *      with the structured output "<verseKey> — <one-line reason>"
 *
 * This is ZaryahPlus-unique — not in the reference app.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CaretLeft, MagnifyingGlass, Sparkle, ArrowRight } from '@phosphor-icons/react';
import { conceptSearch } from '../services/conceptSearchService';
import type { QuranSearchResult } from '../types/quran.types';
import { RayaQuranPanel } from '../components/RayaQuranPanel';

const SUGGESTED = [
  'patience',
  'gratitude',
  'mercy',
  'trust in Allah',
  'parents',
  'prayer',
  'fasting',
  'charity',
  'seeking knowledge',
  'afterlife',
];

// Arabic transliteration suggestions (clickable chips below English ones).
const ARABIC_SUGGESTED = ['shukr', 'sabr', 'zikr', 'taqwa', 'rahmah', 'tawbah', 'qiyamah', 'jannah'];

export function QuranConceptSearchPage() {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<QuranSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resolvedHint, setResolvedHint] = useState<string | null>(null);
  const [rayaOpen, setRayaOpen] = useState(false);
  const [rayaInitialQuestion, setRayaInitialQuestion] = useState<string | undefined>(undefined);

  const runSearch = async (term: string) => {
    setQ(term);
    setError(null);
    setResolvedHint(null);
    if (!term.trim()) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const out = await conceptSearch(term.trim(), 12);
      setResults(out.results);
      if (out.fromTransliteration) {
        setResolvedHint(`Searched "${out.resolvedTerm}" for ${out.originalQuery}`);
      }
      if (out.results.length === 0) setError(`No direct verse matches for "${term}". Try a related word, or use Ask Raya below.`);
    } catch {
      setError('Search failed — check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const askRaya = () => {
    const term = q.trim() || 'patience';
    setRayaInitialQuestion(
      `List 6 to 10 verified ayahs about "${term}" with a one-line reason for each. Cite each ayah with its surah and verse number.`,
    );
    setRayaOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] text-white">
      <div className="sticky top-0 z-20 bg-[#0A0E16]/95 backdrop-blur-sm border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-white/10">
          <CaretLeft size={20} className="text-[#D4A853]" />
        </button>
        <div>
          <h1 className="text-base font-bold">Concept Search</h1>
          <p className="text-[11px] text-white/40">Find ayahs by theme · powered by Raya</p>
        </div>
      </div>

      <div className="px-4 py-5 space-y-4">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && runSearch(q)}
            placeholder="e.g. patience, mercy, seeking knowledge…"
            className="w-full pl-9 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-[#D4A853]/40"
            // eslint-disable-next-line jsx-a11y/no-autofocus -- concept search page; auto-focus is expected entry-point UX
            autoFocus
          />
        </div>

        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          {SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => runSearch(s)}
              className="whitespace-nowrap px-2.5 py-1 text-[11px] rounded-full bg-white/5 border border-white/10 text-white/70 hover:border-[#D4A853]/30"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Arabic transliteration chips */}
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
          <span className="text-[10px] text-white/35 self-center pl-0.5 shrink-0">Arabic →</span>
          {ARABIC_SUGGESTED.map((s) => (
            <button
              key={s}
              onClick={() => runSearch(s)}
              className="whitespace-nowrap px-2.5 py-1 text-[11px] rounded-full bg-[#D4A853]/10 border border-[#D4A853]/25 text-[#D4A853] hover:bg-[#D4A853]/20"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Hint when search auto-translated a transliterated term */}
        {resolvedHint && (
          <p className="text-[11px] text-[#D4A853]/85 -mb-1">{resolvedHint}</p>
        )}

        <button
          onClick={askRaya}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#D4A853]/20 to-[#B891E8]/20 border border-[#D4A853]/30 text-[#D4A853] font-medium"
        >
          <Sparkle size={16} weight="fill" /> Ask Raya for a thematic list on "{q || '…'}"
        </button>

        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-[11px] uppercase tracking-wide text-white/50">Direct verse matches</h2>
            {results.length > 1 && <span className="text-[10px] text-white/35">surah order</span>}
          </div>
          {loading ? (
            <p className="text-[#D4A853]/70 text-xs animate-pulse">Searching…</p>
          ) : !searched ? (
            <p className="text-white/40 text-xs">Type a concept above, or pick a suggestion.</p>
          ) : results.length === 0 ? (
            <p className="text-white/55 text-xs">{error ?? `No verses found for "${q}". Try a related word.`}</p>
          ) : (
            <div className="space-y-2">
              {results.map((r, i) => (
                <motion.button
                  key={r.verseKey}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  onClick={() => {
                    const [sid] = r.verseKey.split(':');
                    navigate(`/quran/read?surah=${sid}&verse=${encodeURIComponent(r.verseKey)}`);
                  }}
                  className="w-full text-left p-3 rounded-xl bg-white/3 border border-white/8 hover:border-[#D4A853]/30 transition-colors"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-mono text-[#D4A853]">{r.verseKey} · {r.surahName}</span>
                    <ArrowRight size={12} className="text-white/30" />
                  </div>
                  <p className="text-sm text-white/80 leading-snug">{r.translation}</p>
                  <p className="text-[10px] text-white/40 mt-1">{r.translationName}</p>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </div>

      <RayaQuranPanel
        open={rayaOpen}
        onClose={() => setRayaOpen(false)}
        context={null}
        initialQuestion={rayaInitialQuestion}
      />
    </div>
  );
}

export default QuranConceptSearchPage;
