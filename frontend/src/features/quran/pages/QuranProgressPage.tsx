/**
 * QuranProgressPage
 * Dashboard for Hifz intelligence: stats, weak ayahs, daily revision plan,
 * recent sessions, and the Annotations list (swipe actions) as a tab.
 */

import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  CaretLeft,
  ChartLine,
  ListBullets,
  NotePencil,
  Warning,
  Target,
  CheckCircle,
  Download,
} from '@phosphor-icons/react';
import { exportProgress, type ExportFormat } from '../services/progressExportService';
import { cn } from '@/lib/utils';
import { getHifzStats, getRecords, getSessions, getWeakAyahs, onHifzChange } from '../services/hifzEngine';
import { getDailyRevisionPlan, getInsights } from '../services/progressIntelligence';
import { AnnotationListSheet } from '../components/AnnotationSheet';
import { SurahHeatmap } from '../components/SurahHeatmap';
import { fetchSurahs } from '../services/quranApiService';
import type { Surah } from '../types/quran.types';

type Tab = 'dashboard' | 'weak' | 'sessions' | 'annotations';

export function QuranProgressPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [tab, setTab] = useState<Tab>((params.get('tab') as Tab) || 'dashboard');
  const [stats, setStats] = useState(getHifzStats());
  const [weak, setWeak] = useState(getWeakAyahs(20));
  const [sessions, setSessions] = useState(getSessions().slice(0, 20));
  const [plan, setPlan] = useState(getDailyRevisionPlan(10));
  const [insights, setInsights] = useState(getInsights());
  const [records, setRecords] = useState(getRecords());
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [heatmapSurahId, setHeatmapSurahId] = useState<number>(() => {
    const first = getRecords()[0];
    return first?.surahId ?? 114;
  });

  useEffect(() => {
    fetchSurahs().then(setSurahs).catch(() => {});
  }, []);

  useEffect(() => {
    const off = onHifzChange(() => {
      setStats(getHifzStats());
      setWeak(getWeakAyahs(20));
      setSessions(getSessions().slice(0, 20));
      setPlan(getDailyRevisionPlan(10));
      setInsights(getInsights());
      setRecords(getRecords());
    });
    return off;
  }, []);

  const heatmapSurah = surahs.find((s) => s.id === heatmapSurahId);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] text-white">
      <div className="sticky top-0 z-20 bg-[#0A0E16]/95 backdrop-blur-sm border-b border-white/5 px-4 py-3">
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-lg hover:bg-white/10">
            <CaretLeft size={20} className="text-[#D4A853]" />
          </button>
          <div className="flex-1">
            <h1 className="text-base font-bold">Progress</h1>
            <p className="text-[11px] text-white/40">Insights, weak ayahs & annotations</p>
          </div>
          <div className="relative group">
            <button
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-md text-xs bg-white/5 hover:bg-white/10 text-white/70 border border-white/10"
              title="Export progress for a teacher / mentor"
              aria-haspopup="menu"
            >
              <Download size={12} /> Export
            </button>
            <div className="absolute right-0 mt-1 z-30 hidden group-hover:block group-focus-within:block">
              <div className="rounded-md border border-white/10 bg-[#0A0E16] shadow-lg p-1 min-w-[160px]">
                {(['json', 'csv', 'markdown'] as ExportFormat[]).map((fmt) => (
                  <button
                    key={fmt}
                    onClick={() => exportProgress(fmt)}
                    className="w-full text-left text-xs px-2 py-1.5 rounded hover:bg-white/5 text-white/80"
                  >
                    {fmt === 'markdown' ? 'Markdown (.md)' : fmt === 'json' ? 'JSON (.json)' : 'Spreadsheet (.csv)'}
                  </button>
                ))}
                <p className="text-[10px] text-white/40 px-2 pt-1 leading-relaxed">
                  All data is local to your device. Sharing it with a teacher is your choice.
                </p>
              </div>
            </div>
          </div>
        </div>
        <div className="flex gap-1 bg-white/5 p-1 rounded-lg">
          {([
            { id: 'dashboard', label: 'Overview', icon: ChartLine },
            { id: 'weak', label: 'Weak', icon: Warning },
            { id: 'sessions', label: 'History', icon: ListBullets },
            { id: 'annotations', label: 'Notes', icon: NotePencil },
          ] as { id: Tab; label: string; icon: typeof ChartLine }[]).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1 py-1.5 rounded-md text-[11px] transition-colors',
                tab === t.id ? 'bg-[#D4A853]/20 text-[#D4A853]' : 'text-white/50',
              )}
            >
              <t.icon size={13} /> {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-5 space-y-5 pb-8">
        {tab === 'dashboard' && (
          <>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="Overall accuracy" value={`${Math.round(stats.overallAccuracy * 100)}%`} icon={Target} />
              <Stat label="Ayahs tracked" value={stats.totalTracked.toString()} icon={ListBullets} />
              <Stat label="Memorized" value={(stats.memorized + stats.mastered).toString()} icon={CheckCircle} tone="good" />
              <Stat label="Overdue" value={stats.overdue.toString()} icon={Warning} tone={stats.overdue > 0 ? 'warn' : 'default'} />
            </div>

            {insights.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-wide text-white/60 mb-2">Insights</h2>
                <div className="space-y-2">
                  {insights.map((i) => (
                    <div
                      key={i.id}
                      className={cn(
                        'rounded-lg border p-3',
                        i.severity === 'good' && 'border-emerald-500/25 bg-emerald-500/5',
                        i.severity === 'warn' && 'border-amber-500/25 bg-amber-500/5',
                        i.severity === 'info' && 'border-white/10 bg-white/3',
                      )}
                    >
                      <p className="text-sm font-semibold">{i.title}</p>
                      <p className="text-[11px] text-white/60 mt-0.5">{i.detail}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Surah heatmap */}
            {surahs.length > 0 && heatmapSurah && (
              <section>
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-xs uppercase tracking-wide text-white/60">Surah heatmap</h2>
                  <select
                    value={heatmapSurahId}
                    onChange={(e) => setHeatmapSurahId(parseInt(e.target.value))}
                    className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-[11px]"
                  >
                    {surahs.map((s) => (
                      <option key={s.id} value={s.id} className="bg-[#0A0E16]">
                        {s.id}. {s.nameSimple} ({s.versesCount})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="rounded-xl border border-white/8 bg-white/3 p-3">
                  <SurahHeatmap
                    surahId={heatmapSurahId}
                    versesCount={heatmapSurah.versesCount}
                    records={records}
                    onCellClick={(vk) => navigate(`/quran/hifz/test?surah=${heatmapSurahId}&start=${vk}&end=${vk}`)}
                  />
                </div>
              </section>
            )}

            {plan.length > 0 && (
              <section>
                <h2 className="text-xs uppercase tracking-wide text-white/60 mb-2">Today's revision plan</h2>
                <div className="rounded-xl border border-white/8 divide-y divide-white/5 bg-white/3 overflow-hidden">
                  {plan.map((p) => (
                    <button
                      key={p.verseKey}
                      onClick={() => navigate(`/quran/hifz/test?surah=${p.surahId}&start=${p.verseKey}`)}
                      className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 text-left"
                    >
                      <div>
                        <p className="text-sm">{p.verseKey}</p>
                        <p className="text-[10px] uppercase tracking-wide text-white/40">{p.reason.replace('-', ' ')}</p>
                      </div>
                      <div className="h-1.5 w-16 rounded-full bg-white/5 overflow-hidden">
                        <div className="h-full bg-gradient-to-r from-[#D4A853] to-[#E8C97A]" style={{ width: `${p.priority * 100}%` }} />
                      </div>
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        {tab === 'weak' && (
          <section>
            <h2 className="text-xs uppercase tracking-wide text-white/60 mb-2">Weak ayahs · by mistake rate</h2>
            {weak.length === 0 ? (
              <p className="text-center text-white/40 text-xs py-10">No weak ayahs yet — take a test to populate this view.</p>
            ) : (
              <div className="rounded-xl border border-white/8 bg-white/3 divide-y divide-white/5">
                {weak.map((w) => (
                  <button
                    key={w.verseKey}
                    onClick={() => navigate(`/quran/hifz/test?surah=${w.surahId}&start=${w.verseKey}&type=typing`)}
                    className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/5 text-left"
                  >
                    <div>
                      <p className="text-sm">{w.verseKey}</p>
                      <p className="text-[10px] text-white/40">{w.mistakeCount} mistake{w.mistakeCount === 1 ? '' : 's'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-red-300 font-semibold">{Math.round(w.mistakeRate * 100)}%</p>
                      <p className="text-[10px] text-white/40">mistake rate</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === 'sessions' && (
          <section>
            <h2 className="text-xs uppercase tracking-wide text-white/60 mb-2">Recent sessions</h2>
            {sessions.length === 0 ? (
              <p className="text-center text-white/40 text-xs py-10">No sessions yet.</p>
            ) : (
              <div className="space-y-1.5">
                {sessions.map((s) => (
                  <div key={s.id} className="rounded-lg border border-white/8 bg-white/3 p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold">{s.testType.replace('-', ' ')}</p>
                      <p className="text-[11px] text-white/40">{new Date(s.startedAt).toLocaleDateString()}</p>
                    </div>
                    <p className="text-[11px] text-white/50 mt-0.5">
                      {s.startVerseKey} → {s.endVerseKey} · {Math.round(s.accuracy * 100)}% · {s.mistakeCount} mistakes · {s.difficulty}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {tab === 'annotations' && (
          <AnnotationListSheet
            open={true}
            onClose={() => setTab('dashboard')}
            onJumpToVerse={(vk) => navigate(`/quran/read?verse=${encodeURIComponent(vk)}&surah=${vk.split(':')[0]}`)}
          />
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone = 'default' }: { label: string; value: string; icon: typeof ChartLine; tone?: 'default' | 'good' | 'warn' }) {
  return (
    <div
      className={cn(
        'rounded-xl border p-3',
        tone === 'good' && 'bg-emerald-500/5 border-emerald-500/20',
        tone === 'warn' && 'bg-amber-500/5 border-amber-500/20',
        tone === 'default' && 'bg-white/3 border-white/8',
      )}
    >
      <div className="flex items-center justify-between">
        <p className="text-xl font-bold">{value}</p>
        <Icon size={16} className={cn(tone === 'good' ? 'text-emerald-300' : tone === 'warn' ? 'text-amber-300' : 'text-white/40')} />
      </div>
      <p className="text-[10px] uppercase tracking-wide text-white/50 mt-0.5">{label}</p>
    </div>
  );
}

export default QuranProgressPage;
