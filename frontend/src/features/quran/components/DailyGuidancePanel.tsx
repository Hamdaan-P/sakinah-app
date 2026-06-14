/**
 * DailyGuidancePanel — the four-pillar "Daily Spiritual Guidance" block on the
 * Daily Ayah page.
 *
 * Everything shown here is RETRIEVED from cited sources (tafsir, verified
 * hadith, textbook corpus) — there is no AI generation, so each pillar carries
 * a SourceCitationChip the user can audit. Pillars that the backend couldn't
 * source are simply omitted; the deterministic "Take it deeper" prompt is
 * always present.
 *
 * Actions reuse existing infra:
 *   - Reflection  → prefills the page's reflect composer (onUseReflection)
 *   - Reminder    → saves the hadith to the Quran Workspace
 *   - Live it     → saves to Workspace + optional native "remind me"
 *   - Prompt      → opens Raya with the ayah anchored + the question seeded
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, ChatCircleDots, HandHeart, Sparkle, Bell, FloppyDisk } from '@phosphor-icons/react';
import { AiDisclaimerBanner } from './governance/AiDisclaimerBanner';
import { SourceCitationChip } from './governance/SourceCitationChip';
import { fetchDailyGuidance, type DailyGuidance } from '../services/dailyGuidanceService';
import { createItem } from '../services/workspaceService';
import { scheduleUserReminder, userReminderIdFor } from '@/lib/notificationScheduler';
import type { HadithCitation } from '../types/quran.types';

interface Props {
  verseKey: string;
  surahId: number;
  ayahNumber: number;
  arabic: string;
  translation: string;
  tafsir?: string | null;
  /** Prefill the page's reflect composer with the chosen reflection text. */
  onUseReflection: (text: string) => void;
}

const REMIND_OFFSET_HOURS = 8;

