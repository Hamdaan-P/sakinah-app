/**
 * ShareButton — dropdown that generates a blessing share card and either
 * downloads it, uses the Web Share API, or opens an Instagram-friendly flow.
 */

import { useEffect, useRef, useState } from 'react';
import { ShareFat, InstagramLogo, ShareNetwork, DownloadSimple, Sparkle } from '@phosphor-icons/react';
import { C } from '../../barka-labs.constants';
import { generateBlessingCard } from '../../utils/blessingImageGenerator';

interface ShareButtonProps {
  text: string;
  depth: string;
  score: number;
  isOthers?: boolean;
}

export function ShareButton({ text, depth, score, isOthers }: ShareButtonProps) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const buildBlob = () => generateBlessingCard({ text, depth, score, isOthers });

  const buildCaption = () => {
    const depthLabel = depth.charAt(0).toUpperCase() + depth.slice(1);
    return `"${text.length > 100 ? text.slice(0, 100) + '...' : text}"\n\nScored ${depthLabel} (${score}/5) on the Niyaamat Meter\n#BarakahLabs #ZaryahPlus #Gratitude #Islam`;
  };

  const handleInstagram = async () => {
    setGenerating(true);
    try {
      const blob = await buildBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barakah-labs-blessing-${Date.now()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      try { await navigator.clipboard.writeText(buildCaption()); } catch { /* ok */ }
      setStatus('Image downloaded & caption copied!');
    } catch { setStatus('Failed to generate image'); }
    setGenerating(false);
    setTimeout(() => { setStatus(null); setOpen(false); }, 2500);
  };

  const handleShareApps = async () => {
    setGenerating(true);
    try {
      const blob = await buildBlob();
      const file = new File([blob], `barakah-labs-${Date.now()}.png`, { type: 'image/png' });
      const shareData = { title: 'A Blessing from Barakah Labs', text: buildCaption(), files: [file] };
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        setStatus('Shared!');
      } else {
        // Fallback: download
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `barakah-labs-${Date.now()}.png`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 5000);
        setStatus('Image downloaded!');
      }
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') { setStatus(null); }
      else setStatus('Failed');
    }
    setGenerating(false);
    setTimeout(() => { setStatus(null); setOpen(false); }, 2000);
  };

  const handleDownload = async () => {
    setGenerating(true);
    try {
      const blob = await buildBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `barakah-labs-blessing-${Date.now()}.png`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 5000);
      setStatus('Saved to downloads!');
    } catch { setStatus('Failed'); }
    setGenerating(false);
    setTimeout(() => { setStatus(null); setOpen(false); }, 2000);
  };

  const ITEMS = [
    { label: 'Instagram', icon: InstagramLogo, action: handleInstagram },
    { label: 'Share to Apps', icon: ShareNetwork, action: handleShareApps },
    { label: 'Download Image', icon: DownloadSimple, action: handleDownload },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 cursor-pointer bg-transparent border-none transition-colors"
        style={{ color: open ? C.gold : C.t3 }}
      >
        <ShareFat size={14} weight={open ? 'fill' : 'regular'} />
        <span className="text-[11px] font-semibold">Share</span>
      </button>

      {/* Dropdown menu */}
      {open && !generating && (
        <div
          className="absolute bottom-full mb-2 right-0 rounded-xl py-1.5 z-50"
          style={{
            background: '#1A2332',
            border: `1px solid ${C.cardB}`,
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            minWidth: 180,
          }}
        >
          {status ? (
            <div className="px-4 py-3 text-center">
              <span className="text-[12px] font-semibold" style={{ color: C.gold }}>{status}</span>
            </div>
          ) : (
            ITEMS.map(({ label, icon: Icon, action }) => (
              <button
                key={label}
                onClick={action}
                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-left cursor-pointer bg-transparent border-none transition-colors hover:bg-[rgba(215,181,106,0.08)]"
                style={{ color: C.t1 }}
              >
                <Icon size={16} weight="regular" style={{ color: C.gold }} />
                <span className="text-[12px] font-medium">{label}</span>
              </button>
            ))
          )}
        </div>
      )}

      {/* Full-screen generating overlay */}
      {generating && (
        <div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center gap-4"
          style={{ background: 'rgba(13,19,35,0.92)', backdropFilter: 'blur(12px)' }}
        >
          <div className="relative w-16 h-16 flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full animate-spin"
              style={{
                border: '3px solid transparent',
                borderTopColor: C.gold,
                borderRightColor: C.gold + '66',
              }}
            />
            <Sparkle size={24} weight="fill" style={{ color: C.gold }} />
          </div>
          <p className="text-[16px] font-semibold" style={{ color: '#EBDCB8', fontFamily: "'Cormorant Garamond', serif" }}>
            Creating your share card...
          </p>
          <p className="text-[13px]" style={{ color: '#A7B1C0' }}>
            AI is painting a unique image for your blessing
          </p>
        </div>
      )}
    </div>
  );
}
