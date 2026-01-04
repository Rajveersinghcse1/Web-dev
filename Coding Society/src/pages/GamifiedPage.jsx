import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { useMode } from '../context/ModeContext';
import { useGame } from '../context/GameContext';

// Import our new gamified components
import QuestSystem from '../components/gamified/CodingChallengeSystem';
import SkillTreeSystem from '../components/gamified/SkillTreeSystem';
import AchievementSystemUI from '../components/gamified/AchievementSystemUI';
import BattleArena from '../components/gamified/BattleArena';
import CharacterCustomization from '../components/gamified/CharacterCustomization';
import InteractiveTutorials from '../components/gamified/InteractiveTutorials';
import LeaderboardSystem from '../components/gamified/LeaderboardSystem';

import {
  Trophy,
  Star,
  Zap,
  Target,
  Crown,
  Swords,
  Shield,
  Flame,
  Brain,
  BookOpen,
  Code,
  Lightbulb,
  CheckCircle,
  Play,
  Gamepad2,
  User,
  Settings,
  Home,
  Palette,
  Map,
  Scroll,
  Activity,
  Sparkles,
  Briefcase,
  Award,
  TrendingUp,
  CheckSquare,
  Users,
  FileText,
  Building,
  Globe,
  Linkedin,
  FolderGit,
  Monitor,
  Server,
  BarChart3,
  Calendar
} from 'lucide-react';

/**
 * Ultra-Advanced Gamified Learning Platform & Career Center
 * 
 * Dual Mode Support:
 * - Student Mode: RPG-style character progression, quests, battles.
 * - Professional Mode: Career progression, real-world projects, certifications, interview prep.
 */

