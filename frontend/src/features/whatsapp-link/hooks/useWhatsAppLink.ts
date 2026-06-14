/**
 * useWhatsAppLink — TanStack Query hooks for the WhatsApp linking flow.
 *
 * Three concerns:
 *   1. ``useLinkStatus`` — reactive read of the current link state.
 *      Polls every 3s while the user is in the linking flow (the
 *      enabled flag is owned by the caller / page).
 *   2. ``useMintLinkToken`` — mutation that mints + returns the wa.me
 *      deep link.
 *   3. ``useUnlinkWhatsApp`` — mutation with optimistic invalidation
 *      of the status query.
 */

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationOptions,
  type UseQueryOptions,
} from '@tanstack/react-query';
import {
  getLinkStatus,
  mintLinkToken,
  unlinkWhatsApp,
} from '../services/whatsappLinkService';
import type {
  LinkStatus,
  MintTokenResponse,
  UnlinkResponse,
} from '../types/whatsappLink.types';

export const WHATSAPP_LINK_STATUS_QUERY_KEY = ['whatsapp', 'link-status'] as const;

/** Polling interval while waiting for the user to complete the deep-link
 * flow. 3 seconds is responsive without hammering the backend; the
 * backend endpoint is a cheap Firestore read. */
export const POLL_INTERVAL_MS = 3000;

/** Maximum total poll window — 5 minutes. After this we stop polling
 * and the user must restart the flow. Matches the linking-token TTL of
 * 24h conceptually but the user's attention span is the binding limit. */
export const POLL_MAX_DURATION_MS = 5 * 60 * 1000;

export function useLinkStatus(
  options?: Partial<UseQueryOptions<LinkStatus>>,
) {
  return useQuery<LinkStatus>({
    queryKey: WHATSAPP_LINK_STATUS_QUERY_KEY,
    queryFn: getLinkStatus,
    staleTime: 5_000,
    ...options,
  });
}

export function useMintLinkToken(
  options?: UseMutationOptions<MintTokenResponse, Error, void>,
) {
  return useMutation<MintTokenResponse, Error, void>({
    mutationFn: mintLinkToken,
    ...options,
  });
}

export function useUnlinkWhatsApp(
  options?: UseMutationOptions<UnlinkResponse, Error, void>,
) {
  const qc = useQueryClient();
  return useMutation<UnlinkResponse, Error, void>({
    mutationFn: unlinkWhatsApp,
    onSuccess: (...args) => {
      void qc.invalidateQueries({ queryKey: WHATSAPP_LINK_STATUS_QUERY_KEY });
      options?.onSuccess?.(...args);
    },
    onError: options?.onError,
    onSettled: options?.onSettled,
  });
}
