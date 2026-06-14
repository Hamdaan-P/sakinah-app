import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '@/core/stores/auth.store';
import { loadConnections } from '../services/connectionsHelper';
import { addMembersByOwner } from '../services/circleService';
import type { Recipient } from '../stores/barakah-flow.store';

type Props = {
  open: boolean;
  circleId: string | null;
  existingMemberUids: Set<string>;
  onClose: () => void;
  onInvited?: (added: number) => void;
};

export function InviteMembersModal({
  open,
  circleId,
  existingMemberUids,
  onClose,
  onInvited,
}: Props) {
  const uid = useAuthStore((s) => s.user?.id);
  const [contacts, setContacts] = useState<Recipient[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !uid) return;
    let alive = true;
    setLoading(true);
    setError(null);
    void loadConnections(uid)
      .then((rs) => {
        if (alive) setContacts(rs);
      })
      .catch(() => {
        if (alive) setError('Could not load your connections.');
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [open, uid]);

  const available = useMemo(
    () => contacts.filter((c) => !existingMemberUids.has(c.id)),
    [contacts, existingMemberUids],
  );

  if (!open) return null;

  const toggle = (id: string) => {
    setSelected((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const submit = async () => {
    if (!circleId || selected.size === 0 || submitting) return;
    setSubmitting(true);
    setError(null);
    try {
      const invitees = available
        .filter((c) => selected.has(c.id))
        .map((c) => ({ uid: c.id, displayName: c.name }));
      const result = await addMembersByOwner(circleId, invitees);
      onInvited?.(result.added);
      setSelected(new Set());
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not invite — try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bk-modal-backdrop" onClick={onClose} role="presentation">
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="bk-modal bk-modal-wide"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bk-invite-title"
      >
        <div className="bk-modal-eyebrow">Invite to this circle</div>
        <div id="bk-invite-title" className="bk-modal-title">
          Who would you like to bring in?
        </div>
        <div className="bk-modal-sub">
          They'll be added quietly — no notification storm, just a new circle in their list.
        </div>

        <div className="bk-invite-list">
          {loading ? (
            <div className="bk-invite-empty">Loading your connections…</div>
          ) : available.length === 0 ? (
            <div className="bk-invite-empty">
              {contacts.length === 0
                ? 'You have no connections yet. Add some from the Connections page first.'
                : 'Everyone in your connections is already a member.'}
            </div>
          ) : (
            available.map((c) => {
              const on = selected.has(c.id);
              return (
                <button
                  key={c.id}
                  type="button"
                  className={`bk-invite-row ${on ? 'on' : ''}`}
                  onClick={() => toggle(c.id)}
                >
                  <div className="bk-invite-avatar">{c.name[0]?.toUpperCase() ?? '?'}</div>
                  <div className="bk-invite-meta">
                    <div className="bk-invite-name">{c.name}</div>
                    {c.role ? <div className="bk-invite-role">{c.role}</div> : null}
                  </div>
                  <div className={`bk-invite-check ${on ? 'on' : ''}`}>
                    {on ? '✓' : ''}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {error ? <div className="bk-modal-error">{error}</div> : null}

        <div className="bk-modal-actions">
          <button className="bk-modal-cancel" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="bk-modal-confirm"
            onClick={() => void submit()}
            disabled={submitting || selected.size === 0}
          >
            {submitting
              ? 'Inviting…'
              : selected.size === 0
                ? 'Pick someone above'
                : `Invite ${selected.size}`}
          </button>
        </div>
      </div>
    </div>
  );
}
