/**
 * ChannelGrid — quick share buttons (WhatsApp, SMS, Twitter, Email) for
 * HalaqahShareSheet. Encapsulates per-channel deep-link logic to keep the
 * parent sheet focused on layout.
 */

import { WhatsappLogo, ChatTeardrop, TwitterLogo, EnvelopeSimple } from '@phosphor-icons/react';
import {
  buildWhatsAppLink,
  buildSmsLink,
  buildTwitterLink,
  buildMailtoLink,
  type HalaqahShareableEvent,
} from '../../services/halaqahShareService';

type Channel = 'whatsapp' | 'sms' | 'twitter' | 'email' | 'native' | 'copy' | 'qr';

interface Props {
  event: HalaqahShareableEvent;
  url: string;
  text: string;
  shortText: string;
  fire: (channel: Channel, action: () => void) => void;
}

export function ChannelGrid({ event, url, text, shortText, fire }: Props) {
  const channels = [
    {
      label: 'WhatsApp',
      icon: <WhatsappLogo size={22} weight="fill" />,
      bg: 'bg-emerald-500/15',
      color: 'text-emerald-400',
      border: 'border-emerald-500/30',
      onClick: () => fire('whatsapp', () => window.open(buildWhatsAppLink(text), '_blank')),
    },
    {
      label: 'SMS',
      icon: <ChatTeardrop size={22} weight="fill" />,
      bg: 'bg-blue-500/15',
      color: 'text-blue-400',
      border: 'border-blue-500/30',
      onClick: () => fire('sms', () => window.location.assign(buildSmsLink(shortText))),
    },
    {
      label: 'Twitter',
      icon: <TwitterLogo size={22} weight="fill" />,
      bg: 'bg-sky-500/15',
      color: 'text-sky-400',
      border: 'border-sky-500/30',
      onClick: () => fire('twitter', () => window.open(buildTwitterLink(shortText, url), '_blank')),
    },
    {
      label: 'Email',
      icon: <EnvelopeSimple size={22} weight="fill" />,
      bg: 'bg-amber-500/15',
      color: 'text-amber-400',
      border: 'border-amber-500/30',
      onClick: () => fire('email', () => window.location.assign(buildMailtoLink(`Invitation: ${event.name}`, text))),
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-2 mb-3">
      {channels.map((c) => (
        <button
          key={c.label}
          onClick={c.onClick}
          className={`flex flex-col items-center gap-1.5 p-3 rounded-xl ${c.bg} border ${c.border} hover:opacity-80 transition-opacity`}
        >
          <span className={c.color}>{c.icon}</span>
          <span className="text-[10px] text-white/85 font-medium">{c.label}</span>
        </button>
      ))}
    </div>
  );
}
