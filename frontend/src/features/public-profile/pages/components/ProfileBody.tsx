/**
 * Main body of the public profile page — hero, sections, mutuals, links.
 */

import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Briefcase, Globe, InstagramLogo, LinkedinLogo, MapPin, ShareNetwork, TwitterLogo,
} from '@phosphor-icons/react';
import type { PublicProfile } from '../../types/public-profile.types';
import { useConnectionStatus } from '@/features/connections/hooks/useConnectionStatus';
import { PASCO_COLORS, PASCO_LABELS } from './_constants';
import { SectionCard, LinkChip } from './_primitives';
import { ConnectionActionButtons } from './ConnectionActionButtons';
import { MutualsCard } from './MutualsCard';

interface ProfileBodyProps {
  profile: PublicProfile;
  isOwner: boolean;
  isAuthenticated: boolean;
  connection: ReturnType<typeof useConnectionStatus>;
  onUnauthed: () => void;
}

export function ProfileBody({
  profile, isOwner, isAuthenticated, connection, onUnauthed,
}: ProfileBodyProps) {
  const name = profile.displayName || profile.fullName || 'ZaryahPlus Member';
  const initial = (name[0] || 'Z').toUpperCase();
  const pascoColor = profile.archetype ? PASCO_COLORS[profile.archetype] ?? '#D4A853' : '#D4A853';
  const pascoLabel = profile.archetype ? PASCO_LABELS[profile.archetype] ?? profile.archetype : null;
  const memberSinceLabel = profile.memberSince
    ? new Date(profile.memberSince).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })
    : null;

  return (
    <>
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 rounded-[22px] overflow-hidden relative"
        style={{
          background: 'linear-gradient(165deg, #0A0E16 0%, #0F141F 55%, #10151F 100%)',
          border: '1px solid rgba(212,168,83,0.25)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.45)',
        }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 85% 0%, rgba(212,168,83,0.18), transparent 55%)',
          }}
        />
        <div className="relative z-10 p-6 pt-8">
          {/* Avatar */}
          <div className="flex flex-col items-center text-center">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center mb-4"
              style={{
                background: 'linear-gradient(135deg, #E8C97A, #B8943E)',
                boxShadow: '0 8px 24px rgba(212,168,83,0.35)',
              }}
            >
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt={name} className="w-24 h-24 rounded-3xl object-cover" />
              ) : (
                <span
                  className="text-[#0A0E16] text-[44px] font-bold"
                  style={{ fontFamily: "'Cormorant Garamond', serif" }}
                >
                  {initial}
                </span>
              )}
            </div>
            <h1
              className="text-[28px] font-bold tracking-tight text-[#F5E8C7]"
              style={{ fontFamily: "'Cormorant Garamond', serif" }}
            >
              {name}
            </h1>
            <div className="mt-2 flex items-center justify-center gap-2 flex-wrap">
              {pascoLabel && (
                <div
                  className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide uppercase"
                  style={{
                    backgroundColor: `${pascoColor}22`,
                    color: pascoColor,
                    border: `1px solid ${pascoColor}55`,
                  }}
                >
                  {pascoLabel} Archetype
                </div>
              )}
              {profile.gender && (
                <div
                  className="px-3 py-1 rounded-full text-[11px] font-semibold tracking-wide"
                  style={{
                    backgroundColor: profile.gender === 'male' ? 'rgba(79,184,146,0.15)' : 'rgba(232,67,147,0.15)',
                    color: profile.gender === 'male' ? '#4FB892' : '#E84393',
                    border:
                      profile.gender === 'male'
                        ? '1px solid rgba(79,184,146,0.4)'
                        : '1px solid rgba(232,67,147,0.4)',
                  }}
                >
                  {profile.gender === 'male' ? 'Brother' : 'Sister'}
                </div>
              )}
            </div>
            {(profile.profession || profile.company) && (
              <p className="mt-2 text-[#C9C0A8] text-sm flex items-center gap-1 flex-wrap justify-center">
                <Briefcase size={12} className="text-[#5C5749]" />
                {profile.profession}
                {profile.profession && profile.company && <span className="text-[#5C5749]">at</span>}
                {profile.company && <span>{profile.company}</span>}
                {profile.industry && <span className="text-[#5C5749]">· {profile.industry}</span>}
              </p>
            )}
            {profile.location && (
              <p className="mt-1 text-[#7A7363] text-xs flex items-center gap-1">
                <MapPin size={12} /> {profile.location}
              </p>
            )}

            {/* Connections count */}
            {profile.connectionsCount > 0 && (
              <p className="mt-3 text-[#F5E8C7] text-[13px] font-semibold">
                <span className="text-[#D4A853]">{profile.connectionsCount}</span>{' '}
                <span className="text-[#7A7363] font-normal">
                  {profile.connectionsCount === 1 ? 'connection' : 'connections'}
                </span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-2">
            {isOwner ? (
              <Link
                to="/profile"
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
                style={{
                  background: 'rgba(212,168,83,0.15)',
                  border: '1px solid rgba(212,168,83,0.35)',
                  color: '#D4A853',
                }}
              >
                Edit your profile
              </Link>
            ) : (
              <ConnectionActionButtons
                isAuthenticated={isAuthenticated}
                connection={connection}
                onUnauthed={onUnauthed}
                otherUid={profile.uid}
              />
            )}
            <button
              onClick={async () => {
                const url = typeof window !== 'undefined' ? window.location.href : '';
                if (navigator.share) {
                  try {
                    await navigator.share({ title: `${name} on ZaryahPlus`, url });
                  } catch { /* best-effort */ }
                } else {
                  try { await navigator.clipboard.writeText(url); } catch { /* best-effort */ }
                }
              }}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(212,168,83,0.25)',
                color: '#F5E8C7',
              }}
            >
              <ShareNetwork size={16} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* About */}
      {profile.bio && (
        <SectionCard title="About">
          <p className="text-[#C9C0A8] text-sm leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
        </SectionCard>
      )}

      {/* Islamic Interests */}
      {profile.islamicInterests.length > 0 && (
        <SectionCard title="Islamic Interests">
          <div className="flex flex-wrap gap-1.5">
            {profile.islamicInterests.map((interest, i) => (
              <span
                key={`${interest}-${i}`}
                className="px-3 py-1 rounded-full text-xs font-medium"
                style={{
                  background: 'rgba(212,168,83,0.1)',
                  border: '1px solid rgba(212,168,83,0.25)',
                  color: '#D4A853',
                }}
              >
                {interest}
              </span>
            ))}
          </div>
          {profile.islamicKnowledge && (
            <p className="mt-3 text-[#5C5749] text-[11px] uppercase tracking-wider">
              Level: <span className="text-[#C9C0A8] normal-case tracking-normal">{profile.islamicKnowledge}</span>
            </p>
          )}
        </SectionCard>
      )}

      {/* Skills + Hobbies */}
      {(profile.skills.length > 0 || profile.hobbies.length > 0) && (
        <SectionCard title="Skills & Hobbies">
          {profile.skills.length > 0 && (
            <div className="mb-3">
              <p className="text-[10px] uppercase tracking-wider text-[#5C5749] mb-1.5">Skills</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.skills.map((s, i) => (
                  <span
                    key={`${s}-${i}`}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#0F141F]/60 border border-[rgba(212,168,83,0.15)] text-[#C9C0A8]"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}
          {profile.hobbies.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider text-[#5C5749] mb-1.5">Hobbies</p>
              <div className="flex flex-wrap gap-1.5">
                {profile.hobbies.map((h, i) => (
                  <span
                    key={`${h}-${i}`}
                    className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#0F141F]/60 border border-[rgba(212,168,83,0.15)] text-[#C9C0A8]"
                  >
                    {h}
                  </span>
                ))}
              </div>
            </div>
          )}
        </SectionCard>
      )}

      {/* Mutual connections — only when viewer is signed-in and not the owner */}
      {isAuthenticated && !isOwner && (
        <MutualsCard profileUid={profile.uid} />
      )}

      {/* Links */}
      {(profile.instagramUrl || profile.twitterUrl || profile.linkedinUrl || profile.websiteUrl) && (
        <SectionCard title="Links">
          <div className="flex flex-wrap gap-2">
            {profile.websiteUrl && <LinkChip href={profile.websiteUrl} icon={<Globe size={14} />} label="Website" />}
            {profile.linkedinUrl && <LinkChip href={profile.linkedinUrl} icon={<LinkedinLogo size={14} />} label="LinkedIn" />}
            {profile.instagramUrl && <LinkChip href={profile.instagramUrl} icon={<InstagramLogo size={14} />} label="Instagram" />}
            {profile.twitterUrl && <LinkChip href={profile.twitterUrl} icon={<TwitterLogo size={14} />} label="Twitter" />}
          </div>
        </SectionCard>
      )}

      {/* Meta strip */}
      <div className="mt-4 flex items-center justify-between text-[11px] text-[#5C5749] px-2">
        {memberSinceLabel ? <span>Member since {memberSinceLabel}</span> : <span />}
        <span className="uppercase tracking-widest">zaryahplus.com</span>
      </div>
    </>
  );
}
