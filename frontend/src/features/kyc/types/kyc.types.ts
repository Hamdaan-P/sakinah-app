/**
 * KYC Types & Constants
 * 2-tier KYC system: Quick signup (Tier 1) + Conversational deep KYC (Tier 2)
 */

// ── Tier Levels ──────────────────────────────────────────

export type KycTier = 0 | 1 | 2;

export type KycStatus =
  | 'none'
  | 'tier1_complete'
  | 'tier2_complete';

export type KycLevel = 'none' | 'basic' | 'full';

// ── Tier 1 Data (Quick KYC) ──────────────────────────────

export interface Tier1Data {
  full_name: string;
  gender: 'Male' | 'Female';
  date_of_birth: string; // ISO date string
  country: string;
  city: string;
}

// ── Tier 2 Data (Deep KYC) ──────────────────────────────

export interface DeepKycData {
  // Step 1: What brought you here
  intent_primary: string;
  intent_secondary: string[];
  deep_planning_to_start: string;

  // Step 2: Where are you with your deen
  iman_level: number;
  deep_deen_struggle: string;
  school_of_thought: string;

  // Step 3: Your money story
  money_motivation: string;
  deep_five_year_test: string;
  deep_emptier_purchase: string;

  // Step 4: How you're wired
  crisis_instinct: string;
  deep_repeating_pattern: string;
  deep_feared_self: string;

  // Step 5: What keeps you up
  biggest_stress: string;
  stress_sharing: string;
  deep_night_thoughts: string;

  // Step 6: How you connect
  conversation_pref: string;
  advice_style: string;
  deep_real_self: string;

  // Step 7: Your world
  occupation: string;
  life_stage: string;
  deep_whose_life: string;

  // Step 8: One last thing
  raya_help_goal: string;
  deep_trying_to_change: string;
  deep_younger_self: string;
}

export type DeepKycDraft = Partial<DeepKycData> & { current_step?: number };

// ── Feature gating ──────────────────────────────────────

export const GATED_ROUTES = [
  '/screener',
  '/islamic-banking',
  '/wallet',
  '/shark-tank',
  '/chamber',
  '/commerce',
  '/matrimony',
  '/halal-intimacy',
  '/debt',
  '/real-estate',
] as const;

export const GATED_ROUTE_SET = new Set<string>(GATED_ROUTES);

// Maps route path to a display name for the modal
export const GATED_FEATURE_NAMES: Record<string, string> = {
  '/screener': 'Stock Screener',
  '/islamic-banking': 'Islamic Banking',
  '/wallet': 'Wallet',
  '/shark-tank': 'Shark Tank',
  '/chamber': 'Chamber',
  '/commerce': 'Commerce',
  '/matrimony': 'Matrimony',
  '/halal-intimacy': 'Halal Intimacy',
  '/debt': 'Debt Restructuring',
  '/real-estate': 'Real Estate',
};

// Sidebar item IDs that are gated
export const GATED_SIDEBAR_IDS = new Set([
  'screener', 'islamic-banking', 'wallet', 'shark-tank', 'chamber',
  'commerce', 'halal-intimacy', 'debt', 'real-estate',
]);

// ── Constants ────────────────────────────────────────────

export const COUNTRIES = [
  'UAE', 'Saudi Arabia', 'USA', 'UK', 'Canada', 'Australia', 'Malaysia',
  'Indonesia', 'Pakistan', 'India', 'Egypt', 'Turkey', 'Bangladesh', 'Nigeria', 'South Africa',
];

export const CITIES_BY_COUNTRY: Record<string, string[]> = {
  'UAE': ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman'],
  'Saudi Arabia': ['Riyadh', 'Jeddah', 'Makkah', 'Madinah', 'Dammam'],
  'USA': ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Dallas'],
  'UK': ['London', 'Birmingham', 'Manchester', 'Leeds', 'Glasgow'],
  'India': ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Chennai'],
  'Malaysia': ['Kuala Lumpur', 'Penang', 'Johor Bahru', 'Malacca'],
  'Pakistan': ['Karachi', 'Lahore', 'Islamabad', 'Rawalpindi'],
  'Indonesia': ['Jakarta', 'Surabaya', 'Bandung', 'Medan'],
  'Canada': ['Toronto', 'Vancouver', 'Montreal', 'Calgary'],
  'Australia': ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
  'Egypt': ['Cairo', 'Alexandria', 'Giza', 'Luxor'],
  'Turkey': ['Istanbul', 'Ankara', 'Izmir', 'Antalya'],
  'Bangladesh': ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi'],
  'Nigeria': ['Lagos', 'Abuja', 'Kano', 'Ibadan'],
  'South Africa': ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria'],
};

