/**
 * ReminderOffer — surfaces after Raya offers to set a reminder in the Dua
 * or Action door chats (S07_DoorRaya).
 *
 * Tap "Set a reminder" → time picker (Tomorrow morning / This evening /
 * Custom time) → schedules a Capacitor local notification. On web, the
 * button shows "available on mobile" instead of pretending to schedule
 * something it can't reliably deliver.
 *
 * The reminder title comes from the door key; the body is a short excerpt
 * from the user's own reflection so the notification feels personal, not
 * generic ("Make your dua: 'Let me sleep tonight'" vs "Time for your dua").
 */
import { useState } from 'react';
import { Capacitor } from '@capacitor/core';
import type { Door } from '../stores/barakah-flow.store';
import {
  scheduleUserReminder,
  userReminderIdFor,
} from '@/lib/notificationScheduler';

interface ReminderOfferProps {
  door: Door;
  /** Raya's reply text — used so the same reminder offer doesn't re-key
   *  the component when the chat scrolls. */
  contextText: string;
  /** The user's door reflection — excerpted into the reminder body so the
   *  notification reads like THEIR moment, not a generic prompt. */
  reflection: string;
}

type WhenPreset = 'tomorrow_morning' | 'this_evening' | 'tomorrow_evening';

const PRESETS: { key: WhenPreset; label: string; computeAt: () => Date }[] = [
  {
    key: 'tomorrow_morning',
    label: 'Tomorrow morning',
    computeAt: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(8, 0, 0, 0);
      return d;
    },
  },
  {
    key: 'this_evening',
    label: 'This evening',
    computeAt: () => {
      const d = new Date();
      // If it's already past 8pm, push to tomorrow evening instead.
      if (d.getHours() >= 20) {
        d.setDate(d.getDate() + 1);
      }
      d.setHours(20, 0, 0, 0);
      return d;
    },
  },
  {
    key: 'tomorrow_evening',
    label: 'Tomorrow evening',
    computeAt: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(20, 0, 0, 0);
      return d;
    },
  },
];

function titleFor(door: Door): string {
  switch (door) {
    case 'dua': return '🤲 Make your dua';
    case 'action': return '✨ The small thing it asked of you';
    default: return '✨ A reminder from Barakah Labs';
  }
}

function bodyFor(door: Door, reflection: string): string {
  const excerpt = reflection.trim().slice(0, 110);
  const tail = reflection.trim().length > 110 ? '…' : '';
  if (!excerpt) {
    return door === 'dua'
      ? 'Make the dua you sat with yesterday.'
      : 'Do the small thing you said you would.';
  }
  return `"${excerpt}${tail}"`;
}

function formatWhen(at: Date): string {
  const today = new Date();
  const isTomorrow =
    at.getDate() === today.getDate() + 1 &&
    at.getMonth() === today.getMonth() &&
    at.getFullYear() === today.getFullYear();
  const hh = at.getHours();
  const mm = at.getMinutes().toString().padStart(2, '0');
  const ampm = hh >= 12 ? 'pm' : 'am';
  const h12 = ((hh + 11) % 12) + 1;
  const timePart = `${h12}:${mm} ${ampm}`;
  return isTomorrow ? `tomorrow at ${timePart}` : `today at ${timePart}`;
}

export function ReminderOffer({ door, contextText, reflection }: ReminderOfferProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<{ at: Date } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isNative = Capacitor.isNativePlatform();
  const seed = `${door}::${contextText.slice(0, 40)}::${reflection.slice(0, 40)}`;
  const id = userReminderIdFor(seed);

  const schedule = async (at: Date) => {
    if (busy) return;
    setBusy(true);
    setError(null);
    const result = await scheduleUserReminder({
      id,
      title: titleFor(door),
      body: bodyFor(door, reflection),
      at,
    });
    setBusy(false);
    if (result.scheduled) {
      setDone({ at });
      setOpen(false);
    } else if (result.reason === 'no-permission') {
      setError('Notifications are off — enable them in your phone settings to set a reminder.');
    } else if (result.reason === 'in-past') {
      setError("That time has already passed — pick a later one.");
    } else {
      setError("Couldn't set the reminder. Try again in a moment.");
    }
  };

  if (done) {
    return (
      <div className="bk-reminder-offer done">
        <span className="bk-reminder-offer-icon" aria-hidden>✓</span>
        <span>Reminder set for {formatWhen(done.at)}.</span>
      </div>
    );
  }

  if (!isNative) {
    return (
      <div className="bk-reminder-offer hint">
        <span className="bk-reminder-offer-icon" aria-hidden>📱</span>
        <span>Reminders are available in the mobile app.</span>
      </div>
    );
  }

  return (
    <div className="bk-reminder-offer">
      {!open ? (
        <button
          type="button"
          className="bk-reminder-offer-cta"
          onClick={() => setOpen(true)}
        >
          <span className="bk-reminder-offer-icon" aria-hidden>⏰</span>
          Set a reminder
        </button>
      ) : (
        <div className="bk-reminder-offer-picker">
          <div className="bk-reminder-offer-prompt">When should I remind you?</div>
          <div className="bk-reminder-offer-options">
            {PRESETS.map((p) => (
              <button
                key={p.key}
                type="button"
                className="bk-reminder-offer-option"
                onClick={() => void schedule(p.computeAt())}
                disabled={busy}
              >
                {p.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            className="bk-reminder-offer-cancel"
            onClick={() => setOpen(false)}
            disabled={busy}
          >
            Not now
          </button>
        </div>
      )}
      {error ? <div className="bk-reminder-offer-error">{error}</div> : null}
    </div>
  );
}
