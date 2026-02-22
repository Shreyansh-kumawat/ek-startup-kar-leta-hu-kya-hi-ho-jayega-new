import React, { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY — Sample N points uniformly on a mesh surface
// ─────────────────────────────────────────────────────────────────────────────
const sampleSurface = (geometry, count) => {
  const mesh    = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial());
  const sampler = new MeshSurfaceSampler(mesh).build();
  const out     = new Float32Array(count * 3);
  const tmp     = new THREE.Vector3();

  for (let i = 0; i < count; i++) {
    sampler.sample(tmp);
    out[i * 3]     = tmp.x;
    out[i * 3 + 1] = tmp.y;
    out[i * 3 + 2] = tmp.z;
  }

  return out;
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY — Rasterise text onto a canvas, extract white pixel positions,
//           then randomly sample `count` of them as 3D particle positions.
// ─────────────────────────────────────────────────────────────────────────────
const sampleTextParticles = (text, count) => {
  const W = 1024, H = 256;
  const canvas = document.createElement('canvas');
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 148px Arial';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, W / 2, H / 2);

  const { data } = ctx.getImageData(0, 0, W, H);
  const pool = [];

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (data[(y * W + x) * 4] > 128) {
        pool.push({
          x:  (x / W - 0.5) * 24,          // world-space width  ≈ 24 units
          y: -(y / H - 0.5) * 6,            // world-space height ≈  6 units
          z:  0,
        });
      }
    }
  }

  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = pool[Math.floor(Math.random() * pool.length)];
    // Tiny jitter so stacked particles catch the light differently
    out[i * 3]     = p.x + (Math.random() - 0.5) * 0.08;
    out[i * 3 + 1] = p.y + (Math.random() - 0.5) * 0.08;
    out[i * 3 + 2] = p.z + (Math.random() - 0.5) * 0.15;
  }

  return out;
};

// ─────────────────────────────────────────────────────────────────────────────
// UTILITY — Build per-particle colour array, lerping between two hex colours
// ─────────────────────────────────────────────────────────────────────────────
const buildColorArray = (count, hexA, hexB) => {
  const arr = new Float32Array(count * 3);
  const cA  = new THREE.Color(hexA);
  const cB  = new THREE.Color(hexB);

  for (let i = 0; i < count; i++) {
    const t = Math.random();
    const c = cA.clone().lerp(cB, t);
    arr[i * 3]     = c.r;
    arr[i * 3 + 1] = c.g;
    arr[i * 3 + 2] = c.b;
  }

  return arr;
};

// ─────────────────────────────────────────────────────────────────────────────
// SHAPES CONFIG
// scroll range 0.00 – 0.42  →  idle float   (meteor is falling, shape dormant)
// scroll range 0.42 – 0.54  →  DONUT
// scroll range 0.54 – 0.66  →  SPHERE
// scroll range 0.66 – 0.78  →  SATURN
// scroll range 0.78 – 0.90  →  "3Digree" text explosion
// ─────────────────────────────────────────────────────────────────────────────
const SCROLL = {
  DORMANT_END:   0.42,
  DONUT_START:   0.42,
  DONUT_END:     0.54,
  SPHERE_START:  0.54,
  SPHERE_END:    0.66,
  SATURN_START:  0.66,
  SATURN_END:    0.78,
  TEXT_START:    0.78,
  TEXT_END:      0.90,
};

