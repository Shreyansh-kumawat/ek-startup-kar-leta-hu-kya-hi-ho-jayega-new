import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import ParticleHero from '../components/3d/ParticleHero';
import SectionModel3D from '../components/SectionModel3D';
import SectionProblem from '../components/SectionProblem';
import SectionHowItWorks from '../components/SectionHowItWorks';
import SectionWhoFor from '../components/SectionWhoFor';
import SectionWhatYouGet from '../components/SectionWhatYouGet';
import SectionWhyExists from '../components/SectionWhyExists';
import SectionFounders from '../components/SectionFounders';
import SectionContact from '../components/SectionContact';

// ─────────────────────────────────────────────────────────────────────────────
// LOADING SCREEN — Simple, like Home.jsx but black bg + blue spinner
// ─────────────────────────────────────────────────────────────────────────────
const LoadingScreen = ({ onComplete }) => {
  const [done, setDone] = useState(false);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDone(true);
      setTimeout(onComplete, 500);
    }, 1200);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="loader"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
          style={{
            position: 'fixed',
            inset: 0,
            background: '#000000',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
            {/* Blue rotating spinner — same style as Home.jsx */}
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                border: '3px solid rgba(100, 152, 254, 0.2)',
                borderTopColor: '#6498fe',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SCROLL PROGRESS BAR
// ─────────────────────────────────────────────────────────────────────────────
const ScrollProgressBar = ({ heroUnlocked }) => {
  const barRef = React.useRef(null);

  React.useEffect(() => {
    if (!heroUnlocked) return;
    const onScroll = () => {
      const el = document.documentElement;
      const top = el.scrollTop || document.body.scrollTop;
      const h = el.scrollHeight - el.clientHeight;
      if (barRef.current)
        barRef.current.style.width = `${h > 0 ? (top / h) * 100 : 0}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [heroUnlocked]);

  if (!heroUnlocked) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0,
      height: 2, background: 'rgba(255,255,255,0.04)',
      zIndex: 9998, pointerEvents: 'none',
    }}>
      <div ref={barRef} style={{
        height: '100%', width: '0%',
        background: 'linear-gradient(90deg, #00ffab, #06b6d4, #a78bfa)',
        boxShadow: '0 0 8px #00ffab88',
        transition: 'width 0.1s linear',
      }}/>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// BACK TO TOP
// ─────────────────────────────────────────────────────────────────────────────
const BackToTop = ({ heroUnlocked }) => {
  const [show, setShow] = useState(false);

  React.useEffect(() => {
    if (!heroUnlocked) return;
    const onScroll = () => setShow(window.scrollY > window.innerHeight * 0.5);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [heroUnlocked]);

  return (
    <AnimatePresence>
      {show && heroUnlocked && (
        <motion.button
          key="btt"
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.93 }}
          style={{
            position: 'fixed', bottom: 28, right: 28, zIndex: 999,
            width: 48, height: 48, borderRadius: '50%',
            background: '#00ffab', border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 18px #00ffab55',
            color: '#0a0f1e', fontSize: 18, fontWeight: 900,
          }}
        >↑</motion.button>
      )}
    </AnimatePresence>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// SECTION DIVIDER
// ─────────────────────────────────────────────────────────────────────────────
const SectionDivider = ({ colorA = '#00ffab', colorB = '#06b6d4' }) => (
  <div style={{
    height: 1,
    background: `linear-gradient(90deg, transparent, ${colorA}44, ${colorB}44, transparent)`,
  }}/>
);

// ─────────────────────────────────────────────────────────────────────────────
// ABOUT PAGE
// ─────────────────────────────────────────────────────────────────────────────
export default function About() {
  const [loaded, setLoaded] = useState(false);
  const [heroUnlocked, setHeroUnlocked] = useState(false);

  const handleHeroUnlock = () => {
    setHeroUnlocked(true);
  };

  return (
    <div className='bg-black'>
      <LoadingScreen onComplete={() => setLoaded(true)} />
      <ScrollProgressBar heroUnlocked={heroUnlocked} />
      <BackToTop heroUnlocked={heroUnlocked} />

      <AnimatePresence>
        {loaded && (
          <motion.main
            key="main"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            style={{
              background: '#050510',
              minHeight: '100vh',
              overflowX: 'hidden',
            }}
          >
            {/* Hero — collapses to height:0 after unlock */}
            <div style={{
              height: heroUnlocked ? 0 : '100vh',
              overflow: 'hidden',
              transition: 'height 0s',
            }}>
              <section id="hero">
                <ParticleHero onUnlock={handleHeroUnlock} />
              </section>
            </div>

            {/* Sections — mount after hero unlocks, zero gap */}
            <AnimatePresence>
              {heroUnlocked && (
                <motion.div
                  key="sections"
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    position: 'relative',
                    zIndex: 2,
                    background: '#080c18',
                  }}
                >

                  {/* ── 3D MODEL SECTION ── */}
                  <SectionModel3D />

                  <SectionDivider colorA="#00ffab" colorB="#7c3aed" />

                  {/* ── PROBLEM ── */}
                  <section id="problem">
                    <SectionProblem />
                  </section>

                  <SectionDivider colorA="#f87171" colorB="#3b82f6" />

                  {/* ── HOW IT WORKS ── */}
                  <section id="how-it-works">
                    <SectionHowItWorks />
                  </section>

                  <SectionDivider colorA="#00ffab" colorB="#06b6d4" />

                  {/* ── WHO FOR ── */}
                  <section id="who-for">
                    <SectionWhoFor />
                  </section>

                  <SectionDivider colorA="#a78bfa" colorB="#c084fc" />

                  {/* ── WHAT YOU GET ── */}
                  <section id="what-you-get">
                    <SectionWhatYouGet />
                  </section>

                  <SectionDivider colorA="#06b6d4" colorB="#00ffab" />

                  {/* ── WHY EXISTS ── */}
                  <section id="why-exists">
                    <SectionWhyExists />
                  </section>

                  <SectionDivider colorA="#7c3aed" colorB="#a78bfa" />

                  {/* ── FOUNDERS ── */}
                  <section id="founders">
                    <SectionFounders />
                  </section>

                  <SectionDivider colorA="#00ffab" colorB="#06b6d4" />

                  {/* ── CONTACT ── */}
                  <section id="contact">
                    <SectionContact />
                  </section>

                </motion.div>
              )}
            </AnimatePresence>

          </motion.main>
        )}
      </AnimatePresence>
    </div>
  );
}
