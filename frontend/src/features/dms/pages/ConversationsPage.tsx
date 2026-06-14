/**
 * Conversations inbox — /messages.
 * Lists all of the user's conversations, newest-updated first, with unread
 * indicators and a tap-to-open row.
 */

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { CaretLeft, ChatCircleDots } from '@phosphor-icons/react';
import { useAuthStore } from '@/core/stores/auth.store';
import { PremiumIslamicBackground } from '@/components/shared/PremiumIslamicBackground';
import {
  hasUnread,
  otherParticipant,
  subscribeToConversations,
} from '../services/dmService';
import type { Conversation } from '../types/dm.types';
import { getPublicProfileByUid } from '@/features/public-profile/services/publicProfileService';
import type { PublicProfile } from '@/features/public-profile/types/public-profile.types';
import { isTohfaMessage } from '@/features/barakah-labs/services/tohfaService';

export function ConversationsPage() {
  const user = useAuthStore((s) => s.user);
  const [convs, setConvs] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Record<string, PublicProfile | null>>({});

  useEffect(() => {
    if (!user?.id) return;
    const unsub = subscribeToConversations(user.id, (list) => {
      // Historical-Tohfa filter: conversations whose only-or-latest message
      // is a Tohfa (legacy v1 delivery channel) shouldn't show in /messages.
      // Tohfas have their own surface now.
      const filtered = list.filter((c) => !isTohfaMessage(c.lastMessage?.text));
      setConvs(filtered);
      setLoading(false);
    });
    return () => unsub();
  }, [user?.id]);

  // Fetch profiles for the "other" participants of each conversation.
  useEffect(() => {
    if (!user?.id) return;
    const needed = new Set(
      convs.map((c) => otherParticipant(c, user.id)).filter((uid) => !(uid in profiles)),
    );
    if (needed.size === 0) return;
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        [...needed].map(async (uid) => [uid, await getPublicProfileByUid(uid)] as const),
      );
      if (!cancelled) setProfiles((prev) => ({ ...prev, ...Object.fromEntries(entries) }));
    })();
    return () => {
      cancelled = true;
    };
  }, [convs, user?.id, profiles]);

  return (
    <div className="min-h-screen bg-[#0F1724] text-[#F5E8C7] relative">
      <PremiumIslamicBackground variant="hero" />

      <div className="relative z-10 max-w-[720px] mx-auto px-4 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <Link
            to="/"
            className="p-2 rounded-full bg-[#0F141F]/60 hover:bg-[#0F141F]/80 border border-[rgba(212,168,83,0.2)] transition-colors"
            aria-label="Back"
          >
            <CaretLeft size={16} />
          </Link>
          <h1
            className="text-[28px] font-bold tracking-tight"
            style={{ fontFamily: "'Cormorant Garamond', serif" }}
          >
            Messages
          </h1>
        </div>

        {loading ? (
          <LoadingShell />
        ) : convs.length === 0 ? (
          <EmptyState />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <AnimatePresence>
              {convs.map((c) => {
                if (!user?.id) return null;
                const other = otherParticipant(c, user.id);
                const profile = profiles[other];
                return (
                  <ConversationRow
                    key={c.id}
                    conv={c}
                    me={user.id}
                    otherUid={other}
                    profile={profile}
                  />
                );
              })}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function ConversationRow({
  conv,
  me,
  otherUid,
  profile,
}: {
  conv: Conversation;
  me: string;
  otherUid: string;
  profile: PublicProfile | null | undefined;
}) {
  const name = profile?.displayName || profile?.fullName || 'Conversation';
  const initial = (name[0] || 'Z').toUpperCase();
  const unread = hasUnread(conv, me);
  const last = conv.lastMessage;
  const snippet = last
    ? (last.senderId === me ? 'You: ' : '') + last.text
    : 'Say salam…';
  const timestamp = last ? timeAgo(last.createdAt) : '';

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
    >
      <Link
        to={`/messages/${conv.id}`}
        state={{ otherUid }}
        className="flex items-center gap-3 p-3 rounded-2xl bg-[#0F1724]/60 border border-[rgba(212,168,83,0.15)] hover:bg-[#0A0E16]/60 transition-colors"
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 relative"
          style={{
            background: 'linear-gradient(135deg, #E8C97A, #B8943E)',
            color: '#0A0E16',
            fontFamily: "'Cormorant Garamond', serif",
            fontWeight: 700,
            fontSize: 22,
          }}
        >
          {profile?.photoUrl ? (
            <img src={profile.photoUrl} alt={name} className="w-12 h-12 rounded-2xl object-cover" />
          ) : (
            initial
          )}
          {unread && (
            <span
              className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0F1724]"
              style={{ background: '#D4A853' }}
            />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className={`text-sm truncate ${unread ? 'text-[#F5E8C7] font-bold' : 'text-[#C9C0A8] font-semibold'}`}>
              {name}
            </p>
            <span className="text-[10px] text-[#5C5749] flex-shrink-0">{timestamp}</span>
          </div>
          <p className={`text-xs truncate mt-0.5 ${unread ? 'text-[#F5E8C7]' : 'text-[#5C5749]'}`}>
            {snippet}
          </p>
        </div>
      </Link>
    </motion.div>
  );
}

function LoadingShell() {
  return (
    <div className="flex flex-col gap-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="h-16 rounded-2xl bg-[#0F141F]/40 animate-pulse" />
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-10 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0F141F]/60 border border-[rgba(212,168,83,0.2)] mb-4">
        <ChatCircleDots size={28} className="text-[#D4A853]" />
      </div>
      <h2
        className="text-xl font-semibold text-[#F5E8C7]"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        No messages yet
      </h2>
      <p className="mt-2 text-sm text-[#7A7363] max-w-sm mx-auto">
        Message any of your connections to start a chat. Visit their profile and tap the Message
        button.
      </p>
      <Link
        to="/connections"
        className="mt-5 inline-block px-5 py-2 rounded-xl text-sm font-semibold"
        style={{
          background: 'linear-gradient(90deg, #D4A853, #E8C97A)',
          color: '#0A0E16',
        }}
      >
        Your connections
      </Link>
    </div>
  );
}

function timeAgo(ms: number): string {
  if (!ms) return '';
  const diff = Date.now() - ms;
  const s = Math.floor(diff / 1000);
  if (s < 60) return 'now';
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(ms).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default ConversationsPage;
