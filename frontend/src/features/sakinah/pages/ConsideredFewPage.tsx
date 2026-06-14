/**
 * ConsideredFewPage — /sakinah
 * Stage D · Phase 4: The pool — a small, curated set of candidates.
 * Character-first: no photos, no feed, no "who liked you."
 * Cap active conversations at 1–2. Pass on one, the next takes its place.
 * TODO: replace MOCK_POOL with sakinahService.getCuratedPool(user.id) once service layer is wired.
 */

import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';
import { usePool } from '../hooks';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

// ── Placeholder pool — 3 reference candidates ────────────────────────────────
// Replace with sakinahService.getCuratedPool(user.id) when service is wired.
type PoolCandidate = {
  uid: string;
  initial: string;      // Arabic glyph — never a photo
  name: string;
  age: number;
  city: string;
  tradition: string;
  resonance: string;    // derived resonance blurb — no raw answers
};


export function ConsideredFewPage() {
  const navigate = useNavigate();

  const { pool, loading, error, handleInterest, handlePass } = usePool();
  const activeConversations = pool.filter((p: any) => p.has_active_conversation).length;

  const atCap = activeConversations >= 2;

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
      <SakinahSidebar activeItem="considered-few" />

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
                Your considered few
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#5f6675',
                  marginTop: 3,
                  letterSpacing: '0.02em',
                }}
              >
                Phase 4 · curated, never a feed
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

            {loading ? (
              <LoadingSkeleton />
            ) : pool.length === 0 ? (
              <EmptyPool />
            ) : (
              <>
                {/* Active-conversation cap warning */}
                <AnimatePresence>
                  {atCap && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      style={{
                        background: 'rgba(201,138,138,.07)',
                        border: '1px solid rgba(201,138,138,.25)',
                        borderRadius: 13,
                        padding: '11px 13px',
                        fontSize: 11.5,
                        color: '#d6a8a8',
                        fontWeight: 300,
                        lineHeight: 1.5,
                        marginBottom: 13,
                        textAlign: 'center',
                      }}
                    >
                      You're actively pursuing{' '}
                      <b style={{ fontWeight: 600, color: '#e0b8b8' }}>
                        {activeConversations} conversations
                      </b>{' '}
                      — the cap is two. Close one before opening another.
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Active banner */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.04 }}
                  style={{
                    background: 'rgba(212,168,83,.05)',
                    border: '1px solid rgba(212,168,83,.16)',
                    borderRadius: 13,
                    padding: '11px 13px',
                    fontSize: 11.5,
                    color: '#e7c984',
                    fontWeight: 300,
                    lineHeight: 1.5,
                    marginBottom: 13,
                    textAlign: 'center',
                  }}
                >
                  A handful to reflect on — not an endless scroll. Pass on one, the next takes
                  its place. You may{' '}
                  <b style={{ fontWeight: 600, color: '#EDE7DA' }}>
                    actively pursue only one or two
                  </b>
                  .
                </motion.div>

                {/* Pool cards */}
                <AnimatePresence>
                  {pool.map((candidate, i) => (
                    <PoolCard
                      key={candidate.uid}
                      candidate={candidate}
                      delay={0.12 + i * 0.08}
                      onClick={() => {
                        // TODO: navigate to /sakinah/candidate/:uid when candidate detail page is built
                        navigate('/sakinah/candidate');
                      }}
                    />
                  ))}
                </AnimatePresence>

                {/* Insight note */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.12 + pool.length * 0.08 + 0.08 }}
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
                  In a thin week you'll see fewer — and we'll say so honestly.{' '}
                  <em style={{ fontStyle: 'italic', color: '#e7c984' }}>
                    "We'd rather show you no one than the wrong one."
                  </em>
                </motion.div>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}

export default ConsideredFewPage;

// ── Sub-components ────────────────────────────────────────────────────────────

