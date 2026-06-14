/**
 * HalaqahShareSheet — bottom-sheet share dialog for any Halaqah event.
 * One-tap to WhatsApp, SMS, Twitter, email, or copy the link. Hosts use
 * this to recruit attendees in seconds.
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, ShareNetwork, Check, QrCode } from '@phosphor-icons/react';
import {
  buildInviteUrl,
  buildShareText,
  buildShortShareText,
  logShareEvent,
  type HalaqahShareableEvent,
} from '../services/halaqahShareService';
import { ChannelGrid } from './halaqah-share/ChannelGrid';

interface Props {
  open: boolean;
  onClose: () => void;
  event: HalaqahShareableEvent;
}

export function HalaqahShareSheet({ open, onClose, event }: Props) {
  const [url, setUrl] = useState('');
  const [text, setText] = useState('');
  const [shortText, setShortText] = useState('');
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    if (!open) return;
    const u = buildInviteUrl(event.id);
    setUrl(u);
    setText(buildShareText(event, u));
    setShortText(buildShortShareText(event, u));
  }, [open, event]);

  const fire = (channel: 'whatsapp' | 'sms' | 'twitter' | 'email' | 'native' | 'copy' | 'qr', action: () => void) => {
    void logShareEvent(event.id, channel);
    action();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* ignore */ }
  };

  const handleNative = async () => {
    if (!('share' in navigator)) {
      handleCopy();
      return;
    }
    try {
      await (navigator as Navigator).share({
        title: event.name,
        text,
        url,
      });
    } catch { /* user cancelled */ }
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="backdrop"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-end sm:items-center justify-center"
        onClick={onClose}
      >
        <motion.div
          initial={{ y: 60 }} animate={{ y: 0 }} exit={{ y: 60 }}
          transition={{ type: 'spring', damping: 24 }}
          className="w-full sm:max-w-md bg-[#0A0E16] border-t sm:border border-[#D4A853]/25 rounded-t-2xl sm:rounded-2xl p-5 pb-safe"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-1">
            <div>
              <h3 className="text-base font-semibold text-white">Share invite</h3>
              <p className="text-[11px] text-white/50">Auto-credit you for everyone who joins via your link.</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
            >
              <X size={14} className="text-white/70" />
            </button>
          </div>

          {/* Event preview */}
          <div className="rounded-xl bg-gradient-to-r from-[#D4A853]/8 to-[#0F141F]/30 border border-[#D4A853]/20 p-3 mt-4 mb-4">
            <p className="text-sm font-semibold text-white truncate">{event.name}</p>
            <p className="text-[11px] text-white/55">
              {event.date} · {event.startTime} · {event.venue}
            </p>
          </div>

          {/* Channel grid */}
          <ChannelGrid event={event} url={url} text={text} shortText={shortText} fire={fire} />

          {/* Native + copy + QR */}
          <div className="flex gap-2 mb-2">
            <button
              onClick={() => fire('native', handleNative)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#D4A853] text-[#0A0E16] text-sm font-semibold"
            >
              <ShareNetwork size={14} weight="bold" /> More
            </button>
            <button
              onClick={() => fire('copy', handleCopy)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/85 text-sm font-medium"
            >
              {copied ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy link'}
            </button>
            <button
              onClick={() => fire('qr', () => setShowQr((s) => !s))}
              className="px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white/85 text-sm font-medium flex items-center"
              aria-label="QR code"
            >
              <QrCode size={14} />
            </button>
          </div>

          {/* QR */}
          {showQr && (
            <motion.div
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              className="flex justify-center pt-3"
            >
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(url)}&color=D7B56A&bgcolor=1E293A`}
                alt="QR code"
                className="rounded-lg border border-[#D4A853]/30"
              />
            </motion.div>
          )}

          {/* Editable invite text */}
          <div className="mt-4">
            <p className="text-[10px] uppercase tracking-wide text-white/40 mb-1">Invite message</p>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              className="w-full bg-[#0F141F]/50 border border-white/10 rounded-lg p-2.5 text-xs text-white/80 leading-relaxed focus:outline-none focus:border-[#D4A853]/40 resize-none font-mono"
            />
            <p className="text-[10px] text-white/35 mt-1">
              Edits here apply to "More" share. WhatsApp/SMS use the live message above.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default HalaqahShareSheet;
