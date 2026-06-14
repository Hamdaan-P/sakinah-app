/**
 * progressExportService — institutional learning integrations (PDF Section
 * 11 item 6).
 *
 * Produces a shareable export of the learner's local Quran progress so a
 * teacher, mentor, or masjid can review it without needing access to the
 * platform. v1 is fully client-side: it reads the same localStorage state
 * the app uses and emits CSV / JSON / Markdown.
 *
 * No PII is included beyond what the learner already has on their device.
 * Sharing the export with an institution is the learner's explicit action.
 */

import { getRecords, getSessions, getHifzStats } from './hifzEngine';
import { getStreakInfo } from './quranStreakService';
import { getBookmarks } from './quranBookmarkService';
import { getAnnotations } from './annotationManager';
import { listAllProgress } from './learningTracksService';

export type ExportFormat = 'json' | 'csv' | 'markdown';

interface ExportBundle {
  generatedAt: string;
  appVersion: string;
  hifz: {
    stats: ReturnType<typeof getHifzStats>;
    records: ReturnType<typeof getRecords>;
    sessionsCount: number;
    recentSessions: ReturnType<typeof getSessions>;
  };
  streak: ReturnType<typeof getStreakInfo>;
  bookmarks: ReturnType<typeof getBookmarks>;
  annotations: number;
  tracks: ReturnType<typeof listAllProgress>;
}

function collect(): ExportBundle {
  const sessions = getSessions();
  return {
    generatedAt: new Date().toISOString(),
    appVersion: 'rayah-plus-quran-v1',
    hifz: {
      stats: getHifzStats(),
      records: getRecords(),
      sessionsCount: sessions.length,
      recentSessions: sessions.slice(-25),
    },
    streak: getStreakInfo(),
    bookmarks: getBookmarks(),
    annotations: getAnnotations().length,
    tracks: listAllProgress(),
  };
}

function toCsv(bundle: ExportBundle): string {
  const rows: string[][] = [
    ['Section', 'Field', 'Value'],
    ['meta', 'generated_at', bundle.generatedAt],
    ['meta', 'app_version', bundle.appVersion],
    ['hifz_stats', 'total_tracked', String(bundle.hifz.stats.totalTracked)],
    ['hifz_stats', 'memorized', String(bundle.hifz.stats.memorized)],
    ['hifz_stats', 'mastered', String(bundle.hifz.stats.mastered)],
    ['hifz_stats', 'learning', String(bundle.hifz.stats.learning)],
    ['hifz_stats', 'due_today', String(bundle.hifz.stats.dueToday)],
    ['hifz_stats', 'overall_accuracy', bundle.hifz.stats.overallAccuracy.toFixed(3)],
    ['streak', 'current_streak', String(bundle.streak.streakCount)],
    ['streak', 'longest_streak', String(bundle.streak.longestStreak)],
    ['streak', 'daily_target', String(bundle.streak.dailyTarget)],
    ['bookmarks', 'count', String(bundle.bookmarks.length)],
    ['annotations', 'count', String(bundle.annotations)],
    ['tracks_enrolled', 'count', String(bundle.tracks.length)],
  ];
  for (const t of bundle.tracks) {
    rows.push([
      'track_progress',
      t.trackId,
      `completed:${t.completedStages.length}, last:${t.lastStageId ?? '-'}`,
    ]);
  }
  for (const [verseKey, rec] of Object.entries(bundle.hifz.records)) {
    rows.push([
      'hifz_record',
      verseKey,
      `${rec.status}, ease:${rec.ease.toFixed(2)}, streak:${rec.streak}, accuracy:${
        rec.totalAttempts ? (1 - rec.mistakeCount / rec.totalAttempts).toFixed(2) : '-'
      }`,
    ]);
  }
  return rows
    .map((r) => r.map((c) => (/[",\n]/.test(c) ? `"${c.replaceAll('"', '""')}"` : c)).join(','))
    .join('\n');
}

function toMarkdown(bundle: ExportBundle): string {
  const s = bundle.hifz.stats;
  const lines = [
    '# Quran Progress Report',
    '',
    `Generated: ${bundle.generatedAt}`,
    '',
    '## Hifz',
    `- Tracked: **${s.totalTracked}**`,
    `- Memorized: **${s.memorized}**`,
    `- Mastered: **${s.mastered}**`,
    `- Learning: **${s.learning}**`,
    `- Due today: **${s.dueToday}**`,
    `- Overall accuracy: **${Math.round(s.overallAccuracy * 100)}%**`,
    `- Test sessions: **${bundle.hifz.sessionsCount}**`,
    '',
    '## Daily reading streak',
    `- Current: **${bundle.streak.streakCount} days**`,
    `- Longest: **${bundle.streak.longestStreak} days**`,
    `- Daily target: **${bundle.streak.dailyTarget} ayahs**`,
    '',
    '## Engagement',
    `- Bookmarks: **${bundle.bookmarks.length}**`,
    `- Annotations: **${bundle.annotations}**`,
    `- Enrolled study tracks: **${bundle.tracks.length}**`,
  ];
  if (bundle.tracks.length > 0) {
    lines.push('', '### Study tracks');
    for (const t of bundle.tracks) {
      lines.push(`- \`${t.trackId}\` — ${t.completedStages.length} stage(s) complete`);
    }
  }
  return lines.join('\n');
}

function download(filename: string, content: string, mime: string): void {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 250);
}

export function exportProgress(format: ExportFormat): void {
  const bundle = collect();
  const stamp = new Date().toISOString().slice(0, 10);
  if (format === 'json') {
    download(`quran-progress-${stamp}.json`, JSON.stringify(bundle, null, 2), 'application/json');
  } else if (format === 'csv') {
    download(`quran-progress-${stamp}.csv`, toCsv(bundle), 'text/csv');
  } else {
    download(`quran-progress-${stamp}.md`, toMarkdown(bundle), 'text/markdown');
  }
}
