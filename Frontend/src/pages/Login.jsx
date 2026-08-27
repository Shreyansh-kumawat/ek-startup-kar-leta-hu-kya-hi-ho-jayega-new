import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { useForm } from '../hooks/useForm';
import { validationRules } from '../utils/validators';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { useNotification } from '../hooks/useNotification';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, googleLogin, isAuthenticated, loading: authLoading, error, clearError } = useAuth();
  const { showError, showSuccess } = useNotification();
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

   useEffect(() => {
      document.title = "Login | 3Digree";
    }, []);
  
  // Check if user came from TemplateDetails (after clicking "Get This Website" without login)
  const from = location.state?.from?.pathname || '/';
  const returnToTemplate = location.state?.returnToTemplate || false;
  
  const {
    values,
    errors,
    handleChange,
    handleBlur,
    handleSubmit,
    isSubmitting,
    setFieldValue
  } = useForm(
    { 
      email: '', 
      password: '' 
    },
    {
      email: validationRules.email,
      password: validationRules.required
    }
  );
  
  const handleGoogleLogin = async () => {
    try {
      const result = await googleLogin();
      if (!result?.success) {
        showError(result?.error || 'Google login failed');
      }
    } catch (error) {
      console.error('Google login error:', error);
      showError('Google login failed. Please try again.');
    }
  };
  
  useEffect(() => {
    if (isAuthenticated) {
      if (returnToTemplate && from !== '/login') {
        navigate(from, { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, navigate, from, returnToTemplate]);
  
  useEffect(() => {
    if (error) {
      showError(error);
      clearError();
    }
  }, [error, showError, clearError]);
  
  const onSubmit = async (formData) => {
    try {
      const result = await login(formData);
      
      if (result?.success) {
        showSuccess(`Welcome back, ${result.user?.name || 'User'}!`);

        if (returnToTemplate && from !== '/login') {
          navigate(from, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        showError(result?.message || 'Login failed');
      }
    } catch (err) {
      showError(err.message || 'Login failed. Please try again.');
    }
  };

  const handleDemoLogin = async (userType) => {
    const demoCredentials = {
      user: {
        email: 'demo@user.com',
        password: 'password123'
      },
      admin: {
        email: 'admin@3degree.com',
        password: 'admin123'
      }
    };

    try {
      setFieldValue('email', demoCredentials[userType].email);
      setFieldValue('password', demoCredentials[userType].password);

      const result = await login(demoCredentials[userType]);

      if (result?.success) {
        showSuccess(`Demo ${userType} login successful!`);

        if (returnToTemplate && from !== '/login') {
          navigate(from, { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      } else {
        showError(result?.message || `Demo ${userType} login failed`);
      }
    } catch (err) {
      showError(`Demo ${userType} login failed: ${err.message}`);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
         
          <h2 className="text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          
          <p className="mt-2 text-sm text-gray-600">
            Or{' '}
            <Link 
              to="/register" 
              state={{ from: location.state?.from, returnToTemplate: location.state?.returnToTemplate }}
              className="font-bold textmd text-blue-600 hover:text-blue-500 transition-colors"
            >
              Create New Account
            </Link>
          </p>
        </div>
        
        {authLoading && !isSubmitting && (
          <div className="text-center py-4">
            <div className="inline-flex items-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="ml-2 text-gray-600">Checking authentication...</span>
            </div>
          </div>
        )}
        
        <Card className="p-8">
          <button
            type="button"
            onClick={() => handleGoogleLogin()}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg shadow-sm bg-white hover:bg-gray-50 transition-colors mb-6"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            <span className="text-sm font-medium text-gray-700">Continue with Google</span>
          </button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or sign in with email</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              name="email"
              type="email"
              label="Email Address"
              placeholder="Enter your email address"
              value={values.email}
              onChange={handleChange}
              onBlur={handleBlur}
              error={errors.email}
              required
              autoComplete="email"
              autoFocus
            />
            
            <div className="relative">
              <Input
                name="password"
                type={showPassword ? "text" : "password"}
                label="Password"
                placeholder="Enter your password"
                value={values.password}
                onChange={handleChange}
                onBlur={handleBlur}
                error={errors.password}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-9 text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                )}
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>

              <Link 
                to="/forgot-password" 
                className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors"
              >
                Forgot Password?
              </Link>
            </div>
            
            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={isSubmitting || (authLoading && isSubmitting)}
              disabled={!values.email || !values.password}
              className="w-full"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </Card>

        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Your connection is secure and encrypted</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
