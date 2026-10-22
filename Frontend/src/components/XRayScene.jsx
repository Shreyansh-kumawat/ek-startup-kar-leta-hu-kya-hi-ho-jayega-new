import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { makeXRayTextures, XR_W, XR_H } from './three/xrayTextures';

const PLANE_W = 4.6;
const PLANE_H = (PLANE_W * XR_H) / XR_W;

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// Inside the lens radius we show the "back" (x-ray) texture, slightly magnified,
// with scanlines and a glowing rim. Outside, the client-facing site.
const fragmentShader = /* glsl */ `
  uniform sampler2D uFront;
  uniform sampler2D uBackA;
  uniform sampler2D uBackB;
  uniform float uMix;
  uniform float uRadius;
  uniform float uAspect;
  uniform float uTime;
  uniform vec2 uMouse;
  varying vec2 vUv;

  void main() {
    vec2 d = vUv - uMouse;
    d.x *= uAspect;
    float dist = length(d);
    float mask = 1.0 - smoothstep(uRadius - 0.004, uRadius + 0.004, dist);

    vec4 front = texture2D(uFront, vUv);
    vec2 lensUv = uMouse + (vUv - uMouse) * 0.93;
    vec4 back = mix(texture2D(uBackA, lensUv), texture2D(uBackB, lensUv), uMix);
    back.rgb += 0.03 * sin(vUv.y * 900.0 - uTime * 6.0);

    vec4 col = mix(front, back, mask);
    float ring = (1.0 - smoothstep(0.0, 0.011, abs(dist - uRadius))) * step(0.01, uRadius);
    col.rgb = mix(col.rgb, vec3(0.392, 0.596, 0.996), ring * 0.95);
    col.a = front.a;

    gl_FragColor = col;
    #include <colorspace_fragment>
  }
`;

const smoothstep = (a, b, x) => {
  const t = Math.min(Math.max((x - a) / (b - a), 0), 1);
  return t * t * (3 - 2 * t);
};

function XRayPlane({ textures, progress, stage, lite }) {
  const mesh = useRef();
  const hover = useRef({ active: false, target: new THREE.Vector2(0.62, 0.5) });
  const shownStage = useRef(0);

  const uniforms = useMemo(
    () => ({
      uFront: { value: textures.front },
      uBackA: { value: textures.backs[0] },
      uBackB: { value: textures.backs[0] },
      uMix: { value: 1 },
      uRadius: { value: 0 },
      uAspect: { value: XR_W / XR_H },
      uTime: { value: 0 },
      uMouse: { value: new THREE.Vector2(0.62, 0.5) },
    }),
    [textures]
  );

  useEffect(() => {
    if (stage === shownStage.current) return;
    uniforms.uBackA.value = uniforms.uBackB.value;
    uniforms.uBackB.value = textures.backs[stage];
    uniforms.uMix.value = 0;
    shownStage.current = stage;
  }, [stage, textures, uniforms]);

  useFrame((state, dt) => {
    const t = state.clock.elapsedTime;
    uniforms.uTime.value = t;
    uniforms.uMix.value = THREE.MathUtils.damp(uniforms.uMix.value, 1, 6, dt);

    const h = hover.current;
    if (!h.active) h.target.set(0.56 + 0.3 * Math.sin(t * 0.45), 0.5 + 0.24 * Math.sin(t * 0.7 + 1));
    const m = uniforms.uMouse.value;
    m.x = THREE.MathUtils.damp(m.x, h.target.x, h.active ? 12 : 3, dt);
    m.y = THREE.MathUtils.damp(m.y, h.target.y, h.active ? 12 : 3, dt);

    const p = progress.get();
    const open = smoothstep(0.0, 0.06, p) * (lite ? 0.36 : 0.23);
    const finale = smoothstep(0.9, 0.99, p);
    uniforms.uRadius.value = THREE.MathUtils.damp(uniforms.uRadius.value, open + finale * 1.6, 6, dt);

    const g = mesh.current;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, THREE.MathUtils.lerp(-0.2, 0.2, p), 4, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, -0.05 + Math.sin(t * 0.5) * 0.015, 4, dt);
  });

  return (
    <mesh
      ref={mesh}
      onPointerMove={(e) => {
        hover.current.active = true;
        if (e.uv) hover.current.target.copy(e.uv);
      }}
      onPointerLeave={() => {
        hover.current.active = false;
      }}
    >
      <planeGeometry args={[PLANE_W, PLANE_H]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
      />
    </mesh>
  );
}

const XRayScene = ({ progress, stage, lite = false }) => {
  const wrapper = useRef();
  const [inView, setInView] = useState(false);
  const [textures, setTextures] = useState(null);

  // Wait for web fonts so the canvas-drawn text is crisp and on-brand.
  useEffect(() => {
    let alive = true;
    let made = null;
    const fontsReady = document.fonts ? document.fonts.ready : Promise.resolve();
    fontsReady.then(() => {
      if (!alive) return;
      made = makeXRayTextures(lite ? 0.6 : 1);
      setTextures(made);
    });
    return () => {
      alive = false;
      if (made) {
        made.front.dispose();
        made.backs.forEach((t) => t.dispose());
      }
    };
  }, [lite]);

  useEffect(() => {
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0 });
    io.observe(wrapper.current);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={wrapper} className="absolute inset-0">
      <div
        className="absolute left-1/2 bottom-[4%] -translate-x-1/2 w-4/5 h-12 rounded-[50%] pointer-events-none"
        style={{ background: 'radial-gradient(closest-side, rgba(15,23,42,0.22), transparent)' }}
        aria-hidden="true"
      />
      {textures && (
        <Canvas
          flat
          dpr={lite ? 1 : [1, 1.75]}
          camera={{ position: [0, 0, lite ? 5.7 : 6.6], fov: 35 }}
          gl={{ antialias: !lite, alpha: true, powerPreference: lite ? 'low-power' : 'high-performance' }}
          frameloop={inView ? 'always' : 'never'}
        >
          <XRayPlane textures={textures} progress={progress} stage={stage} lite={lite} />
        </Canvas>
      )}
    </div>
  );
};

export default XRayScene;
