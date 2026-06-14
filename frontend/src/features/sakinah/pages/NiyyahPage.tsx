/**
 * NiyyahPage — /sakinah/niyyah
 * Stage C · Phase 1: Intention — why the user is here before who they'll meet.
 * Choice-first; Raya frames the questions; no free-text required; no wrong answers.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

const WHY_OPTIONS = [
  'To build a home of calm and worship together',
  "I feel ready to grow alongside someone",
  "Family is encouraging me, and I'm open",
] as const;

const SEASON_OPTIONS = [
  'Building — career, deen, and self',
  'Settled and steady — ready to share it',
  'A fresh start after a hard chapter',
] as const;

const RAYA_HELP = [
  {
    id: 'r1',
    icon: '☉',
    label: 'Help me with this step',
    reply:
      "Forget the big words — just think of one married couple whose home feels peaceful to you. What about it would you want? That feeling is your answer. We'll shape it together.",
  },
  {
    id: 'r2',
    icon: '?',
    label: 'Why are you asking me this?',
    reply:
      "Knowing the why helps me understand the home you hope to build — so the people I show you fit your heart, not a checklist. Nothing here is judged.",
  },
  {
    id: 'r3',
    icon: '⌥',
    label: 'Let me just speak instead',
    reply:
      "Please do — talking is easier than typing. Speak in Urdu, Hindi, Tamil or English. I'll reflect it back so you know you were understood. 🎙 Listening…",
  },
  {
    id: 'r4',
    icon: '◷',
    label: 'I just need a moment',
    reply:
      "Take all the time you need. Your progress is saved — close this and come back tomorrow. The path waits for you, calmly.",
  },
] as const;

export function NiyyahPage() {
  const navigate = useNavigate();
  const [whyChoice, setWhyChoice]     = useState<string | null>(null);
  const [seasonChoice, setSeasonChoice] = useState<string | null>(null);
  const [rayaOpen, setRayaOpen]       = useState(false);
  const [activeHelp, setActiveHelp]   = useState<string | null>(null);

  function openRaya() {
    setActiveHelp(null);
    setRayaOpen(true);
  }

  function closeRaya() {
    setRayaOpen(false);
  }

  function toggleHelp(id: string) {
    setActiveHelp((prev) => (prev === id ? null : id));
  }

  function handleContinue() {
    // TODO: persist { whyChoice, seasonChoice } via sakinahService when service layer is wired
    navigate('/sakinah/values');
  }

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
      <SakinahSidebar activeItem="niyyah" />

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
                Niyyah
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#5f6675',
                  marginTop: 3,
                  letterSpacing: '0.02em',
                }}
              >
                Phase 1 · intention · guided by Raya
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ───────────────────────────────────────────── */}
        <div
          className="sk-page-body"
          style={{ flex: 1, overflowY: 'auto', padding: '28px 56px 100px' }}
        >
          <div style={{ maxWidth: 520, width: '100%' }}>

            {/* Intro */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.04 }}
              style={{
                fontSize: 13,
                color: '#9aa0ac',
                fontWeight: 300,
                lineHeight: 1.6,
                marginBottom: 14,
              }}
            >
              Before anyone else, we speak of you. No wrong answers — and Raya is right there if
              you're unsure.
            </motion.p>

            {/* Q1 — Why marriage */}
            <ReflectCard delay={0.12}>
              <Question>"Why marriage, and why now?"</Question>
              <ChipGroup
                options={WHY_OPTIONS}
                selected={whyChoice}
                onSelect={setWhyChoice}
              />
            </ReflectCard>

            {/* Q2 — Season of life */}
            <ReflectCard delay={0.20}>
              <Question>"What season of life are you in?"</Question>
              <ChipGroup
                options={SEASON_OPTIONS}
                selected={seasonChoice}
                onSelect={setSeasonChoice}
              />
            </ReflectCard>

            {/* Continue */}
            <motion.button
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.28 }}
              onClick={handleContinue}
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
                marginTop: 6,
                background: 'linear-gradient(135deg, #D4A853, #b98b39)',
                color: '#0a0e15',
              }}
            >
              Continue →
            </motion.button>

          </div>
        </div>

        {/* ── Raya FAB ─────────────────────────────────────────────────── */}
        <div
          style={{
            position: 'absolute',
            right: 20,
            bottom: 22,
            zIndex: 80,
            display: 'flex',
            alignItems: 'center',
            gap: 9,
            cursor: 'pointer',
          }}
          onClick={openRaya}
        >
          <AnimatePresence>
            {!rayaOpen && (
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ delay: 3.4, duration: 0.4 }}
                style={{
                  background: 'rgba(8,11,17,.92)',
                  border: '1px solid rgba(212,168,83,.16)',
                  borderRadius: 30,
                  padding: '8px 14px',
                  fontSize: 11,
                  color: '#e7c984',
                  whiteSpace: 'nowrap',
                  fontWeight: 300,
                  backdropFilter: 'blur(8px)',
                }}
              >
                Need help?{' '}
                <b style={{ color: '#EDE7DA', fontWeight: 500 }}>Raya's here.</b>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Orb with halo ring */}
          <div
            className="sk-raya-halo"
            style={{
              width: 54,
              height: 54,
              borderRadius: '50%',
              background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 24,
              color: '#3a2c0c',
              boxShadow: '0 8px 22px rgba(212,168,83,.35)',
              position: 'relative',
              flexShrink: 0,
              transition: 'transform .2s',
            }}
          >
            ر
          </div>
        </div>

        {/* ── Raya scrim ───────────────────────────────────────────────── */}
        <AnimatePresence>
          {rayaOpen && (
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeRaya}
              style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(5,7,11,.6)',
                zIndex: 90,
                backdropFilter: 'blur(2px)',
              }}
            />
          )}
        </AnimatePresence>

        {/* ── Raya bottom sheet ─────────────────────────────────────────── */}
        <AnimatePresence>
          {rayaOpen && (
            <motion.div
              key="sheet"
              initial={{ y: '110%' }}
              animate={{ y: 0 }}
              exit={{ y: '110%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                zIndex: 95,
                background: 'linear-gradient(180deg, #141b29, #0f1521)',
                borderTop: '1px solid rgba(212,168,83,.16)',
                borderRadius: '26px 26px 0 0',
                padding: '20px 20px 28px',
                maxHeight: '76%',
                overflowY: 'auto',
                scrollbarWidth: 'none',
              }}
            >
              {/* Grab handle */}
              <div
                style={{
                  width: 38,
                  height: 4,
                  borderRadius: 4,
                  background: 'rgba(212,168,83,.16)',
                  margin: '0 auto 14px',
                }}
              />

              {/* Sheet header */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 11, marginBottom: 12 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 19,
                    color: '#3a2c0c',
                    flexShrink: 0,
                  }}
                >
                  ر
                </div>
                <div>
                  <b
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 20,
                      fontWeight: 500,
                      display: 'block',
                    }}
                  >
                    Raya
                  </b>
                  <span
                    style={{
                      fontSize: 10,
                      color: '#7FB07A',
                      letterSpacing: '0.04em',
                    }}
                  >
                    ● always here to help
                  </span>
                </div>
              </div>

              <p
                style={{
                  fontSize: 12.5,
                  color: '#9aa0ac',
                  fontWeight: 300,
                  lineHeight: 1.6,
                  marginBottom: 14,
                }}
              >
                Salaam. Stuck, unsure how to say something, want to speak instead, or just need a
                moment — I'm here. Nothing here you have to figure out alone.
              </p>

              {/* Help chips */}
              {RAYA_HELP.map((item) => (
                <div key={item.id}>
                  <div
                    onClick={() => toggleHelp(item.id)}
                    style={{
                      border: '1px solid rgba(255,255,255,.06)',
                      borderRadius: 13,
                      padding: '12px 14px',
                      marginBottom: 8,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 11,
                      color: '#EDE7DA',
                      transition: 'border-color .2s, background .2s',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: "'Cormorant Garamond', serif",
                        color: '#D4A853',
                        fontSize: 16,
                        flexShrink: 0,
                      }}
                    >
                      {item.icon}
                    </span>
                    {item.label}
                  </div>

                  <AnimatePresence>
                    {activeHelp === item.id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.28 }}
                        style={{ overflow: 'hidden' }}
                      >
                        <div
                          style={{
                            fontSize: 12.5,
                            color: '#EDE7DA',
                            fontWeight: 300,
                            lineHeight: 1.6,
                            borderLeft: '2px solid #D4A853',
                            padding: '4px 0 4px 13px',
                            marginBottom: 14,
                          }}
                        >
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

export default NiyyahPage;

// ── Small presentational sub-components ──────────────────────────────────────

function ReflectCard({
  children,
  delay,
}: {
  children: React.ReactNode;
  delay: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      style={{
        border: '1px solid rgba(255,255,255,.06)',
        borderRadius: 16,
        padding: 17,
        marginBottom: 12,
        background: 'rgba(255,255,255,.012)',
      }}
    >
      {children}
    </motion.div>
  );
}

function Question({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: 18,
        fontStyle: 'italic',
        color: '#EDE7DA',
        lineHeight: 1.35,
        marginBottom: 12,
      }}
    >
      {children}
    </div>
  );
}

function ChipGroup({
  options,
  selected,
  onSelect,
}: {
  options: readonly string[];
  selected: string | null;
  onSelect: (v: string) => void;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {options.map((opt) => {
        const active = selected === opt;
        return (
          <button
            key={opt}
            onClick={() => onSelect(opt)}
            className="sk-reflect-chip"
            style={{
              border: `1px solid ${active ? '#D4A853' : 'rgba(255,255,255,.06)'}`,
              borderRadius: 11,
              padding: '11px 14px',
              fontSize: 12.5,
              cursor: 'pointer',
              textAlign: 'left',
              background: active ? 'rgba(212,168,83,.08)' : 'transparent',
              color: active ? '#EDE7DA' : '#9aa0ac',
              fontFamily: "'Manrope', sans-serif",
              lineHeight: 1.4,
              transition: 'border-color .2s, background .2s, color .2s',
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}
