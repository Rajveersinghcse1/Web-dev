/**
 * Admin User Management Page
 * Comprehensive user management with role/status updates
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Filter,
  Edit,
  Trash2,
  Shield,
  Ban,
  CheckCircle,
  XCircle,
  MoreVertical,
  Eye,
  TrendingUp,
  UserPlus,
  Download,
  Mail,
  Calendar,
  Activity
} from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [userStats, setUserStats] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [currentPage, roleFilter, statusFilter, searchTerm]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/users`, {
        params: {
          page: currentPage,
          limit: 20,
          role: roleFilter,
          status: statusFilter,
          search: searchTerm
        },
        headers: { Authorization: `Bearer ${token}` }
      });

      setUsers(response.data.data.users);
      setTotalPages(response.data.data.pagination.total);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const viewUserDetails = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSelectedUser(response.data.data.user);
      setUserStats(response.data.data.statistics);
      setShowUserModal(true);
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/admin/users/${userId}/role`,
        { role: newRole },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
      alert('User role updated successfully');
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert('Failed to update user role');
    }
  };

  const updateUserStatus = async (userId, newStatus, reason = '') => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/admin/users/${userId}/status`,
        { status: newStatus, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchUsers();
      alert('User status updated successfully');
    } catch (error) {
      console.error('Failed to update user status:', error);
      alert('Failed to update user status');
    }
  };

  const deleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    const reason = prompt('Please provide a reason for deletion:');
    if (!reason) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
        data: { reason }
      });
      fetchUsers();
      alert('User deleted successfully');
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'admin':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'suspended':
        return 'bg-red-100 text-red-800 border-red-300';
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'suspended':
        return <Ban className="w-4 h-4" />;
      default:
        return <XCircle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-sm p-8 border border-slate-100"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2 flex items-center gap-3">
                <Users className="w-10 h-10 text-blue-600" />
                User Management
              </h1>
              <p className="text-slate-600">
                Manage users, roles, and permissions across the platform
              </p>
            </div>
            <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Add User
            </button>
          </div>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Roles</option>
              <option value="user">User</option>
              <option value="admin">Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-3 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <button className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-semibold transition-all flex items-center justify-center gap-2">
              <Download className="w-5 h-5" />
              Export
            </button>
          </div>
        </motion.div>

        {/* Users Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    XP / Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-600">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-lg font-bold">
                            {user.profile?.avatar || user.username[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{user.username}</div>
                            <div className="text-sm text-slate-500">
                              {user.profile?.firstName} {user.profile?.lastName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{user.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                          <Shield className="w-3 h-3" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(user.status)}`}>
                          {getStatusIcon(user.status)}
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm">
                          <div className="font-semibold text-slate-900">
                            {user.gameData?.xp?.toLocaleString()} XP
                          </div>
                          <div className="text-slate-500">Level {user.gameData?.level}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-600 text-sm">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => viewUserDetails(user._id)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              const newRole = prompt('Enter new role (user, admin, superadmin):', user.role);
                              if (newRole && ['user', 'admin', 'superadmin'].includes(newRole)) {
                                updateUserRole(user._id, newRole);
                              }
                            }}
                            className="p-2 hover:bg-purple-50 text-purple-600 rounded-lg transition-colors"
                            title="Edit Role"
                          >
                            <Shield className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => {
                              const newStatus = prompt('Enter new status (active, inactive, suspended):', user.status);
                              if (newStatus && ['active', 'inactive', 'suspended'].includes(newStatus)) {
                                const reason = prompt('Reason for status change:');
                                updateUserStatus(user._id, newStatus, reason);
                              }
                            }}
                            className="p-2 hover:bg-orange-50 text-orange-600 rounded-lg transition-colors"
                            title="Update Status"
                          >
                            <Activity className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => deleteUser(user._id)}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                            title="Delete User"
                            disabled={user.role === 'superadmin'}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="border-t border-slate-200 px-6 py-4 flex items-center justify-between">
              <div className="text-sm text-slate-600">
                Page {currentPage} of {totalPages}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </motion.div>

        {/* User Detail Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-3xl font-bold text-slate-900">User Details</h2>
                  <button
                    onClick={() => setShowUserModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <XCircle className="w-6 h-6 text-slate-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 text-lg">Basic Information</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-semibold">Username:</span> {selectedUser.username}</div>
                      <div><span className="font-semibold">Email:</span> {selectedUser.email}</div>
                      <div><span className="font-semibold">Role:</span> {selectedUser.role}</div>
                      <div><span className="font-semibold">Status:</span> {selectedUser.status}</div>
                      <div><span className="font-semibold">Joined:</span> {new Date(selectedUser.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-bold text-slate-900 text-lg">Game Statistics</h3>
                    <div className="space-y-2 text-sm">
                      <div><span className="font-semibold">Level:</span> {selectedUser.gameData?.level}</div>
                      <div><span className="font-semibold">XP:</span> {selectedUser.gameData?.xp?.toLocaleString()}</div>
                      <div><span className="font-semibold">Coins:</span> {selectedUser.gameData?.coins?.toLocaleString()}</div>
                      <div><span className="font-semibold">Gems:</span> {selectedUser.gameData?.gems}</div>
                      <div><span className="font-semibold">Daily Streak:</span> {selectedUser.gameData?.stats?.dailyStreak}</div>
                    </div>
                  </div>

                  {userStats && (
                    <div className="col-span-2 space-y-4">
                      <h3 className="font-bold text-slate-900 text-lg">Content Statistics</h3>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="bg-blue-50 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600">{userStats.posts}</div>
                          <div className="text-sm text-slate-600">Posts</div>
                        </div>
                        <div className="bg-purple-50 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600">{userStats.library}</div>
                          <div className="text-sm text-slate-600">Library Items</div>
                        </div>
                        <div className="bg-orange-50 rounded-xl p-4 text-center">
                          <div className="text-2xl font-bold text-orange-600">{userStats.innovations}</div>
                          <div className="text-sm text-slate-600">Innovations</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManagement;
