'use client';

import { useMemo, useState, useRef } from 'react';
import { useAnalyticsStore, useProgressStore } from '@/store';
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { motion, AnimatePresence } from 'framer-motion';
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  Target,
  Calendar,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Zap,
  Award,
  MessageSquare,
  Users,
  Download,
  FileText,
  Flame,
  Brain,
  Sparkles,
  ChevronDown,
  Filter,
  RefreshCw
} from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import Papa from 'papaparse';

// Modern color palette
const COLORS = {
  primary: '#8B5CF6',
  secondary: '#EC4899',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
  danger: '#EF4444',
  violet: '#8B5CF6',
  pink: '#EC4899',
  blue: '#3B82F6',
  green: '#10B981',
  orange: '#F97316',
  teal: '#14B8A6',
  indigo: '#6366F1',
  cyan: '#06B6D4'
};

const CHART_COLORS = [
  COLORS.violet,
  COLORS.pink,
  COLORS.blue,
  COLORS.green,
  COLORS.orange,
  COLORS.teal,
  COLORS.indigo,
  COLORS.cyan
];

// Date range options
const DATE_RANGES = [
  { id: '7d', label: '7 Days' },
  { id: '30d', label: '30 Days' },
  { id: '90d', label: '90 Days' },
  { id: 'all', label: 'All Time' }
];

