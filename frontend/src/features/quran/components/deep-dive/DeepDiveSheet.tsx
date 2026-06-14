/**
 * DeepDiveSheet
 *
 * Bottom sheet on mobile / right drawer on >= md screens. Opens when a user
 * taps an ayah in the reader. The shell renders header + tab bar + the
 * active panel; each panel is lazy-loaded so a Tafsir/Hadith network fetch
 * never blocks the Ask tab.
 *
 * Governance: each panel is responsible for its own AiDisclaimerBanner +
 * SourceCitationChip output. The shell stays neutral.
 */

import { lazy, Suspense, useEffect, useState } from 'react';
import { DeepDiveTabBar, type DeepDiveTab } from './DeepDiveTabBar';
import type { RayaQuranAyahContext } from '../../types/quran.types';
import { isAyahInTadabburPilot, TADABBUR_PILOT_SURAH_NAMES } from '../../config/tadabbur';

const AskPanel = lazy(() => import('./panels/AskPanel').then((m) => ({ default: m.AskPanel })));
const XrayPanel = lazy(() => import('./panels/XrayPanel').then((m) => ({ default: m.XrayPanel })));
const TafsirPanel = lazy(() => import('./panels/TafsirPanel').then((m) => ({ default: m.TafsirPanel })));
const HadithPanel = lazy(() => import('./panels/HadithPanel').then((m) => ({ default: m.HadithPanel })));
const ScholarsPanel = lazy(() => import('./panels/ScholarsPanel').then((m) => ({ default: m.ScholarsPanel })));
const ApplyPanel = lazy(() => import('./panels/ApplyPanel').then((m) => ({ default: m.ApplyPanel })));

interface Props {
  open: boolean;
  onClose: () => void;
  verseKey: string | null;
  context: RayaQuranAyahContext | null;
  initialTab?: DeepDiveTab;
  /** Pre-seed the Ask tab input (Depth FAQ → Ask handoff). */
  initialPrompt?: string;
  /**
   * When set, the Ask tab auto-fires this message as the opening user
   * turn the moment the sheet opens. Used by the Depth FAQs "clever
   * loop" — tapping a question seeds Raya with that question so the
   * user lands inside a conversation, not a blank prompt.
   */
  initialAskSeedMessage?: string;
}

function PanelLoader() {
  return (
    <div className="p-6 text-sm text-[#7A7363]" aria-busy="true">
      Loading…
    </div>
  );
}

export function DeepDiveSheet({
  open,
  onClose,
  verseKey,
  context,
  initialTab = 'ask',
  initialPrompt,
  initialAskSeedMessage,
}: Props) {
  const [tab, setTab] = useState<DeepDiveTab>(initialTab);

  // Reset to the initial tab when a new ayah is opened.
  useEffect(() => {
    if (open) setTab(initialTab);
  }, [open, verseKey, initialTab]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open || !verseKey) return null;

  const inPilot = isAyahInTadabburPilot(verseKey);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Deep dive for verse ${verseKey}`}
      className="fixed inset-0 z-50 flex items-end md:items-stretch md:justify-end"
    >
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close deep dive"
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Sheet */}
      <div
        className="relative w-full md:max-w-xl h-[90vh] md:h-full bg-[#0A0E16] border-t md:border-t-0 md:border-l border-[rgba(212,168,83,0.20)] rounded-t-2xl md:rounded-none flex flex-col shadow-2xl"
      >
        {/* Header */}
        <header className="flex items-center justify-between px-4 py-3 border-b border-[rgba(212,168,83,0.15)] sticky top-0 bg-[#0A0E16] z-10">
          <div className="flex items-baseline gap-2">
            <h2 className="text-base font-semibold text-[#F5E8C7]">Deep Dive</h2>
            <span className="text-xs text-[#7A7363]">
              {context?.surahName ? `${context.surahName} · ` : ''}{verseKey}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="text-[#7A7363] hover:text-[#F5E8C7] text-xl leading-none px-2 py-1"
          >
            ×
          </button>
        </header>

        <DeepDiveTabBar active={tab} onChange={setTab} />

        {!inPilot && tab !== 'ask' && (
          <div
            role="note"
            className="px-4 py-2.5 text-[11px] text-[#D7B56A] bg-[#D7B56A]/10 border-b border-[#D7B56A]/20"
          >
            Curated tafsir, X-Ray, scholar commentary, and Apply scenarios are
            piloting on {TADABBUR_PILOT_SURAH_NAMES}. The <strong>Ask</strong>{' '}
            tab works on every ayah.
          </div>
        )}

        {/* Active panel */}
        <div className="flex-1 overflow-y-auto">
          <Suspense fallback={<PanelLoader />}>
            {tab === 'ask' && (
              <AskPanel
                verseKey={verseKey}
                context={context}
                initialPrompt={initialPrompt}
                autoSendSeed={initialAskSeedMessage}
              />
            )}
            {tab === 'xray' && <XrayPanel verseKey={verseKey} />}
            {tab === 'tafsir' && <TafsirPanel verseKey={verseKey} />}
            {tab === 'hadith' && <HadithPanel verseKey={verseKey} />}
            {tab === 'scholars' && <ScholarsPanel verseKey={verseKey} />}
            {tab === 'apply' && <ApplyPanel verseKey={verseKey} context={context} onClose={onClose} />}
          </Suspense>
        </div>
      </div>
    </div>
  );
}
