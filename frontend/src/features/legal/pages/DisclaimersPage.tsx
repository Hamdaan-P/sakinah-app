/**
 * Disclaimers Page — renders all disclaimer entries as banner cards
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CaretLeft, ShieldCheck } from '@phosphor-icons/react';
import { DISCLAIMERS } from '@/features/legal/types/disclaimer.types';

const entries = Object.values(DISCLAIMERS);

export function DisclaimersPage() {
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
            Disclaimers
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
          <div>
            <p className="text-sm text-[#7A7363]">
              ZaryahPlus is built to serve the Ummah with integrity. These disclaimers ensure
              transparency about what our tools can and cannot do.
            </p>
            <p className="text-xs text-[#D4A853]/50 font-['Amiri'] mt-1">
              اخْتِلَافُ أُمَّتِي رَحْمَة — The diversity of my Ummah is a mercy
            </p>
          </div>
        </motion.div>

        {/* All disclaimers */}
        <div className="space-y-4">
          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + i * 0.05 }}
              className="p-5 rounded-xl bg-gradient-to-br from-[#0F141F] to-[#0A0E16] border border-[rgba(212,168,83,0.15)]"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full bg-[#D4A853]/15 text-[#D4A853] text-[10px] font-semibold uppercase tracking-wide">
                  {entry.category.replace('_', ' ')}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-[#F5E8C7] mb-2">{entry.title}</h3>
              <p className="text-xs text-[#7A7363] leading-relaxed">{entry.body}</p>
              {entry.arabicPhrase && (
                <p className="text-xs text-[#D4A853]/40 font-['Amiri'] mt-2">{entry.arabicPhrase}</p>
              )}
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-[#5C5749] text-center mt-8">
          Last updated: March 2026 — ZaryahPlus Technologies
        </p>
      </div>
    </div>
  );
}

export default DisclaimersPage;
