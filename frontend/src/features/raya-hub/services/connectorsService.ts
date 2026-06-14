/**
 * Connectors service — wraps the backend connector endpoints
 * (`app/routes/connectors.py`):
 *
 *   GET    /connectors                  → { connectors: ConnectorInfo[] }
 *   POST   /connectors/{id}/connect     → { auth_url }   (redirect the browser here)
 *   DELETE /connectors/{id}             → { disconnected }
 */

import { authDelete, authGet, authPost } from '@/lib/api';

export interface ConnectorInfo {
  id: string;
  name: string;
  description: string;
  icon: string;       // phosphor icon name
  category: string;
  connected: boolean;
  available: boolean; // server has OAuth creds → can actually be connected
}

export async function listConnectors(): Promise<{ connectors: ConnectorInfo[] }> {
  return authGet<{ connectors: ConnectorInfo[] }>('/connectors');
}

export async function startConnect(connectorId: string): Promise<{ auth_url: string }> {
  return authPost<{ auth_url: string }>(`/connectors/${encodeURIComponent(connectorId)}/connect`, {});
}

export async function disconnectConnector(connectorId: string): Promise<{ disconnected: boolean }> {
  return authDelete<{ disconnected: boolean }>(`/connectors/${encodeURIComponent(connectorId)}`);
}
