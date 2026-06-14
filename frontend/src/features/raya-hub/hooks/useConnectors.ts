/**
 * useConnectors — TanStack Query hooks for the Raya hub connector toggles.
 *   - useConnectors(): list + per-user status
 *   - useStartConnect(): mutation → returns the OAuth URL to redirect to
 *   - useDisconnect(): mutation → revokes, then refetches the list
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  disconnectConnector,
  listConnectors,
  startConnect,
  type ConnectorInfo,
} from '../services/connectorsService';

const CONNECTORS_KEY = ['connectors'] as const;

export function useConnectors() {
  return useQuery<{ connectors: ConnectorInfo[] }>({
    queryKey: CONNECTORS_KEY,
    queryFn: listConnectors,
    staleTime: 30_000,
    retry: 1,
  });
}

export function useStartConnect() {
  return useMutation({ mutationFn: (id: string) => startConnect(id) });
}

export function useDisconnect() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => disconnectConnector(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: CONNECTORS_KEY }),
  });
}
