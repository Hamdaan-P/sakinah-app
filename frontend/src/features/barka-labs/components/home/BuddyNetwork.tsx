/**
 * BuddyNetwork — full (signed-in) buddy list with battle/nudge actions and
 * the demo-mode signup teaser.
 */

import { useTranslation } from 'react-i18next';
import { getDemoDisplayFont } from '@/i18n';
import { useNavigate } from 'react-router-dom';
import {
  Users, Fire, Sword, PaperPlaneTilt, Check, UserPlus,
} from '@phosphor-icons/react';
import type { BarkaLabsScreen } from '../../pages/BarkaLabsPage';
import type { BuddyEntry } from '../../types/barka-labs.types';
import { card } from './_styles';
import { SectionTitle } from './SectionTitle';

interface BuddyNetworkProps {
  isDemo: boolean;
  buddies: BuddyEntry[];
  challengeMode: boolean;
  setChallengeMode: (v: boolean | ((p: boolean) => boolean)) => void;
  inviteCopied: boolean;
  handleCopyInvite: () => void;
  nudgedBuddies: Set<string>;
  setNudgeTarget: (n: string | null) => void;
  setNudgeMessage: (m: string) => void;
  go: (s: BarkaLabsScreen) => void;
}

export function BuddyNetwork({
  isDemo, buddies, challengeMode, setChallengeMode,
  inviteCopied, handleCopyInvite, nudgedBuddies,
  setNudgeTarget, setNudgeMessage, go,
}: BuddyNetworkProps) {
  const { t } = useTranslation('demo');
  const displayFont = getDemoDisplayFont();
  const navigate = useNavigate();

  if (isDemo) {
    return (
      <div>
        <SectionTitle>{t('home.buddy.title')}</SectionTitle>
        <div className="rounded-2xl p-5 md:p-7 text-center" style={{ ...card, borderColor: 'rgba(215,181,106,0.2)' }}>
          <Users size={32} weight="duotone" className="mx-auto mb-3" style={{ color: '#D7B56A', opacity: 0.6 }} />
          <p className="text-[14px] md:text-[16px] font-bold text-[#EBDCB8] mb-1.5" style={{ fontFamily: displayFont }}>
            {t('home.buddy.demoTitle')}
          </p>
          <p className="text-[12px] md:text-[13px] mb-4" style={{ color: '#7F8A9A' }}>
            {t('home.buddy.demoDesc')}
          </p>
          <button
            onClick={() => navigate('/signup')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[12px] md:text-[13px] font-bold transition-all hover:scale-[1.02] active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #D7B56A, #E7CF8C)', color: '#1E293A' }}
          >
            <UserPlus size={14} weight="bold" /> {t('home.buddy.demoAction')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3 md:mb-5">
        <SectionTitle>{t('home.buddy.title')}</SectionTitle>
        <button
          onClick={() => setChallengeMode(prev => !prev)}
          className="flex items-center gap-1.5 px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl text-[12px] md:text-[13px] font-bold transition-all active:scale-[0.97] mb-3 md:mb-5"
          style={challengeMode
            ? { background: 'rgba(255,107,53,0.25)', border: '1px solid rgba(255,107,53,0.4)', color: '#FF6B35' }
            : { background: 'rgba(255,107,53,0.12)', border: '1px solid rgba(255,107,53,0.25)', color: '#FF6B35' }
          }
        >
          <Sword size={14} weight="fill" /> {challengeMode ? t('home.buddy.cancel') : t('home.buddy.battle')}
        </button>
      </div>
      {challengeMode && (
        <p className="text-[12px] md:text-[13px] font-medium mb-3 px-1" style={{ color: '#FF6B35' }}>
          {t('home.buddy.selectChallenge')}
        </p>
      )}
      <div className="rounded-2xl p-4 md:p-6" style={card}>
        <div className="flex items-center justify-between mb-4 md:mb-5">
          <div className="flex items-center gap-2 text-[14px] md:text-[16px] font-bold text-[#EBDCB8]">
            <Users size={20} weight="duotone" className="text-[#D7B56A]" />
            {t('home.buddy.yourBuddies')}
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md md:rounded-lg" style={{ background: 'rgba(42,157,111,0.12)', color: '#2A9D6F' }}>{t('home.buddy.online', { count: buddies.filter(b => b.status === 'online').length })}</span>
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); handleCopyInvite(); }}
            className="flex items-center gap-1 text-[11px] md:text-[13px] font-semibold px-2.5 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl transition-all active:scale-[0.97]"
            style={{ border: '1px solid rgba(215,181,106,0.25)', color: inviteCopied ? '#2A9D6F' : '#D7B56A', background: 'rgba(215,181,106,0.05)' }}
          >
            {inviteCopied ? <><Check size={12} /> {t('home.buddy.copied')}</> : <><UserPlus size={12} /> {t('home.buddy.invite')}</>}
          </button>
        </div>

        <div className="space-y-1">
          {buddies.length === 0 ? (
            <div className="text-center py-6">
              <Users size={28} weight="duotone" className="mx-auto mb-2" style={{ color: '#D7B56A', opacity: 0.5 }} />
              <p className="text-[13px] md:text-[14px] font-semibold text-[#EBDCB8] mb-1">No buddies yet</p>
              <p className="text-[11px] md:text-[12px] mb-3" style={{ color: '#7F8A9A' }}>Invite your first buddy to start your gratitude journey together</p>
              <button
                onClick={handleCopyInvite}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-bold transition-all active:scale-[0.97]"
                style={{ background: 'linear-gradient(135deg, #D7B56A, #E7CF8C)', color: '#1E293A' }}
              >
                <UserPlus size={13} weight="bold" /> Invite your first buddy
              </button>
            </div>
          ) : buddies.map(b => (
            <div key={b.user_id} className="flex items-center gap-2.5 md:gap-3.5 py-2.5 md:py-3 px-2 md:px-3 rounded-lg md:rounded-xl transition-colors hover:bg-[rgba(215,181,106,0.04)]">
              <div className="relative shrink-0">
                <div className="w-9 h-9 md:w-11 md:h-11 rounded-full flex items-center justify-center text-[13px] md:text-[15px] font-bold" style={{ background: `${b.color}18`, color: b.color }}>{(b.display_name || '?')[0]}</div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 md:w-3.5 md:h-3.5 rounded-full border-2" style={{ borderColor: 'rgba(44,60,85,0.9)', background: b.status === 'online' ? '#2A9D6F' : b.status === 'away' ? '#D7B56A' : '#E07A6B' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="text-[13px] md:text-[15px] font-semibold text-[#EBDCB8] truncate">{b.display_name}</p>
                  <span className="text-[9px] md:text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0" style={{ background: 'rgba(42,157,111,0.1)', color: '#2A9D6F' }}>L{b.level}</span>
                </div>
                <p className="text-[11px] md:text-[13px] mt-0.5 truncate" style={{ color: nudgedBuddies.has(b.display_name) ? '#2A9D6F' : '#A7B1C0' }}>
                  {b.today_blessings >= 5 ? t('home.buddy.onFire', { count: b.today_blessings }) : b.today_blessings > 0 ? t(b.today_blessings > 1 ? 'home.buddy.todayCountPlural' : 'home.buddy.todayCount', { count: b.today_blessings }) : nudgedBuddies.has(b.display_name) ? t('home.buddy.nudgeSent') : t('home.buddy.needsEncouragement')}
                </p>
              </div>
              <div className="flex flex-col items-end gap-0.5 shrink-0">
                {challengeMode ? (
                  b.status !== 'stuck' ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); setChallengeMode(false); go('battle'); }}
                      className="flex items-center gap-1 px-2.5 md:px-3.5 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-bold transition-all active:scale-[0.96]"
                      style={{ background: 'rgba(255,107,53,0.15)', border: '1px solid rgba(255,107,53,0.3)', color: '#FF6B35' }}
                    >
                      <Sword size={11} weight="fill" /> {t('home.buddy.challenge')}
                    </button>
                  ) : (
                    <span className="text-[9px] md:text-[10px] italic" style={{ color: '#7F8A9A' }}>{t('home.buddy.offline')}</span>
                  )
                ) : b.today_blessings === 0 && !nudgedBuddies.has(b.display_name) ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setNudgeTarget(b.display_name);
                      setNudgeMessage(`Yo ${b.display_name.split(' ')[0]}! You good? I noticed you haven't logged any blessings in a while. Everything alright? Let's get back on it together inshaAllah`);
                    }}
                    className="flex items-center gap-1 px-2.5 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl text-[10px] md:text-[11px] font-bold transition-all hover:bg-[rgba(224,122,107,0.15)] active:scale-[0.96]"
                    style={{ border: '1px solid rgba(224,122,107,0.3)', color: '#E07A6B' }}
                  >
                    <PaperPlaneTilt size={11} weight="fill" /> {t('home.buddy.nudge')}
                  </button>
                ) : (
                  <>
                    <div className="flex items-center gap-1 text-[14px] md:text-[16px] font-bold" style={{ color: b.status === 'stuck' ? '#E07A6B' : '#D7B56A' }}>
                      <Fire size={13} weight="fill" /> {b.streak}
                    </div>
                    <span className="text-[9px] md:text-[10px] font-medium" style={{ color: '#7F8A9A' }}>{t('home.buddy.streakLabel')}</span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={handleCopyInvite}
          className="flex items-center justify-center gap-2 w-full mt-3 md:mt-4 py-2.5 md:py-3 rounded-lg md:rounded-xl text-[12px] md:text-[13px] font-semibold transition-all active:scale-[0.98]"
          style={{ border: '1px solid rgba(215,181,106,0.2)', color: '#D7B56A', background: 'rgba(215,181,106,0.04)' }}
        >
          <UserPlus size={14} />
          {inviteCopied ? t('home.buddy.linkCopied') : t('home.buddy.inviteMore')}
        </button>
      </div>
    </div>
  );
}
