/**
 * About + Identity/Interests + Financial cards for ProfileSettingsPage.
 * Verbatim — no behavior changes.
 */

import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Briefcase, Buildings, Calendar, MapPin, Moon, Phone, Target, TrendUp,
} from '@phosphor-icons/react';
import type { UserProfile } from '../../types/profile.types';

interface DetailsSectionProps {
  profile: UserProfile | null;
}

export function ProfileDetailsSection({ profile }: DetailsSectionProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* ── About Card ── */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-[#0F1724]/60 border border-[rgba(212,168,83,0.15)] overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-[rgba(212,168,83,0.1)]">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#D4A853]/60">About</p>
          </div>
          <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-4">
            {[
              { icon: MapPin, label: profile?.location, fallback: 'Location' },
              { icon: Briefcase, label: profile?.profession, fallback: 'Profession' },
              { icon: Buildings, label: profile?.company, fallback: 'Company' },
              { icon: TrendUp, label: profile?.industry, fallback: 'Industry' },
              { icon: Phone, label: profile?.phoneNumber, fallback: 'Phone' },
              { icon: Calendar, label: profile?.dateOfBirth?.toLocaleDateString(), fallback: 'Birthday' },
            ].map((item, i) => {
              const Icon = item.icon;
              const value = item.label;
              return (
                <div key={i} className="flex items-center gap-2.5">
                  <Icon size={16} className={value ? 'text-[#D4A853]' : 'text-[#5C5749]/40'} />
                  <span className={value ? 'text-[#C9C0A8] text-sm' : 'text-[#5C5749]/40 text-sm'}>
                    {value || item.fallback}
                  </span>
                </div>
              );
            })}
          </div>
          {profile?.yearsExperience && (
            <div className="px-5 pb-4 flex items-center gap-2.5">
              <Target size={16} className="text-[#D4A853]" />
              <span className="text-[#C9C0A8] text-sm">{profile.yearsExperience} years experience</span>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Identity & Interests (merged: Faith + Skills + Hobbies) ── */}
      <div className="px-4 mb-4">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-[#0F1724]/60 border border-[rgba(212,168,83,0.15)] overflow-hidden"
        >
          <div className="px-5 py-3 border-b border-[rgba(212,168,83,0.1)]">
            <p className="text-[9px] font-bold uppercase tracking-widest text-[#D4A853]/60">Identity & Interests</p>
          </div>
          <div className="p-4 space-y-4">
            {/* Faith badges */}
            {(profile?.prayerFrequency || profile?.fastingHabit || profile?.islamicKnowledge) && (
              <div>
                <p className="text-[#5C5749] text-[10px] uppercase tracking-wider mb-2">Faith & Practice</p>
                <div className="flex gap-2 flex-wrap">
                  {profile?.prayerFrequency && (
                    <span className="px-3 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-300 text-xs font-medium flex items-center gap-1.5">
                      <Moon size={12} weight="fill" /> {profile.prayerFrequency}
                    </span>
                  )}
                  {profile?.fastingHabit && (
                    <span className="px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs font-medium flex items-center gap-1.5">
                      <Calendar size={12} weight="fill" /> {profile.fastingHabit}
                    </span>
                  )}
                  {profile?.islamicKnowledge && (
                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs font-medium flex items-center gap-1.5">
                      <BookOpen size={12} weight="fill" /> {profile.islamicKnowledge}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Islamic Interests */}
            {profile?.islamicInterests && profile.islamicInterests.length > 0 && (
              <div>
                <p className="text-[#5C5749] text-[10px] uppercase tracking-wider mb-2">Islamic Interests</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.islamicInterests.map((interest) => (
                    <span
                      key={interest}
                      className="px-2.5 py-1 rounded-lg bg-[#D4A853]/10 border border-[#D4A853]/20 text-[#E8C97A] text-xs"
                    >
                      {interest}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Skills */}
            {profile?.skills && profile.skills.length > 0 && (
              <div>
                <p className="text-[#5C5749] text-[10px] uppercase tracking-wider mb-2">Skills</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-2.5 py-1 rounded-lg bg-[#4FB892]/10 border border-[#4FB892]/20 text-[#4FB892] text-xs font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Hobbies */}
            {profile?.hobbies && profile.hobbies.length > 0 && (
              <div>
                <p className="text-[#5C5749] text-[10px] uppercase tracking-wider mb-2">Hobbies</p>
                <div className="flex flex-wrap gap-1.5">
                  {profile.hobbies.map((hobby) => (
                    <span
                      key={hobby}
                      className="px-2.5 py-1 rounded-lg bg-pink-500/10 border border-pink-500/20 text-pink-300 text-xs font-medium"
                    >
                      {hobby}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {!profile?.prayerFrequency &&
              !profile?.fastingHabit &&
              !profile?.islamicKnowledge &&
              (!profile?.islamicInterests || profile.islamicInterests.length === 0) &&
              (!profile?.skills || profile.skills.length === 0) &&
              (!profile?.hobbies || profile.hobbies.length === 0) && (
                <button
                  onClick={() => navigate('/deep-kyc')}
                  className="w-full py-3 rounded-xl text-[#D4A853] text-[13px] font-medium bg-[#D4A853]/5 border border-[#D4A853]/20 hover:bg-[#D4A853]/10 transition-colors"
                >
                  Add your interests, skills & faith practice →
                </button>
              )}
          </div>
        </motion.div>
      </div>

      {/* ── Financial Snapshot ── */}
      {(profile?.riskTolerance || profile?.investmentExperience || (profile?.investmentGoals && profile.investmentGoals.length > 0)) && (
        <div className="px-4 mb-4">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-2xl bg-[#0F1724]/60 border border-[rgba(212,168,83,0.15)] overflow-hidden"
          >
            <div className="px-5 py-3 border-b border-[rgba(212,168,83,0.1)]">
              <p className="text-[9px] font-bold uppercase tracking-widest text-[#D4A853]/60">Financial Profile</p>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {profile?.riskTolerance && (
                  <span className="px-3 py-1.5 rounded-full bg-[#D4A853]/10 border border-[#D4A853]/25 text-[#E8C97A] text-xs font-medium">
                    {profile.riskTolerance} risk
                  </span>
                )}
                {profile?.investmentExperience && (
                  <span className="px-3 py-1.5 rounded-full bg-[#4FB892]/10 border border-[#4FB892]/25 text-[#4FB892] text-xs font-medium">
                    {profile.investmentExperience}
                  </span>
                )}
              </div>
              {profile?.investmentGoals && profile.investmentGoals.length > 0 && (
                <div>
                  <p className="text-[#5C5749] text-[10px] uppercase tracking-wider mb-2">Investment Goals</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.investmentGoals.map((goal) => (
                      <span
                        key={goal}
                        className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs"
                      >
                        {goal}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
}
