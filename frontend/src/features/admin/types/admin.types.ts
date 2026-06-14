/**
 * Admin Dashboard Types
 */

export interface RecentUser {
  id: string;
  email: string;
  full_name: string;
  photo_url?: string | null;
  country?: string | null;
  kyc_tier: number;
  auth_provider?: string | null;
  created_at?: string | null;
  dnz_balance: number;
  dnz_lifetime: number;
}

export interface AdminStats {
  total_users: number;
  new_today: number;
  new_this_week: number;
  new_this_month: number;
  kyc_tier0: number;
  kyc_tier1: number;
  kyc_tier2: number;
  referral_users: number;
  top_countries: NameCount[];
  top_intents: NameCount[];
  top_life_stages: NameCount[];
  auth_providers: NameCount[];
  gender_breakdown: NameCount[];
  recent_signups: RecentUser[];
}

export interface NameCount {
  name: string;
  count: number;
}

export interface UserSummary {
  id: string;
  email: string;
  full_name: string;
  photo_url?: string | null;
  country?: string | null;
  city?: string | null;
  kyc_tier: number;
  kyc_status: string;
  auth_provider?: string | null;
  created_at?: string | null;
  last_seen?: string | null;
  referral_code?: string | null;
  referred_by_code?: string | null;
  online: boolean;
  verified: boolean;
  messages_count?: number;
}

export interface UserDetail extends UserSummary {
  display_name?: string | null;
  gender?: string | null;
  date_of_birth?: string | null;
  occupation?: string | null;
  life_stage?: string | null;
  iman_level?: number | null;
  intent_primary?: string | null;
  intent_secondary?: string[] | null;
  money_motivation?: string | null;
  crisis_instinct?: string | null;
  biggest_stress?: string | null;
  stress_sharing?: string | null;
  conversation_pref?: string | null;
  advice_style?: string | null;
  raya_help_goal?: string | null;
  bio?: string | null;
  title?: string | null;
  tags?: string[] | null;
  interests?: string[] | null;
  connections_count: number;
  referrals_successful_count: number;
  referrals_total_earned_dnz: number;
  email_verified: boolean;
  profile_completed: boolean;
  tier1_completed_at?: string | null;
  deep_kyc_completed_at?: string | null;
  deep_fields?: Record<string, string> | null;
  dnz_balance: number;
  dnz_lifetime: number;
}

export interface GrowthPoint {
  date: string;
  count: number;
  cumulative: number;
}

export interface UsersListResponse {
  users: UserSummary[];
  total: number;
  page: number;
  page_size: number;
}

export interface ReferralStats {
  total_referred_users: number;
  total_users_with_referral_code: number;
  unique_referrers: number;
  top_referrers: TopReferrer[];
}

export interface TopReferrer {
  user_id: string;
  name: string;
  referral_code: string;
  referral_count: number;
  earned_dnz: number;
}

export interface KycFunnel {
  funnel: { stage: string; count: number }[];
  iman_histogram: { range: string; count: number }[];
  avg_iman_level: number | null;
  intent_breakdown: NameCount[];
  stress_breakdown: NameCount[];
  money_motivation_breakdown: NameCount[];
  crisis_instinct_breakdown: NameCount[];
  advice_style_breakdown: NameCount[];
}

export interface DnzEconomy {
  total_circulation: number;
  total_lifetime_earned: number;
  active_holders: number;
  avg_balance: number;
  distribution_by_source: NameCount[];
  top_holders: { user_id: string; name: string; balance: number; lifetime: number }[];
  daily_trend: { date: string; amount: number }[];
}

export interface ActivityEvent {
  id: string;
  user_id: string;
  user_name: string;
  user_photo?: string | null;
  event_type: string;
  description: string;
  detail?: string | null;
  timestamp?: string | null;
}

export interface FeatureUsage {
  features: { name: string; visits: number; unique_users: number }[];
  daily_trend: { date: string; visits: number }[];
  total_visits: number;
  active_users: number;
  days: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: string | null;
}

export interface Conversation {
  id: string;
  title?: string | null;
  message_count: number;
  updated_at?: string | null;
  messages: ChatMessage[];
}

export interface ChatHistoryResponse {
  user_id: string;
  conversations: Conversation[];
}

export interface FeatureFeedItem {
  id: string;
  userId: string;
  userName: string;
  feature: string;
  path: string;
  timestamp: string | null;
}

export interface RecentQuery {
  id: string;
  userId: string;
  userName: string;
  query: string;
  conversationTitle: string;
  timestamp: string | null;
}

export interface AiCostUser {
  user_id: string;
  user_name: string;
  user_email: string;
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
  cost_usd: number;
  cost_inr: number;
  calls: number;
  daily: { date: string; input_tokens: number; output_tokens: number; cost_usd: number; cost_inr: number; calls: number }[];
}

export interface AiCostsResponse {
  days: number;
  users: AiCostUser[];
  totals: {
    total_input_tokens: number;
    total_output_tokens: number;
    total_tokens: number;
    total_cost_usd: number;
    total_cost_inr: number;
    total_calls: number;
  };
}

export type AdminTab = 'overview' | 'users' | 'kyc' | 'referrals' | 'dnz' | 'activity' | 'features' | 'ai-costs';
