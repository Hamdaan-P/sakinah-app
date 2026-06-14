/**
 * Halal Commerce Page
 * Commerce hub — services directory, classifieds, business listing,
 * professional listing
 * Converted from: halal_commerce_home_page.dart + services_hub_page.dart +
 *   classifieds_page.dart + list_business_page.dart + list_profession_page.dart
 */

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DisclaimerBanner } from '@/components/shared';
import { trackFeature } from '@/lib/analytics';
import {
  Bag,
  Briefcase,
  Storefront,
  Tag,
  MagnifyingGlass,
  Star,
  MapPin,
  SealCheck,
  X,
  Phone,
  Globe,
  Clock,
} from '@phosphor-icons/react';

// ── Data ──────────────────────────────────────────────

interface Service {
  id: string;
  name: string;
  category: string;
  description: string;
  rating: number;
  reviews: number;
  location: string;
  verified: boolean;
}

const SERVICES: Service[] = [
  { id: 's1', name: 'Al-Baraka Catering', category: 'Food & Dining', description: 'Premium halal catering for weddings, corporate events, and family gatherings.', rating: 4.8, reviews: 120, location: 'Dubai, UAE', verified: true },
  { id: 's2', name: 'Noor Financial Advisors', category: 'Finance', description: 'Shariah-compliant financial planning, investment advisory, and wealth management.', rating: 4.9, reviews: 85, location: 'London, UK', verified: true },
  { id: 's3', name: 'Barakah Hajj Tours', category: 'Travel', description: 'Premium Hajj and Umrah packages with scholar-led guidance and 5-star accommodation.', rating: 4.7, reviews: 200, location: 'Riyadh, KSA', verified: true },
  { id: 's4', name: 'Islamic Learning Center', category: 'Education', description: 'Online and in-person Islamic education courses for all ages and levels.', rating: 4.6, reviews: 150, location: 'Toronto, Canada', verified: false },
  { id: 's5', name: 'Halal Meat Express', category: 'Food & Dining', description: 'Farm-to-door certified halal meat delivery with premium quality cuts.', rating: 4.5, reviews: 90, location: 'New York, USA', verified: true },
  { id: 's6', name: 'Nikah Matrimony Services', category: 'Events', description: 'Professional Islamic matrimony matchmaking and event coordination services.', rating: 4.4, reviews: 65, location: 'Kuala Lumpur, MY', verified: false },
  { id: 's7', name: 'Muslim Tech Solutions', category: 'Technology', description: 'Web development and app solutions with a focus on Muslim community needs.', rating: 4.7, reviews: 45, location: 'Bangalore, India', verified: true },
  { id: 's8', name: 'Amanah Legal Consultants', category: 'Legal', description: 'Islamic law specialists providing legal consultancy on Shariah matters and business compliance.', rating: 4.8, reviews: 70, location: 'Dubai, UAE', verified: true },
];

const SERVICE_CATEGORIES = ['All', 'Food & Dining', 'Healthcare', 'Education', 'Finance', 'Legal', 'Technology', 'Travel', 'Events'];

interface Classified {
  id: string;
  title: string;
  price: string;
  condition: string;
  location: string;
  category: string;
}

const CLASSIFIEDS: Classified[] = [
  { id: 'cl1', title: 'Islamic Art Canvas Set', price: '₹3,500', condition: 'New', location: 'Mumbai', category: 'Islamic Items' },
  { id: 'cl2', title: 'Quran Stand (Wooden)', price: '₹1,200', condition: 'New', location: 'Delhi', category: 'Islamic Items' },
  { id: 'cl3', title: 'MacBook Pro 2023', price: '₹85,000', condition: 'Like New', location: 'Bangalore', category: 'Electronics' },
  { id: 'cl4', title: 'Toyota Camry 2020', price: '₹12,00,000', condition: 'Used', location: 'Hyderabad', category: 'Vehicles' },
  { id: 'cl5', title: 'Office Space (500 sqft)', price: '₹25,000/mo', condition: 'Available', location: 'Dubai', category: 'Property' },
  { id: 'cl6', title: 'Abaya Collection (5 pcs)', price: '₹8,000', condition: 'New', location: 'Jeddah', category: 'Clothing' },
];

type ViewType = 'services' | 'classifieds';
type SheetType = 'service-detail' | 'list-business' | 'list-profession' | null;

