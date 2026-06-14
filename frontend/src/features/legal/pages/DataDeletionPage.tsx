/**
 * Data Deletion Instructions Page
 * Linked from Meta App Dashboard (Facebook / WhatsApp / Instagram apps)
 * as the "User data deletion" URL.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CaretLeft, Trash, Envelope, Clock, ListChecks } from '@phosphor-icons/react';

const CONTACT_EMAIL = 'zaryahplus1@gmail.com';

const whatGetsDeleted = [
  'Account profile (name, email, phone, KYC information)',
  'AI companion conversation history (Raya, Quran companion, etc.)',
  'Saved Zakat, investment screening, and financial calculations',
  'Authentication records (Firebase Auth)',
  'WhatsApp / Meta-linked identifiers and message history',
  'Uploaded media (voice notes, images) and generated artifacts',
  'Analytics events tied to your user ID',
];

const stepsInApp = [
  'Sign in to ZaryahPlus',
  'Open Settings → Account → Privacy & Data',
  'Tap "Delete my account and data"',
  'Confirm — you will receive a confirmation email within 24 hours',
];

const stepsByEmail = [
  `Send an email to ${CONTACT_EMAIL}`,
  'Use the subject line: "Data deletion request"',
  'Include the email address or phone number registered with ZaryahPlus',
  'We will verify ownership and confirm deletion within 30 days',
];

export function DataDeletionPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] via-[#0F141F] to-[#0A0E16]">
      <div className="sticky top-0 z-10 bg-[#0A0E16]/95 backdrop-blur-sm border-b border-[#D4A853]/10">
        <div className="flex items-center gap-4 px-4 py-4 max-w-2xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Go back"
          >
            <CaretLeft size={24} className="text-[#D4A853]/80" />
          </button>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-[#D4A853] to-[#E8C97A] bg-clip-text text-transparent">
            Data Deletion
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 mb-6 p-4 rounded-xl bg-[#0F141F] border border-[rgba(212,168,83,0.15)]"
        >
          <Trash size={24} className="text-[#D4A853] shrink-0" />
          <p className="text-sm text-[#7A7363]">
            You can request complete deletion of your ZaryahPlus account and all associated data
            at any time. Your data is a trust (amanah) — we honour deletion requests promptly.
          </p>
        </motion.div>

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <ListChecks size={18} className="text-[#D4A853]" />
            <h2 className="text-sm font-semibold text-[#F5E8C7]">What gets deleted</h2>
          </div>
          <ul className="space-y-2">
            {whatGetsDeleted.map((item, i) => (
              <li key={i} className="flex gap-2 text-xs text-[#7A7363] leading-relaxed">
                <span className="text-[#D4A853]/50 shrink-0 mt-1">•</span>
                {item}
              </li>
            ))}
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-sm font-semibold text-[#F5E8C7] mb-3">
            Option 1 — Delete from inside the app
          </h2>
          <ol className="space-y-2 list-decimal list-inside">
            {stepsInApp.map((step, i) => (
              <li key={i} className="text-xs text-[#7A7363] leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <Envelope size={18} className="text-[#D4A853]" />
            <h2 className="text-sm font-semibold text-[#F5E8C7]">Option 2 — Request by email</h2>
          </div>
          <ol className="space-y-2 list-decimal list-inside">
            {stepsByEmail.map((step, i) => (
              <li key={i} className="text-xs text-[#7A7363] leading-relaxed">
                {step}
              </li>
            ))}
          </ol>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock size={18} className="text-[#D4A853]" />
            <h2 className="text-sm font-semibold text-[#F5E8C7]">Response timeline</h2>
          </div>
          <ul className="space-y-2">
            <li className="flex gap-2 text-xs text-[#7A7363] leading-relaxed">
              <span className="text-[#D4A853]/50 shrink-0 mt-1">•</span>
              In-app deletion: immediate, with confirmation email within 24 hours
            </li>
            <li className="flex gap-2 text-xs text-[#7A7363] leading-relaxed">
              <span className="text-[#D4A853]/50 shrink-0 mt-1">•</span>
              Email request: processed within 30 days (GDPR / UAE PDPL compliant)
            </li>
            <li className="flex gap-2 text-xs text-[#7A7363] leading-relaxed">
              <span className="text-[#D4A853]/50 shrink-0 mt-1">•</span>
              Backup retention: residual encrypted backups are purged within 90 days
            </li>
          </ul>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mb-8"
        >
          <h2 className="text-sm font-semibold text-[#F5E8C7] mb-3">What we may retain</h2>
          <p className="text-xs text-[#7A7363] leading-relaxed">
            We may retain a minimal record of your deletion request itself, and any data we are
            legally required to preserve (financial transaction logs, anti-fraud records). All
            other personal data is permanently erased.
          </p>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-xl bg-[#0F141F] border border-[rgba(212,168,83,0.15)]"
        >
          <h2 className="text-sm font-semibold text-[#F5E8C7] mb-2">Contact</h2>
          <p className="text-xs text-[#7A7363] leading-relaxed">
            For data deletion requests or any privacy concerns, email us at{' '}
            <a
              href={`mailto:${CONTACT_EMAIL}?subject=Data%20deletion%20request`}
              className="text-[#D4A853] hover:underline"
            >
              {CONTACT_EMAIL}
            </a>
            .
          </p>
        </motion.section>

        <p className="text-xs text-[#5C5749] text-center mt-8">
          Effective date: May 2026 — ZaryahPlus Technologies
        </p>
      </div>
    </div>
  );
}

export default DataDeletionPage;
