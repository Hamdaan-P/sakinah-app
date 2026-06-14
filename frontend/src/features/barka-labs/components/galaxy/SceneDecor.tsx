/**
 * Background star dust, nebula fog, constellation lines, and camera auto-orbit
 * for the Blessing Galaxy scene.
 */

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/* ── Constellation lines connecting nearby stars ── */
export function ConstellationLines({ positions }: { positions: [number, number, number][] }) {
  const geometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    const maxDist = 4;

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const a = new THREE.Vector3(...positions[i]);
        const b = new THREE.Vector3(...positions[j]);
        if (a.distanceTo(b) < maxDist) {
          points.push(a, b);
        }
      }
    }

    return new THREE.BufferGeometry().setFromPoints(points);
  }, [positions]);

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color="#D7B56A" transparent opacity={0.06} />
    </lineSegments>
  );
}

/* ── Background star dust (tiny particles) ── */
export function StarDust() {
  const count = 800;
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 40;
      arr[i * 3 + 2] = (Math.random() - 0.5) * 40;
    }
    return arr;
  }, []);

  const ref = useRef<THREE.Points>(null);
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.01;
      ref.current.rotation.x = state.clock.elapsedTime * 0.005;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial color="#D7B56A" size={0.03} transparent opacity={0.4} sizeAttenuation />
    </points>
  );
}

/* ── Nebula fog (subtle colored planes) ── */
export function NebulaFog() {
  const ref = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <group ref={ref}>
      {[
        { pos: [3, 1, -5] as [number, number, number], color: '#D7B56A', scale: 8 },
        { pos: [-4, -1, -3] as [number, number, number], color: '#4A9EFF', scale: 6 },
        { pos: [0, 2, -8] as [number, number, number], color: '#E84393', scale: 5 },
      ].map((nebula, i) => (
        <mesh key={i} position={nebula.pos}>
          <planeGeometry args={[nebula.scale, nebula.scale]} />
          <meshBasicMaterial
            color={nebula.color}
            transparent
            opacity={0.02}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/* ── Camera auto-orbit ── */
export function AutoOrbit() {
  const { camera } = useThree();
  const angle = useRef(0);

  useFrame((_, delta) => {
    angle.current += delta * 0.05;
    const radius = 12;
    camera.position.x = Math.sin(angle.current) * radius;
    camera.position.z = Math.cos(angle.current) * radius;
    camera.position.y = 2 + Math.sin(angle.current * 0.3) * 1.5;
    camera.lookAt(0, 0, 0);
  });

  return null;
}
