/**
 * Barka Labs Home Dashboard — Premium card-based layout.
 *
 * Holds state (level/score memos, nudge/invite/challenge UI flags, buddy fetch)
 * and composes the per-section cards under `./home/`. No inline JSX is more
 * than one section deep.
 */

import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { computeReflectionScore } from '../barka-labs.constants';
import type { BarkaLabsStats, PercentileData, Blessing } from '../types/barka-labs.types';
import { useKycStore } from '@/features/kyc/stores/kyc.store';
import { useBarkaLabsStore } from '../stores/barka-labs.store';
import type { BarkaLabsScreen } from '../pages/BarkaLabsPage';
import { CHALLENGE_COUNT, computeTwinPercent, getWeekOfYear } from './home/_styles';
import { InsightCards } from './home/InsightCards';
import { LevelProgression } from './home/LevelProgression';
import { PascoTwinCard } from './home/PascoTwinCard';
import { ReflectionScoreCard } from './home/ReflectionScoreCard';
import { CommunityCta } from './home/CommunityCta';
import { QuickStats } from './home/QuickStats';
import { BuddyNetwork } from './home/BuddyNetwork';
import { WeeklyChallengeCard } from './home/WeeklyChallengeCard';
import { DnzCard } from './home/DnzCard';
import { NudgeModal } from './home/NudgeModal';

interface BarkaLabsHomeProps {
  stats: BarkaLabsStats;
  blessings: Blessing[];
  percentile: PercentileData | null;
  userName: string;
  go: (s: BarkaLabsScreen) => void;
  onOpenGratModal: () => void;
  isDemo?: boolean;
}

export function BarkaLabsHome({ stats, percentile, userName, go, isDemo }: BarkaLabsHomeProps) {
  const { t } = useTranslation('demo');
  const kycTier = useKycStore((s) => s.kycTier);
  const [inviteCopied, setInviteCopied] = useState(false);
  const [nudgedBuddies, setNudgedBuddies] = useState<Set<string>>(new Set());
  const [challengeMode, setChallengeMode] = useState(false);
  const [nudgeTarget, setNudgeTarget] = useState<string | null>(null);
  const [nudgeMessage, setNudgeMessage] = useState('');
  const buddies = useBarkaLabsStore(s => s.buddies);
  const fetchBuddies = useBarkaLabsStore(s => s.fetchBuddies);

  useEffect(() => {
    if (!isDemo) fetchBuddies();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fetchBuddies is a stable zustand selector; only re-run when isDemo changes
  }, [isDemo]);

  const streak = stats.current_streak;
  const creativity = computeReflectionScore(stats.avg_depth_score, stats.total_blessings, stats.profound_count, streak);
  const currentLevel = streak >= 365 ? 4 : streak >= 60 ? 3 : streak >= 30 ? 2 : 1;

  const levelProgress = useMemo(() => {
    if (currentLevel === 4) return 100;
    const thresholds = [0, 30, 60, 365];
    const start = thresholds[currentLevel - 1];
    const end = thresholds[currentLevel];
    return Math.min(Math.round(((streak - start) / (end - start)) * 100), 100);
  }, [currentLevel, streak]);

  const twinPct = useMemo(() => computeTwinPercent(kycTier, stats), [kycTier, stats]);
  const weekChallenge = t(`home.challenges.${getWeekOfYear() % CHALLENGE_COUNT}`);
  const daysLeft = 7 - new Date().getDay();
  const participantCount = percentile?.total_users || Math.max(stats.total_blessings * 3, 50);

  const handleCopyInvite = async () => {
    const link = `${window.location.origin}/invite?ref=${userName.toLowerCase()}`;
    if (navigator.share) {
      try { await navigator.share({ title: 'Join Barakah Labs', text: 'Track your gratitude, grow your mental health, earn DinarZ!', url: link }); return; } catch { /* fallback */ }
    }
    await navigator.clipboard.writeText(link);
    setInviteCopied(true);
    setTimeout(() => setInviteCopied(false), 2000);
  };

  return (
    <div className="space-y-6 md:space-y-10">

      <InsightCards />

      <LevelProgression stats={stats} currentLevel={currentLevel} levelProgress={levelProgress} />

      <PascoTwinCard twinPct={twinPct} onClick={() => go('report')} />

      <ReflectionScoreCard creativity={creativity} onClick={() => go('creativity')} />

      <CommunityCta onClick={() => go('community')} />

      <QuickStats stats={stats} percentile={percentile} go={go} />

      <BuddyNetwork
        isDemo={!!isDemo}
        buddies={buddies}
        challengeMode={challengeMode}
        setChallengeMode={setChallengeMode}
        inviteCopied={inviteCopied}
        handleCopyInvite={handleCopyInvite}
        nudgedBuddies={nudgedBuddies}
        setNudgeTarget={setNudgeTarget}
        setNudgeMessage={setNudgeMessage}
        go={go}
      />

      <WeeklyChallengeCard
        weekChallenge={weekChallenge}
        daysLeft={daysLeft}
        participantCount={participantCount}
        onClick={() => go('challenge')}
      />

      <DnzCard isDemo={!!isDemo} go={go} />

      {!isDemo && nudgeTarget && (
        <NudgeModal
          nudgeTarget={nudgeTarget}
          nudgeMessage={nudgeMessage}
          setNudgeMessage={setNudgeMessage}
          setNudgeTarget={setNudgeTarget}
          onSend={() => {
            setNudgedBuddies(prev => new Set(prev).add(nudgeTarget));
            setNudgeTarget(null);
          }}
        />
      )}

    </div>
  );
}
