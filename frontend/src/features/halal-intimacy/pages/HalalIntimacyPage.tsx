/**
 * Halal Intimacy Page
 * Islamic guidance on marital intimacy — sections, counsellors, gift planning,
 * emotional tips, with 18+ age gate
 * Converted from: halal_intimacy_home.dart + section_detail_page.dart +
 *   gift_planning_page.dart + counsellor_card.dart
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart,
  ShieldCheck,
  BookOpen,
  Gift,
  Chat,
  Star,
  Clock,
  X,
  Warning,
  CaretRight,
  CheckCircle,
  UsersThree,
  Sparkle,
} from '@phosphor-icons/react';

// ── Data ──────────────────────────────────────────────

const SECTIONS = [
  { id: '1', title: 'Foundation', description: 'Building a strong marital foundation based on Islamic principles of love, mercy, and respect.', topics: ['Communication fundamentals', 'Setting boundaries', 'Islamic rights & responsibilities', 'Building trust'] },
  { id: '2', title: 'Intimacy & Relationships', description: 'Understanding physical and emotional intimacy within the Shariah framework.', topics: ['Halal physical intimacy', 'Emotional connection', 'Frequency & expectations', 'Special circumstances'] },
  { id: '3', title: 'Family Planning', description: 'Islamic perspective on family planning, contraception, and related matters.', topics: ['Islamic view on contraception', 'When to start a family', 'Fertility awareness', 'Pregnancy & parenthood'] },
  { id: '4', title: 'Personal Development', description: 'Self-improvement for a stronger marriage and personal well-being.', topics: ['Self-care practices', 'Managing stress', 'Physical wellness', 'Spiritual growth together'] },
  { id: '5', title: 'Emotional Tips', description: 'Practical emotional intelligence tips for nurturing your relationship.', topics: ['Active listening', 'Expressing love', 'Conflict resolution', 'Quality time'] },
  { id: '6', title: 'Understanding Each Other', description: 'Learning to understand differences and appreciate your spouse.', topics: ['Love languages', 'Cultural differences', 'Expectations vs reality', 'Growing together'] },
  { id: '7', title: 'Building Lost Love', description: 'Reviving and strengthening love that may have dimmed over time.', topics: ['Recognizing the signs', 'Rekindling romance', 'Seeking counseling', 'Making dua together'] },
];

const CORE_ESSENTIALS = [
  { title: 'Communication Scripts', desc: 'Ready-to-use conversation starters for sensitive topics', icon: Chat },
  { title: 'Emotional Safety', desc: 'Creating a safe space for vulnerability and openness', icon: ShieldCheck },
  { title: 'Fiqh Basics', desc: 'Essential rulings on marital intimacy from major schools', icon: BookOpen },
  { title: 'Wellness & Care', desc: 'Physical and mental health in the context of marriage', icon: Heart },
];

const COUNSELLORS = [
  { id: '1', name: 'Dr. Amina Hassan', title: 'Marriage & Family Therapist', rating: 4.9, experience: 12, languages: ['English', 'Arabic'], specializations: ['Communication', 'Conflict Resolution'], fee: '$80', available: true },
  { id: '2', name: 'Ustadh Yusuf Ali', title: 'Islamic Counselor', rating: 4.8, experience: 8, languages: ['English', 'Urdu'], specializations: ['Islamic Fiqh', 'Premarital Counseling'], fee: '$60', available: true },
  { id: '3', name: 'Sr. Fatima Zahra', title: 'Relationship Coach', rating: 4.7, experience: 6, languages: ['English', 'French'], specializations: ['Emotional Intimacy', 'Parenting'], fee: '$70', available: false },
];

const OCCASIONS = ['Anniversary', 'Birthday', 'Eid', 'Just Because', 'Apology', 'Ramadan', 'Achievement'];

type SheetType = 'section' | 'counsellor' | 'gift' | null;

export function HalalIntimacyPage() {
  const [ageVerified, setAgeVerified] = useState(false);
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [selectedSection, setSelectedSection] = useState<typeof SECTIONS[number] | null>(null);
  const [selectedCounsellor, setSelectedCounsellor] = useState<typeof COUNSELLORS[number] | null>(null);
  const [giftForm, setGiftForm] = useState({ occasion: '', recipient: '', budget: 50, notes: '' });
  const [giftSaved, setGiftSaved] = useState(false);

  const openSection = (section: typeof SECTIONS[number]) => {
    setSelectedSection(section);
    setActiveSheet('section');
  };

  const openCounsellor = (c: typeof COUNSELLORS[number]) => {
    setSelectedCounsellor(c);
    setActiveSheet('counsellor');
  };

  const handleSaveGift = () => {
    if (!giftForm.occasion || !giftForm.recipient) return;
    setGiftSaved(true);
    setTimeout(() => {
      setGiftSaved(false);
      setActiveSheet(null);
      setGiftForm({ occasion: '', recipient: '', budget: 50, notes: '' });
    }, 2000);
  };

  // ── Age Gate ──
  if (!ageVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="max-w-sm w-full p-6 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 text-center">
          <Warning size={48} className="text-amber-400 mx-auto mb-4" />
          <h2 className="text-[#F5E8C7] font-bold text-xl mb-2">Age Verification Required</h2>
          <p className="text-[#7A7363] text-sm leading-relaxed mb-2">
            This section contains content about marital intimacy from an Islamic perspective.
            It is intended for married adults or those preparing for marriage.
          </p>
          <p className="text-amber-400 text-xs font-medium mb-6">You must be 18 years or older to access this content.</p>
          <button
            onClick={() => setAgeVerified(true)}
            className="w-full min-h-[54px] px-[22px] py-[14px] rounded-lg bg-gradient-to-r from-[#D4A853] to-[#E8C97A] text-[#10151F] font-bold text-sm hover:opacity-90"
          >
            I am 18+ — Continue
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-b-3xl mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-rose-600/20 via-[#10151F] to-[#161D2C]" />
        <div className="relative px-6 pt-8 pb-8">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
              <Heart size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5E8C7]">Halal Intimacy</h1>
              <p className="text-sm text-[#C9C0A8]">Islamic Marital Guidance</p>
            </div>
          </div>
          <p className="text-[#7A7363] text-sm leading-relaxed">
            Evidence-based guidance rooted in Quran and Sunnah for a fulfilling and blessed marriage.
          </p>
        </div>
      </div>

      {/* Core Essentials */}
      <div className="px-4 mb-6">
        <h2 className="text-[#F5E8C7] font-semibold mb-3">Core Essentials</h2>
        <div className="grid grid-cols-2 gap-3">
          {CORE_ESSENTIALS.map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
              className="p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50">
              <item.icon size={20} className="text-rose-400 mb-2" />
              <h3 className="text-[#F5E8C7] font-semibold text-xs mb-1">{item.title}</h3>
              <p className="text-[#7A7363] text-[10px] leading-relaxed">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Sections */}
      <div className="px-4 mb-6">
        <h2 className="text-[#F5E8C7] font-semibold mb-3">Topics</h2>
        <div className="space-y-2">
          {SECTIONS.map((section, i) => (
            <motion.button key={section.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
              onClick={() => openSection(section)}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 text-left hover:border-rose-500/30 transition-colors">
              <div className="w-9 h-9 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0">
                <BookOpen size={16} className="text-rose-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[#F5E8C7] font-semibold text-sm">{section.title}</h3>
                <p className="text-[#7A7363] text-xs truncate">{section.description}</p>
              </div>
              <CaretRight size={16} className="text-[#7A7363] shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Counsellors */}
      <div className="px-4 mb-6">
        <h2 className="text-[#F5E8C7] font-semibold mb-3">Counsellors</h2>
        <div className="space-y-3">
          {COUNSELLORS.map((c) => (
            <button key={c.id} onClick={() => openCounsellor(c)}
              className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 text-left hover:border-rose-500/30 transition-colors">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-sm">{c.name.split(' ').map(n => n[0]).join('')}</span>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[#F5E8C7] font-semibold text-sm">{c.name}</h3>
                <p className="text-[#7A7363] text-xs">{c.title}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-amber-400 text-xs flex items-center gap-0.5"><Star size={12} />{c.rating}</span>
                  <span className="text-[#7A7363] text-xs">{c.experience} yrs</span>
                  <span className={`text-xs ${c.available ? 'text-emerald-400' : 'text-red-400'}`}>
                    {c.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Gift Planning CTA */}
      <div className="px-4 mb-6">
        <button onClick={() => setActiveSheet('gift')}
          className="w-full p-4 rounded-xl bg-gradient-to-r from-rose-500/15 to-pink-500/15 border border-rose-500/20 text-left hover:border-rose-500/40 transition-colors">
          <div className="flex items-center gap-3">
            <Gift size={24} className="text-rose-400" />
            <div>
              <h3 className="text-[#F5E8C7] font-semibold text-sm">Gift Planning</h3>
              <p className="text-[#7A7363] text-xs">Plan thoughtful gifts for your spouse</p>
            </div>
            <CaretRight size={16} className="text-[#7A7363] ml-auto" />
          </div>
        </button>
      </div>

      {/* Islamic quote */}
      <div className="px-4">
        <div className="p-4 rounded-xl bg-[#10151F] border border-[#D4A853]/20 text-center">
          <p className="text-[#E8C97A] text-sm italic">"Give gifts to one another, for gifts remove ill feelings from the heart."</p>
          <p className="text-[#7A7363] text-xs mt-1">— Tirmidhi</p>
        </div>
      </div>

      {/* Sheets */}
      <AnimatePresence>
        {activeSheet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center" onClick={() => { setActiveSheet(null); setSelectedSection(null); setSelectedCounsellor(null); }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-[#10151F] rounded-t-3xl max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#10151F] px-5 pt-4 pb-3 border-b border-[rgba(212,168,83,0.2)]/50 flex items-center justify-between z-10">
                <h2 className="text-[#F5E8C7] font-bold text-lg">
                  {activeSheet === 'section' && selectedSection?.title}
                  {activeSheet === 'counsellor' && selectedCounsellor?.name}
                  {activeSheet === 'gift' && 'Gift Planning'}
                </h2>
                <button onClick={() => { setActiveSheet(null); setSelectedSection(null); setSelectedCounsellor(null); }} className="p-1.5 rounded-lg hover:bg-white/10">
                  <X size={20} className="text-[#7A7363]" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Section detail */}
                {activeSheet === 'section' && selectedSection && (
                  <>
                    <p className="text-[#C9C0A8] text-sm leading-relaxed">{selectedSection.description}</p>
                    <h3 className="text-[#F5E8C7] font-semibold text-sm">Topics Covered</h3>
                    {selectedSection.topics.map((t, i) => (
                      <div key={i} className="flex items-center gap-2 py-1">
                        <CheckCircle size={16} className="text-rose-400 shrink-0" />
                        <span className="text-[#C9C0A8] text-sm">{t}</span>
                      </div>
                    ))}
                  </>
                )}

                {/* Counsellor detail */}
                {activeSheet === 'counsellor' && selectedCounsellor && (
                  <>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-rose-500 to-pink-600 flex items-center justify-center">
                        <span className="text-white font-bold text-xl">{selectedCounsellor.name.split(' ').map(n => n[0]).join('')}</span>
                      </div>
                      <div>
                        <h3 className="text-[#F5E8C7] font-bold">{selectedCounsellor.name}</h3>
                        <p className="text-[#7A7363] text-sm">{selectedCounsellor.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-amber-400 text-sm flex items-center gap-0.5"><Star size={14} />{selectedCounsellor.rating}</span>
                          <span className="text-[#7A7363] text-sm">{selectedCounsellor.experience} years</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedCounsellor.specializations.map((s) => (
                        <span key={s} className="px-3 py-1 rounded-full bg-rose-500/10 text-rose-400 text-xs border border-rose-500/20">{s}</span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#10151F]">
                      <UsersThree size={16} className="text-[#7A7363]" />
                      <span className="text-[#C9C0A8] text-sm">Languages: {selectedCounsellor.languages.join(', ')}</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-[#10151F]">
                      <Clock size={16} className="text-[#7A7363]" />
                      <span className="text-[#C9C0A8] text-sm">Session fee: {selectedCounsellor.fee}</span>
                    </div>
                    <button disabled={!selectedCounsellor.available}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm disabled:opacity-40">
                      {selectedCounsellor.available ? 'Book Consultation' : 'Currently Unavailable'}
                    </button>
                  </>
                )}

                {/* Gift Planning */}
                {activeSheet === 'gift' && !giftSaved && (
                  <>
                    <div>
                      <label htmlFor="halalintimacypage-fld-1" className="text-[#C9C0A8] text-xs mb-1.5 block">Occasion</label>
                      <select id="halalintimacypage-fld-1" value={giftForm.occasion} onChange={(e) => setGiftForm({ ...giftForm, occasion: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm focus:outline-none focus:border-rose-500/50">
                        <option value="">Select occasion</option>
                        {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    </div>
                    <fieldset className="border-0 p-0 m-0">
                      <legend className="text-[#C9C0A8] text-xs mb-1.5 block">Recipient</legend>
                      <div className="flex gap-3">
                        {['Wife', 'Husband'].map((r) => (
                          <button key={r} type="button" onClick={() => setGiftForm({ ...giftForm, recipient: r })}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-medium ${
                              giftForm.recipient === r ? 'bg-rose-500 text-white' : 'bg-[#10151F] text-[#C9C0A8] border border-[rgba(212,168,83,0.2)]'
                            }`}>{r}</button>
                        ))}
                      </div>
                    </fieldset>
                    <div>
                      <label htmlFor="halalintimacypage-fld-2" className="text-[#C9C0A8] text-xs mb-1.5 block">Budget: ${giftForm.budget}</label>
                      <input id="halalintimacypage-fld-2" type="range" min="25" max="500" step="25" value={giftForm.budget}
                        onChange={(e) => setGiftForm({ ...giftForm, budget: Number(e.target.value) })} className="w-full accent-rose-500" />
                    </div>
                    <div>
                      <label htmlFor="halalintimacypage-fld-3" className="text-[#C9C0A8] text-xs mb-1.5 block">Notes</label>
                      <textarea id="halalintimacypage-fld-3" value={giftForm.notes} onChange={(e) => setGiftForm({ ...giftForm, notes: e.target.value })}
                        placeholder="Any special ideas or preferences..." rows={2}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm placeholder-[#7A7363] focus:outline-none resize-none" />
                    </div>
                    <button onClick={handleSaveGift} className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-bold text-sm">
                      Save Gift Plan
                    </button>
                  </>
                )}
                {activeSheet === 'gift' && giftSaved && (
                  <div className="text-center py-6">
                    <Sparkle size={48} className="text-rose-400 mx-auto mb-3" />
                    <h3 className="text-[#F5E8C7] font-bold text-lg">Gift Plan Saved!</h3>
                    <p className="text-[#7A7363] text-sm mt-1">Your thoughtful gift plan has been recorded.</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default HalalIntimacyPage;
