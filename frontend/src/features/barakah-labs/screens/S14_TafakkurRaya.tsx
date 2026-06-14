import { useEffect, useMemo, useRef, useState } from 'react';
import { useBarakahFlow } from '../stores/barakah-flow.store';
import { useAuthStore } from '@/core/stores/auth.store';
import { BackHeader } from '../components/Greet';
import { SendIcon } from '../components/icons';
import { chatWithRaya } from '../services/rayaService';

type Bubble = {
  id: string;
  who: 'them' | 'you';
  text: string;
};

function newId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function S14_TafakkurRaya() {
  const reflection = useBarakahFlow((s) => s.tafReflection);
  const tafSessionId = useBarakahFlow((s) => s.tafSessionId);
  const user = useAuthStore((s) => s.user);
  const uid = user?.id;
  const userName = user?.displayName || user?.email?.split('@')[0] || undefined;

  // Session id ties this entire conversation together on the backend.
  // Using the tafakkur session id when available means each tafakkur
  // sit gets its own threaded conversation in chat history.
  const sessionId = useMemo(
    () => tafSessionId ?? `tafakkur-${uid ?? 'anon'}-${Date.now()}`,
    [tafSessionId, uid],
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

  // First-turn handoff: send the reflection as STRUCTURED CONTEXT, not as
  // a templated user message. The backend prompt builder reads the
  // `door_handoff` block and instructs Raya to open the conversation
  // already recognizing what the user sat with — no "what would you like
  // to talk about" prompts. The reflection is shown to the user as the
  // soft context card at the top of the screen, so it isn't lost from
  // their view. Raya's response becomes visually the FIRST thing said.
  useEffect(() => {
    if (seededRef.current) return;
    if (!uid) return;
    seededRef.current = true;

    const reflectionText = reflection.trim();

    // The /chat endpoint requires `message` (min_length=1). If the user
    // wrote a reflection, that IS the message — and door_handoff repeats
    // it as structured context so the prompt can quote it back. If they
    // wrote nothing, we send a minimal anchor and let the empty-reflection
    // branch in the prompt builder handle it.
    const anchorMessage = reflectionText || '(sat in silence)';

    setSending(true);
    setError(null);
    chatWithRaya(uid, sessionId, anchorMessage, userName, {
      door_handoff: {
        door: 'tafakkur',
        reflection: reflectionText,
      },
    })
      .then((res) => {
        setMessages([{ id: newId(), who: 'them', text: res.response }]);
      })
      .catch((e: unknown) => {
        setError(e instanceof Error ? e.message : 'Could not reach Raya');
      })
      .finally(() => setSending(false));
  }, [uid, sessionId, reflection, userName]);

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

  return (
    <div className="bk-screen bk-taf-raya">
      <BackHeader to="s13" center={<div className="bk-compose-step">Conversing with Raya</div>} />

      {reflection.trim() ? (
        <div className="bk-taf-raya-context">
          <div className="l">From your Tafakkur · just now</div>
          <div className="t">
            &quot;{reflection.trim().slice(0, 220)}{reflection.length > 220 ? '…' : ''}&quot;
          </div>
        </div>
      ) : null}

      <div className="bk-raya-chat" ref={scrollRef}>
        {messages.length === 0 && !sending ? (
          <div className="bk-raya-bubble them">
            I&apos;m here. Take your time. What in your reflection wants to be said out loud?
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
          <div className="bk-raya-bubble them" style={{ color: 'var(--bk-rose)', borderColor: 'rgba(201,122,107,0.3)' }}>
            {error}
          </div>
        ) : null}
      </div>

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
