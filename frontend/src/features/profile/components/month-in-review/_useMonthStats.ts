/**
 * Loads "last 30 days" snapshot stats for MonthInReview.
 * Pure data layer — no JSX.
 */

import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, getDocs, Timestamp, doc, getDoc } from 'firebase/firestore';
import { db } from '@/config/firebase.config';

interface MoodEntry {
  primaryEmotion: string;
  sentiment: number;
  timestamp: Date;
}

interface ConversationMeta {
  messageCount: number;
  updatedAt: Date;
}

export interface MonthStats {
  messages: number;
  conversations: number;
  newRelationships: number;
  topEmotion: string | null;
  moodShift: { from: string; to: string } | null;
  daysActive: number;
}

function countTopEmotion(entries: MoodEntry[]): string | null {
  if (entries.length === 0) return null;
  const counts: Record<string, number> = {};
  for (const e of entries) counts[e.primaryEmotion] = (counts[e.primaryEmotion] ?? 0) + 1;
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
}

export function useMonthStats(userId: string | undefined) {
  const [stats, setStats] = useState<MonthStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const cutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const cutoffTs = Timestamp.fromDate(cutoff);

        // Load conversations in last 30 days
        const convoQ = query(
          collection(db, 'users', userId, 'conversations'),
          where('updatedAt', '>=', cutoffTs),
          orderBy('updatedAt', 'desc'),
        );
        const convoSnap = await getDocs(convoQ);
        const conversations: ConversationMeta[] = convoSnap.docs.map((d) => ({
          messageCount: d.data().messageCount ?? 0,
          updatedAt: d.data().updatedAt?.toDate?.() ?? new Date(),
        }));

        // Load mood log in last 30 days
        const moodQ = query(
          collection(db, 'users', userId, 'moodLog'),
          where('timestamp', '>=', cutoffTs),
          orderBy('timestamp', 'asc'),
        );
        const moodSnap = await getDocs(moodQ);
        const moodEntries: MoodEntry[] = moodSnap.docs.map((d) => {
          const data = d.data();
          return {
            primaryEmotion: data.primaryEmotion ?? 'neutral',
            sentiment: data.sentiment ?? 0,
            timestamp: data.timestamp?.toDate?.() ?? new Date(),
          };
        });

        // Load relationships and count ones with recent activity
        let newRelationships = 0;
        try {
          const relSnap = await getDoc(doc(db, 'users', userId, 'profile', 'relationships'));
          if (relSnap.exists()) {
            const relData = relSnap.data();
            newRelationships = Object.values(relData).filter((v) => {
              if (typeof v !== 'object' || v === null) return false;
              const lastMentioned = (v as Record<string, unknown>).last_mentioned_at;
              if (lastMentioned instanceof Timestamp) {
                return lastMentioned.toDate() >= cutoff;
              }
              return false;
            }).length;
          }
        } catch { /* best-effort */ }

        // Derive stats
        const messages = conversations.reduce((s, c) => s + c.messageCount, 0);
        const daysActive = new Set(conversations.map((c) => c.updatedAt.toDateString())).size;
        const topEmotion = countTopEmotion(moodEntries);

        let moodShift: { from: string; to: string } | null = null;
        if (moodEntries.length >= 4) {
          const firstEntries = moodEntries.slice(0, Math.min(5, Math.floor(moodEntries.length / 2)));
          const lastEntries = moodEntries.slice(-Math.min(5, Math.floor(moodEntries.length / 2)));
          const fromEmotion = countTopEmotion(firstEntries);
          const toEmotion = countTopEmotion(lastEntries);
          if (fromEmotion && toEmotion && fromEmotion !== toEmotion) {
            moodShift = { from: fromEmotion, to: toEmotion };
          }
        }

        if (!cancelled) {
          setStats({
            messages,
            conversations: conversations.length,
            newRelationships,
            topEmotion,
            moodShift,
            daysActive,
          });
        }
      } catch (e) {
        console.error('MonthInReview load error:', e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => { cancelled = true; };
  }, [userId]);

  return { stats, loading };
}
