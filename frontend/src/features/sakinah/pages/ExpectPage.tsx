/**
 * ExpectPage — /sakinah/expect
 * Stage A · Before we begin: Raya explains what this journey is — and isn't.
 * Not a list of features. A human, calm explanation followed by four
 * warm promises. No pressure, no timer, no wrong answers.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

const PRIMS = [
  {
    icon: '☉',
    title: 'Never a blank page',
    desc: 'Raya guides every step. You only write if you want to.',
  },
  {
    icon: '◷',
    title: 'Your pace, always',
    desc: 'Pause and return anytime. There is no timer, no pressure to keep up.',
  },
  {
    icon: '⌥',
    title: 'Speak, don\'t type',
    desc: 'Urdu, Hindi, Tamil, English — Raya listens. Words come easier than forms.',
  },
  {
    icon: '✓',
    title: 'No wrong answers',
    desc: 'A mirror, not a test. You cannot get this wrong.',
  },
];

export function ExpectPage() {
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
      <SakinahSidebar activeItem="what-to-expect" />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            flexShrink: 0,
            padding: '36px 56px 26px',
            borderBottom: '1px solid rgba(255,255,255,.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => navigate('/sakinah/role')}
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
                Before we begin
              </div>
              <div style={{ fontSize: 11, color: '#5f6675', marginTop: 3, letterSpacing: '0.02em' }}>
                What this journey is — and isn't
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div
          className="sk-page-body"
          style={{ flex: 1, overflowY: 'auto', padding: '26px 56px 80px' }}
        >
          <div style={{ maxWidth: 480, width: '100%' }}>

            {/* Raya's explanation */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.04 }}
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontStyle: 'italic',
                fontSize: 16, lineHeight: 1.6,
                color: '#EDE7DA', marginBottom: 22,
              }}
            >
              This is not a search. You won't browse profiles or swipe. Raya will bring you a small, considered few — people whose character and values resonate with yours. You'll get to know them through conversation, with your family aware, at your own pace.
            </motion.p>

            {/* Four warm promise cards */}
            {PRIMS.map((p, i) => (
              <motion.div
                key={p.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: 0.12 + i * 0.08 }}
                style={{
                  display: 'flex',
                  gap: 13, alignItems: 'flex-start',
                  border: '1px solid rgba(255,255,255,.07)',
                  borderRadius: 15, padding: 15, marginBottom: 10,
                  background: 'rgba(255,255,255,.012)',
                }}
              >
                {/* Icon badge */}
                <div
                  style={{
                    width: 38, height: 38, borderRadius: 12, flexShrink: 0,
                    background: 'rgba(212,168,83,.07)',
                    border: '1px solid rgba(212,168,83,.16)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 18, color: '#D4A853',
                  }}
                >
                  {p.icon}
                </div>
                <div>
                  <div
                    style={{
                      fontSize: 13.5, fontWeight: 500,
                      marginBottom: 3, color: '#EDE7DA',
                    }}
                  >
                    {p.title}
                  </div>
                  <p
                    style={{
                      fontSize: 11.5, color: '#9aa0ac',
                      fontWeight: 300, lineHeight: 1.5, margin: 0,
                    }}
                  >
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.44 }}
              onClick={() => navigate('/sakinah/register')}
              className="sk-btn-gold"
              style={{
                display: 'block', width: '100%',
                textAlign: 'center', border: 'none', cursor: 'pointer',
                fontFamily: "'Manrope', sans-serif", fontWeight: 600,
                fontSize: 14, letterSpacing: '0.3px',
                padding: 15, borderRadius: 15, marginTop: 6,
                background: 'linear-gradient(135deg, #D4A853, #b98b39)',
                color: '#0a0e15',
              }}
            >
              Begin gently →
            </motion.button>

          </div>
        </div>
      </main>
    </div>
  );
}

export default ExpectPage;
