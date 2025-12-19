'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, Brain, Target, Zap, Calendar, Clock, Award,
  BarChart3, PieChart, LineChart, Activity, Flame, Star, Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart as RechartsPie,
  Pie,
  Cell,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useRecommendationsStore, useAIInsights, useLearningProfile } from '@/lib/aiRecommendations';

/**
 * Personalized Analytics Dashboard
 * AI-powered insights and learning analytics
 * Modernized with glassmorphism and advanced animations
 */

export default function PersonalizedAnalytics() {
  const insights = useAIInsights();
  const profile = useLearningProfile();
  const interactions = useRecommendationsStore(state => state.interactions);
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h2 className="text-3xl font-bold text-black flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-xl border border-violet-500/30 backdrop-blur-sm">
              <Brain className="w-8 h-8 text-violet-400" />
            </div>
            AI-Powered Analytics
          </h2>
          <p className="text-gray-800 mt-2 ml-1">
            Deep dive into your learning patterns and performance
          </p>
        </div>
        <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-violet-500/10 rounded-full border border-violet-500/20 backdrop-blur-sm">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium text-violet-300">
            AI Analysis Active
          </span>
        </div>
      </motion.div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          icon={<Flame className="w-6 h-6" />}
          label="Current Streak"
          value={`${profile.streak} days`}
          color="orange"
          delay={0.1}
        />
        <StatCard
          icon={<Star className="w-6 h-6" />}
          label="Total XP"
          value={profile.totalXP.toLocaleString()}
          color="yellow"
          delay={0.2}
        />
        <StatCard
          icon={<TrendingUp className="w-6 h-6" />}
          label="Level"
          value={profile.level}
          color="purple"
          delay={0.3}
        />
        <StatCard
          icon={<Target className="w-6 h-6" />}
          label="Mastered Topics"
          value={profile.masteredTopics.length}
          color="green"
          delay={0.4}
        />
      </div>
      
      {/* AI Insights */}
      <AIInsightsSection insights={insights} />
      
      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PerformanceTrendChart interactions={interactions} />
        <TopicDistributionChart interactions={interactions} />
      </div>
      
      {/* Skill Radar & Learning Patterns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SkillRadarChart profile={profile} interactions={interactions} />
        <div className="space-y-6">
          <LearningPatternsSection insights={insights} />
          <TimeAnalysisChart interactions={interactions} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, color, delay }) {
  const colors = {
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    yellow: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    purple: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    green: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`p-6 rounded-2xl border ${colors[color].split(' ').filter(c => c.startsWith('border')).join(' ')} bg-white backdrop-blur-xl shadow-sm hover:shadow-md transition-all`}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className={`p-2.5 rounded-xl ${colors[color].split(' ').filter(c => !c.startsWith('border')).join(' ')}`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-gray-700">{label}</span>
      </div>
      <p className="text-2xl font-bold text-black tracking-tight">{value}</p>
    </motion.div>
  );
}

function AIInsightsSection({ insights }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-2">
        <Brain className="w-6 h-6 text-violet-400" />
        <h3 className="text-xl font-bold text-black">AI Insights</h3>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <InsightCard
          title="Your Strengths"
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          items={insights.strengths}
          color="green"
        />
        
        {/* Areas to Improve */}
        <InsightCard
          title="Areas to Improve"
          icon={<Target className="w-5 h-5 text-orange-400" />}
          items={insights.weaknesses}
          color="orange"
        />
      </div>
      
      {/* Predictions */}
      {insights.predictions.length > 0 && (
        <motion.div 
          whileHover={{ scale: 1.01 }}
          className="p-6 bg-linear-to-br from-violet-500/10 to-indigo-500/10 rounded-2xl border border-violet-500/20 shadow-sm backdrop-blur-xl"
        >
          <h4 className="font-bold mb-4 flex items-center gap-2 text-violet-300">
            <Zap className="w-5 h-5 text-violet-400" />
            AI Predictions
          </h4>
          <div className="space-y-4">
            {insights.predictions.map((pred, index) => (
              <div key={index} className="flex items-start gap-4 bg-white p-4 rounded-xl border border-gray-300">
                <div className="w-2 h-2 bg-violet-500 rounded-full mt-2.5 shrink-0 shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                <div className="flex-1">
                  <p className="font-medium text-black mb-2">{pred.message}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pred.confidence * 100}%` }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full bg-linear-to-r from-violet-500 to-indigo-500"
                      />
                    </div>
                    <span className="text-xs font-medium text-violet-400 whitespace-nowrap">
                      {Math.round(pred.confidence * 100)}% confident
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

function InsightCard({ title, icon, items, color }) {
  const colorClasses = {
    green: {
      bg: 'bg-emerald-500/5',
      border: 'border-emerald-500/20',
      text: 'text-emerald-400',
      dot: 'bg-emerald-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]'
    },
    orange: {
      bg: 'bg-orange-500/5',
      border: 'border-orange-500/20',
      text: 'text-orange-400',
      dot: 'bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]'
    },
  };
  
  const classes = colorClasses[color];
  
  return (
    <motion.div 
      whileHover={{ y: -2 }}
      className={`p-6 ${classes.bg} rounded-2xl border ${classes.border} shadow-sm backdrop-blur-xl`}
    >
      <h4 className={`font-bold mb-4 flex items-center gap-2 ${classes.text}`}>
        {icon}
        {title}
      </h4>
      {items.length > 0 ? (
        <ul className="space-y-3">
          {items.slice(0, 3).map((item, index) => (
            <li key={index} className="flex items-start gap-3 bg-white p-3 rounded-xl border border-gray-300">
              <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${classes.dot}`} />
              <div className="flex-1">
                <p className="text-sm font-medium text-black">{item.message}</p>
                {item.suggestion && (
                  <p className="text-xs text-gray-800 mt-1.5 flex items-center gap-1">
                    <span className="text-yellow-400">💡</span> {item.suggestion}
                  </p>
                )}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-center py-8 text-gray-700 bg-white rounded-xl border border-dashed border-gray-300">
          <p className="text-sm">Keep learning to unlock insights!</p>
        </div>
      )}
    </motion.div>
  );
}

