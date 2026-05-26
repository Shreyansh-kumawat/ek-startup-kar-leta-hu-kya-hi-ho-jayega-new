import { useEffect, useRef, useState } from 'react';

// Slides michel.gif from left to right when user is idle for 10s.
// If user becomes active mid-slide, it quickly retreats back to the left.
const IdleAnimation = () => {
  const [visible, setVisible] = useState(false);
  const imgRef = useRef(null);
  const phaseRef = useRef('waiting'); // 'waiting' | 'sliding' | 'retreating'
  const idleTimerRef = useRef(null);
  const slideEndTimerRef = useRef(null);
  const retreatTimerRef = useRef(null);

  // Use a ref so the recursive callback always has the latest version
  const startIdleCountdownRef = useRef(null);
  startIdleCountdownRef.current = () => {
    clearTimeout(idleTimerRef.current);
    idleTimerRef.current = setTimeout(() => {
      phaseRef.current = 'sliding';
      setVisible(true);
      // After the 11s slide finishes, hide and restart idle countdown
      slideEndTimerRef.current = setTimeout(() => {
        setVisible(false);
        phaseRef.current = 'waiting';
        startIdleCountdownRef.current();
      }, 11200); // 11s animation + small buffer
    }, 10000);
  };

  const handleActivityRef = useRef(null);
  handleActivityRef.current = () => {
    const phase = phaseRef.current;

    if (phase === 'sliding') {
      // Freeze the gif at its current position, then quickly slide it back left
      clearTimeout(slideEndTimerRef.current);
      phaseRef.current = 'retreating';

      if (imgRef.current) {
        const rect = imgRef.current.getBoundingClientRect();
        // Cancel the CSS animation and lock to current position
        imgRef.current.style.animation = 'none';
        imgRef.current.style.left = rect.left + 'px';
        // Force a reflow so the browser registers the position change
        void imgRef.current.offsetWidth;
        // Now transition quickly to offscreen left
        imgRef.current.style.transition = 'left 0.35s ease-in';
        imgRef.current.style.left = '-70px';
      }

      retreatTimerRef.current = setTimeout(() => {
        setVisible(false);
        phaseRef.current = 'waiting';
        startIdleCountdownRef.current();
      }, 380);

    } else if (phase === 'waiting') {
      // Reset idle countdown on every activity
      startIdleCountdownRef.current();
    }
    // If 'retreating', ignore — already going back
  };

  useEffect(() => {
    const onActivity = () => handleActivityRef.current();
    const events = ['mousemove', 'mousedown', 'click', 'scroll', 'keydown', 'touchstart'];
    const opts = { passive: true };
    events.forEach(e => window.addEventListener(e, onActivity, opts));

    // Kick off the first idle countdown
    startIdleCountdownRef.current();

    return () => {
      events.forEach(e => window.removeEventListener(e, onActivity, opts));
      clearTimeout(idleTimerRef.current);
      clearTimeout(slideEndTimerRef.current);
      clearTimeout(retreatTimerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <>
      <style>{`
        @keyframes michelWalk {
          from { left: -60px; }
          to   { left: calc(100vw + 60px); }
        }
      `}</style>
      <img
        ref={imgRef}
        src="/gifs/michel.gif"
        alt=""
        style={{
          position: 'fixed',
          bottom: 0,
          left: '-60px',
          height: '50px',
          width: 'auto',
          zIndex: 9999,
          pointerEvents: 'none',
          animation: 'michelWalk 11s linear forwards',
        }}
      />
    </>
  );
};

export default IdleAnimation;
