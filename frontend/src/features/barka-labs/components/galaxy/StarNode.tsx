/**
 * Single 3D star node in the Blessing Galaxy with hover/select label.
 */

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text, Billboard } from '@react-three/drei';
import * as THREE from 'three';
import type { Blessing } from '../../types/barka-labs.types';
import { DEPTH_CONFIG } from './_constants';

interface StarNodeProps {
  blessing: Blessing;
  position: [number, number, number];
  onClick: (id: string) => void;
  isSelected: boolean;
}

export function StarNode({ blessing, position, onClick, isSelected }: StarNodeProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);
  const config = DEPTH_CONFIG[blessing.depth];
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime;

    // Gentle floating
    meshRef.current.position.y =
      position[1] + Math.sin(t * 0.5 + position[0]) * 0.08;

    // Pulse for profound
    if (blessing.depth === 'profound') {
      const pulse = 1 + Math.sin(t * 2) * 0.15;
      meshRef.current.scale.setScalar(pulse);
    }

    // Glow ring rotation
    if (glowRef.current) {
      glowRef.current.rotation.z = t * 0.3;
    }
  });

  return (
    <group position={position}>
      {/* Core star */}
      <mesh
        ref={meshRef}
        onClick={(e) => { e.stopPropagation(); onClick(blessing.id); }}
        onPointerOver={() => { setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'default'; }}
      >
        <sphereGeometry args={[config.size * (hovered ? 1.4 : 1), 16, 16]} />
        <meshStandardMaterial
          color={config.color}
          emissive={config.emissive}
          emissiveIntensity={hovered ? config.intensity * 1.8 : config.intensity}
          toneMapped={false}
        />
      </mesh>

      {/* Glow ring for profound */}
      {blessing.depth === 'profound' && (
        <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[config.size * 1.6, config.size * 2.2, 32]} />
          <meshBasicMaterial
            color="#D7B56A"
            transparent
            opacity={0.15}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}

      {/* Hover label */}
      {(hovered || isSelected) && (
        <Billboard position={[0, config.size + 0.6, 0]}>
          <Text
            fontSize={0.22}
            color="#EBDCB8"
            anchorX="center"
            anchorY="bottom"
            maxWidth={4}
            outlineWidth={0.02}
            outlineColor="#1E293A"
          >
            {blessing.text.slice(0, 60)}{blessing.text.length > 60 ? '...' : ''}
          </Text>
          <Text
            fontSize={0.13}
            color={config.color}
            anchorX="center"
            anchorY="top"
            position={[0, -0.08, 0]}
          >
            {blessing.depth.toUpperCase()} +{blessing.score}
          </Text>
        </Billboard>
      )}
    </group>
  );
}
