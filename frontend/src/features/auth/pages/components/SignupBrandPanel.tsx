/**
 * Desktop-only left branding panel for SignupPage.
 */

import { motion } from 'framer-motion';
import { Sparkle, UsersThree, CurrencyDollarSimple, GridFour, GlobeHemisphereWest, Wallet } from '@phosphor-icons/react';
import logoGold from '@/assets/zaryah-logo-gold.png';

export function SignupBrandPanel() {
  return (
    <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-[#001F3F] via-[#003366] to-[#004080] relative overflow-hidden">
      {/* Geometric Pattern Overlay */}
      <div className="absolute inset-0 opacity-5">
        <GeometricPattern />
      </div>

      {/* Logo — pinned top-left */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="absolute top-5 left-4 z-20 flex items-center -space-x-1"
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
      <div className="relative z-10 flex flex-col justify-center px-16 max-w-xl">
        <motion.h1
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-8 text-4xl lg:text-5xl font-bold text-white leading-tight"
        >
          The World's First<br />Islamic Super Agent
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-lg text-white/80 leading-relaxed"
        >
          One platform for your entire Islamic life — faith, finance,
          community, and an AI companion who actually knows you.
        </motion.p>

        <div className="mt-12 space-y-5">
          <BenefitItem
            icon={<Sparkle size={24} weight="duotone" />}
            title="Raya — Your AI Companion"
            description="Trained on Quran, Hadith & classical scholarship across all 4 madhahib"
            delay={0.6}
          />
          <BenefitItem
            icon={<UsersThree size={24} weight="duotone" />}
            title="Companion Mode"
            description="Wisdom inspired by the Sahaba, Sahabiyat & the Four Great Imams"
            delay={0.7}
          />
          <BenefitItem
            icon={<CurrencyDollarSimple size={24} weight="duotone" />}
            title="Islamic Finance Suite"
            description="Shariah-compliant banking, zakat calculator, halal stock screening"
            delay={0.8}
          />
          <BenefitItem
            icon={<Wallet size={24} weight="duotone" />}
            title="DinarZ Wallet"
            description="Earn rewards, track your contributions & manage your digital wallet"
            delay={0.9}
          />
          <BenefitItem
            icon={<GridFour size={24} weight="duotone" />}
            title="30+ Integrated Services"
            description="Quran, prayer times, matrimony, education, commerce & more"
            delay={1.0}
          />
        </div>

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
  );
}

interface BenefitItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  delay: number;
}

function BenefitItem({ icon, title, description, delay }: BenefitItemProps) {
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

function GeometricPattern() {
  return (
    <svg width="100%" height="100%" className="absolute inset-0">
      <defs>
        <pattern id="octagon-signup" width="60" height="60" patternUnits="userSpaceOnUse">
          <path
            d="M30 5 L45 12 L52 27 L52 43 L45 58 L30 65 L15 58 L8 43 L8 27 L15 12 Z"
            fill="none"
            stroke="white"
            strokeWidth="0.5"
            transform="translate(-15, -17.5)"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#octagon-signup)" />
    </svg>
  );
}
