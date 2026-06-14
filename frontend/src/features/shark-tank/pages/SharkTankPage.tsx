/**
 * Shark Tank Page
 * Islamic startup ecosystem — investor dashboard, entrepreneur paths,
 * startup discovery, and incubation programs
 * Converted from: investor_path_page.dart + startup_detail_page.dart +
 *   startup_discovery_page.dart + entrepreneur_path_page.dart + sub-pages
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DisclaimerModal } from '@/components/shared';
import { useDisclaimerSeen } from '@/features/legal/hooks/useDisclaimerSeen';
import {
  Rocket,
  TrendUp,
  UsersThree,
  Briefcase,
  Target,
  CaretRight,
  X,
  CurrencyDollar,
  MapPin,
  Calendar,
  SealCheck,
  ChartBar,
  Lightbulb,
  Trophy,
  ShieldCheck,
  ArrowSquareOut,
  Star,
  HandCoins,
  Buildings,
} from '@phosphor-icons/react';

// ── Startup data ──────────────────────────────────────────────

interface Startup {
  id: string;
  name: string;
  sector: string;
  location: string;
  teamSize: number;
  founded: string;
  fundingGoal: number;
  fundingRaised: number;
  description: string;
  traction: string[];
  highlights: string[];
  shariahCompliant: boolean;
  investmentStructure: { type: string; standard: string; terms: string };
}

const STARTUPS: Startup[] = [
  {
    id: 's1', name: 'HalalTech Solutions', sector: 'FinTech', location: 'Dubai, UAE', teamSize: 12,
    founded: '2023', fundingGoal: 5000000, fundingRaised: 2100000,
    description: 'AI-powered Shariah compliance screening platform for global Islamic finance institutions.',
    traction: ['50+ institutional clients', '₹200Cr AUM screened', '3 countries'],
    highlights: ['AAOIFI Certified', 'Patent pending AI models', 'Strategic bank partnerships'],
    shariahCompliant: true,
    investmentStructure: { type: 'Musharakah', standard: 'AAOIFI SS 12', terms: 'Equity partnership — investor receives ownership share proportional to capital contribution; profit split per agreed ratio, losses shared by capital ratio' },
  },
  {
    id: 's2', name: 'Sukuk Capital', sector: 'Investment', location: 'Kuala Lumpur, Malaysia', teamSize: 8,
    founded: '2022', fundingGoal: 3000000, fundingRaised: 1800000,
    description: 'Democratizing sukuk investments for retail investors through a fractional ownership platform.',
    traction: ['10,000+ users', '₹50Cr sukuk traded', '15% MoM growth'],
    highlights: ['SEC registered', 'Backed by Islamic banks', 'Mobile-first UX'],
    shariahCompliant: true,
    investmentStructure: { type: 'Mudarabah', standard: 'AAOIFI SS 13', terms: 'Profit-sharing — investor provides capital (Rabb al-Maal), startup manages (Mudarib); profits split per agreed ratio, capital loss borne by investor only' },
  },
  {
    id: 's3', name: 'ModestWear Fashion', sector: 'E-Commerce', location: 'London, UK', teamSize: 15,
    founded: '2021', fundingGoal: 2000000, fundingRaised: 1500000,
    description: 'Premium modest fashion marketplace connecting ethical designers with conscious consumers globally.',
    traction: ['200+ brands onboarded', '50K monthly visitors', '£2M annual revenue'],
    highlights: ['Featured in Vogue', 'Sustainable supply chain', 'Global shipping'],
    shariahCompliant: true,
    investmentStructure: { type: 'Musharakah', standard: 'AAOIFI SS 12', terms: 'Diminishing Musharakah — investor\'s share reduces over time as founders buy back equity; profit shared per ownership ratio' },
  },
  {
    id: 's4', name: 'QuranicAI', sector: 'EdTech', location: 'Riyadh, Saudi Arabia', teamSize: 6,
    founded: '2023', fundingGoal: 1500000, fundingRaised: 400000,
    description: 'AI-powered Quran learning assistant with personalized tajweed correction and memorization tracking.',
    traction: ['25K active learners', '4.8★ rating', '85% retention'],
    highlights: ['Scholar-approved content', 'Multi-language support', 'Offline capability'],
    shariahCompliant: true,
    investmentStructure: { type: 'Mudarabah', standard: 'AAOIFI SS 13', terms: 'Profit-sharing — investor provides full capital; startup contributes expertise and management; profits split 60/40 (investor/founder)' },
  },
  {
    id: 's5', name: 'ZakatFlow', sector: 'FinTech', location: 'Istanbul, Turkey', teamSize: 10,
    founded: '2022', fundingGoal: 2500000, fundingRaised: 900000,
    description: 'Automated zakat calculation and distribution platform partnering with verified charitable organizations.',
    traction: ['₹100Cr distributed', '500+ charities', '100K users'],
    highlights: ['Transparent blockchain tracking', 'Tax-compliant receipts', 'Auto-calculation'],
    shariahCompliant: true,
    investmentStructure: { type: 'Musharakah', standard: 'AAOIFI SS 12', terms: 'Equity partnership — co-ownership with profit distribution per agreed ratio; both parties bear losses proportional to capital' },
  },
];

const INVESTOR_STATS = [
  { label: 'Opportunities', value: '12', icon: Target },
  { label: 'Active Deals', value: '3', icon: Briefcase },
  { label: 'Deployed', value: '₹50L', icon: CurrencyDollar },
  { label: 'Follow-ups', value: '5', icon: UsersThree },
];

const JOURNEY_STEPS = [
  { step: 1, title: 'Explore Startups', desc: 'Browse Shariah-compliant startup opportunities' },
  { step: 2, title: 'Due Diligence', desc: 'Review pitch decks and financials' },
  { step: 3, title: 'Express Interest', desc: 'Connect with founders and schedule meetings' },
  { step: 4, title: 'Invest', desc: 'Complete via Musharakah (SS 12) or Mudarabah (SS 13)' },
];

const INVESTOR_BENEFITS = [
  { icon: ShieldCheck, title: 'AAOIFI Vetted', desc: 'All startups screened per SS 21 criteria' },
  { icon: HandCoins, title: 'SS 12 / SS 13', desc: 'Musharakah & Mudarabah investment terms' },
  { icon: ChartBar, title: 'Portfolio Tracking', desc: 'Real-time halal investment performance' },
  { icon: Buildings, title: 'Network Access', desc: 'Connect with Muslim entrepreneurs' },
];

type ViewType = 'investor' | 'entrepreneur';

export function SharkTankPage() {
  const [sharkSeen, markSharkSeen] = useDisclaimerSeen('shark_tank');
  const [viewType, setViewType] = useState<ViewType>('investor');
  const [selectedStartup, setSelectedStartup] = useState<Startup | null>(null);

  return (
    <div className="min-h-screen pb-8">
      {!sharkSeen && <DisclaimerModal contentId="INVESTMENT" onAccept={markSharkSeen} />}

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-b-3xl mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-600/25 via-[#10151F] to-[#161D2C]" />
        <div className="relative px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center">
              <Rocket size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5E8C7]">Shark Tank</h1>
              <p className="text-sm text-[#C9C0A8]">AAOIFI SS 12 / SS 13 Investment Structures</p>
            </div>
          </div>
          <p className="text-[#7A7363] text-sm leading-relaxed">
            Connect halal startups with ethical investors. Build, fund, and grow
            Shariah-compliant businesses together.
          </p>
        </div>
      </div>

      {/* Tab Pills */}
      <div className="px-4 mb-5">
        <div className="flex bg-[#10151F] rounded-xl p-1">
          {[
            { id: 'investor' as const, label: 'Investor', icon: TrendUp },
            { id: 'entrepreneur' as const, label: 'Entrepreneur', icon: Rocket },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setViewType(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                viewType === tab.id
                  ? 'bg-[#D4A853] text-[#10151F]'
                  : 'text-[#C9C0A8] hover:text-[#F5E8C7]'
              }`}
            >
              <tab.icon size={16} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Investor View ── */}
      {viewType === 'investor' && (
        <div className="px-4 space-y-6">
          {/* Stats */}
          <div className="grid grid-cols-4 gap-2">
            {INVESTOR_STATS.map((s) => (
              <div key={s.label} className="p-3 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 text-center">
                <s.icon size={16} className="text-[#D4A853] mx-auto mb-1" />
                <p className="text-[#F5E8C7] font-bold text-sm">{s.value}</p>
                <p className="text-[#7A7363] text-[10px]">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Investment Journey */}
          <div>
            <h2 className="text-[#F5E8C7] font-semibold mb-3">Investment Journey</h2>
            <div className="space-y-2">
              {JOURNEY_STEPS.map((step) => (
                <div key={step.step} className="flex gap-3 p-3 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50">
                  <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                    <span className="text-orange-400 text-sm font-bold">{step.step}</span>
                  </div>
                  <div>
                    <h3 className="text-[#F5E8C7] font-semibold text-sm">{step.title}</h3>
                    <p className="text-[#7A7363] text-xs">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Featured Startups */}
          <div>
            <h2 className="text-[#F5E8C7] font-semibold mb-3">Featured Opportunities</h2>
            <div className="space-y-3">
              {STARTUPS.slice(0, 3).map((startup, i) => (
                <motion.button
                  key={startup.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => setSelectedStartup(startup)}
                  className="w-full p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 text-left hover:border-orange-500/30 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-[#F5E8C7] font-semibold text-sm">{startup.name}</h3>
                      <p className="text-[#7A7363] text-xs">{startup.sector} • {startup.location}</p>
                    </div>
                    {startup.shariahCompliant && (
                      <SealCheck size={16} className="text-emerald-400 shrink-0" />
                    )}
                  </div>
                  {/* Funding progress */}
                  <div className="mt-2">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#D4A853]">₹{(startup.fundingRaised / 100000).toFixed(0)}L raised</span>
                      <span className="text-[#7A7363]">{Math.round(startup.fundingRaised / startup.fundingGoal * 100)}%</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-[#10151F]">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                        style={{ width: `${Math.min(100, (startup.fundingRaised / startup.fundingGoal) * 100)}%` }}
                      />
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h2 className="text-[#F5E8C7] font-semibold mb-3">Investor Benefits</h2>
            <div className="grid grid-cols-2 gap-3">
              {INVESTOR_BENEFITS.map((b, i) => (
                <div key={i} className="p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50">
                  <b.icon size={20} className="text-orange-400 mb-2" />
                  <h3 className="text-[#F5E8C7] font-semibold text-xs mb-1">{b.title}</h3>
                  <p className="text-[#7A7363] text-[10px] leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Entrepreneur View ── */}
      {viewType === 'entrepreneur' && (
        <div className="px-4 space-y-6">
          {/* Entrepreneur Journey */}
          <div>
            <h2 className="text-[#F5E8C7] font-semibold mb-3">Your Startup Journey</h2>
            <div className="space-y-2">
              {[
                { step: 1, title: 'Create Your Startup', desc: 'Register your business idea with sector and summary' },
                { step: 2, title: 'Apply to Programs', desc: 'Join incubation and acceleration programs' },
                { step: 3, title: 'Get Funded', desc: 'Connect with ethical investors and secure funding' },
              ].map((step) => (
                <div key={step.step} className="flex gap-3 p-3 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50">
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                    <span className="text-emerald-400 text-sm font-bold">{step.step}</span>
                  </div>
                  <div>
                    <h3 className="text-[#F5E8C7] font-semibold text-sm">{step.title}</h3>
                    <p className="text-[#7A7363] text-xs">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* All Startups (Discovery) */}
          <div>
            <h2 className="text-[#F5E8C7] font-semibold mb-3">Startup Community</h2>
            <div className="space-y-3">
              {STARTUPS.map((startup, i) => (
                <motion.button
                  key={startup.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setSelectedStartup(startup)}
                  className="w-full flex items-center gap-3 p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 text-left hover:border-emerald-500/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center shrink-0">
                    <Lightbulb size={20} className="text-orange-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#F5E8C7] font-semibold text-sm truncate">{startup.name}</h3>
                    <p className="text-[#7A7363] text-xs">{startup.sector} • {startup.location}</p>
                  </div>
                  <CaretRight size={16} className="text-[#7A7363] shrink-0" />
                </motion.button>
              ))}
            </div>
          </div>

          {/* Incubation Programs */}
          <div>
            <h2 className="text-[#F5E8C7] font-semibold mb-3">Incubation Programs</h2>
            {[
              { title: 'View Programs', desc: 'Explore available acceleration programs' },
              { title: 'Apply to Program', desc: 'Submit your application to programs' },
              { title: 'Track Application', desc: 'Monitor your application status' },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => window.open('https://zaryahplus.com', '_blank')}
                className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 text-left mb-2 hover:border-[#D4A853]/30"
              >
                <div className="w-8 h-8 rounded-lg bg-[#D4A853]/15 flex items-center justify-center shrink-0">
                  <ArrowSquareOut size={16} className="text-[#D4A853]" />
                </div>
                <div>
                  <h3 className="text-[#F5E8C7] font-semibold text-sm">{item.title}</h3>
                  <p className="text-[#7A7363] text-xs">{item.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Startup Detail Sheet */}
      <AnimatePresence>
        {selectedStartup && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
            onClick={() => setSelectedStartup(null)}
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
                <h2 className="text-[#F5E8C7] font-bold text-lg truncate pr-4">{selectedStartup.name}</h2>
                <button onClick={() => setSelectedStartup(null)} className="p-1.5 rounded-lg hover:bg-white/10 shrink-0">
                  <X size={20} className="text-[#7A7363]" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Funding Progress */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/20">
                  <div className="flex justify-between mb-2">
                    <span className="text-[#F5E8C7] text-sm font-semibold">
                      ₹{(selectedStartup.fundingRaised / 100000).toFixed(0)}L raised
                    </span>
                    <span className="text-[#7A7363] text-sm">
                      of ₹{(selectedStartup.fundingGoal / 100000).toFixed(0)}L
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-[#10151F]">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500"
                      style={{ width: `${Math.min(100, (selectedStartup.fundingRaised / selectedStartup.fundingGoal) * 100)}%` }}
                    />
                  </div>
                  <p className="text-orange-400 text-xs mt-1">
                    {Math.round(selectedStartup.fundingRaised / selectedStartup.fundingGoal * 100)}% funded
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="p-3 rounded-xl bg-[#10151F] text-center">
                    <MapPin size={16} className="text-[#D4A853] mx-auto mb-1" />
                    <p className="text-[#F5E8C7] text-xs font-semibold">{selectedStartup.location.split(',')[0]}</p>
                    <p className="text-[#7A7363] text-[10px]">Location</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#10151F] text-center">
                    <UsersThree size={16} className="text-[#D4A853] mx-auto mb-1" />
                    <p className="text-[#F5E8C7] text-xs font-semibold">{selectedStartup.teamSize}</p>
                    <p className="text-[#7A7363] text-[10px]">Team Size</p>
                  </div>
                  <div className="p-3 rounded-xl bg-[#10151F] text-center">
                    <Calendar size={16} className="text-[#D4A853] mx-auto mb-1" />
                    <p className="text-[#F5E8C7] text-xs font-semibold">{selectedStartup.founded}</p>
                    <p className="text-[#7A7363] text-[10px]">Founded</p>
                  </div>
                </div>

                {/* About */}
                <div>
                  <h3 className="text-[#F5E8C7] font-semibold text-sm mb-2">About</h3>
                  <p className="text-[#C9C0A8] text-sm leading-relaxed">{selectedStartup.description}</p>
                </div>

                {/* Traction */}
                <div>
                  <h3 className="text-[#F5E8C7] font-semibold text-sm mb-2">Traction</h3>
                  {selectedStartup.traction.map((t, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5">
                      <Star size={14} className="text-amber-400 shrink-0" />
                      <span className="text-[#C9C0A8] text-sm">{t}</span>
                    </div>
                  ))}
                </div>

                {/* Highlights */}
                <div>
                  <h3 className="text-[#F5E8C7] font-semibold text-sm mb-2">Key Highlights</h3>
                  {selectedStartup.highlights.map((h, i) => (
                    <div key={i} className="flex items-center gap-2 py-1.5">
                      <Trophy size={14} className="text-emerald-400 shrink-0" />
                      <span className="text-[#C9C0A8] text-sm">{h}</span>
                    </div>
                  ))}
                </div>

                {/* Investment Structure — AAOIFI */}
                <div>
                  <h3 className="text-[#F5E8C7] font-semibold text-sm mb-2">Investment Structure</h3>
                  <div className="p-3 rounded-xl bg-[#D4A853]/5 border border-[#D4A853]/20">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[#D4A853] text-sm font-semibold">{selectedStartup.investmentStructure.type}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4A853]/15 text-[#D4A853] font-medium">{selectedStartup.investmentStructure.standard}</span>
                    </div>
                    <p className="text-[#7A7363] text-xs leading-relaxed">{selectedStartup.investmentStructure.terms}</p>
                  </div>
                </div>

                {/* Shariah Compliance */}
                {selectedStartup.shariahCompliant && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-2">
                    <SealCheck size={20} className="text-emerald-400" />
                    <span className="text-emerald-300 text-sm font-medium">Shariah Compliant — AAOIFI Screened</span>
                  </div>
                )}

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button className="py-3 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 text-white font-bold text-sm hover:opacity-90">
                    Express Interest
                  </button>
                  <button className="py-3 rounded-xl bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853] font-bold text-sm hover:bg-[#D4A853]/25">
                    Request Pitch Deck
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default SharkTankPage;
