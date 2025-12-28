"use client";

import React, { useState } from 'react';
import { Search, Filter, Calendar, Download, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Session History Filters Component
 * 
 * Search, filter, and export session history
 */
export default function SessionHistoryFilters({ 
  sessions = [], 
  onFilterChange,
  onExport 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const moduleTypes = [
    { id: 'all', label: 'All Modules' },
    { id: 'lecture', label: 'Lecture' },
    { id: 'mock-interview', label: 'Mock Interview' },
    { id: 'qa-prep', label: 'Q&A Prep' },
    { id: 'language-skill', label: 'Language Skill' },
    { id: 'meditation', label: 'Meditation' },
  ];

  const statusOptions = [
    { id: 'all', label: 'All Status' },
    { id: 'completed', label: 'Completed' },
    { id: 'active', label: 'Active' },
    { id: 'terminated', label: 'Terminated' },
  ];

  const dateRanges = [
    { id: 'all', label: 'All Time' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ];

  const applyFilters = () => {
    let filtered = [...sessions];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(session => 
        session.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.sessionId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter
    if (selectedType !== 'all') {
      filtered = filtered.filter(session => session.type === selectedType);
    }

    // Status filter
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(session => session.status === selectedStatus);
    }

    // Date range filter
    if (dateRange !== 'all') {
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      
      filtered = filtered.filter(session => {
        const sessionDate = session.startTime;
        switch (dateRange) {
          case 'today':
            return sessionDate > now - dayMs;
          case 'week':
            return sessionDate > now - (7 * dayMs);
          case 'month':
            return sessionDate > now - (30 * dayMs);
          default:
            return true;
        }
      });
    }

    onFilterChange?.(filtered);
  };

  React.useEffect(() => {
    applyFilters();
  }, [searchQuery, selectedType, selectedStatus, dateRange, sessions]);

  const handleExport = () => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `session-history-${Date.now()}.json`;
    link.click();
    URL.revokeObjectURL(url);
    onExport?.();
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setSelectedStatus('all');
    setDateRange('all');
  };

  const hasActiveFilters = searchQuery || selectedType !== 'all' || selectedStatus !== 'all' || dateRange !== 'all';

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-xl mb-6">
      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all ${
              showFilters 
                ? 'bg-violet-600 text-white' 
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            <Filter className="w-5 h-5" />
            Filters
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all"
          >
            <Download className="w-5 h-5" />
            <span className="hidden sm:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Filter Options */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-6 space-y-4">
              {/* Module Type Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Module Type
                </label>
                <div className="flex flex-wrap gap-2">
                  {moduleTypes.map(type => (
                    <button
                      key={type.id}
                      onClick={() => setSelectedType(type.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedType === type.id
                          ? 'bg-violet-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {statusOptions.map(status => (
                    <button
                      key={status.id}
                      onClick={() => setSelectedStatus(status.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedStatus === status.id
                          ? 'bg-violet-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                  <Calendar className="inline w-4 h-4 mr-1" />
                  Date Range
                </label>
                <div className="flex flex-wrap gap-2">
                  {dateRanges.map(range => (
                    <button
                      key={range.id}
                      onClick={() => setDateRange(range.id)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        dateRange === range.id
                          ? 'bg-violet-600 text-white shadow-lg'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                      }`}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-2 px-4 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                >
                  <X className="w-4 h-4" />
                  Clear All Filters
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
