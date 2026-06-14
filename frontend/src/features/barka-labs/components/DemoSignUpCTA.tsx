/**
 * DemoSignUpCTA — Sign-up call-to-action for Barka Labs demo mode.
 * Two modes: inline block (replaces gated sections) and floating banner.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDemoDisplayFont } from '@/i18n';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, SignIn, X, Lock, Sparkle } from '@phosphor-icons/react';
import { C } from '../barka-labs.constants';

interface DemoSignUpCTAProps {
  mode: 'inline' | 'banner';
  context?: 'community' | 'battle' | 'challenge' | 'limit' | 'general';
  onDismiss?: () => void;
}

export function DemoSignUpCTA({ mode, context = 'general', onDismiss }: DemoSignUpCTAProps) {
  const { t } = useTranslation('demo');
  const navigate = useNavigate();
  const [dismissed, setDismissed] = useState(false);
  const title = t(`cta.${context}.title`);
  const subtitle = t(`cta.${context}.desc`);

  const handleSignUp = () => navigate('/signup');
  const handleSignIn = () => navigate('/login');
  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  if (dismissed && mode === 'banner') return null;

  if (mode === 'inline') {
    return (
      <div
        className="relative rounded-2xl p-6 md:p-8 text-center overflow-hidden"
        style={{
          background: 'linear-gradient(160deg, rgba(215,181,106,0.08) 0%, rgba(42,157,111,0.05) 50%, rgba(30,41,58,0.9) 100%)',
          border: '1px solid rgba(215,181,106,0.25)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        }}
      >
        {/* Blurred background hint */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.04] pointer-events-none">
          <div className="text-[120px] font-bold text-white">LOCKED</div>
        </div>

        <div className="relative z-[1]">
          <div className="w-14 h-14 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'rgba(215,181,106,0.15)', border: '1px solid rgba(215,181,106,0.3)' }}>
            <Lock size={28} weight="duotone" style={{ color: C.gold }} />
          </div>
          <h3 className="text-xl font-bold mb-2" style={{ color: C.t1, fontFamily: getDemoDisplayFont() }}>
            {title}
          </h3>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: '#A7B1C0' }}>
            {subtitle}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={handleSignUp}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all hover:scale-[1.02] active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #D7B56A, #E7CF8C)',
                color: '#1E293A',
                boxShadow: '0 4px 16px rgba(212,168,83,0.3)',
              }}
            >
              <UserPlus size={18} weight="bold" />
              {t('cta.createAccount')}
            </button>
            <button
              onClick={handleSignIn}
              className="flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all hover:bg-white/5"
              style={{ border: '1px solid rgba(215,181,106,0.3)', color: '#D7B56A' }}
            >
              <SignIn size={18} />
              {t('cta.signIn')}
            </button>
          </div>
          <p className="mt-4 text-xs" style={{ color: '#7F8A9A' }}>
            {t('cta.socialProof')}
          </p>
        </div>
      </div>
    );
  }

  // Banner mode
  return (
    <AnimatePresence>
      {!dismissed && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="fixed bottom-0 left-0 right-0 z-[9998] p-4"
        >
          <div
            className="max-w-2xl mx-auto rounded-2xl p-4 md:p-5 flex items-center gap-4 relative"
            style={{
              background: 'rgba(13,19,35,0.97)',
              border: '1px solid rgba(215,181,106,0.35)',
              backdropFilter: 'blur(20px)',
              boxShadow: '0 -8px 40px rgba(0,0,0,0.4)',
            }}
          >
            <div className="hidden sm:flex w-10 h-10 rounded-xl items-center justify-center shrink-0" style={{ background: 'rgba(215,181,106,0.15)' }}>
              <Sparkle size={22} weight="duotone" style={{ color: C.gold }} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate" style={{ color: C.t1 }}>{title}</p>
              <p className="text-xs mt-0.5 line-clamp-2" style={{ color: '#A7B1C0' }}>{subtitle}</p>
            </div>
            <button
              onClick={handleSignUp}
              className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: 'linear-gradient(135deg, #D7B56A, #E7CF8C)',
                color: '#1E293A',
              }}
            >
              {t('cta.signUpFree')}
            </button>
            <button
              onClick={handleDismiss}
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center"
              style={{ background: 'rgba(30,41,58,0.9)', border: '1px solid rgba(215,181,106,0.3)' }}
            >
              <X size={12} style={{ color: '#A7B1C0' }} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
