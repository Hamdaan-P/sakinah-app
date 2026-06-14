/**
 * Firestore + API loaders feeding the InsightsReport view.
 */

import { doc, getDoc, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { authGet } from '@/lib/api';
import { cleanTags } from '../_insightsHelpers';
import type {
  ConversationMeta,
  EmotionalProfile,
  KycProfile,
  MoodEntry,
  RelationshipData,
  WeeklyInsights,
} from '../_insightsTypes';

export async function loadKycProfile(userId: string): Promise<KycProfile> {
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (!snap.exists()) return {};
    return snap.data() as KycProfile;
  } catch { return {}; }
}

export async function loadEmotionalProfile(userId: string): Promise<EmotionalProfile | null> {
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'profile', 'emotional'));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      recurringThemes: cleanTags(d.recurringThemes),
      copingPatterns: cleanTags(d.copingPatterns),
      growthAreas: cleanTags(d.growthAreas),
      triggers: cleanTags(d.triggers),
      dominantEmotions: cleanTags(d.dominantEmotions),
      communicationStyle: d.communicationStyle ?? '',
      cognitivePatterns: d.cognitivePatterns ?? {},
    };
  } catch { return null; }
}

export async function loadMoodLog(userId: string): Promise<MoodEntry[]> {
  try {
    const q = query(collection(db, 'users', userId, 'moodLog'), orderBy('timestamp', 'desc'), limit(100));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        primaryEmotion: data.primaryEmotion ?? 'neutral',
        intensity: data.intensity ?? 0.5,
        sentiment: data.sentiment ?? 0,
        timestamp: data.timestamp?.toDate?.() ?? new Date(),
      };
    });
  } catch { return []; }
}

export async function loadRelationships(userId: string): Promise<RelationshipData> {
  try {
    const snap = await getDoc(doc(db, 'users', userId, 'profile', 'relationships'));
    if (!snap.exists()) return {};
    const d = snap.data();
    const result: RelationshipData = {};
    for (const [key, val] of Object.entries(d)) {
      if (typeof val === 'object' && val !== null && 'mention_count' in (val as Record<string, unknown>)) {
        result[key] = val as RelationshipData[string];
      }
    }
    return result;
  } catch { return {}; }
}

export async function loadConversations(userId: string): Promise<ConversationMeta[]> {
  try {
    const q = query(collection(db, 'users', userId, 'conversations'), orderBy('updatedAt', 'desc'), limit(50));
    const snap = await getDocs(q);
    return snap.docs.map((d) => {
      const data = d.data();
      return {
        title: data.title ?? 'Untitled',
        companionId: data.companionId ?? 'raya',
        messageCount: data.messageCount ?? 0,
        updatedAt: data.updatedAt?.toDate?.() ?? new Date(),
      };
    });
  } catch { return []; }
}

export async function loadWeeklyInsights(userId: string): Promise<WeeklyInsights | null> {
  try {
    return await authGet<WeeklyInsights>(`/insights/weekly/${userId}`);
  } catch { return null; }
}
