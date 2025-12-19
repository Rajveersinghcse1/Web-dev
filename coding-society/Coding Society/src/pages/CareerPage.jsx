import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  MapPin, 
  ExternalLink, 
  Award, 
  Briefcase,
  GraduationCap,
  Code,
  Rocket,
  Target,
  Clock,
  DollarSign,
  Building,
  Search,
  Filter,
  Star,
  Heart,
  Share2,
  Bookmark,
  Eye,
  MessageCircle,
  ThumbsUp,
  Download,
  Upload,
  Edit,
  Plus,
  CheckCircle,
  AlertCircle,
  XCircle,
  BarChart3,
  Activity,
  Zap,
  Globe,
  Monitor,
  Smartphone,
  Trophy,
  Medal,
  Crown,
  Gift,
  Lightning,
  Brain,
  Lightbulb,
  Settings,
  Bell,
  Mail,
  Phone,
  LinkedIn,
  Github,
  Twitter,
  Instagram,
  Facebook,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  ArrowDownRight,
  TrendingDown,
  Percent,
  Calculator,
  FileText,
  Camera,
  Video,
  Mic,
  MicOff,
  Play,
  Pause,
  RotateCcw,
  RefreshCw,
  Save,
  ShieldCheck,
  Verified
} from 'lucide-react';

// Enhanced Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  },
  exit: { opacity: 0, transition: { staggerChildren: 0.05, staggerDirection: -1 } }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { type: "spring", stiffness: 100, damping: 10 }
  },
  exit: { y: -20, opacity: 0 }
};

const cardVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { type: "spring", stiffness: 120, damping: 15 }
  },
  hover: { 
    scale: 1.02, 
    y: -5,
    transition: { type: "spring", stiffness: 400, damping: 25 }
  },
  tap: { scale: 0.98 }
};

