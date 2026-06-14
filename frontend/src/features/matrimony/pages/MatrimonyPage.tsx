/**
 * Matrimony Page
 * Islamic matrimony hub with featured profiles, profile creation,
 * search, wali portal, and how-it-works sections
 * Converted from: matrimony_home_page.dart + create_profile_page.dart + sub-pages
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DisclaimerBanner } from '@/components/shared';
import {
  Heart,
  UsersThree,
  MagnifyingGlass,
  ShieldCheck,
  UserPlus,
  CaretRight,
  Star,
  MapPin,
  X,
  SealCheck,
  Eye,
  Lock,
  CheckCircle,
} from '@phosphor-icons/react';

// ── Data ──────────────────────────────────────────────

const STATS = [
  { value: '2,450+', label: 'Members' },
  { value: '180+', label: 'Matches' },
  { value: '95%', label: 'Success' },
];

const FEATURED_PROFILES = [
  { name: 'Amina', age: 26, city: 'Dubai', bio: 'Software engineer passionate about deen and community work', verified: true },
  { name: 'Yusuf', age: 29, city: 'London', bio: 'Islamic finance professional seeking a partner who shares strong faith values', verified: true },
  { name: 'Maryam', age: 24, city: 'Toronto', bio: 'Medical student with a love for Quran recitation and volunteering', verified: false },
];

const HOW_IT_WORKS = [
  { step: 1, title: 'Create Your Profile', desc: 'Set up your personal details, faith preferences, and what you\'re looking for.' },
  { step: 2, title: 'Search & Send Interests', desc: 'Browse verified profiles and express interest to compatible matches.' },
  { step: 3, title: 'Wali Approval', desc: 'Your family guardian (wali) can review and approve connections.' },
  { step: 4, title: 'Halal Communication', desc: 'Connect through our safe, moderated messaging with family involvement.' },
];

const FEATURES = [
  { icon: SealCheck, title: 'Verified Profiles', desc: 'All profiles are verified for authenticity and seriousness' },
  { icon: UsersThree, title: 'Family Involvement', desc: 'Built-in wali/guardian approval for every connection' },
  { icon: Lock, title: 'Privacy Protected', desc: 'Your photos and details are only visible to approved matches' },
  { icon: Star, title: 'Success Stories', desc: 'Hundreds of families united through our halal platform' },
];

const SAFETY_POINTS = [
  'Wali-approved workflow ensures family involvement from the start',
  'Private messaging through secure Networking feature',
  'Clear safety reminders and community guidelines',
];

const INITIAL_FORM = {
  name: '', age: '', profession: '', city: '', country: '', education: '', languages: '',
  maritalStatus: '', sect: '', prayerLevel: '', hijabStatus: '', familyInvolvement: '',
  waliName: '', waliPhone: '', bio: '',
};

type SheetType = 'create' | 'search' | 'wali' | null;

export function MatrimonyPage() {
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [form, setForm] = useState(INITIAL_FORM);
  const [formSaved, setFormSaved] = useState(false);

  // Mock search profiles
  const SEARCH_PROFILES = [
    { name: 'Fatima', age: 25, city: 'Bangalore', status: 'Active' },
    { name: 'Yusuf', age: 28, city: 'Hyderabad', status: 'Active' },
  ];

  // Mock wali requests
  const WALI_REQUESTS = [
    { from: 'Ahmed', status: 'Pending Approval' },
    { from: 'Omar', status: 'Approved' },
  ];

  const handleSaveProfile = () => {
    if (!form.name || !form.age) return;
    setFormSaved(true);
    setTimeout(() => {
      setFormSaved(false);
      setActiveSheet(null);
      setForm(INITIAL_FORM);
    }, 2000);
  };

  const updateForm = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Hero Header — Pink/Magenta theme */}
      <div className="relative overflow-hidden rounded-b-3xl mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-600/25 via-[#10151F] to-[#161D2C]" />
        <div className="relative px-6 pt-8 pb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
              <Heart size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5E8C7]">Matrimony</h1>
              <p className="text-sm text-[#C9C0A8]">Halal Matchmaking</p>
            </div>
          </div>
          <p className="text-[#7A7363] text-sm leading-relaxed mb-5">
            A faith-first platform for finding your life partner, with family involvement and
            Shariah-guided connections.
          </p>

          {/* Stats */}
          <div className="flex gap-4 justify-center">
            {STATS.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-bold text-[#E8C97A]">{s.value}</p>
                <p className="text-[#7A7363] text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Profiles */}
      <div className="px-4 mb-6">
        <h2 className="text-[#F5E8C7] font-semibold mb-3">Featured Profiles</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {FEATURED_PROFILES.map((p) => (
            <div key={p.name} className="min-w-[200px] p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 shrink-0">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">{p.name[0]}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="text-[#F5E8C7] font-semibold text-sm">{p.name}</h3>
                    {p.verified && <SealCheck size={14} className="text-blue-400" />}
                  </div>
                  <p className="text-[#7A7363] text-xs">{p.age} • {p.city}</p>
                </div>
              </div>
              <p className="text-[#C9C0A8] text-xs leading-relaxed line-clamp-2">{p.bio}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Cards */}
      <div className="px-4 mb-6 space-y-3">
        {[
          { id: 'create' as const, icon: UserPlus, title: 'Create Profile', desc: 'Set up your matrimony profile', gradient: 'from-pink-600/20 to-rose-700/20' },
          { id: 'search' as const, icon: MagnifyingGlass, title: 'Search Profiles', desc: 'Browse and find compatible matches', gradient: 'from-purple-600/20 to-violet-700/20' },
          { id: 'wali' as const, icon: ShieldCheck, title: 'Wali Portal', desc: 'Guardian review and approvals', gradient: 'from-amber-600/20 to-yellow-700/20' },
        ].map((card, i) => (
          <motion.button
            key={card.id}
            initial={{ opacity: 0, x: -15 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            onClick={() => setActiveSheet(card.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${card.gradient} border border-[rgba(212,168,83,0.2)]/50 text-left hover:border-pink-500/30 transition-colors`}
          >
            <div className="w-10 h-10 rounded-lg bg-[#10151F]/80 flex items-center justify-center shrink-0">
              <card.icon size={20} className="text-pink-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-[#F5E8C7] font-semibold text-sm">{card.title}</h3>
              <p className="text-[#7A7363] text-xs">{card.desc}</p>
            </div>
            <CaretRight size={16} className="text-[#7A7363]" />
          </motion.button>
        ))}
      </div>

      {/* How It Works */}
      <div className="px-4 mb-6">
        <h2 className="text-[#F5E8C7] font-semibold mb-3">How It Works</h2>
        <div className="space-y-3">
          {HOW_IT_WORKS.map((step) => (
            <div key={step.step} className="flex gap-3 p-3 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50">
              <div className="w-8 h-8 rounded-full bg-pink-500/20 flex items-center justify-center shrink-0">
                <span className="text-pink-400 text-sm font-bold">{step.step}</span>
              </div>
              <div>
                <h3 className="text-[#F5E8C7] font-semibold text-sm">{step.title}</h3>
                <p className="text-[#7A7363] text-xs mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="px-4 mb-6">
        <h2 className="text-[#F5E8C7] font-semibold mb-3">Why Choose Us</h2>
        <div className="grid grid-cols-2 gap-3">
          {FEATURES.map((f, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50">
              <f.icon size={20} className="text-pink-400 mb-2" />
              <h3 className="text-[#F5E8C7] font-semibold text-xs mb-1">{f.title}</h3>
              <p className="text-[#7A7363] text-[10px] leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Safety */}
      <div className="px-4 mb-6">
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <div className="flex items-center gap-2 mb-3">
            <ShieldCheck size={20} className="text-emerald-400" />
            <h3 className="text-emerald-300 font-semibold text-sm">Safety First</h3>
          </div>
          {SAFETY_POINTS.map((point, i) => (
            <div key={i} className="flex items-start gap-2 mt-2">
              <CheckCircle size={14} className="text-emerald-400 shrink-0 mt-0.5" />
              <p className="text-emerald-200/70 text-xs">{point}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 mb-4">
        <DisclaimerBanner contentId="MATRIMONY" variant="banner" />
      </div>

      {/* Sheets */}
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
              className="w-full max-w-lg bg-[#10151F] rounded-t-3xl max-h-[85vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#10151F] px-5 pt-4 pb-3 border-b border-[rgba(212,168,83,0.2)]/50 flex items-center justify-between z-10">
                <h2 className="text-[#F5E8C7] font-bold text-lg">
                  {activeSheet === 'create' && 'Create Profile'}
                  {activeSheet === 'search' && 'Search Profiles'}
                  {activeSheet === 'wali' && 'Wali Portal'}
                </h2>
                <button onClick={() => setActiveSheet(null)} className="p-1.5 rounded-lg hover:bg-white/10">
                  <X size={20} className="text-[#7A7363]" />
                </button>
              </div>

              <div className="p-5">
                {/* Create Profile Form */}
                {activeSheet === 'create' && !formSaved && (
                  <div className="space-y-4">
                    <p className="text-[#7A7363] text-xs mb-2">Fill in your details to create a matrimony profile</p>
                    {[
                      { label: 'Full Name', key: 'name', placeholder: 'Your full name' },
                      { label: 'Age', key: 'age', placeholder: 'Your age' },
                      { label: 'Profession', key: 'profession', placeholder: 'Your profession' },
                      { label: 'City', key: 'city', placeholder: 'City' },
                      { label: 'Country', key: 'country', placeholder: 'Country' },
                      { label: 'Education', key: 'education', placeholder: 'Education level' },
                    ].map((field) => (
                      <div key={field.key}>
                        <label htmlFor="matrimonypage-fld-1" className="text-[#C9C0A8] text-xs mb-1.5 block">{field.label}</label>
                        <input id="matrimonypage-fld-1"
                          type="text"
                          value={form[field.key as keyof typeof form]}
                          onChange={(e) => updateForm(field.key, e.target.value)}
                          placeholder={field.placeholder}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm placeholder-[#7A7363] focus:outline-none focus:border-pink-500/50"
                        />
                      </div>
                    ))}

                    {/* Dropdowns */}
                    {[
                      { label: 'Marital Status', key: 'maritalStatus', options: ['Never Married', 'Divorced', 'Widowed'] },
                      { label: 'Prayer Level', key: 'prayerLevel', options: ['5 times daily', 'Mostly regular', 'Improving'] },
                    ].map((dd) => (
                      <div key={dd.key}>
                        <label htmlFor="matrimonypage-fld-2" className="text-[#C9C0A8] text-xs mb-1.5 block">{dd.label}</label>
                        <select id="matrimonypage-fld-2"
                          value={form[dd.key as keyof typeof form]}
                          onChange={(e) => updateForm(dd.key, e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm focus:outline-none focus:border-pink-500/50"
                        >
                          <option value="">Select...</option>
                          {dd.options.map((o) => <option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}

                    <div>
                      <label htmlFor="matrimonypage-fld-3" className="text-[#C9C0A8] text-xs mb-1.5 block">About You</label>
                      <textarea id="matrimonypage-fld-3"
                        value={form.bio}
                        onChange={(e) => updateForm('bio', e.target.value)}
                        placeholder="Tell potential matches about yourself..."
                        rows={3}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm placeholder-[#7A7363] focus:outline-none focus:border-pink-500/50 resize-none"
                      />
                    </div>

                    {/* Wali Section */}
                    <div className="pt-2 border-t border-[rgba(212,168,83,0.2)]/50">
                      <h3 className="text-[#F5E8C7] font-semibold text-sm mb-3 flex items-center gap-2">
                        <ShieldCheck size={16} className="text-[#D4A853]" />
                        Wali / Guardian
                      </h3>
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={form.waliName}
                          onChange={(e) => updateForm('waliName', e.target.value)}
                          placeholder="Wali's name"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm placeholder-[#7A7363] focus:outline-none focus:border-pink-500/50"
                        />
                        <input
                          type="tel"
                          value={form.waliPhone}
                          onChange={(e) => updateForm('waliPhone', e.target.value)}
                          placeholder="Wali's phone number"
                          className="w-full px-4 py-2.5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm placeholder-[#7A7363] focus:outline-none focus:border-pink-500/50"
                        />
                      </div>
                    </div>

                    <button
                      onClick={handleSaveProfile}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-500 to-rose-600 text-white font-bold text-sm hover:opacity-90 transition-opacity"
                    >
                      Save Profile
                    </button>
                  </div>
                )}

                {activeSheet === 'create' && formSaved && (
                  <div className="text-center py-8">
                    <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
                    <h3 className="text-[#F5E8C7] font-bold text-lg">Profile Created!</h3>
                    <p className="text-[#7A7363] text-sm mt-1">Your profile is now visible to potential matches.</p>
                  </div>
                )}

                {/* Search Profiles */}
                {activeSheet === 'search' && (
                  <div className="space-y-3">
                    {SEARCH_PROFILES.map((p) => (
                      <div key={p.name} className="flex items-center gap-3 p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{p.name[0]}</span>
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[#F5E8C7] font-semibold text-sm">{p.name}, {p.age}</h3>
                          <p className="text-[#7A7363] text-xs flex items-center gap-1">
                            <MapPin size={12} />{p.city}
                          </p>
                        </div>
                        <button className="px-3 py-1.5 rounded-lg bg-pink-500/20 text-pink-400 text-xs font-medium hover:bg-pink-500/30">
                          <Heart size={14} className="inline mr-1" />
                          Interest
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Wali Portal */}
                {activeSheet === 'wali' && (
                  <div className="space-y-3">
                    <p className="text-[#7A7363] text-xs mb-2">Guardian reviews and approvals for your connections</p>
                    {WALI_REQUESTS.map((r) => (
                      <div key={r.from} className="flex items-center gap-3 p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50">
                        <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
                          <ShieldCheck size={20} className="text-amber-400" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-[#F5E8C7] font-semibold text-sm">Request from {r.from}</h3>
                          <p className={`text-xs mt-0.5 ${r.status === 'Approved' ? 'text-emerald-400' : 'text-amber-400'}`}>
                            {r.status}
                          </p>
                        </div>
                        <button className="px-3 py-1.5 rounded-lg bg-[#D4A853]/15 text-[#D4A853] text-xs font-medium hover:bg-[#D4A853]/25">
                          <Eye size={14} className="inline mr-1" />
                          Review
                        </button>
                      </div>
                    ))}
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

export default MatrimonyPage;
