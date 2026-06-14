/**
 * AyahExtrasPanel
 *
 * Composes the Related Hadith panel + Cross References row for a single
 * verse_key. Wired into QuranReaderContent below the active ayah (focus mode
 * targets focusLine, ayah mode targets the selected verse when present).
 *
 * Kept thin on purpose — the heavy lifting lives in the two child components.
 */

import { RelatedHadithPanel } from './RelatedHadithPanel';
import { CrossReferencesRow } from './CrossReferencesRow';

interface Props {
  verseKey: string;
  onJumpToVerse?: (verseKey: string) => void;
  className?: string;
}

export function AyahExtrasPanel({ verseKey, onJumpToVerse, className }: Props) {
  return (
    <div className={`space-y-4 ${className ?? ''}`}>
      <RelatedHadithPanel verseKey={verseKey} />
      <CrossReferencesRow verseKey={verseKey} onJump={onJumpToVerse} />
    </div>
  );
}
