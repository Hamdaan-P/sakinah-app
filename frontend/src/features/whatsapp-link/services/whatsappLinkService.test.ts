/**
 * Unit tests for whatsappLinkService — verify the service layer hits
 * the right backend endpoints with the right shapes. Mocks @/lib/api
 * so no real network calls happen.
 */

import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/lib/api', () => ({
  authPost: vi.fn(),
  authGet: vi.fn(),
  authDelete: vi.fn(),
}));

import { authDelete, authGet, authPost } from '@/lib/api';
import {
  getLinkStatus,
  mintLinkToken,
  unlinkWhatsApp,
} from './whatsappLinkService';

const mockAuthPost = authPost as ReturnType<typeof vi.fn>;
const mockAuthGet = authGet as ReturnType<typeof vi.fn>;
const mockAuthDelete = authDelete as ReturnType<typeof vi.fn>;

describe('whatsappLinkService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('mintLinkToken', () => {
    it('POSTs to /whatsapp/linking/token and returns the response', async () => {
      mockAuthPost.mockResolvedValue({
        token: 'abc123',
        deep_link: 'https://wa.me/918765432100?text=link%20abc123',
        expires_at: '2026-05-17T12:00:00Z',
      });

      const result = await mintLinkToken();

      expect(mockAuthPost).toHaveBeenCalledWith('/whatsapp/linking/token', {});
      expect(result.token).toBe('abc123');
      expect(result.deep_link).toContain('wa.me');
    });

    it('propagates errors', async () => {
      mockAuthPost.mockRejectedValue(new Error('rate limited'));
      await expect(mintLinkToken()).rejects.toThrow('rate limited');
    });
  });

  describe('getLinkStatus', () => {
    it('GETs /whatsapp/link/status and returns the status', async () => {
      mockAuthGet.mockResolvedValue({
        linked: true,
        phone: '+918765432100',
        linked_at: '2026-05-16T10:30:00Z',
      });

      const result = await getLinkStatus();

      expect(mockAuthGet).toHaveBeenCalledWith('/whatsapp/link/status');
      expect(result.linked).toBe(true);
      expect(result.phone).toBe('+918765432100');
    });

    it('handles not-linked state', async () => {
      mockAuthGet.mockResolvedValue({
        linked: false,
        phone: null,
        linked_at: null,
      });

      const result = await getLinkStatus();
      expect(result.linked).toBe(false);
      expect(result.phone).toBeNull();
    });
  });

  describe('unlinkWhatsApp', () => {
    it('DELETEs /whatsapp/link', async () => {
      mockAuthDelete.mockResolvedValue({ unlinked: true });

      const result = await unlinkWhatsApp();

      expect(mockAuthDelete).toHaveBeenCalledWith('/whatsapp/link');
      expect(result.unlinked).toBe(true);
    });

    it('returns false when nothing was linked', async () => {
      mockAuthDelete.mockResolvedValue({ unlinked: false });
      const result = await unlinkWhatsApp();
      expect(result.unlinked).toBe(false);
    });
  });
});
