/**
 * ChatMessageBubble
 * Renders a single chat message with markdown, sources, and thinking panel
 * Mirrors Flutter's chat_message_widget.dart
 */

import { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Copy, Check, CaretDown, BookOpen, BookOpenText, ArrowRight, ThumbsUp, ThumbsDown, Sparkle, SpeakerHigh, Stop } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import type { ChatMessage, Companion } from '../types/chatbot.types';
import { ChatMessageType, getCompanionById } from '../types/chatbot.types';
import { useChatbotStore } from '../stores/chatbot.store';
import { FormattedText } from '../utils/textFormatter';
import { useSpeechSynthesis } from '@/hooks/useSpeechSynthesis';
import { SuggestionChips } from './SuggestionChips';
import { StockInsightCard } from './StockInsightCard';
import { StockPieChart } from './StockPieChart';
import { StockBarChart } from './StockBarChart';

import { HalalComplianceBadge } from './HalalComplianceBadge';
import { NavigateLinks } from './NavigateLinks';
import { StockAnalysisCard } from './StockAnalysisCard';
import { StockComparisonCard } from './StockComparisonCard';
import { EmotionIndicator } from './EmotionIndicator';
import { ShareMenu } from './ShareMenu';

/** Check if a message contains stock charts or analysis that need extra width */
function hasStockContent(msg: ChatMessage): boolean {
  if (!msg.messageType) return false;
  return (
    msg.messageType === ChatMessageType.stockChart ||
    msg.messageType === ChatMessageType.stockAnalysis ||
    msg.messageType === ChatMessageType.comparison ||
    msg.messageType === ChatMessageType.pieChart ||
    msg.messageType === ChatMessageType.barChart
  );
}

interface ChatMessageBubbleProps {
  message: ChatMessage;
  companion: Companion;
  isLast: boolean;
  onSuggestionSelect: (text: string) => void;
  onPeriodChange?: (symbol: string, period: string) => void;
  onComparisonPeriodChange?: (symbols: string[], period: string) => void;
  previousUserMessage?: string;
}

