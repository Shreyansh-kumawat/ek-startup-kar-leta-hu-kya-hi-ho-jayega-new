import { useAuth as useAuthContext } from '../../context/AuthContext';

// Re-export the useAuth hook for convenience
export const useAuth = useAuthContext;

// Additional auth-related hooks can be added here
export const useAuthActions = () => {
  const { login, register, logout } = useAuthContext();
  return { login, register, logout };
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