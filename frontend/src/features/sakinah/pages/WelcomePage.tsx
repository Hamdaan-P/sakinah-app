/**
 * WelcomePage — /sakinah/welcome
 * Raya's opening screen. Character-first: no form, no photo, just a gentle invitation.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';

const PAGE_BG = 'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

export function WelcomePage() {
  const navigate = useNavigate();

  return (
    <div
      className="overflow-hidden"
      style={{ display: 'flex', height: '100vh', background: PAGE_BG, color: '#EDE7DA', fontFamily: "'Manrope', sans-serif", WebkitFontSmoothing: 'antialiased' }}
    >
      <SakinahSidebar activeItem="raya-welcomes" />

      <main style={{ flex: 1, height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden' }}>
        {/* Ambient glow behind orb (was ::before pseudo-element) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse 55% 55% at 50% 50%, rgba(212,168,83,.05), transparent 70%)' }}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 48px', maxWidth: 560, width: '100%', position: 'relative' }}>

          {/* Orb + outer glow — breathing animation */}
          <div style={{ position: 'relative', width: 150, height: 150, marginBottom: 30, flexShrink: 0 }}>
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.5, 1] }}
              style={{ position: 'absolute', inset: -22, borderRadius: '50%', background: 'radial-gradient(circle, rgba(212,168,83,.22), transparent 68%)' }}
            />
            <motion.div
              animate={{ scale: [1, 1.06, 1] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', times: [0, 0.5, 1] }}
              style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle at 46% 42%, #fde6b8, #d9a948 38%, #7c5e22 72%, transparent 78%)' }}
            />
          </div>

          {/* Tag + Arabic — same delay group as original .d2 */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10, letterSpacing: '0.32em', textTransform: 'uppercase', color: 'rgba(212,168,83,.55)', marginBottom: 14 }}>
            Raya · your companion
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.12 }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 17, color: '#e7c984', marginBottom: 18 }}>
            السلام عليكم
          </motion.div>

          {/* Main copy */}
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.20 }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 25, lineHeight: 1.35, color: '#EDE7DA', fontWeight: 400, margin: 0 }}>
            I'm Raya. Looking for a spouse can feel like being{' '}
            <em style={{ color: '#e7c984' }}>measured</em> — endlessly. Here, we don't start with a photo, or a checklist.
          </motion.p>

          {/* Sub copy */}
          <motion.p initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.28 }}
            style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: '#9aa0ac', lineHeight: 1.35, margin: '18px 0 0' }}>
            We start with <em style={{ color: '#e7c984' }}>you</em>. Whenever you're ready.
          </motion.p>

          {/* CTA */}
          <motion.button
            initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.36 }}
            className="sk-btn-gold"
            onClick={() => navigate('/sakinah/role')}
            style={{
              display: 'block', width: '100%', maxWidth: 280, textAlign: 'center', border: 'none', cursor: 'pointer',
              fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.3px',
              padding: 15, borderRadius: 15, marginTop: 32,
              background: 'linear-gradient(135deg, #D4A853, #b98b39)', color: '#0a0e15',
            }}
          >
            Begin gently →
          </motion.button>
        </div>
      </main>
    </div>
  );
}

export default WelcomePage;
