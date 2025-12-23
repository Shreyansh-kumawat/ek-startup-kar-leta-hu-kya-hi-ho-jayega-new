import React, { useState, useEffect } from 'react';
import { getAllUsers, createSecondaryAdmin, updateUserStatus, deleteUser, getUserById } from './api';
import { useNotification } from '../../hooks/useNotification';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import Loader from '../../components/Loader';

const UserManager = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    role: 'user'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [filter, setFilter] = useState('all');
  const { addNotification } = useNotification();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await getAllUsers();
      // Ensure we're setting an array
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      addNotification('Failed to load users', 'error');
      setUsers([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      password: '',
      role: 'user'
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setFormLoading(true);
      await createSecondaryAdmin(formData);
      addNotification('User created successfully', 'success');
      setShowModal(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      addNotification(error.message || 'Failed to create user', 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus ? false : true;
      await updateUserStatus(userId, newStatus);
      addNotification(`User ${newStatus ? 'activated' : 'deactivated'} successfully`, 'success');
      fetchUsers();
    } catch (error) {
      addNotification('Failed to update user status', 'error');
    }
  };

  const handleDelete = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"? This action cannot be undone.`)) {
      return;
    }
    
    try {
      await deleteUser(userId);
      addNotification('User deleted successfully', 'success');
      fetchUsers();
    } catch (error) {
      addNotification('Failed to delete user', 'error');
    }
  };

  const handleViewDetails = async (userId) => {
    try {
      const response = await getUserById(userId);
      setSelectedUser(response.data);
      setShowDetailsModal(true);
    } catch (error) {
      addNotification('Failed to load user details', 'error');
    }
  };

  const getRoleBadge = (role) => {
    const baseClasses = "px-2 py-1 rounded-full text-xs font-medium";
    switch (role) {
      case 'admin':
        return `${baseClasses} bg-red-100 text-red-800`;
      case 'secondaryAdmin':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'user':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getStatusBadge = (isActive) => {
    return isActive
      ? "px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
      : "px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800";
  };

  const filteredUsers = (Array.isArray(users) ? users : []).filter(user => {
    if (filter === 'all') return true;
    if (filter === 'active') return user.isActive;
    if (filter === 'inactive') return !user.isActive;
    return user.role === filter;
  });

  const openAddModal = () => {
    resetForm();
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">User Manager</h2>
        <div className="flex items-center space-x-4">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Users</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="user">Regular Users</option>
            <option value="admin">Admins</option>
            <option value="secondaryAdmin">Secondary Admins</option>
          </select>
          <Button
            onClick={openAddModal}
            className="bg-blue-600 hover:bg-blue-700"
          >
            ➕ Add User
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-md">
              <span className="text-2xl">👤</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">{users.length}</h3>
              <p className="text-sm text-gray-600">Total Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-md">
              <span className="text-2xl">✅</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {users.filter(u => u.isActive).length}
              </h3>
              <p className="text-sm text-gray-600">Active Users</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-md">
              <span className="text-2xl">👤</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {users.filter(u => u.role === 'admin' || u.role === 'secondaryAdmin').length}
              </h3>
              <p className="text-sm text-gray-600">Admins</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-md">
              <span className="text-2xl">👤</span>
            </div>
            <div className="ml-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {users.filter(u => u.role === 'user').length}
              </h3>
              <p className="text-sm text-gray-600">Regular Users</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                          {(user.name || user.email).charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="text-sm text-gray-500">
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getRoleBadge(user.role)}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(user.isActive)}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => handleViewDetails(user._id)}
                        className="text-blue-600 hover:text-blue-900"
                        title="View Details"
                      >
                        <span className="text-xl">👀</span>
                      </button>
                      
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleStatusToggle(user._id, user.isActive)}
                          className={user.isActive ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? <span className="text-xl">🚫</span> : <span className="text-xl">✅</span>}
                        </button>
                      )}
                      
                      {user.role !== 'admin' && (
                        <button
                          onClick={() => handleDelete(user._id, user.name)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <span className="text-xl">🗑️</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add New User"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter full name"
            required
          />
          
          <Input
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter email address"
            required
          />
          
          <Input
            label="Phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            placeholder="Enter phone number"
            required
          />
          
          <Input
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder="Enter password"
            required
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Role
            </label>
            <select
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="user">Regular User</option>
              <option value="secondaryAdmin">Secondary Admin</option>
            </select>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={() => setShowModal(false)}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={formLoading}
            >
              Create User
            </Button>
          </div>
        </form>
      </Modal>

      {/* User Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title="User Details"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="h-16 w-16 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                {(selectedUser.name || selectedUser.email).charAt(0).toUpperCase()}
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{selectedUser.name}</h3>
              <p className="text-gray-600">{selectedUser.email}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-gray-900">{selectedUser.phone || 'Not provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Role</label>
                <p className="text-gray-900 capitalize">{selectedUser.role}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <p className="text-gray-900">{selectedUser.isActive ? 'Active' : 'Inactive'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Joined</label>
                <p className="text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManager;