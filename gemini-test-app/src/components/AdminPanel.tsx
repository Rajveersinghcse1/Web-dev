import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Layout } from './Layout';
import {
  Users,
  FileText,
  MessageSquare,
  Bell,
  Trash2,
  Shield,
  UserCheck,
  TrendingUp,
  Send,
  CheckCircle,
  XCircle,
  AlertCircle,
  Info,
  Edit,
  Eye,
} from 'lucide-react';

interface AdminPanelProps {
  onNavigate?: (view: string) => void;
}

export function AdminPanel({ onNavigate }: AdminPanelProps) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'tests' | 'contacts' | 'notifications'>('overview');
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    type: 'info' as 'info' | 'success' | 'warning' | 'error',
    target: 'all' as 'all' | 'students' | 'specific',
    recipientId: '',
  });

  // Queries
  const platformStats = useQuery(api.admin.getPlatformStats, user?.id ? { adminId: user.id } : 'skip');
  const allUsers = useQuery(api.admin.getAllUsers, user?.id ? { adminId: user.id } : 'skip');
  const allTests = useQuery(api.admin.getAllTestResults, user?.id ? { adminId: user.id } : 'skip');
  const allContacts = useQuery(api.admin.getAllContactSubmissions, user?.id ? { adminId: user.id } : 'skip');
  const allNotifications = useQuery(api.admin.getAllNotifications, user?.id ? { adminId: user.id } : 'skip');

  // Mutations
  const updateUserRole = useMutation(api.admin.updateUserRole);
  const deleteUser = useMutation(api.admin.deleteUser);
  const deleteTestResult = useMutation(api.admin.deleteTestResult);
  const updateContactStatus = useMutation(api.admin.updateContactSubmissionStatus);
  const deleteContact = useMutation(api.admin.deleteContactSubmission);
  const sendNotification = useMutation(api.admin.sendNotification);
  const deleteNotification = useMutation(api.admin.deleteNotification);

  const handleSendNotification = async () => {
    if (!user?.id) return;

    try {
      const recipientId = notificationForm.target === 'specific' && notificationForm.recipientId 
        ? notificationForm.recipientId 
        : undefined;
      
      const recipientRole = notificationForm.target === 'students' ? 'student' : undefined;

      await sendNotification({
        adminId: user.id,
        title: notificationForm.title,
        message: notificationForm.message,
        type: notificationForm.type,
        recipientId: recipientId as any,
        recipientRole: recipientRole as any,
      });

      setNotificationForm({
        title: '',
        message: '',
        type: 'info',
        target: 'all',
        recipientId: '',
      });

      alert('Notification sent successfully!');
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Failed to send notification');
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Layout activeTab="admin" onNavigate={onNavigate}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Shield className="w-8 h-8 text-emerald-600" />
            Admin Control Panel
          </h1>
          <p className="text-gray-600 mt-2">Manage users, content, and system notifications</p>
        </div>

        {/* Stats Overview */}
        {activeTab === 'overview' && platformStats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg"
            >
              <Users className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{platformStats.totalUsers}</p>
              <p className="text-blue-100 text-sm">Total Users</p>
              <p className="text-xs mt-2">{platformStats.totalStudents} Students, {platformStats.totalAdmins} Admins</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg"
            >
              <FileText className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{platformStats.totalTests}</p>
              <p className="text-emerald-100 text-sm">Total Tests</p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg"
            >
              <MessageSquare className="w-8 h-8 mb-2 opacity-80" />
              <p className="text-3xl font-bold">{platformStats.totalContacts}</p>
              <p className="text-purple-100 text-sm">Contact Submissions</p>
              <p className="text-xs mt-2">{platformStats.pendingContacts} Pending</p>
            </motion.div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 mb-6">
          <div className="flex overflow-x-auto border-b border-gray-200">
            {[
              { key: 'overview', label: 'Overview', icon: TrendingUp },
              { key: 'users', label: 'Users', icon: Users },
              { key: 'tests', label: 'Test Results', icon: FileText },
              { key: 'contacts', label: 'Contacts', icon: MessageSquare },
              { key: 'notifications', label: 'Notifications', icon: Bell },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`flex items-center gap-2 px-6 py-4 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.key
                    ? 'text-emerald-600 border-b-2 border-emerald-600'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <tab.icon className="w-5 h-5" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6">
            {/* Users Tab */}
            {activeTab === 'users' && allUsers && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">User Management</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tests</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allUsers.map((u) => (
                        <tr key={u._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{u.name || 'N/A'}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{u.email}</td>
                          <td className="px-4 py-3">
                            <select
                              value={u.role}
                              onChange={(e) => {
                                if (user?.id) {
                                  updateUserRole({
                                    adminId: user.id,
                                    userId: u._id,
                                    role: e.target.value as 'student' | 'admin',
                                  });
                                }
                              }}
                              className="text-sm border border-gray-300 rounded px-2 py-1"
                            >
                              <option value="student">Student</option>
                              <option value="admin">Admin</option>
                            </select>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{u.totalTests}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(u.createdAt)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                if (user?.id && confirm('Are you sure you want to delete this user?')) {
                                  deleteUser({ adminId: user.id, userId: u._id });
                                }
                              }}
                              disabled={u._id === user?.id}
                              className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Test Results Tab */}
            {activeTab === 'tests' && allTests && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Test Results Management</h2>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Score</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Questions</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {allTests.map((test) => (
                        <tr key={test._id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{test.subject}</td>
                          <td className="px-4 py-3 text-sm">
                            <span className={`font-bold ${test.percentage >= 70 ? 'text-emerald-600' : test.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {test.percentage}%
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">{test.correct}/{test.totalQuestions}</td>
                          <td className="px-4 py-3 text-sm text-gray-600">{formatDate(test.createdAt)}</td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => {
                                if (user?.id && confirm('Are you sure you want to delete this test result?')) {
                                  deleteTestResult({ adminId: user.id, testResultId: test._id });
                                }
                              }}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Contacts Tab */}
            {activeTab === 'contacts' && allContacts && (
              <div className="space-y-4">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Contact Submissions</h2>
                <div className="space-y-3">
                  {allContacts.map((contact) => (
                    <div key={contact._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-bold text-gray-900">{contact.name}</p>
                          <p className="text-sm text-gray-600">{contact.email}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <select
                            value={contact.status}
                            onChange={(e) => {
                              if (user?.id) {
                                updateContactStatus({
                                  adminId: user.id,
                                  submissionId: contact._id,
                                  status: e.target.value as any,
                                });
                              }
                            }}
                            className="text-sm border border-gray-300 rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="replied">Replied</option>
                            <option value="resolved">Resolved</option>
                          </select>
                          <button
                            onClick={() => {
                              if (user?.id && confirm('Delete this contact submission?')) {
                                deleteContact({ adminId: user.id, submissionId: contact._id });
                              }
                            }}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="font-medium text-gray-900 mb-1">{contact.subject}</p>
                      <p className="text-sm text-gray-700">{contact.message}</p>
                      <p className="text-xs text-gray-500 mt-2">{formatDate(contact.createdAt)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className="space-y-6">
                {/* Send Notification Form */}
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-lg p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Send className="w-5 h-5 text-emerald-600" />
                    Send New Notification
                  </h2>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                      <input
                        type="text"
                        value={notificationForm.title}
                        onChange={(e) => setNotificationForm({ ...notificationForm, title: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Notification title"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                      <textarea
                        value={notificationForm.message}
                        onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        rows={3}
                        placeholder="Notification message"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select
                          value={notificationForm.type}
                          onChange={(e) => setNotificationForm({ ...notificationForm, type: e.target.value as any })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="info">Info</option>
                          <option value="success">Success</option>
                          <option value="warning">Warning</option>
                          <option value="error">Error</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Target</label>
                        <select
                          value={notificationForm.target}
                          onChange={(e) => setNotificationForm({ ...notificationForm, target: e.target.value as any })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="all">All Users</option>
                          <option value="students">Students Only</option>
                          <option value="specific">Specific User</option>
                        </select>
                      </div>
                    </div>

                    {notificationForm.target === 'specific' && allUsers && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Select User</label>
                        <select
                          value={notificationForm.recipientId}
                          onChange={(e) => setNotificationForm({ ...notificationForm, recipientId: e.target.value })}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                        >
                          <option value="">Choose a user...</option>
                          {allUsers.map((u) => (
                            <option key={u._id} value={u._id}>
                              {u.name} ({u.email})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <button
                      onClick={handleSendNotification}
                      className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                    >
                      <Send className="w-5 h-5" />
                      Send Notification
                    </button>
                  </div>
                </div>

                {/* Sent Notifications */}
                {allNotifications && (
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Sent Notifications</h2>
                    <div className="space-y-3">
                      {allNotifications.map((notif) => {
                        const typeColors = {
                          info: 'bg-blue-100 text-blue-800 border-blue-300',
                          success: 'bg-emerald-100 text-emerald-800 border-emerald-300',
                          warning: 'bg-yellow-100 text-yellow-800 border-yellow-300',
                          error: 'bg-red-100 text-red-800 border-red-300',
                        };

                        const TypeIcon = {
                          info: Info,
                          success: CheckCircle,
                          warning: AlertCircle,
                          error: XCircle,
                        }[notif.type];

                        return (
                          <div key={notif._id} className={`border rounded-lg p-4 ${typeColors[notif.type]}`}>
                            <div className="flex justify-between items-start">
                              <div className="flex items-start gap-3">
                                <TypeIcon className="w-5 h-5 mt-1" />
                                <div>
                                  <p className="font-bold">{notif.title}</p>
                                  <p className="text-sm mt-1">{notif.message}</p>
                                  <p className="text-xs mt-2">
                                    {formatDate(notif.createdAt)} • 
                                    {notif.recipientId ? ' Specific User' : notif.recipientRole ? ` ${notif.recipientRole}s` : ' All Users'}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  if (user?.id && confirm('Delete this notification?')) {
                                    deleteNotification({ adminId: user.id, notificationId: notif._id });
                                  }
                                }}
                                className="opacity-70 hover:opacity-100"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Overview Tab Content */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setActiveTab('users')}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-lg transition-all text-left group"
                  >
                    <Users className="w-8 h-8 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-gray-900">Manage Users</h3>
                    <p className="text-sm text-gray-600 mt-1">View and manage user accounts and roles</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('notifications')}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-lg transition-all text-left group"
                  >
                    <Bell className="w-8 h-8 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-gray-900">Send Notifications</h3>
                    <p className="text-sm text-gray-600 mt-1">Broadcast messages to users</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('tests')}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-lg transition-all text-left group"
                  >
                    <FileText className="w-8 h-8 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-gray-900">Test Results</h3>
                    <p className="text-sm text-gray-600 mt-1">Review and manage test submissions</p>
                  </button>

                  <button
                    onClick={() => setActiveTab('contacts')}
                    className="p-6 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:shadow-lg transition-all text-left group"
                  >
                    <MessageSquare className="w-8 h-8 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                    <h3 className="font-bold text-gray-900">Contact Messages</h3>
                    <p className="text-sm text-gray-600 mt-1">Respond to user inquiries</p>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
