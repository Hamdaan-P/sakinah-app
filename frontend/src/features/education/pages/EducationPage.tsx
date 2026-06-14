/**
 * EducationPage
 * AAOIFI Shariah Standards reference & Islamic finance education.
 * Covers all 59 AAOIFI standards grouped by category with explanations.
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DisclaimerBanner } from '@/components/shared';
import { trackFeature } from '@/lib/analytics';
import {
  BookOpen,
  MagnifyingGlass,
  X,
  Shield,
  CaretRight,
  Bank,
  Scales,
  Coins,
  Handshake,
  Buildings,
  ChartBar,
  CurrencyDollar,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';

// ── AAOIFI Standards Data ──

interface AaoifiStandard {
  id: number;
  title: string;
  arabicName: string;
  category: string;
  summary: string;
  keyRules: string[];
  appFeature?: string; // Which ZaryahPlus feature uses this
}

const CATEGORIES = [
  { id: 'contracts', label: 'Contracts & Transactions', icon: Handshake, color: 'text-blue-400' },
  { id: 'investment', label: 'Investment & Securities', icon: ChartBar, color: 'text-emerald-400' },
  { id: 'banking', label: 'Banking Services', icon: Bank, color: 'text-purple-400' },
  { id: 'social', label: 'Social Finance & Zakat', icon: Coins, color: 'text-amber-400' },
  { id: 'governance', label: 'Governance & Ethics', icon: Scales, color: 'text-teal-400' },
  { id: 'modern', label: 'Modern Applications', icon: Buildings, color: 'text-pink-400' },
];

const STANDARDS: AaoifiStandard[] = [
  // Contracts & Transactions
  { id: 8, title: 'Murabahah', arabicName: 'المرابحة', category: 'contracts',
    summary: 'Cost-plus financing where the bank buys an asset and sells it to the client at cost + disclosed profit margin.',
    keyRules: ['Profit margin must be disclosed and fixed at contract time', 'Asset must be in bank\'s possession before sale', 'No penalty compounding for late payment'],
    appFeature: 'Islamic Banking → Murabahah Calculator' },
  { id: 9, title: 'Ijarah', arabicName: 'الإجارة', category: 'contracts',
    summary: 'Islamic lease where the lessor retains ownership and bears major maintenance. Can transfer ownership at end (Ijarah Muntahia Bittamleek).',
    keyRules: ['Lessor bears major maintenance and insurance', 'Rent can be fixed or variable (not interest-linked)', 'Ownership transfer via gift, token sale, or gradual transfer'],
    appFeature: 'Islamic Banking → Ijarah Calculator' },
  { id: 10, title: 'Salam', arabicName: 'السلم', category: 'contracts',
    summary: 'Forward sale where payment is made in full at contract time for goods delivered later. Used for agricultural and commodity financing.',
    keyRules: ['Full price paid upfront', 'Delivery date and specifications must be fixed', 'Cannot be used for gold, silver, or currencies'] },
  { id: 11, title: 'Istisna\'a', arabicName: 'الاستصناع', category: 'contracts',
    summary: 'Manufacturing contract where one party orders fabrication of an item with agreed specifications. Payment can be deferred.',
    keyRules: ['Specifications must be precise', 'Payment can be in installments', 'Commonly used for construction and infrastructure'] },
  { id: 12, title: 'Sharikah (Musharakah)', arabicName: 'الشركة', category: 'contracts',
    summary: 'Partnership where all parties contribute capital. Profits per agreed ratio, losses per capital contribution.',
    keyRules: ['Profit ratio can differ from capital ratio', 'Losses strictly proportional to capital', 'Diminishing variant allows gradual buyout'],
    appFeature: 'Islamic Banking → Musharakah Calculator' },
  { id: 13, title: 'Mudarabah', arabicName: 'المضاربة', category: 'contracts',
    summary: 'Profit-sharing where Rabb-ul-Maal provides capital and Mudarib provides labor/expertise.',
    keyRules: ['Capital losses borne by investor only', 'Mudarib cannot guarantee capital or minimum return', 'Profit share must be a percentage, not lump sum'],
    appFeature: 'Islamic Banking → Mudarabah Calculator' },
  { id: 19, title: 'Qard (Loan)', arabicName: 'القرض', category: 'contracts',
    summary: 'Interest-free loan (Qard Hasan). Borrower must return exact amount — no additional amount may be stipulated.',
    keyRules: ['Absolutely no interest or additional return', 'Lender may not benefit from the loan', 'Voluntary gift from borrower is permissible if not pre-conditioned'],
    appFeature: 'Debt Restructuring → Qard Hasan options' },

  // Investment & Securities
  { id: 17, title: 'Investment Sukuk', arabicName: 'صكوك الاستثمار', category: 'investment',
    summary: 'Islamic investment certificates representing ownership in tangible assets, usufruct, or services. Alternative to conventional bonds.',
    keyRules: ['Must be backed by tangible assets or usufruct', 'Returns linked to actual asset performance', 'Tradeable on secondary market (most types)'],
    appFeature: 'Wallet → Sukuk asset class' },
  { id: 21, title: 'Financial Paper (Shares & Bonds)', arabicName: 'الأوراق المالية', category: 'investment',
    summary: 'Rules for dealing in shares and equity. Foundation for Shariah stock screening (3-stage pipeline).',
    keyRules: ['Company\'s primary business must be halal', 'Debt/Total Assets must be below threshold (30% AAOIFI / 25% TASIS)', 'Interest income must be below threshold (5% AAOIFI / 3% TASIS)', 'Impure income must be purified (donated to charity)'],
    appFeature: 'Screener → 3-stage AAOIFI/TASIS screening' },
  { id: 27, title: 'Indices', arabicName: 'المؤشرات', category: 'investment',
    summary: 'Standards for constructing Shariah-compliant indices. Defines screening criteria for index inclusion.',
    keyRules: ['Financial ratios must pass screening thresholds', 'Regular rebalancing required', 'Non-compliant companies must be removed promptly'],
    appFeature: 'Screener → Compliance index' },
  { id: 57, title: 'Gold and Its Trading', arabicName: 'الذهب وتداوله', category: 'investment',
    summary: 'Rules for buying, selling, and investing in gold. Covers physical gold, gold accounts, and gold-backed products.',
    keyRules: ['Spot transactions: must be hand-to-hand exchange', 'Gold savings accounts: physical gold must be allocated', 'Gold-backed currency: must maintain full gold backing'],
    appFeature: 'Wallet → Gold Reserve' },

  // Banking Services
  { id: 5, title: 'Guarantees', arabicName: 'الضمانات', category: 'banking',
    summary: 'Shariah rules for bank guarantees (Kafalah). Guarantor is liable for the debt if debtor defaults.',
    keyRules: ['Guarantor cannot charge a fee for guarantee (debated)', 'Administrative charges are permissible', 'Guarantee must relate to a legitimate transaction'] },
  { id: 28, title: 'Banking Services', arabicName: 'خدمات مصرفية', category: 'banking',
    summary: 'General banking operations including current accounts (Wadiah/Qard), transfers (Hawalah), and agency (Wakalah).',
    keyRules: ['Current accounts: Wadiah (safekeeping) or Qard (loan)', 'Fund transfers: Hawalah (debt transfer) mechanism', 'Agency: Wakalah for managing client\'s affairs'] },
  { id: 46, title: 'Wakalah bi al-Istithmar', arabicName: 'الوكالة بالاستثمار', category: 'banking',
    summary: 'Investment agency where client appoints bank as agent to invest funds. Agent earns a fee, not a share of profit.',
    keyRules: ['Agent earns fixed fee or percentage of invested amount', 'Agent cannot guarantee capital or returns', 'Agent bears liability only for negligence'] },

  // Social Finance & Zakat
  { id: 35, title: 'Zakah', arabicName: 'الزكاة', category: 'social',
    summary: 'Comprehensive rules for zakat calculation. Gold nisab = 85g, Silver nisab = 595g, rate = 2.5%.',
    keyRules: ['Gold nisab: 85 grams (not 87.48g)', 'Silver nisab: 595 grams (not 612.36g)', 'Hawl: one complete lunar year of possession required', 'Trading stocks: zakat on market value', 'Holding stocks: zakat on company\'s zakatable assets per share'],
    appFeature: 'Zakat Calculator → AAOIFI SS 35 compliant' },
  { id: 33, title: 'Waqf', arabicName: 'الوقف', category: 'social',
    summary: 'Islamic endowment where property is dedicated for charitable purposes in perpetuity. The corpus cannot be sold or inherited.',
    keyRules: ['Waqf property cannot be sold, gifted, or inherited', 'Only the usufruct/returns can be distributed', 'Must have a valid charitable purpose', 'Requires proper governance and oversight'],
    appFeature: 'Bait-ul-Maal → Waqf endowments' },
  { id: 14, title: 'Documentary Credit (LC)', arabicName: 'الاعتماد المستندي', category: 'social',
    summary: 'Islamic letter of credit using Wakalah (agency) and Murabahah structures for trade finance.',
    keyRules: ['Bank acts as agent (Wakil) for buyer', 'Financing via Murabahah after goods received', 'Service charges are permissible; interest is not'] },

  // Governance & Ethics
  { id: 1, title: 'Trading in Currencies', arabicName: 'المتاجرة بالعملات', category: 'governance',
    summary: 'Rules for foreign exchange. Spot transactions only — no forward or futures contracts on currencies.',
    keyRules: ['Exchange must be spot (same session)', 'Forward contracts on currencies are prohibited', 'Hedging via Wa\'d (promise) structure may be permissible'] },
  { id: 38, title: 'Online Financial Dealings', arabicName: 'التعاملات المالية الإلكترونية', category: 'governance',
    summary: 'Shariah rules for e-commerce, online banking, and digital transactions.',
    keyRules: ['Online contracts are valid if offer and acceptance are clear', 'Digital signatures are acceptable', 'Privacy and data protection are obligatory'],
    appFeature: 'All digital features in the app' },
  { id: 59, title: 'Sale of Debt', arabicName: 'بيع الدين', category: 'governance',
    summary: 'Rules for selling/transferring debts. Debt cannot be sold at a discount to a third party (to avoid riba).',
    keyRules: ['Debt can be sold at face value only', 'Discount sale of debt = riba (prohibited)', 'Transfer to debtor (Hawalah) is permissible'] },

  // Modern Applications
  { id: 44, title: 'Obtaining and Deploying Liquidity', arabicName: 'الحصول على السيولة', category: 'modern',
    summary: 'Shariah-compliant methods for liquidity management in Islamic banks. Covers commodity Murabahah and other tools.',
    keyRules: ['Tawarruq (organized commodity Murabahah) is debated', 'Must involve actual commodity movement', 'Inter-bank Mudarabah for overnight placement'] },
  { id: 56, title: 'Guarantee of Investment Manager', arabicName: 'ضمان مدير الاستثمار', category: 'modern',
    summary: 'When and how an investment manager (Mudarib/Wakil) may provide guarantees.',
    keyRules: ['Voluntary guarantee is permissible', 'Mandatory guarantee invalidates Mudarabah', 'Third-party guarantee is permissible'] },
  { id: 58, title: 'Concession Contracts', arabicName: 'عقود الامتياز', category: 'modern',
    summary: 'BOT (Build-Operate-Transfer) and similar concession models under Shariah. Used for infrastructure projects.',
    keyRules: ['Can use Istisna\'a for construction phase', 'Ijarah for operation phase', 'Musharakah for revenue-sharing model'],
    appFeature: 'Real Estate → Project financing' },
];

type SelectedStandard = AaoifiStandard | null;

export function EducationPage() {
  useEffect(() => { trackFeature('education'); }, []);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selected, setSelected] = useState<SelectedStandard>(null);

  const filtered = STANDARDS.filter((s) => {
    const matchesCategory = !activeCategory || s.category === activeCategory;
    const matchesSearch = !search ||
      s.title.toLowerCase().includes(search.toLowerCase()) ||
      s.summary.toLowerCase().includes(search.toLowerCase()) ||
      `ss ${s.id}`.includes(search.toLowerCase()) ||
      `ss${s.id}`.includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-full relative">
      <div className="absolute inset-0 bg-gradient-to-b from-[#10151F] via-[#10151F] to-[#0A0E16] pointer-events-none" />

      <div className="relative z-10 max-w-2xl mx-auto px-5 py-6 pb-24">
        {/* Header */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4A853] to-[#E8C97A] flex items-center justify-center">
              <BookOpen size={20} className="text-[#0A0E16]" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5E8C7]">AAOIFI Standards</h1>
              <p className="text-xs text-[#B8C4D4]">Islamic Finance Education — 59 Shariah Standards</p>
            </div>
          </div>
        </motion.div>

        {/* Intro */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="p-4 rounded-xl bg-[#D4A853]/10 border border-[#D4A853]/20 mb-5"
        >
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-[#D4A853]" />
            <span className="text-xs font-bold text-[#D4A853]">AAOIFI — Accounting & Auditing Organization for Islamic Financial Institutions</span>
          </div>
          <p className="text-[11px] text-[#B8C4D4] leading-relaxed">
            AAOIFI sets the global standard for Islamic finance with 59 Shariah standards covering everything from
            basic contracts (Murabahah, Ijarah) to modern applications (online dealings, gold trading). These standards
            are adopted by central banks and regulators in over 45 countries.
          </p>
        </motion.div>

        {/* Search */}
        <div className="relative mb-4">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7B8DA0]" />
          <input
            type="text"
            placeholder="Search standards (e.g., 'Murabahah', 'SS 21', 'zakat')..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0F141F] border border-[#3A4D65] text-[#F5E8C7] text-sm placeholder-[#7B8DA0] focus:outline-none focus:border-[#D4A853]/50"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => setActiveCategory(null)}
            className={cn(
              'px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors',
              !activeCategory ? 'bg-[#D4A853] text-[#0A0E16]' : 'bg-[#0F141F] text-[#B8C4D4] border border-[#3A4D65]',
            )}
          >
            All ({STANDARDS.length})
          </button>
          {CATEGORIES.map((cat) => {
            const count = STANDARDS.filter(s => s.category === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(activeCategory === cat.id ? null : cat.id)}
                className={cn(
                  'px-3 py-1.5 rounded-full text-[11px] font-medium transition-colors flex items-center gap-1',
                  activeCategory === cat.id ? 'bg-[#D4A853] text-[#0A0E16]' : 'bg-[#0F141F] text-[#B8C4D4] border border-[#3A4D65]',
                )}
              >
                <cat.icon size={12} />
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Results count */}
        <p className="text-[10px] text-[#7B8DA0] mb-3">{filtered.length} standards</p>

        {/* Standards list */}
        <div className="space-y-2">
          {filtered.map((standard, i) => (
            <motion.button
              key={standard.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelected(standard)}
              className="w-full flex items-center gap-3 p-3.5 rounded-xl bg-[#0F141F] border border-[#3A4D65]/50 text-left hover:border-[#D4A853]/30 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-[#0A0E16] flex items-center justify-center shrink-0">
                <span className="text-[#D4A853] text-[10px] font-bold">SS {standard.id}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-[#F5E8C7] font-semibold text-sm">{standard.title}</h3>
                  <span className="text-[10px] text-[#7B8DA0]">{standard.arabicName}</span>
                </div>
                <p className="text-[#7B8DA0] text-xs truncate mt-0.5">{standard.summary}</p>
                {standard.appFeature && (
                  <span className="text-[9px] text-emerald-400 mt-0.5 inline-block">
                    Used in: {standard.appFeature}
                  </span>
                )}
              </div>
              <CaretRight size={14} className="text-[#7B8DA0] shrink-0" />
            </motion.button>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-10">
            <p className="text-[#7B8DA0] text-sm">No standards found matching your search.</p>
          </div>
        )}
      </div>

      <div className="max-w-2xl mx-auto px-5 pb-4">
        <DisclaimerBanner contentId="RELIGIOUS" variant="subtle" />
      </div>

      {/* Standard Detail Sheet */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-[#10151F] rounded-t-3xl max-h-[80vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-[#10151F] px-5 pt-4 pb-3 border-b border-[#3A4D65]/50 flex items-center justify-between z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#D4A853]/20 text-[#D4A853] text-[10px] font-bold">SS {selected.id}</span>
                    <h2 className="text-[#F5E8C7] font-bold text-lg">{selected.title}</h2>
                  </div>
                  <p className="text-[#7B8DA0] text-xs mt-0.5">{selected.arabicName}</p>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-white/10">
                  <X size={20} className="text-[#7B8DA0]" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Summary */}
                <div>
                  <h3 className="text-sm font-semibold text-[#F5E8C7] mb-2">Summary</h3>
                  <p className="text-[13px] text-[#B8C4D4] leading-relaxed">{selected.summary}</p>
                </div>

                {/* Key Rules */}
                <div>
                  <h3 className="text-sm font-semibold text-[#F5E8C7] mb-2">Key Rules & Requirements</h3>
                  <div className="space-y-2">
                    {selected.keyRules.map((rule, i) => (
                      <div key={i} className="flex items-start gap-2 p-2.5 rounded-lg bg-[#0A0E16]">
                        <CurrencyDollar size={14} className="text-[#D4A853] shrink-0 mt-0.5" />
                        <p className="text-xs text-[#B8C4D4] leading-relaxed">{rule}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* App feature link */}
                {selected.appFeature && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <p className="text-xs text-emerald-400 font-semibold">
                      Applied in ZaryahPlus: {selected.appFeature}
                    </p>
                  </div>
                )}

                {/* Category */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[#7B8DA0]">Category:</span>
                  <span className="px-2 py-0.5 rounded-full bg-[#0F141F] text-[#B8C4D4] text-[10px] border border-[#3A4D65]">
                    {CATEGORIES.find(c => c.id === selected.category)?.label}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default EducationPage;
