/**
 * PortraitPage — /sakinah/portrait
 * Stage C · Phase 3 close: Your portrait — derived signal summary drawn from Mirror reflections.
 * Warm and affirming. No raw answers exposed. Private by design.
 * TODO: replace static signals + quote with values derived via sakinahService once service layer is wired.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import { SakinahSidebar } from './components/SakinahSidebar';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

interface Signal {
  label: string;
  value: string;
  pct: number;
}

interface Portrait {
  quote: string;
  signals: Signal[];
}

function buildPortrait(
  mirrorAnswers: Array<{ qi: number; choice: string }>
): Portrait {

  // Build answer map — qi=8 (Closeness) never scored by design
  const ans: Record<number, string> = {};
  mirrorAnswers.forEach(a => {
    if (typeof a.qi === 'number' && a.qi !== 8) {
      ans[a.qi] = (a.choice ?? '').toLowerCase().trim();
    }
  });

  // Classify each stored answer cleanly
  // 'a' = chose option A
  // 'b' = chose option B
  // 'typed' = user wrote their own answer
  // 'skip' = skipped
  function classify(val: string | undefined): 'a' | 'b' | 'typed' | 'skip' {
    if (!val || val === 'skip') return 'skip';
    if (val === 'a') return 'a';
    if (val === 'b') return 'b';
    return 'typed';
  }

  const c0 = classify(ans[0]); // Parents & Family
  const c5 = classify(ans[5]); // Responsibility
  const c6 = classify(ans[6]); // Expectations
  const c7 = classify(ans[7]); // Shared Finances

  // Count how many answers across ALL dimensions
  // were typed (not a, b, or skip)
  const typedCount = Object.values(ans).filter(
    v => v !== 'a' && v !== 'b' && v !== 'skip' && v !== ''
  ).length;

  // ── TRAIT 1: Steadiness — derived from qi=6 ──────────────────────
  // a = prefers calm and predictable home
  // b = drawn toward growth and change
  // typed = has their own nuanced sense of peace
  const trait1: Signal =
    c6 === 'a'
      ? { label: 'Steadiness under pressure',
          value: 'A defining strength',     pct: 88 }
    : c6 === 'typed'
      ? { label: 'Steadiness under pressure',
          value: 'Defined on their own terms', pct: 74 }
      : { label: 'Steadiness under pressure',
          value: 'Still unfolding',          pct: 50 };

  // ── TRAIT 2: Generosity — derived from qi=7 ──────────────────────
  // a = careful and security-minded
  // b = generous and open-handed
  // typed = has a nuanced relationship with giving
  const trait2: Signal =
    c7 === 'b'
      ? { label: 'Quiet generosity',
          value: 'A defining strength',      pct: 84 }
    : c7 === 'typed'
      ? { label: 'Quiet generosity',
          value: 'Expressed thoughtfully',   pct: 70 }
      : { label: 'Quiet generosity',
          value: 'Growing',                  pct: 58 };

  // ── TRAIT 3: Emotional openness — derived from qi=0 ──────────────
  // a = reaches toward family when things are hard
  // b = finds solitude first, then reaches out
  // typed = their relationship with closeness is layered
  const trait3: Signal =
    c0 === 'a'
      ? { label: 'Emotional openness',
          value: 'Growing',                  pct: 65 }
    : c0 === 'typed'
      ? { label: 'Emotional openness',
          value: 'Layered and genuine',      pct: 60 }
      : { label: 'Emotional openness',
          value: 'Still unfolding',          pct: 40 };

  // ── TRAIT 4 (conditional): Depth of self-knowledge ───────────────
  // Emerges when the user typed 2 or more of their own answers.
  // The act of writing their own answer on multiple dimensions
  // reveals genuine self-awareness — a character trait the
  // product values. We never reveal what they wrote.
  const trait4: Signal | null =
    typedCount >= 2
      ? { label: 'Depth of self-knowledge',
          value: 'A defining strength',      pct: 86 }
      : null;

  // ── QUOTE — built from qi=0, qi=5, qi=6 ──────────────────────────
  const part0 =
    c0 === 'a'       ? 'finds steadiness in family and roots'
    : c0 === 'typed' ? 'holds their own sense of what home means'
    :                  'carves their own quiet path';

  const part5 =
    c5 === 'a'       ? 'brings structure to a shared home'
    : c5 === 'typed' ? 'navigates home life on their own terms'
    :                  'adapts gracefully to what life asks';

  const part6 =
    c6 === 'a'       ? 'finds peace in the calm and dependable'
    : c6 === 'typed' ? 'knows what peace means to them'
    :                  'is drawn toward growth and the unexpected';

  // Build the final signals array
  // If trait4 earned, replace trait3 with it
  // so the card never shows more than 3 signals
  const signals: Signal[] = trait4
    ? [trait1, trait2, trait4]
    : [trait1, trait2, trait3];

  return {
    quote: `”Someone who ${part0}, ${part5}, and ${part6}.”`,
    signals,
  };
}

const FALLBACK_PORTRAIT: Portrait = {
  quote: '”Someone who finds steadiness in routine, gives quietly, and is learning to let people in.”',
  signals: [
    { label: 'Steadiness under pressure', value: 'High',    pct: 82 },
    { label: 'Quiet generosity',          value: 'High',    pct: 78 },
    { label: 'Emotional openness',        value: 'Growing', pct: 48 },
  ],
};

export function PortraitPage() {
  const navigate = useNavigate();
  const [portrait, setPortrait] = useState<Portrait>(FALLBACK_PORTRAIT);

  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;
    if (!user) return;
    const db = getFirestore();
    getDoc(doc(db, 'users', user.uid)).then(snap => {
      if (!snap.exists()) return;
      const data = snap.data();
      const raw = data.sakinah_mirror;
      let answers: Array<{ qi: number; choice: string }> = [];
      if (Array.isArray(raw)) {
        answers = raw;
      } else if (raw && typeof raw === 'object' && Array.isArray(raw.answers)) {
        answers = raw.answers;
      }
      if (answers.length > 0) {
        setPortrait(buildPortrait(answers));
      }
    }).catch(() => {});
  }, []);

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
      <SakinahSidebar activeItem="your-portrait" />

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
                Your portrait
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#5f6675',
                  marginTop: 3,
                  letterSpacing: '0.02em',
                }}
              >
                Drawn from your reflections
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ───────────────────────────────────────────── */}
        <div
          className="sk-page-body"
          style={{ flex: 1, overflowY: 'auto', padding: '32px 56px 80px' }}
        >
          <div style={{ maxWidth: 520, width: '100%' }}>

            {/* ── Portrait hero ─────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.04 }}
              style={{ textAlign: 'center', padding: '4px 0 20px' }}
            >
              {/* Aura circle */}
              <div
                style={{
                  width: 96,
                  height: 96,
                  borderRadius: '50%',
                  margin: '0 auto 12px',
                  background:
                    'radial-gradient(circle at 35% 30%, rgba(212,168,83,.4), transparent 55%), ' +
                    'radial-gradient(circle at 70% 75%, rgba(127,176,122,.3), transparent 55%), ' +
                    '#0f1521',
                  border: '1px solid rgba(212,168,83,.16)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 34,
                  color: '#e7c984',
                }}
              >
                ع
              </div>

              {/* Quote */}
              <div
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontSize: 16,
                  lineHeight: 1.5,
                  color: '#EDE7DA',
                  padding: '4px 6px',
                }}
              >
                {portrait.quote}
              </div>
            </motion.div>

            {/* ── Signals card ──────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              style={{
                background: 'linear-gradient(160deg, #111826, #0f1521)',
                border: '1px solid rgba(255,255,255,.06)',
                borderRadius: 22,
                padding: 18,
                marginBottom: 13,
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {/* Subtle corner glow */}
              <div
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 60,
                  height: 60,
                  background:
                    'radial-gradient(circle at top right, rgba(212,168,83,.16), transparent 70%)',
                  pointerEvents: 'none',
                }}
              />

              {/* Card label */}
              <div
                style={{
                  fontSize: 10,
                  letterSpacing: '0.3em',
                  textTransform: 'uppercase',
                  color: 'rgba(212,168,83,.55)',
                  marginBottom: 9,
                }}
              >
                What your gratitude reveals
              </div>

              {/* Signal rows */}
              {portrait.signals.map((sig, i) => (
                <div key={sig.label} style={{ marginTop: i > 0 ? 11 : 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '11px 0',
                      borderBottom:
                        i < portrait.signals.length - 1
                          ? '1px solid rgba(255,255,255,.06)'
                          : 'none',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 12,
                        color: '#9aa0ac',
                        fontWeight: 300,
                      }}
                    >
                      {sig.label}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 15,
                        color: '#e7c984',
                      }}
                    >
                      {sig.value}
                    </span>
                  </div>

                  {/* Meter bar */}
                  <div
                    style={{
                      height: 5,
                      borderRadius: 5,
                      background: 'rgba(255,255,255,.06)',
                      marginTop: 7,
                      overflow: 'hidden',
                    }}
                  >
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${sig.pct}%` }}
                      transition={{
                        duration: 0.9,
                        delay: 0.28 + i * 0.12,
                        ease: 'easeOut',
                      }}
                      style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #D4A853, #b98b39)',
                        borderRadius: 5,
                      }}
                    />
                  </div>
                </div>
              ))}
            </motion.div>

            {/* ── Raya closing note ─────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              style={{
                background: 'rgba(212,168,83,.04)',
                border: '1px solid rgba(212,168,83,.1)',
                borderRadius: 15,
                padding: '14px 16px',
                marginTop: 6,
                marginBottom: 18,
                display: 'flex',
                alignItems: 'flex-start',
                gap: 12,
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 16,
                  color: '#3a2c0c',
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                ر
              </div>
              <p
                style={{
                  fontSize: 12.5,
                  color: '#9aa0ac',
                  fontWeight: 300,
                  lineHeight: 1.6,
                  margin: 0,
                }}
              >
                This is yours. It won't be shared with anyone until you say so — and even
                then, only the resonance surfaces, never the raw words. You're ready to meet
                your considered few.
              </p>
            </motion.div>

            {/* ── Continue button ───────────────────────────────────────── */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.36 }}
              onClick={() => navigate('/sakinah/preferences')}
              className="sk-btn-gold"
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'center',
                border: 'none',
                cursor: 'pointer',
                fontFamily: "'Manrope', sans-serif",
                fontWeight: 600,
                fontSize: 14,
                letterSpacing: '0.3px',
                padding: 15,
                borderRadius: 15,
                background: 'linear-gradient(135deg, #D4A853, #b98b39)',
                color: '#0a0e15',
              }}
            >
              Set your preferences →
            </motion.button>

          </div>
        </div>
      </main>
    </div>
  );
}

export default PortraitPage;