function PerformanceTrendChart({ interactions }) {
  // Prepare data: Last 7 days performance
  const last7Days = [];
  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    
    const dayInteractions = interactions.filter(int =>
      int.timestamp.startsWith(dateStr)
    );
    
    const successCount = dayInteractions.filter(int => int.success).length;
    const totalCount = dayInteractions.length;
    
    last7Days.push({
      date: date.toLocaleDateString('en-US', { weekday: 'short' }),
      successRate: totalCount > 0 ? (successCount / totalCount) * 100 : 0,
      sessions: totalCount,
      xp: dayInteractions.reduce((acc, int) => acc + (int.xpEarned || 0), 0),
    });
  }
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.6 }}
      className="p-6 bg-white backdrop-blur-xl rounded-3xl border border-gray-300 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-violet-500/20 rounded-lg border border-violet-500/30">
          <Activity className="w-5 h-5 text-violet-400" />
        </div>
        <h3 className="text-lg font-bold text-black">
          7-Day Performance Trend
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={last7Days} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis 
            dataKey="date" 
            stroke="#9ca3af"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#9ca3af" 
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              border: '1px solid #374151',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
              color: '#f3f4f6',
            }}
            itemStyle={{ color: '#f3f4f6' }}
            labelStyle={{ color: '#9ca3af' }}
          />
          <Area
            type="monotone"
            dataKey="successRate"
            stroke="#10b981"
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorSuccess)"
            name="Success Rate %"
            activeDot={{ r: 6, strokeWidth: 0, fill: '#10b981' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function TopicDistributionChart({ interactions }) {
  // Count interactions per topic
  const topicCounts = {};
  interactions.forEach(int => {
    if (int.topic) {
      topicCounts[int.topic] = (topicCounts[int.topic] || 0) + 1;
    }
  });
  
  const data = Object.entries(topicCounts).map(([topic, count]) => ({
    name: topic.charAt(0).toUpperCase() + topic.slice(1),
    value: count,
  }));
  
  const COLORS = ['#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#ef4444', '#14b8a6'];
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.7 }}
      className="p-6 bg-white backdrop-blur-xl rounded-3xl border border-gray-300 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-pink-500/20 rounded-lg border border-pink-500/30">
          <PieChart className="w-5 h-5 text-pink-400" />
        </div>
        <h3 className="text-lg font-bold text-black">
          Topic Distribution
        </h3>
      </div>
      {data.length > 0 ? (
        <ResponsiveContainer width="100%" height={300}>
          <RechartsPie>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={100}
              paddingAngle={5}
              dataKey="value"
              stroke="none"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: '#1f2937',
                borderRadius: '12px',
                border: '1px solid #374151',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
                color: '#f3f4f6'
              }}
              itemStyle={{ color: '#f3f4f6' }}
            />
            <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ color: '#9ca3af' }} />
          </RechartsPie>
        </ResponsiveContainer>
      ) : (
        <div className="h-[300px] flex flex-col items-center justify-center text-gray-400 bg-white rounded-2xl border border-dashed border-gray-300">
          <PieChart className="w-12 h-12 mb-3 opacity-20" />
          <p>No topic data yet</p>
        </div>
      )}
    </motion.div>
  );
}

