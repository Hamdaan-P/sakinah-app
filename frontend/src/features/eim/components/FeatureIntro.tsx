/**
 * FeatureIntro — a per-feature explainer that answers "what is this, what can
 * it do, what can't it do, and what should I try first?".
 *
 * Behaviour (per founder decision 2026-06-05):
 *   • Auto-opens ONCE the first time a user lands on a feature.
 *   • A permanent "i" button in the feature header reopens it anytime.
 * "Seen" is tracked in eim.store.featureIntros (persisted), so the auto-open
 * fires only once per device.
 *
 * Renders BOTH the inline "i" button (wherever you place <FeatureIntro/>) and
 * the modal (a fixed overlay, so its DOM position doesn't matter). Drop it into
 * a header row and the button lands there.
 */

import { useEffect, useState } from 'react';
import { Info, X, Check, Prohibit, Sparkle } from '@phosphor-icons/react';
import { FEATURE_INFO } from '../data/featureInfo';
import { useEimStore } from '../stores/eim.store';

export function FeatureIntro({
  featureId,
  autoOpen = true,
}: {
  featureId: string;
  /** Auto-open once on first visit. Set false where another onboarding already
   *  covers the first run (e.g. the Time Machine's SimOnboarding). */
  autoOpen?: boolean;
}) {
  const info = FEATURE_INFO[featureId];
  const seen = useEimStore((s) => s.featureIntros[featureId]);
  const markSeen = useEimStore((s) => s.markFeatureIntroSeen);
  // Auto-open on first visit. Initialiser reads the persisted flag once.
  const [open, setOpen] = useState(() => autoOpen && !useEimStore.getState().featureIntros[featureId]);

  // Close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!info) return null;

  const close = () => {
    setOpen(false);
    markSeen(featureId);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`About ${info.title}`}
        title={`About ${info.title}`}
        className={
          'shrink-0 w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ' +
          (seen
            ? 'border-[rgba(212,168,83,0.18)] text-[#7A7363] hover:text-[#D4A853] hover:border-[rgba(212,168,83,0.35)]'
            : // Subtle pulse the first time so users notice the affordance.
              'border-[rgba(212,168,83,0.45)] text-[#D4A853] bg-[rgba(212,168,83,0.10)]')
        }
      >
        <Info size={16} weight="bold" />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`About ${info.title}`}
          onClick={close}
        >
          <div
            className="w-full sm:max-w-md max-h-[88vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl border border-[rgba(212,168,83,0.30)] bg-[#101a2a] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="sticky top-0 bg-[#101a2a] px-5 pt-5 pb-3 border-b border-[rgba(212,168,83,0.12)] flex items-start gap-3">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-[24px] border border-[rgba(212,168,83,0.30)]"
                style={{
                  background:
                    'linear-gradient(135deg, rgba(212,168,83,0.18), rgba(42,157,111,0.08))',
                }}
                aria-hidden="true"
              >
                {info.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-bold">
                  About this feature
                </div>
                <h2 className="text-[18px] font-extrabold text-[#F5E8C7] leading-tight">
                  {info.title}
                </h2>
                <p className="text-[11.5px] text-[#7A7363] mt-0.5">{info.tagline}</p>
              </div>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-[#5C5749] hover:text-[#F5E8C7]"
              >
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Body */}
            <div className="px-5 py-4 space-y-4">
              <p className="text-[13px] text-[#D1D9E5] leading-relaxed">{info.whatItIs}</p>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#7BB39A] font-bold mb-1.5">
                  What it can do
                </div>
                <ul className="space-y-1.5">
                  {info.canDo.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px] text-[#C9C0AB] leading-snug">
                      <Check size={14} weight="bold" className="text-[#5FC986] mt-0.5 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-widest text-[#9A927E] font-bold mb-1.5">
                  What it won’t do
                </div>
                <ul className="space-y-1.5">
                  {info.cantDo.map((c, i) => (
                    <li key={i} className="flex items-start gap-2 text-[12.5px] text-[#7A7363] leading-snug">
                      <Prohibit size={14} weight="bold" className="text-[#9A927E] mt-0.5 shrink-0" />
                      <span>{c}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Try this */}
              <div className="rounded-xl border border-[rgba(212,168,83,0.25)] bg-[rgba(212,168,83,0.06)] p-3 flex items-start gap-2.5">
                <Sparkle size={16} weight="fill" className="text-[#D4A853] mt-0.5 shrink-0" />
                <div>
                  <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-bold mb-0.5">
                    Try this
                  </div>
                  <p className="text-[12.5px] text-[#E8DCC0] leading-relaxed">{info.example}</p>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-5 pb-5 pt-1">
              <button
                type="button"
                onClick={close}
                className="w-full h-11 rounded-xl text-[13px] font-bold text-[#0A0E16] transition-all hover:opacity-90"
                style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default FeatureIntro;
