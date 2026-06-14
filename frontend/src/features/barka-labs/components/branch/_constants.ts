/**
 * BranchView constants — leaf colour palette per blessing depth + leaf size.
 */

import type { BlessingDepth } from '../../types/barka-labs.types';

export const LEAF_COLORS: Record<BlessingDepth, {
  bg1: string; bg2: string; border: string; vein: string; text: string; badge: string; glow: string;
}> = {
  profound: {
    bg1: '#D4A843', bg2: '#B8922E', border: '#C49A30', vein: 'rgba(255,255,255,0.15)',
    text: '#3A2800', badge: '#7A5A10', glow: 'rgba(215,181,106,0.35)',
  },
  thoughtful: {
    bg1: '#1B5E20', bg2: '#0D3B13', border: '#2E7D32', vein: 'rgba(255,255,255,0.1)',
    text: '#C8E6C9', badge: '#81C784', glow: 'rgba(27,94,32,0.3)',
  },
  common: {
    bg1: '#8FBF72', bg2: '#6B9E50', border: '#7AAE60', vein: 'rgba(255,255,255,0.1)',
    text: '#1A3A10', badge: '#4A7A38', glow: 'rgba(143,191,114,0.15)',
  },
};

// Leaf dimensions
export const LEAF_W = 140;
export const LEAF_H = 80;
