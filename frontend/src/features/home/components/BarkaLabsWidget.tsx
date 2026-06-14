import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sparkle, Fire, TreeStructure, CaretRight, Flask } from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { useBarkaLabsStore } from '@/features/barka-labs/stores/barka-labs.store';
import { useAuthStore } from '@/core/stores/auth.store';
import { MiniStat, DepthDot, BarkaLabsLoadingState } from './barka-labs-widget/_primitives';

interface BarkaLabsWidgetProps {
  onTap?: () => void;
  className?: string;
}

export function BarkaLabsWidget({ onTap, className }: BarkaLabsWidgetProps) {
  const userId = useAuthStore((s) => s.user?.id);
  const stats = useBarkaLabsStore((s) => s.stats);
  const loading = useBarkaLabsStore((s) => s.loading);
  const fetchStats = useBarkaLabsStore((s) => s.fetchStats);
  const fetchBlessings = useBarkaLabsStore((s) => s.fetchBlessings);
  const blessings = useBarkaLabsStore((s) => s.blessings);

  useEffect(() => {
    if (!userId) return;
    fetchStats();
    if (blessings.length === 0) fetchBlessings(3);
  }, [userId, fetchStats, fetchBlessings, blessings.length]);

  const hasBlessings = stats.total_blessings > 0;
  const recentBlessings = blessings.slice(0, 2);

  if (loading && !hasBlessings) {
    return <BarkaLabsLoadingState className={className} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      onClick={onTap}
      className={cn(
        'relative rounded-2xl overflow-hidden cursor-pointer group',
        className
      )}
      style={{
        background: 'linear-gradient(135deg, #10151F 0%, #0A0E16 50%, #0F141F 100%)',
        border: '1px solid rgba(212,168,83,0.25)',
      }}
    >
      {/* Gold accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#1B6B4A] via-[#D4A853] to-[#1B6B4A]" />

      {/* Subtle floating particles background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute w-32 h-32 rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #D4A853, transparent)', top: '-10%', right: '-5%' }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.04, 0.07, 0.04] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="absolute w-24 h-24 rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #3ABFAD, transparent)', bottom: '5%', left: '10%' }}
          animate={{ scale: [1, 1.2, 1], opacity: [0.03, 0.06, 0.03] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        />
      </div>

      <div className="relative z-10 p-5">
        {/* Header row */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1B6B4A, #2A9D6F)' }}
            >
              <Flask size={20} weight="fill" className="text-[#E8C97A]" />
            </div>
            <div>
              <h3 className="text-[15px] font-bold text-[#F5E8C7]">Barakah Labs</h3>
              <p className="text-[10px] text-[#7A7363]">Gratitude tracker</p>
            </div>
          </div>
          <CaretRight
            size={18}
            className="text-[#D4A853]/40 group-hover:text-[#D4A853]/70 transition-colors"
          />
        </div>

        {hasBlessings ? (
          <>
            {/* Hero stats — big blessing count + supporting stats */}
            <div className="flex items-center gap-4 mb-5">
              {/* Main count — glowing ring */}
              <div className="relative flex items-center justify-center">
                <div
                  className="w-[72px] h-[72px] rounded-full flex flex-col items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(27,107,74,0.3), rgba(212,168,83,0.15))',
                    border: '2px solid rgba(212,168,83,0.35)',
                    boxShadow: '0 0 20px rgba(212,168,83,0.12), inset 0 0 12px rgba(27,107,74,0.1)',
                  }}
                >
                  <span className="text-xl font-bold text-[#E8C97A] leading-none">
                    {stats.total_blessings}
                  </span>
                  <span className="text-[8px] text-[#7A7363] mt-0.5 uppercase tracking-wider">
                    blessings
                  </span>
                </div>
              </div>

              {/* Side stats */}
              <div className="flex-1 grid grid-cols-2 gap-2">
                <MiniStat
                  icon={<Fire size={13} weight="fill" />}
                  label="Streak"
                  value={`${stats.current_streak}d`}
                  color="#E07A6B"
                />
                <MiniStat
                  icon={<TreeStructure size={13} weight="fill" />}
                  label="Depth"
                  value={stats.avg_depth_score > 0 ? stats.avg_depth_score.toFixed(1) : '—'}
                  color="#3ABFAD"
                />
                <MiniStat
                  icon={<Sparkle size={13} weight="fill" />}
                  label="Profound"
                  value={String(stats.profound_count)}
                  color="#D4A853"
                />
                <MiniStat
                  icon={<Sparkle size={13} weight="fill" />}
                  label="Score"
                  value={String(stats.total_score)}
                  color="#5B8DEF"
                />
              </div>
            </div>

            {/* Recent blessings — compact, elegant */}
            {recentBlessings.length > 0 && (
              <div className="space-y-1.5">
                {recentBlessings.map((b, i) => (
                  <motion.div
                    key={b.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
                    style={{
                      background: 'rgba(10,14,22,0.6)',
                      border: '1px solid rgba(212,168,83,0.1)',
                    }}
                  >
                    <DepthDot depth={b.depth} />
                    <span className="text-xs text-[#C9C0A8] truncate flex-1 leading-relaxed">
                      {b.text}
                    </span>
                    <span className="text-[10px] text-[#D4A853]/80 font-semibold shrink-0">
                      +{b.dnz_earned}
                    </span>
                  </motion.div>
                ))}
              </div>
            )}
          </>
        ) : (
          /* Empty state — inviting CTA */
          <div className="flex flex-col items-center py-4">
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              className="w-14 h-14 rounded-full flex items-center justify-center mb-3"
              style={{
                background: 'linear-gradient(135deg, rgba(27,107,74,0.25), rgba(212,168,83,0.15))',
                border: '1.5px solid rgba(212,168,83,0.25)',
              }}
            >
              <Flask size={24} weight="duotone" className="text-[#E8C97A]" />
            </motion.div>
            <p className="text-sm text-[#F5E8C7] font-semibold mb-1">
              Count your blessings
            </p>
            <p className="text-xs text-[#5C5749] text-center max-w-[220px]">
              Track gratitude daily, earn DinarZ, and grow your reflection depth
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}

