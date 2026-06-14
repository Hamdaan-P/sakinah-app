/**
 * S06_DoorActive — generic "you walked through a door" screen.
 *
 * Two modes, selected by the door key in the flow store:
 *
 *   1. EXTRAPOLATE mode (Trials, Fear, Dua, Action)
 *      Soft context card with the noticing → textarea for deeper reflection
 *      → three actions: Save private | Share public | Talk to Raya.
 *
 *   2. TOHFA mode (Tohfa)
 *      Soft context card with the noticing → recipient picker → two
 *      actions: Continue (go to S09 compose) | Just rest with it.
 *
 * Silence skips this screen entirely; S05 routes silence → S11 directly.
 */
import { useEffect, useState } from 'react';
import { useBarakahFlow, type Door, type Recipient } from '../stores/barakah-flow.store';
import { BackHeader } from '../components/Greet';
import { useAuthStore } from '@/core/stores/auth.store';
import { loadConnections } from '../services/connectionsHelper';
import * as barka from '@/features/barka-labs/services/barkaLabsService';

interface DoorConfig {
  eyebrow: string;
  prompt: string;
  placeholder: string;
  /** Prefix prepended to the blessing text when saved to trail / shared.
   *  Identifies which door the reflection came from in the user's feed. */
  tag: string;
}

const EXTRAPOLATE_DOORS: Record<Exclude<Door, 'tohfa' | 'silence'>, DoorConfig> = {
  trials: {
    eyebrow: 'Door · Into trials',
    prompt: "What did this remind you of from a harder chapter?",
    placeholder: 'A time you carried something. What it taught you. What it asks of you now.',
    tag: 'Trials',
  },
  fear: {
    eyebrow: 'Door · Into fear',
    prompt: "What would you miss if this were gone?",
    placeholder: 'Name the fear underneath. The thing you would lose. The story it tells you about yourself.',
    tag: 'Fear',
  },
  dua: {
    eyebrow: 'Door · Into dua',
    prompt: "What do you ask of Allah, right now, from this noticing?",
    placeholder: 'A whisper. A plea. A thank-you. Anything you would say to Him about this moment.',
    tag: 'Dua',
  },
  action: {
    eyebrow: 'Door · Into action',
    prompt: "What small thing does this ask of you?",
    placeholder: 'One concrete thing — small enough to do today. A message to send. A salah to pray. A person to call.',
    tag: 'Action',
  },
};

