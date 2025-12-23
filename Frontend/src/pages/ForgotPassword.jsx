import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../features/auth/api';
import { useNotification } from '../hooks/useNotification';
import Button from '../components/Button';
import Card from '../components/Card';
import Input from '../components/Input';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showSuccess, showError } = useNotification();
  
  const [step, setStep] = useState(1); // 1 = Send OTP, 2 = Enter OTP & New Password
  const [loading, setLoading] = useState(false);
  
  // ✅ Get email from navigation state (if coming from Account page)
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // ✅ Set email from state when component mounts
  useEffect(() => {
    if (location.state?.userEmail) {
      setEmail(location.state.userEmail);
    }
  }, [location.state]);

  // Step 1: Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    
    if (!email) {
      showError('Email is required');
      return;
    }

    try {
      setLoading(true);
      await authAPI.forgotPassword(email);
      showSuccess('OTP sent to your email!');
      setStep(2);
    } catch (error) {
      console.error('Send OTP error:', error);
      showError(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    
    if (!otp || !newPassword || !confirmPassword) {
      showError('All fields are required');
      return;
    }

    if (newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      await authAPI.resetPassword({ email, otp, newPassword });
      showSuccess('Password reset successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Reset password error:', error);
      showError(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-blue-100 py-12 px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-600 mb-2">3Degree-TBS</h1>
          <h2 className="text-3xl font-extrabold text-gray-900">
            {step === 1 ? 'Forgot Password?' : 'Reset Password'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {step === 1 ? 'We will send OTP to your registered email' : 'Enter OTP and new password'}
          </p>
        </div>

        <Card className="p-8">
          {step === 1 ? (
            // Step 1: Send OTP (Email is pre-filled and disabled)
            <form onSubmit={handleSendOtp} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!location.state?.userEmail}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  placeholder="Enter your email"
                  required
                />
                {location.state?.userEmail && (
                  <p className="mt-2 text-xs text-gray-500">
                    This is your registered email address
                  </p>
                )}
              </div>

              <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-500">
                <p className="text-sm text-blue-800">
                  📧 We'll send a 6-digit OTP to this email address.
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl"
              >
                {loading ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <span className="mr-2">📧</span>
                    Send OTP
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link to="/login" className="text-sm text-blue-600 hover:text-blue-500">
                  Back to Login
                </Link>
              </div>
            </form>
          ) : (
            // Step 2: Enter OTP & New Password
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  OTP (6-digit code)
                </label>
                <input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  required
                  autoFocus
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-center text-2xl font-bold tracking-widest"
                  placeholder="000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-500">
                <p className="text-sm text-yellow-800">
                  ⚠️ Check your email for the OTP. It expires in 10 minutes.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 border-2 border-gray-300 text-gray-700 hover:bg-gray-100 py-3 rounded-xl font-semibold"
                >
                  ← Back
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold py-3 rounded-xl"
                >
                  {loading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Resetting...
                    </>
                  ) : (
                    <>
                      <span className="mr-2">✅</span>
                      Reset Password
                    </>
                  )}
                </Button>
              </div>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ForgotPassword;
