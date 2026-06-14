/**
 * Tab body content for MushafQuickJump.
 */

import { Bookmark, ClockCounterClockwise, MagnifyingGlass } from '@phosphor-icons/react';
import type { Surah } from '../../types/quran.types';
import type { MushafTokens } from '../../hooks/useMushafTheme';
import { SURAH_START_PAGE, JUZ_START_PAGE } from '../../data/mushafIndex';
import type { QuranBookmark } from '../../services/quranBookmarkService';

interface SurahsPanelProps {
  filteredSurahs: Surah[];
  query: string;
  setQuery: (v: string) => void;
  jump: (page: number) => void;
  tokens: MushafTokens;
}

export function SurahsPanel({ filteredSurahs, query, setQuery, jump, tokens }: SurahsPanelProps) {
  return (
    <>
      <div
        className="flex items-center gap-2 mb-3 mx-2 px-3 py-2 rounded-xl"
        style={{ background: `${tokens.frame}15`, border: `1px solid ${tokens.frame}33` }}
      >
        <MagnifyingGlass size={14} style={{ color: tokens.inkMuted }} />
        <input
          // eslint-disable-next-line jsx-a11y/no-autofocus -- user-action-triggered surah jump sheet; auto-focus is expected UX
          autoFocus
          placeholder="Search surah by name or number…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 bg-transparent outline-none text-sm placeholder:opacity-50"
          style={{ color: tokens.ink }}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {filteredSurahs.map((s) => {
          const page = SURAH_START_PAGE[s.id];
          return (
            <button
              key={s.id}
              onClick={() => jump(page ?? 1)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors"
              style={{ background: `${tokens.frame}10`, color: tokens.ink }}
            >
              <span
                className="flex items-center justify-center w-8 h-8 rounded-full text-[11px] font-bold flex-shrink-0"
                style={{ background: `${tokens.gold}22`, color: tokens.gold, border: `1px solid ${tokens.gold}55` }}
              >
                {s.id}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold truncate">{s.nameSimple}</span>
                <span className="block text-[11px] opacity-60">{s.versesCount} verses · {s.revelationType}</span>
              </span>
              <span dir="rtl" className="text-base flex-shrink-0" style={{ fontFamily: "'Amiri Quran', 'Amiri', serif", color: tokens.gold }}>
                {s.nameArabic}
              </span>
              <span className="text-[10px] opacity-50 ml-2 flex-shrink-0">p.{page}</span>
            </button>
          );
        })}
        {filteredSurahs.length === 0 && (
          <p className="col-span-full text-center text-xs py-8 opacity-50">No surahs match.</p>
        )}
      </div>
    </>
  );
}

export function JuzPanel({ jump, tokens }: { jump: (n: number) => void; tokens: MushafTokens }) {
  return (
    <div className="grid grid-cols-3 sm:grid-cols-5 gap-2 px-1">
      {Array.from({ length: 30 }, (_, i) => i + 1).map((j) => (
        <button
          key={j}
          onClick={() => jump(JUZ_START_PAGE[j] ?? 1)}
          className="rounded-xl py-3 text-center transition-transform hover:scale-105"
          style={{
            background: `${tokens.frame}15`,
            color: tokens.ink,
            border: `1px solid ${tokens.frame}33`,
          }}
        >
          <div className="text-[10px] uppercase tracking-wider opacity-60">Juz</div>
          <div className="text-lg font-bold" style={{ color: tokens.gold }}>{j}</div>
          <div className="text-[10px] opacity-50">p.{JUZ_START_PAGE[j]}</div>
        </button>
      ))}
    </div>
  );
}

export function BookmarksPanel({
  bookmarks,
  jump,
  tokens,
}: {
  bookmarks: QuranBookmark[];
  jump: (page: number) => void;
  tokens: MushafTokens;
}) {
  if (bookmarks.length === 0) {
    return (
      <div className="text-center py-12 opacity-60">
        <Bookmark size={32} weight="duotone" className="mx-auto mb-2" />
        <p className="text-sm">No bookmarks yet.</p>
        <p className="text-[11px] opacity-70 mt-1">Tap an ayah while reading to save one.</p>
      </div>
    );
  }
  return (
    <div className="space-y-1.5 px-1">
      {bookmarks.map((b) => (
        <button
          key={b.verseKey + b.savedAt}
          onClick={() => {
            // Best-effort: jump to surah's first page (we don't store page in bookmark).
            const page = SURAH_START_PAGE[b.surahId] ?? 1;
            jump(page);
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left"
          style={{ background: `${tokens.frame}10`, color: tokens.ink }}
        >
          <Bookmark size={16} weight="fill" style={{ color: tokens.gold }} />
          <span className="flex-1">
            <span className="block text-sm font-semibold">{b.surahName}</span>
            <span className="block text-[11px] opacity-60">Ayah {b.verseNumber} · {b.verseKey}</span>
          </span>
          <span className="text-[10px] opacity-50">
            {new Date(b.savedAt).toLocaleDateString()}
          </span>
        </button>
      ))}
    </div>
  );
}

export function RecentPanel({
  recents,
  jump,
  tokens,
}: {
  recents: number[];
  jump: (n: number) => void;
  tokens: MushafTokens;
}) {
  if (recents.length === 0) {
    return (
      <div className="text-center py-12 opacity-60">
        <ClockCounterClockwise size={32} weight="duotone" className="mx-auto mb-2" />
        <p className="text-sm">No recent pages.</p>
      </div>
    );
  }
  return (
    <div className="space-y-1.5 px-1">
      {recents.map((p) => (
        <button
          key={p}
          onClick={() => jump(p)}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left"
          style={{ background: `${tokens.frame}10`, color: tokens.ink }}
        >
          <ClockCounterClockwise size={16} style={{ color: tokens.gold }} />
          <span className="flex-1 text-sm">Page {p}</span>
        </button>
      ))}
    </div>
  );
}
