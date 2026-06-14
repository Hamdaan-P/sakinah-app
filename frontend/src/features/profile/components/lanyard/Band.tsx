/**
 * Band — physics rope + draggable card mesh for the Lanyard scene.
 *
 * Verbatim from Lanyard.tsx — no behavior changes. The Three.js / Rapier
 * refs and useFrame closure are preserved exactly so drag/joint semantics
 * stay identical.
 */

import { useEffect, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, useTexture } from '@react-three/drei';
import {
  BallCollider,
  CuboidCollider,
  RigidBody,
  useRopeJoint,
  useSphericalJoint,
} from '@react-three/rapier';
import type { RigidBodyProps } from '@react-three/rapier';
import type { ThreeEvent } from '@react-three/fiber';
import * as THREE from 'three';

import cardGLB from './card.glb';
import lanyard from './lanyard.png';
import { useCardTexture } from './_useCardTexture';

interface BandProps {
  maxSpeed?: number;
  minSpeed?: number;
  isMobile?: boolean;
  userName?: string;
  publicUrl?: string;
  avatarInitial?: string;
}

export function Band({
  maxSpeed = 50,
  minSpeed = 0,
  isMobile = false,
  userName,
  publicUrl,
  avatarInitial,
}: BandProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- @react-three/rapier rigid body refs are augmented at runtime (e.g. `.lerped`); proper typing would conflict with joint hook signatures
  const band = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
  const fixed = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
  const j1 = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
  const j2 = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
  const j3 = useRef<any>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- see above
  const card = useRef<any>(null);

  const vec = new THREE.Vector3();
  const ang = new THREE.Vector3();
  const rot = new THREE.Vector3();
  const dir = new THREE.Vector3();

  const segmentProps: Partial<RigidBodyProps> = {
    type: 'dynamic' as RigidBodyProps['type'],
    canSleep: true,
    colliders: false,
    angularDamping: 4,
    linearDamping: 4
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- useGLTF returns dynamic structure; project types are not generated for this GLB
  const { nodes, materials } = useGLTF(cardGLB) as any;
  const texture = useTexture(lanyard);
  const [curve] = useState(
    () =>
      new THREE.CatmullRomCurve3([new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()])
  );
  const [dragged, drag] = useState<false | THREE.Vector3>(false);
  const [hovered, hover] = useState(false);
  const cardTexture = useCardTexture({ userName, publicUrl, avatarInitial });

  useRopeJoint(fixed, j1, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j1, j2, [[0, 0, 0], [0, 0, 0], 1]);
  useRopeJoint(j2, j3, [[0, 0, 0], [0, 0, 0], 1]);
  useSphericalJoint(j3, card, [
    [0, 0, 0],
    [0, 1.45, 0]
  ]);

  useEffect(() => {
    if (hovered) {
      document.body.style.cursor = dragged ? 'grabbing' : 'grab';
      return () => {
        document.body.style.cursor = 'auto';
      };
    }
  }, [hovered, dragged]);

  useFrame((state, delta) => {
    if (dragged && typeof dragged !== 'boolean') {
      vec.set(state.pointer.x, state.pointer.y, 0.5).unproject(state.camera);
      dir.copy(vec).sub(state.camera.position).normalize();
      vec.add(dir.multiplyScalar(state.camera.position.length()));
      [card, j1, j2, j3, fixed].forEach(ref => ref.current?.wakeUp());
      card.current?.setNextKinematicTranslation({
        x: vec.x - dragged.x,
        y: vec.y - dragged.y,
        z: vec.z - dragged.z
      });
    }
    if (fixed.current) {
      [j1, j2].forEach(ref => {
        if (!ref.current.lerped) ref.current.lerped = new THREE.Vector3().copy(ref.current.translation());
        const clampedDistance = Math.max(0.1, Math.min(1, ref.current.lerped.distanceTo(ref.current.translation())));
        ref.current.lerped.lerp(
          ref.current.translation(),
          delta * (minSpeed + clampedDistance * (maxSpeed - minSpeed))
        );
      });
      curve.points[0].copy(j3.current.translation());
      curve.points[1].copy(j2.current.lerped);
      curve.points[2].copy(j1.current.lerped);
      curve.points[3].copy(fixed.current.translation());
      band.current.geometry.setPoints(curve.getPoints(isMobile ? 16 : 32));
      ang.copy(card.current.angvel());
      rot.copy(card.current.rotation());
      card.current.setAngvel({ x: ang.x, y: ang.y - rot.y * 0.25, z: ang.z });
    }
  });

  curve.curveType = 'chordal';
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  return (
    <>
      <group position={[0, 4, 0]}>
        <RigidBody ref={fixed} {...segmentProps} type={'fixed' as RigidBodyProps['type']} />
        <RigidBody position={[0.5, 0, 0]} ref={j1} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1, 0, 0]} ref={j2} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody position={[1.5, 0, 0]} ref={j3} {...segmentProps} type={'dynamic' as RigidBodyProps['type']}>
          <BallCollider args={[0.1]} />
        </RigidBody>
        <RigidBody
          position={[2, 0, 0]}
          ref={card}
          {...segmentProps}
          type={dragged ? ('kinematicPosition' as RigidBodyProps['type']) : ('dynamic' as RigidBodyProps['type'])}
        >
          <CuboidCollider args={[0.8, 1.125, 0.01]} />
          {/* Card face — flat plane matching the collider, with dynamic QR texture */}
          {cardTexture && (
            <mesh
              onPointerOver={() => hover(true)}
              onPointerOut={() => hover(false)}
              onPointerUp={(e: ThreeEvent<PointerEvent>) => {
                (e.target as Element).releasePointerCapture(e.pointerId);
                drag(false);
              }}
              onPointerDown={(e: ThreeEvent<PointerEvent>) => {
                (e.target as Element).setPointerCapture(e.pointerId);
                drag(new THREE.Vector3().copy(e.point).sub(vec.copy(card.current.translation())));
              }}
            >
              <planeGeometry args={[1.6, 2.25]} />
              {/* Unlit material so the texture shows at full clarity, unaffected by scene lighting */}
              <meshBasicMaterial
                map={cardTexture}
                toneMapped={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
          {/* Original GLB card geometry as fallback while QR texture loads, plus the metal clip/clamp */}
          <group scale={2.25} position={[0, -1.2, -0.05]}>
            {!cardTexture && (
              <mesh geometry={nodes.card.geometry}>
                <meshPhysicalMaterial
                  map={materials.base.map}
                  map-anisotropy={16}
                  clearcoat={isMobile ? 0 : 1}
                  clearcoatRoughness={0.15}
                  roughness={0.9}
                  metalness={0.8}
                />
              </mesh>
            )}
            <mesh geometry={nodes.clip.geometry} material={materials.metal} material-roughness={0.3} />
            <mesh geometry={nodes.clamp.geometry} material={materials.metal} />
          </group>
        </RigidBody>
      </group>
      <mesh ref={band}>
        <meshLineGeometry />
        <meshLineMaterial
          color="white"
          depthTest={false}
          resolution={isMobile ? [1000, 2000] : [1000, 1000]}
          useMap
          map={texture}
          repeat={[-4, 1]}
          lineWidth={1}
        />
      </mesh>
    </>
  );
}
