import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Torus, Icosahedron, 
         MeshWobbleMaterial, Trail, Sphere } from '@react-three/drei';
import * as THREE from 'three';

// ── Floating DNA Helix ────────────────────────────────────────────────────
function DNAHelix() {
  const groupRef = useRef();

  const points = useMemo(() => {
    const pts = [];
    for (let i = 0; i < 60; i++) {
      const t = (i / 60) * Math.PI * 4;
      pts.push({
        x1:  Math.cos(t) * 2,
        y1:  (i / 60) * 12 - 6,
        z1:  Math.sin(t) * 2,
        x2: -Math.cos(t) * 2,
        y2:  (i / 60) * 12 - 6,
        z2: -Math.sin(t) * 2,
      });
    }
    return pts;
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[-5, 0, -4]}>
      {points.map((p, i) => (
        <group key={i}>
          {/* Strand 1 */}
          <mesh position={[p.x1, p.y1, p.z1]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial
              color={i % 3 === 0 ? '#00ffab' : '#06b6d4'}
              emissive={i % 3 === 0 ? '#00ffab' : '#06b6d4'}
              emissiveIntensity={0.6}
            />
          </mesh>
          {/* Strand 2 */}
          <mesh position={[p.x2, p.y2, p.z2]}>
            <sphereGeometry args={[0.08, 8, 8]} />
            <meshStandardMaterial
              color={i % 2 === 0 ? '#a78bfa' : '#7c3aed'}
              emissive={i % 2 === 0 ? '#a78bfa' : '#7c3aed'}
              emissiveIntensity={0.6}
            />
          </mesh>
          {/* Connector every 5 points */}
          {i % 5 === 0 && (
            <mesh position={[
              (p.x1 + p.x2) / 2,
              p.y1,
              (p.z1 + p.z2) / 2,
            ]}>
              <cylinderGeometry args={[0.02, 0.02, 4, 4]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#ffffff"
                emissiveIntensity={0.2}
                transparent opacity={0.3}
              />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}

// ── Orbiting Ring System ──────────────────────────────────────────────────
function OrbitRings() {
  const r1 = useRef(), r2 = useRef(), r3 = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (r1.current) { r1.current.rotation.x = t * 0.4; r1.current.rotation.z = t * 0.2; }
    if (r2.current) { r2.current.rotation.y = t * 0.3; r2.current.rotation.x = t * 0.5; }
    if (r3.current) { r3.current.rotation.z = t * 0.6; r3.current.rotation.y = t * 0.1; }
  });

  return (
    <group position={[4, 0, -3]}>
      {/* Core glowing sphere */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
        <mesh>
          <sphereGeometry args={[0.6, 32, 32]} />
          <MeshDistortMaterial
            color="#00ffab"
            emissive="#00ffab"
            emissiveIntensity={0.4}
            distort={0.4}
            speed={3}
            roughness={0}
            metalness={0.8}
          />
        </mesh>
      </Float>

      {/* Ring 1 */}
      <mesh ref={r1}>
        <torusGeometry args={[1.4, 0.025, 16, 100]} />
        <meshStandardMaterial
          color="#00ffab" emissive="#00ffab"
          emissiveIntensity={0.8} transparent opacity={0.7}
        />
      </mesh>

      {/* Ring 2 */}
      <mesh ref={r2}>
        <torusGeometry args={[1.8, 0.018, 16, 100]} />
        <meshStandardMaterial
          color="#06b6d4" emissive="#06b6d4"
          emissiveIntensity={0.8} transparent opacity={0.5}
        />
      </mesh>

      {/* Ring 3 */}
      <mesh ref={r3}>
        <torusGeometry args={[2.2, 0.012, 16, 100]} />
        <meshStandardMaterial
          color="#a78bfa" emissive="#a78bfa"
          emissiveIntensity={0.8} transparent opacity={0.4}
        />
      </mesh>
    </group>
  );
}

// ── Morphing Icosahedron ──────────────────────────────────────────────────
function MorphBlob() {
  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={1} position={[0, 0, 0]}>
      <mesh>
        <icosahedronGeometry args={[1.2, 4]} />
        <MeshDistortMaterial
          color="#7c3aed"
          emissive="#a78bfa"
          emissiveIntensity={0.3}
          distort={0.5}
          speed={2}
          roughness={0.1}
          metalness={0.9}
          wireframe
        />
      </mesh>
    </Float>
  );
}

// ── Shooting Particle Trail ───────────────────────────────────────────────
function TrailOrb() {
  const ref = useRef();

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (ref.current) {
      ref.current.position.x = Math.sin(t * 0.7) * 6;
      ref.current.position.y = Math.cos(t * 0.5) * 3;
      ref.current.position.z = Math.sin(t * 0.3) * 2;
    }
  });

  return (
    <Trail width={1.5} length={8} color="#00ffab" attenuation={(t) => t * t}>
      <mesh ref={ref}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial
          color="#00ffab"
          emissive="#00ffab"
          emissiveIntensity={2}
        />
      </mesh>
    </Trail>
  );
}

// ── Floating Code Cubes ───────────────────────────────────────────────────
function CodeCubes() {
  const cubes = useMemo(() => (
    Array.from({ length: 8 }, (_, i) => ({
      pos: [
        (Math.random() - 0.5) * 12,
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4 - 2,
      ],
      speed:  0.3 + Math.random() * 0.5,
      size:   0.1 + Math.random() * 0.2,
      color:  ['#00ffab', '#06b6d4', '#a78bfa', '#7c3aed'][i % 4],
    }))
  ), []);

  const refs = useRef(cubes.map(() => React.createRef()));

  useFrame((state) => {
    refs.current.forEach((r, i) => {
      if (r.current) {
        r.current.rotation.x = state.clock.elapsedTime * cubes[i].speed;
        r.current.rotation.y = state.clock.elapsedTime * cubes[i].speed * 0.7;
        r.current.position.y = cubes[i].pos[1] +
          Math.sin(state.clock.elapsedTime * cubes[i].speed + i) * 0.5;
      }
    });
  });

  return (
    <>
      {cubes.map((cube, i) => (
        <mesh key={i} ref={refs.current[i]} position={cube.pos}>
          <boxGeometry args={[cube.size, cube.size, cube.size]} />
          <meshStandardMaterial
            color={cube.color}
            emissive={cube.color}
            emissiveIntensity={0.5}
            transparent opacity={0.7}
            wireframe={i % 2 === 0}
          />
        </mesh>
      ))}
    </>
  );
}

// ── Tagline HTML overlay ──────────────────────────────────────────────────
function Tagline() {
  return (
    <div style={{
      position:       'absolute',
      inset:           0,
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      justifyContent: 'center',
      pointerEvents:  'none',
      zIndex:          2,
      gap:             16,
    }}>
      <div style={{
        fontSize:      'clamp(11px, 1.4vw, 14px)',
        color:         'rgba(255,255,255,0.18)',
        fontFamily:    "'JetBrains Mono', monospace",
        letterSpacing: '0.35em',
        textTransform: 'uppercase',
      }}>
        Built different. Delivered fast.
      </div>

      <div style={{
        display:    'flex',
        gap:         32,
        flexWrap:   'wrap',
        justifyContent:'center',
      }}>
        {['React', 'Node.js', 'Three.js', 'AI', 'Web3'].map((tag) => (
          <span key={tag} style={{
            color:         '#00ffab',
            fontFamily:    "'JetBrains Mono', monospace",
            fontSize:       11,
            letterSpacing: '0.2em',
            opacity:        0.45,
            borderBottom:  '1px solid rgba(0,255,171,0.2)',
            paddingBottom:  2,
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Scroll down indicator */}
      <div style={{
        position:      'absolute',
        bottom:         32,
        left:          '50%',
        transform:     'translateX(-50%)',
        display:       'flex',
        flexDirection: 'column',
        alignItems:    'center',
        gap:            6,
        animation:     'pulseDown 1.8s ease-in-out infinite',
      }}>
        <span style={{
          color:         'rgba(0,255,171,0.4)',
          fontFamily:    'monospace',
          fontSize:       10,
          letterSpacing: '0.25em',
        }}>SCROLL</span>
        <div style={{
          width:      1,
          height:     40,
          background:'linear-gradient(180deg, rgba(0,255,171,0.5), transparent)',
        }}/>
      </div>

      <style>{`
        @keyframes pulseDown {
          0%, 100% { opacity: 0.4; transform: translateX(-50%) translateY(0); }
          50%       { opacity: 1;   transform: translateX(-50%) translateY(6px); }
        }
      `}</style>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HERO TRANSITION — main export
// ─────────────────────────────────────────────────────────────────────────────
export default function HeroTransition() {
  return (
    <div style={{
      width:      '100vw',
      height:     '100vh',
      position:   'relative',
      background: '#050510',
      overflow:   'hidden',
    }}>
      <Canvas
        camera={{ position: [0, 0, 10], fov: 60 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        dpr={[1, 1.5]}
      >
        <color attach="background" args={['#050510']} />

        {/* Lights */}
        <ambientLight intensity={0.3} />
        <pointLight position={[5,  5,  5]}  color="#00ffab" intensity={2} />
        <pointLight position={[-5, -5, 5]}  color="#a78bfa" intensity={1.5} />
        <pointLight position={[0,   0, -5]} color="#06b6d4" intensity={1} />

        {/* 3D Elements */}
        <DNAHelix />
        <OrbitRings />
        <MorphBlob />
        <TrailOrb />
        <CodeCubes />
      </Canvas>

      {/* HTML overlay */}
      <Tagline />

      {/* Top gradient blend with hero */}
      <div style={{
        position:   'absolute',
        top:         0,
        left:        0,
        right:       0,
        height:      120,
        background: 'linear-gradient(180deg, #050510 0%, transparent 100%)',
        pointerEvents:'none',
        zIndex:       3,
      }}/>

      {/* Bottom gradient blend with sections */}
      <div style={{
        position:   'absolute',
        bottom:      0,
        left:        0,
        right:       0,
        height:      120,
        background: 'linear-gradient(0deg, #080c18 0%, transparent 100%)',
        pointerEvents:'none',
        zIndex:       3,
      }}/>
    </div>
  );
}
