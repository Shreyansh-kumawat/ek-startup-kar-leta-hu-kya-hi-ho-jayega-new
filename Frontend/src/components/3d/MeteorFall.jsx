import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

// ─────────────────────────────────────────────────────────────────────────────
// METEOR TRAIL — Particle trail that follows the meteor head
// ─────────────────────────────────────────────────────────────────────────────
function MeteorTrail({ headPosition, scrollProgress }) {
  const trailRef = useRef();
  const TRAIL_COUNT = 120;

  // Ring buffer to store recent head positions
  const historyRef = useRef(
    Array.from({ length: TRAIL_COUNT }, () => new THREE.Vector3(12, 16, -3))
  );
  const frameRef = useRef(0);

  const positions = useMemo(() => new Float32Array(TRAIL_COUNT * 3), []);
  const alphas    = useMemo(() => {
    const a = new Float32Array(TRAIL_COUNT);
    for (let i = 0; i < TRAIL_COUNT; i++) a[i] = 1 - i / TRAIL_COUNT;
    return a;
  }, []);

  useFrame(() => {
    if (!trailRef.current || !headPosition.current) return;

    // Push new head position into ring buffer
    frameRef.current = (frameRef.current + 1) % TRAIL_COUNT;
    historyRef.current[frameRef.current].copy(headPosition.current);

    // Write history into buffer in order (newest → oldest)
    for (let i = 0; i < TRAIL_COUNT; i++) {
      const idx = (frameRef.current - i + TRAIL_COUNT) % TRAIL_COUNT;
      const v   = historyRef.current[idx];
      positions[i * 3]     = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
    }

    trailRef.current.geometry.attributes.position.needsUpdate = true;

    // Trail visibility — only show while meteor is falling
    const r = scrollProgress.current;
    trailRef.current.material.opacity = r < 0.38
      ? Math.min(r / 0.05, 1) * 0.75
      : Math.max(0, (0.42 - r) / 0.04) * 0.75;
  });

  return (
    <points ref={trailRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={TRAIL_COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.22}
        color="#ff7733"
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        vertexColors={false}
      />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// IMPACT BURST — Particle explosion when meteor hits "ground"
// ─────────────────────────────────────────────────────────────────────────────
function ImpactBurst({ triggered, impactPosition }) {
  const ref = useRef();
  const COUNT = 200;
  const aliveRef = useRef(false);
  const progressRef = useRef(0);

  const { positions, velocities } = useMemo(() => {
    const positions   = new Float32Array(COUNT * 3);
    const velocities  = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT; i++) {
      positions[i * 3]     = 0;
      positions[i * 3 + 1] = 0;
      positions[i * 3 + 2] = 0;

      // Random burst directions — mostly outward and upward
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.random() * Math.PI * 0.6;
      const speed = 0.08 + Math.random() * 0.18;

      velocities[i * 3]     = speed * Math.sin(phi) * Math.cos(theta);
      velocities[i * 3 + 1] = speed * (0.3 + Math.random() * 0.7);
      velocities[i * 3 + 2] = speed * Math.sin(phi) * Math.sin(theta);
    }

    return { positions, velocities };
  }, []);

  // Reset burst when re-triggered
  useEffect(() => {
    if (triggered) {
      aliveRef.current  = true;
      progressRef.current = 0;

      // Reset positions to impact point
      for (let i = 0; i < COUNT; i++) {
        positions[i * 3]     = impactPosition.x;
        positions[i * 3 + 1] = impactPosition.y;
        positions[i * 3 + 2] = impactPosition.z;
      }
    }
  }, [triggered]);

  useFrame((_, delta) => {
    if (!ref.current || !aliveRef.current) return;

    progressRef.current = Math.min(progressRef.current + delta * 0.8, 1);
    const p = progressRef.current;

    const posArray = ref.current.geometry.attributes.position.array;

    for (let i = 0; i < COUNT; i++) {
      // Integrate position
      posArray[i * 3]     = positions[i * 3]     + velocities[i * 3]     * p * 12;
      posArray[i * 3 + 1] = positions[i * 3 + 1] + velocities[i * 3 + 1] * p * 12
                            - 0.5 * 9.8 * 0.01 * p * p * 12; // gravity
      posArray[i * 3 + 2] = positions[i * 3 + 2] + velocities[i * 3 + 2] * p * 12;
    }

    ref.current.geometry.attributes.position.needsUpdate = true;

    // Fade out
    ref.current.material.opacity = p < 0.3 ? p / 0.3 : (1 - p);

    if (p >= 1) aliveRef.current = false;
  });

  return (
    <points ref={ref}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={COUNT}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.18}
        color="#ffaa44"
        transparent
        opacity={0}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// METEOR CORE — The main rock mesh with glow layers
// ─────────────────────────────────────────────────────────────────────────────
function MeteorCore({ headPosition, scrollProgress }) {
  const coreRef  = useRef();
  const glowRef  = useRef();
  const outerRef = useRef();
  const lightRef = useRef();

  const [impactTriggered, setImpactTriggered] = useState(false);
  const [impactPos]       = useState(new THREE.Vector3(0, -1.5, 2));
  const hasImpacted       = useRef(false);

  useFrame(({ clock }) => {
    const r = scrollProgress.current;

    // ── Trajectory ──────────────────────────────────────────────────────────
    // Meteor is visible from scroll 0 → 0.40
    // It falls from top-right toward center-screen
    const START  = { x: 13,  y: 17,  z: -3 };
    const LAND   = { x: 0,   y: -1.5, z:  2 };
    const progress = Math.min(r / 0.36, 1); // 0 at r=0, 1 at r=0.36

    const easedProgress = progress < 1
      ? 1 - Math.pow(1 - progress, 3) // ease-in-cubic (accelerates downward)
      : 1;

    const x = THREE.MathUtils.lerp(START.x, LAND.x, easedProgress);
    const y = THREE.MathUtils.lerp(START.y, LAND.y, easedProgress);
    const z = THREE.MathUtils.lerp(START.z, LAND.z, easedProgress);

    // Update shared position ref for trail
    headPosition.current.set(x, y, z);

    if (!coreRef.current) return;

    coreRef.current.position.set(x, y, z);

    // ── Rotation — tumbles as it falls ──────────────────────────────────────
    coreRef.current.rotation.x += 0.025 * (1 + easedProgress);
    coreRef.current.rotation.y += 0.018 * (1 + easedProgress);
    coreRef.current.rotation.z  = -0.6 + easedProgress * 0.3;

    // ── Glow layers ─────────────────────────────────────────────────────────
    if (glowRef.current) {
      glowRef.current.position.copy(coreRef.current.position);
      // Pulse glow intensity as it approaches
      const pulse = 1 + Math.sin(clock.elapsedTime * 8) * 0.15 * easedProgress;
      glowRef.current.scale.setScalar(pulse * (1 + easedProgress * 0.4));
    }

    if (outerRef.current) {
      outerRef.current.position.copy(coreRef.current.position);
      outerRef.current.scale.setScalar(1.2 + easedProgress * 0.6);
    }

    // ── Point light follows meteor ───────────────────────────────────────────
    if (lightRef.current) {
      lightRef.current.position.copy(coreRef.current.position);
      lightRef.current.intensity = 3 + easedProgress * 8;
    }

    // ── Visibility ───────────────────────────────────────────────────────────
    const visible = r < 0.42;
    coreRef.current.visible  = visible;
    if (glowRef.current)  glowRef.current.visible  = visible;
    if (outerRef.current) outerRef.current.visible  = visible;
    if (lightRef.current) lightRef.current.visible  = visible;

    // ── Impact shake + burst ─────────────────────────────────────────────────
    if (easedProgress >= 0.99 && !hasImpacted.current && r < 0.42) {
      hasImpacted.current = true;
      setImpactTriggered(true);
      setTimeout(() => setImpactTriggered(false), 100);
    }

    // Shake on landing
    if (easedProgress > 0.95 && r < 0.42) {
      const shake = (1 - easedProgress) * 0.15;
      coreRef.current.position.x += (Math.random() - 0.5) * shake;
      coreRef.current.position.y += (Math.random() - 0.5) * shake;
    }
  });

  return (
    <>
      {/* Point light — rides the meteor */}
      <pointLight
        ref={lightRef}
        color="#ff5500"
        intensity={5}
        distance={12}
        decay={2}
        position={[13, 17, -3]}
      />

      {/* Core rock */}
      <mesh ref={coreRef} position={[13, 17, -3]}>
        <icosahedronGeometry args={[0.38, 2]} />
        <meshStandardMaterial
          color="#cc3300"
          emissive="#ff4400"
          emissiveIntensity={2.5}
          roughness={0.85}
          metalness={0.1}
        />
      </mesh>

      {/* Inner glow */}
      <mesh ref={glowRef} position={[13, 17, -3]}>
        <sphereGeometry args={[0.52, 16, 16]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.18}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Outer halo */}
      <mesh ref={outerRef} position={[13, 17, -3]}>
        <sphereGeometry args={[0.75, 12, 12]} />
        <meshBasicMaterial
          color="#ff3300"
          transparent
          opacity={0.07}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* Label on meteor */}
      <group position={[13, 17, -3]} ref={null}>
        <Html
          position={[0, 0.65, 0]}
          center
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          <div style={{
            color: '#fff',
            fontFamily: 'monospace',
            fontSize: '9px',
            fontWeight: 'bold',
            letterSpacing: '0.15em',
            textShadow: '0 0 10px #ff6600, 0 0 20px #ff4400',
            whiteSpace: 'nowrap',
            opacity: 0.92,
          }}>
            ⚡ 3DIGREE INCOMING
          </div>
        </Html>
      </group>

      {/* Impact burst */}
      <ImpactBurst triggered={impactTriggered} impactPosition={impactPos} />
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// METEOR FALL — Main export, composes core + trail
// ─────────────────────────────────────────────────────────────────────────────
export default function MeteorFall({ scrollProgress }) {
  // Shared ref so trail can read meteor head position each frame
  const headPosition = useRef(new THREE.Vector3(13, 17, -3));

  return (
    <group>
      <MeteorCore
        headPosition={headPosition}
        scrollProgress={scrollProgress}
      />
      <MeteorTrail
        headPosition={headPosition}
        scrollProgress={scrollProgress}
      />
    </group>
  );
}
