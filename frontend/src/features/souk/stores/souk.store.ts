/**
 * Souk session store
 * Caches the current feed + filter, and tracks the multi-step create-listing
 * draft so the user can step back and forth without losing inputs.
 */

import { create } from 'zustand';
import type {
  CreateListingInput,
  FeedFilter,
  ListingType,
  RankedListing,
} from '../types/souk.types';

interface SoukState {
  // Feed
  feed: RankedListing[];
  feedLoading: boolean;
  feedFilter: FeedFilter;
  setFeed: (items: RankedListing[]) => void;
  setFeedLoading: (loading: boolean) => void;
  setFeedFilter: (filter: FeedFilter) => void;

  // Create-listing draft
  draft: Partial<CreateListingInput> | null;
  setDraft: (patch: Partial<CreateListingInput>) => void;
  resetDraft: (type?: ListingType) => void;

  // Optimistic interest tracker (local-session only)
  interested: Set<string>;
  markInterested: (id: string) => void;
}

export const useSoukStore = create<SoukState>((set) => ({
  feed: [],
  feedLoading: false,
  feedFilter: { type: 'all' },
  setFeed: (items) => set({ feed: items }),
  setFeedLoading: (loading) => set({ feedLoading: loading }),
  setFeedFilter: (filter) => set({ feedFilter: filter }),

  draft: null,
  setDraft: (patch) =>
    set((s) => ({ draft: { ...(s.draft ?? {}), ...patch } })),
  resetDraft: (type) =>
    set({
      draft: type
        ? {
            type,
            category: '',
            title: '',
            description: '',
            price: { amount: null, currency: 'USD', flexible: true },
            media: [],
            location: null,
            tags: [],
          }
        : null,
    }),

  interested: new Set(),
  markInterested: (id) =>
    set((s) => {
      const next = new Set(s.interested);
      next.add(id);
      return { interested: next };
    }),
}));
