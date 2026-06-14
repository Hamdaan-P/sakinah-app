/**
 * Barka Labs Types
 * Blessings tracker with AI depth scoring
 */

export type BlessingDepth = 'common' | 'thoughtful' | 'profound';

export interface ReflectionDimensions {
  uniqueness: number;  // 1-5
  depth_score: number; // 1-5
  specificity: number; // 1-5
  perspective: number; // 1-5
}

export interface Blessing {
  id: string;
  text: string;
  depth: BlessingDepth;
  score: number;
  ai_reasoning: string;
  created_at: string;
  dnz_earned: number;
  decomposition?: Record<string, unknown> | null;
  actions?: Record<string, unknown>[] | null;
  reflection?: ReflectionDimensions | null;
}

export interface BarkaLabsStats {
  total_blessings: number;
  total_score: number;
  avg_depth_score: number;
  profound_count: number;
  thoughtful_count: number;
  common_count: number;
  current_streak: number;
  longest_streak: number;
  last_blessing_date: string | null;
  milestones_claimed: Record<string, boolean>;
}

export interface MilestoneAward {
  milestone: string;
  dnz_awarded: number;
  description: string;
}

export interface LogBlessingResponse {
  blessing: Blessing;
  milestones_triggered: MilestoneAward[];
  total_dnz_awarded: number;
  stats: BarkaLabsStats;
}

export interface BlessingsListResponse {
  blessings: Blessing[];
  count: number;
  total_score: number;
}

export interface DecompositionAction {
  text: string;
  type: string;
  reference: string;
}

export interface DecompositionData {
  surface: string[];
  system: string[];
  divine_design: string[];
  total_hidden_blessings: number;
}

export interface PercentileData {
  percentile: number | null;
  composite_score: number;
  message: string;
  total_users: number;
}

export interface LeaderboardEntry {
  user_id: string;
  display_name: string;
  composite_score: number;
  total_blessings: number;
  total_score: number;
  avg_depth: number;
  streak: number;
  level: number;
  profound_count: number;
  country: string;
}

export interface GlobalStats {
  total_users: number;
  total_blessings: number;
}

export interface BuddyEntry {
  user_id: string;
  display_name: string;
  level: number;
  streak: number;
  status: 'online' | 'away' | 'stuck';
  today_blessings: number;
  total_blessings: number;
  color: string;
}

export interface BattleBlessingItem {
  id: string;
  text: string;
  depth: string | null;
  score: number | null;
  submitted_at: string | null;
}

export interface BattleData {
  battle_id: string;
  challenger_id: string;
  opponent_id: string | null;
  status: 'pending' | 'active' | 'scoring' | 'completed';
  created_at: string | null;
  started_at: string | null;
  ends_at: string | null;
  challenger_blessings: BattleBlessingItem[];
  opponent_blessings: BattleBlessingItem[];
  challenger_score: number;
  opponent_score: number;
  winner_id: string | null;
  dnz_awarded: Record<string, number>;
}

export interface DecompositionResponse {
  blessing_id: string;
  blessing_text: string;
  decomposition: DecompositionData;
  actions: DecompositionAction[];
}

// ── Community Feed ──

export interface PublicBlessing {
  id: string;
  text: string;
  score: number;
  depth: BlessingDepth;
  reflection: ReflectionDimensions | null;
  created_at: string;
  likes_count: number;
  comments_count: number;
  has_liked: boolean;
}

export interface CommunityFeedResponse {
  blessings: PublicBlessing[];
  next_cursor: string | null;
  count: number;
}

export interface CommunityComment {
  id: string;
  user_id: string;
  name: string;
  photo_url: string;
  text: string;
  created_at: string;
  parent_id?: string | null;
}

export interface ToggleLikeResponse {
  liked: boolean;
  likes_count: number;
}
