import React from 'react';
import { useWatermark } from '../hooks/useWatermark';

interface WatermarkedPhotoProps {
  photoUrl: string;
  viewerName: string;
  alt?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function WatermarkedPhoto({
  photoUrl,
  viewerName,
  alt = 'Profile photo',
  className,
  style,
}: WatermarkedPhotoProps) {
  const watermarkedUrl = useWatermark({ photoUrl, viewerName });

  if (!watermarkedUrl) {
    return (
      <div
        className={className}
        style={{
          background: 'linear-gradient(135deg, #f0e8d8 0%, #e8dcc8 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#b8a898',
          fontSize: '0.85rem',
          fontFamily: 'Georgia, serif',
          ...style,
        }}
      >
        Loading photo...
      </div>
    );
  }

  return (
    <img
      src={watermarkedUrl}
      alt={alt}
      className={className}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        pointerEvents: 'none',
        ...style,
      }}
      onContextMenu={(e) => e.preventDefault()}
      draggable={false}
    />
  );
}
