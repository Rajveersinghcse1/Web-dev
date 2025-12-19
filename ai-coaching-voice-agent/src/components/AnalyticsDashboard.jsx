'use client';

import { useMemo } from 'react';
import { useAnalyticsStore, useProgressStore } from '@/store';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion } from 'framer-motion';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  Clock,
  Target,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Award,
  MessageSquare,
  Users
} from 'lucide-react';

const COLORS = {
  primary: '#7C3AED', // Vibrant Violet
  secondary: '#DB2777', // Vibrant Pink
  success: '#059669', // Vibrant Emerald
  warning: '#D97706', // Vibrant Amber
  info: '#2563EB', // Vibrant Blue
  purple: '#7C3AED',
  pink: '#DB2777',
  blue: '#2563EB',
  green: '#059669',
  orange: '#EA580C'
};

const CHART_COLORS = [
  COLORS.purple,
  COLORS.pink,
  COLORS.blue,
  COLORS.green,
  COLORS.orange
];

export default function AnalyticsDashboard() {
  const sessions = useAnalyticsStore(state => state.sessionHistory);
  const totalSessions = useProgressStore(state => state.totalSessions);
  const totalTimeMinutes = useProgressStore(state => state.totalTimeMinutes);

  // Demo Data Fallback
  const demoSessions = useMemo(() => {
    if (sessions && sessions.length > 0) return sessions;
    
    // Generate demo data if no real sessions exist
    return Array.from({ length: 20 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 14));
      return {
        id: `demo-${i}`,
        timestamp: date.toISOString(),
        duration: 5 + Math.floor(Math.random() * 25),
        xpEarned: 50 + Math.floor(Math.random() * 100),
        mode: ['Public Speaking', 'Interview Prep', 'Debate', 'Casual Chat'][Math.floor(Math.random() * 4)],
        success: Math.random() > 0.2,
        messageCount: 10 + Math.floor(Math.random() * 30),
        wordsSpoken: 100 + Math.floor(Math.random() * 500)
      };
    });
  }, [sessions]);

  // Prepare data for charts
  const chartData = useMemo(() => {
    // Last 7 days activity
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sessions: 0,
        xp: 0,
        minutes: 0,
        messages: 0,
        words: 0
      };
    });

    // Fill with actual data
    const safeSessions = Array.isArray(demoSessions) ? demoSessions : [];
    safeSessions.forEach(session => {
      const sessionDate = new Date(session.timestamp || session.createdAt); // Handle both formats
      const daysDiff = Math.floor((Date.now() - sessionDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff < 7) {
        const index = 6 - daysDiff;
        if (index >= 0 && index < 7) {
          last7Days[index].sessions += 1;
          last7Days[index].xp += session.xpEarned || 0;
          last7Days[index].minutes += session.duration || 0;
          last7Days[index].messages += session.messageCount || 0;
          last7Days[index].words += session.wordsSpoken || 0;
        }
      }
    });

    // Session modes breakdown
    const modeStats = {};
    safeSessions.forEach(session => {
      const mode = session.mode || session.coachingOption || 'Unknown';
      if (!modeStats[mode]) {
        modeStats[mode] = { count: 0, time: 0 };
      }
      modeStats[mode].count += 1;
      modeStats[mode].time += session.duration || 0;
    });

    const modeData = Object.entries(modeStats).map(([mode, stats]) => ({
      name: mode,
      value: stats.count,
      time: stats.time
    }));

    // Monthly progress (last 4 weeks)
    const weeklyData = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (3 - i) * 7);
      return {
        week: `Week ${i + 1}`,
        sessions: 0,
        xp: 0
      };
    });

    safeSessions.forEach(session => {
      const sessionDate = new Date(session.timestamp);
      const weeksDiff = Math.floor((Date.now() - sessionDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      
      if (weeksDiff < 4) {
        const index = 3 - weeksDiff;
        if (index >= 0 && index < 4) {
          weeklyData[index].sessions += 1;
          weeklyData[index].xp += session.xpEarned || 0;
        }
      }
    });

    return {
      daily: last7Days,
      modes: modeData,
      weekly: weeklyData
    };
  }, [sessions, demoSessions]);

  // Summary stats
  const stats = useMemo(() => {
    const safeSessions = Array.isArray(sessions) ? sessions : [];
    const avgSessionDuration = totalSessions > 0 
      ? Math.round(totalTimeMinutes / totalSessions) 
      : 0;
    
    const last7DaysSessions = safeSessions.filter(s => 
      (Date.now() - s.timestamp) < 7 * 24 * 60 * 60 * 1000
    ).length;

    const totalXP = safeSessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0);
    const avgXPPerSession = totalSessions > 0 ? Math.round(totalXP / totalSessions) : 0;

    return {
      avgDuration: avgSessionDuration,
      recentActivity: last7DaysSessions,
      avgXP: avgXPPerSession,
      totalHours: (totalTimeMinutes / 60).toFixed(1)
    };
  }, [sessions, totalSessions, totalTimeMinutes]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white backdrop-blur-md p-4 rounded-xl shadow-xl border border-gray-300">
          <p className="font-bold text-black mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm mb-1">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-800 capitalize">{entry.name}:</span>
              <span className="font-bold text-black">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!sessions || sessions.length === 0) {
    return (
      <div className="bg-white backdrop-blur-xl rounded-3xl border border-gray-300 p-12 text-center">
        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-300">
          <BarChart3 className="w-10 h-10 text-gray-400" />
        </div>
        <h3 className="text-xl font-bold text-black mb-2">
          No Analytics Yet
        </h3>
        <p className="text-gray-700 max-w-md mx-auto">
          Complete your first session to start tracking your progress and unlock detailed insights!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard 
          icon={Clock} 
          label="Avg Duration" 
          value={`${stats.avgDuration}m`} 
          subtext="per session"
          color="purple"
          delay={0}
        />
        <StatsCard 
          icon={Activity} 
          label="Last 7 Days" 
          value={stats.recentActivity} 
          subtext="sessions completed"
          color="pink"
          delay={0.1}
        />
        <StatsCard 
          icon={Zap} 
          label="Avg XP" 
          value={stats.avgXP} 
          subtext="per session"
          color="blue"
          delay={0.2}
        />
        <StatsCard 
          icon={Calendar} 
          label="Total Time" 
          value={`${stats.totalHours}h`} 
          subtext="learning time"
          color="green"
          delay={0.3}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Activity Chart */}
        <ChartCard title="Daily Activity" icon={TrendingUp} delay={0.4}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.purple} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.purple} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#ffffff60"
                tick={{ fontSize: 12, fill: '#ffffff60' }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#ffffff60" 
                tick={{ fontSize: 12, fill: '#ffffff60' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ stroke: COLORS.purple, strokeWidth: 1, strokeDasharray: '4 4' }} />
              <Area
                type="monotone"
                dataKey="sessions"
                stroke={COLORS.purple}
                fill="url(#colorSessions)"
                strokeWidth={3}
                activeDot={{ r: 6, strokeWidth: 0, fill: COLORS.purple }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* XP Progress Chart */}
        <ChartCard title="XP Earned This Week" icon={Target} delay={0.5}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#ffffff60"
                tick={{ fontSize: 12, fill: '#ffffff60' }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#ffffff60" 
                tick={{ fontSize: 12, fill: '#ffffff60' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Bar dataKey="xp" fill={COLORS.pink} radius={[6, 6, 0, 0]} barSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Session Modes Distribution */}
        <ChartCard title="Session Types" icon={PieChartIcon} delay={0.6}>
          <div className="flex items-center justify-center h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.modes}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.modes.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-sm text-gray-800 ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Communication Volume Chart */}
        <ChartCard title="Communication Volume" icon={MessageSquare} delay={0.65}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
              <XAxis 
                dataKey="date" 
                stroke="#ffffff60"
                tick={{ fontSize: 12, fill: '#ffffff60' }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                yAxisId="left"
                stroke="#ffffff60" 
                tick={{ fontSize: 12, fill: '#ffffff60' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                yAxisId="right"
                orientation="right"
                stroke="#ffffff60" 
                tick={{ fontSize: 12, fill: '#ffffff60' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
              <Legend verticalAlign="top" height={36} />
              <Bar yAxisId="left" dataKey="words" name="Words Spoken" fill={COLORS.blue} radius={[4, 4, 0, 0]} barSize={20} />
              <Bar yAxisId="right" dataKey="messages" name="Messages Sent" fill={COLORS.orange} radius={[4, 4, 0, 0]} barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Monthly Progress */}
        <ChartCard title="Weekly Progress" icon={BarChart3} delay={0.7}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#00000010" vertical={false} />
              <XAxis 
                dataKey="week" 
                stroke="#00000060"
                tick={{ fontSize: 12, fill: '#00000060' }}
                tickLine={false}
                axisLine={false}
                dy={10}
              />
              <YAxis 
                stroke="#00000060" 
                tick={{ fontSize: 12, fill: '#00000060' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke={COLORS.green}
                strokeWidth={3}
                dot={{ fill: COLORS.green, r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: COLORS.green }}
              />
              <Line
                type="monotone"
                dataKey="xp"
                name="XP Earned"
                stroke={COLORS.blue}
                strokeWidth={3}
                dot={{ fill: COLORS.blue, r: 4, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 6, strokeWidth: 0, fill: COLORS.blue }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Recent Team Chats */}
        <RecentChatsCard delay={0.8} />
      </div>
    </div>
  );
}

function RecentChatsCard({ delay }) {
  const recentMessages = useQuery(api.messages.getRecent, { limit: 5 });

  // Enhanced Demo Data for Chats (Fallback)
  const demoChats = [
    {
      id: 1,
      user: "Sarah Chen",
      avatar: "SC",
      color: "from-violet-500 to-fuchsia-500",
      time: "2m ago",
      message: "The mock interview session was incredibly helpful! I feel much more confident about the behavioral questions now.",
      role: "Learner"
    },
    {
      id: 2,
      user: "Marcus Johnson",
      avatar: "MJ",
      color: "from-blue-500 to-cyan-500",
      time: "15m ago",
      message: "Has anyone tried the new public speaking module? The pacing feedback is spot on.",
      role: "Learner"
    },
    {
      id: 3,
      user: "AI Coach",
      avatar: "AI",
      color: "from-emerald-500 to-teal-500",
      time: "1h ago",
      message: "Great progress on your pronunciation exercises, Alex! Your clarity score has improved by 15%.",
      role: "Coach"
    },
    {
      id: 4,
      user: "Emily Davis",
      avatar: "ED",
      color: "from-orange-500 to-red-500",
      time: "2h ago",
      message: "Looking for a partner to practice debate topics this evening. Anyone interested?",
      role: "Learner"
    }
  ];

  const chats = (recentMessages && recentMessages.length > 0) 
    ? recentMessages.map((msg, index) => ({
        id: msg._id,
        user: msg.userName || 'Anonymous',
        avatar: (msg.userName || 'AN').substring(0, 2).toUpperCase(),
        color: ["from-violet-500 to-fuchsia-500", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-orange-500 to-red-500"][index % 4],
        time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        message: msg.content,
        role: msg.type === 'transcript' ? 'Transcript' : 'User'
      }))
    : demoChats;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="col-span-1 lg:col-span-2 bg-white backdrop-blur-xl rounded-3xl border border-gray-300 shadow-sm p-6 hover:bg-white transition-all"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-violet-100 rounded-lg border border-violet-200">
            <MessageSquare className="w-5 h-5 text-violet-600" />
          </div>
          <h3 className="text-lg font-bold text-black">
            Recent Community Activity
          </h3>
        </div>
        <span className="text-xs font-medium px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          Live
        </span>
      </div>
      
      <div className="space-y-4">
        {chats.map((chat) => (
          <div key={chat.id} className="flex items-start gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-gray-100 transition-colors group">
            <div className={`w-10 h-10 rounded-full bg-linear-to-br ${chat.color} flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:scale-110 transition-transform`}>
              {chat.avatar}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-gray-900">{chat.user}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                    chat.role === 'Coach' || chat.role === 'Transcript' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-200 text-gray-600'
                  }`}>
                    {chat.role}
                  </span>
                </div>
                <span className="text-[10px] text-gray-500 font-medium">{chat.time}</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {chat.message}
              </p>
            </div>
          </div>
        ))}
        <div className="text-center pt-4">
          <button className="text-sm text-violet-600 font-bold hover:text-violet-700 hover:underline transition-all">
            View All Discussions
          </button>
        </div>
      </div>
    </motion.div>
  );
}

function StatsCard({ icon: Icon, label, value, subtext, color, delay }) {
  const colors = {
    purple: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    pink: "bg-pink-500/10 text-pink-400 border-pink-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className={`p-6 rounded-2xl border ${colors[color].split(' ').filter(c => c.startsWith('border')).join(' ')} bg-white backdrop-blur-md shadow-sm hover:bg-white transition-all`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-xl ${colors[color].split(' ').filter(c => !c.startsWith('border')).join(' ')}`}>
          <Icon className="w-5 h-5" />
        </div>
        <span className="text-sm font-medium text-gray-800">{label}</span>
      </div>
      <p className="text-3xl font-bold text-black tracking-tight">{value}</p>
      <p className="text-xs text-gray-700 mt-1 font-medium">{subtext}</p>
    </motion.div>
  );
}

function ChartCard({ title, icon: Icon, children, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white backdrop-blur-xl rounded-3xl border border-gray-300 shadow-sm p-6 hover:bg-white transition-all"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-white rounded-lg border border-gray-300">
          <Icon className="w-5 h-5 text-gray-800" />
        </div>
        <h3 className="text-lg font-bold text-black">
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  );
}

