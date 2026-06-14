/**
 * Quran Workspace Editor Page
 *
 * Edit a note/document/reflection/reminder with ayah-embed blocks,
 * inline Raya prompts, optional WhatsApp reminder banner, and a tool toolbar.
 *
 * Design source: /tadabbur-app.html (Screen 7 — NOTE/DOC EDITOR).
 */

import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  CaretLeft,
  DotsThreeVertical,
  Sparkle,
  Plus,
  Bell,
  CalendarBlank,
  Hash,
  ShareNetwork,
  Trash,
} from '@phosphor-icons/react';
import {
  createItem,
  deleteItem,
  getItem,
  updateItem,
  type AyahPreview,
  type WorkspaceItem,
  type WorkspaceItemType,
} from '../services/workspaceService';
import { SurahAyahPicker, type PickedAyah } from '../components/SurahAyahPicker';
import { ReminderPicker, type PickedReminder } from '../components/ReminderPicker';
import { RayaAssistantSheet } from '../components/RayaAssistantSheet';

const AUTO_SAVE_DEBOUNCE_MS = 600;

interface DraftState {
  type: WorkspaceItemType;
  title: string;
  body: string;
  linkedAyahs: string[];
  ayahPreviews: Record<string, AyahPreview>;
  tags: string[];
  reminderAt?: number;
  reminderChannel?: 'whatsapp' | 'in-app';
}

function emptyDraft(): DraftState {
  return {
    type: 'note',
    title: '',
    body: '',
    linkedAyahs: [],
    ayahPreviews: {},
    tags: [],
  };
}

function toDraft(item: WorkspaceItem): DraftState {
  return {
    type: item.type,
    title: item.title,
    // Strip legacy [ayah:X] tokens that an earlier prototype pre-filled into
    // the body — embeds are now rendered separately above the prose.
    body: stripAyahTokens(item.body),
    linkedAyahs: [...item.linkedAyahs],
    ayahPreviews: { ...(item.ayahPreviews ?? {}) },
    tags: [...item.tags],
    reminderAt: item.reminderAt,
    reminderChannel: item.reminderChannel,
  };
}

function stripAyahTokens(body: string): string {
  return body.replace(/\[ayah:[^\]]+\]\n?/g, '').trimStart();
}

