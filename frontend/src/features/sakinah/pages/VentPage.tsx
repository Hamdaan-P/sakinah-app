/**
 * VentPage — /sakinah/vent
 * A private space to speak with Raya when the journey feels heavy.
 * Never call this therapy. Raya listens warmly, never diagnoses.
 * Nothing here is stored against the user, shown to matches, or used in any way.
 */

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

interface Message {
  id: number;
  from: 'user' | 'raya';
  text: string;
}

const RAYA_OPENING =
  "This is just between us. Nothing here is stored against you, shown to matches, or used in any way. Sometimes the path to marriage is heavy — you can put it down here.";

const PROMPT_CHIPS = [
  "I'm feeling anxious about this process",
  "I don't know if I'm ready",
  "Something happened that I need to talk through",
];

const SCRIPTED: Record<string, string> = {
  "I'm feeling anxious about this process":
    "That's completely understandable. This is one of the most significant decisions of your life — it makes sense that it feels heavy. You don't need to rush. I'm here with you.",
  "I don't know if I'm ready":
    "Readiness isn't a switch. It's something you grow into. The fact that you're asking means you're already thinking carefully — and that matters more than you know.",
  "Something happened that I need to talk through":
    "Take all the time you need. When you're ready, I'm here. You don't have to carry this alone.",
};

const DEFAULT_RESPONSE =
  "I hear you. Thank you for trusting me with this. You're not alone in feeling this way.";

export function VentPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([
    { id: 0, from: 'raya', text: RAYA_OPENING },
  ]);
  const [input, setInput]               = useState('');
  const [chipsVisible, setChipsVisible] = useState(true);
  const [rayaTyping, setRayaTyping]     = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef       = useRef<HTMLTextAreaElement>(null);
  const timeoutRef     = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgIdRef       = useRef(1);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, rayaTyping]);

  useEffect(() => {
    return () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  }, []);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    const uid = ++msgIdRef.current;
    setChipsVisible(false);
    setMessages(prev => [...prev, { id: uid, from: 'user', text: text.trim() }]);
    setInput('');
    setRayaTyping(true);
    const reply = SCRIPTED[text.trim()] ?? DEFAULT_RESPONSE;
    timeoutRef.current = setTimeout(() => {
      setRayaTyping(false);
      setMessages(prev => [...prev, { id: ++msgIdRef.current, from: 'raya', text: reply }]);
    }, 1300);
  };

  return (
    <div
      style={{
        display: 'flex', height: '100vh', background: PAGE_BG,
        color: '#EDE7DA', fontFamily: "'Manrope', sans-serif",
        WebkitFontSmoothing: 'antialiased', overflow: 'hidden',
      }}
    >
      <SakinahSidebar activeItem="vent-box" />

      <main style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 0 }}>

        {/* ── Header ── */}
        <div style={{ flexShrink: 0, padding: '28px 40px 22px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="sk-back-btn"
              style={{ width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(212,168,83,.16)', background: 'transparent', color: '#D4A853', fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, paddingBottom: 1, lineHeight: 1 }}
            >
              ‹
            </button>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 22, fontWeight: 500, lineHeight: 1.02 }}>
                Vent Box
              </div>
              <div style={{ fontSize: 11, color: '#5f6675', marginTop: 2, letterSpacing: '0.02em' }}>
                Just between you and Raya
              </div>
            </div>
          </div>
        </div>

        {/* ── Messages (scrollable) ── */}
        <div className="sk-page-body" style={{ flex: 1, overflowY: 'auto', padding: '16px 0 8px' }}>

          {messages.map(msg =>
            msg.from === 'raya' ? (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 40px' }}
              >
                <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: '#3a2c0c', marginTop: 2 }}>
                  ر
                </div>
                <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '18px 18px 18px 4px', padding: '10px 14px', maxWidth: '72%', fontSize: 14, color: '#9aa0ac', lineHeight: 1.6, fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic' }}>
                  {msg.text}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                style={{ display: 'flex', justifyContent: 'flex-end', padding: '6px 40px' }}
              >
                <div style={{ background: 'rgba(212,168,83,.1)', border: '1px solid rgba(212,168,83,.2)', borderRadius: '18px 18px 4px 18px', padding: '10px 14px', maxWidth: '72%', fontSize: 14, color: '#EDE7DA', lineHeight: 1.55 }}>
                  {msg.text}
                </div>
              </motion.div>
            )
          )}

          {/* Typing indicator */}
          {rayaTyping && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 40px' }}>
              <div style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0, background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 13, color: '#3a2c0c', marginTop: 2 }}>
                ر
              </div>
              <div style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)', borderRadius: '18px 18px 18px 4px', padding: '10px 16px' }}>
                <span style={{ fontSize: 20, color: 'rgba(212,168,83,.5)', letterSpacing: 4, lineHeight: 1 }}>· · ·</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* ── Footer ── */}
        <div style={{ flexShrink: 0, borderTop: '1px solid rgba(255,255,255,.06)', padding: '12px 40px 20px' }}>

          {/* Prompt chips */}
          {chipsVisible && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, marginBottom: 12 }}>
              {PROMPT_CHIPS.map(chip => (
                <button
                  key={chip}
                  type="button"
                  onClick={() => handleSend(chip)}
                  className="sk-pref-chip"
                  style={{ padding: '7px 13px', borderRadius: 30, fontSize: 12.5, fontFamily: "'Manrope', sans-serif", cursor: 'pointer', border: '1px solid rgba(212,168,83,.2)', background: 'rgba(212,168,83,.04)', color: '#9aa0ac', transition: 'all .15s' }}
                >
                  {chip}
                </button>
              ))}
            </div>
          )}

          {/* Input row */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-end', marginBottom: 10 }}>
            <textarea
              ref={inputRef}
              className="sk-msg-input"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(input); }
              }}
              placeholder="Speak freely…"
              rows={2}
              style={{ flex: 1, resize: 'none', fontFamily: "'Manrope', sans-serif", fontSize: 14, padding: '11px 14px', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 14, color: '#EDE7DA', outline: 'none' }}
            />
            <button
              type="button"
              onClick={() => handleSend(input)}
              disabled={!input.trim()}
              className="sk-send-btn"
              style={{ width: 42, height: 42, borderRadius: 12, border: 'none', cursor: input.trim() ? 'pointer' : 'default', background: input.trim() ? 'linear-gradient(135deg, #D4A853, #b98b39)' : 'rgba(255,255,255,.05)', color: input.trim() ? '#0a0e15' : '#5f6675', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: '.2s' }}
            >
              →
            </button>
          </div>

          {/* Scholar escalation */}
          <div style={{ textAlign: 'center' }}>
            <a
              href="#"
              className="sk-scholar-link"
              style={{ fontSize: 12, color: '#5f6675', textDecoration: 'none', letterSpacing: '0.01em' }}
            >
              📖 Speak with a scholar-counsellor
            </a>
          </div>

        </div>
      </main>

      {/* Raya FAB — focuses the input */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="sk-raya-fab"
        title="Speak with Raya"
        style={{ position: 'fixed', bottom: 32, right: 32, width: 52, height: 52, borderRadius: '50%', background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#3a2c0c', cursor: 'pointer', boxShadow: '0 4px 24px rgba(212,168,83,.22), 0 0 0 1px rgba(212,168,83,.18)', zIndex: 100 }}
      >
        ر
      </div>
    </div>
  );
}

export default VentPage;
