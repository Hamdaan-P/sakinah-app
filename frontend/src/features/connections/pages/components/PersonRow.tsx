/**
 * Single connection row used in Sent / Received / Connected tabs.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChatCircleDots, Check, UserMinus, X } from '@phosphor-icons/react';
import type { PublicProfile } from '@/features/public-profile/types/public-profile.types';
import { Avatar, IconBtn } from './_primitives';
import { timeAgo } from './_helpers';

export type RowMode = 'received' | 'sent' | 'connected';

export function PersonRow({
  tab,
  profile,
  uid,
  onAccept,
  onDecline,
  onCancel,
  onRemove,
  onMessage,
  messageBusy,
  createdAt,
}: {
  tab: RowMode;
  uid: string;
  profile: PublicProfile | null | undefined;
  onAccept: () => void;
  onDecline: () => void;
  onCancel: () => void;
  onRemove: () => void;
  onMessage: () => void;
  messageBusy: boolean;
  createdAt: number;
}) {
  const name = profile?.displayName || profile?.fullName || 'ZaryahPlus Member';
  const href = profile?.slug ? `/@${profile.slug}` : `/@${uid}`;
  const meta = [profile?.profession, profile?.location].filter(Boolean).join(' · ');

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -8 }}
      className="flex items-center gap-3 p-3.5 rounded-2xl transition-all hover:border-[rgba(212,168,83,0.28)]"
      style={{
        background: 'linear-gradient(180deg, rgba(36,50,70,0.5), rgba(15,23,36,0.7))',
        border: '1px solid rgba(212,168,83,0.12)',
        boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
      }}
    >
      <Link to={href} className="flex items-center gap-3 flex-1 min-w-0">
        <Avatar name={name} photoUrl={profile?.photoUrl} size={48} />
        <div className="flex-1 min-w-0">
          <p className="text-[#F5E8C7] text-[14px] font-semibold truncate leading-tight">{name}</p>
          {meta && <p className="text-[#7A7363] text-[11px] truncate mt-0.5">{meta}</p>}
          <p className="text-[#5C5749] text-[10px] truncate mt-0.5">
            {profile?.archetype ? `${profile.archetype} · ` : ''}
            {tab === 'connected' ? 'Connected' : timeAgo(createdAt)}
          </p>
        </div>
      </Link>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        {tab === 'received' && (
          <>
            <IconBtn onClick={onAccept} label="Accept" tone="success">
              <Check size={15} weight="bold" />
            </IconBtn>
            <IconBtn onClick={onDecline} label="Decline" tone="muted">
              <X size={14} />
            </IconBtn>
          </>
        )}
        {tab === 'sent' && (
          <IconBtn onClick={onCancel} label="Cancel" tone="muted">
            <X size={14} />
          </IconBtn>
        )}
        {tab === 'connected' && (
          <>
            <IconBtn onClick={onMessage} label={messageBusy ? 'Opening…' : 'Message'} tone="primary">
              <ChatCircleDots size={15} weight="fill" />
            </IconBtn>
            <IconBtn onClick={onRemove} label="Remove" tone="muted">
              <UserMinus size={14} />
            </IconBtn>
          </>
        )}
      </div>
    </motion.div>
  );
}