export default function AnalyticsDashboard() {
  const dashboardRef = useRef(null);
  const [dateRange, setDateRange] = useState('30d');
  const [isExporting, setIsExporting] = useState(false);

  const sessions = useAnalyticsStore(state => state.sessionHistory);
  const totalSessions = useProgressStore(state => state.totalSessions);
  const totalTimeMinutes = useProgressStore(state => state.totalTimeMinutes);
  const currentStreak = useProgressStore(state => state.currentStreak) || 0;

  // Generate demo data if no real sessions exist
  const demoSessions = useMemo(() => {
    if (sessions && sessions.length > 0) return sessions;

    return Array.from({ length: 45 }).map((_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - Math.floor(Math.random() * 90));
      return {
        id: `demo-${i}`,
        timestamp: date.toISOString(),
        duration: 5 + Math.floor(Math.random() * 35),
        xpEarned: 50 + Math.floor(Math.random() * 150),
        mode: ['Public Speaking', 'Interview Prep', 'Debate', 'Casual Chat', 'Leadership', 'Problem Solving'][Math.floor(Math.random() * 6)],
        success: Math.random() > 0.2,
        messageCount: 10 + Math.floor(Math.random() * 40),
        wordsSpoken: 100 + Math.floor(Math.random() * 600)
      };
    });
  }, [sessions]);

  // Filter sessions by date range
  const filteredSessions = useMemo(() => {
    const now = Date.now();
    const ranges = {
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000,
      '90d': 90 * 24 * 60 * 60 * 1000,
      'all': Infinity
    };
    const range = ranges[dateRange];

    return demoSessions.filter(s => {
      const sessionTime = new Date(s.timestamp).getTime();
      return (now - sessionTime) <= range;
    });
  }, [demoSessions, dateRange]);

  // Calculate statistics
  const stats = useMemo(() => {
    const sessionsCount = filteredSessions.length;
    const totalTime = filteredSessions.reduce((sum, s) => sum + (s.duration || 0), 0);
    const totalXP = filteredSessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0);
    const avgDuration = sessionsCount > 0 ? Math.round(totalTime / sessionsCount) : 0;
    const successRate = sessionsCount > 0
      ? Math.round((filteredSessions.filter(s => s.success).length / sessionsCount) * 100)
      : 0;

    // Calculate previous period for comparison
    const now = Date.now();
    const ranges = { '7d': 7, '30d': 30, '90d': 90, 'all': 365 };
    const days = ranges[dateRange];
    const prevStart = now - (days * 2 * 24 * 60 * 60 * 1000);
    const prevEnd = now - (days * 24 * 60 * 60 * 1000);

    const prevSessions = demoSessions.filter(s => {
      const t = new Date(s.timestamp).getTime();
      return t >= prevStart && t <= prevEnd;
    });

    const prevSessionsCount = prevSessions.length;
    const prevTotalXP = prevSessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0);
    const prevTotalTime = prevSessions.reduce((sum, s) => sum + (s.duration || 0), 0);

    return {
      sessions: sessionsCount,
      sessionsTrend: prevSessionsCount > 0 ? Math.round(((sessionsCount - prevSessionsCount) / prevSessionsCount) * 100) : 0,
      totalTime,
      timeTrend: prevTotalTime > 0 ? Math.round(((totalTime - prevTotalTime) / prevTotalTime) * 100) : 0,
      totalXP,
      xpTrend: prevTotalXP > 0 ? Math.round(((totalXP - prevTotalXP) / prevTotalXP) * 100) : 0,
      avgDuration,
      successRate,
      streak: currentStreak
    };
  }, [filteredSessions, demoSessions, dateRange, currentStreak]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : dateRange === '90d' ? 90 : 365;

    // Daily activity
    const dailyData = Array.from({ length: Math.min(days, 30) }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (Math.min(days, 30) - 1 - i));
      const dateStr = date.toISOString().split('T')[0];

      const daySessions = filteredSessions.filter(s => {
        const sessionDate = new Date(s.timestamp).toISOString().split('T')[0];
        return sessionDate === dateStr;
      });

      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sessions: daySessions.length,
        xp: daySessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0),
        minutes: daySessions.reduce((sum, s) => sum + (s.duration || 0), 0)
      };
    });

    // Session modes distribution
    const modeStats = {};
    filteredSessions.forEach(session => {
      const mode = session.mode || 'Unknown';
      if (!modeStats[mode]) modeStats[mode] = { count: 0, time: 0, xp: 0 };
      modeStats[mode].count += 1;
      modeStats[mode].time += session.duration || 0;
      modeStats[mode].xp += session.xpEarned || 0;
    });

    const modeData = Object.entries(modeStats).map(([mode, stats]) => ({
      name: mode,
      value: stats.count,
      time: stats.time,
      xp: stats.xp
    }));

    // Skills data for radar
    const skillsData = [
      { skill: 'Communication', value: 75 + Math.random() * 20 },
      { skill: 'Leadership', value: 60 + Math.random() * 25 },
      { skill: 'Problem Solving', value: 70 + Math.random() * 20 },
      { skill: 'Time Mgmt', value: 65 + Math.random() * 25 },
      { skill: 'Creativity', value: 55 + Math.random() * 30 }
    ].map(s => ({ ...s, value: Math.round(s.value), fullMark: 100 }));

    // Weekly comparison
    const weeklyData = Array.from({ length: 4 }, (_, i) => {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (3 - i) * 7);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);

      const weekSessions = filteredSessions.filter(s => {
        const t = new Date(s.timestamp).getTime();
        return t >= weekStart.getTime() && t < weekEnd.getTime();
      });

      return {
        week: `Week ${i + 1}`,
        sessions: weekSessions.length,
        xp: weekSessions.reduce((sum, s) => sum + (s.xpEarned || 0), 0),
        time: weekSessions.reduce((sum, s) => sum + (s.duration || 0), 0)
      };
    });

    return { daily: dailyData, modes: modeData, skills: skillsData, weekly: weeklyData };
  }, [filteredSessions, dateRange]);

  // Activity heatmap data (last 52 weeks)
  const heatmapData = useMemo(() => {
    const weeks = [];
    const today = new Date();
    const dayOfWeek = today.getDay();

    for (let week = 51; week >= 0; week--) {
      const weekData = [];
      for (let day = 0; day < 7; day++) {
        const date = new Date(today);
        date.setDate(date.getDate() - (week * 7) - (dayOfWeek - day));
        const dateStr = date.toISOString().split('T')[0];

        const count = demoSessions.filter(s => {
          const sessionDate = new Date(s.timestamp).toISOString().split('T')[0];
          return sessionDate === dateStr;
        }).length;

        weekData.push({
          date: dateStr,
          count,
          dayName: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][day]
        });
      }
      weeks.push(weekData);
    }
    return weeks;
  }, [demoSessions]);

  // Export functions
  const exportToCSV = () => {
    const data = filteredSessions.map(s => ({
      Date: new Date(s.timestamp).toLocaleDateString(),
      Mode: s.mode,
      Duration: s.duration,
      XP: s.xpEarned,
      Messages: s.messageCount,
      Words: s.wordsSpoken,
      Success: s.success ? 'Yes' : 'No'
    }));

    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `analytics_${dateRange}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const exportToPDF = async () => {
    if (!dashboardRef.current) return;
    setIsExporting(true);

    try {
      const canvas = await html2canvas(dashboardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`analytics_report_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    }

    setIsExporting(false);
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl p-4 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
          <p className="font-bold text-gray-900 dark:text-white mb-2">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center gap-2 text-sm mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
              <span className="text-gray-600 dark:text-gray-300 capitalize">{entry.name}:</span>
              <span className="font-bold text-gray-900 dark:text-white">{entry.value.toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  // Empty state with preview
  if (!sessions || sessions.length === 0) {
    return (
      <div className="space-y-8" ref={dashboardRef}>
        {/* Header with controls */}
        <DashboardHeader
          dateRange={dateRange}
          setDateRange={setDateRange}
          onExportCSV={exportToCSV}
          onExportPDF={exportToPDF}
          isExporting={isExporting}
        />

        {/* Empty State with Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          {/* Skeleton Preview */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-6 opacity-30 blur-[2px]">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-32 bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/30 dark:to-purple-900/30 rounded-2xl animate-pulse" />
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-6 opacity-30 blur-[2px]">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="h-[300px] bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-3xl animate-pulse" />
              ))}
            </div>
          </div>

          {/* Main CTA Card */}
          <div className="relative z-10 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-gray-700 p-12 text-center shadow-2xl">
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="w-24 h-24 bg-gradient-to-br from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-violet-500/30"
            >
              <BarChart3 className="w-12 h-12 text-white" />
            </motion.div>

            <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Your Analytics Journey Starts Here
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto text-lg mb-8">
              Complete your first coaching session to unlock powerful insights, track your progress, and visualize your growth over time.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
              <div className="flex items-center gap-2 px-4 py-2 bg-violet-50 dark:bg-violet-900/30 rounded-full">
                <Activity className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                <span className="text-sm font-medium text-violet-700 dark:text-violet-300">Activity Tracking</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 dark:bg-pink-900/30 rounded-full">
                <Brain className="w-4 h-4 text-pink-600 dark:text-pink-400" />
                <span className="text-sm font-medium text-pink-700 dark:text-pink-300">AI Insights</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/30 rounded-full">
                <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">Skill Radar</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-gradient-to-r from-violet-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl shadow-violet-500/30 hover:shadow-2xl hover:shadow-violet-500/40 transition-all"
              onClick={() => window.location.href = '/'}
            >
              Start Your First Session
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="space-y-8" ref={dashboardRef}>
      {/* Header with controls */}
      <DashboardHeader
        dateRange={dateRange}
        setDateRange={setDateRange}
        onExportCSV={exportToCSV}
        onExportPDF={exportToPDF}
        isExporting={isExporting}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Activity}
          label="Total Sessions"
          value={stats.sessions}
          trend={stats.sessionsTrend}
          color="violet"
          delay={0}
        />
        <StatCard
          icon={Clock}
          label="Learning Time"
          value={`${Math.round(stats.totalTime / 60)}h ${stats.totalTime % 60}m`}
          trend={stats.timeTrend}
          color="blue"
          delay={0.1}
        />
        <StatCard
          icon={Zap}
          label="XP Earned"
          value={stats.totalXP.toLocaleString()}
          trend={stats.xpTrend}
          color="green"
          delay={0.2}
        />
        <StatCard
          icon={Flame}
          label="Current Streak"
          value={`${stats.streak} days`}
          suffix={stats.streak >= 7 ? '🔥' : ''}
          color="orange"
          delay={0.3}
        />
      </div>

      {/* Activity Heatmap */}
      <ActivityHeatmap data={heatmapData} />

      {/* AI Insights Banner */}
      <AIInsightsBanner stats={stats} dateRange={dateRange} />

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Trend */}
        <ChartCard title="Performance Trend" icon={TrendingUp} delay={0.4}>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorSessions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.violet} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={COLORS.violet} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorXP" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.pink} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={COLORS.pink} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Area
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke={COLORS.violet}
                fill="url(#colorSessions)"
                strokeWidth={3}
                activeDot={{ r: 6, strokeWidth: 0, fill: COLORS.violet }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* XP Progress */}
        <ChartCard title="XP Earned" icon={Zap} delay={0.5}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData.daily} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="date"
                stroke="#9ca3af"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="xp"
                name="XP"
                fill={COLORS.pink}
                radius={[8, 8, 0, 0]}
                barSize={32}
              >
                {chartData.daily.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={`url(#barGradient)`}
                  />
                ))}
              </Bar>
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.pink} stopOpacity={1} />
                  <stop offset="100%" stopColor={COLORS.violet} stopOpacity={1} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Session Types */}
        <ChartCard title="Session Distribution" icon={PieChartIcon} delay={0.6}>
          <div className="flex items-center justify-center h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.modes}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.modes.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS[index % CHART_COLORS.length]}
                      className="drop-shadow-lg"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  iconType="circle"
                  formatter={(value) => <span className="text-sm text-gray-600 dark:text-gray-300 ml-1">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Skills Radar */}
        <ChartCard title="Skill Proficiency" icon={Target} delay={0.7}>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="75%" data={chartData.skills}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="skill" tick={{ fill: '#6b7280', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Radar
                name="Proficiency"
                dataKey="value"
                stroke={COLORS.violet}
                strokeWidth={3}
                fill={COLORS.violet}
                fillOpacity={0.3}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Weekly Comparison */}
        <ChartCard title="Weekly Progress" icon={BarChart3} delay={0.8}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.weekly} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis
                dataKey="week"
                stroke="#9ca3af"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="#9ca3af"
                tick={{ fontSize: 12, fill: '#6b7280' }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend verticalAlign="top" height={36} />
              <Line
                type="monotone"
                dataKey="sessions"
                name="Sessions"
                stroke={COLORS.blue}
                strokeWidth={3}
                dot={{ fill: COLORS.blue, r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, strokeWidth: 0, fill: COLORS.blue }}
              />
              <Line
                type="monotone"
                dataKey="xp"
                name="XP"
                stroke={COLORS.green}
                strokeWidth={3}
                dot={{ fill: COLORS.green, r: 5, strokeWidth: 2, stroke: '#fff' }}
                activeDot={{ r: 7, strokeWidth: 0, fill: COLORS.green }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Recent Activity */}
        <RecentActivityCard />
      </div>
    </div>
  );
}

