/**
 * Internships List Component
 * Displays and manages internship opportunities
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
  BuildingOfficeIcon,
  PhoneIcon,
  EnvelopeIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import adminService from '../../services/adminService';

const InternshipsList = () => {
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [companyFilter, setCompanyFilter] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    pages: 0
  });
  const [error, setError] = useState(null);

  const statuses = [
    { value: '', label: 'All Statuses' },
    { value: 'open', label: 'Open' },
    { value: 'closed', label: 'Closed' },
    { value: 'filled', label: 'Filled' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const types = [
    { value: '', label: 'All Types' },
    { value: 'remote', label: 'Remote' },
    { value: 'onsite', label: 'On-site' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  useEffect(() => {
    fetchInternships();
  }, [pagination.page, searchTerm, statusFilter, typeFilter, companyFilter]);

  const fetchInternships = async () => {
    try {
      setLoading(true);
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search: searchTerm,
        status: statusFilter,
        type: typeFilter,
        company: companyFilter
      };

      const response = await adminService.getInternships(params);
      setInternships(response.data.internships);
      setPagination(prev => ({
        ...prev,
        total: response.data.total,
        pages: response.data.pages
      }));
    } catch (err) {
      setError('Failed to fetch internships');
      console.error('Fetch internships error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (internshipId) => {
    if (!window.confirm('Are you sure you want to delete this internship?')) {
      return;
    }

    try {
      await adminService.deleteInternship(internshipId);
      fetchInternships();
    } catch (err) {
      setError('Failed to delete internship');
      console.error('Delete error:', err);
    }
  };

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }));
  };

  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-green-100 text-green-800',
      closed: 'bg-gray-100 text-gray-800',
      filled: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getTypeColor = (type) => {
    const colors = {
      remote: 'bg-purple-100 text-purple-800',
      onsite: 'bg-orange-100 text-orange-800',
      hybrid: 'bg-blue-100 text-blue-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const isDeadlineSoon = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const daysUntilDeadline = Math.ceil((deadlineDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilDeadline <= 7 && daysUntilDeadline >= 0;
  };

  const isOverdue = (deadline) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    return deadlineDate < today;
  };

  if (loading && internships.length === 0) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-gray-200 rounded-lg"></div>
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
          <h1 className="text-2xl font-bold text-gray-900">Internship Opportunities</h1>
          <p className="text-gray-600 mt-1">Manage internship postings and applications</p>
        </div>
        <Link
          to="/admin/internship/create"
          className="mt-4 sm:mt-0 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 flex items-center space-x-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span>New Internship</span>
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
                placeholder="Search internships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              {types.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Company Filter */}
          <div>
            <input
              type="text"
              placeholder="Filter by company..."
              value={companyFilter}
              onChange={(e) => setCompanyFilter(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ChartBarIcon className="h-8 w-8 text-orange-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Internships</p>
              <p className="text-2xl font-bold text-gray-900">{pagination.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <ClockIcon className="h-8 w-8 text-green-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Open Positions</p>
              <p className="text-2xl font-bold text-gray-900">
                {internships.filter(i => i.status === 'open').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <UserGroupIcon className="h-8 w-8 text-blue-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Applicants</p>
              <p className="text-2xl font-bold text-gray-900">
                {internships.reduce((sum, i) => sum + (i.applicants?.length || 0), 0)}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center">
            <CalendarIcon className="h-8 w-8 text-red-600" />
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Closing Soon</p>
              <p className="text-2xl font-bold text-gray-900">
                {internships.filter(i => isDeadlineSoon(i.applicationDeadline)).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Internships Grid */}
      {internships.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
          <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No internships found</h3>
          <p className="text-gray-600 mb-6">Get started by creating your first internship opportunity</p>
          <Link
            to="/admin/internship/create"
            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 inline-flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Create Internship</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {internships.map((internship) => (
            <div key={internship._id} className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                      {internship.title}
                    </h3>
                    <div className="flex items-center space-x-2 mb-2">
                      <BuildingOfficeIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{internship.company}</span>
                    </div>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(internship.status)}`}>
                        {internship.status.charAt(0).toUpperCase() + internship.status.slice(1)}
                      </span>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(internship.type)}`}>
                        {internship.type.charAt(0).toUpperCase() + internship.type.slice(1)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location & Duration */}
                <div className="space-y-2 mb-4">
                  {internship.location && (
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPinIcon className="h-4 w-4 mr-2" />
                      <span>{internship.location}</span>
                    </div>
                  )}
                  {internship.duration && (
                    <div className="flex items-center text-sm text-gray-600">
                      <ClockIcon className="h-4 w-4 mr-2" />
                      <span>{internship.duration}</span>
                    </div>
                  )}
                  {internship.compensation && (
                    <div className="text-sm text-green-600 font-medium">
                      {internship.compensation}
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                  {internship.description}
                </p>

                {/* Mentor Contact */}
                {internship.mentorContact && (
                  <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Mentor Contact</h4>
                    <div className="space-y-1">
                      <div className="text-xs text-gray-600">
                        <span className="font-medium">{internship.mentorContact.name}</span>
                        {internship.mentorContact.position && (
                          <span className="text-gray-500"> - {internship.mentorContact.position}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-3 text-xs">
                        {internship.mentorContact.email && (
                          <div className="flex items-center text-gray-600">
                            <EnvelopeIcon className="h-3 w-3 mr-1" />
                            <span>{internship.mentorContact.email}</span>
                          </div>
                        )}
                        {internship.mentorContact.phone && (
                          <div className="flex items-center text-gray-600">
                            <PhoneIcon className="h-3 w-3 mr-1" />
                            <span>{internship.mentorContact.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Application Deadline */}
                {internship.applicationDeadline && (
                  <div className={`mb-4 p-2 rounded text-xs ${
                    isOverdue(internship.applicationDeadline) 
                      ? 'bg-red-50 text-red-700' 
                      : isDeadlineSoon(internship.applicationDeadline)
                      ? 'bg-yellow-50 text-yellow-700'
                      : 'bg-gray-50 text-gray-700'
                  }`}>
                    <div className="flex items-center">
                      <CalendarIcon className="h-3 w-3 mr-1" />
                      <span>Application deadline: {formatDate(internship.applicationDeadline)}</span>
                    </div>
                    {isOverdue(internship.applicationDeadline) && (
                      <span className="font-medium"> (Overdue)</span>
                    )}
                    {isDeadlineSoon(internship.applicationDeadline) && !isOverdue(internship.applicationDeadline) && (
                      <span className="font-medium"> (Closing soon)</span>
                    )}
                  </div>
                )}

                {/* Applicants */}
                <div className="flex items-center text-sm text-gray-600 mb-4">
                  <UserGroupIcon className="h-4 w-4 mr-1" />
                  <span>
                    {internship.applicants?.length || 0} applicants
                    {internship.applicants?.length > 0 && (
                      <span className="text-xs text-gray-500 ml-1">
                        ({internship.applicants.filter(a => a.status === 'pending').length} pending)
                      </span>
                    )}
                  </span>
                </div>

                {/* Skills */}
                {internship.skills && internship.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {internship.skills.slice(0, 3).map((skill, index) => (
                        <span key={index} className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                      {internship.skills.length > 3 && (
                        <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                          +{internship.skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="text-xs text-gray-500">
                    Created {formatDate(internship.createdAt)}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {/* TODO: Implement view details */}}
                      className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg"
                      title="View details"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </button>
                    <Link
                      to={`/admin/internship/edit/${internship._id}`}
                      className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                      title="Edit internship"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Link>
                    <button
                      onClick={() => handleDelete(internship._id)}
                      className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
                      title="Delete internship"
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
                    ? 'bg-orange-600 text-white'
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

export default InternshipsList;