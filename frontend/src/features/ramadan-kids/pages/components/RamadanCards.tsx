/**
 * Static / decorative card sections for the RamadanKidsPage.
 */

import { motion } from 'framer-motion';
import {
  BookOpen, GameController, Heart, Moon, Sparkle, Star, CaretRight, CheckCircle, Circle,
  HandHeart, Question,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import type {
  DailyMission, RoutineStep, SeerahQuestion, TrueFalseQuestion, QA,
} from './_types';
import type { STORIES, GAMES, CRAFTS, BADGES } from './_data';

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-base font-extrabold text-[#231942] mb-2.5">{children}</p>;
}

export function HeroCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-[18px] rounded-xl shadow-lg"
      style={{ background: 'linear-gradient(135deg, #FF9BCD, #FFC778, #7CF4E7)', boxShadow: '0 6px 14px rgba(212,168,83,0.25)' }}
    >
      <div className="flex items-start gap-3.5">
        <div className="p-3 rounded-full bg-white/25">
          <Moon size={28} className="text-[#41245C]" />
        </div>
        <div className="flex-1">
          <p className="text-lg font-extrabold text-[#231942]">Ramadan Adventure</p>
          <p className="text-sm font-semibold text-[#2D3142] mt-1.5">
            Learn Qur&apos;an, Seerah, and kind habits with stories, games, and quizzes made for ages 6-14.
          </p>
          <div className="flex gap-2 mt-2.5">
            <HeroPill icon={<Sparkle size={14} />} text="For ages 6-14" />
            <HeroPill icon={<Moon size={14} />} text="Ramadan safe space" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function HeroPill({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-white/15 border border-[#D4A853]/30 text-[11px] font-bold text-white">
      <span className="text-[#D4A853]">{icon}</span> {text}
    </span>
  );
}

export function AgeSelector({ age, onAgeChange }: { age: number; onAgeChange: (v: number) => void }) {
  return (
    <div className="p-3.5 rounded-xl bg-[#10151F]/50 border border-[#D4A853]/20">
      <p className="text-base font-bold text-white">Choose your age</p>
      <div className="flex items-center gap-1.5 mt-1">
        <span className="text-[#D4A853]">😊</span>
        <p className="text-xs text-[#C9C0A8]">We make questions easier for younger kids.</p>
      </div>
      <div className="flex items-center mt-2">
        <input
          type="range"
          min={6}
          max={14}
          step={1}
          value={age}
          onChange={(e) => onAgeChange(Number(e.target.value))}
          className="flex-1 accent-[#D4A853] h-2"
        />
        <span className="ml-3 px-2.5 py-2 rounded-xl bg-[#D4A853]/20 text-sm font-bold text-[#D4A853]">{age}</span>
      </div>
      <p className="text-xs text-[#7A7363] mt-1">Activities adjust to your age so quizzes stay friendly and fair.</p>
    </div>
  );
}

export function QuickActions({ onQuizTap }: { onQuizTap: () => void }) {
  const actions = [
    { title: "Qur'an Time", icon: <BookOpen size={18} />, color: '#4CC9F0', desc: 'Listen slow, read easy' },
    { title: 'Seerah Bites', icon: <Heart size={18} />, color: '#FFA3A1', desc: 'Short hero moments' },
    { title: 'Moral Stories', icon: <Sparkle size={18} />, color: '#6EF3A5', desc: 'Everyday kindness' },
    { title: 'Games & Quiz', icon: <GameController size={18} />, color: '#FFC15E', desc: 'Win stars & badges', onTap: onQuizTap },
  ];

  return (
    <div className="p-3 rounded-xl bg-white/90 border border-pink-200/40">
      <p className="text-base font-bold text-[#231942] mb-2.5">Pick a path</p>
      <div className="space-y-2.5">
        {actions.map((a) => (
          <ActionChip key={a.title} title={a.title} icon={a.icon} color={a.color} description={a.desc} onClick={a.onTap} />
        ))}
      </div>
    </div>
  );
}

function ActionChip({ title, icon, color, description, onClick }: { title: string; icon: React.ReactNode; color: string; description: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="w-full p-3.5 rounded-xl border text-left" style={{ background: `linear-gradient(135deg, ${color}24, ${color}14)`, borderColor: `${color}4D` }}>
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-full" style={{ backgroundColor: `${color}33` }}>
          <span style={{ color }}>{icon}</span>
        </span>
        <span className="text-sm font-bold text-[#231942]">{title}</span>
      </div>
      <p className="text-xs font-bold text-black mt-2">{description}</p>
    </button>
  );
}

export function DailyMissionBoard({ missions, completed, onToggle, earnedStars, progress }: {
  missions: DailyMission[]; completed: Set<number>; onToggle: (i: number) => void; earnedStars: number; progress: number;
}) {
  return (
    <div className="p-3.5 rounded-xl bg-white/95 border border-pink-200/40">
      <div className="flex items-center justify-between">
        <p className="text-base font-bold text-[#231942]">Today&apos;s Missions</p>
        <span className="px-2.5 py-1.5 rounded-xl text-xs font-bold text-[#EC6B64]" style={{ backgroundColor: '#FFC15E33' }}>{earnedStars} stars</span>
      </div>
      <p className="text-xs text-[#2D3142] mt-1">Complete missions to grow your Ramadan streak.</p>
      <div className="mt-2.5 h-2 rounded-full bg-pink-100/40 overflow-hidden">
        <div className="h-full rounded-full bg-[#EC6B64] transition-all duration-300" style={{ width: `${progress * 100}%` }} />
      </div>
      <div className="mt-3 space-y-2">
        {missions.map((m, i) => (
          <MissionTile key={m.title} mission={m} isCompleted={completed.has(i)} onTap={() => onToggle(i)} />
        ))}
      </div>
    </div>
  );
}

function MissionTile({ mission, isCompleted, onTap }: { mission: DailyMission; isCompleted: boolean; onTap: () => void }) {
  return (
    <button onClick={onTap} className="w-full flex items-center gap-2.5 p-2.5 rounded-xl border text-left" style={{ backgroundColor: `${mission.color}${isCompleted ? '2E' : '14'}`, borderColor: `${mission.color}59` }}>
      <span className="p-2 rounded-full" style={{ backgroundColor: `${mission.color}40` }}>
        <span style={{ color: mission.color }}>{mission.icon}</span>
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-[#231942]">{mission.title}</p>
        <p className="text-xs text-[#2D3142]">{mission.description}</p>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-[11px] font-bold" style={{ color: mission.color }}>+{mission.points}</span>
        {isCompleted ? <CheckCircle size={18} className="mt-1" style={{ color: mission.color }} /> : <Circle size={18} className="mt-1 text-gray-400" />}
      </div>
    </button>
  );
}

export function KindnessJar({ stars, goal, onAdd }: { stars: number; goal: number; onAdd: () => void }) {
  const isComplete = stars >= goal;
  return (
    <div className="p-3.5 rounded-xl border" style={{ background: 'linear-gradient(135deg, #FFF4D9, #E4FFF6)', borderColor: '#FFC15E66' }}>
      <div className="flex items-center gap-2">
        <span className="p-2 rounded-full" style={{ backgroundColor: '#FFC15E40' }}>
          <HandHeart className="w-4.5 h-4.5 text-[#EC6B64]" />
        </span>
        <p className="flex-1 text-base font-bold text-[#231942]">Kindness Jar</p>
        <span className="text-xs font-bold text-[#EC6B64]">{stars} / {goal}</span>
      </div>
      <p className="text-xs text-[#2D3142] mt-1">Add a star for every kind action you do today.</p>
      <div className="mt-2.5 h-2 rounded-full bg-white/40 overflow-hidden">
        <div className="h-full rounded-full bg-[#EC6B64] transition-all" style={{ width: `${Math.min((stars / goal) * 100, 100)}%` }} />
      </div>
      <div className="flex items-center gap-2.5 mt-2.5">
        <button onClick={onAdd} disabled={isComplete} className={cn('flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-white', isComplete ? 'bg-gray-300' : 'bg-[#EC6B64]')}>
          <Star size={14} />
          {isComplete ? 'Jar full!' : 'Add star'}
        </button>
        {isComplete && <span className="text-xs font-bold text-[#2D3142]">Celebrate with a dua!</span>}
      </div>
    </div>
  );
}

export function SectionCard({ title, icon, color, description, bullets, cta }: {
  title: string; icon: React.ReactNode; color: string; description: string; bullets: string[]; cta: string;
}) {
  return (
    <div className="p-4 rounded-xl border" style={{ background: `linear-gradient(135deg, ${color}1F, ${color}0D)`, borderColor: `${color}4D` }}>
      <div className="flex items-center gap-2.5">
        <span className="p-2.5 rounded-full" style={{ backgroundColor: `${color}33` }}>
          <span style={{ color }}>{icon}</span>
        </span>
        <p className="flex-1 text-base font-bold text-[#231942]">{title}</p>
        <span className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-[#D4A853] bg-[#D4A853]/15">Ramadan focus</span>
      </div>
      <p className="text-xs text-[#2D3142] mt-3">{description}</p>
      <div className="mt-3 space-y-1.5">
        {bullets.map((b) => (
          <div key={b} className="flex items-center gap-2">
            <Star size={16} className="shrink-0" style={{ color }} />
            <span className="text-xs text-[#2D3142]">{b}</span>
          </div>
        ))}
      </div>
      <p className="text-right text-sm font-bold mt-2.5" style={{ color }}>{cta}</p>
    </div>
  );
}

export function QuizModes() {
  const modes = [
    { title: 'MCQ Blitz', desc: 'Multiple choice about Quran, Seerah, and Ramadan.', icon: <Question size={18} />, color: '#6EC6FF' },
    { title: 'True / False Dash', desc: 'Fast faith facts to test what you know.', icon: <CheckCircle size={18} />, color: '#FFB3C1' },
    { title: 'Story Time', desc: 'Prophet stories with lessons and reflections.', icon: <BookOpen size={18} />, color: '#B8A1FF' },
  ];

  return (
    <div>
      <SectionTitle>Islamic Quiz Modes</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {modes.map((m) => (
          <div key={m.title} className="p-3.5 rounded-xl border" style={{ background: `linear-gradient(135deg, ${m.color}40, ${m.color}14)`, borderColor: `${m.color}73`, boxShadow: `0 6px 10px ${m.color}40` }}>
            <span className="p-2 rounded-full inline-flex bg-white/60">
              <span style={{ color: m.color }}>{m.icon}</span>
            </span>
            <p className="text-sm font-extrabold text-[#231942] mt-2.5">{m.title}</p>
            <p className="text-xs font-semibold text-[#2D3142] mt-1.5">{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StoriesGrid({ stories }: { stories: typeof STORIES }) {
  return (
    <div>
      <SectionTitle>Stories & Seerah</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {stories.map((s) => (
          <div key={s.title} className="p-3.5 rounded-xl border" style={{ backgroundColor: `${s.color}1A`, borderColor: `${s.color}4D` }}>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-full" style={{ backgroundColor: `${s.color}33` }}>
                <span style={{ color: s.color }}>{s.icon}</span>
              </span>
              <span className="text-sm font-bold text-[#231942]">{s.title}</span>
            </div>
            <div className="mt-2.5 space-y-1.5">
              {s.points.map((p) => (
                <p key={p} className="text-xs text-[#2D3142]">- {p}</p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function RoutineTimeline({ steps }: { steps: RoutineStep[] }) {
  return (
    <div className="p-3.5 rounded-xl bg-white/95 border border-pink-200/40">
      <p className="text-base font-bold text-[#231942]">Ramadan Routine</p>
      <p className="text-xs text-[#2D3142] mt-1">A simple schedule to keep the day joyful and calm.</p>
      <div className="mt-3">
        {steps.map((step, i) => (
          <div key={step.title} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="w-7 h-7 rounded-full flex items-center justify-center border" style={{ backgroundColor: `${step.color}33`, borderColor: `${step.color}80` }}>
                <span style={{ color: step.color }}>{step.icon}</span>
              </div>
              {i < steps.length - 1 && <div className="w-0.5 h-9 rounded-full" style={{ backgroundColor: `${step.color}4D` }} />}
            </div>
            <div className={cn('pb-3', i === steps.length - 1 && 'pb-0')}>
              <span className="text-[11px] font-bold" style={{ color: step.color }}>{step.time}</span>
              <p className="text-sm font-bold text-[#231942]">{step.title}</p>
              <p className="text-xs text-[#2D3142]">{step.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QuizCard({ title, description, progress, badgeText }: { title: string; description: string; progress: number; badgeText: string }) {
  return (
    <div className="p-3.5 rounded-xl bg-white/90 border border-pink-200/30">
      <div className="flex items-center gap-2">
        <GameController size={20} className="text-[#EC6B64]" />
        <span className="flex-1 text-sm font-bold text-[#231942]">{title}</span>
        <span className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-[#EC6B64] bg-[#FFC15E]/20">{badgeText}</span>
      </div>
      <p className="text-xs text-[#2D3142] mt-2">{description}</p>
      <div className="mt-2.5 h-2 rounded-full bg-pink-100/50 overflow-hidden">
        <div className="h-full rounded-full bg-[#EC6B64]" style={{ width: `${progress * 100}%` }} />
      </div>
    </div>
  );
}

export function TrueFalseDash({ quiz, selections, onSelect, correctCount }: {
  quiz: TrueFalseQuestion[]; selections: Record<number, boolean>; onSelect: (i: number, v: boolean) => void; correctCount: number;
}) {
  const total = quiz.length;
  return (
    <div className="p-3.5 rounded-xl border" style={{ background: 'linear-gradient(135deg, #E8F6FF, #FFF1E6)', borderColor: '#6EC6FF59' }}>
      <div className="flex items-center gap-2">
        <CheckCircle size={20} className="text-[#1E3A8A]" />
        <span className="flex-1 text-base font-extrabold text-[#1E3A8A]">True / False Dash</span>
        <span className="px-2.5 py-1.5 rounded-xl text-[11px] font-bold text-[#1E3A8A] bg-white/80 border border-[#6EC6FF]/50">{correctCount}/{total} correct</span>
      </div>
      <div className="mt-2.5 h-2 rounded-full bg-white/60 overflow-hidden">
        <div className="h-full rounded-full bg-[#6EC6FF]" style={{ width: `${total === 0 ? 0 : (correctCount / total) * 100}%` }} />
      </div>
      <div className="mt-3 space-y-2.5">
        {quiz.map((item, idx) => {
          const selected = selections[idx];
          const isCorrect = selected === item.answer;
          return (
            <div key={idx} className="p-3 rounded-xl border bg-white/90" style={{ borderColor: selected == null ? '#6EC6FF40' : isCorrect ? '#2E7D32' : '#C62828' }}>
              <p className="text-sm font-bold text-[#231942]">{item.statement}</p>
              <div className="flex gap-2 mt-2">
                {(['True', 'False'] as const).map((label) => {
                  const val = label === 'True';
                  const isSel = selected === val;
                  return (
                    <button
                      key={label}
                      onClick={() => onSelect(idx, val)}
                      className={cn(
                        'flex-1 py-2.5 rounded-xl text-xs font-extrabold text-[#1E3A8A] border transition-colors',
                        isSel ? 'bg-[#6EC6FF]/20 border-[#1E3A8A]' : 'bg-white border-[#6EC6FF]/35',
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
              {selected != null && (
                <div className="mt-2">
                  <p className={cn('text-xs font-extrabold', isCorrect ? 'text-[#1B5E20]' : 'text-[#B71C1C]')}>
                    {isCorrect ? 'Correct!' : 'Oops, try again.'}
                  </p>
                  <p className="text-xs text-[#2D3142] mt-1">{item.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function StoryTimeCard() {
  return (
    <div className="p-4 rounded-xl flex items-center gap-3 shadow-md" style={{ background: 'linear-gradient(135deg, #7AD7F0, #B8A1FF)' }}>
      <span className="p-2.5 rounded-full bg-white/25">
        <BookOpen size={20} className="text-white" />
      </span>
      <div className="flex-1">
        <p className="text-base font-extrabold text-white">Story Time</p>
        <p className="text-xs font-semibold text-white/90 mt-1.5">Open Prophet Stories for short lessons, morals, and reflections.</p>
      </div>
      <CaretRight size={20} className="text-white shrink-0" />
    </div>
  );
}

export function SeerahQuizDeck({ quiz, selections, onSelect, mcqDeck, tfDeck, fillDeck }: {
  quiz: SeerahQuestion[]; selections: Record<number, number>; onSelect: (q: number, o: number) => void;
  mcqDeck: QA[]; tfDeck: QA[]; fillDeck: QA[];
}) {
  return (
    <div className="p-3.5 rounded-xl bg-white/90 border border-pink-200/40">
      <p className="text-base font-extrabold text-[#231942]">Seerah Quiz Deck</p>
      <p className="text-xs text-[#2D3142] mt-2">Kid-friendly Seerah questions (MCQ, True/False, Fill the blank). Read aloud, reveal answers together.</p>

      {/* Interactive quiz */}
      <div className="mt-3 p-3 rounded-xl border" style={{ background: 'linear-gradient(135deg, #FFE4F0, #E9FFF7)', borderColor: '#F9A8D480' }}>
        <p className="text-sm font-extrabold text-[#231942] mb-2.5">Tap to answer and see if you got it right!</p>
        {quiz.map((q, qIdx) => {
          const selected = selections[qIdx];
          return (
            <div key={qIdx} className="mb-2.5 p-3 rounded-xl bg-white border border-pink-200/40">
              <p className="text-sm font-extrabold text-black">{q.prompt}</p>
              <div className="flex flex-wrap gap-2 mt-2">
                {q.options.map((opt, oIdx) => {
                  const isSel = selected === oIdx;
                  const isCorr = q.correctIndex === oIdx;
                  let bg = 'white';
                  let border = '#D1D5DB';
                  let text = 'black';
                  if (selected != null) {
                    if (isCorr) { bg = '#E8F5E9'; border = '#4CAF50'; text = '#1B5E20'; }
                    else if (isSel) { bg = '#FFEBEE'; border = '#F44336'; text = '#B71C1C'; }
                  }
                  return (
                    <button
                      key={oIdx}
                      onClick={() => onSelect(qIdx, oIdx)}
                      className="px-3 py-2.5 rounded-xl text-xs font-bold border shadow-sm transition-colors"
                      style={{ backgroundColor: bg, borderColor: border, color: text }}
                    >
                      {opt}
                    </button>
                  );
                })}
              </div>
              {selected != null && (
                <div className="mt-2">
                  <p className={cn('text-xs font-extrabold', selected === q.correctIndex ? 'text-[#1B5E20]' : 'text-[#B71C1C]')}>
                    {selected === q.correctIndex ? "Great! That's correct." : `Answer: ${q.options[q.correctIndex]}`}
                  </p>
                  <p className="text-xs text-[#2D3142] mt-1">{q.explanation}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-3 space-y-2.5">
        <QAList title="Multiple Choice" items={mcqDeck} color="#7AD7F0" />
        <QAList title="True / False" items={tfDeck} color="#FFB3C1" />
        <QAList title="Fill the Blank" items={fillDeck} color="#A5F0B3" />
      </div>
    </div>
  );
}

function QAList({ title, items, color }: { title: string; items: QA[]; color: string }) {
  return (
    <div className="p-3 rounded-xl border" style={{ backgroundColor: `${color}1F`, borderColor: `${color}4D` }}>
      <div className="flex items-center gap-2 mb-2">
        <Question size={18} style={{ color }} />
        <span className="text-sm font-extrabold text-[#231942]">{title}</span>
      </div>
      <div className="space-y-2">
        {items.map((q, i) => (
          <div key={i}>
            <p className="text-xs font-bold text-black">{q.question}</p>
            <p className="text-xs font-semibold text-[#2D3142]">{q.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function GamesArcade({ games }: { games: typeof GAMES }) {
  return (
    <div>
      <SectionTitle>Games Arcade</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        {games.map((g) => (
          <div key={g.title} className="p-3 rounded-xl border" style={{ background: `linear-gradient(135deg, ${g.color}2E, ${g.color}14)`, borderColor: `${g.color}59` }}>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-full" style={{ backgroundColor: `${g.color}40` }}>
                <span style={{ color: g.color }}>{g.icon}</span>
              </span>
              <span className="text-sm font-bold text-[#231942]">{g.title}</span>
            </div>
            <p className="text-xs font-bold text-black mt-2">{g.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function BadgesRow({ badges }: { badges: typeof BADGES }) {
  return (
    <div>
      <SectionTitle>Earn badges this Ramadan</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        {badges.map((b) => (
          <div key={b.name} className="p-3 rounded-xl border text-center" style={{ backgroundColor: `${b.color}1F`, borderColor: `${b.color}4D` }}>
            <div className="flex justify-center" style={{ color: b.color }}>{b.icon}</div>
            <p className="text-xs font-bold text-[#231942] mt-2">{b.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function CraftCorner({ crafts }: { crafts: typeof CRAFTS }) {
  return (
    <div>
      <SectionTitle>Craft Corner</SectionTitle>
      <div className="grid grid-cols-2 gap-2.5">
        {crafts.map((c) => (
          <div key={c.title} className="p-3 rounded-xl border" style={{ background: `linear-gradient(135deg, ${c.color}2E, ${c.color}14)`, borderColor: `${c.color}59` }}>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-full" style={{ backgroundColor: `${c.color}40` }}>
                <span style={{ color: c.color }}>{c.icon}</span>
              </span>
              <span className="text-sm font-bold text-[#231942]">{c.title}</span>
            </div>
            <p className="text-xs font-bold text-black mt-2">{c.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
