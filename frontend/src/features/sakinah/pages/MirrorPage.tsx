/**
 * MirrorPage — /sakinah/mirror
 * Stage C · Phase 3: The Mirror — 9 A/B reflections, one at a time.
 * Reveals character through gratitude framing, not preference testing.
 * The 9th dimension (Closeness) is private-only; never surfaces to a match.
 */

import { useRef, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveMirror } from '../services/sakinahService';
import { motion, AnimatePresence } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

const QUESTIONS = [
  {
    dim: 'Parents & Family',
    q: 'When you picture a hard week, where does your gratitude land first?',
    a: 'Find peace in calling your parents — their voice steadies you',
    b: 'Find peace in solitude first, then reach out once settled',
  },
  {
    dim: 'Work & Provision',
    q: 'Which feels more like a blessing?',
    a: 'Work that gives me time for those I love',
    b: 'Work that lets me build and provide generously',
  },
  {
    dim: 'Friends & Circle',
    q: 'You feel most grateful for a friend who…',
    a: 'Tells you the truth, even when it stings',
    b: 'Stands by you, even when you are wrong',
  },
  {
    dim: 'Bad Habits',
    q: 'The habit you are most grateful to be unlearning…',
    a: 'Speaking before listening',
    b: 'Withdrawing before explaining',
  },
  {
    dim: 'Looks & Self-image',
    q: 'You feel most at peace when…',
    a: 'Content, unbothered by appearances',
    b: 'Put-together and presentable',
  },
  {
    dim: 'Responsibility',
    q: 'A home feels secure when…',
    a: 'Roles are clear and gently shared',
    b: 'Roles flex to whoever is strongest that day',
  },
  {
    dim: 'Expectations',
    q: 'You are most grateful in a marriage that is…',
    a: 'Predictable, calm, dependable',
    b: 'Evolving, surprising, growing',
  },
  {
    dim: 'Shared Finances',
    q: 'You would feel most grateful in a home that is…',
    a: 'Careful and secure, saving for what matters',
    b: 'Generous and open-handed, trusting in rizq',
  },
  {
    dim: 'Closeness (private only)',
    q: 'Closeness is built mostly through…',
    a: 'Shared silence and quiet presence',
    b: 'Shared words and open expression',
  },
] as const;

type Answer = { qi: number; choice: 'a' | 'b' | 'skip'; reflectText?: string };

const RAYA_HELP = [
  {
    id: 'r1',
    icon: '☉',
    label: 'Help me answer this',
    reply:
      "There is no right answer — only an honest one. Read both options slowly. The one that makes you nod slightly is your answer. If neither fits, skip; we reflect on words instead.",
  },
  {
    id: 'r2',
    icon: '?',
    label: 'What will this be used for?',
    reply:
      "Each answer builds a soft portrait of your character — never shown raw to anyone. Only after mutual interest do resonances surface, gently. The ninth dimension shapes your portrait privately only.",
  },
  {
    id: 'r3',
    icon: '⌥',
    label: 'Let me speak instead',
    reply:
      "Please do — speak in Urdu, Hindi, Tamil or English and I'll reflect it back. 🎙 Listening…",
  },
  {
    id: 'r4',
    icon: '◷',
    label: 'I need a moment',
    reply:
      "Take your time. Progress is saved — come back tomorrow if you need to. The path waits.",
  },
] as const;

