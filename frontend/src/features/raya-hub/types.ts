/**
 * Raya Hub — types mirroring backend response shapes from
 * `app/routes/raya.py` (quiet-report + tafakkur-seeds).
 */

export interface TafakkurSeed {
  context: string;
  prompt: string;
}

export interface TafakkurSeedsResponse {
  seeds: TafakkurSeed[];
}

export interface QuietReport {
  weekId: string;
  summary: string;
  texture: string;
  thread: string;
  observation: string;
  next_seed_prompt: string;
  total_noticings: number;
  source: 'cache' | 'llm' | 'fallback';
}

/* ─────────────── WhatsApp dashboard (app/routes/raya_dashboard.py) ─────────────── */

export interface ActivityItem {
  id: string;
  verb: string;
  channel: string | null;
  confirmed: boolean;
  created_at: string | null;
  summary: string;
  /** Scheduled time for reminder-like actions (ISO) — formatted locally in the UI. */
  when?: string | null;
}

export interface ActivityResponse {
  count: number;
  items: ActivityItem[];
}

export interface ToolBreakdownEntry {
  verb: string;
  label: string;
  count: number;
}

export interface AnalyticsResponse {
  totals: { messages: number; actions: number; reminders: number };
  tool_breakdown: ToolBreakdownEntry[];
  messages_by_day: { date: string; count: number }[];
  busiest_hours: { hour: number; count: number }[];
  messages_capped: boolean;
}

export type ReminderStatus = 'pending' | 'delivered' | 'skipped';

export interface ReminderItem {
  id: string;
  message: string;
  due_at: string | null;
  created_at: string | null;
  status: ReminderStatus;
}

export interface RemindersResponse {
  count: number;
  items: ReminderItem[];
}

export interface ChatThread {
  session_id: string;
  messageCount: number;
  lastUserMessage: string | null;
  updatedAt: string | null;
}

export interface ChatsResponse {
  count: number;
  threads: ChatThread[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | string | null;
  content: string | null;
  timestamp: string | null;
}

export interface ChatMessagesResponse {
  session_id: string;
  count: number;
  messages: ChatMessage[];
}

export interface MemoryItem {
  id: string;
  content: string;
  category: string;
  created_at: string | null;
}

export interface MemoriesResponse {
  count: number;
  memories: MemoryItem[];
}

export interface FeedbackItem {
  id: string;
  message_id: string | null;
  rating: number | string | null;
  feedback: string | null;
  timestamp: string | null;
}

export interface FeedbackResponse {
  count: number;
  items: FeedbackItem[];
}

/** Weekly 6-category insights — GET /insights/weekly/{uid} (app/routes/profile.py). */
export interface WeeklyInsightEntry {
  type?: string;
  title?: string;
  description?: string;
}

export interface WeeklyInsights {
  summary: string;
  insights: WeeklyInsightEntry[];
  period_start: string;
  period_end: string;
}
