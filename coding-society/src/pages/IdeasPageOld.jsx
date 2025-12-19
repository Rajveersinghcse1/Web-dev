import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { useMode } from '../context/ModeContext';
import {
  Lightbulb,
  Plus,
  Heart,
  MessageSquare,
  Share,
  BookOpen,
  Code,
  Atom,
  Calculator,
  Globe,
  Cpu,
  Zap,
  Target,
  Users,
  Clock,
  Star,
  Filter,
  Search,
  TrendingUp,
  Award,
  FileText,
  Send,
  ThumbsUp,
  Eye,
  Bookmark,
  Brain,
  Rocket,
  Activity,
  BarChart3,
  GitBranch,
  Sparkles,
  ChevronDown,
  ChevronRight,
  Play,
  Pause,
  Download,
  ExternalLink,
  Settings,
  Calendar,
  MapPin,
  DollarSign,
  Briefcase,
  Team,
  Building,
  Layers,
  Database,
  Shield,
  CheckCircle,
  AlertCircle,
  Info,
  PieChart,
  LineChart,
  Workflow
} from 'lucide-react';

const IdeasPage = () => {
  const { getCurrentTheme } = useMode();
  const theme = getCurrentTheme();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddIdea, setShowAddIdea] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [sortBy, setSortBy] = useState('trending');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [animatedStats, setAnimatedStats] = useState({ ideas: 0, projects: 0, contributors: 0, completed: 0 });
  const [isLoading, setIsLoading] = useState(false);

  const categories = [
    { 
      id: 'all', 
      label: 'All Ideas', 
      icon: Lightbulb, 
      color: 'from-yellow-400 to-orange-500',
      count: 247,
      description: 'Explore all innovative ideas across disciplines',
      trending: true
    },
    { 
      id: 'computer-science', 
      label: 'Computer Science', 
      icon: Code, 
      color: 'from-blue-500 to-indigo-600',
      count: 89,
      description: 'AI, Machine Learning, Software Development',
      trending: true
    },
    { 
      id: 'electrical', 
      label: 'Electrical Engineering', 
      icon: Zap, 
      color: 'from-yellow-500 to-red-500',
      count: 45,
      description: 'IoT, Renewable Energy, Smart Systems',
      trending: false
    },
    { 
      id: 'mechanical', 
      label: 'Mechanical Engineering', 
      icon: Cpu, 
      color: 'from-gray-500 to-gray-700',
      count: 38,
      description: 'Robotics, Automation, Manufacturing',
      trending: true
    },
    { 
      id: 'civil', 
      label: 'Civil Engineering', 
      icon: Globe, 
      color: 'from-green-500 to-teal-600',
      count: 32,
      description: 'Smart Cities, Infrastructure, Sustainability',
      trending: false
    },
    { 
      id: 'mathematics', 
      label: 'Mathematics', 
      icon: Calculator, 
      color: 'from-purple-500 to-pink-600',
      count: 28,
      description: 'Algorithms, Data Science, Optimization',
      trending: false
    },
    { 
      id: 'physics', 
      label: 'Physics', 
      icon: Atom, 
      color: 'from-cyan-500 to-blue-600',
      count: 15,
      description: 'Quantum Computing, Nanotechnology, Research',
      trending: true
    }
  ];

  // Real-time stats
  const realStats = {
    totalIdeas: 247,
    activeProjects: 89,
    contributors: 156,
    completedProjects: 23,
    weeklyGrowth: 12.5,
    successRate: 78
  };

  // Difficulty levels with colors
  const difficultyLevels = [
    { value: 'all', label: 'All Levels', color: 'bg-gray-100 text-gray-800' },
    { value: 'Beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
    { value: 'Intermediate', label: 'Intermediate', color: 'bg-blue-100 text-blue-800' },
    { value: 'Advanced', label: 'Advanced', color: 'bg-purple-100 text-purple-800' },
    { value: 'Expert', label: 'Expert', color: 'bg-red-100 text-red-800' }
  ];

  // Status options
  const statusOptions = [
    { value: 'all', label: 'All Status', icon: Layers },
    { value: 'planning', label: 'Planning', icon: Calendar },
    { value: 'development', label: 'In Development', icon: Code },
    { value: 'testing', label: 'Testing', icon: Activity },
    { value: 'completed', label: 'Completed', icon: CheckCircle }
  ];

  const ideas = [
    {
      id: 1,
      title: 'AI-Powered Smart Campus Navigation System',
      description: 'A mobile app that uses AR and AI to help students navigate large university campuses, find optimal routes, and discover campus facilities.',
      category: 'computer-science',
      author: 'Alex Chen',
      avatar: '👨‍💻',
      likes: 156,
      comments: 23,
      views: 1240,
      timeAgo: '2 days ago',
      difficulty: 'Advanced',
      tags: ['AI', 'AR', 'Mobile Development', 'Navigation'],
      srs: {
        overview: 'Smart navigation system for university campuses using augmented reality and artificial intelligence.',
        scope: 'Mobile application with backend services, AR integration, and real-time updates.',
        requirements: [
          'Real-time GPS navigation',
          'AR overlay for building identification',
          'Integration with campus services',
          'Multi-platform support (iOS/Android)',
          'Offline capability for basic navigation'
        ],
        timeline: '6-8 months',
        team: '4-6 developers',
        budget: '$15,000 - $25,000'
      },
      featured: true,
      status: 'development',
      progress: 65,
      funding: '$15,000',
      teamSize: 5,
      skills: ['React', 'AI/ML', 'AR', 'Node.js'],
      collaborators: [
        { name: 'John Doe', avatar: '👨‍💻', role: 'Frontend Dev' },
        { name: 'Jane Smith', avatar: '👩‍🎨', role: 'UI/UX Designer' }
      ],
      milestones: 8,
      completedMilestones: 5
    },
    {
      id: 2,
      title: 'Sustainable Energy Management Dashboard',
      description: 'IoT-based system to monitor and optimize energy consumption in residential and commercial buildings.',
      category: 'electrical',
      author: 'Sarah Kim',
      avatar: '👩‍🔬',
      likes: 89,
      comments: 15,
      views: 780,
      timeAgo: '1 week ago',
      difficulty: 'Intermediate',
      tags: ['IoT', 'Energy', 'Sustainability', 'Dashboard'],
      srs: {
        overview: 'Comprehensive energy management system with IoT sensors and analytics dashboard.',
        scope: 'Hardware sensors, cloud platform, web dashboard, and mobile application.',
        requirements: [
          'IoT sensor network for energy monitoring',
          'Real-time data collection and processing',
          'Predictive analytics for optimization',
          'User-friendly dashboard interface',
          'Integration with smart home systems'
        ],
        timeline: '4-6 months',
        team: '3-5 developers',
        budget: '$10,000 - $18,000'
      },
      featured: false,
      status: 'planning',
      progress: 25,
      funding: '$12,000',
      teamSize: 4,
      skills: ['IoT', 'Machine Learning', 'Data Analytics'],
      collaborators: [
        { name: 'Mike Chen', avatar: '👨‍🔬', role: 'Data Scientist' }
      ],
      milestones: 6,
      completedMilestones: 2
    },
    {
      id: 3,
      title: 'Automated Hydroponic Farming System',
      description: 'Smart agriculture solution using sensors and automation to optimize crop growth in hydroponic systems.',
      category: 'mechanical',
      author: 'Mike Johnson',
      avatar: '👨‍🔧',
      likes: 124,
      comments: 31,
      views: 950,
      timeAgo: '3 days ago',
      difficulty: 'Advanced',
      tags: ['Agriculture', 'Automation', 'IoT', 'Sustainability'],
      srs: {
        overview: 'Automated hydroponic system with intelligent monitoring and control capabilities.',
        scope: 'Hardware automation, sensor integration, control algorithms, and monitoring interface.',
        requirements: [
          'Automated nutrient delivery system',
          'pH and EC monitoring sensors',
          'Climate control integration',
          'Growth tracking with cameras',
          'Mobile app for remote monitoring'
        ],
        timeline: '5-7 months',
        team: '4-6 developers',
        budget: '$12,000 - $20,000'
      },
      featured: true,
      status: 'testing',
      progress: 80,
      funding: '$18,000',
      teamSize: 6,
      skills: ['IoT', 'Automation', 'Python', 'Hardware'],
      collaborators: [
        { name: 'Sarah Williams', avatar: '👩‍🔧', role: 'Hardware Engineer' },
        { name: 'Tom Wilson', avatar: '👨‍💻', role: 'Software Engineer' }
      ],
      milestones: 10,
      completedMilestones: 8
    },
    {
      id: 4,
      title: 'Smart Traffic Signal Optimization',
      description: 'ML-based system to optimize traffic light timing using real-time traffic data and predictive analytics.',
      category: 'civil',
      author: 'Emma Davis',
      avatar: '👩‍💼',
      likes: 203,
      comments: 45,
      views: 1560,
      timeAgo: '5 days ago',
      difficulty: 'Advanced',
      tags: ['Machine Learning', 'Traffic', 'Smart City', 'Optimization'],
      srs: {
        overview: 'Intelligent traffic management system using machine learning for signal optimization.',
        scope: 'Traffic sensors, ML algorithms, control systems, and monitoring dashboard.',
        requirements: [
          'Real-time traffic flow detection',
          'Machine learning optimization algorithms',
          'Integration with existing traffic infrastructure',
          'Performance monitoring dashboard',
          'Emergency vehicle priority system'
        ],
        timeline: '8-12 months',
        team: '6-8 developers',
        budget: '$25,000 - $40,000'
      },
      featured: true,
      status: 'development',
      progress: 45,
      funding: '$30,000',
      teamSize: 8,
      skills: ['Machine Learning', 'Computer Vision', 'IoT', 'Python'],
      collaborators: [
        { name: 'David Brown', avatar: '👨‍💼', role: 'Project Manager' },
        { name: 'Lisa Garcia', avatar: '👩‍💻', role: 'ML Engineer' },
        { name: 'Alex Johnson', avatar: '👨‍🔧', role: 'Systems Engineer' }
      ],
      milestones: 12,
      completedMilestones: 5
    }
    }
  ];

      }\n  ];\n\n  // Advanced search suggestions with error handling
  const searchSuggestions = useMemo(() => {
    try {
      if (!searchTerm || searchTerm.length < 2) return [];
      const allTags = [...new Set(ideas.flatMap(idea => idea.tags || []))];
      const allTitles = ideas.map(idea => idea.title.split(' ')).flat();
      const allTerms = [...allTags, ...allTitles];
      
      return allTerms
        .filter(term => term.toLowerCase().includes(searchTerm.toLowerCase()))
        .slice(0, 5);
    } catch (error) {
      console.error('Error generating search suggestions:', error);
      return [];
    }
  }, [searchTerm, ideas]);

  const IdeaCard = ({ idea }) => (
    <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder} hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] group ${idea.featured ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}`}>
      {idea.featured && (
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold py-1 px-3 rounded-t-lg">
          ⭐ Featured Idea
        </div>
      )}
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={`${theme.textPrimary} ${theme.darkTextPrimary} text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors`}>
              {idea.title}
            </CardTitle>
            <CardDescription className="mt-2 text-gray-600 dark:text-gray-400">
              {idea.description}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
        
        <div className="flex items-center space-x-4 mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{idea.avatar}</span>
            <div>
              <div className={`text-sm font-medium ${theme.textPrimary} ${theme.darkTextPrimary}`}>
                {idea.author}
              </div>
              <div className="text-xs text-gray-500">{idea.timeAgo}</div>
            </div>
          </div>
          <div className="flex-1" />
          <span className={`text-xs px-2 py-1 rounded-full ${
            idea.difficulty === 'Advanced' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
            idea.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
          }`}>
            {idea.difficulty}
          </span>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {idea.tags.map((tag, index) => (
              <span
                key={index}
                className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${theme.gradient} text-white font-medium`}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Heart className="w-4 h-4" />
                <span>{idea.likes}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MessageSquare className="w-4 h-4" />
                <span>{idea.comments}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Eye className="w-4 h-4" />
                <span>{idea.views}</span>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="ghost" size="sm">
                <Share className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              className="flex-1 hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 hover:text-white hover:border-transparent transition-all"
            >
              <FileText className="w-4 h-4 mr-2" />
              View SRS
            </Button>
            <Button className={`flex-1 bg-gradient-to-r ${theme.gradient} hover:opacity-90`}>
              <ThumbsUp className="w-4 h-4 mr-2" />
              Like Idea
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const SRSModal = ({ idea, onClose }) => (
    <div className="fixed inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8 overflow-auto" style={{ minHeight: '100vh', minHeight: '100dvh' }}>
      <div className={`${theme.cardBg} ${theme.darkCardBg} rounded-xl w-full max-w-sm sm:max-w-2xl lg:max-w-4xl mx-auto my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] md:max-h-[calc(100vh-4rem)] overflow-y-auto`} style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary}`}>
              Software Requirements Specification
            </h2>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className={`text-xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary} mb-2`}>
                Project: {idea.title}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">{idea.srs.overview}</p>
            </div>

            <div>
              <h4 className={`text-lg font-semibold ${theme.textPrimary} ${theme.darkTextPrimary} mb-2`}>
                Project Scope
              </h4>
              <p className="text-gray-600 dark:text-gray-400">{idea.srs.scope}</p>
            </div>

            <div>
              <h4 className={`text-lg font-semibold ${theme.textPrimary} ${theme.darkTextPrimary} mb-2`}>
                Functional Requirements
              </h4>
              <ul className="space-y-2">
                {idea.srs.requirements.map((req, index) => (
                  <li key={index} className="flex items-start space-x-2">
                    <span className="text-green-500 mt-1">✓</span>
                    <span className="text-gray-600 dark:text-gray-400">{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border ${theme.border} ${theme.darkBorder}`}>
                <h5 className={`font-semibold ${theme.textPrimary} ${theme.darkTextPrimary} mb-2`}>Timeline</h5>
                <p className="text-gray-600 dark:text-gray-400">{idea.srs.timeline}</p>
              </div>
              <div className={`p-4 rounded-lg border ${theme.border} ${theme.darkBorder}`}>
                <h5 className={`font-semibold ${theme.textPrimary} ${theme.darkTextPrimary} mb-2`}>Team Size</h5>
                <p className="text-gray-600 dark:text-gray-400">{idea.srs.team}</p>
              </div>
              <div className={`p-4 rounded-lg border ${theme.border} ${theme.darkBorder}`}>
                <h5 className={`font-semibold ${theme.textPrimary} ${theme.darkTextPrimary} mb-2`}>Budget</h5>
                <p className="text-gray-600 dark:text-gray-400">{idea.srs.budget}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const FeedbackModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6 md:p-8 overflow-auto" style={{ minHeight: '100vh', minHeight: '100dvh' }}>
      <div className={`${theme.cardBg} ${theme.darkCardBg} rounded-xl w-full max-w-sm sm:max-w-md lg:max-w-2xl mx-auto my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] md:max-h-[calc(100vh-4rem)] overflow-y-auto`} style={{ scrollbarWidth: 'thin', scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent' }}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary}`}>
              Submit Feedback
            </h2>
            <Button variant="ghost" onClick={onClose}>✕</Button>
          </div>
          
          <form className="space-y-4">
            <div>
              <label className={`block text-sm font-medium ${theme.textPrimary} ${theme.darkTextPrimary} mb-2`}>
                Feedback Type
              </label>
              <select className={`w-full p-3 border ${theme.border} ${theme.darkBorder} rounded-lg ${theme.cardBg} ${theme.darkCardBg} ${theme.textPrimary} ${theme.darkTextPrimary}`}>
                <option>General Feedback</option>
                <option>Bug Report</option>
                <option>Feature Request</option>
                <option>Idea Suggestion</option>
              </select>
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${theme.textPrimary} ${theme.darkTextPrimary} mb-2`}>
                Subject
              </label>
              <input
                type="text"
                placeholder="Brief description of your feedback"
                className={`w-full p-3 border ${theme.border} ${theme.darkBorder} rounded-lg ${theme.cardBg} ${theme.darkCardBg} ${theme.textPrimary} ${theme.darkTextPrimary}`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${theme.textPrimary} ${theme.darkTextPrimary} mb-2`}>
                Detailed Feedback
              </label>
              <textarea
                rows={6}
                placeholder="Please provide detailed feedback..."
                className={`w-full p-3 border ${theme.border} ${theme.darkBorder} rounded-lg ${theme.cardBg} ${theme.darkCardBg} ${theme.textPrimary} ${theme.darkTextPrimary}`}
              />
            </div>
            
            <div>
              <label className={`block text-sm font-medium ${theme.textPrimary} ${theme.darkTextPrimary} mb-2`}>
                Priority Level
              </label>
              <div className="flex space-x-4">
                {['Low', 'Medium', 'High', 'Critical'].map((level) => (
                  <label key={level} className="flex items-center space-x-2">
                    <input type="radio" name="priority" value={level} />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{level}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="flex space-x-4 pt-4">
              <Button
                type="submit"
                className={`flex-1 bg-gradient-to-r ${theme.gradient} hover:opacity-90`}
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Feedback
              </Button>
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.background} ${theme.darkBackground} pt-16 py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary} mb-4`}>
            💡 Innovation Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-6">
            Discover, share, and collaborate on innovative project ideas across all engineering branches
          </p>
          <div className="flex justify-center space-x-4">
            <Button 
              onClick={() => setShowAddIdea(true)}
              className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90`}
            >
              <Plus className="w-4 h-4 mr-2" />
              Submit New Idea
            </Button>
            <Button 
              variant="outline"
              onClick={() => setShowFeedback(true)}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Give Feedback
            </Button>
          </div>
        </div>

        {/* Categories */}
        <div className="mb-8">
          <h2 className={`text-2xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary} mb-6`}>
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant={selectedCategory === category.id ? "default" : "outline"}
                className={`flex flex-col items-center p-4 h-auto space-y-2 ${
                  selectedCategory === category.id 
                    ? `bg-gradient-to-r ${category.color} text-white` 
                    : 'hover:shadow-md'
                }`}
              >
                <category.icon className="w-6 h-6" />
                <span className="text-xs font-medium text-center leading-tight">
                  {category.label}
                </span>
              </Button>
            ))}
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder} text-center p-4`}>
            <div className={`text-2xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary}`}>247</div>
            <div className="text-sm text-gray-500">Total Ideas</div>
          </Card>
          <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder} text-center p-4`}>
            <div className={`text-2xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary}`}>89</div>
            <div className="text-sm text-gray-500">Active Projects</div>
          </Card>
          <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder} text-center p-4`}>
            <div className={`text-2xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary}`}>156</div>
            <div className="text-sm text-gray-500">Contributors</div>
          </Card>
          <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder} text-center p-4`}>
            <div className={`text-2xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary}`}>23</div>
            <div className="text-sm text-gray-500">Completed</div>
          </Card>
        </div>

        {/* Ideas Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className={`text-2xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary}`}>
              {selectedCategory === 'all' ? 'All Ideas' : categories.find(c => c.id === selectedCategory)?.label}
              <span className="ml-2 text-lg text-gray-500">({filteredIdeas.length})</span>
            </h2>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <TrendingUp className="w-4 h-4 mr-2" />
                Sort
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </div>

        {/* Featured Section */}
        <div className="mt-12">
          <h2 className={`text-2xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary} mb-6 flex items-center`}>
            <Star className="w-6 h-6 mr-2 text-yellow-500" />
            Featured Ideas
          </h2>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {ideas.filter(idea => idea.featured).map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </div>

        {/* Modals */}
        {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
      </div>
    </div>
  );
};

export default IdeasPage;