/**
 * ViewMembersSheet — list every member of a circle.
 *
 * Reached from the avatar row on S18. The avatar row used to only show the
 * first six members + a non-clickable "+N more" indicator; this opens the
 * full list with names so users can see who's actually in the circle on both
 * mobile and desktop.
 *
 * Reuses the existing `bk-modal-*` classes from InviteMembersModal so the
 * styling stays consistent with the rest of Barakah Labs.
 */

import type { CircleMember } from '../services/circleService';

interface Props {
  open: boolean;
  members: CircleMember[];
  meUid: string | null | undefined;
  onClose: () => void;
}

function initialOf(name: string): string {
  return name?.trim()?.[0]?.toUpperCase() ?? '?';
}

export function ViewMembersSheet({ open, members, meUid, onClose }: Props) {
  if (!open) return null;

  const memberCount = members.length;
  const sortedMembers = [...members].sort((a, b) => {
    // Owner first, then alphabetical by display name (case-insensitive).
    if (a.role === 'owner' && b.role !== 'owner') return -1;
    if (b.role === 'owner' && a.role !== 'owner') return 1;
    return (a.displayName ?? '').localeCompare(b.displayName ?? '', undefined, {
      sensitivity: 'base',
    });
  });

  return (
     
    <div className="bk-modal-backdrop" onClick={onClose} role="presentation">
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="bk-modal bk-modal-wide"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bk-members-title"
      >
        <div className="bk-modal-eyebrow">In this circle</div>
        <div id="bk-members-title" className="bk-modal-title">
          {memberCount} {memberCount === 1 ? 'member' : 'members'}
        </div>
        <div className="bk-modal-sub">
          Only people in this circle can read what you share.
        </div>

        <div className="bk-invite-list">
          {sortedMembers.length === 0 ? (
            <div className="bk-invite-empty">No members yet.</div>
          ) : (
            sortedMembers.map((m) => {
              const isMe = !!(meUid && m.uid === meUid);
              const isOwner = m.role === 'owner';
              return (
                <div key={m.uid} className="bk-invite-row" style={{ cursor: 'default' }}>
                  <div className="bk-invite-avatar">{initialOf(m.displayName)}</div>
                  <div className="bk-invite-meta">
                    <div className="bk-invite-name">
                      {m.displayName || 'A companion'}
                      {isMe ? ' (you)' : ''}
                    </div>
                    {isOwner ? <div className="bk-invite-role">Owner</div> : null}
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="bk-modal-actions">
          <button type="button" className="bk-modal-confirm" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
