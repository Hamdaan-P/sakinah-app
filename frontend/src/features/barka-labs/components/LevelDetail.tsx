/**
 * Level Progression Detail Screen
 * Shows all 4 levels with tasks, rewards, and progress.
 */

import { useTranslation } from 'react-i18next';
import { getDemoDisplayFont } from '@/i18n';
import { ArrowLeft } from '@phosphor-icons/react';
import { C, cardStyle, LEVELS } from '../barka-labs.constants';
import type { BarkaLabsStats } from '../types/barka-labs.types';
import type { BarkaLabsScreen } from '../pages/BarkaLabsPage';

interface LevelDetailProps {
  stats: BarkaLabsStats;
  go: (s: BarkaLabsScreen) => void;
  isDemo?: boolean;
}

export function LevelDetail({ stats, go, isDemo }: LevelDetailProps) {
  const { t } = useTranslation('demo');
  // Determine current level from streak/blessings
  const currentLevel = stats.current_streak >= 60 ? 3 : stats.current_streak >= 30 ? 2 : 1;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => go('home')}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-colors"
          style={cardStyle}
        >
          <ArrowLeft size={18} className="text-[#EBDCB8]" />
        </button>
        <div className="text-lg font-bold" style={{ fontFamily: getDemoDisplayFont(), color: C.t1 }}>
          {t('levels.title')}
        </div>
      </div>

      {/* Level cards */}
      <div className=" space-y-3">
        {LEVELS.map((level) => {
          const lvlNum = level.num;
          const isCompleted = lvlNum < currentLevel;
          const isCurrent = lvlNum === currentLevel;
          const isLocked = lvlNum > currentLevel;

          // Determine tasks completion (fake for now based on level status)
          const tasksCompleted = isCompleted
            ? level.tasks.length
            : isCurrent
              ? Math.min(Math.floor(level.tasks.length * 0.7), level.tasks.length)
              : 0;

          let borderColor: string = C.cardB;
          let bg: string = C.card;
          if (isCompleted) borderColor = 'rgba(42,157,111,0.2)';
          if (isCurrent) {
            borderColor = 'rgba(212,168,83,0.25)';
            bg = 'linear-gradient(135deg, rgba(212,168,83,0.06), rgba(212,168,83,0.01))';
          }

          return (
            <div
              key={lvlNum}
              className="rounded-2xl p-[18px] relative overflow-hidden"
              style={{
                background: bg,
                border: `1px solid ${borderColor}`,
                opacity: isLocked ? 0.45 : 1,
              }}
            >
              {/* Level number */}
              <div
                className="text-[9px] font-bold tracking-[1.5px] uppercase mb-1.5"
                style={{
                  color: isCompleted ? C.emL : isCurrent ? C.gold : C.t3,
                }}
              >
                Level {lvlNum} — {isCompleted ? t('levels.completed') : isCurrent ? t('levels.active', { streak: Math.min(stats.current_streak, 30) }) : t('levels.locked')}
              </div>

              {/* Name */}
              <div className="text-base font-bold mb-1" style={{ fontFamily: getDemoDisplayFont(), color: C.t1 }}>
                {t(`levels.${lvlNum}.name`)}
              </div>

              {/* Description */}
              <p className="text-[11px] leading-relaxed mb-2.5" style={{ color: C.t2 }}>
                {t(`levels.${lvlNum}.desc`)}
              </p>

              {/* Tasks */}
              <div className="flex flex-col gap-1.5">
                {level.tasks.filter((_tk, idx) => !isDemo || !(/invite|mentor/i.test(level.tasks[idx]))).map((_task, j) => {
                  const done = j < tasksCompleted;
                  return (
                    <div key={j} className="flex items-center gap-2 text-[11px]" style={{ color: C.t2 }}>
                      <div
                        className="w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] shrink-0"
                        style={{
                          border: done ? 'none' : `1.5px solid ${C.cardB}`,
                          background: done ? C.em : 'transparent',
                          color: done ? C.t1 : C.t3,
                        }}
                      >
                        {done ? '✓' : ''}
                      </div>
                      <span style={{ color: done ? C.t2 : C.t3 }}>{t(`levels.${lvlNum}.task.${j}`)}</span>
                    </div>
                  );
                })}
              </div>

              {/* Reward */}
              <div
                className="flex items-center gap-1.5 mt-2.5 px-3 py-2 rounded-[10px] text-[10px]"
                style={{
                  background: 'rgba(245,200,66,0.06)',
                  border: '1px solid rgba(245,200,66,0.12)',
                  color: C.dnz,
                }}
              >
                ◈ {isCompleted ? t('levels.earned') : t('levels.reward')}: {t(`levels.${lvlNum}.reward`)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Back */}
      <div className=" py-5">
        <button
          onClick={() => go('home')}
          className="w-full py-3.5 rounded-xl text-sm font-bold"
          style={{ background: `linear-gradient(135deg, ${C.em}, ${C.emD})`, color: C.t1 }}
        >
          {t('levels.backToDashboard')}
        </button>
      </div>
    </div>
  );
}
