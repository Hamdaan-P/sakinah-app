/**
 * Empty-state card for each tab of the Connections page.
 */

import { motion } from 'framer-motion';
import { Clock, Sparkle, UserCheck } from '@phosphor-icons/react';

type TabKey = 'discover' | 'sent' | 'connected';

export function EmptyState({ tab }: { tab: TabKey }) {
  const messages: Record<TabKey, { icon: React.ReactNode; title: string; body: string }> = {
    discover: {
      icon: <Sparkle size={26} className="text-[#D4A853]" weight="fill" />,
      title: 'No suggestions yet',
      body: 'Fill out more of your profile — archetype, interests, skills — and we’ll surface people you have things in common with.',
    },
    sent: {
      icon: <Clock size={26} className="text-[#D4A853]" />,
      title: 'No pending requests',
      body: 'Requests you’ve sent that haven’t been answered yet will appear here.',
    },
    connected: {
      icon: <UserCheck size={26} className="text-[#D4A853]" />,
      title: 'No connections yet',
      body: 'Find people to connect with — scan a profile QR or visit a public profile and tap Connect.',
    },
  };
  const m = messages[tab];
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-10 text-center relative"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 40%, rgba(212,168,83,0.08), transparent 60%)',
        }}
      />
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        className="relative inline-flex items-center justify-center w-20 h-20 rounded-full mb-5"
        style={{
          background:
            'radial-gradient(circle, rgba(212,168,83,0.18), rgba(36,50,70,0.6))',
          border: '1px solid rgba(212,168,83,0.3)',
          boxShadow: '0 8px 32px rgba(212,168,83,0.12)',
        }}
      >
        <div className="scale-[1.3]">{m.icon}</div>
      </motion.div>
      <h2
        className="relative text-xl font-semibold text-[#F5E8C7]"
        style={{ fontFamily: "'Cormorant Garamond', serif" }}
      >
        {m.title}
      </h2>
      <p className="relative mt-2 text-[#7A7363] text-sm max-w-sm mx-auto leading-relaxed">
        {m.body}
      </p>
    </motion.div>
  );
}
