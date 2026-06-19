/**
 * ConsideredFewPage — /sakinah
 * Stage D · Phase 4: The pool — a small, curated set of candidates.
 * Character-first: no photos, no feed, no "who liked you."
 * Cap active conversations at 1–2. Pass on one, the next takes its place.
 * TODO: replace MOCK_POOL with sakinahService.getCuratedPool(user.id) once service layer is wired.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, query, where, getDocs, doc, updateDoc, onSnapshot } from 'firebase/firestore';
import { SakinahSidebar } from './components/SakinahSidebar';
import { usePool } from '../hooks';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/config/firebase.config';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

const RAYA_HELP = [
  {
    id: 'r1', icon: '☉',
    label: 'Help me understand this person',
    reply: "Look at the resonance note — that's what Raya saw between your portraits. Start there, not with the details.",
  },
  {
    id: 'r2', icon: '?',
    label: 'Why so few names?',
    reply: "A small, considered list is the point. We'd rather you sit with three carefully chosen people than scroll past thirty.",
  },
  {
    id: 'r3', icon: '⌥',
    label: "I'm not sure about any of them",
    reply: "That's okay — uncertainty at this stage is normal. You don't need certainty to begin a conversation. Curiosity is enough.",
  },
  {
    id: 'r4', icon: '◷',
    label: 'I just need a moment',
    reply: "Take all the time you need. Your pool waits — nothing moves without your intention.",
  },
] as const;

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

  const [rayaOpen, setRayaOpen] = useState(false);
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) return;
      const q = query(
        collection(db, 'sakinah_notifications'),
        where('to_uid', '==', user.uid),
        where('type', '==', 'interest_expressed'),
      );
      getDocs(q)
        .then(snap => {
          const unread = snap.docs
            .filter(d => d.data().read === false)
            .map(d => ({ id: d.id, ...d.data() }));
          setNotifications(unread);
        })
        .catch(console.error);
    });
    return () => unsub();
  }, []);

  // Real-time listener — redirects User A the moment mutual interest is confirmed.
  // Firestore does not support OR across different fields, so two queries are required.
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;

    const handleSnap = (snap: any) => {
      const match = snap.docs.find((d: any) => {
        const data = d.data();
        return data.mutual_yes === true && data.decision_outcome === null;
      });
      if (match) {
        navigate(`/sakinah/matchflow/${match.data().match_id}`);
      }
    };

    const qA = query(
      collection(db, 'sakinah_matches'),
      where('user_a_uid', '==', uid),
      where('mutual_yes', '==', true),
      where('decision_outcome', '==', null),
    );
    const qB = query(
      collection(db, 'sakinah_matches'),
      where('user_b_uid', '==', uid),
      where('mutual_yes', '==', true),
      where('decision_outcome', '==', null),
    );

    const unsubA = onSnapshot(qA, handleSnap, console.error);
    const unsubB = onSnapshot(qB, handleSnap, console.error);

    return () => { unsubA(); unsubB(); };
  }, [navigate]);

  const dismissNotification = async (notifId: string) => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
    try {
      await updateDoc(doc(db, 'sakinah_notifications', notifId), { read: true });
    } catch (e) {
      console.error('Failed to mark notification read:', e);
    }
  };
  function openRaya() { setActiveHelp(null); setRayaOpen(true); }
  function toggleHelp(id: string) { setActiveHelp(prev => prev === id ? null : id); }

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

            {/* ── Interest notifications ──────────────────────────────────── */}
            <AnimatePresence>
              {notifications.length > 0 && (() => {
                const notif = notifications[0];
                const pronoun = notif.from_gender === 'male' ? 'his' : 'her';
                return (
                  <motion.div
                    key={notif.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.35 }}
                    style={{
                      background: 'rgba(212,168,83,.07)',
                      border: '1px solid rgba(212,168,83,.35)',
                      borderRadius: 15,
                      padding: '14px 16px',
                      marginBottom: 16,
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: 12,
                    }}
                  >
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: 'radial-gradient(circle at 38% 32%, rgba(212,168,83,.45), rgba(185,139,57,.2))',
                      border: '1px solid rgba(212,168,83,.35)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: "'Cormorant Garamond', serif", fontSize: 16, color: '#D4A853',
                    }}>
                      ◉
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ margin: '0 0 4px', fontSize: 13.5, color: '#EDE7DA', fontWeight: 500, lineHeight: 1.4 }}>
                        {notif.from_name} has expressed interest in you.
                      </p>
                      <p style={{ margin: 0, fontSize: 12, color: '#9aa0ac', fontWeight: 300, lineHeight: 1.55 }}>
                        When you feel ready, you may visit {pronoun} profile.
                      </p>
                      {notifications.length > 1 && (
                        <p style={{ margin: '6px 0 0', fontSize: 10.5, color: 'rgba(212,168,83,.55)', fontFamily: "'JetBrains Mono', monospace", letterSpacing: '0.04em' }}>
                          +{notifications.length - 1} more
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => dismissNotification(notif.id)}
                      aria-label="Dismiss"
                      style={{
                        background: 'none', border: 'none', cursor: 'pointer',
                        color: '#5f6675', fontSize: 22, lineHeight: 1,
                        padding: '0 0 0 4px', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.color = '#EDE7DA')}
                      onMouseLeave={e => (e.currentTarget.style.color = '#5f6675')}
                    >×</button>
                  </motion.div>
                );
              })()}
            </AnimatePresence>

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
                      onClick={() => navigate(`/sakinah/candidate/${candidate.uid}`)}
                    />
                  ))}
                </AnimatePresence>

              </>
            )}

          </div>
        </div>

        {/* ── Raya FAB ─────────────────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute', right: 20, bottom: 22, zIndex: 80,
            display: 'flex', alignItems: 'center', gap: 9, cursor: 'pointer',
          }}
          onClick={openRaya}
        >
          <AnimatePresence>
            {!rayaOpen && (
              <motion.div
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }} transition={{ delay: 3.4, duration: 0.4 }}
                style={{
                  background: 'rgba(8,11,17,.92)', border: '1px solid rgba(212,168,83,.16)',
                  borderRadius: 30, padding: '8px 14px', fontSize: 11, color: '#e7c984',
                  whiteSpace: 'nowrap', fontWeight: 300, backdropFilter: 'blur(8px)',
                }}
              >
                Need help?{' '}
                <b style={{ color: '#EDE7DA', fontWeight: 500 }}>Raya's here.</b>
              </motion.div>
            )}
          </AnimatePresence>
          <div
            className="sk-raya-halo"
            style={{
              width: 54, height: 54, borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: '#3a2c0c',
              boxShadow: '0 8px 22px rgba(212,168,83,.35)', position: 'relative',
              flexShrink: 0, transition: 'transform .2s',
            }}
          >
            ر
          </div>
        </div>

        {/* ── Raya scrim ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {rayaOpen && (
            <motion.div
              key="scrim" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setRayaOpen(false)}
              style={{
                position: 'absolute', inset: 0, background: 'rgba(5,7,11,.6)',
                zIndex: 90, backdropFilter: 'blur(2px)',
              }}
            />
          )}
        </AnimatePresence>

        {/* ── Raya bottom sheet ─────────────────────────────────────────── */}
        <AnimatePresence>
          {rayaOpen && (
            <motion.div
              key="sheet" initial={{ y: '110%' }} animate={{ y: 0 }} exit={{ y: '110%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'absolute', left: 0, right: 0, bottom: 0, zIndex: 95,
                background: 'linear-gradient(180deg, #141b29, #0f1521)',
                borderTop: '1px solid rgba(212,168,83,.16)', borderRadius: '26px 26px 0 0',
                padding: '20px 20px 28px', maxHeight: '76%', overflowY: 'auto', scrollbarWidth: 'none',
              }}
            >
              <div style={{ width: 38, height: 4, borderRadius: 4, background: 'rgba(212,168,83,.16)', margin: '0 auto 14px' }} />
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Cormorant Garamond', serif", fontSize: 19, color: '#3a2c0c', flexShrink: 0,
                }}>ر</div>
                <div>
                  <b style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 20, fontWeight: 500, display: 'block' }}>Raya</b>
                  <span style={{ fontSize: 10, color: '#7FB07A', letterSpacing: '0.04em' }}>● always here to help</span>
                </div>
                <button
                  onClick={() => setRayaOpen(false)}
                  style={{
                    marginLeft: 'auto', background: 'none', border: 'none', cursor: 'pointer',
                    color: '#6b7280', fontSize: 22, lineHeight: 1, minWidth: 44, minHeight: 44,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 8, flexShrink: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
                  aria-label="Close Raya panel"
                >×</button>
              </div>
              <p style={{ fontSize: 12.5, color: '#9aa0ac', fontWeight: 300, lineHeight: 1.6, marginBottom: 14 }}>
                Salaam. Unsure about someone, or just need to think out loud — I'm here.
              </p>
              {RAYA_HELP.map((item) => (
                <div key={item.id}>
                  <div
                    onClick={() => toggleHelp(item.id)}
                    style={{
                      border: '1px solid rgba(255,255,255,.06)', borderRadius: 13,
                      padding: '12px 14px', marginBottom: 8, fontSize: 12.5, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', gap: 11, color: '#EDE7DA', transition: 'border-color .2s',
                    }}
                  >
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", color: '#D4A853', fontSize: 16, flexShrink: 0 }}>
                      {item.icon}
                    </span>
                    {item.label}
                  </div>
                  <AnimatePresence>
                    {activeHelp === item.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.28 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div style={{
                          fontSize: 12.5, color: '#EDE7DA', fontWeight: 300, lineHeight: 1.6,
                          borderLeft: '2px solid #D4A853', padding: '4px 0 4px 13px', marginBottom: 14,
                        }}>
                          {item.reply}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

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
          {candidate.match_name || candidate.display_name || candidate.name} · {candidate.age}
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
