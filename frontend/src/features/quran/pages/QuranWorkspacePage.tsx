/**
 * Quran Workspace Page
 *
 * Unified hub for Notes, Documents, Bookmarks, Reminders, and Reflections.
 * Design source: /tadabbur-app.html (Screen 6 — WORKSPACE).
 */

import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CaretLeft,
  Plus,
  PencilSimple,
  FileText,
  BookmarkSimple,
  Bell,
  Sparkle,
  Hash,
  ArrowRight,
  NotePencil,
} from '@phosphor-icons/react';
import {
  createItem,
  getFeed,
  getCounts,
  type FeedRow,
  type WorkspaceFilter,
  type WorkspaceItemType,
  type WorkspaceCounts,
} from '../services/workspaceService';
import { SurahAyahPicker, type PickedAyah } from '../components/SurahAyahPicker';
import { backfillReflectionsToWorkspace } from '../services/dailyAyahService';

const TYPE_META: Record<
  WorkspaceItemType | 'bookmark' | 'annotation',
  { label: string; icon: typeof PencilSimple; tint: string; border: string; iconColor: string }
> = {
  note: {
    label: 'Note',
    icon: PencilSimple,
    tint: 'bg-[#D4A853]/10',
    border: 'border-[#D4A853]/20',
    iconColor: 'text-[#D4A853]',
  },
  document: {
    label: 'Document',
    icon: FileText,
    tint: 'bg-[#B891E8]/10',
    border: 'border-[#B891E8]/20',
    iconColor: 'text-[#B891E8]',
  },
  reflection: {
    label: 'Reflection',
    icon: Sparkle,
    tint: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    iconColor: 'text-emerald-300',
  },
  reminder: {
    label: 'Reminder',
    icon: Bell,
    tint: 'bg-rose-400/10',
    border: 'border-rose-400/20',
    iconColor: 'text-rose-300',
  },
  bookmark: {
    label: 'Bookmark',
    icon: BookmarkSimple,
    tint: 'bg-[#4FB892]/10',
    border: 'border-[#4FB892]/20',
    iconColor: 'text-[#4FB892]',
  },
  annotation: {
    label: 'Annotation',
    icon: NotePencil,
    tint: 'bg-amber-400/10',
    border: 'border-amber-400/20',
    iconColor: 'text-amber-300',
  },
};

function relTime(ts: number): string {
  const diff = Date.now() - ts;
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return 'just now';
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  const w = Math.floor(d / 7);
  if (w < 5) return `${w}w`;
  return new Date(ts).toLocaleDateString();
}

