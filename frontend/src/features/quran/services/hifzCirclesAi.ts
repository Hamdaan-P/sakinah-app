/**
 * Raya integration for Hifz Circles.
 *
 * Builds a markdown digest of the circle's recent activity and threads it
 * into Raya's `context` field PLUS prepends a short summary into the user
 * message itself — that way useful answers come back regardless of whether
 * the backend prompt-template references `context` directly.
 */

import { auth } from '@/config/firebase.config';
import { streamMessage } from '@/features/chatbot/services/chatbotService';
import {
  addNote,
  getCircleMeta,
  listMembers,
  listRecentCheckins,
  listRecentNotes,
  type NoteType,
} from './hifzCirclesService';

function uid(): string {
  const u = auth.currentUser;
  if (!u) throw new Error('Sign in required');
  return u.uid;
}

function fmtDate(ts: number): string {
  if (!ts) return '';
  return new Date(ts).toISOString().slice(0, 10);
}

/** Compose a markdown digest of the circle's recent activity + members. */
export async function buildCircleContext(circleId: string): Promise<string> {
  const [meta, members, checkins, notes] = await Promise.all([
    getCircleMeta(circleId),
    listMembers(circleId),
    listRecentCheckins(circleId, 20),
    listRecentNotes(circleId, 5),
  ]);

  if (!meta) return '';

  const lines: string[] = [];
  lines.push(`# Hifz Circle: ${meta.name}`);
  if (meta.description) lines.push(`_${meta.description}_`);
  lines.push('');
  lines.push(`**Members (${members.length})**:`);
  for (const m of members.slice(0, 12)) {
    lines.push(`- ${m.name} — ${m.totalAyahsRevised} ayahs revised, ${m.currentStreak}-day streak`);
  }
  lines.push('');
  if (checkins.length > 0) {
    lines.push('**Recent check-ins** (last 7 days):');
    const cutoff = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recent = checkins.filter((c) => c.createdAt >= cutoff).slice(0, 12);
    for (const c of recent) {
      const note = c.note ? ` — "${c.note}"` : '';
      lines.push(`- ${fmtDate(c.createdAt)} · ${c.name}: ${c.ayahsRevised} ayah${c.ayahsRevised === 1 ? '' : 's'}${note}`);
    }
    lines.push('');
  }
  if (notes.length > 0) {
    lines.push('**Recent saved notes**:');
    for (const n of notes) {
      const tag = n.type === 'manual' ? '' : ` (${n.type})`;
      lines.push(`- [${fmtDate(n.createdAt)} · ${n.authorName}${tag}] ${n.body.slice(0, 200)}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

interface AskOpts {
  /** Stream tokens as they arrive — useful for live UI updates. */
  onPartial?: (text: string) => void;
}

/**
 * Ask Raya a question with the circle's context attached. Returns the
 * complete final response.
 */
export async function askRayaAboutCircle(
  circleId: string,
  userPrompt: string,
  opts: AskOpts = {},
): Promise<string> {
  const myUid = uid();
  const sessionId = `circle-${circleId}-${myUid}`;
  const context = await buildCircleContext(circleId);
  const wrappedMessage =
    `Context for this question (a Quran-memorization peer circle the user is part of):\n\n` +
    `${context}\n\n` +
    `---\n\n` +
    `User's question: ${userPrompt}`;

  let full = '';
  await streamMessage(
    {
      user_id: myUid,
      session_id: sessionId,
      message: wrappedMessage,
      context: { source: 'hifz-circle', circleId, circleName: context.split('\n')[0]?.replace(/^# Hifz Circle:\s*/, '') ?? '' },
    },
    (chunk) => {
      full += chunk;
      opts.onPartial?.(full);
    },
    () => { /* done — full already built up */ },
  );
  return full.trim();
}

/**
 * Ask Raya to summarise recent circle activity. Saves the answer as a
 * pinned 🤖 raya-summary note on the circle. Best-effort; throws on Raya/Firestore error.
 */
export async function generateCallSummary(circleId: string): Promise<string> {
  const text = await askRayaAboutCircle(
    circleId,
    "Briefly summarise what this circle has been working on recently — surahs/topics likely covered, who's been most active, and one or two patterns worth noting. 4–6 sentences max.",
  );
  await addNote(circleId, { type: 'raya-summary', body: text, pinned: false });
  return text;
}

/**
 * Ask Raya for a thoughtful reflection question for the circle to discuss.
 * Saves as a 💭 raya-prompt note.
 */
export async function generateDailyReflection(circleId: string): Promise<string> {
  const text = await askRayaAboutCircle(
    circleId,
    "Suggest one open-ended reflection question this circle could discuss together, ideally tied to something they've been studying. Just the question — no preamble.",
  );
  await addNote(circleId, { type: 'raya-prompt', body: text, pinned: false });
  return text;
}

/**
 * Ask Raya for a 7-day group study plan focused on a particular surah
 * (or whichever surah the circle has been studying if no surah is given).
 * Saves as a pinned 📚 raya-plan note.
 */
export async function generateStudyPlan(circleId: string, surahHint?: string): Promise<string> {
  const surahLine = surahHint ? `Focus the plan on Surah ${surahHint}.` : 'Pick a surah aligned with what they\'ve been working on.';
  const text = await askRayaAboutCircle(
    circleId,
    `Draft a 7-day group study plan for this circle. ${surahLine} Each day: a small ayah range, one tajweed focus, and a short reflection prompt. Keep it tight — markdown bullets per day.`,
  );
  await addNote(circleId, { type: 'raya-plan', body: text, pinned: true });
  return text;
}

/** Save an arbitrary AI response as a note, used by the Raya sheet's "Save as note" button. */
export async function saveResponseAsNote(circleId: string, body: string, type: NoteType = 'raya-summary'): Promise<void> {
  await addNote(circleId, { type, body, pinned: false });
}
