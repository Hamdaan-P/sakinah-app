/**
 * FirstLaunchDisclaimerModal — platform-wide one-time modal
 * Shown once after first login, covers all major disclaimer areas
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HandsClapping, CurrencyCircleDollar, Robot, Heart } from '@phosphor-icons/react';

interface FirstLaunchDisclaimerModalProps {
  onAccept: () => void;
}

const sections = [
  {
    icon: HandsClapping,
    title: 'Unity & Scholarly Diversity',
    body: 'We present verified content from all major schools of thought. Where scholars differ, we show the range of valid opinions — not to divide, but to educate and bring our Ummah together.',
  },
  {
    icon: CurrencyCircleDollar,
    title: 'Financial Tools',
    body: 'Our investment screeners, calculators, and banking tools are for educational purposes only. They do not constitute financial advice. Always consult a qualified Islamic finance advisor.',
  },
  {
    icon: Robot,
    title: 'AI Companions',
    body: 'Our AI-powered companions provide guidance based on training data. They are not scholars or licensed professionals. Always verify important rulings with qualified scholars.',
  },
  {
    icon: Heart,
    title: 'Wellbeing & Support',
    body: 'Our wellness features offer emotional support, not professional therapy. If you are in crisis, please contact your local emergency services or a mental health professional.',
  },
];

export function FirstLaunchDisclaimerModal({ onAccept }: FirstLaunchDisclaimerModalProps) {
  const [checked, setChecked] = useState(false);

  return (
    <AnimatePresence>
      <motion.div
        key="disclaimer-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
      />
      <motion.div key="disclaimer-content" className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-lg my-4 bg-gradient-to-b from-[#0F141F] to-[#0A0E16] rounded-2xl border border-[rgba(212,168,83,0.2)] shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="relative px-6 pt-6 pb-4 text-center">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-20 bg-[#D4A853]/10 blur-3xl rounded-full" />
            <p className="relative text-lg text-[#D4A853]/60 font-['Amiri'] mb-2">
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </p>
            <h2 className="relative text-xl font-bold text-[#F5E8C7]">One Ummah. One App.</h2>
            <p className="relative mt-1 text-sm text-[#7A7363]">
              Before you begin, please review these important notices
            </p>
          </div>

          {/* Sections */}
          <div className="px-6 space-y-3 max-h-[50vh] overflow-y-auto scrollbar-hide">
            {sections.map((section) => (
              <div
                key={section.title}
                className="flex gap-3 p-3 rounded-xl bg-[#0A0E16]/60 border border-[rgba(212,168,83,0.1)]"
              >
                <div className="shrink-0 w-9 h-9 rounded-full bg-[#D4A853]/15 flex items-center justify-center">
                  <section.icon size={18} className="text-[#D4A853]" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#F5E8C7] mb-0.5">{section.title}</p>
                  <p className="text-xs text-[#7A7363] leading-relaxed">{section.body}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Community Message */}
          <div className="mx-6 mt-4 p-4 rounded-xl bg-gradient-to-br from-[#D4A853]/10 to-[#0F141F]/50 border border-[#D4A853]/20 text-center">
            <p className="text-sm text-[#F5E8C7] font-medium leading-relaxed">
              We are a small team building a larger dream.
            </p>
            <p className="text-xs text-[#7A7363] mt-1.5 leading-relaxed">
              Your feedback and suggestions are highly valued. We are here to unite and build, not to criticise and break.
            </p>
            <p className="text-xs text-[#D4A853] mt-1.5 font-medium">
              Help us build the first ethical AI ecosystem.
            </p>
          </div>

          {/* Checkbox + Accept */}
          <div className="px-6 pt-4 pb-6">
            <label className="flex items-start gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-600 bg-gray-800 text-[#D4A853] focus:ring-[#D4A853]/50"
              />
              <span className="text-sm text-[#7A7363]">
                I have read and understood these notices
              </span>
            </label>
            <button
              onClick={onAccept}
              disabled={!checked}
              className="w-full py-3 rounded-lg text-sm font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: checked
                  ? 'linear-gradient(135deg, #D4A853, #E8C97A)'
                  : 'linear-gradient(135deg, #4a4a4a, #5a5a5a)',
                color: checked ? '#0A0E16' : '#888',
              }}
            >
              Accept & Continue
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
