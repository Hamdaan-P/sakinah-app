/**
 * Static catalog of listing types + sub-categories shown in the Souk picker
 * rails. Kept as a TS module so the UI can render icons and gradient swatches
 * inline without bundling a JSON blob.
 */

import {
  Bag,
  Briefcase,
  Storefront,
  House,
  HandHeart,
  BookOpen,
  Buildings,
  Cloud,
  type IconProps,
} from '@phosphor-icons/react';
import type { ComponentType } from 'react';
import type { ListingType } from './types/souk.types';

export interface ListingTypeMeta {
  id: ListingType;
  label: string;
  shortLabel: string;
  description: string;
  icon: ComponentType<IconProps>;
  gradient: string; // tailwind gradient classes
  accent: string; // hex for icon tint
  categories: string[];
}

export const LISTING_TYPES: ListingTypeMeta[] = [
  {
    id: 'product',
    label: 'Physical Products',
    shortLabel: 'Products',
    description: 'Goods you can ship or hand over.',
    icon: Bag,
    gradient: 'from-amber-500/15 to-orange-600/10',
    accent: '#F59E0B',
    categories: [
      'Islamic Items',
      'Clothing',
      'Home & Living',
      'Electronics',
      'Books',
      'Food',
      'Beauty & Care',
      'Other',
    ],
  },
  {
    id: 'service',
    label: 'Services',
    shortLabel: 'Services',
    description: 'Local and online halal services.',
    icon: Storefront,
    gradient: 'from-blue-500/15 to-indigo-600/10',
    accent: '#3B82F6',
    categories: [
      'Food & Catering',
      'Education',
      'Legal',
      'Finance',
      'Healthcare',
      'Travel',
      'Events',
      'Other',
    ],
  },
  {
    id: 'freelancer',
    label: 'Freelancers',
    shortLabel: 'Freelance',
    description: 'Skilled individuals offering project work.',
    icon: Briefcase,
    gradient: 'from-teal-500/15 to-cyan-600/10',
    accent: '#14B8A6',
    categories: [
      'Design',
      'Writing',
      'Development',
      'Marketing',
      'Translation',
      'Tutoring',
      'Other',
    ],
  },
  {
    id: 'job',
    label: 'Jobs & Opportunities',
    shortLabel: 'Jobs',
    description: 'Open roles and community opportunities.',
    icon: Briefcase,
    gradient: 'from-emerald-500/15 to-green-600/10',
    accent: '#10B981',
    categories: [
      'Full-Time',
      'Part-Time',
      'Contract',
      'Internship',
      'Volunteer',
      'Apprenticeship',
    ],
  },
  {
    id: 'rental',
    label: 'Rentals',
    shortLabel: 'Rentals',
    description: 'Short and long term rentals.',
    icon: House,
    gradient: 'from-purple-500/15 to-violet-600/10',
    accent: '#A855F7',
    categories: ['Property', 'Equipment', 'Vehicles', 'Venues', 'Other'],
  },
  {
    id: 'donation',
    label: 'Donations & Giveaways',
    shortLabel: 'Giveaways',
    description: 'Free items and sadaqah opportunities.',
    icon: HandHeart,
    gradient: 'from-rose-500/15 to-pink-600/10',
    accent: '#F43F5E',
    categories: ['Free Item', 'Sadaqah', 'Zakat-eligible', 'Community Aid'],
  },
  {
    id: 'islamic',
    label: 'Islamic Products & Books',
    shortLabel: 'Islamic',
    description: 'Quran, mushaf, Islamic art, books, tasbih.',
    icon: BookOpen,
    gradient: 'from-[#D7B56A]/20 to-amber-700/10',
    accent: '#D7B56A',
    categories: ['Mushaf', 'Books', 'Audio', 'Art', 'Apparel', 'Other'],
  },
  {
    id: 'business',
    label: 'Local Businesses',
    shortLabel: 'Business',
    description: 'Brick-and-mortar and small businesses near you.',
    icon: Buildings,
    gradient: 'from-sky-500/15 to-blue-700/10',
    accent: '#0EA5E9',
    categories: [
      'Restaurant',
      'Retail',
      'Service Shop',
      'Consultancy',
      'Other',
    ],
  },
  {
    id: 'digital',
    label: 'Digital Products',
    shortLabel: 'Digital',
    description: 'Templates, courses, eBooks, software.',
    icon: Cloud,
    gradient: 'from-indigo-500/15 to-purple-700/10',
    accent: '#6366F1',
    categories: ['Course', 'eBook', 'Template', 'Software', 'Audio', 'Other'],
  },
];

