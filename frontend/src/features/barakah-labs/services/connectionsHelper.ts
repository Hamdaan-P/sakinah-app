import * as conn from '@/features/connections/services/connectionService';
import { getPublicProfileByUid } from '@/features/public-profile/services/publicProfileService';
import type { Recipient } from '../stores/barakah-flow.store';

function nameOf(uid: string, profile: { fullName: string | null; displayName: string | null } | null): string {
  return profile?.displayName?.trim() || profile?.fullName?.trim() || uid.slice(0, 6);
}

export async function loadConnections(me: string): Promise<Recipient[]> {
  const docs = await conn.listConnections(me);
  const peers = docs.map((c) => conn.otherUid(me, c));
  const profiles = await Promise.all(peers.map((u) => getPublicProfileByUid(u).catch(() => null)));
  return peers.map((uid, i) => ({
    id: uid,
    name: nameOf(uid, profiles[i]),
    role: profiles[i]?.profession ?? undefined,
  }));
}