export function CommercePage() {
  useEffect(() => { trackFeature('commerce'); }, []);
  const [view, setView] = useState<ViewType>('services');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeSheet, setActiveSheet] = useState<SheetType>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  const filteredServices = useMemo(() => {
    let result = SERVICES;
    if (selectedCategory !== 'All') result = result.filter((s) => s.category === selectedCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter((s) => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
    }
    return result;
  }, [searchQuery, selectedCategory]);

  const filteredClassifieds = useMemo(() => {
    if (!searchQuery) return CLASSIFIEDS;
    const q = searchQuery.toLowerCase();
    return CLASSIFIEDS.filter((c) => c.title.toLowerCase().includes(q) || c.category.toLowerCase().includes(q));
  }, [searchQuery]);

  const openServiceDetail = (service: Service) => {
    setSelectedService(service);
    setActiveSheet('service-detail');
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Header */}
      <div className="relative overflow-hidden rounded-b-3xl mb-6">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-[#10151F] to-[#161D2C]" />
        <div className="relative px-6 pt-8 pb-6">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Bag size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#F5E8C7]">Halal Commerce</h1>
              <p className="text-sm text-[#C9C0A8]">Services & Marketplace</p>
            </div>
          </div>
        </div>
      </div>

      {/* List Your Business / Profession */}
      <div className="px-4 mb-5 grid grid-cols-2 gap-3">
        <button onClick={() => setActiveSheet('list-business')}
          className="p-3 rounded-xl bg-gradient-to-r from-blue-600/15 to-blue-800/15 border border-[rgba(212,168,83,0.2)]/50 text-left hover:border-blue-500/30">
          <Storefront size={20} className="text-blue-400 mb-1.5" />
          <h3 className="text-[#F5E8C7] font-semibold text-xs">List Your Business</h3>
          <p className="text-[#7A7363] text-[10px]">Register your halal business</p>
        </button>
        <button onClick={() => setActiveSheet('list-profession')}
          className="p-3 rounded-xl bg-gradient-to-r from-teal-600/15 to-teal-800/15 border border-[rgba(212,168,83,0.2)]/50 text-left hover:border-teal-500/30">
          <Briefcase size={20} className="text-teal-400 mb-1.5" />
          <h3 className="text-[#F5E8C7] font-semibold text-xs">List Your Profession</h3>
          <p className="text-[#7A7363] text-[10px]">Offer your professional services</p>
        </button>
      </div>

      {/* Tab Pills */}
      <div className="px-4 mb-4">
        <div className="flex bg-[#10151F] rounded-xl p-1">
          {[{ id: 'services' as const, label: 'Services', icon: Storefront }, { id: 'classifieds' as const, label: 'Classifieds', icon: Tag }].map((tab) => (
            <button key={tab.id} onClick={() => setView(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                view === tab.id ? 'bg-[#D4A853] text-[#10151F]' : 'text-[#C9C0A8] hover:text-[#F5E8C7]'
              }`}><tab.icon size={16} />{tab.label}</button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="px-4 mb-4">
        <div className="relative">
          <MagnifyingGlass size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#7A7363]" />
          <input type="text" placeholder={view === 'services' ? 'Search services...' : 'Search classifieds...'} value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm placeholder-[#7A7363] focus:outline-none focus:border-blue-500/50" />
        </div>
      </div>

      {/* ── Services View ── */}
      {view === 'services' && (
        <div className="px-4">
          {/* Category chips */}
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4">
            {SERVICE_CATEGORIES.map((cat) => (
              <button key={cat} onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  selectedCategory === cat ? 'bg-[#D4A853] text-[#10151F]' : 'bg-[#10151F] text-[#C9C0A8] border border-[rgba(212,168,83,0.2)]'
                }`}>{cat}</button>
            ))}
          </div>

          {/* Service cards */}
          <div className="grid grid-cols-2 gap-3">
            {filteredServices.map((service, i) => (
              <motion.button key={service.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                onClick={() => openServiceDetail(service)}
                className="p-3 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50 text-left hover:border-blue-500/30 transition-colors">
                <div className="flex items-center gap-1 mb-1.5">
                  <h3 className="text-[#F5E8C7] font-semibold text-xs truncate">{service.name}</h3>
                  {service.verified && <SealCheck size={12} className="text-blue-400 shrink-0" />}
                </div>
                <p className="text-[#7A7363] text-[10px] line-clamp-2 mb-2">{service.description}</p>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400 text-[10px] flex items-center gap-0.5"><Star size={10} />{service.rating}</span>
                  <span className="text-[#7A7363] text-[10px]">{service.reviews} reviews</span>
                </div>
                <p className="text-[#7A7363] text-[10px] flex items-center gap-0.5 mt-1"><MapPin size={10} />{service.location}</p>
              </motion.button>
            ))}
          </div>
        </div>
      )}

      {/* ── Classifieds View ── */}
      {view === 'classifieds' && (
        <div className="px-4 space-y-2">
          {filteredClassifieds.map((cl, i) => (
            <motion.div key={cl.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)]/50">
              <div className="w-12 h-12 rounded-lg bg-[#10151F] flex items-center justify-center shrink-0">
                <Tag size={20} className="text-[#D4A853]" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-[#F5E8C7] font-semibold text-sm truncate">{cl.title}</h3>
                <p className="text-[#7A7363] text-xs">{cl.category} • {cl.condition}</p>
                <p className="text-[#7A7363] text-xs flex items-center gap-0.5"><MapPin size={12} />{cl.location}</p>
              </div>
              <span className="text-[#D4A853] font-bold text-sm shrink-0">{cl.price}</span>
            </motion.div>
          ))}
        </div>
      )}

      <div className="px-4 pb-4">
        <DisclaimerBanner contentId="FINANCIAL" variant="subtle" />
      </div>

      {/* Sheets */}
      <AnimatePresence>
        {activeSheet && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end justify-center"
            onClick={() => { setActiveSheet(null); setSelectedService(null); }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
              onClick={(e) => e.stopPropagation()} className="w-full max-w-lg bg-[#10151F] rounded-t-3xl max-h-[80vh] overflow-y-auto">
              <div className="sticky top-0 bg-[#10151F] px-5 pt-4 pb-3 border-b border-[rgba(212,168,83,0.2)]/50 flex items-center justify-between z-10">
                <h2 className="text-[#F5E8C7] font-bold text-lg">
                  {activeSheet === 'service-detail' && selectedService?.name}
                  {activeSheet === 'list-business' && 'List Your Business'}
                  {activeSheet === 'list-profession' && 'List Your Profession'}
                </h2>
                <button onClick={() => { setActiveSheet(null); setSelectedService(null); }} className="p-1.5 rounded-lg hover:bg-white/10">
                  <X size={20} className="text-[#7A7363]" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {activeSheet === 'service-detail' && selectedService && (
                  <>
                    <div className="flex items-center gap-2 mb-2">
                      {selectedService.verified && <span className="px-2 py-0.5 rounded-full bg-blue-500/15 text-blue-400 text-xs border border-blue-500/20">Verified</span>}
                      <span className="px-2 py-0.5 rounded-full bg-[#D4A853]/15 text-[#D4A853] text-xs">{selectedService.category}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-amber-400 flex items-center gap-1"><Star size={16} />{selectedService.rating}</span>
                      <span className="text-[#7A7363] text-sm">{selectedService.reviews} reviews</span>
                      <span className="text-[#7A7363] text-sm flex items-center gap-1"><MapPin size={14} />{selectedService.location}</span>
                    </div>
                    <p className="text-[#C9C0A8] text-sm leading-relaxed">{selectedService.description}</p>
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      <button className="py-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 text-xs font-medium"><Phone size={14} className="inline mr-1" />Call</button>
                      <button className="py-2.5 rounded-xl bg-blue-500/15 text-blue-400 text-xs font-medium"><Globe size={14} className="inline mr-1" />Message</button>
                      <button className="py-2.5 rounded-xl bg-[#D4A853]/15 text-[#D4A853] text-xs font-medium"><Clock size={14} className="inline mr-1" />Book</button>
                    </div>
                  </>
                )}

                {(activeSheet === 'list-business' || activeSheet === 'list-profession') && (
                  <div className="space-y-4">
                    <p className="text-[#7A7363] text-xs">
                      {activeSheet === 'list-business' ? 'Register your halal business to reach Muslim consumers worldwide.' : 'List your professional services to connect with the Muslim community.'}
                    </p>
                    {(activeSheet === 'list-business'
                      ? [{ label: 'Business Name' }, { label: 'Category' }, { label: 'Description' }, { label: 'Location' }, { label: 'Phone' }, { label: 'Email' }, { label: 'Website' }]
                      : [{ label: 'Full Name' }, { label: 'Profession' }, { label: 'Specialization' }, { label: 'Experience' }, { label: 'Phone' }, { label: 'Email' }, { label: 'Hourly Rate' }]
                    ).map((field) => (
                      <div key={field.label}>
                        <label className="text-[#C9C0A8] text-xs mb-1.5 block">{field.label}</label>
                        <input type="text" placeholder={field.label}
                          className="w-full px-4 py-2.5 rounded-xl bg-[#10151F] border border-[rgba(212,168,83,0.2)] text-[#F5E8C7] text-sm placeholder-[#7A7363] focus:outline-none focus:border-blue-500/50" />
                      </div>
                    ))}
                    <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm">
                      Submit Listing
                    </button>
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

export default CommercePage;
