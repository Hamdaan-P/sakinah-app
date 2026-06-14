/**
 * Course-landing page — Udemy/Coursera-style.
 *
 * Layout:
 *   ┌─────────────────────────────────────────────────┐
 *   │  hero  (Arabic monogram + level + progress bar) │
 *   │  ── Course content ────────────────────────     │
 *   │  numbered lesson list (status icon + time)      │
 *   │  ── About this level ──────────────────         │
 *   │  ── References used ───────────────             │
 *   └─────────────────────────────────────────────────┘
 */

import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CaretLeft,
  CaretRight,
  CheckCircle,
  Clock,
  PlayCircle,
  BookOpen,
  Circle,
  GraduationCap,
} from '@phosphor-icons/react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { EimLoading } from '../components/EimLoading';
import { FetchError } from '../components/FetchError';
import { eimService } from '../services/eim.service';
import { useEimStore } from '../stores/eim.store';

export function EimLevelPage() {
  const { levelId } = useParams<{ levelId: string }>();
  const navigate = useNavigate();
  const lessonProgress = useEimStore((s) => s.lessonProgress);

  const { data: levels } = useQuery({
    queryKey: ['eim', 'levels'],
    queryFn: eimService.getLevels,
  });
  const lessonsQ = useQuery({
    queryKey: ['eim', 'lessons', levelId],
    queryFn: () => eimService.getLessons(levelId),
    enabled: !!levelId,
  });
  const lessons = useMemo(() => lessonsQ.data ?? [], [lessonsQ.data]);
  const isLoading = lessonsQ.isLoading;
  const level = levels?.find((l) => l.id === levelId);

  const totalMinutes = useMemo(
    () => lessons.reduce((acc, l) => acc + (l.minutes ?? 0), 0),
    [lessons],
  );
  const completedCount = lessons.filter((l) => lessonProgress[l.id]?.completedAt).length;
  const progressPct = lessons.length ? (completedCount / lessons.length) * 100 : 0;
  const nextLesson =
    lessons.find((l) => !lessonProgress[l.id]?.completedAt) ?? lessons[0];

  const allReferences = useMemo(() => {
    const set = new Set<string>();
    lessons.forEach((l) => l.references.forEach((r) => set.add(r)));
    return Array.from(set);
  }, [lessons]);

  return (
    <div className="min-h-screen bg-[#0F1724] pb-24">
      <div className="max-w-5xl mx-auto">
        {/* Top bar */}
        <header className="px-5 pt-5 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/eim/library')}
            aria-label="Back to library"
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853] hover:border-[rgba(212,168,83,0.35)]"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <div className="text-[11px] text-[#5C5749]">
            <button
              type="button"
              className="hover:text-[#D4A853] cursor-pointer bg-transparent border-0 p-0 text-inherit"
              onClick={() => navigate('/eim/library')}
            >
              Library
            </button>
            <span className="mx-1.5">›</span>
            <span className="text-[#D4A853]">Level {level?.order}</span>
          </div>
        </header>

        <DisclaimerBanner />

        {/* Hero card */}
        {level && (
          <section className="px-5 mt-3">
            <div
              className="rounded-2xl border border-[rgba(212,168,83,0.22)] overflow-hidden"
              style={{
                background:
                  'linear-gradient(135deg, rgba(212,168,83,0.10) 0%, rgba(42,157,111,0.05) 60%, rgba(15,23,36,0) 100%)',
              }}
            >
              <div className="p-5 sm:p-7 flex flex-col sm:flex-row gap-5 sm:gap-7 items-start">
                {/* Level monogram */}
                <div
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center shrink-0 border border-[rgba(212,168,83,0.30)]"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(212,168,83,0.18), rgba(42,157,111,0.10))',
                  }}
                >
                  <span
                    className="text-[#F5E8C7] font-extrabold"
                    style={{ fontSize: '38px' }}
                  >
                    {level.order}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[10px] uppercase tracking-widest text-[#D4A853] font-bold">
                      Level {level.order}
                    </span>
                    {level.is_specialization && (
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[rgba(123,158,137,0.18)] text-[#7BB39A] border border-[rgba(123,158,137,0.30)]">
                        🌿 Specialization
                      </span>
                    )}
                  </div>
                  <h1 className="text-[24px] sm:text-[28px] font-extrabold text-[#F5E8C7] leading-tight">
                    {level.title_en}
                  </h1>
                  <p className="text-[13px] text-[#7A7363] mt-2 leading-relaxed max-w-2xl">
                    {level.description}
                  </p>

                  {/* Stat row */}
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-[12px] text-[#7A7363]">
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={14} weight="bold" className="text-[#D4A853]" />
                      {lessons.length} lesson{lessons.length === 1 ? '' : 's'}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={14} weight="bold" className="text-[#D4A853]" />
                      {totalMinutes} min total
                    </div>
                    <div className="flex items-center gap-1.5">
                      <GraduationCap size={14} weight="bold" className="text-[#D4A853]" />
                      {completedCount}/{lessons.length} complete
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[10px] uppercase tracking-widest text-[#5C5749] font-semibold">
                        Your progress
                      </span>
                      <span className="text-[11px] font-bold text-[#D4A853]">
                        {Math.round(progressPct)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[rgba(212,168,83,0.10)] overflow-hidden">
                      <div
                        className="h-full transition-all"
                        style={{
                          width: `${progressPct}%`,
                          background: 'linear-gradient(90deg, #D4A853, #2A9D6F)',
                        }}
                      />
                    </div>
                  </div>

                  {/* CTA */}
                  {nextLesson && (
                    <button
                      onClick={() => navigate(`/eim/lesson/${nextLesson.id}`)}
                      className="mt-4 inline-flex items-center gap-2 h-11 px-5 rounded-xl text-[13px] font-bold text-[#0A0E16] transition-all hover:opacity-90"
                      style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
                    >
                      <PlayCircle size={18} weight="fill" />
                      {progressPct > 0 ? 'Continue learning' : 'Start this level'}
                      <CaretRight size={14} weight="bold" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Error / loading */}
        {lessonsQ.error && (
          <FetchError
            error={lessonsQ.error}
            retry={() => void lessonsQ.refetch()}
            context="lessons for this level"
          />
        )}
        {isLoading && <EimLoading label="Loading this level's lessons…" rows={4} />}

        {/* Course content */}
        <section className="px-5 mt-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="h-px flex-1 bg-[rgba(212,168,83,0.14)]" />
            <div className="text-[11px] uppercase tracking-widest font-bold text-[#D4A853]">
              Course Content
            </div>
            <div className="h-px flex-1 bg-[rgba(212,168,83,0.14)]" />
          </div>

          <div className="rounded-2xl border border-[rgba(212,168,83,0.14)] bg-[#101a2a] overflow-hidden">
            {lessons.map((lesson, idx) => {
              const done = !!lessonProgress[lesson.id]?.completedAt;
              const inProgress = !done && (lessonProgress[lesson.id]?.step ?? 0) > 0;
              return (
                <button
                  key={lesson.id}
                  onClick={() => navigate(`/eim/lesson/${lesson.id}`)}
                  className="w-full text-left px-4 py-3.5 flex items-center gap-4 border-b border-[rgba(212,168,83,0.08)] last:border-0 hover:bg-[rgba(212,168,83,0.04)] transition-all"
                >
                  {/* Status icon */}
                  <div className="shrink-0">
                    {done ? (
                      <CheckCircle size={22} weight="fill" color="#22C55E" />
                    ) : inProgress ? (
                      <PlayCircle size={22} weight="fill" color="#D4A853" />
                    ) : (
                      <Circle size={22} weight="bold" color="#3A4658" />
                    )}
                  </div>

                  {/* Lesson info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-[#5C5749]">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[14px] font-bold text-[#F5E8C7] truncate">
                        {lesson.title}
                      </span>
                    </div>
                    <div className="text-[11.5px] text-[#7A7363] mt-0.5 line-clamp-2">
                      {lesson.summary}
                    </div>
                    <div className="flex items-center gap-3 mt-1.5 text-[10.5px] text-[#5C5749]">
                      <span className="flex items-center gap-1">
                        <Clock size={11} weight="bold" />
                        {lesson.minutes} min
                      </span>
                      <span>·</span>
                      <span>{lesson.steps.length} step{lesson.steps.length === 1 ? '' : 's'}</span>
                      {done && (
                        <>
                          <span>·</span>
                          <span className="text-[#22C55E] font-semibold">Completed</span>
                        </>
                      )}
                      {inProgress && (
                        <>
                          <span>·</span>
                          <span className="text-[#D4A853] font-semibold">In progress</span>
                        </>
                      )}
                    </div>
                  </div>

                  <CaretRight size={14} weight="bold" className="text-[#5C5749] shrink-0" />
                </button>
              );
            })}
            {!isLoading && lessons.length === 0 && (
              <div className="px-4 py-8 text-center text-[12px] text-[#5C5749]">
                No lessons yet. Check back soon.
              </div>
            )}
          </div>
        </section>

        {/* About this level */}
        {level && (
          <section className="px-5 mt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-[rgba(212,168,83,0.14)]" />
              <div className="text-[11px] uppercase tracking-widest font-bold text-[#D4A853]">
                About this level
              </div>
              <div className="h-px flex-1 bg-[rgba(212,168,83,0.14)]" />
            </div>
            <div className="rounded-xl border border-[rgba(212,168,83,0.12)] bg-[rgba(212,168,83,0.03)] p-4 text-[13px] text-[#7A7363] leading-relaxed">
              {level.description}
            </div>
          </section>
        )}

        {/* References */}
        {allReferences.length > 0 && (
          <section className="px-5 mt-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-[rgba(212,168,83,0.14)]" />
              <div className="text-[11px] uppercase tracking-widest font-bold text-[#D4A853]">
                Sources & References
              </div>
              <div className="h-px flex-1 bg-[rgba(212,168,83,0.14)]" />
            </div>
            <div className="rounded-xl border border-[rgba(212,168,83,0.12)] bg-[rgba(212,168,83,0.03)] p-4">
              <ul className="space-y-1.5 text-[12px] text-[#7A7363]">
                {allReferences.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="text-[#D4A853]">·</span>
                    <span className="leading-relaxed">{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

export default EimLevelPage;
