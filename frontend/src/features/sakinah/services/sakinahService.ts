import { authGet, authPost } from '../../../lib/api';
import { getAuth } from 'firebase/auth';

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

// ── Decision ──────────────────────────────────────────────────────────
export async function submitDecision(matchId: string, outcome: 'proceed' | 'pause' | 'close') {
  return authPost(`/decision/${matchId}`, { outcome });
}

// ── Safety ────────────────────────────────────────────────────────────
export async function fileSafetyReport(reportedUid: string, reason: string) {
  return authPost('/safety/report', { reported_uid: reportedUid, reason });
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
