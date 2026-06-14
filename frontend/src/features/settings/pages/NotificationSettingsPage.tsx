/**
 * Notification preferences — daily Qur'an reminder time + toggle for
 * streak/hifz reminders. Wraps notificationScheduler.
 */

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Bell, BellSlash, Fire, Brain, BookOpen, Sun } from '@phosphor-icons/react';
import {
  ensurePermission,
  getPrefs,
  savePrefs,
  rescheduleAll,
  cancelAll,
  scheduleTestPrayerNotification,
  type NotificationPrefs,
} from '@/lib/notificationScheduler';

export function NotificationSettingsPage() {
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<NotificationPrefs>(getPrefs());
  const [permGranted, setPermGranted] = useState<boolean | null>(null);

  useEffect(() => {
    void (async () => {
      // Don't auto-prompt — only check current status. User triggers prompt
      // by toggling Enabled to ON.
      if (typeof Notification !== 'undefined') {
        setPermGranted(Notification.permission === 'granted');
      }
    })();
  }, []);

  const update = async (patch: Partial<NotificationPrefs>) => {
    const next = savePrefs(patch);
    setPrefs(next);
    if (next.enabled) {
      const ok = await ensurePermission();
      setPermGranted(ok);
      if (ok) await rescheduleAll();
    } else {
      await cancelAll();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0A0E16] to-[#0F141F] pb-24">
      <div className="sticky top-0 z-10 bg-[#0A0E16]/95 backdrop-blur-md border-b border-white/5">
        <div className="px-4 h-14 flex items-center gap-2">
          <button
            onClick={() => navigate(-1)}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-white/70" />
          </button>
          <h1 className="text-sm font-semibold text-white">Notifications</h1>
        </div>
      </div>

      <div className="px-4 pt-5 space-y-3">
        <p className="text-xs text-white/55 leading-relaxed">
          Stay on track with gentle reminders to read the Qur'an, keep your streak alive,
          and revise weak hifz ayahs.
        </p>

        {/* Master toggle */}
        <ToggleRow
          icon={prefs.enabled ? <Bell size={18} weight="fill" className="text-[#D4A853]" /> : <BellSlash size={18} className="text-white/40" />}
          title="All notifications"
          desc={prefs.enabled ? 'Reminders are armed' : 'No reminders will fire'}
          value={prefs.enabled}
          onChange={(v) => update({ enabled: v })}
        />

        {/* Permission warning */}
        {prefs.enabled && permGranted === false && (
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-3">
            <p className="text-xs text-amber-100/85">
              System permission denied. Open device Settings → Apps → ZaryahPlus → Notifications, then come back.
            </p>
          </div>
        )}

        {/* Daily reminder time */}
        <div className={`rounded-xl bg-white/3 border border-white/8 p-4 ${!prefs.enabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center gap-2 mb-2">
            <BookOpen size={16} className="text-[#D4A853]" />
            <p className="text-sm font-semibold text-white">Daily Qur'an reminder</p>
          </div>
          <p className="text-[11px] text-white/55 mb-3">A daily prompt at your chosen time.</p>
          <input
            type="time"
            value={prefs.dailyQuranTime}
            onChange={(e) => update({ dailyQuranTime: e.target.value })}
            className="bg-[#0A0E16]/60 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#D4A853]/40 [color-scheme:dark]"
          />
        </div>

        {/* Streak warning */}
        <ToggleRow
          icon={<Fire size={18} weight="fill" className="text-orange-400" />}
          title="Streak about-to-end warning"
          desc="Late-evening nudge if you haven't met today's daily target"
          value={prefs.streakWarning}
          onChange={(v) => update({ streakWarning: v })}
          disabled={!prefs.enabled}
        />

        {/* Hifz revision */}
        <ToggleRow
          icon={<Brain size={18} weight="fill" className="text-[#B891E8]" />}
          title="Hifz revision reminder"
          desc="Morning nudge when you have weak ayahs to revise"
          value={prefs.hifzReminder}
          onChange={(v) => update({ hifzReminder: v })}
          disabled={!prefs.enabled}
        />

        {/* Prayer time reminders — uses cached Aladhan times */}
        <ToggleRow
          icon={<Sun size={18} weight="fill" className="text-amber-300" />}
          title="Prayer time reminders"
          desc="Five daily notifications at Fajr, Dhuhr, Asr, Maghrib & Isha — based on your location"
          value={prefs.prayerNotifications}
          onChange={(v) => update({ prayerNotifications: v })}
          disabled={!prefs.enabled}
        />

        <button
          onClick={async () => {
            await scheduleTestPrayerNotification(15);
            alert('Test notification will fire in ~15 seconds. Lock your phone or background the app to confirm it shows up.');
          }}
          disabled={!prefs.enabled}
          className="w-full mt-3 py-2.5 rounded-xl bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853] text-xs font-semibold disabled:opacity-50"
        >
          Send test prayer notification (15s)
        </button>

        <div className="rounded-xl bg-white/3 border border-white/8 p-3 mt-6">
          <p className="text-[10px] uppercase tracking-wide text-white/45 font-semibold mb-1">About</p>
          <p className="text-[11px] text-white/55 leading-relaxed">
            Reminders are scheduled on your device — they fire even when the app is closed.
            Server-pushed notifications (someone messaged you, halaqah update) require
            additional Firebase setup and will arrive automatically once enabled.
          </p>
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  icon, title, desc, value, onChange, disabled,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  value: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={() => !disabled && onChange(!value)}
      disabled={disabled}
      className={`w-full flex items-center gap-3 p-4 rounded-xl bg-white/3 border ${value ? 'border-[#D4A853]/30' : 'border-white/8'} text-left ${disabled ? 'opacity-50' : ''}`}
    >
      <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center shrink-0">{icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-[11px] text-white/55 line-clamp-2">{desc}</p>
      </div>
      <div className={`w-9 h-5 rounded-full px-0.5 flex items-center transition-colors flex-shrink-0 ${value ? 'bg-[#D4A853]' : 'bg-white/15'}`}>
        <div
          className={`w-4 h-4 rounded-full bg-white transition-transform ${value ? 'translate-x-4' : 'translate-x-0'}`}
        />
      </div>
    </button>
  );
}

export default NotificationSettingsPage;
