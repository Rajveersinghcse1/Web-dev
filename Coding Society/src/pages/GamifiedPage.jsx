import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { useMode } from '../context/ModeContext';
import { useGame } from '../context/GameContext';

// Import our new gamified components
import QuestSystem from '../components/gamified/QuestSystem';
import SkillTreeSystem from '../components/gamified/SkillTreeSystem';
import AchievementSystemUI from '../components/gamified/AchievementSystemUI';
import BattleArena from '../components/gamified/BattleArena';
import CharacterCustomization from '../components/gamified/CharacterCustomization';
import InteractiveTutorials from '../components/gamified/InteractiveTutorials';

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
  Sparkles
} from 'lucide-react';

/**
 * Ultra-Advanced Gamified Learning Platform
 * 
 * This is the main hub for the comprehensive gamified learning experience that integrates:
 * - RPG-style character progression with XP, levels, and character classes
 * - Interactive quest system with story-driven coding challenges
 * - Comprehensive skill trees with 8 specialized paths
 * - Achievement system with visual badges and milestone rewards  
 * - Battle arena for competitive coding challenges
 * - Character customization with unlockable themes and accessories
 * - Interactive tutorials with step-by-step guided learning
 * - Social features, leaderboards, and community challenges
 * 
 * Features implemented:
 * ✅ GameContext with full RPG mechanics
 * ✅ Quest system with real code execution
 * ✅ Skill trees for all major programming domains
 * ✅ Achievement system with progress tracking
 * ✅ Battle arena with real-time competitions
 * ✅ Avatar customization system
 * ✅ Interactive tutorial system
 * ✅ Integrated navigation and user experience
 */

