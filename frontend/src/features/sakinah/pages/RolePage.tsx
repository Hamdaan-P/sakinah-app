/**
 * RolePage — /sakinah/role
 * Stage A · Entry: The user chooses whether they are a seeker or a wali.
 * Two equal, dignified options — no option looks more correct than the other.
 * Continue button appears only after a choice is made.
 * Role is saved to localStorage as 'sakinah_role' for downstream pages to read.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';
import { saveRole } from '../services/sakinahService';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

type Role = 'seeker' | 'wali';

const LANES: Array<{ key: Role; glyph: string; title: string; desc: string }> = [
  {
    key:   'seeker',
    glyph: 'ع',
    title: 'I am a Seeker',
    desc:  'Walk the journey yourself — at your pace, with Raya beside you the whole way.',
  },
  {
    key:   'wali',
    glyph: '۩',
    title: 'I am a Wali',
    desc:  'Help someone you love — steward alongside them. The decision stays theirs.',
  },
];

export function RolePage() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role | null>(null);

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
      <SakinahSidebar activeItem="who-are-you" />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        <div
          className="sk-page-body"
          style={{ flex: 1, overflowY: 'auto', padding: '48px 56px 80px' }}
        >
          <div style={{ maxWidth: 480, width: '100%' }}>

            {/* Raya intro */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.04 }}
              style={{
                display: 'flex',
                gap: 13,
                alignItems: 'flex-start',
                marginBottom: 32,
                padding: '16px',
                background: 'rgba(212,168,83,.03)',
                border: '1px solid rgba(212,168,83,.1)',
                borderRadius: 17,
              }}
            >
              <div
                style={{
                  width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                  background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 17, color: '#3a2c0c', marginTop: 1,
                }}
              >
                ر
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9, letterSpacing: '0.22em',
                    textTransform: 'uppercase', color: 'rgba(212,168,83,.55)',
                    marginBottom: 6,
                  }}
                >
                  Raya
                </div>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic', fontSize: 16,
                    color: '#EDE7DA', lineHeight: 1.5, margin: 0,
                  }}
                >
                  Before we begin — who are you here as? This shapes how Raya guides you.
                </p>
              </div>
            </motion.div>

            {/* Role lanes — equal visual weight */}
            {LANES.map((lane, i) => {
              const sel = role === lane.key;
              return (
                <motion.div
                  key={lane.key}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.12 + i * 0.1 }}
                  onClick={() => setRole(lane.key)}
                  className="sk-lane"
                  style={{
                    border: `1px solid ${sel ? '#D4A853' : 'rgba(255,255,255,.07)'}`,
                    borderRadius: 20,
                    padding: 20,
                    marginBottom: 13,
                    cursor: 'pointer',
                    position: 'relative',
                    background: sel ? 'rgba(212,168,83,.06)' : 'transparent',
                    transition: 'border-color .22s, background .22s, transform .22s',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute', top: 22, right: 20,
                      color: '#5f6675', fontSize: 20,
                    }}
                  >
                    {sel ? '✓' : '›'}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 28, color: '#D4A853', marginBottom: 6,
                    }}
                  >
                    {lane.glyph}
                  </div>
                  <h3
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontWeight: 500, fontSize: 21,
                      marginBottom: 5, color: '#EDE7DA', lineHeight: 1.15,
                    }}
                  >
                    {lane.title}
                  </h3>
                  <p
                    style={{
                      fontSize: 12, color: '#9aa0ac',
                      fontWeight: 300, lineHeight: 1.5, margin: 0,
                    }}
                  >
                    {lane.desc}
                  </p>
                </motion.div>
              );
            })}

            {/* Continue button — fades in after selection */}
            <AnimatePresence>
              {role && (
                <motion.button
                  key="continue"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 8 }}
                  transition={{ duration: 0.22 }}
                  onClick={() => {
                    localStorage.setItem('sakinah_role', role!);
                    saveRole(role!).catch(err => console.error('saveRole failed:', err));
                    navigate(role === 'wali' ? '/sakinah/wali-login' : '/sakinah/expect');
                  }}
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
                  Continue →
                </motion.button>
              )}
            </AnimatePresence>

          </div>
        </div>
      </main>
    </div>
  );
}

export default RolePage;
