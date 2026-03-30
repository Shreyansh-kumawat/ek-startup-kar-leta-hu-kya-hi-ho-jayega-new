import React, { useState, useEffect } from 'react';
import { getAllUsers, deleteUser, getUserById, updateUserCredits } from './api';
import { useNotification } from '../../hooks/useNotification';
import Loader from '../../components/Loader';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showCreditsModal, setShowCreditsModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [creditsChange, setCreditsChange] = useState(0);
  const [creditsApplied, setCreditsApplied] = useState(null); // { amount, type: 'add'|'remove' }
  const [creditsLoading, setCreditsLoading] = useState(false);
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      setUsers(Array.isArray(response.data?.users) ? response.data.users : Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      addNotification('Failed to load users', 'error');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInfoClick = async (userId) => {
    try {
      const response = await getUserById(userId);
      setSelectedUser(response.data);
      setShowInfoModal(true);
      setCreditsApplied(null);
    } catch (error) {
      addNotification('Failed to load user details', 'error');
    }
  };

  const handleDeleteClick = (user) => {
    setDeleteTarget(user);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await deleteUser(deleteTarget._id);
      addNotification('User deleted successfully', 'success');
      setShowDeleteModal(false);
      setDeleteTarget(null);
      fetchUsers();
    } catch (error) {
      addNotification(error.message || 'Failed to delete user', 'error');
    } finally {
      setDeleteLoading(false);
    }
  };

  const openCreditsModal = () => {
    setCreditsChange(0);
    setCreditsApplied(null);
    setShowCreditsModal(true);
  };

  const handleCreditsApply = async () => {
    if (!selectedUser?.user) return;
    const currentCredits = selectedUser.user.credits || 0;
    const newTotal = Math.max(0, currentCredits + creditsChange);
    try {
      setCreditsLoading(true);
      await updateUserCredits(selectedUser.user._id, newTotal);
      const diff = newTotal - currentCredits;
      setCreditsApplied({ amount: Math.abs(diff), type: diff >= 0 ? 'add' : 'remove' });
      // update local selectedUser credits
      setSelectedUser(prev => ({
        ...prev,
        user: { ...prev.user, credits: newTotal }
      }));
      // update users list
      setUsers(prev => prev.map(u => u._id === selectedUser.user._id ? { ...u, credits: newTotal } : u));
      addNotification('Credits updated successfully', 'success');
      setShowCreditsModal(false);
      setCreditsChange(0);
    } catch (error) {
      addNotification(error.message || 'Failed to update credits', 'error');
    } finally {
      setCreditsLoading(false);
    }
  };

  const currentCredits = selectedUser?.user?.credits || 0;
  const newCreditsTotal = Math.max(0, currentCredits + creditsChange);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-2xl font-bold text-gray-900">Users ({users.length})</h2>
      </div>

      {/* User List */}
      <div className="space-y-3">
        {users.length === 0 && (
          <div className="text-center py-12 text-gray-500">No users found.</div>
        )}
        {users.map((user) => (
          <div
            key={user._id}
            className="flex items-center justify-between bg-white border border-gray-200 rounded-xl px-5 py-4 shadow-sm hover:shadow-md transition-shadow"
          >
            {/* Left: Avatar + Info */}
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                {(user.name || user.email || '?').charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="font-semibold text-gray-900 text-sm">{user.name || '—'}</div>
                <div className="text-gray-500 text-xs">{user.phone || 'No phone'}</div>
                <div className="text-gray-400 text-xs">{user.email}</div>
              </div>
            </div>

            {/* Right: Buttons */}
            <div className="flex items-center gap-2">
              {/* Info Button */}
              <button
                onClick={() => handleInfoClick(user._id)}
                title="User Info"
                className="w-8 h-8 rounded-full border border-blue-400 text-blue-500 flex items-center justify-center text-xs font-bold hover:bg-blue-50 transition-colors"
              >
                i
              </button>
              {/* Delete Button */}
              {user.role !== 'admin' && (
                <button
                  onClick={() => handleDeleteClick(user)}
                  title="Delete User"
                  className="w-8 h-8 rounded-full bg-red-50 border border-red-300 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ===== DELETE CONFIRM POPUP ===== */}
      {showDeleteModal && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowDeleteModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl p-7 w-full max-w-sm mx-4 z-10">
            <button
              onClick={() => setShowDeleteModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-xl font-bold leading-none"
            >
              &times;
            </button>
            <div className="text-center">
              <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">Sure to remove user?</h3>
              <p className="text-gray-500 text-sm mb-6">
                <span className="font-semibold text-gray-700">{deleteTarget.name || deleteTarget.email}</span> will be permanently deleted.
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition"
                >
                  No
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  disabled={deleteLoading}
                  className="px-5 py-2.5 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition disabled:opacity-60"
                >
                  {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== INFO POPUP ===== */}
      {showInfoModal && selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowInfoModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 z-10 max-h-[90vh] overflow-y-auto">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-gray-100">
              <h3 className="text-lg font-bold text-gray-900">User Details</h3>
              <button
                onClick={() => setShowInfoModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Avatar + Name */}
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl flex-shrink-0">
                  {(selectedUser.user?.name || selectedUser.user?.email || '?').charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="font-bold text-gray-900 text-base">{selectedUser.user?.name || '—'}</div>
                  <div className="text-gray-500 text-sm">{selectedUser.user?.email}</div>
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    selectedUser.user?.role === 'admin' ? 'bg-red-100 text-red-700' :
                    selectedUser.user?.role === 'secondaryAdmin' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>{selectedUser.user?.role}</span>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-gray-400 text-xs mb-0.5">Phone</div>
                  <div className="font-medium text-gray-800">{selectedUser.user?.phone || 'N/A'}</div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-gray-400 text-xs mb-0.5">Status</div>
                  <div className={`font-medium ${selectedUser.user?.isActive ? 'text-green-600' : 'text-red-500'}`}>
                    {selectedUser.user?.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-3">
                  <div className="text-gray-400 text-xs mb-0.5">Joined</div>
                  <div className="font-medium text-gray-800">
                    {selectedUser.user?.createdAt ? new Date(selectedUser.user.createdAt).toLocaleDateString('en-IN') : 'N/A'}
                  </div>
                </div>
                <div className="bg-blue-50 rounded-xl p-3">
                  <div className="text-blue-400 text-xs mb-0.5">Credits</div>
                  <div className="font-bold text-blue-700 text-base">{selectedUser.user?.credits ?? 0}</div>
                </div>
              </div>

              {/* Stats */}
              {selectedUser.stats && (
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Activity</div>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="font-bold text-gray-900">{selectedUser.stats.totalOrders ?? 0}</div>
                      <div className="text-gray-400 text-xs">Orders</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="font-bold text-gray-900">{selectedUser.stats.completedOrders ?? 0}</div>
                      <div className="text-gray-400 text-xs">Completed</div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="font-bold text-gray-900">{selectedUser.stats.activeProjects ?? 0}</div>
                      <div className="text-gray-400 text-xs">Active</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Plans/Orders */}
              {selectedUser.orders && selectedUser.orders.length > 0 && (
                <div>
                  <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Recent Orders</div>
                  <div className="space-y-2">
                    {selectedUser.orders.slice(0, 5).map(order => (
                      <div key={order._id} className="flex justify-between items-center bg-gray-50 rounded-lg px-3 py-2 text-sm">
                        <span className="text-gray-700">{order.templateId?.name || 'Template'}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>{order.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Credits applied feedback */}
              {creditsApplied && (
                <div className={`text-center text-sm font-semibold py-1 rounded-lg ${
                  creditsApplied.type === 'add' ? 'text-green-600 bg-green-50' : 'text-red-500 bg-red-50'
                }`}>
                  {creditsApplied.type === 'add' ? `+${creditsApplied.amount}` : `-${creditsApplied.amount}`} credits applied
                </div>
              )}

              {/* Manage Credits Button */}
              <div className="pt-1">
                <button
                  onClick={openCreditsModal}
                  className="w-full py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition text-sm"
                >
                  Manage Credits
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ===== MANAGE CREDITS POPUP (on top of info popup) ===== */}
      {showCreditsModal && selectedUser && (
        <div className="fixed inset-0 z-60 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowCreditsModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm mx-4 z-10">
            {/* Top bar */}
            <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Manage Credits</h3>
              <button
                onClick={() => setShowCreditsModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
              >
                &times;
              </button>
            </div>

            <div className="px-6 py-5 space-y-5">
              {/* Current Credits */}
              <div className="text-center bg-blue-50 rounded-xl py-4">
                <div className="text-blue-400 text-xs mb-1">Current Credits</div>
                <div className="text-4xl font-extrabold text-blue-700">{currentCredits}</div>
              </div>

              {/* +/- Controls */}
              <div>
                <div className="text-xs text-gray-400 text-center mb-3">Adjust Credits</div>
                <div className="flex items-center justify-center gap-5">
                  <button
                    onClick={() => setCreditsChange(prev => Math.max(-(currentCredits), prev - 1))}
                    className="w-10 h-10 rounded-full bg-red-100 text-red-600 text-xl font-bold flex items-center justify-center hover:bg-red-200 transition"
                  >
                    −
                  </button>
                  <div className="text-3xl font-bold text-gray-900 w-16 text-center">
                    {creditsChange >= 0 ? `+${creditsChange}` : creditsChange}
                  </div>
                  <button
                    onClick={() => setCreditsChange(prev => prev + 1)}
                    className="w-10 h-10 rounded-full bg-green-100 text-green-600 text-xl font-bold flex items-center justify-center hover:bg-green-200 transition"
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Preview */}
              <div className="bg-gray-50 rounded-xl px-5 py-3 flex justify-between items-center">
                <span className="text-sm text-gray-500">Total Credits (New + Old)</span>
                <span className="text-xl font-extrabold text-gray-900">{newCreditsTotal}</span>
              </div>

              {/* Apply Button */}
              <button
                onClick={handleCreditsApply}
                disabled={creditsLoading || creditsChange === 0}
                className="w-full py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition disabled:opacity-50"
              >
                {creditsLoading ? 'Applying...' : 'Apply Credits'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManager;
