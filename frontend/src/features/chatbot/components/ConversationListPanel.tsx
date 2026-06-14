/**
 * ConversationListPanel
 * Slim right-side panel showing recent chats. Self-contained: reads from the
 * chatbot store and calls store actions directly. Hidden below xl so the
 * mobile/tablet experience keeps using the bottom-sheet ConversationHistory
 * drawer (accessed via the Clock icon in the chat header).
 */

import { ChatText, Clock, Plus, Trash } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useChatbotStore } from '../stores/chatbot.store';
import { getCompanionById } from '../types/chatbot.types';

function relativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function ConversationListPanel() {
  const conversations = useChatbotStore((s) => s.conversations);
  const loading = useChatbotStore((s) => s.conversationsLoading);
  const activeId = useChatbotStore((s) => s.activeConversationId);
  const loadConversation = useChatbotStore((s) => s.loadConversation);
  const deleteConversation = useChatbotStore((s) => s.deleteConversation);
  const startNewConversation = useChatbotStore((s) => s.startNewConversation);

  return (
    <aside className="hidden xl:flex flex-col w-[280px] shrink-0 h-full border-l border-[#D4A853]/15 bg-[#0A0E16]">
      {/* Header */}
      <div className="shrink-0 px-4 py-3 border-b border-[#D4A853]/15">
        <p className="text-[10px] uppercase tracking-widest text-[#7A7363]/60 font-semibold mb-2">
          Recent Chats
        </p>
        <button
          onClick={startNewConversation}
          className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#D4A853]/10 border border-[#D4A853]/30 hover:bg-[#D4A853]/20 transition-colors"
        >
          <Plus size={14} className="text-[#D4A853]" />
          <span className="text-xs font-semibold text-[#D4A853]">New chat</span>
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-2 py-2">
        {loading ? (
          <div className="space-y-2 px-1">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-14 rounded-lg bg-[#10151F] animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center px-4 py-8 h-full">
            <ChatText size={28} className="text-[#3A4D65] mb-2" />
            <p className="text-[11px] text-[#7B8DA0]">No conversations yet</p>
            <p className="text-[10px] text-[#3A4D65] mt-0.5">Start chatting to see history here</p>
          </div>
        ) : (
          <ul className="space-y-1">
            {conversations.map((conv) => {
              const companion = getCompanionById(conv.companionId);
              const isActive = conv.id === activeId;
              return (
                <li key={conv.id}>
                  <button
                    onClick={() => loadConversation(conv.id)}
                    className={cn(
                      'group w-full text-left flex items-start gap-2.5 px-2 py-2 rounded-lg transition-colors',
                      isActive
                        ? 'bg-[#D4A853]/10 border border-[#D4A853]/30'
                        : 'border border-transparent hover:bg-white/5'
                    )}
                  >
                    <div className="w-8 h-8 rounded-md bg-[#0F141F] flex items-center justify-center shrink-0 text-sm">
                      {companion.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h3 className={cn(
                          'text-[12px] font-semibold truncate flex-1',
                          isActive ? 'text-[#F5E8C7]' : 'text-white/80'
                        )}>
                          {conv.title || 'New conversation'}
                        </h3>
                        <span className="text-[9px] text-[#7B8DA0] shrink-0 flex items-center gap-0.5">
                          <Clock size={9} />
                          {relativeTime(conv.updatedAt)}
                        </span>
                      </div>
                      <p className="text-[10px] text-[#7B8DA0] truncate mt-0.5">
                        {conv.lastAiResponse || conv.lastUserMessage || 'No messages'}
                      </p>
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.stopPropagation();
                          deleteConversation(conv.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-60 hover:opacity-100 transition-opacity p-1 rounded shrink-0"
                      title="Delete conversation"
                    >
                      <Trash size={12} className="text-red-400" />
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
