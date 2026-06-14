/**
 * LanguageSelectorModal — First-visit language picker for the demo page.
 * Shows 4 language cards. Saves choice to localStorage.
 */

import { motion } from 'framer-motion';
import { SUPPORTED_LANGUAGES, setDemoLanguage, getDemoDisplayFont } from '@/i18n';
import logoGold from '@/assets/zaryah-logo-gold.png';

interface Props {
  onSelect: (lang: string) => void;
}

export function LanguageSelectorModal({ onSelect }: Props) {
  const handleSelect = (code: string) => {
    setDemoLanguage(code);
    onSelect(code);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-[#1E293A] px-4"
    >
      {/* Ambient glows */}
      <div className="absolute pointer-events-none" style={{ top: '-20%', left: '-15%', width: '60%', height: '60%', background: 'radial-gradient(circle, rgba(139,126,200,0.08) 0%, transparent 70%)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: '-15%', right: '-10%', width: '50%', height: '50%', background: 'radial-gradient(circle, rgba(215,181,106,0.06) 0%, transparent 70%)' }} />

      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="relative z-10 w-full max-w-sm text-center"
      >
        <img src={logoGold} alt="ZaryahPlus" className="w-14 h-14 mx-auto mb-5 object-contain" />

        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: getDemoDisplayFont(), color: '#EBDCB8' }}>
          Choose Your Language
        </h2>
        <p className="text-xs mb-8" style={{ color: '#7F8A9A' }}>
          You can change this anytime from the top bar
        </p>

        <div className="grid grid-cols-2 gap-3">
          {SUPPORTED_LANGUAGES.map((lang, i) => (
            <motion.button
              key={lang.code}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 + i * 0.08 }}
              onClick={() => handleSelect(lang.code)}
              className="rounded-2xl p-5 text-center transition-all hover:scale-[1.03] active:scale-[0.97]"
              style={{
                background: 'rgba(44,60,85,0.4)',
                border: '1px solid rgba(215,181,106,0.15)',
              }}
            >
              <p className="text-base font-bold mb-0.5" style={{ color: '#EBDCB8', fontFamily: lang.dir === 'rtl' ? 'Amiri, serif' : lang.code === 'ta' ? "'Noto Sans Tamil', sans-serif" : 'Cormorant Garamond, serif' }}>
                {lang.nativeName}
              </p>
              <p className="text-[11px]" style={{ color: '#7F8A9A' }}>{lang.name}</p>
            </motion.button>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}
