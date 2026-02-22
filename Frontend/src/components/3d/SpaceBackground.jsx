import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const rand = (min, max) => Math.random() * (max - min) + min;

// ─────────────────────────────────────────────────────────────────────────────
// STAR FIELD
// ─────────────────────────────────────────────────────────────────────────────
export function StarField({ count = 3000 }) {
  const ref = useRef();

  const positions = useMemo(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count * 3; i++) {
      pos[i] = (Math.random() - 0.5) * 80;
    }
    return pos;
  }, [count]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.02;
      ref.current.rotation.x = state.clock.elapsedTime * 0.01;
    }
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        color="white"
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// SHOOTING STARS
// ─────────────────────────────────────────────────────────────────────────────
export function ShootingStars({ count = 4 }) {
  const groupRef = useRef();

  const starsData = useMemo(() => {
    return Array.from({ length: count }, (_, i) => ({
      nextFire:  rand(i * 1.5, i * 1.5 + 5),
      active:    false,
      age:        0,
      lifetime:   rand(0.45, 0.85),
      origin:    new THREE.Vector3(rand(-30, 30), rand(10, 22), rand(-20, 5)),
      dir:       new THREE.Vector3(rand(-1, -0.3), rand(-0.8, -0.3), rand(0.1, 0.5)).normalize(),
      speed:     rand(28, 48),
      length:    rand(3, 7),
    }));
  }, [count]);

  const lineObjects = useMemo(() => {
    return starsData.map(() => {
      const positions = new Float32Array(6);
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.LineBasicMaterial({
        color:       0xffffff,
        transparent:  true,
        opacity:      0,
        blending:     THREE.AdditiveBlending,
        depthWrite:   false,
      });
      const line   = new THREE.Line(geo, mat);
      line.visible = false;
      return line;
    });
  }, []);

  useEffect(() => {
    const group = groupRef.current;
    if (!group) return;
    lineObjects.forEach((line) => group.add(line));
    return () => lineObjects.forEach((line) => group.remove(line));
  }, [lineObjects]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    starsData.forEach((star, i) => {
      const line = lineObjects[i];
      if (!line) return;
      if (!star.active) {
        if (t >= star.nextFire) {
          star.active   = true;
          star.age      = 0;
          star.nextFire = t + rand(3.5, 9);
          star.origin.set(rand(-35, 35), rand(8, 24), rand(-25, 2));
          star.dir.set(rand(-1, -0.2), rand(-0.9, -0.3), rand(0.05, 0.45)).normalize();
          star.speed    = rand(28, 48);
          star.length   = rand(3, 7);
          star.lifetime = rand(0.45, 0.85);
        }
        line.visible = false;
        return;
      }
      star.age += delta;
      const progress = star.age / star.lifetime;
      if (progress >= 1) {
        star.active  = false;
        line.visible = false;
        return;
      }
      line.visible = true;
      const head = star.origin.clone().addScaledVector(star.dir, star.speed * star.age);
      const tail = head.clone().addScaledVector(star.dir, -star.length);
      const pos  = line.geometry.attributes.position.array;
      pos[0] = tail.x; pos[1] = tail.y; pos[2] = tail.z;
      pos[3] = head.x; pos[4] = head.y; pos[5] = head.z;
      line.geometry.attributes.position.needsUpdate = true;
      const alpha = progress < 0.15 ? progress / 0.15 : 1 - (progress - 0.15) / 0.85;
      line.material.opacity = alpha * 0.85;
    });
  });

  return <group ref={groupRef} />;
}

// ─────────────────────────────────────────────────────────────────────────────
// AMBIENT GLOW PLANES — very subtle, no visible orbs
// ─────────────────────────────────────────────────────────────────────────────
export function AmbientGlowPlanes() {
  const planeA = useRef();
  const planeB = useRef();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (planeA.current)
      planeA.current.material.opacity = 0.018 + Math.sin(t * 0.4) * 0.006;
    if (planeB.current)
      planeB.current.material.opacity = 0.014 + Math.cos(t * 0.3) * 0.005;
  });

  return (
    <group>
      <mesh ref={planeA} position={[-18, 14, -60]} rotation={[0, 0, 0.4]}>
        <planeGeometry args={[80, 50]} />
        <meshBasicMaterial
          color="#7c3aed"
          transparent
          opacity={0.018}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      <mesh ref={planeB} position={[20, -12, -70]} rotation={[0.1, -0.2, -0.3]}>
        <planeGeometry args={[90, 55]} />
        <meshBasicMaterial
          color="#06b6d4"
          transparent
          opacity={0.014}
          side={THREE.DoubleSide}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
}

// NebulaOrb export rakhte hain (import error na aaye) but use nahi karenge
export function NebulaOrb() { return null; }
