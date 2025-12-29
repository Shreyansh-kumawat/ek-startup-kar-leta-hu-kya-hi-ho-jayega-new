import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { authAPI } from '../features/auth/api';

const AuthContext = createContext({});

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_INIT':
      return { ...state, loading: true, error: null };
    case 'LOGIN_START':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        isAuthenticated: true, 
        user: {
          ...action.payload,
          credits: action.payload.credits ?? 0
        },
        error: null 
      };
    case 'LOGIN_ERROR':
      return { 
        ...state, 
        loading: false, 
        isAuthenticated: false, 
        user: null, 
        error: action.payload 
      };
    case 'AUTH_CHECK_SUCCESS':
      return {
        ...state,
        loading: false,
        isAuthenticated: true,
        user: {
          ...action.payload,
          credits: action.payload.credits ?? 0
        },
        error: null
      };
    case 'AUTH_CHECK_FAILED':
      return {
        ...state,
        loading: false,
        isAuthenticated: false,
        user: null,
        error: null
      };
    case 'LOGOUT':
      return { 
        ...state, 
        isAuthenticated: false, 
        user: null, 
        loading: false,
        error: null 
      };
    case 'UPDATE_USER':
      return { 
        ...state, 
        user: { 
          ...state.user, 
          ...action.payload,
          credits: action.payload.credits ?? state.user?.credits ?? 0
        } 
      };
    case 'UPDATE_CREDITS':
      return {
        ...state,
        user: {
          ...state.user,
          credits: action.payload
        }
      };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
};

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    checkInitialAuth();
  }, []);

  const checkInitialAuth = async () => {
    const token = localStorage.getItem('authToken');
    const savedUser = localStorage.getItem('user');
    
    if (!token) {
      dispatch({ type: 'AUTH_CHECK_FAILED' });
      return;
    }

    try {
      dispatch({ type: 'AUTH_INIT' });
      
      const response = await authAPI.getProfile();
      
      const userData = response.data?.user || response.user || response.data;
      dispatch({ type: 'AUTH_CHECK_SUCCESS', payload: userData });
      
      localStorage.setItem('user', JSON.stringify(userData));
      
    } catch (error) {
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          dispatch({ type: 'AUTH_CHECK_SUCCESS', payload: parsedUser });
          return;
        } catch (parseError) {
          // Ignore
        }
      }
      
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      dispatch({ type: 'AUTH_CHECK_FAILED' });
    }
  };

  const login = async (credentials) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authAPI.login(credentials);
      
      const { token, user } = response.data;
      
      localStorage.setItem('authToken', token);
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true, user };
      
    } catch (error) {
      console.error('❌ Login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Login failed';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const register = async (userData) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authAPI.register(userData);
      
      if (response.success) {
        const loginResult = await login({
          email: userData.email,
          password: userData.password
        });
        
        if (loginResult.success) {
          return { 
            success: true, 
            message: 'Registration and login successful!',
            user: loginResult.user 
          };
        } else {
          dispatch({ type: 'AUTH_CHECK_FAILED' });
          return { 
            success: true, 
            message: 'Registration successful! Please login with your credentials.',
            requiresLogin: true 
          };
        }
      }
      
      return { success: false, error: 'Registration failed' };
      
    } catch (error) {
      console.error('❌ Registration error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Registration failed';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  // ✅ FIXED: Google Login - Handle FLAT response structure
  const googleLogin = async (code) => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authAPI.googleLogin(code);
      
      console.log('🔍 Google Login Response:', response); // Debug
      
      // ✅ FIXED: Handle both flat and nested structures
      const token = response.token || response.data?.token;
      const user = response.user || response.data?.user;
      
      if (!token || !user) {
        throw new Error('Invalid response structure from server');
      }
      
      // ✅ Save token to BOTH locations for compatibility
      localStorage.setItem('authToken', token);
      localStorage.setItem('token', token); // For Dashboard/UserBookings
      localStorage.setItem('user', JSON.stringify(user));
      
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true, user, token };
      
    } catch (error) {
      console.error('❌ Google login error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Google login failed';
      dispatch({ type: 'LOGIN_ERROR', payload: errorMessage });
      return { success: false, error: errorMessage };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('❌ Logout API error:', error);
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('token'); // Remove both
      localStorage.removeItem('user');
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const updateCredits = (newCredits) => {
    dispatch({ type: 'UPDATE_CREDITS', payload: newCredits });
    
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        userData.credits = newCredits;
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (error) {
        console.error('Failed to update credits in localStorage:', error);
      }
    }
  };

  const value = {
    ...state,
    login,
    register,
    googleLogin,
    logout,
    clearError,
    checkAuthStatus: checkInitialAuth,
    updateCredits
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
