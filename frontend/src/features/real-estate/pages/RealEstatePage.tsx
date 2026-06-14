/**
 * Real Estate Page
 * Islamic property investment hub with listings, investment calculator,
 * property details, and Shariah-compliant financing info
 * Converted from: real_estate_home_page.dart + property_listings_page.dart +
 *   investment_calculator_page.dart + property_detail_page.dart
 */

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DisclaimerBanner } from '@/components/shared';
import {
  Buildings,
  Calculator,
  MapPin,
  TrendUp,
  MagnifyingGlass,
  X,
  CurrencyDollar,
  House,
  Car,
  Stack,
  Bathtub,
  Bed,
  SealCheck,
  CalendarDots,
  Phone,
  Star,
  Percent,
} from '@phosphor-icons/react';

// ── Property data ──────────────────────────────────────────────

interface Property {
  id: string;
  title: string;
  type: string;
  location: string;
  price: string;
  priceNum: number;
  area: string;
  bedrooms: number;
  bathrooms: number;
  parking: number;
  floor: string;
  description: string;
  amenities: string[];
  financing: { name: string; standard: string; desc: string }[];
  lat: number;
  lon: number;
}

const PROPERTIES: Property[] = [
  {
    id: 'p1', title: 'Luxury Apartment - Marina View', type: 'Apartment', location: 'Dubai Marina, UAE',
    price: 'AED 2,500,000', priceNum: 2500000, area: '1,800 sqft', bedrooms: 3, bathrooms: 2, parking: 1, floor: '15th',
    description: 'Premium waterfront apartment with panoramic marina views, modern finishes, and world-class amenities.',
    amenities: ['Swimming Pool', 'Gym', 'Prayer Hall', 'Parking', 'Security'],
    financing: [
      { name: 'Musharakah', standard: 'AAOIFI SS 12', desc: 'Diminishing partnership — bank and buyer co-own; buyer gradually purchases bank\'s share' },
      { name: 'Ijarah', standard: 'AAOIFI SS 9', desc: 'Lease-to-own — bank buys property and leases to buyer with transfer at end of term' },
      { name: 'Murabahah', standard: 'AAOIFI SS 8', desc: 'Cost-plus sale — bank purchases and resells at disclosed markup in installments' },
    ], lat: 25.0801, lon: 55.1402,
  },
  {
    id: 'p2', title: 'Commercial Office Space', type: 'Commercial', location: 'DIFC, Dubai',
    price: 'AED 4,200,000', priceNum: 4200000, area: '3,200 sqft', bedrooms: 0, bathrooms: 2, parking: 3, floor: '8th',
    description: 'Premium Grade-A office space in the financial district with state-of-the-art facilities.',
    amenities: ['Meeting Rooms', 'Business Center', 'Parking', 'Reception'],
    financing: [
      { name: 'Musharakah', standard: 'AAOIFI SS 12', desc: 'Joint venture — partners co-invest and share profits per agreed ratio' },
      { name: 'Murabahah', standard: 'AAOIFI SS 8', desc: 'Cost-plus sale — transparent markup on original cost' },
    ], lat: 25.2131, lon: 55.2797,
  },
  {
    id: 'p3', title: 'Family Villa - Arabian Style', type: 'Villa', location: 'Al Barsha, Dubai',
    price: 'AED 5,800,000', priceNum: 5800000, area: '4,500 sqft', bedrooms: 5, bathrooms: 4, parking: 2, floor: 'G+1',
    description: 'Spacious family villa with traditional Arabian architecture, private garden, and prayer room.',
    amenities: ['Private Garden', 'Prayer Room', 'Maid\'s Room', 'Pool', 'BBQ Area'],
    financing: [
      { name: 'Musharakah', standard: 'AAOIFI SS 12', desc: 'Diminishing partnership — gradual ownership transfer to buyer' },
      { name: 'Ijarah', standard: 'AAOIFI SS 9', desc: 'Lease-to-own — rental payments with ownership transfer at maturity' },
      { name: 'Murabahah', standard: 'AAOIFI SS 8', desc: 'Cost-plus sale — fixed installments with disclosed profit margin' },
    ], lat: 25.1123, lon: 55.2004,
  },
  {
    id: 'p4', title: 'Student Housing Complex', type: 'Residential', location: 'Knowledge Village, Dubai',
    price: 'AED 850,000', priceNum: 850000, area: '600 sqft', bedrooms: 1, bathrooms: 1, parking: 0, floor: '3rd',
    description: 'Ideal investment property near major universities with high rental yield potential.',
    amenities: ['Study Rooms', 'Laundry', 'Common Area', 'WiFi'],
    financing: [
      { name: 'Murabahah', standard: 'AAOIFI SS 8', desc: 'Cost-plus sale — ideal for smaller purchases with fixed payments' },
      { name: 'Ijarah', standard: 'AAOIFI SS 9', desc: 'Lease-to-own — lower upfront commitment with rental structure' },
    ], lat: 25.1002, lon: 55.1607,
  },
  {
    id: 'p5', title: 'Beachfront Penthouse', type: 'Apartment', location: 'Palm Jumeirah, Dubai',
    price: 'AED 12,000,000', priceNum: 12000000, area: '6,200 sqft', bedrooms: 4, bathrooms: 5, parking: 3, floor: '25th',
    description: 'Ultra-luxury penthouse with private beach access, panoramic sea views, and smart home technology.',
    amenities: ['Private Beach', 'Infinity Pool', 'Cinema Room', 'Smart Home', 'Concierge'],
    financing: [
      { name: 'Musharakah', standard: 'AAOIFI SS 12', desc: 'Diminishing partnership — joint ownership ideal for high-value properties' },
      { name: 'Ijarah', standard: 'AAOIFI SS 9', desc: 'Lease-to-own — structured rental with full ownership at end' },
    ], lat: 25.1124, lon: 55.1390,
  },
];

