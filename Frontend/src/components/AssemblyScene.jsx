import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { RoundedBox, Html } from '@react-three/drei';
import * as THREE from 'three';

const BRAND = '#6498fe';
const INK = '#0f172a';
const GRAY = new THREE.Color('#e2e8f0');
const FRAME_W = 4.2;
const FRAME_H = 2.7;

// Target layout of a typical marketing site, in frame-local coordinates.
const BLOCKS = [
  { pos: [-1.55, 0.86], size: [0.55, 0.13], color: INK },
  { pos: [1.25, 0.86], size: [1.0, 0.08], color: '#cbd5e1' },
  { pos: [0, 0.18], size: [3.8, 1.05], color: '#eef4ff', z: 0.055, grow: true },
  { pos: [-0.85, 0.42], size: [1.7, 0.17], color: INK },
  { pos: [-1.0, 0.17], size: [1.4, 0.17], color: INK },
  { pos: [-1.33, -0.12], size: [0.62, 0.15], color: BRAND },
  { pos: [1.05, 0.18], size: [1.35, 0.82], color: '#a5c4ff' },
  { pos: [-1.42, -0.8], size: [0.86, 0.62], color: '#fde2e4' },
  { pos: [-0.47, -0.8], size: [0.86, 0.62], color: '#e0f2fe' },
  { pos: [0.47, -0.8], size: [0.86, 0.62], color: '#fef3c7' },
  { pos: [1.42, -0.8], size: [0.86, 0.62], color: '#dcfce7' },
];

const STEP_CHIPS = [
  { text: 'Growth plan · 9 credits', dot: BRAND },
  { text: 'Partner dashboard ready', dot: BRAND },
  { text: 'Design ID #104 submitted', dot: BRAND },
  { text: 'Live · delivered in 3 days', dot: '#10b981' },
];

const seeded = (i, k) => {
  const x = Math.sin(i * 127.1 + k * 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const smoothstep = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

function Block({ index, pos, size, color, z = 0.07, grow = false, progress }) {
  const mesh = useRef();
  const mat = useRef();
  const finalColor = useMemo(() => new THREE.Color(color), [color]);
  const scatter = useMemo(
    () => ({
      p: [(seeded(index, 1) - 0.5) * 4.4, (seeded(index, 2) - 0.5) * 2.8, 0.35 + seeded(index, 3) * 0.7],
      r: [(seeded(index, 4) - 0.5) * 0.9, (seeded(index, 5) - 0.5) * 0.9, (seeded(index, 6) - 0.5) * 0.5],
    }),
    [index]
  );

  useFrame((state) => {
    const p = progress.get();
    const t = state.clock.elapsedTime;
    const start = 0.2 + index * 0.025;
    const e = smoothstep(start, start + 0.3, p);
    const m = mesh.current;

    if (grow) {
      m.position.set(pos[0], pos[1], z);
      m.rotation.set(0, 0, 0);
      m.scale.set(Math.max(e, 0.001), Math.max(e, 0.001), 1);
    } else {
      const drift = (1 - e) * 0.07;
      m.position.set(
        THREE.MathUtils.lerp(scatter.p[0], pos[0], e) + Math.sin(t * 0.8 + index) * drift,
        THREE.MathUtils.lerp(scatter.p[1], pos[1], e) + Math.cos(t * 0.7 + index * 1.3) * drift,
        THREE.MathUtils.lerp(scatter.p[2], z, e)
      );
      m.rotation.set(scatter.r[0] * (1 - e), scatter.r[1] * (1 - e), scatter.r[2] * (1 - e));
      m.scale.setScalar(THREE.MathUtils.lerp(0.6, 1, e));
    }
    mat.current.color.lerpColors(GRAY, finalColor, smoothstep(0.66, 0.82, p));
  });

  return (
    <mesh ref={mesh}>
      <boxGeometry args={[size[0], size[1], 0.03]} />
      <meshBasicMaterial ref={mat} toneMapped={false} />
    </mesh>
  );
}

function FakeShadow() {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(30,58,138,0.35)');
    g.addColorStop(1, 'rgba(30,58,138,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={[0, -1.85, 0]} rotation={[-Math.PI / 2, 0, 0]}>
      <planeGeometry args={[6, 1.6]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} />
    </mesh>
  );
}

function roundedRectGeometry(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  s.moveTo(x + r, y);
  s.lineTo(x + w - r, y);
  s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r);
  s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r);
  s.quadraticCurveTo(x, y, x + r, y);
  return new THREE.ShapeGeometry(s, 6);
}

