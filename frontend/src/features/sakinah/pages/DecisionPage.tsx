/**
 * DecisionPage — /sakinah/decision
 * Stage D · Phase 7: Three equally-weighted paths after conversation.
 * All three cards share identical visual weight — same border, same eyebrow
 * colour, same size. Raya explains each one; she does not recommend any.
 * No notification is ever sent to the other person on any choice.
 * No fanfare, no celebration animation anywhere on this screen.
 * TODO: replace mock with sakinahService.recordDecision(uid, candidateUid, key).
 */

import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';
import { useConversation } from '../hooks/useSakinah';
import { submitDecision } from '../services/sakinahService';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.06), transparent 60%), #07090f';

type DecisionKey = 'proceed' | 'pause' | 'close';

interface Decision {
  key: DecisionKey;
  eyebrow: string;
  title: string;
  raya: string;
  closingMessage: string;
}

const DECISIONS: Decision[] = [
  {
    key: 'proceed',
    eyebrow: 'Proceed',
    title: 'Continue together',
    raya: "When you're ready, Raya will help bring your families into the next step. A meeting, a conversation, a path toward nikah — at your pace.",
    closingMessage: "Raya will help bring your families together, gently. The next step waits whenever you're both ready.",
  },
  {
    key: 'pause',
    eyebrow: 'Pause',
    title: 'Take time for istikhara',
    raya: "There is no rush. Make your prayer, sit with your heart. This stays open for you — no clock, no guilt.",
    closingMessage: "Your space here remains open, quietly. Come back whenever your heart is ready.",
  },
  {
    key: 'close',
    eyebrow: 'Close',
    title: 'We part with a dua',
    raya: "May Allah place goodness in your path and hers. This closes quietly, with a prayer — and gratitude for the sincerity you both brought.",
    closingMessage: "بارك الله فيكما — and in her path too.\n\nClosed quietly, with a prayer, and with gratitude for the sincerity you both brought.",
  },
];

// Gentle confirmation prompt per option — shown in the confirm strip.
const CONFIRM_LINE: Record<DecisionKey, string> = {
  proceed: 'Families will be introduced gently.',
  pause:   'This stays open, quietly — no clock.',
  close:   'Closed with a prayer.',
};

