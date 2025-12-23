import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // ✅ INSTANT: Scroll to top on route change
    window.scrollTo(0, 0);
    
    // ✅ ALTERNATIVE: Smooth scroll (optional)
    // window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [pathname]);

  return null; // This component doesn't render anything
};

export default ScrollToTop;
