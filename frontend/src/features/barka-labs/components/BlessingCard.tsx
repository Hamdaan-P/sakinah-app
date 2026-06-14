/**
 * Blessing Card — shows a single blessing with depth badge, AI reasoning, and decompose button
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash, CaretDown, CaretUp, TreeStructure } from '@phosphor-icons/react';
import { DepthBadge } from './DepthBadge';
import type { Blessing } from '../types/barka-labs.types';

interface BlessingCardProps {
  blessing: Blessing;
  index: number;
  onDelete?: (id: string) => void;
  onDecompose?: (id: string) => void;
  isNew?: boolean;
}

export function BlessingCard({
  blessing, index, onDelete, onDecompose, isNew = false,
}: BlessingCardProps) {
  const [expanded, setExpanded] = useState(false);
  const hasDecomposition = !!blessing.decomposition;

  const formattedDate = (() => {
    try {
      const d = new Date(blessing.created_at);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  })();

  return (
    <motion.div
      initial={isNew ? { scale: 0.9, opacity: 0, y: -20 } : { opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{
        type: isNew ? 'spring' : 'tween',
        damping: 20,
        stiffness: 300,
        delay: isNew ? 0 : index * 0.05,
      }}
      className="rounded-xl border p-4 group"
      style={{
        backgroundColor: 'rgba(36,50,70,0.4)',
        borderColor: blessing.depth === 'profound'
          ? 'rgba(215,181,106,0.3)'
          : 'rgba(215,181,106,0.1)',
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <p className="text-[#EBDCB8] text-sm leading-relaxed flex-1">
          {blessing.text}
        </p>
        <DepthBadge depth={blessing.depth} score={blessing.score} animate={isNew} />
      </div>

      {/* AI Reasoning (collapsible) */}
      {blessing.ai_reasoning && (
        <div className="mt-3">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-xs text-[#7F8A9A] hover:text-[#A7B1C0] transition-colors"
          >
            {expanded ? <CaretUp size={12} /> : <CaretDown size={12} />}
            AI Insight
          </button>
          {expanded && (
            <motion.p
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              className="mt-2 text-xs text-[#A7B1C0] italic leading-relaxed pl-3"
              style={{ borderLeft: '2px solid rgba(215,181,106,0.2)' }}
            >
              {blessing.ai_reasoning}
            </motion.p>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-[10px] text-[#7F8A9A]">{formattedDate}</span>

        <div className="flex items-center gap-2">
          {/* View Tree button — only for blessings that already have decomposition cached */}
          {hasDecomposition && onDecompose && (
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onDecompose(blessing.id)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-medium transition-all"
              style={{
                backgroundColor: 'rgba(215,181,106,0.15)',
                color: '#D7B56A',
              }}
            >
              <TreeStructure size={12} weight="duotone" />
              View Tree
            </motion.button>
          )}

          {/* Delete button */}
          {onDelete && (
            <button
              onClick={() => onDelete(blessing.id)}
              className="opacity-60 sm:opacity-0 sm:group-hover:opacity-60 hover:!opacity-100 transition-opacity text-[#7F8A9A] hover:text-red-400"
            >
              <Trash size={14} />
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
