/**
 * Legal Hub — links to Privacy, Terms, and Disclaimers pages
 */

import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CaretLeft, ShieldCheck, FileText, Lock, CaretRight, Trash } from '@phosphor-icons/react';

const links = [
  {
    to: '/legal/privacy',
    icon: Lock,
    title: 'Privacy Policy',
    subtitle: 'How we collect, use, and protect your data',
  },
  {
    to: '/legal/terms',
    icon: FileText,
    title: 'Terms of Service',
    subtitle: 'Rules and conditions for using ZaryahPlus',
  },
  {
    to: '/legal/disclaimers',
    icon: ShieldCheck,
    title: 'Disclaimers',
    subtitle: 'Important notices about our tools and content',
  },
  {
    to: '/legal/data-deletion',
    icon: Trash,
    title: 'Data Deletion',
    subtitle: 'How to request deletion of your account and data',
  },
];

export function LegalHubPage() {
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
            Legal & Privacy
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        {links.map((link, i) => (
          <motion.div
            key={link.to}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Link
              to={link.to}
              className="flex items-center gap-4 p-5 rounded-xl bg-gradient-to-br from-[#0F141F] to-[#0A0E16] border border-[rgba(212,168,83,0.15)] hover:border-[rgba(212,168,83,0.3)] transition-colors"
            >
              <div className="w-10 h-10 shrink-0 rounded-full bg-[#D4A853]/15 flex items-center justify-center">
                <link.icon size={20} className="text-[#D4A853]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#F5E8C7]">{link.title}</p>
                <p className="text-xs text-[#7A7363]">{link.subtitle}</p>
              </div>
              <CaretRight size={16} className="text-[#5C5749] shrink-0" />
            </Link>
          </motion.div>
        ))}

        <p className="text-xs text-[#5C5749] text-center pt-4">
          Last updated: March 2026 — ZaryahPlus Technologies
        </p>
      </div>
    </div>
  );
}

export default LegalHubPage;
