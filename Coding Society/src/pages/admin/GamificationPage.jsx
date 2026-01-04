import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gamepad2, Trophy, Target, Swords, Star, Shield, Crown, Zap,
  Plus, Edit2, Trash2, Eye, Search, Filter, Download, Upload,
  BarChart3, Users, TrendingUp, Award, Scroll, Map, CheckCircle,
  XCircle, Clock, Calendar, Settings, Save, X, ChevronDown,
  RefreshCw, PlayCircle, PauseCircle, AlertCircle, Lock, Unlock
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

/**
 * Advanced Gamification Management Admin Panel
 * Complete control over all gamification features including:
 * - Quest Management (CRUD operations)
 * - Achievement System (Create, configure rewards)
 * - Skill Tree Configuration
 * - Battle Arena Settings
 * - Player Statistics & Analytics
 * - XP & Reward System Configuration
 * - Leaderboard Management
 */

const GamificationPage = () => {
  const [activeSection, setActiveSection] = useState('overview');
  const [quests, setQuests] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  // Navigation sections
  const sections = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'quests', label: 'Quest Manager', icon: <Scroll className="w-4 h-4" /> },
    { id: 'achievements', label: 'Achievements', icon: <Trophy className="w-4 h-4" /> },
    { id: 'skills', label: 'Skill Trees', icon: <Map className="w-4 h-4" /> },
    { id: 'battles', label: 'Battle Arena', icon: <Swords className="w-4 h-4" /> },
    { id: 'players', label: 'Player Stats', icon: <Users className="w-4 h-4" /> },
    { id: 'rewards', label: 'XP & Rewards', icon: <Star className="w-4 h-4" /> },
    { id: 'settings', label: 'Game Settings', icon: <Settings className="w-4 h-4" /> }
  ];

  // Fetch data on mount
  useEffect(() => {
    fetchGameData();
  }, [activeSection]);

  const fetchGameData = async () => {
    setLoading(true);
    try {
      // Fetch based on active section
      if (activeSection === 'quests') {
        const response = await fetch('/api/v1/admin/quests', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (data.success) setQuests(data.data.quests);
      } else if (activeSection === 'achievements') {
        const response = await fetch('/api/v1/admin/achievements', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (data.success) setAchievements(data.data.achievements);
      } else if (activeSection === 'players') {
        const response = await fetch('/api/v1/admin/game/players', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        const data = await response.json();
        if (data.success) setPlayers(data.data.players);
      }
    } catch (error) {
      console.error('Error fetching game data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Overview Section
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Total Quests"
          value="127"
          change="+12"
          icon={<Scroll className="w-6 h-6" />}
          color="blue"
        />
        <StatsCard
          title="Active Players"
          value="15,234"
          change="+8%"
          icon={<Users className="w-6 h-6" />}
          color="green"
        />
        <StatsCard
          title="Achievements"
          value="89"
          change="+5"
          icon={<Trophy className="w-6 h-6" />}
          color="yellow"
        />
        <StatsCard
          title="Avg Engagement"
          value="42 min"
          change="+15%"
          icon={<TrendingUp className="w-6 h-6" />}
          color="purple"
        />
      </div>

      {/* Activity Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-blue-600" />
              Quest Completion Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <QuestCompletionBar category="Frontend" percentage={78} />
              <QuestCompletionBar category="Backend" percentage={65} />
              <QuestCompletionBar category="AI/ML" percentage={45} />
              <QuestCompletionBar category="Algorithms" percentage={82} />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="w-5 h-5 text-yellow-600" />
              Top Achievements Unlocked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {['First Steps', 'Code Warrior', 'Bug Hunter', 'Daily Coder'].map((achievement, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <span className="font-medium text-slate-700">{achievement}</span>
                  <span className="text-sm font-bold text-blue-600">{Math.floor(Math.random() * 5000)} unlocks</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-purple-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { user: 'Alex Smith', action: 'completed quest', item: 'Python Patterns', time: '2 min ago' },
              { user: 'Sarah Johnson', action: 'unlocked achievement', item: 'Bug Hunter', time: '5 min ago' },
              { user: 'Mike Chen', action: 'won battle', item: 'Speed Coding Arena', time: '12 min ago' },
              { user: 'Emma Davis', action: 'leveled up', item: 'Level 25', time: '20 min ago' }
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-lg transition-colors">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                  {activity.user.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm">
                    <span className="font-semibold text-slate-900">{activity.user}</span>
                    <span className="text-slate-600"> {activity.action} </span>
                    <span className="font-semibold text-blue-600">{activity.item}</span>
                  </p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Quest Manager Section
  const renderQuestManager = () => (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex gap-3">
          <Button
            onClick={() => openModal('create', 'quest')}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Quest
          </Button>
          <Button variant="outline">
            <Upload className="w-4 h-4 mr-2" />
            Import
          </Button>
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>

        <div className="flex gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search quests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-full sm:w-64"
            />
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg"
          >
            <option value="all">All Categories</option>
            <option value="frontend">Frontend</option>
            <option value="backend">Backend</option>
            <option value="ai">AI/ML</option>
            <option value="algorithms">Algorithms</option>
          </select>
        </div>
      </div>

      {/* Quests Table */}
      <Card className="border-slate-200">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Quest</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Difficulty</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Completions</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">XP Reward</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quests.length > 0 ? quests.map((quest) => (
                  <tr key={quest._id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                          <Scroll className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{quest.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{quest.shortDescription}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                        {quest.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <DifficultyBadge difficulty={quest.difficulty} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={quest.status} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-700">
                        {quest.analytics?.totalCompletions || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-blue-600">
                        {quest.rewards?.xp || 0} XP
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openModal('edit', 'quest', quest)}
                          className="p-2 hover:bg-green-50 text-green-600 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete('quest', quest._id)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                      {loading ? 'Loading quests...' : 'No quests found'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Achievement Manager Section
  const renderAchievementManager = () => (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Button
          onClick={() => openModal('create', 'achievement')}
          className="bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Achievement
        </Button>

        <div className="flex gap-3">
          <select className="px-4 py-2 border border-slate-200 rounded-lg">
            <option>All Rarities</option>
            <option>Common</option>
            <option>Rare</option>
            <option>Epic</option>
            <option>Legendary</option>
          </select>
          <select className="px-4 py-2 border border-slate-200 rounded-lg">
            <option>All Categories</option>
            <option>Learning</option>
            <option>Coding</option>
            <option>Social</option>
            <option>Consistency</option>
          </select>
        </div>
      </div>

      {/* Achievements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {achievements.length > 0 ? achievements.map((achievement) => (
          <Card key={achievement._id} className="border-slate-200 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getRarityColor(achievement.rarity)}`}>
                    <Trophy className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{achievement.name}</CardTitle>
                    <RarityBadge rarity={achievement.rarity} />
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-slate-600 mb-4">{achievement.description}</p>
              <div className="flex items-center justify-between text-xs text-slate-500 mb-4">
                <span>{achievement.analytics?.totalUnlocked || 0} unlocked</span>
                <span>{achievement.rewards?.xp || 0} XP</span>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="flex-1">
                  <Edit2 className="w-3 h-3 mr-1" />
                  Edit
                </Button>
                <Button size="sm" variant="outline" className="text-red-600 hover:bg-red-50">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )) : (
          <div className="col-span-3 text-center py-12 text-slate-500">
            {loading ? 'Loading achievements...' : 'No achievements found'}
          </div>
        )}
      </div>
    </div>
  );

  // Player Stats Section
  const renderPlayerStats = () => (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle>Player Management & Statistics</CardTitle>
          <CardDescription>Monitor and manage player progression</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and Filters */}
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search players..."
                  className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg w-full"
                />
              </div>
              <select className="px-4 py-2 border border-slate-200 rounded-lg">
                <option>All Levels</option>
                <option>Level 1-10</option>
                <option>Level 11-25</option>
                <option>Level 26+</option>
              </select>
            </div>

            {/* Players Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Player</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Level</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">XP</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Quests</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Achievements</th>
                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase">Streak</th>
                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                            U{i}
                          </div>
                          <span className="font-medium text-slate-900">User {i}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-bold text-blue-600">{Math.floor(Math.random() * 50) + 1}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-700">{Math.floor(Math.random() * 10000)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-700">{Math.floor(Math.random() * 50)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm text-slate-700">{Math.floor(Math.random() * 30)}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-sm font-semibold text-orange-600">{Math.floor(Math.random() * 30)} 🔥</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-lg transition-colors">
                            <Award className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Game Settings Section
  const renderGameSettings = () => (
    <div className="space-y-6">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            XP & Reward Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SettingRow
            label="Base XP per Quest"
            value="100"
            description="Default XP reward for completing a quest"
          />
          <SettingRow
            label="Level Up Multiplier"
            value="1.5"
            description="XP requirement multiplier for each level"
          />
          <SettingRow
            label="Daily Streak Bonus"
            value="50"
            description="Additional XP for maintaining daily streak"
          />
          <SettingRow
            label="Battle Win XP"
            value="200"
            description="XP reward for winning a coding battle"
          />
          <div className="pt-4 border-t border-slate-200">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Battle Arena Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <SettingRow
            label="Battle Duration"
            value="15 min"
            description="Default time limit for battles"
          />
          <SettingRow
            label="ELO Starting Rating"
            value="1200"
            description="Initial ELO rating for new players"
          />
          <SettingRow
            label="Max Simultaneous Battles"
            value="5"
            description="Maximum concurrent battles per player"
          />
          <div className="pt-4 border-t border-slate-200">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white">
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  // Helper Functions
  const openModal = (type, itemType, item = null) => {
    setModalType(type);
    setSelectedItem(item);
    setShowModal(true);
  };

  const handleDelete = async (type, id) => {
    if (!confirm(`Are you sure you want to delete this ${type}?`)) return;
    
    try {
      const response = await fetch(`/api/v1/admin/${type}s/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      if (data.success) {
        fetchGameData();
      }
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
    }
  };

  // Render active section
  const renderActiveSection = () => {
    switch (activeSection) {
      case 'overview':
        return renderOverview();
      case 'quests':
        return renderQuestManager();
      case 'achievements':
        return renderAchievementManager();
      case 'players':
        return renderPlayerStats();
      case 'settings':
        return renderGameSettings();
      default:
        return <div className="text-center py-12 text-slate-500">Section under development</div>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-blue-600" />
            Gamification Management
          </h1>
          <p className="text-slate-600 mt-2">Complete control over the gamified learning experience</p>
        </div>
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh Data
        </Button>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200">
        <nav className="flex gap-2 overflow-x-auto pb-px">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`flex items-center gap-2 px-4 py-3 font-medium text-sm whitespace-nowrap transition-colors border-b-2 ${
                activeSection === section.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
              }`}
            >
              {section.icon}
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Active Section Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {renderActiveSection()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// Helper Components
const StatsCard = ({ title, value, change, icon, color }) => {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600'
  };

  return (
    <Card className="border-slate-200">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} shadow-lg`}>
            {React.cloneElement(icon, { className: 'text-white' })}
          </div>
          <span className="text-sm font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
            {change}
          </span>
        </div>
        <h3 className="text-3xl font-bold text-slate-900 mb-1">{value}</h3>
        <p className="text-sm text-slate-500 uppercase tracking-wide font-medium">{title}</p>
      </CardContent>
    </Card>
  );
};

const QuestCompletionBar = ({ category, percentage }) => (
  <div>
    <div className="flex justify-between text-sm mb-2">
      <span className="font-medium text-slate-700">{category}</span>
      <span className="font-bold text-blue-600">{percentage}%</span>
    </div>
    <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  </div>
);

const DifficultyBadge = ({ difficulty }) => {
  const colors = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-blue-100 text-blue-700',
    advanced: 'bg-purple-100 text-purple-700',
    expert: 'bg-red-100 text-red-700'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[difficulty] || colors.beginner}`}>
      {difficulty}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const colors = {
    draft: 'bg-slate-100 text-slate-700',
    review: 'bg-yellow-100 text-yellow-700',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-red-100 text-red-700'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${colors[status] || colors.draft}`}>
      {status}
    </span>
  );
};

const RarityBadge = ({ rarity }) => {
  const colors = {
    common: 'bg-slate-100 text-slate-700',
    uncommon: 'bg-green-100 text-green-700',
    rare: 'bg-blue-100 text-blue-700',
    epic: 'bg-purple-100 text-purple-700',
    legendary: 'bg-orange-100 text-orange-700'
  };

  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${colors[rarity] || colors.common}`}>
      {rarity}
    </span>
  );
};

const getRarityColor = (rarity) => {
  const colors = {
    common: 'bg-slate-500',
    uncommon: 'bg-green-500',
    rare: 'bg-blue-500',
    epic: 'bg-purple-500',
    legendary: 'bg-orange-500'
  };
  return colors[rarity] || colors.common;
};

const SettingRow = ({ label, value, description }) => (
  <div className="flex items-center justify-between py-3 border-b border-slate-100 last:border-0">
    <div className="flex-1">
      <p className="font-semibold text-slate-900">{label}</p>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </div>
    <input
      type="text"
      defaultValue={value}
      className="px-4 py-2 border border-slate-200 rounded-lg w-32 text-right font-medium"
    />
  </div>
);

export default GamificationPage;
