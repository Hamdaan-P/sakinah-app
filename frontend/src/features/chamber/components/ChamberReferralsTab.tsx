/**
 * ChamberV2 Referrals tab. Phase 5 split.
 */

import { motion } from 'framer-motion';
import { Plus, PaperPlaneRight, Tray } from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import { mockReferrals } from '../_data';
import { NewReferralForm } from './NewReferralForm';
import { ReferralCard } from './ReferralCard';
import type { ReferralTab } from '../_types';

interface Props {
  referralTab: ReferralTab;
  onChangeSubTab: (t: ReferralTab) => void;
}

const SUB_TABS = [
  { id: 'new' as ReferralTab, label: 'New Referral', icon: Plus },
  { id: 'sent' as ReferralTab, label: 'Sent', icon: PaperPlaneRight },
  { id: 'received' as ReferralTab, label: 'Received', icon: Tray },
];

export function ChamberReferralsTab({ referralTab, onChangeSubTab }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{ padding: '32px' }}
    >
      <div style={{ display: 'flex', gap: '8px', marginBottom: '32px' }}>
        {SUB_TABS.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onChangeSubTab(tab.id)}
            style={{
              padding: '12px 24px',
              background: referralTab === tab.id ? COLORS.gold.base : COLORS.navy.dark,
              border: `1px solid ${referralTab === tab.id ? COLORS.gold.base : COLORS.border}`,
              borderRadius: '12px',
              color: referralTab === tab.id ? COLORS.navy.darkest : COLORS.text.secondary,
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <tab.icon size={18} />
            {tab.label}
          </motion.button>
        ))}
      </div>

      {referralTab === 'new' && <NewReferralForm />}

      {referralTab === 'sent' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {mockReferrals
            .filter((r) => r.fromMember === 'You')
            .map((referral, idx) => (
              <ReferralCard
                key={referral.id}
                referral={referral}
                idx={idx}
                partyLabel="To"
                partyValue={referral.toMember}
              />
            ))}
        </div>
      )}

      {referralTab === 'received' && (
        <div style={{ display: 'grid', gap: '16px' }}>
          {mockReferrals
            .filter((r) => r.toMember === 'You')
            .map((referral, idx) => (
              <ReferralCard
                key={referral.id}
                referral={referral}
                idx={idx}
                partyLabel="From"
                partyValue={referral.fromMember}
                showActions
              />
            ))}
        </div>
      )}
    </motion.div>
  );
}