function SkillRadarChart({ profile, interactions }) {
  const allTopics = ['communication', 'leadership', 'time-management', 'problem-solving', 'creativity'];
  
  const data = allTopics.map(topic => {
    const topicInteractions = interactions.filter(int => int.topic === topic);
    const successRate = topicInteractions.length > 0
      ? (topicInteractions.filter(int => int.success).length / topicInteractions.length) * 100
      : 0;
    
    return {
      subject: topic.charAt(0).toUpperCase() + topic.slice(1),
      score: Math.round(successRate),
      fullMark: 100,
    };
  });
  
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: 0.8 }}
      className="p-6 bg-white backdrop-blur-xl rounded-3xl border border-gray-300 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-500/20 rounded-lg border border-blue-500/30">
          <Target className="w-5 h-5 text-blue-400" />
        </div>
        <h3 className="text-lg font-bold text-black">
          Skill Proficiency Radar
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="#374151" />
          <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 12 }} />
          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
          <Radar
            name="Proficiency"
            dataKey="score"
            stroke="#8b5cf6"
            strokeWidth={3}
            fill="#8b5cf6"
            fillOpacity={0.3}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1f2937',
              borderRadius: '12px',
              border: '1px solid #374151',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
              color: '#f3f4f6'
            }}
            itemStyle={{ color: '#f3f4f6' }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

function LearningPatternsSection({ insights }) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.9 }}
      className="p-6 bg-white backdrop-blur-xl rounded-3xl border border-gray-300 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/20 rounded-lg border border-indigo-500/30">
          <BarChart3 className="w-5 h-5 text-indigo-400" />
        </div>
        <h3 className="text-lg font-bold text-black">
          Learning Patterns
        </h3>
      </div>
      {insights.patterns.length > 0 ? (
        <div className="space-y-4">
          {insights.patterns.map((pattern, index) => (
            <div key={index} className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-indigo-500 rounded-xl flex items-center justify-center text-black font-bold shadow-lg shadow-indigo-500/20 shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-black mb-1">{pattern.message}</p>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 bg-white rounded-md text-xs font-medium text-indigo-600 border border-indigo-200">
                      {pattern.type}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-700 bg-white rounded-2xl border border-dashed border-gray-300">
          <p>Complete more sessions to discover your learning patterns</p>
        </div>
      )}
    </motion.div>
  );
}

function TimeAnalysisChart({ interactions }) {
  const timeDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  
  interactions.forEach(int => {
    const hour = new Date(int.timestamp).getHours();
    if (hour < 12) timeDistribution.morning++;
    else if (hour < 17) timeDistribution.afternoon++;
    else if (hour < 21) timeDistribution.evening++;
    else timeDistribution.night++;
  });
  
  const data = [
    { time: 'Morning', sessions: timeDistribution.morning },
    { time: 'Afternoon', sessions: timeDistribution.afternoon },
    { time: 'Evening', sessions: timeDistribution.evening },
    { time: 'Night', sessions: timeDistribution.night },
  ];
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1.0 }}
      className="p-6 bg-white backdrop-blur-xl rounded-3xl border border-gray-300 shadow-sm"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-teal-500/20 rounded-lg border border-teal-500/30">
          <Clock className="w-5 h-5 text-teal-400" />
        </div>
        <h3 className="text-lg font-bold text-black">
          Time of Day Analysis
        </h3>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#9ca3af"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
            dy={10}
          />
          <YAxis 
            stroke="#9ca3af" 
            tick={{ fontSize: 12, fill: '#9ca3af' }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#1f2937',
              borderRadius: '12px',
              border: '1px solid #374151',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.5)',
              color: '#f3f4f6'
            }}
            cursor={{ fill: 'rgba(255,255,255,0.05)' }}
            itemStyle={{ color: '#f3f4f6' }}
          />
          <Bar dataKey="sessions" fill="#8b5cf6" radius={[8, 8, 0, 0]} barSize={40}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={['#f59e0b', '#ef4444', '#8b5cf6', '#3b82f6'][index]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  );
}

