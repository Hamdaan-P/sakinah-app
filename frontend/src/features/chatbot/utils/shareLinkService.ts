/**
 * Share Link Service
 * Saves conversation snapshots to Firestore and generates shareable links.
 */

import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/config/firebase.config';
import { useAuthStore } from '@/core/stores/auth.store';
import type { ChatMessage } from '../types/chatbot.types';

// ── Types ──

export interface SharedMessage {
  text: string;
  isUser: boolean;
  timestamp: number; // epoch ms for serialization
}

export interface SharedConversation {
  messages: SharedMessage[];
  companionId: string;
  companionName: string;
  companionIcon: string;
  title: string;
  messageCount: number;
  sharedBy: string;
  createdAt: unknown; // serverTimestamp
}

// ── Helpers ──

/** Generate a URL-safe random ID (alphanumeric, default 12 chars). */
function generateShareId(length = 12): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const arr = new Uint8Array(length);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => chars[b % chars.length]).join('');
}

/** Remove backend artifacts (<thinking>, <function_calls>, <function_result>, etc.) from AI text. */
function sanitizeAiText(text: string): string {
  return text
    // Remove <thinking>...</thinking> blocks (including nested content)
    .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
    // Remove <function_calls>...</function_calls> blocks
    .replace(/<function_calls>[\s\S]*?<\/function_calls>/gi, '')
    // Remove <function_result>...</function_result> blocks
    .replace(/<function_result>[\s\S]*?<\/function_result>/gi, '')
    // Remove <invoke>...</invoke> blocks
    .replace(/<invoke[\s\S]*?<\/invoke>/gi, '')
    // Remove any remaining orphan tags
    .replace(/<\/?(thinking|function_calls|function_result|invoke|antml:[a-z_]+)[^>]*>/gi, '')
    // Collapse multiple blank lines into one
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/** Strip ChatMessage[] down to lightweight SharedMessage[] (text + isUser + timestamp only). */
function stripMessages(messages: ChatMessage[]): SharedMessage[] {
  return messages
    .filter((m) => m.text && !m.isLoading)
    .map((m) => ({
      text: m.isUser ? m.text : sanitizeAiText(m.text),
      isUser: m.isUser,
      timestamp: m.timestamp.getTime(),
    }))
    .filter((m) => m.text.length > 0);
}

// ── Public API ──

/**
 * Snapshot the full conversation to Firestore and copy the share link to clipboard.
 * Returns the full URL string.
 */
export async function createShareLink(
  messages: ChatMessage[],
  companion: { id: string; name: string; icon: string },
): Promise<string> {
  const userId = useAuthStore.getState().user?.id ?? 'anonymous';
  const shareId = generateShareId();
  const stripped = stripMessages(messages);

  // Title = first user message, truncated to 80 chars
  const firstUser = stripped.find((m) => m.isUser);
  const title = firstUser
    ? firstUser.text.length > 80
      ? firstUser.text.slice(0, 77) + '...'
      : firstUser.text
    : 'Shared conversation';

  const data: SharedConversation = {
    messages: stripped,
    companionId: companion.id,
    companionName: companion.name,
    companionIcon: companion.icon,
    title,
    messageCount: stripped.length,
    sharedBy: userId,
    createdAt: serverTimestamp(),
  };

  await setDoc(doc(db, 'shared_conversations', shareId), data);

  const url = `${window.location.origin}/share/${shareId}`;

  // Copy to clipboard (non-fatal if it fails)
  try {
    await navigator.clipboard.writeText(url);
  } catch {
    // Fallback: some browsers block clipboard in non-secure contexts
  }

  return url;
}

/**
 * Fetch a shared conversation by its ID. Returns null if not found.
 */
export async function fetchSharedConversation(
  shareId: string,
): Promise<(SharedConversation & { id: string }) | null> {
  const snap = await getDoc(doc(db, 'shared_conversations', shareId));
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as SharedConversation) };
}
