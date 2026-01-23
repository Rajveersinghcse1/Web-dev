import { useAuth } from '../context/AuthContext';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { ProfileView } from './ProfileView';
import { ContactUs } from './ContactUs';
import { AdminPanel } from './AdminPanel';
import { 
  Trophy, 
  Target, 
  Clock, 
  TrendingUp,
  BookOpen,
  ChevronRight,
  LogOut,
  User,
  BarChart3,
  History,
  UserCircle,
  Activity,
  Search,
  Filter,
  Download,
  Calendar,
  Zap,
  Flame,
  Star,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  LineChart,
  Bell,
  Menu,
  Phone,
  Briefcase
} from 'lucide-react';

interface DashboardProps {
  onStartTest: () => void;
}

// Line Chart - "Am I getting better over time?"
function ImprovementLineChart({ testHistory }: { testHistory: any[] | undefined }) {
  if (!testHistory || testHistory.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-4">
          <LineChart className="w-5 h-5 text-blue-600" />
          <div>
            <h3 className="font-bold text-gray-900">Performance Over Time</h3>
            <p className="text-xs text-gray-500 italic">"Am I getting better over time?"</p>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No test data available yet</p>
        </div>
      </motion.div>
    );
  }

  const recentTests = testHistory.slice(-15);
  const avgScore = Math.round(recentTests.reduce((sum, t) => sum + t.percentage, 0) / recentTests.length);
  
  // Calculate trend
  const firstHalf = recentTests.slice(0, Math.floor(recentTests.length / 2));
  const secondHalf = recentTests.slice(Math.floor(recentTests.length / 2));
  const firstAvg = firstHalf.reduce((sum, t) => sum + t.percentage, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((sum, t) => sum + t.percentage, 0) / secondHalf.length;
  const trend = secondAvg - firstAvg;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <LineChart className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Performance Over Time</h3>
            <p className="text-xs text-gray-500 italic">"Am I getting better over time?"</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-blue-600">{avgScore}%</p>
          <p className={`text-xs font-semibold flex items-center gap-1 ${trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {trend >= 0 ? <TrendingUp className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {trend >= 0 ? '+' : ''}{Math.round(trend)}% trend
          </p>
        </div>
      </div>

      {/* Line Chart Visualization */}
      <div className="h-48 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-gray-500 pr-2">
          <span>100%</span>
          <span>75%</span>
          <span>50%</span>
          <span>25%</span>
          <span>0%</span>
        </div>

        {/* Chart area */}
        <div className="ml-8 h-full relative border-l border-b border-gray-200">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((val) => (
            <div
              key={val}
              className="absolute w-full border-t border-gray-100"
              style={{ bottom: `${val}%` }}
            />
          ))}

          {/* Line path */}
          <svg className="absolute inset-0 w-full h-full" style={{ overflow: 'visible' }}>
            <defs>
              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" />
                <stop offset="100%" stopColor="#8b5cf6" />
              </linearGradient>
            </defs>
            {/* Draw line connecting points */}
            <polyline
              points={recentTests.map((test, i) => {
                const x = (i / (recentTests.length - 1)) * 100;
                const y = 100 - test.percentage;
                return `${x}%,${y}%`;
              }).join(' ')}
              fill="none"
              stroke="url(#lineGradient)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Draw points */}
            {recentTests.map((test, i) => {
              const x = (i / (recentTests.length - 1)) * 100;
              const y = 100 - test.percentage;
              return (
                <g key={i}>
                  <circle
                    cx={`${x}%`}
                    cy={`${y}%`}
                    r="4"
                    fill="white"
                    stroke={test.percentage >= 70 ? '#10b981' : test.percentage >= 50 ? '#f59e0b' : '#ef4444'}
                    strokeWidth="3"
                    className="hover:r-6 transition-all cursor-pointer"
                  />
                </g>
              );
            })}
          </svg>

          {/* Data points with hover */}
          {recentTests.map((test, i) => {
            const x = (i / (recentTests.length - 1)) * 100;
            const y = 100 - test.percentage;
            return (
              <div
                key={i}
                className="absolute group cursor-pointer"
                style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', zIndex: 10 }}
              >
                <div className="w-3 h-3 rounded-full bg-transparent" />
                <div className="opacity-0 group-hover:opacity-100 absolute bottom-8 left-1/2 transform -translate-x-1/2 transition-all duration-200 pointer-events-none z-50">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-2xl border border-gray-700">
                    <div className="font-bold text-sm">{test.percentage}%</div>
                    <div className="text-gray-200 font-medium">{test.subject}</div>
                    <div className="text-gray-400 text-[10px] mt-0.5">Test #{i + 1}</div>
                  </div>
                  <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                    <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* X-axis labels */}
        <div className="ml-8 mt-2 flex justify-between text-xs text-gray-500">
          <span>Start</span>
          <span>Recent</span>
        </div>
      </div>
    </motion.div>
  );
}

// Radar Chart - "Which skills do I need to work on?"
function SkillsRadarChart({ testHistory }: { testHistory: any[] | undefined }) {
  if (!testHistory || testHistory.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-purple-600" />
          <div>
            <h3 className="font-bold text-gray-900">Skills Analysis</h3>
            <p className="text-xs text-gray-500 italic">"Which skills do I need to work on?"</p>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No test data available yet</p>
        </div>
      </motion.div>
    );
  }

  // Calculate subject performance
  const subjectStats = testHistory.reduce((acc: any, test) => {
    if (!acc[test.subject]) {
      acc[test.subject] = { total: 0, count: 0 };
    }
    acc[test.subject].total += test.percentage;
    acc[test.subject].count++;
    return acc;
  }, {});

  const subjects = Object.entries(subjectStats)
    .map(([subject, stats]: [string, any]) => ({
      subject,
      score: Math.round(stats.total / stats.count),
      tests: stats.count
    }))
    .slice(0, 6); // Limit to 6 subjects for radar

  const angleStep = (2 * Math.PI) / subjects.length;
  const center = 100;
  const maxRadius = 85;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
          <Target className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Skills Analysis</h3>
          <p className="text-xs text-gray-500 italic">"Which skills do I need to work on?"</p>
        </div>
      </div>

      <div className="flex items-center justify-center">
        <svg width="240" height="240" viewBox="0 0 200 200">
          <defs>
            <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#a855f7" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#ec4899" stopOpacity="0.3" />
            </linearGradient>
          </defs>

          {/* Background circles */}
          {[25, 50, 75, 100].map((percent) => (
            <circle
              key={percent}
              cx={center}
              cy={center}
              r={(percent / 100) * maxRadius}
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="1"
            />
          ))}

          {/* Axis lines */}
          {subjects.map((_, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const x = center + Math.cos(angle) * maxRadius;
            const y = center + Math.sin(angle) * maxRadius;
            return (
              <line
                key={i}
                x1={center}
                y1={center}
                x2={x}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
            );
          })}

          {/* Data polygon */}
          <polygon
            points={subjects.map((subject, i) => {
              const angle = i * angleStep - Math.PI / 2;
              const radius = (subject.score / 100) * maxRadius;
              const x = center + Math.cos(angle) * radius;
              const y = center + Math.sin(angle) * radius;
              return `${x},${y}`;
            }).join(' ')}
            fill="url(#radarGradient)"
            stroke="#a855f7"
            strokeWidth="2"
          />

          {/* Data points */}
          {subjects.map((subject, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const radius = (subject.score / 100) * maxRadius;
            const x = center + Math.cos(angle) * radius;
            const y = center + Math.sin(angle) * radius;
            return (
              <circle
                key={i}
                cx={x}
                cy={y}
                r="5"
                fill="#a855f7"
                stroke="white"
                strokeWidth="2"
              />
            );
          })}

          {/* Labels */}
          {subjects.map((subject, i) => {
            const angle = i * angleStep - Math.PI / 2;
            const labelRadius = maxRadius + 25;
            const x = center + Math.cos(angle) * labelRadius;
            const y = center + Math.sin(angle) * labelRadius;
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-xs font-semibold fill-gray-700"
              >
                {subject.subject.slice(0, 8)}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-2 gap-2">
        {subjects.map((subject, i) => (
          <div key={i} className="flex items-center justify-between text-xs bg-gray-50 rounded-lg px-3 py-2">
            <span className="font-medium text-gray-700">{subject.subject}</span>
            <span className={`font-bold ${subject.score >= 70 ? 'text-green-600' : subject.score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
              {subject.score}%
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// Histogram - "Where do I stand compared to the class?"
function ClassComparisonHistogram({ testHistory, userStats }: { testHistory: any[] | undefined, userStats: any }) {
  if (!testHistory || testHistory.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="font-bold text-gray-900">Class Comparison</h3>
            <p className="text-xs text-gray-500 italic">"Where do I stand compared to the class?"</p>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No test data available yet</p>
        </div>
      </motion.div>
    );
  }

  const userAvgScore = userStats?.averageScore || 0;
  
  // Create distribution bins (0-20, 20-40, 40-60, 60-80, 80-100)
  const bins = [
    { range: '0-20%', min: 0, max: 20, count: 0, color: 'bg-red-500' },
    { range: '20-40%', min: 20, max: 40, count: 0, color: 'bg-orange-500' },
    { range: '40-60%', min: 40, max: 60, count: 0, color: 'bg-yellow-500' },
    { range: '60-80%', min: 60, max: 80, count: 0, color: 'bg-lime-500' },
    { range: '80-100%', min: 80, max: 100, count: 0, color: 'bg-green-500' },
  ];

  testHistory.forEach(test => {
    const bin = bins.find(b => test.percentage >= b.min && test.percentage < b.max);
    if (bin) bin.count++;
    else if (test.percentage === 100) bins[4].count++; // Handle 100%
  });

  const maxCount = Math.max(...bins.map(b => b.count), 1);
  const userBin = bins.find(b => userAvgScore >= b.min && userAvgScore < b.max) || bins[4];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg">
            <BarChart3 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Score Distribution</h3>
            <p className="text-xs text-gray-500 italic">"Where do I stand compared to the class?"</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-emerald-600">{userAvgScore}%</p>
          <p className="text-xs text-gray-500">Your Average</p>
        </div>
      </div>

      <div className="h-48 flex items-end justify-between gap-3 px-2">
        {bins.map((bin, index) => {
          const height = (bin.count / maxCount) * 100;
          const isUserBin = bin === userBin;
          return (
            <div key={index} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full relative group cursor-pointer">
                {/* Bar */}
                <div className="w-full bg-gray-100 rounded-t-xl relative" style={{ height: `${Math.max(height * 1.4, 20)}px` }}>
                  <div 
                    className={`w-full h-full ${bin.color} rounded-t-xl transition-all duration-300 ${isUserBin ? 'ring-4 ring-blue-500 ring-offset-2 shadow-lg' : 'hover:opacity-90'}`}
                  />
                  {/* Count label */}
                  <div className="absolute -top-7 left-1/2 transform -translate-x-1/2">
                    <span className="text-sm font-bold text-gray-900">{bin.count}</span>
                  </div>
                  {/* Tooltip */}
                  <div className="absolute -top-24 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-50">
                    <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-2xl border border-gray-700">
                      <div className="font-bold text-sm">{bin.count} tests</div>
                      <div className="text-gray-200 font-medium">{bin.range}</div>
                      {isUserBin && <div className="text-blue-300 text-[10px] mt-1">← Your range</div>}
                    </div>
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="w-0 h-0 border-l-4 border-l-transparent border-r-4 border-r-transparent border-t-4 border-t-gray-900" />
                    </div>
                  </div>
                </div>
                {/* User indicator */}
                {isUserBin && (
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                    <div className="flex items-center gap-1 bg-blue-500 text-white px-2 py-1 rounded-full text-[10px] font-bold whitespace-nowrap shadow-md">
                      <User className="w-3 h-3" />
                      You
                    </div>
                  </div>
                )}
              </div>
              {/* Range label */}
              <span className="text-[10px] font-semibold text-gray-600 mt-2">{bin.range}</span>
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-8 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="text-xs text-gray-600">
          <span className="font-semibold">Total Tests:</span> {testHistory.length}
        </div>
        <div className="text-xs">
          <span className={`font-bold ${userAvgScore >= 60 ? 'text-green-600' : 'text-orange-600'}`}>
            {userAvgScore >= 80 ? 'Top Performer! 🏆' : userAvgScore >= 60 ? 'Above Average! 💪' : 'Room for Growth 📈'}
          </span>
        </div>
      </div>
    </motion.div>
  );
}

// Bullet Graph - "Did I hit my goal?"
function GoalBulletGraph({ testHistory, userStats }: { testHistory: any[] | undefined, userStats: any }) {
  if (!testHistory || testHistory.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg"
      >
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="w-5 h-5 text-amber-600" />
          <div>
            <h3 className="font-bold text-gray-900">Goal Progress</h3>
            <p className="text-xs text-gray-500 italic">"Did I hit my goal?"</p>
          </div>
        </div>
        <div className="h-48 flex items-center justify-center">
          <p className="text-gray-400 text-sm">No test data available yet</p>
        </div>
      </motion.div>
    );
  }

  const goals = [
    { 
      label: 'Average Score', 
      current: userStats?.averageScore || 0, 
      target: 80, 
      poor: 50, 
      satisfactory: 70,
      icon: Trophy,
      color: 'amber'
    },
    { 
      label: 'Accuracy Rate', 
      current: userStats?.accuracy || 0, 
      target: 85, 
      poor: 60, 
      satisfactory: 75,
      icon: Target,
      color: 'blue'
    },
    { 
      label: 'Tests Completed', 
      current: userStats?.totalTests || 0, 
      target: 50, 
      poor: 15, 
      satisfactory: 30,
      icon: BookOpen,
      color: 'purple'
    },
    { 
      label: 'Questions Solved', 
      current: userStats?.totalQuestions || 0, 
      target: 1000, 
      poor: 300, 
      satisfactory: 600,
      icon: CheckCircle2,
      color: 'green'
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="bg-white rounded-xl p-6 border border-gray-100 shadow-lg"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl flex items-center justify-center shadow-lg">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h3 className="font-bold text-gray-900 text-lg">Goal Progress</h3>
          <p className="text-xs text-gray-500 italic">"Did I hit my goal?"</p>
        </div>
      </div>

      <div className="space-y-4">
        {goals.map((goal, index) => {
          const Icon = goal.icon;
          const percentage = Math.min((goal.current / goal.target) * 100, 100);
          const poorPercentage = (goal.poor / goal.target) * 100;
          const satisfactoryPercentage = (goal.satisfactory / goal.target) * 100;
          const achieved = goal.current >= goal.target;

          return (
            <div key={index} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon className={`w-4 h-4 text-${goal.color}-600`} />
                  <span className="text-sm font-semibold text-gray-700">{goal.label}</span>
                </div>
                <div className="text-right">
                  <span className="text-lg font-bold text-gray-900">{goal.current}</span>
                  <span className="text-xs text-gray-500"> / {goal.target}</span>
                </div>
              </div>

              {/* Bullet Graph */}
              <div className="relative h-6">
                {/* Background ranges */}
                <div className="absolute inset-0 flex rounded-lg overflow-hidden">
                  <div className="bg-red-200" style={{ width: `${poorPercentage}%` }} />
                  <div className="bg-yellow-200" style={{ width: `${satisfactoryPercentage - poorPercentage}%` }} />
                  <div className="bg-green-200" style={{ width: `${100 - satisfactoryPercentage}%` }} />
                </div>

                {/* Current value bar */}
                <div className="absolute inset-y-1 left-0 right-auto">
                  <div 
                    className={`h-full rounded-lg ${
                      percentage >= 100 ? 'bg-green-600' :
                      percentage >= satisfactoryPercentage ? 'bg-yellow-600' :
                      'bg-red-600'
                    } transition-all duration-500 shadow-lg`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                {/* Target marker */}
                <div className="absolute inset-y-0 right-0 w-1 bg-gray-800" />
              </div>

              {/* Status */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-500">
                  {percentage < poorPercentage ? 'Needs Improvement' :
                   percentage < satisfactoryPercentage ? 'Making Progress' :
                   percentage < 100 ? 'Almost There!' : 'Goal Achieved! 🎉'}
                </span>
                <span className={`font-bold ${achieved ? 'text-green-600' : 'text-gray-600'}`}>
                  {Math.round(percentage)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Overall Summary */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-700">Overall Progress</span>
          <span className="text-lg font-bold text-gray-900">
            {goals.filter(g => g.current >= g.target).length} / {goals.length} Goals
          </span>
        </div>
      </div>
    </motion.div>
  );
}

interface DashboardProps {
  onStartTest: () => void;
}

export function Dashboard({ onStartTest }: DashboardProps) {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recent-tests'>('dashboard');
  const [showProfile, setShowProfile] = useState(false);
  const [showContactUs, setShowContactUs] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  // @ts-ignore - Used in resize handler
  const [isResizing, setIsResizing] = useState(false);
  
  // User's Convex ID is already available from auth context
  // Get user stats directly using the user id
  const userStats = useQuery(api.users.getUserStats, 
    user?.id ? { userId: user.id } : "skip"
  );
  
  // Get test history
  const testHistory = useQuery(api.testResults.getTestHistory, 
    user?.id ? { userId: user.id } : "skip"
  );

  const stats = [
    { 
      label: 'Tests Completed', 
      value: userStats?.totalTests || 0, 
      icon: BookOpen, 
      color: 'from-blue-500 to-indigo-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Questions Solved', 
      value: userStats?.totalQuestions || 0, 
      icon: Target, 
      color: 'from-emerald-500 to-teal-600',
      bgColor: 'bg-emerald-50'
    },
    { 
      label: 'Accuracy', 
      value: `${userStats?.accuracy || 0}%`, 
      icon: TrendingUp, 
      color: 'from-purple-500 to-pink-600',
      bgColor: 'bg-purple-50'
    },
    { 
      label: 'Avg Score', 
      value: `${userStats?.averageScore || 0}%`, 
      icon: Trophy, 
      color: 'from-orange-500 to-red-500',
      bgColor: 'bg-orange-50'
    },
  ];

  if (showProfile) {
    return <ProfileView 
      onClose={() => setShowProfile(false)} 
      onNavigate={(view) => {
        setShowProfile(false);
        if (view === 'contact') setShowContactUs(true);
        if (view === 'admin') setShowAdmin(true);
        if (view === 'dashboard') {
          setActiveTab('dashboard');
          setShowProfile(false);
          setShowContactUs(false);
          setShowAdmin(false);
        }
      }}
    />;
  }

  if (showContactUs) {
    return <ContactUs 
      onClose={() => setShowContactUs(false)} 
      onNavigate={(view) => {
        setShowContactUs(false);
        if (view === 'profile') setShowProfile(true);
        if (view === 'admin') setShowAdmin(true);
        if (view === 'dashboard') {
          setActiveTab('dashboard');
          setShowProfile(false);
          setShowContactUs(false);
          setShowAdmin(false);
        }
      }}
    />;
  }

  if (showAdmin) {
    return <AdminPanel 
      onNavigate={(view) => {
        setShowAdmin(false);
        if (view === 'profile') setShowProfile(true);
        if (view === 'contact') setShowContactUs(true);
        if (view === 'dashboard') {
          setActiveTab('dashboard');
          setShowProfile(false);
          setShowContactUs(false);
          setShowAdmin(false);
        }
      }}
    />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-emerald-50/20 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/3 w-200 h-200 bg-gradient-to-br from-emerald-400/15 via-teal-400/10 to-cyan-400/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/3 w-200 h-200 bg-gradient-to-tr from-purple-400/10 via-pink-400/5 to-rose-400/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: 'linear-gradient(to right, #80808008 1px, transparent 1px), linear-gradient(to bottom, #80808008 1px, transparent 1px)',
            backgroundSize: '64px 64px'
          }}
        ></div>
      </div>

      <header className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side - Menu Button & FP Free Prep Dashboard */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              
              {!sidebarOpen && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <span className="text-white font-bold text-lg">FP</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Free Prep</h1>
                    <p className="text-[10px] text-gray-500 -mt-1">Dashboard</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Side - Start Test, Notifications, Profile */}
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onStartTest}
                className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-emerald-300/50 transition-all flex items-center gap-2 text-sm"
              >
                Start New Test
                <ChevronRight className="w-4 h-4" />
              </motion.button>
              
              {/* Notification Button */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2.5 hover:bg-gray-100 rounded-lg transition-colors group"
                >
                  <Bell className="w-5 h-5 text-gray-700 group-hover:text-emerald-600 transition-colors" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>
                
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">New Feature Available!</p>
                            <p className="text-xs text-gray-600 mt-1">Check out the new analytics dashboard</p>
                            <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                          </div>
                        </div>
                      </div>
                      <div className="p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-gray-300 rounded-full mt-2" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Test Reminder</p>
                            <p className="text-xs text-gray-600 mt-1">You haven't taken a test in 3 days</p>
                            <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Profile Section */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-bold text-gray-900">
                    {user?.name || 'User'}
                  </p>
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3 text-gray-500" />
                    <p className="text-xs text-gray-500">Student</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Resizable Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -sidebarWidth,
          opacity: sidebarOpen ? 1 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 bottom-0 bg-white shadow-2xl z-50 flex"
        style={{ 
          width: `${sidebarWidth}px`,
          pointerEvents: sidebarOpen ? 'auto' : 'none'
        }}
      >
            <div className="flex-1 flex flex-col overflow-hidden">
              {/* Sidebar Header */}
              <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                      <span className="text-white font-bold text-lg">FP</span>
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-gray-900">Free Prep</h1>
                      <p className="text-[10px] text-gray-500 -mt-1">Dashboard</p>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:border-emerald-500 transition-colors shadow-sm">
                      <ChevronRight className="w-4 h-4 rotate-180" />
                    </div>
                    <span className="text-sm font-semibold">Back</span>
                  </button>
                </div>
              </div>

              {/* Sidebar Content */}
              <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setShowProfile(true);
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-50 transition-colors group"
                  >
                    <UserCircle className="w-5 h-5 text-gray-600 group-hover:text-emerald-600\" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-600\">My Profile</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowContactUs(true);
                      setSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-50 transition-colors group"
                  >
                    <Phone className="w-5 h-5 text-gray-600 group-hover:text-emerald-600" />
                    <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-600">Contact Us</span>
                  </button>

                  <div className="pt-4 border-t border-gray-200 mt-4">
                    <button
                      onClick={() => setActiveTab('dashboard')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'dashboard' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <Activity className="w-5 h-5" />
                      <span className="text-sm font-medium">Dashboard</span>
                    </button>

                    <button
                      onClick={() => setActiveTab('recent-tests')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'recent-tests' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <History className="w-5 h-5" />
                      <span className="text-sm font-medium">Recent Tests</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className="p-4 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={signOut}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            </div>

            {/* Resize Handle */}
            <div
              className="w-1 hover:w-2 bg-gray-200 hover:bg-emerald-500 cursor-col-resize transition-all"
              onMouseDown={(e) => {
                e.preventDefault();
                setIsResizing(true);
                
                const handleMouseMove = (moveEvent: MouseEvent) => {
                  const newWidth = moveEvent.clientX;
                  if (newWidth >= 200 && newWidth <= 400) {
                    setSidebarWidth(newWidth);
                  }
                };

                const handleMouseUp = () => {
                  setIsResizing(false);
                  document.removeEventListener('mousemove', handleMouseMove);
                  document.removeEventListener('mouseup', handleMouseUp);
                };

                document.addEventListener('mousemove', handleMouseMove);
                document.addEventListener('mouseup', handleMouseUp);
              }}
            />
        </motion.div>

        {/* Main Content Wrapper with dynamic margin */}
        <div 
          className="transition-all duration-300 ease-in-out"
          style={{ 
            marginLeft: sidebarOpen ? `${sidebarWidth}px` : '0px'
          }}
        >
          {/* Navigation Tabs */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="border-b border-gray-200 mb-4">
              <nav className="flex gap-6">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'dashboard'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Dashboard
              </div>
            </button>
            <button
              onClick={() => setActiveTab('recent-tests')}
              className={`pb-3 px-2 text-sm font-semibold border-b-2 transition-colors ${
                activeTab === 'recent-tests'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Recent Tests
              </div>
            </button>
              </nav>
            </div>
          </div>

          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 relative z-10">
            {activeTab === 'dashboard' && (
          <div>
            {/* Welcome Section */}
            <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-4"
        >
          <h2 className="text-2xl font-extrabold text-gray-900 mb-1">
            Welcome back, <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-500 to-teal-600">{user?.name || 'there'}</span>! 👋
          </h2>
          <p className="text-gray-600 text-sm">Track your learning journey with comprehensive analytics.</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {stats.map((stat, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5, scale: 1.02 }}
              className="relative group"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-xl blur opacity-0 group-hover:opacity-100 transition" />
              <div className="relative bg-white rounded-xl p-4 border border-gray-100 hover:border-emerald-200 transition-all duration-300 shadow-md">
                <div className={`w-10 h-10 rounded-lg ${stat.bgColor} flex items-center justify-center mb-2 shadow-sm`}>
                  <stat.icon className={`w-5 h-5 bg-gradient-to-r ${stat.color} bg-clip-text text-transparent`} style={{ color: stat.color.includes('blue') ? '#3b82f6' : stat.color.includes('emerald') ? '#10b981' : stat.color.includes('purple') ? '#8b5cf6' : '#f97316' }} />
                </div>
                <p className="text-2xl font-bold text-gray-900 mb-0.5">{stat.value}</p>
                <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* New Chart Layout - 4 Key Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Line Chart - Performance Over Time */}
          <ImprovementLineChart testHistory={testHistory} />
          
          {/* Radar Chart - Skills Analysis */}
          <SkillsRadarChart testHistory={testHistory} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          {/* Histogram - Class Comparison */}
          <ClassComparisonHistogram testHistory={testHistory} userStats={userStats} />
          
          {/* Bullet Graph - Goal Progress */}
          <GoalBulletGraph testHistory={testHistory} userStats={userStats} />
        </div>
          </div>
        )}

        {/* Recent Tests Tab */}
        {activeTab === 'recent-tests' && (
          <RecentTestsView testHistory={testHistory} />
        )}
        </main>
      </div>
    </div>
  );
}

// Recent Tests Component
function RecentTestsView({ testHistory }: { testHistory: any[] | undefined }) {
  const [selectedTest, setSelectedTest] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSubject, setFilterSubject] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recent' | 'score' | 'questions'>('recent');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Get unique subjects for filter
  const subjects = testHistory ? Array.from(new Set(testHistory.map(t => t.subject))) : [];

  // Filter and sort tests
  const filteredTests = testHistory ? testHistory
    .filter(test => {
      const matchesSearch = test.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSubject = filterSubject === 'all' || test.subject === filterSubject;
      return matchesSearch && matchesSubject;
    })
    .sort((a, b) => {
      if (sortBy === 'recent') return b.createdAt - a.createdAt;
      if (sortBy === 'score') return b.percentage - a.percentage;
      if (sortBy === 'questions') return b.totalQuestions - a.totalQuestions;
      return 0;
    }) : [];

  // Calculate analytics
  const analytics = testHistory && testHistory.length > 0 ? {
    totalTests: testHistory.length,
    avgScore: Math.round(testHistory.reduce((sum, t) => sum + t.percentage, 0) / testHistory.length),
    bestScore: Math.max(...testHistory.map(t => t.percentage)),
    totalQuestions: testHistory.reduce((sum, t) => sum + t.totalQuestions, 0),
    totalCorrect: testHistory.reduce((sum, t) => sum + t.correct, 0),
    recentStreak: calculateStreak(testHistory),
    improvementRate: calculateImprovement(testHistory)
  } : null;

  function calculateStreak(tests: any[]) {
    if (!tests || tests.length === 0) return 0;
    const sorted = [...tests].sort((a, b) => b.createdAt - a.createdAt);
    let streak = 0;
    for (const test of sorted) {
      if (test.percentage >= 70) streak++;
      else break;
    }
    return streak;
  }

  function calculateImprovement(tests: any[]) {
    if (!tests || tests.length < 2) return 0;
    const sorted = [...tests].sort((a, b) => a.createdAt - b.createdAt);
    const firstHalf = sorted.slice(0, Math.floor(sorted.length / 2));
    const secondHalf = sorted.slice(Math.floor(sorted.length / 2));
    const avgFirst = firstHalf.reduce((sum, t) => sum + t.percentage, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((sum, t) => sum + t.percentage, 0) / secondHalf.length;
    return Math.round(avgSecond - avgFirst);
  }

  if (selectedTest) {
    return (
      <div className="space-y-4">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => setSelectedTest(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-emerald-600 transition-colors group"
        >
          <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:border-emerald-500 transition-colors">
            <ChevronRight className="w-4 h-4 rotate-180" />
          </div>
          <span className="text-sm font-bold">Back to all tests</span>
        </motion.button>

        {/* Test Details Header Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-2xl shadow-2xl shadow-emerald-200 overflow-hidden"
        >
          <div className="p-6 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <h2 className="text-2xl font-bold">{selectedTest.subject}</h2>
                  </div>
                  <p className="text-emerald-100 text-sm flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    {formatDate(selectedTest.createdAt)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-6xl font-black mb-1">{selectedTest.percentage}%</div>
                  <div className="flex items-center gap-1 justify-end">
                    {selectedTest.percentage >= 70 ? (
                      <><CheckCircle2 className="w-4 h-4" />
                      <span className="text-sm font-semibold">Excellent</span></>
                    ) : selectedTest.percentage >= 50 ? (
                      <><AlertCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">Good</span></>
                    ) : (
                      <><XCircle className="w-4 h-4" />
                      <span className="text-sm font-semibold">Needs Work</span></>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-3">
                <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                  <CheckCircle2 className="w-5 h-5 mx-auto mb-1 text-emerald-200" />
                  <p className="text-2xl font-bold">{selectedTest.correct}</p>
                  <p className="text-xs text-emerald-100">Correct</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                  <XCircle className="w-5 h-5 mx-auto mb-1 text-red-200" />
                  <p className="text-2xl font-bold">{selectedTest.incorrect}</p>
                  <p className="text-xs text-emerald-100">Wrong</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                  <AlertCircle className="w-5 h-5 mx-auto mb-1 text-yellow-200" />
                  <p className="text-2xl font-bold">{selectedTest.unanswered}</p>
                  <p className="text-xs text-emerald-100">Skipped</p>
                </div>
                <div className="bg-white/10 backdrop-blur rounded-xl p-3 text-center">
                  <Target className="w-5 h-5 mx-auto mb-1 text-blue-200" />
                  <p className="text-2xl font-bold">{selectedTest.totalQuestions}</p>
                  <p className="text-xs text-emerald-100">Total</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

            {/* Question Analysis */}
            {selectedTest.questionAnalysis && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden"
              >
                <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-yellow-500" />
                    Detailed Analysis
                  </h3>
                </div>
                
                <div className="p-4">
                  {/* Topic-wise breakdown if available */}
                  {selectedTest.topicAnalysis && selectedTest.topicAnalysis.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-blue-600" />
                        Topic-wise Performance
                      </h4>
                      <div className="grid md:grid-cols-2 gap-3">
                        {selectedTest.topicAnalysis.map((topic: any, idx: number) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div>
                                <p className="text-sm font-bold text-gray-800">{topic.topicName}</p>
                                <p className="text-xs text-gray-600">
                                  {topic.questionsAttempted} questions attempted
                                </p>
                              </div>
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold ${
                                topic.accuracy >= 70 ? 'bg-emerald-500 text-white' :
                                topic.accuracy >= 50 ? 'bg-yellow-500 text-white' :
                                'bg-red-500 text-white'
                              }`}>
                                {topic.accuracy}%
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex-1 h-2 bg-white rounded-full overflow-hidden">
                                <div
                                  className={`h-full ${
                                    topic.accuracy >= 70 ? 'bg-emerald-500' :
                                    topic.accuracy >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${topic.accuracy}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium text-gray-700">
                                {topic.correct}/{topic.questionsAttempted}
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Question by Question */}
                  <div>
                    <h4 className="font-bold text-sm text-gray-800 mb-3 flex items-center gap-2">
                      <History className="w-4 h-4 text-purple-600" />
                      Question by Question
                    </h4>
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                      {selectedTest.questionAnalysis.map((q: any, index: number) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className={`relative rounded-xl border-2 overflow-hidden ${
                            !q.userAnswer ? 'border-gray-300 bg-gray-50' :
                            q.isCorrect ? 'border-emerald-300 bg-emerald-50' :
                            'border-red-300 bg-red-50'
                          }`}
                        >
                          {/* Status badge */}
                          <div className={`absolute top-0 right-0 px-3 py-1 text-xs font-bold rounded-bl-xl ${
                            !q.userAnswer ? 'bg-gray-500 text-white' :
                            q.isCorrect ? 'bg-emerald-500 text-white' :
                            'bg-red-500 text-white'
                          }`}>
                            {!q.userAnswer ? '⏭️ Skipped' : q.isCorrect ? '✅ Correct' : '❌ Wrong'}
                          </div>

                          <div className="p-4 pt-10">
                            <div className="flex items-start gap-3 mb-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${
                                !q.userAnswer ? 'bg-gray-200 text-gray-700' :
                                q.isCorrect ? 'bg-emerald-200 text-emerald-700' :
                                'bg-red-200 text-red-700'
                              }`}>
                                {index + 1}
                              </div>
                              <p className="flex-1 text-sm text-gray-800 font-medium leading-relaxed">
                                {q.question}
                              </p>
                            </div>

                            <div className="grid md:grid-cols-2 gap-3 ml-11">
                              <div className={`p-3 rounded-lg ${
                                q.userAnswer ? 'bg-white border-2' : 'bg-gray-100 border-2 border-dashed'
                              } ${
                                q.isCorrect ? 'border-emerald-400' :
                                q.userAnswer && !q.isCorrect ? 'border-red-400' : 'border-gray-300'
                              }`}>
                                <p className="text-xs font-semibold text-gray-600 mb-1">Your Answer</p>
                                <p className={`text-sm font-bold ${
                                  q.isCorrect ? 'text-emerald-700' :
                                  q.userAnswer ? 'text-red-700' : 'text-gray-500'
                                }`}>
                                  {q.userAnswer || 'Not answered'}
                                </p>
                              </div>

                              <div className="p-3 rounded-lg bg-emerald-100 border-2 border-emerald-400">
                                <p className="text-xs font-semibold text-emerald-700 mb-1">Correct Answer</p>
                                <p className="text-sm font-bold text-emerald-800">{q.correctAnswer}</p>
                              </div>
                            </div>

                            {q.timeTaken && (
                              <div className="mt-3 ml-11 flex items-center gap-2 text-xs text-gray-600">
                                <Clock className="w-3 h-3" />
                                <span>Time taken: <strong>{q.timeTaken}s</strong></span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Analytics Cards */}
      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white shadow-lg shadow-blue-200 relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 opacity-20">
              <BookOpen className="w-24 h-24" />
            </div>
            <div className="relative">
              <p className="text-blue-100 text-xs font-medium mb-1">Total Tests</p>
              <p className="text-3xl font-bold">{analytics.totalTests}</p>
              <p className="text-blue-100 text-xs mt-1">All time</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-4 text-white shadow-lg shadow-emerald-200 relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 opacity-20">
              <TrendingUp className="w-24 h-24" />
            </div>
            <div className="relative">
              <p className="text-emerald-100 text-xs font-medium mb-1">Avg Score</p>
              <p className="text-3xl font-bold">{analytics.avgScore}%</p>
              <div className="flex items-center gap-1 mt-1">
                {analytics.improvementRate > 0 ? (
                  <><ArrowUpRight className="w-3 h-3 text-emerald-100" />
                  <span className="text-emerald-100 text-xs">+{analytics.improvementRate}% growth</span></>
                ) : analytics.improvementRate < 0 ? (
                  <><ArrowDownRight className="w-3 h-3 text-emerald-100" />
                  <span className="text-emerald-100 text-xs">{analytics.improvementRate}% change</span></>
                ) : (
                  <span className="text-emerald-100 text-xs">Stable</span>
                )}
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white shadow-lg shadow-purple-200 relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 opacity-20">
              <Trophy className="w-24 h-24" />
            </div>
            <div className="relative">
              <p className="text-purple-100 text-xs font-medium mb-1">Best Score</p>
              <p className="text-3xl font-bold">{analytics.bestScore}%</p>
              <p className="text-purple-100 text-xs mt-1">Personal record</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white shadow-lg shadow-orange-200 relative overflow-hidden"
          >
            <div className="absolute -right-4 -top-4 opacity-20">
              <Flame className="w-24 h-24" />
            </div>
            <div className="relative">
              <p className="text-orange-100 text-xs font-medium mb-1">Streak</p>
              <p className="text-3xl font-bold">{analytics.recentStreak}</p>
              <p className="text-orange-100 text-xs mt-1">Tests above 70%</p>
            </div>
          </motion.div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Tests List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
            {/* Enhanced Header with Search and Filters */}
            <div className="p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-500" />
                    All Tests
                  </h2>
                  <p className="text-xs text-gray-600">
                    {filteredTests.length} {filteredTests.length === 1 ? 'test' : 'tests'} found
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title={viewMode === 'list' ? 'Grid view' : 'List view'}
                  >
                    <BarChart3 className="w-4 h-4 text-gray-600" />
                  </button>
                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Export data"
                  >
                    <Download className="w-4 h-4 text-gray-600" />
                  </button>
                </div>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-gray-500" />
                  <select
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="all">All Subjects</option>
                    {subjects.map(subject => (
                      <option key={subject} value={subject}>{subject}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="text-xs border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="score">Highest Score</option>
                    <option value="questions">Most Questions</option>
                  </select>
                </div>
              </div>
            </div>
            
            {filteredTests && filteredTests.length > 0 ? (
              <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 gap-3 p-4' : 'divide-y divide-gray-100'}>
                {filteredTests.map((test, index) => (
                  viewMode === 'grid' ? (
                    // Grid View Card
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedTest(test)}
                      className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-xl p-4 cursor-pointer hover:shadow-lg hover:border-emerald-300 transition-all group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors text-sm mb-1">
                            {test.subject}
                          </h3>
                          <p className="text-xs text-gray-500">
                            {formatDate(test.createdAt)}
                          </p>
                        </div>
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                          test.percentage >= 70 ? 'bg-emerald-100 text-emerald-600' :
                          test.percentage >= 50 ? 'bg-yellow-100 text-yellow-600' :
                          'bg-red-100 text-red-600'
                        }`}>
                          {test.percentage}
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 mb-3">
                        <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                          <p className="text-lg font-bold text-emerald-600">{test.correct}</p>
                          <p className="text-[10px] text-gray-500">Correct</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                          <p className="text-lg font-bold text-red-600">{test.incorrect}</p>
                          <p className="text-[10px] text-gray-500">Wrong</p>
                        </div>
                        <div className="bg-white rounded-lg p-2 text-center border border-gray-100">
                          <p className="text-lg font-bold text-gray-600">{test.totalQuestions}</p>
                          <p className="text-[10px] text-gray-500">Total</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1">
                          {test.percentage >= 70 && <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />}
                          <span className="text-xs font-medium text-gray-600">
                            {test.percentage >= 70 ? 'Excellent!' : test.percentage >= 50 ? 'Good job' : 'Keep going'}
                          </span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                      </div>
                    </motion.div>
                  ) : (
                    // List View
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => setSelectedTest(test)}
                      className="p-4 hover:bg-gradient-to-r hover:from-emerald-50/50 hover:to-teal-50/50 transition-all cursor-pointer group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors">
                              {test.subject}
                            </h3>
                            {test.percentage >= 70 && (
                              <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded-full text-[10px] font-bold flex items-center gap-1">
                                <Star className="w-3 h-3 fill-yellow-500" />
                                Top Score
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <BookOpen className="w-3 h-3" />
                              {test.totalQuestions} questions
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(test.createdAt)}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex items-center gap-4">
                          <div className="flex items-center gap-2">
                            <div className="text-center">
                              <p className="text-[10px] text-gray-500 mb-0.5">Correct</p>
                              <p className="text-sm font-bold text-emerald-600">{test.correct}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-[10px] text-gray-500 mb-0.5">Wrong</p>
                              <p className="text-sm font-bold text-red-600">{test.incorrect}</p>
                            </div>
                          </div>
                          <div className="text-center min-w-[60px]">
                            <p className={`text-2xl font-bold ${
                              test.percentage >= 70 ? 'text-emerald-600' :
                              test.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'
                            }`}>
                              {test.percentage}%
                            </p>
                          </div>
                          <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                        </div>
                      </div>
                    </motion.div>
                  )
                ))}
              </div>
            ) : (
              <div className="p-12 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-700 font-bold mb-1">No tests found</p>
                <p className="text-xs text-gray-500">
                  {searchQuery || filterSubject !== 'all' 
                    ? 'Try adjusting your filters or search query'
                    : 'Start your first test to see results here'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
