/**
 * Course landing — Lessons (5 progression levels + Halal Mastery) | Playbook
 * (famous-investor applied processes). Tab switcher at top per D19.
 * Route stays /eim/library for backwards-compat; user-facing label is "Course".
 */

import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CaretLeft,
  CaretRight,
  CheckCircle,
  LockOpen,
  BookOpen,
  GraduationCap,
} from '@phosphor-icons/react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { EimLoading } from '../components/EimLoading';
import { FeatureIntro } from '../components/FeatureIntro';
import { FetchError } from '../components/FetchError';
import { PLAYBOOKS } from '../data/knowledge-bank';
import { eimService } from '../services/eim.service';
import { useEimStore } from '../stores/eim.store';

type CourseTab = 'lessons' | 'playbook';

export function EimLibraryPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lessonProgress = useEimStore((s) => s.lessonProgress);
  const initialTab: CourseTab = searchParams.get('tab') === 'playbook' ? 'playbook' : 'lessons';
  const [tab, setTab] = useState<CourseTab>(initialTab);

  const levelsQ = useQuery({
    queryKey: ['eim', 'levels'],
    queryFn: eimService.getLevels,
  });
  const lessonsQ = useQuery({
    queryKey: ['eim', 'lessons'],
    queryFn: () => eimService.getLessons(),
  });
  const levels = levelsQ.data;
  const lessons = lessonsQ.data;
  const isLoading = levelsQ.isLoading;
  const error = levelsQ.error ?? lessonsQ.error;

  const lessonsByLevel = (levelId: string) =>
    (lessons ?? []).filter((l) => l.level_id === levelId);

  const completedInLevel = (levelId: string) =>
    lessonsByLevel(levelId).filter((l) => lessonProgress[l.id]?.completedAt).length;

  // The "current" mainline level = first (by order) not yet fully complete.
  // Drives a "Continue / Start here" cue so the user always knows where they
  // are in the journey — consistent with the Home hero + Level page.
  const mainlineLevels = (levels ?? [])
    .filter((l) => !l.is_specialization)
    .sort((a, b) => a.order - b.order);
  const currentLevelId = mainlineLevels.find((l) => {
    const t = lessonsByLevel(l.id).length;
    return t === 0 || completedInLevel(l.id) < t;
  })?.id;

  return (
    <div className="min-h-screen bg-[#0F1724] pb-24">
      <div className="max-w-3xl mx-auto">
        <header className="px-5 pt-5 pb-2 flex items-center gap-3">
          <button
            onClick={() => navigate('/eim')}
            className="w-9 h-9 rounded-lg bg-[#101a2a] border border-[rgba(212,168,83,0.18)] flex items-center justify-center text-[#D4A853] hover:border-[rgba(212,168,83,0.35)]"
          >
            <CaretLeft size={16} weight="bold" />
          </button>
          <div className="flex-1">
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749]">
              EIM · The School
            </div>
            <h1 className="text-[20px] font-bold text-[#F5E8C7]">Course — Madrasa</h1>
            <p className="text-[11px] text-[#7A7363] mt-0.5">
              Structured course on halal investing — 5 levels + Halal Mastery
            </p>
          </div>
          <FeatureIntro featureId="course" />
        </header>

        <DisclaimerBanner />

        {/* Tab switcher — Lessons | Playbook (per master plan D19) */}
        <div className="px-3 mt-3">
          <div
            role="tablist"
            aria-label="Course content type"
            className="rounded-xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-1 grid grid-cols-2 gap-1"
          >
            <button
              role="tab"
              id="library-tab-lessons"
              aria-selected={tab === 'lessons'}
              aria-controls="library-tabpanel-lessons"
              onClick={() => setTab('lessons')}
              className="h-10 rounded-lg text-[12.5px] font-bold flex items-center justify-center gap-2 transition-all"
              style={{
                background:
                  tab === 'lessons'
                    ? 'linear-gradient(90deg, #D4A853, #E8C97A)'
                    : 'transparent',
                color: tab === 'lessons' ? '#0A0E16' : '#7A7363',
              }}
            >
              <GraduationCap size={14} weight="bold" aria-hidden="true" />
              Lessons
            </button>
            <button
              role="tab"
              id="library-tab-playbook"
              aria-selected={tab === 'playbook'}
              aria-controls="library-tabpanel-playbook"
              onClick={() => setTab('playbook')}
              className="h-10 rounded-lg text-[12.5px] font-bold flex items-center justify-center gap-2 transition-all"
              style={{
                background:
                  tab === 'playbook'
                    ? 'linear-gradient(90deg, #D4A853, #E8C97A)'
                    : 'transparent',
                color: tab === 'playbook' ? '#0A0E16' : '#7A7363',
              }}
            >
              <BookOpen size={14} weight="bold" aria-hidden="true" />
              Playbook
            </button>
          </div>
        </div>

        {/* PLAYBOOK TAB — investor applied processes */}
        {tab === 'playbook' && (
          <div
            role="tabpanel"
            id="library-tabpanel-playbook"
            aria-labelledby="library-tab-playbook"
            className="px-3 mt-4 space-y-2.5"
          >
            <div className="px-2 mb-2 text-[12px] text-[#7A7363] leading-relaxed">
              Famous investors' personal applied processes — overlaid with the Halal Lens
              (what applies as-is, what needs modification, what is forbidden). The
              framework is the lesson; the personal portfolio is not endorsed.
            </div>
            {PLAYBOOKS.map((pb) => (
              <button
                key={pb.id}
                onClick={() => navigate(`/eim/playbook/${pb.id}`)}
                className="w-full text-left rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] hover:border-[rgba(212,168,83,0.35)] transition-all p-4"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-[rgba(212,168,83,0.30)] text-[#F5E8C7] font-extrabold text-[18px]"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(212,168,83,0.18), rgba(42,157,111,0.08))',
                    }}
                  >
                    {pb.name
                      .split(' ')
                      .map((s) => s[0])
                      .slice(0, 2)
                      .join('')}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] uppercase tracking-widest text-[#D4A853] font-bold mb-0.5">
                      {pb.years_active}
                    </div>
                    <div className="text-[15px] font-bold text-[#F5E8C7]">{pb.name}</div>
                    <div className="text-[11.5px] text-[#7A7363] mt-0.5 line-clamp-2">
                      {pb.framework}
                    </div>
                    <div className="text-[10px] text-[#5C5749] mt-1.5">
                      {pb.minutes} min · {pb.principles.length} principles ·{' '}
                      {pb.case_studies.length} cases
                    </div>
                  </div>
                  <CaretRight size={14} weight="bold" className="text-[#5C5749] shrink-0" />
                </div>
              </button>
            ))}
          </div>
        )}

        {/* LESSONS TAB — the existing 6-level structure */}
        {tab === 'lessons' && error && (
          <FetchError
            error={error}
            retry={() => {
              void levelsQ.refetch();
              void lessonsQ.refetch();
            }}
            context="the learning library"
          />
        )}
        {tab === 'lessons' && isLoading && (
          <EimLoading label="Opening the Madrasa — laying out your levels…" rows={4} />
        )}

        {tab === 'lessons' && (
        <div
          role="tabpanel"
          id="library-tabpanel-lessons"
          aria-labelledby="library-tab-lessons"
          className="px-3 mt-4 space-y-2.5"
        >
          {mainlineLevels.map((lvl) => {
              const total = lessonsByLevel(lvl.id).length;
              const done = completedInLevel(lvl.id);
              const pct = total > 0 ? (done / total) * 100 : 0;
              const isComplete = total > 0 && done === total;
              const isCurrent = lvl.id === currentLevelId;
              return (
                <button
                  key={lvl.id}
                  onClick={() => navigate(`/eim/library/${lvl.id}`)}
                  className={
                    'w-full text-left rounded-2xl border bg-[#101a2a] transition-all p-4 ' +
                    (isCurrent
                      ? 'border-[rgba(212,168,83,0.45)] hover:border-[rgba(212,168,83,0.65)]'
                      : 'border-[rgba(212,168,83,0.18)] hover:border-[rgba(212,168,83,0.35)]')
                  }
                >
                  <div className="flex items-center gap-4">
                    <div
                      className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-[rgba(212,168,83,0.30)] relative"
                      style={{
                        background: 'linear-gradient(135deg, rgba(212,168,83,0.15), rgba(42,157,111,0.05))',
                      }}
                    >
                      <span
                        className="text-[#F5E8C7] font-extrabold"
                        style={{ fontSize: '22px' }}
                      >
                        {lvl.order}
                      </span>
                      {isComplete && (
                        <span className="absolute -top-1.5 -right-1.5">
                          <CheckCircle size={18} weight="fill" color="#22C55E" />
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-[10px] uppercase tracking-widest text-[#D4A853] font-semibold">
                          Level {lvl.order}
                        </span>
                        {isCurrent && !isComplete && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide bg-[rgba(212,168,83,0.18)] text-[#D4A853]">
                            {pct > 0 ? 'Continue' : 'Start here'}
                          </span>
                        )}
                      </div>
                      <div className="text-[15px] font-bold text-[#F5E8C7]">{lvl.title_en}</div>
                      <div className="text-[11px] text-[#7A7363] mt-0.5 line-clamp-2">
                        {lvl.description}
                      </div>
                      {/* Progress bar — consistent with the Level page + Home hero. */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-[rgba(212,168,83,0.10)] overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: 'linear-gradient(90deg, #D4A853, #2A9D6F)',
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-[#5C5749] tabular-nums shrink-0">
                          {done}/{total}
                        </span>
                      </div>
                    </div>
                    <CaretRight size={14} weight="bold" className="text-[#5C5749] shrink-0" />
                  </div>
                </button>
              );
            })}

          {/* Halal Mastery specialization */}
          {(levels ?? [])
            .filter((l) => l.is_specialization)
            .map((lvl) => {
              const lessonsList = lessonsByLevel(lvl.id);
              const total = lessonsList.length;
              const done = completedInLevel(lvl.id);
              const pct = total > 0 ? (done / total) * 100 : 0;
              const isComplete = total > 0 && done === total;
              return (
                <button
                  key={lvl.id}
                  onClick={() => navigate(`/eim/library/${lvl.id}`)}
                  className="w-full text-left rounded-2xl border border-[rgba(123,158,137,0.30)] hover:border-[rgba(123,158,137,0.50)] transition-all p-4"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(42,157,111,0.10) 0%, rgba(123,158,137,0.04) 100%)',
                  }}
                >
                  <div className="text-[10px] uppercase tracking-widest text-[#7BB39A] font-semibold mb-2">
                    🌿 Specialization
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 border border-[rgba(123,158,137,0.30)] bg-[rgba(42,157,111,0.15)] relative">
                      <span
                        className="text-[#7BB39A] font-extrabold"
                        style={{ fontSize: '22px' }}
                      >
                        ★
                      </span>
                      {isComplete && (
                        <span className="absolute -top-1.5 -right-1.5">
                          <CheckCircle size={18} weight="fill" color="#22C55E" />
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[15px] font-bold text-[#7BB39A]">{lvl.title_en}</div>
                      <div className="text-[11px] text-[#7A7363] mt-0.5 line-clamp-2">
                        {lvl.description}
                      </div>
                      {/* Progress bar — same treatment as the mainline level cards. */}
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 rounded-full bg-[rgba(123,158,137,0.12)] overflow-hidden">
                          <div
                            className="h-full transition-all"
                            style={{
                              width: `${pct}%`,
                              background: 'linear-gradient(90deg, #7BB39A, #2A9D6F)',
                            }}
                          />
                        </div>
                        <span className="text-[10px] text-[#5C5749] tabular-nums shrink-0">
                          {done}/{total}
                        </span>
                      </div>
                    </div>
                    <CaretRight size={14} weight="bold" className="text-[#7BB39A] shrink-0" />
                  </div>
                </button>
              );
            })}
        </div>
        )}

        {tab === 'lessons' && (
          <div className="px-5 mt-5">
            <div className="rounded-xl border border-[rgba(212,168,83,0.10)] bg-[rgba(212,168,83,0.04)] p-3.5">
              <div className="flex items-start gap-2.5">
                <LockOpen size={14} weight="bold" className="text-[#7BB39A] mt-0.5 shrink-0" />
                <p className="text-[11px] text-[#7A7363] leading-relaxed">
                  All levels are open — they are presented in order, but you can read in any sequence you like. The 5-level progression moves from Foundations through to Mastery.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default EimLibraryPage;
