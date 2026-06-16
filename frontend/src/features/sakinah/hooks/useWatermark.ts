import { useState, useEffect } from 'react';

interface WatermarkOptions {
  photoUrl: string;
  viewerName: string;
  matchId?: string;
}

export function useWatermark({ photoUrl, viewerName }: WatermarkOptions): string | null {
  const [watermarkedUrl, setWatermarkedUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!photoUrl || !viewerName) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width || 600;
      canvas.height = img.height || 600;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw the original photo
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      // Corner stamp watermark
      const today = new Date();
      const dateStr = today.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
      const line1 = `Shared with ${viewerName}`;
      const line2 = `Sakinah • ${dateStr}`;

      const padding = 10;
      const stampPaddingX = 12;
      const stampPaddingY = 8;
      const fontSize1 = Math.max(13, Math.floor(canvas.width / 28));
      const fontSize2 = Math.max(11, Math.floor(canvas.width / 34));

      ctx.font = `bold ${fontSize1}px Arial, sans-serif`;
      const line1Width = ctx.measureText(line1).width;
      ctx.font = `${fontSize2}px Arial, sans-serif`;
      const line2Width = ctx.measureText(line2).width;

      const stampWidth = Math.max(line1Width, line2Width) + stampPaddingX * 2;
      const stampHeight = fontSize1 + fontSize2 + stampPaddingY * 2 + 6;

      const stampX = padding;
      const stampY = canvas.height - stampHeight - padding;

      // Dark background pill
      ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
      ctx.beginPath();
      ctx.roundRect(stampX, stampY, stampWidth, stampHeight, 6);
      ctx.fill();

      // Gold top line
      ctx.font = `bold ${fontSize1}px Arial, sans-serif`;
      ctx.fillStyle = 'rgba(201, 169, 110, 0.95)';
      ctx.fillText(line1, stampX + stampPaddingX, stampY + stampPaddingY + fontSize1);

      // White bottom line
      ctx.font = `${fontSize2}px Arial, sans-serif`;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.fillText(line2, stampX + stampPaddingX, stampY + stampPaddingY + fontSize1 + 6 + fontSize2);

      setWatermarkedUrl(canvas.toDataURL('image/jpeg', 0.92));
    };

    img.onerror = () => {
      // On error, show nothing rather than an unwatermarked photo
      setWatermarkedUrl(null);
    };

    img.src = photoUrl;
  }, [photoUrl, viewerName]);

  return watermarkedUrl;
}
