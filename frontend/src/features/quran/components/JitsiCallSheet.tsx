/**
 * JitsiCallSheet
 *
 * Full-screen sheet that joins the per-circle Jitsi Meet room.
 *  - Web: embeds Jitsi in an <iframe>.
 *  - Native (Capacitor): opens the room URL via @capacitor/browser, which
 *    presents an in-app browser sheet that can request camera/mic correctly
 *    (Jitsi inside an unsigned WebView misses some permission paths).
 *
 * The host's "End call" tap closes the sheet AND clears the Firestore flag
 * so other members see the LIVE pill go away. Non-host members tapping the
 * X just leaves the call (the room stays open).
 */

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, VideoCamera, Phone } from '@phosphor-icons/react';
import { isNative } from '@/lib/native';
import { jitsiRoomUrl, endCall } from '../services/hifzCirclesService';

interface Props {
  circleId: string;
  displayName: string;
  isHost: boolean;
  onClose: () => void;
}

export function JitsiCallSheet({ circleId, displayName, isHost, onClose }: Props) {
  const url = jitsiRoomUrl(circleId, displayName);

  useEffect(() => {
    let cancelled = false;
    if (isNative()) {
      // Open Jitsi in the in-app browser. When it returns, treat the dismissal
      // as a "leave call" event.
      (async () => {
        try {
          const { Browser } = await import('@capacitor/browser');
          await Browser.open({ url, presentationStyle: 'fullscreen', windowName: '_self' });
          const sub = await Browser.addListener('browserFinished', () => {
            if (!cancelled) onClose();
          });
          return () => { void sub.remove(); };
        } catch {
          // Fall through — sheet will just show the "Open in browser" CTA.
        }
      })();
    }
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  const handleEnd = async () => {
    if (isHost) {
      try {
        await endCall(circleId);
      } catch {
        // ignore
      }
    }
    if (isNative()) {
      try {
        const { Browser } = await import('@capacitor/browser');
        await Browser.close();
      } catch {
        // ignore
      }
    }
    onClose();
  };

  // On native we hand off to Browser.open, so this sheet only briefly shows
  // a backdrop while the in-app browser slides over. On web we render the
  // full Jitsi iframe.
  if (isNative()) {
    return (
      <motion.div
        className="fixed inset-0 z-[80] flex flex-col items-center justify-center text-white"
        style={{ background: 'rgba(0,0,0,0.92)' }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <VideoCamera size={48} weight="duotone" className="text-[#D4A853] mb-4 animate-pulse" />
        <p className="text-sm tracking-wide">Opening live call…</p>
        <button
          onClick={handleEnd}
          className="mt-6 px-5 py-2 rounded-xl bg-red-500/20 border border-red-500/40 text-red-200 text-sm flex items-center gap-2"
        >
          <Phone size={14} weight="fill" /> {isHost ? 'End call' : 'Leave'}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex flex-col"
      style={{ background: '#000' }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="flex items-center justify-between px-4 py-2 bg-[#0A0E16] border-b border-white/10">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-xs font-semibold text-white tracking-wide">LIVE · Circle {circleId.toUpperCase()}</span>
        </div>
        <button
          onClick={handleEnd}
          className="px-3 py-1.5 rounded-lg bg-red-500/20 border border-red-500/40 text-red-200 text-xs flex items-center gap-1.5"
        >
          <X size={14} weight="bold" /> {isHost ? 'End call' : 'Leave'}
        </button>
      </div>
      <iframe
        src={url}
        title="Hifz Circle live call"
        allow="camera; microphone; display-capture; autoplay; clipboard-write"
        className="flex-1 border-0"
      />
    </motion.div>
  );
}
