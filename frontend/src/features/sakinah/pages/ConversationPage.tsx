/**
 * ConversationPage — /sakinah/conversation
 * Stage D · Phase 6: Topic-by-topic guided conversation between Ahmed and Fatima.
 * 8 pre-nikah topics unlock one at a time. No open chat box. No read receipts.
 * No media. No contact info. Intimacy is absent as a topic entirely.
 * Raya guides tone silently. Scholar one tap away.
 * TODO: replace all mock state with sakinahService.getConversation(uid, candidateUid).
 */

import { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';
import { useConversation } from '../hooks';
import { sendMessage } from '../services/sakinahService';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

const TOPICS = [
  'Parents & Family',
  'Work',
  'Friends',
  'Habits',
  'Self-image',
  'Responsibility',
  'Expectations',
  'Finances',
] as const;

// Raya's in-curriculum prompt per topic — speaks directly to Ahmed.
const RAYA_PROMPTS: Record<number, string> = {
  0: 'Family shapes everything we become. Ask Fatima something you genuinely want to know — what home felt like growing up, or what she hopes to carry forward.',
  1: 'Work reveals what we value. Ask Fatima how she thinks about purpose, rhythm, and what a shared life would feel like around it.',
  2: 'The people closest to us reflect who we are. Ask Fatima about someone in her life who shaped her — and how.',
  3: 'Habits are the quiet architecture of a home. Ask Fatima about one she\'s still working on, and one she\'s proud of.',
  4: 'Ask Fatima when she feels most at peace with herself. That answer will tell you a great deal.',
  5: 'Ask Fatima what security means to her — in a home, in a partnership, and in a quiet moment alone.',
  6: 'Ask Fatima what she believes a good marriage asks of each person. Listen carefully.',
  7: 'Ask Fatima how she thinks about money in a shared life — not the numbers, but what it means to her.',
};

// What Raya suggests Ahmed send as his opening — shown in the floating card above input.
const RAYA_OPENING_CARD_TEXT =
  "A gentle way to begin — ask Fatima what home felt like growing up. What made it feel safe, or what she'd want to do differently.";

// The actual message text placed in the input when "Use this opening" is tapped.
const RAYA_OPENING_MESSAGE =
  "What did home feel like for you growing up? What made it feel safe — or is there anything you'd want to do differently?";

type Msg = { from: 'me' | 'her'; text: string };

type TopicState = 'open' | 'now' | 'locked';

// ── Small reusable Raya orb ───────────────────────────────────────────────────
function RayaOrb({ size = 32 }: { size?: number }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: size * 0.47,
        color: '#3a2c0c',
        flexShrink: 0,
      }}
    >
      ر
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export function ConversationPage() {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const { conversation } = useConversation(matchId ?? '');
  const matchName = conversation?.match_name ?? 'Your match';

  const [waliPresent, setWaliPresent]             = useState(false);
  const [rayaCardDismissed, setRayaCardDismissed] = useState(false);
  const [messageInput, setMessageInput]           = useState('');
  const [showToneMod, setShowToneMod]             = useState(false);
  const [toneModDismissed, setToneModDismissed]   = useState(false);
  const [messages, setMessages]                   = useState<Msg[]>([]);

  const textareaRef  = useRef<HTMLTextAreaElement>(null);
  const messagesEnd  = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (conversation?.messages) {
      setMessages(conversation.messages);
    }
  }, [conversation?.messages]);

  // Auto-grow textarea up to 120px.
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [messageInput]);

  // Tone moderation: appears softly after 5+ words, stays dismissed until next send.
  useEffect(() => {
    if (toneModDismissed) return;
    const words = messageInput.trim().split(/\s+/).filter(Boolean).length;
    setShowToneMod(words >= 5);
  }, [messageInput, toneModDismissed]);

  const handleSend = async () => {
    const text = messageInput.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { from: 'me', text }]);
    setMessageInput('');
    setShowToneMod(false);
    setToneModDismissed(false);
    setTimeout(() => messagesEnd.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    if (matchId) {
      await sendMessage(matchId, text);
    }
  };

  const activeTopicIdx = conversation?.matchflow_step ?? 0;
  const showRayaCard   = !rayaCardDismissed && messageInput === '';

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        background: PAGE_BG,
        color: '#EDE7DA',
        fontFamily: "'Manrope', sans-serif",
        WebkitFontSmoothing: 'antialiased',
        overflow: 'hidden',
      }}
    >
      <SakinahSidebar activeItem="communication" />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          style={{
            flexShrink: 0,
            padding: '36px 56px 26px',
            borderBottom: '1px solid rgba(255,255,255,.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="sk-back-btn"
              style={{
                width: 34, height: 34, borderRadius: '50%',
                border: '1px solid rgba(212,168,83,.16)',
                background: 'transparent', color: '#D4A853',
                fontSize: 18, display: 'flex', alignItems: 'center',
                justifyContent: 'center', cursor: 'pointer',
                flexShrink: 0, paddingBottom: 1, lineHeight: 1,
              }}
            >
              ‹
            </button>
            <div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 26, fontWeight: 500, lineHeight: 1.02,
                }}
              >
                Conversation
              </div>
              <div
                style={{
                  fontSize: 11, color: '#5f6675', marginTop: 3,
                  letterSpacing: '0.02em',
                }}
              >
                Phase 6 · with {matchName} · guided by Raya
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ────────────────────────────────────────────── */}
        <div
          className="sk-page-body"
          style={{ flex: 1, overflowY: 'auto', padding: '20px 56px 12px' }}
        >
          <div style={{ maxWidth: 520, width: '100%' }}>

            {/* ── Wali toggle ──────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.04 }}
              style={{ textAlign: 'center', marginBottom: 18 }}
            >
              <button
                onClick={() => setWaliPresent((p) => !p)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 7,
                  fontSize: 11, letterSpacing: '0.01em',
                  color: waliPresent ? '#e7c984' : '#9aa0ac',
                  border: `1px solid ${waliPresent ? 'rgba(212,168,83,.28)' : 'rgba(255,255,255,.08)'}`,
                  borderRadius: 30, padding: '6px 14px',
                  background: waliPresent ? 'rgba(212,168,83,.05)' : 'transparent',
                  cursor: 'pointer', transition: '.22s',
                  fontFamily: "'Manrope', sans-serif",
                }}
              >
                <span style={{ fontSize: 13, lineHeight: 1 }}>⚭</span>
                {waliPresent
                  ? 'Wali present · your brother'
                  : 'Invite your wali to this conversation'}
              </button>
            </motion.div>

            {/* ── Topic curriculum ──────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              style={{
                border: '1px solid rgba(255,255,255,.06)',
                borderRadius: 15, padding: 13, marginBottom: 13,
                background: 'rgba(255,255,255,.012)',
              }}
            >
              <div
                style={{
                  fontSize: 9.5, letterSpacing: '0.24em',
                  textTransform: 'uppercase', color: 'rgba(212,168,83,.5)',
                  marginBottom: 9,
                }}
              >
                Pre-nikah topics · unlock as trust builds
              </div>

              {TOPICS.map((topic, i) => {
                const state: TopicState =
                  i < activeTopicIdx ? 'open' : i === activeTopicIdx ? 'now' : 'locked';
                const icon   = state === 'open' ? '✓' : state === 'now' ? '●' : String(i + 1);
                const status = state === 'open' ? 'Explored' : state === 'now' ? 'Now' : 'Locked';

                return (
                  <motion.div
                    key={topic}
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: state === 'locked' ? 0.4 : 1, x: 0 }}
                    transition={{ duration: 0.28, delay: 0.20 + i * 0.04 }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '7px 0', fontSize: 12.5,
                      color:
                        state === 'open' ? '#EDE7DA'
                        : state === 'now' ? '#e7c984'
                        : '#9aa0ac',
                      cursor: state === 'locked' ? 'default' : 'pointer',
                    }}
                  >
                    <div
                      style={{
                        width: 19, height: 19, borderRadius: '50%',
                        flexShrink: 0, display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: 9,
                        border:
                          state === 'now' ? '1px solid #D4A853'
                          : state === 'open' ? '1px solid transparent'
                          : '1px solid rgba(255,255,255,.06)',
                        background:
                          state === 'open' ? 'rgba(127,176,122,.15)' : 'transparent',
                        color:
                          state === 'open' ? '#7FB07A'
                          : state === 'now' ? '#D4A853'
                          : '#5f6675',
                        boxShadow:
                          state === 'now' ? '0 0 0 3px rgba(212,168,83,.12)' : 'none',
                      }}
                    >
                      {icon}
                    </div>
                    <span style={{ flex: 1 }}>{topic}</span>
                    <span
                      style={{
                        fontSize: 9, letterSpacing: '0.1em',
                        textTransform: 'uppercase',
                        color:
                          state === 'open' ? '#7FB07A'
                          : state === 'now' ? '#D4A853'
                          : '#5f6675',
                      }}
                    >
                      {status}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* ── Raya topic prompt card ─────────────────────────────────
                Orb only — no "RAYA · TOPIC" eyebrow text.
                Speaks directly to Ahmed about this topic.
            ──────────────────────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.28 }}
              style={{
                border: '1px dashed rgba(212,168,83,.28)',
                borderRadius: 14, padding: '13px 14px',
                margin: '0 0 13px',
                background: 'rgba(212,168,83,.025)',
                display: 'flex', gap: 11, alignItems: 'flex-start',
              }}
            >
              <RayaOrb size={30} />
              <p
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic', fontSize: 15,
                  lineHeight: 1.48, color: '#EDE7DA',
                  margin: 0, flex: 1, paddingTop: 2,
                }}
              >
                {RAYA_PROMPTS[activeTopicIdx]}
              </p>
            </motion.div>

            {/* ── Message bubbles ─────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.36 }}
              style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 4 }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    maxWidth: '84%',
                    padding: '11px 13px',
                    borderRadius: 15,
                    fontSize: 12.5, lineHeight: 1.55, fontWeight: 300,
                    ...(msg.from === 'me'
                      ? {
                          background: 'rgba(255,255,255,.05)',
                          border: '1px solid rgba(255,255,255,.06)',
                          borderBottomRightRadius: 5, marginLeft: 'auto',
                        }
                      : {
                          background: 'rgba(201,138,138,.06)',
                          border: '1px solid rgba(201,138,138,.18)',
                          borderBottomLeftRadius: 5, marginRight: 'auto',
                        }),
                  }}
                >
                  <span
                    style={{
                      fontSize: 9, letterSpacing: '0.2em',
                      textTransform: 'uppercase', color: 'rgba(212,168,83,.5)',
                      marginBottom: 4, display: 'block',
                    }}
                  >
                    {msg.from === 'me' ? 'You' : matchName}
                  </span>
                  {msg.text}
                </div>
              ))}
            </motion.div>

            {/* Scroll anchor */}
            <div ref={messagesEnd} />
          </div>
        </div>

        {/* ── Footer: Raya card + input + tone mod + scholar link ────────── */}
        <div
          style={{
            flexShrink: 0,
            borderTop: '1px solid rgba(255,255,255,.05)',
            padding: '10px 56px 14px',
          }}
        >
          <div style={{ maxWidth: 520, width: '100%' }}>

            {/* Raya opening suggestion card — floats above input, dismissable */}
            <AnimatePresence>
              {showRayaCard && (
                <motion.div
                  key="raya-card"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.22 }}
                  style={{
                    background: 'rgba(212,168,83,.03)',
                    border: '1px solid rgba(212,168,83,.18)',
                    borderRadius: 14, padding: '11px 13px',
                    marginBottom: 10,
                  }}
                >
                  <div
                    style={{
                      display: 'flex', gap: 10,
                      alignItems: 'flex-start', marginBottom: 9,
                    }}
                  >
                    <RayaOrb size={24} />
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontStyle: 'italic', fontSize: 13.5,
                        lineHeight: 1.48, color: '#EDE7DA',
                        margin: 0, flex: 1,
                      }}
                    >
                      {RAYA_OPENING_CARD_TEXT}
                    </p>
                  </div>
                  <div
                    style={{
                      display: 'flex', gap: 7,
                      justifyContent: 'flex-end',
                    }}
                  >
                    <button
                      onClick={() => {
                        setMessageInput(RAYA_OPENING_MESSAGE);
                        setRayaCardDismissed(true);
                        textareaRef.current?.focus();
                      }}
                      className="sk-btn-ghost"
                      style={{
                        padding: '5px 12px', borderRadius: 20,
                        fontSize: 11, fontWeight: 500,
                        background: 'rgba(212,168,83,.1)',
                        border: '1px solid rgba(212,168,83,.22)',
                        color: '#e7c984', cursor: 'pointer',
                        fontFamily: "'Manrope', sans-serif",
                      }}
                    >
                      Use this opening
                    </button>
                    <button
                      onClick={() => setRayaCardDismissed(true)}
                      className="sk-btn-ghost"
                      style={{
                        padding: '5px 12px', borderRadius: 20,
                        fontSize: 11, fontWeight: 400,
                        background: 'transparent',
                        border: '1px solid rgba(255,255,255,.07)',
                        color: '#9aa0ac', cursor: 'pointer',
                        fontFamily: "'Manrope', sans-serif",
                      }}
                    >
                      I'll write my own
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input row */}
            <div
              style={{
                display: 'flex', gap: 9,
                alignItems: 'flex-end', marginBottom: 7,
              }}
            >
              <textarea
                ref={textareaRef}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Write to ${matchName}…`}
                rows={1}
                className="sk-msg-input"
                style={{
                  flex: 1,
                  background: 'rgba(255,255,255,.04)',
                  border: '1px solid rgba(255,255,255,.09)',
                  borderRadius: 12, padding: '10px 14px',
                  fontSize: 13, color: '#EDE7DA',
                  fontFamily: "'Manrope', sans-serif",
                  fontWeight: 300, lineHeight: 1.5,
                  resize: 'none', outline: 'none',
                  transition: '.2s', overflowY: 'hidden',
                  minHeight: 44,
                }}
              />
              <button
                onClick={handleSend}
                disabled={!messageInput.trim()}
                className="sk-send-btn"
                style={{
                  width: 40, height: 40, borderRadius: '50%',
                  flexShrink: 0, border: 'none',
                  background: messageInput.trim()
                    ? 'linear-gradient(135deg, #D4A853, #b98b39)'
                    : 'rgba(255,255,255,.05)',
                  cursor: messageInput.trim() ? 'pointer' : 'default',
                  display: 'flex', alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 17, lineHeight: 1,
                  transition: '.2s',
                  color: messageInput.trim() ? '#0a0e15' : '#5f6675',
                }}
              >
                ↑
              </button>
            </div>

            {/* Raya tone moderation — appears softly, never blocks */}
            <AnimatePresence>
              {showToneMod && !toneModDismissed && (
                <motion.div
                  key="tone-mod"
                  initial={{ opacity: 0, y: 3 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 3 }}
                  transition={{ duration: 0.18 }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '7px 10px', borderRadius: 10,
                    background: 'rgba(212,168,83,.02)',
                    border: '1px solid rgba(212,168,83,.11)',
                    marginBottom: 7,
                  }}
                >
                  <RayaOrb size={20} />
                  <span
                    style={{
                      fontSize: 11, color: '#9aa0ac',
                      fontWeight: 300, flex: 1,
                    }}
                  >
                    This reads a little direct — would you like to soften it?
                  </span>
                  <button
                    onClick={() => {
                      /* TODO: sakinahService.suggestSofterVersion(messageInput) */
                    }}
                    style={{
                      fontSize: 10, padding: '3px 10px', borderRadius: 20,
                      border: '1px solid rgba(212,168,83,.2)',
                      background: 'transparent', color: '#e7c984',
                      cursor: 'pointer', fontFamily: "'Manrope', sans-serif",
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Suggest a softer version
                  </button>
                  <button
                    onClick={() => setToneModDismissed(true)}
                    style={{
                      background: 'none', border: 'none',
                      color: '#5f6675', cursor: 'pointer',
                      fontSize: 15, padding: '0 2px',
                      lineHeight: 1, fontFamily: "'Manrope', sans-serif",
                    }}
                  >
                    ×
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Scholar link — small, warm, no bar */}
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={() => {
                  /* TODO: open scholar-counsellor support flow */
                }}
                className="sk-scholar-link"
                style={{
                  background: 'none', border: 'none',
                  padding: 0, fontSize: 11, color: '#5f6675',
                  cursor: 'pointer', fontFamily: "'Manrope', sans-serif",
                  fontWeight: 300, display: 'inline-flex',
                  alignItems: 'center', gap: 5,
                  transition: '.2s',
                }}
              >
                <span style={{ fontSize: 12 }}>📖</span>
                Speak with a scholar
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}

export default ConversationPage;
