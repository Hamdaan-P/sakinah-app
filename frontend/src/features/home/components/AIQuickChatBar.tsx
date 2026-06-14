import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkle, Microphone, ArrowRight } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

interface AIQuickChatBarProps {
  onTap?: () => void;
  onMicTap?: () => void;
  placeholder?: string;
  className?: string;
}

const PLACEHOLDERS = [
  'Ask me anything about Islam...',
  'How do I calculate my Zakat?',
  'Is this stock halal to invest in?',
  'What did Abu Bakr (RA) say about faith?',
  'Help me understand Riba...',
  "What's the best du'a for patience?",
  'Explain Islamic finance to me...',
];

export function AIQuickChatBar({ onMicTap, placeholder, className }: AIQuickChatBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (placeholder) return;

    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % PLACEHOLDERS.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [placeholder]);

  const handleSubmit = () => {
    const trimmed = query.trim();
    if (trimmed) {
      navigate('/ai-assistant', { state: { initialMessage: trimmed, newChat: Date.now() } });
    } else {
      navigate('/ai-assistant', { state: { newChat: Date.now() } });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
      data-tour="raya-cta"
      className={cn('px-4', className)}
    >
      <div
        className={cn(
          'rounded-xl overflow-hidden border border-[#D4A853]/30',
          'bg-gradient-to-br from-[#0F141F]/95 to-[#0A0E16]/95 backdrop-blur-xl',
          'shadow-[0_8px_32px_rgba(212,168,83,0.12),0_0_24px_rgba(43,111,107,0.15),0_4px_16px_rgba(0,0,0,0.4)]'
        )}
      >
        <div className="p-5">
          {/* Header row */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <AIIcon />
              <div>
                <span className="text-[15px] font-bold bg-gradient-to-r from-[#D4A853] to-[#E8C97A] bg-clip-text text-transparent">
                  Raya AI
                </span>
                <p className="text-[10px] text-[#5C5749] mt-0.5">Your Islamic AI companion</p>
              </div>
            </div>
            <span
              className="flex items-center gap-1.5 text-[10px] font-medium text-[#22C55E] bg-[#22C55E]/8 px-2.5 py-1 rounded-full border border-[#22C55E]/15"
            >
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse"
                style={{ boxShadow: '0 0 6px rgba(34,197,94,0.5)' }}
              />
              Online
            </span>
          </div>

          {/* Pill input bar */}
          <div
            className={cn(
              'w-full flex items-center gap-3.5 px-5 py-2.5 rounded-[28px]',
              'bg-[#0A0E16]/70 border border-[#D4A853]/25',
              'focus-within:border-[#D4A853]/50 transition-colors'
            )}
          >
            {/* Input with animated placeholder */}
            <div className="flex-1 relative min-w-0">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="w-full bg-transparent text-[#F5E8C7] text-sm outline-none placeholder-transparent"
                placeholder={PLACEHOLDERS[placeholderIndex]}
              />
              {!query && (
                <div className="absolute inset-0 pointer-events-none flex items-center">
                  <AnimatePresence mode="wait">
                    <motion.span
                      key={placeholderIndex}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.3 }}
                      className="text-white/40 text-sm truncate"
                    >
                      {PLACEHOLDERS[placeholderIndex]}
                    </motion.span>
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Voice button */}
            {onMicTap && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onMicTap();
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.stopPropagation();
                    onMicTap();
                  }
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Microphone size={18} className="text-white/70" />
              </span>
            )}

            {/* Send arrow */}
            <button
              onClick={handleSubmit}
              className={cn(
                'p-2.5 rounded-full shrink-0',
                'bg-gradient-to-br from-[#D4A853] to-[#C9A85C]',
                'shadow-[0_2px_12px_rgba(212,168,83,0.4)]',
                'hover:shadow-[0_4px_16px_rgba(212,168,83,0.5)] transition-shadow'
              )}
            >
              <ArrowRight size={16} weight="bold" className="text-[#0A0E16]" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AIIcon() {
  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      style={{
        background: 'linear-gradient(135deg, #D4A853, #E8C97A)',
        boxShadow: '0 0 14px rgba(212,168,83,0.35)',
      }}
    >
      <Sparkle size={18} weight="fill" className="text-[#0A0E16]" />
    </div>
  );
}
