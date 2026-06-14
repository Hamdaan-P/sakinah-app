/**
 * Connections inbox — /connections.
 * Three tabs: Received requests, Sent requests, Your connections.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CaretLeft, Clock, Sparkle, UserCheck, UserPlus,
} from '@phosphor-icons/react';
import { openOrCreateConversation } from '@/features/dms/services/dmService';
import { useAuthStore } from '@/core/stores/auth.store';
import { PremiumIslamicBackground } from '@/components/shared/PremiumIslamicBackground';
import {
  acceptRequest,
  declineRequest,
  listByStatusAny,
  listConnections,
  listRequestsReceived,
  listRequestsSent,
  otherUid,
  removeConnection,
  sendRequest,
} from '../services/connectionService';
import type { ConnectionDoc } from '../types/connection.types';
import { getPublicProfileByUid } from '@/features/public-profile/services/publicProfileService';
import type { PublicProfile } from '@/features/public-profile/types/public-profile.types';
import { discoverPeople, type Suggestion } from '../services/discoverService';
import { StatPill, LoadingShell } from './components/_primitives';
import { PersonRow } from './components/PersonRow';
import { SuggestionRow } from './components/SuggestionRow';
import { EmptyState } from './components/EmptyState';

type TabKey = 'discover' | 'sent' | 'connected';

const TABS: { key: TabKey; label: string }[] = [
  { key: 'discover', label: 'Discover' },
  { key: 'sent', label: 'Sent' },
  { key: 'connected', label: 'Connected' },
];

export function ConnectionsPage() {
  const user = useAuthStore((s) => s.user);
  const navigate = useNavigate();
  const [tab, setTab] = useState<TabKey>('discover');
  const [openingChat, setOpeningChat] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [received, setReceived] = useState<ConnectionDoc[]>([]);
  const [sent, setSent] = useState<ConnectionDoc[]>([]);
  const [connected, setConnected] = useState<ConnectionDoc[]>([]);
  const [profiles, setProfiles] = useState<Record<string, PublicProfile | null>>({});

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);
  const [pendingOutUids, setPendingOutUids] = useState<Set<string>>(new Set());

  const refresh = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const [r, s, c] = await Promise.all([
        listRequestsReceived(user.id),
        listRequestsSent(user.id),
        listConnections(user.id),
      ]);
      setReceived(r);
      setSent(s);
      setConnected(c);
      const uids = new Set<string>();
      [...r, ...s, ...c].forEach((conn) => uids.add(otherUid(user.id, conn)));
      const entries = await Promise.all(
        [...uids].map(async (uid) => [uid, await getPublicProfileByUid(uid)] as const),
      );
      setProfiles(Object.fromEntries(entries));
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  const refreshDiscover = useCallback(async () => {
    if (!user?.id) return;
    setDiscoverLoading(true);
    try {
      const [myProfile, edges] = await Promise.all([
        getPublicProfileByUid(user.id),
        listByStatusAny(user.id),
      ]);
      const exclude = new Set<string>();
      edges.forEach((e) => exclude.add(otherUid(user.id, e)));
      const list = await discoverPeople(user.id, myProfile, exclude, 20);
      setSuggestions(list);
    } finally {
      setDiscoverLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refresh();
    refreshDiscover();
  }, [refresh, refreshDiscover]);

  const current = useMemo(() => {
    if (tab === 'sent') return sent;
    return connected;
  }, [tab, sent, connected]);

  async function handleAccept(other: string) {
    if (!user?.id) return;
    await acceptRequest(user.id, other);
    refresh();
  }
  async function handleDecline(other: string) {
    if (!user?.id) return;
    await declineRequest(user.id, other);
    refresh();
  }
  async function handleCancel(other: string) {
    if (!user?.id) return;
    await removeConnection(user.id, other);
    refresh();
  }
  async function handleRemove(other: string) {
    if (!user?.id) return;
    if (!window.confirm('Remove this connection?')) return;
    await removeConnection(user.id, other);
    refresh();
  }
  async function handleMessage(other: string) {
    if (!user?.id || openingChat) return;
    setOpeningChat(other);
    try {
      const convIdValue = await openOrCreateConversation(user.id, other);
      navigate(`/messages/${convIdValue}`, { state: { otherUid: other } });
    } catch (err) {
      console.error(err);
      setOpeningChat(null);
    }
  }
  async function handleConnect(other: string) {
    if (!user?.id) return;
    setPendingOutUids((prev) => new Set(prev).add(other));
    try {
      await sendRequest(user.id, other);
      // Hide the card immediately — they're now in "sent" territory.
      setSuggestions((prev) => prev.filter((s) => s.profile.uid !== other));
      refresh();
    } catch (err) {
      console.error(err);
      setPendingOutUids((prev) => {
        const next = new Set(prev);
        next.delete(other);
        return next;
      });
    }
  }

  return (
    <div className="min-h-screen bg-[#0F1724] text-[#F5E8C7] relative">
      <PremiumIslamicBackground variant="hero" />

      <div className="relative z-10 max-w-[720px] mx-auto px-4 pt-6 pb-24">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
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
            Connections
          </h1>
        </div>

        {/* Stat pills */}
        <div className="flex items-center gap-2 mb-5 px-1">
          <StatPill icon={<UserCheck size={12} weight="fill" />} label={`${connected.length} connected`} />
          {(received.length > 0 || sent.length > 0) && (
            <StatPill
              icon={<Clock size={12} weight="fill" />}
              label={`${received.length + sent.length} pending`}
              accent
            />
          )}
        </div>

        {/* Received requests — always visible above the tabs */}
        {!loading && received.length > 0 && user?.id && (
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-2 px-1">
              <UserPlus size={14} className="text-[#D4A853]" weight="fill" />
              <h2 className="text-[13px] font-semibold text-[#F5E8C7] uppercase tracking-wide">
                Requests
              </h2>
              <span className="text-[11px] text-[#7A7363]">{received.length}</span>
            </div>
            <div className="flex flex-col gap-2">
              <AnimatePresence>
                {received.map((conn) => {
                  if (!user?.id) return null;
                  const other = otherUid(user.id, conn);
                  const profile = profiles[other];
                  return (
                    <PersonRow
                      key={conn.userA + conn.userB}
                      tab="received"
                      uid={other}
                      profile={profile}
                      onAccept={() => handleAccept(other)}
                      onDecline={() => handleDecline(other)}
                      onCancel={() => handleCancel(other)}
                      onRemove={() => handleRemove(other)}
                      onMessage={() => handleMessage(other)}
                      messageBusy={openingChat === other}
                      createdAt={conn.createdAt}
                    />
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {TABS.map((t) => {
            const active = t.key === tab;
            const count =
              t.key === 'discover'
                ? suggestions.length
                : t.key === 'sent'
                  ? sent.length
                  : connected.length;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className="px-4 py-2 rounded-full text-[13px] font-semibold transition-all whitespace-nowrap"
                style={{
                  background: active ? 'linear-gradient(90deg, #D4A853, #E8C97A)' : 'rgba(36,50,70,0.6)',
                  color: active ? '#0A0E16' : '#C9C0A8',
                  border: active ? '1px solid rgba(212,168,83,0.35)' : '1px solid rgba(212,168,83,0.12)',
                }}
              >
                {t.label}
                {count > 0 && (
                  <span className="ml-2 text-[11px] opacity-80">{count}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Discover tab */}
        {tab === 'discover' ? (
          discoverLoading ? (
            <LoadingShell />
          ) : suggestions.length === 0 ? (
            <EmptyState tab={tab} />
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col gap-2"
            >
              {/* Split into Shukr (gratitude-based) matches first, then the rest.
                 Reasons starting with ✦ come from the Shukr scorer. */}
              {(() => {
                const shukrMatches = suggestions.filter((s) => s.reasons.some((r) => r.startsWith('✦')));
                const otherMatches = suggestions.filter((s) => !s.reasons.some((r) => r.startsWith('✦')));
                return (
                  <>
                    {shukrMatches.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1 px-1">
                          <Sparkle size={12} className="text-[#D4A853]" weight="fill" />
                          <p className="text-[11px] font-semibold text-[#D4A853] uppercase tracking-wide">
                            Shukr Matches
                          </p>
                          <span className="text-[10px] text-white/40">— gratitude practice in common</span>
                        </div>
                        <AnimatePresence>
                          {shukrMatches.map((s) => (
                            <SuggestionRow
                              key={s.profile.uid}
                              suggestion={s}
                              pending={pendingOutUids.has(s.profile.uid)}
                              onConnect={() => handleConnect(s.profile.uid)}
                            />
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1 px-1">
                      <Sparkle size={12} className="text-[#7A7363]" weight="fill" />
                      <p className="text-[11px] font-semibold text-[#7A7363] uppercase tracking-wide">
                        Suggested for you
                      </p>
                    </div>
                    <AnimatePresence>
                      {otherMatches.map((s) => (
                        <SuggestionRow
                          key={s.profile.uid}
                          suggestion={s}
                          pending={pendingOutUids.has(s.profile.uid)}
                          onConnect={() => handleConnect(s.profile.uid)}
                        />
                      ))}
                    </AnimatePresence>
                  </>
                );
              })()}
            </motion.div>
          )
        ) : loading ? (
          <LoadingShell />
        ) : current.length === 0 ? (
          <EmptyState tab={tab} />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-2"
          >
            <AnimatePresence>
              {current.map((conn) => {
                if (!user?.id) return null;
                const other = otherUid(user.id, conn);
                const profile = profiles[other];
                return (
                  <PersonRow
                    key={conn.userA + conn.userB}
                    tab={tab}
                    uid={other}
                    profile={profile}
                    onAccept={() => handleAccept(other)}
                    onDecline={() => handleDecline(other)}
                    onCancel={() => handleCancel(other)}
                    onRemove={() => handleRemove(other)}
                    onMessage={() => handleMessage(other)}
                    messageBusy={openingChat === other}
                    createdAt={conn.createdAt}
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

export default ConnectionsPage;
