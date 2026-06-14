/**
 * Closest to Raya — the single deepest conversation with a standout Raya quote.
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Quotes, Sparkle } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/core/stores/auth.store';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase.config';

interface Conversation {
  id: string;
  title: string;
  companionId: string;
  messageCount: number;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: Date;
}

export function ClosestMoment() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [moment, setMoment] = useState<{ title: string; quote: string; convoId: string; messages: number } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) loadMoment(user.id);
  }, [user?.id]);

  async function loadMoment(userId: string) {
    setLoading(true);
    try {
      // Find the conversation with highest messageCount
      const conversationsQuery = query(
        collection(db, 'users', userId, 'conversations'),
        orderBy('messageCount', 'desc'),
        limit(1),
      );
      const snap = await getDocs(conversationsQuery);
      if (snap.empty) return;

      const topConvo = snap.docs[0];
      const data = topConvo.data();
      const conversation: Conversation = {
        id: topConvo.id,
        title: data.title ?? 'Untitled conversation',
        companionId: data.companionId ?? 'raya',
        messageCount: data.messageCount ?? 0,
      };

      // Need at least a real conversation
      if (conversation.messageCount < 4) return;

      // Fetch its messages to find a standout Raya line
      const messagesQuery = query(
        collection(db, 'users', userId, 'conversations', topConvo.id, 'messages'),
        orderBy('timestamp', 'asc'),
      );
      const msgSnap = await getDocs(messagesQuery);
      const messages: Message[] = msgSnap.docs.map((d) => {
        const m = d.data();
        return {
          role: (m.role === 'user' ? 'user' : 'assistant') as 'user' | 'assistant',
          content: m.content ?? '',
          timestamp: m.timestamp?.toDate?.(),
        };
      });

      // Find the longest assistant message between 40 and 280 chars — good quote material
      const quoteCandidates = messages
        .filter((m) => m.role === 'assistant' && m.content.length >= 40 && m.content.length <= 280)
        .sort((a, b) => b.content.length - a.content.length);

      const quote = quoteCandidates[0]?.content ??
        messages.filter((m) => m.role === 'assistant')[0]?.content ??
        '';

      if (!quote) return;

      setMoment({
        title: conversation.title,
        quote: quote.trim(),
        convoId: conversation.id,
        messages: conversation.messageCount,
      });
    } catch (e) {
      console.error('ClosestMoment load error:', e);
    } finally {
      setLoading(false);
    }
  }

  if (loading || !moment) return null;

  return (
    <motion.button
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onClick={() => navigate(`/ai-assistant?conversation=${moment.convoId}`)}
      className="w-full text-left rounded-2xl p-5 transition-all hover:scale-[1.005] active:scale-[0.995]"
      style={{
        background: 'linear-gradient(145deg, rgba(212,168,83,0.08), rgba(36,50,70,0.7))',
        border: '1px solid rgba(212,168,83,0.18)',
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkle size={14} weight="fill" className="text-[#D4A853]" />
        <p className="text-[#D4A853] text-[10px] font-bold uppercase tracking-widest">Your Deepest Conversation</p>
      </div>

      <div className="flex items-start gap-3">
        <Quotes size={20} weight="fill" className="text-[#D4A853]/40 flex-shrink-0 mt-1" />
        <div className="flex-1 min-w-0">
          <p className="text-[#C9C0A8] text-[13px] leading-[1.7] italic line-clamp-3">
            "{moment.quote}"
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mt-3 pt-3" style={{ borderTop: '1px solid rgba(212,168,83,0.08)' }}>
        <p className="text-[#7A7363] text-[12px] truncate pr-2">
          From: <span className="text-[#F5E8C7]">{moment.title}</span>
        </p>
        <p className="text-[#5C5749] text-[11px] flex-shrink-0">{moment.messages} messages</p>
      </div>
    </motion.button>
  );
}