export const LISTING_TYPE_LOOKUP: Record<ListingType, ListingTypeMeta> =
  Object.fromEntries(LISTING_TYPES.map((t) => [t.id, t])) as Record<
    ListingType,
    ListingTypeMeta
  >;

export const REPORT_REASONS: { id: string; label: string }[] = [
  { id: 'prohibited', label: 'Prohibited / haram item or activity' },
  { id: 'spam', label: 'Spam or misleading listing' },
  { id: 'misleading', label: 'Inaccurate description / false claim' },
  { id: 'unethical', label: 'Exploitative or unethical' },
  { id: 'duplicate', label: 'Duplicate listing' },
  { id: 'other', label: 'Other concern' },
];

/**
 * Dev seed — only used in dev when Firestore returns an empty feed. Never
 * shown in production builds. Helps verify the rendering layer end-to-end
 * before a real seller has created their first listing.
 */
export function devSeedListings() {
  const now = Date.now();
  return [
    {
      id: 'seed-1',
      sellerId: 'seed',
      sellerName: 'Al-Baraka Catering',
      type: 'service' as const,
      category: 'Food & Catering',
      title: 'Halal catering for events',
      description: 'Premium halal catering for weddings, corporate events, and family gatherings. Fully certified, multi-cuisine menu.',
      price: { amount: null, currency: 'USD' as const, flexible: true },
      media: [],
      location: { city: 'Dubai', country: 'AE' },
      tags: ['catering', 'weddings'],
      status: 'active' as const,
      trustScore: 82,
      engagement: { views: 240, saves: 18, interests: 9, shares: 3, reports: 0 },
      createdAt: now - 1000 * 60 * 60 * 6,
      updatedAt: now - 1000 * 60 * 60 * 6,
      bumpedAt: now - 1000 * 60 * 60 * 6,
    },
    {
      id: 'seed-2',
      sellerId: 'seed',
      sellerName: 'Noor Crafts',
      type: 'islamic' as const,
      category: 'Art',
      title: 'Hand-painted Ayat al-Kursi canvas',
      description: 'Original calligraphy on canvas, framed and ready to hang. Limited series of 30.',
      price: { amount: 120, currency: 'USD' as const, flexible: false },
      media: [],
      location: { city: 'Istanbul', country: 'TR' },
      tags: ['calligraphy', 'art'],
      status: 'active' as const,
      trustScore: 76,
      engagement: { views: 510, saves: 44, interests: 12, shares: 8, reports: 0 },
      createdAt: now - 1000 * 60 * 60 * 30,
      updatedAt: now - 1000 * 60 * 60 * 30,
      bumpedAt: now - 1000 * 60 * 60 * 30,
    },
    {
      id: 'seed-3',
      sellerId: 'seed',
      sellerName: 'Aisha R.',
      type: 'freelancer' as const,
      category: 'Tutoring',
      title: 'Arabic & Quran tutoring (online)',
      description: 'Certified ijazah holder. 1:1 sessions for kids and adults. Tajweed, Hifz, and conversational Arabic.',
      price: { amount: 25, currency: 'USD' as const, flexible: true },
      media: [],
      location: null,
      tags: ['quran', 'arabic', 'online'],
      status: 'active' as const,
      trustScore: 88,
      engagement: { views: 178, saves: 22, interests: 14, shares: 2, reports: 0 },
      createdAt: now - 1000 * 60 * 60 * 12,
      updatedAt: now - 1000 * 60 * 60 * 12,
      bumpedAt: now - 1000 * 60 * 60 * 12,
    },
    {
      id: 'seed-4',
      sellerId: 'seed',
      sellerName: 'Zakat Distribution Network',
      type: 'donation' as const,
      category: 'Sadaqah',
      title: 'Iftar packs — Ramadan distribution',
      description: 'Sponsor an iftar pack ($5 each) — distributed to families in need across 8 countries. Receipt provided.',
      price: { amount: 5, currency: 'USD' as const, flexible: true },
      media: [],
      location: null,
      tags: ['ramadan', 'sadaqah'],
      status: 'active' as const,
      trustScore: 95,
      engagement: { views: 1200, saves: 95, interests: 67, shares: 41, reports: 0 },
      createdAt: now - 1000 * 60 * 60 * 2,
      updatedAt: now - 1000 * 60 * 60 * 2,
      bumpedAt: now - 1000 * 60 * 60 * 2,
    },
  ];
}
