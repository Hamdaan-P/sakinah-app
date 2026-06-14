/**
 * About Page
 * App info, mission, features, founder, and legal
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import logoGold from '@/assets/zaryah-logo-gold.png';
import {
  CaretLeft,
  ShieldCheck,
  TrendUp,
  Calculator,
  Robot,
  ChartBar,
  GraduationCap,
  Buildings,
  MapPin,
  Calendar,
  UsersThree,
  Trophy,
  Globe,
  InstagramLogo,
  LinkedinLogo,
  Envelope,
  ArrowSquareOut,
  Heart,
} from '@phosphor-icons/react';
import { FeatureCard, SectionHeader } from '../components/ProfileComponents';

const features = [
  {
    icon: <ShieldCheck size={20} className="text-[#D4A853]" />,
    title: 'Sharia Compliance Screening',
    description: 'Advanced algorithms to identify halal investment opportunities',
  },
  {
    icon: <TrendUp size={20} className="text-[#D4A853]" />,
    title: 'Real-time Market Data',
    description: 'Live stock prices and market updates across global exchanges',
  },
  {
    icon: <Calculator size={20} className="text-[#D4A853]" />,
    title: 'Zakat Calculator',
    description: 'Comprehensive tool for calculating your Zakat obligations',
  },
  {
    icon: <Robot size={20} className="text-[#D4A853]" />,
    title: 'AI-Powered Assistant',
    description: 'Intelligent chatbot for Islamic finance guidance and support',
  },
  {
    icon: <ChartBar size={20} className="text-[#D4A853]" />,
    title: 'Portfolio Analytics',
    description: 'Detailed insights and performance tracking for your investments',
  },
  {
    icon: <GraduationCap size={20} className="text-[#D4A853]" />,
    title: 'Educational Resources',
    description: 'Learn about Islamic finance principles and investment strategies',
  },
];

const companyInfo = [
  { icon: <Buildings size={20} className="text-[#D4A853]" />, label: 'Company', value: 'ZaryahPlus Technologies' },
  { icon: <MapPin size={20} className="text-[#D4A853]" />, label: 'Headquarters', value: 'Dubai, UAE' },
  { icon: <Calendar size={20} className="text-[#D4A853]" />, label: 'Founded', value: '2024' },
  { icon: <UsersThree size={20} className="text-[#D4A853]" />, label: 'Team Size', value: '15+ Islamic Finance Experts' },
  { icon: <Trophy size={20} className="text-[#D4A853]" />, label: 'Certification', value: 'AAOIFI Compliant' },
];

const legalItems = [
  { title: 'Privacy Policy', subtitle: 'Learn how we protect your personal information', route: '/legal/privacy' },
  { title: 'Terms of Service', subtitle: 'Review our terms and conditions', route: '/legal/terms' },
  { title: 'Islamic Advisory Board', subtitle: 'Meet our Sharia compliance scholars', route: '/legal' },
  { title: 'Licenses & Disclaimers', subtitle: 'Important legal information and disclaimers', route: '/legal/disclaimers' },
];

export function AboutPage() {
  const navigate = useNavigate();

  const handleOpenUrl = (url: string) => {
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] via-[#0F141F] to-[#0a2e38]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-backgroundPrimary/95 backdrop-blur-sm border-b border-[#D4A853]/10">
        <div className="flex items-center gap-4 px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <CaretLeft size={24} className="text-[#D4A853]/80" />
          </button>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-[#D4A853] to-[#E8C97A] bg-clip-text text-transparent">
            About
          </h1>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0A0E16] via-[#0F141F] to-[#0f5f6d] px-6 py-10 rounded-b-3xl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-24 h-24 mx-auto rounded-3xl flex items-center justify-center shadow-xl shadow-[#D4A853]/30 mb-5"
        >
          <img src={logoGold} alt="ZaryahPlus logo" className="w-20 h-20 object-contain" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white text-center mb-2"
        >
          ZaryahPlus
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white/60 text-center text-sm mb-3"
        >
          Islamic Finance & Investment
        </motion.p>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="flex justify-center"
        >
          <span className="px-4 py-1.5 rounded-full bg-[#D4A853]/20 border border-[#D4A853]/40 text-[#D4A853] text-xs font-medium">
            Version 1.0.0 (1)
          </span>
        </motion.div>
      </div>

      <div className="px-4 py-6 space-y-8">
        {/* Mission */}
        <section>
          <SectionHeader title="Our Mission" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-gradient-to-br from-[#1a2f3a] to-[#0d1f29] rounded-xl border border-[#D4A853]/20 p-6 text-center"
          >
            <div className="w-14 h-14 mx-auto rounded-full bg-[#D4A853]/15 flex items-center justify-center mb-4">
              <Heart size={28} className="text-[#D4A853]" />
            </div>
            <p className="text-white leading-relaxed">
              Empowering Muslims worldwide to make informed, Sharia-compliant investment decisions
              while building wealth in accordance with Islamic principles.
            </p>
          </motion.div>
        </section>

        {/* Key Features */}
        <section>
          <SectionHeader title="Key Features" />
          <div className="space-y-3">
            {features.map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* Company Information */}
        <section>
          <SectionHeader title="Company Information" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-[#1a2f3a] to-[#0d1f29] rounded-xl border border-[#D4A853]/20 p-5"
          >
            {companyInfo.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 py-3 ${
                  index < companyInfo.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                {item.icon}
                <div>
                  <p className="text-white/50 text-xs">{item.label}</p>
                  <p className="text-white font-medium text-sm">{item.value}</p>
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Founder */}
        <section>
          <SectionHeader title="Our Founder" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-gradient-to-br from-[#1a2f3a] to-[#0d1f29] rounded-xl border border-[#D4A853]/30 p-6 text-center"
          >
            <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-[#D4A853] to-[#E8C97A] p-[3px] shadow-lg shadow-[#D4A853]/30 mb-4">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-[#0F141F] to-backgroundPrimary flex items-center justify-center">
                <span className="text-3xl font-bold text-[#D4A853]">JS</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-1">Jubran Siddique</h3>
            <span className="inline-block px-3 py-1 rounded-full bg-[#D4A853]/15 text-[#D4A853] text-xs font-semibold mb-4">
              Founder & CEO
            </span>
            <p className="text-white/60 text-sm leading-relaxed mb-4">
              A visionary entrepreneur and blockchain professional with expertise in AI, Islamic
              finance, and technology innovation. Certified Blockchain Solutions Architect fluent in
              six languages, bringing a global perspective to building solutions for the Muslim
              community.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mb-5">
              <span className="px-2 py-1 rounded-lg bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853] text-xs">
                Blockchain Architect
              </span>
              <span className="px-2 py-1 rounded-lg bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853] text-xs">
                GARC Member
              </span>
              <span className="px-2 py-1 rounded-lg bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853] text-xs">
                Lions Club
              </span>
            </div>
            <button
              onClick={() => handleOpenUrl('https://www.linkedin.com/in/jubransiddique')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0077B5] to-[#005885] text-white font-medium text-sm hover:opacity-90 transition-opacity"
            >
              <LinkedinLogo size={16} />
              Connect on LinkedIn
            </button>
          </motion.div>
        </section>

        {/* Social Links */}
        <section>
          <SectionHeader title="Connect With Us" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="bg-gradient-to-br from-[#1a2f3a] to-[#0d1f29] rounded-xl border border-[#D4A853]/20 p-5"
          >
            <p className="text-white/60 text-sm text-center mb-5">
              Follow us for updates and Islamic finance insights
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => handleOpenUrl('https://zaryahplus.com')}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[#D4A853]/15 border border-[#D4A853]/30 hover:bg-[#D4A853]/25 transition-colors"
              >
                <Globe size={24} className="text-[#D4A853]" />
                <span className="text-[#D4A853] text-xs">Website</span>
              </button>
              <button
                onClick={() => handleOpenUrl('https://www.instagram.com/zaryahplus')}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[#D4A853]/15 border border-[#D4A853]/30 hover:bg-[#D4A853]/25 transition-colors"
              >
                <InstagramLogo size={24} className="text-[#D4A853]" />
                <span className="text-[#D4A853] text-xs">Instagram</span>
              </button>
              <button
                onClick={() => handleOpenUrl('https://www.linkedin.com/company/zaryahplus/')}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[#D4A853]/15 border border-[#D4A853]/30 hover:bg-[#D4A853]/25 transition-colors"
              >
                <LinkedinLogo size={24} className="text-[#D4A853]" />
                <span className="text-[#D4A853] text-xs">LinkedIn</span>
              </button>
              <button
                onClick={() => handleOpenUrl('mailto:info@zaryahplus.com')}
                className="flex flex-col items-center gap-1 p-3 rounded-xl bg-[#D4A853]/15 border border-[#D4A853]/30 hover:bg-[#D4A853]/25 transition-colors"
              >
                <Envelope size={24} className="text-[#D4A853]" />
                <span className="text-[#D4A853] text-xs">Email</span>
              </button>
            </div>
          </motion.div>
        </section>

        {/* Legal */}
        <section>
          <SectionHeader title="Legal & Privacy" />
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-gradient-to-br from-[#1a2f3a] to-[#0d1f29] rounded-xl border border-[#D4A853]/20 p-5"
          >
            {legalItems.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(item.route)}
                className={`w-full flex items-center justify-between py-4 text-left hover:bg-white/5 rounded-lg transition-colors ${
                  index < legalItems.length - 1 ? 'border-b border-white/5' : ''
                }`}
              >
                <div>
                  <p className="text-white font-medium text-sm">{item.title}</p>
                  <p className="text-white/50 text-xs">{item.subtitle}</p>
                </div>
                <ArrowSquareOut size={16} className="text-white/40" />
              </button>
            ))}
          </motion.div>
        </section>

        {/* Community Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="bg-gradient-to-br from-[#D4A853]/10 to-[#0F141F]/5 rounded-xl border border-[#D4A853]/25 p-6 text-center"
        >
          <div className="w-12 h-12 mx-auto rounded-full bg-[#D4A853]/15 flex items-center justify-center mb-3">
            <Heart size={24} className="text-[#D4A853]" />
          </div>
          <p className="text-white font-semibold mb-2">We are a small team building a larger dream</p>
          <p className="text-white/60 text-sm leading-relaxed mb-2">
            Your feedback and suggestions are highly valued. We are here to unite and build, not to criticise and break.
          </p>
          <p className="text-[#D4A853] text-sm font-medium mb-4">
            Help us build the first ethical AI ecosystem.
          </p>
          <button
            onClick={() => handleOpenUrl('mailto:feedback@zaryahplus.com')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853] font-medium text-sm hover:bg-[#D4A853]/25 transition-colors"
          >
            <Envelope size={16} />
            Share Your Feedback
          </button>
        </motion.div>

        {/* Credits */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="p-4 text-center"
        >
          <p className="text-white/50 text-xs">© 2024 ZaryahPlus. All rights reserved.</p>
        </motion.div>
      </div>
    </div>
  );
}

export default AboutPage;
