import React, { Suspense, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { motion } from 'framer-motion';

// ── 3D Model ─────────────────────────────────────────────────────────────────
function Model({ isDragging }) {
  const { scene } = useGLTF('/3digree.glb');
  const modelRef  = useRef();

  useFrame((_, delta) => {
    // Auto rotate sirf tab jab user drag nahi kar raha
    if (modelRef.current && !isDragging) {
      modelRef.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <primitive
      ref={modelRef}
      object={scene}
      scale={2.5}
      position={[0, -0.5, 0]}
    />
  );
}

// ── Loader fallback ───────────────────────────────────────────────────────────
function Loader() {
  return (
    <mesh>
      <sphereGeometry args={[0.5, 16, 16]} />
      <meshStandardMaterial
        color="#00ffab"
        emissive="#00ffab"
        emissiveIntensity={0.5}
        wireframe
      />
    </mesh>
  );
}

// ── Main Section ──────────────────────────────────────────────────────────────
export default function SectionModel3D() {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <section style={{
      width:           '100%',
      minHeight:       '100vh',
      background:      '#050510',
      display:         'flex',
      flexDirection:   'column',
      alignItems:      'center',
      justifyContent:  'center',
      position:        'relative',
      overflow:        'hidden',
      padding:         '80px 24px',
    }}>

      {/* Glow bg */}
      <div style={{
        position:     'absolute',
        top:          '50%',
        left:         '50%',
        transform:    'translate(-50%, -50%)',
        width:         600,
        height:        600,
        borderRadius: '50%',
        background:   'radial-gradient(circle, rgba(0,255,171,0.06) 0%, transparent 70%)',
        pointerEvents:'none',
      }}/>

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        style={{ textAlign: 'center', marginBottom: 8, position: 'relative', zIndex: 1 }}
      >
         
        <h2 style={{
          fontSize:      'clamp(32px, 5vw, 56px)',
          fontWeight:     900,
          fontFamily:    "'Inter', system-ui, sans-serif",
          letterSpacing: '-0.03em',
          lineHeight:     1.1,
          margin:         0,
          background:    'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.5) 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor:  'transparent',
          backgroundClip:       'text',
            color: '#155dfc'
        }}>
          3Digree
        </h2>

        <p style={{
          marginTop:     16,
          color:         'rgba(255,255,255,0.4)',
          fontFamily:    "'Inter', system-ui, sans-serif",
          fontSize:       'clamp(14px, 1.5vw, 17px)',
          lineHeight:     1.6,
          maxWidth:       480,
          margin:        '16px auto 0',
        }}>
          3 Day Website delivery, While Maintaining Invisiblity 
        </p>
      </motion.div>

     

      {/* Canvas */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        style={{
          width:    'min(600px, 90vw)',
          height:   'min(500px, 70vw)',
          position: 'relative',
          zIndex:    1,
          cursor:    isDragging ? 'grabbing' : 'grab',
        }}
      >
        <Canvas
          camera={{ position: [0, 0, 5], fov: 45 }}
          gl={{ antialias: true, powerPreference: 'high-performance', alpha: true }}
          dpr={[1, 2]}
          style={{ background: 'transparent' }}
        >
          {/* Lights */}
          <ambientLight intensity={0.6} />
          <directionalLight position={[5,  5,  5]} intensity={1.5} color="#ffffff" />
          <directionalLight position={[-5, -3, 2]} intensity={0.5} color="#06b6d4" />
          <pointLight position={[0, 3, 3]} intensity={1} color="#00ffab" distance={10} />
          <pointLight position={[0, -3, -3]} intensity={0.5} color="#a78bfa" distance={10} />

          <Suspense fallback={<Loader />}>
            <Model isDragging={isDragging} />
            <ContactShadows
              position={[0, -2.2, 0]}
              opacity={0.3}
              scale={6}
              blur={2}
              far={4}
              color="#00ffab"
            />
            <Environment preset="night" />
          </Suspense>

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            enableDamping
            dampingFactor={0.08}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 1.5}
            onStart={() => setIsDragging(true)}
            onEnd={()   => setIsDragging(false)}
          />
        </Canvas>

        {/* Neon ring glow behind canvas */}
        <div style={{
          position:     'absolute',
          inset:         0,
          borderRadius: '50%',
          background:   'radial-gradient(circle at 50% 50%, rgba(0,255,171,0.04) 0%, transparent 70%)',
          pointerEvents:'none',
          zIndex:        0,
        }}/>
      </motion.div>

      {/* Bottom stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-60px' }}
        transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
        style={{
          display:       'flex',
          gap:            'clamp(24px, 6vw, 64px)',
          flexWrap:      'wrap',
          justifyContent:'center',
          marginTop:      40,
          position:      'relative',
          zIndex:         1,
        }}
      >
        {[
          { num: '3',    label: 'Business Days' },
          { num: '100%', label: 'White-label'   },
          { num: '∞',    label: 'Scale Ready'   },
        ].map(({ num, label }) => (
          <div key={label} style={{ textAlign: 'center' }}>
            <div style={{
              fontSize:   'clamp(28px, 5vw, 48px)',
              fontWeight:  900,
              fontFamily: "'Inter', system-ui, sans-serif",
              background: 'linear-gradient(135deg, #00ffab, #06b6d4)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor:  'transparent',
              backgroundClip:       'text',
              lineHeight:  1,
            }}>{num}</div>
            <div style={{
              color:         'rgba(255,255,255,0.35)',
              fontFamily:    "'JetBrains Mono', monospace",
              fontSize:       11,
              letterSpacing: '0.15em',
              marginTop:      6,
            }}>{label}</div>
          </div>
        ))}
      </motion.div>

    </section>
  );
}
