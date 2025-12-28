"use client"
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  Trophy,
  History as HistoryIcon,
  BarChart3,
  Sparkles,
  Activity,
  TrendingUp,
  User,
  Coins,
  Zap,
  Settings,
  Target,
  CheckCircle,
  Circle
} from 'lucide-react';

import FeatureAssistants from './_components/FeatureAssistants';
import Feedback from './_components/Feedback';
import History from './_components/History';
import ServiceStatus from '@/components/ServiceStatus';
import ProgressWidget from '@/components/ProgressWidget';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import ThemeToggle from '@/components/ThemeToggle';
import SessionPresets from '@/components/SessionPresets';
import AchievementGallery from '@/components/AchievementGallery';
import LearningPaths from '@/components/LearningPaths';
import TeamSessions from '@/components/TeamSessions';
import VoiceCustomization from '@/components/VoiceCustomization';
import FlashcardWidget from '@/components/flashcards/FlashcardWidget';
import MockInterviewCard from '@/components/MockInterviewCard';
import ProfileDialog from './_components/ProfileDialog';
import AptitudeTraining from '@/components/AptitudeTraining';
import CommunityTestCreator from '@/components/CommunityTestCreator';
import { Button } from '@/components/ui/button';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';

const TABS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'learning', label: 'Learning', icon: BookOpen },
  { id: 'community', label: 'Community', icon: Users },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'achievements', label: 'Achievements', icon: Trophy },
  { id: 'activity', label: 'Activity', icon: HistoryIcon },
  { id: 'settings', label: 'Settings', icon: Settings },
];

