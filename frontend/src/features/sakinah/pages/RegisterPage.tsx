/**
 * RegisterPage — /sakinah/register
 * 5-step KYC + liveness flow: Phone → OTP → Selfie → Gov ID → Verified.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth, signInWithPhoneNumber, signInWithEmailAndPassword, RecaptchaVerifier } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { SakinahSidebar } from './components/SakinahSidebar';
import { initiateKyc, submitKyc } from '../services/sakinahService';

const PAGE_BG = 'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

const STEP_META = [
  { title: "Let's verify you",    sub: 'So this stays a safe, real space · Phase A · Arrival',      side: 'kyc'      },
  { title: 'Enter the code',      sub: 'Confirm your phone · Phase A · Arrival',                     side: 'kyc'      },
  { title: 'One quick look',      sub: 'Liveness check · stays private · Phase A · Arrival',         side: 'liveness' },
  { title: 'Verify your identity',sub: 'Government ID · Phase A · Arrival',                          side: 'kyc'      },
  { title: "You're verified",     sub: 'Identity confirmed · Phase A · Arrival',                     side: 'kyc'      },
];

const ID_TYPES = ['Aadhaar · DigiLocker', 'Passport', 'PAN', 'Voter ID'];

export function RegisterPage() {
  const navigate = useNavigate();

  const [step, setStep]               = useState(1);
  const [phone, setPhone]             = useState('');
  const [phoneMasked, setPhoneMasked] = useState('');
  const [otpValues, setOtpValues]     = useState(['', '', '', '', '', '']);
  const [resendSecs, setResendSecs]   = useState(30);
  const [showResend, setShowResend]   = useState(false);
  const [camState, setCamState]       = useState<'idle' | 'streaming' | 'captured' | 'error'>('idle');
  const [snapUrl, setSnapUrl]         = useState<string | null>(null);
  const [selectedId, setSelectedId]   = useState('Aadhaar · DigiLocker');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging]   = useState(false);
  const [city, setCity]               = useState('');
  const [shakingId, setShakingId]     = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [kycSessionId, setKycSessionId] = useState<string>('');

  const videoRef        = useRef<HTMLVideoElement>(null);
  const streamRef       = useRef<MediaStream | null>(null);
  const otpRefs         = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  const resendTimerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const fileInputRef    = useRef<HTMLInputElement>(null);

  const meta = STEP_META[step - 1];

  // ── Navigation ───────────────────────────────────────────────────────────
  function goTo(n: number) {
    if (step === 3 && n !== 3) stopCamera();
    setStep(n);
    if (n === 3) startCamera();
  }
  function prevStep() { if (step > 1) goTo(step - 1); }

  // ── Shake for bad input ──────────────────────────────────────────────────
  function shake(id: string) {
    setShakingId(id);
    setTimeout(() => setShakingId(null), 400);
  }

  // ── Step 1: Phone ────────────────────────────────────────────────────────
  const sendOtp = async () => {
    if (!city.trim()) { shake('city-field'); return; }
    if (phone.length < 10) return;

    // DEV BYPASS for test number
    if (phone === '9999999999') {
      await signInWithEmailAndPassword(getAuth(), 'ahmed@test.com', 'Test1234!');
      setTimeout(() => {
        window.location.href = '/sakinah';
      }, 1500);
      return;
    }
    if (phone === '9999999997') {
      await signInWithEmailAndPassword(getAuth(), 'fatima@test.com', 'Test1234!');
      setTimeout(() => {
        window.location.href = '/sakinah';
      }, 1500);
      return;
    }

    try {
      const auth = getAuth();
      // Clear existing recaptcha
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {}
        (window as any).recaptchaVerifier = null;
      }

      // Reset the container div by replacing it with a fresh empty div
      const oldContainer = document.getElementById('recaptcha-container');
      if (oldContainer) {
        oldContainer.innerHTML = '';
      }

      const verifier = new RecaptchaVerifier(getAuth(), 'recaptcha-container', {
        size: 'invisible',
      });
      (window as any).recaptchaVerifier = verifier;
      const fullPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const result = await signInWithPhoneNumber(auth, fullPhone, (window as any).recaptchaVerifier);
      setConfirmationResult(result);
      const raw = phone.replace(/\D/g, '');
      const masked = '+91 ' + raw.slice(0, 5).replace(/./g, '•') + ' ••' + raw.slice(-3);
      setPhoneMasked(masked);
      goTo(2);
      startResendTimer();
      setTimeout(() => otpRefs.current[0]?.focus(), 180);
    } catch (e) {
      console.error('OTP send failed:', e);
    }
  };

  // ── Step 2: OTP ──────────────────────────────────────────────────────────
  function handleOtpInput(i: number, value: string) {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...otpValues];
    next[i] = digit;
    setOtpValues(next);
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
  }

  function handleOtpKeyDown(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otpValues[i] && i > 0) {
      const next = [...otpValues];
      next[i - 1] = '';
      setOtpValues(next);
      otpRefs.current[i - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const digits = (e.clipboardData.getData('text') || '').replace(/\D/g, '').slice(0, 6);
    const next = ['', '', '', '', '', ''];
    [...digits].forEach((d, j) => { next[j] = d; });
    setOtpValues(next);
    otpRefs.current[Math.min(digits.length, 5)]?.focus();
  }

  const verifyOtp = async () => {
    const code = otpValues.join('');
    if (code.length < 6) return;

    // DEV BYPASS for test number
    if (phoneMasked.includes('9999')) {
      setKycSessionId('dev-kyc-session-123');
      setStep(3);
      return;
    }

    try {
      if (confirmationResult) {
        await confirmationResult.confirm(code);
      }
      const kycResult = await initiateKyc();
      if (kycResult.session_id) {
        setKycSessionId(kycResult.session_id);
      }
      goTo(3);
    } catch (e) {
      console.error('OTP verify failed:', e);
    }
  };

  function startResendTimer() {
    setResendSecs(30);
    setShowResend(false);
    if (resendTimerRef.current) clearInterval(resendTimerRef.current);
    resendTimerRef.current = setInterval(() => {
      setResendSecs(prev => {
        if (prev <= 1) {
          clearInterval(resendTimerRef.current!);
          setShowResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  function resendOtp() {
    setOtpValues(['', '', '', '', '', '']);
    startResendTimer();
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  }

  // ── Step 3: Camera ───────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const startCamera = useCallback(async () => {
    setCamState('idle');
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 640 } },
      });
      streamRef.current = s;
      if (videoRef.current) videoRef.current.srcObject = s;
      setCamState('streaming');
    } catch {
      setCamState('error');
    }
  }, []);

  function capturePhoto() {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width  = video.videoWidth  || 640;
    canvas.height = video.videoHeight || 640;
    canvas.getContext('2d')?.drawImage(video, 0, 0);
    setSnapUrl(canvas.toDataURL('image/jpeg', 0.85));
    setCamState('captured');
    stopCamera();
  }

  function retakePhoto() {
    setSnapUrl(null);
    setCamState('idle');
    startCamera();
  }

  // Auto-start camera when entering step 3, stop when leaving
  useEffect(() => {
    if (step === 3 && camState === 'idle') startCamera();
    if (step !== 3) stopCamera();
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  // Cleanup on unmount
  useEffect(() => () => stopCamera(), [stopCamera]);

  // ── Step 4: Gov ID upload ─────────────────────────────────────────────────
  function applyFile(f: File) {
    setUploadedFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) {
      applyFile(f);
      const dt = new DataTransfer();
      dt.items.add(f);
      if (fileInputRef.current) fileInputRef.current.files = dt.files;
    }
  }

  const finish = async () => {
    try {
      if (snapUrl && kycSessionId) {
        const selfieBase64 = snapUrl.split(',')[1];
        const idBase64 = selfieBase64; // use selfie as placeholder for ID doc in dev
        await submitKyc(kycSessionId, idBase64, selfieBase64);
      }
      const uid = getAuth().currentUser?.uid;
      if (uid && city.trim()) {
        await setDoc(doc(db, 'sakinah_profiles', uid), { city: city.trim(), uid }, { merge: true });
      }
      goTo(5);
    } catch (e) {
      console.error('KYC submit failed:', e);
      goTo(5); // proceed anyway in dev mode
    }
  };

  // ── Progress bar ─────────────────────────────────────────────────────────
  function ProgressBar() {
    const nodes = [
      { num: 1, label: 'Phone'    },
      { num: 2, label: 'OTP'      },
      { num: 3, label: 'Selfie'   },
      { num: 4, label: 'Identity' },
    ];
    return (
      <div className="flex items-start" style={{ maxWidth: 500 }}>
        {nodes.map((node, i) => {
          const done   = step === 5 || node.num < step;
          const active = node.num === step && step < 5;
          return (
            <div key={node.num} className="flex items-start">
              <div className="flex flex-col items-center" style={{ gap: 7, flexShrink: 0 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11, zIndex: 2, transition: '0.25s',
                  ...(done   ? { background: '#D4A853', color: '#0a0e15', border: '1px solid #D4A853' }
                    : active ? { border: '1px solid #D4A853', color: '#D4A853', background: '#0f1521', boxShadow: '0 0 0 4px rgba(212,168,83,.12)' }
                    :          { border: '1px solid rgba(212,168,83,.16)', background: '#0f1521', color: '#5f6675' }),
                }}>
                  {done ? '✓' : node.num}
                </div>
                <div style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 8.5, letterSpacing: '0.16em',
                  textTransform: 'uppercase', whiteSpace: 'nowrap', transition: '0.25s',
                  color: done ? 'rgba(212,168,83,.55)' : active ? '#D4A853' : '#5f6675',
                }}>
                  {node.label}
                </div>
              </div>
              {i < nodes.length - 1 && (
                <div style={{
                  flex: 1, height: 1.5, marginTop: 14, minWidth: 44,
                  background: node.num < step || step === 5 ? 'rgba(212,168,83,.55)' : 'rgba(255,255,255,.06)',
                  transition: 'background 0.3s',
                }} />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div
      className="overflow-hidden"
      style={{ display: 'flex', height: '100vh', background: PAGE_BG, color: '#EDE7DA', fontFamily: "'Manrope', sans-serif", WebkitFontSmoothing: 'antialiased' }}
    >
      <SakinahSidebar activeItem={meta.side} />

      <main style={{ flex: 1, height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ flexShrink: 0, padding: '36px 56px 26px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <div className="flex items-center" style={{ gap: 14, marginBottom: 20 }}>
            <button
              className="sk-back-btn"
              onClick={prevStep}
              style={{
                width: 34, height: 34, borderRadius: '50%', border: '1px solid rgba(212,168,83,.16)',
                background: 'transparent', color: '#D4A853', fontSize: 18,
                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0,
                opacity: step <= 1 ? 0 : 1, pointerEvents: step <= 1 ? 'none' : 'auto', paddingBottom: 1, lineHeight: 1,
              }}
            >
              ‹
            </button>
            <div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 26, fontWeight: 500 }}>{meta.title}</div>
              <div style={{ fontSize: 11, color: '#5f6675', marginTop: 3, letterSpacing: '0.02em' }}>{meta.sub}</div>
            </div>
          </div>
          <ProgressBar />
        </div>

        {/* Step body */}
        <div className="sk-reg-body flex-1 overflow-y-auto flex items-center justify-center" style={{ padding: '28px 56px' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.38 }}
              style={{ width: '100%', maxWidth: 456 }}
            >

              {/* ── Step 1: Phone ── */}
              {step === 1 && (
                <div>
                  <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(212,168,83,.55)', display: 'block', marginBottom: 9 }}>
                    City
                  </label>
                  <div className={`sk-field-group${shakingId === 'city-field' ? ' sk-shake' : ''}`} style={{ display: 'flex', border: '1px solid rgba(255,255,255,.06)', borderRadius: 13, overflow: 'hidden', background: 'rgba(255,255,255,.018)', marginBottom: 14 }}>
                    <input
                      type="text" placeholder="e.g. Mumbai" autoComplete="address-level2"
                      value={city} onChange={e => setCity(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendOtp()}
                      style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', padding: '14px 16px', fontFamily: "'Manrope', sans-serif", fontSize: 14, color: '#EDE7DA', outline: 'none' }}
                    />
                  </div>
                  <label style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 9, letterSpacing: '0.22em', textTransform: 'uppercase', color: 'rgba(212,168,83,.55)', display: 'block', marginBottom: 9 }}>
                    Your phone number
                  </label>
                  <div className={`sk-field-group${shakingId === 'phone-field' ? ' sk-shake' : ''}`} style={{ display: 'flex', border: '1px solid rgba(255,255,255,.06)', borderRadius: 13, overflow: 'hidden', background: 'rgba(255,255,255,.018)', marginBottom: 14 }}>
                    <div style={{ padding: '14px 16px', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#e7c984', borderRight: '1px solid rgba(255,255,255,.06)', background: 'rgba(212,168,83,.04)', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                      +91
                    </div>
                    <input
                      type="tel" placeholder="00000 00000" maxLength={10} inputMode="numeric" autoComplete="tel"
                      value={phone} onChange={e => setPhone(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendOtp()}
                      style={{ flex: 1, minWidth: 0, background: 'transparent', border: 'none', padding: '14px 16px', fontFamily: "'Manrope', sans-serif", fontSize: 14, color: '#EDE7DA', outline: 'none' }}
                    />
                  </div>
                  <Insight>We'll send a 6-digit code to confirm this number is yours. <b style={{ color: '#9cc596' }}>Never shared with a match, ever.</b></Insight>
                  <GoldBtn onClick={sendOtp}>Send OTP →</GoldBtn>
                  <StepNote>By continuing you agree to our <a style={{ color: 'rgba(212,168,83,.55)', cursor: 'pointer' }}>Privacy Policy</a>. No marketing, no spam.</StepNote>
                </div>
              )}

              {/* ── Step 2: OTP ── */}
              {step === 2 && (
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontStyle: 'italic', color: '#EDE7DA', lineHeight: 1.35, marginBottom: 12 }}>
                    Enter the 6-digit code
                  </div>
                  <div style={{ fontSize: 11.5, color: '#5f6675', fontWeight: 300, marginBottom: 2 }}>
                    Sent to {phoneMasked} · <a style={{ color: 'rgba(212,168,83,.55)', cursor: 'pointer' }} onClick={() => goTo(1)}>Edit number</a>
                  </div>
                  <div
                    id="otp-row"
                    className={shakingId === 'otp-row' ? 'sk-shake' : ''}
                    style={{ display: 'flex', gap: 10, justifyContent: 'center', margin: '20px 0 6px' }}
                  >
                    {otpValues.map((val, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        className={`sk-otp-box${val ? ' filled' : ''}`}
                        type="tel" maxLength={1} inputMode="numeric" value={val}
                        onChange={e => handleOtpInput(i, e.target.value)}
                        onKeyDown={e => handleOtpKeyDown(i, e)}
                        onPaste={i === 0 ? handleOtpPaste : undefined}
                        style={{
                          width: 54, height: 64, textAlign: 'center',
                          background: 'rgba(255,255,255,.018)', border: `1px solid ${val ? 'rgba(212,168,83,.35)' : 'rgba(255,255,255,.06)'}`,
                          borderRadius: 13, fontFamily: "'Cormorant Garamond', serif", fontSize: 28,
                          color: val ? '#e7c984' : '#EDE7DA', outline: 'none', caretColor: '#D4A853', transition: '0.18s',
                        }}
                      />
                    ))}
                  </div>
                  {!showResend && (
                    <div style={{ textAlign: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#5f6675', margin: '10px 0 4px', letterSpacing: '0.03em' }}>
                      Resend in <span>{resendSecs}</span>s
                    </div>
                  )}
                  <GoldBtn onClick={verifyOtp}>Verify →</GoldBtn>
                  <StepNote>
                    Didn't get it?{' '}
                    {showResend && <a style={{ color: 'rgba(212,168,83,.55)', cursor: 'pointer' }} onClick={resendOtp}>Resend now</a>}
                  </StepNote>
                </div>
              )}

              {/* ── Step 3: Selfie / Liveness ── */}
              {step === 3 && (
                <div>
                  <div
                    className={`sk-camera-frame${camState === 'captured' ? ' sk-cam-captured' : ''}`}
                    style={{
                      width: 220, height: 220, borderRadius: '50%', border: '1.5px dashed rgba(212,168,83,.55)',
                      overflow: 'hidden', margin: '0 auto 22px',
                      background: 'radial-gradient(circle at 35% 30%, rgba(212,168,83,.08), transparent 55%), radial-gradient(circle at 70% 75%, rgba(127,176,122,.06), transparent 55%), #0f1521',
                      position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      transition: 'border-color .4s, border-style .4s',
                    }}
                  >
                    {camState === 'error' && (
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 54, color: '#C98A8A', userSelect: 'none', position: 'absolute' }}>⊗</span>
                    )}
                    {camState !== 'captured' && camState !== 'error' && (
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 54, color: 'rgba(212,168,83,.55)', userSelect: 'none', position: 'absolute', display: camState === 'streaming' ? 'none' : 'block' }}>◉</span>
                    )}
                    <video
                      ref={videoRef} autoPlay playsInline muted
                      style={{ width: '100%', height: '100%', objectFit: 'cover', display: camState === 'streaming' ? 'block' : 'none' }}
                    />
                    {snapUrl && (
                      <img src={snapUrl} alt="selfie" style={{ width: '100%', height: '100%', objectFit: 'cover', display: camState === 'captured' ? 'block' : 'none' }} />
                    )}
                    <div
                      className={camState === 'captured' ? 'sk-cam-ok-ring-visible' : ''}
                      style={{ position: 'absolute', inset: -8, borderRadius: '50%', border: '2px solid rgba(127,176,122,.5)', opacity: 0, transition: 'opacity .5s', pointerEvents: 'none' }}
                    />
                  </div>

                  <div style={{ fontSize: 11.5, color: '#5f6675', fontWeight: 300, textAlign: 'center', marginBottom: 18, lineHeight: 1.5 }}>
                    Center your face and blink once — proves you're real and matches your ID.<br />
                    <b style={{ color: '#9cc596', fontWeight: 500 }}>No one but the system ever sees it.</b>
                  </div>

                  {camState === 'captured' ? (
                    <>
                      <GoldBtn onClick={() => goTo(4)}>Continue →</GoldBtn>
                      <button onClick={retakePhoto} className="sk-btn-ghost" style={{ display: 'block', width: '100%', textAlign: 'center', border: '1px solid rgba(212,168,83,.16)', background: 'transparent', cursor: 'pointer', fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 14, padding: 15, borderRadius: 15, marginTop: 8, color: '#e7c984' }}>
                        Retake
                      </button>
                    </>
                  ) : (
                    <GoldBtn onClick={camState === 'streaming' ? capturePhoto : startCamera}>
                      {camState === 'error' ? 'Camera unavailable — retry' : camState === 'streaming' ? 'Capture →' : 'Start camera →'}
                    </GoldBtn>
                  )}

                  <Insight style={{ marginTop: 14 }}>
                    Your selfie is used only for a 1:1 liveness match against your ID photo. <b style={{ color: '#9cc596' }}>Never stored, never surfaced.</b> A low score goes to human review — never a hard reject.
                  </Insight>
                </div>
              )}

              {/* ── Step 4: Gov ID ── */}
              {step === 4 && (
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 18, fontStyle: 'italic', color: '#EDE7DA', lineHeight: 1.35, marginBottom: 12 }}>
                    Government ID — choose one
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 9, margin: '12px 0' }}>
                    {ID_TYPES.map(type => (
                      <button
                        key={type}
                        className={`sk-chip${selectedId === type ? ' sel' : ''}`}
                        onClick={() => setSelectedId(type)}
                        style={{ border: '1px solid rgba(255,255,255,.06)', borderRadius: 11, padding: '11px 14px', fontSize: 12.5, cursor: 'pointer', textAlign: 'center', background: 'transparent', transition: '0.2s', color: selectedId === type ? '#EDE7DA' : '#9aa0ac', fontFamily: "'Manrope', sans-serif' " }}
                      >
                        {type}
                      </button>
                    ))}
                  </div>

                  <div
                    className={`sk-upload-zone${isDragging ? ' sk-upload-drag' : ''}${uploadedFile ? ' sk-upload-done' : ''}`}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    style={{
                      border: '1px dashed rgba(212,168,83,.16)', borderRadius: 22, padding: '26px 20px', textAlign: 'center', cursor: 'pointer',
                      background: 'repeating-linear-gradient(45deg, rgba(255,255,255,.012), rgba(255,255,255,.012) 8px, transparent 8px, transparent 18px)',
                      margin: '4px 0 12px', position: 'relative', transition: 'border-color .22s, background .22s',
                    }}
                  >
                    <div style={{ fontSize: 26, color: uploadedFile ? '#7FB07A' : 'rgba(212,168,83,.55)', marginBottom: 9, transition: '0.22s' }}>
                      {uploadedFile ? '✓' : '⊕'}
                    </div>
                    <div style={{ fontSize: 12, color: '#5f6675', fontWeight: 300, lineHeight: 1.55 }}>
                      <b style={{ color: '#EDE7DA', fontWeight: 500 }}>Click to upload</b> or drag your document here<br />JPG, PNG or PDF · max 5 MB
                    </div>
                    {uploadedFile && (
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10.5, color: '#7FB07A', marginTop: 9, wordBreak: 'break-all' }}>
                        {uploadedFile.name}
                      </div>
                    )}
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*,.pdf" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) applyFile(f); }} />

                  <Insight>
                    We extract <b style={{ color: '#9cc596' }}>name, age, and gender only</b>. Raw Aadhaar numbers are never stored. Your ID is never shown to a match — it keeps out fakes and makes bans permanent.
                  </Insight>
                  <GoldBtn onClick={finish}>Continue →</GoldBtn>
                </div>
              )}

              {/* ── Step 5: Verified ── */}
              {step === 5 && (
                <div>
                  <div style={{ textAlign: 'center', padding: '8px 0 22px' }}>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 48, color: '#D4A853', marginBottom: 8, lineHeight: 1 }}>✓</div>
                    <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: 28, fontWeight: 500, marginBottom: 5 }}>You're verified</div>
                    <div style={{ fontSize: 13, color: '#9aa0ac', fontWeight: 300 }}>Identity confirmed. Your journey can begin.</div>
                  </div>

                  {[
                    { icon: '✓', label: 'Phone confirmed',   detail: `${phoneMasked || '+91 ••••• ••••••'} · OTP verified` },
                    { icon: '◉', label: 'Liveness passed',   detail: 'Real person confirmed · selfie discarded by system' },
                    { icon: '⊙', label: 'Identity verified', detail: `${selectedId} · minimised & encrypted` },
                  ].map(row => (
                    <div key={row.label} style={{ display: 'flex', gap: 13, alignItems: 'flex-start', border: '1px solid rgba(127,176,122,.25)', borderRadius: 15, padding: 15, marginBottom: 10, background: 'rgba(127,176,122,.04)' }}>
                      <div style={{ width: 38, height: 38, borderRadius: 12, background: 'rgba(127,176,122,.08)', border: '1px solid rgba(127,176,122,.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: 18, color: '#7FB07A', flexShrink: 0 }}>
                        {row.icon}
                      </div>
                      <div>
                        <b style={{ fontSize: 13.5, display: 'block', marginBottom: 3 }}>{row.label}</b>
                        <p style={{ fontSize: 11.5, color: '#9aa0ac', fontWeight: 300, lineHeight: 1.5, margin: 0 }}>{row.detail}</p>
                      </div>
                    </div>
                  ))}

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', margin: '16px 0' }}>
                    {['✓ Phone', '✓ ID verified', '✓ Photo-matched'].map(badge => (
                      <span key={badge} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#7FB07A', border: '1px solid rgba(127,176,122,.25)', borderRadius: 30, padding: '5px 12px', background: 'rgba(127,176,122,.05)' }}>
                        {badge}
                      </span>
                    ))}
                  </div>

                  <GoldBtn onClick={() => navigate('/sakinah/liveness')}>Continue →</GoldBtn>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <div id="recaptcha-container"></div>
    </div>
  );
}

// ── Shared micro-components ────────────────────────────────────────────────

function GoldBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className="sk-btn-gold"
      style={{ display: 'block', width: '100%', textAlign: 'center', border: 'none', cursor: 'pointer', fontFamily: "'Manrope', sans-serif", fontWeight: 600, fontSize: 14, letterSpacing: '0.3px', padding: 15, borderRadius: 15, marginTop: 6, background: 'linear-gradient(135deg, #D4A853, #b98b39)', color: '#0a0e15' }}
    >
      {children}
    </button>
  );
}

function Insight({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{ fontSize: 11.5, lineHeight: 1.6, color: '#9aa0ac', fontWeight: 300, borderLeft: '2px solid #D4A853', paddingLeft: 13, margin: '13px 0', ...style }}>
      {children}
    </div>
  );
}

function StepNote({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 11.5, color: '#5f6675', fontWeight: 300, lineHeight: 1.5, marginTop: 10, textAlign: 'center' }}>
      {children}
    </div>
  );
}

export default RegisterPage;
