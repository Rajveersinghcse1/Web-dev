import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useMode } from '../context/ModeContext';
import { useAuth } from '../context/AuthContext';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  AreaChart,
  Area
} from 'recharts';
import {
  Trophy,
  BookOpen,
  Code,
  TrendingUp,
  Target,
  Clock,
  Award,
  Brain,
  Zap,
  Lightbulb,
  Users,
  Star,
  Calendar,
  CheckCircle,
  PlayCircle,
  BarChart3,
  GraduationCap,
  TrendingDown,
  Activity,
  BookMarked,
  FileText,
  Settings,
  Download,
  Bell,
  Search,
  Terminal,
  GitBranch,
  Cpu,
  Globe,
  Shield,
  Flame,
  Server,
  ArrowRight
} from 'lucide-react';

const DashboardPage = () => {
  const { getCurrentTheme, currentMode, userType, MODES, USER_TYPES } = useMode();
  const { user } = useAuth();
  const theme = getCurrentTheme();

  // Enhanced mock data for professional education dashboard
  const [dashboardData, setDashboardData] = useState({
    weeklyProgress: [
      { day: 'Mon', studyHours: 4.5, assignments: 3, courses: 2 },
      { day: 'Tue', studyHours: 6.2, assignments: 5, courses: 3 },
      { day: 'Wed', studyHours: 5.8, assignments: 4, courses: 2 },
      { day: 'Thu', studyHours: 7.5, assignments: 6, courses: 4 },
      { day: 'Fri', studyHours: 6.8, assignments: 5, courses: 3 },
      { day: 'Sat', studyHours: 3.2, assignments: 2, courses: 1 },
      { day: 'Sun', studyHours: 2.5, assignments: 1, courses: 1 }
    ],
    subjectProgress: [
      { name: 'Computer Science', progress: 92, totalCourses: 8, completed: 7, color: theme.primaryColor },
      { name: 'Mathematics', progress: 85, totalCourses: 6, completed: 5, color: theme.secondaryColor },
      { name: 'Physics', progress: 78, totalCourses: 5, completed: 4, color: theme.accentColor },
      { name: 'Data Structures', progress: 88, totalCourses: 7, completed: 6, color: '#8B5CF6' },
      { name: 'Algorithms', progress: 82, totalCourses: 6, completed: 5, color: '#EC4899' }
    ],
    learningPath: [
      { month: 'Sep', completed: 85, target: 100, efficiency: 85 },
      { month: 'Oct', completed: 92, target: 100, efficiency: 92 },
      { month: 'Nov', completed: 78, target: 100, efficiency: 78 },
      { month: 'Dec', completed: 96, target: 100, efficiency: 96 }
    ],
    skillDistribution: [
      { name: 'Programming', value: 35, hours: 120, color: theme.primaryColor },
      { name: 'Problem Solving', value: 25, hours: 85, color: theme.secondaryColor },
      { name: 'Theory & Concepts', value: 20, hours: 68, color: theme.accentColor },
      { name: 'Projects & Labs', value: 20, hours: 72, color: '#8B5CF6' }
    ]
  });

  const academicStats = [
    {
      title: 'Total Study Hours',
      value: '234',
      subtitle: 'This semester',
      icon: Clock,
      trend: '+15%',
      trendIcon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      comparison: 'vs last semester'
    },
    {
      title: 'Courses Completed',
      value: '12',
      subtitle: 'Out of 16',
      icon: GraduationCap,
      trend: '75%',
      trendIcon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      comparison: 'completion rate'
    },
    {
      title: 'Current GPA',
      value: '3.8',
      subtitle: 'Out of 4.0',
      icon: Trophy,
      trend: '+0.2',
      trendIcon: TrendingUp,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50',
      comparison: 'vs last semester'
    },
    {
      title: 'Learning Streak',
      value: '23',
      subtitle: 'Days active',
      icon: Flame,
      trend: '+5 days',
      trendIcon: TrendingUp,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      comparison: 'personal best'
    }
  ];

  const professionalStats = [
    {
      title: 'Global Rank',
      value: '#1,240',
      subtitle: 'Top 5%',
      icon: Globe,
      trend: '+120',
      trendIcon: TrendingUp,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      comparison: 'vs last week'
    },
    {
      title: 'Problems Solved',
      value: '342',
      subtitle: 'Total Solved',
      icon: Code,
      trend: '+12',
      trendIcon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
      comparison: 'this week'
    },
    {
      title: 'Contributions',
      value: '1,205',
      subtitle: 'Commits',
      icon: GitBranch,
      trend: '+45',
      trendIcon: TrendingUp,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      comparison: 'this month'
    },
    {
      title: 'System Status',
      value: '99.9%',
      subtitle: 'Uptime',
      icon: Server,
      trend: 'Stable',
      trendIcon: CheckCircle,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      comparison: 'all systems go'
    }
  ];

  const statsToDisplay = currentMode === MODES.STUDY ? academicStats : professionalStats;

  const recentActivities = [
    { 
      id: 1, 
      activity: 'Completed Advanced Algorithms Assignment', 
      time: '2 hours ago', 
      icon: Code, 
      type: 'success',
      course: 'CS 401',
      points: '+15 XP'
    },
    { 
      id: 2, 
      activity: 'Joined Machine Learning Study Group', 
      time: '4 hours ago', 
      icon: Users, 
      type: 'info',
      course: 'CS 350',
      points: '+5 XP'
    },
    { 
      id: 3, 
      activity: 'Submitted Database Design Project', 
      time: '1 day ago', 
      icon: BookOpen, 
      type: 'success',
      course: 'CS 320',
      points: '+25 XP'
    },
    { 
      id: 4, 
      activity: 'Started Linear Algebra Course', 
      time: '2 days ago', 
      icon: Brain, 
      type: 'info',
      course: 'MATH 220',
      points: '+10 XP'
    },
    { 
      id: 5, 
      activity: 'Achieved Programming Milestone', 
      time: '3 days ago', 
      icon: Trophy, 
      type: 'achievement',
      course: 'General',
      points: '+50 XP'
    }
  ];

  const upcomingDeadlines = [
    { 
      id: 1, 
      task: 'Data Structures Final Exam', 
      due: 'Tomorrow', 
      priority: 'high', 
      subject: 'CS 201',
      type: 'exam',
      progress: 85
    },
    { 
      id: 2, 
      task: 'Calculus Problem Set #7', 
      due: 'In 2 days', 
      priority: 'medium', 
      subject: 'MATH 150',
      type: 'assignment',
      progress: 60
    },
    { 
      id: 3, 
      task: 'Physics Lab Report', 
      due: 'In 4 days', 
      priority: 'medium', 
      subject: 'PHYS 120',
      type: 'lab',
      progress: 30
    },
    { 
      id: 4, 
      task: 'Software Engineering Project', 
      due: 'In 1 week', 
      priority: 'low', 
      subject: 'CS 301',
      type: 'project',
      progress: 45
    }
  ];

  return (
    <div className={`min-h-screen ${theme.background} pt-20 pb-12`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Enhanced Header Section */}
        <div className="mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-4 mb-3">
                <div className={`p-4 rounded-2xl bg-gradient-to-br ${theme.gradient} shadow-lg`}>
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className={`text-4xl font-extrabold ${theme.textPrimary} tracking-tight`}>
                    Welcome back, {user?.name || 'Student'}! 
                  </h1>
                  <p className="text-gray-600 text-lg mt-1 font-medium">
                    Ready to continue your {currentMode === MODES.STUDY ? 'academic' : 'professional'} journey today?
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 mt-4 ml-1">
                <div className="flex items-center gap-2 px-3 py-1 bg-green-100 rounded-full">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                  <span className="text-green-700 text-sm font-semibold">Online</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm font-medium">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button variant="outline" className="border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-gray-300 shadow-sm h-12 px-6 rounded-xl">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button className={`bg-gradient-to-r ${theme.gradient} text-white hover:opacity-90 shadow-lg hover:shadow-xl transition-all duration-300 h-12 px-6 rounded-xl`}>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statsToDisplay.map((stat, index) => (
            <div key={index} className="group relative bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
              <div className={`absolute top-0 right-0 w-32 h-32 ${stat.bg} opacity-20 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700`}></div>
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className={`p-3 rounded-2xl ${stat.bg} group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
                  <stat.trendIcon className="w-3 h-3 text-green-600" />
                  <span className="text-green-700 text-xs font-bold">{stat.trend}</span>
                </div>
              </div>
              
              <div className="space-y-1 relative z-10">
                <h3 className="text-gray-500 text-sm font-medium uppercase tracking-wide">{stat.title}</h3>
                <p className="text-gray-900 text-3xl font-extrabold tracking-tight">{stat.value}</p>
                <p className="text-gray-400 text-sm font-medium">{stat.subtitle}</p>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-50 relative z-10">
                <p className="text-gray-400 text-xs font-medium flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-gray-300 mr-2"></span>
                  {stat.comparison}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions Panel */}
        <div className="mb-10">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
            <h3 className="text-gray-900 text-xl font-bold mb-6 flex items-center">
              <Zap className="w-5 h-5 text-yellow-500 mr-2" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {[
                { icon: BookOpen, label: 'New Course', color: 'bg-blue-50 text-blue-600', hover: 'hover:bg-blue-100' },
                { icon: FileText, label: 'Assignment', color: 'bg-green-50 text-green-600', hover: 'hover:bg-green-100' },
                { icon: Users, label: 'Study Group', color: 'bg-purple-50 text-purple-600', hover: 'hover:bg-purple-100' },
                { icon: Calendar, label: 'Schedule', color: 'bg-orange-50 text-orange-600', hover: 'hover:bg-orange-100' },
                { icon: Trophy, label: 'Achievements', color: 'bg-yellow-50 text-yellow-600', hover: 'hover:bg-yellow-100' },
                { icon: Settings, label: 'Settings', color: 'bg-gray-50 text-gray-600', hover: 'hover:bg-gray-100' }
              ].map((action, index) => (
                <button key={index} className="flex flex-col items-center gap-3 p-4 rounded-2xl hover:bg-gray-50 transition-all duration-300 group border border-transparent hover:border-gray-100 hover:shadow-md">
                  <div className={`p-4 rounded-2xl ${action.color} ${action.hover} transition-colors duration-300 group-hover:scale-110 transform`}>
                    <action.icon className="w-7 h-7" />
                  </div>
                  <span className="text-gray-700 text-sm font-semibold group-hover:text-gray-900">{action.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Enhanced Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-10">
          
          {/* Weekly Activity Chart */}
          <div className="xl:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-gray-900 text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  {currentMode === MODES.STUDY ? 'Weekly Learning Progress' : 'Coding Activity'}
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  {currentMode === MODES.STUDY ? 'Study hours, assignments, and course completion' : 'Commits, code reviews, and problem solving'}
                </p>
              </div>
              <div className="flex items-center gap-4 bg-gray-50 px-4 py-2 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm"></div>
                  <span className="text-gray-700 text-xs font-semibold">{currentMode === MODES.STUDY ? 'Study Hours' : 'Commits'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500 shadow-sm"></div>
                  <span className="text-gray-700 text-xs font-semibold">{currentMode === MODES.STUDY ? 'Assignments' : 'Reviews'}</span>
                </div>
              </div>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.weeklyProgress} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="studyHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="assignments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      padding: '12px'
                    }}
                    itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="studyHours" 
                    stroke="#3B82F6" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#studyHours)" 
                  />
                  <Area 
                    type="monotone" 
                    dataKey="assignments" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#assignments)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column: Subject Mastery (Study) or Daily Challenge (Professional) */}
          {currentMode === MODES.STUDY ? (
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="mb-6">
                <h3 className="text-gray-900 text-xl font-bold flex items-center gap-2">
                  <BookMarked className="w-5 h-5 text-purple-600" />
                  Subject Mastery
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Progress across different subjects
                </p>
              </div>
              <div className="space-y-6">
                {dashboardData.subjectProgress.map((subject, index) => (
                  <div key={index} className="space-y-2 group">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700 text-sm font-semibold group-hover:text-gray-900 transition-colors">{subject.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-xs font-medium">{subject.completed}/{subject.totalCourses}</span>
                        <span className="text-gray-900 text-sm font-bold">{subject.progress}%</span>
                      </div>
                    </div>
                    <div className="relative h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${subject.progress}%`,
                          backgroundColor: subject.color
                        }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-[shimmer_2s_infinite]"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-8 p-5 bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-gray-700 text-sm font-bold">Overall Progress</span>
                  <span className="text-blue-600 text-lg font-extrabold">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-full rounded-full animate-pulse" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/10 rounded-lg backdrop-blur-sm">
                    <Terminal className="w-6 h-6 text-green-300" />
                  </div>
                  <span className="text-blue-200 font-medium tracking-wide text-sm uppercase">
                    Daily Challenge
                  </span>
                </div>
                
                <h2 className="text-2xl font-bold mb-4 leading-tight">
                  Reverse Linked List II
                </h2>
                
                <div className="flex items-center gap-2 mb-6">
                  <span className="px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-300 text-xs font-bold border border-yellow-500/30">Medium</span>
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-bold border border-blue-500/30">Linked List</span>
                </div>

                <p className="text-gray-300 mb-8 text-sm leading-relaxed">
                  Given the head of a singly linked list and two integers left and right where left &lt;= right, reverse the nodes of the list from position left to position right, and return the reversed list.
                </p>
                
                <div className="space-y-4">
                  <Button className="w-full bg-white text-gray-900 hover:bg-gray-100 border-none h-12 rounded-xl font-bold shadow-lg hover:shadow-white/20 transition-all duration-300">
                    Solve Problem
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                  
                  <div className="flex items-center justify-between text-xs text-gray-400">
                    <div className="flex -space-x-2">
                      {[1,2,3].map(i => (
                        <div key={i} className="w-6 h-6 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center">
                          {String.fromCharCode(64+i)}
                        </div>
                      ))}
                      <div className="w-6 h-6 rounded-full border-2 border-gray-800 bg-gray-700 flex items-center justify-center">
                        +42
                      </div>
                    </div>
                    <span>128 users solving now</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Learning Analytics and Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* Learning Path Analytics */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-gray-900 text-xl font-bold flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Learning Efficiency
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Monthly completion rate and learning efficiency
              </p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dashboardData.learningPath} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    dy={10}
                  />
                  <YAxis 
                    tick={{ fill: '#64748b', fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                    dx={-10}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                      padding: '12px'
                    }}
                    itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="#10B981" 
                    strokeWidth={4}
                    dot={{ fill: '#ffffff', stroke: '#10B981', strokeWidth: 3, r: 6 }}
                    activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2, fill: '#10B981' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Skill Distribution */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="mb-6">
              <h3 className="text-gray-900 text-xl font-bold flex items-center gap-2">
                <Brain className="w-5 h-5 text-orange-600" />
                Learning Focus Areas
              </h3>
              <p className="text-gray-500 text-sm mt-1">
                Time distribution across different learning areas
              </p>
            </div>
            <div className="flex items-center justify-center mb-8">
              <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboardData.skillDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                      cornerRadius={6}
                    >
                      {dashboardData.skillDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: 'none',
                        borderRadius: '12px',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                        padding: '12px'
                      }}
                      itemStyle={{ color: '#1e293b', fontWeight: 600 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="space-y-4">
              {dashboardData.skillDistribution.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full ring-2 ring-white shadow-sm" style={{ backgroundColor: item.color }}></div>
                    <span className="text-gray-700 text-sm font-semibold group-hover:text-gray-900">{item.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-gray-900 text-sm font-bold">{item.value}%</div>
                    <div className="text-gray-400 text-xs font-medium">{item.hours}h</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity Feed and Upcoming Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          
          {/* Recent Activities Timeline */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-gray-900 text-xl font-bold flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Recent Activities
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Your latest academic achievements and activities
                </p>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 font-medium">
                View All
              </Button>
            </div>
            <div className="space-y-6 relative">
              <div className="absolute left-[27px] top-4 bottom-4 w-0.5 bg-gray-100"></div>
              {recentActivities.map((activity, index) => (
                <div key={activity.id} className="relative flex items-start gap-4 group">
                  <div className={`relative z-10 flex-shrink-0 p-2 rounded-full border-4 border-white shadow-sm ${
                    activity.type === 'success' ? 'bg-green-100 text-green-600' : 
                    activity.type === 'achievement' ? 'bg-yellow-100 text-yellow-600' : 
                    'bg-blue-100 text-blue-600'
                  }`}>
                    <activity.icon className="w-4 h-4" />
                  </div>
                  
                  <div className="flex-1 min-w-0 bg-gray-50 rounded-2xl p-4 hover:bg-white hover:shadow-md transition-all duration-300 border border-transparent hover:border-gray-100">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-gray-900 text-sm font-bold group-hover:text-blue-600 transition-colors">
                        {activity.activity}
                      </p>
                      <span className={`text-xs px-2 py-1 rounded-full font-bold ${
                        activity.type === 'success' ? 'bg-green-100 text-green-700' : 
                        activity.type === 'achievement' ? 'bg-yellow-100 text-yellow-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {activity.points}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-gray-400 text-xs font-medium flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {activity.time}
                      </span>
                      <span className="text-gray-500 text-xs px-2 py-0.5 bg-white rounded-md border border-gray-200 font-medium shadow-sm">
                        {activity.course}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-8 p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Star className="w-6 h-6 text-yellow-300 fill-current" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-blue-100">Total XP Earned</p>
                    <p className="text-2xl font-bold">1,245 XP</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-blue-100 mb-1">This Semester</p>
                  <div className="h-1.5 w-24 bg-black/20 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-400 w-[75%]"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Upcoming Deadlines */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-gray-900 text-xl font-bold flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Upcoming Deadlines
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Keep track of your assignments and exams
                </p>
              </div>
              <Button variant="outline" size="sm" className="text-gray-700 border-gray-200 hover:bg-gray-50 hover:border-gray-300 rounded-xl">
                Add Task
              </Button>
            </div>
            <div className="space-y-4">
              {upcomingDeadlines.map((task) => (
                <div key={task.id} className="p-5 rounded-2xl border border-gray-100 bg-white hover:border-blue-200 hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                  <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                    task.priority === 'high' ? 'bg-red-500' :
                    task.priority === 'medium' ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}></div>
                  
                  <div className="flex items-start justify-between mb-3 pl-2">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="text-gray-900 text-sm font-bold group-hover:text-blue-600 transition-colors">
                          {task.task}
                        </h4>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          task.type === 'exam' ? 'bg-red-50 text-red-600' :
                          task.type === 'project' ? 'bg-purple-50 text-purple-600' :
                          task.type === 'lab' ? 'bg-green-50 text-green-600' :
                          'bg-blue-50 text-blue-600'
                        }`}>
                          {task.type}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-gray-500 text-xs font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.due}
                        </span>
                        <span className="text-gray-600 text-xs px-2 py-0.5 bg-gray-100 rounded-md font-medium border border-gray-200">
                          {task.subject}
                        </span>
                      </div>
                      
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-xs font-medium">Progress</span>
                          <span className="text-gray-700 text-xs font-bold">{task.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              task.progress >= 80 ? 'bg-green-500' :
                              task.progress >= 50 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}
                            style={{ width: `${task.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            <Button className="w-full mt-6 bg-gray-900 text-white hover:bg-gray-800 shadow-lg hover:shadow-xl transition-all duration-300 h-12 rounded-xl font-semibold">
              <Calendar className="w-4 h-4 mr-2" />
              View Full Calendar
            </Button>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 mb-10">
          <div className="mb-8">
            <h3 className="text-gray-900 text-xl font-bold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Performance Insights
            </h3>
            <p className="text-gray-500 text-sm mt-1">
              AI-powered insights to improve your learning journey
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 bg-gradient-to-br from-blue-50 to-white border border-blue-100 rounded-2xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <h4 className="text-gray-900 text-sm font-bold">Study Pattern</h4>
              </div>
              <p className="text-gray-600 text-xs mb-3 leading-relaxed">You're most productive between 2-4 PM based on your recent activity.</p>
              <p className="text-blue-600 text-xs font-bold flex items-center">
                <TrendingUp className="w-3 h-3 mr-1" />
                +23% efficiency
              </p>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-green-50 to-white border border-green-100 rounded-2xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="w-5 h-5 text-green-600" />
                </div>
                <h4 className="text-gray-900 text-sm font-bold">Strength Area</h4>
              </div>
              <p className="text-gray-600 text-xs mb-3 leading-relaxed">Excellent progress in Programming concepts and practical application.</p>
              <p className="text-green-600 text-xs font-bold flex items-center">
                <Award className="w-3 h-3 mr-1" />
                92% mastery level
              </p>
            </div>
            
            <div className="p-6 bg-gradient-to-br from-orange-50 to-white border border-orange-100 rounded-2xl hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Lightbulb className="w-5 h-5 text-orange-600" />
                </div>
                <h4 className="text-gray-900 text-sm font-bold">Recommendation</h4>
              </div>
              <p className="text-gray-600 text-xs mb-3 leading-relaxed">Focus more on Theory & Concepts to balance your practical skills.</p>
              <p className="text-orange-600 text-xs font-bold flex items-center">
                <Clock className="w-3 h-3 mr-1" />
                +20% time suggested
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;