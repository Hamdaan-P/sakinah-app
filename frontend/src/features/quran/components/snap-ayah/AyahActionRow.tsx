/**
 * AyahActionRow — play/save/search/tafsir buttons under each AyahSection.
 */

import { Play, Stop, BookmarkSimple, MagnifyingGlass, ChatCircle } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { NavigateFunction } from 'react-router-dom';
import type { QuranLine } from '../../types/quran.types';

interface Props {
  line: QuranLine;
  isPlaying: boolean;
  isBookmarked: boolean;
  onPlay: (line: QuranLine) => void;
  onStop: () => void;
  onBookmark: (line: QuranLine) => void;
  onSelectAyah: (verseKey: string | null) => void;
  navigate: NavigateFunction;
}

export function AyahActionRow({
  line,
  isPlaying,
  isBookmarked,
  onPlay,
  onStop,
  onBookmark,
  onSelectAyah,
  navigate,
}: Props) {
  return (
    <div className="flex items-center justify-center gap-2 mt-6">
      <ActionPill
        icon={isPlaying ? <Stop size={13} weight="fill" /> : <Play size={13} weight="fill" />}
        label={isPlaying ? 'Stop' : 'Play'}
        onClick={() => (isPlaying ? onStop() : onPlay(line))}
        active={isPlaying}
      />
      <ActionPill
        icon={<BookmarkSimple size={13} weight={isBookmarked ? 'fill' : 'regular'} />}
        label={isBookmarked ? 'Saved' : 'Save'}
        onClick={() => onBookmark(line)}
        active={isBookmarked}
      />
      <ActionPill
        icon={<MagnifyingGlass size={13} />}
        label="Search"
        onClick={() => {
          const q = (line.translation ?? '').replace(/<[^>]+>/g, '').trim().slice(0, 200);
          navigate(`/quran/search${q ? `?q=${encodeURIComponent(q)}` : ''}`);
        }}
      />
      <ActionPill
        icon={<ChatCircle size={13} />}
        label="Tafsir"
        onClick={() => onSelectAyah(line.verseKey)}
      />
    </div>
  );
}

function ActionPill({
  icon,
  label,
  onClick,
  active,
}: { icon: React.ReactNode; label: string; onClick: () => void; active?: boolean }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors',
        active
          ? 'bg-[#D4A853]/20 text-[#D4A853] border border-[#D4A853]/40'
          : 'bg-white/5 text-white/70 border border-white/10 hover:bg-white/10',
      )}
    >
      {icon}
      {label}
    </button>
  );
}
