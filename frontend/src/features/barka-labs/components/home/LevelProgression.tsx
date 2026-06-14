/**
 * LevelProgression — current Barka Labs level card with task checklist,
 * reward badge, and expandable "other levels" list.
 */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getDemoDisplayFont } from '@/i18n';
import { ArrowRight, Check } from '@phosphor-icons/react';
import { C, LEVELS } from '../../barka-labs.constants';
import type { BarkaLabsStats } from '../../types/barka-labs.types';

interface LevelProgressionProps {
  stats: BarkaLabsStats;
  currentLevel: number;
  levelProgress: number;
}

export function LevelProgression({ stats, currentLevel, levelProgress }: LevelProgressionProps) {
  const { t } = useTranslation('demo');
  const displayFont = getDemoDisplayFont();
  const [levelsOpen, setLevelsOpen] = useState(false);

  const cl = LEVELS[currentLevel - 1];
  const tasksCompleted = Math.min(Math.floor(cl.tasks.length * (levelProgress / 100)), cl.tasks.length);

  return (
    <div>
      <div
        className="mt-3 rounded-xl p-3 md:p-4"
        style={{ background: 'rgba(215,181,106,0.06)', border: '1px solid rgba(215,181,106,0.2)' }}
      >
        <div className="text-[9px] font-bold tracking-wider uppercase mb-1" style={{ color: C.gold }}>
          Level {currentLevel} — {t('home.level.active', { streak: Math.min(stats.current_streak, 30) })}
        </div>
        <div className="text-base md:text-lg font-bold mb-0.5" style={{ fontFamily: displayFont, color: C.t1 }}>
          {t(`levels.${cl.num}.name`)}
        </div>
        <p className="text-[11px] leading-relaxed mb-3" style={{ color: C.t2 }}>{t(`levels.${cl.num}.desc`)}</p>

        {/* Progress bar */}
        <div className="h-1.5 rounded-full overflow-hidden mb-1" style={{ background: 'rgba(255,255,255,0.06)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${levelProgress}%`, background: `linear-gradient(90deg, ${C.gold}, ${C.goldL})` }} />
        </div>
        <span className="text-[10px] block mb-3" style={{ color: C.t3 }}>
          {t('home.level.progress', { progress: levelProgress, next: currentLevel + 1 })}
        </span>

        {/* Tasks */}
        <div className="flex flex-col gap-1.5 mb-3">
          {cl.tasks.map((_task, j) => {
            const done = j < tasksCompleted;
            return (
              <div key={j} className="flex items-start gap-2 text-[11px]">
                <div
                  className="w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 mt-px"
                  style={{
                    border: done ? 'none' : `1.5px solid ${C.cardB}`,
                    background: done ? '#2A9D6F' : 'transparent',
                  }}
                >
                  {done && <Check size={10} weight="bold" style={{ color: '#fff' }} />}
                </div>
                <span style={{ color: done ? C.t1 : C.t2 }}>{t(`levels.${cl.num}.task.${j}`)}</span>
              </div>
            );
          })}
        </div>

        {/* Reward */}
        <div className="text-[10px] font-semibold px-3 py-2 rounded-lg mb-3" style={{
          background: 'rgba(245,200,66,0.06)',
          border: '1px solid rgba(245,200,66,0.12)',
          color: '#F5C842',
        }}>
          ◈ {t('levels.reward')}: {t(`levels.${cl.num}.reward`)}
        </div>

        {/* View all levels toggle */}
        <button
          onClick={() => setLevelsOpen(prev => !prev)}
          className="flex items-center gap-1.5 text-[11px] font-semibold cursor-pointer transition-colors hover:text-[#D7B56A]"
          style={{ color: C.t3, background: 'none', border: 'none', padding: 0 }}
        >
          {levelsOpen ? t('home.level.hideOthers') : t('home.level.viewAll')}
          <ArrowRight size={11} style={{ transform: levelsOpen ? 'rotate(90deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }} />
        </button>

        {/* Other levels — expandable */}
        {levelsOpen && (
          <div className="mt-3 space-y-2" style={{ borderTop: '1px solid rgba(215,181,106,0.1)', paddingTop: 12 }}>
            {LEVELS.filter(l => l.num !== currentLevel).map((level) => {
              const lvlNum = level.num;
              const isCompleted = lvlNum < currentLevel;
              const isLocked = lvlNum > currentLevel;
              const tc = isCompleted ? level.tasks.length : 0;

              return (
                <div
                  key={lvlNum}
                  className="rounded-lg p-3"
                  style={{
                    background: 'rgba(36,50,70,0.3)',
                    border: `1px solid ${isCompleted ? 'rgba(42,157,111,0.2)' : 'rgba(215,181,106,0.06)'}`,
                    opacity: isLocked ? 0.5 : 1,
                  }}
                >
                  <div className="text-[9px] font-bold tracking-wider uppercase mb-0.5" style={{
                    color: isCompleted ? '#2A9D6F' : C.t3,
                  }}>
                    Level {lvlNum} — {isCompleted ? t('levels.completed') : t('levels.locked')}
                  </div>
                  <div className="text-sm font-bold mb-0.5" style={{ fontFamily: displayFont, color: C.t1 }}>
                    {t(`levels.${lvlNum}.name`)}
                  </div>
                  <p className="text-[10px] leading-relaxed mb-2" style={{ color: C.t2 }}>{t(`levels.${lvlNum}.desc`)}</p>
                  <div className="flex flex-col gap-1 mb-2">
                    {level.tasks.map((_task, j) => {
                      const done = j < tc;
                      return (
                        <div key={j} className="flex items-start gap-1.5 text-[10px]">
                          <div
                            className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-px"
                            style={{
                              border: done ? 'none' : `1px solid ${isLocked ? 'rgba(215,181,106,0.08)' : C.cardB}`,
                              background: done ? '#2A9D6F' : 'transparent',
                            }}
                          >
                            {done && <Check size={8} weight="bold" style={{ color: '#fff' }} />}
                          </div>
                          <span style={{ color: done ? C.t2 : C.t3 }}>{t(`levels.${lvlNum}.task.${j}`)}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="text-[9px] font-semibold px-2 py-1.5 rounded-md" style={{
                    background: 'rgba(245,200,66,0.06)',
                    border: '1px solid rgba(245,200,66,0.1)',
                    color: '#F5C842',
                  }}>
                    ◈ {isCompleted ? t('levels.earned') : t('levels.reward')}: {t(`levels.${lvlNum}.reward`)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
