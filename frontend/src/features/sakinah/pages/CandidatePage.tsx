/**
 * CandidatePage — /sakinah/candidate/:uid
 * Stage D · A resonance: one candidate shown as a character portrait.
 * NO photo. NO rejection notification. Interest is private.
 * A pass is silent — never shown to the other person.
 * Express interest is a server-authoritative write — client only initiates.
 */

import { useRef, useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';
import { expressInterest, getCandidate } from '../services/sakinahService';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

const RAYA_HELP = [
  {
    id: 'r1',
    icon: '☉',
    label: 'Help me reflect on this person',
    reply:
      "Read the resonance points slowly — each one is something Raya noticed where your portraits speak to each other. There is no right answer, only an honest one.",
  },
  {
    id: 'r2',
    icon: '?',
    label: 'What does "express interest" mean?',
    reply:
      "It means you're open to a conversation — nothing more. It stays completely private. She only finds out if there's a mutual yes.",
  },
  {
    id: 'r3',
    icon: '⌥',
    label: "I'm unsure — is that okay?",
    reply:
      "Uncertainty is honest. You don't need certainty to take one step. Curiosity is enough to begin.",
  },
  {
    id: 'r4',
    icon: '◷',
    label: 'I just need a moment',
    reply:
      "Take all the time you need. She won't know you visited. Nothing moves without your intention.",
  },
] as const;

interface CandidateProfile {
  uid: string;
  display_name: string;
  age: number | null;
  city: string;
  maslak: string;
  bio: string;
  wali_linked: boolean;
  gender: string;
}

export function CandidatePage() {
  const { uid }  = useParams<{ uid: string }>();
  const navigate = useNavigate();
  const acting   = useRef(false);

  const [candidate, setCandidate]             = useState<CandidateProfile | null>(null);
  const [loadError, setLoadError]             = useState<string | null>(null);
  const [passing, setPassing]                 = useState(false);
  const [interestPending, setInterestPending] = useState(false);
  const [rayaOpen, setRayaOpen]               = useState(false);
  const [activeHelp, setActiveHelp]           = useState<string | null>(null);

  function openRaya() { setActiveHelp(null); setRayaOpen(true); }
  function toggleHelp(id: string) { setActiveHelp(prev => prev === id ? null : id); }

  useEffect(() => {
    if (!uid) {
      setLoadError('No candidate specified.');
      return;
    }
    getCandidate(uid)
      .then((data: any) => setCandidate(data as CandidateProfile))
      .catch(() => setLoadError('Could not load this candidate. Please go back and try again.'));
  }, [uid]);

  const name    = candidate?.display_name ?? '';
  const initial = name[0] ?? '?';
  const age     = candidate?.age ?? null;
  const city    = candidate?.city ?? '';
  const maslak  = candidate?.maslak ?? '';

  const resonancePoints: Array<{ key: string; parts: React.ReactNode }> = candidate
    ? [
        {
          key: 'r1',
          parts: (
            <>
              Shared intention:{' '}
              <b style={{ color: '#EDE7DA', fontWeight: 600 }}>a home of calm and worship</b>
            </>
          ),
        },
        {
          key: 'r2',
          parts: (
            <>
              You both bring{' '}
              <b style={{ color: '#EDE7DA', fontWeight: 600 }}>steadiness</b>
              {' · '}
              <b style={{ color: '#EDE7DA', fontWeight: 600 }}>quiet generosity</b>
            </>
          ),
        },
        {
          key: 'r3',
          parts: (
            <>
              Both{' '}
              <b style={{ color: '#EDE7DA', fontWeight: 600 }}>learning to let people in</b>
            </>
          ),
        },
        ...(maslak
          ? [
              {
                key: 'r4',
                parts: (
                  <>
                    Same tradition —{' '}
                    <b style={{ color: '#EDE7DA', fontWeight: 600 }}>{maslak}</b>
                  </>
                ),
              },
            ]
          : []),
      ]
    : [];

  const metaLine = [
    city,
    maslak,
    'Verified',
    candidate?.wali_linked ? 'Wali linked' : null,
  ]
    .filter(Boolean)
    .join(' · ');

  function handlePass() {
    if (acting.current) return;
    acting.current = true;
    setPassing(true);
    setTimeout(() => navigate('/sakinah'), 1800);
  }

  async function handleExpressInterest() {
    if (acting.current || interestPending || !candidate) return;
    acting.current = true;
    setInterestPending(true);
    try {
      const result: any = await expressInterest(candidate.uid);
      if (result.match_id) {
        setTimeout(() => navigate(`/sakinah/matchflow/${result.match_id}`), 700);
      } else {
        setTimeout(() => navigate('/sakinah'), 700);
      }
    } catch {
      acting.current = false;
      setInterestPending(false);
    }
  }

  // ── Loading state ──────────────────────────────────────────────────────────
  if (!candidate && !loadError) {
    return (
      <div
        style={{
          display: 'flex', height: '100vh', background: PAGE_BG,
          color: '#EDE7DA', fontFamily: "'Manrope', sans-serif",
          WebkitFontSmoothing: 'antialiased', overflow: 'hidden',
        }}
      >
        <SakinahSidebar activeItem="a-resonance" />
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <motion.div
            animate={{ opacity: [0.3, 0.7, 0.3] }}
            transition={{ duration: 1.6, repeat: Infinity }}
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 40, color: 'rgba(212,168,83,.35)',
            }}
          >
            ۞
          </motion.div>
        </main>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <div
        style={{
          display: 'flex', height: '100vh', background: PAGE_BG,
          color: '#EDE7DA', fontFamily: "'Manrope', sans-serif",
          WebkitFontSmoothing: 'antialiased', overflow: 'hidden',
        }}
      >
        <SakinahSidebar activeItem="a-resonance" />
        <main
          style={{
            flex: 1, display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 16,
          }}
        >
          <p style={{ fontSize: 13, color: '#9aa0ac', fontWeight: 300 }}>{loadError}</p>
          <button
            onClick={() => navigate('/sakinah')}
            style={{
              background: 'none', border: '1px solid rgba(212,168,83,.3)',
              color: '#e7c984', fontSize: 12.5, padding: '9px 20px',
              borderRadius: 10, cursor: 'pointer', fontFamily: "'Manrope', sans-serif",
            }}
          >
            ← Back to your pool
          </button>
        </main>
      </div>
    );
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
      <SakinahSidebar activeItem="a-resonance" />

      <main
        style={{
          flex: 1,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* ── Header ───────────────────────────────────────────────────── */}
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
                width: 34,
                height: 34,
                borderRadius: '50%',
                border: '1px solid rgba(212,168,83,.16)',
                background: 'transparent',
                color: '#D4A853',
                fontSize: 18,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                flexShrink: 0,
                paddingBottom: 1,
                lineHeight: 1,
              }}
            >
              ‹
            </button>
            <div>
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 26,
                  fontWeight: 500,
                  lineHeight: 1.02,
                }}
              >
                A resonance
              </div>
              <div style={{ fontSize: 11, color: '#5f6675', marginTop: 3, letterSpacing: '0.02em' }}>
                Character first, never a face
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ───────────────────────────────────────────── */}
        <div
          className="sk-page-body"
          style={{ flex: 1, overflowY: 'auto', padding: '28px 56px 80px' }}
        >
          <div style={{ maxWidth: 520, width: '100%' }}>

            <AnimatePresence mode="wait">

              {/* ── Passing confirmation ──────────────────────────────── */}
              {passing ? (
                <motion.div
                  key="passed"
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ textAlign: 'center', paddingTop: 60 }}
                >
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 40,
                      color: 'rgba(212,168,83,.3)',
                      lineHeight: 1,
                      marginBottom: 20,
                    }}
                  >
                    ۞
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 22,
                      fontWeight: 500,
                      color: '#EDE7DA',
                      marginBottom: 10,
                    }}
                  >
                    Passed gently
                  </div>
                  <p
                    style={{
                      fontSize: 12.5,
                      color: '#9aa0ac',
                      fontWeight: 300,
                      lineHeight: 1.6,
                    }}
                  >
                    Bringing your next…
                  </p>
                </motion.div>

              ) : (
                /* ── Main candidate card ────────────────────────────── */
                <motion.div
                  key="candidate"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, delay: 0.04 }}
                  style={{
                    background: 'linear-gradient(165deg, #111826, #0f1521)',
                    border: '1px solid rgba(212,168,83,.16)',
                    borderRadius: 24,
                    padding: '20px 18px',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  {/* Subtle corner accent */}
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      right: 0,
                      width: 80,
                      height: 80,
                      background:
                        'radial-gradient(circle at top right, rgba(212,168,83,.1), transparent 70%)',
                      pointerEvents: 'none',
                    }}
                  />

                  {/* Aura — never a photo */}
                  <div
                    style={{
                      width: 84,
                      height: 84,
                      borderRadius: '50%',
                      margin: '2px auto 10px',
                      background:
                        'radial-gradient(circle at 40% 35%, rgba(201,138,138,.42), transparent 55%), ' +
                        'radial-gradient(circle at 70% 70%, rgba(212,168,83,.34), transparent 55%), ' +
                        '#0f1521',
                      border: '1px solid rgba(212,168,83,.16)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 30,
                      color: '#EDE7DA',
                    }}
                  >
                    {initial}
                  </div>

                  {/* Name */}
                  <div
                    style={{
                      textAlign: 'center',
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 22,
                      color: '#EDE7DA',
                    }}
                  >
                    {name} · {age}
                  </div>

                  {/* Meta */}
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: 10.5,
                      color: '#5f6675',
                      marginTop: 3,
                    }}
                  >
                    {metaLine}
                  </div>

                  {/* Resonance list — dots light in sequence */}
                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 9,
                      margin: '16px 0 4px',
                    }}
                  >
                    {resonancePoints.map((point, i) => (
                      <motion.div
                        key={point.key}
                        initial={{ opacity: 0, x: -6 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.35, delay: 0.24 + i * 0.08 }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          fontSize: 12,
                          color: '#9aa0ac',
                          fontWeight: 300,
                        }}
                      >
                        {/* Gold resonance dot lights in sequence */}
                        <motion.div
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ duration: 0.25, delay: 0.28 + i * 0.08 }}
                          style={{
                            width: 6,
                            height: 6,
                            borderRadius: '50%',
                            background: '#D4A853',
                            flexShrink: 0,
                            boxShadow: '0 0 8px rgba(212,168,83,.55)',
                          }}
                        />
                        {point.parts}
                      </motion.div>
                    ))}
                  </div>

                  {/* No-face note */}
                  <div
                    style={{
                      textAlign: 'center',
                      fontSize: 10,
                      color: '#5f6675',
                      fontWeight: 300,
                      fontStyle: 'italic',
                      margin: '12px 0 14px',
                      lineHeight: 1.5,
                    }}
                  >
                    Her face isn't shown — neither is yours. A photo is exchanged only if
                    you both continue, with family aware.
                  </div>

                  {/* Action row */}
                  <div style={{ display: 'flex', gap: 10 }}>
                    {/* Pass — silent, never shown to the other person */}
                    <button
                      onClick={handlePass}
                      className="sk-btn-ghost"
                      style={{
                        flex: 1,
                        background: 'transparent',
                        border: '1px solid rgba(212,168,83,.16)',
                        color: '#e7c984',
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 600,
                        fontSize: 13,
                        letterSpacing: '0.3px',
                        padding: 12,
                        borderRadius: 13,
                        cursor: 'pointer',
                        transition: '.22s',
                      }}
                    >
                      Not this one
                    </button>

                    {/* Express interest — server-authoritative write */}
                    <button
                      onClick={handleExpressInterest}
                      disabled={interestPending}
                      className="sk-btn-gold"
                      style={{
                        flex: 1,
                        border: 'none',
                        background: interestPending
                          ? 'rgba(212,168,83,.3)'
                          : 'linear-gradient(135deg, #D4A853, #b98b39)',
                        color: '#0a0e15',
                        fontFamily: "'Manrope', sans-serif",
                        fontWeight: 600,
                        fontSize: 13,
                        letterSpacing: '0.3px',
                        padding: 12,
                        borderRadius: 13,
                        cursor: interestPending ? 'default' : 'pointer',
                        transition: '.22s',
                        opacity: interestPending ? 0.7 : 1,
                      }}
                    >
                      {interestPending ? 'Noted…' : 'Express interest'}
                    </button>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>

            {/* ── Privacy reassurance — below the card ─────────────────── */}
            {!passing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.36, duration: 0.5 }}
                style={{
                  fontSize: 11,
                  color: '#5f6675',
                  fontWeight: 300,
                  lineHeight: 1.6,
                  textAlign: 'center',
                  marginTop: 14,
                  padding: '0 8px',
                }}
              >
                Interest is private. A decline is silent — never rejection.
                Only a mutual yes opens a conversation.
              </motion.div>
            )}

          </div>
        </div>
        {/* ── Raya FAB ─────────────────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            right: 20,
            bottom: 22,
            zIndex: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            cursor: 'pointer',
          }}
          onClick={openRaya}
        >
          <AnimatePresence>
            {!rayaOpen && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: 3.4, duration: 0.4 }}
                style={{
                  background: 'rgba(8,11,17,.92)',
                  border: '1px solid rgba(212,168,83,.16)',
                  borderRadius: 30,
                  padding: '8px 14px',
                  fontSize: 11,
                  color: '#e7c984',
                  whiteSpace: 'nowrap',
                  fontWeight: 300,
                  backdropFilter: 'blur(8px)',
                }}
              >
                Need help?{' '}
                <b style={{ color: '#EDE7DA', fontWeight: 500 }}>Raya's here.</b>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="sk-raya-halo"
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 24,
              color: '#3a2c0c',
              boxShadow: '0 8px 22px rgba(212,168,83,.35)',
              position: 'relative',
              flexShrink: 0,
              transition: 'transform .2s',
            }}
          >
            ر
          </div>
        </div>

        {/* ── Raya scrim ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {rayaOpen && (
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRayaOpen(false)}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(5,7,11,.6)',
                zIndex: 90,
                backdropFilter: 'blur(2px)',
              }}
            />
          )}
        </AnimatePresence>

        {/* ── Raya bottom sheet ─────────────────────────────────────────── */}
        <AnimatePresence>
          {rayaOpen && (
            <motion.div
              key="sheet"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              exit={{ y: '110%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 95,
                background: 'linear-gradient(180deg, #141b29, #0f1521)',
                borderTop: '1px solid rgba(212,168,83,.16)',
                borderRadius: '26px 26px 0 0',
                padding: '20px 20px 28px',
                maxHeight: '76%',
                overflowY: 'auto',
                scrollbarWidth: 'none',
              }}
            >
              {/* Grab handle */}
              <div
                style={{
                  width: 38,
                  height: 4,
                  borderRadius: 4,
                  background: 'rgba(212,168,83,.16)',
                  margin: '0 auto 14px',
                }}
              />

              {/* Sheet header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 19,
                    color: '#3a2c0c',
                    flexShrink: 0,
                  }}
                >
                  ر
                </div>
                <div>
                  <b
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 20,
                      fontWeight: 500,
                      display: 'block',
                    }}
                  >
                    Raya
                  </b>
                  <span style={{ fontSize: 10, color: '#7FB07A', letterSpacing: '0.04em' }}>
                    ● always here to help
                  </span>
                </div>
                <button
                  onClick={() => setRayaOpen(false)}
                  style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontSize: 22,
                    lineHeight: 1,
                    minWidth: 44,
                    minHeight: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
                  aria-label="Close Raya panel"
                >
                  ×
                </button>
              </div>

              <p
                style={{
                  fontSize: 12.5,
                  color: '#9aa0ac',
                  fontWeight: 300,
                  lineHeight: 1.6,
                  marginBottom: 14,
                }}
              >
                This is where character speaks before a face does. Take your time reflecting
                on what truly matters.
              </p>

              {/* Help chips */}
              {RAYA_HELP.map((item) => (
                <div key={item.id}>
                  <div
                    onClick={() => toggleHelp(item.id)}
                    style={{
                      border: '1px solid rgba(255,255,255,.06)',
                      borderRadius: 13,
                      padding: '12px 14px',
                      marginBottom: 8,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      color: '#EDE7DA',
                      transition: 'border-color .2s, background .2s',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        color: '#D4A853',
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                  <AnimatePresence>
                    {activeHelp === item.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div
                          style={{
                            fontSize: 12.5,
                            color: '#EDE7DA',
                            fontWeight: 300,
                            lineHeight: 1.6,
                            borderLeft: '2px solid #D4A853',
                            padding: '4px 0 4px 13px',
                            marginBottom: 14,
                          }}
                        >
                          {item.reply}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}

export default CandidatePage;
