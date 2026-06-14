/**
 * ChamberV2 Home tab. Phase 5 split.
 */

import { motion } from 'framer-motion';
import {
  Buildings,
  UsersThree,
  ShareNetwork,
  Graph,
  TrendUp,
  ProjectorScreen,
  CaretRight,
} from '@phosphor-icons/react';
import { COLORS } from '../_constants';
import { ChamberHomeHighlights } from './ChamberHomeHighlights';
import type { Tab } from '../_types';

interface Props {
  onChangeTab: (tab: Tab) => void;
}

const CARDS = [
  {
    icon: UsersThree,
    title: 'Member Directory',
    desc: '248 verified members across 13 industries',
    tab: 'members' as Tab,
    gradient: 'linear-gradient(135deg, #D4A853 0%, #E8C97A 100%)',
  },
  {
    icon: ShareNetwork,
    title: 'Business Referrals',
    desc: 'Share opportunities and grow together',
    tab: 'referrals' as Tab,
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #9333EA 100%)',
  },
  {
    icon: Graph,
    title: 'Networking Hub',
    desc: '6 upcoming sessions and events',
    tab: 'networking' as Tab,
    gradient: 'linear-gradient(135deg, #059669 0%, #10B981 100%)',
  },
  {
    icon: TrendUp,
    title: 'Chamber Analytics',
    desc: 'Track growth and engagement metrics',
    tab: 'analytics' as Tab,
    gradient: 'linear-gradient(135deg, #0284C7 0%, #0EA5E9 100%)',
  },
  {
    icon: ProjectorScreen,
    title: 'Presentation Center',
    desc: '47 decks with 12.5K total views',
    tab: 'presentations' as Tab,
    gradient: 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)',
  },
];

export function ChamberHomeTab({ onChangeTab }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{ padding: '32px' }}
    >
      <div style={{ marginBottom: '48px', textAlign: 'center' }}>
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '20px',
            background: `linear-gradient(135deg, ${COLORS.gold.base} 0%, ${COLORS.gold.light} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
          }}
        >
          <Buildings size={40} color={COLORS.navy.darkest} />
        </div>
        <h1 style={{ fontSize: '36px', fontWeight: '700', color: COLORS.text.primary, marginBottom: '12px' }}>
          Chamber of Commerce
        </h1>
        <p style={{ fontSize: '18px', color: COLORS.text.secondary }}>
          Connect, Collaborate, Grow
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '24px',
          marginBottom: '48px',
        }}
      >
        {CARDS.map((card, idx) => (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ y: -4 }}
            onClick={() => onChangeTab(card.tab)}
            style={{
              background: COLORS.navy.darker,
              borderRadius: '16px',
              padding: '24px',
              cursor: 'pointer',
              border: `1px solid ${COLORS.border}`,
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '12px',
                background: card.gradient,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <card.icon size={28} color="#FFF" />
            </div>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: COLORS.text.primary, marginBottom: '8px' }}>
              {card.title}
            </h3>
            <p style={{ fontSize: '14px', color: COLORS.text.muted, lineHeight: '1.5' }}>
              {card.desc}
            </p>
            <CaretRight
              size={20}
              color={COLORS.text.muted}
              style={{ position: 'absolute', top: '24px', right: '24px' }}
            />
          </motion.div>
        ))}
      </div>

      <ChamberHomeHighlights />
    </motion.div>
  );
}
