/**
 * TajweedText
 * Renders a tajweed-annotated Arabic string with colored rule spans and
 * an optional on-hover tooltip. Graceful fallback to plain text if no HTML.
 */

import { useMemo, useState } from 'react';
import { parseTajweed, getRuleColor, getRuleLabel, TAJWEED_RULES } from '../services/tajweedRenderer';

interface Props {
  /** Raw HTML from `text_uthmani_tajweed` — may be null/empty */
  html?: string | null;
  /** Fallback plain text when html is unavailable */
  fallback: string;
  className?: string;
  fontSize?: number;   // px
  lineHeight?: number; // unitless multiplier
}

export function TajweedText({ html, fallback, className, fontSize, lineHeight }: Props) {
  const segments = useMemo(() => (html ? parseTajweed(html) : []), [html]);
  const [hover, setHover] = useState<string | null>(null);

  if (segments.length === 0) {
    return (
      <p
        dir="rtl"
        className={className}
        style={{
          fontFamily: "'Amiri', 'KFGQPC Hafs', serif",
          fontSize,
          lineHeight,
        }}
      >
        {fallback}
      </p>
    );
  }

  return (
    <p
      dir="rtl"
      className={className}
      style={{
        fontFamily: "'Amiri', 'KFGQPC Hafs', serif",
        fontSize,
        lineHeight,
      }}
    >
      {segments.map((seg, i) => {
        if (!seg.rule) return <span key={i}>{seg.text}</span>;
        const color = getRuleColor(seg.rule);
        return (
          <span
            key={i}
            style={{ color }}
            title={getRuleLabel(seg.rule)}
            onMouseEnter={() => setHover(seg.rule)}
            onMouseLeave={() => setHover(null)}
            className="cursor-help"
          >
            {seg.text}
          </span>
        );
      })}
      {hover && TAJWEED_RULES[hover] && (
        <span className="sr-only">{TAJWEED_RULES[hover].description}</span>
      )}
    </p>
  );
}

/**
 * Small legend chip bar — used in the reader settings and tajweed-check test.
 */
export function TajweedLegend({ rules }: { rules?: string[] }) {
  const entries = rules && rules.length > 0
    ? rules.map((r) => [r, TAJWEED_RULES[r]] as const).filter(([, v]) => !!v)
    : (Object.entries(TAJWEED_RULES) as Array<[string, typeof TAJWEED_RULES[string]]>);
  return (
    <div className="flex flex-wrap gap-1.5">
      {entries.map(([key, rule]) => (
        <span
          key={key}
          className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10"
          title={rule.description}
        >
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rule.color }} />
          <span className="text-white/70">{rule.label}</span>
        </span>
      ))}
    </div>
  );
}
