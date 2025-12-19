/**
 * Admin Analytics Page
 * Comprehensive analytics dashboard with charts and insights
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Activity,
  Calendar,
  Download,
  RefreshCw,
  Eye,
  Heart,
  MessageSquare,
  Share2,
  Award,
  Zap
} from 'lucide-react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981', '#06B6D4'];

const Analytics = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [contentAnalytics, setContentAnalytics] = useState(null);
  const [engagementData, setEngagementData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7');

  useEffect(() => {
    fetchAllAnalytics();
  }, [timeRange]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    await Promise.all([
      fetchDashboardAnalytics(),
      fetchContentAnalytics(),
      fetchEngagementAnalytics()
    ]);
    setLoading(false);
  };

  const fetchDashboardAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/analytics/dashboard`, {
        params: { days: timeRange },
        headers: { Authorization: `Bearer ${token}` }
      });
      setDashboardData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch dashboard analytics:', error);
    }
  };

  const fetchContentAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/analytics/content`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setContentAnalytics(response.data.data);
    } catch (error) {
      console.error('Failed to fetch content analytics:', error);
    }
  };

  const fetchEngagementAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/admin/analytics/engagement`, {
        params: { days: timeRange },
        headers: { Authorization: `Bearer ${token}` }
      });
      setEngagementData(response.data.data);
    } catch (error) {
      console.error('Failed to fetch engagement analytics:', error);
    }
  };

  if (loading || !dashboardData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xl text-slate-700 font-semibold">Loading Analytics...</span>
        </div>
      </div>
    );
  }

  const { overview, distributions, trends, topUsers } = dashboardData;

  // Prepare chart data
  const userRoleData = Object.entries(distributions.usersByRole || {}).map(([role, count]) => ({
    name: role.charAt(0).toUpperCase() + role.slice(1),
    value: count
  }));

  const userStatusData = Object.entries(distributions.usersByStatus || {}).map(([status, count]) => ({
    name: status.charAt(0).toUpperCase() + status.slice(1),
    value: count
  }));

  const contentDistributionData = [
    { name: 'Posts', value: overview.content.posts, color: '#3B82F6' },
    { name: 'Library', value: overview.content.library, color: '#8B5CF6' },
    { name: 'Innovations', value: overview.content.innovations, color: '#EC4899' },
    { name: 'Internships', value: overview.content.internships, color: '#F59E0B' },
    { name: 'Hackathons', value: overview.content.hackathons, color: '#10B981' }
  ];

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
                <BarChart3 className="w-10 h-10 text-blue-600" />
                Analytics Dashboard
              </h1>
              <p className="text-slate-600">
                Comprehensive insights and metrics for your platform
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-4 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="7">Last 7 Days</option>
                <option value="14">Last 14 Days</option>
                <option value="30">Last 30 Days</option>
                <option value="90">Last 90 Days</option>
              </select>
              <button
                onClick={fetchAllAnalytics}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 transition-all flex items-center gap-2"
              >
                <RefreshCw className="w-5 h-5" />
                Refresh
              </button>
            </div>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <Users className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-80">Total Users</div>
                <div className="text-4xl font-bold">{overview.users.total.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <span className="text-sm">New: {overview.users.new}</span>
              <span className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-2 py-1 rounded-lg">
                <TrendingUp className="w-4 h-4" />
                +{overview.users.growth}%
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <FileText className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-80">Total Content</div>
                <div className="text-4xl font-bold">{overview.content.total.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <span className="text-sm">New: {overview.content.newContent}</span>
              <span className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-2 py-1 rounded-lg">
                <Activity className="w-4 h-4" />
                Active
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <Award className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-80">Active Users</div>
                <div className="text-4xl font-bold">{overview.users.active.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <span className="text-sm">Engagement Rate</span>
              <span className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-2 py-1 rounded-lg">
                <Zap className="w-4 h-4" />
                {((overview.users.active / overview.users.total) * 100).toFixed(1)}%
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-3xl shadow-lg p-6 text-white"
          >
            <div className="flex items-center justify-between mb-4">
              <Activity className="w-12 h-12 opacity-80" />
              <div className="text-right">
                <div className="text-sm opacity-80">Posts</div>
                <div className="text-4xl font-bold">{overview.content.posts.toLocaleString()}</div>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-white/20">
              <span className="text-sm">Library: {overview.content.library}</span>
              <span className="flex items-center gap-1 text-sm font-semibold bg-white/20 px-2 py-1 rounded-lg">
                <FileText className="w-4 h-4" />
                {overview.content.library}
              </span>
            </div>
          </motion.div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Growth Trend */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-blue-600" />
              User Growth Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={trends.daily}>
                <defs>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="_id" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#F8FAFC'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#3B82F6"
                  fillOpacity={1}
                  fill="url(#colorUsers)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Content Distribution */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <FileText className="w-6 h-6 text-purple-600" />
              Content Distribution
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={contentDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {contentDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* User Distribution */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Users by Role */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              Users by Role
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={userRoleData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1E293B',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#F8FAFC'
                  }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Users by Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Activity className="w-6 h-6 text-green-600" />
              Users by Status
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={userStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={90}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {userStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Top Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
          className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100"
        >
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Award className="w-6 h-6 text-yellow-600" />
            Top Users by XP
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {topUsers.slice(0, 5).map((user, index) => (
              <div
                key={user._id}
                className="bg-gradient-to-br from-slate-50 to-white border border-slate-200 rounded-2xl p-4 text-center"
              >
                <div className={`text-2xl font-bold mb-2 ${
                  index === 0 ? 'text-yellow-500' :
                  index === 1 ? 'text-slate-400' :
                  index === 2 ? 'text-orange-600' :
                  'text-slate-600'
                }`}>
                  #{index + 1}
                </div>
                <div className="font-semibold text-slate-900 mb-1">{user.username}</div>
                <div className="text-sm text-slate-600">Level {user.gameData?.level}</div>
                <div className="text-lg font-bold text-blue-600 mt-2">
                  {user.gameData?.xp?.toLocaleString()} XP
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Engagement Stats */}
        {engagementData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100"
          >
            <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
              <Heart className="w-6 h-6 text-red-600" />
              Engagement Statistics
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
              <div className="text-center">
                <FileText className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-slate-900">
                  {engagementData.stats.totalPosts || 0}
                </div>
                <div className="text-sm text-slate-600">Total Posts</div>
              </div>
              <div className="text-center">
                <Heart className="w-8 h-8 mx-auto mb-2 text-red-600" />
                <div className="text-2xl font-bold text-slate-900">
                  {engagementData.stats.totalLikes || 0}
                </div>
                <div className="text-sm text-slate-600">Total Likes</div>
              </div>
              <div className="text-center">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-slate-900">
                  {engagementData.stats.totalComments || 0}
                </div>
                <div className="text-sm text-slate-600">Comments</div>
              </div>
              <div className="text-center">
                <Share2 className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-slate-900">
                  {engagementData.stats.totalShares || 0}
                </div>
                <div className="text-sm text-slate-600">Shares</div>
              </div>
              <div className="text-center">
                <Eye className="w-8 h-8 mx-auto mb-2 text-orange-600" />
                <div className="text-2xl font-bold text-slate-900">
                  {engagementData.stats.totalViews || 0}
                </div>
                <div className="text-sm text-slate-600">Views</div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
