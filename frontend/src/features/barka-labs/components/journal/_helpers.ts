/**
 * BarkaLabsJournal helpers — date predicates, formatting, depth colour map,
 * filter list type.
 */

export const FILTERS = ['All', 'Today', 'Yesterday', 'This Week', 'Older'] as const;
export type Filter = (typeof FILTERS)[number];

export function isToday(d: Date): boolean {
  const n = new Date();
  return d.toDateString() === n.toDateString();
}

export function isYesterday(d: Date): boolean {
  const y = new Date();
  y.setDate(y.getDate() - 1);
  return d.toDateString() === y.toDateString();
}

export function isThisWeek(d: Date): boolean {
  return Date.now() - d.getTime() < 7 * 86400000;
}

export function formatTime(d: Date): string {
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function formatDateFull(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
}

export function groupLabel(d: Date): string {
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  if (isThisWeek(d)) return 'This Week';
  return formatDateFull(d);
}

export function depthColor(depth: string): { bg: string; text: string } {
  switch (depth) {
    case 'profound':
      return { bg: 'rgba(215,181,106,0.15)', text: '#D7B56A' };
    case 'thoughtful':
      return { bg: 'rgba(42,157,111,0.15)', text: '#2A9D6F' };
    default:
      return { bg: 'rgba(91,141,239,0.15)', text: '#5B8DEF' };
  }
}

export function metacogLevel(score: number): string {
  if (score >= 4) return 'High';
  if (score >= 2.5) return 'Med';
  return 'Low';
}

export function timeAgo(dateStr: string): string {
  try {
    const ms = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return `${Math.floor(days / 7)}w ago`;
  } catch { return ''; }
}
