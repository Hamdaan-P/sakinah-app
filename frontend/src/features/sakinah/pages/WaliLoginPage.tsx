/**
 * WaliLoginPage — /sakinah/wali-login
 * Phone + OTP sign-in for Wali (guardian) users.
 * No KYC, no selfie, no government ID — presence only.
 */

import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { getAuth, signInWithPhoneNumber, signInWithEmailAndPassword, RecaptchaVerifier } from 'firebase/auth';
import '../sakinah.css';

const PAGE_BG =
  'radial-gradient(1200px 800px at 50% -10%, rgba(212,168,83,.07), transparent 60%), #07090f';

export function WaliLoginPage() {
  const navigate = useNavigate();

  const [step, setStep]                   = useState<'phone' | 'otp'>('phone');
  const [phone, setPhone]                 = useState('');
  const [phoneMasked, setPhoneMasked]     = useState('');
  const [otpValues, setOtpValues]         = useState(['', '', '', '', '', '']);
  const [resendSecs, setResendSecs]       = useState(30);
  const [showResend, setShowResend]       = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [error, setError]                 = useState<string | null>(null);
  const [loading, setLoading]             = useState(false);

  const otpRefs        = useRef<(HTMLInputElement | null)[]>(Array(6).fill(null));
  const resendTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Phone step ────────────────────────────────────────────────────────────

  const sendOtp = async () => {
    if (phone.length < 10) return;
    setError(null);

    // Dev bypass — signs in as Hassan (hassan@test.com)
    if (phone === '9999999998') {
      setLoading(true);
      try {
        await signInWithEmailAndPassword(getAuth(), 'hassan@test.com', 'Test1234!');
        navigate('/sakinah/wali-dashboard');
      } catch (e) {
        console.error('Dev bypass sign-in failed:', e);
        setError('Dev bypass failed. Check console.');
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(true);
    try {
      const auth = getAuth();

      if ((window as any).recaptchaVerifierWali) {
        try { (window as any).recaptchaVerifierWali.clear(); } catch {}
        (window as any).recaptchaVerifierWali = null;
      }
      const container = document.getElementById('recaptcha-container-wali');
      if (container) container.innerHTML = '';

      const verifier = new RecaptchaVerifier(auth, 'recaptcha-container-wali', {
        size: 'invisible',
      });
      (window as any).recaptchaVerifierWali = verifier;

      const fullPhone = phone.startsWith('+') ? phone : `+91${phone}`;
      const result = await signInWithPhoneNumber(auth, fullPhone, verifier);
      setConfirmationResult(result);

      const raw = phone.replace(/\D/g, '');
      setPhoneMasked('+91 ' + raw.slice(0, 5).replace(/./g, '•') + ' ••' + raw.slice(-3));

      setStep('otp');
      startResendTimer();
      setTimeout(() => otpRefs.current[0]?.focus(), 180);
    } catch (e) {
      console.error('OTP send failed:', e);
      setError('Could not send the code. Please check the number and try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── OTP step ──────────────────────────────────────────────────────────────

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
    setError(null);
    setLoading(true);
    try {
      if (confirmationResult) await confirmationResult.confirm(code);
      navigate('/sakinah/wali-dashboard');
    } catch (e) {
      console.error('OTP verify failed:', e);
      setError('That code did not match. Please try again.');
    } finally {
      setLoading(false);
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

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div
      style={{
        minHeight: '100vh',
        background: PAGE_BG,
        color: '#EDE7DA',
        fontFamily: "'Manrope', sans-serif",
        WebkitFontSmoothing: 'antialiased',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 24px',
      }}
    >
      <div style={{ width: '100%', maxWidth: 420 }}>

        {/* ── Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ textAlign: 'center', marginBottom: 36 }}
        >
          {/* Raya orb */}
          <div
            style={{
              width: 52, height: 52, borderRadius: '50%', margin: '0 auto 18px',
              background: 'radial-gradient(circle at 38% 32%, #f0d28f, #cf9f44 70%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Cormorant Garamond', serif", fontSize: 24, color: '#3a2c0c',
              boxShadow: '0 8px 22px rgba(212,168,83,.3)',
            }}
          >
            ر
          </div>

          <div
            style={{
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 10, letterSpacing: '0.22em',
              textTransform: 'uppercase', color: 'rgba(212,168,83,.55)',
              marginBottom: 8,
            }}
          >
            As-salamu alaykum
          </div>

          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 32, fontWeight: 500, lineHeight: 1.1,
              marginBottom: 10, color: '#EDE7DA',
            }}
          >
            Sign in as a Guardian
          </h1>

          <p
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontStyle: 'italic', fontSize: 15,
              color: '#9aa0ac', lineHeight: 1.55, margin: 0,
            }}
          >
            Your presence is a gift. We just need to confirm it's you.
          </p>
        </motion.div>

        {/* ── Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          style={{
            border: '1px solid rgba(255,255,255,.07)',
            borderRadius: 22,
            padding: '28px 24px',
            background: 'rgba(255,255,255,.015)',
            marginBottom: 24,
          }}
        >
          <AnimatePresence mode="wait">

            {/* Phone step */}
            {step === 'phone' && (
              <motion.div
                key="phone"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  style={{
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 9, letterSpacing: '0.22em',
                    textTransform: 'uppercase', color: 'rgba(212,168,83,.55)',
                    marginBottom: 9,
                  }}
                >
                  Your phone number
                </div>

                <div
                  style={{
                    display: 'flex',
                    border: '1px solid rgba(255,255,255,.06)',
                    borderRadius: 13, overflow: 'hidden',
                    background: 'rgba(255,255,255,.018)', marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      padding: '14px 16px',
                      fontFamily: "'JetBrains Mono', monospace", fontSize: 13, color: '#e7c984',
                      borderRight: '1px solid rgba(255,255,255,.06)',
                      background: 'rgba(212,168,83,.04)',
                      flexShrink: 0, display: 'flex', alignItems: 'center',
                    }}
                  >
                    +91
                  </div>
                  <input
                    type="tel" placeholder="00000 00000"
                    maxLength={10} inputMode="numeric" autoComplete="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && sendOtp()}
                    style={{
                      flex: 1, minWidth: 0, background: 'transparent', border: 'none',
                      padding: '14px 16px',
                      fontFamily: "'Manrope', sans-serif", fontSize: 14,
                      color: '#EDE7DA', outline: 'none',
                    }}
                  />
                </div>

                {error && (
                  <div style={{ fontSize: 12, color: '#C98A8A', marginBottom: 10, lineHeight: 1.5 }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={sendOtp}
                  disabled={loading || phone.length < 10}
                  className="sk-btn-gold"
                  style={{
                    display: 'block', width: '100%', textAlign: 'center',
                    border: 'none', cursor: phone.length < 10 ? 'not-allowed' : 'pointer',
                    fontFamily: "'Manrope', sans-serif", fontWeight: 600,
                    fontSize: 14, letterSpacing: '0.3px',
                    padding: 15, borderRadius: 15,
                    background: phone.length < 10
                      ? 'rgba(212,168,83,.3)'
                      : 'linear-gradient(135deg, #D4A853, #b98b39)',
                    color: '#0a0e15',
                    opacity: loading ? 0.7 : 1,
                    transition: 'background .2s, opacity .2s',
                  }}
                >
                  {loading ? 'Sending...' : 'Send code'}
                </button>
              </motion.div>
            )}

            {/* OTP step */}
            {step === 'otp' && (
              <motion.div
                key="otp"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <div
                  style={{
                    fontFamily: "'Cormorant Garamond', serif",
                    fontSize: 18, fontStyle: 'italic',
                    color: '#EDE7DA', lineHeight: 1.35, marginBottom: 6,
                  }}
                >
                  Enter the 6-digit code
                </div>
                <div style={{ fontSize: 11.5, color: '#5f6675', fontWeight: 300, marginBottom: 16 }}>
                  Sent to {phoneMasked} &middot;{' '}
                  <span
                    style={{ color: 'rgba(212,168,83,.55)', cursor: 'pointer' }}
                    onClick={() => { setStep('phone'); setError(null); }}
                  >
                    Edit number
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex', gap: 10,
                    justifyContent: 'center', margin: '0 0 8px',
                  }}
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
                        background: 'rgba(255,255,255,.018)',
                        border: `1px solid ${val ? 'rgba(212,168,83,.35)' : 'rgba(255,255,255,.06)'}`,
                        borderRadius: 13,
                        fontFamily: "'Cormorant Garamond', serif", fontSize: 28,
                        color: val ? '#e7c984' : '#EDE7DA',
                        outline: 'none', caretColor: '#D4A853', transition: '0.18s',
                      }}
                    />
                  ))}
                </div>

                {!showResend && (
                  <div
                    style={{
                      textAlign: 'center',
                      fontFamily: "'JetBrains Mono', monospace",
                      fontSize: 11, color: '#5f6675',
                      margin: '8px 0 4px', letterSpacing: '0.03em',
                    }}
                  >
                    Resend in {resendSecs}s
                  </div>
                )}
                {showResend && (
                  <div style={{ textAlign: 'center', margin: '8px 0 4px' }}>
                    <span
                      style={{ fontSize: 11.5, color: 'rgba(212,168,83,.55)', cursor: 'pointer' }}
                      onClick={resendOtp}
                    >
                      Resend code
                    </span>
                  </div>
                )}

                {error && (
                  <div style={{ fontSize: 12, color: '#C98A8A', margin: '8px 0', lineHeight: 1.5 }}>
                    {error}
                  </div>
                )}

                <button
                  onClick={verifyOtp}
                  disabled={loading || otpValues.join('').length < 6}
                  className="sk-btn-gold"
                  style={{
                    display: 'block', width: '100%', textAlign: 'center',
                    border: 'none',
                    cursor: otpValues.join('').length < 6 ? 'not-allowed' : 'pointer',
                    fontFamily: "'Manrope', sans-serif", fontWeight: 600,
                    fontSize: 14, letterSpacing: '0.3px',
                    padding: 15, borderRadius: 15, marginTop: 10,
                    background: otpValues.join('').length < 6
                      ? 'rgba(212,168,83,.3)'
                      : 'linear-gradient(135deg, #D4A853, #b98b39)',
                    color: '#0a0e15',
                    opacity: loading ? 0.7 : 1,
                    transition: 'background .2s, opacity .2s',
                  }}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>

        {/* ── Footer ── */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{
            textAlign: 'center',
            fontFamily: "'Cormorant Garamond', serif",
            fontStyle: 'italic',
            fontSize: 13.5,
            color: '#5f6675',
            lineHeight: 1.6,
            margin: 0,
          }}
        >
          You are here to steward, not to decide.<br />
          The journey belongs to them.
        </motion.p>

      </div>

      <div id="recaptcha-container-wali" />
    </div>
  );
}

export default WaliLoginPage;
