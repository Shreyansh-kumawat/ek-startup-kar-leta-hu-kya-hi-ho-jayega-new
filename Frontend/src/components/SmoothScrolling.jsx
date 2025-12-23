import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css'; // CSS import karein

function SmoothScrolling({ children }) {
  useEffect(() => {
    // Lenis instance create karo
    const lenis = new Lenis({
      lerp: 0.1,           // Smoothness (0.05-0.1 best)
      duration: 1.5,       // Scroll duration
      smoothTouch: false,  // Mobile ke liye disable
      smooth: true,
    });

    // Animation frame loop
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Cleanup function
    return () => {
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}

export default SmoothScrolling;
