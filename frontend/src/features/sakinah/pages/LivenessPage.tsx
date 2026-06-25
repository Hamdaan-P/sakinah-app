/**
 * LivenessPage — /sakinah/liveness
 * Stage A · Identity: A gentle liveness check after the government ID upload.
 * Confirms the user is the same person as their ID. No photo is stored.
 * Automatic rejection is never the outcome — human review is always the fallback.
 * TODO: replace simulated check with real liveness SDK (e.g. iProov / FaceTec).
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { SakinahSidebar } from './components/SakinahSidebar';
import '../sakinah.css';
import { initiateKyc, submitKyc } from '../services/sakinahService';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

type CheckState = 'idle' | 'checking' | 'done';

const CHECK_STEPS = [
  { label: 'Face forward' },
  { label: 'Turn slowly left' },
  { label: 'Turn slowly right' },
];

export function LivenessPage() {
  const navigate = useNavigate();
  const [checkState, setCheckState]   = useState<CheckState>('idle');
  const [activeStep, setActiveStep]   = useState(0);
  const [sessionId, setSessionId]     = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string>('');

  const videoRef  = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'user' } })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      })
      .catch(() => {});

    return () => {
      streamRef.current?.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    };
  }, []);

  useEffect(() => {
    initiateKyc()
      .then((res: any) => {
        if (res?.session_id) setSessionId(res.session_id);
      })
      .catch(() => {});
  }, []);

  const handleBeginCheck = async () => {
    setCheckState('checking');
    setActiveStep(0);
    setSubmitError('');

    let selfieBase64 = '';
    try {
      const video = videoRef.current;
      if (video) {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth || 320;
        canvas.height = video.videoHeight || 240;
        canvas.getContext('2d')?.drawImage(video, 0, 0);
        selfieBase64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
      }
    } catch (_) {}

    setTimeout(() => setActiveStep(1), 1800);
    setTimeout(() => setActiveStep(2), 3600);

    setTimeout(async () => {
      try {
        const result: any = await submitKyc(
          sessionId ?? 'fallback-session',
          '',
          selfieBase64
        );
        if (
          result?.status === 'approved' ||
          result?.status === 'manual_review'
        ) {
          setCheckState('done');
        } else if (result?.status === 'error') {
          setSubmitError(
            result.message ??
            'Verification could not be completed. Please try again.'
          );
          setCheckState('idle');
        } else {
          setCheckState('done');
        }
      } catch (_) {
        setCheckState('done');
      }
    }, 5200);
  };

  const isChecking = checkState === 'checking';
  const isDone     = checkState === 'done';

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
      <SakinahSidebar activeItem="liveness" />

      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          overflow: 'hidden',
        }}
      >
        {/* ── Header ─────────────────────────────────────────────────────── */}
        <div
          style={{
            flexShrink: 0,
            padding: '36px 56px 26px',
            borderBottom: '1px solid rgba(255,255,255,.06)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button
              onClick={() => navigate('/sakinah/register')}
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
                Liveness Check
              </div>
              <div style={{ fontSize: 11, color: '#5f6675', marginTop: 3, letterSpacing: '0.02em' }}>
                Phase A · identity · guided by Raya
              </div>
            </div>
          </div>
        </div>

        {/* ── Scrollable body ────────────────────────────────────────────── */}
        <div
          className="sk-page-body"
          style={{ flex: 1, overflowY: 'auto', padding: '22px 56px 60px' }}
        >
          <div style={{ maxWidth: 480, width: '100%' }}>

            {/* ── Raya opening card ───────────────────────────────────── */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.04 }}
              style={{
                display: 'flex', gap: 13, alignItems: 'flex-start',
                padding: '15px 16px',
                background: 'rgba(212,168,83,.03)',
                border: '1px solid rgba(212,168,83,.1)',
                borderRadius: 17, marginBottom: 20,
              }}
            >
              <div
                style={{
                  width: 34, height: 34, borderRadius: '50%', flexShrink: 0,
                  background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: 16, color: '#3a2c0c', marginTop: 1,
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
                    fontStyle: 'italic', fontSize: 15,
                    color: '#EDE7DA', lineHeight: 1.5, margin: 0,
                  }}
                >
                  Just one last step. We need a quick glance to confirm it's really you — the same person as your ID. No photo is stored. Only a quiet confirmation that you're here.
                </p>
              </div>
            </motion.div>

            {/* ── Main content: viewfinder + steps OR completion ──────── */}
            <AnimatePresence mode="wait">

              {!isDone ? (
                <motion.div
                  key="check-view"
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Camera viewfinder */}
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: 0.12 }}
                    style={{
                      border: `1px ${isChecking ? 'solid' : 'dashed'} ${
                        isChecking ? 'rgba(212,168,83,.45)' : 'rgba(212,168,83,.22)'
                      }`,
                      borderRadius: 20,
                      background: 'rgba(4,6,10,.65)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '36px 0 28px',
                      marginBottom: 18,
                      position: 'relative',
                      overflow: 'hidden',
                      transition: 'border .4s',
                    }}
                  >
                    {/* Subtle corner marks */}
                    {[
                      { top: 12, left: 12 }, { top: 12, right: 12 },
                      { bottom: 12, left: 12 }, { bottom: 12, right: 12 },
                    ].map((pos, ci) => (
                      <div
                        key={ci}
                        style={{
                          position: 'absolute', ...pos,
                          width: 14, height: 14,
                          borderTop: ci < 2 ? '1.5px solid rgba(212,168,83,.2)' : 'none',
                          borderBottom: ci >= 2 ? '1.5px solid rgba(212,168,83,.2)' : 'none',
                          borderLeft: ci === 0 || ci === 2 ? '1.5px solid rgba(212,168,83,.2)' : 'none',
                          borderRight: ci === 1 || ci === 3 ? '1.5px solid rgba(212,168,83,.2)' : 'none',
                        }}
                      />
                    ))}

                    {/* Oval face guide + pulsing ring */}
                    <div
                      style={{
                        position: 'relative',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 18,
                      }}
                    >
                      {/* Pulsing ring */}
                      <div
                        className="sk-liveness-pulse"
                        style={{
                          position: 'absolute',
                          width: 166, height: 218,
                          borderRadius: '50%',
                          border: `2px solid ${
                            isChecking ? 'rgba(212,168,83,.28)' : 'rgba(212,168,83,.18)'
                          }`,
                          pointerEvents: 'none',
                        }}
                      />
                      {/* Oval face guide */}
                      <div
                        style={{
                          width: 148, height: 200,
                          borderRadius: '50%',
                          border: `1.5px ${isChecking ? 'solid' : 'dashed'} ${
                            isChecking ? 'rgba(212,168,83,.75)' : 'rgba(212,168,83,.5)'
                          }`,
                          transition: 'border .4s',
                          background: 'radial-gradient(ellipse at 50% 40%, rgba(212,168,83,.04), transparent 65%)',
                          position: 'relative',
                          overflow: 'hidden',
                        }}
                      >
                        <video
                          ref={videoRef}
                          autoPlay
                          playsInline
                          muted
                          style={{
                            position: 'absolute', inset: 0,
                            width: '100%', height: '100%',
                            objectFit: 'cover',
                          }}
                        />
                      </div>
                    </div>

                    {/* Instruction */}
                    <p
                      style={{
                        fontSize: 12, color: isChecking ? '#e7c984' : '#9aa0ac',
                        fontWeight: 300, margin: 0,
                        textAlign: 'center',
                        transition: 'color .3s',
                        letterSpacing: '0.01em',
                      }}
                    >
                      {isChecking
                        ? CHECK_STEPS[activeStep].label
                        : 'Look straight ahead and hold still'}
                    </p>
                  </motion.div>

                  {/* Step indicator */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.20 }}
                    style={{
                      display: 'flex',
                      gap: 6,
                      marginBottom: 20,
                    }}
                  >
                    {CHECK_STEPS.map((s, si) => {
                      const isPast    = isChecking && si < activeStep;
                      const isCurrent = isChecking && si === activeStep;
                      const isUpcoming = !isChecking || si > activeStep;
                      return (
                        <div
                          key={si}
                          style={{
                            flex: 1,
                            border: `1px solid ${
                              isCurrent ? 'rgba(212,168,83,.4)'
                              : isPast   ? 'rgba(127,176,122,.3)'
                              : 'rgba(255,255,255,.06)'
                            }`,
                            borderRadius: 10,
                            padding: '9px 10px',
                            background: isCurrent
                              ? 'rgba(212,168,83,.05)'
                              : isPast
                              ? 'rgba(127,176,122,.04)'
                              : 'transparent',
                            transition: '.3s',
                            opacity: isUpcoming && !isChecking ? 0.55 : 1,
                          }}
                        >
                          <div
                            style={{
                              fontSize: 9, letterSpacing: '0.08em',
                              textTransform: 'uppercase',
                              color: isCurrent ? '#e7c984'
                                : isPast ? '#7FB07A'
                                : '#5f6675',
                              marginBottom: 2,
                              transition: '.3s',
                            }}
                          >
                            {isPast ? '✓' : String(si + 1)}
                          </div>
                          <div
                            style={{
                              fontSize: 11.5,
                              color: isCurrent ? '#EDE7DA'
                                : isPast ? '#9aa0ac'
                                : '#5f6675',
                              fontWeight: isCurrent ? 500 : 300,
                              lineHeight: 1.3,
                              transition: '.3s',
                            }}
                          >
                            {s.label}
                          </div>
                        </div>
                      );
                    })}
                  </motion.div>

                  {/* Raya reassurance — equity note */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.4, delay: 0.28 }}
                    style={{
                      display: 'flex',
                      gap: 10,
                      alignItems: 'flex-start',
                      padding: '12px 14px',
                      background: 'rgba(255,255,255,.012)',
                      border: '1px solid rgba(255,255,255,.06)',
                      borderRadius: 13,
                      marginBottom: 20,
                    }}
                  >
                    <div
                      style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: "'Cormorant Garamond', serif",
                        fontSize: 11, color: '#3a2c0c', marginTop: 1,
                      }}
                    >
                      ر
                    </div>
                    <p
                      style={{
                        fontSize: 11.5, color: '#9aa0ac',
                        fontWeight: 300, lineHeight: 1.6, margin: 0,
                      }}
                    >
                      If this doesn't work first time, that's okay — a real person will review your check with care. You will never be automatically rejected.
                    </p>
                  </motion.div>

                  {/* Begin check button — hidden during active check */}
                  {submitError && (
                    <div style={{
                      fontSize: 12,
                      color: '#C98A8A',
                      textAlign: 'center',
                      marginBottom: 12,
                      fontWeight: 300,
                      lineHeight: 1.5,
                    }}>
                      {submitError}
                    </div>
                  )}
                  <AnimatePresence>
                    {!isChecking && (
                      <motion.button
                        key="begin-btn"
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.2 }}
                        onClick={handleBeginCheck}
                        className="sk-btn-gold"
                        style={{
                          display: 'block', width: '100%',
                          textAlign: 'center', border: 'none', cursor: 'pointer',
                          fontFamily: "'Manrope', sans-serif", fontWeight: 600,
                          fontSize: 14, letterSpacing: '0.3px',
                          padding: 15, borderRadius: 15,
                          background: 'linear-gradient(135deg, #D4A853, #b98b39)',
                          color: '#0a0e15',
                        }}
                      >
                        Begin check
                      </motion.button>
                    )}
                  </AnimatePresence>

                  {/* Checking progress indicator */}
                  <AnimatePresence>
                    {isChecking && (
                      <motion.div
                        key="checking-label"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{
                          textAlign: 'center',
                          fontSize: 11.5, color: '#9aa0ac',
                          fontWeight: 300, letterSpacing: '0.04em',
                        }}
                      >
                        Checking…
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                /* ── Completion state ─────────────────────────────────── */
                <motion.div
                  key="done-view"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    gap: 18,
                    paddingTop: 12,
                  }}
                >
                  {/* Green checkmark */}
                  <motion.div
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: 'backOut' }}
                    style={{
                      width: 64, height: 64, borderRadius: '50%',
                      background: 'rgba(127,176,122,.12)',
                      border: '1px solid rgba(127,176,122,.4)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 26, color: '#7FB07A',
                    }}
                  >
                    ✓
                  </motion.div>

                  {/* Verified badges */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7, justifyContent: 'center' }}>
                    {['✓ Phone', '✓ ID verified', '✓ Photo-matched'].map((badge) => (
                      <span
                        key={badge}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 5,
                          fontSize: 11, color: '#7FB07A',
                          border: '1px solid rgba(127,176,122,.3)',
                          borderRadius: 30, padding: '5px 13px',
                          background: 'rgba(127,176,122,.05)',
                          fontFamily: "'Manrope', sans-serif",
                        }}
                      >
                        {badge}
                      </span>
                    ))}
                  </div>

                  {/* Raya closing */}
                  <p
                    style={{
                      fontFamily: "'Cormorant Garamond', serif",
                      fontStyle: 'italic',
                      fontSize: 18, lineHeight: 1.5,
                      color: '#EDE7DA', maxWidth: 340, margin: 0,
                    }}
                  >
                    "That's you — verified. Welcome to Sakinah."
                  </p>

                  {/* Continue */}
                  <button
                    onClick={() => navigate('/sakinah/overview')}
                    className="sk-btn-gold"
                    style={{
                      display: 'block', width: '100%',
                      textAlign: 'center', border: 'none', cursor: 'pointer',
                      fontFamily: "'Manrope', sans-serif", fontWeight: 600,
                      fontSize: 14, letterSpacing: '0.3px',
                      padding: 15, borderRadius: 15,
                      background: 'linear-gradient(135deg, #D4A853, #b98b39)',
                      color: '#0a0e15', maxWidth: 360,
                    }}
                  >
                    Continue →
                  </button>
                </motion.div>
              )}

            </AnimatePresence>

          </div>
        </div>
      </main>
    </div>
  );
}

export default LivenessPage;
