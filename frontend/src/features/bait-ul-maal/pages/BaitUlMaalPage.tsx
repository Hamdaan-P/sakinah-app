/**
 * Bait-ul-Maal Page
 * Islamic treasury / charity hub — crowdfunding, emergency aid,
 * transparency ledger, waqf endowments, aid application
 * Converted from: bait_ul_maal_home_page.dart + crowdfunding_page.dart +
 *   emergency_aid_page.dart + transparency_ledger_page.dart + waqf_detail_page.dart +
 *   apply_for_aid_wizard_page.dart
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DisclaimerBanner } from '@/components/shared';
import {
  HandCoins,
  Warning,
  FileText,
  Buildings,
  CaretRight,
  X,
  TrendUp,
  TrendDown,
  UsersThree,
  Calendar,
  ShieldCheck,
  Target,
  CheckCircle,
} from '@phosphor-icons/react';

// ── Campaign Data ──────────────────────────────────────────────

interface Campaign {
  id: string;
  title: string;
  category: string;
  goal: number;
  raised: number;
  beneficiaries: number;
  daysLeft: number;
  urgent: boolean;
}

const CAMPAIGNS: Campaign[] = [
  { id: 'c1', title: 'Flood Relief — Pakistan', category: 'Emergency Relief', goal: 500000, raised: 320000, beneficiaries: 450, daysLeft: 12, urgent: true },
  { id: 'c2', title: 'Medical Aid for Children', category: 'Healthcare', goal: 200000, raised: 145000, beneficiaries: 85, daysLeft: 25, urgent: false },
  { id: 'c3', title: 'Orphan Education Fund', category: 'Education', goal: 300000, raised: 210000, beneficiaries: 120, daysLeft: 30, urgent: false },
  { id: 'c4', title: 'Clean Water Initiative', category: 'Infrastructure', goal: 400000, raised: 95000, beneficiaries: 600, daysLeft: 45, urgent: true },
];

const WAQFS = [
  { id: 'w1', title: 'Masjid Construction', value: '₹2.5Cr', monthlyReturn: '₹85K', beneficiaries: 500, year: 2019 },
  { id: 'w2', title: 'Islamic Education Endowment', value: '₹1.2Cr', monthlyReturn: '₹42K', beneficiaries: 200, year: 2020 },
  { id: 'w3', title: 'Healthcare Waqf', value: '₹80L', monthlyReturn: '₹28K', beneficiaries: 150, year: 2021 },
  { id: 'w4', title: 'Orphan Care Trust', value: '₹60L', monthlyReturn: '₹21K', beneficiaries: 75, year: 2022 },
];

const LEDGER_ENTRIES = [
  { type: 'inflow', category: 'Zakat', amount: 125000, note: 'Monthly Zakat collection', date: '2024-08-10' },
  { type: 'outflow', category: 'Medical', amount: 45000, note: 'Medical aid distribution', date: '2024-08-09' },
  { type: 'inflow', category: 'Sadaqah', amount: 32000, note: 'General donations', date: '2024-08-08' },
  { type: 'outflow', category: 'Education', amount: 78000, note: 'Student scholarships', date: '2024-08-07' },
  { type: 'inflow', category: 'Waqf', amount: 200000, note: 'Waqf endowment contribution', date: '2024-08-06' },
  { type: 'outflow', category: 'Food', amount: 25000, note: 'Food distribution drive', date: '2024-08-05' },
  { type: 'outflow', category: 'Infrastructure', amount: 150000, note: 'Masjid renovation', date: '2024-08-04' },
  { type: 'inflow', category: 'Fitrah', amount: 55000, note: 'Eid Fitrah collection', date: '2024-08-03' },
];

const AID_TYPES = ['Financial Assistance', 'Medical Aid', 'Education Support', 'Housing', 'Food Security', 'Business', 'Other'];
const URGENCY_LEVELS = ['Normal', 'Urgent', 'Critical'];

type SheetType = 'campaign' | 'waqf' | 'ledger' | 'aid' | 'emergency' | null;

export function BaitUlMaalPage() {
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [donationAmount, setDonationAmount] = useState('');
  const [aidForm, setAidForm] = useState({ type: '', urgency: '', description: '', name: '', phone: '' });
  const [aidSubmitted, setAidSubmitted] = useState(false);
  const [ledgerFilter, setLedgerFilter] = useState<'all' | 'inflow' | 'outflow'>('all');

  const totalInflow = LEDGER_ENTRIES.filter((e) => e.type === 'inflow').reduce((s, e) => s + e.amount, 0);
  const totalOutflow = LEDGER_ENTRIES.filter((e) => e.type === 'outflow').reduce((s, e) => s + e.amount, 0);
  const filteredLedger = ledgerFilter === 'all' ? LEDGER_ENTRIES : LEDGER_ENTRIES.filter((e) => e.type === ledgerFilter);

  const handleDonate = () => {
    if (!donationAmount) return;
    setDonationAmount('');
    setActiveSheet(null);
    setSelectedCampaign(null);
  };

  const handleAidSubmit = () => {
    if (!aidForm.type || !aidForm.name) return;
    setAidSubmitted(true);
    setTimeout(() => { setAidSubmitted(false); setActiveSheet(null); setAidForm({ type: '', urgency: '', description: '', name: '', phone: '' }); }, 2000);
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-b-3xl mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/25 via-[#10151F] to-[#161D2C]" />
        <div className="relative px-6 pt-8 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <HandCoins size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5E8C7]">Bait-ul-Maal</h1>
              <p className="text-sm text-[#B8C4D4]">Islamic Treasury — AAOIFI SS 33 (Waqf) / SS 35 (Zakat)</p>
            </div>
          </div>
          {/* Impact Stats */}
          <div className="flex gap-3 justify-center">
            {[{ value: '2.4M', label: 'DNZ Raised' }, { value: '1,245', label: 'Families' }, { value: '89', label: 'Projects' }].map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-lg font-bold text-[#E8C97A]">{s.value}</p>
                <p className="text-[#7A7363] text-xs">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6 space-y-3">
        {[
          { id: 'campaign' as const, icon: Target, title: 'Crowdfunding', desc: 'Support community campaigns', gradient: 'from-emerald-600/20 to-teal-700/20' },
          { id: 'emergency' as const, icon: Warning, title: 'Emergency Aid', desc: 'Request or provide urgent help', gradient: 'from-red-600/20 to-orange-700/20' },
          { id: 'ledger' as const, icon: FileText, title: 'Transparency Ledger', desc: 'Track all financial flows', gradient: 'from-blue-600/20 to-indigo-700/20' },
          { id: 'aid' as const, icon: ShieldCheck, title: 'Apply for Aid', desc: 'Submit an aid application', gradient: 'from-purple-600/20 to-violet-700/20' },
        ].map((card, i) => (
          <motion.button key={card.id} initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            onClick={() => setActiveSheet(card.id)}
            className={`w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${card.gradient} border border-[rgba(212,168,83,0.2)]/50 text-left hover:border-emerald-500/30 transition-colors`}>
            <div className="w-10 h-10 rounded-lg bg-[#10151F]/80 flex items-center justify-center shrink-0">
              <card.icon size={20} className="text-[#D4A853]" />
            </div>
            <div className="flex-1"><h3 className="text-[#F5E8C7] font-semibold text-sm">{card.title}</h3><p className="text-[#7A7363] text-xs">{card.desc}</p></div>
            <CaretRight size={16} className="text-[#7A7363]" />
          </motion.button>
        ))}
      </div>

      {/* Trending Campaigns */}
      <div className="px-4 mb-6">
        <h2 className="text-[#F5E8C7] font-semibold mb-3">Trending Campaigns</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
          {CAMPAIGNS.slice(0, 3).map((c) => (
            <button key={c.id} onClick={() => { setSelectedCampaign(c); setActiveSheet('campaign'); }}
              className={`min-w-[220px] p-4 rounded-xl bg-[#10151F] border shrink-0 text-left ${c.urgent ? 'border-red-500/30' : 'border-[rgba(212,168,83,0.2)]/50'}`}>
              {c.urgent && <span className="text-red-400 text-[10px] font-bold mb-1 block">URGENT</span>}
              <h3 className="text-[#F5E8C7] font-semibold text-sm mb-1">{c.title}</h3>
              <p className="text-[#7A7363] text-xs mb-2">{c.category}</p>
              <div className="w-full h-1.5 rounded-full bg-[#10151F] mb-1">
                <div className="h-full rounded-full bg-emerald-500" style={{ width: `${(c.raised / c.goal) * 100}%` }} />
              </div>
              <p className="text-[#D4A853] text-xs">₹{(c.raised / 1000).toFixed(0)}K of ₹{(c.goal / 1000).toFixed(0)}K</p>
            </button>
          ))}
        </div>
      </div>

      {/* Waqf Endowments */}
      <div className="px-4 mb-6">
        <h2 className="text-[#F5E8C7] font-semibold mb-3">Waqf Endowments</h2>
        <div className="space-y-2">
          {WAQFS.map((w) => (
            <button key={w.id} onClick={() => setActiveSheet('waqf')}
              className="w-full flex items-center gap-3 p-3 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 text-left">
              <Buildings size={20} className="text-[#D4A853] shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-[#F5E8C7] font-semibold text-sm">{w.title}</h3>
                <p className="text-[#7A7363] text-xs">Value: {w.value} • Return: {w.monthlyReturn}/mo</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Islamic Quote */}
      <div className="px-4">
        <div className="p-4 rounded-xl bg-[#10151F] border border-[#D4A853]/20 text-center">
          <p className="text-[#E8C97A] text-sm italic">"The example of those who spend in the way of Allah is like a grain that sprouts seven ears..."</p>
          <p className="text-[#7A7363] text-xs mt-1">— Quran 2:261</p>
        </div>
      </div>

      <div className="px-4 mb-4">
        <DisclaimerBanner contentId="FINANCIAL" variant="banner" />
      </div>

      {/* Sheets */}
      <AnimatePresence>
        {activeSheet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
            onClick={() => { setActiveSheet(null); setSelectedCampaign(null); }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-[#10151F] rounded-t-3xl max-h-[85vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#10151F] px-5 pt-4 pb-3 border-b border-[rgba(212,168,83,0.2)]/50 flex items-center justify-between z-10">
                <h2 className="text-[#F5E8C7] font-bold text-lg">
                  {activeSheet === 'campaign' && (selectedCampaign?.title || 'Crowdfunding')}
                  {activeSheet === 'waqf' && 'Waqf Endowments'}
                  {activeSheet === 'ledger' && 'Transparency Ledger'}
                  {activeSheet === 'aid' && 'Apply for Aid'}
                  {activeSheet === 'emergency' && 'Emergency Aid'}
                </h2>
                <button onClick={() => { setActiveSheet(null); setSelectedCampaign(null); }} className="p-1.5 rounded-lg hover:bg-white/10">
                  <X size={20} className="text-[#7A7363]" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Campaign Detail + Donate */}
                {activeSheet === 'campaign' && selectedCampaign && (
                  <>
                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                      <div className="flex justify-between mb-2">
                        <span className="text-[#F5E8C7] font-semibold">₹{(selectedCampaign.raised / 1000).toFixed(0)}K raised</span>
                        <span className="text-[#7A7363] text-sm">of ₹{(selectedCampaign.goal / 1000).toFixed(0)}K</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-[#10151F]"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(selectedCampaign.raised / selectedCampaign.goal) * 100}%` }} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-xl bg-[#10151F] text-center"><UsersThree size={16} className="text-[#D4A853] mx-auto mb-1" /><p className="text-[#F5E8C7] text-sm font-semibold">{selectedCampaign.beneficiaries}</p><p className="text-[#7A7363] text-[10px]">Beneficiaries</p></div>
                      <div className="p-3 rounded-xl bg-[#10151F] text-center"><Calendar size={16} className="text-[#D4A853] mx-auto mb-1" /><p className="text-[#F5E8C7] text-sm font-semibold">{selectedCampaign.daysLeft}</p><p className="text-[#7A7363] text-[10px]">Days Left</p></div>
                    </div>
                    <div>
                      <label htmlFor="baitulmaalpage-fld-1" className="text-[#C9C0A8] text-xs mb-1.5 block">Contribution Amount</label>
                      <div className="flex gap-2 mb-3">{[500, 1000, 2500, 5000].map((a) => (
                        <button key={a} onClick={() => setDonationAmount(String(a))}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium ${donationAmount === String(a) ? 'bg-emerald-500 text-white' : 'bg-[#10151F] text-[#C9C0A8] border border-[rgba(212,168,83,0.2)]'}`}>₹{a.toLocaleString()}</button>
                      ))}</div>
                      <input id="baitulmaalpage-fld-1" type="number" value={donationAmount} onChange={(e) => setDonationAmount(e.target.value)} placeholder="Custom amount"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm placeholder-[#7A7363] focus:outline-none" />
                    </div>
                    <button onClick={handleDonate} disabled={!donationAmount} className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm disabled:opacity-40">
                      Contribute Now
                    </button>
                  </>
                )}

                {/* Crowdfunding list (no campaign selected) */}
                {activeSheet === 'campaign' && !selectedCampaign && (
                  <div className="space-y-3">
                    {CAMPAIGNS.map((c) => (
                      <button key={c.id} onClick={() => setSelectedCampaign(c)}
                        className="w-full p-3 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 text-left">
                        <h3 className="text-[#F5E8C7] font-semibold text-sm">{c.title}</h3>
                        <p className="text-[#7A7363] text-xs">{c.category} • {c.daysLeft} days left</p>
                        <div className="w-full h-1.5 rounded-full bg-[#10151F] mt-2"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${(c.raised / c.goal) * 100}%` }} /></div>
                      </button>
                    ))}
                  </div>
                )}

                {/* Ledger */}
                {activeSheet === 'ledger' && (
                  <>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="p-3 rounded-xl bg-emerald-500/10 text-center"><p className="text-emerald-400 text-xs">Inflow</p><p className="text-[#F5E8C7] font-bold text-sm">₹{(totalInflow / 1000).toFixed(0)}K</p></div>
                      <div className="p-3 rounded-xl bg-red-500/10 text-center"><p className="text-red-400 text-xs">Outflow</p><p className="text-[#F5E8C7] font-bold text-sm">₹{(totalOutflow / 1000).toFixed(0)}K</p></div>
                      <div className="p-3 rounded-xl bg-blue-500/10 text-center"><p className="text-blue-400 text-xs">Balance</p><p className="text-[#F5E8C7] font-bold text-sm">₹{((totalInflow - totalOutflow) / 1000).toFixed(0)}K</p></div>
                    </div>
                    <div className="flex gap-2">{(['all', 'inflow', 'outflow'] as const).map((f) => (
                      <button key={f} onClick={() => setLedgerFilter(f)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${ledgerFilter === f ? 'bg-[#D4A853] text-[#10151F]' : 'bg-[#10151F] text-[#C9C0A8] border border-[rgba(212,168,83,0.2)]'}`}>{f}</button>
                    ))}</div>
                    {filteredLedger.map((e, i) => (
                      <div key={i} className="flex items-center gap-3 py-2 border-b border-[rgba(212,168,83,0.2)]/30 last:border-0">
                        {e.type === 'inflow' ? <TrendUp size={16} className="text-emerald-400 shrink-0" /> : <TrendDown size={16} className="text-red-400 shrink-0" />}
                        <div className="flex-1 min-w-0"><p className="text-[#F5E8C7] text-sm">{e.note}</p><p className="text-[#7A7363] text-xs">{e.category} • {e.date}</p></div>
                        <span className={`font-semibold text-sm ${e.type === 'inflow' ? 'text-emerald-400' : 'text-red-400'}`}>{e.type === 'inflow' ? '+' : '-'}₹{(e.amount / 1000).toFixed(0)}K</span>
                      </div>
                    ))}
                  </>
                )}

                {/* Waqf */}
                {activeSheet === 'waqf' && WAQFS.map((w) => (
                  <div key={w.id} className="p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50">
                    <h3 className="text-[#F5E8C7] font-semibold text-sm mb-2">{w.title}</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div><span className="text-[#7A7363]">Value:</span> <span className="text-[#F5E8C7] font-medium">{w.value}</span></div>
                      <div><span className="text-[#7A7363]">Return:</span> <span className="text-[#F5E8C7] font-medium">{w.monthlyReturn}/mo</span></div>
                      <div><span className="text-[#7A7363]">Beneficiaries:</span> <span className="text-[#F5E8C7] font-medium">{w.beneficiaries}</span></div>
                      <div><span className="text-[#7A7363]">Est.:</span> <span className="text-[#F5E8C7] font-medium">{w.year}</span></div>
                    </div>
                  </div>
                ))}

                {/* Aid Application */}
                {(activeSheet === 'aid' || activeSheet === 'emergency') && !aidSubmitted && (
                  <>
                    <div><label htmlFor="baitulmaalpage-fld-2" className="text-[#C9C0A8] text-xs mb-1.5 block">{activeSheet === 'emergency' ? 'Emergency Category' : 'Aid Type'}</label>
                      <select id="baitulmaalpage-fld-2" value={aidForm.type} onChange={(e) => setAidForm({ ...aidForm, type: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm focus:outline-none">
                        <option value="">Select type</option>
                        {(activeSheet === 'emergency' ? ['Medical', 'Natural Disaster', 'Financial Crisis', 'Housing', 'Food Security'] : AID_TYPES).map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <fieldset className="border-0 p-0 m-0"><legend className="text-[#C9C0A8] text-xs mb-1.5 block">Urgency Level</legend>
                      <div className="flex gap-2">{URGENCY_LEVELS.map((u) => (
                        <button key={u} type="button" onClick={() => setAidForm({ ...aidForm, urgency: u })}
                          className={`flex-1 py-2 rounded-xl text-xs font-medium ${aidForm.urgency === u
                            ? u === 'Critical' ? 'bg-red-500 text-white' : u === 'Urgent' ? 'bg-amber-500 text-white' : 'bg-blue-500 text-white'
                            : 'bg-[#10151F] text-[#C9C0A8] border border-[rgba(212,168,83,0.2)]'}`}>{u}</button>
                      ))}</div>
                    </fieldset>
                    {[{ label: 'Full Name', key: 'name' }, { label: 'Phone', key: 'phone' }].map((f) => (
                      <div key={f.key}><label htmlFor="baitulmaalpage-fld-3" className="text-[#C9C0A8] text-xs mb-1.5 block">{f.label}</label>
                        <input id="baitulmaalpage-fld-3" type="text" value={aidForm[f.key as keyof typeof aidForm]} onChange={(e) => setAidForm({ ...aidForm, [f.key]: e.target.value })}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm placeholder-[#7A7363] focus:outline-none" placeholder={f.label} /></div>
                    ))}
                    <div><label htmlFor="baitulmaalpage-fld-4" className="text-[#C9C0A8] text-xs mb-1.5 block">Description</label>
                      <textarea id="baitulmaalpage-fld-4" value={aidForm.description} onChange={(e) => setAidForm({ ...aidForm, description: e.target.value })} rows={3}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm placeholder-[#7A7363] focus:outline-none resize-none" placeholder="Describe your situation..." /></div>
                    <button onClick={handleAidSubmit} disabled={!aidForm.type || !aidForm.name}
                      className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm disabled:opacity-40">
                      Submit Application
                    </button>
                  </>
                )}
                {(activeSheet === 'aid' || activeSheet === 'emergency') && aidSubmitted && (
                  <div className="text-center py-6">
                    <CheckCircle size={48} className="text-emerald-400 mx-auto mb-3" />
                    <h3 className="text-[#F5E8C7] font-bold text-lg">Application Submitted!</h3>
                    <p className="text-[#7A7363] text-sm mt-1">We'll review your request and get back to you soon.</p>
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

export default BaitUlMaalPage;
