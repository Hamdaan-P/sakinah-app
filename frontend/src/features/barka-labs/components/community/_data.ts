/**
 * CommunityScreen static fixture data + small formatters.
 */

import {
  TrendUp, Fire, Lightning, Sword, Sparkle, HandHeart, Rocket, Eye,
} from '@phosphor-icons/react';
import type { BlessingDepth } from '../../types/barka-labs.types';

export function formatCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString();
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export const DEPTH_STYLES: Record<BlessingDepth, { bg: string; border: string; color: string; label: string }> = {
  common:     { bg: 'rgba(167,177,192,0.10)', border: 'rgba(167,177,192,0.20)', color: '#A7B1C0', label: 'Common' },
  thoughtful: { bg: 'rgba(58,191,173,0.10)',   border: 'rgba(58,191,173,0.20)',  color: '#3ABFAD', label: 'Thoughtful' },
  profound:   { bg: 'rgba(215,181,106,0.12)',   border: 'rgba(215,181,106,0.25)', color: '#D7B56A', label: 'Profound' },
};

export const DIMENSION_LABELS = ['Uniqueness', 'Depth', 'Specificity', 'Perspective'] as const;
export const DIMENSION_KEYS = ['uniqueness', 'depth_score', 'specificity', 'perspective'] as const;

export const INSPIRATION_WALL = [
  { text: 'Someone in Turkey just logged a Level 5 profound blessing', icon: Sparkle, color: '#8B7EC8', time: '1m ago' },
  { text: '3 people hit 100-day streaks today', icon: Fire, color: '#FF6B35', time: '8m ago' },
  { text: 'A new member in Egypt logged 12 blessings on their first day', icon: Rocket, color: '#3ABFAD', time: '14m ago' },
  { text: 'Someone\'s creativity score just jumped from 34 to 71 in one week', icon: TrendUp, color: '#2A9D6F', time: '22m ago' },
  { text: '7 people are doing the 1-Min Challenge right now', icon: Lightning, color: '#D7B56A', time: '30m ago' },
  { text: 'A father and daughter in Malaysia are both on 60+ day streaks', icon: HandHeart, color: '#E07A6B', time: '45m ago' },
  { text: 'Someone just won their 10th Blessing Battle in a row', icon: Sword, color: '#5B8DEF', time: '52m ago' },
  { text: 'The deepest blessing logged today scored 4.9 out of 5', icon: Eye, color: '#8B7EC8', time: '1h ago' },
];

export const RISE_CHALLENGE = {
  title: '10,000 Blessings This Week',
  desc: 'Can the ummah count 10,000 blessings together? Everyone earns 50 bonus DNZ when we hit the goal.',
  current: 7_432,
  goal: 10_000,
  contributors: 1_847,
  daysLeft: 3,
};

export const PODIUM_COLORS = ['#FFD700', '#C0C0C0', '#CD7F32'];
export const PODIUM_GLOW = ['rgba(255,215,0,0.15)', 'rgba(192,192,192,0.1)', 'rgba(205,127,50,0.1)'];
