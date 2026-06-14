/**
 * Faith Home Page
 * Main hub for faith & worship features: Masjid Finder, Youth Resources,
 * Shariah Board, Digital Twin, Halaqah link
 * Converted from: faith_home_page.dart + sub-pages (stubs folded in)
 */

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DisclaimerBanner } from '@/components/shared';
import {
  MapPin,
  UsersThree,
  BookOpen,
  Sparkle,
  GraduationCap,
  CaretRight,
  Star,
  Heart,
  ShieldCheck,
  Lightbulb,
  X,
  UserCheck,
  Brain,
  HandHeart,
} from '@phosphor-icons/react';

// ── Sub-page data ──────────────────────────────────────────────

const NAV_CARDS = [
  {
    id: 'masjid',
    icon: MapPin,
    title: 'Masjid Finder',
    description: 'Find nearby mosques with directions',
    gradient: 'from-emerald-600/30 to-teal-700/30',
    route: '/faith/masjid-finder',
  },
  {
    id: 'youth',
    icon: GraduationCap,
    title: 'Youth Resources',
    description: 'Mentorship, volunteering & wellbeing',
    gradient: 'from-blue-600/30 to-indigo-700/30',
    route: null,
  },
  {
    id: 'shariah',
    icon: ShieldCheck,
    title: 'Shariah Board',
    description: 'Consult our panel of Islamic scholars',
    gradient: 'from-amber-600/30 to-yellow-700/30',
    route: null,
  },
  {
    id: 'digital-twin',
    icon: Sparkle,
    title: 'Digital Twin',
    description: 'Track your spiritual journey',
    gradient: 'from-purple-600/30 to-violet-700/30',
    route: null,
  },
  {
    id: 'halaqah',
    icon: UsersThree,
    title: 'Halaqah',
    description: 'Join study circles and discussions',
    gradient: 'from-rose-600/30 to-pink-700/30',
    route: null,
  },
];

// Youth Resources data
const YOUTH_RESOURCES = [
  { icon: UsersThree, title: 'Mentorship Circles', desc: 'Connect with experienced mentors who guide youth on Islamic values, career, and personal growth.' },
  { icon: BookOpen, title: 'Youth Halaqa', desc: 'Join age-appropriate study circles covering Quran, Seerah, and contemporary topics.' },
  { icon: HandHeart, title: 'Volunteering', desc: 'Participate in community service projects and earn reward while making a difference.' },
  { icon: Brain, title: 'Mental Wellbeing', desc: 'Access Islamic-centred counseling resources and peer support networks.' },
];

// Shariah Board scholars
const SCHOLARS = [
  { name: 'Dr. Ahmad Faris', expertise: 'Islamic Finance & Banking', credentials: 'PhD in Shariah, AAOIFI Certified' },
  { name: 'Ustadha Maryam Khan', expertise: 'Family Law & Women\'s Issues', credentials: 'MA in Islamic Studies, Certified Mediator' },
  { name: 'Mufti Salman Rahman', expertise: 'Contemporary Fiqh & Bioethics', credentials: 'Ifta Degree, Medical Ethics Board' },
];

// Digital Twin data
const SPIRITUAL_STATS = [
  { icon: Star, title: 'Spiritual Goals', value: '5 active goals', desc: 'Track salah consistency, Quran reading, and dhikr habits' },
  { icon: Heart, title: 'Charity Impact', value: '3 contributions', desc: 'Your zakat and sadaqah tracked with community impact' },
  { icon: Lightbulb, title: 'Learning Plan', value: '2 courses', desc: 'Islamic finance principles and tajweed progression' },
];

type SheetType = 'youth' | 'shariah' | 'digital-twin' | null;

