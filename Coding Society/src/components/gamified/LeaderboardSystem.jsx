import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { useGame } from '../../context/GameContext';
import {
  Trophy,
  Medal,
  Crown,
  Star,
  TrendingUp,
  Award,
  Target,
  Zap,
  Users,
  Filter,
  RefreshCw,
  ChevronDown,
  Flame,
  Shield,
  Swords
} from 'lucide-react';

/**
 * Advanced Leaderboard System
 * Features:
 * - Multiple leaderboard types (Level, XP, Battles, Streaks)
 * - Real-time rankings
 * - User position highlighting
 * - Filtering and time periods
 * - Top performer showcases
 * - Achievement-based leaderboards
 */

const LeaderboardSystem = () => {
  const { gameState, user } = useGame();
  const [leaderboardType, setLeaderboardType] = useState('level');
  const [timePeriod, setTimePeriod] = useState('all-time');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(false);

  // Leaderboard types
  const leaderboardTypes = [
    { id: 'level', name: 'Top Levels', icon: <Star className="w-4 h-4" />, color: 'blue' },
    { id: 'xp', name: 'Total XP', icon: <Zap className="w-4 h-4" />, color: 'yellow' },
    { id: 'battles', name: 'Battle Wins', icon: <Swords className="w-4 h-4" />, color: 'red' },
    { id: 'streak', name: 'Longest Streak', icon: <Flame className="w-4 h-4" />, color: 'orange' },
    { id: 'quests', name: 'Quests Completed', icon: <Target className="w-4 h-4" />, color: 'green' }
  ];

  // Time periods
  const timePeriods = [
    { id: 'all-time', name: 'All Time' },
    { id: 'monthly', name: 'This Month' },
    { id: 'weekly', name: 'This Week' },
    { id: 'daily', name: 'Today' }
  ];

  useEffect(() => {
    fetchLeaderboard();
  }, [leaderboardType, timePeriod]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/game/leaderboard?type=${leaderboardType}&period=${timePeriod}&limit=50`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      
      if (data.success) {
        setLeaderboardData(data.data.leaderboard);
        setUserRank(data.data.userRank);
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get rank badge
  const getRankBadge = (rank) => {
    if (rank === 1) return { icon: <Crown className="w-6 h-6" />, color: 'text-yellow-500', bg: 'bg-yellow-50' };
    if (rank === 2) return { icon: <Medal className="w-6 h-6" />, color: 'text-slate-400', bg: 'bg-slate-50' };
    if (rank === 3) return { icon: <Medal className="w-6 h-6" />, color: 'text-orange-500', bg: 'bg-orange-50' };
    return { icon: <Trophy className="w-5 h-5" />, color: 'text-blue-500', bg: 'bg-blue-50' };
  };

  // Get stat value based on type
  const getStatValue = (player) => {
    switch (leaderboardType) {
      case 'level':
        return `Level ${player.level}`;
      case 'xp':
        return `${player.totalXP?.toLocaleString()} XP`;
      case 'battles':
        return `${player.battleWins} Wins`;
      case 'streak':
        return `${player.dailyStreak} Days`;
      case 'quests':
        return `${player.questsCompleted} Quests`;
      default:
        return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Trophy className="w-8 h-8 text-yellow-500" />
            Leaderboards
          </h2>
          <p className="text-gray-600 mt-1">Compete with the best coders worldwide</p>
        </div>
        <Button onClick={fetchLeaderboard} variant="outline" disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Leaderboard Type Selector */}
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Leaderboard Type</label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {leaderboardTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setLeaderboardType(type.id)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  leaderboardType === type.id
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className={`flex items-center justify-center mb-1 ${
                  leaderboardType === type.id ? 'text-blue-600' : 'text-gray-500'
                }`}>
                  {type.icon}
                </div>
                <div className={`text-xs font-semibold text-center ${
                  leaderboardType === type.id ? 'text-blue-900' : 'text-gray-700'
                }`}>
                  {type.name}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Time Period Selector */}
        <div className="sm:w-48">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Time Period</label>
          <select
            value={timePeriod}
            onChange={(e) => setTimePeriod(e.target.value)}
            className="w-full px-4 py-2 border border-gray-200 rounded-xl font-medium bg-white"
          >
            {timePeriods.map((period) => (
              <option key={period.id} value={period.id}>
                {period.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 3 Showcase */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {leaderboardData.slice(0, 3).map((player, index) => {
          const badge = getRankBadge(index + 1);
          return (
            <Card key={player.id} className={`border-2 ${index === 0 ? 'md:order-2 md:scale-105' : index === 1 ? 'md:order-1' : 'md:order-3'} ${badge.bg} border-gray-200 hover:shadow-lg transition-all`}>
              <CardContent className="p-6 text-center">
                <div className={`w-20 h-20 mx-auto mb-4 rounded-full ${badge.bg} border-4 border-white shadow-lg flex items-center justify-center ${badge.color}`}>
                  {badge.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">#{index + 1}</div>
                <div className="flex items-center justify-center gap-2 mb-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                    {player.name?.charAt(0) || player.username?.charAt(0) || 'U'}
                  </div>
                </div>
                <h3 className="font-bold text-gray-900 mb-1">{player.name || player.username}</h3>
                <p className="text-sm text-gray-600 font-semibold">{getStatValue(player)}</p>
                {index === 0 && (
                  <div className="mt-4 px-3 py-1 bg-yellow-100 border border-yellow-300 rounded-full text-xs font-bold text-yellow-700">
                    👑 Champion
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Full Leaderboard Table */}
      <Card className="border-gray-200">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-600" />
            Rankings
          </CardTitle>
          <CardDescription>
            {userRank && (
              <span className="text-sm">
                Your rank: <span className="font-bold text-blue-600">#{userRank}</span>
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Rank</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Player</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Level</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Score</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-6 h-6 animate-spin text-blue-600 mr-2" />
                        Loading leaderboard...
                      </div>
                    </td>
                  </tr>
                ) : leaderboardData.length > 0 ? (
                  leaderboardData.map((player, index) => {
                    const isCurrentUser = player.isCurrentUser;
                    const badge = getRankBadge(player.rank);
                    
                    return (
                      <tr
                        key={player.id || index}
                        className={`transition-colors ${
                          isCurrentUser
                            ? 'bg-blue-50 border-l-4 border-blue-500'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${badge.bg} flex items-center justify-center ${badge.color}`}>
                              {player.rank <= 3 ? badge.icon : (
                                <span className="font-bold text-sm">{player.rank}</span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold shadow-md">
                              {player.name?.charAt(0) || player.username?.charAt(0) || 'U'}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 flex items-center gap-2">
                                {player.name || player.username}
                                {isCurrentUser && (
                                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-bold rounded">
                                    YOU
                                  </span>
                                )}
                              </div>
                              {player.avatar && (
                                <div className="text-xs text-gray-500 mt-1">@{player.username}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-bold text-blue-600">
                            {player.level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="text-sm font-semibold text-gray-900">
                            {getStatValue(player)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {player.dailyStreak >= 7 && (
                            <div className="flex items-center gap-1 text-orange-600">
                              <Flame className="w-4 h-4" />
                              <span className="text-xs font-bold">{player.dailyStreak} days</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No leaderboard data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Your Stats */}
      {userRank && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-6">
            <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Your Performance
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-white rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{userRank}</div>
                <div className="text-xs text-gray-600 uppercase font-semibold mt-1">Your Rank</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{gameState.level || 1}</div>
                <div className="text-xs text-gray-600 uppercase font-semibold mt-1">Level</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{gameState.xp || 0}</div>
                <div className="text-xs text-gray-600 uppercase font-semibold mt-1">Total XP</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl">
                <div className="text-2xl font-bold text-gray-900">{gameState.stats?.dailyStreak || 0}</div>
                <div className="text-xs text-gray-600 uppercase font-semibold mt-1">Streak</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LeaderboardSystem;