export function QuranWorkspacePage() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<WorkspaceFilter>('all');
  const [counts, setCounts] = useState<WorkspaceCounts>(() => getCounts());
  const [rows, setRows] = useState<FeedRow[]>(() => getFeed('all'));
  const [pickerOpen, setPickerOpen] = useState(false);
  const [newType, setNewType] = useState<WorkspaceItemType>('note');

  useEffect(() => {
    setRows(getFeed(filter));
    setCounts(getCounts());
  }, [filter]);

  // Legacy reflections saved before the Workspace mirror existed have no
  // workspace item — backfill them once on load so they appear here too.
  useEffect(() => {
    if (backfillReflectionsToWorkspace() > 0) {
      setRows(getFeed(filter));
      setCounts(getCounts());
    }
    // run once on mount; backfill is idempotent
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabs = useMemo(
    () => [
      { id: 'all' as WorkspaceFilter, label: 'All', count: counts.total },
      { id: 'note' as WorkspaceFilter, label: 'Notes', count: counts.notes },
      { id: 'document' as WorkspaceFilter, label: 'Docs', count: counts.documents },
      { id: 'bookmark' as WorkspaceFilter, label: 'Bookmarks', count: counts.bookmarks },
      { id: 'annotation' as WorkspaceFilter, label: 'Annotations', count: counts.annotations },
      { id: 'reminder' as WorkspaceFilter, label: 'Reminders', count: counts.reminders },
      { id: 'reflection' as WorkspaceFilter, label: 'Reflections', count: counts.reflections },
    ],
    [counts],
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F]">
      {/* Sub header */}
      <div className="sticky top-0 z-20 bg-[#0A0E16]/95 backdrop-blur-sm border-b border-[#D4A853]/15 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/quran')}
            aria-label="Back to Quran"
            className="p-1.5 rounded-lg hover:bg-white/10"
          >
            <CaretLeft size={20} className="text-[#D4A853]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-white">My Quran Workspace</h1>
            <p className="text-[10.5px] text-white/40 tracking-wide mt-0.5">
              Notes · Reflections · Bookmarks · Annotations · Reminders
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-4 pt-4 grid grid-cols-3 gap-2">
        {[
          { n: counts.notes, l: 'Notes' },
          { n: counts.reflections, l: 'Reflections' },
          { n: counts.bookmarks, l: 'Bookmarks' },
          { n: counts.annotations, l: 'Annotations' },
          { n: counts.reminders, l: 'Reminders' },
          { n: counts.documents, l: 'Docs' },
        ].map((s) => (
          <div
            key={s.l}
            className="rounded-xl bg-white/[0.04] border border-white/[0.06] py-3 text-center"
          >
            <div className="font-serif text-xl font-bold text-[#D4A853] leading-none">{s.n}</div>
            <div className="text-[9px] uppercase tracking-wider text-white/40 mt-1.5">{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="px-4 pt-4 flex gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setFilter(t.id)}
            className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium transition-colors ${
              filter === t.id
                ? 'bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853]'
                : 'bg-white/[0.03] border border-white/[0.06] text-white/55 hover:text-white/80'
            }`}
          >
            {t.label}
            <span
              className={`text-[9.5px] tabular-nums ${
                filter === t.id ? 'text-[#D4A853]/80' : 'text-white/30'
              }`}
            >
              {t.count}
            </span>
          </button>
        ))}
      </div>

      {/* New item — pick a type, then a verse */}
      <div className="px-4 pt-4 space-y-2">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {(['note', 'document', 'reflection', 'reminder'] as WorkspaceItemType[]).map((t) => (
            <button
              key={t}
              onClick={() => setNewType(t)}
              className={`shrink-0 px-3 py-1.5 rounded-lg text-[10.5px] font-medium capitalize transition-colors ${
                newType === t
                  ? 'bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853]'
                  : 'bg-white/[0.03] border border-white/[0.06] text-white/55 hover:text-white/80'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button
            onClick={() => setPickerOpen(true)}
            className="flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-[#D4A853]/30 text-[#D4A853] text-sm font-medium hover:bg-[#D4A853]/5 transition-colors"
          >
            <Plus size={16} />
            New {newType} · pick a verse first
          </button>
          <button
            onClick={() => navigate('/quran/workspace/new')}
            className="px-3 py-3 rounded-xl border border-white/[0.08] text-white/55 text-[11px] font-medium hover:text-white hover:border-white/20 transition-colors"
            title="Start a blank note without a linked verse"
          >
            blank
          </button>
        </div>
      </div>

      <SurahAyahPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(picked: PickedAyah) => {
          setPickerOpen(false);
          const created = createItem({
            type: newType,
            title: `${newType === 'note' ? 'Note' : newType === 'document' ? 'Doc' : newType === 'reflection' ? 'Reflection' : 'Reminder'} on ${picked.surahName} ${picked.verseKey}`,
            body: '',
            linkedAyahs: [picked.verseKey],
            ayahPreviews: {
              [picked.verseKey]: {
                surahName: picked.surahName,
                surahNameArabic: picked.surahNameArabic,
                arabic: picked.arabic,
                translation: picked.translation,
              },
            },
          });
          navigate(`/quran/workspace/${created.id}`);
        }}
      />

      {/* Feed */}
      <div className="px-4 pt-4 pb-8 space-y-2.5">
        {rows.length === 0 ? (
          <div className="flex flex-col items-center text-center py-16">
            <div className="w-14 h-14 rounded-2xl bg-[#D4A853]/10 flex items-center justify-center mb-4">
              <PencilSimple size={26} className="text-[#D4A853]/50" />
            </div>
            <p className="text-white/60 text-sm">Nothing here yet</p>
            <p className="text-white/30 text-xs mt-1">
              Start a note while reading — it'll link to the ayah automatically.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {rows.map((row, i) => (
              <FeedCard
                key={
                  row.kind === 'item'
                    ? row.item.id
                    : row.kind === 'bookmark'
                      ? `bm-${row.bookmark.verseKey}`
                      : `ann-${row.annotation.id}`
                }
                row={row}
                index={i}
              />
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}

function FeedCard({ row, index }: { row: FeedRow; index: number }) {
  const navigate = useNavigate();

  if (row.kind === 'bookmark') {
    const meta = TYPE_META.bookmark;
    const Icon = meta.icon;
    return (
      <motion.button
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.03, 0.3) }}
        onClick={() =>
          navigate(
            `/quran/read?surah=${row.bookmark.surahId}&verse=${row.bookmark.verseKey}`,
          )
        }
        className={`w-full text-left rounded-xl bg-white/[0.03] border ${meta.border} p-3.5 hover:border-[#D4A853]/30 transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-lg ${meta.tint} flex items-center justify-center shrink-0`}
          >
            <Icon size={16} weight="fill" className={meta.iconColor} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
              {meta.label}
            </p>
            <p className="text-sm font-medium text-white truncate">{row.bookmark.surahName}</p>
          </div>
          <div className="text-[10px] text-white/30 tabular-nums">{relTime(row.bookmark.savedAt)}</div>
        </div>
        <div className="mt-2.5 flex items-center gap-2">
          <span className="px-2 py-0.5 rounded text-[9.5px] font-mono text-[#D4A853] bg-[#D4A853]/10 border border-[#D4A853]/15">
            {row.bookmark.verseKey}
          </span>
        </div>
      </motion.button>
    );
  }

  if (row.kind === 'annotation') {
    const meta = TYPE_META.annotation;
    const Icon = meta.icon;
    const ann = row.annotation;
    return (
      <motion.button
        layout
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: Math.min(index * 0.03, 0.3) }}
        onClick={() =>
          navigate(`/quran/read?surah=${ann.surahId}&verse=${ann.verseKey}`)
        }
        className={`w-full text-left rounded-xl bg-white/[0.03] border ${meta.border} p-3.5 hover:border-[#D4A853]/30 transition-colors`}
      >
        <div className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-lg ${meta.tint} flex items-center justify-center shrink-0`}>
            <Icon size={16} className={meta.iconColor} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
              {meta.label} · linked to {ann.verseKey}
            </p>
            <p className="text-sm font-medium text-white truncate">
              {ann.comment || 'Annotation'}
            </p>
          </div>
          <div className="text-[10px] text-white/30 tabular-nums">{relTime(ann.updatedAt)}</div>
        </div>
        {ann.comment && (
          <p className="mt-2 text-[12px] leading-relaxed text-white/55 line-clamp-2">{ann.comment}</p>
        )}
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[9.5px] font-mono text-[#D4A853] bg-[#D4A853]/10 border border-[#D4A853]/15">
            {ann.verseKey}
          </span>
          {ann.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9.5px] text-white/55 bg-white/[0.04] border border-white/[0.06]"
            >
              <Hash size={8} />
              {t}
            </span>
          ))}
        </div>
      </motion.button>
    );
  }

  const { item } = row;
  const meta = TYPE_META[item.type];
  const Icon = meta.icon;

  return (
    <motion.button
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.03, 0.3) }}
      onClick={() => navigate(`/quran/workspace/${item.id}`)}
      className={`w-full text-left rounded-xl bg-white/[0.03] border ${meta.border} p-3.5 hover:border-[#D4A853]/30 transition-colors`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 rounded-lg ${meta.tint} flex items-center justify-center shrink-0`}>
          <Icon size={16} className={meta.iconColor} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-white/40">
            {meta.label}
            {item.linkedAyahs.length > 0 ? ` · linked to ${item.linkedAyahs[0]}` : ''}
          </p>
          <p className="text-sm font-medium text-white truncate">{item.title}</p>
        </div>
        <div className="text-[10px] text-white/30 tabular-nums">{relTime(item.updatedAt)}</div>
      </div>

      {item.body && (
        <p className="mt-2 text-[12px] leading-relaxed text-white/55 line-clamp-2">
          {stripPreview(item.body)}
        </p>
      )}

      {(item.linkedAyahs.length > 0 || item.reminderAt || item.tags.length > 0) && (
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {item.linkedAyahs.slice(0, 2).map((k) => (
            <span
              key={k}
              className="px-2 py-0.5 rounded text-[9.5px] font-mono text-[#D4A853] bg-[#D4A853]/10 border border-[#D4A853]/15"
            >
              {k}
            </span>
          ))}
          {item.reminderAt && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9.5px] text-rose-300 bg-rose-400/10 border border-rose-400/20">
              <Bell size={9} />
              {formatReminder(item.reminderAt)}
            </span>
          )}
          {item.tags.slice(0, 3).map((t) => (
            <span
              key={t}
              className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[9.5px] text-white/55 bg-white/[0.04] border border-white/[0.06]"
            >
              <Hash size={8} />
              {t}
            </span>
          ))}
        </div>
      )}

      {item.type === 'document' && (
        <div className="mt-2 flex items-center gap-1.5 text-[10px] text-white/40">
          Open document
          <ArrowRight size={11} />
        </div>
      )}
    </motion.button>
  );
}

function stripPreview(body: string): string {
  // Strip the simple `[ayah:25:63]` embed tokens for preview purposes.
  return body.replace(/\[ayah:[^\]]+\]/g, '').trim();
}

function formatReminder(ts: number): string {
  const d = new Date(ts);
  return d.toLocaleString(undefined, {
    weekday: 'short',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default QuranWorkspacePage;
