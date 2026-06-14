/**
 * InsightsPanel
 * Enhanced bottom sheet with weekly summary, mood timeline, emotion distribution,
 * pattern cards, growth moments, relationship patterns, and cognitive pattern alerts.
 * SOULBUDDY EVOLUTION: 6-category insights
 */

import { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, ArrowClockwise, ChartBar, ChatCircleDots, Clock, Heart, TrendUp, Sparkle, UserCircle, Lightning, ChatText } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type { MoodLogEntry, UserEmotionalProfile, WeeklyInsight } from '../types/chatbot.types';
import { MoodChart } from './MoodChart';

export interface InsightsData {
  insights: string;
  stats: {
    total_conversations?: number;
    total_messages?: number;
    topics_discussed?: number;
    [key: string]: unknown;
  };
  last_updated: string;
}

export interface WeeklyInsightsData {
  summary: string;
  insights: WeeklyInsight[];
  period_start: string;
  period_end: string;
}

interface InsightsPanelProps {
  open: boolean;
  onClose: () => void;
  data: InsightsData | null;
  loading: boolean;
  onRefresh: () => void;
  moodData?: MoodLogEntry[];
  userProfile?: UserEmotionalProfile | null;
  weeklyInsights?: WeeklyInsightsData | null;
}

// Emotion -> color mapping for pills
const EMOTION_COLORS: Record<string, string> = {
  joy: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
  trust: 'bg-emerald-400/20 text-emerald-300 border-emerald-400/30',
  anticipation: 'bg-sky-400/20 text-sky-300 border-sky-400/30',
  surprise: 'bg-violet-400/20 text-violet-300 border-violet-400/30',
  sadness: 'bg-blue-400/20 text-blue-300 border-blue-400/30',
  anger: 'bg-red-400/20 text-red-300 border-red-400/30',
  fear: 'bg-orange-400/20 text-orange-300 border-orange-400/30',
  disgust: 'bg-rose-400/20 text-rose-300 border-rose-400/30',
  neutral: 'bg-[#3A4D65]/30 text-[#B8C4D4] border-[#3A4D65]/50',
};

// Insight type -> icon + color
const INSIGHT_STYLES: Record<string, { icon: React.ReactNode; border: string; bg: string }> = {
  pattern: { icon: <Brain size={14} className="text-violet-400" />, border: 'border-violet-400/30', bg: 'bg-violet-400/10' },
  relationship: { icon: <UserCircle size={14} className="text-sky-400" />, border: 'border-sky-400/30', bg: 'bg-sky-400/10' },
  growth: { icon: <Sparkle size={14} className="text-emerald-400" />, border: 'border-emerald-400/30', bg: 'bg-emerald-400/10' },
  trigger: { icon: <Lightning size={14} className="text-orange-400" />, border: 'border-orange-400/30', bg: 'bg-orange-400/10' },
  self_talk: { icon: <ChatText size={14} className="text-amber-400" />, border: 'border-amber-400/30', bg: 'bg-amber-400/10' },
  mood: { icon: <Heart size={14} className="text-rose-400" />, border: 'border-rose-400/30', bg: 'bg-rose-400/10' },
};

function getEmotionColor(emotion: string): string {
  return EMOTION_COLORS[emotion.toLowerCase()] ?? EMOTION_COLORS.neutral;
}

