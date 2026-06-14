/**
 * Share-link panel for CircleInviteSheet.
 */

import { Copy, ShareNetwork } from '@phosphor-icons/react';

interface Props {
  deepLink: string;
  copied: boolean;
  onCopy: () => void;
  onShare: () => void;
}

export function LinkPanel({ deepLink, copied, onCopy, onShare }: Props) {
  return (
    <div className="space-y-3 pt-1">
      <p className="text-[12px] text-white/55">
        Anyone with this link lands on the join page for your circle.
      </p>
      <div className="rounded-xl bg-white/5 border border-white/10 p-3 break-all text-[11px] font-mono text-[#F5E8C7]">
        {deepLink}
      </div>
      <div className="flex gap-2">
        <button
          onClick={onCopy}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm hover:bg-white/10"
        >
          <Copy size={14} /> {copied ? 'Copied!' : 'Copy link'}
        </button>
        <button
          onClick={onShare}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#D4A853] text-[#0A0E16] text-sm font-semibold hover:bg-[#E8C97A]"
        >
          <ShareNetwork size={14} weight="fill" /> Share
        </button>
      </div>
    </div>
  );
}
