/**
 * Recitation Diary — journal of past recitation sessions.
 * Tracks which surahs/ayahs you practised, when, and for how long.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BookOpen, Clock, Fire, Calendar, Trash } from '@phosphor-icons/react';
import { getEntries, deleteEntry, getStats, type RecitationEntry } from '../services/recitationDiaryService';
import { trackFeature } from '@/lib/analytics';

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

export function QuranRecitationDiaryPage() {
  useEffect(() => { trackFeature('quran_recitation_diary'); }, []);
  const navigate = useNavigate();
  const [entries, setEntries] = useState<RecitationEntry[]>([]);
  const [stats, setStats] = useState({ totalSec: 0, sessions: 0, streak: 0, uniqueDates: 0 });

  const reload = () => {
    setEntries(getEntries());
    setStats(getStats());
  };
  useEffect(() => { reload(); }, []);

  const handleDelete = (id: string) => {
    deleteEntry(id);
    reload();
  };

  // Group entries by date
  const grouped = entries.reduce<Record<string, RecitationEntry[]>>((acc, e) => {
    (acc[e.date] ||= []).push(e);
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] pb-24">
      <div className="sticky top-0 z-10 bg-[#0A0E16]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-4 h-14 flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
          <div className="flex items-center gap-2">
            <BookOpen size={16} weight="fill" className="text-[#D4A853]" />
            <h1 className="text-sm font-semibold text-white">Recitation Diary</h1>
          </div>
          <div className="w-9" />
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pt-4">
        <div className="grid grid-cols-3 gap-2">
          <StatTile icon={<Fire size={16} weight="fill" className="text-orange-400" />} label="Streak" value={`${stats.streak}d`} />
          <StatTile icon={<Clock size={16} className="text-[#D4A853]" />} label="Total" value={formatDuration(stats.totalSec)} />
          <StatTile icon={<Calendar size={16} className="text-emerald-400" />} label="Sessions" value={String(stats.sessions)} />
        </div>
      </div>

      {/* Entries grouped by date */}
      <div className="px-4 mt-5">
        {entries.length === 0 ? (
          <div className="rounded-xl bg-white/3 border border-white/10 border-dashed p-6 text-center mt-4">
            <BookOpen size={28} weight="duotone" className="text-white/30 mx-auto mb-2" />
            <p className="text-sm text-white/60 font-medium">No recitation logged yet</p>
            <p className="text-xs text-white/40 mt-1">Practice on the Recitation page to start your diary.</p>
          </div>
        ) : (
          Object.entries(grouped).map(([date, items]) => (
            <div key={date} className="mb-4">
              <p className="text-[11px] uppercase tracking-wide text-white/45 font-semibold mb-2 px-1">{date}</p>
              <div className="space-y-2">
                {items.map((e) => (
                  <motion.div
                    key={e.id}
                    initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 rounded-xl bg-white/3 border border-white/8"
                  >
                    <div className="w-9 h-9 rounded-lg bg-[#D4A853]/12 flex items-center justify-center shrink-0">
                      <BookOpen size={15} weight="fill" className="text-[#D4A853]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        {e.surahName ? `${e.surahName} · ${e.verseKey}` : e.verseKey}
                      </p>
                      <p className="text-[10px] text-white/40">
                        {formatDuration(e.durationSec)}{e.note ? ` · ${e.note}` : ''}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDelete(e.id)}
                      className="text-white/30 hover:text-rose-400 transition-colors p-1"
                      aria-label="Delete entry"
                    >
                      <Trash size={12} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatTile({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl bg-white/3 border border-white/8 p-3 text-center">
      <div className="flex items-center justify-center mb-1">{icon}</div>
      <p className="text-base font-bold text-white">{value}</p>
      <p className="text-[10px] text-white/45 uppercase tracking-wide">{label}</p>
    </div>
  );
}

export default QuranRecitationDiaryPage;