export function ChatMessageBubble({ message, companion, isLast, onSuggestionSelect, onPeriodChange, onComparisonPeriodChange, previousUserMessage }: ChatMessageBubbleProps) {
  const [copied, setCopied] = useState(false);
  const [showSources, setShowSources] = useState(false);
  const isTyping = useChatbotStore((s) => s.isTyping);
  const isActivelyStreaming = isLast && isTyping;
  const { isSpeaking, isSupported: ttsSupported, toggle: toggleSpeak } = useSpeechSynthesis();

  const handleCopy = () => {
    navigator.clipboard.writeText(message.text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (message.isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex justify-end mb-3 group"
      >
        <div className="max-w-[80%] sm:max-w-[70%]">
          <div className="px-4 py-3 rounded-2xl rounded-br-md bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-black">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.text}</p>
          </div>
          <div className="flex items-center justify-end gap-2 mt-1 mr-1">
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 text-[10px] text-[#C9A85C] hover:text-[#D4A853] transition-colors"
            >
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
        {/* User avatar */}
        <div className="shrink-0 w-8 h-8 rounded-full bg-[#D4A853]/20 border border-[#D4A853]/30 flex items-center justify-center text-sm ml-2 mt-1">
          <span className="text-[#D4A853] text-xs font-bold">👤</span>
        </div>
      </motion.div>
    );
  }

  // AI message
  const timeStr = formatTime(message.timestamp);
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex justify-start mb-3 group"
    >
      {/* Companion icon */}
      <div className="shrink-0 w-8 h-8 rounded-full bg-[#0F141F]/80 border border-[#D4A853]/30 flex items-center justify-center text-sm mr-2 mt-1">
        {companion.icon}
      </div>

      <div className={cn(
        'min-w-0',
        // Widen bubble on mobile when stock cards / analysis are present
        hasStockContent(message)
          ? 'max-w-[95%] sm:max-w-[85%] lg:max-w-[75%]'
          : 'max-w-[80%] sm:max-w-[70%]'
      )}>
        {/* Companion name */}
        <p className="text-[10px] text-[#D4A853]/60 font-medium mb-1">{companion.name}</p>

        {/* Loading state */}
        {message.isLoading ? (
          <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-[#0F141F]/40 border border-white/5">
            <TypingIndicator />
          </div>
        ) : (
          <>
            {/* Thinking status — animated contextual messages while Raya works */}
            <AnimatePresence>
              {message.thinkingContent && (isActivelyStreaming || !message.text) && (
                <motion.div
                  key="thinking"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6, transition: { duration: 0.2 } }}
                  className="mb-2 rounded-2xl rounded-bl-md bg-[#0F141F]/60 border border-[#D4A853]/10 overflow-hidden"
                >
                  {/* Shimmer progress bar */}
                  <div className="h-[2px] w-full bg-[#0A0E16]">
                    <motion.div
                      className="h-full w-1/3 bg-gradient-to-r from-transparent via-[#D4A853]/60 to-transparent"
                      animate={{ x: ['-100%', '400%'] }}
                      transition={{ duration: 1.8, repeat: Infinity, ease: 'linear' }}
                    />
                  </div>
                  <div className="px-4 py-2.5 flex items-center gap-2.5">
                    <motion.div
                      animate={{ rotate: [0, 180, 360] }}
                      transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    >
                      <Sparkle size={14} weight="fill" className="text-[#D4A853]" />
                    </motion.div>
                    <p className="text-xs text-white/50 min-h-[16px]">
                      <ThinkingStatus content={message.thinkingContent} />
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Message bubble — shown once text starts streaming */}
            {(message.text || (!message.isLoading && !message.thinkingContent)) && (
              <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-[#0F141F]/40 border border-white/5 backdrop-blur-sm">
                <div className="text-sm text-white leading-relaxed">
                  {message.text ? (
                    <FormattedText text={message.text} />
                  ) : (
                    <p className="text-white/40 italic">Message could not be loaded</p>
                  )}
                </div>

                {/* Chart content */}
                {message.messageType === ChatMessageType.stockChart && message.chartData?.stock && (
                  <StockInsightCard data={message.chartData.stock} onPeriodChange={onPeriodChange} />
                )}
                {message.messageType === ChatMessageType.stockChart && !message.chartData && (
                  <ChartSkeleton />
                )}
                {message.messageType === ChatMessageType.pieChart && message.chartData?.pieSlices && (
                  <div className="mt-3">
                    <StockPieChart slices={message.chartData.pieSlices} title="Portfolio Allocation" />
                  </div>
                )}
                {message.messageType === ChatMessageType.barChart && message.chartData?.barData && (
                  <div className="mt-3">
                    <StockBarChart data={message.chartData.barData} />
                  </div>
                )}

                {/* Stock comparison card */}
                {message.messageType === ChatMessageType.comparison && message.chartData?.comparison && (
                  <StockComparisonCard data={message.chartData.comparison} onPeriodChange={onComparisonPeriodChange} />
                )}
                {message.messageType === ChatMessageType.comparison && !message.chartData && (
                  <ComparisonSkeleton />
                )}

                {/* Stock analysis card (4-layer) */}
                {message.messageType === ChatMessageType.stockAnalysis && message.chartData?.analysis && (
                  <StockAnalysisCard data={message.chartData.analysis} />
                )}
                {/* Also show analysis card on stockChart messages if analysis data is present */}
                {message.messageType === ChatMessageType.stockChart && message.chartData?.analysis && (
                  <StockAnalysisCard data={message.chartData.analysis} />
                )}

                {/* Halal compliance badge — only show when we actually have screening data */}
                {message.chartData?.stock?.isHalal != null && message.messageType === ChatMessageType.stockChart && (
                  <div className="mt-2">
                    <HalalComplianceBadge isHalal={message.chartData.stock.isHalal} />
                  </div>
                )}

                {/* Sources */}
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <button
                      onClick={() => setShowSources(!showSources)}
                      className="flex items-center gap-1.5 text-[10px] text-[#D4A853]/70 hover:text-[#D4A853]"
                    >
                      <BookOpen size={12} />
                      <span>{message.sources.length} source{message.sources.length > 1 ? 's' : ''}</span>
                      <CaretDown size={12} className={cn('transition-transform', showSources && 'rotate-180')} />
                    </button>
                    {showSources && (
                      <div className="mt-1.5 space-y-1">
                        {message.sources.map((src, i) => (
                          <p key={i} className="text-[10px] text-white/40 pl-4">
                            {typeof src === 'string' ? src : JSON.stringify(src)}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                )}


                {/* Action buttons (contextual) */}
                <ActionButtons text={message.text} />

                {/* Navigate links from LLM */}
                {message.navigateLinks && message.navigateLinks.length > 0 && (
                  <NavigateLinks links={message.navigateLinks} />
                )}
              </div>
            )}

            {/* Action row */}
            <div className="flex items-center gap-3 mt-1.5 ml-1">
              <p className="text-[10px] text-white/25 flex items-center gap-1.5">
                {timeStr}
                {message.emotionData && <EmotionIndicator emotionData={message.emotionData} />}
              </p>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[10px] text-[#C9A85C] hover:text-[#D4A853] transition-colors"
              >
                {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
              {ttsSupported && message.text && (
                <button
                  onClick={() => toggleSpeak(message.text)}
                  className={cn(
                    'flex items-center gap-1 text-[10px] transition-colors',
                    isSpeaking
                      ? 'text-[#4FB892]'
                      : 'text-[#C9A85C] hover:text-[#D4A853]'
                  )}
                  title={isSpeaking ? 'Stop speaking' : 'Listen to response'}
                >
                  {isSpeaking ? <Stop size={12} /> : <SpeakerHigh size={12} />}
                  <span>{isSpeaking ? 'Stop' : 'Listen'}</span>
                </button>
              )}
              {previousUserMessage && message.text && (
                <ShareMenu
                  shareData={{
                    userQuestion: previousUserMessage,
                    aiResponse: message.text,
                    companionName: companion.name,
                    companionIcon: companion.icon,
                    date: message.timestamp,
                  }}
                  companionId={companion.id}
                />
              )}
              <FeedbackButtons messageId={message.id} />
            </div>

            {/* Follow-up suggestions (only on last AI message) */}
            {isLast && message.suggestions && message.suggestions.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] text-white/40 mb-1.5 ml-1">You might also ask:</p>
                <SuggestionChips suggestions={message.suggestions} onSelect={onSuggestionSelect} />
              </div>
            )}

            {/* Cross-referral: Sahaba companion suggestion */}
            {isLast && message.suggestedCompanion && message.suggestedCompanionName && (
              <CompanionReferralChip
                companionId={message.suggestedCompanion}
                companionName={message.suggestedCompanionName}
              />
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

// ==================== Sub-components ====================

// ── Thinking status phrases by category ──

const STOCK_PHRASES = [
  'Pulling up the latest market data',
  'Checking Shariah compliance',
  'Analyzing the fundamentals',
  'Reading the technical signals',
  'Crunching the numbers',
  'Evaluating risk factors',
  'Putting together the full picture',
];

const ISLAMIC_PHRASES = [
  'Consulting the sources',
  'Cross-referencing the scholars',
  'Reviewing Quran and Hadith references',
  'Weighing different scholarly perspectives',
  'Preparing a thoughtful response',
];

const GENERAL_PHRASES = [
  'Looking into this for you',
  'Let me think about that',
  'Gathering my thoughts',
  'Working on your answer',
  'Give me a moment',
  'Almost there',
];

function detectCategory(content: string): 'stock' | 'islamic' | 'general' {
  const lower = content.toLowerCase();
  if (lower.includes('stock') || lower.includes('analysis') || lower.includes('market') ||
      lower.includes('halal') || lower.includes('shariah') || lower.includes('screening') ||
      lower.includes('fundamental') || lower.includes('technical') || lower.includes('portfolio'))
    return 'stock';
  if (lower.includes('quran') || lower.includes('hadith') || lower.includes('fiqh') ||
      lower.includes('islamic') || lower.includes('scholar') || lower.includes('memory'))
    return 'islamic';
  return 'general';
}

const PHRASE_MAP = { stock: STOCK_PHRASES, islamic: ISLAMIC_PHRASES, general: GENERAL_PHRASES };

/** Animated rotating status messages while Raya works */
function ThinkingStatus({ content }: { content: string }) {
  const category = detectCategory(content);
  const phrases = PHRASE_MAP[category];
  const [index, setIndex] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>(undefined);

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i + 1) % phrases.length);
    }, 2800);
    return () => clearInterval(intervalRef.current);
  }, [phrases]);

  // When real tool steps come in, bump to next phrase immediately
  useEffect(() => {
    setIndex((i) => Math.min(i + 1, phrases.length - 1));
  }, [content, phrases]);

  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={`${category}-${index}`}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.25 }}
      >
        {phrases[index]}
      </motion.span>
    </AnimatePresence>
  );
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 rounded-full bg-[#D4A853]/60"
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </div>
  );
}

/** Detect Islamic content and show relevant action buttons */
function ActionButtons({ text }: { text: string }) {
  const navigate = useNavigate();
  const lower = text.toLowerCase();

  const actions = useMemo(() => {
    const result: Array<{ label: string; icon: 'quran'; route: string }> = [];
    // Detect Quran references (Surah, verse, ayah, etc.)
    const hasQuranRef = /surah|quran|verse|ayah|ayat|\d+:\d+/.test(lower);
    if (hasQuranRef) {
      result.push({ label: 'Open Quran Reading', icon: 'quran', route: '/quran/read' });
    }
    return result;
  }, [lower]);

  if (actions.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 mt-3">
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={() => navigate(action.route)}
          className={cn(
            'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-colors',
            'bg-gradient-to-r from-[#D4A853]/90 to-[#E8C97A]/90 text-black',
            'hover:from-[#D4A853] hover:to-[#E8C97A]',
            'shadow-[0_2px_8px_rgba(212,168,83,0.3)]'
          )}
        >
          <BookOpenText size={14} />
          <span>{action.label}</span>
          <ArrowRight size={12} />
        </button>
      ))}
    </div>
  );
}

