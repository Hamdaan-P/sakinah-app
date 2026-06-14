/**
 * CommunityPage — /sakinah/community
 * Optional Islamic gatherings — completely separate from matching.
 * No points, no progress bars, no leaderboards.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

const GATHERINGS = [
  {
    type: 'Study circle',
    symbol: '◎',
    title: 'A surah, together',
    desc: 'A small group gathering around a surah or topic. No pressure, no performance — just presence and reflection.',
    when: 'Every Sunday · open to all',
  },
  {
    type: 'Community iftar',
    symbol: '◗',
    title: 'Share a table',
    desc: 'Share a meal with people who share your values. Conversation happens naturally. Nothing more is required of you.',
    when: 'During Ramadan · and beyond',
  },
  {
    type: 'Workshop',
    symbol: '◈',
    title: 'Marriage preparation',
    desc: 'Learn together what a healthy, Islamic marriage looks like — in a room with others on the same path. Taught by a scholar-counsellor.',
    when: 'Monthly · for seekers',
  },
];

export function CommunityPage() {
  const navigate = useNavigate();

  return (
    <div
      style={{
        display: 'flex', height: '100vh', background: PAGE_BG,
        color: '#EDE7DA', fontFamily: "'Manrope', sans-serif",
        WebkitFontSmoothing: 'antialiased', overflow: 'hidden',
      }}
    >
      <SakinahSidebar activeItem="community" />

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
                Community
              </div>
              <div style={{ fontSize: 11, color: '#5f6675', marginTop: 3, letterSpacing: '0.02em' }}>
                Support & safety · gatherings
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
                  "This is a place to belong — not a leaderboard, not a shortcut to matches."
                </p>
              </div>
            </motion.div>

            {/* Gathering cards */}
            {GATHERINGS.map((g, i) => (
              <motion.div
                key={g.title}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.12 + i * 0.09 }}
                style={{ background: 'linear-gradient(160deg, rgba(17,24,38,.9), rgba(15,21,33,.9))', border: '1px solid rgba(255,255,255,.06)', borderRadius: 18, padding: '18px 18px 16px', marginBottom: 12 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 11 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 10, background: 'rgba(212,168,83,.07)', border: '1px solid rgba(212,168,83,.14)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, color: '#D4A853', flexShrink: 0 }}>
                    {g.symbol}
                  </div>
                  <span style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(212,168,83,.55)' }}>
                    {g.type}
                  </span>
                </div>
                <div style={{ fontSize: 15, fontFamily: "'Cormorant Garamond', serif", fontWeight: 500, color: '#EDE7DA', marginBottom: 7, lineHeight: 1.2 }}>
                  {g.title}
                </div>
                <div style={{ fontSize: 12.5, color: '#9aa0ac', fontWeight: 300, lineHeight: 1.65, marginBottom: 10 }}>
                  {g.desc}
                </div>
                <div style={{ fontSize: 10, fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.08em', color: '#5f6675' }}>
                  {g.when}
                </div>
              </motion.div>
            ))}

            {/* Principle callout */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.42 }}
              style={{ borderLeft: '3px solid rgba(212,168,83,.4)', borderRadius: '0 12px 12px 0', background: 'rgba(212,168,83,.035)', padding: '14px 18px', marginTop: 6 }}
            >
              <p style={{ fontFamily: "'Cormorant Garamond', serif", fontStyle: 'italic', fontSize: 15.5, color: '#EDE7DA', lineHeight: 1.65, margin: 0 }}>
                Participating in community never affects your matches. It is never scored. It is never a gate to anything. It is simply good.
              </p>
            </motion.div>

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

export default CommunityPage;