const GamifiedPage = () => {
  const { mode } = useMode();
  const isProfessional = mode === 'professional';
  const { gameState, showNotification } = useGame();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard');

  // Reset active tab when mode changes
  useEffect(() => {
    setActiveTab('dashboard');
  }, [mode]);

  // Tab configuration for Student Mode
  const gameTabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-4 h-4" />,
      description: 'Your gaming overview and quick stats'
    },
    {
      id: 'challenges',
      label: 'Coding Challenges',
      icon: <Code className="w-4 h-4" />,
      description: 'LeetCode-style coding problems',
      component: QuestSystem
    },
    {
      id: 'skills',
      label: 'Skill Trees',
      icon: <Map className="w-4 h-4" />,
      description: 'Unlock abilities and master programming paths',
      component: SkillTreeSystem
    },
    {
      id: 'achievements',
      label: 'Achievements',
      icon: <Trophy className="w-4 h-4" />,
      description: 'Track progress and collect badges',
      component: AchievementSystemUI
    },
    {
      id: 'arena',
      label: 'Battle Arena',
      icon: <Swords className="w-4 h-4" />,
      description: 'Compete in coding battles',
      component: BattleArena
    },
    {
      id: 'avatar',
      label: 'Character',
      icon: <User className="w-4 h-4" />,
      description: 'Customize your coding avatar',
      component: CharacterCustomization
    },
    {
      id: 'tutorials',
      label: 'Tutorials',
      icon: <BookOpen className="w-4 h-4" />,
      description: 'Interactive step-by-step learning',
      component: InteractiveTutorials
    },
    {
      id: 'leaderboard',
      label: 'Leaderboard',
      icon: <TrendingUp className="w-4 h-4" />,
      description: 'Compete with top coders',
      component: LeaderboardSystem
    }
  ];

  // Tab configuration for Professional Mode
  const professionalTabs = [
    {
      id: 'dashboard',
      label: 'Career Hub',
      icon: <Briefcase className="w-4 h-4" />,
      description: 'Professional profile and career readiness'
    },
    {
      id: 'projects',
      label: 'Real Projects',
      icon: <FolderGit className="w-4 h-4" />,
      description: 'Industry-standard project portfolio'
    },
    {
      id: 'certifications',
      label: 'Certifications',
      icon: <Award className="w-4 h-4" />,
      description: 'Earn recognized credentials'
    },
    {
      id: 'interview',
      label: 'Interview Prep',
      icon: <Users className="w-4 h-4" />,
      description: 'Mock interviews and system design'
    },
    {
      id: 'networking',
      label: 'Network',
      icon: <Globe className="w-4 h-4" />,
      description: 'Connect with industry mentors'
    }
  ];

  const currentTabs = isProfessional ? professionalTabs : gameTabs;

  // Player stats with proper fallbacks
  const playerStats = {
    level: gameState.level || 1,
    xp: gameState.xp || 0,
    xpToNext: gameState.xpToNext || 100,
    skillPoints: gameState.skillPoints || 0,
    achievements: (gameState.achievements?.unlocked || []).length,
    questsCompleted: (gameState.quests?.completed || []).length,
    streak: gameState.stats?.dailyStreak || 0,
    className: gameState.player?.class || 'Novice Coder'
  };

  // Calculate level progress percentage
  const levelProgress = ((playerStats.xp % 1000) / 1000) * 100;

  // Get current character class info
  const getClassInfo = () => {
    const classData = {
      'frontend_wizard': { name: 'Frontend Wizard', color: 'blue', icon: <Code className="w-5 h-5" /> },
      'backend_knight': { name: 'Backend Knight', color: 'green', icon: <Shield className="w-5 h-5" /> },
      'ai_sorcerer': { name: 'AI Sorcerer', color: 'purple', icon: <Brain className="w-5 h-5" /> },
      'fullstack_paladin': { name: 'Fullstack Paladin', color: 'orange', icon: <Crown className="w-5 h-5" /> }
    };
    
    return classData[gameState.player?.class] || { 
      name: 'Novice Coder', 
      color: 'gray', 
      icon: <User className="w-5 h-5" /> 
    };
  };

  const classInfo = getClassInfo();

  // Calculate statistics and predictions
  const calculateProgressStats = () => {
    const totalXP = gameState.totalXP || 0;
    const currentLevel = playerStats.level;
    const xpToNext = playerStats.xpToNext;
    const currentXP = playerStats.xp;
    
    // Calculate XP velocity (XP per day)
    const xpVelocity = Math.floor(totalXP / Math.max(playerStats.streak || 1, 1));
    
    // Predict days to next level
    const daysToNextLevel = xpToNext > 0 && xpVelocity > 0 
      ? Math.ceil(xpToNext / xpVelocity) 
      : 0;
    
    // Calculate success probability based on recent activity
    const questSuccessRate = playerStats.questsCompleted > 0 
      ? ((playerStats.questsCompleted / (playerStats.questsCompleted + 5)) * 100).toFixed(1)
      : 0;
    
    // Skill distribution analysis
    const skillLevels = Object.values(gameState.skillTrees || {}).map(tree => tree.level || 0);
    const avgSkillLevel = skillLevels.length > 0 
      ? (skillLevels.reduce((a, b) => a + b, 0) / skillLevels.length).toFixed(1)
      : 0;
    
    return {
      xpVelocity,
      daysToNextLevel,
      questSuccessRate,
      avgSkillLevel,
      progressPercentage: ((currentXP / (currentXP + xpToNext)) * 100).toFixed(1),
      engagement: Math.min(100, (playerStats.streak * 10 + playerStats.questsCompleted * 2)).toFixed(0)
    };
  };

  const stats = calculateProgressStats();

  // Recent activity feed
  const getRecentActivity = () => {
    const activities = [];
    
    // Add recent achievements
    const recentAchievements = (gameState.achievements?.unlocked || []).slice(-3);
    recentAchievements.forEach(achievement => {
      activities.push({
        type: 'achievement',
        title: 'Achievement Unlocked',
        description: achievement.name || 'New Achievement',
        time: 'Recently',
        icon: <Trophy className="w-4 h-4 text-yellow-500" />
      });
    });

    // Add recent quests
    const recentQuests = (gameState.quests?.completed || []).slice(-2);
    recentQuests.forEach(quest => {
      activities.push({
        type: 'quest',
        title: 'Quest Completed',
        description: quest.title || 'Coding Challenge',
        time: 'Recently',
        icon: <CheckCircle className="w-4 h-4 text-green-500" />
      });
    });

    // Add level up if recent
    if (playerStats.level > 1) {
      activities.unshift({
        type: 'levelup',
        title: 'Level Up!',
        description: `Reached level ${playerStats.level}`,
        time: 'Recently',
        icon: <Star className="w-4 h-4 text-blue-500" />
      });
    }

    return activities.slice(0, 5); // Limit to 5 most recent
  };

  // Quick action buttons
  const quickActions = isProfessional ? [
    {
      title: 'Start Project',
      description: 'Build a real-world app',
      icon: <FolderGit className="w-6 h-6" />,
      color: 'from-purple-600 to-indigo-600',
      action: () => setActiveTab('projects')
    },
    {
      title: 'Mock Interview',
      description: 'Practice with AI',
      icon: <Users className="w-6 h-6" />,
      color: 'from-blue-600 to-cyan-600',
      action: () => setActiveTab('interview')
    },
    {
      title: 'Get Certified',
      description: 'Take a skill assessment',
      icon: <Award className="w-6 h-6" />,
      color: 'from-emerald-600 to-teal-600',
      action: () => setActiveTab('certifications')
    },
    {
      title: 'Update Profile',
      description: 'Enhance your resume',
      icon: <FileText className="w-6 h-6" />,
      color: 'from-slate-600 to-gray-600',
      action: () => setActiveTab('dashboard')
    }
  ] : [
    {
      title: 'Solve Challenge',
      description: 'Practice coding problems',
      icon: <Code className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      action: () => setActiveTab('challenges')
    },
    {
      title: 'Practice Skills',
      description: 'Improve your programming abilities',
      icon: <Target className="w-6 h-6" />,
      color: 'from-green-500 to-green-600',
      action: () => setActiveTab('skills')
    },
    {
      title: 'Battle Arena',
      description: 'Challenge other coders',
      icon: <Swords className="w-6 h-6" />,
      color: 'from-red-500 to-red-600',
      action: () => setActiveTab('arena')
    },
    {
      title: 'Learn Tutorial',
      description: 'Follow guided lessons',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'from-purple-500 to-purple-600',
      action: () => setActiveTab('tutorials')
    }
  ];

  // Render dashboard content
  const renderDashboard = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Modern Hero Section with Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 opacity-90"></div>
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-0 left-1/2 w-96 h-96 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Content */}
        <div className="relative backdrop-blur-sm bg-white/10 border border-white/20 p-8 md:p-12">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              {/* Left: Welcome Message */}
              <div className="text-white flex-1">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full mb-4">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-semibold">Active Session</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">
                  Welcome back,
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
                    {gameState.player?.name || 'Coder'}
                  </span>
                </h1>
                <p className="text-blue-100 text-lg mb-6">
                  Level {playerStats.level} • {playerStats.xp.toLocaleString()} XP
                </p>
                <div className="flex gap-3">
                  <button className="px-6 py-3 bg-white text-blue-600 rounded-xl font-bold hover:bg-blue-50 transition-all transform hover:scale-105 shadow-xl">
                    Continue Learning
                  </button>
                  <button className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl font-bold hover:bg-white/30 transition-all border border-white/30">
                    View Progress
                  </button>
                </div>
              </div>
              
              {/* Right: Live Stats Card */}
              <div className="backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6 shadow-2xl">
                <div className="text-center mb-4">
                  <div className="w-32 h-32 mx-auto mb-4 relative">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="rgba(255,255,255,0.2)"
                        strokeWidth="8"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="url(#gradient)"
                        strokeWidth="8"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - stats.progressPercentage / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stopColor="#fbbf24" />
                          <stop offset="100%" stopColor="#f59e0b" />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-bold text-white">{stats.progressPercentage}%</span>
                      <span className="text-xs text-blue-200">to Level {playerStats.level + 1}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-center">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-2xl font-bold text-white">{stats.xpVelocity}</div>
                    <div className="text-xs text-blue-200">XP/Day</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3">
                    <div className="text-2xl font-bold text-white">{stats.daysToNextLevel || '?'}</div>
                    <div className="text-xs text-blue-200">Days Left</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced Analytics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Engagement Score */}
        <div className="group relative bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-emerald-100 uppercase tracking-wider">Engagement</div>
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">{stats.engagement}%</div>
            <div className="flex items-center gap-2 text-emerald-100">
              <TrendingUp className="w-4 h-4" />
              <span className="text-sm font-medium">Above Average</span>
            </div>
            <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${stats.engagement}%` }}></div>
            </div>
          </div>
        </div>

        {/* Success Rate */}
        <div className="group relative bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-blue-100 uppercase tracking-wider">Success Rate</div>
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">{stats.questSuccessRate}%</div>
            <div className="flex items-center gap-2 text-blue-100">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">{playerStats.questsCompleted} Completed</span>
            </div>
            <div className="mt-4">
              <div className="flex justify-between text-xs text-blue-100 mb-1">
                <span>Accuracy</span>
                <span>{stats.questSuccessRate}%</span>
              </div>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${stats.questSuccessRate}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Skill Mastery */}
        <div className="group relative bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-purple-100 uppercase tracking-wider">Skill Level</div>
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">{stats.avgSkillLevel}</div>
            <div className="flex items-center gap-2 text-purple-100">
              <Star className="w-4 h-4" />
              <span className="text-sm font-medium">Average Mastery</span>
            </div>
            <div className="mt-4 grid grid-cols-4 gap-1">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`h-2 rounded-full ${
                  i <= stats.avgSkillLevel ? 'bg-white' : 'bg-white/20'
                } transition-all duration-500`} style={{ transitionDelay: `${i * 100}ms` }}></div>
              ))}
            </div>
          </div>
        </div>

        {/* Daily Streak */}
        <div className="group relative bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Flame className="w-6 h-6 text-white" />
              </div>
              <div className="text-right">
                <div className="text-xs font-semibold text-orange-100 uppercase tracking-wider">Daily Streak</div>
              </div>
            </div>
            <div className="text-4xl font-bold text-white mb-2">{playerStats.streak} 🔥</div>
            <div className="flex items-center gap-2 text-orange-100">
              <Calendar className="w-4 h-4" />
              <span className="text-sm font-medium">Consecutive Days</span>
            </div>
            <div className="mt-4 flex gap-1">
              {[...Array(7)].map((_, i) => (
                <div key={i} className={`flex-1 h-2 rounded-full ${
                  i < playerStats.streak ? 'bg-white' : 'bg-white/20'
                } transition-all duration-300`} style={{ transitionDelay: `${i * 50}ms` }}></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Progress Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Performance Prediction */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-6 border-b border-gray-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Performance Analytics
            </h3>
            <p className="text-sm text-gray-600 mt-1">AI-powered insights based on your learning patterns</p>
          </div>
          <div className="p-6">
            {/* XP Velocity Chart */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-semibold text-gray-700">XP Velocity Trend</span>
                <span className="text-xs text-gray-500">Last 7 days</span>
              </div>
              <div className="flex items-end justify-between gap-2 h-32">
                {[65, 78, 82, 75, 88, 92, 95].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full bg-gradient-to-t from-blue-500 to-purple-500 rounded-t-lg hover:from-blue-600 hover:to-purple-600 transition-all cursor-pointer group relative"
                         style={{ height: `${height}%` }}>
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs py-1 px-2 rounded">
                        {Math.floor(height * 10)} XP
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">{['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Predictions */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Next Milestone</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">Level {playerStats.level + 1}</div>
                <div className="text-xs text-gray-600">Estimated: {stats.daysToNextLevel || '?'} days</div>
                <div className="mt-3 flex items-center gap-2 text-xs text-green-600 font-medium">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span>{stats.xpVelocity} XP/day velocity</span>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Trophy className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-semibold text-gray-700">Achievement Probability</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{Math.min(95, stats.engagement)}%</div>
                <div className="text-xs text-gray-600">Next achievement unlock</div>
                <div className="mt-3 h-2 bg-blue-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-1000" 
                       style={{ width: `${Math.min(95, stats.engagement)}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Skill Distribution */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 border-b border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-600" />
              Skill Distribution
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {[
                { name: 'Frontend', level: gameState.skillTrees?.frontend?.level || 0, max: 10, color: 'blue' },
                { name: 'Backend', level: gameState.skillTrees?.backend?.level || 0, max: 10, color: 'green' },
                { name: 'Algorithms', level: gameState.skillTrees?.algorithms?.level || 0, max: 10, color: 'purple' },
                { name: 'AI/ML', level: gameState.skillTrees?.ai?.level || 0, max: 10, color: 'pink' }
              ].map((skill, i) => (
                <div key={i} className="group">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-gray-700">{skill.name}</span>
                    <span className="text-xs font-bold text-gray-900">{skill.level}/{skill.max}</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-1000 ${
                      skill.color === 'blue' ? 'bg-gradient-to-r from-blue-500 to-blue-600' :
                      skill.color === 'green' ? 'bg-gradient-to-r from-green-500 to-green-600' :
                      skill.color === 'purple' ? 'bg-gradient-to-r from-purple-500 to-purple-600' :
                      'bg-gradient-to-r from-pink-500 to-pink-600'
                    }`}
                         style={{ width: `${(skill.level / skill.max) * 100}%` }}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Overall Progress */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{stats.avgSkillLevel}/10</div>
                <div className="text-sm text-gray-600">Average Skill Level</div>
                <div className="mt-4 flex items-center justify-center gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${
                      i < Math.floor(stats.avgSkillLevel / 2) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
                    } transition-all duration-300`} style={{ transitionDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
        {isProfessional ? (
          <>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm p-6 text-center hover:shadow-purple-900/20 transition-all duration-300 group">
              <div className="w-12 h-12 mx-auto mb-3 bg-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <TrendingUp className="w-6 h-6 text-green-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">85%</div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">Job Readiness</div>
            </div>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm p-6 text-center hover:shadow-purple-900/20 transition-all duration-300 group">
              <div className="w-12 h-12 mx-auto mb-3 bg-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <FolderGit className="w-6 h-6 text-blue-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">3</div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">Projects</div>
            </div>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm p-6 text-center hover:shadow-purple-900/20 transition-all duration-300 group">
              <div className="w-12 h-12 mx-auto mb-3 bg-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Award className="w-6 h-6 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">2</div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">Certifications</div>
            </div>
            <div className="bg-slate-800 rounded-2xl border border-slate-700 shadow-sm p-6 text-center hover:shadow-purple-900/20 transition-all duration-300 group">
              <div className="w-12 h-12 mx-auto mb-3 bg-slate-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Users className="w-6 h-6 text-pink-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-1">12</div>
              <div className="text-sm font-medium text-slate-400 uppercase tracking-wide">Connections</div>
            </div>
          </>
        ) : (
          <>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 mx-auto mb-3 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Star className="w-6 h-6 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{playerStats.level}</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Level</div>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 mx-auto mb-3 bg-yellow-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{playerStats.skillPoints}</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Skill Points</div>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 mx-auto mb-3 bg-emerald-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Trophy className="w-6 h-6 text-emerald-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{playerStats.achievements}</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Achievements</div>
            </div>
            
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center hover:shadow-md transition-all duration-300 group">
              <div className="w-12 h-12 mx-auto mb-3 bg-orange-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <Flame className="w-6 h-6 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{playerStats.streak}</div>
              <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Day Streak</div>
            </div>
          </>
        )}
      </div>

      {/* Character & Progress / Professional Profile */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Character Info / Profile Card */}
        <div className={`rounded-3xl border shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 ${
          isProfessional ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
        }`}>
          <div className={`p-6 border-b flex items-center justify-between ${
            isProfessional ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50/50 border-gray-100'
          }`}>
            <h3 className={`font-bold flex items-center gap-2 ${
              isProfessional ? 'text-white' : 'text-gray-900'
            }`}>
              {isProfessional ? <User className="w-5 h-5" /> : classInfo.icon}
              {isProfessional ? 'Professional Profile' : 'Your Character'}
            </h3>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
              isProfessional 
                ? 'bg-purple-900/30 text-purple-400' 
                : `bg-${classInfo.color}-100 text-${classInfo.color}-700`
            }`}>
              {isProfessional ? 'Full Stack Developer' : classInfo.name}
            </span>
          </div>
          <div className="p-8">
            <div className="text-center mb-8">
              <div className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center text-4xl shadow-inner ${
                isProfessional 
                  ? 'bg-gradient-to-br from-slate-700 to-slate-600' 
                  : 'bg-gradient-to-br from-blue-100 to-purple-100'
              }`}>
                {isProfessional ? '👨‍💼' : '👨‍💻'}
              </div>
              <h3 className={`text-xl font-bold mb-1 ${
                isProfessional ? 'text-white' : 'text-gray-900'
              }`}>{gameState.player?.name || 'Coder'}</h3>
              <p className={`text-sm ${
                isProfessional ? 'text-slate-400' : 'text-gray-500'
              }`}>{isProfessional ? 'Open to Work' : 'Ready for action'}</p>
            </div>
            
            <div className="mb-8">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span className={isProfessional ? 'text-slate-400' : 'text-gray-600'}>
                  {isProfessional ? 'Profile Completion' : 'Level Progress'}
                </span>
                <span className={isProfessional ? 'text-purple-400' : 'text-blue-600'}>
                  {isProfessional ? '85%' : `${playerStats.xp} / ${playerStats.xp + playerStats.xpToNext} XP`}
                </span>
              </div>
              <div className={`w-full rounded-full h-3 overflow-hidden ${
                isProfessional ? 'bg-slate-700' : 'bg-gray-100'
              }`}>
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${
                    isProfessional 
                      ? 'bg-gradient-to-r from-pink-500 to-purple-600' 
                      : 'bg-gradient-to-r from-blue-500 to-indigo-600'
                  }`}
                  style={{ width: isProfessional ? '85%' : `${levelProgress}%` }}
                ></div>
              </div>
            </div>
            
            <Button
              onClick={() => setActiveTab(isProfessional ? 'dashboard' : 'avatar')}
              variant="outline"
              className={`w-full rounded-xl font-medium ${
                isProfessional 
                  ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                  : 'border-gray-200 hover:bg-gray-50 text-gray-700'
              }`}
            >
              <Palette className="w-4 h-4 mr-2" />
              {isProfessional ? 'Edit Profile' : 'Customize Character'}
            </Button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className={`rounded-3xl border shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 ${
          isProfessional ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
        }`}>
          <div className={`p-6 border-b ${
            isProfessional ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50/50 border-gray-100'
          }`}>
            <h3 className={`font-bold flex items-center gap-2 ${
              isProfessional ? 'text-white' : 'text-gray-900'
            }`}>
              <Zap className={`w-5 h-5 ${isProfessional ? 'text-purple-500' : 'text-yellow-500'}`} />
              Quick Actions
            </h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-2 gap-4">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`group relative p-4 rounded-2xl bg-gradient-to-br ${action.color} text-white text-center transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${action.shadow}`}
                >
                  <div className="absolute inset-0 bg-white/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex justify-center mb-3 relative z-10">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      {action.icon}
                    </div>
                  </div>
                  <div className="text-sm font-bold relative z-10">{action.title}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className={`rounded-3xl border shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 ${
          isProfessional ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
        }`}>
          <div className={`p-6 border-b ${
            isProfessional ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50/50 border-gray-100'
          }`}>
            <h3 className={`font-bold flex items-center gap-2 ${
              isProfessional ? 'text-white' : 'text-gray-900'
            }`}>
              <Activity className={`w-5 h-5 ${isProfessional ? 'text-pink-500' : 'text-blue-500'}`} />
              Recent Activity
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {getRecentActivity().length > 0 ? (
                getRecentActivity().map((activity, index) => (
                  <div key={index} className={`flex items-start gap-4 p-3 rounded-xl transition-colors ${
                    isProfessional ? 'hover:bg-slate-700' : 'hover:bg-gray-50'
                  }`}>
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                      isProfessional ? 'bg-slate-700 border-slate-600' : `${activity.bg} ${activity.border}`
                    }`}>
                      {activity.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-bold ${
                        isProfessional ? 'text-white' : 'text-gray-900'
                      }`}>{activity.title}</div>
                      <div className={`text-xs truncate ${
                        isProfessional ? 'text-slate-400' : 'text-gray-600'
                      }`}>{activity.description}</div>
                      <div className={`text-[10px] mt-1 font-medium uppercase tracking-wide ${
                        isProfessional ? 'text-slate-500' : 'text-gray-400'
                      }`}>{activity.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className={`text-center py-8 ${
                  isProfessional ? 'text-slate-500' : 'text-gray-500'
                }`}>
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                    isProfessional ? 'bg-slate-700' : 'bg-gray-50'
                  }`}>
                    <Sparkles className={`w-8 h-8 ${
                      isProfessional ? 'text-slate-500' : 'text-gray-300'
                    }`} />
                  </div>
                  <p className="text-sm font-medium">Start your journey to see activity!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className={`rounded-3xl border shadow-sm overflow-hidden ${
        isProfessional ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
      }`}>
        <div className={`p-8 border-b ${
          isProfessional ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50/50 border-gray-100'
        }`}>
          <h3 className={`text-xl font-bold flex items-center gap-2 ${
            isProfessional ? 'text-white' : 'text-gray-900'
          }`}>
            {isProfessional ? <Briefcase className="w-6 h-6 text-purple-500" /> : <Gamepad2 className="w-6 h-6 text-purple-600" />}
            {isProfessional ? 'Career Tools' : 'Game Features'}
          </h3>
          <p className={`mt-1 ${
            isProfessional ? 'text-slate-400' : 'text-gray-500'
          }`}>
            {isProfessional 
              ? 'Everything you need to accelerate your career.'
              : 'Explore all the amazing features of your coding adventure!'}
          </p>
        </div>
        <div className="p-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentTabs.filter(tab => tab.id !== 'dashboard').map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`group p-6 border rounded-2xl cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  isProfessional 
                    ? 'bg-slate-800 border-slate-700 hover:border-purple-500/50 hover:shadow-purple-900/20' 
                    : 'bg-white border-gray-100 hover:border-blue-200'
                }`}
              >
                <div className="flex items-center gap-4 mb-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 ${
                    isProfessional 
                      ? 'bg-slate-700 text-purple-400 group-hover:bg-purple-600 group-hover:text-white' 
                      : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
                  }`}>
                    {tab.icon}
                  </div>
                  <h3 className={`font-bold text-lg transition-colors ${
                    isProfessional 
                      ? 'text-white group-hover:text-purple-400' 
                      : 'text-gray-900 group-hover:text-blue-600'
                  }`}>{tab.label}</h3>
                </div>
                <p className={`text-sm leading-relaxed ${
                  isProfessional ? 'text-slate-400' : 'text-gray-600'
                }`}>{tab.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  // Placeholder for Professional Tabs
  const renderProfessionalPlaceholder = (title) => (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-slate-800 rounded-full flex items-center justify-center mb-6 shadow-xl shadow-purple-900/20">
        <Briefcase className="w-10 h-10 text-purple-500" />
      </div>
      <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
      <p className="text-slate-400 max-w-md mb-8">
        This professional module is currently under development. Check back soon for industry-standard tools and resources.
      </p>
      <Button className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-6 rounded-xl font-bold text-lg shadow-lg shadow-purple-600/20">
        Notify Me When Ready
      </Button>
    </div>
  );

  return (
    <div className={`min-h-screen transition-all duration-300 font-sans ${
      isProfessional ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      {/* Navigation Header */}
      <div className={`border-b sticky top-0 z-40 shadow-sm ${
        isProfessional ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-lg ${
                isProfessional ? 'bg-purple-600 shadow-purple-600/20' : 'bg-blue-600 shadow-blue-600/20'
              }`}>
                {isProfessional ? <Briefcase className="w-6 h-6 text-white" /> : <Gamepad2 className="w-6 h-6 text-white" />}
              </div>
              <div>
                <h1 className={`text-lg font-bold leading-none ${
                  isProfessional ? 'text-white' : 'text-gray-900'
                }`}>Coding Society</h1>
                <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${
                  isProfessional ? 'text-purple-400' : 'text-blue-600'
                }`}>{isProfessional ? 'Career Center' : 'Gamified Learning'}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-6">
              <div className={`hidden md:flex items-center gap-4 px-4 py-2 rounded-xl border ${
                isProfessional ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-100'
              }`}>
                <div className="flex items-center gap-2 text-sm">
                  {isProfessional ? <TrendingUp className="w-4 h-4 text-green-400" /> : <Star className="w-4 h-4 text-blue-500 fill-blue-500" />}
                  <span className={`font-bold ${isProfessional ? 'text-white' : 'text-gray-700'}`}>
                    {isProfessional ? 'Ready: 85%' : `Lvl ${playerStats.level}`}
                  </span>
                </div>
                <div className={`w-px h-4 ${isProfessional ? 'bg-slate-600' : 'bg-gray-300'}`}></div>
                <div className="flex items-center gap-2 text-sm">
                  {isProfessional ? <Award className="w-4 h-4 text-purple-400" /> : <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                  <span className={`font-bold ${isProfessional ? 'text-white' : 'text-gray-700'}`}>
                    {isProfessional ? '2 Certs' : `${playerStats.skillPoints} SP`}
                  </span>
                </div>
              </div>
              <Button variant="ghost" size="icon" className={`rounded-xl ${
                isProfessional ? 'text-slate-400 hover:bg-slate-800' : 'text-gray-500 hover:bg-gray-100'
              }`}>
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className={`border-b shadow-sm sticky top-16 z-30 ${
        isProfessional ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto no-scrollbar py-2">
            {currentTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? (isProfessional 
                        ? 'bg-slate-800 text-purple-400 shadow-sm ring-1 ring-slate-700' 
                        : 'bg-blue-50 text-blue-600 shadow-sm ring-1 ring-blue-100')
                    : (isProfessional 
                        ? 'text-slate-400 hover:text-white hover:bg-slate-800' 
                        : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50')
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {activeTab === 'dashboard' && renderDashboard()}
        
        {currentTabs.map((tab) => {
          if (activeTab === tab.id && tab.id !== 'dashboard') {
            if (isProfessional) {
              // Render placeholder for professional tabs
              return (
                <div key={tab.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {renderProfessionalPlaceholder(tab.label)}
                </div>
              );
            } else if (tab.component) {
              // Render existing gamified components
              const Component = tab.component;
              return (
                <div key={tab.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <Component />
                </div>
              );
            }
          }
          return null;
        })}
      </div>
    </div>
  );

};

export default GamifiedPage;