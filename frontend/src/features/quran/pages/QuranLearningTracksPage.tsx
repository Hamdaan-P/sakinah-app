/**
 * QuranLearningTracksPage — `/quran/tracks`
 *
 * Scholar-led study tracks catalog. PDF Section 11 items 1 + 2 — each track
 * is a structured learning journey curated against classical scholarly
 * works. Progress is local to the user (localStorage) so no PII leaves the
 * device.
 */

import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { LearningTrackProgress, LearningTrackSummary } from '../types/quran.types';
import {
  fetchTracks,
  listAllProgress,
  onProgressChange,
  tracksAreOffline,
} from '../services/learningTracksService';
import { SourceCitationChip } from '../components/governance/SourceCitationChip';

function progressFor(
  trackId: string,
  all: LearningTrackProgress[],
): LearningTrackProgress | null {
  return all.find((p) => p.trackId === trackId) ?? null;
}

export function QuranLearningTracksPage() {
  const navigate = useNavigate();
  const [tracks, setTracks] = useState<LearningTrackSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [offline, setOffline] = useState(false);
  const [progressList, setProgressList] = useState<LearningTrackProgress[]>(() =>
    listAllProgress(),
  );

  const load = useCallback(async () => {
    setError(null);
    try {
      const list = await fetchTracks();
      setTracks(list);
      setOffline(tracksAreOffline());
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load tracks.');
      setTracks(null);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => onProgressChange(() => setProgressList(listAllProgress())), []);

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-5 text-slate-100">
      <header className="space-y-1">
        <h1 className="text-xl font-semibold">Scholar-led Study Tracks</h1>
        <p className="text-sm text-slate-400">
          Curated learning journeys grounded in classical Islamic scholarship — Quran verses, verified
          hadith, and tafsir excerpts. Work through stages at your own pace.
        </p>
      </header>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-amber-400/40 bg-amber-50/10 p-4 text-sm text-amber-200 space-y-2"
        >
          <p className="font-medium">Learning tracks aren't reachable yet.</p>
          <p className="leading-relaxed">{error}</p>
        </div>
      )}

      {offline && tracks && tracks.length > 0 && (
        <div className="rounded-md border border-sky-400/30 bg-sky-50/5 px-3 py-2 text-[12px] text-sky-200">
          Showing built-in catalog — the live backend isn't reachable, so opening
          a track for detail will fail until it's running. Catalog data here
          mirrors what ships with the backend.
        </div>
      )}

      {!tracks && !error && (
        <div className="space-y-2" aria-busy="true">
          <div className="h-20 rounded bg-white/5 animate-pulse" />
          <div className="h-20 rounded bg-white/5 animate-pulse" />
          <div className="h-20 rounded bg-white/5 animate-pulse" />
        </div>
      )}

      {tracks && tracks.length === 0 && (
        <p className="text-sm text-slate-400">No tracks available yet.</p>
      )}

      <ul className="space-y-3">
        {tracks?.map((t) => {
          const prog = progressFor(t.id, progressList);
          const done = prog?.completedStages.length ?? 0;
          const pct = t.stage_count > 0 ? Math.round((done / t.stage_count) * 100) : 0;
          return (
            <li key={t.id}>
              <button
                type="button"
                onClick={() => navigate(`/quran/tracks/${encodeURIComponent(t.id)}`)}
                className="w-full text-left rounded-lg border border-white/10 bg-white/3 hover:bg-white/5 p-4 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-base font-semibold">{t.title}</h2>
                    <p className="text-xs text-slate-400 mt-0.5">{t.subtitle}</p>
                  </div>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#D4A853]/10 text-[#D4A853] border border-[#D4A853]/30 whitespace-nowrap">
                    {t.duration_days} {t.duration_days === 1 ? 'day' : 'days'} · {t.stage_count}{' '}
                    stages
                  </span>
                </div>

                {prog && (
                  <div className="flex items-center gap-2">
                    <div
                      className="h-1 flex-1 rounded-full bg-white/5 overflow-hidden"
                      aria-label={`Progress ${pct}%`}
                    >
                      <div
                        className="h-full bg-primaryTeal"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-[11px] text-slate-400">{pct}%</span>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {t.scholar_attribution.map((s, i) => (
                    <SourceCitationChip
                      key={`${t.id}-src-${i}`}
                      citation={{ kind: 'book', book: s.book, author: s.author }}
                    />
                  ))}
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export default QuranLearningTracksPage;
