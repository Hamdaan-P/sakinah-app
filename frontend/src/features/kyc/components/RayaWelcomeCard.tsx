/**
 * Raya Welcome Card
 * Golden-bordered celebration card with streamed Raya welcome message
 * Shows unlocked feature grid after Deep KYC completion
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkle, CheckCircle, ArrowRight } from '@phosphor-icons/react';

interface RayaWelcomeCardProps {
  welcomeMessage: string;
  isStreaming: boolean;
}

const UNLOCKED_FEATURES = [
  { name: 'Islamic Banking', icon: '🏦' },
  { name: 'Stock Screener', icon: '📊' },
  { name: 'Companions', icon: '🕌' },
  { name: 'Matrimony', icon: '💍' },
  { name: 'Wallet', icon: '💳' },
  { name: 'Networking', icon: '🤝' },
];

export function RayaWelcomeCard({ welcomeMessage, isStreaming }: RayaWelcomeCardProps) {
  const navigate = useNavigate();
  const [displayedText, setDisplayedText] = useState('');

  // Stream the welcome message character by character
  useEffect(() => {
    if (!welcomeMessage) return;

    if (!isStreaming) {
      setDisplayedText(welcomeMessage);
      return;
    }

    let i = 0;
    setDisplayedText('');
    const speed = Math.max(20, Math.min(40, 1500 / welcomeMessage.length));
    const interval = setInterval(() => {
      i++;
      setDisplayedText(welcomeMessage.slice(0, i));
      if (i >= welcomeMessage.length) {
        clearInterval(interval);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [welcomeMessage, isStreaming]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Celebration header */}
      <div className="text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15, delay: 0.2 }}
          className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-[#D4A853] to-[#E8C97A] flex items-center justify-center mb-4"
        >
          <Sparkle size={32} className="text-[#0A0E16]" weight="fill" />
        </motion.div>
        <h2 className="text-xl font-bold text-[#F5E8C7]">Profile Complete!</h2>
        <p className="text-[#7A7363] text-sm mt-1">All features are now unlocked</p>
      </div>

      {/* Raya welcome message card */}
      <div className="p-5 rounded-2xl bg-gradient-to-br from-[#10151F] to-[#0F141F] border-2 border-[#D4A853]/30">
        <div className="flex items-start gap-3">
          <div className="shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A853] to-[#E8C97A] flex items-center justify-center text-[#0A0E16] text-sm font-bold">
            R
          </div>
          <div className="flex-1">
            <p className="text-[#D4A853] text-xs font-semibold mb-1">Raya</p>
            <p className="text-[#F5E8C7] text-sm leading-relaxed">
              {displayedText}
              {isStreaming && displayedText.length < (welcomeMessage?.length || 0) && (
                <span className="inline-block w-1.5 h-4 bg-[#D4A853] ml-0.5 animate-pulse rounded-sm" />
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Unlocked features grid */}
      <div>
        <p className="text-[#7A7363] text-xs font-medium mb-3 text-center">Features now available to you</p>
        <div className="grid grid-cols-3 gap-2">
          {UNLOCKED_FEATURES.map((f, i) => (
            <motion.div
              key={f.name}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-[#10151F]/50 border border-[rgba(212,168,83,0.1)]"
            >
              <span className="text-lg">{f.icon}</span>
              <span className="text-[10px] text-[#C9C0A8] text-center">{f.name}</span>
              <CheckCircle size={12} className="text-emerald-400" weight="fill" />
            </motion.div>
          ))}
        </div>
      </div>

      {/* Continue button */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2 }}
        onClick={() => navigate('/', { replace: true })}
        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#0A0E16] font-bold text-sm hover:opacity-90 transition-all flex items-center justify-center gap-2"
      >
        Explore ZaryahPlus
        <ArrowRight size={16} weight="bold" />
      </motion.button>
    </motion.div>
  );
}
