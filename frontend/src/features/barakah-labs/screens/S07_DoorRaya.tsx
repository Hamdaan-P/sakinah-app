/**
 * S07_DoorRaya — chat with Raya from a door (Trials / Fear / Dua / Action).
 *
 * Modelled on S14_TafakkurRaya (the reference Raya-handoff screen). The user
 * already wrote their reflection in S06; this screen:
 *   1. Shows the reflection as a soft context card at the top (so it isn't lost).
 *   2. On mount, primes the chat with `door_handoff = { door, reflection, guidance_mode, heart_state }`
 *      and hides the user-side bubble — Raya speaks first.
 *   3. Subsequent turns are normal user→Raya bubbles.
 *
 * Door → guidance_mode mapping (drives Raya's response shape):
 *   trials  → no mode (generic door-handoff opener)
 *   fear    → 'fear'    (Quran + Hadith + Seerah + practical step)
 *   dua     → 'dua'     (suggest a relevant dua + offer reminder)
 *   action  → 'action'  (suggest 2-3 concrete actions + offer reminder)
 *
 * Heavy-heart overlay: if the user's current heart-check-in is 'heavy',
 * the heart_state flag is sent. The prompt-builder layers a Quran+Hadith+Seerah
 * anchoring on top of whatever the door normally does.
 *
 * Reminder UX (dua + action only): when Raya's response contains an offer to
 * set a reminder, a "Set a reminder" pill surfaces below the chat. Wired to
 * the local notification scheduler — native-only v1 (web shows "available on
 * mobile"). See task #11 / scheduleUserReminder.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { useBarakahFlow, type Door, type Heart } from '../stores/barakah-flow.store';
import { useAuthStore } from '@/core/stores/auth.store';
import { BackHeader } from '../components/Greet';
import { SendIcon } from '../components/icons';
import {
  chatWithRaya,
  type RayaDoorHandoff,
  type RayaGuidanceMode,
} from '../services/rayaService';
import { ReminderOffer } from '../components/ReminderOffer';

type Bubble = {
  id: string;
  who: 'them' | 'you';
  text: string;
};

function newId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

const DOOR_TO_GUIDANCE: Partial<Record<Door, RayaGuidanceMode>> = {
  fear: 'fear',
  dua: 'dua',
  action: 'action',
  // 'trials' has no guidance_mode → generic door-handoff opener.
};

const DOOR_DISPLAY: Record<Door, string> = {
  trials: 'Trials',
  tohfa: 'Tohfa',
  fear: 'Fear',
  dua: 'Dua',
  silence: 'Silence',
  action: 'Action',
};

/** Light heuristic — does Raya's last reply look like she offered a reminder?
 *  Keeps the UI honest without parsing structured output. Only used for the
 *  Dua / Action doors where the prompt explicitly asks her to offer one. */
function looksLikeReminderOffer(text: string): boolean {
  const t = text.toLowerCase();
  return /remind/.test(t) && /(you|me)/.test(t);
}

