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
  Settings
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
import ProfileDialog from './_components/ProfileDialog';
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
              {/* Progress & Status */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <ProgressWidget />
                </div>
                <div className="space-y-6">
                  <ServiceStatus />
                  <FlashcardWidget />
                </div>
              </div>

              {/* Quick Launch */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  <h2 className="text-xl font-bold text-gray-900 dark:text-black">Quick Start</h2>
                </div>
                <SessionPresets onSelectPreset={handleSelectPreset} />
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
            <AchievementGallery />
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

