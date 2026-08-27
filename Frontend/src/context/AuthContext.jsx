import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_INIT':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: { ...action.payload, credits: action.payload.credits ?? 0 },
        error: null,
      };
    case 'AUTH_CHECK_FAILED':
      return { ...state, loading: false, isAuthenticated: false, user: null, error: null };
    case 'LOGIN_ERROR':
      return { ...state, loading: false, isAuthenticated: false, user: null, error: action.payload };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, user: null, loading: false, error: null };
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload, credits: action.payload.credits ?? state.user?.credits ?? 0 },
      };
    case 'UPDATE_CREDITS':
      return { ...state, user: { ...state.user, credits: action.payload } };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = { user: null, isAuthenticated: false, loading: true, error: null };

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

function profileToUser(profile) {
  return {
    id: profile.id,
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
    role: profile.role,
    credits: profile.credits || 0,
    profilePicture: profile.profile_picture,
  };
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      dispatch({ type: 'AUTH_INIT' });

      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && mounted) {
        try {
          const profile = await fetchProfile(session.user.id);
          if (!profile.is_active) {
            await supabase.auth.signOut();
            dispatch({ type: 'AUTH_CHECK_FAILED' });
            return;
          }
          dispatch({ type: 'LOGIN_SUCCESS', payload: profileToUser(profile) });
        } catch {
          dispatch({ type: 'AUTH_CHECK_FAILED' });
        }
      } else if (mounted) {
        dispatch({ type: 'AUTH_CHECK_FAILED' });
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_IN' && session?.user) {
        try {
          const profile = await fetchProfile(session.user.id);
          dispatch({ type: 'LOGIN_SUCCESS', payload: profileToUser(profile) });
        } catch {
          dispatch({ type: 'AUTH_CHECK_FAILED' });
        }
      } else if (event === 'SIGNED_OUT') {
        dispatch({ type: 'LOGOUT' });
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        try {
          const profile = await fetchProfile(session.user.id);
          dispatch({ type: 'UPDATE_USER', payload: profileToUser(profile) });
        } catch {}
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const login = async (credentials) => {
    try {
      dispatch({ type: 'AUTH_INIT' });

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      const profile = await fetchProfile(data.user.id);
      if (!profile.is_active) {
        await supabase.auth.signOut();
        throw new Error('Account is deactivated');
      }

      const user = profileToUser(profile);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });

      supabase.functions.invoke('send-email', {
        body: {
          type: 'login_alert',
          to: profile.email,
          name: profile.name,
          data: { loginTime: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) },
        },
      }).catch(() => {});

      return { success: true, user };
    } catch (error) {
      const msg = error.message || 'Login failed';
      dispatch({ type: 'LOGIN_ERROR', payload: msg });
      return { success: false, error: msg };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_INIT' });

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: { name: userData.name, phone: userData.phone, full_name: userData.name },
        },
      });

      if (error) throw error;

      if (data.user) {
        await supabase
          .from('profiles')
          .update({ phone: userData.phone?.replace(/\D/g, '') || '' })
          .eq('id', data.user.id);

        const loginResult = await login({ email: userData.email, password: userData.password });
        if (loginResult.success) {
          return { success: true, message: 'Registration successful!', user: loginResult.user };
        }
      }

      dispatch({ type: 'AUTH_CHECK_FAILED' });
      return { success: true, message: 'Registration successful! Please login.', requiresLogin: true };
    } catch (error) {
      const msg = error.message || 'Registration failed';
      dispatch({ type: 'LOGIN_ERROR', payload: msg });
      return { success: false, error: msg };
    }
  };

  const googleLogin = async () => {
    try {
      dispatch({ type: 'AUTH_INIT' });

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: window.location.origin + '/dashboard' },
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      const msg = error.message || 'Google login failed';
      dispatch({ type: 'LOGIN_ERROR', payload: msg });
      return { success: false, error: msg };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {}
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });

  const updateCredits = (newCredits) => {
    dispatch({ type: 'UPDATE_CREDITS', payload: newCredits });
  };

  const checkAuthStatus = async () => {
    dispatch({ type: 'AUTH_INIT' });
    const { data: { session } } = await supabase.auth.getSession();
    if (session?.user) {
      try {
        const profile = await fetchProfile(session.user.id);
        dispatch({ type: 'LOGIN_SUCCESS', payload: profileToUser(profile) });
      } catch {
        dispatch({ type: 'AUTH_CHECK_FAILED' });
      }
    } else {
      dispatch({ type: 'AUTH_CHECK_FAILED' });
    }
  };

  const value = {
    ...state,
    login,
    register,
    googleLogin,
    logout,
    clearError,
    checkAuthStatus,
    updateCredits,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export default AuthContext;
