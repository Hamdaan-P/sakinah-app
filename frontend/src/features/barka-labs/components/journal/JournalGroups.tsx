/**
 * JournalGroups — renders the date-grouped list of journal entries, switching
 * between the user's own cards and community cards per-group.
 */

import { Sparkle } from '@phosphor-icons/react';
import { C } from '../../barka-labs.constants';
import type { Blessing, PublicBlessing, CommunityComment } from '../../types/barka-labs.types';
import { CommunityCard } from './CommunityCard';
import { BlessingEntryCard } from './BlessingEntryCard';
import { SourceChip } from '../common/SourceChip';

export interface JournalGroup {
  label: string;
  items: Blessing[] | PublicBlessing[];
  isOthers?: boolean;
}

interface JournalGroupsProps {
  groups: JournalGroup[];
  hoveredId: string | null;
  setHoveredId: (id: string | null) => void;
  onDelete: (id: string) => void;
  onDecompose: (id: string) => void;
  communityComments: Record<string, CommunityComment[]>;
  communityCommentsLoading: Record<string, boolean>;
  toggleLike: (id: string) => void;
  fetchComments: (id: string) => void;
  addComment: (id: string, text: string, parentId?: string) => void;
}

export function JournalGroups({
  groups, hoveredId, setHoveredId, onDelete, onDecompose,
  communityComments, communityCommentsLoading, toggleLike, fetchComments, addComment,
}: JournalGroupsProps) {
  if (groups.length === 0) {
    return (
      <div className="text-center py-10" style={{ color: '#A7B1C0' }}>
        <Sparkle size={32} weight="duotone" className="mx-auto mb-2" style={{ color: '#D7B56A' }} />
        <p className="text-sm">No blessings found. Start logging your gratitude!</p>
      </div>
    );
  }

  return (
    <>
      {groups.map((group) => (
        <div key={group.label} className="mb-6">
          {/* Section header — leads with the source chip so it's the first thing the eye lands on */}
          <div className="flex items-center gap-2.5 mb-3">
            <span className="uppercase text-xs tracking-wider font-semibold whitespace-nowrap flex items-center" style={{ color: '#A7B1C0' }}>
              <SourceChip kind={group.isOthers ? 'others' : 'yours'} />
              {group.label}
            </span>
            <div className="flex-1 h-px" style={{ background: C.cardB }} />
            <span className="text-[11px]" style={{ color: '#A7B1C0' }}>
              {group.isOthers ? `${group.items.length} from the community` : `${group.items.length} entries`}
            </span>
          </div>

          {/* Cards — each one carries its own source chip in the top-left so the
              row's origin is obvious even when scrolling past the section header. */}
          <div className="flex flex-col gap-3">
            {group.isOthers
              ? (group.items as unknown as PublicBlessing[]).map((b) => (
                  <div key={b.id} className="relative">
                    <div className="absolute top-2 left-3 z-10 pointer-events-none">
                      <SourceChip kind="others" />
                    </div>
                    <CommunityCard
                      blessing={b}
                      onLike={toggleLike}
                      comments={communityComments[b.id] || []}
                      commentsLoading={communityCommentsLoading[b.id] || false}
                      onFetchComments={fetchComments}
                      onAddComment={addComment}
                    />
                  </div>
                ))
              : (group.items as Blessing[]).map((b) => (
                  <div key={b.id} className="relative">
                    <div className="absolute top-2 left-3 z-10 pointer-events-none">
                      <SourceChip kind="yours" />
                    </div>
                    <BlessingEntryCard
                      blessing={b}
                      isHovered={hoveredId === b.id}
                      onHoverIn={() => setHoveredId(b.id)}
                      onHoverOut={() => setHoveredId(null)}
                      onDelete={onDelete}
                      onDecompose={onDecompose}
                    />
                  </div>
                ))
            }
          </div>
        </div>
      ))}
    </>
  );
}
