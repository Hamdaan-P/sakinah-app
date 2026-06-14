/**
 * Terms of Service Page
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CaretLeft, FileText } from '@phosphor-icons/react';

const sections = [
  {
    title: '1. Acceptance of Terms',
    body: 'By creating an account or using ZaryahPlus, you agree to these Terms of Service. If you do not agree, please discontinue use of the platform. We may update these terms from time to time, and continued use constitutes acceptance of any changes.',
  },
  {
    title: '2. Platform Purpose',
    body: 'ZaryahPlus is an educational and informational platform for the Muslim community. It provides Islamic finance tools, AI companions, religious content, and community features. It is NOT a licensed financial institution, brokerage, religious authority, or healthcare provider. All tools and content are provided for informational and educational purposes only.',
  },
  {
    title: '3. User Accounts',
    body: 'You are responsible for maintaining the confidentiality of your account credentials. You must provide accurate information during registration and keep it up to date. You must be at least 13 years old to create an account. Certain features (e.g., Halal Intimacy) may require you to be 18 or older.',
  },
  {
    title: '4. Acceptable Use',
    body: 'You agree not to: use the platform for any unlawful purpose; impersonate another person or misrepresent your identity; attempt to access other users\' accounts or data; use automated tools to scrape or extract data; post content that is hateful, discriminatory, or promotes division within the Muslim community; use the AI companions to generate harmful or inappropriate content.',
  },
  {
    title: '5. AI Companions & Content',
    body: 'AI-generated content (including responses from Raya and other companions) is produced by language models and may contain errors. ZaryahPlus does not guarantee the accuracy, completeness, or religious validity of AI responses. Users should not rely on AI output for religious rulings (fatawa), financial decisions, medical advice, or legal matters without independent verification.',
  },
  {
    title: '6. Financial Tools',
    body: 'Investment screeners, Zakat calculators, and other financial tools are provided for educational purposes only. They do not constitute financial advice, investment recommendations, or an offer to transact. Sharia compliance assessments are based on publicly available criteria and may not align with all scholarly opinions. You are solely responsible for your financial decisions.',
  },
  {
    title: '7. Matrimony Feature',
    body: 'The matrimony feature facilitates introductions only. ZaryahPlus does not verify user identities beyond basic profile data and is not responsible for the conduct of any user. We strongly recommend involving family (wali) and performing independent due diligence.',
  },
  {
    title: '8. Intellectual Property',
    body: 'All ZaryahPlus branding, design, and proprietary content are owned by ZaryahPlus Technologies. Quranic text, hadith, and scholarly content are presented from their original sources with attribution. You may not reproduce, distribute, or create derivative works from our proprietary content without permission.',
  },
  {
    title: '9. Limitation of Liability',
    body: 'ZaryahPlus is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the platform, including but not limited to financial losses, emotional distress, or decisions made based on AI-generated content. Our total liability shall not exceed the amount you have paid us in the preceding 12 months.',
  },
  {
    title: '10. Termination',
    body: 'We may suspend or terminate your account if you violate these terms. You may delete your account at any time through Settings. Upon termination, your data will be deleted in accordance with our Privacy Policy.',
  },
  {
    title: '11. Governing Law',
    body: 'These terms are governed by the laws of the United Arab Emirates. Any disputes shall be resolved through the courts of Dubai, UAE.',
  },
  {
    title: '12. Contact',
    body: 'For questions about these terms: legal@zaryahplus.com. ZaryahPlus Technologies, Dubai, UAE.',
  },
];

export function TermsOfServicePage() {
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
            Terms of Service
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
          <FileText size={24} className="text-[#D4A853] shrink-0" />
          <p className="text-sm text-[#7A7363]">
            Please read these terms carefully before using ZaryahPlus. By using our platform, you agree
            to be bound by these terms.
          </p>
        </motion.div>

        {/* Sections */}
        <div className="space-y-6">
          {sections.map((section, i) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.04 }}
            >
              <h2 className="text-sm font-semibold text-[#F5E8C7] mb-2">{section.title}</h2>
              <p className="text-xs text-[#7A7363] leading-relaxed">{section.body}</p>
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

export default TermsOfServicePage;
