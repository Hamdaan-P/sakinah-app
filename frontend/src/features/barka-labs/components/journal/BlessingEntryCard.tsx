/**
 * BlessingEntryCard — user's own blessing card in the journal, with hover
 * decompose/delete actions.
 */

import { TreeStructure, Trash } from '@phosphor-icons/react';
import { C, cardStyle } from '../../barka-labs.constants';
import type { Blessing } from '../../types/barka-labs.types';
import { depthColor, formatDateFull, formatTime, metacogLevel } from './_helpers';
import { ShareButton } from './ShareButton';

interface BlessingEntryCardProps {
  blessing: Blessing;
  isHovered: boolean;
  onHoverIn: () => void;
  onHoverOut: () => void;
  onDelete: (id: string) => void;
  onDecompose: (id: string) => void;
}

export function BlessingEntryCard({
  blessing: b, isHovered, onHoverIn, onHoverOut, onDelete, onDecompose,
}: BlessingEntryCardProps) {
  const dc = depthColor(b.depth);
  const d = new Date(b.created_at);

  return (
    <div
      onMouseEnter={onHoverIn}
      onMouseLeave={onHoverOut}
      className="rounded-2xl p-4 transition-colors cursor-default"
      style={{
        ...cardStyle,
        borderColor: isHovered ? '#D7B56A' : undefined,
      }}
    >
      {/* Card header */}
      <div className="flex justify-between items-center mb-2.5">
        <span className="text-[11px]" style={{ color: '#A7B1C0' }}>
          {formatDateFull(d)} &middot; {formatTime(d)}
        </span>
        <span
          className="inline-block px-2.5 py-0.5 rounded-xl text-[11px] font-semibold"
          style={{ background: dc.bg, color: dc.text }}
        >
          {b.score.toFixed(1)}
        </span>
      </div>

      {/* Body */}
      <p className="text-sm leading-relaxed italic mb-2.5 m-0" style={{ color: '#EBDCB8' }}>
        &ldquo;{b.text}&rdquo;
      </p>

      {/* Tags */}
      <div className="flex gap-1.5 flex-wrap mb-2.5">
        <span
          className="px-2.5 py-0.5 rounded-lg text-[10px] font-semibold capitalize"
          style={{ background: dc.bg, color: dc.text }}
        >
          {b.depth}
        </span>
      </div>

      {/* Footer */}
      <div className="flex justify-between items-center">
        <span className="text-[11px]" style={{ color: '#A7B1C0' }}>
          Metacog: {metacogLevel(b.score)}
        </span>
        <ShareButton text={b.text} depth={b.depth} score={b.score} />
      </div>

      {/* Action buttons (hover) */}
      <div
        className="flex gap-2 mt-2.5 transition-opacity"
        style={{
          opacity: isHovered ? 1 : 0,
          pointerEvents: isHovered ? 'auto' : 'none',
        }}
      >
        {b.decomposition && (
          <button
            onClick={() => onDecompose(b.id)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors"
            style={{
              background: 'rgba(215,181,106,0.12)',
              border: '1px solid rgba(215,181,106,0.2)',
              color: '#D7B56A',
            }}
          >
            <TreeStructure size={13} weight="bold" />
            Decompose
          </button>
        )}
        <button
          onClick={() => onDelete(b.id)}
          className="flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-semibold cursor-pointer transition-colors"
          style={{
            background: 'rgba(224,122,107,0.10)',
            border: '1px solid rgba(224,122,107,0.2)',
            color: C.rose,
          }}
        >
          <Trash size={13} weight="bold" />
          Delete
        </button>
      </div>
    </div>
  );
}
