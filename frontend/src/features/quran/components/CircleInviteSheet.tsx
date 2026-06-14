/**
 * CircleInviteSheet
 *
 * Bottom sheet with two ways to bring people into a Hifz Circle:
 *  - Pick from your existing connections (writes circle_invites docs)
 *  - Share a deep link that lands on /quran/hifz/circles/join?code=XXX
 */

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Link as LinkIcon, Users, Spinner } from '@phosphor-icons/react';
import { auth } from '@/config/firebase.config';
import { listConnections, otherUid } from '@/features/connections/services/connectionService';
import { getPublicProfileByUid } from '@/features/public-profile/services/publicProfileService';
import { sendInvite } from '../services/hifzCirclesService';
import { ConnectionsList, type ConnRow } from './circle-invite/ConnectionsList';
import { LinkPanel } from './circle-invite/LinkPanel';

interface Props {
  open: boolean;
  circleId: string;
  circleName: string;
  onClose: () => void;
}

export function CircleInviteSheet({ open, circleId, circleName, onClose }: Props) {
  const [tab, setTab] = useState<'connections' | 'link'>('connections');
  const [connections, setConnections] = useState<ConnRow[] | null>(null);
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const [sending, setSending] = useState(false);
  const [sentCount, setSentCount] = useState(0);
  const [copied, setCopied] = useState(false);

  const me = auth.currentUser?.uid ?? '';
  const deepLink = useMemo(() => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://app.zaryah.app';
    return `${origin}/quran/hifz/circles/join?code=${circleId}`;
  }, [circleId]);

  useEffect(() => {
    if (!open || !me) return;
    setPicked(new Set());
    setSentCount(0);
    listConnections(me)
      .then(async (raw) => {
        const uids = raw.map((c) => otherUid(me, c));
        const profiles = await Promise.all(uids.map((u) => getPublicProfileByUid(u).catch(() => null)));
        const rows: ConnRow[] = uids.map((u, i) => {
          const p = profiles[i];
          return {
            uid: u,
            name: p?.displayName ?? p?.slug ?? u.slice(0, 8),
            photoUrl: p?.photoUrl ?? null,
          };
        });
        rows.sort((a, b) => a.name.localeCompare(b.name));
        setConnections(rows);
      })
      .catch(() => setConnections([]));
  }, [open, me]);

  const togglePick = (uid: string) => {
    setPicked((prev) => {
      const next = new Set(prev);
      if (next.has(uid)) next.delete(uid);
      else next.add(uid);
      return next;
    });
  };

  const handleSendInvites = async () => {
    if (picked.size === 0) return;
    setSending(true);
    let success = 0;
    for (const uid of picked) {
      try {
        await sendInvite(circleId, circleName, uid);
        success++;
      } catch {
        // continue
      }
    }
    setSentCount(success);
    setSending(false);
    setPicked(new Set());
    setTimeout(() => {
      setSentCount(0);
      onClose();
    }, 1400);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(deepLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // ignore
    }
  };

  const handleShareLink = async () => {
    const text = `Join my Hifz Circle "${circleName}" on ZaryahPlus: ${deepLink}`;
    if (navigator.share) {
      try { await navigator.share({ text, url: deepLink, title: circleName }); return; } catch { /* cancelled */ }
    }
    handleCopyLink();
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/55 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed bottom-0 inset-x-0 z-50 rounded-t-3xl bg-[#0A0E16] text-white shadow-2xl pb-safe"
            style={{ maxHeight: '82vh', display: 'flex', flexDirection: 'column' }}
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
          >
            <div className="pt-3 pb-1 flex justify-center">
              <div className="h-1 w-10 rounded-full bg-white/15" />
            </div>

            <div className="px-5 pt-1 pb-3 flex items-center justify-between">
              <h3 className="text-base font-bold">Invite people</h3>
              <button onClick={onClose} className="p-1.5 rounded-full bg-white/5 hover:bg-white/10" aria-label="Close">
                <X size={16} />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-4 pb-3 flex gap-2">
              <TabBtn icon={<Users size={14} weight="fill" />} label="From connections" active={tab === 'connections'} onClick={() => setTab('connections')} />
              <TabBtn icon={<LinkIcon size={14} weight="fill" />} label="Share link" active={tab === 'link'} onClick={() => setTab('link')} />
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-6">
              {tab === 'connections' && (
                <ConnectionsList connections={connections} picked={picked} togglePick={togglePick} />
              )}

              {tab === 'link' && (
                <LinkPanel deepLink={deepLink} copied={copied} onCopy={handleCopyLink} onShare={handleShareLink} />
              )}
            </div>

            {tab === 'connections' && connections && connections.length > 0 && (
              <div className="px-4 pb-4 pt-2 border-t border-white/8">
                <button
                  disabled={picked.size === 0 || sending}
                  onClick={handleSendInvites}
                  className="w-full py-3 rounded-xl bg-[#D4A853] text-[#0A0E16] text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sending && <Spinner size={14} className="animate-spin" />}
                  {sentCount > 0
                    ? `Sent ${sentCount} invite${sentCount === 1 ? '' : 's'} ✓`
                    : `Invite ${picked.size || ''} ${picked.size === 1 ? 'person' : 'people'}`}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function TabBtn({
  icon, label, active, onClick,
}: { icon: React.ReactNode; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
      style={{
        background: active ? '#D4A853' : 'rgba(255,255,255,0.05)',
        color: active ? '#1A1208' : 'rgba(255,255,255,0.85)',
        border: active ? '1px solid #D4A853' : '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {icon}
      {label}
    </button>
  );
}
