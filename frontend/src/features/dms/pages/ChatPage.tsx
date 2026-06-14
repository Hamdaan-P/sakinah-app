/**
 * Chat thread — /messages/:convId.
 * Real-time bubbles + an input bar. Marks as read on mount + whenever a new
 * message arrives while the tab is focused.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CaretLeft, PaperPlaneRight } from '@phosphor-icons/react';
import { useAuthStore } from '@/core/stores/auth.store';
import { PremiumIslamicBackground } from '@/components/shared/PremiumIslamicBackground';
import {
  markConversationRead,
  otherParticipant,
  sendMessage,
  subscribeToConversation,
  subscribeToMessages,
} from '../services/dmService';
import type { Conversation, Message } from '../types/dm.types';
import { isTohfaMessage } from '@/features/barakah-labs/services/tohfaService';
import { getPublicProfileByUid } from '@/features/public-profile/services/publicProfileService';
import type { PublicProfile } from '@/features/public-profile/types/public-profile.types';

export function ChatPage() {
  const { convId = '' } = useParams();
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);

  const [conv, setConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [otherProfile, setOtherProfile] = useState<PublicProfile | null>(null);

  // Compute the other participant from the conversation doc
  const otherUid = useMemo(() => {
    if (!user?.id || !conv) return null;
    return otherParticipant(conv, user.id);
  }, [user?.id, conv]);

  // Subscribe to conversation meta
  useEffect(() => {
    if (!convId) return;
    const unsub = subscribeToConversation(convId, (c) => {
      if (!c) {
        setDenied(true);
        setLoading(false);
        return;
      }
      setConv(c);
      setLoading(false);
    });
    return () => unsub();
  }, [convId]);

  // Subscribe to messages — hide legacy Tohfa-as-DM messages from the
  // thread; Tohfas have their own delivery surface now (see S10).
  useEffect(() => {
    if (!convId) return;
    const unsub = subscribeToMessages(convId, (list) => {
      setMessages(list.filter((m) => !isTohfaMessage(m.text)));
    });
    return () => unsub();
  }, [convId]);

  // Fetch other participant's public profile
  useEffect(() => {
    if (!otherUid) return;
    let cancelled = false;
    getPublicProfileByUid(otherUid).then((p) => {
      if (!cancelled) setOtherProfile(p);
    });
    return () => {
      cancelled = true;
    };
  }, [otherUid]);

  // Mark read when messages arrive (if the latest wasn't from us)
  useEffect(() => {
    if (!user?.id || !conv || messages.length === 0) return;
    const last = messages[messages.length - 1];
    if (last.senderId !== user.id) {
      markConversationRead(convId, user.id).catch(() => {});
    }
  }, [messages, user?.id, conv, convId]);

  if (denied) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0F1724] text-[#F5E8C7]">
        <div className="text-center px-4">
          <p className="text-lg mb-2">Conversation not found</p>
          <p className="text-sm text-[#7A7363] mb-4">You don't have access to this chat.</p>
          <button
            onClick={() => navigate('/messages')}
            className="px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)', color: '#0A0E16' }}
          >
            Back to messages
          </button>
        </div>
      </div>
    );
  }

  const name = otherProfile?.displayName || otherProfile?.fullName || 'ZaryahPlus Member';
  const initial = (name[0] || 'Z').toUpperCase();
  const profileLink = otherProfile?.slug ? `/@${otherProfile.slug}` : otherUid ? `/@${otherUid}` : '#';

  return (
    <div className="h-dvh bg-[#0F1724] text-[#F5E8C7] relative flex flex-col">
      <PremiumIslamicBackground variant="hero" />

      {/* Sticky header */}
      <div
        className="relative z-20 flex items-center gap-3 px-4 py-3 border-b border-[rgba(212,168,83,0.12)]"
        style={{ background: 'rgba(15,23,36,0.85)', backdropFilter: 'blur(10px)' }}
      >
        <Link
          to="/messages"
          className="p-1.5 rounded-full hover:bg-white/5 transition-colors"
          aria-label="Back"
        >
          <CaretLeft size={18} />
        </Link>
        <Link to={profileLink} className="flex items-center gap-2.5 flex-1 min-w-0">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #E8C97A, #B8943E)',
              color: '#0A0E16',
              fontFamily: "'Cormorant Garamond', serif",
              fontWeight: 700,
              fontSize: 16,
            }}
          >
            {otherProfile?.photoUrl ? (
              <img src={otherProfile.photoUrl} alt="" className="w-9 h-9 rounded-xl object-cover" />
            ) : (
              initial
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-[#F5E8C7] truncate">{name}</p>
            {otherProfile?.archetype && (
              <p className="text-[10px] text-[#5C5749] uppercase tracking-wider truncate">
                {otherProfile.archetype}
              </p>
            )}
          </div>
        </Link>
      </div>

      {/* Messages */}
      <div className="relative z-10 flex-1 min-h-0 overflow-y-auto px-3 py-4 space-y-1.5">
        {loading ? (
          <div className="flex justify-center pt-10">
            <div className="w-8 h-8 rounded-full border-2 border-[#D4A853]/30 border-t-[#D4A853] animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center pt-10 text-sm text-[#7A7363]">
            <p className="mb-1">Say salam to start the conversation.</p>
            <p className="text-[11px] text-[#5C5749]">
              Raya may analyze this chat to understand you better. No one else will read it.
            </p>
          </div>
        ) : (
          messages.map((m, i) => {
            const mine = m.senderId === user?.id;
            const prev = messages[i - 1];
            const showTimestamp = !prev || m.createdAt - prev.createdAt > 5 * 60 * 1000;
            return (
              <div key={m.id}>
                {showTimestamp && m.createdAt > 0 && (
                  <p className="text-center text-[10px] text-[#5C5749] my-3">
                    {formatTimestamp(m.createdAt)}
                  </p>
                )}
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${mine ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      mine ? 'rounded-br-md' : 'rounded-bl-md'
                    }`}
                    style={{
                      background: mine
                        ? 'linear-gradient(135deg, #D4A853, #E8C97A)'
                        : 'rgba(36,50,70,0.85)',
                      color: mine ? '#0A0E16' : '#F5E8C7',
                      border: mine
                        ? '1px solid rgba(212,168,83,0.35)'
                        : '1px solid rgba(212,168,83,0.15)',
                    }}
                  >
                    {m.text}
                  </div>
                </motion.div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <ChatInputBar
        onSend={async (text) => {
          if (!user?.id || !otherUid) return;
          await sendMessage(user.id, otherUid, text);
        }}
      />
    </div>
  );
}

function ChatInputBar({ onSend }: { onSend: (text: string) => Promise<void> }) {
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  async function submit() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    try {
      await onSend(trimmed);
      setText('');
      inputRef.current?.focus();
    } finally {
      setSending(false);
    }
  }

  return (
    <div
      className="relative z-20 px-3 py-2.5 border-t border-[rgba(212,168,83,0.12)]"
      style={{ background: 'rgba(15,23,36,0.9)', backdropFilter: 'blur(10px)' }}
    >
      <div
        className="flex items-end gap-2 rounded-2xl px-3 py-2"
        style={{
          background: 'rgba(36,50,70,0.7)',
          border: '1px solid rgba(212,168,83,0.2)',
        }}
      >
        <textarea
          ref={inputRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          rows={1}
          placeholder="Type a message…"
          className="flex-1 bg-transparent text-[#F5E8C7] text-sm placeholder-[#5C5749] outline-none resize-none max-h-32"
          style={{ minHeight: 24 }}
        />
        <button
          onClick={submit}
          disabled={!text.trim() || sending}
          aria-label="Send"
          className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-105"
          style={{
            background: 'linear-gradient(135deg, #D4A853, #E8C97A)',
            color: '#0A0E16',
          }}
        >
          <PaperPlaneRight size={16} weight="fill" />
        </button>
      </div>
    </div>
  );
}

function formatTimestamp(ms: number): string {
  const d = new Date(ms);
  const now = new Date();
  const today = d.toDateString() === now.toDateString();
  if (today) return d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  const yesterday = new Date(now.getTime() - 86400000).toDateString() === d.toDateString();
  if (yesterday) return 'Yesterday, ' + d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export default ChatPage;
