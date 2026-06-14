/**
 * BarkaLabsJournal — Gratitude Journal screen.
 *
 * Orchestrates filter pills, grouping by date, the inline log card, and the
 * flying-card animation. Per-section UI lives under `./journal/`.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ArrowLeft } from '@phosphor-icons/react';
import { C } from '../barka-labs.constants';
import type { Blessing, BarkaLabsStats } from '../types/barka-labs.types';
import type { BarkaLabsScreen } from '../pages/BarkaLabsPage';
import { useCommunityStore } from '../stores/community.store';
import { FILTERS, type Filter } from './journal/_helpers';
import { InlineLogCard } from './journal/InlineLogCard';
import { FlyingCard } from './journal/FlyingCard';
import { JournalGroups } from './journal/JournalGroups';
import { useGroupedBlessings } from './journal/_useGroupedBlessings';
import { OthersStream } from './community/OthersStream';
import { SourceChip } from './common/SourceChip';

interface BarkaLabsJournalProps {
  blessings: Blessing[];
  stats: BarkaLabsStats;
  onDelete: (id: string) => void;
  onDecompose: (id: string) => void;
  go: (s: BarkaLabsScreen) => void;
  onSubmitBlessing: (text: string) => Promise<void>;
  submitting: boolean;
  onScrollToCounter?: () => void;
}

export function BarkaLabsJournal({
  blessings, onDelete, onDecompose, go, onSubmitBlessing, submitting, onScrollToCounter,
}: BarkaLabsJournalProps) {
  const [activeFilter, setActiveFilter] = useState<Filter>('All');
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [flyingText, setFlyingText] = useState<string | null>(null);
  const [flyKey, setFlyKey] = useState(0);
  const entriesRef = useRef<HTMLDivElement>(null);

  const communityFeed = useCommunityStore((s) => s.feed);
  const fetchFeed = useCommunityStore((s) => s.fetchFeed);
  const toggleLike = useCommunityStore((s) => s.toggleLike);
  const fetchComments = useCommunityStore((s) => s.fetchComments);
  const addComment = useCommunityStore((s) => s.addComment);
  const communityComments = useCommunityStore((s) => s.comments);
  const communityCommentsLoading = useCommunityStore((s) => s.commentsLoading);

  // Store guards against duplicate fetches via _initialized flag
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { fetchFeed(); }, []);

  const handleFlyingCard = useCallback((text: string) => {
    setFlyingText(text);
    setFlyKey((k) => k + 1);
    // Scroll down to see the card stacking animation
    setTimeout(() => {
      entriesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
  }, []);

  const handleFlyDone = useCallback(() => {
    setFlyingText(null);
    if (onScrollToCounter) {
      setTimeout(() => onScrollToCounter(), 300);
    }
  }, [onScrollToCounter]);

  const grouped = useGroupedBlessings(blessings, communityFeed, activeFilter);

  return (
    <div>
      {/* ── Back header ── */}
      <div className="flex items-center gap-3 mb-5">
        <button
          onClick={() => go('home')}
          className="w-9 h-9 rounded-full flex items-center justify-center cursor-pointer border transition-colors hover:border-[#D7B56A]"
          style={{ background: C.card, borderColor: C.cardB, color: C.t1 }}
        >
          <ArrowLeft size={16} weight="bold" />
        </button>
        <h1 className="font-[Cormorant_Garamond] text-[22px] font-semibold m-0 flex-1" style={{ color: C.t1 }}>
          <SourceChip kind="yours" />Gratitude Journal
        </h1>
      </div>

      {/* ── Live stream of others' blessings — motivates above the input ── */}
      <OthersStream />

      {/* ── Inline Log Shukr Card ── */}
      <InlineLogCard onSubmit={onSubmitBlessing} submitting={submitting} onFlyingCard={handleFlyingCard} />

      {/* ── Date filter pills ── */}
      <div className="flex gap-2 overflow-x-auto pb-1.5 mb-4 scrollbar-none">
        {FILTERS.map((f) => {
          const active = f === activeFilter;
          return (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className="whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold cursor-pointer shrink-0 transition-all"
              style={{
                border: active ? '1px solid #D7B56A' : `1px solid ${C.cardB}`,
                background: active ? 'rgba(215,181,106,0.12)' : 'transparent',
                color: active ? '#D7B56A' : '#D5DDEA',
              }}
            >
              {f}
            </button>
          );
        })}
      </div>

      {/* ── Flying card animation ── */}
      <div ref={entriesRef}>
        <AnimatePresence>
          {flyingText && (
            <FlyingCard key={flyKey} text={flyingText} onDone={handleFlyDone} />
          )}
        </AnimatePresence>
      </div>

      {/* ── Journal Entries ── */}
      <JournalGroups
        groups={grouped}
        hoveredId={hoveredId}
        setHoveredId={setHoveredId}
        onDelete={onDelete}
        onDecompose={onDecompose}
        communityComments={communityComments}
        communityCommentsLoading={communityCommentsLoading}
        toggleLike={toggleLike}
        fetchComments={fetchComments}
        addComment={addComment}
      />

      {/* ── Footer inspiration card ── */}
      <div
        className="rounded-2xl p-5 text-center mt-3 mb-5"
        style={{
          background: 'linear-gradient(135deg, rgba(42,157,111,0.12), rgba(13,19,35,0.88))',
          borderColor: 'rgba(42,157,111,0.2)',
          border: '1px solid rgba(42,157,111,0.2)',
          borderRadius: 16,
        }}
      >
        <p className="text-sm font-semibold mb-1.5 m-0" style={{ color: '#2A9D6F' }}>
          Feeling low? Scroll through your blessings.
        </p>
        <p className="text-xs leading-relaxed m-0" style={{ color: '#A7B1C0' }}>
          Every entry here is proof that goodness has touched your life.
          Sometimes we forget how much we have until we read our own words back to ourselves.
        </p>
      </div>

      {/* ── Back button ── */}
      <div className="flex justify-center pb-8 mt-2">
        <button
          onClick={() => go('home')}
          className="w-full py-3 rounded-2xl text-sm font-semibold cursor-pointer transition-all"
          style={{
            background: 'linear-gradient(135deg, #2A9D6F, #1B6B4A)',
            border: 'none',
            color: '#EBDCB8',
          }}
        >
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}
