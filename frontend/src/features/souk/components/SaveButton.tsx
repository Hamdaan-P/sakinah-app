import { useEffect, useState } from 'react';
import { BookmarkSimple } from '@phosphor-icons/react';
import { isSaved, subscribeSavedChanges, toggleSave } from '../services/soukSaveService';

interface Props {
  listingId: string;
  variant?: 'icon' | 'pill';
  className?: string;
}

export function SaveButton({ listingId, variant = 'icon', className = '' }: Props) {
  const [saved, setSaved] = useState(() => isSaved(listingId));
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setSaved(isSaved(listingId));
    return subscribeSavedChanges(() => setSaved(isSaved(listingId)));
  }, [listingId]);

  async function onClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (busy) return;
    setBusy(true);
    try {
      const next = await toggleSave(listingId);
      setSaved(next);
    } finally {
      setBusy(false);
    }
  }

  if (variant === 'pill') {
    return (
      <button
        onClick={onClick}
        disabled={busy}
        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
          saved
            ? 'bg-[#D7B56A]/20 text-[#D7B56A] border border-[#D7B56A]/40'
            : 'bg-[#2C3C55] text-[#D5DDEA] border border-[rgba(215,181,106,0.2)] hover:border-[#D7B56A]/40'
        } ${className}`}
      >
        <BookmarkSimple size={13} weight={saved ? 'fill' : 'regular'} />
        {saved ? 'Saved' : 'Save'}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      disabled={busy}
      aria-label={saved ? 'Remove from saved' : 'Save listing'}
      className={`p-2 rounded-full bg-black/40 backdrop-blur-sm transition-colors ${
        saved ? 'text-[#D7B56A]' : 'text-white/80 hover:text-white'
      } ${className}`}
    >
      <BookmarkSimple size={16} weight={saved ? 'fill' : 'regular'} />
    </button>
  );
}
