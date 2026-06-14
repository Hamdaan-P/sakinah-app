/**
 * Blessing Galaxy — Full 3D WebGL constellation
 *
 * Each blessing is a star in 3D space:
 *   Profound = golden sun with bloom halo
 *   Thoughtful = blue-white star
 *   Common = dim silver point
 *
 * Stars are connected by faint golden lines (constellation).
 * Camera auto-orbits slowly. Click a star → decomposition.
 */

import { useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import type { Blessing } from '../types/barka-labs.types';
import { hashPosition } from './galaxy/_constants';
import { StarNode } from './galaxy/StarNode';
import { ConstellationLines, StarDust, NebulaFog, AutoOrbit } from './galaxy/SceneDecor';

interface BlessingGalaxyProps {
  blessings: Blessing[];
  onStarClick: (blessingId: string) => void;
  selectedId: string | null;
}

export function BlessingGalaxy({ blessings, onStarClick, selectedId }: BlessingGalaxyProps) {
  const starPositions = useMemo(
    () => blessings.map((b, i) => hashPosition(b.id, i, blessings.length)),
    [blessings],
  );

  return (
    <div style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }}>
      <Canvas
        camera={{ position: [0, 2, 12], fov: 50 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        style={{ background: '#0A0E1A' }}
        onCreated={({ gl }) => {
          gl.setClearColor('#0A0E1A', 1);
        }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.15} />
        <pointLight position={[0, 0, 0]} intensity={0.5} color="#D7B56A" />

        {/* Background elements */}
        <StarDust />
        <NebulaFog />

        {/* Constellation connections */}
        {starPositions.length > 1 && <ConstellationLines positions={starPositions} />}

        {/* Blessing stars */}
        {blessings.map((blessing, i) => (
          <StarNode
            key={blessing.id}
            blessing={blessing}
            position={starPositions[i]}
            onClick={onStarClick}
            isSelected={selectedId === blessing.id}
          />
        ))}

        {/* Camera control */}
        <AutoOrbit />
        <OrbitControls
          enableZoom
          enablePan={false}
          minDistance={5}
          maxDistance={25}
          autoRotate={false}
        />

        {/* Bloom glow — wrapped in try-catch via ErrorBoundary */}
        <EffectComposer>
          <Bloom
            luminanceThreshold={0.2}
            luminanceSmoothing={0.9}
            intensity={1.2}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
