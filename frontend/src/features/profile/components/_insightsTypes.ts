/**
 * Type contracts for the InsightsReport overview composer.
 *
 * Phase 5 split — moved out of InsightsReport.tsx so the component
 * file carries only JSX + state + composition. These shapes mirror
 * the Firestore documents the report consumes; tightening any of
 * them is a coordinated change with the backend write paths.
 */

export interface KycProfile {
  full_name?: string;
  gender?: string;
  date_of_birth?: string;
  country?: string;
  city?: string;
  occupation?: string;
  life_stage?: string;
  iman_level?: number;
  money_motivation?: string;
  crisis_instinct?: string;
  biggest_stress?: string;
  stress_sharing?: string;
  conversation_pref?: string;
  advice_style?: string;
  raya_help_goal?: string;
  intent_primary?: string;
  intent_secondary?: string[];
  school_of_thought?: string;
  deep_deen_struggle?: string;
  deep_repeating_pattern?: string;
  deep_night_thoughts?: string;
  deep_trying_to_change?: string;
  deep_younger_self?: string;
  deep_feared_self?: string;
  deep_real_self?: string;
  deep_five_year_test?: string;
  deep_whose_life?: string;
  kyc_tier?: number;
  pascoArchetype?: string;
  pascoTraits?: string[];
  pascoCompleted?: boolean;
  islamicKnowledgeLevel?: string;
  islamicInterests?: string[];
  islamic_interests?: string[];
  hobbies?: string[];
}

export interface EmotionalProfile {
  recurringThemes: string[];
  copingPatterns: string[];
  growthAreas: string[];
  triggers: string[];
  dominantEmotions: string[];
  communicationStyle: string;
  cognitivePatterns?: Record<string, { count: number; examples?: string[] }>;
}

export interface MoodEntry {
  primaryEmotion: string;
  intensity: number;
  sentiment: number;
  timestamp: Date;
}

export interface RelationshipData {
  [name: string]: {
    mention_count?: number;
    valence?: string;
    typical_emotions?: string[];
    relationship_type?: string;
  };
}

export interface ConversationMeta {
  title: string;
  companionId: string;
  messageCount: number;
  updatedAt: Date;
}

export interface WeeklyInsights {
  summary: string;
  insights: Array<{
    type: string;
    title: string;
    description: string;
    data?: Record<string, unknown>;
  }>;
}

export interface OverviewData {
  kyc: KycProfile;
  emotional: EmotionalProfile | null;
  moodLog: MoodEntry[];
  relationships: RelationshipData;
  conversations: ConversationMeta[];
  weeklyInsights: WeeklyInsights | null;
}

export interface RadarScore {
  axis: string;
  value: number; // 0-100
  color: string;
}
