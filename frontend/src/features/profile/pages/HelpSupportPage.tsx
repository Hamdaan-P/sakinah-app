/**
 * Help & Support Page
 * FAQ accordion, quick actions, and feedback form
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CaretLeft,
  Headphones,
  Envelope,
  Chat,
  Phone,
  BookOpen,
  PaperPlaneRight,
} from '@phosphor-icons/react';
import { QuickActionCard, FAQAccordion, SectionHeader } from '../components/ProfileComponents';
import type { FAQItem } from '../types/profile.types';

const faqs: FAQItem[] = [
  {
    question: 'What is Sharia-compliant investing?',
    answer:
      'Sharia-compliant investing follows Islamic principles that prohibit earning interest (riba), investing in businesses dealing with alcohol, gambling, pork, or excessive debt. Our app helps you identify halal investment opportunities that align with your faith.',
  },
  {
    question: 'How do you determine if a stock is halal?',
    answer:
      'We use a comprehensive screening process that checks: 1) Business activities (no alcohol, gambling, tobacco, etc.), 2) Financial ratios (debt-to-market cap ratio), 3) Income sources (less than 5% from non-halal activities), and 4) Cash and interest-bearing securities ratios.',
  },
  {
    question: 'Can I trust the halal certification?',
    answer:
      'Our screening methodology is based on widely accepted Islamic finance principles and is regularly reviewed by Islamic scholars. However, we recommend consulting with your local Islamic scholar for personal guidance, as different schools of thought may have varying interpretations.',
  },
  {
    question: 'How often is the data updated?',
    answer:
      'Stock prices are updated in real-time during market hours. Halal compliance status is reviewed quarterly or when significant business changes occur. You can also enable push notifications for important updates.',
  },
  {
    question: 'Is my personal data secure?',
    answer:
      "Yes, we take your privacy seriously. We use industry-standard encryption to protect your data and never share personal information with third parties without your consent. All data is stored securely and backed up regularly.",
  },
  {
    question: 'How do I calculate Zakat on my investments?',
    answer:
      'Our built-in Zakat calculator helps you determine your Zakat obligations on stocks, savings, and other assets. The calculator follows traditional Islamic jurisprudence and provides step-by-step guidance.',
  },
  {
    question: 'Can I use this app for portfolio management?',
    answer:
      "While our app provides excellent screening and monitoring tools, it's designed primarily for research and education. For active trading and portfolio management, consider consulting with a licensed financial advisor.",
  },
  {
    question: 'What regions and markets do you cover?',
    answer:
      "Currently, we cover major markets including US, UK, UAE, Malaysia, and other key Islamic finance markets. We're continuously expanding our coverage to include more regions and exchanges.",
  },
];

export function HelpSupportPage() {
  const navigate = useNavigate();
  const [expandedFAQIndex, setExpandedFAQIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSendEmail = () => {
    window.location.href = 'mailto:support@zaryahplus.com';
  };

  const handleStartChat = () => {
    alert('Live chat will be available soon! For now, please contact us via email.');
  };

  const handleCallSupport = () => {
    window.location.href = 'tel:+15551234567';
  };

  const handleOpenGuide = () => {
    alert('User guide coming soon! For now, contact support for help.');
  };

  const handleSubmitFeedback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) {
      alert('Please enter your feedback');
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setFeedback('');
    alert("Thank you for your feedback! We'll review it carefully.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] via-[#0F141F] to-[#0a2e38]">
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
            Help & Support
          </h1>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0A0E16] via-[#0F141F] to-[#0f5f6d] px-6 py-8 rounded-b-3xl">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-20 h-20 mx-auto rounded-full bg-[#D4A853]/20 flex items-center justify-center mb-4"
        >
          <Headphones size={40} className="text-[#D4A853]" />
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-bold text-white text-center mb-2"
        >
          We're Here to Help
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white/60 text-center text-sm"
        >
          Find answers to common questions or get in touch with our support team
        </motion.p>
      </div>

      <div className="px-4 py-6 space-y-8">
        {/* Quick Actions */}
        <section>
          <SectionHeader title="Quick Actions" />
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard
              icon={<Envelope size={24} className="text-[#D4A853]" />}
              title="Email Support"
              subtitle="Get help via email"
              onClick={handleSendEmail}
              delay={1}
            />
            <QuickActionCard
              icon={<Chat size={24} className="text-[#D4A853]" />}
              title="Live Chat"
              subtitle="Chat with our team"
              onClick={handleStartChat}
              delay={2}
            />
            <QuickActionCard
              icon={<Phone size={24} className="text-[#D4A853]" />}
              title="Call Support"
              subtitle="+1 (555) 123-4567"
              onClick={handleCallSupport}
              delay={3}
            />
            <QuickActionCard
              icon={<BookOpen size={24} className="text-[#D4A853]" />}
              title="User Guide"
              subtitle="Read documentation"
              onClick={handleOpenGuide}
              delay={4}
            />
          </div>
        </section>

        {/* FAQ */}
        <section>
          <SectionHeader title="Frequently Asked Questions" />
          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <FAQAccordion
                key={index}
                question={faq.question}
                answer={faq.answer}
                isExpanded={expandedFAQIndex === index}
                onToggle={() => setExpandedFAQIndex(expandedFAQIndex === index ? null : index)}
                index={index}
              />
            ))}
          </div>
        </section>

        {/* Feedback Form */}
        <section>
          <SectionHeader title="Send Feedback" />
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            onSubmit={handleSubmitFeedback}
            className="bg-gradient-to-br from-[#1a2f3a] to-[#0d1f29] rounded-xl border border-[#D4A853]/20 p-5"
          >
            <p className="text-white font-medium mb-1">We value your feedback</p>
            <p className="text-white/50 text-sm mb-4">
              Help us improve by sharing your thoughts and suggestions
            </p>

            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what you think..."
              rows={4}
              className="w-full px-4 py-3 bg-[#0F141F]/30 border border-[#D4A853]/20 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-[#D4A853]/50 resize-none"
            />

            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full min-h-[54px] px-[22px] py-[14px] rounded-lg bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16] font-semibold flex items-center justify-center gap-2 hover:from-[#D4A853] hover:to-[#E8C97A] transition-all disabled:opacity-50 shadow-lg shadow-[#D4A853]/20"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <PaperPlaneRight size={16} />
                  Submit Feedback
                </>
              )}
            </button>
          </motion.form>
        </section>
      </div>
    </div>
  );
}

export default HelpSupportPage;