export function S06_DoorActive() {
  const go = useBarakahFlow((s) => s.go);
  const door = useBarakahFlow((s) => s.door);
  const noticing = useBarakahFlow((s) => s.noticing);
  const doorReflection = useBarakahFlow((s) => s.doorReflection);
  const setDoorReflection = useBarakahFlow((s) => s.setDoorReflection);
  const recipient = useBarakahFlow((s) => s.tohfaRecipient);
  const setRecipient = useBarakahFlow((s) => s.setTohfaRecipient);
  const user = useAuthStore((s) => s.user);

  const [contacts, setContacts] = useState<Recipient[]>([]);
  const [saving, setSaving] = useState<null | 'private' | 'public'>(null);

  // Load connections only when in Tohfa mode.
  useEffect(() => {
    if (door !== 'tohfa' || !user?.id) return;
    let alive = true;
    void loadConnections(user.id).then((rs) => {
      if (!alive) return;
      setContacts(rs.filter((r) => r.id !== user.id));
    });
    return () => { alive = false; };
  }, [door, user?.id]);

  // Bail-out: no door selected, or unknown door. Send the user back to S05.
  if (!door) {
    return (
      <div className="bk-screen">
        <BackHeader to="s05" />
        <div className="bk-door-active">
          <div className="bk-door-active-eyebrow">No door selected</div>
          <div className="bk-door-active-q">Pick a door first.</div>
          <button className="bk-compose-add" onClick={() => go('s05')}>Back to doors</button>
        </div>
      </div>
    );
  }

  // ─── TOHFA mode ──────────────────────────────────────────────────────
  if (door === 'tohfa') {
    return (
      <div className="bk-screen">
        <BackHeader to="s05" />
        <div className="bk-door-active">
          <div className="bk-door-active-eyebrow">Door · Into tohfa</div>
          <div className="bk-door-active-q">"Who is this noticing really about?"</div>

          {noticing.trim() ? (
            <div className="bk-selected-context">
              <div className="lbl">Your noticing</div>
              <div className="txt">{noticing.trim()}</div>
            </div>
          ) : null}

          <div className="bk-contact-pick">
            <div className="label">
              {contacts.length ? 'Someone you’re connected to' : 'No connections yet — keep it private below'}
            </div>
            <div className="bk-contact-row">
              {contacts.slice(0, 8).map((c) => (
                <button
                  key={c.id}
                  className={`bk-contact-pill ${recipient?.id === c.id ? 'selected' : ''}`}
                  onClick={() => setRecipient(c)}
                >
                  <span className="avatar">{c.name[0]?.toUpperCase() ?? '?'}</span>
                  {c.name}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="bk-compose-actions">
          <button className="bk-compose-cancel" onClick={() => go('s01')}>Just rest with it</button>
          <button
            className="bk-compose-add"
            onClick={() => go('s09')}
            disabled={!recipient}
          >
            Continue →
          </button>
        </div>
      </div>
    );
  }

  // ─── EXTRAPOLATE mode (Trials / Fear / Dua / Action) ────────────────
  const cfg = EXTRAPOLATE_DOORS[door as Exclude<Door, 'tohfa' | 'silence'>];
  if (!cfg) {
    // Unknown door (e.g. silence reached here by mistake) — bail to S05.
    return (
      <div className="bk-screen">
        <BackHeader to="s05" />
        <div className="bk-door-active">
          <div className="bk-door-active-eyebrow">Unknown door</div>
          <button className="bk-compose-add" onClick={() => go('s05')}>Back to doors</button>
        </div>
      </div>
    );
  }

  const canSubmit = doorReflection.trim().length > 0;

  const logDoorBlessing = async (isPublic: boolean): Promise<boolean> => {
    if (!user?.id || !canSubmit) return false;
    const tagged = `[${cfg.tag}] ${doorReflection.trim()}`;
    try {
      await barka.logBlessing(user.id, tagged, isPublic);
      return true;
    } catch {
      // Best-effort: surface a soft alert but don't block navigation —
      // the user has already invested in writing the reflection.
      return false;
    }
  };

  const handleSavePrivate = async () => {
    if (!canSubmit || saving) return;
    setSaving('private');
    await logDoorBlessing(false);
    setSaving(null);
    go('s16'); // Trail / Yours
  };

  const handleSharePublic = async () => {
    if (!canSubmit || saving) return;
    setSaving('public');
    await logDoorBlessing(true);
    setSaving(null);
    go('s17'); // Trail / Companions
  };

  const handleTalkToRaya = () => {
    if (!canSubmit) return;
    // doorReflection is already in the store; S07 reads it and the door
    // key + heart_state from the same store, builds the door_handoff,
    // and opens the Raya chat.
    go('s07');
  };

  return (
    <div className="bk-screen">
      <BackHeader to="s05" />
      <div className="bk-door-active">
        <div className="bk-door-active-eyebrow">{cfg.eyebrow}</div>
        <div className="bk-door-active-q">&ldquo;{cfg.prompt}&rdquo;</div>

        {noticing.trim() ? (
          <div className="bk-selected-context">
            <div className="lbl">Your noticing</div>
            <div className="txt">{noticing.trim()}</div>
          </div>
        ) : null}

        <div className="bk-door-extrapolate">
          <textarea
            className="bk-door-extrapolate-input"
            value={doorReflection}
            onChange={(e) => setDoorReflection(e.target.value)}
            placeholder={cfg.placeholder}
            maxLength={2000}
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
            rows={5}
          />
        </div>
      </div>

      <div className="bk-door-actions-row">
        <button
          type="button"
          className="bk-door-action bk-door-action-private"
          onClick={() => void handleSavePrivate()}
          disabled={!canSubmit || !!saving}
        >
          {saving === 'private' ? 'Saving…' : 'Save to trail'}
          <span className="bk-door-action-sub">private · only you</span>
        </button>
        <button
          type="button"
          className="bk-door-action bk-door-action-public"
          onClick={() => void handleSharePublic()}
          disabled={!canSubmit || !!saving}
        >
          {saving === 'public' ? 'Sharing…' : 'Share to community'}
          <span className="bk-door-action-sub">anonymous · in the feed</span>
        </button>
        <button
          type="button"
          className="bk-door-action bk-door-action-raya"
          onClick={handleTalkToRaya}
          disabled={!canSubmit || !!saving}
        >
          Talk to Raya →
          <span className="bk-door-action-sub">she&apos;ll meet you at this door</span>
        </button>
      </div>

      <div className="bk-compose-helper">
        {canSubmit
          ? 'A few words is enough.'
          : 'Write a little — even one sentence — to unlock the actions below.'}
      </div>
    </div>
  );
}
