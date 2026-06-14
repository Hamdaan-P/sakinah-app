/**
 * MemorizationPlanPanel
 *
 * UI for the rule-based memorization-plan generator (PDF Section 11 item 4).
 * Lives on the Hifz page; takes a surah + range + duration and produces a
 * day-by-day plan that skips already-mastered ayahs and front-loads weak
 * ones from the same surah.
 */

import { useEffect, useState } from 'react';
import type { MemorizationPlan } from '../services/memorizationPlanService';
import { buildMemorizationPlan } from '../services/memorizationPlanService';
import { fetchSurahs } from '../services/quranApiService';

interface SurahOption {
  id: number;
  name: string;
  versesCount: number;
}

interface Props {
  /** Optional surah list. When omitted, the panel fetches surahs itself. */
  surahs?: SurahOption[];
  /** Optional default surah pre-filled in the form. */
  defaultSurahId?: number;
  className?: string;
}

export function MemorizationPlanPanel({ surahs: surahsProp, defaultSurahId, className }: Props) {
  const [surahs, setSurahs] = useState<SurahOption[]>(surahsProp ?? []);
  const [surahId, setSurahId] = useState<number>(defaultSurahId ?? surahsProp?.[0]?.id ?? 67);

  useEffect(() => {
    if (surahsProp && surahsProp.length > 0) return;
    let cancelled = false;
    fetchSurahs()
      .then((data) => {
        if (cancelled) return;
        const mapped = data.map((s) => ({
          id: s.id,
          name: s.nameSimple,
          versesCount: s.versesCount,
        }));
        setSurahs(mapped);
        if (!defaultSurahId) {
          const fallback = mapped.find((s) => s.id === 67) ?? mapped[0];
          if (fallback) setSurahId(fallback.id);
        }
      })
      .catch(() => {
        /* leave defaults */
      });
    return () => {
      cancelled = true;
    };
  }, [surahsProp, defaultSurahId]);
  const [start, setStart] = useState(1);
  const [end, setEnd] = useState(10);
  const [duration, setDuration] = useState(7);
  const [perDay, setPerDay] = useState<number | ''>('');
  const [plan, setPlan] = useState<MemorizationPlan | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onGenerate = () => {
    setError(null);
    setPlan(null);
    try {
      const surah = surahs.find((s) => s.id === surahId);
      const max = surah?.versesCount ?? 286;
      const s = Math.max(1, Math.min(start, max));
      const e = Math.max(s, Math.min(end, max));
      const out = buildMemorizationPlan({
        surahId,
        startVerse: s,
        endVerse: e,
        durationDays: Math.max(1, duration),
        ayahsPerDay: typeof perDay === 'number' && perDay > 0 ? perDay : undefined,
      });
      setPlan(out);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not build plan.');
    }
  };

  return (
    <section
      className={`rounded-xl border border-white/10 bg-white/3 p-4 space-y-4 text-slate-100 ${className ?? ''}`}
    >
      <header className="space-y-1">
        <h2 className="text-base font-semibold">Memorization plan</h2>
        <p className="text-xs text-slate-400">
          Generates a day-by-day schedule from your local hifz records. Mastered ayahs are skipped;
          weak ayahs in the same surah are mixed into revision slots.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 text-sm">
        <label className="space-y-1">
          <span className="text-xs text-slate-400">Surah</span>
          <select
            value={surahId}
            onChange={(e) => setSurahId(parseInt(e.target.value, 10))}
            className="w-full rounded border border-white/10 bg-[#0A0E16] px-2 py-1.5 text-sm"
          >
            {surahs.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id}. {s.name} ({s.versesCount})
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1">
          <span className="text-xs text-slate-400">Days</span>
          <input
            type="number"
            min={1}
            max={365}
            value={duration}
            onChange={(e) => setDuration(parseInt(e.target.value || '1', 10))}
            className="w-full rounded border border-white/10 bg-[#0A0E16] px-2 py-1.5 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-slate-400">Start ayah</span>
          <input
            type="number"
            min={1}
            value={start}
            onChange={(e) => setStart(parseInt(e.target.value || '1', 10))}
            className="w-full rounded border border-white/10 bg-[#0A0E16] px-2 py-1.5 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs text-slate-400">End ayah</span>
          <input
            type="number"
            min={1}
            value={end}
            onChange={(e) => setEnd(parseInt(e.target.value || '1', 10))}
            className="w-full rounded border border-white/10 bg-[#0A0E16] px-2 py-1.5 text-sm"
          />
        </label>
        <label className="space-y-1 col-span-2">
          <span className="text-xs text-slate-400">Ayahs per day (optional — defaults to auto)</span>
          <input
            type="number"
            min={1}
            value={perDay}
            placeholder="auto"
            onChange={(e) => {
              const v = e.target.value;
              setPerDay(v === '' ? '' : parseInt(v, 10));
            }}
            className="w-full rounded border border-white/10 bg-[#0A0E16] px-2 py-1.5 text-sm"
          />
        </label>
      </div>

      <button
        onClick={onGenerate}
        className="rounded-md bg-primaryTeal px-4 py-2 text-sm font-medium text-white hover:opacity-90"
      >
        Generate plan
      </button>

      {error && <p className="text-sm text-rose-300">{error}</p>}

      {plan && (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 italic">{plan.note}</p>
          {plan.skippedMastered.length > 0 && (
            <p className="text-xs text-slate-400">
              Skipped {plan.skippedMastered.length} already-mastered ayah{plan.skippedMastered.length === 1 ? '' : 's'}.
            </p>
          )}

          {plan.days.length === 0 ? (
            <p className="text-sm text-slate-300">
              Every ayah in this range is already mastered — nothing left to schedule.
            </p>
          ) : (
            <ol className="space-y-2">
              {plan.days.map((d) => (
                <li
                  key={d.day}
                  className="rounded border border-white/10 bg-[#0A0E16]/40 p-3 space-y-1.5"
                >
                  <p className="text-sm font-medium">Day {d.day}</p>
                  {d.newAyahs.length > 0 && (
                    <p className="text-xs text-slate-300">
                      <span className="text-[#D4A853]">New:</span> {d.newAyahs.join(', ')}
                    </p>
                  )}
                  {d.revisionAyahs.length > 0 && (
                    <p className="text-xs text-slate-300">
                      <span className="text-primaryTeal">Revise:</span> {d.revisionAyahs.join(', ')}
                    </p>
                  )}
                  <p className="text-[11px] text-slate-400 italic">{d.rationale}</p>
                </li>
              ))}
            </ol>
          )}
        </div>
      )}
    </section>
  );
}