// ── Calculator benchmarks ──────────────────────────────────────────────

const CITY_BENCHMARKS: Record<string, { rentalYield: number; appreciation: number }> = {
  'Bangalore': { rentalYield: 3.5, appreciation: 7 },
  'Mumbai': { rentalYield: 2.5, appreciation: 5 },
  'Delhi': { rentalYield: 3.0, appreciation: 6 },
  'Hyderabad': { rentalYield: 4.0, appreciation: 8 },
  'Dubai': { rentalYield: 6.0, appreciation: 5 },
};

type ViewMode = 'listings' | 'calculator';

export function RealEstatePage() {
  const [view, setView] = useState<ViewMode>('listings');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

  // Calculator state
  const [calcPrice, setCalcPrice] = useState('');
  const [calcDownPayment, setCalcDownPayment] = useState('20');
  const [calcCity, setCalcCity] = useState('Dubai');
  const [showCalcResults, setShowCalcResults] = useState(false);

  const filteredProperties = useMemo(() => {
    if (!searchQuery) return PROPERTIES;
    const q = searchQuery.toLowerCase();
    return PROPERTIES.filter(
      (p) => p.title.toLowerCase().includes(q) || p.location.toLowerCase().includes(q) || p.type.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const calcResults = useMemo(() => {
    const price = parseFloat(calcPrice) || 0;
    const downPct = parseFloat(calcDownPayment) || 20;
    const bench = CITY_BENCHMARKS[calcCity] || { rentalYield: 5, appreciation: 5 };
    const downPaymentAmount = price * (downPct / 100);
    const financed = price - downPaymentAmount;
    const annualRent = price * (bench.rentalYield / 100);
    const cashOnCash = downPaymentAmount > 0 ? ((annualRent / downPaymentAmount) * 100) : 0;
    const fiveYearValue = price * Math.pow(1 + bench.appreciation / 100, 5);
    return { downPaymentAmount, financed, annualRent, cashOnCash, fiveYearValue, rentalYield: bench.rentalYield, appreciation: bench.appreciation };
  }, [calcPrice, calcDownPayment, calcCity]);

  return (
    <div className="min-h-screen pb-8">
      {/* Hero Header — Purple/Pink theme */}
      <div className="relative overflow-hidden rounded-b-3xl mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/25 via-[#10151F] to-[#161D2C]" />
        <div className="relative px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
              <Buildings size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5E8C7]">Real Estate</h1>
              <p className="text-sm text-[#C9C0A8]">AAOIFI SS 8 / SS 9 / SS 12 Compliant</p>
            </div>
            <span className="ml-auto px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium border border-emerald-500/30">
              <SealCheck size={12} className="inline mr-0.5" />Halal
            </span>
          </div>
        </div>
      </div>

      {/* Tab Pills */}
      <div className="px-4 mb-5">
        <div className="flex bg-[#10151F] rounded-xl p-1">
          {[
            { id: 'listings' as const, label: 'Properties', icon: House },
            { id: 'calculator' as const, label: 'Calculator', icon: Calculator },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                view === tab.id
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

      {/* ── Listings View ── */}
      {view === 'listings' && (
        <div className="px-4">
          {/* Search */}
          <div className="relative mb-4">
            <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7363]" />
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm placeholder-[#7A7363] focus:outline-none focus:border-purple-500/50"
            />
          </div>

          <p className="text-[#7A7363] text-xs mb-3">{filteredProperties.length} properties available</p>

          {/* Property Cards */}
          <div className="space-y-3">
            {filteredProperties.map((p, i) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => setSelectedProperty(p)}
                className="w-full p-4 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 text-left hover:border-purple-500/30 transition-colors"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[#F5E8C7] font-semibold text-sm truncate">{p.title}</h3>
                    <p className="text-[#7A7363] text-xs flex items-center gap-1 mt-0.5">
                      <MapPin size={12} />{p.location}
                    </p>
                  </div>
                  <span className="text-[#D4A853] font-bold text-sm shrink-0 ml-2">{p.price}</span>
                </div>
                <div className="flex items-center gap-3 text-[#7A7363] text-xs">
                  <span className="flex items-center gap-1"><House size={12} />{p.type}</span>
                  <span className="flex items-center gap-1"><Stack size={12} />{p.area}</span>
                  {p.bedrooms > 0 && <span className="flex items-center gap-1"><Bed size={12} />{p.bedrooms} BR</span>}
                </div>
                <div className="flex gap-1.5 mt-2 flex-wrap">
                  {p.financing.map((f) => (
                    <span key={f.name} className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] border border-emerald-500/20">
                      {f.name}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* ── Calculator View ── */}
      {view === 'calculator' && (
        <div className="px-4 space-y-4">
          <div className="p-5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50">
            <h3 className="text-[#F5E8C7] font-semibold mb-1">Investment Calculator</h3>
            <p className="text-[#7A7363] text-xs mb-4">Returns based on Shariah-compliant structures (AAOIFI SS 9 Ijarah / SS 12 Musharakah)</p>

            <div className="space-y-4">
              <div>
                <label htmlFor="realestatepage-fld-1" className="text-[#C9C0A8] text-xs mb-1.5 block">Property Price</label>
                <div className="relative">
                  <CurrencyDollar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7363]" />
                  <input id="realestatepage-fld-1"
                    type="number"
                    value={calcPrice}
                    onChange={(e) => { setCalcPrice(e.target.value); setShowCalcResults(false); }}
                    placeholder="Enter property price"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm placeholder-[#7A7363] focus:outline-none focus:border-purple-500/50"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="realestatepage-fld-2" className="text-[#C9C0A8] text-xs mb-1.5 block">Down Payment: {calcDownPayment}%</label>
                <input id="realestatepage-fld-2"
                  type="range"
                  min="5"
                  max="100"
                  value={calcDownPayment}
                  onChange={(e) => { setCalcDownPayment(e.target.value); setShowCalcResults(false); }}
                  className="w-full accent-[#D4A853]"
                />
              </div>

              <div>
                <label htmlFor="realestatepage-fld-3" className="text-[#C9C0A8] text-xs mb-1.5 block">City</label>
                <select id="realestatepage-fld-3"
                  value={calcCity}
                  onChange={(e) => { setCalcCity(e.target.value); setShowCalcResults(false); }}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm focus:outline-none focus:border-purple-500/50"
                >
                  {Object.keys(CITY_BENCHMARKS).map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowCalcResults(true)}
                disabled={!calcPrice}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
              >
                Calculate Returns
              </button>
            </div>
          </div>

          {showCalcResults && calcPrice && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-xl bg-[#10151F] border border-[#D4A853]/20 space-y-4"
            >
              <h3 className="text-[#F5E8C7] font-semibold">Investment Analysis</h3>
              {[
                { label: 'Down Payment', value: `${Number(calcResults.downPaymentAmount).toLocaleString()}`, icon: CurrencyDollar },
                { label: 'Annual Rent (est.)', value: `${Number(calcResults.annualRent).toLocaleString()}`, icon: House },
                { label: 'Cash-on-Cash Return', value: `${calcResults.cashOnCash.toFixed(1)}%`, icon: Percent },
                { label: 'Rental Yield', value: `${calcResults.rentalYield}%`, icon: TrendUp },
                { label: '5-Year Projected Value', value: `${Number(Math.round(calcResults.fiveYearValue)).toLocaleString()}`, icon: Star },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3 py-2 border-b border-[rgba(212,168,83,0.2)]/30 last:border-0">
                  <item.icon size={16} className="text-[#D4A853] shrink-0" />
                  <span className="text-[#C9C0A8] text-sm flex-1">{item.label}</span>
                  <span className="text-[#F5E8C7] font-semibold text-sm">{item.value}</span>
                </div>
              ))}
            </motion.div>
          )}
        </div>
      )}

      <div className="px-4 mb-4">
        <DisclaimerBanner contentId="FINANCIAL" variant="banner" />
      </div>

      {/* Property Detail Sheet */}
      <AnimatePresence>
        {selectedProperty && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
            onClick={() => setSelectedProperty(null)}
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
                <h2 className="text-[#F5E8C7] font-bold text-lg truncate pr-4">{selectedProperty.title}</h2>
                <button onClick={() => setSelectedProperty(null)} className="p-1.5 rounded-lg hover:bg-white/10 shrink-0">
                  <X size={20} className="text-[#7A7363]" />
                </button>
              </div>

              <div className="p-5 space-y-5">
                {/* Price + Location */}
                <div>
                  <p className="text-2xl font-bold text-[#D4A853]">{selectedProperty.price}</p>
                  <p className="text-[#7A7363] text-sm flex items-center gap-1 mt-1">
                    <MapPin size={16} />{selectedProperty.location}
                  </p>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { icon: Stack, label: 'Area', value: selectedProperty.area },
                    { icon: Bed, label: 'Bedrooms', value: `${selectedProperty.bedrooms}` },
                    { icon: Bathtub, label: 'Bathrooms', value: `${selectedProperty.bathrooms}` },
                    { icon: Car, label: 'Parking', value: `${selectedProperty.parking}` },
                    { icon: Buildings, label: 'Floor', value: selectedProperty.floor },
                    { icon: House, label: 'Type', value: selectedProperty.type },
                  ].map((spec) => (
                    <div key={spec.label} className="p-3 rounded-xl bg-[#10151F] text-center">
                      <spec.icon size={16} className="text-[#D4A853] mx-auto mb-1" />
                      <p className="text-[#F5E8C7] text-xs font-semibold">{spec.value}</p>
                      <p className="text-[#7A7363] text-[10px]">{spec.label}</p>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <h3 className="text-[#F5E8C7] font-semibold text-sm mb-2">About</h3>
                  <p className="text-[#C9C0A8] text-sm leading-relaxed">{selectedProperty.description}</p>
                </div>

                {/* Islamic Financing — AAOIFI */}
                <div>
                  <h3 className="text-[#F5E8C7] font-semibold text-sm mb-2">Islamic Financing Options</h3>
                  <div className="space-y-2">
                    {selectedProperty.financing.map((f) => (
                      <div key={f.name} className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-emerald-400 text-sm font-semibold">{f.name}</span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#D4A853]/15 text-[#D4A853] font-medium">{f.standard}</span>
                        </div>
                        <p className="text-[#7A7363] text-xs leading-relaxed">{f.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Amenities */}
                <div>
                  <h3 className="text-[#F5E8C7] font-semibold text-sm mb-2">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedProperty.amenities.map((a) => (
                      <span key={a} className="px-3 py-1 rounded-full bg-[#10151F] text-[#C9C0A8] text-xs border border-[rgba(212,168,83,0.2)]/50">
                        {a}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-bold text-sm">
                    <CalendarDots size={16} />Schedule Visit
                  </button>
                  <button className="flex items-center justify-center gap-2 py-3 rounded-xl bg-[#D4A853]/15 border border-[#D4A853]/30 text-[#D4A853] font-bold text-sm">
                    <Phone size={16} />Contact Agent
                  </button>
                </div>

                {/* Directions */}
                <button
                  onClick={() => window.open(`https://www.google.com/maps?q=${selectedProperty.lat},${selectedProperty.lon}`, '_blank')}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 text-[#C9C0A8] text-sm hover:border-[#D4A853]/30"
                >
                  <MapPin size={16} />View on Google Maps
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default RealEstatePage;
