/**
 * Shared helpers for the Admin Dashboard.
 *
 * Extracted from AdminPage.tsx.
 */

export function fmtDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
  catch { return '—'; }
}

export function fmtDateTime(iso: string | null | undefined): string {
  if (!iso) return '—';
  try { return new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
  catch { return '—'; }
}

export function pct(part: number, total: number): string {
  if (!total) return '0%';
  return `${Math.round((part / total) * 100)}%`;
}

export function kycBadge(tier: number) {
  if (tier === 2) return <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400">Tier 2</span>;
  if (tier === 1) return <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400">Tier 1</span>;
  return <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-500/15 text-red-400">None</span>;
}

export function getTimeAgo(isoString: string): string {
  const now = Date.now();
  const then = new Date(isoString).getTime();
  const diffSec = Math.floor((now - then) / 1000);
  if (diffSec < 60) return 'just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function timeAgoShort(iso: string | null | undefined): string {
  if (!iso) return '';
  try {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return fmtDate(iso);
  } catch { return ''; }
}