function Site({ progress, pointer, step }) {
  const group = useRef();
  const liveRef = useRef();
  const chipRef = useRef();
  const faceGeometry = useMemo(() => roundedRectGeometry(FRAME_W - 0.03, FRAME_H - 0.03, 0.07), []);
  const borderGeometry = useMemo(() => roundedRectGeometry(FRAME_W, FRAME_H, 0.08), []);
  useEffect(
    () => () => {
      faceGeometry.dispose();
      borderGeometry.dispose();
    },
    [faceGeometry, borderGeometry]
  );

  useFrame((state, dt) => {
    const p = progress.get();
    const face = smoothstep(0.7, 0.95, p);
    const g = group.current;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, THREE.MathUtils.lerp(-0.42, -0.05, face) + pointer.current.x * 0.12, 4, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, THREE.MathUtils.lerp(0.14, 0.02, face) - pointer.current.y * 0.06, 4, dt);
    g.position.y = Math.sin(state.clock.elapsedTime * 0.6) * 0.04;
    g.scale.setScalar(THREE.MathUtils.lerp(0.9, 1, smoothstep(0, 0.3, p)));
    if (liveRef.current) liveRef.current.style.opacity = String(smoothstep(0.82, 0.9, p));
  });

  useEffect(() => {
    const el = chipRef.current;
    if (!el) return;
    el.classList.remove('assembly-chip-in');
    void el.offsetWidth;
    el.classList.add('assembly-chip-in');
  }, [step]);

  const chip = STEP_CHIPS[step] || STEP_CHIPS[0];

  return (
    <group ref={group}>
      <RoundedBox args={[FRAME_W, FRAME_H, 0.08]} radius={0.08} smoothness={3}>
        <meshStandardMaterial color="#ffffff" roughness={0.35} />
      </RoundedBox>
      <mesh geometry={borderGeometry} position={[0, 0, 0.0405]}>
        <meshBasicMaterial color="#d6dee9" toneMapped={false} />
      </mesh>
      <mesh geometry={faceGeometry} position={[0, 0, 0.041]}>
        <meshBasicMaterial color="#ffffff" toneMapped={false} />
      </mesh>
      <mesh position={[0, 1.2, 0.045]}>
        <boxGeometry args={[FRAME_W - 0.16, 0.26, 0.01]} />
        <meshBasicMaterial color="#f1f5f9" toneMapped={false} />
      </mesh>
      {['#f87171', '#fbbf24', '#34d399'].map((c, i) => (
        <mesh key={c} position={[-1.9 + i * 0.13, 1.2, 0.052]}>
          <circleGeometry args={[0.035, 12]} />
          <meshBasicMaterial color={c} />
        </mesh>
      ))}
      <mesh position={[0.15, 1.2, 0.052]}>
        <boxGeometry args={[1.7, 0.13, 0.005]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>

      {BLOCKS.map((b, i) => (
        <Block key={i} index={i} {...b} progress={progress} />
      ))}

      <Html position={[-FRAME_W / 2 + 0.2, FRAME_H / 2 + 0.28, 0.1]} zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={chipRef} className="assembly-chip">
          <span className="assembly-chip-dot" style={{ background: chip.dot }} />
          {chip.text}
        </div>
      </Html>

      <Html position={[FRAME_W / 2 - 0.55, -FRAME_H / 2 - 0.05, 0.1]} center zIndexRange={[20, 0]} style={{ pointerEvents: 'none' }}>
        <div ref={liveRef} className="assembly-live" style={{ opacity: 0 }}>
          <span className="assembly-live-dot" /> Live on your client's domain
        </div>
      </Html>
    </group>
  );
}

const AssemblyScene = ({ progress, step }) => {
  const wrapper = useRef();
  const pointer = useRef({ x: 0, y: 0 });
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    io.observe(wrapper.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="absolute inset-0" aria-hidden="true">
      <Canvas
        flat
        dpr={[1, 1.6]}
        camera={{ position: [0, 0.1, 6.9], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
        frameloop={inView ? 'always' : 'never'}
      >
        <ambientLight intensity={2.2} />
        <directionalLight position={[2, 3, 6]} intensity={1.4} />
        <Site progress={progress} pointer={pointer} step={step} />
        <FakeShadow />
      </Canvas>
      <style>{`
        .assembly-chip, .assembly-live {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          white-space: nowrap;
          padding: 8px 14px;
          border-radius: 999px;
          background: rgba(255,255,255,0.95);
          border: 1px solid #e2e8f0;
          box-shadow: 0 12px 30px -12px rgba(15,23,42,0.3);
          font: 600 13px/1 Inter, system-ui, sans-serif;
          color: #0f172a;
        }
        .assembly-live { transition: opacity 0.2s; }
        .assembly-chip-dot, .assembly-live-dot {
          width: 8px; height: 8px; border-radius: 999px;
        }
        .assembly-live-dot { background: #10b981; box-shadow: 0 0 0 4px rgba(16,185,129,0.15); }
        .assembly-chip-in { animation: assembly-chip-in 0.45s cubic-bezier(0.23,1,0.32,1); }
        @keyframes assembly-chip-in {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AssemblyScene;
