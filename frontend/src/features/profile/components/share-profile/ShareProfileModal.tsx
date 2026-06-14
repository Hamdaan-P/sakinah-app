/**
 * ShareProfileModal — full-screen Lanyard preview with copy/share actions.
 * Extracted from ShareProfile so the inline card stays focused.
 */

import { lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareNetwork, Check, Copy, X } from '@phosphor-icons/react';

const Lanyard = lazy(() => import('../lanyard/Lanyard'));

interface Props {
  open: boolean;
  onClose: () => void;
  userName: string;
  publicUrl: string;
  copied: boolean;
  onCopy: () => void;
  onShare: () => void;
}

export function ShareProfileModal({ open, onClose, userName, publicUrl, copied, onCopy, onShare }: Props) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md px-4 overflow-y-auto"
          onClick={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-[360px] relative"
          >
            <button
              onClick={onClose}
              className="absolute top-0 right-0 p-2 rounded-full bg-[#0F141F]/80 text-[#7A7363] hover:text-[#F5E8C7] transition-colors z-30"
            >
              <X size={16} />
            </button>

            {/* 3D hanging lanyard — drag to swing. Card face is a live canvas texture with the user's QR */}
            <div style={{ height: '520px', width: '100%' }}>
              <Suspense
                fallback={
                  <div className="h-full flex items-center justify-center text-[#5C5749] text-xs">
                    Loading 3D card…
                  </div>
                }
              >
                <Lanyard
                  position={[0, 0, 20]}
                  gravity={[0, -40, 0]}
                  userName={userName}
                  publicUrl={publicUrl}
                  avatarInitial={userName.charAt(0).toUpperCase()}
                />
              </Suspense>
            </div>

            {/* URL + action buttons below */}
            <div
              className="mt-4 rounded-2xl p-4"
              style={{
                background: 'linear-gradient(145deg, rgba(36,50,70,0.9), rgba(10,14,22,0.95))',
                border: '1px solid rgba(212,168,83,0.15)',
              }}
            >
              <p className="text-[#5C5749] text-center text-[10px] mb-3 break-all px-2">{publicUrl}</p>
              <div className="flex gap-2">
              <button
                onClick={onCopy}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 transition-all"
                style={{
                  background: copied ? 'rgba(42,157,111,0.15)' : 'rgba(212,168,83,0.1)',
                  border: `1px solid ${copied ? 'rgba(42,157,111,0.3)' : 'rgba(212,168,83,0.25)'}`,
                  color: copied ? '#2A9D6F' : '#D4A853',
                }}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
              <button
                onClick={onShare}
                className="flex-1 py-2.5 rounded-xl text-[13px] font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{
                  background: 'linear-gradient(90deg, #D4A853, #E8C97A)',
                  color: '#0A0E16',
                }}
              >
                <ShareNetwork size={14} weight="bold" />
                Share
              </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