function FeedbackButtons({ messageId }: { messageId: string }) {
  const feedbackMap = useChatbotStore((s) => s.feedbackMap);
  const submitFeedback = useChatbotStore((s) => s.submitFeedback);
  const current = feedbackMap[messageId];

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => submitFeedback(messageId, 'up')}
        disabled={!!current}
        className={cn(
          'p-0.5 rounded transition-colors',
          current === 'up'
            ? 'text-emerald-400'
            : current
              ? 'text-white/15 cursor-default'
              : 'text-white/30 hover:text-emerald-400',
        )}
        title="Good response"
      >
        <ThumbsUp size={12} weight={current === 'up' ? 'fill' : 'regular'} />
      </button>
      <button
        onClick={() => submitFeedback(messageId, 'down')}
        disabled={!!current}
        className={cn(
          'p-0.5 rounded transition-colors',
          current === 'down'
            ? 'text-red-400'
            : current
              ? 'text-white/15 cursor-default'
              : 'text-white/30 hover:text-red-400',
        )}
        title="Poor response"
      >
        <ThumbsDown size={12} weight={current === 'down' ? 'fill' : 'regular'} />
      </button>
    </div>
  );
}

function CompanionReferralChip({ companionId, companionName }: { companionId: string; companionName: string }) {
  const setCompanion = useChatbotStore((s) => s.setCompanion);
  const companionData = getCompanionById(companionId);

  return (
    <div className="mt-3">
      <button
        onClick={() => setCompanion(companionId)}
        className={cn(
          'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all',
          'bg-[#10151F]/80 border border-[#D4A853]/30 text-[#F5E8C7]',
          'hover:border-[#D4A853]/60 hover:bg-[#10151F]',
        )}
      >
        <span>{companionData.icon}</span>
        <span>For deeper insight, try asking <strong className="text-[#D4A853]">{companionName}</strong></span>
        <ArrowRight size={12} className="text-[#D4A853]" />
      </button>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="mt-3 bg-[#0F141F]/60 border border-[#D4A853]/20 rounded-xl p-4 animate-pulse">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-12 h-5 rounded bg-white/10" />
          <div className="w-24 h-4 rounded bg-white/5" />
        </div>
        <div className="text-right">
          <div className="w-16 h-4 rounded bg-white/10 mb-1" />
          <div className="w-12 h-3 rounded bg-white/5" />
        </div>
      </div>
      <div className="w-full h-[160px] rounded-lg bg-white/5" />
      <div className="flex gap-2 mt-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-16 h-10 rounded-lg bg-white/5" />
        ))}
      </div>
    </div>
  );
}

function ComparisonSkeleton() {
  return (
    <div className="mt-3 bg-[#0F141F]/60 border border-[#D4A853]/20 rounded-xl p-4 animate-pulse">
      <div className="flex items-center gap-3 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#D4A853]/30" />
          <div className="w-14 h-5 rounded bg-white/10" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-[#38BDF8]/30" />
          <div className="w-14 h-5 rounded bg-white/10" />
        </div>
      </div>
      <div className="w-full h-[200px] rounded-lg bg-white/5 mb-3" />
      <div className="flex gap-2 mb-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="w-10 h-6 rounded-full bg-white/5" />
        ))}
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex justify-between">
            <div className="w-16 h-4 rounded bg-white/5" />
            <div className="w-12 h-4 rounded bg-white/5" />
            <div className="w-12 h-4 rounded bg-white/5" />
          </div>
        ))}
      </div>
    </div>
  );
}

function formatTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
