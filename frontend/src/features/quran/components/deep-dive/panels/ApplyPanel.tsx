/**
 * ApplyPanel — real-life applications and actions for an ayah.
 *
 * Each scenario carries one or more actions (note, reminder, reflection,
 * ask). Actions either create a workspace item (note/reflection/reminder)
 * or seed an "Ask Raya" question.
 */

import { useState } from 'react';
import applicationsData from '../../../data/ayahApplications.json';
import { createItem } from '../../../services/workspaceService';
import { isAyahInTadabburPilot, TADABBUR_PILOT_SURAH_NAMES } from '../../../config/tadabbur';
import type { RayaQuranAyahContext } from '../../../types/quran.types';

type ActionKind = 'note' | 'reflection' | 'reminder' | 'ask';

interface Action {
  kind: ActionKind;
  title?: string;
  body?: string;
  prompt?: string;
  seed?: string;
  channel?: 'in-app' | 'whatsapp';
  offsetHours?: number;
}

interface ApplicationEntry {
  scenario: string;
  actions: Action[];
}

const data = applicationsData as Record<string, ApplicationEntry[]>;

interface Props {
  verseKey: string;
  context: RayaQuranAyahContext | null;
  onClose: () => void;
}

export function ApplyPanel({ verseKey, context, onClose }: Props) {
  const entries = data[verseKey] ?? [];
  const [toast, setToast] = useState<string | null>(null);

  function handleAction(action: Action) {
    if (action.kind === 'note' || action.kind === 'reflection') {
      createItem({
        type: action.kind === 'note' ? 'note' : 'reflection',
        title: action.title ?? (action.kind === 'note' ? 'Note from Apply tab' : 'Reflection'),
        body: action.body ?? action.prompt ?? '',
        linkedAyahs: [verseKey],
        tags: [action.kind, 'apply-tab'],
      });
      setToast('Saved to your Workspace.');
    } else if (action.kind === 'reminder') {
      const offsetMs = (action.offsetHours ?? 24) * 60 * 60 * 1000;
      createItem({
        type: 'reminder',
        title: action.title ?? 'Reminder',
        body: action.body ?? '',
        linkedAyahs: [verseKey],
        tags: ['reminder', 'apply-tab'],
        reminderAt: Date.now() + offsetMs,
        reminderChannel: action.channel ?? 'in-app',
      });
      setToast('Reminder set.');
    } else if (action.kind === 'ask') {
      // The Apply panel can't switch tabs directly; we save the seeded
      // question as a workspace note for the user to bring back to Ask.
      createItem({
        type: 'note',
        title: 'Ask Raya about',
        body: action.seed ?? '',
        linkedAyahs: [verseKey],
        tags: ['ask-seed', 'apply-tab'],
      });
      setToast('Question saved — open the Ask tab to bring it up with Raya.');
    }
    void context; void onClose;
    window.setTimeout(() => setToast(null), 2400);
  }

  return (
    <div className="p-4 space-y-4">
      {entries.length === 0 ? (
        <p className="text-sm text-[#A7B1C0]">
          {isAyahInTadabburPilot(verseKey)
            ? 'No application scenarios curated for this ayah yet.'
            : `Apply scenarios are currently piloting on ${TADABBUR_PILOT_SURAH_NAMES}. Use the Ask tab to brainstorm applications with Raya in the meantime.`}
        </p>
      ) : (
        <ul className="space-y-3">
          {entries.map((entry, idx) => (
            <li
              key={idx}
              className="rounded-lg border border-[rgba(212,168,83,0.18)] bg-[#10151F]/50 p-4"
            >
              <p className="text-sm text-[#F5E8C7] mb-3">{entry.scenario}</p>
              <div className="flex flex-wrap gap-2">
                {entry.actions.map((action, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleAction(action)}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853] hover:bg-[#D4A853]/25"
                  >
                    {actionLabel(action)}
                  </button>
                ))}
              </div>
            </li>
          ))}
        </ul>
      )}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="text-xs text-[#2A9D6F] border border-[#2A9D6F]/30 bg-[#2A9D6F]/10 rounded-md px-3 py-2"
        >
          {toast}
        </div>
      )}
    </div>
  );
}

function actionLabel(action: Action): string {
  switch (action.kind) {
    case 'note': return `Save note: ${action.title ?? 'Note'}`;
    case 'reflection': return `Reflect: ${action.title ?? 'Open prompt'}`;
    case 'reminder': return `Set reminder: ${action.title ?? 'Reminder'}`;
    case 'ask': return 'Save as Ask Raya seed';
  }
}
