/**
 * NudgeModal — full-screen modal that lets a user send an encouragement
 * message to an inactive buddy.
 */

import { getDemoDisplayFont } from '@/i18n';
import { PaperPlaneTilt } from '@phosphor-icons/react';
import { C } from '../../barka-labs.constants';

interface NudgeModalProps {
  nudgeTarget: string;
  nudgeMessage: string;
  setNudgeMessage: (m: string) => void;
  setNudgeTarget: (n: string | null) => void;
  onSend: () => void;
}

export function NudgeModal({ nudgeTarget, nudgeMessage, setNudgeMessage, setNudgeTarget, onSend }: NudgeModalProps) {
  const displayFont = getDemoDisplayFont();

  return (
    <div
      role="button"
      tabIndex={-1}
      aria-label="Close modal"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      onClick={() => setNudgeTarget(null)}
      onKeyDown={(e) => { if (e.key === 'Escape') { e.preventDefault(); setNudgeTarget(null); } }}
    >
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions -- stopPropagation wrapper; inner controls handle their own keyboard events */}
      <div
        className="relative w-full max-w-md rounded-2xl p-6"
        style={{ background: '#243246', border: '1px solid rgba(215,181,106,0.25)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full flex items-center justify-center text-base font-bold" style={{ background: 'rgba(224,122,107,0.15)', color: '#E07A6B' }}>
            <PaperPlaneTilt size={20} weight="fill" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#EBDCB8]" style={{ fontFamily: displayFont }}>
              Nudge {nudgeTarget}
            </h3>
            <p className="text-xs text-[#A7B1C0]">Edit the message or send as is</p>
          </div>
        </div>

        <textarea
          value={nudgeMessage}
          onChange={(e) => setNudgeMessage(e.target.value)}
          rows={4}
          className="w-full rounded-xl px-4 py-3 text-sm text-[#EBDCB8] placeholder-[#7F8A9A] resize-none focus:outline-none focus:ring-1 focus:ring-[rgba(215,181,106,0.4)]"
          style={{ background: 'rgba(30,41,58,0.8)', border: '1px solid rgba(215,181,106,0.15)' }}
        />

        <div className="flex items-center gap-3 mt-4">
          <button
            onClick={() => setNudgeTarget(null)}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium text-[#D5DDEA] transition-colors hover:bg-[rgba(255,255,255,0.05)]"
            style={{ border: '1px solid rgba(215,181,106,0.15)' }}
          >
            Cancel
          </button>
          <button
            onClick={onSend}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all hover:shadow-lg"
            style={{
              background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
              color: '#2C3C55',
              boxShadow: '0 4px 20px rgba(212,168,83,0.3)',
            }}
          >
            <PaperPlaneTilt size={16} weight="fill" /> Send Nudge
          </button>
        </div>
      </div>
    </div>
  );
}
