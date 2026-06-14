/**
 * Conversational Step
 * Raya chat bubble (left) + user response area (right-aligned when answered)
 * Typing animation on appearance
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface ConversationalStepProps {
  rayaMessage: string;
  children: React.ReactNode;
  /** Whether this step is currently active */
  active: boolean;
}

export function ConversationalStep({ rayaMessage, children, active }: ConversationalStepProps) {
  const [showContent, setShowContent] = useState(false);
  const [displayedText, setDisplayedText] = useState('');
  const [typingDone, setTypingDone] = useState(false);

  // Typing animation for Raya's message
  useEffect(() => {
    if (!active) {
      setDisplayedText(rayaMessage);
      setTypingDone(true);
      setShowContent(true);
      return;
    }

    setDisplayedText('');
    setTypingDone(false);
    setShowContent(false);

    let i = 0;
    const speed = Math.max(15, Math.min(30, 800 / rayaMessage.length));
    const interval = setInterval(() => {
      i++;
      setDisplayedText(rayaMessage.slice(0, i));
      if (i >= rayaMessage.length) {
        clearInterval(interval);
        setTypingDone(true);
        setTimeout(() => setShowContent(true), 200);
      }
    }, speed);

    return () => clearInterval(interval);
  }, [rayaMessage, active]);

  return (
    <div className="space-y-4">
      {/* Raya bubble (left) */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-start gap-3 max-w-[90%]"
      >
        {/* Raya avatar */}
        <div className="shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#D4A853] to-[#E8C97A] flex items-center justify-center text-[#0A0E16] text-sm font-bold">
          R
        </div>
        <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#10151F] border border-[rgba(212,168,83,0.15)]">
          <p className="text-[#F5E8C7] text-sm leading-relaxed">
            {displayedText}
            {!typingDone && (
              <span className="inline-block w-1.5 h-4 bg-[#D4A853] ml-0.5 animate-pulse rounded-sm" />
            )}
          </p>
        </div>
      </motion.div>

      {/* User response area */}
      {showContent && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="pl-12"
        >
          {children}
        </motion.div>
      )}
    </div>
  );
}
