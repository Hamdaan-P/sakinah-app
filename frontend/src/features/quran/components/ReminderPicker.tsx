/**
 * Reminder Picker Modal
 *
 * Replaces the prompt()-based reminder UX. Centered modal with:
 *   - Channel toggle: WhatsApp vs In-app
 *   - Quick presets: In 1 hour, Today 7 PM, Tomorrow 7 AM, This Friday after Asr, Next Monday morning
 *   - Custom date + time inputs
 *   - Live "reminds Tuesday 7:00 AM" summary
 *
 * Used by the Workspace Editor's "Remind" toolbar action.
 */

import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Calendar, ChatCircleDots, CheckCircle, ClockClockwise, MoonStars, Sun, X } from '@phosphor-icons/react';

export type ReminderChannel = 'whatsapp' | 'in-app';

export interface PickedReminder {
  at: number;
  channel: ReminderChannel;
}

interface Props {
  open: boolean;
  initial?: { at?: number; channel?: ReminderChannel };
  onClose: () => void;
  onConfirm: (r: PickedReminder) => void;
  onClear?: () => void;
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function toDateInput(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function toTimeInput(d: Date): string {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

interface Preset {
  id: string;
  label: string;
  sub: string;
  icon: typeof Sun;
  compute: () => Date;
}

const PRESETS: Preset[] = [
  {
    id: 'in-1h',
    label: 'In 1 hour',
    sub: 'Quick capture',
    icon: ClockClockwise,
    compute: () => new Date(Date.now() + 60 * 60 * 1000),
  },
  {
    id: 'today-evening',
    label: 'Today 7:00 PM',
    sub: 'After Maghrib window',
    icon: MoonStars,
    compute: () => {
      const d = new Date();
      d.setHours(19, 0, 0, 0);
      if (d.getTime() < Date.now()) d.setDate(d.getDate() + 1);
      return d;
    },
  },
  {
    id: 'tomorrow-fajr',
    label: 'Tomorrow 5:30 AM',
    sub: 'Before Fajr',
    icon: Sun,
    compute: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(5, 30, 0, 0);
      return d;
    },
  },
  {
    id: 'tomorrow-morning',
    label: 'Tomorrow 7:00 AM',
    sub: 'Start the day',
    icon: Sun,
    compute: () => {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(7, 0, 0, 0);
      return d;
    },
  },
  {
    id: 'friday-afternoon',
    label: 'This Friday 1:30 PM',
    sub: 'Before Jumuʻah',
    icon: Calendar,
    compute: () => {
      const d = new Date();
      const dow = d.getDay(); // 0=Sun, 5=Fri
      const delta = (5 - dow + 7) % 7 || 7;
      d.setDate(d.getDate() + delta);
      d.setHours(13, 30, 0, 0);
      return d;
    },
  },
  {
    id: 'monday-morning',
    label: 'Monday 8:50 AM',
    sub: 'Before the work week',
    icon: Calendar,
    compute: () => {
      const d = new Date();
      const dow = d.getDay();
      const delta = (1 - dow + 7) % 7 || 7;
      d.setDate(d.getDate() + delta);
      d.setHours(8, 50, 0, 0);
      return d;
    },
  },
];

function formatSummary(d: Date): string {
  return d.toLocaleString(undefined, {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function ReminderPicker({ open, initial, onClose, onConfirm, onClear }: Props) {
  const [channel, setChannel] = useState<ReminderChannel>(initial?.channel ?? 'whatsapp');
  const [date, setDate] = useState<string>(() =>
    toDateInput(initial?.at ? new Date(initial.at) : new Date(Date.now() + 24 * 60 * 60 * 1000)),
  );
  const [time, setTime] = useState<string>(() =>
    toTimeInput(initial?.at ? new Date(initial.at) : new Date(new Date().setHours(7, 0, 0, 0))),
  );
  const [activePreset, setActivePreset] = useState<string | null>(null);

  // Reset when reopened
  useEffect(() => {
    if (!open) return;
    setChannel(initial?.channel ?? 'whatsapp');
    if (initial?.at) {
      const d = new Date(initial.at);
      setDate(toDateInput(d));
      setTime(toTimeInput(d));
    } else {
      const d = new Date();
      d.setDate(d.getDate() + 1);
      d.setHours(7, 0, 0, 0);
      setDate(toDateInput(d));
      setTime(toTimeInput(d));
    }
    setActivePreset(null);
  }, [open, initial?.at, initial?.channel]);

  const combined = useMemo(() => {
    const ts = Date.parse(`${date}T${time}:00`);
    return Number.isNaN(ts) ? null : ts;
  }, [date, time]);

  const isPast = combined != null && combined < Date.now();
  const summary = combined != null ? formatSummary(new Date(combined)) : 'Pick a date and time';

  function applyPreset(p: Preset) {
    const d = p.compute();
    setDate(toDateInput(d));
    setTime(toTimeInput(d));
    setActivePreset(p.id);
  }

  function confirm() {
    if (combined == null || isPast) return;
    onConfirm({ at: combined, channel });
  }

  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
        >
          <motion.div
            initial={{ y: 30, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 20, opacity: 0, scale: 0.97 }}
            transition={{ type: 'spring', damping: 26, stiffness: 250 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md h-[min(640px,calc(100vh-24px))] bg-[#0A0E16] border border-[#D4A853]/15 rounded-2xl flex flex-col overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-white/[0.06]">
              <div className="w-9 h-9 rounded-lg bg-rose-400/15 border border-rose-400/25 flex items-center justify-center">
                <Bell size={16} className="text-rose-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] uppercase tracking-wider font-semibold text-rose-300">
                  Set a reminder
                </p>
                <h2 className="text-base font-bold text-white truncate">
                  When should we ping you?
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-lg hover:bg-white/10 text-white/70"
                aria-label="Close reminder picker"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              {/* Channel */}
              <div>
                <p className="block text-[10px] uppercase tracking-wider font-semibold text-white/45 mb-2">
                  Where
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <ChannelButton
                    active={channel === 'whatsapp'}
                    onClick={() => setChannel('whatsapp')}
                    icon={ChatCircleDots}
                    title="WhatsApp"
                    sub="Raya sends a message"
                  />
                  <ChannelButton
                    active={channel === 'in-app'}
                    onClick={() => setChannel('in-app')}
                    icon={Bell}
                    title="In-app"
                    sub="Push notification"
                  />
                </div>
              </div>

              {/* Presets */}
              <div>
                <p className="block text-[10px] uppercase tracking-wider font-semibold text-white/45 mb-2">
                  Quick presets
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {PRESETS.map((p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        onClick={() => applyPreset(p)}
                        className={`text-left rounded-lg px-3 py-2.5 transition-colors ${
                          activePreset === p.id
                            ? 'bg-[#D4A853]/15 border border-[#D4A853]/35 text-white'
                            : 'bg-white/[0.03] border border-white/[0.06] text-white/85 hover:border-white/15'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <Icon
                            size={12}
                            className={activePreset === p.id ? 'text-[#D4A853]' : 'text-white/45'}
                          />
                          <p className="text-[12px] font-semibold">{p.label}</p>
                        </div>
                        <p className="text-[10px] text-white/45 mt-0.5">{p.sub}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom */}
              <div>
                <p className="block text-[10px] uppercase tracking-wider font-semibold text-white/45 mb-2">
                  Custom
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-[9.5px] text-white/45 mb-1">Date</p>
                    <input
                      type="date"
                      value={date}
                      onChange={(e) => {
                        setDate(e.target.value);
                        setActivePreset(null);
                      }}
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#D4A853]/40"
                    />
                  </div>
                  <div>
                    <p className="text-[9.5px] text-white/45 mb-1">Time</p>
                    <input
                      type="time"
                      value={time}
                      onChange={(e) => {
                        setTime(e.target.value);
                        setActivePreset(null);
                      }}
                      className="w-full bg-white/[0.05] border border-white/[0.08] rounded-lg px-3 py-2 text-[13px] text-white focus:outline-none focus:border-[#D4A853]/40"
                    />
                  </div>
                </div>
              </div>

              {/* Summary */}
              <div
                className={`rounded-xl border p-3 ${
                  isPast
                    ? 'border-rose-400/30 bg-rose-400/[0.06]'
                    : 'border-[#D4A853]/20 bg-[#D4A853]/[0.05]'
                }`}
              >
                <p className="text-[10px] uppercase tracking-wider font-semibold text-white/55">
                  {isPast ? 'That time is already past' : 'Raya will ping you'}
                </p>
                <p
                  className={`mt-1 text-[14px] font-semibold ${
                    isPast ? 'text-rose-200' : 'text-white'
                  }`}
                >
                  {summary}
                </p>
                <p className="text-[10.5px] text-white/45 mt-1">
                  via {channel === 'whatsapp' ? 'WhatsApp' : 'in-app push'}
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-white/[0.06] flex items-center justify-between gap-2">
              {initial?.at && onClear ? (
                <button
                  onClick={onClear}
                  className="text-[12px] text-rose-300 hover:text-rose-200 underline-offset-2 hover:underline"
                >
                  Clear reminder
                </button>
              ) : (
                <span />
              )}
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-3 py-2 rounded-lg text-[12px] text-white/60 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={confirm}
                  disabled={combined == null || isPast}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold bg-[#D4A853] text-[#0A0E16] hover:bg-[#E8C97A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <CheckCircle size={14} weight="fill" />
                  Set reminder
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

function ChannelButton({
  active,
  onClick,
  icon: Icon,
  title,
  sub,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Bell;
  title: string;
  sub: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors ${
        active
          ? 'bg-[#D4A853]/15 border border-[#D4A853]/35'
          : 'bg-white/[0.03] border border-white/[0.06] hover:border-white/15'
      }`}
    >
      <div
        className={`w-8 h-8 rounded-md flex items-center justify-center ${
          active ? 'bg-[#D4A853]/15 text-[#D4A853]' : 'bg-white/[0.04] text-white/55'
        }`}
      >
        <Icon size={15} />
      </div>
      <div className="min-w-0">
        <p className={`text-[12px] font-semibold ${active ? 'text-white' : 'text-white/85'}`}>
          {title}
        </p>
        <p className="text-[9.5px] text-white/45">{sub}</p>
      </div>
    </button>
  );
}

export default ReminderPicker;