export function MirrorPage() {
  const navigate    = useNavigate();
  const animating   = useRef(false);

  const [qi, setQi]             = useState(0);
  const [answers, setAnswers]   = useState<Answer[]>([]);
  const [rayaOpen, setRayaOpen] = useState(false);
  const [activeHelp, setActiveHelp] = useState<string | null>(null);
  const [reflectOpen, setReflectOpen] = useState(false);
  const [reflectText, setReflectText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (reflectOpen) textareaRef.current?.focus();
  }, [reflectOpen]);

  const current = QUESTIONS[qi];
  const isLast  = qi === QUESTIONS.length - 1;

  function handleAnswer(choice: 'a' | 'b' | 'skip', text?: string) {
    if (animating.current) return;
    animating.current = true;
    setReflectOpen(false);
    setReflectText('');

    const next = [...answers, { qi, choice, reflectText: text }];
    setAnswers(next);

    if (isLast) {
      saveMirror(next).catch((err) => console.error('saveMirror failed:', err));
      setTimeout(() => navigate('/sakinah/portrait'), 300);
      return;
    }

    setTimeout(() => {
      setQi((prev) => prev + 1);
      animating.current = false;
    }, 260); // matches exit animation duration
  }

  function toggleHelp(id: string) {
    setActiveHelp((prev) => (prev === id ? null : id));
  }

  function handleReflectDone() {
    handleAnswer('skip', reflectText.trim() || undefined);
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
      <SakinahSidebar activeItem="the-mirror" />

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
                The Mirror
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#5f6675',
                  marginTop: 3,
                  letterSpacing: '0.02em',
                }}
              >
                Phase 3 · character through gratitude
              </div>
            </div>
          </div>
        </div>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <div
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            padding: '32px 56px 28px',
          }}
        >
          <div
            style={{
              maxWidth: 520,
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              flex: 1,
            }}
          >
            {/* Progress bar — 9 segments */}
            <div style={{ display: 'flex', gap: 4, marginBottom: 0, flexShrink: 0 }}>
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  style={{
                    height: 3,
                    flex: 1,
                    borderRadius: 3,
                    background: i <= qi ? '#D4A853' : 'rgba(255,255,255,.06)',
                    transition: 'background .35s',
                  }}
                />
              ))}
            </div>

            {/* Vertically center the question within remaining space */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                minHeight: 0,
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={qi}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22 }}
                >
                  {/* Dim tag */}
                  <div
                    style={{
                      fontSize: 10,
                      letterSpacing: '0.3em',
                      textTransform: 'uppercase',
                      color: 'rgba(212,168,83,.55)',
                      textAlign: 'center',
                      marginBottom: 8,
                    }}
                  >
                    {qi + 1} of 9 · {current.dim}
                  </div>

                  {/* Question */}
                  <div
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 23,
                      fontWeight: 500,
                      lineHeight: 1.25,
                      textAlign: 'center',
                      marginBottom: 22,
                      padding: '0 4px',
                      color: '#EDE7DA',
                    }}
                  >
                    {current.q}
                  </div>

                  {/* Choice cards — dim when reflect textarea is active */}
                  <div style={{ opacity: reflectOpen ? 0.4 : 1, transition: 'opacity .25s', pointerEvents: reflectOpen ? 'none' : 'auto' }}>
                    <ChoiceCard
                      label="If you"
                      text={current.a}
                      onClick={() => handleAnswer('a')}
                    />

                    <div
                      style={{
                        textAlign: 'center',
                        fontFamily: "'Cormorant Garamond', serif",
                        fontStyle: 'italic',
                        color: 'rgba(212,168,83,.55)',
                        fontSize: 16,
                        margin: '1px 0 11px',
                      }}
                    >
                      or
                    </div>

                    <ChoiceCard
                      label="If you"
                      text={current.b}
                      onClick={() => handleAnswer('b')}
                    />
                  </div>

                  {/* Skip link — hidden once textarea is open */}
                  {!reflectOpen && (
                    <div
                      onClick={() => { setReflectOpen(true); setReflectText(''); }}
                      className="sk-skip"
                      style={{
                        textAlign: 'center',
                        fontSize: 12,
                        color: '#5f6675',
                        marginTop: 4,
                        cursor: 'pointer',
                        transition: 'color .2s',
                      }}
                    >
                      Neither fits → reflect in words instead
                    </div>
                  )}

                  {/* Reflect textarea — slides open smoothly */}
                  <AnimatePresence>
                    {reflectOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25, ease: 'easeOut' }}
                        style={{ overflow: 'hidden', marginTop: 6 }}
                      >
                        <textarea
                          ref={textareaRef}
                          value={reflectText}
                          onChange={e => setReflectText(e.target.value.slice(0, 200))}
                          placeholder="Write whatever feels true for you..."
                          rows={3}
                          style={{
                            width: '100%',
                            resize: 'none',
                            boxSizing: 'border-box',
                            fontFamily: "'Manrope', sans-serif",
                            fontSize: 13.5,
                            lineHeight: 1.6,
                            padding: '12px 14px',
                            background: 'rgba(212,168,83,.04)',
                            border: '1px solid rgba(212,168,83,.28)',
                            borderRadius: 14,
                            color: '#EDE7DA',
                            outline: 'none',
                          }}
                        />
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 7 }}>
                          <span style={{ fontSize: 11, color: '#5f6675', fontFamily: "'JetBrains Mono', monospace" }}>
                            {reflectText.length} / 200
                          </span>
                          <button
                            type="button"
                            onClick={handleReflectDone}
                            className="sk-pref-chip"
                            style={{ padding: '6px 16px', borderRadius: 30, fontSize: 12, fontFamily: "'Manrope', sans-serif", fontWeight: 500, cursor: 'pointer', border: '1px solid rgba(212,168,83,.35)', background: 'rgba(212,168,83,.08)', color: '#e7c984', transition: 'all .15s' }}
                          >
                            Done
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Conv-banner — fixed below question area */}
            <div
              style={{
                flexShrink: 0,
                background: 'rgba(127,176,122,.08)',
                border: '1px solid rgba(127,176,122,.25)',
                borderRadius: 13,
                padding: '11px 13px',
                fontSize: 11,
                color: '#bfe0b8',
                lineHeight: 1.5,
                fontWeight: 300,
                textAlign: 'center',
                marginTop: 20,
              }}
            >
              Nine dimensions reveal a <b>value, not a preference</b>. The ninth — closeness —
              shapes your private portrait only;{' '}
              <b>never</b> a topic before nikah.
            </div>
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
          onClick={() => { setActiveHelp(null); setRayaOpen(true); }}
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
              onClick={() => setRayaOpen(false)}
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
              <div
                style={{
                  width: 38,
                  height: 4,
                  borderRadius: 4,
                  background: 'rgba(212,168,83,.16)',
                  margin: '0 auto 14px',
                }}
              />

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
                  <span style={{ fontSize: 10, color: '#7FB07A', letterSpacing: '0.04em' }}>
                    ● always here to help
                  </span>
                </div>
                <button
                  onClick={() => setRayaOpen(false)}
                  style={{
                    marginLeft: 'auto',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#6b7280',
                    fontSize: 22,
                    lineHeight: 1,
                    minWidth: 44,
                    minHeight: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 8,
                    flexShrink: 0,
                  }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#ffffff')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#6b7280')}
                  aria-label="Close Raya panel"
                >
                  ×
                </button>
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
                Salaam. Stuck on a question or want to speak instead of choosing — I'm here.
                There are no wrong reflections.
              </p>

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
                      transition: 'border-color .2s',
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

export default MirrorPage;

// ── Sub-component ─────────────────────────────────────────────────────────────

function ChoiceCard({
  label,
  text,
  onClick,
}: {
  label: string;
  text: string;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="sk-choice"
      style={{
        border: '1px solid rgba(255,255,255,.06)',
        borderRadius: 17,
        padding: '17px 16px',
        marginBottom: 11,
        cursor: 'pointer',
        transition: 'border-color .22s, background .22s',
      }}
    >
      <div
        style={{
          fontSize: 10,
          letterSpacing: '0.2em',
          color: '#5f6675',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 14,
          fontWeight: 500,
          marginTop: 5,
          lineHeight: 1.4,
          color: '#EDE7DA',
        }}
      >
        {text}
      </div>
    </div>
  );
}
