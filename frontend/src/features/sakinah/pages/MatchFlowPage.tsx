/**
 * MatchFlowPage — /sakinah/matchflow
 * Stage D · Phase 5: A structured opening — 6 gated steps after mutual interest.
 * Tone: a quiet, dignified waiting room. Raya speaks warmly. No system-status copy.
 * No mention of decline. No countdown. The journey continues naturally either way.
 */

import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';
import { WatermarkedPhoto } from '../components/WatermarkedPhoto';
import '../sakinah.css';
import { getAuth } from 'firebase/auth';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

type StepState = 'done' | 'cur' | 'locked';
type StepDef = { num: string; title: string; desc: string };

// currentStep: 0-based index of the active step (0–5).
function buildSteps(matchName: string, matchGender: string): StepDef[] {
  return [
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
      desc: `${matchName} will see it when ${matchGender === 'female' ? 'she' : 'he'} is ready. Take your time — there is no rush.`,
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
}

export function MatchFlowPage() {
  const navigate    = useNavigate();
  const { matchId } = useParams<{ matchId: string }>();

  const [currentStep, setCurrentStep] = useState(0);
  const [mutualYes, setMutualYes] = useState(false);
  const [matchName, setMatchName] = useState('');
  const [matchGender, setMatchGender] = useState('');
  const [iExpressedInterest, setIExpressedInterest] = useState(false);
  const [loadingMatch, setLoadingMatch] = useState(true);

  useEffect(() => {
    if (!matchId) return;
    const fetchMatchData = async () => {
      try {
        const { authGet } = await import('../../../lib/api');
        const data = await authGet<{
          matches: Array<{
            match_id: string;
            matchflow_step: number;
            mutual_yes: boolean;
            match_name?: string;
            match_gender?: string;
            i_expressed_interest?: boolean;
          }>;
        }>('/match/');
        if (data && data.matches && data.matches.length > 0) {
          const match = data.matches[0];
          setCurrentStep(match.matchflow_step || 0);
          setMutualYes(match.mutual_yes || false);
          setMatchName(match.match_name || '');
          setMatchGender(match.match_gender || '');
          setIExpressedInterest(match.i_expressed_interest || false);
        }
      } catch (err) {
        console.error('Could not fetch match data', err);
      } finally {
        setLoadingMatch(false);
      }
    };
    fetchMatchData();
  }, [matchId]);

  const currentUser = getAuth().currentUser;
  const myName = currentUser?.displayName || 'You';

  const STEPS = buildSteps(matchName, matchGender);

  const [matchPhotoUrl, setMatchPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!mutualYes || !matchId) return;
    const fetchPhoto = async () => {
      try {
        const { authGet } = await import('../../../lib/api');
        const data = await authGet<{ photo_url: string | null }>(`/match/photo?match_id=${matchId}`);
        setMatchPhotoUrl(data.photo_url || null);
      } catch (err) {
        console.error('Could not fetch match photo', err);
      }
    };
    fetchPhoto();
  }, [mutualYes, matchId]);

  const rayaMessage = mutualYes
    ? "Character was seen before the face. This is how it was always meant to begin."
    : iExpressedInterest
    ? `Your interest has been sent quietly. ${matchName} will see it when ${matchGender === 'female' ? 'she' : 'he'} is ready. Take your time — there is no rush.`
    : `The person whose character you reflected on has expressed ${matchGender === 'female' ? 'her' : 'his'} interest in you. ${matchGender === 'female' ? 'Her' : 'His'} name is ${matchName}.`;

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

            {loadingMatch ? (
              <div style={{ textAlign: 'center', padding: '80px 0', color: '#5f6675', fontSize: 13 }}>
                Loading…
              </div>
            ) : (
              <>
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
                  {rayaMessage}
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
                <>
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  style={{ textAlign: 'center', margin: '0 0 1.75rem' }}
                >
                  <div style={{
                    display: 'inline-block',
                    background: 'rgba(212,168,83,.07)',
                    border: '1px solid rgba(212,168,83,.3)',
                    borderRadius: 16,
                    padding: '20px 28px',
                    maxWidth: 400,
                  }}>
                    <div style={{
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 9,
                      color: 'rgba(212,168,83,.55)',
                      letterSpacing: '0.2em',
                      textTransform: 'uppercase',
                      marginBottom: 12,
                    }}>
                      Mutual interest
                    </div>
                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontSize: 22,
                      fontWeight: 500,
                      color: '#EDE7DA',
                      lineHeight: 1.45,
                      margin: '0 0 10px',
                    }}>
                      You have both stepped forward with sincerity.
                    </p>
                    <p style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic',
                      fontSize: 17,
                      color: '#D4A853',
                      margin: 0,
                      lineHeight: 1.5,
                    }}>
                      May Allah bless this path.
                    </p>
                  </div>
                </motion.div>
                {mutualYes && matchPhotoUrl && (
                  <div style={{ textAlign: 'center', margin: '2rem 0 1.5rem' }}>
                    <p style={{ fontFamily: 'Georgia, serif', color: '#c9a96e', fontSize: '0.9rem', marginBottom: '1rem', fontStyle: 'italic' }}>
                      You have both chosen to continue. With family aware, here is who you have been getting to know.
                    </p>
                    <WatermarkedPhoto
                      photoUrl={matchPhotoUrl}
                      viewerName={myName}
                      style={{ width: '220px', height: '220px', borderRadius: '50%', objectFit: 'cover', border: '3px solid #c9a96e' }}
                    />
                    <div style={{
                      display: 'inline-block',
                      marginTop: '0.75rem',
                      background: 'rgba(0,0,0,0.55)',
                      border: '1px solid rgba(201,169,110,0.4)',
                      borderRadius: '6px',
                      padding: '6px 16px',
                    }}>
                      <p style={{ margin: 0, fontFamily: 'Georgia, serif', color: '#c9a96e', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        Shared with {myName}
                      </p>
                      <p style={{ margin: 0, fontFamily: 'Georgia, serif', color: 'rgba(255,255,255,0.65)', fontSize: '0.75rem' }}>
                        Sakinah • {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
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
                </>
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
              </>
            )}

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