const PARTICLE_COUNT = 22000;
const TEXT_COUNT     = 16000;

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PARTICLE MORPHING COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
export default function ParticleMorphing({ scrollProgress }) {
  const mainRef  = useRef();
  const textRef  = useRef();
  const groupRef = useRef();
  const { camera } = useThree();

  // ── Shape buffers (built once on mount) ────────────────────────────────────
  const [shapes, setShapes]         = useState(null);
  const [textBuffers, setTextBufs]  = useState(null);
  const [ready, setReady]           = useState(false);

  useEffect(() => {
    // Donut
    const donutGeo  = new THREE.TorusGeometry(3, 1.1, 48, 120);
    const donut     = sampleSurface(donutGeo, PARTICLE_COUNT);

    // Sphere
    const sphereGeo = new THREE.IcosahedronGeometry(3.2, 9);
    const sphere    = sampleSurface(sphereGeo, PARTICLE_COUNT);

    // Saturn — planet body + flat ring merged into one buffer
    const planetGeo = new THREE.IcosahedronGeometry(2.4, 9);
    const ringGeo   = new THREE.TorusGeometry(4.8, 0.25, 2, 140);
    ringGeo.rotateX(Math.PI / 2.2);                           // slight tilt
    const planetBuf = sampleSurface(planetGeo, Math.floor(PARTICLE_COUNT * 0.62));
    const ringBuf   = sampleSurface(ringGeo,   Math.floor(PARTICLE_COUNT * 0.38));
    const saturn    = new Float32Array(PARTICLE_COUNT * 3);
    saturn.set(planetBuf);
    saturn.set(ringBuf, planetBuf.length);

    // Scattered initial positions (dormant state)
    const scattered = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      scattered[i * 3]     = (Math.random() - 0.5) * 28;
      scattered[i * 3 + 1] = (Math.random() - 0.5) * 28;
      scattered[i * 3 + 2] = (Math.random() - 0.5) * 28;
    }

    // Text — scattered + formed
    const textScattered = new Float32Array(TEXT_COUNT * 3);
    for (let i = 0; i < TEXT_COUNT; i++) {
      textScattered[i * 3]     = (Math.random() - 0.5) * 32;
      textScattered[i * 3 + 1] = (Math.random() - 0.5) * 32;
      textScattered[i * 3 + 2] = (Math.random() - 0.5) * 32;
    }
    const textFormed = sampleTextParticles('3Digree', TEXT_COUNT);

    setShapes({ donut, sphere, saturn, scattered });
    setTextBufs({ scattered: textScattered, formed: textFormed });
    setReady(true);
  }, []);

  // ── Colours (stable across renders) ────────────────────────────────────────
  const mainColors = useMemo(
    () => buildColorArray(PARTICLE_COUNT, '#7c3aed', '#06b6d4'),
    []
  );
  const textColors = useMemo(
    () => buildColorArray(TEXT_COUNT, '#00ffab', '#00d4ff'),
    []
  );

  // ── Camera target refs (smooth lerp each frame) ──────────────────────────
  const camTarget = useRef({ x: 0, y: 0, z: 18 });

  // ── Frame loop ────────────────────────────────────────────────────────────
  useFrame((state, delta) => {
    if (!ready || !mainRef.current || !textRef.current) return;

    const r       = scrollProgress.current;
    const mainPos = mainRef.current.geometry.attributes.position.array;
    const textPos = textRef.current.geometry.attributes.position.array;

    // ── Determine target shape buffer ───────────────────────────────────────
    let targetMain;
    let morphSpeed = 0.065;

    if (r < SCROLL.DORMANT_END) {
      // Dormant — sit as scattered cloud, rotate gently
      targetMain = shapes.scattered;
      morphSpeed = 0.02;
    } else if (r < SCROLL.DONUT_END) {
      targetMain = shapes.donut;
    } else if (r < SCROLL.SPHERE_END) {
      targetMain = shapes.sphere;
    } else {
      targetMain = shapes.saturn;
    }

    // Lerp each particle toward target
    for (let i = 0; i < PARTICLE_COUNT * 3; i++) {
      mainPos[i] += (targetMain[i] - mainPos[i]) * morphSpeed;
    }
    mainRef.current.geometry.attributes.position.needsUpdate = true;

    // ── Text particles ───────────────────────────────────────────────────────
    const showText   = r >= SCROLL.TEXT_START;
    const textTarget = showText ? textBuffers.formed : textBuffers.scattered;
    const textSpeed  = showText ? 0.13 : 0.04;

    for (let i = 0; i < TEXT_COUNT * 3; i++) {
      textPos[i] += (textTarget[i] - textPos[i]) * textSpeed;
    }
    textRef.current.geometry.attributes.position.needsUpdate = true;

    // Fade text in
    const textOpacity = showText
      ? Math.min((r - SCROLL.TEXT_START) / 0.05, 1)
      : 0;
    textRef.current.material.opacity = textOpacity;

    // ── Shape group rotation ─────────────────────────────────────────────────
    if (groupRef.current) {
      if (r >= SCROLL.SATURN_START && r < SCROLL.TEXT_START) {
        // Saturn — dramatic slow spin
        groupRef.current.rotation.y += delta * 0.35;
        groupRef.current.rotation.x  = THREE.MathUtils.lerp(
          groupRef.current.rotation.x, 0.25, 0.02
        );
      } else if (r >= SCROLL.TEXT_START) {
        // Text phase — flatten rotation so text is readable
        groupRef.current.rotation.y += delta * 0.06;
        groupRef.current.rotation.x  = THREE.MathUtils.lerp(
          groupRef.current.rotation.x, 0, 0.04
        );
      } else {
        groupRef.current.rotation.y += delta * 0.18;
        groupRef.current.rotation.x  = THREE.MathUtils.lerp(
          groupRef.current.rotation.x, 0, 0.02
        );
      }
    }

    // ── Camera choreography ───────────────────────────────────────────────────
    let tZ = 18, tX = 0, tY = 0;

    if (r < SCROLL.DORMANT_END) {
      // Back far — meteor is the star
      tZ = 22;
      tX = 0;
      tY = 0;
    } else if (r < SCROLL.DONUT_END) {
      // Pull in to reveal donut
      tZ = 14;
    } else if (r < SCROLL.SPHERE_END) {
      // Orbit around sphere
      tZ = 13;
      tX = Math.sin(state.clock.elapsedTime * 0.4) * 1.5;
      tY = Math.cos(state.clock.elapsedTime * 0.3) * 0.8;
    } else if (r < SCROLL.SATURN_END) {
      // Zoom into Saturn's rings — cinematic low angle
      const p = (r - SCROLL.SATURN_START) / (SCROLL.SATURN_END - SCROLL.SATURN_START);
      tZ = THREE.MathUtils.lerp(13, 7, p);
      tY = THREE.MathUtils.lerp(0, -2.5, p);
      tX = Math.sin(state.clock.elapsedTime * 0.55) * 2;
    } else {
      // Text reveal — pull way back so full name is visible
      tZ = 22;
      tY = 10;
      tX = 0;
    }

    // Smooth camera lerp
    camTarget.current.x = THREE.MathUtils.lerp(camTarget.current.x, tX, 0.04);
    camTarget.current.y = THREE.MathUtils.lerp(camTarget.current.y, tY, 0.04);
    camTarget.current.z = THREE.MathUtils.lerp(camTarget.current.z, tZ, 0.04);

    camera.position.x = camTarget.current.x;
    camera.position.y = camTarget.current.y;
    camera.position.z = camTarget.current.z;
    camera.lookAt(0, 0, 0);
  });

  if (!ready) return null;

  return (
    <group ref={groupRef}>

      {/* ── Morphing shape particles ────────────────────────────────────── */}
      <points ref={mainRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={PARTICLE_COUNT}
            array={shapes.scattered}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={PARTICLE_COUNT}
            array={mainColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.065}
          vertexColors
          transparent
          opacity={0.88}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {/* ── "3Digree" text particles ────────────────────────────────────── */}
      <points ref={textRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={TEXT_COUNT}
            array={textBuffers.scattered}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={TEXT_COUNT}
            array={textColors}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.09}
          vertexColors
          transparent
          opacity={0}
          sizeAttenuation
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

    </group>
  );
}