export function QuranWorkspaceEditorPage() {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const isNew = !id || id === 'new';

  const [itemId, setItemId] = useState<string | null>(isNew ? null : id ?? null);
  const [draft, setDraft] = useState<DraftState>(emptyDraft);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [reminderOpen, setReminderOpen] = useState(false);
  const [rayaOpen, setRayaOpen] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing item (or start fresh)
  useEffect(() => {
    if (isNew) {
      setDraft(emptyDraft());
      setItemId(null);
      return;
    }
    const existing = getItem(id!);
    if (existing) {
      setDraft(toDraft(existing));
      setItemId(existing.id);
      setSavedAt(existing.updatedAt);
    } else {
      // Unknown id — bounce back
      navigate('/quran/workspace', { replace: true });
    }
  }, [id, isNew, navigate]);

  // Debounced auto-save
  useEffect(() => {
    if (!draft.title && !draft.body && draft.linkedAyahs.length === 0) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      if (itemId) {
        const updated = updateItem(itemId, {
          type: draft.type,
          title: draft.title,
          body: draft.body,
          linkedAyahs: draft.linkedAyahs,
          ayahPreviews: draft.ayahPreviews,
          tags: draft.tags,
          reminderAt: draft.reminderAt,
          reminderChannel: draft.reminderChannel,
        });
        if (updated) setSavedAt(updated.updatedAt);
      } else {
        const created = createItem({
          type: draft.type,
          title: draft.title || 'Untitled note',
          body: draft.body,
          linkedAyahs: draft.linkedAyahs,
          ayahPreviews: draft.ayahPreviews,
          tags: draft.tags,
          reminderAt: draft.reminderAt,
          reminderChannel: draft.reminderChannel,
        });
        setItemId(created.id);
        setSavedAt(created.updatedAt);
        // swap URL so back/refresh works without creating duplicates
        window.history.replaceState(null, '', `/quran/workspace/${created.id}`);
      }
    }, AUTO_SAVE_DEBOUNCE_MS);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [draft, itemId]);

  function handleAyahPicked(picked: PickedAyah) {
    setPickerOpen(false);
    setDraft((d) => ({
      ...d,
      linkedAyahs: d.linkedAyahs.includes(picked.verseKey)
        ? d.linkedAyahs
        : [...d.linkedAyahs, picked.verseKey],
      ayahPreviews: {
        ...d.ayahPreviews,
        [picked.verseKey]: {
          surahName: picked.surahName,
          surahNameArabic: picked.surahNameArabic,
          arabic: picked.arabic,
          translation: picked.translation,
        },
      },
    }));
  }

  function handleRemoveAyah(verseKey: string) {
    setDraft((d) => {
      const nextPreviews = { ...d.ayahPreviews };
      delete nextPreviews[verseKey];
      return {
        ...d,
        linkedAyahs: d.linkedAyahs.filter((k) => k !== verseKey),
        ayahPreviews: nextPreviews,
      };
    });
  }

  function handleTag() {
    const tag = window.prompt('Tag (without #):');
    if (!tag) return;
    const clean = tag.trim().replace(/^#/, '').toLowerCase();
    if (!clean) return;
    setDraft((d) => (d.tags.includes(clean) ? d : { ...d, tags: [...d.tags, clean] }));
  }

  function handleReminderConfirm(r: PickedReminder) {
    setReminderOpen(false);
    setDraft((d) => ({ ...d, reminderAt: r.at, reminderChannel: r.channel }));
  }

  function handleReminderClear() {
    setReminderOpen(false);
    setDraft((d) => ({ ...d, reminderAt: undefined, reminderChannel: undefined }));
  }

  function handleDelete() {
    if (!itemId) {
      navigate('/quran/workspace');
      return;
    }
    if (!window.confirm('Delete this item? This cannot be undone.')) return;
    deleteItem(itemId);
    navigate('/quran/workspace');
  }

  const savedLabel = savedAt
    ? `Auto-saved · ${new Date(savedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}`
    : 'Draft';

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] flex flex-col">
      {/* Sub header */}
      <div className="sticky top-0 z-20 bg-[#0A0E16]/95 backdrop-blur-sm border-b border-[#D4A853]/15 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/quran/workspace')}
            className="p-1.5 rounded-lg hover:bg-white/10"
          >
            <CaretLeft size={20} className="text-[#D4A853]" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-white">
              {itemId ? `Editing ${draft.type === 'document' ? 'Document' : draft.type === 'reflection' ? 'Reflection' : 'Note'}` : 'New Note'}
            </h1>
            <p className="text-[10.5px] text-white/40 truncate">{savedLabel}</p>
          </div>
          <div className="relative">
            <button
              onClick={() => setMenuOpen((v) => !v)}
              className="p-1.5 rounded-lg hover:bg-white/10 text-white/70"
            >
              <DotsThreeVertical size={20} />
            </button>
            {menuOpen && (
              <div className="absolute right-0 top-9 z-30 w-48 rounded-xl bg-[#0A0E16] border border-white/10 shadow-lg overflow-hidden">
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    handleDelete();
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-rose-300 hover:bg-rose-500/10"
                >
                  <Trash size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Title + type */}
      <div className="px-4 pt-4">
        <input
          value={draft.title}
          onChange={(e) => setDraft((d) => ({ ...d, title: e.target.value }))}
          placeholder="Title"
          className="w-full bg-transparent text-2xl font-serif font-bold text-white placeholder-white/25 focus:outline-none"
        />
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-white/45">
          <select
            value={draft.type}
            onChange={(e) =>
              setDraft((d) => ({ ...d, type: e.target.value as WorkspaceItemType }))
            }
            className="bg-white/[0.05] border border-white/[0.08] rounded-md px-2 py-1 text-[11px] text-white focus:outline-none focus:border-[#D4A853]/40"
          >
            <option value="note">Note</option>
            <option value="document">Document</option>
            <option value="reflection">Reflection</option>
            <option value="reminder">Reminder</option>
          </select>
          {draft.linkedAyahs.length > 0 && (
            <span>
              Linked to{' '}
              <b className="text-[#D4A853]">{draft.linkedAyahs.join(', ')}</b>
            </span>
          )}
          {draft.tags.length > 0 && (
            <span className="flex flex-wrap gap-1">
              {draft.tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] text-white/60 bg-white/[0.05] border border-white/[0.08]"
                >
                  <Hash size={8} />
                  {t}
                </span>
              ))}
            </span>
          )}
        </div>
      </div>

      {/* Linked ayah embeds — sit above the prose so the verse is always in view */}
      {draft.linkedAyahs.length > 0 && (
        <div className="px-4 pt-3 space-y-2">
          {draft.linkedAyahs.map((k) => (
            <AyahEmbed
              key={k}
              verseKey={k}
              preview={draft.ayahPreviews[k]}
              onRemove={() => handleRemoveAyah(k)}
            />
          ))}
        </div>
      )}

      {/* Body — auto-grow textarea, no giant min-h so layout stays tight */}
      <div className="flex-1 px-4 pt-3 pb-4 flex flex-col">
        <textarea
          value={draft.body}
          onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
          placeholder={
            draft.linkedAyahs.length > 0
              ? 'Reflect on this ayah… what does it teach you? How will you live it this week?'
              : 'Write your tadabbur… use Insert Ayah in the toolbar to anchor a verse, or Remind to schedule a follow-up.'
          }
          rows={Math.max(8, draft.body.split('\n').length + 2)}
          className="w-full flex-1 bg-transparent text-[15px] leading-relaxed text-white/85 placeholder-white/30 focus:outline-none resize-none"
        />
      </div>

      {/* Reminder banner */}
      {draft.reminderAt && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mx-4 mb-4 rounded-xl border border-rose-400/25 bg-rose-400/[0.06] p-3 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-400/15 flex items-center justify-center shrink-0">
            <Bell size={15} className="text-rose-300" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-wider font-semibold text-rose-300">
              Reminder set · {draft.reminderChannel === 'whatsapp' ? 'WhatsApp' : 'In-app'}
            </p>
            <p className="text-[12px] text-white/75 mt-0.5">
              Raya will message you{' '}
              <b className="text-white">
                {new Date(draft.reminderAt).toLocaleString(undefined, {
                  weekday: 'long',
                  hour: 'numeric',
                  minute: '2-digit',
                })}
              </b>
              {draft.linkedAyahs[0] ? ` to revisit ${draft.linkedAyahs[0]}.` : '.'}
            </p>
          </div>
          <button
            onClick={() => setReminderOpen(true)}
            className="text-[11px] text-rose-200 hover:text-rose-100 underline-offset-2 hover:underline shrink-0"
          >
            edit
          </button>
        </motion.div>
      )}

      {/* Toolbar */}
      <div className="sticky bottom-0 z-20 bg-[#0A0E16]/95 backdrop-blur-sm border-t border-white/[0.06]">
        <div className="px-3 py-2 flex items-center justify-between gap-1 overflow-x-auto scrollbar-hide">
          <ToolButton icon={Sparkle} label="Ask Raya" onClick={() => setRayaOpen(true)} />
          <RayaAssistantSheet
            open={rayaOpen}
            onClose={() => setRayaOpen(false)}
            linkedAyahs={draft.linkedAyahs}
            ayahPreviews={draft.ayahPreviews}
          />
          <ToolButton icon={Plus} label="Insert Ayah" onClick={() => setPickerOpen(true)} />
          <SurahAyahPicker open={pickerOpen} onClose={() => setPickerOpen(false)} onSelect={handleAyahPicked} />
          <ToolButton icon={Bell} label="Remind" onClick={() => setReminderOpen(true)} />
          <ReminderPicker
            open={reminderOpen}
            initial={{ at: draft.reminderAt, channel: draft.reminderChannel }}
            onClose={() => setReminderOpen(false)}
            onConfirm={handleReminderConfirm}
            onClear={draft.reminderAt ? handleReminderClear : undefined}
          />
          <ToolButton
            icon={CalendarBlank}
            label="Calendar"
            onClick={() => navigate('/calendar')}
          />
          <ToolButton icon={Hash} label="Tag" onClick={handleTag} />
          <ToolButton
            icon={ShareNetwork}
            label="Share"
            onClick={async () => {
              const text = `${draft.title}\n\n${draft.body}`;
              try {
                if (navigator.share) await navigator.share({ title: draft.title, text });
                else await navigator.clipboard.writeText(text);
              } catch {
                // user cancelled or share unavailable — silent
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

function ToolButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Sparkle;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="shrink-0 flex flex-col items-center justify-center gap-0.5 min-w-[58px] py-1.5 px-1.5 rounded-lg text-white/70 hover:text-[#D4A853] hover:bg-white/[0.04] transition-colors"
    >
      <Icon size={16} />
      <span className="text-[9.5px] font-medium tracking-wide">{label}</span>
    </button>
  );
}

function AyahEmbed({
  verseKey,
  preview,
  onRemove,
}: {
  verseKey: string;
  preview?: AyahPreview;
  onRemove?: () => void;
}) {
  const navigate = useNavigate();
  const [surahId] = verseKey.split(':');
  return (
    <div className="relative rounded-xl border border-[#D4A853]/20 bg-gradient-to-br from-[#D4A853]/[0.05] to-[#0F141F]/40 hover:border-[#D4A853]/35 transition-colors">
      <button
        onClick={() => navigate(`/quran/read?surah=${surahId}&verse=${verseKey}`)}
        className="w-full text-left p-3.5 pr-10"
      >
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-mono font-semibold tracking-wider text-[#D4A853]">
            ⌬ {verseKey}
            {preview ? ` · ${preview.surahName.toUpperCase()}` : ''}
          </span>
          <span className="text-white/35">Tap to open in Reader</span>
        </div>
        {preview ? (
          <>
            <p
              className="mt-3 text-[18px] leading-[2] text-right text-white"
              style={{ fontFamily: 'Amiri, serif', direction: 'rtl' }}
            >
              {preview.arabic}
            </p>
            {preview.translation && (
              <p className="mt-2 text-[12px] leading-relaxed text-white/65 italic">
                "{preview.translation}"
              </p>
            )}
          </>
        ) : (
          <div className="mt-2 text-[11px] text-white/55">
            Tap to load this ayah in the reader.
          </div>
        )}
      </button>
      {onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          aria-label={`Remove ${verseKey}`}
          className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-rose-300 hover:bg-rose-500/10 transition-colors"
        >
          <Trash size={13} />
        </button>
      )}
    </div>
  );
}

export default QuranWorkspaceEditorPage;