export function InsightsPanel({ open, onClose, data, loading, onRefresh, moodData = [], userProfile, weeklyInsights }: InsightsPanelProps) {
  // Compute emotion distribution
  const emotionDistribution = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const entry of moodData) {
      const e = entry.primaryEmotion;
      if (e && e !== 'neutral') {
        counts[e] = (counts[e] ?? 0) + 1;
      }
    }
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6);
  }, [moodData]);

  // Pattern cards from profile
  const patterns = useMemo(() => {
    if (!userProfile) return [];
    const result: string[] = [];
    if (userProfile.recurringThemes?.length) {
      result.push(`You often discuss: ${userProfile.recurringThemes.slice(0, 3).join(', ')}`);
    }
    if (userProfile.growthAreas?.length) {
      result.push(`Growth areas: ${userProfile.growthAreas.slice(0, 2).join(', ')}`);
    }
    if (userProfile.copingPatterns?.length) {
      result.push(`Coping patterns: ${userProfile.copingPatterns.slice(0, 2).join(', ')}`);
    }
    return result;
  }, [userProfile]);

  // Group weekly insights by type
  const groupedInsights = useMemo(() => {
    if (!weeklyInsights?.insights) return {};
    const groups: Record<string, WeeklyInsight[]> = {};
    for (const insight of weeklyInsights.insights) {
      const type = insight.type || 'pattern';
      if (!groups[type]) groups[type] = [];
      groups[type].push(insight);
    }
    return groups;
  }, [weeklyInsights]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] overflow-hidden',
              // Clear the 72px persistent sidebar on lg+ so the panel doesn't
              // get clipped behind the icon rail.
              'lg:left-[72px]',
              'bg-gradient-to-b from-[#0A0E16] to-[#0F141F]',
              'rounded-t-3xl border-t border-[#D4A853]/30',
            )}
          >
            {/* Handle bar + header */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-[#0A0E16] to-[#0A0E16]/95 pb-2 pt-3 px-5">
              <div className="w-10 h-1 mx-auto rounded-full bg-gradient-to-r from-[#D4A853] to-[#E8C97A] mb-4" />
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Brain size={20} className="text-[#D4A853]" />
                  <h2 className="text-lg font-bold bg-gradient-to-r from-[#D4A853] to-[#E8C97A] bg-clip-text text-transparent">
                    Your Insights
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={onRefresh}
                    disabled={loading}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors',
                      loading && 'animate-spin',
                    )}
                    title="Refresh insights"
                  >
                    <ArrowClockwise size={16} className="text-[#D4A853]" />
                  </button>
                  <button
                    onClick={onClose}
                    className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <X size={16} className="text-white/60" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto max-h-[calc(85vh-100px)] px-5 pb-8">
              {loading ? (
                <LoadingSkeleton />
              ) : !data && moodData.length === 0 && !weeklyInsights ? (
                <EmptyState />
              ) : (
                <>
                  {/* Weekly Summary */}
                  {weeklyInsights?.summary && (
                    <div className="bg-gradient-to-br from-[#D4A853]/10 to-[#E8C97A]/5 border border-[#D4A853]/20 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkle size={16} className="text-[#D4A853]" />
                        <h3 className="text-sm font-semibold text-[#D4A853]">Weekly Summary</h3>
                      </div>
                      <p className="text-xs text-[#F5E8C7] leading-relaxed">
                        {weeklyInsights.summary}
                      </p>
                    </div>
                  )}

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 gap-3 mb-5">
                    <StatCard
                      icon={<ChatCircleDots size={18} className="text-[#38BDF8]" />}
                      label="Conversations"
                      value={String(data?.stats.total_conversations ?? 0)}
                    />
                    <StatCard
                      icon={<ChartBar size={18} className="text-[#4ADE80]" />}
                      label="Messages"
                      value={String(data?.stats.total_messages ?? 0)}
                    />
                  </div>

                  {/* Mood Timeline */}
                  {moodData.length > 0 && (
                    <div className="bg-[#0F141F] border border-[#3A4D65]/50 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <TrendUp size={16} className="text-[#D4A853]" />
                        <h3 className="text-sm font-semibold text-[#F5E8C7]">Mood Timeline</h3>
                      </div>
                      <MoodChart data={moodData} />
                    </div>
                  )}

                  {/* Emotion Distribution */}
                  {emotionDistribution.length > 0 && (
                    <div className="bg-[#0F141F] border border-[#3A4D65]/50 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Heart size={16} className="text-[#D4A853]" />
                        <h3 className="text-sm font-semibold text-[#F5E8C7]">Emotions</h3>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {emotionDistribution.map(([emotion, count]) => (
                          <span
                            key={emotion}
                            className={cn(
                              'px-2.5 py-1 rounded-full text-[10px] font-medium border',
                              getEmotionColor(emotion),
                            )}
                          >
                            {emotion} ({count})
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SOULBUDDY: Insight Cards by Category */}
                  {Object.entries(groupedInsights).map(([type, insights]) => {
                    const style = INSIGHT_STYLES[type] ?? INSIGHT_STYLES.pattern;
                    const typeLabels: Record<string, string> = {
                      mood: 'Mood Patterns',
                      self_talk: 'Self-Talk Patterns',
                      relationship: 'Relationship Patterns',
                      growth: 'Growth Moments',
                      trigger: 'Emotional Triggers',
                      pattern: 'Behavioral Patterns',
                    };

                    return (
                      <div key={type} className={cn('bg-[#0F141F] border rounded-xl p-4 mb-4', style.border)}>
                        <div className="flex items-center gap-2 mb-3">
                          {style.icon}
                          <h3 className="text-sm font-semibold text-[#F5E8C7]">
                            {typeLabels[type] ?? type}
                          </h3>
                        </div>
                        <div className="space-y-2.5">
                          {insights.map((insight, i) => (
                            <div key={i} className={cn('rounded-lg p-3', style.bg)}>
                              <p className="text-xs font-medium text-[#F5E8C7] mb-0.5">{insight.title}</p>
                              <p className="text-[11px] text-[#B8C4D4] leading-relaxed">{insight.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {/* Legacy Pattern Cards */}
                  {patterns.length > 0 && Object.keys(groupedInsights).length === 0 && (
                    <div className="bg-[#0F141F] border border-[#3A4D65]/50 rounded-xl p-4 mb-4">
                      <h3 className="text-sm font-semibold text-[#F5E8C7] mb-2">Patterns</h3>
                      <div className="space-y-2">
                        {patterns.map((pattern, i) => (
                          <p key={i} className="text-xs text-[#B8C4D4] leading-relaxed pl-3 border-l-2 border-[#D4A853]/30">
                            {pattern}
                          </p>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI analysis */}
                  {data?.insights && (
                    <div className="bg-[#0F141F] border border-[#3A4D65]/50 rounded-xl p-4 mb-4">
                      <h3 className="text-sm font-semibold text-[#F5E8C7] mb-2">AI Analysis</h3>
                      <p className="text-xs text-[#B8C4D4] leading-relaxed whitespace-pre-wrap">
                        {data.insights}
                      </p>
                    </div>
                  )}

                  {/* Last updated */}
                  {data?.last_updated && (
                    <div className="flex items-center gap-1.5 text-[10px] text-[#7B8DA0]">
                      <Clock size={12} />
                      <span>Last updated: {new Date(data.last_updated).toLocaleString()}</span>
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-[#0F141F] border border-[#3A4D65]/50 rounded-xl p-3 flex items-center gap-3">
      <div className="w-9 h-9 rounded-lg bg-[#0A0E16] flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-lg font-bold text-[#F5E8C7]">{value}</p>
        <p className="text-[10px] text-[#7B8DA0]">{label}</p>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-4 mt-2">
      <div className="h-20 rounded-xl bg-[#10151F] animate-pulse" />
      <div className="grid grid-cols-2 gap-3">
        <div className="h-16 rounded-xl bg-[#10151F] animate-pulse" />
        <div className="h-16 rounded-xl bg-[#10151F] animate-pulse" />
      </div>
      <div className="h-40 rounded-xl bg-[#10151F] animate-pulse" />
      <div className="h-20 rounded-xl bg-[#10151F] animate-pulse" />
      <div className="h-32 rounded-xl bg-[#10151F] animate-pulse" />
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Brain size={40} className="text-[#3A4D65] mb-3" />
      <p className="text-[#7B8DA0] text-sm">No insights yet</p>
      <p className="text-[#3A4D65] text-xs mt-1">Chat with Raya to build your profile</p>
    </div>
  );
}
