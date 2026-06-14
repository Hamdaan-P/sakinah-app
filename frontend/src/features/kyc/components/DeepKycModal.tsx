/**
 * Deep KYC Modal
 * "Complete your profile to unlock" modal with blur backdrop
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, ArrowRight } from '@phosphor-icons/react';

interface DeepKycModalProps {
  open: boolean;
  onClose: () => void;
  featureName?: string;
}

export function DeepKycModal({ open, onClose, featureName = 'this feature' }: DeepKycModalProps) {
  const navigate = useNavigate();

  const handleComplete = () => {
    onClose();
    navigate('/deep-kyc');
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="w-full max-w-sm bg-gradient-to-b from-[#0F141F] to-[#0A0E16] rounded-2xl border border-[rgba(212,168,83,0.2)] overflow-hidden shadow-2xl">
              {/* Header glow */}
              <div className="relative h-32 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-[#D4A853]/15 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-[#D4A853]/15 border border-[#D4A853]/30 flex items-center justify-center">
                    <Lock size={32} className="text-[#D4A853]" weight="duotone" />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="px-6 pb-6 text-center -mt-4">
                <h2 className="text-xl font-bold text-[#F5E8C7] mb-2">
                  Complete Your Profile
                </h2>
                <p className="text-[#7A7363] text-sm leading-relaxed mb-6">
                  <span className="text-[#D4A853] font-medium">{featureName}</span> requires a complete profile.
                  It only takes 2 minutes with Raya!
                </p>

                {/* Benefits */}
                <div className="space-y-2 mb-6">
                  {[
                    'Unlock all premium features',
                    'Get personalized recommendations',
                    'Connect with the full community',
                  ].map((benefit) => (
                    <div key={benefit} className="flex items-center gap-2 text-left">
                      <ShieldCheck size={16} className="text-[#D4A853] shrink-0" />
                      <span className="text-[#C9C0A8] text-xs">{benefit}</span>
                    </div>
                  ))}
                </div>

                {/* Buttons */}
                <button
                  onClick={handleComplete}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16] font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2 mb-3"
                >
                  Complete Profile
                  <ArrowRight size={16} weight="bold" />
                </button>
                <button
                  onClick={onClose}
                  className="text-[#5C5749] text-xs hover:text-[#7A7363] transition-colors"
                >
                  Maybe later
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
