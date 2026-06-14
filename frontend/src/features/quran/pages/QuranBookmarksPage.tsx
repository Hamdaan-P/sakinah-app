/**
 * Quran Bookmarks Page
 * Dedicated view for all saved verse bookmarks with quick navigation
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretLeft, BookmarkSimple, Trash, BookOpen, ArrowRight } from '@phosphor-icons/react';
import { getBookmarks, removeBookmark, type QuranBookmark } from '../services/quranBookmarkService';

export function QuranBookmarksPage() {
  const navigate = useNavigate();
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>([]);

  useEffect(() => {
    setBookmarks(getBookmarks());
  }, []);

  const handleRemove = (verseKey: string) => {
    removeBookmark(verseKey);
    setBookmarks(getBookmarks());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0A0E16]/95 backdrop-blur-sm border-b border-[#D4A853]/15 px-4 py-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-white/10">
            <CaretLeft size={20} className="text-[#D4A853]" />
          </button>
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <BookmarkSimple size={20} weight="fill" className="text-[#D4A853]" />
              My Bookmarks
            </h1>
            <p className="text-[11px] text-white/40">
              {bookmarks.length} saved {bookmarks.length === 1 ? 'verse' : 'verses'}
            </p>
          </div>
        </div>
      </div>

      <div className="px-4 py-4">
        {bookmarks.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="w-16 h-16 rounded-2xl bg-[#D4A853]/10 flex items-center justify-center mb-4">
              <BookmarkSimple size={32} className="text-[#D4A853]/40" />
            </div>
            <p className="text-white/60 text-sm mb-1">No bookmarks yet</p>
            <p className="text-white/30 text-xs mb-6">
              Tap the bookmark icon on any verse while reading to save it here
            </p>
            <button
              onClick={() => navigate('/quran/read')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#D4A853]/15 border border-[#D4A853]/25 text-sm font-medium text-[#D4A853] hover:bg-[#D4A853]/25 transition-colors"
            >
              <BookOpen size={16} />
              Start Reading
            </button>
          </motion.div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-2.5">
              {bookmarks.map((bm, i) => (
                <motion.div
                  key={bm.verseKey}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                  transition={{ delay: i * 0.04 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/[0.03] border border-white/[0.08] hover:border-[#D4A853]/25 transition-all group"
                >
                  <button
                    onClick={() => navigate(`/quran/read?surah=${bm.surahId}&verse=${bm.verseKey}`)}
                    className="flex-1 flex items-center gap-3.5 text-left min-w-0"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#D4A853]/10 flex items-center justify-center shrink-0">
                      <BookmarkSimple size={18} weight="fill" className="text-[#D4A853]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{bm.surahName}</p>
                      <p className="text-[11px] text-white/40 mt-0.5">Verse {bm.verseKey}</p>
                    </div>
                    <ArrowRight size={16} className="text-white/20 group-hover:text-[#D4A853]/60 shrink-0 transition-colors" />
                  </button>
                  <button
                    onClick={() => handleRemove(bm.verseKey)}
                    className="p-2 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 transition-all shrink-0"
                  >
                    <Trash size={15} className="text-red-400/70" />
                  </button>
                </motion.div>
              ))}
            </div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

export default QuranBookmarksPage;
