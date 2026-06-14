/**
 * SettingsPage
 * Mirrors Flutter's settings_page.dart
 * Preferences, Security, and About sections with toggle switches
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bell,
  Envelope,
  BellRinging,
  Key,
  Lock,
  Sidebar,
  Lightning,
  ShieldCheck,
  FileText,
  Info,
  CaretRight,
  WhatsappLogo,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { trackFeature } from '@/lib/analytics';

export function SettingsPage() {
  useEffect(() => { trackFeature('settings'); }, []);
  const navigate = useNavigate();
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [compactSidebar, setCompactSidebar] = useState(false);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [autoLock, setAutoLock] = useState(true);

  return (
    <div className="min-h-full relative">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#10151F] via-[#10151F] to-[#0A0E16] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-6 pb-24">
        {/* Header */}
        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="text-2xl font-bold bg-gradient-to-r from-[#D4A853] to-[#E8C97A] bg-clip-text text-transparent mb-6"
        >
          Settings
        </motion.h1>

        {/* Preferences */}
        <SectionTitle title="Preferences" />
        <div className="space-y-2.5">
          <ListTile
            icon={<Bell size={20} />}
            title="Notifications"
            subtitle="Prayer times, daily Qur'an, hifz reminders + test"
            onClick={() => navigate('/settings/notifications')}
            delay={0.08}
          />
          <SwitchTile
            icon={<Bell size={20} />}
            title="Browser Notifications"
            subtitle="Show notifications in this browser"
            value={notificationsEnabled}
            onChange={setNotificationsEnabled}
            delay={0.1}
          />
          <SwitchTile
            icon={<Envelope size={20} />}
            title="Email Notifications"
            subtitle="Receive updates via email"
            value={emailNotifications}
            onChange={setEmailNotifications}
            delay={0.15}
          />
          <SwitchTile
            icon={<BellRinging size={20} />}
            title="Push Notifications"
            subtitle="Receive push notifications"
            value={pushNotifications}
            onChange={setPushNotifications}
            delay={0.2}
          />
        </div>

        {/* Connected Channels — TL §5 Step 8 entry-point to the WhatsApp link flow. */}
        <div className="mt-6">
          <SectionTitle title="Connected Channels" />
          <div className="space-y-2.5">
            <ListTile
              icon={<WhatsappLogo size={20} weight="fill" />}
              title="Chat with Raya on WhatsApp"
              subtitle="Link your account to message Raya from WhatsApp"
              onClick={() => navigate('/settings/whatsapp')}
              delay={0.21}
            />
          </div>
        </div>

        {/* Desktop Experience */}
        <div className="mt-6">
          <SectionTitle title="Desktop Experience" />
          <div className="space-y-2.5">
            <SwitchTile
              icon={<Sidebar size={20} />}
              title="Compact Sidebar"
              subtitle="Use a tighter sidebar layout on desktop"
              value={compactSidebar}
              onChange={setCompactSidebar}
              delay={0.22}
            />
            <SwitchTile
              icon={<Lightning size={20} />}
              title="Reduce Motion"
              subtitle="Minimize animations on desktop"
              value={reduceMotion}
              onChange={setReduceMotion}
              delay={0.26}
            />
          </div>
        </div>

        {/* Security */}
        <div className="mt-6">
          <SectionTitle title="Security" />
          <div className="space-y-2.5">
            <ListTile
              icon={<Key size={20} />}
              title="Change Password"
              subtitle="Update your password"
              onClick={() => {/* TODO: password dialog */}}
              delay={0.25}
            />
            <SwitchTile
              icon={<Lock size={20} />}
              title="Auto Lock"
              subtitle="Require login after inactivity"
              value={autoLock}
              onChange={setAutoLock}
              delay={0.3}
            />
          </div>
        </div>

        {/* About */}
        <div className="mt-6">
          <SectionTitle title="About" />
          <div className="space-y-2.5">
            <ListTile
              icon={<ShieldCheck size={20} />}
              title="Privacy Policy"
              subtitle="Read our privacy policy"
              onClick={() => {}}
              delay={0.35}
            />
            <ListTile
              icon={<FileText size={20} />}
              title="Terms of Service"
              subtitle="Read terms and conditions"
              onClick={() => {}}
              delay={0.4}
            />
            <ListTile
              icon={<Info size={20} />}
              title="App Version"
              subtitle="1.0.0"
              onClick={() => {}}
              delay={0.45}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== Sub-components ====================

function SectionTitle({ title }: { title: string }) {
  return (
    <p className="text-sm font-bold text-[#D4A853] mb-2 mt-2">{title}</p>
  );
}

function SwitchTile({
  icon,
  title,
  subtitle,
  value,
  onChange,
  delay = 0,
  disabled = false,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  value: boolean;
  onChange: (val: boolean) => void;
  delay?: number;
  disabled?: boolean;
}) {
  const isEnabled = !disabled;
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className={cn(
        'flex items-center gap-3.5 p-4 rounded-2xl border',
        'bg-gradient-to-br from-[#10151F]/80 to-[#10151F]/60',
        'border-[#D4A853]/20',
        'shadow-[0_4px_10px_rgba(10,20,40,0.3)]',
      )}
    >
      <div
        className={cn(
          'w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0',
          isEnabled
            ? 'bg-[#D4A853]/10 border-[#D4A853]/30 text-[#D4A853]'
            : 'bg-[#D4A853]/5 border-[#D4A853]/15 text-[#D4A853]/50',
        )}
      >
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-semibold', isEnabled ? 'text-[#F5E8C7]' : 'text-[#F5E8C7]/50')}>
          {title}
        </p>
        <p className={cn('text-xs', isEnabled ? 'text-[#C9C0A8]' : 'text-[#C9C0A8]/70')}>
          {subtitle}
        </p>
      </div>
      <button
        onClick={() => !disabled && onChange(!value)}
        disabled={disabled}
        role="switch"
        aria-checked={value}
        className={cn(
          'w-11 h-6 rounded-full px-0.5 flex items-center flex-shrink-0 transition-colors duration-200',
          value ? 'bg-[#2C5F5F]' : 'bg-[#7A7363]/30',
          disabled && 'opacity-50 cursor-not-allowed',
        )}
      >
        <span
          className={cn(
            'w-5 h-5 rounded-full transition-transform duration-200',
            value ? 'translate-x-5 bg-[#D4A853]' : 'translate-x-0 bg-[#C9C0A8]',
          )}
        />
      </button>
    </motion.div>
  );
}

function ListTile({
  icon,
  title,
  subtitle,
  onClick,
  delay = 0,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
  delay?: number;
}) {
  return (
    <motion.button
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-3.5 p-4 rounded-2xl border text-left',
        'bg-gradient-to-br from-[#10151F]/80 to-[#10151F]/60',
        'border-[#D4A853]/20',
        'shadow-[0_4px_10px_rgba(10,20,40,0.3)]',
        'hover:border-[#D4A853]/40 transition-colors',
      )}
    >
      <div className="w-10 h-10 rounded-xl border bg-[#D4A853]/10 border-[#D4A853]/30 text-[#D4A853] flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-[#F5E8C7]">{title}</p>
        <p className="text-xs text-[#C9C0A8]">{subtitle}</p>
      </div>
      <CaretRight size={20} className="text-[#D4A853]/70 shrink-0" />
    </motion.button>
  );
}
