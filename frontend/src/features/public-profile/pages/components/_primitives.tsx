/**
 * Layout primitives + tiny shells reused on the public profile page.
 */

import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Lock, UserPlus } from '@phosphor-icons/react';

export function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-2xl p-5 bg-[#0F1724]/60 border border-[rgba(212,168,83,0.15)]"
    >
      <p className="text-[10px] font-bold uppercase tracking-widest text-[#D4A853]/70 mb-3">{title}</p>
      {children}
    </motion.div>
  );
}

export function LinkChip({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#0F141F]/60 border border-[rgba(212,168,83,0.2)] text-[#C9C0A8] hover:bg-[#0F141F] transition-colors"
    >
      {icon}
      {label}
    </a>
  );
}

export function LoadingShell() {
  return (
    <div className="mt-12 flex flex-col items-center gap-3 text-[#5C5749]">
      <div className="w-10 h-10 rounded-full border-2 border-[#D4A853]/30 border-t-[#D4A853] animate-spin" />
      <p className="text-xs">Loading profile…</p>
    </div>
  );
}

export function NotFoundShell({ slug }: { slug: string }) {
  return (
    <div className="mt-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0F141F]/60 border border-[rgba(212,168,83,0.2)] mb-4">
        <UserPlus size={28} className="text-[#D4A853]" />
      </div>
      <h2 className="text-2xl font-bold text-[#F5E8C7]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        Profile not found
      </h2>
      <p className="mt-2 text-sm text-[#7A7363] max-w-sm mx-auto">
        We couldn&apos;t find anyone with the handle <span className="text-[#D4A853]">@{slug}</span>. They may have changed it or their
        profile is no longer active.
      </p>
      <Link
        to="/welcome"
        className="mt-6 inline-block px-5 py-2.5 rounded-xl text-sm font-semibold"
        style={{ background: 'linear-gradient(90deg, #D4A853, #E8C97A)', color: '#0A0E16' }}
      >
        Explore ZaryahPlus
      </Link>
    </div>
  );
}

export function PrivateShell() {
  return (
    <div className="mt-16 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#0F141F]/60 border border-[rgba(212,168,83,0.2)] mb-4">
        <Lock size={26} className="text-[#D4A853]" />
      </div>
      <h2 className="text-2xl font-bold text-[#F5E8C7]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
        This profile is private
      </h2>
      <p className="mt-2 text-sm text-[#7A7363] max-w-sm mx-auto">
        The owner has chosen to keep their ZaryahPlus profile visible only to themselves.
      </p>
    </div>
  );
}
