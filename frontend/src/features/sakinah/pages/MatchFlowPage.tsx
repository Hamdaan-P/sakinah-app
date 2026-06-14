/**
 * MatchFlowPage — /sakinah/matchflow
 * Stage D · Phase 5: A structured opening — 6 gated steps after mutual interest.
 * Tone: a quiet, dignified waiting room. Raya speaks warmly. No system-status copy.
 * No mention of decline. No countdown. The journey continues naturally either way.
 * TODO: replace MOCK_STEP + MOCK_MUTUAL_YES with sakinahService.getMatchFlow(uid, candidateUid).
 */

import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

// currentStep: 0-based index of the active step (0–5).
// TODO: derive from sakinahService.getMatchFlow(uid, candidateUid).
const MOCK_STEP = 2;
const MOCK_MUTUAL_YES = true;
const MATCH_NAME = 'Fatima';

type StepState = 'done' | 'cur' | 'locked';
type StepDef = { num: string; title: string; desc: string };

const STEPS: StepDef[] = [
  {
    num: '٠',
    title: 'Both portraits complete',
    desc: 'Your character, values, and verified identity are ready.',
  },
  {
    num: '١',
    title: 'A resonance found',
    desc: 'Someone whose values and character resonated with yours.',
  },
  {
    num: '٢',
    title: 'Your interest, sent',
    desc: `${MATCH_NAME} will see it when she's ready. Take your time — there's no rush here.`,
  },
  {
    num: '٣',
    title: 'A guided opening',
    desc: 'Raya will frame your first exchange around something you share.',
  },
  {
    num: '٤',
    title: 'Family welcome',
    desc: 'Either of you may invite a wali to walk alongside.',
  },
  {
    num: '٥',
    title: 'Depth, then a decision',
    desc: 'Eight conversations, one at a time, toward a considered choice.',
  },
];

export function MatchFlowPage() {
  const navigate    = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();
  const currentStep = MOCK_STEP;
  const mutualYes   = MOCK_MUTUAL_YES;

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
      <SakinahSidebar activeItem="match-flow" />

      <main
        style={{
          flex: 1,
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
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
                Match flow
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: '#5f6675',
                  marginTop: 3,
                  letterSpacing: '0.02em',
                }}
              >
                Phase 5 · a structured opening
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

            {/* ── Raya speaks ───────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.04 }}
              style={{
                background: 'rgba(212,168,83,.03)',
                border: '1px solid rgba(212,168,83,.1)',
                borderRadius: 17,
                padding: '16px 16px 16px 14px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 13,
                marginBottom: 16,
              }}
            >
              {/* Raya orb */}
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: '50%',
                  background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 17,
                  color: '#3a2c0c',
                  flexShrink: 0,
                  marginTop: 1,
                }}
              >
                ر
              </div>

              {/* Message */}
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9,
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    color: 'rgba(212,168,83,.55)',
                    marginBottom: 6,
                  }}
                >
                  Raya
                </div>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    fontSize: 16,
                    color: '#EDE7DA',
                    lineHeight: 1.5,
                    margin: 0,
                  }}
                >
                  Your interest has been sent quietly. {MATCH_NAME} will see it when she's
                  ready. Raya will guide you both from here.
                </p>
              </div>
            </motion.div>

            {/* ── Journey map card ──────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.12 }}
              style={{
                background: 'linear-gradient(160deg, #111826, #0f1521)',
                border: '1px solid rgba(212,168,83,.16)',
                borderRadius: 22,
                padding: '4px 16px 4px',
                marginBottom: 16,
              }}
            >
              {STEPS.map((step, i) => {
                const state: StepState =
                  i < currentStep ? 'done' : i === currentStep ? 'cur' : 'locked';
                return (
                  <JourneyStep
                    key={step.num}
                    step={step}
                    state={state}
                    delay={0.20 + i * 0.06}
                    isLast={i === STEPS.length - 1}
                  />
                );
              })}
            </motion.div>

            {/* ── Waiting / CTA ─────────────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.52 }}
            >
              {mutualYes ? (
                <button
                  onClick={() => navigate(`/sakinah/conversation/${matchId}`)}
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
                    background: 'linear-gradient(135deg, #D4A853, #b98b39)',
                    color: '#0a0e15',
                  }}
                >
                  Begin the conversation →
                </button>
              ) : (
                <>
                <p
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontStyle: 'italic',
                    textAlign: 'center',
                    fontSize: 14.5,
                    color: '#9aa0ac',
                    fontWeight: 400,
                    lineHeight: 1.65,
                    padding: '0 12px',
                    margin: '0 0 18px',
                  }}
                >
                  Raya will guide the next step when the time is right. Your pool remains
                  open — reflect on others as you wait.
                </p>
                <button
                  onClick={() => navigate('/sakinah')}
                  style={{
                    display: 'block',
                    width: '100%',
                    textAlign: 'center',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontFamily: "'Manrope', sans-serif",
                    fontSize: 13,
                    color: '#5f6675',
                    letterSpacing: '0.02em',
                    padding: '6px 0',
                  }}
                >
                  Return to your pool →
                </button>
                </>
              )}
            </motion.div>

          </div>
        </div>

      </main>
    </div>
  );
}

export default MatchFlowPage;

// ── Sub-components ────────────────────────────────────────────────────────────

function JourneyStep({
  step,
  state,
  delay,
  isLast,
}: {
  step: StepDef;
  state: StepState;
  delay: number;
  isLast: boolean;
}) {
  const isDone = state === 'done';
  const isCur  = state === 'cur';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: state === 'locked' ? 0.38 : 1 }}
      transition={{ duration: 0.4, delay }}
      style={{
        display: 'flex',
        gap: 14,
        alignItems: 'flex-start',
        padding: '13px 0',
        borderBottom: isLast ? 'none' : '1px solid rgba(255,255,255,.05)',
        transition: 'opacity .3s',
      }}
    >
      {/* Step node — done fills gold, cur pulses */}
      <motion.div
        initial={{ scale: isDone ? 0.7 : 1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.32, delay: delay + 0.1, ease: 'backOut' }}
        className={isCur ? 'sk-step-cur' : undefined}
        style={{
          width: 28,
          height: 28,
          borderRadius: '50%',
          flexShrink: 0,
          border: `1px solid ${
            isDone ? '#D4A853' : isCur ? '#D4A853' : 'rgba(212,168,83,.14)'
          }`,
          background: isDone ? '#D4A853' : 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: 11,
          color: isDone ? '#0a0e15' : isCur ? '#D4A853' : 'rgba(212,168,83,.4)',
          boxShadow: isCur ? '0 0 0 4px rgba(212,168,83,.12)' : 'none',
        }}
      >
        {step.num}
      </motion.div>

      {/* Step body */}
      <div style={{ flex: 1, paddingTop: 1 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: isDone || isCur ? '#EDE7DA' : '#6b7280',
            marginBottom: 3,
            lineHeight: 1.3,
          }}
        >
          {step.title}
        </div>
        <div
          style={{
            fontSize: 11,
            color: isDone ? '#9aa0ac' : isCur ? '#9aa0ac' : '#4b5563',
            fontWeight: 300,
            lineHeight: 1.5,
          }}
        >
          {step.desc}
        </div>
        {isCur && (
          <span
            style={{
              fontSize: 9,
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              color: '#7FB07A',
              marginTop: 5,
              display: 'inline-block',
            }}
          >
            ● you are here
          </span>
        )}
      </div>
    </motion.div>
  );
}
