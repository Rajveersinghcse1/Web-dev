"use client";

import React, { useContext, useState } from 'react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { UserContext } from '@/app/AuthProvider';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Calendar, Clock, CheckCircle, XCircle, 
  Briefcase, BookOpen, HelpCircle, Languages, Heart,
  TrendingUp, Award, Target, Sparkles, Trophy,
  Zap, Star, ChevronRight, Download, Filter
} from 'lucide-react';
import SessionHistoryFilters from './SessionHistoryFilters';
import toast from 'react-hot-toast';

/**
 * Session History Component
 * 
 * Displays user's learning session history with statistics
 */
export default function SessionHistory() {
  const { userData } = useContext(UserContext);
  const [filteredSessions, setFilteredSessions] = useState([]);
  
  const sessions = useQuery(
    api.sessions.getHistory, 
    userData?._id ? { userId: userData._id, limit: 20 } : "skip"
  );
  
  const stats = useQuery(
    api.sessions.getStats,
    userData?._id ? { userId: userData._id } : "skip"
  );

  if (!userData?._id) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-600">Please log in to view your session history</p>
      </div>
    );
  }

  if (sessions === undefined || stats === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  const getModuleIcon = (type) => {
    const icons = {
      'lecture': BookOpen,
      'mock-interview': Briefcase,
      'qa-prep': HelpCircle,
      'language-skill': Languages,
      'meditation': Heart,
    };
    return icons[type] || BookOpen;
  };

  const getModuleColor = (type) => {
    const colors = {
      'lecture': 'from-blue-600 to-cyan-600',
      'mock-interview': 'from-purple-600 to-pink-600',
      'qa-prep': 'from-green-600 to-emerald-600',
      'language-skill': 'from-orange-600 to-red-600',
      'meditation': 'from-pink-600 to-purple-600',
    };
    return colors[type] || 'from-gray-600 to-gray-700';
  };

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}m ${seconds}s`;
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-600 via-pink-600 to-orange-500 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/4 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-blob" />
          <div className="absolute -bottom-1/2 -right-1/4 w-64 h-64 bg-purple-400/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        </div>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-3">
              <Trophy className="w-8 h-8" />
              Learning Journey
            </h2>
            <p className="text-white/90 text-lg">Track your progress and celebrate your achievements</p>
          </div>
          <Sparkles className="w-16 h-16 opacity-30" />
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-linear-to-br from-violet-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1 }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Target className="w-6 h-6" />
              </div>
              <span className="text-4xl font-bold">{stats.total}</span>
            </div>
            <p className="text-sm font-semibold opacity-90">Total Sessions</p>
            <div className="mt-2 h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-linear-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1, delay: 0.5 }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <CheckCircle className="w-6 h-6" />
              </div>
              <span className="text-4xl font-bold">{stats.completed}</span>
            </div>
            <p className="text-sm font-semibold opacity-90">Completed</p>
            <div className="mt-2 h-1 bg-white/30 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white rounded-full" 
                initial={{ width: 0 }}
                animate={{ width: `${stats.total > 0 ? (stats.completed / stats.total) * 100 : 0}%` }}
                transition={{ duration: 1, delay: 0.3 }}
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-linear-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1, delay: 1 }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <Clock className="w-6 h-6" />
              </div>
              <span className="text-4xl font-bold">
                {Math.floor(stats.totalTime / 60000)}m
              </span>
            </div>
            <p className="text-sm font-semibold opacity-90">Total Time</p>
            <div className="mt-2 text-xs opacity-75">
              ≈ {Math.floor(stats.totalTime / 3600000)}h {Math.floor((stats.totalTime % 3600000) / 60000)}m
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-linear-to-br from-orange-500 to-red-600 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group"
        >
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
            animate={{ x: ['-200%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 1, delay: 1.5 }}
          />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span className="text-4xl font-bold">
                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
              </span>
            </div>
            <p className="text-sm font-semibold opacity-90">Completion Rate</p>
            <div className="mt-2 flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star 
                  key={i} 
                  className={`w-3 h-3 ${
                    i < Math.floor((stats.completed / stats.total) * 5) 
                      ? 'fill-white' 
                      : 'fill-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Sessions by Type */}
      {Object.keys(stats.byType).length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-gray-700"
        >
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-3">
            <div className="p-2 bg-violet-100 dark:bg-violet-900/30 rounded-xl">
              <Award className="w-6 h-6 text-violet-600 dark:text-violet-400" />
            </div>
            Sessions by Module
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
            {Object.entries(stats.byType).map(([type, count], index) => {
              const Icon = getModuleIcon(type);
              const color = getModuleColor(type);
              return (
                <motion.div 
                  key={type}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  className="group cursor-pointer"
                >
                  <div className="text-center">
                    <div className={`w-20 h-20 mx-auto mb-3 rounded-2xl bg-linear-to-br ${color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all relative overflow-hidden`}>
                      <motion.div
                        className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.5 }}
                      />
                      <Icon className="w-9 h-9 text-white relative z-10" />
                    </div>
                    <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{count}</div>
                    <div className="text-sm font-medium text-gray-600 dark:text-gray-400 capitalize">
                      {type.replace('-', ' ')}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Filters */}
      <SessionHistoryFilters
        sessions={sessions}
        onFilterChange={setFilteredSessions}
        onExport={() => toast.success('Session data exported!')}
      />

      {/* Session List */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Calendar className="w-6 h-6 text-violet-600" />
          {filteredSessions.length !== sessions.length 
            ? `Filtered Sessions (${filteredSessions.length} of ${sessions.length})`
            : 'Recent Sessions'
          }
        </h3>

        {filteredSessions.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center shadow-xl">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 dark:text-gray-400">
              {sessions.length === 0 
                ? 'No sessions yet. Start your first learning session!'
                : 'No sessions match your filters. Try adjusting your search criteria.'
              }
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredSessions.map((session, index) => {
              const Icon = getModuleIcon(session.type);
              const color = getModuleColor(session.type);
              const duration = session.endTime - session.startTime;

              return (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, x: 5 }}
                  className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all border border-gray-100 dark:border-gray-700 group"
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-16 h-16 rounded-2xl bg-linear-to-br ${color} flex items-center justify-center shrink-0 shadow-lg group-hover:shadow-xl transition-all relative overflow-hidden`}>
                      <motion.div
                        className="absolute inset-0 bg-linear-to-r from-transparent via-white/30 to-transparent"
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.6 }}
                      />
                      <Icon className="w-8 h-8 text-white relative z-10" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-lg font-bold text-gray-900 dark:text-white capitalize truncate mb-2">
                        {session.type.replace('-', ' ')}
                      </h4>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          {formatDate(session.startTime)}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {formatDuration(duration)}
                        </span>
                        {session.xpEarned && (
                          <span className="flex items-center gap-1.5 text-orange-600 dark:text-orange-400 font-semibold">
                            <Zap className="w-4 h-4" />
                            +{session.xpEarned} XP
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {session.status === 'completed' ? (
                        <span className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl text-sm font-semibold shadow-sm">
                          <CheckCircle className="w-4 h-4" />
                          Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-400 rounded-xl text-sm font-semibold">
                          <XCircle className="w-4 h-4" />
                          {session.status}
                        </span>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        className="p-2 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                        onClick={() => toast.info('Session details coming soon!')}
                      >
                        <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
