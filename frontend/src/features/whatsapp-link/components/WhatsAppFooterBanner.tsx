/**
 * WhatsAppFooterBanner — small banner shown in the chatbot empty state
 * pointing users at the link flow.
 *
 * Hidden when:
 *  - the link-status query is loading (don't flash the CTA)
 *  - the user has already linked their WhatsApp (no value re-prompting)
 *  - the user has explicitly dismissed it (localStorage key)
 *
 * Visible otherwise. Single tap navigates to `/settings/whatsapp` —
 * the host page handles the actual mint + deep-link flow.
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WhatsappLogo, X } from '@phosphor-icons/react';
import { useLinkStatus } from '../hooks/useWhatsAppLink';

const DISMISS_KEY = 'zaryah_wa_banner_dismissed_v1';

function readDismissed(): boolean {
  try {
    return localStorage.getItem(DISMISS_KEY) === '1';
  } catch {
    return false;
  }
}

function setDismissed() {
  try {
    localStorage.setItem(DISMISS_KEY, '1');
  } catch {
    /* best-effort */
  }
}

export function WhatsAppFooterBanner() {
  const navigate = useNavigate();
  const status = useLinkStatus({ refetchInterval: false, enabled: true });
  const [hidden, setHidden] = useState<boolean>(() => readDismissed());

  if (hidden) return null;
  if (status.isLoading) return null;
  if (status.data?.linked) return null;

  return (
    <div
      data-testid="whatsapp-footer-banner"
      className="mt-6 mx-auto max-w-sm w-full rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] px-3 py-2.5 flex items-center gap-3"
    >
      <div className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center shrink-0">
        <WhatsappLogo size={18} weight="fill" className="text-emerald-300" />
      </div>
      <button
        type="button"
        onClick={() => navigate('/settings/whatsapp')}
        className="flex-1 min-w-0 text-left"
      >
        <p className="text-xs font-semibold text-[#F5E8C7]">
          Chat with Raya on WhatsApp
        </p>
        <p className="text-[10px] text-emerald-200/70 truncate">
          Link your account — same memory, no app required.
        </p>
      </button>
      <button
        type="button"
        onClick={() => {
          setDismissed();
          setHidden(true);
        }}
        aria-label="Dismiss"
        className="w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/5 transition-colors shrink-0"
      >
        <X size={12} className="text-white/40" />
      </button>
    </div>
  );
}

export default WhatsAppFooterBanner;
