/**
 * MushafImagePage
 * Renders a single printed-Mushaf page SCAN (photographic JPEG) on a plain
 * white page. The scans already carry their own white paper background, so we
 * don't tint or invert them (inverting would wreck the colored surah headers).
 *
 * Pure presentational — page navigation / audio / gestures live in
 * QuranMushafPage and MushafPageFlipper.
 */

import { useEffect, useRef, useState } from 'react';
import type { MushafTokens } from '../hooks/useMushafTheme';
import { mushafImageUrl, isScriptAvailable, type MushafScript } from '../data/mushafScripts';

interface Props {
  pageNumber: number;
  script: MushafScript;
  tokens: MushafTokens;
}

type Status = 'loading' | 'loaded' | 'error';

export function MushafImagePage({ pageNumber, script, tokens }: Props) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState<Status>('loading');
  const available = isScriptAvailable(script);
  const src = available ? mushafImageUrl(script, pageNumber) : '';

  // Handle the cached-image case where onLoad never fires: if the <img> is
  // already complete by the time the effect runs, resolve status from it.
  useEffect(() => {
    setStatus('loading');
    const img = imgRef.current;
    if (img && img.complete) {
      setStatus(img.naturalWidth > 0 ? 'loaded' : 'error');
    }
  }, [pageNumber, script]);

  const cardStyle = {
    maxWidth: 720,
    minHeight: 600,
    background: '#FFFFFF',
    boxShadow: `0 30px 60px -20px rgba(0,0,0,0.55), 0 0 0 1px ${tokens.frame}33`,
  } as const;

  if (!available) {
    return (
      <div
        className="mx-auto rounded-2xl overflow-hidden relative flex items-center justify-center text-center px-8"
        style={cardStyle}
      >
        <p className="text-sm leading-relaxed text-neutral-500">
          This script&rsquo;s pages are coming soon.
          <br />
          Madani (Hafs) is available now.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto rounded-2xl overflow-hidden relative" style={cardStyle}>
      {status === 'loading' && (
        <div className="absolute inset-0 flex items-center justify-center text-neutral-400">
          <div className="animate-pulse text-sm tracking-wide">Loading page {pageNumber}…</div>
        </div>
      )}

      {status === 'error' ? (
        <div className="flex items-center justify-center text-center px-8 text-neutral-500" style={{ minHeight: 600 }}>
          <p className="text-sm">Couldn&rsquo;t load this page. Check your connection and try again.</p>
        </div>
      ) : (
        <img
          ref={imgRef}
          src={src}
          alt={`Mushaf page ${pageNumber}`}
          draggable={false}
          onLoad={() => setStatus('loaded')}
          onError={() => setStatus('error')}
          className="w-full h-auto block select-none transition-opacity duration-300"
          style={{ opacity: status === 'loaded' ? 1 : 0 }}
        />
      )}
    </div>
  );
}
