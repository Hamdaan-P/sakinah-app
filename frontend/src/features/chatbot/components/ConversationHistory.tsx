/**
 * ConversationHistory
 * Bottom sheet drawer for browsing and loading past conversations.
 * Follows the same pattern as CompanionSelector.
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, Trash, ChatText, Clock, Broom } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { getCompanionById } from '../types/chatbot.types';
import type { ConversationMeta } from '../types/chatbot.types';

interface ConversationHistoryProps {
  open: boolean;
  onClose: () => void;
  conversations: ConversationMeta[];
  loading: boolean;
  activeId: string | null;
  onSelect: (convId: string) => void;
  onDelete: (convId: string) => void;
  onNewChat: () => void;
  onCleanup?: () => Promise<number>;
}

function relativeTime(date: Date): string {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function ConversationHistory({
  open,
  onClose,
  conversations,
  loading,
  activeId,
  onSelect,
  onDelete,
  onNewChat,
  onCleanup,
}: ConversationHistoryProps) {
  const [cleaning, setCleaning] = useState(false);

  const smallCount = conversations.filter((c) => c.messageCount < 5).length;

  const handleCleanup = async () => {
    if (!onCleanup || cleaning) return;
    setCleaning(true);
    try {
      const deleted = await onCleanup();
      console.log(`Cleaned up ${deleted} conversations`);
    } finally {
      setCleaning(false);
    }
  };

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
              // Clear the 72px persistent sidebar on lg+ so the sheet's content
              // (especially the left edge title and action buttons) is fully visible.
              'lg:left-[72px]',
              'bg-gradient-to-b from-[#0A0E16] to-[#0F141F]',
              'rounded-t-3xl border-t border-[#D4A853]/30',
            )}
          >
            {/* Handle bar + header */}
            <div className="sticky top-0 z-10 bg-gradient-to-b from-[#0A0E16] to-[#0A0E16]/95 pb-2 pt-3 px-5">
              <div className="w-10 h-1 mx-auto rounded-full bg-gradient-to-r from-[#D4A853] to-[#E8C97A] mb-4" />
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold bg-gradient-to-r from-[#D4A853] to-[#E8C97A] bg-clip-text text-transparent">
                  Conversations
                </h2>
                <button
                  onClick={onClose}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <X size={16} className="text-white/60" />
                </button>
              </div>

              {/* Action buttons row */}
              <div className="flex gap-2 mb-2">
                <button
                  onClick={onNewChat}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/30 hover:bg-[#D4A853]/20 transition-colors"
                >
                  <Plus size={16} className="text-[#D4A853]" />
                  <span className="text-sm font-semibold text-[#D4A853]">New Conversation</span>
                </button>

                {smallCount > 0 && onCleanup && (
                  <button
                    onClick={handleCleanup}
                    disabled={cleaning}
                    className={cn(
                      'flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border transition-colors',
                      cleaning
                        ? 'bg-red-500/5 border-red-500/20 opacity-60'
                        : 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20',
                    )}
                    title={`Delete ${smallCount} conversation${smallCount !== 1 ? 's' : ''} with fewer than 5 messages`}
                  >
                    <Broom size={16} className="text-red-400" />
                    <span className="text-sm font-semibold text-red-400">
                      {cleaning ? `Deleting...` : `Clean (${smallCount})`}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto max-h-[calc(85vh-140px)] px-5 pb-8">
              {loading ? (
                <div className="space-y-3 mt-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="h-16 rounded-xl bg-[#10151F] animate-pulse"
                    />
                  ))}
                </div>
              ) : conversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <ChatText size={40} className="text-[#3A4D65] mb-3" />
                  <p className="text-[#7B8DA0] text-sm">No conversations yet</p>
                  <p className="text-[#3A4D65] text-xs mt-1">Start chatting to see your history here</p>
                </div>
              ) : (
                <div className="space-y-2 mt-2">
                  {conversations.map((conv) => {
                    const companion = getCompanionById(conv.companionId);
                    const isActive = conv.id === activeId;

                    return (
                      <motion.div
                        key={conv.id}
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={cn(
                          'group flex items-start gap-3 p-3 rounded-xl border transition-colors cursor-pointer',
                          isActive
                            ? 'bg-[#D4A853]/10 border-[#D4A853]/40'
                            : 'bg-[#0F141F] border-[#3A4D65]/50 hover:border-[#D4A853]/30',
                        )}
                        onClick={() => onSelect(conv.id)}
                      >
                        {/* Companion avatar */}
                        <div className="w-9 h-9 rounded-lg bg-[#0A0E16] flex items-center justify-center shrink-0 text-lg">
                          {companion.icon}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-[#F5E8C7] font-semibold text-sm truncate flex-1">
                              {conv.title || 'New conversation'}
                            </h3>
                            <span className="text-[10px] text-[#7B8DA0] shrink-0 flex items-center gap-1">
                              <Clock size={10} />
                              {relativeTime(conv.updatedAt)}
                            </span>
                          </div>
                          <p className="text-[#7B8DA0] text-xs truncate mt-0.5">
                            {conv.lastAiResponse || conv.lastUserMessage || 'No messages'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-[#D4A853]/70">{companion.name}</span>
                            <span className="text-[10px] text-[#3A4D65]">|</span>
                            <span className="text-[10px] text-[#7B8DA0]">
                              {conv.messageCount} message{conv.messageCount !== 1 ? 's' : ''}
                            </span>
                          </div>
                        </div>

                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            onDelete(conv.id);
                          }}
                          className="p-2 rounded-lg opacity-50 hover:opacity-100 hover:bg-red-500/20 active:bg-red-500/30 transition-all shrink-0"
                          title="Delete conversation"
                        >
                          <Trash size={16} className="text-red-400" />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
