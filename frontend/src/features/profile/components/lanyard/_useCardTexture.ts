/**
 * Hook that owns the QR-code generation + CanvasTexture lifecycle for the
 * Lanyard card face. Extracted from Band so the parent stays under the
 * leaf LOC budget without disturbing useFrame closure semantics.
 */

import { useEffect, useState } from 'react';
import * as THREE from 'three';
import QRCode from 'qrcode';
import { drawCardFace } from './_drawCardFace';

interface Args {
  userName?: string;
  publicUrl?: string;
  avatarInitial?: string;
}

export function useCardTexture({ userName, publicUrl, avatarInitial }: Args) {
  const [cardTexture, setCardTexture] = useState<THREE.CanvasTexture | null>(null);
  const shouldCustomize = !!(userName && publicUrl);

  useEffect(() => {
    if (!shouldCustomize) return;
    let cancelled = false;
    (async () => {
      const dataUrl = await QRCode.toDataURL(publicUrl!, {
        width: 960,
        margin: 0,
        errorCorrectionLevel: 'H',
        color: { dark: '#0A0E16', light: '#ffffff' },
      });
      const img = new Image();
      img.src = dataUrl;
      await new Promise<void>((resolve) => {
        img.onload = () => resolve();
        img.onerror = () => resolve();
      });
      if (cancelled) return;
      const canvas = drawCardFace(userName!, avatarInitial || userName![0]?.toUpperCase() || 'Z', img);
      const tex = new THREE.CanvasTexture(canvas);
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 16;
      tex.minFilter = THREE.LinearMipmapLinearFilter;
      tex.magFilter = THREE.LinearFilter;
      tex.generateMipmaps = true;
      tex.needsUpdate = true;
      setCardTexture(tex);
    })();
    return () => {
      cancelled = true;
    };
  }, [shouldCustomize, userName, publicUrl, avatarInitial]);

  useEffect(() => {
    return () => {
      cardTexture?.dispose();
    };
  }, [cardTexture]);

  return cardTexture;
}
