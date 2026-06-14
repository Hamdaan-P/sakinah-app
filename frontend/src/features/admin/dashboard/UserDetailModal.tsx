/**
 * User detail modal — full user profile view shown when a user row is clicked.
 *
 * Extracted from AdminPage.tsx.
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, ChatCircleDots, CaretDown } from '@phosphor-icons/react';
import type { UserDetail } from '../types/admin.types';
import { fmtDate, fmtDateTime, kycBadge } from './helpers';
import { ChatHistoryPanel } from './primitives';
import { RecoverEmailPanel } from './user-detail/RecoverEmailPanel';
import {
  BG, SURFACE, GOLD, GOLD_LIGHT, WHITE, TEXT_1, TEXT_2, TEXT_3, BORDER,
} from './constants';

export function UserDetailModal({ user, onClose }: { user: UserDetail; onClose: () => void }) {
  const [copied, setCopied] = useState('');
  const [showChat, setShowChat] = useState(false);
  const copy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 1500);
  };

  const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="mb-6">
      <h4 className="text-xs uppercase font-bold tracking-widest mb-3 pb-2 border-b" style={{ color: GOLD, borderColor: BORDER }}>{title}</h4>
      <div className="space-y-1">{children}</div>
    </div>
  );

  const Field = ({ label, value, copyable }: { label: string; value: string | number | null | undefined; copyable?: boolean }) => {
    if (value === null || value === undefined || value === '') return null;
    return (
      <div className="flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/5 group">
        <span className="text-sm font-medium" style={{ color: TEXT_2 }}>{label}</span>
        <span className="text-sm font-semibold flex items-center gap-2" style={{ color: WHITE }}>
          {String(value)}
          {copyable && (
            <button onClick={() => copy(String(value), label)} className="opacity-0 group-hover:opacity-100 transition-opacity">
              {copied === label ? <Check size={14} style={{ color: '#10B981' }} /> : <Copy size={14} style={{ color: TEXT_3 }} />}
            </button>
          )}
        </span>
      </div>
    );
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    >
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- modal backdrop; close button & Escape handled by parent modal pattern */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
      <motion.div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border"
        style={{ background: SURFACE, borderColor: BORDER }}
        initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b" style={{ background: SURFACE, borderColor: BORDER }}>
          <div className="flex items-center gap-4">
            {user.photo_url ? (
              <img src={user.photo_url} alt="" className="w-14 h-14 rounded-xl object-cover border-2" style={{ borderColor: GOLD }} />
            ) : (
              <div className="w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black" style={{ background: `${GOLD}20`, color: GOLD }}>
                {(user.full_name || user.email || '?')[0]?.toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="text-xl font-black" style={{ color: WHITE }}>{user.full_name || 'Unnamed'}</h3>
              <p className="text-sm font-medium" style={{ color: TEXT_3 }}>{user.email}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2.5 rounded-xl hover:bg-white/10 transition-colors">
            <X size={22} weight="bold" style={{ color: TEXT_2 }} />
          </button>
        </div>

        <div className="p-6">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            {kycBadge(user.kyc_tier)}
            {user.verified && <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-400">Verified</span>}
            {user.online && <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">Online</span>}
            {user.email_verified && <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300">Email Verified</span>}
            {user.profile_completed && <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300">Profile Complete</span>}
          </div>

          <Section title="Identity">
            <Field label="User ID" value={user.id} copyable />
            <Field label="Email" value={user.email} copyable />
            <Field label="Display Name" value={user.display_name} />
            <Field label="Gender" value={user.gender} />
            <Field label="Date of Birth" value={fmtDate(user.date_of_birth)} />
            <Field label="Country" value={user.country} />
            <Field label="City" value={user.city} />
            <Field label="Occupation" value={user.occupation} />
            <Field label="Title" value={user.title} />
            <Field label="Life Stage" value={user.life_stage} />
            <Field label="Auth Provider" value={user.auth_provider} />
            <Field label="Joined" value={fmtDateTime(user.created_at)} />
            <Field label="Last Seen" value={fmtDateTime(user.last_seen)} />
          </Section>

          <Section title="KYC Deep Profile">
            <Field label="KYC Tier" value={user.kyc_tier} />
            <Field label="KYC Status" value={user.kyc_status} />
            <Field label="Iman Level" value={user.iman_level != null ? `${user.iman_level}/100` : null} />
            <Field label="Primary Intent" value={user.intent_primary} />
            <Field label="Secondary Intents" value={user.intent_secondary?.join(', ')} />
            <Field label="Money Motivation" value={user.money_motivation} />
            <Field label="Crisis Instinct" value={user.crisis_instinct} />
            <Field label="Biggest Stress" value={user.biggest_stress} />
            <Field label="Stress Sharing" value={user.stress_sharing} />
            <Field label="Conversation Pref" value={user.conversation_pref} />
            <Field label="Advice Style" value={user.advice_style} />
            <Field label="Raya Help Goal" value={user.raya_help_goal} />
            <Field label="Tier 1 Completed" value={fmtDateTime(user.tier1_completed_at)} />
            <Field label="Deep KYC Completed" value={fmtDateTime(user.deep_kyc_completed_at)} />
          </Section>

          {user.deep_fields && Object.keys(user.deep_fields).length > 0 && (
            <Section title="Free-Text Responses">
              {Object.entries(user.deep_fields).map(([key, val]) => (
                <div key={key} className="py-3 px-4 rounded-xl mb-2" style={{ background: `${BG}` }}>
                  <p className="text-xs font-bold uppercase tracking-wide mb-1" style={{ color: GOLD_LIGHT }}>
                    {key.replace(/^deep_/, '').replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: TEXT_1 }}>{val}</p>
                </div>
              ))}
            </Section>
          )}

          <Section title="Networking">
            <Field label="Bio" value={user.bio} />
            <Field label="Tags" value={user.tags?.join(', ')} />
            <Field label="Interests" value={user.interests?.join(', ')} />
            <Field label="Connections" value={user.connections_count} />
          </Section>

          <Section title="DinarZ (DNZ)">
            <Field label="Current Balance" value={`${user.dnz_balance ?? 0} DNZ`} />
            <Field label="Lifetime Earned" value={`${user.dnz_lifetime ?? 0} DNZ`} />
          </Section>

          <Section title="Referral Info">
            <Field label="Referral Code" value={user.referral_code} copyable />
            <Field label="Referred By" value={user.referred_by_code} />
            <Field label="Successful Referrals" value={user.referrals_successful_count} />
            <Field label="Total Earned DNZ" value={user.referrals_total_earned_dnz} />
          </Section>

          {/* Account Recovery (Layer 3) */}
          <RecoverEmailPanel userId={user.id} currentEmail={user.email} />

          {/* Chat History */}
          <div className="mb-6">
            <button
              onClick={() => setShowChat(!showChat)}
              className="w-full flex items-center justify-between pb-2 border-b mb-3"
              style={{ borderColor: BORDER }}
            >
              <h4 className="text-xs uppercase font-bold tracking-widest flex items-center gap-2" style={{ color: GOLD }}>
                <ChatCircleDots size={16} weight="bold" />
                Chat History with Raya
              </h4>
              <CaretDown
                size={14}
                weight="bold"
                style={{ color: GOLD, transform: showChat ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
              />
            </button>
            {showChat && <ChatHistoryPanel userId={user.id} />}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
