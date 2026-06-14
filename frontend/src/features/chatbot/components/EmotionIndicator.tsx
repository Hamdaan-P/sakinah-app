/**
 * EmotionIndicator
 * Tiny colored dot rendered next to AI message timestamps.
 * Gold = positive, blue = neutral, soft rose = negative.
 * Hover tooltip: "Raya sensed: [emotion]"
 * RAYA EVOLUTION: Phase 5
 */

import { useState } from 'react';
import type { EmotionData } from '../types/chatbot.types';
import { cn } from '@/lib/utils';

interface EmotionIndicatorProps {
  emotionData: EmotionData;
}

function getSentimentColor(sentiment: number): string {
  if (sentiment > 0.3) return 'bg-[#D4A853]'; // Gold — positive
  if (sentiment < -0.3) return 'bg-rose-400/80'; // Soft rose — negative
  return 'bg-[#38BDF8]/60'; // Blue — neutral
}

function getSentimentGlow(sentiment: number): string {
  if (sentiment > 0.3) return 'shadow-[0_0_4px_rgba(212,168,83,0.5)]';
  if (sentiment < -0.3) return 'shadow-[0_0_4px_rgba(251,113,133,0.4)]';
  return 'shadow-[0_0_4px_rgba(56,189,248,0.3)]';
}

export function EmotionIndicator({ emotionData }: EmotionIndicatorProps) {
  const [showTooltip, setShowTooltip] = useState(false);

  const color = getSentimentColor(emotionData.sentiment);
  const glow = getSentimentGlow(emotionData.sentiment);
  const emotion = emotionData.primaryEmotion;

  return (
    <span
      className="relative inline-flex items-center"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        className={cn(
          'w-[6px] h-[6px] rounded-full inline-block',
          color,
          glow,
        )}
      />
      {showTooltip && (
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-md bg-[#0A0E16] border border-[#3A4D65]/50 text-[9px] text-[#B8C4D4] whitespace-nowrap z-10">
          Raya sensed: {emotion}
        </span>
      )}
    </span>
  );
}