export function DailyGuidancePanel({
  verseKey, surahId, ayahNumber, arabic, translation, tafsir, onUseReflection,
}: Props) {
  const navigate = useNavigate();
  const [guidance, setGuidance] = useState<DailyGuidance | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetchDailyGuidance(verseKey)
      .then((g) => { if (!cancelled) setGuidance(g); })
      .catch(() => { if (!cancelled) setGuidance(null); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [verseKey]);

  function flash(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(null), 2400);
  }

  function askRaya(seed: string) {
    navigate('/ai-assistant', {
      state: {
        initialMessage: seed,
        quranAnchor: {
          surahId,
          ayahNumber,
          verseKey,
          arabicText: arabic,
          translation,
          tafsir: tafsir ?? undefined,
          tafsirSource: tafsir ? 'Ibn Kathir' : undefined,
        },
      },
    });
  }

  async function remindLater(body: string) {
    const reminderAt = Date.now() + REMIND_OFFSET_HOURS * 60 * 60 * 1000;
    // Always save to Workspace so web users keep a record even when native
    // notifications aren't available.
    createItem({
      type: 'reminder',
      title: 'Live this ayah',
      body,
      linkedAyahs: [verseKey],
      tags: ['daily-guidance', 'living'],
      reminderAt,
      reminderChannel: 'in-app',
    });
    const res = await scheduleUserReminder({
      id: userReminderIdFor(`daily-guidance:${verseKey}`),
      title: 'Quran — live this ayah',
      body: body.slice(0, 120),
      at: new Date(reminderAt),
    });
    flash(
      res.scheduled
        ? 'Reminder set — saved to your Workspace.'
        : 'Reminders are available on mobile — saved to your Workspace.',
    );
  }

  function saveNote(title: string, body: string, tag: string) {
    createItem({
      type: 'note',
      title,
      body,
      linkedAyahs: [verseKey],
      tags: ['daily-guidance', tag],
    });
    flash('Saved to your Workspace.');
  }

  if (loading) {
    return (
      <div className="mx-4 mt-4 rounded-2xl bg-white/3 border border-white/8 p-4 space-y-3">
        <div className="h-4 w-32 rounded bg-white/5 animate-pulse" />
        <div className="h-16 rounded-lg bg-white/5 animate-pulse" />
        <div className="h-16 rounded-lg bg-white/5 animate-pulse" />
      </div>
    );
  }

  if (!guidance) return null;

  const { reflection, reminder, living, prompt } = guidance;

  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-4 mt-4 rounded-2xl bg-white/3 border border-white/8 p-4"
      aria-label="Daily spiritual guidance"
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkle size={15} weight="fill" className="text-[#D4A853]" />
        <h2 className="text-[11px] uppercase tracking-wider text-[#D4A853]/90 font-semibold">
          Daily Guidance
        </h2>
      </div>

      <AiDisclaimerBanner compact className="mb-4" />

      <div className="space-y-3">
        {/* 1 — Reflection (tadabbur) */}
        {reflection && (
          <PillarCard
            icon={<BookOpen size={16} className="text-[#D4A853]" />}
            label="Reflect"
            accent="#D4A853"
          >
            <p className="text-sm text-white/85 leading-relaxed">{reflection.text}</p>
            <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
              <SourceCitationChip citation={reflection.citation} />
              <button
                onClick={() => { onUseReflection(reflection.text); flash('Added to your reflection — edit & save below.'); }}
                className="text-[11px] font-semibold px-3 py-1.5 rounded-full bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853] hover:bg-[#D4A853]/25 transition-colors"
              >
                Use this reflection
              </button>
            </div>
          </PillarCard>
        )}

        {/* 2 — Reminder (tazkir) — a verified hadith */}
        {reminder && (
          <PillarCard
            icon={<ChatCircleDots size={16} className="text-emerald-400" />}
            label="Remember · Sunnah"
            accent="#4FB892"
          >
            {reminder.arabic && (
              <p dir="rtl" className="font-arabic text-right text-[#F5E8C7]/85 text-base leading-[1.9] mb-2 line-clamp-3">
                {reminder.arabic}
              </p>
            )}
            <p className="text-sm text-white/85 leading-relaxed">{reminder.english}</p>
            <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
              <SourceCitationChip
                citation={{
                  kind: 'hadith',
                  collection: reminder.collection,
                  number: reminder.number,
                  narrator: reminder.narrator,
                  grade: reminder.grade,
                } satisfies HadithCitation}
                snippet={{ arabic: reminder.arabic, english: reminder.english }}
              />
              <button
                onClick={() => saveNote(
                  `Hadith — ${reminder.collection} #${reminder.number}`,
                  reminder.english,
                  'hadith',
                )}
                className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25 transition-colors"
              >
                <FloppyDisk size={12} /> Save
              </button>
            </div>
          </PillarCard>
        )}

        {/* 3 — How to live it */}
        {living && (
          <PillarCard
            icon={<HandHeart size={16} className="text-[#B891E8]" />}
            label="How to live it"
            accent="#B891E8"
          >
            <p className="text-sm text-white/85 leading-relaxed">{living.text}</p>
            <div className="mt-2.5 flex items-center justify-between gap-2 flex-wrap">
              <SourceCitationChip citation={living.citation} />
              <div className="flex items-center gap-2">
                <button
                  onClick={() => remindLater(living.text)}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-rose-400/15 border border-rose-400/30 text-rose-300 hover:bg-rose-400/25 transition-colors"
                >
                  <Bell size={12} /> Remind me
                </button>
                <button
                  onClick={() => saveNote('Live this ayah', living.text, 'living')}
                  className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-[#B891E8]/15 border border-[#B891E8]/30 text-[#B891E8] hover:bg-[#B891E8]/25 transition-colors"
                >
                  <FloppyDisk size={12} /> Save
                </button>
              </div>
            </div>
          </PillarCard>
        )}

        {/* 4 — Take it deeper (deterministic prompt) */}
        <PillarCard
          icon={<Sparkle size={16} weight="fill" className="text-[#B891E8]" />}
          label="Take it deeper"
          accent="#B891E8"
        >
          <p className="text-sm text-white/85 leading-relaxed">{prompt.text}</p>
          {prompt.is_dua_ayah && (
            <p className="text-xs text-[#D4A853]/80 mt-1.5 italic">
              This ayah is itself a du'a — memorise it and make it your own supplication.
            </p>
          )}
          <div className="mt-2.5">
            <button
              onClick={() => askRaya(prompt.text)}
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-full bg-gradient-to-r from-[#B891E8]/20 to-[#4FB892]/15 border border-[#B891E8]/30 text-[#B891E8] hover:border-[#B891E8]/50 transition-colors"
            >
              <Sparkle size={12} weight="fill" /> Ask Raya
            </button>
          </div>
        </PillarCard>
      </div>

      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="mt-3 text-xs text-emerald-300 border border-emerald-500/30 bg-emerald-500/10 rounded-md px-3 py-2"
        >
          {toast}
        </div>
      )}
    </motion.section>
  );
}

function PillarCard({
  icon, label, accent, children,
}: {
  icon: React.ReactNode;
  label: string;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="rounded-xl bg-[#0A0E16]/50 border border-white/8 p-3.5"
      style={{ borderLeft: `2px solid ${accent}55` }}
    >
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-semibold text-white/55">{label}</span>
      </div>
      {children}
    </div>
  );
}

export default DailyGuidancePanel;
