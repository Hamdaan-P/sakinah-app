/**
 * 5-star rating display. Phase 5 split from HalaqahAdminPage.tsx.
 */

import { Star } from '@phosphor-icons/react';

interface Props {
  rating: number;
}

export function StarRating({ rating }: Props) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={14}
          style={{
            fill: star <= rating ? '#D4A853' : 'transparent',
            color: star <= rating ? '#D4A853' : 'rgba(212,168,83,0.2)',
          }}
        />
      ))}
    </div>
  );
}
