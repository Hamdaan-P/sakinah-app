import type { CSSProperties } from 'react';

interface Props {
  number: string;
  color: string;
  size?: number;
  glow?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  title?: string;
}

/**
 * Traditional Mushaf 8-pointed-star ayah marker. Two overlapping squares
 * make the star; the Arabic numeral sits in the centre.
 */
export function AyahOrnament({ number, color, size = 28, glow, onClick, onDoubleClick, title }: Props) {
  const style: CSSProperties = {
    width: size,
    height: size,
    color,
    cursor: onClick ? 'pointer' : 'default',
    filter: glow ? `drop-shadow(0 0 6px ${color})` : undefined,
    transition: 'filter 200ms ease',
  };

  return (
    <span
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      title={title}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      className="inline-flex items-center justify-center align-middle mx-1"
      style={style}
    >
      <svg viewBox="0 0 40 40" width={size} height={size} aria-hidden="true">
        {/* Outer 8-pointed star = two rotated squares */}
        <g fill="none" stroke="currentColor" strokeWidth="1.4">
          <rect x="6" y="6" width="28" height="28" />
          <rect x="6" y="6" width="28" height="28" transform="rotate(45 20 20)" />
        </g>
        {/* Inner circle for the numeral */}
        <circle cx="20" cy="20" r="9" fill="currentColor" opacity="0.08" />
        <circle cx="20" cy="20" r="9" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.4" />
        <text
          x="20"
          y="24.5"
          textAnchor="middle"
          fontSize="11"
          fontFamily="'Amiri', 'KFGQPC Hafs', serif"
          fill="currentColor"
          fontWeight="600"
        >
          {number}
        </text>
      </svg>
    </span>
  );
}
