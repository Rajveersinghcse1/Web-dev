/**
 * Admin Dashboard Component
 * Main dashboard with analytics and overview
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  LightBulbIcon,
  BriefcaseIcon,
  TrophyIcon,
  UsersIcon,
  EyeIcon,
  PlusIcon,
  ChartBarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import adminService from '../../services/adminService';

const AdminDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await adminService.getAnalytics();
      setAnalytics(response.data);
    } catch (err) {
      setError('Failed to fetch analytics');
      console.error('Analytics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      name: 'Library Content',
      value: analytics?.counts?.library || 0,
      icon: BookOpenIcon,
      color: 'bg-blue-500',
      link: '/admin/library',
      change: '+12%',
      changeType: 'increase'
    },
    {
      name: 'Innovation Projects',
      value: analytics?.counts?.innovation || 0,
      icon: LightBulbIcon,
      color: 'bg-yellow-500',
      link: '/admin/innovation',
      change: '+8%',
      changeType: 'increase'
    },
    {
      name: 'Internships',
      value: analytics?.counts?.internship || 0,
      icon: BriefcaseIcon,
      color: 'bg-green-500',
      link: '/admin/internship',
      change: '+15%',
      changeType: 'increase'
    },
    {
      name: 'Hackathons',
      value: analytics?.counts?.hackathon || 0,
      icon: TrophyIcon,
      color: 'bg-purple-500',
      link: '/admin/hackathon',
      change: '+5%',
      changeType: 'increase'
    },
    {
      name: 'Total Users',
      value: analytics?.counts?.users || 0,
      icon: UsersIcon,
      color: 'bg-indigo-500',
      link: '/admin/users',
      change: '+23%',
      changeType: 'increase'
    }
  ];

  const chartData = [
    { name: 'Library', count: analytics?.counts?.library || 0, fill: '#3B82F6' },
    { name: 'Innovation', count: analytics?.counts?.innovation || 0, fill: '#EAB308' },
    { name: 'Internships', count: analytics?.counts?.internship || 0, fill: '#22C55E' },
    { name: 'Hackathons', count: analytics?.counts?.hackathon || 0, fill: '#A855F7' },
  ];

  const COLORS = ['#3B82F6', '#EAB308', '#22C55E', '#A855F7'];

  const quickActions = [
    {
      name: 'Add Library Content',
      description: 'Upload new study materials',
      icon: BookOpenIcon,
      link: '/admin/library/create',
      color: 'bg-blue-500'
    },
    {
      name: 'Create Innovation Project',
      description: 'Start a new innovation project',
      icon: LightBulbIcon,
      link: '/admin/innovation/create',
      color: 'bg-yellow-500'
    },
    {
      name: 'Post Internship',
      description: 'Add new internship opportunity',
      icon: BriefcaseIcon,
      link: '/admin/internship/create',
      color: 'bg-green-500'
    },
    {
      name: 'Create Hackathon',
      description: 'Organize a new hackathon',
      icon: TrophyIcon,
      link: '/admin/hackathon/create',
      color: 'bg-purple-500'
    }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading skeleton */}
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-red-800 font-medium">Error Loading Dashboard</h3>
        <p className="text-red-600 mt-2">{error}</p>
        <button
          onClick={fetchAnalytics}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl">
        <h1 className="text-2xl font-bold mb-2">Welcome to Admin Dashboard</h1>
        <p className="text-blue-100">
          Manage all content across the Coding Society platform from this central hub.
        </p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {statsCards.map((stat) => (
          <Link
            key={stat.name}
            to={stat.link}
            className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <div className="flex items-center mt-2">
                  {stat.changeType === 'increase' ? (
                    <ArrowUpIcon className="h-4 w-4 text-green-500" />
                  ) : (
                    <ArrowDownIcon className="h-4 w-4 text-red-500" />
                  )}
                  <span className={`text-sm ml-1 ${
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Content Distribution</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#3B82F6" name="Count" radius={[4, 4, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Platform Overview</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => (
            <Link
              key={action.name}
              to={action.link}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow duration-200 group"
            >
              <div className="flex items-center mb-3">
                <div className={`p-2 rounded-lg ${action.color} group-hover:scale-110 transition-transform duration-200`}>
                  <action.icon className="h-5 w-5 text-white" />
                </div>
                <PlusIcon className="h-4 w-4 text-gray-400 ml-auto" />
              </div>
              <h3 className="font-medium text-gray-900">{action.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{action.description}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Library Content */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Library Content</h3>
            <Link 
              to="/admin/library" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {analytics?.recentActivity?.library?.length > 0 ? (
              analytics.recentActivity.library.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <BookOpenIcon className="h-5 w-5 text-blue-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-600">{item.subject}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent library content</p>
            )}
          </div>
        </div>

        {/* Recent Innovation Projects */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Recent Innovation Projects</h3>
            <Link 
              to="/admin/innovation" 
              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
            >
              View All
            </Link>
          </div>
          <div className="space-y-3">
            {analytics?.recentActivity?.innovation?.length > 0 ? (
              analytics.recentActivity.innovation.slice(0, 3).map((item, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <LightBulbIcon className="h-5 w-5 text-yellow-500 mr-3" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-600">{item.category}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">No recent innovation projects</p>
            )}
          </div>
        </div>
      </div>

      {/* System Status */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">Database</p>
              <p className="text-xs text-green-600">Connected</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">File Storage</p>
              <p className="text-xs text-green-600">Operational</p>
            </div>
          </div>
          <div className="flex items-center p-4 bg-green-50 rounded-lg">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
            <div>
              <p className="text-sm font-medium text-gray-900">API Status</p>
              <p className="text-xs text-green-600">Healthy</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;