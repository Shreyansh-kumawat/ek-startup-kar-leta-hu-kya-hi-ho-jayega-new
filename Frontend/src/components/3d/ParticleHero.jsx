import React, { useMemo, useRef, useState, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';
import { StarField, ShootingStars, AmbientGlowPlanes } from './SpaceBackground';

// ─────────────────────────────────────────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────────────────────────────────────────
const sampleParticles = (geometry, count) => {
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

const create2DTextParticles = (text, count) => {
  const canvas  = document.createElement('canvas');
  const ctx     = canvas.getContext('2d');
  canvas.width  = 1024;
  canvas.height = 256;
  ctx.fillStyle = 'black';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'white';
  ctx.font      = 'bold 120px Arial';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, canvas.width / 2, canvas.height / 2);
  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const pool = [];
  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      if (data[(y * canvas.width + x) * 4] > 128) {
        pool.push({
          x:  (x / canvas.width  - 0.5) * 20,
          y: -(y / canvas.height - 0.5) * 5,
          z:   0,
        });
      }
    }
  }
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const p = pool[Math.floor(Math.random() * pool.length)];
    out[i * 3]     = p.x;
    out[i * 3 + 1] = p.y;
    out[i * 3 + 2] = p.z;
  }
  return out;
};

// ─────────────────────────────────────────────────────────────────────────────
// SCENE
// ─────────────────────────────────────────────────────────────────────────────
function Scene({ progressRef, onTextFormed }) {
  const mainRef  = useRef();
  const textRef  = useRef();
  const { camera } = useThree();

  const PC  = 20000;
  const TPC = 15000;

  const [sat,   setSat]   = useState(null);
  const [sc,    setSc]    = useState(null);
  const [tp,    setTp]    = useState(null);
  const [ready, setReady] = useState(false);

  // Track if text-formed callback already fired
  const textFormedFired = useRef(false);

  useEffect(() => {
    const planetGeo = new THREE.IcosahedronGeometry(2.5, 8);
    const ringGeo   = new THREE.TorusGeometry(4.5, 0.2, 2, 100);
    ringGeo.rotateX(Math.PI / 2);
    const pp  = sampleParticles(planetGeo, Math.floor(PC * 0.6));
    const rp  = sampleParticles(ringGeo,   Math.floor(PC * 0.4));
    const sat = new Float32Array(PC * 3);
    sat.set(pp); sat.set(rp, pp.length);

    const sc = new Float32Array(TPC * 3);
    for (let i = 0; i < TPC; i++) {
      sc[i*3]   = (Math.random()-0.5)*30;
      sc[i*3+1] = (Math.random()-0.5)*30;
      sc[i*3+2] = (Math.random()-0.5)*30;
    }
    const tp = create2DTextParticles('3Digree', TPC);

    setSat(sat); setSc(sc); setTp(tp);
    setReady(true);
  }, []);

  const mainColors = useMemo(() => {
    const arr = new Float32Array(PC * 3);
    const c1  = new THREE.Color('#6a0dad');
    const c2  = new THREE.Color('#00bfff');
    for (let i = 0; i < PC; i++) {
      const c = c1.clone().lerp(c2, Math.random());
      arr[i*3]=c.r; arr[i*3+1]=c.g; arr[i*3+2]=c.b;
    }
    return arr;
  }, []);

  const textColors = useMemo(() => {
    const arr = new Float32Array(TPC * 3);
    const c   = new THREE.Color('#00ff88');
    for (let i = 0; i < TPC; i++) {
      arr[i*3]=c.r; arr[i*3+1]=c.g; arr[i*3+2]=c.b;
    }
    return arr;
  }, []);

  useFrame((state) => {
    if (!ready || !mainRef.current || !textRef.current) return;

    const r   = progressRef.current;
    const mp  = mainRef.current.geometry.attributes.position.array;
    const tp2 = textRef.current.geometry.attributes.position.array;

    // Saturn always
    if (sat) {
      for (let i = 0; i < PC*3; i++) mp[i] += (sat[i] - mp[i]) * 0.08;
      mainRef.current.geometry.attributes.position.needsUpdate = true;
    }

    // Text particles
    const showText  = r >= 0.75;
    const tgt       = showText ? tp : sc;
    const tspd      = showText ? 0.15 : 0.05;
    const textOpacity = showText ? Math.min((r - 0.75) / 0.05, 1) : 0;

    if (tgt) {
      for (let i = 0; i < TPC*3; i++) tp2[i] += (tgt[i] - tp2[i]) * tspd;
      textRef.current.geometry.attributes.position.needsUpdate = true;
      textRef.current.material.opacity = textOpacity;
    }

    // When text fully formed (opacity = 1) → fire callback once
    if (textOpacity >= 0.98 && !textFormedFired.current) {
      textFormedFired.current = true;
      onTextFormed?.();
    }

    // ── CAMERA ────────────────────────────────────────────────────────
    let tz = 18, tx = 0, ty = 0;

    if (r < 0.45) {
      tz = 18 - r * 10;
      mainRef.current.rotation.y += 0.003;

    } else if (r >= 0.45 && r < 0.75) {
      const t2 = (r - 0.45) / 0.30;
      tz = 13.5 - t2 * 20;
      tx = Math.sin(state.clock.elapsedTime * 0.5) * t2;
      ty = Math.cos(state.clock.elapsedTime * 0.5) * t2;
      mainRef.current.rotation.y += 0.005;

    } else if (r >= 0.75) {
      const t3 = (r - 0.75) / 0.25;
      tz = THREE.MathUtils.lerp(-6.5, 20, t3);
      tx = THREE.MathUtils.lerp(
        Math.sin(state.clock.elapsedTime * 0.5), 0,
        Math.min(t3 * 3, 1)
      );
      ty = THREE.MathUtils.lerp(
        Math.cos(state.clock.elapsedTime * 0.5), 10,
        Math.min(t3 * 3, 1)
      );
      mainRef.current.rotation.y += 0.002;
    }

    camera.position.x = THREE.MathUtils.lerp(camera.position.x, tx, 0.05);
    camera.position.y = THREE.MathUtils.lerp(camera.position.y, ty, 0.05);
    camera.position.z = THREE.MathUtils.lerp(camera.position.z, tz, 0.05);
    camera.lookAt(0, 0, 0);
  });

  if (!ready) return null;

  return (
    <>
      <pointLight position={[0,0,10]} color="white" intensity={2} distance={25} decay={2}/>

      <points ref={mainRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={PC}
            array={sat || new Float32Array(PC*3)} itemSize={3}/>
          <bufferAttribute attach="attributes-color" count={PC}
            array={mainColors} itemSize={3}/>
        </bufferGeometry>
        <pointsMaterial size={0.08} vertexColors transparent opacity={0.8}
          blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation/>
      </points>

      <points ref={textRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={TPC}
            array={sc || new Float32Array(TPC*3)} itemSize={3}/>
          <bufferAttribute attach="attributes-color" count={TPC}
            array={textColors} itemSize={3}/>
        </bufferGeometry>
        <pointsMaterial size={0.12} vertexColors transparent opacity={0}
          blending={THREE.AdditiveBlending} depthWrite={false} sizeAttenuation/>
      </points>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────
function ProgressBar({ progressRef }) {
  const barRef = useRef(null);

  useEffect(() => {
    let raf;
    const tick = () => {
      if (barRef.current)
        barRef.current.style.width = `${progressRef.current * 100}%`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div style={{
      position: 'absolute', bottom: 0, left: 0,
      width: '100%', height: 2,
      background: 'rgba(255,255,255,0.08)',
      zIndex: 10,
    }}>
      <div ref={barRef} style={{
        height: '100%', width: '0%',
        background: 'linear-gradient(90deg, #00ffab, #06b6d4)',
        boxShadow: '0 0 8px #00ffab',
      }}/>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PARTICLE HERO — main export
// ─────────────────────────────────────────────────────────────────────────────
export default function ParticleHero({ onUnlock }) {
  const progressRef  = useRef(0);
  const SCROLL_TOTAL = window.innerHeight * 5;
  const fakeScrollY  = useRef(0);
  const [unlocked,     setUnlocked]     = useState(false);
  const [textFormed,   setTextFormed]   = useState(false); // 3Digree fully visible
  const [showContinue, setShowContinue] = useState(false); // "scroll to continue" hint
  const hintRef    = useRef(null);
  const overlayRef = useRef(null);
  const unlockedRef = useRef(false); // avoid double-fire

  // ── Wheel / touch handler ──────────────────────────────────────────────
  useEffect(() => {
    if (unlocked) return;

    document.body.style.overflow = 'hidden';

    const onWheel = (e) => {
      e.preventDefault();

      fakeScrollY.current = Math.min(
        Math.max(fakeScrollY.current + e.deltaY, 0),
        SCROLL_TOTAL
      );
      progressRef.current = fakeScrollY.current / SCROLL_TOTAL;

      // Fade scroll hint
      if (hintRef.current)
        hintRef.current.style.opacity = Math.max(0, 1 - progressRef.current / 0.1);

      // Unlock at end
      if (progressRef.current >= 0.999 && !unlockedRef.current) {
        unlockedRef.current = true;
        handleUnlock();
      }
    };

    const onTouchStart = (e) => { onWheel._lastY = e.touches[0].clientY; };
    const onTouchMove  = (e) => {
      e.preventDefault();
      const dy = onWheel._lastY - e.touches[0].clientY;
      onWheel._lastY = e.touches[0].clientY;
      onWheel({ preventDefault: () => {}, deltaY: dy * 2.5 });
    };

    window.addEventListener('wheel',      onWheel,      { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: false });
    window.addEventListener('touchmove',  onTouchMove,  { passive: false });

    return () => {
      window.removeEventListener('wheel',      onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove',  onTouchMove);
    };
  }, [unlocked]);

  // ── Show "scroll to continue" after 3Digree forms ─────────────────────
  useEffect(() => {
    if (textFormed) {
      // Small delay then show the continue hint
      const t = setTimeout(() => setShowContinue(true), 400);
      return () => clearTimeout(t);
    }
  }, [textFormed]);

  // ── Unlock sequence ───────────────────────────────────────────────────
  const handleUnlock = () => {
    setShowContinue(false);

    // Black fade
    if (overlayRef.current) {
      overlayRef.current.style.transition = 'opacity 0.6s ease';
      overlayRef.current.style.opacity    = '1';
    }

    setTimeout(() => {
      document.body.style.overflow = '';
      setUnlocked(true);
      onUnlock?.();
    }, 400);
  };

 return (
  <div style={{
    position:   unlocked ? 'relative' : 'fixed',
    top:         0,
    left:        0,
    width:      '100vw',
    // ── KEY FIX: unlocked hone ke baad height 0 ──
    height:      unlocked ? 0 : '100vh',
    overflow:   'hidden',
    zIndex:      unlocked ? 0 : 999,
    background: '#050510',
  }}>
    <Canvas
      camera={{ position: [0, 0, 18], fov: 60 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      dpr={[1, 1.8]}
    >
      <color attach="background" args={['#050510']}/>
      <StarField count={3000}/>
      <ShootingStars count={4}/>
      <AmbientGlowPlanes/>
      <Scene
        progressRef={progressRef}
        onTextFormed={() => setTextFormed(true)}
      />
    </Canvas>

    {/* Initial scroll hint */}
    <div ref={hintRef} style={{
      position:      'absolute',
      bottom:         40,
      left:          '50%',
      transform:     'translateX(-50%)',
      color:         'rgba(255,255,255,0.35)',
      fontFamily:    'monospace',
      fontSize:       11,
      letterSpacing: '0.25em',
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      gap:            8,
      pointerEvents: 'none',
      transition:    'opacity 0.4s',
    }}>
      SCROLL TO EXPLORE
      <div style={{
        width:      1,
        height:     36,
        background:'linear-gradient(180deg, rgba(0,255,171,0.7), transparent)',
      }}/>
    </div>

    {/* Continue scrolling hint */}
    <div style={{
      position:      'absolute',
      bottom:         40,
      left:          '50%',
      transform:     'translateX(-50%)',
      display:       'flex',
      flexDirection: 'column',
      alignItems:    'center',
      gap:            8,
      pointerEvents: 'none',
      opacity:        showContinue ? 1 : 0,
      transition:    'opacity 0.8s ease',
    }}>
      <span style={{
        color:         '#00ffab',
        fontFamily:    'monospace',
        fontSize:       11,
        letterSpacing: '0.25em',
        textShadow:    '0 0 12px #00ffab',
      }}>CONTINUE SCROLLING</span>
      <div style={{
        animation:  'bounce 1.4s ease-in-out infinite',
        color:      '#00ffab',
        fontSize:    20,
        lineHeight:  1,
      }}>↓</div>
      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0);   opacity: 0.5; }
          50%       { transform: translateY(8px); opacity: 1;   }
        }
      `}</style>
    </div>

    {/* Progress bar */}
    {!unlocked && <ProgressBar progressRef={progressRef}/>}

    {/* Black fade overlay */}
    <div ref={overlayRef} style={{
      position:      'absolute',
      inset:          0,
      background:    '#050510',
      opacity:        0,
      pointerEvents: 'none',
      zIndex:         20,
      transition:    'opacity 0.6s ease',
    }}/>
  </div>
);

}
