/**
 * Admin Login Page
 * Completely separate gateway from the main app login.
 * Only whitelisted admin emails can sign in here.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, Spinner, Eye, EyeSlash, WarningCircle } from '@phosphor-icons/react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/config/firebase.config';
import { BACKEND_URL } from '@/lib/api';
import logoGold from '@/assets/zaryah-logo-gold.png';

const BG = '#0B1120';
const SURFACE = '#151E2F';
const GOLD = '#D4A853';
const WHITE = '#F8FAFC';
const TEXT_2 = '#94A3B8';
const TEXT_3 = '#64748B';
const BORDER = 'rgba(212,168,83,0.12)';
const RED = '#F87171';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@zaryahplus.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verifyAdminAccess = async (token: string): Promise<boolean> => {
    const res = await fetch(
      `${BACKEND_URL}/admin/stats`,
      { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10000) }
    );
    if (res.status === 403) {
      setError('This account does not have admin access.');
      return false;
    }
    if (!res.ok) {
      setError('Server error. Please try again.');
      return false;
    }
    return true;
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError('');

    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
      const token = await cred.user.getIdToken();
      if (await verifyAdminAccess(token)) {
        navigate('/admin/dashboard');
      }
    } catch (err: unknown) {
      const msg = (err as { code?: string })?.code;
      if (msg?.includes('user-not-found') || msg?.includes('wrong-password') || msg?.includes('invalid-credential')) {
        setError('Invalid email or password.');
      } else if (msg?.includes('too-many-requests')) {
        setError('Too many attempts. Please wait and try again.');
      } else {
        setError('Authentication failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: BG }}>
      {/* Subtle grid background */}
      <div className="fixed inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(${GOLD} 1px, transparent 1px), linear-gradient(90deg, ${GOLD} 1px, transparent 1px)`,
        backgroundSize: '60px 60px',
      }} />

      <motion.div
        className="relative w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        {/* Card */}
        <div className="rounded-3xl border p-10" style={{ background: SURFACE, borderColor: BORDER }}>
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-6">
              <img src={logoGold} alt="ZaryahPlus" className="w-10 h-10 object-contain" />
              <div className="w-px h-8" style={{ background: BORDER }} />
              <ShieldCheck size={28} weight="bold" style={{ color: GOLD }} />
            </div>
            <h1 className="text-3xl font-black tracking-tight mb-2" style={{ color: WHITE }}>
              Admin Portal
            </h1>
            <p className="text-sm font-medium" style={{ color: TEXT_3 }}>
              Restricted access. Authorized personnel only.
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 p-4 rounded-xl mb-6"
              style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}
            >
              <WarningCircle size={20} weight="bold" style={{ color: RED }} />
              <p className="text-sm font-medium" style={{ color: RED }}>{error}</p>
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="adminloginpage-fld-1" className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: TEXT_2 }}>
                Admin Email
              </label>
              <input id="adminloginpage-fld-1"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@zaryahplus.com"
                autoComplete="email"
                required
                className="w-full px-4 py-3.5 rounded-xl text-sm font-medium outline-none border transition-colors focus:border-[#D4A853]/40"
                style={{ background: BG, color: WHITE, borderColor: BORDER }}
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="adminloginpage-fld-2" className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: TEXT_2 }}>
                Password
              </label>
              <div className="relative">
                <input id="adminloginpage-fld-2"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                  className="w-full px-4 py-3.5 pr-12 rounded-xl text-sm font-medium outline-none border transition-colors focus:border-[#D4A853]/40"
                  style={{ background: BG, color: WHITE, borderColor: BORDER }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/5"
                >
                  {showPassword
                    ? <EyeSlash size={18} style={{ color: TEXT_3 }} />
                    : <Eye size={18} style={{ color: TEXT_3 }} />
                  }
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !email.trim() || !password.trim()}
              className="w-full py-4 rounded-xl text-base font-black tracking-wide transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ background: GOLD, color: BG }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Spinner size={18} className="animate-spin" />
                  Verifying...
                </span>
              ) : (
                'Sign In to Admin'
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t text-center" style={{ borderColor: BORDER }}>
            <p className="text-xs font-medium" style={{ color: TEXT_3 }}>
              This portal is for ZaryahPlus administrators only.
              <br />
              Unauthorized access attempts are logged.
            </p>
          </div>
        </div>

        {/* Back to app link */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/login')}
            className="text-sm font-medium hover:underline transition-colors"
            style={{ color: TEXT_3 }}
          >
            Back to main app
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default AdminLoginPage;
