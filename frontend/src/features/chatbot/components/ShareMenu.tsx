/**
 * ShareMenu
 * Popover dropdown with 3 share options: Instagram, Share to Apps, Download.
 * Matches the navy/gold design system and sits in the AI message action row.
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareNetwork, InstagramLogo, Export, DownloadSimple, Check, SpinnerGap, LinkSimple } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { shareToInstagram, shareToApps, downloadShareImage, type ShareResult } from '../utils/shareService';
import { createShareLink } from '../utils/shareLinkService';
import { useChatbotStore } from '../stores/chatbot.store';
import { getCompanionById } from '../types/chatbot.types';
import type { ShareCardData } from '../utils/chatImageGenerator';

type ShareStatus = 'idle' | 'generating' | 'done';

interface ShareMenuProps {
  shareData: ShareCardData;
  companionId?: string;
}

export function ShareMenu({ shareData, companionId }: ShareMenuProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<ShareStatus>('idle');
  const [resultMsg, setResultMsg] = useState('');
  const menuRef = useRef<HTMLDivElement>(null);

  // Click-outside-to-close
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  // Reset status when menu closes
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => { setStatus('idle'); setResultMsg(''); }, 200);
      return () => clearTimeout(timer);
    }
  }, [open]);

  const handleAction = useCallback(async (
    action: (data: ShareCardData) => Promise<ShareResult>,
    openInstagram?: boolean
  ) => {
    setStatus('generating');
    try {
      const result = await action(shareData);
      setResultMsg(result.message);
      setStatus('done');
      // For Instagram: open in new tab after download completes
      if (openInstagram && result.success) {
        setTimeout(() => {
          window.open('https://www.instagram.com/', '_blank');
        }, 1500);
      }
      setTimeout(() => setOpen(false), openInstagram ? 3000 : 1500);
    } catch {
      setStatus('idle');
    }
  }, [shareData]);

  const handleCopyLink = useCallback(async () => {
    setStatus('generating');
    try {
      const messages = useChatbotStore.getState().messages;
      const cId = companionId || useChatbotStore.getState().selectedCompanion.id;
      const comp = getCompanionById(cId);
      await createShareLink(messages, { id: comp.id, name: comp.name, icon: comp.icon });
      setResultMsg('Link copied!');
      setStatus('done');
      setTimeout(() => setOpen(false), 1500);
    } catch {
      setStatus('idle');
    }
  }, [companionId]);

  const options = [
    {
      label: 'Copy Link',
      icon: <LinkSimple size={14} />,
      description: 'Share full conversation as link',
      action: handleCopyLink,
    },
    {
      label: 'Instagram',
      icon: <InstagramLogo size={14} weight="fill" />,
      description: 'Download image & copy caption',
      action: () => handleAction(shareToInstagram, true),
    },
    {
      label: 'Share to Apps',
      icon: <Export size={14} />,
      description: 'Share via system share sheet',
      action: () => handleAction(shareToApps),
    },
    {
      label: 'Download Image',
      icon: <DownloadSimple size={14} />,
      description: 'Save branded PNG card',
      action: () => handleAction(downloadShareImage),
    },
  ];

  return (
    <div ref={menuRef} className="relative">
      {/* Toggle button — matches Copy button style */}
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'flex items-center gap-1 text-[10px] transition-colors',
          open ? 'text-[#D4A853]' : 'text-[#C9A85C] hover:text-[#D4A853]'
        )}
      >
        <ShareNetwork size={12} />
        <span>Share</span>
      </button>

      {/* Popover */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute bottom-full left-0 mb-2 z-50',
              'w-56 rounded-xl overflow-hidden',
              'bg-[#0A0E16] border border-[#D4A853]/20',
              'shadow-[0_8px_32px_rgba(0,0,0,0.4)]'
            )}
          >
            {/* Status feedback overlay */}
            {status !== 'idle' && (
              <div className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F141F]/80 border-b border-white/5">
                {status === 'generating' ? (
                  <>
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}>
                      <SpinnerGap size={14} className="text-[#D4A853]" />
                    </motion.div>
                    <span className="text-[11px] text-[#D4A853]">Generating image...</span>
                  </>
                ) : (
                  <>
                    <Check size={14} className="text-emerald-400" />
                    <span className="text-[11px] text-emerald-400">{resultMsg || 'Done!'}</span>
                  </>
                )}
              </div>
            )}

            {/* Options */}
            <div className="py-1">
              {options.map((opt) => (
                <button
                  key={opt.label}
                  onClick={opt.action}
                  disabled={status === 'generating'}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                    'hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                >
                  <span className="text-[#D4A853]">{opt.icon}</span>
                  <div className="min-w-0">
                    <p className="text-xs text-[#F5E8C7] font-medium">{opt.label}</p>
                    <p className="text-[10px] text-[#7A7363]">{opt.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
