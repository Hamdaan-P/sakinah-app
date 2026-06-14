/**
 * QuranHifzPage
 * Hub for the Hifz (memorization) module: Memorize workflow, Tests, Progress, Annotations.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CaretLeft,
  Target,
  Brain,
  ChartLine,
  NotePencil,
  Star,
  Lightning,
  ArrowRight,
  Users,
} from '@phosphor-icons/react';
import { getHifzStats, onHifzChange } from '../services/hifzEngine';
import { getDailyRevisionPlan, getInsights } from '../services/progressIntelligence';
import { getAnnotations, onAnnotationsChange } from '../services/annotationManager';
import { MemorizationPlanPanel } from '../components/MemorizationPlanPanel';
import { cn } from '@/lib/utils';

export function QuranHifzPage() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(getHifzStats());
  const [annotationCount, setAnnotationCount] = useState(getAnnotations().filter((a) => a.status === 'open').length);
  const [plan, setPlan] = useState(getDailyRevisionPlan(5));
  const [insights, setInsights] = useState(getInsights());

  useEffect(() => {
    const refresh = () => {
      setStats(getHifzStats());
      setPlan(getDailyRevisionPlan(5));
      setInsights(getInsights());
    };
    const off1 = onHifzChange(refresh);
    const off2 = onAnnotationsChange(() => setAnnotationCount(getAnnotations().filter((a) => a.status === 'open').length));
    return () => {
      off1();
      off2();
    };
  }, []);

  const sections = [
    {
      icon: Brain,
      title: 'Memorize',
      desc: 'Adaptive workflow · Beginner / Intensive / Revision',
      path: '/quran/hifz/memorize',
      color: 'text-[#D4A853]',
      border: 'border-[#D4A853]/20',
      bg: 'from-[#D4A853]/15 to-[#0F141F]/10',
    },
    {
      icon: Target,
      title: 'Test',
      desc: 'Voice · Find next ayah · Full page',
      path: '/quran/hifz/test',
      color: 'text-[#4FB892]',
      border: 'border-[#4FB892]/20',
      bg: 'from-[#4FB892]/15 to-[#0F141F]/10',
    },
    {
      icon: ChartLine,
      title: 'Progress',
      desc: `${stats.memorized + stats.mastered} memorized · ${Math.round(stats.overallAccuracy * 100)}% accuracy`,
      path: '/quran/hifz/progress',
      color: 'text-emerald-400',
      border: 'border-emerald-500/20',
      bg: 'from-emerald-500/15 to-[#0F141F]/10',
    },
    {
      icon: Users,
      title: 'Hifz Circles',
      desc: 'Memorize together · daily check-ins · group leaderboard',
      path: '/quran/hifz/circles',
      color: 'text-[#B891E8]',
      border: 'border-[#B891E8]/20',
      bg: 'from-[#B891E8]/15 to-[#0F141F]/10',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F]">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-[#0A0E16]/95 backdrop-blur-sm border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-white/10">
          <CaretLeft size={20} className="text-[#D4A853]" />
        </button>
        <div>
          <h1 className="text-lg font-bold text-white">Hifz</h1>
          <p className="text-[11px] text-white/40">Memorization, testing & progress</p>
        </div>
      </div>

      <div className="px-4 pt-5 pb-8 space-y-5">
        {/* Stats strip */}
        <div className="grid grid-cols-3 gap-2">
          <StatCard label="Tracked" value={stats.totalTracked} />
          <StatCard label="Memorized" value={stats.memorized + stats.mastered} accent />
          <StatCard label="Due today" value={stats.dueToday} warn={stats.dueToday > 0} />
        </div>

        {/* Primary sections */}
        <div className="space-y-2.5">
          {sections.map((s, i) => (
            <motion.button
              key={s.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              onClick={() => navigate(s.path)}
              className={cn(
                'w-full flex items-center gap-3.5 p-4 rounded-xl bg-gradient-to-r border text-left transition-all hover:scale-[1.01]',
                s.border,
                s.bg,
              )}
            >
              <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center shrink-0">
                <s.icon size={22} className={s.color} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white">{s.title}</p>
                <p className="text-[11px] text-white/50 mt-0.5 truncate">{s.desc}</p>
              </div>
              <ArrowRight size={16} className="text-white/30 shrink-0" />
            </motion.button>
          ))}
        </div>

        {/* Daily revision plan */}
        {plan.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xs font-semibold text-white/70 uppercase tracking-wide flex items-center gap-1.5">
                <Lightning size={14} className="text-[#D4A853]" />
                Today's revision
              </h2>
              <button
                onClick={() => navigate('/quran/hifz/progress')}
                className="text-[11px] text-[#D4A853] hover:text-[#E8C97A]"
              >
                View all
              </button>
            </div>
            <div className="rounded-xl border border-white/5 divide-y divide-white/5 overflow-hidden bg-white/3">
              {plan.map((item) => (
                <button
                  key={item.verseKey}
                  onClick={() => navigate(`/quran/hifz/test?surah=${item.surahId}&start=${item.verseKey}`)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-white/5 text-left"
                >
                  <div>
                    <p className="text-sm text-white">{item.verseKey}</p>
                    <p className="text-[10px] uppercase tracking-wide text-white/40">
                      {item.reason === 'due' ? 'due review' : item.reason === 'weak' ? 'weak ayah' : 'recent mistake'}
                    </p>
                  </div>
                  <div
                    className="h-1.5 w-16 rounded-full bg-white/5 overflow-hidden"
                    title={`Priority ${Math.round(item.priority * 100)}%`}
                  >
                    <div
                      className="h-full bg-gradient-to-r from-[#D4A853] to-[#E8C97A]"
                      style={{ width: `${item.priority * 100}%` }}
                    />
                  </div>
                </button>
              ))}
            </div>
          </section>
        )}

        {/* AI-assisted memorization plan generator (PDF Section 11 item 4) */}
        <MemorizationPlanPanel />

        {/* Insights */}
        {insights.length > 0 && (
          <section>
            <h2 className="text-xs font-semibold text-white/70 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <Star size={14} className="text-[#4FB892]" />
              Insights
            </h2>
            <div className="space-y-2">
              {insights.slice(0, 3).map((i) => (
                <div
                  key={i.id}
                  className={cn(
                    'rounded-lg border p-3',
                    i.severity === 'good' && 'border-emerald-500/20 bg-emerald-500/5',
                    i.severity === 'warn' && 'border-amber-500/20 bg-amber-500/5',
                    i.severity === 'info' && 'border-white/10 bg-white/3',
                  )}
                >
                  <p className="text-sm font-semibold text-white">{i.title}</p>
                  <p className="text-[11px] text-white/60 mt-0.5">{i.detail}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Annotations shortcut */}
        <button
          onClick={() => navigate('/quran/hifz/progress?tab=annotations')}
          className="w-full flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/10 hover:bg-white/5 text-left"
        >
          <NotePencil size={18} className="text-[#B891E8]" />
          <div className="flex-1">
            <p className="text-sm text-white">Your notes</p>
            <p className="text-[11px] text-white/40">
              {annotationCount > 0 ? `${annotationCount} open annotation${annotationCount === 1 ? '' : 's'}` : 'Tap any word or ayah to add a quick note'}
            </p>
          </div>
          <ArrowRight size={16} className="text-white/30" />
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, warn }: { label: string; value: number; accent?: boolean; warn?: boolean }) {
  return (
    <div
      className={cn(
        'rounded-xl border p-3 text-center',
        accent && 'bg-[#D4A853]/10 border-[#D4A853]/25',
        warn && !accent && 'bg-amber-500/5 border-amber-500/25',
        !accent && !warn && 'bg-white/3 border-white/8',
      )}
    >
      <p className={cn('text-xl font-bold', accent ? 'text-[#D4A853]' : warn ? 'text-amber-300' : 'text-white')}>
        {value}
      </p>
      <p className="text-[10px] uppercase tracking-wide text-white/50 mt-0.5">{label}</p>
    </div>
  );
}

export default QuranHifzPage;
