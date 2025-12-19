'use client';

import React, { useState, useMemo } from 'react';
import { Search, X, Filter, SlidersHorizontal, Calendar, Clock, ArrowUpDown, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from './ui/button';

/**
 * Search and Filter Components
 * Modernized with glassmorphism and advanced animations
 */

export function SearchBar({ 
  value, 
  onChange, 
  placeholder = "Search sessions...",
  onClear,
  className = ""
}) {
  return (
    <div className={`relative group ${className}`}>
      <div className="absolute inset-0 bg-violet-500/20 rounded-xl blur-md opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700 group-focus-within:text-violet-400 transition-colors" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-10 py-3 bg-white backdrop-blur-sm border border-gray-300 rounded-xl text-black placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:border-violet-500/50 focus:bg-white transition-all relative z-10"
      />
      {value && (
        <button
          onClick={onClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full transition-colors z-20"
        >
          <X className="w-4 h-4 text-gray-800" />
        </button>
      )}
    </div>
  );
}

export function FilterPanel({ 
  filters = {}, 
  onFilterChange, 
  onClearAll,
  options = {
    modes: [],
    dateRanges: [],
    sortBy: []
  }
}) {
  const [isOpen, setIsOpen] = useState(false);

  const activeFiltersCount = useMemo(() => {
    return Object.values(filters).filter(v => v && v !== 'all').length;
  }, [filters]);

  return (
    <div className="relative">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className={`relative border-gray-300 bg-white backdrop-blur-sm hover:bg-white hover:text-black dark:hover:text-black text-gray-800 ${isOpen ? 'ring-2 ring-violet-500/50 border-violet-500/50' : ''}`}
      >
        <SlidersHorizontal className="w-4 h-4 mr-2" />
        Filters
        {activeFiltersCount > 0 && (
          <span className="ml-2 px-2 py-0.5 bg-violet-600 text-black text-xs rounded-full shadow-[0_0_10px_rgba(139,92,246,0.4)]">
            {activeFiltersCount}
          </span>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40 bg-white backdrop-blur-[1px]"
            />

            {/* Filter Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 bg-white border border-gray-300 rounded-2xl shadow-2xl z-50 p-5 overflow-hidden"
            >
              {/* Background Gradients */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -ml-32 -mb-32 pointer-events-none" />

              <div className="flex items-center justify-between mb-6 relative z-10">
                <h3 className="font-bold text-black flex items-center gap-2">
                  <Filter className="w-4 h-4 text-violet-400" />
                  Filters
                </h3>
                <button
                  onClick={onClearAll}
                  className="text-xs font-medium text-violet-400 hover:text-violet-300 hover:underline transition-colors"
                >
                  Clear all
                </button>
              </div>

              <div className="space-y-5 relative z-10">
                {/* Coaching Mode Filter */}
                {options.modes.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Coaching Mode
                    </label>
                    <div className="relative">
                      <select
                        value={filters.mode || 'all'}
                        onChange={(e) => onFilterChange('mode', e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 appearance-none cursor-pointer transition-colors"
                      >
                        <option value="all" className="bg-gray-900">All Modes</option>
                        {options.modes.map(mode => (
                          <option key={mode} value={mode} className="bg-gray-900">{mode}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-700">
                        <ArrowUpDown className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Date Range Filter */}
                {options.dateRanges.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Date Range
                    </label>
                    <div className="relative">
                      <select
                        value={filters.dateRange || 'all'}
                        onChange={(e) => onFilterChange('dateRange', e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 appearance-none cursor-pointer transition-colors"
                      >
                        <option value="all" className="bg-gray-900">All Time</option>
                        {options.dateRanges.map(range => (
                          <option key={range.value} value={range.value} className="bg-gray-900">{range.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-700">
                        <Calendar className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Sort By */}
                {options.sortBy.length > 0 && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Sort By
                    </label>
                    <div className="relative">
                      <select
                        value={filters.sortBy || 'newest'}
                        onChange={(e) => onFilterChange('sortBy', e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-black focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 appearance-none cursor-pointer transition-colors"
                      >
                        {options.sortBy.map(sort => (
                          <option key={sort.value} value={sort.value} className="bg-gray-900">{sort.label}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-700">
                        <Clock className="w-3 h-3" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 pt-4 border-t border-gray-300 relative z-10">
                <Button
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-violet-600 hover:bg-violet-700 text-black border-none shadow-lg shadow-violet-500/20"
                >
                  Apply Filters
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

export function QuickFilters({ 
  activeFilter, 
  onFilterChange,
  filters = [
    { label: 'All', value: 'all' },
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' }
  ]
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map(filter => (
        <button
          key={filter.value}
          onClick={() => onFilterChange(filter.value)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-all border ${
            activeFilter === filter.value
              ? 'bg-violet-600 text-black border-violet-500 shadow-[0_0_10px_rgba(139,92,246,0.3)]'
              : 'bg-white text-gray-800 border-gray-300 hover:text-black hover:border-gray-300'
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

export function useSearchAndFilter(items, config = {}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({});
  const [quickFilter, setQuickFilter] = useState('all');

  const filteredItems = useMemo(() => {
    let result = [...items];

    // Apply search
    if (searchQuery && config.searchKeys) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        config.searchKeys.some(key => {
          const value = item[key];
          return value && value.toString().toLowerCase().includes(query);
        })
      );
    }

    // Apply mode filter
    if (filters.mode && filters.mode !== 'all') {
      result = result.filter(item => item.mode === filters.mode);
    }

    // Apply date range filter
    if (filters.dateRange && filters.dateRange !== 'all') {
      const now = Date.now();
      const ranges = {
        today: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000
      };

      const range = ranges[filters.dateRange];
      if (range) {
        result = result.filter(item => 
          (now - item.timestamp) <= range
        );
      }
    }

    // Apply quick filter
    if (quickFilter !== 'all') {
      const now = Date.now();
      const ranges = {
        today: 24 * 60 * 60 * 1000,
        week: 7 * 24 * 60 * 60 * 1000,
        month: 30 * 24 * 60 * 60 * 1000
      };

      const range = ranges[quickFilter];
      if (range) {
        result = result.filter(item =>
          (now - item.timestamp) <= range
        );
      }
    }

    // Apply sorting
    if (filters.sortBy) {
      const sortFunctions = {
        newest: (a, b) => b.timestamp - a.timestamp,
        oldest: (a, b) => a.timestamp - b.timestamp,
        duration: (a, b) => (b.duration || 0) - (a.duration || 0),
        xp: (a, b) => (b.xpEarned || 0) - (a.xpEarned || 0)
      };

      const sortFn = sortFunctions[filters.sortBy];
      if (sortFn) {
        result.sort(sortFn);
      }
    }

    return result;
  }, [items, searchQuery, filters, quickFilter, config.searchKeys]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({});
    setSearchQuery('');
    setQuickFilter('all');
  };

  return {
    searchQuery,
    setSearchQuery,
    filters,
    setFilters: handleFilterChange,
    quickFilter,
    setQuickFilter,
    filteredItems,
    clearFilters,
    hasActiveFilters: searchQuery || Object.values(filters).some(v => v && v !== 'all') || quickFilter !== 'all'
  };
}

export default SearchBar;
