/**
 * Privacy Policy Page
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CaretLeft, ShieldCheck } from '@phosphor-icons/react';

const sections = [
  {
    title: '1. Information We Collect',
    items: [
      'Account information (name, email, phone) provided during registration',
      'KYC data (identity, faith, and financial preferences) to personalise your experience',
      'Usage data (pages visited, features used) to improve our platform',
      'AI conversation history to maintain context and improve companion quality',
      'Device information (browser type, OS) for compatibility and security',
    ],
  },
  {
    title: '2. How We Use Your Information',
    items: [
      'To provide and personalise ZaryahPlus features and AI companion interactions',
      'To calculate Zakat, screen investments, and deliver tailored Islamic finance tools',
      'To send notifications about relevant updates and prayer times',
      'To improve our AI models and platform through aggregated, anonymised analytics',
      'To ensure platform security and prevent fraudulent activity',
    ],
  },
  {
    title: '3. Data Sharing',
    items: [
      'We do NOT sell your personal data to any third party',
      'AI conversations may be processed by third-party AI providers (e.g., OpenAI) under strict data processing agreements',
      'Firebase (Google) processes authentication and hosting data',
      'We may share anonymised, aggregated data for research purposes',
      'We will share data if required by law or to protect user safety',
    ],
  },
  {
    title: '4. Data Storage & Security',
    items: [
      'Data is stored on secure cloud infrastructure (Firebase, Railway)',
      'All data in transit is encrypted using TLS/SSL',
      'Access to user data is restricted to authorised personnel only',
      'We conduct regular security reviews of our infrastructure',
    ],
  },
  {
    title: '5. Your Rights',
    items: [
      'Access: You can view your data through your Profile and Settings',
      'Correction: Update your information at any time in Settings',
      'Deletion: Request complete data deletion through Settings or by contacting support',
      'Export: Request a copy of your data by contacting support@zaryahplus.com',
      'Withdraw consent: You can stop using specific features at any time',
    ],
  },
  {
    title: '6. Children\'s Privacy',
    items: [
      'ZaryahPlus is not intended for children under 13',
      'The Ramadan Kids feature is designed to be used under parental supervision',
      'We do not knowingly collect data from children under 13',
    ],
  },
  {
    title: '7. Contact Us',
    items: [
      'For privacy concerns: privacy@zaryahplus.com',
      'For data deletion requests: support@zaryahplus.com',
      'ZaryahPlus Technologies, Dubai, UAE',
    ],
  },
];

export function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] via-[#0F141F] to-[#0A0E16]">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-[#0A0E16]/95 backdrop-blur-sm border-b border-[#D4A853]/10">
        <div className="flex items-center gap-4 px-4 py-4 max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <CaretLeft size={24} className="text-[#D4A853]/80" />
          </button>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-[#D4A853] to-[#E8C97A] bg-clip-text text-transparent">
            Privacy Policy
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-[#0F141F] border border-[rgba(212,168,83,0.15)]"
        >
          <ShieldCheck size={24} className="text-[#D4A853] shrink-0" />
          <p className="text-sm text-[#7A7363]">
            Your privacy is a trust (amanah). We are committed to protecting your personal information
            with the highest standards of care and transparency.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
            >
              <h2 className="text-sm font-semibold text-[#F5E8C7] mb-3">{section.title}</h2>
              <ul className="space-y-2">
                {section.items.map((item, j) => (
                  <li key={j} className="flex gap-2 text-xs text-[#7A7363] leading-relaxed">
                    <span className="text-[#D4A853]/50 shrink-0 mt-1">•</span>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-[#5C5749] text-center mt-8">
          Effective date: March 2026 — ZaryahPlus Technologies
        </p>
      </div>
    </div>
  );
}

export default PrivacyPolicyPage;
