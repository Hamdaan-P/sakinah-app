/**
 * QuranLearningTrackDetailPage — `/quran/tracks/:trackId`
 *
 * Stage-by-stage view of a single scholar-led track. Users mark stages
 * complete, jump to the relevant ayah in the reader, and the reflection
 * prompt is preserved per stage. Progress is per-user localStorage.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CaretLeft, CheckCircle, Circle } from '@phosphor-icons/react';
import type { LearningTrack, LearningTrackProgress } from '../types/quran.types';
import {
  enrollTrack,
  fetchTrack,
  getProgress,
  onProgressChange,
  resetTrack,
  toggleStageComplete,
} from '../services/learningTracksService';
import { SourceCitationChip } from '../components/governance/SourceCitationChip';

export function QuranLearningTrackDetailPage() {
  const { trackId = '' } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const [track, setTrack] = useState<LearningTrack | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<LearningTrackProgress | null>(() => getProgress(trackId));

  const load = useCallback(async () => {
    if (!trackId) return;
    setError(null);
    try {
      const t = await fetchTrack(trackId);
      setTrack(t);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not load track.');
    }
  }, [trackId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => onProgressChange(() => setProgress(getProgress(trackId))), [trackId]);

  const completed = useMemo(() => new Set(progress?.completedStages ?? []), [progress]);
  const totalStages = track?.stages.length ?? 0;
  const doneCount = completed.size;
  const pct = totalStages > 0 ? Math.round((doneCount / totalStages) * 100) : 0;

  const onEnroll = () => {
    enrollTrack(trackId);
  };

  const onToggle = (stageId: string) => {
    if (!progress) enrollTrack(trackId);
    toggleStageComplete(trackId, stageId);
  };

  const onReset = () => {
    if (confirm('Reset your progress on this track?')) resetTrack(trackId);
  };

  return (
    <main className="mx-auto max-w-3xl px-4 py-6 space-y-5 text-slate-100">
      <button
        onClick={() => navigate('/quran/tracks')}
        className="inline-flex items-center gap-1.5 text-sm text-[#D4A853] hover:text-[#E8C97A]"
      >
        <CaretLeft size={16} /> All tracks
      </button>

      {error && (
        <div
          role="alert"
          className="rounded-md border border-amber-400/40 bg-amber-50/10 p-4 text-sm text-amber-200"
        >
          {error}
        </div>
      )}

      {!track && !error && (
        <div className="space-y-2" aria-busy="true">
          <div className="h-10 rounded bg-white/5 animate-pulse w-2/3" />
          <div className="h-4 rounded bg-white/5 animate-pulse w-1/2" />
        </div>
      )}

      {track && (
        <>
          <header className="space-y-2">
            <h1 className="text-2xl font-semibold">{track.title}</h1>
            <p className="text-sm text-slate-400">{track.subtitle}</p>
            <p className="text-sm text-slate-300 leading-relaxed pt-2">{track.intro}</p>

            <div className="flex flex-wrap gap-1.5 pt-1">
              {track.scholar_attribution.map((s, i) => (
                <SourceCitationChip
                  key={`detail-src-${i}`}
                  citation={{ kind: 'book', book: s.book, author: s.author }}
                />
              ))}
            </div>

            <div className="flex items-center gap-3 pt-3">
              {!progress ? (
                <button
                  onClick={onEnroll}
                  className="rounded-md bg-primaryTeal px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                >
                  Start track
                </button>
              ) : (
                <>
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden" aria-label={`Progress ${pct}%`}>
                    <div className="h-full bg-primaryTeal" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="text-xs text-slate-400">
                    {doneCount} / {totalStages}
                  </span>
                  <button
                    onClick={onReset}
                    className="text-xs text-slate-400 hover:text-rose-300"
                  >
                    Reset
                  </button>
                </>
              )}
            </div>
          </header>

          <ol className="space-y-3">
            {track.stages.map((s, idx) => {
              const done = completed.has(s.id);
              return (
                <li
                  key={s.id}
                  className={`rounded-lg border p-4 space-y-3 ${
                    done
                      ? 'border-primaryTeal/40 bg-primaryTeal/5'
                      : 'border-white/10 bg-white/3'
                  }`}
                >
                  <header className="flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => onToggle(s.id)}
                      aria-label={done ? 'Mark incomplete' : 'Mark complete'}
                      className={done ? 'text-primaryTeal' : 'text-slate-500 hover:text-primaryTeal'}
                    >
                      {done ? <CheckCircle size={22} weight="fill" /> : <Circle size={22} />}
                    </button>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">
                        Stage {idx + 1}
                      </p>
                      <h3 className="text-base font-semibold">{s.title}</h3>
                      <p className="text-sm text-slate-300 leading-relaxed mt-1">{s.summary}</p>
                    </div>
                  </header>

                  {s.verses.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">Verses</p>
                      <div className="flex flex-wrap gap-1.5">
                        {s.verses.map((vk) => (
                          <button
                            key={vk}
                            onClick={() => {
                              const sid = vk.split(':')[0];
                              navigate(`/quran/read?surah=${sid}&verse=${vk}`);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs border border-primaryTeal/30 bg-primaryTeal/5 text-primaryTeal hover:bg-primaryTeal/15"
                          >
                            ☾ {vk}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {s.hadith_refs.length > 0 && (
                    <div className="space-y-1.5">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500">Hadith</p>
                      <div className="flex flex-wrap gap-1.5">
                        {s.hadith_refs.map((h, i) => (
                          <SourceCitationChip
                            key={`${s.id}-h-${i}`}
                            citation={{
                              kind: 'hadith',
                              collection: h.collection,
                              number: h.number,
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {s.reflection_prompt && (
                    <div className="rounded border border-white/10 bg-white/3 p-3">
                      <p className="text-[11px] uppercase tracking-wide text-slate-500 mb-1">
                        Reflection
                      </p>
                      <p className="text-sm text-slate-200 leading-relaxed italic">
                        {s.reflection_prompt}
                      </p>
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </>
      )}
    </main>
  );
}

export default QuranLearningTrackDetailPage;