// Dashboard Header Component
function DashboardHeader({ dateRange, setDateRange, onExportCSV, onExportPDF, isExporting }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-violet-500/30">
          <BarChart3 className="w-7 h-7 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track your learning progress and insights</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Date Range Filter */}
        <div className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
          {DATE_RANGES.map(range => (
            <button
              key={range.id}
              onClick={() => setDateRange(range.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${dateRange === range.id
                ? 'bg-white dark:bg-gray-700 text-violet-600 dark:text-violet-400 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        {/* Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={onExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all shadow-sm"
          >
            <FileText className="w-4 h-4" />
            CSV
          </button>
          <button
            onClick={onExportPDF}
            disabled={isExporting}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-medium hover:shadow-lg hover:shadow-violet-500/30 transition-all disabled:opacity-50"
          >
            {isExporting ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Download className="w-4 h-4" />
            )}
            PDF
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, trend, suffix = '', color, delay }) {
  const colors = {
    violet: {
      bg: 'bg-violet-50 dark:bg-violet-900/20',
      icon: 'bg-violet-100 dark:bg-violet-800/50 text-violet-600 dark:text-violet-400',
      border: 'border-violet-100 dark:border-violet-800/50'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      icon: 'bg-blue-100 dark:bg-blue-800/50 text-blue-600 dark:text-blue-400',
      border: 'border-blue-100 dark:border-blue-800/50'
    },
    green: {
      bg: 'bg-emerald-50 dark:bg-emerald-900/20',
      icon: 'bg-emerald-100 dark:bg-emerald-800/50 text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-100 dark:border-emerald-800/50'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      icon: 'bg-orange-100 dark:bg-orange-800/50 text-orange-600 dark:text-orange-400',
      border: 'border-orange-100 dark:border-orange-800/50'
    }
  };

  const colorSet = colors[color] || colors.violet;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={`relative overflow-hidden p-6 rounded-2xl ${colorSet.bg} border ${colorSet.border} backdrop-blur-xl shadow-sm hover:shadow-lg transition-all`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
            {value}{suffix}
          </p>
          {trend !== undefined && (
            <div className={`flex items-center gap-1 mt-2 text-sm font-medium ${trend > 0 ? 'text-emerald-600 dark:text-emerald-400' :
              trend < 0 ? 'text-red-600 dark:text-red-400' :
                'text-gray-500 dark:text-gray-400'
              }`}>
              {trend > 0 ? <TrendingUp className="w-4 h-4" /> :
                trend < 0 ? <TrendingDown className="w-4 h-4" /> : null}
              <span>{trend > 0 ? '+' : ''}{trend}% vs prev period</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-xl ${colorSet.icon}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </motion.div>
  );
}

// Activity Heatmap Component
function ActivityHeatmap({ data }) {
  const [hoveredCell, setHoveredCell] = useState(null);
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const getColor = (count) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count === 1) return 'bg-violet-200 dark:bg-violet-900/50';
    if (count <= 3) return 'bg-violet-400 dark:bg-violet-700';
    if (count <= 5) return 'bg-violet-500 dark:bg-violet-600';
    return 'bg-violet-600 dark:bg-violet-500';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="p-6 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-x-auto"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-violet-100 dark:bg-violet-900/50 rounded-xl">
          <Calendar className="w-5 h-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Activity Heatmap</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Your learning consistency over the past year</p>
        </div>
      </div>

      <div className="flex gap-1 min-w-max">
        {/* Day labels */}
        <div className="flex flex-col gap-1 mr-2 text-xs text-gray-400">
          <div className="h-3"></div>
          <div className="h-3">Mon</div>
          <div className="h-3"></div>
          <div className="h-3">Wed</div>
          <div className="h-3"></div>
          <div className="h-3">Fri</div>
          <div className="h-3"></div>
        </div>

        {/* Heatmap grid */}
        <div className="flex gap-1">
          {data.map((week, weekIndex) => (
            <div key={weekIndex} className="flex flex-col gap-1">
              {week.map((day, dayIndex) => (
                <div
                  key={`${weekIndex}-${dayIndex}`}
                  className={`w-3 h-3 rounded-sm ${getColor(day.count)} cursor-pointer transition-all hover:ring-2 hover:ring-violet-400 hover:ring-offset-1`}
                  onMouseEnter={() => setHoveredCell({ ...day, weekIndex, dayIndex })}
                  onMouseLeave={() => setHoveredCell(null)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
        <span className="text-xs text-gray-500 dark:text-gray-400">Less</span>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
          <div className="w-3 h-3 rounded-sm bg-violet-200 dark:bg-violet-900/50" />
          <div className="w-3 h-3 rounded-sm bg-violet-400 dark:bg-violet-700" />
          <div className="w-3 h-3 rounded-sm bg-violet-500 dark:bg-violet-600" />
          <div className="w-3 h-3 rounded-sm bg-violet-600 dark:bg-violet-500" />
        </div>
        <span className="text-xs text-gray-500 dark:text-gray-400">More</span>
      </div>

      {/* Tooltip */}
      {hoveredCell && (
        <div className="absolute z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg pointer-events-none">
          <p className="font-bold">{hoveredCell.date}</p>
          <p>{hoveredCell.count} session{hoveredCell.count !== 1 ? 's' : ''}</p>
        </div>
      )}
    </motion.div>
  );
}

// AI Insights Banner
function AIInsightsBanner({ stats, dateRange }) {
  const insights = useMemo(() => {
    const messages = [];

    if (stats.sessionsTrend > 20) {
      messages.push({ type: 'success', text: `Great momentum! Your sessions are up ${stats.sessionsTrend}% 🚀` });
    } else if (stats.sessionsTrend < -20) {
      messages.push({ type: 'warning', text: `Sessions decreased ${Math.abs(stats.sessionsTrend)}%. Let's get back on track!` });
    }

    if (stats.successRate >= 80) {
      messages.push({ type: 'success', text: `Excellent ${stats.successRate}% success rate! Keep it up! ⭐` });
    }

    if (stats.streak >= 7) {
      messages.push({ type: 'achievement', text: `Amazing ${stats.streak}-day streak! You're on fire! 🔥` });
    } else if (stats.streak > 0) {
      messages.push({ type: 'info', text: `${stats.streak}-day streak. ${7 - stats.streak} more days for a weekly milestone!` });
    }

    if (stats.xpTrend > 30) {
      messages.push({ type: 'success', text: `XP earnings surged by ${stats.xpTrend}%! Impressive growth!` });
    }

    return messages.length > 0 ? messages : [{ type: 'info', text: 'Keep learning to unlock personalized AI insights!' }];
  }, [stats]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.38 }}
      className="p-6 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 rounded-3xl border border-violet-100 dark:border-violet-800/50"
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl shadow-lg shadow-violet-500/30">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">AI Insights</h3>
            <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-800/50 text-violet-700 dark:text-violet-300 text-xs font-medium rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Live
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`px-4 py-2 rounded-xl text-sm font-medium ${insight.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300' :
                  insight.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300' :
                    insight.type === 'achievement' ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300' :
                      'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  }`}
              >
                {insight.text}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Chart Card Component
function ChartCard({ title, icon: Icon, children, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 hover:shadow-lg transition-all"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 bg-gray-100 dark:bg-gray-800 rounded-xl">
          <Icon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
      </div>
      {children}
    </motion.div>
  );
}

// Recent Activity Card
function RecentActivityCard() {
  const recentMessages = useQuery(api.messages.getRecent, { limit: 5 });

  const demoActivity = [
    { id: 1, user: "Sarah Chen", avatar: "SC", color: "from-violet-500 to-fuchsia-500", time: "2m ago", message: "Completed Interview Prep session", type: "session" },
    { id: 2, user: "Marcus Johnson", avatar: "MJ", color: "from-blue-500 to-cyan-500", time: "15m ago", message: "Earned 150 XP", type: "xp" },
    { id: 3, user: "AI Coach", avatar: "AI", color: "from-emerald-500 to-teal-500", time: "1h ago", message: "Your communication skills improved by 15%!", type: "insight" },
    { id: 4, user: "Emily Davis", avatar: "ED", color: "from-orange-500 to-red-500", time: "2h ago", message: "Achieved 7-day streak!", type: "achievement" }
  ];

  const activities = recentMessages?.length > 0
    ? recentMessages.map((msg, i) => ({
      id: msg._id,
      user: msg.userName || 'You',
      avatar: (msg.userName || 'YO').substring(0, 2).toUpperCase(),
      color: ["from-violet-500 to-fuchsia-500", "from-blue-500 to-cyan-500", "from-emerald-500 to-teal-500", "from-orange-500 to-red-500"][i % 4],
      time: new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      message: msg.content?.substring(0, 60) + (msg.content?.length > 60 ? '...' : ''),
      type: 'message'
    }))
    : demoActivity;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.9 }}
      className="col-span-1 lg:col-span-2 bg-white dark:bg-gray-900 rounded-3xl border border-gray-200 dark:border-gray-700 shadow-sm p-6"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-violet-100 dark:bg-violet-900/50 rounded-xl">
            <Activity className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Activity</h3>
        </div>
        <span className="flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      </div>

      <div className="space-y-4">
        {activities.map((activity, index) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.9 + index * 0.1 }}
            className="flex items-start gap-4 p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${activity.color} flex items-center justify-center text-white text-sm font-bold shadow-md group-hover:scale-110 transition-transform`}>
              {activity.avatar}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-sm text-gray-900 dark:text-white">{activity.user}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300 truncate">{activity.message}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <button className="w-full mt-4 py-3 text-sm font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-xl transition-all">
        View All Activity
      </button>
    </motion.div>
  );
}
