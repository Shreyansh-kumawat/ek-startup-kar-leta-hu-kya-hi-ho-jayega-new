import { useAuth as useAuthContext } from '../../context/AuthContext';

// Re-export the useAuth hook for convenience
export const useAuth = useAuthContext;

// ✅ FIX: Export googleLogin explicitly
export const useGoogleLogin = () => {
  const { googleLogin } = useAuthContext();
  return googleLogin;
};

// Additional auth-related hooks can be added here
export const useAuthActions = () => {
  const { login, register, logout, googleLogin } = useAuthContext(); // ⬅️ ADD googleLogin
  return { login, register, logout, googleLogin };
};

export const useAuthState = () => {
  const { user, isAuthenticated, loading, error } = useAuthContext();
  return { user, isAuthenticated, loading, error };
};

export const useIsAdmin = () => {
  const { user } = useAuthContext();
  return user?.role === 'admin' || user?.role === 'secondaryAdmin';
};

export const useIsMainAdmin = () => {
  const { user } = useAuthContext();
  return user?.role === 'admin';
};
