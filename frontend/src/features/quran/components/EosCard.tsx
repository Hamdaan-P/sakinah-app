/**
 * EosCard — End-of-Surah hook.
 *
 * Rendered at the bottom of QuranReadingPage to give the reader a soft
 * exit ramp once they've reached the last ayah. Surfaces three actions:
 *   1. Reflect deeper → Depth FAQs page for this surah.
 *   2. See the X-Ray   → structural/thematic overview.
 *   3. Continue       → next surah (1..114), or none if Nas (114).
 *
 * Governance: card is informational only — no AI output is rendered here,
 * so no disclaimer banner is needed. CTAs route to pages that own their
 * own governance.
 */

import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Sparkle, Brain } from '@phosphor-icons/react';
import type { Surah } from '../types/quran.types';
import { isSurahInTadabburPilot } from '../config/tadabbur';

interface Props {
  surah: Surah;
  /** Optional next-surah lookup for the "Continue" CTA. */
  nextSurah?: Surah | null;
}

export function EosCard({ surah, nextSurah }: Props) {
  const inPilot = isSurahInTadabburPilot(surah.id);

  return (
    <section
      aria-labelledby="eos-heading"
      className="mx-4 my-8 rounded-2xl border border-[rgba(215,181,106,0.20)] bg-gradient-to-b from-[#2C3C55]/60 to-[#1E293A] p-5 space-y-4"
    >
      <header className="space-y-1">
        <p className="text-[11px] uppercase tracking-wider text-[#D7B56A]">
          End of Surah
        </p>
        <h2 id="eos-heading" className="text-lg font-semibold text-[#EBDCB8]">
          You've finished Surah {surah.nameSimple}
        </h2>
        <p className="text-sm text-[#A7B1C0] leading-relaxed">
          Take a breath. Sit with what you read before moving on.
        </p>
      </header>

      <div className="grid gap-2 sm:grid-cols-2">
        <Link
          to={`/quran/surah/${surah.id}/depth-faqs`}
          className="flex items-start gap-3 p-3 rounded-xl border border-primaryTeal/25 bg-primaryTeal/10 hover:bg-primaryTeal/20 transition-colors"
        >
          <Sparkle size={20} className="text-primaryTeal shrink-0 mt-0.5" />
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-medium text-primaryTeal">
              Reflect deeper
            </span>
            <span className="block text-xs text-[#A7B1C0] mt-0.5">
              {inPilot
                ? 'Guided FAQs to slow your reading down.'
                : 'Curated FAQs coming for this surah.'}
            </span>
          </span>
        </Link>

        <Link
          to={`/quran/surah/${surah.id}/xray`}
          className="flex items-start gap-3 p-3 rounded-xl border border-[#D7B56A]/25 bg-[#D7B56A]/10 hover:bg-[#D7B56A]/20 transition-colors"
        >
          <BookOpen size={20} className="text-[#D7B56A] shrink-0 mt-0.5" />
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-medium text-[#D7B56A]">
              See the X-Ray
            </span>
            <span className="block text-xs text-[#A7B1C0] mt-0.5">
              Themes, structure, key terms at a glance.
            </span>
          </span>
        </Link>

        <Link
          to={`/quran/surah/${surah.id}/quiz`}
          className="flex items-start gap-3 p-3 rounded-xl border border-[#B891E8]/25 bg-[#B891E8]/10 hover:bg-[#B891E8]/20 transition-colors sm:col-span-2"
        >
          <Brain size={20} className="text-[#B891E8] shrink-0 mt-0.5" />
          <span className="flex-1 min-w-0">
            <span className="block text-sm font-medium text-[#B891E8]">
              Test your understanding
            </span>
            <span className="block text-xs text-[#A7B1C0] mt-0.5">
              A quick 5-question quiz on what you just read.
            </span>
          </span>
        </Link>
      </div>

      {nextSurah && (
        <Link
          to={`/quran/read?surah=${nextSurah.id}`}
          className="flex items-center justify-between p-3 rounded-xl border border-[rgba(215,181,106,0.15)] bg-[#1E293A]/60 hover:bg-[#1E293A] transition-colors"
        >
          <span className="text-sm text-[#EBDCB8]">
            Continue to Surah {nextSurah.nameSimple}
          </span>
          <ArrowRight size={18} className="text-[#A7B1C0]" />
        </Link>
      )}
    </section>
  );
}
