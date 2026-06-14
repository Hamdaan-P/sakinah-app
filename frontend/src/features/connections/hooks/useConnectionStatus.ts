/**
 * useConnectionStatus — real-time subscription to the connection doc between
 * the signed-in user and some other profile owner. Returns a viewer-centric
 * view + imperative actions.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  acceptRequest,
  declineRequest,
  removeConnection,
  sendRequest,
  subscribeToConnection,
  toView,
} from '../services/connectionService';
import type { ConnectionDoc, ConnectionView } from '../types/connection.types';

type Result = {
  view: ConnectionView;
  loading: boolean;
  error: string | null;
  busy: boolean;
  connect: () => Promise<void>;
  accept: () => Promise<void>;
  decline: () => Promise<void>;
  remove: () => Promise<void>;
};

export function useConnectionStatus(
  me: string | undefined,
  other: string | undefined,
): Result {
  const [raw, setRaw] = useState<ConnectionDoc | null>(null);
  const [loading, setLoading] = useState<boolean>(!!me && !!other && me !== other);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (!me || !other || me === other) {
      setRaw(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const unsub = subscribeToConnection(me, other, (doc) => {
      if (!mounted.current) return;
      setRaw(doc);
      setLoading(false);
    });
    return () => unsub();
  }, [me, other]);

  const wrap = useCallback(
    async (fn: () => Promise<void>) => {
      if (!me || !other) return;
      setBusy(true);
      setError(null);
      try {
        await fn();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Something went wrong.');
      } finally {
        if (mounted.current) setBusy(false);
      }
    },
    [me, other],
  );

  const connect = useCallback(() => wrap(() => sendRequest(me!, other!)), [me, other, wrap]);
  const accept = useCallback(() => wrap(() => acceptRequest(me!, other!)), [me, other, wrap]);
  const decline = useCallback(() => wrap(() => declineRequest(me!, other!)), [me, other, wrap]);
  const remove = useCallback(() => wrap(() => removeConnection(me!, other!)), [me, other, wrap]);

  const view: ConnectionView = me && other ? toView(me, other, raw) : { kind: 'none' };

  return { view, loading, error, busy, connect, accept, decline, remove };
}
