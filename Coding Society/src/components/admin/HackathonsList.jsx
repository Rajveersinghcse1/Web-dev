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
        total: response.data.total,
        pages: response.data.pages
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hackathon Events</h1>
          <p className="text-gray-600 mt-1">Manage hackathon competitions and events</p>
        </div>
        <Link
          to="/admin/hackathon/create"
          className="mt-4 sm:mt-0 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Hackathon</span>
        </Link>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div>
            <div className="relative">
              <MagnifyingGlassIcon className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search hackathons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {statuses.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              {types.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Theme Filter */}
          <div>
            <input
              type="text"
              placeholder="Filter by theme..."
              value={themeFilter}
              onChange={(e) => setThemeFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <TrophyIcon className="h-8 w-8 text-purple-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Events</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Registration Open</p>
              <p className="text-2xl font-bold text-gray-900">
                {hackathons.filter(h => h.status === 'registration_open').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Participants</p>
              <p className="text-2xl font-bold text-gray-900">
                {hackathons.reduce((sum, h) => sum + (h.participants?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <SparklesIcon className="h-8 w-8 text-yellow-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active Events</p>
              <p className="text-2xl font-bold text-gray-900">
                {hackathons.filter(h => h.status === 'in_progress' || h.status === 'judging').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Hackathons Grid */}
      {hackathons.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <TrophyIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No hackathons found</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first hackathon event</p>
          <Link
            to="/admin/hackathon/create"
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 inline-flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Hackathon</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {hackathons.map((hackathon) => (
            <div key={hackathon._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {hackathon.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(hackathon.status)}`}>
                        {hackathon.status.replace('_', ' ').split(' ').map(word => 
                          word.charAt(0).toUpperCase() + word.slice(1)
                        ).join(' ')}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(hackathon.type)}`}>
                        {hackathon.type.charAt(0).toUpperCase() + hackathon.type.slice(1)}
                      </span>
                      {isEventSoon(hackathon.eventStartDate) && (
                        <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
                          Soon
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Theme */}
                {hackathon.theme && (
                  <div className="mb-3">
                    <div className="flex items-center text-sm text-purple-600">
                      <SparklesIcon className="h-4 w-4 mr-1" />
                      <span className="font-medium">{hackathon.theme}</span>
                    </div>
                  </div>
                )}

                {/* Location & Venue */}
                <div className="space-y-1 mb-4">
                  {hackathon.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <span>{hackathon.location}</span>
                    </div>
                  )}
                  {hackathon.venue && (
                    <div className="text-sm text-gray-600 ml-6">
                      {hackathon.venue}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {hackathon.description}
                </p>

                {/* Registration Status */}
                {isRegistrationOpen(hackathon) && (
                  <div className="mb-4 p-2 bg-green-50 text-green-700 rounded text-xs font-medium">
                    🟢 Registration is open!
                  </div>
                )}

                {/* Important Dates */}
                <div className="mb-4 space-y-1">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Registration:</span> {formatDate(hackathon.registrationStartDate)} - {formatDate(hackathon.registrationEndDate)}
                  </div>
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Event:</span> {formatDate(hackathon.eventStartDate)} - {formatDate(hackathon.eventEndDate)}
                  </div>
                </div>

                {/* Participants & Teams */}
                <div className="mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center text-gray-600">
                      <UserGroupIcon className="h-4 w-4 mr-1" />
                      <span>
                        {hackathon.participants?.length || 0}
                        {hackathon.maxParticipants && `/${hackathon.maxParticipants}`} participants
                      </span>
                    </div>
                    <div className="text-gray-600">
                      {hackathon.teams?.length || 0} teams
                    </div>
                  </div>
                  
                  {/* Progress bar for participants */}
                  {hackathon.maxParticipants && (
                    <div className="mt-2">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ 
                            width: `${Math.min(
                              ((hackathon.participants?.length || 0) / hackathon.maxParticipants) * 100, 
                              100
                            )}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Prizes */}
                {hackathon.prizes && hackathon.prizes.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-yellow-600 mb-2">
                      <TrophyIcon className="h-4 w-4 mr-1" />
                      <span className="font-medium">Prize Pool: ${getTotalPrizeValue(hackathon.prizes)}</span>
                    </div>
                    <div className="space-y-1">
                      {hackathon.prizes.slice(0, 3).map((prize, index) => (
                        <div key={index} className="text-xs text-gray-600">
                          <span className="font-medium">{prize.position}:</span> {prize.amount}
                        </div>
                      ))}
                      {hackathon.prizes.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{hackathon.prizes.length - 3} more prizes
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Sponsors */}
                {hackathon.sponsors && hackathon.sponsors.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <GiftIcon className="h-4 w-4 mr-1" />
                      <span>{hackathon.sponsors.length} sponsors</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {hackathon.sponsors.slice(0, 3).map((sponsor, index) => (
                        <span key={index} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          {sponsor.name}
                        </span>
                      ))}
                      {hackathon.sponsors.length > 3 && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          +{hackathon.sponsors.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Warnings */}
                <div className="mb-4">
                  {hackathon.status === 'cancelled' && (
                    <div className="flex items-center text-xs text-red-600 bg-red-50 p-2 rounded">
                      <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                      <span>Event cancelled</span>
                    </div>
                  )}
                  {hackathon.maxParticipants && 
                   hackathon.participants?.length >= hackathon.maxParticipants && (
                    <div className="flex items-center text-xs text-orange-600 bg-orange-50 p-2 rounded">
                      <ExclamationTriangleIcon className="h-3 w-3 mr-1" />
                      <span>Participant limit reached</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Created {formatDate(hackathon.createdAt)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {/* TODO: Implement view details */}}
                      className="p-2 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                      title="View details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <Link
                      to={`/admin/hackathon/edit/${hackathon._id}`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit hackathon"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(hackathon._id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete hackathon"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="flex items-center justify-between bg-white rounded-lg shadow-sm border border-gray-200 px-6 py-4">
          <div className="text-sm text-gray-700">
            Showing {(pagination.page - 1) * pagination.limit + 1} to{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
            {pagination.total} results
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            {[...Array(pagination.pages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => handlePageChange(i + 1)}
                className={`px-3 py-2 text-sm font-medium rounded-md ${
                  pagination.page === i + 1
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.pages}
              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default HackathonsList;