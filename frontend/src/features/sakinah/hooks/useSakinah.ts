import { useState, useEffect } from 'react';
import {
  getPool,
  getActiveMatches,
  getConversation,
  expressInterest,
  silentPass,
  unlockNextTopic,
  submitDecision,
  fileSafetyReport,
  getKycStatus,
  initiateKyc,
  submitKyc,
} from '../services/sakinahService';

// ── Pool hook ─────────────────────────────────────────────────────────
export function usePool() {
  const [pool, setPool] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPool()
      .then((data) => setPool(data.pool || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const handleInterest = async (toUid: string) => {
    const result = await expressInterest(toUid);
    setPool((prev) => prev.filter((p) => p.uid !== toUid));
    return result;
  };

  const handlePass = async (toUid: string) => {
    await silentPass(toUid);
    setPool((prev) => prev.filter((p) => p.uid !== toUid));
  };

  return { pool, loading, error, handleInterest, handlePass };
}

// ── Matches hook ──────────────────────────────────────────────────────
export function useMatches() {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getActiveMatches()
      .then((data) => setMatches(data.matches || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { matches, loading, error };
}

// ── Conversation hook ─────────────────────────────────────────────────
export function useConversation(matchId: string) {
  const [conversation, setConversation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matchId) return;
    getConversation(matchId)
      .then((data) => setConversation(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [matchId]);

  const handleUnlockTopic = async () => {
    const result = await unlockNextTopic(matchId);
    setConversation((prev: any) => ({
      ...prev,
      unlocked_topics: result.unlocked_topics,
    }));
    return result;
  };

  const handleDecision = async (outcome: 'proceed' | 'pause' | 'close') => {
    return submitDecision(matchId, outcome);
  };

  return { conversation, loading, error, handleUnlockTopic, handleDecision };
}

// ── KYC hook ──────────────────────────────────────────────────────────
export function useKyc() {
  const [kycStatus, setKycStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getKycStatus()
      .then((data) => setKycStatus(data))
      .catch(() => setKycStatus({ is_verified: false, is_matchable: false }))
      .finally(() => setLoading(false));
  }, []);

  const handleInitiateKyc = async () => {
    return initiateKyc();
  };

  const handleSubmitKyc = async (sessionId: string, idDoc: string, selfie: string) => {
    const result = await submitKyc(sessionId, idDoc, selfie);
    if (result.status === 'approved') {
      setKycStatus({ is_verified: true, is_matchable: true });
    }
    return result;
  };

  return { kycStatus, loading, handleInitiateKyc, handleSubmitKyc };
}

// ── Safety hook ───────────────────────────────────────────────────────
export function useSafety() {
  const handleReport = async (reportedUid: string, reason: string) => {
    return fileSafetyReport(reportedUid, reason);
  };
  return { handleReport };
}
