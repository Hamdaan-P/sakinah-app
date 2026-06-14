/**
 * EIM Home hub — landing page for the Ethical Investment Mentor.
 *
 * Restructured (L1, 2026-06-04, EIM v2): the old flat 12-tile launcher grid is
 * replaced by a hero "Continue your journey" block + three grouped, horizontally
 * scrollable sections (Learn / Practice / Reflect) + an ambient footer. This cuts
 * the number of simultaneous choices on first paint (Hick's/Miller's laws) and
 * makes the learning path — not the toolbox — the front door.
 * Spec: EIM_V2_PLAN/07_LEARNING_UI_RESTRUCTURE.md. No features removed, no routes
 * changed — purely a hierarchy + grouping pass.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkle,
  BookOpen,
  ChartLine,
  Scales,
  Storefront,
  GraduationCap,
  ChartLineUp,
  PresentationChart,
  Books,
  PlayCircle,
  CaretRight,
  CheckCircle,
  Compass,
  TrendUp,
  Rewind,
} from '@phosphor-icons/react';
import { EIM_MIRROR_ENABLED } from '@/app/router';
import { CurrencyPicker } from '@/lib/currency/CurrencyPicker';
import { eimTrack } from '../analytics';
import { CANDLESTICKS } from '../data/knowledge-bank/candlesticks';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { NisabCard } from '../components/NisabCard';
import { ProgressTitleCard } from '../components/ProgressTitleCard';
import { StreakCard } from '../components/StreakCard';
import { TarbiyahCard } from '../components/TarbiyahCard';
import { useEimStreakHeartbeat } from '../hooks/useEimStreakHeartbeat';
import { eimService } from '../services/eim.service';
import { useEimStore } from '../stores/eim.store';
import type { Lesson, LessonLevel } from '../types/eim.types';

const DAILY_VERSE = {
  arabic: 'وَأَوْفُوا الْكَيْلَ وَالْمِيزَانَ بِالْقِسْطِ',
  translation: 'Give full measure and weight in justice.',
  citation: "Surah Al-An'am 6:152",
};

type Tile = {
  icon: typeof Sparkle;
  label: string;
  sub: string;
  path: string;
  accent: string;
};

export function EimHomePage() {
  const navigate = useNavigate();
  const portfolios = useEimStore((s) => s.portfolios);
  const lessonProgress = useEimStore((s) => s.lessonProgress);
  const currentLevelTitle = useEimStore((s) => s.currentLevelTitle);
  const setCurrentLevelTitle = useEimStore((s) => s.setCurrentLevelTitle);

  // Fire-and-forget streak heartbeat on home mount — idempotent within a day.
  useEimStreakHeartbeat();

  // P10 analytics — count home-page opens.
  useEffect(() => {
    eimTrack('eim_home_opened');
  }, []);

  const { data: levels } = useQuery({
    queryKey: ['eim', 'levels'],
    queryFn: eimService.getLevels,
    staleTime: 5 * 60_000,
  });

  const { data: lessons } = useQuery({
    queryKey: ['eim', 'lessons', 'all'],
    queryFn: () => eimService.getLessons(),
    staleTime: 5 * 60_000,
  });

  // Derive current level + progression percentage from completed lessons.
  // Current level = first mainline level (by order) that the user has NOT
  // fully completed. If every mainline level is done, the user has reached
  // the highest title and we stay there.
  const [currentLevel, setCurrentLevel] = useState<LessonLevel | undefined>();
  const [nextLevel, setNextLevel] = useState<LessonLevel | undefined>();
  const [progressPct, setProgressPct] = useState(0);
  const [resumeLesson, setResumeLesson] = useState<Lesson | undefined>();
  const [resumeLessonIdx, setResumeLessonIdx] = useState<number>(0);
  const [resumeLessonTotal, setResumeLessonTotal] = useState<number>(0);
  const [allMainlineDone, setAllMainlineDone] = useState(false);

  useEffect(() => {
    if (!levels || !lessons) return;
    const sorted = [...levels]
      .filter((l) => !l.is_specialization)
      .sort((a, b) => a.order - b.order);
    if (sorted.length === 0) return;

    let pickedIdx = sorted.length - 1;
    let pickedPct = 100;
    let everythingDone = true;
    for (let i = 0; i < sorted.length; i++) {
      const lvl = sorted[i];
      const total = lessons.filter((l) => l.level_id === lvl.id).length;
      const done = lessons.filter(
        (l) => l.level_id === lvl.id && lessonProgress[l.id]?.completedAt,
      ).length;
      const pct = total > 0 ? (done / total) * 100 : 0;
      if (pct < 100) {
        pickedIdx = i;
        pickedPct = pct;
        everythingDone = false;
        break;
      }
    }

    const lvl = sorted[pickedIdx];
    setCurrentLevel(lvl);
    setNextLevel(sorted[pickedIdx + 1]);
    setProgressPct(pickedPct);
    setAllMainlineDone(everythingDone);
    if (lvl && lvl.title_en !== currentLevelTitle) {
      setCurrentLevelTitle(lvl.title_en);
    }

    // Find the first unfinished lesson in the current level — that's where
    // "Continue learning" deep-links. Falls back to the first lesson when
    // the user hasn't started, or to undefined when everything is complete.
    const lvlLessons = lessons.filter((l) => l.level_id === lvl.id);
    const unfinishedIdx = lvlLessons.findIndex(
      (l) => !lessonProgress[l.id]?.completedAt,
    );
    if (unfinishedIdx >= 0) {
      setResumeLesson(lvlLessons[unfinishedIdx]);
      setResumeLessonIdx(unfinishedIdx);
    } else {
      setResumeLesson(undefined);
      setResumeLessonIdx(0);
    }
    setResumeLessonTotal(lvlLessons.length);
  }, [levels, lessons, lessonProgress, currentLevelTitle, setCurrentLevelTitle]);

  // Anyone reading the resume card and clicking through gets routed straight
  // into the next unfinished lesson — bypasses Library → Level → Lesson which
  // user testing showed was hard to discover.
  const handleResume = () => {
    if (resumeLesson) {
      navigate(`/eim/lesson/${resumeLesson.id}`);
    } else if (allMainlineDone) {
      navigate('/eim/library/halal_mastery');
    } else if (currentLevel) {
      navigate(`/eim/library/${currentLevel.id}`);
    } else {
      navigate('/eim/library');
    }
  };

  // ── Tiles, grouped by intent (was a flat 12-tile grid) ───────────────────
  // LEARN = build knowledge · PRACTICE = apply safely (sim) · REFLECT = self-audit.
  const learnTiles: Tile[] = [
    {
      icon: BookOpen,
      label: 'Course',
      sub: '5 levels · Lessons + Playbooks',
      path: '/eim/library',
      accent: '#D4A853',
    },
    {
      icon: PresentationChart,
      label: 'Investor Playbooks',
      sub: 'Famous frameworks · Halal Lens',
      path: '/eim/library?tab=playbook',
      accent: '#A855F7',
    },
    {
      icon: ChartLineUp,
      label: 'Candlestick Library',
      sub: `${CANDLESTICKS.length} patterns · monthly first`,
      path: '/eim/candlesticks',
      accent: '#38BDF8',
    },
    {
      icon: Books,
      label: 'Scholar FAQ Archive',
      sub: 'Long-form scholar Q&A',
      path: '/eim/scholar-faqs',
      accent: '#7BB39A',
    },
  ];

  const practiceTiles: Tile[] = [
    {
      icon: Rewind,
      label: 'Simulator',
      sub: 'Replay real history, decision by decision',
      path: '/eim/time-machine',
      accent: '#D4A853',
    },
    {
      icon: ChartLine,
      label: 'Portfolio',
      sub: `${portfolios.length} portfolio${portfolios.length === 1 ? '' : 's'}`,
      path: '/eim/simulator',
      accent: '#4FB892',
    },
    {
      icon: ChartLine,
      label: 'Strategy Comparator',
      sub: 'Lump Sum vs DCA vs 60/40',
      path: '/eim/strategy-comparator',
      accent: '#82B1FF',
    },
    {
      icon: Compass,
      label: 'Scenario Lab',
      sub: 'Live a market crisis · branching outcomes',
      path: '/eim/scenario-lab',
      accent: '#E8A0C0',
    },
    {
      icon: TrendUp,
      label: 'Projection Engine',
      sub: 'Range of futures · goal odds (not a forecast)',
      path: '/eim/projection',
      accent: '#5FC986',
    },
    {
      icon: ChartLineUp,
      label: 'Pattern Lab',
      sub: 'Spot patterns on real charts · before & after',
      path: '/eim/pattern-lab',
      accent: '#5FC986',
    },
  ];

  const reflectTiles: Tile[] = [
    {
      icon: Sparkle,
      label: 'AI Mentor',
      sub: 'Run a persona analysis',
      path: '/eim/mentor',
      accent: '#7BB39A',
    },
    {
      icon: Scales,
      label: 'Ulama Screening',
      sub: 'Scholar opinions, multi-pole',
      path: '/eim/ulama',
      accent: '#E8C97A',
    },
  ];

  // A labelled, horizontally-scrollable shelf of tiles (Netflix/Spotify pattern —
  // familiar, and reveals the long tail on scroll instead of dumping it all at once).
  const renderRow = (label: string, tiles: Tile[]) => (
    <section className="mt-5">
      <h2 className="px-1 mb-2 text-[11px] uppercase tracking-widest text-[#7A7363] font-semibold">
        {label}
      </h2>
      <div className="flex gap-3 overflow-x-auto pb-1.5 px-1 -mx-1 snap-x">
        {tiles.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.path}
              onClick={() => navigate(t.path)}
              className="snap-start shrink-0 w-[150px] text-left rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] hover:border-[rgba(212,168,83,0.35)] transition-all p-3.5"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center mb-2.5"
                style={{ background: `${t.accent}18`, color: t.accent }}
              >
                <Icon size={18} weight="bold" />
              </div>
              <div className="text-[13px] font-bold text-[#F5E8C7] leading-tight">{t.label}</div>
              <div className="text-[10.5px] text-[#7A7363] mt-1 leading-snug">{t.sub}</div>
            </button>
          );
        })}
      </div>
    </section>
  );

  return (
    <div className="min-h-screen bg-[#0F1724] pb-24">
      <div className="max-w-3xl mx-auto">
        <header className="px-5 pt-6 pb-2 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[10px] uppercase tracking-widest text-[#5C5749] mb-1">
              Finance · ZaryahPlus
            </div>
            <h1 className="text-[24px] font-bold text-[#F5E8C7]">Ethical Investment Mentor</h1>
            <p className="text-[12px] text-[#7A7363] mt-1 max-w-xl">
              Learn investing the halal way — bounded by Shariah ethics. No real trades, ever.
            </p>
          </div>
          {/* Display-currency picker — global + persisted. Setting it here
              converts every monetary value across EIM (portfolios, nisab,
              timeframe compares) into the chosen currency. */}
          <div className="shrink-0 pt-1">
            <CurrencyPicker />
          </div>
        </header>

        <DisclaimerBanner />

        <div className="px-3 mt-4">
          {/* ── HERO — Your journey: progress + streak + the single primary CTA.
              Visually isolated (Von Restorff) so "continue" is the obvious action. */}
          <div className="rounded-3xl border border-[rgba(212,168,83,0.28)] bg-gradient-to-b from-[rgba(212,168,83,0.08)] to-[rgba(16,26,42,0.25)] p-3 space-y-3">
            {currentLevel && (
              <ProgressTitleCard
                titleEn={currentLevel.title_en}
                levelOrder={currentLevel.order}
                description={currentLevel.description}
                progressPct={progressPct}
                nextTitle={nextLevel?.title_en}
              />
            )}

            <StreakCard />

            {(resumeLesson || allMainlineDone) && (
              <button
                onClick={handleResume}
                className={
                  allMainlineDone
                    ? 'w-full text-left rounded-2xl border border-[rgba(212,168,83,0.35)] bg-gradient-to-br from-[rgba(212,168,83,0.12)] to-[rgba(123,158,137,0.06)] hover:border-[rgba(212,168,83,0.55)] transition-all p-4 flex items-center gap-3'
                    : 'w-full text-left rounded-2xl border border-[rgba(123,158,137,0.30)] bg-gradient-to-br from-[rgba(42,157,111,0.12)] to-[rgba(79,184,146,0.04)] hover:border-[rgba(123,158,137,0.55)] transition-all p-4 flex items-center gap-3'
                }
              >
                <div
                  className={
                    allMainlineDone
                      ? 'w-10 h-10 rounded-xl bg-[rgba(212,168,83,0.20)] text-[#D4A853] flex items-center justify-center shrink-0'
                      : 'w-10 h-10 rounded-xl bg-[rgba(42,157,111,0.22)] text-[#7BB39A] flex items-center justify-center shrink-0'
                  }
                >
                  {allMainlineDone ? (
                    <CheckCircle size={20} weight="bold" />
                  ) : (
                    <PlayCircle size={20} weight="bold" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] uppercase tracking-widest text-[#5C5749] font-semibold mb-0.5">
                    {allMainlineDone ? 'Mainline complete' : 'Continue learning'}
                  </div>
                  <div className="text-[14px] font-bold text-[#F5E8C7] truncate">
                    {allMainlineDone
                      ? 'Explore the Halal Mastery specialization'
                      : resumeLesson?.title}
                  </div>
                  <div className="text-[11px] text-[#7A7363] mt-0.5 truncate">
                    {allMainlineDone
                      ? 'AAOIFI · Classical Hanafi · Contemporary'
                      : `Lesson ${resumeLessonIdx + 1} of ${resumeLessonTotal} · ${currentLevel?.title_en ?? ''}`}
                  </div>
                </div>
                <CaretRight size={16} weight="bold" className="text-[#5C5749] shrink-0" />
              </button>
            )}
          </div>

          {/* ── LEARN ── */}
          {renderRow('Learn', learnTiles)}

          {/* Halal Mastery specialization — featured under Learn. */}
          <button
            onClick={() => navigate('/eim/library/halal_mastery')}
            className="w-full text-left rounded-2xl border border-[rgba(123,158,137,0.25)] bg-gradient-to-br from-[rgba(42,157,111,0.10)] to-[rgba(123,158,137,0.04)] hover:border-[rgba(123,158,137,0.50)] transition-all p-4 flex items-center gap-3 mt-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[rgba(42,157,111,0.20)] text-[#7BB39A] flex items-center justify-center shrink-0">
              <GraduationCap size={20} weight="bold" />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-bold text-[#7BB39A]">
                Halal Mastery — Specialization
              </div>
              <div className="text-[11px] text-[#7A7363] mt-0.5">
                AAOIFI · Classical Hanafi · Contemporary · Marifa · INCEIF — Islamic finance deep track
              </div>
            </div>
            <Storefront size={14} weight="bold" className="text-[#7BB39A]" />
          </button>

          {/* ── PRACTICE ── */}
          {renderRow('Practice', practiceTiles)}

          {/* ── REFLECT ── */}
          {renderRow('Reflect', reflectTiles)}

          {EIM_MIRROR_ENABLED && (
            <button
              onClick={() => navigate('/eim/mirror')}
              className="w-full text-left rounded-2xl border border-[rgba(212,168,83,0.35)] bg-gradient-to-br from-[rgba(212,168,83,0.10)] to-[rgba(168,85,247,0.04)] hover:border-[rgba(212,168,83,0.55)] transition-all p-4 flex items-center gap-3 mt-3"
            >
              <div className="w-10 h-10 rounded-xl bg-[rgba(212,168,83,0.18)] text-[#D4A853] flex items-center justify-center shrink-0">
                <Scales size={20} weight="duotone" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-[#F5E8C7]">Mizan Mirror</span>
                  <span className="px-1.5 py-0.5 rounded bg-[rgba(212,168,83,0.18)] text-[#D4A853] text-[9px] font-semibold uppercase tracking-wider">
                    Premium
                  </span>
                </div>
                <div className="text-[11px] text-[#7A7363] mt-0.5">
                  Muhasaba for your trading · behavioural self-audit
                </div>
              </div>
            </button>
          )}

          {/* Recent portfolios — contextual, shown only when the user has some. */}
          {portfolios.length > 0 && (
            <div className="rounded-2xl border border-[rgba(212,168,83,0.18)] bg-[#101a2a] p-4 mt-5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="text-[11px] uppercase tracking-widest text-[#5C5749] font-semibold">
                  Recent portfolios
                </div>
                <button
                  onClick={() => navigate('/eim/simulator')}
                  className="text-[10px] text-[#D4A853] hover:underline"
                >
                  See all →
                </button>
              </div>
              <div className="space-y-1.5">
                {portfolios.slice(0, 3).map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/eim/portfolio/${p.id}`)}
                    className="w-full text-left flex items-center justify-between px-3 py-2 rounded-lg hover:bg-[rgba(212,168,83,0.06)] transition-colors"
                  >
                    <span className="text-[13px] text-[#F5E8C7]">{p.name}</span>
                    <span className="text-[10px] text-[#5C5749]">
                      {p.positions.length} position{p.positions.length === 1 ? '' : 's'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Ambient footer — calm, non-navigational. ── */}
          <div className="mt-6 space-y-3">
            <NisabCard />
            <TarbiyahCard verse={DAILY_VERSE} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default EimHomePage;
