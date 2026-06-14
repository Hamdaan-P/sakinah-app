/**
 * ShareCardBody — pure visual for QuranShareCard, captured into PNG.
 * Forwarded ref so the parent can pass it to html-to-image.
 */

import { forwardRef } from 'react';
import { Sparkle } from '@phosphor-icons/react';

interface Props {
  kicker: string;
  reference: string;
  arabic: string;
  translation?: string;
  note?: string;
}

export const ShareCardBody = forwardRef<HTMLDivElement, Props>(function ShareCardBody(
  { kicker, reference, arabic, translation, note },
  ref,
) {
  return (
    <div
      ref={ref}
      className="rounded-[24px] p-7 relative overflow-hidden mb-4"
      style={{
        background: 'linear-gradient(160deg, #0A0E16 0%, #0F141F 40%, #10151F 100%)',
        border: '1px solid rgba(212,168,83,0.25)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,168,83,0.1)',
      }}
    >
      {/* Gold corner glow */}
      <div
        className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
        style={{ background: 'radial-gradient(circle at top right, rgba(212,168,83,0.18), transparent 70%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-40 h-40 pointer-events-none"
        style={{ background: 'radial-gradient(circle at bottom left, rgba(212,168,83,0.12), transparent 70%)' }}
      />

      {/* Kicker */}
      <div className="flex items-center gap-2 mb-4 relative">
        <Sparkle size={14} weight="fill" style={{ color: '#D4A853' }} />
        <span style={{
          fontSize: 11, letterSpacing: 2, textTransform: 'uppercase',
          color: '#D4A853', fontWeight: 600,
        }}>
          {kicker}
        </span>
      </div>

      {/* Arabic */}
      <p
        dir="rtl"
        className="font-arabic text-right relative"
        style={{
          color: '#F5E8C7', fontSize: 26, lineHeight: 2,
          fontFamily: "'Amiri Quran', 'Amiri', serif",
          marginBottom: translation ? 16 : 24,
        }}
      >
        {arabic}
      </p>

      {/* Translation */}
      {translation && (
        <p
          className="relative"
          style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, lineHeight: 1.65, fontStyle: 'italic', marginBottom: note ? 12 : 24 }}
        >
          "{translation}"
        </p>
      )}

      {/* Optional note */}
      {note && (
        <div
          className="relative"
          style={{
            fontSize: 12, color: 'rgba(255,255,255,0.7)',
            borderLeft: '2px solid rgba(212,168,83,0.4)',
            paddingLeft: 10, marginBottom: 24, lineHeight: 1.55,
          }}
        >
          {note}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between relative pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <span style={{ fontSize: 11, color: 'rgba(212,168,83,0.85)', fontWeight: 600, letterSpacing: 0.5 }}>
          {reference}
        </span>
        <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', letterSpacing: 1.5, textTransform: 'uppercase' }}>
          ZaryahPlus
        </span>
      </div>
    </div>
  );
});
