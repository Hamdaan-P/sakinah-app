/**
 * Islamic Banking Page
 * Home page for Islamic finance banking with account summary, quick actions,
 * financial products, and educational content
 * Converted from: islamic_bank_home_page.dart + product_pages.dart + sub-pages
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DisclaimerBanner } from '@/components/shared';
import {
  Buildings,
  CreditCard,
  ShieldCheck,
  Percent,
  HandCoins,
  Scales,
  Eye,
  Handshake,
  SealCheck,
  CaretRight,
  X,
  Calculator,
} from '@phosphor-icons/react';
import {
  calculateMurabahah,
  calculateIjarah,
  calculateMusharakah,
  calculateMudarabah,
} from '../types/islamicFinanceCalculators';
import type {
  MurabahahInput,
  IjarahInput,
  MusharakahInput,
  MudarabahInput,
} from '../types/islamicFinanceCalculators';

// ── Product data ──────────────────────────────────────────────

const PRODUCTS = [
  {
    id: 'murabaha',
    title: 'Murabahah',
    subtitle: 'Cost-Plus Financing (AAOIFI SS 8)',
    description: 'Per AAOIFI SS 8: The bank purchases an asset at cost and resells to the client at cost plus a disclosed profit margin. The profit margin is fixed at contract signing — no floating rates. Payment may be deferred (installments) or lump-sum.',
    features: [
      'Profit margin must be disclosed and fixed at contract time',
      'Asset must be in bank\'s possession before sale (constructive or actual)',
      'No penalty for late payment (riba prohibition) — only actual loss compensation',
      'Binding promise (wa\'d) from client to purchase after bank acquires asset',
    ],
    gradient: 'from-blue-500/20 to-blue-700/20',
    iconBg: 'bg-blue-500/15',
    iconColor: 'text-blue-400',
    hasCalculator: true,
  },
  {
    id: 'musharaka',
    title: 'Musharakah',
    subtitle: 'Partnership Financing (AAOIFI SS 12)',
    description: 'Per AAOIFI SS 12: Both parties contribute capital to a joint venture. Profits are shared per agreed ratio (can differ from capital ratio). Losses are strictly proportional to capital contribution. Diminishing Musharakah allows gradual buyout of the bank\'s share.',
    features: [
      'Profit ratio agreed at contract — can differ from capital ratio',
      'Losses borne strictly in proportion to capital contribution',
      'Diminishing (Mutanaqisah) variant: client buys out bank\'s share over time',
      'All partners may participate in management or appoint a managing partner',
    ],
    gradient: 'from-emerald-500/20 to-emerald-700/20',
    iconBg: 'bg-emerald-500/15',
    iconColor: 'text-emerald-400',
    hasCalculator: true,
  },
  {
    id: 'ijara',
    title: 'Ijarah',
    subtitle: 'Islamic Lease (AAOIFI SS 9)',
    description: 'Per AAOIFI SS 9: The bank purchases the asset and leases it to the client. The bank retains ownership and bears major maintenance costs. Ijarah Muntahia Bittamleek (IMB): ownership transfers at end of lease via gift, sale, or gradual transfer.',
    features: [
      'Bank (lessor) bears major maintenance and insurance costs',
      'Rent can be fixed or variable (linked to a benchmark, not interest)',
      'Client may not sub-lease without bank\'s permission',
      'Ownership transfer options: gift, token sale, or gradual transfer',
    ],
    gradient: 'from-purple-500/20 to-purple-700/20',
    iconBg: 'bg-purple-500/15',
    iconColor: 'text-purple-400',
    hasCalculator: true,
  },
  {
    id: 'mudarabah',
    title: 'Mudarabah',
    subtitle: 'Profit-Sharing Investment (AAOIFI SS 13)',
    description: 'Per AAOIFI SS 13: Rabb-ul-Maal (capital provider) provides funds, Mudarib (entrepreneur) provides labor and expertise. Profit shared per agreed ratio. Capital losses borne entirely by the investor (unless Mudarib was negligent or breached terms).',
    features: [
      'Capital provider bears financial loss; Mudarib loses effort/time',
      'Mudarib cannot guarantee capital or minimum return (would invalidate contract)',
      'Profit ratio must be a percentage — not a lump sum',
      'Mudarib may not mix personal funds without permission (unless agreed)',
    ],
    gradient: 'from-amber-500/20 to-amber-700/20',
    iconBg: 'bg-amber-500/15',
    iconColor: 'text-amber-400',
    hasCalculator: true,
  },
];


const BANKING_FEATURES = [
  { icon: Percent, title: 'Zero Interest', desc: 'All transactions are interest-free (riba-free), following Shariah principles' },
  { icon: Handshake, title: 'Profit Sharing', desc: 'Fair profit and loss sharing arrangements between bank and client' },
  { icon: ShieldCheck, title: 'Asset-Backed', desc: 'All financial products are backed by tangible assets and real economic activity' },
  { icon: Scales, title: 'Ethical Investing', desc: 'Investments screened for Shariah compliance — no alcohol, gambling, or harmful industries' },
  { icon: Eye, title: 'Transparency', desc: 'Full disclosure of profit margins, fees, and terms in every transaction' },
  { icon: HandCoins, title: 'Risk Sharing', desc: 'Equitable risk distribution — the bank shares in both profits and losses' },
];

type SheetType = 'product' | null;

export function IslamicBankingPage() {
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [selectedProduct, setSelectedProduct] = useState<typeof PRODUCTS[number] | null>(null);

  const openProduct = (product: typeof PRODUCTS[number]) => {
    setSelectedProduct(product);
    setActiveSheet('product');
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Premium Header */}
      <div className="relative overflow-hidden rounded-b-3xl mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-[#D4A853]/25 via-[#10151F] to-[#161D2C]" />
        <div className="relative px-6 pt-8 pb-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4A853] to-[#E8C97A] flex items-center justify-center">
                <Buildings size={24} className="text-[#10151F]" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-[#F5E8C7]">Islamic Banking</h1>
                <p className="text-sm text-[#C9C0A8]">Shariah-Compliant Finance</p>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30">
              <SealCheck size={12} className="inline mr-1" />
              Halal Certified
            </span>
          </div>
        </div>
      </div>

      {/* Financial Products */}
      <div className="px-4 mb-6">
        <h2 className="text-[#F5E8C7] font-semibold mb-3">Financial Products</h2>
        <div className="space-y-3">
          {PRODUCTS.map((product, i) => (
            <motion.button
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => openProduct(product)}
              className={`w-full flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r ${product.gradient} border border-[rgba(212,168,83,0.2)]/50 text-left hover:border-[#D4A853]/30 transition-colors`}
            >
              <div className={`w-11 h-11 rounded-xl ${product.iconBg} flex items-center justify-center shrink-0`}>
                <CreditCard size={20} className={product.iconColor} />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[#F5E8C7] font-semibold text-sm">{product.title}</h3>
                <p className="text-[#7A7363] text-xs">{product.subtitle}</p>
              </div>
              <CaretRight size={16} className="text-[#7A7363] shrink-0" />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Why Islamic Banking */}
      <div className="px-4 mb-6">
        <h2 className="text-[#F5E8C7] font-semibold mb-3">Why Islamic Banking?</h2>
        <div className="grid grid-cols-2 gap-3">
          {BANKING_FEATURES.map((f, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 + i * 0.06 }}
              className="p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50"
            >
              <f.icon size={20} className="text-[#D4A853] mb-2" />
              <h3 className="text-[#F5E8C7] font-semibold text-xs mb-1">{f.title}</h3>
              <p className="text-[#7A7363] text-[10px] leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="px-4 mb-4">
        <DisclaimerBanner contentId="FINANCIAL" variant="banner" />
      </div>

      {/* Sheets */}
      <AnimatePresence>
        {activeSheet && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
            onClick={() => { setActiveSheet(null); setSelectedProduct(null); }}
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
                  {selectedProduct?.title}
                </h2>
                <button onClick={() => { setActiveSheet(null); setSelectedProduct(null); }} className="p-1.5 rounded-lg hover:bg-white/10">
                  <X size={20} className="text-[#7A7363]" />
                </button>
              </div>

              <div className="p-5">
                {/* Product detail */}
                {selectedProduct && (
                  <div className="space-y-4">
                    <p className="text-[#B8C4D4] text-sm leading-relaxed">{selectedProduct.description}</p>
                    <div>
                      <h3 className="text-[#F5E8C7] font-semibold text-sm mb-2">AAOIFI Requirements</h3>
                      {selectedProduct.features.map((f, i) => (
                        <div key={i} className="flex items-start gap-2 py-1.5">
                          <SealCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-[#B8C4D4] text-xs leading-relaxed">{f}</span>
                        </div>
                      ))}
                    </div>
                    {selectedProduct.hasCalculator && (
                      <ProductCalculator productId={selectedProduct.id} />
                    )}
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

// ==================== Product Calculator ====================

function ProductCalculator({ productId }: { productId: string }) {
  switch (productId) {
    case 'murabaha': return <MurabahahCalc />;
    case 'ijara': return <IjarahCalc />;
    case 'musharaka': return <MusharakahCalc />;
    case 'mudarabah': return <MudarabahCalc />;
    default: return null;
  }
}

function CalcField({ label, value, onChange, prefix }: { label: string; value: number; onChange: (v: number) => void; prefix?: string }) {
  return (
    <div>
      <label className="text-[10px] text-[#7B8DA0] mb-1 block">{label}</label>
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-[#7B8DA0]">{prefix}</span>}
        <input
          type="number"
          inputMode="decimal"
          value={value || ''}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          placeholder="0"
          className={`w-full py-2 rounded-lg text-sm text-[#F5E8C7] bg-[#0A0E16] border border-[#3A4D65] focus:border-[#D4A853]/50 focus:outline-none ${prefix ? 'pl-7 pr-3' : 'px-3'}`}
        />
      </div>
    </div>
  );
}

function CalcResult({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex justify-between py-1">
      <span className="text-[11px] text-[#7B8DA0]">{label}</span>
      <span className={`text-[12px] font-semibold font-mono ${highlight ? 'text-[#D4A853]' : 'text-[#F5E8C7]'}`}>{value}</span>
    </div>
  );
}

const fmt = (n: number) => n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function MurabahahCalc() {
  const [input, setInput] = useState<MurabahahInput>({ costPrice: 100000, profitMarginPct: 8, tenureMonths: 36 });
  const result = calculateMurabahah(input);

  return (
    <div className="p-4 rounded-xl bg-[#0A0E16] border border-[#3A4D65]">
      <div className="flex items-center gap-2 mb-3">
        <Calculator size={16} className="text-blue-400" />
        <span className="text-sm font-semibold text-[#F5E8C7]">Murabahah Calculator</span>
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <CalcField label="Asset Cost" value={input.costPrice} onChange={(v) => setInput({ ...input, costPrice: v })} prefix="$" />
        <CalcField label="Profit Margin %" value={input.profitMarginPct} onChange={(v) => setInput({ ...input, profitMarginPct: v })} />
        <CalcField label="Tenure (months)" value={input.tenureMonths} onChange={(v) => setInput({ ...input, tenureMonths: v })} />
      </div>
      <div className="border-t border-[#3A4D65] pt-2 space-y-0.5">
        <CalcResult label="Cost Price" value={`$${fmt(result.costPrice)}`} />
        <CalcResult label="Bank Profit" value={`$${fmt(result.profitAmount)}`} />
        <CalcResult label="Total Price" value={`$${fmt(result.totalPrice)}`} highlight />
        <CalcResult label="Monthly Payment" value={`$${fmt(result.monthlyPayment)}`} highlight />
        <CalcResult label="Effective Annual Rate" value={`${result.effectiveAnnualRate.toFixed(2)}%`} />
      </div>
    </div>
  );
}

function IjarahCalc() {
  const [input, setInput] = useState<IjarahInput>({ assetCost: 200000, downPayment: 40000, residualValue: 0, profitRatePct: 4, tenureMonths: 60 });
  const result = calculateIjarah(input);

  return (
    <div className="p-4 rounded-xl bg-[#0A0E16] border border-[#3A4D65]">
      <div className="flex items-center gap-2 mb-3">
        <Calculator size={16} className="text-purple-400" />
        <span className="text-sm font-semibold text-[#F5E8C7]">Ijarah Calculator</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <CalcField label="Asset Cost" value={input.assetCost} onChange={(v) => setInput({ ...input, assetCost: v })} prefix="$" />
        <CalcField label="Down Payment" value={input.downPayment} onChange={(v) => setInput({ ...input, downPayment: v })} prefix="$" />
        <CalcField label="Residual Value" value={input.residualValue} onChange={(v) => setInput({ ...input, residualValue: v })} prefix="$" />
        <CalcField label="Annual Rate %" value={input.profitRatePct} onChange={(v) => setInput({ ...input, profitRatePct: v })} />
        <CalcField label="Tenure (months)" value={input.tenureMonths} onChange={(v) => setInput({ ...input, tenureMonths: v })} />
      </div>
      <div className="border-t border-[#3A4D65] pt-2 space-y-0.5">
        <CalcResult label="Financed Amount" value={`$${fmt(result.financedAmount)}`} />
        <CalcResult label="Total Profit (Rent)" value={`$${fmt(result.totalProfit)}`} />
        <CalcResult label="Monthly Rent" value={`$${fmt(result.monthlyRent)}`} highlight />
        <CalcResult label="Total Cost" value={`$${fmt(result.totalCost)}`} highlight />
      </div>
    </div>
  );
}

function MusharakahCalc() {
  const [input, setInput] = useState<MusharakahInput>({ totalProjectCost: 500000, clientContribution: 200000, expectedAnnualProfitPct: 15, clientProfitSharePct: 60, tenureYears: 5, isDiminishing: true });
  const result = calculateMusharakah(input);

  return (
    <div className="p-4 rounded-xl bg-[#0A0E16] border border-[#3A4D65]">
      <div className="flex items-center gap-2 mb-3">
        <Calculator size={16} className="text-emerald-400" />
        <span className="text-sm font-semibold text-[#F5E8C7]">Musharakah Calculator</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <CalcField label="Total Project Cost" value={input.totalProjectCost} onChange={(v) => setInput({ ...input, totalProjectCost: v })} prefix="$" />
        <CalcField label="Your Contribution" value={input.clientContribution} onChange={(v) => setInput({ ...input, clientContribution: v })} prefix="$" />
        <CalcField label="Expected Annual Profit %" value={input.expectedAnnualProfitPct} onChange={(v) => setInput({ ...input, expectedAnnualProfitPct: v })} />
        <CalcField label="Your Profit Share %" value={input.clientProfitSharePct} onChange={(v) => setInput({ ...input, clientProfitSharePct: v })} />
        <CalcField label="Tenure (years)" value={input.tenureYears} onChange={(v) => setInput({ ...input, tenureYears: v })} />
      </div>
      <div className="mb-3">
        <button
          onClick={() => setInput({ ...input, isDiminishing: !input.isDiminishing })}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            input.isDiminishing ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-[#10151F] text-[#7B8DA0] border border-[#3A4D65]'
          }`}
        >
          {input.isDiminishing ? 'Diminishing (Mutanaqisah)' : 'Standard Partnership'}
        </button>
      </div>
      <div className="border-t border-[#3A4D65] pt-2 space-y-0.5">
        <CalcResult label="Bank Contribution" value={`$${fmt(result.bankContribution)}`} />
        <CalcResult label="Your Share" value={`${result.clientSharePct.toFixed(1)}%`} />
        <CalcResult label="Expected Annual Profit" value={`$${fmt(result.expectedAnnualProfit)}`} />
        <CalcResult label="Your Annual Profit" value={`$${fmt(result.clientAnnualProfit)}`} highlight />
        <CalcResult label="Bank Annual Profit" value={`$${fmt(result.bankAnnualProfit)}`} />
        {input.isDiminishing && (
          <>
            <CalcResult label="Annual Buyout Amount" value={`$${fmt(result.annualBuyoutAmount)}`} highlight />
            <CalcResult label="Total Buyout Cost" value={`$${fmt(result.totalBuyoutCost)}`} />
          </>
        )}
      </div>
    </div>
  );
}

function MudarabahCalc() {
  const [input, setInput] = useState<MudarabahInput>({ investmentAmount: 100000, expectedAnnualReturnPct: 12, mudaribProfitSharePct: 40, tenureMonths: 24 });
  const result = calculateMudarabah(input);

  return (
    <div className="p-4 rounded-xl bg-[#0A0E16] border border-[#3A4D65]">
      <div className="flex items-center gap-2 mb-3">
        <Calculator size={16} className="text-amber-400" />
        <span className="text-sm font-semibold text-[#F5E8C7]">Mudarabah Calculator</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mb-3">
        <CalcField label="Investment Amount" value={input.investmentAmount} onChange={(v) => setInput({ ...input, investmentAmount: v })} prefix="$" />
        <CalcField label="Expected Annual Return %" value={input.expectedAnnualReturnPct} onChange={(v) => setInput({ ...input, expectedAnnualReturnPct: v })} />
        <CalcField label="Mudarib Profit Share %" value={input.mudaribProfitSharePct} onChange={(v) => setInput({ ...input, mudaribProfitSharePct: v })} />
        <CalcField label="Tenure (months)" value={input.tenureMonths} onChange={(v) => setInput({ ...input, tenureMonths: v })} />
      </div>
      <div className="border-t border-[#3A4D65] pt-2 space-y-0.5">
        <CalcResult label="Expected Total Profit" value={`$${fmt(result.expectedTotalProfit)}`} />
        <CalcResult label="Your Profit (Investor)" value={`$${fmt(result.capitalProviderProfit)}`} highlight />
        <CalcResult label="Mudarib Profit" value={`$${fmt(result.mudaribProfit)}`} />
        <CalcResult label="Your Monthly Return" value={`$${fmt(result.capitalProviderMonthlyReturn)}`} highlight />
        <CalcResult label="Effective Annual Return" value={`${result.effectiveReturnForProvider.toFixed(2)}%`} />
      </div>
      <p className="text-[9px] text-[#7B8DA0] mt-2">
        Note: Returns are projected, not guaranteed. Per AAOIFI SS 13, the Mudarib cannot guarantee capital or minimum return.
      </p>
    </div>
  );
}

export default IslamicBankingPage;
