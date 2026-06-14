/**
 * RayaSummarySection — quote-card hero block at the top of InsightsReport
 * showing Raya's natural-language read on the user, with regenerate button.
 */

import { motion } from 'framer-motion';
import { ArrowClockwise, PenNib } from '@phosphor-icons/react';

interface RayaSummarySectionProps {
  summary: string | null;
  isLoading: boolean;
  onRegenerate: () => void;
  hasEnoughData: boolean;
}

export function RayaSummarySection({
  summary, isLoading, onRegenerate, hasEnoughData,
}: RayaSummarySectionProps) {
  if (!hasEnoughData && !isLoading && !summary) return null;

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.08, duration: 0.5 }}
      className="mb-6 relative"
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(212,168,83,0.3), rgba(212,168,83,0.1))',
            border: '1px solid rgba(212,168,83,0.35)',
          }}
        >
          <PenNib size={16} weight="fill" className="text-[#D4A853]" />
        </div>
        <h2 className="text-[#F5E8C7] text-[16px] font-semibold tracking-tight">Raya's Read On You</h2>
      </div>

      {/* Hero card */}
      <div
        className="relative rounded-[20px] overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, rgba(212,168,83,0.08), rgba(36,50,70,0.85) 40%, rgba(10,14,22,0.95))',
          border: '1px solid rgba(212,168,83,0.22)',
          boxShadow: '0 8px 32px rgba(0,0,0,0.25), inset 0 1px 0 rgba(212,168,83,0.1)',
        }}
      >
        {/* Decorative corner glow */}
        <div
          className="absolute -top-12 -right-12 w-40 h-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(212,168,83,0.18), transparent 70%)' }}
        />
        <div
          className="absolute -bottom-10 -left-10 w-32 h-32 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.08), transparent 70%)' }}
        />

        <div className="relative z-10 p-6 sm:p-7">
          {summary ? (
            <>
              {/* Giant opening quote mark */}
              <div
                className="absolute top-3 left-4 text-[56px] leading-none pointer-events-none select-none"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  color: 'rgba(212,168,83,0.25)',
                }}
              >
                &ldquo;
              </div>

              <p
                className="text-[#F5E8C7] text-[17px] sm:text-[18px] leading-[1.7] pl-6 relative"
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontStyle: 'italic',
                  fontWeight: 400,
                  textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                }}
              >
                {summary}
              </p>

              {/* Gold accent line */}
              <div
                className="mt-5 mb-4 h-[1px] w-16"
                style={{ background: 'linear-gradient(90deg, #D4A853, transparent)' }}
              />

              <div className="flex items-center justify-between">
                <p className="text-[#7A7363] text-[11px] tracking-wide">
                  — Raya, on {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
                </p>
                <button
                  onClick={onRegenerate}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-[#D4A853]/70 hover:text-[#D4A853] hover:bg-[#D4A853]/10 transition-colors disabled:opacity-40"
                  title="Regenerate"
                >
                  <ArrowClockwise size={12} />
                  <span>New reading</span>
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-3 py-6 justify-center">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              >
                <PenNib size={18} className="text-[#D4A853]" />
              </motion.div>
              <p className="text-[#7A7363] text-[13px] italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Raya is reading you...
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.section>
  );
}
