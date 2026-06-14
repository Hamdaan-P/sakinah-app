/**
 * RamadanKidsPage
 * Mirrors Flutter's ramadan_kids_page.dart
 * Kid-friendly Ramadan learning hub with quizzes, missions, games, stories, and crafts
 */

import { useState, useMemo, useCallback, useRef } from 'react';
import { BookOpen } from '@phosphor-icons/react';
import {
  DAILY_MISSIONS, SEERAH_QUIZ, TRUE_FALSE_QUIZ, ROUTINE_STEPS,
  MCQ_DECK, TF_DECK, FILL_BLANK_DECK, GAMES, CRAFTS, STORIES, BADGES,
} from './components/_data';
import {
  HeroCard, AgeSelector, QuickActions, DailyMissionBoard, KindnessJar, SectionCard,
  QuizModes, StoriesGrid, RoutineTimeline, QuizCard, TrueFalseDash, StoryTimeCard,
  SeerahQuizDeck, GamesArcade, BadgesRow, CraftCorner, SectionTitle,
} from './components/RamadanCards';

export function RamadanKidsPage() {
  const [age, setAge] = useState(10);
  const [quizSelections, setQuizSelections] = useState<Record<number, number>>({});
  const [trueFalseSelections, setTrueFalseSelections] = useState<Record<number, boolean>>({});
  const [completedMissions, setCompletedMissions] = useState<Set<number>>(new Set());
  const [kindnessStars, setKindnessStars] = useState(0);
  const quizSectionRef = useRef<HTMLDivElement>(null);
  const kindnessGoal = 12;

  const earnedStars = useMemo(() =>
    DAILY_MISSIONS.reduce((sum, m, i) => completedMissions.has(i) ? sum + m.points : sum, 0),
    [completedMissions],
  );

  const missionProgress = useMemo(() =>
    DAILY_MISSIONS.length === 0 ? 0 : completedMissions.size / DAILY_MISSIONS.length,
    [completedMissions],
  );

  const trueFalseCorrect = useMemo(() =>
    Object.entries(trueFalseSelections).filter(([idx, val]) =>
      TRUE_FALSE_QUIZ[Number(idx)]?.answer === val,
    ).length,
    [trueFalseSelections],
  );

  const toggleMission = useCallback((idx: number) => {
    setCompletedMissions((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const scrollToQuiz = () => {
    quizSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="min-h-full relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#FFF0F5] via-[#FFF7DE] to-[#E6FFF8] pointer-events-none" />

      {/* Glow orbs */}
      <div className="absolute -right-10 -top-8 w-[140px] h-[140px] rounded-full bg-[radial-gradient(circle,rgba(255,200,87,0.35),rgba(255,200,87,0.05))] pointer-events-none" />
      <div className="absolute -left-8 top-[180px] w-[110px] h-[110px] rounded-full bg-[radial-gradient(circle,rgba(124,244,231,0.35),rgba(124,244,231,0.05))] pointer-events-none" />
      <div className="absolute -right-5 bottom-[120px] w-[160px] h-[160px] rounded-full bg-[radial-gradient(circle,rgba(255,139,179,0.35),rgba(255,139,179,0.05))] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-4 py-3 pb-24 space-y-3">
        {/* Hero Card */}
        <HeroCard />

        {/* Age Selector */}
        <AgeSelector age={age} onAgeChange={setAge} />

        {/* Quick Actions */}
        <QuickActions onQuizTap={scrollToQuiz} />

        {/* Daily Missions */}
        <DailyMissionBoard
          missions={DAILY_MISSIONS}
          completed={completedMissions}
          onToggle={toggleMission}
          earnedStars={earnedStars}
          progress={missionProgress}
        />

        {/* Kindness Jar */}
        <KindnessJar stars={kindnessStars} goal={kindnessGoal} onAdd={() => setKindnessStars((s) => Math.min(s + 1, kindnessGoal))} />

        {/* Quran for Kids */}
        <SectionCard
          title="Qur'an for Kids"
          icon={<BookOpen size={20} />}
          color="#4CC9F0"
          description="Short surahs with slow audio, kid-friendly meanings, and Ramadan lessons on kindness and patience."
          bullets={['Listen to gentle recitations', 'See simple meanings with illustrations', 'Spotlight: Fasting, gratitude, sharing']}
          cta="Start a Surah"
        />

        {/* Quiz Modes */}
        <QuizModes />

        {/* Stories & Seerah */}
        <StoriesGrid stories={STORIES} />

        {/* Ramadan Routine */}
        <RoutineTimeline steps={ROUTINE_STEPS} />

        {/* Quiz Section */}
        <div ref={quizSectionRef}>
          <SectionTitle>Quizzes & Games</SectionTitle>

          <QuizCard title="End-of-Story Quiz" description="3-5 friendly questions after each story. Multiple choice, True/False, and quick matching." progress={0.6} badgeText="Ramadan Stars" />
          <div className="h-2.5" />
          <QuizCard title="Ramadan Challenge" description="Daily mini-games: guess the lesson, match Arabic words, unlock badges and track Ramadan progress." progress={0.3} badgeText="Day 5 Streak" />

          <div className="h-3" />
          <TrueFalseDash
            quiz={TRUE_FALSE_QUIZ}
            selections={trueFalseSelections}
            onSelect={(idx, val) => setTrueFalseSelections((p) => ({ ...p, [idx]: val }))}
            correctCount={trueFalseCorrect}
          />

          <div className="h-3" />
          <StoryTimeCard />

          <div className="h-3" />
          <SeerahQuizDeck
            quiz={SEERAH_QUIZ}
            selections={quizSelections}
            onSelect={(qIdx, optIdx) => setQuizSelections((p) => ({ ...p, [qIdx]: optIdx }))}
            mcqDeck={MCQ_DECK}
            tfDeck={TF_DECK}
            fillDeck={FILL_BLANK_DECK}
          />
        </div>

        {/* Games Arcade */}
        <GamesArcade games={GAMES} />

        {/* Badges */}
        <BadgesRow badges={BADGES} />

        {/* Craft Corner */}
        <CraftCorner crafts={CRAFTS} />
      </div>
    </div>
  );
}
