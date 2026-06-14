/**
 * SignupForm — right-side form panel for SignupPage. Pure presentational —
 * all submit/loading state and handlers flow in via props.
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiMail, FiLock, FiUser, FiLoader } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import logoGold from '@/assets/zaryah-logo-gold.png';
import { PasswordRequirements } from '../../components/PasswordRequirements';
import { validatePassword } from '../../utils/passwordValidator';
import { useEffect, useState } from 'react';

// Form validation schema with custom password validation
const signupSchema = z.object({
  fullName: z.string().min(1, 'Please enter your name'),
  email: z.string().email('Please enter a valid email'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .superRefine((val, ctx) => {
      const error = validatePassword(val);
      if (error) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: error,
        });
      }
    }),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

export type SignupFormValues = z.infer<typeof signupSchema>;

interface Props {
  isLoading: boolean;
  error: string | null;
  initialReferralCode: string | null;
  onSubmit: (data: SignupFormValues) => Promise<void> | void;
  onGoogleSignUp: (referralCode: string | undefined) => Promise<void> | void;
}

export function SignupForm({ isLoading, error, initialReferralCode, onSubmit, onGoogleSignUp }: Props) {
  const [showPasswordRequirements, setShowPasswordRequirements] = useState(false);
  const [termsShake, setTermsShake] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      referralCode: '',
      agreeToTerms: false as unknown as true,
    },
  });

  const password = watch('password');
  const agreeToTerms = watch('agreeToTerms');

  // Show password requirements when user starts typing
  useEffect(() => {
    setShowPasswordRequirements(password.length > 0);
  }, [password]);

  useEffect(() => {
    if (initialReferralCode) {
      setValue('referralCode', initialReferralCode);
    }
  }, [initialReferralCode, setValue]);

  const nudgeTerms = () => {
    if (!agreeToTerms) {
      setTermsShake(true);
      setTimeout(() => setTermsShake(false), 800);
    }
  };

  const submit: SubmitHandler<SignupFormValues> = (data) => {
    onSubmit(data);
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-gradient-to-b from-gray-950 to-black overflow-y-auto">
      <div className="w-full max-w-md py-8">
        {/* Mobile Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="lg:hidden flex items-center justify-between mb-8"
        >
          <div>
            <h2 className="text-2xl font-bold text-white">Create Account</h2>
            <p className="text-gray-400 text-sm">Start your learning journey</p>
          </div>
          <img
            src={logoGold}
            alt="ZaryahPlus logo"
            className="w-14 h-14 object-contain"
          />
        </motion.div>

        {/* Desktop Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="hidden lg:block text-center mb-8"
        >
          <h2 className="text-3xl font-bold text-white">Create Account</h2>
          <p className="mt-2 text-gray-400">Start your learning journey today</p>
        </motion.div>

        {/* Signup Form */}
        <form onSubmit={handleSubmit(submit)} className="space-y-4">
          {/* Full Name Field */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                {...register('fullName')}
                placeholder="Full Name"
                className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A853]/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
                disabled={isLoading}
              />
            </div>
            {errors.fullName && (
              <p className="mt-2 text-sm text-red-400">{errors.fullName.message}</p>
            )}
          </motion.div>

          {/* Email Field */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
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

          {/* Password Requirements */}
          {showPasswordRequirements && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} transition={{ duration: 0.3 }}>
              <PasswordRequirements password={password} />
            </motion.div>
          )}

          {/* Confirm Password Field */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
            <div className="relative">
              <FiLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="Confirm Password"
                className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A853]/50 focus:ring-1 focus:ring-amber-500/50 transition-colors"
                disabled={isLoading}
              />
            </div>
            {errors.confirmPassword && (
              <p className="mt-2 text-sm text-red-400">{errors.confirmPassword.message}</p>
            )}
          </motion.div>

          {/* Referral Code Field */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.45 }}>
            <div className="relative">
              <FiUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                {...register('referralCode')}
                placeholder="Referral Code (Optional)"
                className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-[#D4A853]/50 focus:ring-1 focus:ring-amber-500/50 transition-colors uppercase"
                disabled={isLoading}
              />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Have a referral code? Enter it to credit the person who invited you.
            </p>
          </motion.div>

          {/* Terms & Conditions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className={`p-4 rounded-xl border transition-all ${
              agreeToTerms
                ? 'bg-gray-800/50 border-[#D4A853]'
                : termsShake
                  ? 'bg-red-500/10 border-red-400 animate-[shake_0.5s_ease-in-out]'
                  : 'bg-gray-800/30 border-gray-700'
            }`}
          >
            <label className="flex items-start gap-3 cursor-pointer">
              <div className="mt-0.5">
                <input
                  type="checkbox"
                  {...register('agreeToTerms')}
                  className="w-5 h-5 rounded border-gray-600 bg-gray-800 text-[#D4A853] focus:ring-amber-500/50"
                />
              </div>
              <span className="text-sm text-gray-400">
                I agree to the{' '}
                <Link to="/legal/terms" target="_blank" className="text-[#D4A853] font-medium hover:text-[#D4A853]">
                  Terms & Conditions
                </Link>{' '}
                and{' '}
                <Link to="/legal/privacy" target="_blank" className="text-[#D4A853] font-medium hover:text-[#D4A853]">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {errors.agreeToTerms && (
              <p className="mt-2 text-sm text-red-400">{errors.agreeToTerms.message}</p>
            )}
            {termsShake && !agreeToTerms && (
              <p className="mt-2 text-sm text-red-400 font-medium">Please agree to the terms to continue</p>
            )}
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-red-500/10 border border-red-500/30 rounded-xl">
              <p className="text-sm text-red-400">{error}</p>
              {error.toLowerCase().includes('already exists') && (
                <Link to="/login" className="inline-block mt-2 text-sm font-semibold text-[#D4A853] hover:underline">
                  Sign in to your account &rarr;
                </Link>
              )}
            </motion.div>
          )}

          {/* Create Account Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            type={agreeToTerms ? 'submit' : 'button'}
            onClick={!agreeToTerms ? nudgeTerms : undefined}
            className={`w-full min-h-[54px] px-[22px] py-[14px] bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-black font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
              isLoading || !agreeToTerms ? 'opacity-50 cursor-not-allowed' : 'hover:from-[#D4A853] hover:to-[#E8C97A]'
            }`}
          >
            {isLoading ? (
              <>
                <FiLoader className="w-5 h-5 animate-spin" />
                Creating Account...
              </>
            ) : (
              'Create Account'
            )}
          </motion.button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-700" />
            <span className="text-sm text-gray-500">Or continue with</span>
            <div className="flex-1 h-px bg-gray-700" />
          </div>

          {/* Google Sign Up */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            type="button"
            onClick={!agreeToTerms ? nudgeTerms : () => onGoogleSignUp((watch('referralCode') || '').trim().toUpperCase() || undefined)}
            className={`w-full py-4 bg-gray-800/50 border border-gray-700 rounded-xl text-white font-medium transition-all flex items-center justify-center gap-3 ${
              isLoading || !agreeToTerms ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-800'
            }`}
          >
            <FcGoogle className="w-5 h-5" />
            Continue with Google
          </motion.button>
        </form>

        {/* Sign In Link */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.8 }}
          className="mt-8 text-center text-gray-400"
        >
          Already have an account?{' '}
          <Link
            to="/login"
            className="text-[#D4A853] hover:text-[#D4A853] font-medium transition-colors"
          >
            Sign In
          </Link>
        </motion.p>
      </div>
    </div>
  );
}