export function DecisionPage() {
  const navigate    = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const { conversation } = useConversation(matchId ?? '');
  const matchName = conversation?.match_name ?? 'Your match';

  const [selected, setSelected]   = useState<DecisionKey | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const selectedDecision = DECISIONS.find((d) => d.key === selected) ?? null;

  async function handleConfirm() {
    if (matchId && selected) {
      await submitDecision(matchId, selected);
    }
    setConfirmed(true);
  }

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
      <SakinahSidebar activeItem="the-decision" />

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
                The decision
              </div>
              <div style={{ fontSize: 11, color: '#5f6675', marginTop: 3, letterSpacing: '0.02em' }}>
                Phase 7 · with {matchName} · proceed, pause, or close
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ────────────────────────────────────────────── */}
        <div
          className="sk-page-body"
          style={{ flex: 1, overflowY: 'auto', padding: '28px 56px 80px' }}
        >
          <div style={{ maxWidth: 520, width: '100%' }}>

            <AnimatePresence mode="wait">

              {/* ── CONFIRMED VIEW ──────────────────────────────────────── */}
              {confirmed && selectedDecision && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    paddingTop: 40,
                    textAlign: 'center',
                    gap: 20,
                  }}
                >
                  {/* Raya orb */}
                  <div
                    style={{
                      width: 48, height: 48, borderRadius: '50%',
                      background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 22, color: '#3a2c0c',
                    }}
                  >
                    ر
                  </div>

                  {/* Raya's closing words */}
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic',
                      fontSize: 18,
                      lineHeight: 1.6,
                      color: '#EDE7DA',
                      maxWidth: 380,
                      margin: 0,
                      whiteSpace: 'pre-line',
                    }}
                  >
                    "{selectedDecision.closingMessage}"
                  </p>

                  {/* Return home */}
                  <button
                    onClick={() => navigate('/sakinah')}
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      color: '#9aa0ac',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontFamily: "'Manrope', sans-serif",
                      fontWeight: 300,
                      textDecoration: 'underline',
                      textUnderlineOffset: 3,
                      transition: '.2s',
                    }}
                  >
                    Return home
                  </button>
                </motion.div>
              )}

              {/* ── CARDS VIEW ──────────────────────────────────────────── */}
              {!confirmed && (
                <motion.div
                  key="cards"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >

                  {/* Intro line */}
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.04 }}
                    style={{
                      fontSize: 13, color: '#9aa0ac',
                      fontWeight: 300, lineHeight: 1.6,
                      marginBottom: 22,
                    }}
                  >
                    No algorithm decides this — you do, with your family and your Lord.
                  </motion.p>

                  {/* Three equal decision cards */}
                  {DECISIONS.map((d, i) => {
                    const isSelected = selected === d.key;
                    return (
                      <motion.div
                        key={d.key}
                        initial={{ opacity: 0, y: 14 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.12 + i * 0.1 }}
                        onClick={() => setSelected(isSelected ? null : d.key)}
                        style={{
                          background: 'linear-gradient(160deg, #111826, #0f1521)',
                          border: `1px solid ${isSelected ? 'rgba(212,168,83,.35)' : 'rgba(255,255,255,.07)'}`,
                          borderRadius: 18,
                          padding: 18,
                          marginBottom: 13,
                          cursor: 'pointer',
                          transition: 'border-color .22s, box-shadow .22s',
                          boxShadow: isSelected
                            ? '0 0 0 3px rgba(212,168,83,.08)'
                            : 'none',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        {/* Eyebrow — same colour on all three */}
                        <div
                          style={{
                            fontSize: 10, letterSpacing: '0.3em',
                            textTransform: 'uppercase',
                            color: 'rgba(212,168,83,.45)',
                            marginBottom: 9,
                          }}
                        >
                          {d.eyebrow}
                        </div>

                        {/* Title */}
                        <h3
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontWeight: 500, fontSize: 21,
                            marginBottom: 7, lineHeight: 1.15,
                            color: '#EDE7DA',
                          }}
                        >
                          {d.title}
                        </h3>

                        {/* Raya's warm explanation — italic signals her voice */}
                        <p
                          style={{
                            fontFamily: "'Cormorant Garamond', serif",
                            fontStyle: 'italic',
                            fontSize: 14.5, lineHeight: 1.55,
                            color: '#9aa0ac', fontWeight: 400,
                            margin: 0,
                          }}
                        >
                          {d.raya}
                        </p>
                      </motion.div>
                    );
                  })}

                  {/* Note below all three cards */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.44 }}
                    style={{
                      textAlign: 'center',
                      fontSize: 11.5,
                      color: '#5f6675',
                      fontWeight: 300,
                      lineHeight: 1.65,
                      padding: '2px 12px 0',
                      marginBottom: 18,
                    }}
                  >
                    Whatever you choose, you choose with honour. The decision is yours — and Allah knows best.
                  </motion.div>

                  {/* Confirm strip — appears when a card is selected */}
                  <AnimatePresence>
                    {selected && selectedDecision && (
                      <motion.div
                        key="confirm-strip"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          border: '1px solid rgba(212,168,83,.18)',
                          borderRadius: 14,
                          padding: '14px 16px',
                          background: 'rgba(212,168,83,.025)',
                        }}
                      >
                        {selected === 'close' ? (
                          <>
                            <div
                              style={{
                                fontSize: 12, color: '#EDE7DA',
                                fontWeight: 500, marginBottom: 9,
                              }}
                            >
                              Are you sure?
                            </div>
                            <p
                              style={{
                                fontFamily: "'Cormorant Garamond', serif",
                                fontStyle: 'italic',
                                fontSize: 14.5, lineHeight: 1.55,
                                color: '#9aa0ac', margin: '0 0 13px',
                              }}
                            >
                              اللَّهُمَّ إِنْ كَانَ هَذَا خَيْرًا فَيَسِّرْهُ — If this is good, make it easy. If not, guide us to what is.
                            </p>
                          </>
                        ) : (
                          <div
                            style={{
                              fontSize: 11, color: '#9aa0ac',
                              fontWeight: 300, marginBottom: 12,
                              lineHeight: 1.5,
                            }}
                          >
                            <span style={{ color: '#EDE7DA', fontWeight: 500 }}>
                              {selectedDecision.title}
                            </span>
                            {' — '}
                            {CONFIRM_LINE[selected]}
                          </div>
                        )}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                          <button
                            onClick={handleConfirm}
                            style={{
                              padding: '7px 18px',
                              borderRadius: 20,
                              fontSize: 12,
                              fontWeight: 500,
                              border: '1px solid rgba(212,168,83,.28)',
                              background: 'transparent',
                              color: '#e7c984',
                              cursor: 'pointer',
                              fontFamily: "'Manrope', sans-serif",
                              transition: '.2s',
                            }}
                          >
                            {selected === 'close' ? 'Yes, with gratitude' : 'Confirm — this is my decision'}
                          </button>
                          <button
                            onClick={() => setSelected(null)}
                            style={{
                              background: 'none',
                              border: 'none',
                              fontSize: 12,
                              color: '#5f6675',
                              cursor: 'pointer',
                              fontFamily: "'Manrope', sans-serif",
                              fontWeight: 300,
                            }}
                          >
                            Not yet
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                </motion.div>
              )}

            </AnimatePresence>

          </div>
        </div>
      </main>
    </div>
  );
}

export default DecisionPage;
