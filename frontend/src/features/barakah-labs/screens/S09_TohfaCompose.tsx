/**
 * S09_TohfaCompose — write the Tohfa letter and ship it.
 *
 * Redesigned 2026-05-23: S08_TohfaOffer was deleted; its "Keep it private"
 * option now lives here next to "Send Tohfa". One screen, two clear paths.
 *
 *   - Send Tohfa  → creates the /tohfas doc for the recipient, returns to S01.
 *   - Keep private → logs the letter as a private blessing (tagged [Tohfa])
 *                    in the user's own trail, returns to S16 so they can see
 *                    it land. No Tohfa is sent to anyone.
 */
import { useEffect, useState } from 'react';
import { useBarakahFlow } from '../stores/barakah-flow.store';
import { useAuthStore } from '@/core/stores/auth.store';
import { BackHeader } from '../components/Greet';
import { sendTohfa } from '../services/tohfaService';
import * as barka from '@/features/barka-labs/services/barkaLabsService';

function defaultDraft(name: string, fromMe: string): string {
  return `${name} —\n\nI was thinking about you today. I wanted to say it before the moment passed.\n\n— ${fromMe}`;
}

function firstName(displayName: string | undefined, email: string | undefined): string {
  if (displayName?.trim()) return displayName.trim().split(/\s+/)[0];
  if (email) return email.split('@')[0];
  return 'me';
}

export function S09_TohfaCompose() {
  const go = useBarakahFlow((s) => s.go);
  const recipient = useBarakahFlow((s) => s.tohfaRecipient);
  const noticing = useBarakahFlow((s) => s.noticing);
  const letter = useBarakahFlow((s) => s.tohfaLetter);
  const setLetter = useBarakahFlow((s) => s.setTohfaLetter);
  const user = useAuthStore((s) => s.user);
  const me = firstName(user?.displayName, user?.email);

  const [busy, setBusy] = useState<null | 'send' | 'keep'>(null);

  useEffect(() => {
    if (!letter && recipient) setLetter(defaultDraft(recipient.name, me));
    // we only want to seed once when entering this screen
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit = letter.trim().length > 0;

  const send = async () => {
    if (!recipient || !user?.id || !canSubmit || busy) return;
    if (recipient.id === user.id) {
      alert("A Tohfa is a gift to someone else — you can't send one to yourself.");
      return;
    }
    setBusy('send');
    try {
      await sendTohfa(user.id, recipient.id, noticing, letter);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to send Tohfa.';
      alert(message);
      setBusy(null);
      return;
    }
    setBusy(null);
    go('s01');
  };

  const keepPrivate = async () => {
    if (!user?.id || !canSubmit || busy) return;
    setBusy('keep');
    try {
      // Land it in the private trail as a Tohfa-tagged blessing — same
      // tagging pattern as the door reflections ([Trials], [Fear] etc.).
      // No recipient name in the prefix — the body of the letter already
      // contains the salutation if the user wrote one, and "[Tohfa (kept
      // from X)]" read ambiguously as withheld-from rather than kept-for.
      const tagged = `[Tohfa] ${letter.trim()}`;
      await barka.logBlessing(user.id, tagged, false);
    } catch {
      /* swallow — user already wrote the letter; don't punish them with an error */
    } finally {
      setBusy(null);
      go('s16'); // Trail / Yours — they see the new entry land
    }
  };

  return (
    <div className="bk-screen">
      <BackHeader
        to="s06"
        center={
          <div className="bk-h-compose-to">
            To · <span>{recipient?.name ?? '—'}</span>
          </div>
        }
      />
      <div className="bk-h-compose-body">
        {noticing.trim() ? (
          <div className="bk-h-from-noticing">
            <div className="l">Your noticing</div>
            <div className="t">{noticing.trim()}</div>
          </div>
        ) : null}
        <div className="bk-h-letter-area">
          <textarea
            value={letter}
            onChange={(e) => setLetter(e.target.value)}
            placeholder="Write a quiet letter…"
            // eslint-disable-next-line jsx-a11y/no-autofocus
            autoFocus
          />
        </div>
      </div>
      <div className="bk-tohfa-actions-row">
        <button
          type="button"
          className="bk-door-action bk-door-action-private"
          onClick={() => void keepPrivate()}
          disabled={busy !== null || !canSubmit}
        >
          {busy === 'keep' ? 'Keeping…' : 'Keep it private'}
          <span className="bk-door-action-sub">save to trail · no Tohfa sent</span>
        </button>
        <button
          type="button"
          className="bk-door-action bk-door-action-raya"
          onClick={() => void send()}
          disabled={busy !== null || !canSubmit || !recipient}
        >
          {busy === 'send' ? 'Sending…' : 'Send Tohfa →'}
          <span className="bk-door-action-sub">
            {recipient ? `to ${recipient.name}` : 'pick a recipient first'}
          </span>
        </button>
      </div>
      <div className="bk-compose-helper">No read-receipt. No reply expected. A gift, either way.</div>
    </div>
  );
}
