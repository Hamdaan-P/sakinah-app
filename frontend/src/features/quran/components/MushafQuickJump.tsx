/**
 * MushafQuickJump
 *
 * Bottom drawer with four tabs: Surahs · Juz · Bookmarks · Recent.
 * Each entry, when tapped, calls onJump(pageNumber) and closes the sheet.
 *
 * Drawer animation pattern adapted from AnnotationSheet.tsx.
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Bookmark, ClockCounterClockwise, Stack } from '@phosphor-icons/react';
import type { Surah } from '../types/quran.types';
import type { MushafTokens } from '../hooks/useMushafTheme';
import { getBookmarks, type QuranBookmark } from '../services/quranBookmarkService';
import {
  SurahsPanel,
  JuzPanel,
  BookmarksPanel,
  RecentPanel,
} from './mushaf-quick-jump/_tabPanels';

type Tab = 'surahs' | 'juz' | 'bookmarks' | 'recent';

interface Props {
  open: boolean;
  onClose: () => void;
  onJump: (pageNumber: number) => void;
  surahs: Surah[];
  recents: number[];
  tokens: MushafTokens;
  /** Last page of the current edition (clamps jumps). */
  maxPage: number;
  /**
   * Whether this edition follows the 604 Madani layout. The Surah/Juz jump is
   * keyed to that layout, so for editions that don't (IndoPak) we hide those
   * tabs and keep page-number / bookmarks / recents.
   */
  aligned: boolean;
}

export function MushafQuickJump({ open, onClose, onJump, surahs, recents, tokens, maxPage, aligned }: Props) {
  const [tab, setTab] = useState<Tab>(aligned ? 'surahs' : 'bookmarks');
  const [query, setQuery] = useState('');
  const [bookmarks, setBookmarks] = useState<QuranBookmark[]>([]);

  useEffect(() => {
    if (open) {
      setBookmarks(getBookmarks());
      setQuery('');
      // Surah/Juz tabs don't exist for non-aligned editions — fall back.
      if (!aligned) setTab((t) => (t === 'surahs' || t === 'juz' ? 'bookmarks' : t));
    }
  }, [open, aligned]);

  const filteredSurahs = useMemo(() => {
    if (!query.trim()) return surahs;
    const q = query.trim().toLowerCase();
    return surahs.filter(
      (s) =>
        s.nameSimple.toLowerCase().includes(q) ||
        s.nameEnglish.toLowerCase().includes(q) ||
        String(s.id).includes(q),
    );
  }, [query, surahs]);

  const jump = (n: number) => {
    onJump(Math.max(1, Math.min(maxPage, n)));
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 inset-x-0 z-50 rounded-t-3xl pb-safe shadow-2xl"
            style={{
              background: tokens.paper,
              color: tokens.ink,
              boxShadow: `0 -20px 60px rgba(0,0,0,0.5), 0 -1px 0 ${tokens.frame}55`,
              maxHeight: '78vh',
              display: 'flex',
              flexDirection: 'column',
            }}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            {/* Drag handle */}
            <div className="pt-3 pb-1 flex justify-center">
              <div
                className="h-1 w-10 rounded-full"
                style={{ background: `${tokens.frame}55` }}
              />
            </div>

            {/* Header */}
            <div className="px-5 pt-2 pb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold tracking-wide flex items-center gap-2">
                <span style={{ color: tokens.gold }}>◆</span> Jump to
              </h3>
              <button
                onClick={onClose}
                className="p-2 rounded-full transition-colors"
                style={{ background: `${tokens.frame}22`, color: tokens.ink }}
                aria-label="Close"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Tabs */}
            <div
              className="px-4 pb-4 flex gap-2"
              style={{ borderBottom: `1px solid ${tokens.frame}22` }}
            >
              {aligned && (
                <>
                  <TabBtn icon={<BookOpen size={14} weight="fill" />} label="Surahs" active={tab === 'surahs'} onClick={() => setTab('surahs')} tokens={tokens} />
                  <TabBtn icon={<Stack size={14} weight="fill" />} label="Juz" active={tab === 'juz'} onClick={() => setTab('juz')} tokens={tokens} />
                </>
              )}
              <TabBtn icon={<Bookmark size={14} weight="fill" />} label="Bookmarks" active={tab === 'bookmarks'} onClick={() => setTab('bookmarks')} tokens={tokens} />
              <TabBtn icon={<ClockCounterClockwise size={14} weight="fill" />} label="Recent" active={tab === 'recent'} onClick={() => setTab('recent')} tokens={tokens} />
            </div>

            {/* Body (scrollable) */}
            <div className="flex-1 overflow-y-auto px-3 pb-4">
              {tab === 'surahs' && (
                <SurahsPanel filteredSurahs={filteredSurahs} query={query} setQuery={setQuery} jump={jump} tokens={tokens} />
              )}
              {tab === 'juz' && <JuzPanel jump={jump} tokens={tokens} />}
              {tab === 'bookmarks' && <BookmarksPanel bookmarks={bookmarks} jump={jump} tokens={tokens} />}
              {tab === 'recent' && <RecentPanel recents={recents} jump={jump} tokens={tokens} />}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function TabBtn({
  icon,
  label,
  active,
  onClick,
  tokens,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
  tokens: MushafTokens;
}) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all"
      style={{
        background: active ? tokens.gold : `${tokens.frame}18`,
        color: active ? '#1A1208' : tokens.ink,
        border: active ? `1px solid ${tokens.gold}` : `1px solid ${tokens.frame}44`,
        boxShadow: active ? `0 4px 14px -4px ${tokens.gold}aa` : 'none',
      }}
    >
      {icon}
      {label}
    </button>
  );
}
