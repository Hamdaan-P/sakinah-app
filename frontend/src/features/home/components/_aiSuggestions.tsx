/**
 * Suggestion catalog + time-based selection for AIContextualSuggestions.
 * Pure data/logic so the component stays presentational.
 */

import {
  Sparkle,
  Sun,
  Moon,
  SunHorizon,
  ShieldCheck,
  Bed,
  TrendUp,
  Coins,
  HeartBreak,
  Prohibit,
  Calendar,
  Buildings,
} from '@phosphor-icons/react';
import type { AISuggestion } from '../types/home.types';

export function generateContextualSuggestions(nextPrayer?: string): AISuggestion[] {
  const hour = new Date().getHours();
  const suggestions: AISuggestion[] = [];

  // Time-based suggestions
  if (hour >= 4 && hour < 7) {
    suggestions.push({
      text: 'Morning adhkar for a blessed day',
      icon: <Sun size={14} />,
      color: '#F59E0B',
      prompt: 'What are the morning adhkar I should recite after Fajr?',
    });
    suggestions.push({
      text: 'Tahajjud prayers - rewards & how to',
      icon: <Moon size={14} />,
      color: '#6366F1',
      prompt: 'Tell me about the rewards and method of Tahajjud prayer',
    });
  } else if (hour >= 7 && hour < 12) {
    suggestions.push({
      text: 'Start your day with Barakah',
      icon: <Sparkle size={14} />,
      color: '#10B981',
      prompt: 'How can I start my day to maximize barakah in my work?',
    });
  } else if (hour >= 12 && hour < 14) {
    suggestions.push({
      text: 'Sunnah prayers of Dhuhr',
      icon: <SunHorizon size={14} />,
      color: '#EF4444',
      prompt: 'What are the sunnah prayers associated with Dhuhr?',
    });
  } else if (hour >= 17 && hour < 19) {
    suggestions.push({
      text: 'Evening adhkar for protection',
      icon: <ShieldCheck size={14} />,
      color: '#8B5CF6',
      prompt: 'What are the evening adhkar for protection?',
    });
  } else if (hour >= 20) {
    suggestions.push({
      text: "Du'a before sleeping",
      icon: <Bed size={14} />,
      color: '#3B82F6',
      prompt: "What du'as should I recite before going to sleep?",
    });
  }

  // Prayer-based suggestions
  if (nextPrayer) {
    suggestions.push({
      text: `Prepare for ${nextPrayer}`,
      icon: <Buildings size={14} />,
      color: '#D4A853',
      prompt: `How should I prepare for ${nextPrayer} prayer spiritually?`,
    });
  }

  // Always available suggestions
  const alwaysAvailable: AISuggestion[] = [
    {
      text: 'Is my investment halal?',
      icon: <TrendUp size={14} />,
      color: '#06B6D4',
      prompt: 'Help me understand if my investments are Shariah-compliant',
    },
    {
      text: 'Calculate my Zakat',
      icon: <Coins size={14} />,
      color: '#22C55E',
      prompt: 'Help me calculate my Zakat accurately',
    },
    {
      text: "Du'a for anxiety",
      icon: <HeartBreak size={14} />,
      color: '#EC4899',
      prompt: "What du'as can help me with anxiety and worry?",
    },
    {
      text: 'Understanding Riba',
      icon: <Prohibit size={14} />,
      color: '#EF4444',
      prompt: 'Explain what constitutes Riba in modern banking',
    },
    {
      text: 'Friday Sunnah acts',
      icon: <Calendar size={14} />,
      color: '#14B8A6',
      prompt: 'What are the recommended Sunnah acts for Friday?',
    },
  ];

  const shuffled = alwaysAvailable.sort(() => Math.random() - 0.5);
  const slotsNeeded = Math.max(0, 4 - suggestions.length);
  suggestions.push(...shuffled.slice(0, slotsNeeded));

  return suggestions.slice(0, 4);
}
