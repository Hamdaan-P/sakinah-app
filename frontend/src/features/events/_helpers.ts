/**
 * Pure helpers for the Events page. Phase 5 split.
 */

import type { EventCategory, EventFormat, SessionType } from './_types';

// Helper Functions
export const getTimeGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 18) return 'Good Afternoon';
  return 'Good Evening';
};

export const getFormatIcon = (format: EventFormat) => {
  switch (format) {
    case 'In-Person':
      return '🏢';
    case 'Virtual':
      return '💻';
    case 'Hybrid':
      return '🔄';
  }
};

export const getCategoryGradient = (category: EventCategory) => {
  switch (category) {
    case 'Business & Economics':
      return 'linear-gradient(135deg, #6B46C1 0%, #9333EA 100%)';
    case 'Technology':
      return 'linear-gradient(135deg, #0891B2 0%, #06B6D4 100%)';
    case 'Healthcare':
      return 'linear-gradient(135deg, #059669 0%, #10B981 100%)';
    case 'Education':
      return 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)';
    case 'Marketing':
      return 'linear-gradient(135deg, #EA580C 0%, #F97316 100%)';
  }
};

export const getSessionTypeColor = (type: SessionType) => {
  switch (type) {
    case 'keynote':
      return '#D4A853';
    case 'panel':
      return '#3B82F6';
    case 'workshop':
      return '#10B981';
    case 'networking':
      return '#F59E0B';
    case 'exhibition':
      return '#8B5CF6';
    case 'ceremony':
      return '#EC4899';
  }
};

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export const calculateDaysUntil = (dateStr: string) => {
  const now = new Date();
  const target = new Date(dateStr);
  const diff = target.getTime() - now.getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};
