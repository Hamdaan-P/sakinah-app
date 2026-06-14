/**
 * SafetyPage — /sakinah/safety
 * Support & Safety: how Sakinah protects users — especially women.
 * Tone: a warm promise, not a legal document.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

const PROMISES = [
  {
    icon: '⊙',
    title: 'No public profiles',
    body: 'You cannot be searched, browsed, or found by anyone outside your matched pool. You are invisible until you choose otherwise.',
  },
  {
    icon: '◈',
    title: 'Photos are protected',
    body: "Every photo is invisibly marked with the viewer's identity. If anything is ever misused, it traces back immediately. This protects you.",
  },
  {
    icon: '✦',
    title: 'Hard verification',
    body: 'Every person here has verified their real identity. A banned person cannot return under a new account.',
  },
  {
    icon: '◐',
    title: 'Report & human review',
    body: 'One tap to report. A real human reviews every report. Serious violations result in a permanent ban.',
  },
  {
    icon: '◎',
    title: 'Your wali can be present',
    body: 'At any point in your conversation, you can invite your guardian. The choice is always yours.',
  },
];

export function SafetyPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex', height: '100vh', background: PAGE_BG,
        color: '#EDE7DA', fontFamily: "'Manrope', sans-serif",
        WebkitFontSmoothing: 'antialiased', overflow: 'hidden',
      }}
    >
      <SakinahSidebar activeItem="safety-privacy" />

      <main style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* ── Header ── */}
        <div style={{ flexShrink: 0, padding: '36px 56px 26px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
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
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500, lineHeight: 1.02 }}>
                Safety & Privacy
              </div>
              <div style={{ fontSize: 11, color: '#5f6675', marginTop: 3, letterSpacing: '0.02em' }}>
                Support & safety · your protections
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="sk-page-body" style={{ flex: 1, overflowY: 'auto', padding: '28px 56px 60px' }}>
          <div style={{ maxWidth: 520, width: '100%' }}>

            {/* Raya opening */}
            <motion.div
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.04 }}
              style={{ display: 'flex', gap: 13, alignItems: 'flex-start', padding: '15px 16px', background: 'rgba(212,168,83,.03)', border: '1px solid rgba(212,168,83,.1)', borderRadius: 17, marginBottom: 22 }}
            >
              <div style={{ width: 34, height: 34, borderRadius: '50%', flexShrink: 0, background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: '#3a2c0c', marginTop: 1 }}>
                ر
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(212,168,83,.55)', marginBottom: 6 }}>
                  Raya
                </div>
                <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 15, color: '#EDE7DA', lineHeight: 1.5, margin: 0 }}>
                  "This is a safe room. Here is how we keep it that way."
                </p>
              </div>
            </motion.div>

            {/* Promise cards */}
            {PROMISES.map((promise, i) => (
              <motion.div
                key={promise.title}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 + i * 0.08 }}
                style={{ display: 'flex', gap: 14, alignItems: 'flex-start', padding: '16px', background: 'linear-gradient(160deg, rgba(17,24,38,.9), rgba(15,21,33,.9))', border: '1px solid rgba(255,255,255,.06)', borderRadius: 16, marginBottom: 10 }}
              >
                <div style={{ width: 40, height: 40, borderRadius: 12, flexShrink: 0, background: 'rgba(212,168,83,.07)', border: '1px solid rgba(212,168,83,.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17, color: '#D4A853' }}>
                  {promise.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13.5, fontWeight: 600, color: '#EDE7DA', marginBottom: 5, lineHeight: 1.25 }}>
                    {promise.title}
                  </div>
                  <div style={{ fontSize: 12.5, color: '#9aa0ac', fontWeight: 300, lineHeight: 1.65 }}>
                    {promise.body}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* CTA — quiet gold */}
            <motion.button
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.56 }}
              onClick={() => navigate('/sakinah')}
              style={{ display: 'block', width: '100%', textAlign: 'center', border: '1px solid rgba(212,168,83,.28)', cursor: 'pointer', fontFamily: "'Manrope', sans-serif", fontWeight: 500, fontSize: 14, letterSpacing: '0.2px', padding: '14px 20px', borderRadius: 15, background: 'rgba(212,168,83,.06)', color: '#e7c984', marginTop: 16, transition: '.2s' }}
            >
              I feel safe here
            </motion.button>

          </div>
        </div>
      </main>

      {/* Raya FAB */}
      <div
        onClick={() => navigate('/sakinah/vent')}
        className="sk-raya-fab"
        title="Speak with Raya"
        style={{ position: 'fixed', bottom: 32, right: 32, width: 52, height: 52, borderRadius: '50%', background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 22, color: '#3a2c0c', cursor: 'pointer', boxShadow: '0 4px 24px rgba(212,168,83,.22), 0 0 0 1px rgba(212,168,83,.18)', zIndex: 100 }}
      >
        ر
      </div>
    </div>
  );
}

export default SafetyPage;
