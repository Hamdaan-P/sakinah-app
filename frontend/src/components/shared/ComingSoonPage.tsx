/**
 * Coming Soon Page — teaser screen for locked features
 * Shows feature name, brief description, and notify button
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CaretLeft, Bell, RocketLaunch } from '@phosphor-icons/react';
import logoGold from '@/assets/zaryah-logo-gold.png';

interface ComingSoonFeature {
  title: string;
  tagline: string;
  description: string;
  icon: React.ReactNode;
}

const COMING_SOON_FEATURES: Record<string, ComingSoonFeature> = {
  'halal-intimacy': {
    title: 'Halal Intimacy',
    tagline: 'Guided by faith. Built for marriage.',
    description:
      'A private, Shariah-guided space for married couples — covering physical and emotional intimacy with wisdom from established Islamic sources. Respectful, educational, and designed to strengthen the bond between spouses.',
    icon: <span className="text-3xl">💕</span>,
  },
  'shark-tank': {
    title: 'Islamic Shark Tank',
    tagline: 'Pitch. Invest. Build halal.',
    description:
      'A halal investment platform where Muslim entrepreneurs pitch their ideas to a community of Shariah-conscious investors. Submit your startup, get funded, and grow together — no riba, no compromise.',
    icon: <span className="text-3xl">🦈</span>,
  },
  tiswa: {
    title: 'TISWA',
    tagline: 'The Islamic School of Wisdom & Arts.',
    description:
      'A comprehensive Islamic education academy — from Quran memorisation and tajweed to Arabic language, fiqh, and Islamic history. Structured courses with certified scholars, progress tracking, and certificates.',
    icon: <span className="text-3xl">🎓</span>,
  },
  'debt-restructuring': {
    title: 'Debt Restructuring',
    tagline: 'Break free. The halal way.',
    description:
      'An AI-powered tool to restructure your debts in a Shariah-compliant manner. Analyse your liabilities, get a personalised payoff strategy, and work towards financial freedom — guided by Islamic principles of fairness and justice.',
    icon: <span className="text-3xl">📊</span>,
  },
  qibla: {
    title: 'Qibla Compass',
    tagline: 'Always know your direction.',
    description:
      'An accurate Qibla compass that works anywhere in the world. Uses your device sensors and GPS to point you towards the Kaaba in Makkah — so you can pray with confidence wherever you are.',
    icon: <span className="text-3xl">🧭</span>,
  },
  calendar: {
    title: 'Hijri Calendar',
    tagline: 'Live by the Islamic calendar.',
    description:
      'A beautiful Hijri calendar with important Islamic dates, event reminders, and moon phase tracking. Stay connected to the Islamic timeline and never miss a sacred occasion.',
    icon: <span className="text-3xl">📅</span>,
  },
  education: {
    title: 'Islamic Education',
    tagline: 'Learn your deen. At your pace.',
    description:
      'Structured Islamic courses covering Aqeedah, Fiqh, Seerah, and more. Learn from trusted scholars with bite-sized lessons, quizzes, and progress tracking.',
    icon: <span className="text-3xl">📚</span>,
  },
  'digital-id': {
    title: 'Digital ID',
    tagline: 'Your verified Islamic identity.',
    description:
      'A secure digital identity card that represents your profile, KYC status, and community standing within the ZaryahPlus ecosystem. One identity across all services.',
    icon: <span className="text-3xl">🪪</span>,
  },
  'ramadan-kids': {
    title: 'Ramadan Kids',
    tagline: 'Making Ramadan magical for little ones.',
    description:
      'A gamified Ramadan experience designed for children — daily challenges, Islamic stories, good deed trackers, and rewards to help kids build lifelong habits during the blessed month.',
    icon: <span className="text-3xl">🌙</span>,
  },
  faith: {
    title: 'Faith & Masjid Finder',
    tagline: 'Strengthen your iman. Find your masjid.',
    description:
      'A spiritual growth hub with daily adhkar, dhikr counters, and a masjid finder to locate nearby mosques with prayer times, facilities, and community events.',
    icon: <span className="text-3xl">🕌</span>,
  },
  'islamic-banking': {
    title: 'Islamic Banking',
    tagline: 'Banking without riba.',
    description:
      'Explore Shariah-compliant banking products — from halal savings accounts to Islamic mortgages. Compare offerings, understand the contracts, and make informed financial decisions.',
    icon: <span className="text-3xl">🏦</span>,
  },
  matrimony: {
    title: 'Matrimony',
    tagline: 'Find your naseeb. The halal way.',
    description:
      'A respectful, faith-centred matrimony platform where serious Muslims can find compatible partners. Verified profiles, wali involvement, and privacy-first design.',
    icon: <span className="text-3xl">💍</span>,
  },
  'real-estate': {
    title: 'Halal Real Estate',
    tagline: 'Property ownership. Riba-free.',
    description:
      'Browse Shariah-compliant real estate opportunities — from halal mortgages to co-ownership models. Invest in property the Islamic way with full transparency.',
    icon: <span className="text-3xl">🏠</span>,
  },
  chamber: {
    title: 'Business Chamber',
    tagline: 'The Muslim business network.',
    description:
      'A professional chamber for Muslim entrepreneurs and businesses. List your services, find partners, collaborate on projects, and grow your halal business network.',
    icon: <span className="text-3xl">💼</span>,
  },
  'bait-ul-maal': {
    title: 'Bait-ul-Maal',
    tagline: 'Community treasury. Collective good.',
    description:
      'A community fund inspired by the Islamic treasury system. Contribute to and request support from a collective pool — managed transparently for those in need.',
    icon: <span className="text-3xl">🤲</span>,
  },
  commerce: {
    title: 'Halal Commerce',
    tagline: 'Shop halal. Support Muslim businesses.',
    description:
      'A marketplace for halal products and services — from food and fashion to tech and wellness. Every listing verified, every transaction transparent.',
    icon: <span className="text-3xl">🛍️</span>,
  },
  'voice-companion': {
    title: 'Voice Companion',
    tagline: 'Talk to Raya. Hands-free.',
    description:
      'A voice-powered interface to interact with Raya, your AI companion. Ask questions, get Islamic guidance, and have meaningful conversations — all through natural speech.',
    icon: <span className="text-3xl">🎙️</span>,
  },
  media: {
    title: 'Islamic Media',
    tagline: 'Content that nourishes the soul.',
    description:
      'Curated Islamic media — lectures, nasheeds, documentaries, and podcasts from trusted scholars and creators. Quality content for your spiritual journey.',
    icon: <span className="text-3xl">🎬</span>,
  },
  events: {
    title: 'Events',
    tagline: 'Gather. Learn. Grow together.',
    description:
      'Discover Islamic events near you and online — from halaqahs and conferences to community iftars and charity drives. Stay connected to your ummah.',
    icon: <span className="text-3xl">🎪</span>,
  },
  halaqah: {
    title: 'Halaqah',
    tagline: 'Circles of knowledge.',
    description:
      'Join or host virtual and in-person study circles. Dive deep into Islamic sciences with like-minded brothers and sisters, guided by structured curricula.',
    icon: <span className="text-3xl">📖</span>,
  },
  purification: {
    title: 'Shariah Compliance',
    tagline: 'Purify your earnings.',
    description:
      'A calculator to identify and purify non-compliant income from your investments. Ensure your wealth stays halal with precise purification calculations.',
    icon: <span className="text-3xl">✨</span>,
  },
};

export function ComingSoonPage({ featureId }: { featureId: string }) {
  const navigate = useNavigate();
  const feature = COMING_SOON_FEATURES[featureId];

  if (!feature) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] via-[#0F141F] to-[#0A0E16] flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0E16]/95 backdrop-blur-sm border-b border-[#D4A853]/10">
        <div className="flex items-center gap-4 px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <CaretLeft size={24} className="text-[#D4A853]/80" />
          </button>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-[#D4A853] to-[#E8C97A] bg-clip-text text-transparent">
            Coming Soon
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full text-center">
          {/* Logo pulse */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', damping: 15 }}
            className="relative mx-auto mb-8"
          >
            <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-br from-[#D4A853]/20 to-[#0F141F] border border-[#D4A853]/25 flex items-center justify-center shadow-xl shadow-[#D4A853]/10">
              {feature.icon}
            </div>
            {/* Animated ring */}
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="absolute inset-0 w-24 h-24 mx-auto rounded-3xl border-2 border-[#D4A853]/30"
            />
          </motion.div>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl font-bold text-[#F5E8C7] mb-2"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            {feature.title}
          </motion.h2>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="text-[#D4A853] font-medium text-sm mb-6"
          >
            {feature.tagline}
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-[#7A7363] text-sm leading-relaxed mb-8"
          >
            {feature.description}
          </motion.p>

          {/* Coming Soon badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4A853]/15 border border-[#D4A853]/30 mb-6"
          >
            <RocketLaunch size={18} className="text-[#D4A853]" />
            <span className="text-[#D4A853] font-semibold text-sm">Coming Soon</span>
          </motion.div>

          {/* Notify button */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <button
              onClick={() => navigate('/notifications')}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16] font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
            >
              <Bell size={18} weight="bold" />
              Notify Me When It Launches
            </button>
          </motion.div>

          {/* ZaryahPlus branding */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="mt-10 flex items-center justify-center gap-2 text-[#5C5749] text-xs"
          >
            <img src={logoGold} alt="" className="w-4 h-4 object-contain opacity-50" />
            <span>Building the first ethical AI ecosystem</span>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
