import { authGet, authPost } from '../../../lib/api';
import { getAuth } from 'firebase/auth';

// ── Profile ───────────────────────────────────────────────────────────
export async function saveRole(role: string) {
  return authPost('/profile/role', { role });
}

export async function saveNiyyah(whyMarriage: string, lifeSeason: string) {
  return authPost('/profile/niyyah', { whyMarriage, lifeSeason });
}

export async function saveValues(valueChoice: string, tradition: string, traditionShare: string, lifeStage: string) {
  return authPost('/profile/values', { valueChoice, tradition, traditionShare, lifeStage });
}

export async function saveMirror(answers: Array<{ qi: number; choice: string; reflectText?: string }>) {
  return authPost('/profile/mirror', { answers });
}

export async function savePreferences(prefs: Record<string, unknown>) {
  return authPost('/profile/preferences', prefs);
}

// ── Pool ──────────────────────────────────────────────────────────────
export async function getPool() {
  const token = await getAuth().currentUser?.getIdToken();
  console.log('Pool request - current user:', getAuth().currentUser?.uid);
  console.log('Pool request - token exists:', !!token);
  return authGet('/pool/');
}

// ── Interest ──────────────────────────────────────────────────────────
export async function expressInterest(toUid: string) {
  return authPost('/interest/', { to_uid: toUid });
}

export async function silentPass(toUid: string) {
  return authPost('/interest/pass', { to_uid: toUid });
}

// ── Match ─────────────────────────────────────────────────────────────
export async function getActiveMatches() {
  return authGet('/match/');
}

export async function getWaliConversations() {
  return authGet('/match/wali-conversations');
}

export async function getWaliNotifications() {
  return authGet('/match/wali-notifications');
}

export async function searchSeeker(name: string) {
  return authGet(`/match/search-seeker?name=${encodeURIComponent(name)}`);
}

export async function searchWaliUser(name: string) {
  return authGet(`/match/search-wali?name=${encodeURIComponent(name)}`);
}

export async function sendWaliRequest(waliUid: string) {
  return authPost('/match/wali-request', { wali_uid: waliUid });
}

export async function getPendingWaliInvites() {
  return authGet('/match/pending-wali-invites');
}

export async function acceptWaliInvite(requestId: string) {
  return authPost('/match/approve-wali', { request_id: requestId });
}

export async function declineWaliInvite(requestId: string) {
  return authPost('/match/decline-wali', { request_id: requestId });
}

export async function approveWaliRequest(requestId: string) {
  return authPost('/match/approve-wali', { request_id: requestId });
}

export async function getPendingWaliRequest(matchId: string) {
  return authGet(`/match/pending-wali-request?match_id=${matchId}`);
}

// ── Conversation ──────────────────────────────────────────────────────
export async function getConversation(matchId: string) {
  return authGet(`/conversation/${matchId}`);
}

export async function sendMessage(matchId: string, message: string) {
  return authPost('/conversation/', { match_id: matchId, message });
}

export async function unlockNextTopic(matchId: string) {
  return authPost(`/conversation/${matchId}/unlock-topic`, {});
}

export async function signalReady(matchId: string) {
  return authPost(`/conversation/${matchId}/signal-ready`, {});
}

export async function inviteWali(matchId: string) {
  return authPost(`/conversation/${matchId}/invite-wali`, {});
}

// ── Decision ──────────────────────────────────────────────────────────
export async function submitDecision(matchId: string, outcome: 'proceed' | 'pause' | 'close') {
  return authPost(`/decision/${matchId}`, { outcome });
}

// ── Safety ────────────────────────────────────────────────────────────
export async function fileSafetyReport(reportedUid: string, reason: string) {
  return authPost('/safety/report', { reported_uid: reportedUid, reason });
}

export async function getSafetyReports() {
  return authGet('/safety/reports');
}

export async function reviewReport(reportId: string, action: 'ban' | 'dismiss') {
  return authPost(`/safety/review/${reportId}`, { action });
}

// ── KYC ───────────────────────────────────────────────────────────────
export async function initiateKyc() {
  return authPost('/kyc/initiate', {});
}

export async function submitKyc(sessionId: string, idDocumentBase64: string, selfieBase64: string) {
  return authPost('/kyc/submit', {
    session_id: sessionId,
    id_document_base64: idDocumentBase64,
    selfie_base64: selfieBase64,
  });
}

export async function getKycStatus() {
  return authGet('/kyc/status');
}
