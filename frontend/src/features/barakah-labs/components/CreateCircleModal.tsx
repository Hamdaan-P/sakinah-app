import { useState } from 'react';
import { useAuthStore } from '@/core/stores/auth.store';
import { createCircle } from '../services/circleService';

function firstName(displayName?: string, email?: string): string {
  if (displayName?.trim()) return displayName.trim().split(/\s+/)[0];
  if (email) return email.split('@')[0];
  return 'You';
}

type Props = {
  open: boolean;
  onClose: () => void;
  onCreated?: (circleId: string) => void;
};

export function CreateCircleModal({ open, onClose, onCreated }: Props) {
  const user = useAuthStore((s) => s.user);
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const submit = async () => {
    setError(null);
    const trimmed = name.trim();
    if (!trimmed) {
      setError('Give your circle a name.');
      return;
    }
    if (!user?.id) {
      setError('You need to be signed in.');
      return;
    }
    setSubmitting(true);
    try {
      const ownerName = firstName(user.displayName, user.email);
      const id = await createCircle(user.id, ownerName, trimmed);
      setName('');
      onCreated?.(id);
      onClose();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not create circle.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bk-modal-backdrop" onClick={onClose} role="presentation">
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions */}
      <div
        className="bk-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="bk-create-circle-title"
      >
        <div className="bk-modal-eyebrow">A new circle</div>
        <div id="bk-create-circle-title" className="bk-modal-title">
          What will this circle be called?
        </div>
        <div className="bk-modal-sub">
          A small private space for shared noticings. Only the people you invite will see it.
        </div>

        <input
          className="bk-modal-input"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Maghrib reflections"
          maxLength={80}
          // eslint-disable-next-line jsx-a11y/no-autofocus
          autoFocus
          onKeyDown={(e) => {
            if (e.key === 'Enter') void submit();
          }}
          disabled={submitting}
        />

        {error ? <div className="bk-modal-error">{error}</div> : null}

        <div className="bk-modal-actions">
          <button className="bk-modal-cancel" onClick={onClose} disabled={submitting}>
            Cancel
          </button>
          <button
            className="bk-modal-confirm"
            onClick={() => void submit()}
            disabled={submitting || !name.trim()}
          >
            {submitting ? 'Creating…' : 'Create circle'}
          </button>
        </div>

        <div className="bk-modal-fine">
          You'll be the first member. Invite others from the circle's page once it's open.
        </div>
      </div>
    </div>
  );
}