export const INTENT_OPTIONS = [
  { id: 'islamic_knowledge', label: 'Learn about Islam' },
  { id: 'halal_investing', label: 'Halal Investing' },
  { id: 'spiritual_growth', label: 'Spiritual Growth' },
  { id: 'community', label: 'Connect with Community' },
  { id: 'financial_planning', label: 'Financial Planning' },
  { id: 'family', label: 'Family & Marriage' },
  { id: 'business', label: 'Business & Commerce' },
  { id: 'education', label: 'Islamic Education' },
  { id: 'mental_health', label: 'Mental Health & Wellbeing' },
  { id: 'career', label: 'Career Guidance' },
];

export const MONEY_MOTIVATIONS = [
  { id: 'freedom', label: 'Freedom', description: 'I want the ability to choose how I spend my time' },
  { id: 'validation', label: 'Validation', description: 'Honestly, I want people to see I made it' },
  { id: 'survival', label: 'Survival', description: "I'm just trying to stay afloat right now" },
  { id: 'dont_know', label: "I genuinely don't know", description: "I haven't really thought about it" },
];

export const CRISIS_INSTINCTS = [
  { id: 'fix_immediately', label: 'Fix it immediately' },
  { id: 'overthink_alone', label: 'Overthink it alone' },
  { id: 'talk_to_someone', label: 'Talk to someone' },
  { id: 'ignore_hope', label: 'Ignore it and hope it passes' },
  { id: 'dua_let_go', label: 'Make dua and let go' },
];

export const STRESS_AREAS = [
  { id: 'money_career', label: 'Money & career' },
  { id: 'relationships', label: 'Relationships & family' },
  { id: 'faith_purpose', label: 'Faith & purpose' },
  { id: 'health_mental', label: 'Health & mental state' },
  { id: 'loneliness', label: 'Loneliness' },
  { id: 'alhamdulillah', label: "Alhamdulillah I'm actually good" },
];

export const STRESS_SHARING_OPTIONS = [
  { id: 'have_people', label: 'I have people I talk to' },
  { id: 'keep_inside', label: 'I keep it inside mostly' },
  { id: 'dont_know_how', label: "I don't even know how to bring it up" },
];

export const CONVERSATION_PREFS = [
  { id: 'get_to_point', label: 'Get to the point' },
  { id: 'hear_first', label: 'Hear me out first, then advise' },
  { id: 'just_listen', label: "Just listen, don't fix" },
  { id: 'depends', label: 'Depends on my mood' },
];

export const ADVICE_STYLES = [
  { id: 'quran_hadith', label: 'Quran & hadith straight up' },
  { id: 'real_talk_first', label: 'Real talk first, then bring in the deen' },
  { id: 'stories_examples', label: 'Stories and examples' },
  { id: 'dont_preach', label: "Don't preach, just be real" },
];

export const REAL_SELF_OPTIONS = [
  { id: 'real_me', label: 'The real me' },
  { id: 'mostly_real', label: 'Mostly real' },
  { id: 'a_version', label: 'A version, honestly' },
  { id: 'dont_know', label: "I don't even know anymore" },
];

export const LIFE_STAGES = [
  { id: 'student', label: 'Student' },
  { id: 'early_career', label: 'Early career' },
  { id: 'building_family', label: 'Building a family' },
  { id: 'established', label: 'Established but questioning' },
  { id: 'starting_over', label: 'Starting over' },
  { id: 'retired', label: 'Retired & reflecting' },
];

export const FIVE_YEAR_OPTIONS = [
  { id: 'yes_love_it', label: 'Yes, I love what I do' },
  { id: 'no_walk_away', label: "No, I'd walk away tomorrow" },
  { id: 'dont_know', label: "I honestly don't know" },
];

export const WHOSE_LIFE_OPTIONS = [
  { id: 'my_own', label: 'My own path' },
  { id: 'mostly_mine', label: 'Mostly mine' },
  { id: 'someone_elses', label: "Honestly? Someone else's" },
  { id: 'figuring_out', label: "I'm trying to figure that out" },
];

export const YOUNGER_SELF_OPTIONS = [
  { id: 'proud', label: 'Proud' },
  { id: 'confused', label: 'Confused' },
  { id: 'both', label: 'Both honestly' },
  { id: 'rather_not', label: "I'd rather not think about it" },
];

export const IMAN_SLIDER_LABELS: Record<number, string> = {
  0: 'Running on empty',
  25: 'Struggling',
  50: 'Going through the motions',
  75: 'Feeling connected',
  100: 'Spiritual high',
};
