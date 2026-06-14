import { create } from 'zustand';
import * as api from '../services/barkaLabsService';
import type { PublicBlessing, CommunityComment } from '../types/barka-labs.types';

interface CommunityState {
  feed: PublicBlessing[];
  loading: boolean;
  loadingMore: boolean;
  nextCursor: string | null;
  hasMore: boolean;
  comments: Record<string, CommunityComment[]>;
  commentsLoading: Record<string, boolean>;
  error: string | null;
  /** Prevents duplicate initial fetches */
  _initialized: boolean;
}

interface CommunityActions {
  fetchFeed: () => Promise<void>;
  fetchMore: () => Promise<void>;
  toggleLike: (blessingId: string) => Promise<void>;
  fetchComments: (blessingId: string) => Promise<void>;
  addComment: (blessingId: string, text: string) => Promise<void>;
}

export const useCommunityStore = create<CommunityState & CommunityActions>((set, get) => ({
  feed: [],
  loading: false,
  loadingMore: false,
  nextCursor: null,
  hasMore: true,
  comments: {},
  commentsLoading: {},
  error: null,
  _initialized: false,

  fetchFeed: async () => {
    if (get().loading || get()._initialized) return;
    set({ loading: true, error: null, _initialized: true });
    try {
      const res = await api.getCommunityFeed(20);
      set({
        feed: res.blessings,
        nextCursor: res.next_cursor,
        hasMore: !!res.next_cursor,
        loading: false,
      });
    } catch (e) {
      set({ error: (e as Error).message, loading: false });
    }
  },

  fetchMore: async () => {
    const { nextCursor, loadingMore, hasMore } = get();
    if (loadingMore || !hasMore || !nextCursor) return;
    set({ loadingMore: true });
    try {
      const res = await api.getCommunityFeed(20, nextCursor);
      set((s) => ({
        feed: [...s.feed, ...res.blessings],
        nextCursor: res.next_cursor,
        hasMore: !!res.next_cursor,
        loadingMore: false,
      }));
    } catch (e) {
      set({ error: (e as Error).message, loadingMore: false });
    }
  },

  toggleLike: async (blessingId: string) => {
    // Optimistic update
    set((s) => ({
      feed: s.feed.map((b) =>
        b.id === blessingId
          ? { ...b, has_liked: !b.has_liked, likes_count: b.likes_count + (b.has_liked ? -1 : 1) }
          : b
      ),
    }));
    try {
      const res = await api.toggleCommunityLike(blessingId);
      set((s) => ({
        feed: s.feed.map((b) =>
          b.id === blessingId ? { ...b, has_liked: res.liked, likes_count: res.likes_count } : b
        ),
      }));
    } catch {
      // Rollback on error
      set((s) => ({
        feed: s.feed.map((b) =>
          b.id === blessingId
            ? { ...b, has_liked: !b.has_liked, likes_count: b.likes_count + (b.has_liked ? -1 : 1) }
            : b
        ),
      }));
    }
  },

  fetchComments: async (blessingId: string) => {
    if (get().commentsLoading[blessingId]) return;
    set((s) => ({ commentsLoading: { ...s.commentsLoading, [blessingId]: true } }));
    try {
      const res = await api.getCommunityComments(blessingId);
      set((s) => ({
        comments: { ...s.comments, [blessingId]: res.comments },
        commentsLoading: { ...s.commentsLoading, [blessingId]: false },
      }));
    } catch (e) {
      set((s) => ({
        error: (e as Error).message,
        commentsLoading: { ...s.commentsLoading, [blessingId]: false },
      }));
    }
  },

  addComment: async (blessingId: string, text: string) => {
    try {
      const comment = await api.addCommunityComment(blessingId, text);
      set((s) => ({
        comments: {
          ...s.comments,
          [blessingId]: [comment, ...(s.comments[blessingId] || [])],
        },
        feed: s.feed.map((b) =>
          b.id === blessingId ? { ...b, comments_count: b.comments_count + 1 } : b
        ),
      }));
    } catch (e) {
      set({ error: (e as Error).message });
    }
  },
}));
