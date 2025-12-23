import { useEffect } from 'react';

const useBackendKeepalive = () => {
  useEffect(() => {

    const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'https://threedi-tbs-new.onrender.com';
    
    const pingBackend = async () => {
      try {

        const response = await fetch(`${BACKEND_URL}/health`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          signal: AbortSignal.timeout(8000),
        });

        if (response.ok) {
          console.log(`✅ Backend keepalive - ${new Date().toLocaleTimeString()}`);
        }
      } catch (error) {
        console.warn('⚠️ Backend ping failed:', error.message);
      }
    };

    const initialTimeout = setTimeout(pingBackend, 5000);
    const interval = setInterval(pingBackend, 10 * 60 * 1000);

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(interval);
    };
  }, []);
};

export default useBackendKeepalive;