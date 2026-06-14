/**
 * Lesson reader — Udemy/Coursera-style.
 *
 * Layout (desktop):
 *   ┌─────────────────────────┬───────────────────────┐
 *   │  main content area      │  left rail            │
 *   │                         │  (lessons in level)   │
 *   │  step header            │  ── progress          │
 *   │  step body              │  · 01 Money & Riba    │
 *   │  visual blocks          │  · 02 Time value (▶)  │
 *   │  Halal Lens (if any)    │  · 03 Inflation       │
 *   │                         │  · 04 …               │
 *   │  prev / next buttons    │                       │
 *   └─────────────────────────┴───────────────────────┘
 *
 * Mobile: left rail collapses to a top dropdown.
 *
 * Final-quiz gate: after the last content step, a 3-MCQ quiz must be passed
 * (all three correct in one attempt) before the lesson is marked complete and
 * the user is auto-advanced to the next sibling. Any wrong answer shows
 * inline feedback and requires retaking the whole quiz.
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CaretLeft,
  CaretRight,
  CheckCircle,
  Circle,
  PlayCircle,
  ListBullets,
  X,
  ArrowClockwise,
} from '@phosphor-icons/react';
import { scrollMainToTop } from '@/lib/scroll';
import { eimTrack } from '../analytics';
import { ContentBlocks } from '../components/ContentBlocks';
import { EimLoading } from '../components/EimLoading';
import { FetchError } from '../components/FetchError';
import { HalalLensBlock } from '../components/HalalLensBlock';
import { TarbiyahCard } from '../components/TarbiyahCard';
import { YouTubeEmbed } from '../components/YouTubeEmbed';
import { useEimDinarz } from '../hooks/useEimDinarz';
import { useEimStreakHeartbeat } from '../hooks/useEimStreakHeartbeat';
import { eimService } from '../services/eim.service';
import { useEimStore } from '../stores/eim.store';

const QUIZ_SIZE = 3;

export function EimLessonPage() {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const setLessonStep = useEimStore((s) => s.setLessonStep);
  const completeLesson = useEimStore((s) => s.completeLesson);
  const lessonProgress = useEimStore((s) => s.lessonProgress);
  const persistedStep = lessonId ? lessonProgress[lessonId]?.step ?? 0 : 0;
  const [step, setStep] = useState(persistedStep);
  const [showSidebar, setShowSidebar] = useState(false);

  // Quiz state — fresh on every (re)entry to a lesson.
  const [inQuiz, setInQuiz] = useState(false);
  const [answers, setAnswers] = useState<(number | null)[]>(() =>
    Array(QUIZ_SIZE).fill(null),
  );
  const [submitted, setSubmitted] = useState(false);

  const { claim: claimDinarz } = useEimDinarz();
  useEimStreakHeartbeat();

  // P10 analytics — fire `eim_lesson_started` once per (mount, lessonId).
  const startedRef = useRef<string | null>(null);
  useEffect(() => {
    if (lessonId && startedRef.current !== lessonId) {
      startedRef.current = lessonId;
      eimTrack('eim_lesson_started');
    }
  }, [lessonId]);

  // Reset quiz state whenever the lesson changes — never let stale answers
  // leak between lessons, and never auto-resume mid-quiz.
  //
  // Also resync `step` from the new lesson's persisted progress. Without this,
  // the previous lesson's step index leaks across route changes (the route
  // pattern is identical, so the component is not remounted) and lands the
  // user on the last step of the next lesson after passing the quiz.
  useEffect(() => {
    setInQuiz(false);
    setAnswers(Array(QUIZ_SIZE).fill(null));
    setSubmitted(false);
    if (lessonId) {
      const resumeAt = useEimStore.getState().lessonProgress[lessonId]?.step ?? 0;
      setStep(resumeAt);
    } else {
      setStep(0);
    }
    // Land the reader at the top of the new lesson. Without this, the page
    // keeps the previous lesson's scroll position (the route pattern is
    // identical so the component is not remounted) — readers reported
    // landing on the bottom of the page when opening a lesson.
    // (window.scrollTo was a no-op — body is overflow-hidden, <main> scrolls.)
    scrollMainToTop();
  }, [lessonId]);

  // Scroll to top whenever the visible content changes — stepping forward/
  // back, entering or leaving the quiz. The header is sticky so the reader
  // stays oriented; without this they have to manually scroll up every time.
  useEffect(() => {
    scrollMainToTop();
  }, [step, inQuiz]);

  const lessonQ = useQuery({
    queryKey: ['eim', 'lesson', lessonId],
    queryFn: () => eimService.getLesson(lessonId!),
    enabled: !!lessonId,
  });
  const lesson = lessonQ.data;

  // Sibling lessons in the same level for the left rail
  const siblingsQ = useQuery({
    queryKey: ['eim', 'lessons', lesson?.level_id],
    queryFn: () => eimService.getLessons(lesson?.level_id),
    enabled: !!lesson?.level_id,
  });
  const siblings = siblingsQ.data ?? [];
  const currentIdx = siblings.findIndex((l) => l.id === lessonId);

  if (lessonQ.error) {
    return (
      <div className="min-h-screen bg-[#0F1724] pt-6">
        <FetchError
          error={lessonQ.error}
          retry={() => void lessonQ.refetch()}
          context="this lesson"
        />
      </div>
    );
  }

  if (lessonQ.isLoading || !lesson) {
    return (
      <div className="min-h-screen bg-[#0F1724] pt-6">
        <div className="max-w-2xl mx-auto">
          <EimLoading label="Opening your lesson…" rows={1} />
          <div className="mt-3 px-3 space-y-3">
            <div className="h-5 w-2/3 rounded-full bg-[rgba(212,168,83,0.10)] animate-pulse mx-auto" />
            <div className="h-3 w-full rounded-full bg-[rgba(212,168,83,0.06)] animate-pulse" />
            <div className="h-3 w-5/6 rounded-full bg-[rgba(212,168,83,0.06)] animate-pulse" />
            <div className="h-3 w-4/6 rounded-full bg-[rgba(212,168,83,0.06)] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  const total = lesson.steps.length;
  const safeStep = Math.min(step, total - 1);
  const current = lesson.steps[safeStep];
  const isLastContentStep = safeStep === total - 1;
  const quiz = lesson.final_quiz ?? [];
  const hasQuiz = quiz.length === QUIZ_SIZE;
  const alreadyCompleted = !!lessonProgress[lesson.id]?.completedAt;

  // Quiz scoring — only meaningful once `submitted` is true.
  const correctCount = answers.reduce<number>(
    (acc, a, i) => (a !== null && quiz[i] && a === quiz[i].answer_idx ? acc + 1 : acc),
    0,
  );
  const allAnswered = answers.every((a) => a !== null);
  const passed = submitted && correctCount === QUIZ_SIZE;
  const failed = submitted && correctCount < QUIZ_SIZE;

  const enterQuiz = () => {
    setAnswers(Array(QUIZ_SIZE).fill(null));
    setSubmitted(false);
    setInQuiz(true);
  };

  const exitQuiz = () => {
    setInQuiz(false);
    setSubmitted(false);
  };

  const submitQuiz = () => {
    if (!allAnswered) return;
    setSubmitted(true);
    const allCorrect = answers.every(
      (a, i) => a !== null && quiz[i] && a === quiz[i].answer_idx,
    );
    if (allCorrect) {
      completeLesson(lesson.id);
      // Fire-and-forget Dinarz claim. Idempotent server-side, so a re-completion
      // safely returns "Already claimed" without double-awarding.
      void claimDinarz('lesson_complete', lesson.id);
      eimTrack('eim_lesson_completed');
    }
  };

  const retakeQuiz = () => {
    setAnswers(Array(QUIZ_SIZE).fill(null));
    setSubmitted(false);
  };

  const goToNextSibling = () => {
    const next = siblings[currentIdx + 1];
    if (next) {
      navigate(`/eim/lesson/${next.id}`);
    } else {
      eimTrack('eim_level_completed');
      navigate(`/eim/library/${lesson.level_id}`);
    }
  };

  const advance = () => {
    if (isLastContentStep) {
      // End of content. If a final quiz exists, gate completion behind it.
      if (hasQuiz) {
        enterQuiz();
        return;
      }
      // No quiz authored — fall back to direct completion (legacy behaviour).
      completeLesson(lesson.id);
      void claimDinarz('lesson_complete', lesson.id);
      eimTrack('eim_lesson_completed');
      goToNextSibling();
      return;
    }
    const ns = safeStep + 1;
    setStep(ns);
    if (lessonId) setLessonStep(lessonId, ns);
  };

  const goBack = () => {
    if (inQuiz) {
      exitQuiz();
      return;
    }
    if (safeStep === 0) return;
    const ns = safeStep - 1;
    setStep(ns);
    if (lessonId) setLessonStep(lessonId, ns);
  };

  const goToLesson = (id: string) => {
    setShowSidebar(false);
    if (id !== lessonId) {
      navigate(`/eim/lesson/${id}`);
      setStep(0);
    }
  };

  // Progress bar shows 100% during the quiz; otherwise scales with content step.
  const progressPct = inQuiz ? 100 : ((safeStep + 1) / total) * 100;

  // Left-rail content (reused on mobile drawer)
  const sidebarContent = (
    <div className="space-y-1">
      <div className="px-3 py-2 text-[10px] uppercase tracking-widest font-bold text-[#D4A853]">
        Lessons in this level
      </div>
      {siblings.map((l, idx) => {
        const isActive = l.id === lessonId;
        const done = !!lessonProgress[l.id]?.completedAt;
        return (
          <button
            key={l.id}
            onClick={() => goToLesson(l.id)}
            className="w-full text-left rounded-lg px-3 py-2.5 flex items-start gap-2.5 transition-all hover:bg-[rgba(212,168,83,0.06)]"
            style={{
              background: isActive ? 'rgba(212,168,83,0.08)' : 'transparent',
              borderLeft: isActive ? '3px solid #D4A853' : '3px solid transparent',
            }}
          >
            <div className="shrink-0 mt-0.5">
              {done ? (
                <CheckCircle size={16} weight="fill" color="#22C55E" />
              ) : isActive ? (
                <PlayCircle size={16} weight="fill" color="#D4A853" />
              ) : (
                <Circle size={16} weight="bold" color="#3A4658" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-[#5C5749] mb-0.5">
                {String(idx + 1).padStart(2, '0')} · {l.minutes} min
              </div>
              <div
                className={`text-[12.5px] font-semibold leading-tight ${
                  isActive ? 'text-[#F5E8C7]' : 'text-[#7A7363]'
                }`}
              >
                {l.title}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );

  // ── Quiz view ────────────────────────────────────────────────────────────
  const QuizView = () => (
    <article className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-5 sm:p-7">
      <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-bold mb-2">
        Final quiz · {QUIZ_SIZE} questions
      </div>
      <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#F5E8C7] leading-tight">
        Pass all 3 to unlock the next lesson
      </h2>
      <p className="mt-2 text-[13px] text-[#7A7363] leading-relaxed">
        Any wrong answer means retaking the whole quiz. Take your time —
        re-read the lesson if you need to.
      </p>

      {passed && (
        <div
          className="mt-5 rounded-xl border p-4 flex items-start gap-3"
          style={{
            background: 'rgba(34,197,94,0.08)',
            borderColor: 'rgba(34,197,94,0.35)',
          }}
        >
          <CheckCircle size={22} weight="fill" color="#22C55E" />
          <div>
            <div className="text-[14px] font-bold text-[#86EFAC]">
              All 3 correct — lesson complete
            </div>
            <div className="text-[12.5px] text-[#7A7363] mt-0.5">
              Nice work. Dinarz claim sent. Continue to the next lesson when ready.
            </div>
          </div>
        </div>
      )}

      {failed && (
        <div
          className="mt-5 rounded-xl border p-4 flex items-start gap-3"
          style={{
            background: 'rgba(239,68,68,0.08)',
            borderColor: 'rgba(239,68,68,0.30)',
          }}
        >
          <X size={22} weight="bold" color="#F87171" />
          <div>
            <div className="text-[14px] font-bold text-[#FCA5A5]">
              {correctCount} of {QUIZ_SIZE} correct — retake required
            </div>
            <div className="text-[12.5px] text-[#7A7363] mt-0.5">
              The correct answers are highlighted below. Read the explanations,
              then retake the whole quiz to pass.
            </div>
          </div>
        </div>
      )}

      <div className="mt-6 space-y-6">
        {quiz.map((q, qi) => {
          const userAnswer = answers[qi];
          const correctIdx = q.answer_idx;
          return (
            <div
              key={qi}
              className="rounded-xl border border-[rgba(212,168,83,0.14)] bg-[rgba(212,168,83,0.03)] p-4 sm:p-5"
            >
              <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-bold mb-1.5">
                Question {qi + 1} of {QUIZ_SIZE}
              </div>
              <div className="text-[14.5px] font-semibold text-[#F5E8C7] leading-snug">
                {q.question}
              </div>
              <div className="mt-3 space-y-2">
                {q.options.map((opt, oi) => {
                  const isSelected = userAnswer === oi;
                  const isCorrect = oi === correctIdx;
                  const isWrongSelection = submitted && isSelected && !isCorrect;
                  const showAsCorrect = submitted && isCorrect;

                  let borderColor = 'rgba(212,168,83,0.18)';
                  let bg = 'transparent';
                  let textColor = '#D1D9E5';
                  if (showAsCorrect) {
                    borderColor = 'rgba(34,197,94,0.50)';
                    bg = 'rgba(34,197,94,0.10)';
                    textColor = '#BBF7D0';
                  } else if (isWrongSelection) {
                    borderColor = 'rgba(239,68,68,0.50)';
                    bg = 'rgba(239,68,68,0.10)';
                    textColor = '#FCA5A5';
                  } else if (isSelected) {
                    borderColor = 'rgba(212,168,83,0.55)';
                    bg = 'rgba(212,168,83,0.10)';
                    textColor = '#F5E8C7';
                  }

                  return (
                    <button
                      key={oi}
                      type="button"
                      onClick={() => {
                        if (submitted) return;
                        setAnswers((prev) => {
                          const next = [...prev];
                          next[qi] = oi;
                          return next;
                        });
                      }}
                      disabled={submitted}
                      className="w-full text-left rounded-lg border px-3.5 py-2.5 flex items-start gap-2.5 transition-all disabled:cursor-default"
                      style={{ borderColor, background: bg, color: textColor }}
                    >
                      <div
                        className="shrink-0 w-5 h-5 rounded-full border flex items-center justify-center mt-0.5"
                        style={{
                          borderColor:
                            showAsCorrect
                              ? '#22C55E'
                              : isWrongSelection
                                ? '#F87171'
                                : isSelected
                                  ? '#D4A853'
                                  : '#3A4658',
                          background:
                            showAsCorrect
                              ? '#22C55E'
                              : isSelected && !isWrongSelection
                                ? '#D4A853'
                                : 'transparent',
                        }}
                      >
                        {(showAsCorrect || (isSelected && !submitted)) && (
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{
                              background: showAsCorrect ? '#FFFFFF' : '#101a2a',
                            }}
                          />
                        )}
                      </div>
                      <div className="text-[13.5px] leading-snug">{opt}</div>
                    </button>
                  );
                })}
              </div>

              {submitted && (
                <div className="mt-3 rounded-lg bg-[rgba(212,168,83,0.05)] border border-[rgba(212,168,83,0.18)] p-3 text-[12.5px] text-[#7A7363] leading-relaxed">
                  <span className="text-[#D4A853] font-bold">Why: </span>
                  {q.explanation}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Quiz action area */}
      <div className="mt-6 flex flex-col sm:flex-row gap-3 sm:items-center">
        {!submitted && (
          <button
            onClick={submitQuiz}
            disabled={!allAnswered}
            className="h-11 px-5 rounded-xl text-[13px] font-bold text-[#0A0E16] transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
            style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
          >
            Submit answers
            <CaretRight size={14} weight="bold" />
          </button>
        )}
        {failed && (
          <button
            onClick={retakeQuiz}
            className="h-11 px-5 rounded-xl text-[13px] font-bold transition-all hover:opacity-90 flex items-center justify-center gap-1.5 border"
            style={{
              background: 'rgba(212,168,83,0.10)',
              borderColor: 'rgba(212,168,83,0.45)',
              color: '#F5E8C7',
            }}
          >
            <ArrowClockwise size={14} weight="bold" />
            Retake the whole quiz
          </button>
        )}
        {passed && (
          <button
            onClick={goToNextSibling}
            className="h-11 px-5 rounded-xl text-[13px] font-bold text-[#0A0E16] transition-all hover:opacity-90 flex items-center justify-center gap-1.5"
            style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
          >
            {siblings[currentIdx + 1] ? 'Next lesson' : 'Finish level'}
            <CaretRight size={14} weight="bold" />
          </button>
        )}
        <div className="text-[11.5px] text-[#5C5749] sm:ml-auto">
          {!submitted &&
            (allAnswered ? 'Ready to submit' : `Pick one option in each question`)}
          {failed && 'Wrong answers reset on retake — all 3 needed in one attempt'}
        </div>
      </div>
    </article>
  );

  return (
    // pb on mobile clears BOTH stacks: the lesson's own action bar (~4.25rem)
    // AND the global MainLayout BottomNavBar (h-16 + safe-area-inset-bottom).
    // On md+ the global nav is hidden, so only the action bar needs clearance.
    <div className="min-h-screen bg-[#0F1724] pb-[calc(9rem+env(safe-area-inset-bottom,0px))] md:pb-32">
      {/* Top bar */}
      <header className="sticky top-0 z-20 backdrop-blur-md bg-[rgba(15,23,36,0.85)] border-b border-[rgba(212,168,83,0.12)]">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            aria-label="Back to level"
            onClick={() => navigate(`/eim/library/${lesson.level_id}`)}
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853] hover:border-[rgba(212,168,83,0.35)]"
          >
            <CaretLeft size={16} weight="bold" aria-hidden="true" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
              Lesson · {lesson.minutes} min ·{' '}
              {inQuiz ? 'Final quiz' : `Step ${safeStep + 1} of ${total}`}
            </div>
            <h1 className="text-[14px] font-bold text-[#F5E8C7] truncate">{lesson.title}</h1>
          </div>
          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setShowSidebar(true)}
            className="lg:hidden w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853]"
          >
            <ListBullets size={16} weight="bold" />
          </button>
        </div>
        {/* Step progress bar */}
        <div className="h-1 bg-[rgba(212,168,83,0.10)] overflow-hidden">
          <div
            className="h-full transition-all"
            style={{
              width: `${progressPct}%`,
              background: 'linear-gradient(90deg, #D4A853, #2A9D6F)',
            }}
          />
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 pt-5 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
        {/* Main content */}
        <main>
          {inQuiz ? (
            <QuizView />
          ) : (
            <>
              {/* Companion video — shown once at the top of the first step
                  ("watch then read"), only when the lesson has a video_url. */}
              {safeStep === 0 && lesson.video_url && (
                <div className="mb-4">
                  <YouTubeEmbed
                    url={lesson.video_url}
                    title={lesson.title}
                    label="Watch first"
                  />
                </div>
              )}

              <article className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-5 sm:p-7">
                <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-bold mb-2">
                  {String(safeStep + 1).padStart(2, '0')} · {lesson.title}
                </div>
                <h2 className="text-[20px] sm:text-[22px] font-extrabold text-[#F5E8C7] leading-tight">
                  {current.heading}
                </h2>
                {/* max-w caps the line length (~66ch) for comfortable long-form
                    reading; only the prose is constrained, not the visual blocks. */}
                <div className="mt-3 text-[14.5px] text-[#D1D9E5] leading-[1.75] whitespace-pre-line max-w-[66ch]">
                  {current.body}
                </div>

                {/* Visual blocks */}
                <ContentBlocks blocks={current.blocks} />

                {/* Halal Lens (renders last so the Islamic framing closes the step) */}
                {current.halal_lens && <HalalLensBlock lens={current.halal_lens} />}
              </article>

              {/* Last-step extras */}
              {isLastContentStep && lesson.tarbiyah && (
                <div className="mt-4">
                  <TarbiyahCard verse={lesson.tarbiyah} />
                </div>
              )}

              {isLastContentStep && lesson.references.length > 0 && (
                <div className="mt-4 rounded-xl border border-[rgba(212,168,83,0.14)] bg-[rgba(212,168,83,0.03)] p-4">
                  <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-bold mb-2">
                    📚 Sources cited in this lesson
                  </div>
                  <ul className="space-y-1.5 text-[12px] text-[#7A7363]">
                    {lesson.references.map((r, i) => (
                      <li key={i} className="flex gap-2 leading-relaxed">
                        <span className="text-[#D4A853]">·</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quiz preview / retake entry for already-passed lessons */}
              {isLastContentStep && hasQuiz && alreadyCompleted && (
                <div className="mt-4 rounded-xl border border-[rgba(34,197,94,0.30)] bg-[rgba(34,197,94,0.05)] p-4 flex items-center gap-3">
                  <CheckCircle size={20} weight="fill" color="#22C55E" />
                  <div className="flex-1 text-[12.5px] text-[#BBF7D0]">
                    You've already passed this lesson's quiz. Use{' '}
                    <span className="font-bold">Retake quiz</span> below to review,
                    or jump straight to the next lesson.
                  </div>
                </div>
              )}
            </>
          )}
        </main>

        {/* Desktop left rail */}
        <aside className="hidden lg:block">
          <div className="sticky top-[88px] rounded-2xl border border-[rgba(212,168,83,0.14)] bg-[#101a2a] p-2 max-h-[calc(100vh-110px)] overflow-y-auto">
            {sidebarContent}
          </div>
        </aside>
      </div>

      {/* Mobile sidebar drawer */}
      {showSidebar && (
        <div
          className="lg:hidden fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowSidebar(false)}
          onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') setShowSidebar(false); }}
          role="button"
          tabIndex={0}
          aria-label="Close lesson list"
        >
          <div
            className="absolute right-0 top-0 h-full w-[85%] max-w-sm bg-[#101a2a] border-l border-[rgba(212,168,83,0.18)] p-3 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => e.stopPropagation()}
            role="presentation"
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <div className="text-[12px] font-bold text-[#F5E8C7]">Lesson list</div>
              <button
                onClick={() => setShowSidebar(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C5749] hover:text-[#F5E8C7]"
              >
                <X size={16} weight="bold" />
              </button>
            </div>
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Sticky bottom nav bar.
          On mobile we sit ABOVE the global BottomNavBar (h-16 + safe-area) so
          the Prev/Next/Take-quiz controls aren't covered by the app's tab bar.
          On md+ the global nav is hidden, so we anchor to bottom-0.
          z-30 keeps us below the global nav (z-40) so the user can still tap
          their way out to other features without the lesson bar blocking. */}
      <div
        className="fixed left-0 right-0 z-30 backdrop-blur-md bg-[rgba(15,23,36,0.92)] border-t border-[rgba(212,168,83,0.14)] bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] md:bottom-0"
      >
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3">
          <button
            onClick={goBack}
            disabled={!inQuiz && safeStep === 0}
            aria-label={inQuiz ? 'Back to lesson' : 'Previous step'}
            className="shrink-0 h-11 px-3 sm:px-4 rounded-xl bg-[#101a2a] border border-[rgba(212,168,83,0.18)] text-[12px] text-[#7A7363] disabled:opacity-30 hover:border-[rgba(212,168,83,0.35)] transition-all flex items-center gap-1.5"
          >
            <CaretLeft size={14} weight="bold" />
            <span className="hidden sm:inline">
              {inQuiz ? 'Back to lesson' : 'Previous'}
            </span>
          </button>
          <div className="hidden sm:block flex-1 text-center text-[11px] text-[#5C5749]">
            {inQuiz
              ? passed
                ? 'Quiz passed'
                : failed
                  ? `${correctCount} / ${QUIZ_SIZE} correct`
                  : `Final quiz · ${answers.filter((a) => a !== null).length} / ${QUIZ_SIZE} answered`
              : `Step ${safeStep + 1} / ${total}`}
          </div>
          {/* Mobile-only spacer keeps the primary CTA right-aligned */}
          <div className="flex-1 sm:hidden" />
          {!inQuiz && (
            <button
              onClick={advance}
              className="shrink-0 h-11 px-4 sm:px-5 rounded-xl text-[13px] font-bold text-[#0A0E16] transition-all hover:opacity-90 flex items-center gap-1.5"
              style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)' }}
            >
              <span className="whitespace-nowrap">
                {isLastContentStep
                  ? hasQuiz
                    ? alreadyCompleted
                      ? 'Retake quiz'
                      : 'Take the quiz'
                    : '✓ Complete'
                  : 'Next'}
              </span>
              <CaretRight size={14} weight="bold" />
            </button>
          )}
          {inQuiz && alreadyCompleted && (
            <button
              onClick={goToNextSibling}
              aria-label="Skip to next lesson"
              className="shrink-0 h-11 px-3 sm:px-4 rounded-xl border text-[12px] font-bold transition-all hover:opacity-90 flex items-center gap-1.5"
              style={{
                background: 'rgba(34,197,94,0.10)',
                borderColor: 'rgba(34,197,94,0.40)',
                color: '#BBF7D0',
              }}
            >
              <span className="hidden sm:inline">Skip to next</span>
              <span className="sm:hidden">Skip</span>
              <CaretRight size={14} weight="bold" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default EimLessonPage;