export function S07_DoorRaya() {
  const door = useBarakahFlow((s) => s.door);
  const noticing = useBarakahFlow((s) => s.noticing);
  const reflection = useBarakahFlow((s) => s.doorReflection);
  const heart: Heart | null = useBarakahFlow((s) => s.heart);
  const user = useAuthStore((s) => s.user);
  const uid = user?.id;
  const userName = user?.displayName || user?.email?.split('@')[0] || undefined;

  const sessionId = useMemo(
    () => `door-${door ?? 'unknown'}-${uid ?? 'anon'}-${Date.now()}`,
    [door, uid],
  );

  const [messages, setMessages] = useState<Bubble[]>([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seededRef = useRef<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom as new messages arrive.
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, sending]);

  // First-turn handoff. Sends the reflection verbatim as `message` + the
  // structured `door_handoff` (with door, guidance_mode, heart_state, reflection)
  // so Raya opens already knowing what door + what state the user is in.
  // The user-side bubble for this primer turn is NOT rendered — Raya speaks first.
  useEffect(() => {
    if (seededRef.current) return;
    if (!uid || !door) return;
    seededRef.current = true;

    const reflectionText = reflection.trim();
    const anchorMessage = reflectionText || '(walked through this door without writing)';

    const handoff: RayaDoorHandoff = {
      door,
      reflection: reflectionText,
    };
    const guidance = DOOR_TO_GUIDANCE[door];
    if (guidance) handoff.guidance_mode = guidance;
    if (heart === 'heavy') handoff.heart_state = 'heavy';

    setSending(true);
    setError(null);
    chatWithRaya(uid, sessionId, anchorMessage, userName, { door_handoff: handoff })
      .then((res) => {
        setMessages([{ id: newId(), who: 'them', text: res.response }]);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Could not reach Raya');
      })
      .finally(() => setSending(false));
  }, [uid, sessionId, reflection, userName, door, heart]);

  const send = async () => {
    const text = draft.trim();
    if (!text || sending || !uid) return;
    const userMsg: Bubble = { id: newId(), who: 'you', text };
    setMessages((m) => [...m, userMsg]);
    setDraft('');
    setSending(true);
    setError(null);
    try {
      const res = await chatWithRaya(uid, sessionId, text, userName);
      setMessages((m) => [...m, { id: newId(), who: 'them', text: res.response }]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Could not reach Raya');
    } finally {
      setSending(false);
    }
  };

  // Bail-out: no door selected. Send the user back to S05.
  if (!door) {
    return (
      <div className="bk-screen bk-taf-raya">
        <BackHeader to="s05" />
        <div className="bk-taf-raya-context" style={{ borderLeftColor: 'var(--bk-rose, #C97A6B)' }}>
          <div className="l">No door selected</div>
          <div className="t">Pick a door first, then come back to talk with Raya about it.</div>
        </div>
      </div>
    );
  }

  // Show reminder offer only for dua / action doors, only when Raya's last
  // reply looks like she invited a reminder, only when the chat isn't busy.
  const supportsReminder = door === 'dua' || door === 'action';
  const lastRaya = [...messages].reverse().find((m) => m.who === 'them');
  const offerReminder =
    supportsReminder && !sending && lastRaya != null && looksLikeReminderOffer(lastRaya.text);

  const doorLabel = DOOR_DISPLAY[door];

  return (
    <div className="bk-screen bk-taf-raya">
      <BackHeader
        to="s06"
        center={<div className="bk-compose-step">Raya · door of {doorLabel}</div>}
      />

      {reflection.trim() ? (
        <div className="bk-taf-raya-context">
          <div className="l">Your reflection · door of {doorLabel}</div>
          <div className="t">
            &quot;{reflection.trim().slice(0, 240)}{reflection.length > 240 ? '…' : ''}&quot;
          </div>
        </div>
      ) : noticing.trim() ? (
        <div className="bk-taf-raya-context">
          <div className="l">Your noticing · door of {doorLabel}</div>
          <div className="t">
            &quot;{noticing.trim().slice(0, 240)}{noticing.length > 240 ? '…' : ''}&quot;
          </div>
        </div>
      ) : null}

      <div className="bk-raya-chat" ref={scrollRef}>
        {messages.length === 0 && !sending && !error ? (
          <div className="bk-raya-bubble them">
            One moment — Raya is reading.
          </div>
        ) : null}
        {messages.map((m) => (
          <div key={m.id} className={`bk-raya-bubble ${m.who}`}>
            {m.text.split('\n').map((line, i) => (
              <span key={i}>
                {line}
                {i < m.text.split('\n').length - 1 ? <br /> : null}
              </span>
            ))}
          </div>
        ))}
        {sending ? (
          <div className="bk-raya-bubble them bk-raya-typing">
            <span className="dot" /><span className="dot" /><span className="dot" />
          </div>
        ) : null}
        {error ? (
          <div
            className="bk-raya-bubble them"
            style={{ color: 'var(--bk-rose)', borderColor: 'rgba(201,122,107,0.3)' }}
          >
            {error}
          </div>
        ) : null}
      </div>

      {offerReminder && lastRaya ? (
        <ReminderOffer
          door={door}
          contextText={lastRaya.text}
          reflection={reflection}
        />
      ) : null}

      <div className="bk-raya-input">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={sending ? 'Raya is reflecting…' : 'Write to Raya...'}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void send();
          }}
          disabled={sending}
        />
        <button
          className="bk-raya-send"
          onClick={() => void send()}
          aria-label="Send to Raya"
          disabled={sending || !draft.trim()}
        >
          <SendIcon />
        </button>
      </div>
    </div>
  );
}
