/**
 * PortraitPage — /sakinah/portrait
 * Stage C · Phase 3 close: Your portrait — derived signal summary drawn from Mirror reflections.
 * Warm and affirming. No raw answers exposed. Private by design.
 * TODO: replace static signals + quote with values derived via sakinahService once service layer is wired.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

// Placeholder portrait — static for v1; will be derived from Mirror answers via backend.
const PORTRAIT_QUOTE =
  '“Someone who finds steadiness in routine, gives quietly, and is learning to let people in.”';

const SIGNALS: { label: string; value: string; pct: number }[] = [
  { label: 'Steadiness under pressure', value: 'High',    pct: 82 },
  { label: 'Quiet generosity',          value: 'High',    pct: 78 },
  { label: 'Emotional openness',        value: 'Growing', pct: 48 },
];

export function PortraitPage() {
  const navigate = useNavigate();

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
                {PORTRAIT_QUOTE}
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
              {SIGNALS.map((sig, i) => (
                <div key={sig.label} style={{ marginTop: i > 0 ? 11 : 0 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '11px 0',
                      borderBottom:
                        i < SIGNALS.length - 1
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

            {/* ── Insight note ──────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.20 }}
              style={{
                fontSize: 11.5,
                lineHeight: 1.6,
                color: '#9aa0ac',
                fontWeight: 300,
                borderLeft: '2px solid #D4A853',
                paddingLeft: 13,
                margin: '13px 0',
              }}
            >
              No raw answer is shown to anyone — only soft, derived resonance, after mutual
              interest. Standing comes from <b style={{ color: '#EDE7DA', fontWeight: 500 }}>verification</b>,
              not displayed worship.
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