// Achievements Tab Component with sub-tabs
function AchievementsTab() {
  const [subTab, setSubTab] = useState('training');

  return (
    <div className="space-y-6">
      {/* Sub-tab Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-purple-500" />
            Placement Training Hub
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Master aptitude & ace your interviews</p>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-3">
        <button
          onClick={() => setSubTab('training')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${subTab === 'training'
            ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-200'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300'
            }`}
        >
          <BookOpen className="w-5 h-5" />
          Aptitude Training
        </button>
        <button
          onClick={() => setSubTab('community')}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold transition-all ${subTab === 'community'
            ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg shadow-purple-200'
            : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:border-purple-300'
            }`}
        >
          <Users className="w-5 h-5" />
          Community Tests
        </button>
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        {subTab === 'training' && (
          <motion.div
            key="training"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <AptitudeTraining />
          </motion.div>
        )}
        {subTab === 'community' && (
          <motion.div
            key="community"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <CommunityTestCreator />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const { registerAction } = useKeyboardShortcuts();

  useEffect(() => {
    setMounted(true);

    // Register dashboard-specific keyboard actions
    registerAction('refresh', () => {
      window.location.reload();
    });

    // Tab shortcuts
    TABS.forEach((tab, index) => {
      registerAction(`tab${index + 1}`, () => setActiveTab(tab.id));
    });
  }, [registerAction]);

  const handleSelectPreset = async (preset) => {
    // Instead of navigating with timestamp, show dialog to create proper room
    // For now, navigate to home to start new session properly
    window.location.href = '/';
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen">
      {/* Header Section */}
      <div className="mb-8 animate-fade-in">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30 px-3 py-1 rounded-full">
                AI-Powered Coaching
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-black">
              Welcome to Your <span className="gradient-text">Learning Journey</span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mt-2 max-w-2xl">
              Track your progress, join team sessions, and master new skills with AI feedback.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ProfileDialog>
              <Button variant="outline" className="gap-2 rounded-full">
                <Coins className="w-4 h-4 text-yellow-500" />
                Credits
              </Button>
            </ProfileDialog>
            <ThemeToggle />
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex overflow-x-auto pb-2 gap-2 no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap
                  ${isActive
                    ? 'bg-purple-600 text-black shadow-lg shadow-purple-500/25 scale-105'
                    : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-900'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-black' : ''}`} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {activeTab === 'overview' && (
            <div className="space-y-8">
              {/* Hero Welcome Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 rounded-3xl p-8 md:p-10"
              >
                {/* Background decorations */}
                <div className="absolute inset-0 overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                  <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-pink-500/10 to-transparent rounded-full blur-3xl" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                      className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4"
                    >
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                      <span className="text-white/90 text-sm font-medium">
                        {new Date().getHours() < 12 ? '🌅 Good Morning' : new Date().getHours() < 18 ? '☀️ Good Afternoon' : '🌙 Good Evening'}
                      </span>
                    </motion.div>

                    <motion.h2
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-3xl md:text-4xl font-bold text-white mb-3"
                    >
                      Ready to level up today?
                    </motion.h2>

                    <motion.p
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 }}
                      className="text-white/80 text-lg max-w-md"
                    >
                      Your AI coaches are ready. Pick a focus area and let's make progress together.
                    </motion.p>
                  </div>

                  {/* Quick Action Buttons */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="flex flex-wrap gap-3"
                  >
                    <button
                      onClick={() => window.location.href = '/'}
                      className="flex items-center gap-2 px-6 py-3 bg-white text-violet-700 font-semibold rounded-xl hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5"
                    >
                      <Zap className="w-5 h-5" />
                      Start Session
                    </button>
                    <button
                      onClick={() => setActiveTab('learning')}
                      className="flex items-center gap-2 px-6 py-3 bg-white/10 text-white font-semibold rounded-xl border border-white/20 backdrop-blur-md hover:bg-white/20 transition-all"
                    >
                      <BookOpen className="w-5 h-5" />
                      Browse Paths
                    </button>
                  </motion.div>
                </div>
              </motion.div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <QuickStatCard
                  icon={<Zap className="w-5 h-5" />}
                  label="Today's XP"
                  value="250"
                  trend="+45"
                  color="yellow"
                  delay={0.1}
                />
                <QuickStatCard
                  icon={<Activity className="w-5 h-5" />}
                  label="Sessions"
                  value="3"
                  trend="+2"
                  color="blue"
                  delay={0.2}
                />
                <QuickStatCard
                  icon={<TrendingUp className="w-5 h-5" />}
                  label="Streak"
                  value="7 days"
                  trend="🔥"
                  color="orange"
                  delay={0.3}
                />
                <QuickStatCard
                  icon={<Trophy className="w-5 h-5" />}
                  label="Rank"
                  value="Gold"
                  trend="Top 15%"
                  color="purple"
                  delay={0.4}
                />
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Progress & Status */}
                <div className="lg:col-span-2 space-y-6">
                  <ProgressWidget />

                  {/* Today's Goals Section */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm"
                  >
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl">
                          <Target className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Today's Goals</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">2 of 4 completed</p>
                        </div>
                      </div>
                      <span className="text-2xl font-bold text-emerald-600">50%</span>
                    </div>

                    <div className="space-y-3">
                      <GoalItem label="Complete 1 practice session" completed={true} xp={50} />
                      <GoalItem label="Review 10 flashcards" completed={true} xp={25} />
                      <GoalItem label="Achieve 80% accuracy in quiz" completed={false} xp={75} />
                      <GoalItem label="30 minutes of learning time" completed={false} xp={100} />
                    </div>
                  </motion.div>
                </div>

                {/* Right Column - Service Status & Quick Actions */}
                <div className="space-y-6">
                  <ServiceStatus compact />
                  <FlashcardWidget />

                  {/* Quick Tips */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-2xl border border-violet-100 dark:border-violet-800/50 p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                      <h4 className="font-bold text-violet-900 dark:text-violet-300">AI Tip of the Day</h4>
                    </div>
                    <p className="text-sm text-violet-700 dark:text-violet-300/80 leading-relaxed">
                      💡 Practice speaking clearly and at a steady pace. AI coaches respond better to well-articulated speech!
                    </p>
                  </motion.div>
                </div>
              </div>



              {/* Featured: Mock Interview */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
                      <Sparkles className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">Featured Practice</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400">AI-powered interview simulation</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-bold rounded-full">
                    POPULAR
                  </span>
                </div>
                <MockInterviewCard />
              </div>
            </div>
          )}

          {activeTab === 'learning' && (
            <div className="space-y-8">
              <LearningPaths />

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-purple-500" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-black">AI Assistants</h2>
                </div>
                <FeatureAssistants />
              </div>
            </div>
          )}

          {activeTab === 'community' && (
            <TeamSessions />
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-linear-to-r from-blue-100 to-cyan-100 dark:from-blue-900/30 dark:to-cyan-900/30 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-black">Analytics Dashboard</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Detailed insights into your performance</p>
                </div>
              </div>
              <AnalyticsDashboard />
            </div>
          )}

          {activeTab === 'achievements' && (
            <AchievementsTab />
          )}

          {activeTab === 'activity' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-linear-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-lg">
                    <Activity className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-black">Activity History</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Your recent sessions and feedback</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <TrendingUp className="w-4 h-4 text-green-500 dark:text-green-400" />
                  <span>Keep up the great work!</span>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <History />
                <Feedback />
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <VoiceCustomization />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// Quick Stat Card Component for Overview
function QuickStatCard({ icon, label, value, trend, color, delay }) {
  const colors = {
    yellow: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-100 dark:border-amber-800/50',
      icon: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white',
      trend: 'text-amber-600 dark:text-amber-400'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-100 dark:border-blue-800/50',
      icon: 'bg-gradient-to-br from-blue-400 to-indigo-500 text-white',
      trend: 'text-blue-600 dark:text-blue-400'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-100 dark:border-orange-800/50',
      icon: 'bg-gradient-to-br from-orange-400 to-red-500 text-white',
      trend: 'text-orange-600 dark:text-orange-400'
    },
    purple: {
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      border: 'border-violet-100 dark:border-violet-800/50',
      icon: 'bg-gradient-to-br from-violet-400 to-purple-500 text-white',
      trend: 'text-violet-600 dark:text-violet-400'
    }
  };

  const colorSet = colors[color] || colors.purple;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`p-5 rounded-2xl ${colorSet.bg} border ${colorSet.border} backdrop-blur-xl transition-all hover:shadow-lg`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-xl ${colorSet.icon} shadow-lg`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <div className="flex items-baseline justify-between">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">{value}</span>
        <span className={`text-sm font-semibold ${colorSet.trend}`}>{trend}</span>
      </div>
    </motion.div>
  );
}

// Goal Item Component for Today's Goals
function GoalItem({ label, completed, xp }) {
  return (
    <div className={`flex items-center gap-4 p-4 rounded-xl transition-all ${completed
      ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/50'
      : 'bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700'
      }`}>
      <div className={`flex-shrink-0 ${completed ? 'text-emerald-500' : 'text-gray-300 dark:text-gray-600'}`}>
        {completed ? (
          <CheckCircle className="w-6 h-6" />
        ) : (
          <Circle className="w-6 h-6" />
        )}
      </div>
      <div className="flex-1">
        <p className={`font-medium ${completed
          ? 'text-emerald-700 dark:text-emerald-300 line-through opacity-75'
          : 'text-gray-900 dark:text-white'
          }`}>
          {label}
        </p>
      </div>
      <div className={`px-3 py-1 rounded-full text-xs font-bold ${completed
        ? 'bg-emerald-100 dark:bg-emerald-800/50 text-emerald-700 dark:text-emerald-300'
        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        }`}>
        +{xp} XP
      </div>
    </div>
  );
}