const CareerPage = () => {
  const { user, updateUserActivity } = useAuth();
  const [selectedTab, setSelectedTab] = useState('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');
  const [favorites, setFavorites] = useState(new Set());
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [registeredHackathons, setRegisteredHackathons] = useState(new Set());
  const [isProfileEditing, setIsProfileEditing] = useState(false);
  const [careerStats, setCareerStats] = useState({
    profileViews: 234,
    applicationsSent: 12,
    interviewsScheduled: 3,
    offersReceived: 1,
    hackathonsWon: 2,
    networkConnections: 156,
    skillsEndorsements: 89,
    portfolioShares: 45
  });
  const [realTimeData, setRealTimeData] = useState({
    activeJobs: 1247,
    newOpportunities: 23,
    trendingSkills: ['React', 'TypeScript', 'Python', 'AWS'],
    marketDemand: 94
  });
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'job_match', message: 'New job matches your profile!', time: '2 min ago', unread: true },
    { id: 2, type: 'application_update', message: 'Application status updated', time: '1 hour ago', unread: true },
    { id: 3, type: 'hackathon_reminder', message: 'Hackathon deadline approaching', time: '3 hours ago', unread: false }
  ]);

  // Enhanced student progress with real-time analytics
  const studentProgress = {
    overallProgress: 68,
    weeklyGrowth: 12,
    monthlyGrowth: 45,
    totalHours: 234,
    averageSessionTime: 45,
    skills: [
      { 
        name: 'JavaScript', 
        level: 85, 
        color: 'bg-yellow-500',
        growth: 8,
        endorsed: 15,
        projects: 12,
        certification: 'Advanced',
        marketDemand: 95
      },
      { 
        name: 'React', 
        level: 75, 
        color: 'bg-blue-500',
        growth: 12,
        endorsed: 8,
        projects: 8,
        certification: 'Intermediate',
        marketDemand: 92
      },
      { 
        name: 'Node.js', 
        level: 65, 
        color: 'bg-green-500',
        growth: 15,
        endorsed: 6,
        projects: 5,
        certification: 'Intermediate',
        marketDemand: 88
      },
      { 
        name: 'Python', 
        level: 45, 
        color: 'bg-purple-500',
        growth: 20,
        endorsed: 4,
        projects: 3,
        certification: 'Beginner',
        marketDemand: 90
      },
      { 
        name: 'TypeScript', 
        level: 55, 
        color: 'bg-blue-600',
        growth: 25,
        endorsed: 5,
        projects: 4,
        certification: 'Beginner',
        marketDemand: 87
      },
      { 
        name: 'Database Design', 
        level: 60, 
        color: 'bg-orange-500',
        growth: 10,
        endorsed: 7,
        projects: 6,
        certification: 'Intermediate',
        marketDemand: 85
      }
    ],
    achievements: [
      { 
        name: 'First Project', 
        description: 'Completed your first coding project', 
        date: '2024-01-15', 
        earned: true,
        rarity: 'Common',
        points: 100
      },
      { 
        name: 'Code Master', 
        description: 'Wrote 1000+ lines of code', 
        date: '2024-01-20', 
        earned: true,
        rarity: 'Rare',
        points: 500
      },
      { 
        name: 'Team Player', 
        description: 'Collaborated on 5 projects', 
        date: '2024-01-25', 
        earned: false,
        rarity: 'Epic',
        points: 1000
      },
      { 
        name: 'Problem Solver', 
        description: 'Solved 50 coding challenges', 
        date: null, 
        earned: false,
        rarity: 'Legendary',
        points: 2000
      }
    ],
    streaks: {
      current: 15,
      longest: 23,
      thisWeek: 5
    },
    rankInfo: {
      currentRank: 'Advanced Developer',
      nextRank: 'Expert Developer',
      progressToNext: 68,
      pointsNeeded: 1500
    }
  };

  // Enhanced internships with advanced features
  const internships = [
    {
      id: 1,
      title: 'Frontend Developer Intern',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      type: 'Remote',
      duration: '3 months',
      stipend: '$2000/month',
      description: 'Join our frontend team to build responsive web applications using React and TypeScript.',
      requirements: ['React', 'JavaScript', 'CSS', 'Git'],
      posted: '2 days ago',
      deadline: '2024-02-15',
      applicants: 45,
      featured: true,
      companyLogo: '/api/placeholder/100/100',
      companyRating: 4.5,
      companySize: '1000-5000',
      industry: 'Technology',
      benefits: ['Health Insurance', 'Flexible Hours', 'Learning Budget', 'Mentorship'],
      skillMatch: 92,
      experienceLevel: 'Entry Level',
      applyUrl: '#',
      salary: { min: 2000, max: 2500, currency: 'USD', period: 'month' },
      tags: ['Remote', 'Frontend', 'React', 'Startup'],
      urgency: 'High',
      interviews: { rounds: 3, types: ['Technical', 'Cultural', 'Final'] },
      growth: { learning: 95, career: 88, network: 92 }
    },
    {
      id: 2,
      title: 'Backend Developer Intern',
      company: 'DataFlow Inc',
      location: 'Austin, TX',
      type: 'Hybrid',
      duration: '4 months',
      stipend: '$2500/month',
      description: 'Work with our backend team to develop scalable APIs and microservices.',
      requirements: ['Node.js', 'Python', 'PostgreSQL', 'AWS'],
      posted: '1 week ago',
      deadline: '2024-02-20',
      applicants: 32,
      featured: false,
      companyLogo: '/api/placeholder/100/100',
      companyRating: 4.2,
      companySize: '500-1000',
      industry: 'Data Analytics',
      benefits: ['Health Insurance', 'Relocation Assistance', 'Tech Equipment'],
      skillMatch: 78,
      experienceLevel: 'Entry Level',
      applyUrl: '#',
      salary: { min: 2500, max: 3000, currency: 'USD', period: 'month' },
      tags: ['Hybrid', 'Backend', 'Node.js', 'Enterprise'],
      urgency: 'Medium',
      interviews: { rounds: 2, types: ['Technical', 'Manager'] },
      growth: { learning: 89, career: 85, network: 78 }
    },
    {
      id: 3,
      title: 'Machine Learning Intern',
      company: 'AI Solutions',
      location: 'Seattle, WA',
      type: 'On-site',
      duration: '6 months',
      stipend: '$3000/month',
      description: 'Research and develop machine learning models for computer vision applications.',
      requirements: ['Python', 'TensorFlow', 'PyTorch', 'Statistics'],
      posted: '3 days ago',
      deadline: '2024-02-10',
      applicants: 67,
      featured: true,
      companyLogo: '/api/placeholder/100/100',
      companyRating: 4.8,
      companySize: '100-500',
      industry: 'Artificial Intelligence',
      benefits: ['Research Budget', 'Conference Attendance', 'Publication Support'],
      skillMatch: 65,
      experienceLevel: 'Intermediate',
      applyUrl: '#',
      salary: { min: 3000, max: 3500, currency: 'USD', period: 'month' },
      tags: ['On-site', 'AI/ML', 'Research', 'Innovation'],
      urgency: 'High',
      interviews: { rounds: 4, types: ['Technical', 'Research', 'Team', 'Final'] },
      growth: { learning: 98, career: 95, network: 90 }
    }
  ];

  // Enhanced hackathons with comprehensive details
  const hackathons = [
    {
      id: 1,
      name: 'Global Innovation Hackathon 2024',
      organizer: 'TechWorld',
      date: '2024-03-15',
      duration: '48 hours',
      prize: '$50,000',
      participants: 2500,
      theme: 'Sustainable Technology',
      mode: 'Virtual',
      status: 'Registration Open',
      logo: '/api/placeholder/80/80',
      description: 'Build innovative solutions for sustainability challenges using cutting-edge technology.',
      tracks: ['Web Development', 'Mobile Apps', 'AI/ML', 'IoT'],
      judges: ['Tech Industry Leaders', 'VCs', 'Startup Founders'],
      sponsors: ['Google', 'Microsoft', 'AWS'],
      registrationDeadline: '2024-03-10',
      skillsRequired: ['React', 'Python', 'AI/ML', 'Design'],
      teamSize: { min: 1, max: 4 },
      difficulty: 'Intermediate',
      categories: ['Best Innovation', 'Best Design', 'Most Practical'],
      networking: true,
      mentorship: true,
      workshops: ['React Advanced', 'AI Fundamentals', 'Pitch Deck Creation']
    },
    {
      id: 2,
      name: 'AI for Good Challenge',
      organizer: 'AI Foundation',
      date: '2024-04-20',
      duration: '72 hours',
      prize: '$25,000',
      participants: 1200,
      theme: 'AI for Social Impact',
      mode: 'Hybrid',
      status: 'Coming Soon',
      logo: '/api/placeholder/80/80',
      description: 'Develop AI solutions that address real-world social challenges and make a positive impact.',
      tracks: ['Healthcare AI', 'Education Tech', 'Environmental Solutions'],
      judges: ['AI Researchers', 'Social Impact Leaders'],
      sponsors: ['IBM', 'NVIDIA', 'OpenAI'],
      registrationDeadline: '2024-04-15',
      skillsRequired: ['Python', 'TensorFlow', 'Data Science'],
      teamSize: { min: 2, max: 5 },
      difficulty: 'Advanced',
      categories: ['Most Impactful', 'Best Technical Solution', 'Community Choice'],
      networking: true,
      mentorship: true,
      workshops: ['Deep Learning', 'Ethics in AI', 'Social Impact Measurement']
    },
    {
      id: 3,
      name: 'FinTech Innovation Sprint',
      organizer: 'FinanceHub',
      date: '2024-05-10',
      duration: '36 hours',
      prize: '$30,000',
      participants: 800,
      theme: 'Financial Technology',
      mode: 'On-site',
      status: 'Registration Open',
      logo: '/api/placeholder/80/80',
      description: 'Revolutionize financial services with innovative blockchain and fintech solutions.',
      tracks: ['Blockchain', 'Digital Banking', 'Insurance Tech'],
      judges: ['Fintech Executives', 'Blockchain Experts'],
      sponsors: ['JPMorgan', 'PayPal', 'Stripe'],
      registrationDeadline: '2024-05-05',
      skillsRequired: ['JavaScript', 'Blockchain', 'Finance Knowledge'],
      teamSize: { min: 3, max: 6 },
      difficulty: 'Intermediate',
      categories: ['Most Innovative', 'Best Business Model', 'People\'s Choice'],
      networking: true,
      mentorship: true,
      workshops: ['Blockchain Basics', 'Financial APIs', 'Regulatory Compliance']
    }
  ];

  // Enhanced portfolio sections with progress tracking
  const portfolioSections = [
    {
      title: 'Personal Information',
      status: 'Complete',
      progress: 100,
      items: [
        { name: 'Profile Photo', completed: true, required: true },
        { name: 'Contact Details', completed: true, required: true },
        { name: 'Professional Bio', completed: true, required: true },
        { name: 'Location', completed: true, required: false },
        { name: 'Social Links', completed: true, required: false }
      ],
      icon: Users,
      color: 'green'
    },
    {
      title: 'Skills & Technologies',
      status: 'In Progress',
      progress: 75,
      items: [
        { name: 'Programming Languages', completed: true, required: true },
        { name: 'Frameworks & Libraries', completed: true, required: true },
        { name: 'Tools & Software', completed: true, required: false },
        { name: 'Certifications', completed: false, required: false },
        { name: 'Skill Endorsements', completed: false, required: false }
      ],
      icon: Code,
      color: 'blue'
    },
    {
      title: 'Projects Portfolio',
      status: 'Needs Work',
      progress: 40,
      items: [
        { name: 'Project Descriptions', completed: true, required: true },
        { name: 'Screenshots/Media', completed: false, required: true },
        { name: 'Live Demo Links', completed: false, required: false },
        { name: 'Source Code Links', completed: true, required: true },
        { name: 'Technical Details', completed: false, required: false }
      ],
      icon: Rocket,
      color: 'purple'
    },
    {
      title: 'Experience & Achievements',
      status: 'Empty',
      progress: 10,
      items: [
        { name: 'Work Experience', completed: false, required: false },
        { name: 'Internship History', completed: false, required: false },
        { name: 'Volunteer Work', completed: false, required: false },
        { name: 'Awards & Recognition', completed: true, required: false },
        { name: 'Leadership Roles', completed: false, required: false }
      ],
      icon: Award,
      color: 'yellow'
    }
  ];

  // Real-time data updates and analytics
  useEffect(() => {
    const interval = setInterval(() => {
      setRealTimeData(prev => ({
        ...prev,
        activeJobs: prev.activeJobs + Math.floor(Math.random() * 3) - 1,
        newOpportunities: prev.newOpportunities + (Math.random() > 0.8 ? 1 : 0),
        marketDemand: Math.max(85, Math.min(99, prev.marketDemand + (Math.random() - 0.5) * 2))
      }));
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  // Track user activity
  useEffect(() => {
    updateUserActivity('career_page_visit');
  }, [updateUserActivity]);

  // Helper functions
  const toggleFavorite = (id, type) => {
    const key = `${type}_${id}`;
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(key)) {
        newFavorites.delete(key);
      } else {
        newFavorites.add(key);
      }
      return newFavorites;
    });
  };

  const applyToJob = (jobId) => {
    setAppliedJobs(prev => new Set([...prev, jobId]));
    updateUserActivity(`job_application_${jobId}`);
  };

  const registerForHackathon = (hackathonId) => {
    setRegisteredHackathons(prev => new Set([...prev, hackathonId]));
    updateUserActivity(`hackathon_registration_${hackathonId}`);
  };

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'complete': return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'in progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'needs work': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900';
      case 'empty': return 'text-red-600 bg-red-100 dark:bg-red-900';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getRarityColor = (rarity) => {
    switch (rarity.toLowerCase()) {
      case 'common': return 'text-gray-600';
      case 'rare': return 'text-blue-600';
      case 'epic': return 'text-purple-600';
      case 'legendary': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = searchQuery === '' || 
      internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      internship.location.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterBy === 'all' || 
      internship.type.toLowerCase() === filterBy.toLowerCase() ||
      (filterBy === 'featured' && internship.featured);
    
    return matchesSearch && matchesFilter;
  });

  const sortedInternships = [...filteredInternships].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.posted) - new Date(a.posted);
      case 'salary':
        return b.salary.max - a.salary.max;
      case 'match':
        return b.skillMatch - a.skillMatch;
      case 'deadline':
        return new Date(a.deadline) - new Date(b.deadline);
      default:
        return 0;
    }
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header with Real-time Stats */}
        <motion.div variants={itemVariants} className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
            Career & Growth Hub
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-8">
            Accelerate your career with AI-powered insights, personalized recommendations, 
            and comprehensive tracking of your professional journey.
          </p>
          
          {/* Real-time Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200"
            >
              <div className="text-3xl font-bold text-blue-600 mb-1">{realTimeData.activeJobs.toLocaleString()}</div>
              <div className="text-sm font-medium text-slate-600">Active Jobs</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200"
            >
              <div className="text-3xl font-bold text-green-600 mb-1">{realTimeData.newOpportunities}</div>
              <div className="text-sm font-medium text-slate-600">New Today</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200"
            >
              <div className="text-3xl font-bold text-purple-600 mb-1">{realTimeData.marketDemand.toFixed(0)}%</div>
              <div className="text-sm font-medium text-slate-600">Market Demand</div>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-slate-200"
            >
              <div className="text-3xl font-bold text-yellow-600 mb-1">{careerStats.profileViews}</div>
              <div className="text-sm font-medium text-slate-600">Profile Views</div>
            </motion.div>
          </div>
        </motion.div>

        {/* Enhanced Notification Bar */}
        {notifications.filter(n => n.unread).length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mb-8 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-5 h-5 text-blue-600" />
                <span className="text-blue-800 font-medium">
                  You have {notifications.filter(n => n.unread).length} new notifications
                </span>
              </div>
              <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-100">
                View All
              </Button>
            </div>
          </motion.div>
        )}

        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-8">
          <TabsList className="bg-white/50 backdrop-blur-sm p-1 rounded-2xl border border-slate-200 w-full max-w-4xl mx-auto grid grid-cols-4">
            <TabsTrigger value="dashboard" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="opportunities" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300">
              <div className="flex items-center gap-2">
                <Briefcase className="w-4 h-4" />
                <span className="hidden sm:inline">Opportunities</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="hackathons" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                <span className="hidden sm:inline">Hackathons</span>
              </div>
            </TabsTrigger>
            <TabsTrigger value="portfolio" className="rounded-xl data-[state=active]:bg-blue-600 data-[state=active]:text-white transition-all duration-300">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="hidden sm:inline">Portfolio</span>
              </div>
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Dashboard Tab */}
          <TabsContent value="dashboard">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Enhanced Progress Overview */}
                <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
                  <Card className="overflow-hidden bg-white/80 backdrop-blur-sm border-slate-200 shadow-xl rounded-3xl">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                            <TrendingUp className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-white">
                              Learning Progress
                            </h3>
                            <p className="text-sm text-blue-100">
                              {studentProgress.weeklyGrowth}% growth this week
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white">
                            {studentProgress.overallProgress}%
                          </div>
                          <div className="text-sm text-blue-100">
                            Overall
                          </div>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="space-y-6">
                        {studentProgress.skills.map((skill, index) => (
                          <motion.div
                            key={skill.name}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <div className="flex items-center gap-3">
                                <span className="font-medium text-slate-900">
                                  {skill.name}
                                </span>
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                                  skill.certification === 'Advanced' ? 'bg-green-100 text-green-700' :
                                  skill.certification === 'Intermediate' ? 'bg-blue-100 text-blue-700' :
                                  'bg-slate-100 text-slate-700'
                                }`}>
                                  {skill.certification}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-sm text-slate-600">
                                <span>{skill.level}%</span>
                                <span className="text-green-600 font-medium">+{skill.growth}%</span>
                              </div>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                              <motion.div
                                className={`${skill.color} h-3 rounded-full relative overflow-hidden`}
                                initial={{ width: 0 }}
                                animate={{ width: `${skill.level}%` }}
                                transition={{ duration: 1, delay: index * 0.1 }}
                              >
                                <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                              </motion.div>
                            </div>
                            <div className="flex justify-between text-xs text-slate-500 mt-2">
                              <span>{skill.projects} projects</span>
                              <span>{skill.endorsed} endorsements</span>
                              <span>{skill.marketDemand}% demand</span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Achievement Showcase */}
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6">
                      <CardTitle className="flex items-center gap-3">
                        <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm">
                          <Award className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            Achievement Gallery
                          </h3>
                          <p className="text-sm text-amber-100">
                            Showcase your accomplishments and milestones
                          </p>
                        </div>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {studentProgress.achievements.map((achievement, index) => (
                          <motion.div
                            key={achievement.name}
                            variants={cardVariants}
                            whileHover="hover"
                            whileTap="tap"
                            className={`p-4 rounded-2xl border transition-all ${
                              achievement.earned
                                ? 'border-green-200 bg-green-50/50'
                                : 'border-slate-200 bg-slate-50/50'
                            }`}
                          >
                                  <span className={`font-medium ${achievement.earned ? 'text-green-800' : 'text-slate-600'}`}>
                                    {achievement.name}
                                  </span>
                                </div>
                                <p className={`text-sm ${achievement.earned ? 'text-green-700' : 'text-slate-500'}`}>
                                  {achievement.description}
                                </p>
                                {achievement.date && (
                                  <p className="text-xs text-slate-500 mt-1">
                                    Earned on {achievement.date}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`px-2 py-1 text-xs rounded-full ${getRarityColor(achievement.rarity)} font-medium bg-white/50`}>
                                  {achievement.rarity}
                                </span>
                                <span className="text-xs font-medium text-slate-600">
                                  {achievement.points} pts
                                </span>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Enhanced Career Stats Sidebar */}
                <motion.div variants={itemVariants} className="space-y-6">
                  {/* Rank Progress */}
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-6">
                      <CardTitle className="flex items-center gap-2">
                        <Crown className="w-5 h-5 text-yellow-300" />
                        Current Rank
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      <div className="text-center mb-4">
                        <div className="text-3xl font-bold text-purple-600 mb-2">
                          {studentProgress.rankInfo.currentRank}
                        </div>
                        <div className="text-sm text-slate-600">
                          Next: {studentProgress.rankInfo.nextRank}
                        </div>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-3 mb-2 overflow-hidden">
                        <div
                          className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${studentProgress.rankInfo.progressToNext}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-500 text-center">
                        {studentProgress.rankInfo.pointsNeeded} points to next rank
                      </div>
                    </CardContent>
                  </Card>

                  {/* Career Metrics */}
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white p-6">
                      <CardTitle className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-white" />
                        Career Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Profile Views</span>
                        <span className="font-semibold text-slate-900">{careerStats.profileViews}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Applications Sent</span>
                        <span className="font-semibold text-slate-900">{careerStats.applicationsSent}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Interviews</span>
                        <span className="font-semibold text-blue-600">{careerStats.interviewsScheduled}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Offers Received</span>
                        <span className="font-semibold text-green-600">{careerStats.offersReceived}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Hackathons Won</span>
                        <span className="font-semibold text-yellow-600">{careerStats.hackathonsWon}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Network Size</span>
                        <span className="font-semibold text-slate-900">{careerStats.networkConnections}</span>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Learning Streak */}
                  <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-xl rounded-3xl overflow-hidden">
                    <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
                      <CardTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-300" />
                        Learning Streak
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 text-center">
                      <div className="text-4xl font-bold text-orange-600 mb-2">
                        {studentProgress.streaks.current}
                      </div>
                      <div className="text-sm text-slate-600 mb-4">
                        Days in a row
                      </div>
                      <div className="text-xs text-slate-500">
                        Best streak: {studentProgress.streaks.longest} days
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          </TabsContent>

          {/* Enhanced Opportunities Tab */}
          <TabsContent value="opportunities">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row gap-4 bg-white/80 backdrop-blur-sm p-4 rounded-2xl shadow-lg border border-slate-200">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                    <Input
                      placeholder="Search opportunities..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-slate-50 border-slate-200 focus:ring-blue-500 focus:border-blue-500 rounded-xl"
                    />
                  </div>
                </div>
                <div className="flex space-x-2">
                  <select
                    value={filterBy}
                    onChange={(e) => setFilterBy(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="all">All Types</option>
                    <option value="remote">Remote</option>
                    <option value="hybrid">Hybrid</option>
                    <option value="on-site">On-site</option>
                    <option value="featured">Featured</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-4 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-700 focus:ring-blue-500 focus:border-blue-500 outline-none"
                  >
                    <option value="recent">Most Recent</option>
                    <option value="salary">Highest Salary</option>
                    <option value="match">Best Match</option>
                    <option value="deadline">Deadline</option>
                  </select>
                </div>
              </div>

              {/* Internship Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnimatePresence>
                  {sortedInternships.map((internship, index) => (
                    <motion.div
                      key={internship.id}
                      variants={cardVariants}
                      whileHover="hover"
                      whileTap="tap"
                      layout
                      className="h-full"
                    >
                      <Card className="h-full flex flex-col bg-white/80 backdrop-blur-sm border-slate-200 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                        <CardHeader className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                {internship.featured && (
                                  <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full font-medium border border-yellow-200">
                                    Featured
                                  </span>
                                )}
                                <span className={`px-3 py-1 text-xs rounded-full font-medium border ${
                                  internship.urgency === 'High' ? 'bg-red-100 text-red-800 border-red-200' :
                                  internship.urgency === 'Medium' ? 'bg-orange-100 text-orange-800 border-orange-200' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {internship.urgency} Priority
                                </span>
                              </div>
                              <CardTitle className="text-lg text-gray-900 dark:text-white">
                                {internship.title}
                              </CardTitle>
                              <div className="flex items-center gap-2 text-slate-600 mt-1">
                                <Building className="w-4 h-4" />
                                <span className="font-medium">{internship.company}</span>
                                <div className="flex items-center gap-1">
                                  <Star className="w-3 h-3 text-yellow-500" />
                                  <span className="text-sm">{internship.companyRating}</span>
                                </div>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleFavorite(internship.id, 'internship')}
                              className={favorites.has(`internship_${internship.id}`) ? 'text-red-600 hover:bg-red-50' : 'text-slate-400 hover:text-red-600 hover:bg-red-50'}
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="flex-1 p-6 pt-0">
                          <p className="text-slate-600 text-sm mb-4">
                            {internship.description}
                          </p>
                          
                          <div className="space-y-3 mb-4">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <MapPin className="w-4 h-4 text-slate-400" />
                              <span>{internship.location} • {internship.type}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm">
                              <DollarSign className="w-4 h-4 text-green-500" />
                              <span className="font-medium text-green-600">{internship.stipend}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Clock className="w-4 h-4 text-slate-400" />
                              <span>{internship.duration}</span>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                              <Target className="w-4 h-4 text-blue-500" />
                              <span className="text-sm font-medium text-slate-700">Skill Match: {internship.skillMatch}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${internship.skillMatch}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="flex flex-wrap gap-2 mb-4">
                            {internship.requirements.slice(0, 3).map((req, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium border border-blue-100"
                              >
                                {req}
                              </span>
                            ))}
                            {internship.requirements.length > 3 && (
                              <span className="text-xs text-slate-500">
                                +{internship.requirements.length - 3} more
                              </span>
                            )}
                          </div>
                        </CardContent>
                        <div className="p-6 pt-0">
                          <div className="flex items-center justify-between">
                            <div className="text-sm text-slate-500">
                              <span>{internship.applicants} applicants</span>
                              <span className="mx-2">•</span>
                              <span>Deadline: {new Date(internship.deadline).toLocaleDateString()}</span>
                            </div>
                            <Button
                              onClick={() => applyToJob(internship.id)}
                              disabled={appliedJobs.has(internship.id)}
                              className={`ml-2 ${appliedJobs.has(internship.id) ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                            >
                              {appliedJobs.has(internship.id) ? (
                                <>
                                  <CheckCircle className="w-4 h-4 mr-2" />
                                  Applied
                                </>
                              ) : (
                                <>
                                  <ExternalLink className="w-4 h-4 mr-2" />
                                  Apply Now
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          </TabsContent>

          {/* Enhanced Hackathons Tab */}
          <TabsContent value="hackathons">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {hackathons.map((hackathon, index) => (
                  <motion.div
                    key={hackathon.id}
                    variants={cardVariants}
                    whileHover="hover"
                    whileTap="tap"
                    className="h-full"
                  >
                    <Card className="h-full flex flex-col bg-white/80 backdrop-blur-sm border-slate-200 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                      <CardHeader className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg text-slate-900 mb-2">
                              {hackathon.name}
                            </CardTitle>
                            <div className="flex items-center gap-2 text-slate-600">
                              <Users className="w-4 h-4" />
                              <span className="text-sm">{hackathon.organizer}</span>
                            </div>
                          </div>
                          <span className={`px-3 py-1 text-xs rounded-full font-medium border ${
                            hackathon.status === 'Registration Open' ? 'bg-green-100 text-green-800 border-green-200' :
                            hackathon.status === 'Coming Soon' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                            'bg-slate-100 text-slate-800 border-slate-200'
                          }`}>
                            {hackathon.status}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-1 p-6 pt-0">
                        <p className="text-slate-600 text-sm mb-4">
                          {hackathon.description}
                        </p>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Calendar className="w-4 h-4 text-slate-400" />
                            <span>{new Date(hackathon.date).toLocaleDateString()}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span>{hackathon.duration}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Trophy className="w-4 h-4 text-yellow-500" />
                            <span className="font-medium text-yellow-600">{hackathon.prize}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span>{hackathon.participants.toLocaleString()} participants</span>
                          </div>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-slate-900 mb-2">Theme</h4>
                          <span className="px-3 py-1 bg-purple-50 text-purple-700 text-sm rounded-full border border-purple-100 inline-block">
                            {hackathon.theme}
                          </span>
                        </div>

                        <div className="mb-4">
                          <h4 className="text-sm font-medium text-slate-900 mb-2">Tracks</h4>
                          <div className="flex flex-wrap gap-1">
                            {hackathon.tracks.slice(0, 2).map((track, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-1 bg-slate-100 text-slate-700 text-xs rounded border border-slate-200"
                              >
                                {track}
                              </span>
                            ))}
                            {hackathon.tracks.length > 2 && (
                              <span className="text-xs text-slate-500">
                                +{hackathon.tracks.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                      <div className="p-6 pt-0">
                        <Button
                          onClick={() => registerForHackathon(hackathon.id)}
                          disabled={registeredHackathons.has(hackathon.id) || hackathon.status === 'Coming Soon'}
                          className={`w-full ${registeredHackathons.has(hackathon.id) ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                          {registeredHackathons.has(hackathon.id) ? (
                            <>
                              <CheckCircle className="w-4 h-4 mr-2" />
                              Registered
                            </>
                          ) : hackathon.status === 'Coming Soon' ? (
                            <>
                              <Clock className="w-4 h-4 mr-2" />
                              Coming Soon
                            </>
                          ) : (
                            <>
                              <Rocket className="w-4 h-4 mr-2" />
                              Register Now
                            </>
                          )}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>

          {/* Enhanced Portfolio Tab */}
          <TabsContent value="portfolio">
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-2">
                  Portfolio Builder
                </h2>
                <p className="text-slate-600">
                  Create a professional portfolio to showcase your skills and projects
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {portfolioSections.map((section, index) => (
                  <motion.div
                    key={section.title}
                    variants={cardVariants}
                    whileHover="hover"
                    className="h-full"
                  >
                    <Card className="h-full bg-white/80 backdrop-blur-sm border-slate-200 shadow-xl rounded-3xl overflow-hidden hover:shadow-2xl transition-all duration-300">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${
                              section.color === 'green' ? 'bg-green-50' :
                              section.color === 'blue' ? 'bg-blue-50' :
                              section.color === 'purple' ? 'bg-purple-50' :
                              'bg-yellow-50'
                            }`}>
                              <section.icon className={`w-5 h-5 ${
                                section.color === 'green' ? 'text-green-600' :
                                section.color === 'blue' ? 'text-blue-600' :
                                section.color === 'purple' ? 'text-purple-600' :
                                'text-yellow-600'
                              }`} />
                            </div>
                            <div>
                              <CardTitle className="text-lg text-slate-900">{section.title}</CardTitle>
                              <div className="flex items-center gap-2 mt-1">
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getStatusColor(section.status)}`}>
                                  {section.status}
                                </span>
                                <span className="text-sm text-slate-600">
                                  {section.progress}%
                                </span>
                              </div>
                            </div>
                          </div>
                          <Button variant="ghost" size="sm" className="text-slate-400 hover:text-blue-600">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="mb-4">
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <motion.div
                              className={`h-2 rounded-full ${
                                section.color === 'green' ? 'bg-green-600' :
                                section.color === 'blue' ? 'bg-blue-600' :
                                section.color === 'purple' ? 'bg-purple-600' :
                                'bg-yellow-600'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${section.progress}%` }}
                              transition={{ duration: 1, delay: index * 0.1 }}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          {section.items.map((item, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {item.completed ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <XCircle className="w-4 h-4 text-slate-400" />
                                )}
                                <span className={`text-sm ${
                                  item.completed 
                                    ? 'text-slate-900 font-medium' 
                                    : 'text-slate-500'
                                }`}>
                                  {item.name}
                                </span>
                                {item.required && (
                                  <span className="text-xs text-red-500">*</span>
                                )}
                              </div>
                              {!item.completed && (
                                <Button variant="ghost" size="sm" className="text-blue-600 hover:bg-blue-50">
                                  <Plus className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </motion.div>
  );
};

export default CareerPage;
