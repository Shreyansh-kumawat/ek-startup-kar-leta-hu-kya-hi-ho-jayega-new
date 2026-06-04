import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../features/auth/useAuth';
import { useNotification } from '../hooks/useNotification';
import { authAPI } from '../features/auth/api';
import Button from '../components/Button';
import Card from '../components/Card';
import Loader from '../components/Loader';
import { formatDate } from '../utils/helpers';
import {
  LuPen, LuX, LuCrown, LuKey, LuUser, LuShieldCheck,
  LuLogOut, LuSave, LuLightbulb, LuCheckCircle, LuTriangleAlert,
} from 'react-icons/lu';

const Account = () => {
  const navigate = useNavigate();
  const { user: authUser, logout, isAuthenticated } = useAuth();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    document.title = "My Account | 3Digree";
  }, []);

  const [loading, setLoading]   = useState(true);
  const [user, setUser]         = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setSaving]   = useState(false);

  const [editForm, setEditForm] = useState({ name: '', phone: '' });

  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [currentPassword, setCurrentPassword]       = useState('');
  const [changeNewPassword, setChangeNewPassword]   = useState('');
  const [changeConfirmPassword, setChangeConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  const loadUserProfile = async () => {
    try {
      setLoading(true);
      const response = await authAPI.getProfile();
      setUser(response.data);
      setEditForm({ name: response.data.name || '', phone: response.data.phone || '' });
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

  const handleEditToggle = () => {
    if (isEditing) setEditForm({ name: user.name || '', phone: user.phone || '' });
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    try {
      if (!editForm.name.trim())  { showError('Name is required');         return; }
      if (!editForm.phone.trim()) { showError('Phone number is required'); return; }
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

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      showError('Failed to logout');
    }
  };

  const handleChangePassword = async () => {
    try {
      if (!currentPassword)                              { showError('Current password is required');  return; }
      if (!changeNewPassword)                            { showError('New password is required');       return; }
      if (changeNewPassword.length < 6)                 { showError('Password must be at least 6 characters'); return; }
      if (changeNewPassword !== changeConfirmPassword)   { showError('Passwords do not match');         return; }

      setIsChangingPassword(true);
      await authAPI.changePassword({ currentPassword, newPassword: changeNewPassword });
      showSuccess('Password changed successfully! Logging out...');
      setShowChangePasswordModal(false);
      setCurrentPassword('');
      setChangeNewPassword('');
      setChangeConfirmPassword('');
      setTimeout(() => handleLogout(), 1500);
    } catch (error) {
      console.error('Error changing password:', error);
      showError(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const closeChangePasswordModal = () => {
    setShowChangePasswordModal(false);
    setCurrentPassword('');
    setChangeNewPassword('');
    setChangeConfirmPassword('');
  };

  const handleForgotPassword = () => {
    navigate('/forgot-password', { state: { userEmail: user.email } });
  };

  const getInitials = (name) => (name ? name.charAt(0).toUpperCase() : 'U');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader size="lg" />
          <p className="mt-4 text-gray-600 text-sm">Loading your profile...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <LuTriangleAlert className="w-8 h-8 text-gray-400" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Profile Not Found</h2>
          <p className="text-gray-500 mb-6 text-sm">Unable to load your profile information.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Profile Card */}
        <div className="lg:col-span-2">
          <Card className="p-0 border-0 rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-6 lg:p-8">

              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Profile Information</h2>
                <Button
                  onClick={handleEditToggle}
                  variant="outline"
                  size="sm"
                  className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white"
                  style={{ borderRadius: '12px' }}
                >
                  {isEditing
                    ? <span className="flex items-center gap-1.5"><LuX className="w-3.5 h-3.5" /> Cancel</span>
                    : <span className="flex items-center gap-1.5"><LuPen className="w-3.5 h-3.5" /> Edit</span>}
                </Button>
              </div>

              {/* Avatar + name */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
                <div className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl flex-shrink-0">
                  <span className="text-white text-4xl font-bold">{getInitials(user.name)}</span>
                </div>
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">{user.name}</h3>
                  <p className="text-gray-500 text-sm mb-3">{user.email}</p>
                  <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                      {user.role === 'admin'
                        ? <><LuCrown className="w-3.5 h-3.5" /> Admin</>
                        : user.role === 'secondaryAdmin'
                        ? <><LuKey className="w-3.5 h-3.5" /> Secondary Admin</>
                        : <><LuUser className="w-3.5 h-3.5" /> User</>}
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                      <LuCheckCircle className="w-3.5 h-3.5" />
                      {user.authProvider === 'google' ? 'Google Account' : 'Local Account'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Fields */}
              {isEditing ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="pt-2">
                    <Button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold"
                      style={{ borderRadius: '12px' }}
                    >
                      {isSaving ? (
                        <span className="flex items-center justify-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                          Saving...
                        </span>
                      ) : (
                        <span className="flex items-center justify-center gap-2">
                          <LuSave className="w-4 h-4" />
                          Save Changes
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-2xl p-4">
                    <div className="text-xs text-blue-600 font-semibold mb-1 uppercase tracking-wide">Full Name</div>
                    <div className="font-bold text-gray-900 text-sm">{user.name}</div>
                  </div>
                  <div className="bg-purple-50 rounded-2xl p-4">
                    <div className="text-xs text-purple-600 font-semibold mb-1 uppercase tracking-wide">Email</div>
                    <div className="font-bold text-gray-900 text-sm break-all">{user.email}</div>
                  </div>
                  <div className="bg-green-50 rounded-2xl p-4">
                    <div className="text-xs text-green-600 font-semibold mb-1 uppercase tracking-wide">Phone</div>
                    <div className="font-bold text-gray-900 text-sm">{user.phone || 'Not provided'}</div>
                  </div>
                  <div className="bg-orange-50 rounded-2xl p-4">
                    <div className="text-xs text-orange-600 font-semibold mb-1 uppercase tracking-wide">Member Since</div>
                    <div className="font-bold text-gray-900 text-sm">{formatDate(user.createdAt)}</div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Actions Sidebar */}
        <div className="space-y-4">

          {/* Security */}
          {user.authProvider === 'local' && (
            <Card className="p-0 border-0 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-4 sm:p-6 bg-gradient-to-br from-orange-50 to-red-50">
                <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <LuShieldCheck className="w-5 h-5 text-orange-600" />
                  Security
                </h3>
                <Button
                  onClick={() => setShowChangePasswordModal(true)}
                  className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold"
                  style={{ borderRadius: '12px' }}
                >
                  <span className="flex items-center justify-center gap-2">
                    <LuKey className="w-4 h-4" />
                    Change Password
                  </span>
                </Button>
                <p className="text-xs text-gray-500 mt-3 text-center">
                  Update password with your current password
                </p>
              </div>
            </Card>
          )}

          {/* Logout */}
          <Card className="p-0 border-0 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-red-50 to-pink-50">
              <h3 className="text-base font-bold text-gray-900 mb-4">Sign Out</h3>
              <Button
                onClick={handleLogout}
                className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold"
                style={{ borderRadius: '12px' }}
              >
                <span className="flex items-center justify-center gap-2">
                  <LuLogOut className="w-4 h-4" />
                  Logout
                </span>
              </Button>
              <p className="text-xs text-gray-500 mt-3 text-center">Sign out of your account</p>
            </div>
          </Card>

          {/* Account Stats */}
          <Card className="p-0 border-0 rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-cyan-50">
              <h3 className="text-base font-bold text-gray-900 mb-4">Account Stats</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className="text-sm font-semibold text-green-600 flex items-center gap-1">
                    <LuCheckCircle className="w-4 h-4" /> Active
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full p-6 sm:p-8 relative animate-fade-in">

            <button
              onClick={closeChangePasswordModal}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 p-1 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <LuX className="w-5 h-5" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <LuKey className="w-5 h-5 text-blue-600" />
              Change Password
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="Enter current password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                <input
                  type="password"
                  value={changeNewPassword}
                  onChange={(e) => setChangeNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="Enter new password"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
                <input
                  type="password"
                  value={changeConfirmPassword}
                  onChange={(e) => setChangeConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 text-sm"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="bg-blue-50 p-4 rounded-xl border-l-4 border-blue-500 flex items-start gap-2">
                <LuLightbulb className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-blue-800">Password must be at least 6 characters long.</p>
              </div>

              <div className="text-center">
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
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    Changing...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <LuCheckCircle className="w-4 h-4" />
                    Change Password
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in { animation: fade-in 0.3s ease-out; }
      `}</style>
    </div>
  );
};

export default Account;
