/**
 * InviteCta — share-the-app banner at the bottom of CommunityScreen.
 */

import { Globe, Check, ShareNetwork } from '@phosphor-icons/react';
import { C } from '../../barka-labs.constants';

interface InviteCtaProps {
  copied: boolean;
  onShare: () => void;
}

export function InviteCta({ copied, onShare }: InviteCtaProps) {
  return (
    <div
      className="rounded-2xl p-5 text-center"
      style={{
        background: 'linear-gradient(135deg, rgba(215,181,106,0.08) 0%, rgba(184,137,58,0.04) 100%)',
        border: '1px solid rgba(215,181,106,0.2)',
      }}
    >
      <Globe size={32} weight="duotone" className="mx-auto mb-3" style={{ color: C.gold, opacity: 0.6 }} />
      <p className="text-base font-bold mb-1" style={{ fontFamily: 'Cormorant Garamond, serif', color: C.t1 }}>
        Grow the Ummah's Gratitude
      </p>
      <p className="text-xs mb-4 max-w-xs mx-auto" style={{ color: C.t3 }}>
        Every friend you invite earns you both 40 DNZ. Let's build the most grateful community on earth.
      </p>
      <button
        onClick={onShare}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all hover:shadow-xl"
        style={{
          background: `linear-gradient(135deg, ${C.gold}, ${C.goldD})`,
          color: '#1E293A',
          boxShadow: '0 6px 24px rgba(212,168,83,0.3)',
        }}
      >
        {copied ? <><Check size={16} weight="bold" /> Copied!</> : <><ShareNetwork size={16} weight="bold" /> Share Invite Link</>}
      </button>
    </div>
  );
}