const GamifiedPage = () => {
  const { getCurrentTheme } = useMode();
  const { gameState, showNotification } = useGame();
  const theme = getCurrentTheme();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showWelcome, setShowWelcome] = useState(false);

  // Check if this is a new user and show welcome
  useEffect(() => {
    if (!gameState.hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, [gameState.hasSeenWelcome]);

  // Tab configuration for the ultra-advanced gamified system
  const gameTabs = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <Home className="w-4 h-4" />,
      description: 'Your gaming overview and quick stats'
    },
    {
      id: 'quests',
      label: 'Quests',
      icon: <Scroll className="w-4 h-4" />,
      description: 'Story-driven coding challenges',
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
    }
  ];

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
  const quickActions = [
    {
      title: 'Start Quest',
      description: 'Begin a new coding adventure',
      icon: <Scroll className="w-6 h-6" />,
      color: 'from-blue-500 to-blue-600',
      action: () => setActiveTab('quests')
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
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="text-center py-8">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {gameState.player?.name || 'Coder'}! 🚀
        </h1>
        <p className="text-gray-600 text-lg">
          Ready for your next coding adventure?
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Star className="w-8 h-8 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-blue-600">{playerStats.level}</div>
            <div className="text-sm text-gray-600">Level</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Zap className="w-8 h-8 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{playerStats.skillPoints}</div>
            <div className="text-sm text-gray-600">Skill Points</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Trophy className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-green-600">{playerStats.achievements}</div>
            <div className="text-sm text-gray-600">Achievements</div>
          </CardContent>
        </Card>
        
        <Card className="text-center">
          <CardContent className="p-4">
            <div className="flex items-center justify-center mb-2">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
            <div className="text-2xl font-bold text-orange-600">{playerStats.streak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </CardContent>
        </Card>
      </div>

      {/* Character & Progress */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Character Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {classInfo.icon}
              Your Character
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-2xl">
                  👨‍💻
                </div>
                <h3 className="font-semibold">{gameState.player?.name || 'Coder'}</h3>
                <p className={`text-sm text-${classInfo.color}-600 font-medium`}>
                  {classInfo.name}
                </p>
              </div>
              
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span>Level {playerStats.level}</span>
                  <span>{playerStats.xp} / {playerStats.xp + playerStats.xpToNext} XP</span>
                </div>
                <Progress value={levelProgress} className="h-2" />
              </div>
              
              <Button
                onClick={() => setActiveTab('avatar')}
                variant="outline"
                className="w-full"
              >
                <Palette className="w-4 h-4 mr-2" />
                Customize Character
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              {quickActions.map((action, index) => (
                <button
                  key={index}
                  onClick={action.action}
                  className={`p-3 rounded-lg bg-gradient-to-r ${action.color} text-white text-center transition-transform hover:scale-105`}
                >
                  <div className="flex justify-center mb-2">
                    {action.icon}
                  </div>
                  <div className="text-sm font-medium">{action.title}</div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {getRecentActivity().length > 0 ? (
                getRecentActivity().map((activity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    {activity.icon}
                    <div className="flex-1">
                      <div className="text-sm font-medium">{activity.title}</div>
                      <div className="text-xs text-gray-600">{activity.description}</div>
                    </div>
                    <div className="text-xs text-gray-500">{activity.time}</div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Start your journey to see activity!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Feature Highlights */}
      <Card>
        <CardHeader>
          <CardTitle>🎮 Game Features</CardTitle>
          <CardDescription>
            Explore all the amazing features of your coding adventure!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {gameTabs.filter(tab => tab.id !== 'dashboard').map((tab) => (
              <div
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md hover:scale-105"
              >
                <div className="flex items-center gap-3 mb-2">
                  {tab.icon}
                  <h3 className="font-semibold">{tab.label}</h3>
                </div>
                <p className="text-sm text-gray-600">{tab.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Welcome modal for new users
  const renderWelcomeModal = () => (
    showWelcome && (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <Card className="w-full max-w-2xl">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">🎉 Welcome to Coding Society!</CardTitle>
            <CardDescription className="text-lg">
              Your epic coding adventure begins now!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className="text-6xl mb-4">🚀</div>
              <p className="text-gray-700">
                You've entered an ultra-advanced gamified learning platform where coding becomes an epic RPG adventure! 
                Level up your skills, complete quests, battle other coders, and customize your character as you master programming.
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <Scroll className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                <h3 className="font-semibold text-blue-800">Epic Quests</h3>
                <p className="text-sm text-blue-600">Story-driven coding challenges</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <Map className="w-8 h-8 mx-auto mb-2 text-green-600" />
                <h3 className="font-semibold text-green-800">Skill Trees</h3>
                <p className="text-sm text-green-600">8 specialized programming paths</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <Swords className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                <h3 className="font-semibold text-purple-800">Battle Arena</h3>
                <p className="text-sm text-purple-600">Competitive coding battles</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-yellow-600" />
                <h3 className="font-semibold text-yellow-800">Achievements</h3>
                <p className="text-sm text-yellow-600">Unlock badges and rewards</p>
              </div>
            </div>
            
            <div className="text-center">
              <Button
                onClick={() => setShowWelcome(false)}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-3 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start My Adventure!
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  );

  return (
    <div className={`min-h-screen transition-all duration-300 ${theme.bg} ${theme.text}`}>
      {/* Navigation Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Gamepad2 className="w-8 h-8 text-blue-600" />
              <div>
                <h1 className="text-xl font-bold">Coding Society</h1>
                <p className="text-sm text-gray-600">Ultra-Advanced Gamified Learning</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm">
                <Star className="w-4 h-4 text-blue-500" />
                <span className="font-medium">Level {playerStats.level}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Zap className="w-4 h-4 text-yellow-500" />
                <span className="font-medium">{playerStats.skillPoints} SP</span>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="border-b bg-white/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto">
            {gameTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
      <div className="max-w-7xl mx-auto p-6">
        {activeTab === 'dashboard' && renderDashboard()}
        
        {gameTabs.map((tab) => {
          if (tab.component && activeTab === tab.id) {
            const Component = tab.component;
            return <Component key={tab.id} />;
          }
          return null;
        })}
      </div>

      {/* Welcome Modal */}
      {renderWelcomeModal()}
    </div>
  );
};

export default GamifiedPage;