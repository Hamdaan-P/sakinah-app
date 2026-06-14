/**
 * Notification Types
 * Mirrors Flutter's domain/models/notification_model.dart
 */

export type NotificationType = 'system' | 'update' | 'announcement' | 'general';

export const NOTIFICATION_TYPE_CONFIG: Record<
  NotificationType,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  system: { label: 'System', icon: 'Settings', color: 'text-gray-400', bgColor: 'bg-gray-400/10' },
  update: { label: 'Update', icon: 'RefreshCw', color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
  announcement: { label: 'Announcement', icon: 'Megaphone', color: 'text-[#D4A853]', bgColor: 'bg-amber-400/10' },
  general: { label: 'General', icon: 'Bell', color: 'text-[#D4A853]', bgColor: 'bg-[#D4A853]/10' },
};

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  isRead: boolean;
  createdAt: Date;
  imageUrl?: string;
  actionUrl?: string;
  data?: Record<string, unknown>;
}

export interface NotificationsState {
  notifications: NotificationItem[];
  unreadCount: number;
  selectedFilter: NotificationType | null;
  isLoading: boolean;
  error: string | null;
}

/** Parse Firestore document to NotificationItem */
export function parseNotification(id: string, data: Record<string, unknown>): NotificationItem {
  const createdAt = data.createdAt;
  let date: Date;

  if (createdAt && typeof createdAt === 'object' && 'toDate' in createdAt) {
    date = (createdAt as { toDate: () => Date }).toDate();
  } else if (typeof createdAt === 'string') {
    date = new Date(createdAt);
  } else {
    date = new Date();
  }

  return {
    id,
    title: (data.title as string) ?? 'Notification',
    body: (data.message as string) ?? (data.body as string) ?? '',
    type: parseNotificationType(data.type as string),
    isRead: (data.read as boolean) ?? false,
    createdAt: date,
    imageUrl: data.imageUrl as string | undefined,
    actionUrl: data.actionUrl as string | undefined,
    data: data.data as Record<string, unknown> | undefined,
  };
}

function parseNotificationType(value?: string): NotificationType {
  if (!value) return 'general';
  const lower = value.toLowerCase();
  if (lower === 'system' || lower === 'update' || lower === 'announcement' || lower === 'general') {
    return lower;
  }
  return 'general';
}

/** Format relative time like Flutter's _formatTime */
export function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
}
