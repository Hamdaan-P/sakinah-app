/**
 * BlessingList — animated rows of blessings with DepthBadge.
 * Used for both "your" and "opponent's" lists in BattleResults.
 */

import { motion } from 'framer-motion';
import { DepthBadge } from '../DepthBadge';
import type { BlessingDepth } from '../../types/barka-labs.types';

interface Blessing {
  id?: string;
  text: string;
  depth?: string | null;
  score?: number | null;
}

interface Props {
  title: string;
  blessings: Blessing[];
  ownerKey: 'me' | 'them';
  baseDelay?: number;
}

export function BlessingList({ title, blessings, ownerKey, baseDelay = 0 }: Props) {
  const isMe = ownerKey === 'me';
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={baseDelay ? { delay: baseDelay } : undefined}
      className="space-y-2"
    >
      <h3 className="text-xs text-[#7F8A9A] uppercase tracking-wider">{title}</h3>
      {blessings.map((b, i) => (
        <motion.div
          key={b.id || i}
          initial={{ opacity: 0, x: isMe ? -10 : 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: baseDelay + 0.1 * i }}
          className="flex items-start justify-between gap-2 rounded-lg px-3 py-2"
          style={{
            backgroundColor: isMe ? 'rgba(215,181,106,0.06)' : 'rgba(74,158,255,0.06)',
            border: `1px solid ${isMe ? 'rgba(215,181,106,0.08)' : 'rgba(74,158,255,0.08)'}`,
          }}
        >
          <span className={`text-sm flex-1 ${isMe ? 'text-[#EBDCB8]' : 'text-[#D5DDEA]'}`}>{b.text}</span>
          {b.depth && (
            <DepthBadge depth={b.depth as BlessingDepth} score={b.score || 1} />
          )}
        </motion.div>
      ))}
    </motion.div>
  );
}
