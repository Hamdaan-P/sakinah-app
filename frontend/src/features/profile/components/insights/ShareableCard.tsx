/**
 * ShareableCard — screenshot-friendly profile card with a Download button
 * that exports the rendered DOM as PNG using html-to-image.
 */

import { useCallback, useRef, useState } from 'react';
import { Check, Download } from '@phosphor-icons/react';
import { toPng } from 'html-to-image';
import { PASCO_INFO } from '../_insightsConstants';

interface ShareableCardProps {
  name: string;
  archetype?: string;
  imanLevel?: number;
  topEmotions: string[];
  moodTrend: string;
  totalConversations: number;
  completeness: number;
  quote?: string;
}

export function ShareableCard({
  name, archetype, imanLevel, topEmotions, moodTrend,
  totalConversations, completeness, quote,
}: ShareableCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);

  const handleDownload = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 3,
        backgroundColor: '#0A0E16',
      });
      const link = document.createElement('a');
      link.download = `${name.replace(/\s+/g, '-').toLowerCase()}-zaryahplus-profile.png`;
      link.href = dataUrl;
      link.click();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error('Failed to export card:', e);
    }
  }, [name]);

  const pascoColor = archetype ? PASCO_INFO[archetype]?.color ?? '#D4A853' : '#D4A853';
  const pascoLabel = archetype ? PASCO_INFO[archetype]?.label ?? archetype : null;

  return (
    <div>
      {/* The actual card */}
      <div
        ref={cardRef}
        className="w-full max-w-[380px] mx-auto rounded-[20px] p-6 relative overflow-hidden"
        style={{
          background: 'linear-gradient(165deg, #0A0E16 0%, #0F141F 40%, #10151F 100%)',
          border: '1px solid rgba(212,168,83,0.2)',
        }}
      >
        {/* Gold corner glow */}
        <div
          className="absolute top-0 right-0 w-40 h-40 pointer-events-none"
          style={{ background: 'radial-gradient(circle at top right, rgba(212,168,83,0.08), transparent 70%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-32 h-32 pointer-events-none"
          style={{ background: 'radial-gradient(circle at bottom left, rgba(42,157,111,0.06), transparent 70%)' }}
        />

        {/* Header */}
        <div className="flex items-center gap-3 mb-5 relative z-10">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #D4A853, #B8943E)',
              boxShadow: '0 4px 16px rgba(212,168,83,0.3)',
            }}
          >
            <span className="text-[#0A0E16] text-[22px] font-bold" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {name.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <p className="text-[#F5E8C7] text-[18px] font-bold leading-tight" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {name}
            </p>
            {pascoLabel && (
              <p className="text-[12px] font-medium mt-0.5" style={{ color: pascoColor }}>
                {pascoLabel} Archetype
              </p>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mb-5 relative z-10">
          {imanLevel != null && (
            <div className="text-center rounded-xl py-2.5" style={{ background: 'rgba(10,14,22,0.7)' }}>
              <p className="text-[18px] font-bold text-[#D4A853]">{imanLevel}</p>
              <p className="text-[9px] text-[#5C5749] uppercase tracking-wider">Iman</p>
            </div>
          )}
          <div className="text-center rounded-xl py-2.5" style={{ background: 'rgba(10,14,22,0.7)' }}>
            <p className="text-[18px] font-bold text-[#E8C97A]">{totalConversations}</p>
            <p className="text-[9px] text-[#5C5749] uppercase tracking-wider">Chats</p>
          </div>
          <div className="text-center rounded-xl py-2.5" style={{ background: 'rgba(10,14,22,0.7)' }}>
            <p className="text-[18px] font-bold text-[#2A9D6F]">{completeness}%</p>
            <p className="text-[9px] text-[#5C5749] uppercase tracking-wider">Profile</p>
          </div>
        </div>

        {/* Top emotions */}
        {topEmotions.length > 0 && (
          <div className="mb-5 relative z-10">
            <p className="text-[#5C5749] text-[9px] uppercase tracking-wider mb-2">Top Emotions</p>
            <div className="flex flex-wrap gap-1.5">
              {topEmotions.slice(0, 4).map((e, i) => (
                <span
                  key={`${e}-${i}`}
                  className="px-2.5 py-1 rounded-full text-[11px] capitalize"
                  style={{ background: 'rgba(212,168,83,0.1)', border: '1px solid rgba(212,168,83,0.2)', color: '#D4A853' }}
                >
                  {e}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Mood trend */}
        {moodTrend !== 'unknown' && (
          <div className="flex items-center gap-2 mb-5 relative z-10">
            <div className="w-2 h-2 rounded-full" style={{
              background: moodTrend === 'improving' ? '#2A9D6F' : moodTrend === 'declining' ? '#ef4444' : '#D4A853',
            }} />
            <p className="text-[#7A7363] text-[12px]">
              Mood: <span className="text-[#F5E8C7] capitalize">{moodTrend}</span>
            </p>
          </div>
        )}

        {/* Quote */}
        {quote && (
          <div className="relative z-10 mb-4 pl-3" style={{ borderLeft: '2px solid rgba(212,168,83,0.25)' }}>
            <p className="text-[#C9C0A8] text-[12px] leading-relaxed italic line-clamp-2">"{quote}"</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between relative z-10 pt-3" style={{ borderTop: '1px solid rgba(212,168,83,0.1)' }}>
          <p className="text-[#5C5749] text-[9px]">ZaryahPlus Profile</p>
          <p className="text-[#D4A853] text-[9px] font-semibold">zaryahplus.com</p>
        </div>
      </div>

      {/* Download button */}
      <div className="flex justify-center mt-4">
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-[13px] font-medium transition-all hover:scale-[1.02] active:scale-[0.98]"
          style={{
            background: copied ? 'rgba(42,157,111,0.15)' : 'rgba(212,168,83,0.1)',
            border: `1px solid ${copied ? 'rgba(42,157,111,0.3)' : 'rgba(212,168,83,0.2)'}`,
            color: copied ? '#2A9D6F' : '#D4A853',
          }}
        >
          {copied ? <Check size={16} /> : <Download size={16} />}
          {copied ? 'Saved!' : 'Download Card'}
        </button>
      </div>
    </div>
  );
}
