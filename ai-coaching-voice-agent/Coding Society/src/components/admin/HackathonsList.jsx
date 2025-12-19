/**
 * Hackathons List Component
 * Displays and manages hackathon events
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  EyeIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  TrophyIcon,
  MapPinIcon,
  GiftIcon,
  SparklesIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import adminService from '../../services/adminService';

const HackathonsList = () => {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [themeFilter, setThemeFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [error, setError] = useState(null);

  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'registration_open', label: 'Registration Open' },
    { value: 'registration_closed', label: 'Registration Closed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'judging', label: 'Judging Phase' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const types = [
    { value: '', label: 'All Types' },
    { value: 'online', label: 'Online' },
    { value: 'offline', label: 'Offline' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  useEffect(() => {
    fetchHackathons();
  }, [pagination.page, searchTerm, statusFilter, typeFilter, themeFilter]);

  const fetchHackathons = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
        theme: themeFilter
      };

      const response = await adminService.getHackathons(params);
      setHackathons(response.data.hackathons);
      setPagination(prev => ({
        ...prev,
        total: response.data.pagination.totalItems,
        pages: response.data.pagination.total
      }));
    } catch (err) {
      setError('Failed to fetch hackathons');
      console.error('Fetch hackathons error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (hackathonId) => {
    if (!window.confirm('Are you sure you want to delete this hackathon?')) {
      return;
    }

    try {
      await adminService.deleteHackathon(hackathonId);
      fetchHackathons();
    } catch (err) {
      setError('Failed to delete hackathon');
      console.error('Delete error:', err);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getStatusColor = (status) => {
    const colors = {
      upcoming: 'bg-gray-100 text-gray-800',
      registration_open: 'bg-green-100 text-green-800',
      registration_closed: 'bg-yellow-100 text-yellow-800',
      in_progress: 'bg-blue-100 text-blue-800',
      judging: 'bg-purple-100 text-purple-800',
      completed: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type) => {
    const colors = {
      online: 'bg-blue-100 text-blue-800',
      offline: 'bg-orange-100 text-orange-800',
      hybrid: 'bg-purple-100 text-purple-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString();
  };

  const isRegistrationOpen = (hackathon) => {
    if (!hackathon.registrationStartDate || !hackathon.registrationEndDate) return false;
    const now = new Date();
    const startDate = new Date(hackathon.registrationStartDate);
    const endDate = new Date(hackathon.registrationEndDate);
    return now >= startDate && now <= endDate;
  };

  const isEventSoon = (eventDate) => {
    if (!eventDate) return false;
    const event = new Date(eventDate);
    const today = new Date();
    const daysUntilEvent = Math.ceil((event - today) / (1000 * 60 * 60 * 24));
    return daysUntilEvent <= 7 && daysUntilEvent >= 0;
  };

  const getTotalPrizeValue = (prizes) => {
    if (!prizes || prizes.length === 0) return '0';
    return prizes.reduce((total, prize) => {
      const amount = prize.amount.replace(/[^0-9.-]+/g, '');
      return total + (parseFloat(amount) || 0);
    }, 0).toLocaleString();
  };

  if (loading && hackathons.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hackathon Events</h1>
          <p className="text-gray-600 mt-1">Manage hackathon competitions and events</p>
        </div>
        <Link
          to="/admin/hackathon/create"
          className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PlusIcon className="h-5 w-5 mr-2" />
          New Hackathon
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search hackathons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {statuses.map(status => (
              <option key={status.value} value={status.value}>{status.label}</option>
            ))}
          </select>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          >
            {types.map(type => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Filter by theme..."
            value={themeFilter}
            onChange={(e) => setThemeFilter(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <TrophyIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <ClockIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Registration Open</p>
              <p className="text-2xl font-bold text-gray-900">
                {hackathons.filter(h => h.status === 'registration_open').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <UserGroupIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900">
                {hackathons.reduce((sum, h) => sum + (h.participants?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <SparklesIcon className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Upcoming</p>
              <p className="text-2xl font-bold text-gray-900">
                {hackathons.filter(h => h.status === 'upcoming').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hackathons Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {hackathons.map((hackathon) => (
          <div key={hackathon._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(hackathon.status)}`}>
                  {hackathon.status.replace('_', ' ').toUpperCase()}
                </span>
                <div className="flex space-x-2">
                  <Link
                    to={`/admin/hackathon/edit/${hackathon._id}`}
                    className="text-gray-400 hover:text-purple-600 transition-colors"
                  >
                    <PencilIcon className="h-5 w-5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(hackathon._id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <TrashIcon className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{hackathon.title}</h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">{hackathon.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-500">
                  <CalendarIcon className="h-4 w-4 mr-2" />
                  {formatDate(hackathon.eventStartDate)} - {formatDate(hackathon.eventEndDate)}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <MapPinIcon className="h-4 w-4 mr-2" />
                  {hackathon.type.charAt(0).toUpperCase() + hackathon.type.slice(1)}
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <UserGroupIcon className="h-4 w-4 mr-2" />
                  {hackathon.participants?.length || 0} / {hackathon.maxParticipants || '∞'} Participants
                </div>
                <div className="flex items-center text-sm text-gray-500">
                  <GiftIcon className="h-4 w-4 mr-2" />
                  {getTotalPrizeValue(hackathon.prizes)} Total Prizes
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 flex justify-between items-center">
                <div className="text-xs text-gray-500">
                  Theme: {hackathon.theme}
                </div>
                <Link
                  to={`/admin/hackathon/participants/${hackathon._id}`}
                  className="text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  View Participants
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && hackathons.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200 border-dashed">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <PlusIcon />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No hackathons found</h3>
          <p className="mt-1 text-sm text-gray-500">Get started by creating a new hackathon event.</p>
          <div className="mt-6">
            <Link
              to="/admin/hackathon/create"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Hackathon
            </Link>
          </div>
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex justify-center space-x-2 mt-6">
          <button
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
            className={`px-3 py-1 rounded-md ${
              pagination.page === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Previous
          </button>
          <span className="px-3 py-1 text-gray-600">
            Page {pagination.page} of {pagination.pages}
          </span>
          <button
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.pages}
            className={`px-3 py-1 rounded-md ${
              pagination.page === pagination.pages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default HackathonsList;
