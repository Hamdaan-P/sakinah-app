/**
 * CandidatePage — /sakinah/candidate
 * Stage D · A resonance: one candidate shown as a character portrait.
 * NO photo. NO rejection notification. Interest is private.
 * A pass is silent — never shown to the other person.
 * Express interest is a server-authoritative write — client only initiates.
 * TODO: accept /:uid param and fetch from sakinahService.getCandidate(uid) when service is wired.
 */

import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';
import { useAuthStore } from '@/core/stores/auth.store';
import { expressInterest } from '../services/sakinahService';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

// Placeholder candidate — replace with sakinahService.getCandidate(uid) when service is wired.
const MOCK_CANDIDATE = {
  uid: 'f1',
  initial: 'ف',
  name: 'Fatima',
  age: 27,
  city: 'Chennai',
  tradition: 'Sunni Hanafi',
  waliLinked: true,
} as const;

// Resonance points derived from both portraits — never raw answers.
// TODO: generate server-side after mutual portrait completion.
const RESONANCE_POINTS: Array<{ key: string; parts: React.ReactNode }> = [
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
        <b style={{ color: '#EDE7DA', fontWeight: 600 }}>steadiness</b>, value{' '}
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
  {
    key: 'r4',
    parts: (
      <>
        Same tradition —{' '}
        <b style={{ color: '#EDE7DA', fontWeight: 600 }}>Sunni Hanafi</b>
      </>
    ),
  },
];

export function CandidatePage() {
  const navigate = useNavigate();
  const user     = useAuthStore((s) => s.user);
  void user; // placeholder — consumed by TODO sakinahService calls below
  const acting   = useRef(false);

  const [passing, setPassing]             = useState(false);
  const [interestPending, setInterestPending] = useState(false);

  function handlePass() {
    if (acting.current) return;
    acting.current = true;
    // A pass is always silent — never shown to the other person as rejection.
    // TODO: authPost('/sakinah/pass', { seeker: user?.id, targetUid: MOCK_CANDIDATE.uid })
    setPassing(true);
    setTimeout(() => navigate('/sakinah'), 1800);
  }

  async function handleExpressInterest() {
    if (acting.current || interestPending) return;
    acting.current = true;
    setInterestPending(true);
    const result = await expressInterest(MOCK_CANDIDATE.uid);
    if (result.match_id) {
      setTimeout(() => navigate(`/sakinah/matchflow/${result.match_id}`), 700);
    } else {
      setTimeout(() => navigate('/sakinah'), 700);
    }
  }

  const metaLine = [
    MOCK_CANDIDATE.city,
    MOCK_CANDIDATE.tradition,
    'Verified',
    MOCK_CANDIDATE.waliLinked ? 'Wali linked' : null,
  ]
    .filter(Boolean)
    .join(' · ');

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
                    {MOCK_CANDIDATE.initial}
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
                    {MOCK_CANDIDATE.name} · {MOCK_CANDIDATE.age}
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
                    {RESONANCE_POINTS.map((point, i) => (
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
      </main>
    </div>
  );
}

export default CandidatePage;
