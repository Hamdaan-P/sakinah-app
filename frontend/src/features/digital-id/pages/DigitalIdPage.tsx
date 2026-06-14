/**
 * DigitalIdPage
 * Mirrors Flutter's digital_id_page.dart
 * Flippable Digital ID card showing user profile, PASCO archetype, and verification status
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, ShieldWarning, Copy, DownloadSimple, QrCode, Calendar,
  IdentificationCard, Fingerprint, ChartPie, HandTap,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/core/stores/auth.store';

// ==================== PASCO Data ====================

const ARCHETYPE_LABELS: Record<string, string> = {
  piety: 'Piety Seeker',
  amanah: 'Steadfast Trustee',
  service: 'Servant Leader',
  community: 'Ummah Connector',
  opportunity: 'Visionary Builder',
};

const ARCHETYPE_COLORS: Record<string, string> = {
  piety: '#22C55E',
  amanah: '#3B82F6',
  service: '#EC4899',
  community: '#8B5CF6',
  opportunity: '#F59E0B',
};

const ARCHETYPE_EMOJIS: Record<string, string> = {
  piety: '🌙',
  amanah: '🛡️',
  service: '💝',
  community: '👥',
  opportunity: '🚀',
};

// ==================== Component ====================

export function DigitalIdPage() {
  const { user } = useAuthStore();
  const [isFlipped, setIsFlipped] = useState(false);
  const [copied, setCopied] = useState(false);

  // Placeholder values (would come from user profile / PASCO assessment)
  const archetype = 'piety';
  const isKycVerified = false;
  const pascoScores: Record<string, number> = {
    piety: 9, amanah: 7, service: 6, community: 8, opportunity: 5,
  };
  const pascoTopTraits = ['piety', 'community'];
  const memberSince = new Date();

  const archetypeLabel = ARCHETYPE_LABELS[archetype] ?? 'ZaryahPlus Member';
  const archetypeColor = ARCHETYPE_COLORS[archetype] ?? '#D4A853';
  const archetypeEmoji = ARCHETYPE_EMOJIS[archetype] ?? '🌟';

  const digitalId = useMemo(() => {
    const uid = user?.id ?? 'ZARYAH';
    const ts = Date.now().toString().slice(5);
    return `ZP-${uid.substring(0, 6).toUpperCase()}-${ts}`;
  }, [user?.id]);

  const formatDate = (date: Date) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(digitalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-full relative">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#10151F] via-[#10151F] to-[#0A0E16] pointer-events-none" />

      {/* Floating orbs */}
      <div className="absolute top-24 -right-12 w-[200px] h-[200px] rounded-full bg-[radial-gradient(circle,rgba(212,168,83,0.15),transparent)] animate-pulse pointer-events-none" />
      <div className="absolute bottom-40 -left-20 w-[250px] h-[250px] rounded-full bg-[radial-gradient(circle,rgba(45,200,180,0.1),transparent)] animate-pulse pointer-events-none" />

      <div className="relative z-10 max-w-lg mx-auto px-5 py-6 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-4">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-[#D4A853] to-[#E8C97A] bg-clip-text text-transparent">
            Digital ID
          </h1>
        </motion.div>

        {/* Verification badge */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="flex justify-center mb-4">
          <div className={cn(
            'flex items-center gap-2 px-4 py-2 rounded-full border',
            isKycVerified
              ? 'bg-emerald-500/15 border-emerald-500/30'
              : 'bg-[#D4A853]/15 border-[#D4A853]/30',
          )}>
            {isKycVerified
              ? <ShieldCheck size={16} className="text-emerald-400" />
              : <ShieldWarning size={16} className="text-[#D4A853]" />
            }
            <span className={cn(
              'text-xs font-semibold',
              isKycVerified ? 'text-emerald-400' : 'text-[#D4A853]',
            )}>
              {isKycVerified ? 'Verified Member' : 'Pending Verification'}
            </span>
          </div>
        </motion.div>

        {/* Title */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="text-center mb-8">
          <p className="text-xl font-bold text-[#F5E8C7]">Your ZaryahPlus Digital ID</p>
          <p className="text-sm text-[#C9C0A8] mt-1">Your unique identity in the ZaryahPlus ecosystem</p>
        </motion.div>

        {/* Flippable Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="perspective-[1000px] cursor-pointer mb-6"
          onClick={() => setIsFlipped(!isFlipped)}
        >
          <div
            className="relative w-full transition-transform duration-600 preserve-3d"
            style={{
              height: 420,
              transformStyle: 'preserve-3d',
              transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0)',
              transition: 'transform 0.6s ease',
            }}
          >
            {/* Front Card */}
            <div
              className="absolute inset-0 rounded-xl overflow-hidden backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <div
                className="w-full h-full p-6 flex flex-col"
                style={{
                  background: `linear-gradient(135deg, #1A1A2E, #0D0D15, ${archetypeColor}33)`,
                  boxShadow: `0 10px 30px rgba(212,168,83,0.2)`,
                }}
              >
                {/* Card header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#D4A853] to-[#E8C97A] flex items-center justify-center">
                      <span className="text-white font-bold text-sm">Z+</span>
                    </div>
                    <div>
                      <p className="text-base font-bold text-[#D4A853]">ZaryahPlus</p>
                      <p className="text-[10px] text-[#C9C0A8] tracking-wider">Digital ID</p>
                    </div>
                  </div>

                  {isKycVerified && (
                    <div className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 border border-emerald-500/50">
                      <ShieldCheck size={14} className="text-emerald-400" />
                      <span className="text-[10px] font-bold text-emerald-400 tracking-wide">VERIFIED</span>
                    </div>
                  )}
                </div>

                <div className="flex-1" />

                {/* User profile */}
                <div className="flex items-center gap-5">
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
                    style={{
                      background: `linear-gradient(135deg, ${archetypeColor}, ${archetypeColor}B3)`,
                      boxShadow: `0 0 15px ${archetypeColor}4D`,
                    }}
                  >
                    {archetypeEmoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xl font-bold text-[#F5E8C7] truncate">
                      {user?.displayName ?? 'ZaryahPlus Member'}
                    </p>
                    <p className="text-sm font-semibold mt-1" style={{ color: archetypeColor }}>
                      {archetypeLabel}
                    </p>
                  </div>
                </div>

                {/* ID Number */}
                <div className="mt-6 px-4 py-3 rounded-xl bg-white/5 border border-white/10 flex items-center justify-between">
                  <div>
                    <p className="text-[10px] text-[#C9C0A8] tracking-wider">ID NUMBER</p>
                    <p className="text-base font-bold text-[#D4A853] tracking-wider font-mono mt-1">{digitalId}</p>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                    className="p-2 text-[#C9C0A8] hover:text-[#D4A853] transition-colors"
                  >
                    <Copy size={20} />
                  </button>
                </div>

                {/* Member since */}
                <div className="mt-4 flex items-center gap-2">
                  <Calendar size={14} className="text-[#C9C0A8]" />
                  <span className="text-xs text-[#C9C0A8]">Member since {formatDate(memberSince)}</span>
                </div>
              </div>
            </div>

            {/* Back Card */}
            <div
              className="absolute inset-0 rounded-xl overflow-hidden"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <div
                className="w-full h-full p-6 flex flex-col"
                style={{
                  background: 'linear-gradient(135deg, #1A1A2E, #0D0D15)',
                  boxShadow: '0 10px 30px rgba(212,168,83,0.2)',
                }}
              >
                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <p className="text-lg font-bold text-[#D4A853]">PASCO Profile</p>
                  <div className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#D4A853] to-[#E8C97A]">
                    <span className="text-white font-bold text-sm">Z+</span>
                  </div>
                </div>

                {/* Trait bars */}
                <div className="flex-1 flex flex-col justify-center gap-3">
                  {Object.entries(pascoScores).map(([trait, score]) => (
                    <TraitBar
                      key={trait}
                      label={trait.charAt(0).toUpperCase() + trait.slice(1)}
                      score={score}
                      maxScore={12}
                      color={ARCHETYPE_COLORS[trait] ?? '#D4A853'}
                    />
                  ))}
                </div>

                {/* Top traits */}
                {pascoTopTraits.length > 0 && (
                  <div className="mt-4">
                    <p className="text-[11px] text-[#C9C0A8] tracking-wider mb-2">TOP TRAITS</p>
                    <div className="flex gap-2">
                      {pascoTopTraits.slice(0, 2).map((trait) => {
                        const color = ARCHETYPE_COLORS[trait] ?? '#D4A853';
                        return (
                          <span
                            key={trait}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold border"
                            style={{
                              color,
                              backgroundColor: `${color}26`,
                              borderColor: `${color}80`,
                            }}
                          >
                            {trait.charAt(0).toUpperCase() + trait.slice(1)}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* QR placeholder */}
                <div className="mt-4 flex justify-center">
                  <div className="w-[60px] h-[60px] rounded-lg bg-white flex items-center justify-center">
                    <QrCode size={40} className="text-[#10151F]" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tap hint */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <HandTap size={16} className="text-[#C9C0A8]" />
          <span className="text-xs text-[#C9C0A8]">Tap card to flip</span>
        </div>

        {/* Features */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
          <p className="text-lg font-semibold text-[#F5E8C7] mb-4">What your Digital ID includes</p>
          <div className="space-y-3">
            {[
              { icon: <IdentificationCard size={20} />, title: 'Verified Identity', desc: 'Your authentic digital identity in the ZaryahPlus ecosystem' },
              { icon: <Fingerprint size={20} />, title: 'Secure Access', desc: 'Access all ZaryahPlus features with your unique ID' },
              { icon: <ChartPie size={20} />, title: 'PASCO Profile', desc: 'Personalized recommendations based on your personality' },
            ].map((f) => (
              <div
                key={f.title}
                className="flex items-center gap-4 p-4 rounded-xl border bg-gradient-to-br from-[#10151F]/80 to-[#10151F]/60 border-[rgba(212,168,83,0.2)]"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4A853] to-[#E8C97A] flex items-center justify-center text-white shrink-0">
                  {f.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#F5E8C7]">{f.title}</p>
                  <p className="text-xs text-[#C9C0A8] mt-0.5">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Actions */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-8">
          {!isKycVerified && (
            <button className="w-full min-h-[54px] px-[22px] py-[14px] rounded-lg bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-white font-semibold text-base flex items-center justify-center gap-2.5 shadow-[0_0_15px_rgba(212,168,83,0.3)] mb-3">
              <ShieldCheck size={20} />
              Complete Verification
            </button>
          )}

          <div className="flex gap-3">
            <button className="flex-1 min-h-[52px] py-[14px] rounded-lg border border-[#D4A853]/30 bg-[#10151F] flex items-center justify-center gap-2 text-[#D4A853] font-semibold text-sm hover:border-[#D4A853]/50 transition-colors">
              <DownloadSimple size={20} />
              Save
            </button>
            <button className="flex-1 min-h-[52px] py-[14px] rounded-lg border border-[#D4A853]/30 bg-[#10151F] flex items-center justify-center gap-2 text-[#D4A853] font-semibold text-sm hover:border-[#D4A853]/50 transition-colors">
              <QrCode size={20} />
              QR Code
            </button>
          </div>
        </motion.div>

        {/* Copy toast */}
        <AnimatePresence>
          {copied && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-24 left-1/2 -translate-x-1/2 px-4 py-2 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-sm text-[#F5E8C7] z-50"
            >
              ID copied to clipboard
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ==================== Sub-components ====================

function TraitBar({ label, score, maxScore, color }: { label: string; score: number; maxScore: number; color: string }) {
  const pct = (score / maxScore) * 100;
  return (
    <div className="flex items-center gap-3">
      <span className="w-[90px] text-[13px] text-[#C9C0A8]">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
        <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
      <span className="w-[30px] text-right text-[13px] font-semibold" style={{ color }}>{score}</span>
    </div>
  );
}
