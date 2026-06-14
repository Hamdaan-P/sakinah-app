/**
 * QuranDepthFaqsPage — guided reflection FAQs for a surah.
 *
 * Each FAQ opens a reflection drawer with two affordances:
 *   1. "Ask Raya" — opens DeepDiveSheet on the Ask tab with the FAQ's
 *      curated prompt pre-seeded into the input. The user can edit before
 *      sending; conversation stays in-context (no nav away to /ai-assistant).
 *   2. "Save to workspace" — creates a reflection workspace item.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft } from '@phosphor-icons/react';
import { fetchDepthFaqs, type DepthFaqItem } from '../services/depthFaqsService';
import { AiDisclaimerBanner } from '../components/governance/AiDisclaimerBanner';
import { SourceCitationChip } from '../components/governance/SourceCitationChip';
import { createItem } from '../services/workspaceService';
import { TADABBUR_PILOT_SURAH_NAMES } from '../config/tadabbur';
import { DeepDiveSheet } from '../components/deep-dive/DeepDiveSheet';

export function QuranDepthFaqsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const surahId = parseInt(id ?? '', 10);

  const [items, setItems] = useState<DepthFaqItem[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [reflectionText, setReflectionText] = useState('');
  const [toast, setToast] = useState<string | null>(null);
  // Pre-seeded Ask prompt for the DeepDiveSheet. Non-null = sheet open.
  const [askPrompt, setAskPrompt] = useState<string | null>(null);

  useEffect(() => {
    if (!Number.isFinite(surahId)) {
      setError('Invalid surah id');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    fetchDepthFaqs(surahId)
      .then((r) => { if (!cancelled) setItems(r); })
      .catch((e: Error) => { if (!cancelled) setError(e.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [surahId]);

  const intro = items && items[0]?.intro;
  const activeItem = openId ? items?.find((i) => i.id === openId) ?? null : null;

  function saveReflection() {
    if (!activeItem) return;
    createItem({
      type: 'reflection',
      title: activeItem.question,
      body: reflectionText || activeItem.reflection_seed,
      linkedAyahs: [`${surahId}:1`],
      tags: ['depth-faq', `surah-${surahId}`],
    });
    setReflectionText('');
    setOpenId(null);
    setToast('Saved to your Workspace.');
    window.setTimeout(() => setToast(null), 2400);
  }

  return (
    <div className="min-h-screen bg-[#0A0E16] text-[#F5E8C7]">
      <header className="px-4 py-4 flex items-center gap-3 border-b border-[rgba(212,168,83,0.15)] sticky top-0 bg-[#0A0E16] z-10">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="text-[#7A7363] hover:text-[#F5E8C7]"
        >
          <ArrowLeft size={20} />
        </button>
        <h1 className="text-base font-semibold">Depth FAQs · Surah {surahId}</h1>
      </header>

      <main className="px-4 py-6 max-w-3xl mx-auto space-y-4">
        <AiDisclaimerBanner />

        {intro && (
          <section className="rounded-xl border border-[rgba(212,168,83,0.18)] bg-[#10151F]/40 p-4">
            <p className="text-sm text-[#7A7363] leading-relaxed">{intro}</p>
          </section>
        )}

        {loading && <p className="text-sm text-[#7A7363]">Loading…</p>}
        {!loading && error && <p className="text-sm text-[#D4A853]">{error}</p>}
        {!loading && !error && items && items.length === 0 && (
          <div className="rounded-xl border border-[#D7B56A]/25 bg-[#D7B56A]/5 p-4 space-y-2">
            <p className="text-sm text-[#EBDCB8] font-semibold">Not yet curated</p>
            <p className="text-sm text-[#A7B1C0] leading-relaxed">
              Depth FAQs are scholar-curated, one surah at a time. We're
              piloting on {TADABBUR_PILOT_SURAH_NAMES} while qualified scholars
              review the reflection prompts. Until this surah is curated, you
              can ask Raya directly — every answer is grounded in verified
              sources.
            </p>
            <button
              type="button"
              onClick={() =>
                setAskPrompt(
                  `Help me reflect deeply on Surah ${surahId}. What are its central themes, and what should I sit with as I read it?`,
                )
              }
              className="inline-block mt-2 text-sm text-[#D7B56A] hover:underline"
            >
              Ask Raya about this surah →
            </button>
          </div>
        )}

        {!loading && !error && items && items.length > 0 && (
          <ol className="space-y-3">
            {items.map((item) => (
              <li
                key={item.id}
                className="rounded-lg border border-[rgba(212,168,83,0.18)] bg-[#10151F]/40"
              >
                <button
                  type="button"
                  onClick={() => {
                    setOpenId(item.id === openId ? null : item.id);
                    setReflectionText('');
                  }}
                  className="w-full text-left px-4 py-3 flex items-start gap-3"
                  aria-expanded={openId === item.id}
                >
                  <span className="text-[#D4A853] text-xs font-semibold mt-1">
                    {item.id.split('-').pop()?.replace(/q/, 'Q')}
                  </span>
                  <span className="flex-1 text-sm text-[#F5E8C7]">{item.question}</span>
                  <span aria-hidden="true" className="text-[#7A7363]">
                    {openId === item.id ? '−' : '+'}
                  </span>
                </button>

                {openId === item.id && (
                  <div className="px-4 pb-4 space-y-3 border-t border-[rgba(212,168,83,0.10)]">
                    <p className="text-sm italic text-[#7A7363] leading-relaxed pt-3">
                      {item.reflection_seed}
                    </p>

                    <textarea
                      value={reflectionText}
                      onChange={(e) => setReflectionText(e.target.value)}
                      placeholder="Write your reflection… (or save the seed as-is)"
                      className="w-full min-h-[120px] p-3 rounded-md bg-[#0A0E16] border border-[rgba(212,168,83,0.18)] text-sm text-[#F5E8C7] placeholder:text-[#56627A]"
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAskPrompt(item.prompt_for_raya)}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-primaryTeal/15 border border-primaryTeal/30 text-primaryTeal hover:bg-primaryTeal/25"
                      >
                        Ask Raya
                      </button>
                      <button
                        type="button"
                        onClick={saveReflection}
                        className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853] hover:bg-[#D4A853]/25"
                      >
                        Save reflection
                      </button>
                      {item.citation && <SourceCitationChip citation={item.citation} />}
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ol>
        )}

        {toast && (
          <div
            role="status"
            aria-live="polite"
            className="text-xs text-[#2A9D6F] border border-[#2A9D6F]/30 bg-[#2A9D6F]/10 rounded-md px-3 py-2 mt-3"
          >
            {toast}
          </div>
        )}
      </main>

      <DeepDiveSheet
        open={askPrompt !== null}
        onClose={() => setAskPrompt(null)}
        verseKey={Number.isFinite(surahId) ? `${surahId}:1` : null}
        context={Number.isFinite(surahId) ? { verseKey: `${surahId}:1` } : null}
        initialTab="ask"
        initialPrompt={askPrompt ?? undefined}
      />
    </div>
  );
}