export function FaithHomePage() {
  const navigate = useNavigate();
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);

  const handleCardClick = (card: typeof NAV_CARDS[number]) => {
    if (card.route) {
      navigate(card.route);
    } else if (card.id === 'youth') {
      setActiveSheet('youth');
    } else if (card.id === 'shariah') {
      setActiveSheet('shariah');
    } else if (card.id === 'digital-twin') {
      setActiveSheet('digital-twin');
    } else if (card.id === 'halaqah') {
      // Halaqah is a large feature — placeholder for now
      setActiveSheet(null);
    }
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-b-3xl mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4A853]/20 via-[#10151F] to-[#10151F]" />
        <div className="relative px-6 pt-8 pb-10">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3 mb-4"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4A853] to-[#E8C97A] flex items-center justify-center">
              <Star size={24} className="text-[#10151F]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5E8C7]">Faith & Worship</h1>
              <p className="text-sm text-[#C9C0A8]">Strengthen your connection with Allah</p>
            </div>
          </motion.div>
          <p className="text-[#7A7363] text-sm leading-relaxed">
            Access tools for your spiritual journey — find mosques nearby, consult scholars,
            join study circles, and track your growth.
          </p>
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="px-4 space-y-3">
        {NAV_CARDS.map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => handleCardClick(card)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${card.gradient} border border-[rgba(212,168,83,0.2)]/50 text-left hover:border-[#D4A853]/30 transition-colors`}
          >
            <div className="w-11 h-11 rounded-xl bg-[#10151F]/80 flex items-center justify-center shrink-0">
              <card.icon size={20} className="text-[#D4A853]" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-[#F5E8C7] font-semibold text-sm">{card.title}</h3>
              <p className="text-[#7A7363] text-xs mt-0.5">{card.description}</p>
            </div>
            <CaretRight size={16} className="text-[#7A7363] shrink-0" />
          </motion.button>
        ))}
      </div>

      {/* Quick Inspiration */}
      <div className="px-4 mt-8">
        <h2 className="text-[#F5E8C7] font-semibold text-lg mb-3">Daily Reminder</h2>
        <div className="p-5 rounded-xl bg-gradient-to-br from-[#10151F] to-[#10151F] border border-[rgba(212,168,83,0.2)]/50">
          <p className="text-[#E8C97A] text-sm italic leading-relaxed text-center">
            "Verily, with hardship comes ease."
          </p>
          <p className="text-[#7A7363] text-xs text-center mt-2">— Surah Ash-Sharh (94:6)</p>
        </div>
      </div>

      <div className="px-4 mb-4">
        <DisclaimerBanner contentId="RELIGIOUS" variant="subtle" />
      </div>

      {/* Bottom Sheets */}
      <AnimatePresence>
        {activeSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
            onClick={() => setActiveSheet(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#10151F] rounded-t-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#10151F] px-5 pt-4 pb-3 border-b border-[rgba(212,168,83,0.2)]/50 flex items-center justify-between z-10">
                <h2 className="text-[#F5E8C7] font-bold text-lg">
                  {activeSheet === 'youth' && 'Youth Resources'}
                  {activeSheet === 'shariah' && 'Shariah Board'}
                  {activeSheet === 'digital-twin' && 'Digital Twin'}
                </h2>
                <button onClick={() => setActiveSheet(null)} className="p-1.5 rounded-lg hover:bg-white/10">
                  <X size={20} className="text-[#7A7363]" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Youth Resources Sheet */}
                {activeSheet === 'youth' && YOUTH_RESOURCES.map((r, i) => (
                  <div key={i} className="flex gap-3 p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/15 flex items-center justify-center shrink-0">
                      <r.icon size={20} className="text-blue-400" />
                    </div>
                    <div>
                      <h3 className="text-[#F5E8C7] font-semibold text-sm">{r.title}</h3>
                      <p className="text-[#7A7363] text-xs mt-1 leading-relaxed">{r.desc}</p>
                    </div>
                  </div>
                ))}

                {/* Shariah Board Sheet */}
                {activeSheet === 'shariah' && (
                  <>
                    <div className="p-4 rounded-xl bg-gradient-to-r from-[#D4A853]/10 to-transparent border border-[#D4A853]/20">
                      <p className="text-[#C9C0A8] text-sm leading-relaxed">
                        Our Shariah Advisory Board consists of qualified scholars who provide guidance
                        on Islamic law, finance, and contemporary issues.
                      </p>
                    </div>
                    {SCHOLARS.map((s, i) => (
                      <div key={i} className="p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#D4A853] to-[#E8C97A] flex items-center justify-center">
                            <UserCheck className="w-5 h-5 text-[#10151F]" />
                          </div>
                          <div>
                            <h3 className="text-[#F5E8C7] font-semibold text-sm">{s.name}</h3>
                            <p className="text-[#D4A853] text-xs">{s.expertise}</p>
                          </div>
                        </div>
                        <p className="text-[#7A7363] text-xs ml-13">{s.credentials}</p>
                      </div>
                    ))}
                  </>
                )}

                {/* Digital Twin Sheet */}
                {activeSheet === 'digital-twin' && SPIRITUAL_STATS.map((stat, i) => (
                  <div key={i} className="p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-lg bg-purple-500/15 flex items-center justify-center">
                        <stat.icon size={20} className="text-purple-400" />
                      </div>
                      <div>
                        <h3 className="text-[#F5E8C7] font-semibold text-sm">{stat.title}</h3>
                        <p className="text-[#D4A853] text-xs">{stat.value}</p>
                      </div>
                    </div>
                    <p className="text-[#7A7363] text-xs leading-relaxed">{stat.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FaithHomePage;