function PoolCard({
  candidate,
  delay,
  onClick,
}: {
  candidate: PoolCandidate;
  delay: number;
  onClick: () => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, transition: { duration: 0.22 } }}
      transition={{ duration: 0.5, delay }}
      onClick={onClick}
      className="sk-pool-card"
      style={{
        display: 'flex',
        gap: 13,
        alignItems: 'center',
        border: '1px solid rgba(255,255,255,.06)',
        borderRadius: 17,
        padding: 14,
        marginBottom: 10,
        cursor: 'pointer',
        transition: 'border-color .22s, transform .22s',
        background: 'rgba(255,255,255,.012)',
      }}
    >
      {/* Aura — initial only, never a photo */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          flexShrink: 0,
          background:
            'radial-gradient(circle at 40% 35%, rgba(201,138,138,.4), transparent 55%), ' +
            'radial-gradient(circle at 70% 70%, rgba(212,168,83,.32), transparent 55%), ' +
            '#0f1521',
          border: '1px solid rgba(212,168,83,.16)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 19,
          color: '#EDE7DA',
        }}
      >
        {candidate.initial}
      </div>

      {/* Text */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <b style={{ fontSize: 14.5, display: 'block', color: '#EDE7DA' }}>
          {candidate.name} · {candidate.age}
        </b>
        <div
          style={{
            fontSize: 10,
            color: '#5f6675',
            margin: '1px 0 4px',
          }}
        >
          {candidate.city} · {candidate.tradition} · Verified
        </div>
        <div
          style={{
            fontSize: 11,
            color: '#e7c984',
            fontWeight: 300,
          }}
        >
          {candidate.resonance}
        </div>
      </div>

      {/* Navigation arrow */}
      <div
        style={{
          marginLeft: 'auto',
          color: '#5f6675',
          fontSize: 17,
          flexShrink: 0,
        }}
      >
        ›
      </div>
    </motion.div>
  );
}

function EmptyPool() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.12 }}
    >
      {/* Honest empty-state banner */}
      <div
        style={{
          background: 'rgba(212,168,83,.04)',
          border: '1px solid rgba(212,168,83,.1)',
          borderRadius: 18,
          padding: '28px 22px',
          textAlign: 'center',
          marginBottom: 13,
        }}
      >
        <div
          style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 32,
            color: 'rgba(212,168,83,.35)',
            marginBottom: 14,
            lineHeight: 1,
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
            lineHeight: 1.2,
          }}
        >
          Your pool is quiet this week
        </div>
        <p
          style={{
            fontSize: 12.5,
            color: '#9aa0ac',
            fontWeight: 300,
            lineHeight: 1.6,
            maxWidth: 340,
            margin: '0 auto',
          }}
        >
          Curation takes time. We check daily — and we'll only show someone when the
          resonance is genuine.
        </p>
      </div>

      {/* Honest note */}
      <div
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
        In a thin week you'll see fewer — and we'll say so honestly.{' '}
        <em style={{ fontStyle: 'italic', color: '#e7c984' }}>
          "We'd rather show you no one than the wrong one."
        </em>
      </div>

      {/* Raya note */}
      <div
        style={{
          background: 'rgba(212,168,83,.03)',
          border: '1px solid rgba(212,168,83,.08)',
          borderRadius: 13,
          padding: '14px 16px',
          display: 'flex',
          alignItems: 'flex-start',
          gap: 12,
          marginTop: 6,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 15,
            color: '#3a2c0c',
            flexShrink: 0,
            marginTop: 1,
          }}
        >
          ر
        </div>
        <p
          style={{
            fontSize: 12,
            color: '#9aa0ac',
            fontWeight: 300,
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          The wait itself is part of the journey — not a flaw in it. Your portrait is
          ready; the right resonance will come.
        </p>
      </div>
    </motion.div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, paddingTop: 8 }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0 }}
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: i * 0.15 }}
          style={{
            height: 80,
            borderRadius: 17,
            background: 'rgba(255,255,255,.03)',
            border: '1px solid rgba(255,255,255,.04)',
          }}
        />
      ))}
    </div>
  );
}
