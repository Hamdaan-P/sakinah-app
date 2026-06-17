/**
 * Login Page
 * Mirrors Flutter's features/auth/presentation/pages/login_modern.dart
 * Responsive desktop/mobile layouts with Google sign-in
 */

import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiLoader } from 'react-icons/fi';
import { Sparkle, UsersThree, CurrencyDollarSimple, GridFour, GlobeHemisphereWest, Wallet } from '@phosphor-icons/react';
import { FcGoogle } from 'react-icons/fc';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { useAuthStore } from '@/core/stores/auth.store';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { GuestGuard } from '../components/AuthGuard';
import logoGold from '@/assets/zaryah-logo-gold.png';

// Form validation schema
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(1, 'Please enter your password'),
  rememberMe: z.boolean().optional(),
});

type LoginForm = z.infer<typeof loginSchema>;

function LoginPage() {
  const navigate = useNavigate();
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const { signIn, signInWithGoogle, state, clearError, user } = useAuthStore();
  const isLoading = state.type === 'loading';
  const error = state.type === 'error' ? state.message : null;

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  // Navigate on successful auth (skip for anonymous users — they're here to sign in with real credentials)
  useEffect(() => {
    if (state.type !== 'authenticated' || user?.isAnonymous) return;
    const uid = user?.id;
    if (!uid) {
      navigate('/sakinah/niyyah');
      return;
    }
    getDoc(doc(db, 'users', uid)).then((snap) => {
      const role = snap.exists() ? snap.data()?.sakinah_role : null;
      navigate(role ? '/sakinah' : '/sakinah/niyyah');
    }).catch(() => {
      navigate('/sakinah/niyyah');
    });
  }, [state.type, user?.isAnonymous, user?.id, navigate]);

  // Clear error when component unmounts
  useEffect(() => {
    return () => clearError();
  }, [clearError]);

  const onSubmit = async (data: LoginForm) => {
    await signIn(data.email, data.password);
  };

  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleForgotPasswordSuccess = () => {
    // Show success toast (you can integrate a toast library)
    alert('Password reset email sent! Check your inbox.');
  };

  return (
    <GuestGuard>
      <div className="min-h-screen bg-gray-950 flex">
        {/* Desktop: Left Panel - Branding (hidden on mobile) */}
        <div className="hidden lg:flex lg:flex-1 lg:flex-col bg-gradient-to-br from-[#001F3F] via-[#003366] to-[#004080] relative overflow-hidden">
          {/* Geometric Pattern Overlay */}
          <div className="absolute inset-0 opacity-5">
            <GeometricPattern />
          </div>

          {/* Logo — sits at the top of the flex column so the centered content below cannot collide with it */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative z-20 mt-5 ml-4 self-start flex items-center -space-x-1"
          >
            <img
              src={logoGold}
              alt="ZaryahPlus logo"
              className="w-14 h-14 object-contain drop-shadow-[0_6px_18px_rgba(0,0,0,0.5)]"
            />
            <h2 className="text-4xl font-bold text-[#D4A853] -mt-1" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              Zaryah<span className="text-[#E8C97A] text-[0.75em] align-super">+</span>
            </h2>
          </motion.div>

          {/* Content */}
          <div className="relative z-10 flex flex-1 flex-col justify-center px-16 max-w-xl">
            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-8 text-4xl lg:text-5xl font-bold text-white leading-tight"
            >
              The World's First<br />Islamic Super Agent
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-6 text-lg text-white/80 leading-relaxed"
            >
              One platform for your entire Islamic life — faith, finance,
              community, and an AI companion who actually knows you.
            </motion.p>

            {/* Feature Highlights */}
            <div className="mt-12 space-y-5">
              <FeatureItem
                icon={<Sparkle size={24} weight="duotone" />}
                title="Raya — Your AI Companion"
                description="Trained on Quran, Hadith & classical scholarship across all 4 madhahib"
                delay={0.6}
              />
              <FeatureItem
                icon={<UsersThree size={24} weight="duotone" />}
                title="Companion Mode"
                description="Wisdom inspired by the Sahaba, Sahabiyat & the Four Great Imams"
                delay={0.7}
              />
              <FeatureItem
                icon={<CurrencyDollarSimple size={24} weight="duotone" />}
                title="Islamic Finance Suite"
                description="Shariah-compliant banking, zakat calculator, halal stock screening"
                delay={0.8}
              />
              <FeatureItem
                icon={<Wallet size={24} weight="duotone" />}
                title="DinarZ Wallet"
                description="Earn rewards, track your contributions & manage your digital wallet"
                delay={0.9}
              />
              <FeatureItem
                icon={<GridFour size={24} weight="duotone" />}
                title="30+ Integrated Services"
                description="Quran, prayer times, matrimony, education, commerce & more"
                delay={1.0}
              />
            </div>

            {/* Stat line */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
              className="mt-10 flex items-center gap-2 text-white/50 text-sm"
            >
              <GlobeHemisphereWest size={16} />
              <span>Built for 1.8 billion Muslims worldwide</span>
            </motion.div>
          </div>
        </div>

        {/* Right Panel - Login Form (full width on mobile) */}
        <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-b from-gray-950 to-black">
          <div className="w-full max-w-md">
            {/* Mobile Logo */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="lg:hidden flex justify-center mb-8"
            >
              <img
                src={logoGold}
                alt="ZaryahPlus logo"
                className="w-28 h-28 object-contain drop-shadow-[0_10px_24px_rgba(0,0,0,0.45)]"
              />
            </motion.div>

            {/* Header */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-10"
            >
              <h2 className="text-3xl font-bold text-white">Welcome Back</h2>
              <p className="mt-2 text-gray-400">Sign in to continue your journey</p>
            </motion.div>

            {/* Login Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <div className="relative">
                  <FiMail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="email"
                    {...register('email')}
                    placeholder="Email Address"
                    className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A853]/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="mt-2 text-sm text-red-400">{errors.email.message}</p>
                )}
              </motion.div>

              {/* Password Field */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <div className="relative">
                  <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                  <input
                    type="password"
                    {...register('password')}
                    placeholder="Password"
                    className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A853]/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
                    disabled={isLoading}
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-400">{errors.password.message}</p>
                )}
              </motion.div>

              {/* Remember Me & Forgot Password */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center justify-between"
              >
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('rememberMe')}
                    className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-[#D4A853] focus:ring-amber-500/50"
                  />
                  <span className="text-sm text-gray-400">Remember me</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-[#D4A853] hover:text-[#D4A853] font-medium transition-colors"
                >
                  Forgot Password?
                </button>
              </motion.div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl"
                >
                  <p className="text-sm text-red-400">{error}</p>
                </motion.div>
              )}

              {/* Sign In Button */}
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                type="submit"
                disabled={isLoading}
                className="w-full min-h-[54px] px-[22px] py-[14px] bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-black font-bold rounded-lg hover:from-[#D4A853] hover:to-[#E8C97A] disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <FiLoader className="w-5 h-5 animate-spin" />
                    Signing In...
                  </>
                ) : (
                  'Sign In'
                )}
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-700" />
                <span className="text-sm text-gray-500">Or continue with</span>
                <div className="flex-1 h-px bg-gray-700" />
              </div>

              {/* Google Sign In */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="w-full py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3"
              >
                <FcGoogle className="w-5 h-5" />
                Continue with Google
              </motion.button>
            </form>

            {/* Sign Up Link */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="mt-8 text-center text-gray-400"
            >
              Don't have an account?{' '}
              <Link
                to="/signup"
                className="text-[#D4A853] hover:text-[#D4A853] font-medium transition-colors"
              >
                Sign Up
              </Link>
            </motion.p>
          </div>
        </div>

        {/* Forgot Password Modal */}
        <ForgotPasswordModal
          isOpen={showForgotPassword}
          onClose={() => setShowForgotPassword(false)}
          onSuccess={handleForgotPasswordSuccess}
        />
      </div>
    </GuestGuard>
  );
}

// Feature Item Component
interface FeatureItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function FeatureItem({ icon, title, description, delay }: FeatureItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex items-start gap-4"
    >
      <div className="w-12 h-12 rounded-xl bg-[#D4A853]/15 border border-[#D4A853]/30 flex items-center justify-center text-[#D4A853] flex-shrink-0">
        {icon}
      </div>
      <div>
        <h3 className="font-semibold text-white">{title}</h3>
        <p className="text-sm text-white/70">{description}</p>
      </div>
    </motion.div>
  );
}

// Geometric Pattern SVG (Islamic-inspired octagonal pattern)
function GeometricPattern() {
  return (
    <svg width="100%" height="100%" className="absolute inset-0">
      <defs>
        <pattern id="octagon" width="60" height="60" patternUnits="userSpaceOnUse">
          <path
            d="M30 5 L45 12 L52 27 L52 43 L45 58 L30 65 L15 58 L8 43 L8 27 L15 12 Z"
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            transform="translate(-15, -17.5)"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#octagon)" />
    </svg>
  );
}

export default LoginPage;
