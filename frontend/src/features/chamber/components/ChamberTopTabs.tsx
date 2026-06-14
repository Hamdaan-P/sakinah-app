/**
 * Top pill tabs for ChamberV2 page. Phase 5 split.
 */

import { motion } from 'framer-motion';
import {
  Buildings,
  UsersThree,
  ShareNetwork,
  TrendUp,
  Graph,
  ProjectorScreen,
} from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import type { PhosphorIcon, Tab } from '../_types';

interface Props {
  activeTab: Tab;
  onChangeTab: (t: Tab) => void;
}

const TABS: Array<{ id: Tab; label: string; icon: PhosphorIcon }> = [
  { id: 'home', label: 'Home', icon: Buildings },
  { id: 'members', label: 'Members', icon: UsersThree },
  { id: 'referrals', label: 'Referrals', icon: ShareNetwork },
  { id: 'analytics', label: 'Analytics', icon: TrendUp },
  { id: 'networking', label: 'Networking', icon: Graph },
  { id: 'presentations', label: 'Presentations', icon: ProjectorScreen },
];

export function ChamberTopTabs({ activeTab, onChangeTab }: Props) {
  return (
    <div
      style={{
        background: COLORS.navy.darker,
        borderBottom: `1px solid ${COLORS.border}`,
        padding: '16px 32px',
        display: 'flex',
        gap: '12px',
        overflowX: 'auto',
      }}
    >
      {TABS.map((tab) => (
        <motion.button
          key={tab.id}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => onChangeTab(tab.id)}
          style={{
            padding: '12px 24px',
            background: activeTab === tab.id ? COLORS.gold.base : 'transparent',
            border: `1px solid ${activeTab === tab.id ? COLORS.gold.base : COLORS.border}`,
            borderRadius: '24px',
            color: activeTab === tab.id ? COLORS.navy.darkest : COLORS.text.secondary,
            fontSize: '14px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            whiteSpace: 'nowrap',
          }}
        >
          <tab.icon size={18} />
          {tab.label}
        </motion.button>
      ))}
    </div>
  );
}
