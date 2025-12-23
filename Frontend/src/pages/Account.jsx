import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { useNotification } from '../hooks/useNotification';
import { authAPI } from '../features/auth/api';
import Button from '../components/Button';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { formatDate } from '../utils/helpers';

const Account = () => {
  const navigate = useNavigate();
  const { user: authUser, logout, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    name: '',
    phone: ''
  });

  // ✅ Change Password modal states (with current password)
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [changeNewPassword, setChangeNewPassword] = useState('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Load user profile
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      setUser(response.data);
      setEditForm({
        name: response.data.name || '',
        phone: response.data.phone || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
      showError('Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    loadUserProfile();
  }, [isAuthenticated, navigate]);

  // Handle edit mode toggle
  const handleEditToggle = () => {
    if (isEditing) {
      setEditForm({
        name: user.name || '',
        phone: user.phone || ''
      });
    }
    setIsEditing(!isEditing);
  };

  // Handle profile update
  const handleSaveProfile = async () => {
    try {
      if (!editForm.name.trim()) {
        showError('Name is required');
        return;
      }
      if (!editForm.phone.trim()) {
        showError('Phone number is required');
        return;
      }

      setSaving(true);
      const response = await authAPI.updateProfile(editForm);
      setUser(response.data);
      setIsEditing(false);
      showSuccess('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      showError(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      showError('Failed to logout');
    }
  };

  // ✅ Change Password - With Current Password
const handleChangePassword = async () => {
  try {
    if (!currentPassword) {
      showError('Current password is required');
      return;
    }
    if (!changeNewPassword) {
      showError('New password is required');
      return;
    }
    if (changeNewPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }
    
    // ✅ FIXED: Compare correct state variables
    if (changeNewPassword !== changeConfirmPassword) {
      showError('Passwords do not match');
      console.log('New:', changeNewPassword, 'Confirm:', changeConfirmPassword); // Debug log
      return;
    }

    setIsChangingPassword(true);
    await authAPI.changePassword({
      currentPassword: currentPassword,
      newPassword: changeNewPassword
    });
    
    showSuccess('Password changed successfully! Logging out...');
    
    // Close modal and clear fields
    setShowChangePasswordModal(false);
    setCurrentPassword('');
    setChangeNewPassword('');
    setChangeConfirmPassword('');
    
    // Logout after password change
    setTimeout(() => {
      handleLogout();
    }, 1500);
  } catch (error) {
    console.error('Error changing password:', error);
    showError(error.response?.data?.message || 'Failed to change password');
  } finally {
    setIsChangingPassword(false);
  }
};


  // ✅ Close change password modal
  const closeChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    setCurrentPassword('');
    setChangeNewPassword('');
    setChangeConfirmPassword('');
  };

  // ✅ NEW: Handle Forgot Password Navigation
  const handleForgotPassword = () => {
    // Navigate to forgot-password page with user email in state
    navigate('/forgot-password', { 
      state: { userEmail: user.email } 
    });
  };

  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : 'U';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <div className="text-center bg-white p-8 sm:p-12 rounded-2xl sm:rounded-3xl shadow-2xl max-w-sm w-full">
          <Loader size="xl" />
          <p className="mt-6 text-gray-600 text-base sm:text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
        <Card className="p-8 sm:p-12 text-center max-w-lg shadow-2xl bg-white rounded-2xl sm:rounded-3xl w-full">
          <div className="text-6xl sm:text-8xl mb-4 sm:mb-6">😔</div>
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">Profile Not Found</h2>
          <p className="text-gray-600 mb-6 sm:mb-8 leading-relaxed text-sm sm:text-base">Unable to load your profile information.</p>
          <Button 
            onClick={() => navigate('/dashboard')}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold w-full sm:w-auto"
            style={{ borderRadius: '20px' }}
          >
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}>
      <div className="max-w-5xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        
        {/* Header */}
        <div className="mb-6 sm:mb-8 lg:mb-12">
          <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl p-4 sm:p-6 lg:p-8" style={{ background: 'linear-gradient(135deg, #6498fe 0%, #5a87f7 100%)' }}>
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white mb-2 sm:mb-3 leading-tight">
                    My Account 👤
                  </h1>
                  <p className="text-white/90 text-sm sm:text-base lg:text-xl">
                    Manage your profile and account settings
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <Card className="p-0 border-0 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-4 sm:p-6 lg:p-8 bg-gradient-to-r from-white to-gray-50">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Profile Information</h2>
                  <Button
                    onClick={handleEditToggle}
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                    style={{ borderRadius: '12px' }}
                  >
                    {isEditing ? '✕ Cancel' : '✏️ Edit'}
                  </Button>
                </div>

                {/* Profile Avatar */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0">
                    <span className="text-white text-4xl sm:text-5xl font-bold">
                      {getInitials(user.name)}
                    </span>
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{user.name}</h3>
                    <p className="text-gray-600 text-sm sm:text-base mb-3">{user.email}</p>
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs sm:text-sm font-semibold">
                        {user.role === 'admin' ? '👑 Admin' : user.role === 'secondaryAdmin' ? '🔑 Secondary Admin' : '👤 User'}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm font-semibold">
                        ✅ {user.authProvider === 'google' ? 'Google Account' : 'Local Account'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Profile Fields */}
                {isEditing ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                        placeholder="Enter your name"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        value={editForm.phone}
                        onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                        placeholder="Enter your phone number"
                      />
                    </div>

                    <div className="flex gap-3 pt-4">
                      <Button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                        style={{ borderRadius: '12px' }}
                      >
                        {isSaving ? (
                          <>
                            <span className="animate-spin mr-2">⏳</span>
                            Saving...
                          </>
                        ) : (
                          <>
                            <span className="mr-2">💾</span>
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-blue-50 rounded-xl sm:rounded-2xl p-4">
                      <div className="text-xs sm:text-sm text-blue-600 font-medium mb-1">Full Name</div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base">{user.name}</div>
                    </div>

                    <div className="bg-purple-50 rounded-xl sm:rounded-2xl p-4">
                      <div className="text-xs sm:text-sm text-purple-600 font-medium mb-1">Email</div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base break-all">{user.email}</div>
                    </div>

                    <div className="bg-green-50 rounded-xl sm:rounded-2xl p-4">
                      <div className="text-xs sm:text-sm text-green-600 font-medium mb-1">Phone Number</div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base">{user.phone || 'Not provided'}</div>
                    </div>

                    <div className="bg-orange-50 rounded-xl sm:rounded-2xl p-4">
                      <div className="text-xs sm:text-sm text-orange-600 font-medium mb-1">Member Since</div>
                      <div className="font-bold text-gray-900 text-sm sm:text-base">{formatDate(user.createdAt)}</div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Actions Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Security Card - Password Options */}
            {user.authProvider === 'local' && (
              <Card className="p-0 border-0 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-red-50">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <span>🔐</span>
                    Security
                  </h3>
                  
                  {/* Change Password Button */}
                  <Button
                    onClick={() => setShowChangePasswordModal(true)}
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold"
                    style={{ borderRadius: '12px' }}
                  >
                    <span className="mr-2">🔑</span>
                    Change Password
                  </Button>
                  <p className="text-xs text-gray-600 mt-3 text-center">
                    Update password with current password
                  </p>
                </div>
              </Card>
            )}

            {/* Logout Card */}
            <Card className="p-0 border-0 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-4 sm:p-6 bg-gradient-to-br from-red-50 to-pink-50">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Sign Out</h3>
                <Button
                  onClick={handleLogout}
                  className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold"
                  style={{ borderRadius: '12px' }}
                >
                  <span className="mr-2">🚪</span>
                  Logout
                </Button>
                <p className="text-xs text-gray-600 mt-3 text-center">
                  Sign out of your account
                </p>
              </div>
            </Card>

            {/* Account Stats */}
            <Card className="p-0 border-0 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
              <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Account Stats</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status</span>
                    <span className="text-sm font-semibold text-green-600">✅ Active</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Verified</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {user.isVerified ? '✅ Yes' : '⏳ Pending'}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* ✅ Change Password Modal (With Current Password) */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-fade-in">
            <button
              onClick={closeChangePasswordModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              🔑 Change Password
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={changeNewPassword}
                  onChange={(e) => setChangeNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={changeConfirmPassword}
                  onChange={(e) => setChangeConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500">
                <p className="text-sm text-blue-800">
                  💡 Password must be at least 6 characters long.
                </p>
              </div>

              {/* ✅ NEW: Forgot Password Link inside modal */}
              <div className="text-center pt-2">
                <button
                  onClick={handleForgotPassword}
                  className="text-sm text-orange-600 hover:text-orange-700 font-medium underline"
                >
                  Forgot your current password?
                </button>
              </div>

              <Button
                onClick={handleChangePassword}
                disabled={isChangingPassword}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                style={{ borderRadius: '12px' }}
              >
                {isChangingPassword ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Changing...
                  </>
                ) : (
                  <>
                    <span className="mr-2">✅</span>
                    Change Password
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Account;
