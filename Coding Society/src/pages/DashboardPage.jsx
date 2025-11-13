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
  Search
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
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      comparison: 'vs last semester'
    },
    {
      title: 'Courses Completed',
      value: '12',
      subtitle: 'Out of 16',
      icon: GraduationCap,
      trend: '75%',
      trendIcon: TrendingUp,
      color: 'from-green-500 to-green-600',
      bgColor: 'bg-green-50',
      comparison: 'completion rate'
    },
    {
      title: 'Current GPA',
      value: '3.8',
      subtitle: 'Out of 4.0',
      icon: Trophy,
      trend: '+0.2',
      trendIcon: TrendingUp,
      color: 'from-yellow-500 to-yellow-600',
      bgColor: 'bg-yellow-50',
      comparison: 'vs last semester'
    },
    {
      title: 'Learning Streak',
      value: '23',
      subtitle: 'Days active',
      icon: Target,
      trend: '+5 days',
      trendIcon: TrendingUp,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      comparison: 'personal best'
    }
  ];

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
    <div className={`min-h-screen ${theme.background} pt-16 pb-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Enhanced Header Section */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-3 rounded-xl bg-gradient-to-r ${theme.gradient}`}>
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className={`text-4xl font-bold ${theme.textPrimary}`}>
                    Welcome back, {user?.name || 'Student'}! 
                  </h1>
                  <p className="text-black text-lg mt-1">
                    Ready to continue your {currentMode === MODES.STUDY ? 'academic' : 'professional'} journey today?
                  </p>
                </div>
              </div>
              
              <div className="flex items-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-black text-sm">Online</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-black" />
                  <span className="text-black text-sm">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                <Download className="w-4 h-4 mr-2" />
                Export Report
              </Button>
              <Button className={`bg-gradient-to-r ${theme.gradient} text-white hover:opacity-90 shadow-lg`}>
                <BarChart3 className="w-4 h-4 mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Professional Academic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {academicStats.map((stat, index) => (
            <Card key={index} className={`${theme.cardBg} border border-gray-200 ${theme.shadow} ${theme.hover} transition-all duration-300 transform hover:scale-105 overflow-hidden relative`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-5`}></div>
              <CardContent className="p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                    <stat.icon className={`w-7 h-7 ${stat.color.includes('blue') ? 'text-blue-600' : stat.color.includes('green') ? 'text-green-600' : stat.color.includes('yellow') ? 'text-yellow-600' : 'text-purple-600'}`} />
                  </div>
                  <div className="flex items-center gap-1">
                    <stat.trendIcon className="w-4 h-4 text-green-600" />
                    <span className="text-green-600 text-sm font-semibold">{stat.trend}</span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <h3 className="text-black text-sm font-medium">{stat.title}</h3>
                  <p className="text-black text-3xl font-bold">{stat.value}</p>
                  <p className="text-black text-sm opacity-70">{stat.subtitle}</p>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <p className="text-black text-xs">{stat.comparison}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions Panel */}
        <div className="mb-8">
          <Card className={`${theme.cardBg} border border-gray-200 ${theme.shadow}`}>
            <CardContent className="p-6">
              <h3 className="text-black text-lg font-semibold mb-4">Quick Actions</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {[
                  { icon: BookOpen, label: 'New Course', color: 'bg-blue-50 text-blue-600' },
                  { icon: FileText, label: 'Assignment', color: 'bg-green-50 text-green-600' },
                  { icon: Users, label: 'Study Group', color: 'bg-purple-50 text-purple-600' },
                  { icon: Calendar, label: 'Schedule', color: 'bg-orange-50 text-orange-600' },
                  { icon: Trophy, label: 'Achievements', color: 'bg-yellow-50 text-yellow-600' },
                  { icon: Settings, label: 'Settings', color: 'bg-gray-50 text-gray-600' }
                ].map((action, index) => (
                  <button key={index} className="flex flex-col items-center gap-2 p-4 rounded-xl hover:bg-gray-50 transition-colors group">
                    <div className={`p-3 rounded-xl ${action.color} group-hover:scale-110 transition-transform`}>
                      <action.icon className="w-6 h-6" />
                    </div>
                    <span className="text-black text-sm font-medium">{action.label}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Charts Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          
          {/* Weekly Learning Progress */}
          <Card className={`xl:col-span-2 ${theme.cardBg} border border-gray-200 ${theme.shadow}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-black flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600" />
                    Weekly Learning Progress
                  </CardTitle>
                  <CardDescription className="text-black text-sm mt-1">
                    Study hours, assignments, and course completion this week
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-black text-xs">Study Hours</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-black text-xs">Assignments</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2">
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={dashboardData.weeklyProgress}>
                  <defs>
                    <linearGradient id="studyHours" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                    </linearGradient>
                    <linearGradient id="assignments" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    tick={{ fill: '#000000', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fill: '#000000', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#000000'
                    }}
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
            </CardContent>
          </Card>

          {/* Subject Progress */}
          <Card className={`${theme.cardBg} border border-gray-200 ${theme.shadow}`}>
            <CardHeader>
              <CardTitle className="text-black flex items-center gap-2">
                <BookMarked className="w-5 h-5 text-purple-600" />
                Subject Mastery
              </CardTitle>
              <CardDescription className="text-black text-sm">
                Progress across different subjects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {dashboardData.subjectProgress.map((subject, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-black text-sm font-medium">{subject.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-black text-xs">{subject.completed}/{subject.totalCourses}</span>
                        <span className="text-black text-sm font-semibold">{subject.progress}%</span>
                      </div>
                    </div>
                    <div className="relative">
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="h-2.5 rounded-full transition-all duration-500 relative overflow-hidden"
                          style={{
                            width: `${subject.progress}%`,
                            backgroundColor: subject.color
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-black text-sm font-medium">Overall Progress</span>
                  <span className="text-black text-lg font-bold">85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                  <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Learning Analytics and Skills */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Learning Path Analytics */}
          <Card className={`${theme.cardBg} border border-gray-200 ${theme.shadow}`}>
            <CardHeader>
              <CardTitle className="text-black flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Learning Efficiency
              </CardTitle>
              <CardDescription className="text-black text-sm">
                Monthly completion rate and learning efficiency
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={dashboardData.learningPath}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fill: '#000000', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <YAxis 
                    tick={{ fill: '#000000', fontSize: 12 }}
                    axisLine={{ stroke: '#e2e8f0' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#ffffff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      color: '#000000'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="efficiency" 
                    stroke="#10B981" 
                    strokeWidth={3}
                    dot={{ fill: '#10B981', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#10B981', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Skill Distribution */}
          <Card className={`${theme.cardBg} border border-gray-200 ${theme.shadow}`}>
            <CardHeader>
              <CardTitle className="text-black flex items-center gap-2">
                <Brain className="w-5 h-5 text-orange-600" />
                Learning Focus Areas
              </CardTitle>
              <CardDescription className="text-black text-sm">
                Time distribution across different learning areas
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center mb-6">
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={dashboardData.skillDistribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {dashboardData.skillDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        color: '#000000'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-3">
                {dashboardData.skillDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-black text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-black text-sm font-semibold">{item.value}%</div>
                      <div className="text-black text-xs opacity-70">{item.hours}h</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Activity Feed and Upcoming Tasks */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          
          {/* Recent Activities Timeline */}
          <Card className={`${theme.cardBg} border border-gray-200 ${theme.shadow}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-black flex items-center gap-2">
                  <Clock className="w-5 h-5 text-blue-600" />
                  Recent Activities
                </CardTitle>
                <Button variant="outline" size="sm" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                  View All
                </Button>
              </div>
              <CardDescription className="text-black text-sm">
                Your latest academic achievements and activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentActivities.map((activity, index) => (
                  <div key={activity.id} className="relative flex items-start gap-4 p-4 rounded-xl hover:bg-gray-50 transition-all duration-200 group">
                    <div className={`relative flex-shrink-0 p-3 rounded-xl ${
                      activity.type === 'success' ? 'bg-green-50 text-green-600' : 
                      activity.type === 'achievement' ? 'bg-yellow-50 text-yellow-600' : 
                      'bg-blue-50 text-blue-600'
                    }`}>
                      <activity.icon className="w-5 h-5" />
                      {index < recentActivities.length - 1 && (
                        <div className="absolute top-12 left-1/2 w-0.5 h-8 bg-gray-200 transform -translate-x-1/2"></div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-black text-sm font-medium group-hover:text-blue-600 transition-colors">
                          {activity.activity}
                        </p>
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          activity.type === 'success' ? 'bg-green-100 text-green-700' : 
                          activity.type === 'achievement' ? 'bg-yellow-100 text-yellow-700' : 
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {activity.points}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-black text-xs opacity-70">{activity.time}</span>
                        <span className="text-black text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                          {activity.course}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Star className="w-5 h-5 text-yellow-500" />
                  <div>
                    <p className="text-black text-sm font-semibold">Total XP Earned</p>
                    <p className="text-black text-xs">1,245 XP this semester</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Deadlines */}
          <Card className={`${theme.cardBg} border border-gray-200 ${theme.shadow}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-black flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  Upcoming Deadlines
                </CardTitle>
                <Button variant="outline" size="sm" className="text-gray-700 border-gray-300 hover:bg-gray-50">
                  Add Task
                </Button>
              </div>
              <CardDescription className="text-black text-sm">
                Keep track of your assignments and exams
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingDeadlines.map((task) => (
                  <div key={task.id} className="p-4 rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all duration-200 group">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="text-black text-sm font-semibold group-hover:text-blue-600 transition-colors">
                            {task.task}
                          </h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            task.type === 'exam' ? 'bg-red-100 text-red-700' :
                            task.type === 'project' ? 'bg-purple-100 text-purple-700' :
                            task.type === 'lab' ? 'bg-green-100 text-green-700' :
                            'bg-blue-100 text-blue-700'
                          }`}>
                            {task.type}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-black text-xs">{task.due}</span>
                          <span className="text-black text-xs px-2 py-0.5 bg-gray-100 rounded-full">
                            {task.subject}
                          </span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            task.priority === 'high' ? 'bg-red-100 text-red-700' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {task.priority} priority
                          </span>
                        </div>
                        
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-black text-xs">Progress</span>
                            <span className="text-black text-xs font-medium">{task.progress}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-1.5">
                            <div 
                              className={`h-1.5 rounded-full transition-all duration-300 ${
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
              
              <Button className="w-full mt-6 bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:opacity-90 shadow-lg">
                <Calendar className="w-4 h-4 mr-2" />
                View Full Calendar
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Performance Insights */}
        <Card className={`${theme.cardBg} border border-gray-200 ${theme.shadow} mb-8`}>
          <CardHeader>
            <CardTitle className="text-black flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-600" />
              Performance Insights
            </CardTitle>
            <CardDescription className="text-black text-sm">
              AI-powered insights to improve your learning journey
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <h4 className="text-black text-sm font-semibold">Study Pattern</h4>
                </div>
                <p className="text-black text-xs mb-2">You're most productive between 2-4 PM</p>
                <p className="text-blue-600 text-xs font-medium">+23% efficiency during this time</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <h4 className="text-black text-sm font-semibold">Strength Area</h4>
                </div>
                <p className="text-black text-xs mb-2">Excellent progress in Programming</p>
                <p className="text-green-600 text-xs font-medium">92% mastery level achieved</p>
              </div>
              
              <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
                <div className="flex items-center gap-3 mb-2">
                  <Lightbulb className="w-5 h-5 text-orange-600" />
                  <h4 className="text-black text-sm font-semibold">Recommendation</h4>
                </div>
                <p className="text-black text-xs mb-2">Focus more on Theory & Concepts</p>
                <p className="text-orange-600 text-xs font-medium">Spend 20% more time this week</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;