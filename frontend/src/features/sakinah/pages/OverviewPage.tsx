/**
 * OverviewPage — /sakinah/overview
 * Stage B · Journey overview: A calm visual map of all five stages of
 * the Sakinah journey. Not a checklist — a flowing path to understand
 * where this leads before taking the first step.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';
import '../sakinah.css';
import RayaOrbButton from '../components/RayaOrbButton';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

interface Stage {
  letter: string;
  name: string;
  desc: string;
  items: string[];
}

const STAGES: Stage[] = [
  {
    letter: 'A',
    name: 'Arrival',
    desc: 'Intention, values, and identity — Raya begins with who you are, before asking who you seek.',
    items: ['Niyyah · your intention', 'Values + tradition', 'Identity verified'],
  },
  {
    letter: 'B',
    name: 'The Building',
    desc: 'Nine quiet reflections become your character portrait — the foundation everything rests on.',
    items: ['The Mirror · 9 reflections', 'Your portrait revealed'],
  },
  {
    letter: 'C',
    name: 'Your Considered Few',
    desc: 'A small, curated handful brought to you — never a feed, never a swipe. Each one resonates.',
    items: ['3–5 considered candidates', 'Character first · no photo yet'],
  },
  {
    letter: 'D',
    name: 'Matching',
    desc: 'Guided conversation, one topic at a time, with your family aware. Then a dignified decision.',
    items: ['Match flow · a structured opening', 'Communication · 8 topics', 'The decision — yours alone'],
  },
  {
    letter: 'S',
    name: 'Support',
    desc: 'Safety and privacy, a scholar when you need one, and a community that never measures you.',
    items: ['Safety & privacy', 'Scholar-counsellor', 'Community'],
  },
];

export function OverviewPage() {
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
      <SakinahSidebar activeItem="journey-overview" />

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
                The journey
              </div>
              <div style={{ fontSize: 11, color: '#5f6675', marginTop: 3, letterSpacing: '0.02em' }}>
                Five stages · from arrival to a considered decision
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div
          className="sk-page-body"
          style={{ flex: 1, overflowY: 'auto', padding: '28px 56px 80px' }}
        >
          <div style={{ maxWidth: 500, width: '100%' }}>

            {/* Intro line */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.04 }}
              style={{
                fontSize: 13, color: '#9aa0ac',
                fontWeight: 300, lineHeight: 1.6,
                marginBottom: 26,
              }}
            >
              Every stage unfolds at your pace. Nothing unlocks before you're ready — and Raya walks beside you the whole way.
            </motion.p>

            {/* Stage journey rail */}
            {STAGES.map((stage, i) => {
              const isLast = i === STAGES.length - 1;
              return (
                <motion.div
                  key={stage.letter}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45, delay: 0.12 + i * 0.1 }}
                  style={{ display: 'flex', gap: 16 }}
                >
                  {/* Left rail: node + connector line */}
                  <div
                    style={{
                      display: 'flex', flexDirection: 'column',
                      alignItems: 'center', flexShrink: 0, width: 34,
                    }}
                  >
                    {/* Stage node */}
                    <div
                      style={{
                        width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                        border: '1px solid rgba(212,168,83,.35)',
                        background: 'rgba(212,168,83,.04)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'JetBrains Mono', monospace",
                        fontSize: 11, color: '#D4A853',
                        zIndex: 2,
                      }}
                    >
                      {stage.letter}
                    </div>

                    {/* Connecting line (not shown after last stage) */}
                    {!isLast && (
                      <div
                        style={{
                          flex: 1, width: 1.5,
                          background: 'rgba(212,168,83,.13)',
                          minHeight: 24,
                          marginTop: 2, marginBottom: 2,
                        }}
                      />
                    )}
                  </div>

                  {/* Stage body */}
                  <div style={{ flex: 1, paddingBottom: isLast ? 0 : 22 }}>
                    <div
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 19, fontWeight: 500,
                        color: '#EDE7DA', lineHeight: 1.15,
                        marginBottom: 5,
                      }}
                    >
                      {stage.name}
                    </div>
                    <p
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        fontStyle: 'italic',
                        fontSize: 13.5, color: '#9aa0ac',
                        fontWeight: 400, lineHeight: 1.5,
                        margin: '0 0 9px',
                      }}
                    >
                      {stage.desc}
                    </p>
                    {/* Item tags */}
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                      {stage.items.map((item) => (
                        <span
                          key={item}
                          style={{
                            fontSize: 10, letterSpacing: '0.06em',
                            color: 'rgba(212,168,83,.6)',
                            border: '1px solid rgba(212,168,83,.14)',
                            borderRadius: 20, padding: '3px 9px',
                            fontFamily: "'Manrope', sans-serif",
                            fontWeight: 400,
                          }}
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}

            {/* CTA */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.62 }}
              onClick={() => navigate('/sakinah/niyyah')}
              className="sk-btn-gold"
              style={{
                display: 'block', width: '100%',
                textAlign: 'center', border: 'none', cursor: 'pointer',
                fontFamily: "'Manrope', sans-serif", fontWeight: 600,
                fontSize: 14, letterSpacing: '0.3px',
                padding: 15, borderRadius: 15, marginTop: 28,
                background: 'linear-gradient(135deg, #D4A853, #b98b39)',
                color: '#0a0e15',
              }}
            >
              I am ready →
            </motion.button>

          </div>
        </div>
      </main>
      <RayaOrbButton page="overview" />
    </div>
  );
}

export default OverviewPage;
