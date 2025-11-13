import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { useMode } from '../context/ModeContext';
import {
  BookOpen,
  FileText,
  GraduationCap,
  Download,
  Upload,
  Search,
  Filter,
  Star,
  Heart,
  Share,
  Bookmark,
  Calendar,
  Clock,
  Users,
  Eye,
  MoreVertical,
  FolderOpen,
  File,
  Award,
  Target,
  TrendingUp,
  Book,
  PenTool,
  Layers,
  Archive,
  PlayCircle,
  Brain,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  Settings,
  RefreshCw,
  Zap,
  Globe,
  Shield,
  Headphones,
  Video,
  MessageSquare,
  UserCheck,
  BarChart3,
  PieChart,
  LineChart,
  TrendingDown,
  Activity,
  MonitorPlay,
  Cpu,
  Database,
  Cloud,
  Code,
  Terminal,
  Palette,
  Briefcase,
  Medal,
  Trophy,
  BookMarked,
  Library,
  GraduationCapIcon,
  School,
  Microscope,
  Calculator,
  Atom,
  FlaskConical
} from 'lucide-react';

const EnhancedLibraryPage = () => {
  const { getCurrentTheme, currentMode, MODES } = useMode();
  const theme = getCurrentTheme();
  
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // Enhanced data with more realistic content for an educational platform
  const studyMaterials = [
    {
      id: 1,
      title: 'Advanced JavaScript Fundamentals & ES6+',
      subject: 'Web Development',
      type: 'Study Notes',
      category: 'Programming',
      pages: 85,
      lastModified: '2 days ago',
      author: 'Dr. Sarah Johnson',
      authorType: 'Professor',
      rating: 4.9,
      downloads: 2450,
      views: 15680,
      difficulty: 'Intermediate',
      tags: ['JavaScript', 'ES6', 'Programming', 'Web Dev', 'Frontend'],
      thumbnail: '🚀',
      size: '4.2 MB',
      format: 'PDF',
      isPremium: false,
      hasVideo: true,
      hasAudio: false,
      aiSummary: 'Comprehensive guide covering modern JavaScript features including async/await, destructuring, and modules.',
      completionRate: 85,
      estimatedTime: '6 hours',
      prerequisites: ['Basic JavaScript', 'HTML/CSS'],
      learningOutcomes: ['Master ES6+ features', 'Understand async programming', 'Build modern web applications']
    },
    {
      id: 2,
      title: 'Data Structures & Algorithms Masterclass',
      subject: 'Computer Science',
      type: 'Study Notes',
      category: 'Computer Science',
      pages: 156,
      lastModified: '1 week ago',
      author: 'Prof. Michael Chen',
      authorType: 'Professor',
      rating: 4.95,
      downloads: 5420,
      views: 23450,
      difficulty: 'Advanced',
      tags: ['DSA', 'Algorithms', 'Computer Science', 'Problem Solving', 'Coding'],
      thumbnail: '📊',
      size: '8.7 MB',
      format: 'PDF',
      isPremium: true,
      hasVideo: true,
      hasAudio: true,
      aiSummary: 'Complete coverage of essential data structures and algorithms with practical implementations and complexity analysis.',
      completionRate: 75,
      estimatedTime: '12 hours',
      prerequisites: ['Programming Basics', 'Mathematics Fundamentals'],
      learningOutcomes: ['Analyze algorithmic complexity', 'Implement core data structures', 'Solve complex problems efficiently']
    },
    {
      id: 3,
      title: 'React Advanced Patterns & State Management',
      subject: 'Frontend Development',
      type: 'Study Notes',
      category: 'Programming',
      pages: 74,
      lastModified: '3 days ago',
      author: 'Emily Davis',
      authorType: 'Industry Expert',
      rating: 4.8,
      downloads: 1890,
      views: 8950,
      difficulty: 'Advanced',
      tags: ['React', 'State Management', 'Patterns', 'Redux', 'Context API'],
      thumbnail: '⚛️',
      size: '3.1 MB',
      format: 'PDF',
      isPremium: false,
      hasVideo: true,
      hasAudio: false,
      aiSummary: 'Deep dive into React patterns, hooks, state management solutions, and performance optimization techniques.',
      completionRate: 92,
      estimatedTime: '8 hours',
      prerequisites: ['React Basics', 'JavaScript ES6+'],
      learningOutcomes: ['Master React patterns', 'Implement state management', 'Optimize React applications']
    },
    {
      id: 4,
      title: 'Machine Learning Mathematics Foundation',
      subject: 'Artificial Intelligence',
      type: 'Study Notes',
      category: 'AI/ML',
      pages: 120,
      lastModified: '5 days ago',
      author: 'Dr. Alex Rodriguez',
      authorType: 'Researcher',
      rating: 4.7,
      downloads: 3240,
      views: 12780,
      difficulty: 'Advanced',
      tags: ['Machine Learning', 'Mathematics', 'Linear Algebra', 'Statistics', 'AI'],
      thumbnail: '🧠',
      size: '6.8 MB',
      format: 'PDF',
      isPremium: true,
      hasVideo: false,
      hasAudio: true,
      aiSummary: 'Essential mathematical concepts for machine learning including linear algebra, calculus, and probability theory.',
      completionRate: 68,
      estimatedTime: '15 hours',
      prerequisites: ['Calculus', 'Statistics', 'Linear Algebra'],
      learningOutcomes: ['Understand ML mathematics', 'Apply mathematical concepts', 'Build ML models from scratch']
    },
    {
      id: 5,
      title: 'Cloud Architecture & DevOps Practices',
      subject: 'Cloud Computing',
      type: 'Study Notes',
      category: 'DevOps',
      pages: 98,
      lastModified: '1 day ago',
      author: 'James Wilson',
      authorType: 'Cloud Architect',
      rating: 4.85,
      downloads: 2680,
      views: 11200,
      difficulty: 'Intermediate',
      tags: ['Cloud', 'DevOps', 'AWS', 'Docker', 'Kubernetes', 'CI/CD'],
      thumbnail: '☁️',
      size: '5.4 MB',
      format: 'PDF',
      isPremium: false,
      hasVideo: true,
      hasAudio: true,
      aiSummary: 'Comprehensive guide to cloud architecture patterns, DevOps practices, and modern deployment strategies.',
      completionRate: 78,
      estimatedTime: '10 hours',
      prerequisites: ['Basic Networking', 'Linux Fundamentals'],
      learningOutcomes: ['Design cloud solutions', 'Implement DevOps pipelines', 'Master containerization']
    }
  ];

  const examPapers = [
    {
      id: 1,
      title: 'Advanced Computer Networks Final Exam 2024',
      subject: 'Computer Networks',
      category: 'Computer Science',
      year: '2024',
      semester: 'Fall',
      duration: '3 hours',
      marks: 100,
      difficulty: 'Advanced',
      university: 'MIT',
      instructor: 'Dr. Jennifer Lee',
      downloads: 1543,
      views: 8920,
      format: 'PDF',
      size: '2.1 MB',
      hasAnswerKey: true,
      hasSolutions: true,
      topics: ['Network Protocols', 'Security', 'Performance Analysis', 'Wireless Networks'],
      avgScore: 78,
      passRate: 85,
      timeLimit: '180 minutes'
    },
    {
      id: 2,
      title: 'Database Management Systems Comprehensive Exam',
      subject: 'Database Systems',
      category: 'Computer Science',
      year: '2024',
      semester: 'Spring',
      duration: '2.5 hours',
      marks: 120,
      difficulty: 'Intermediate',
      university: 'Stanford University',
      instructor: 'Prof. Michael Zhang',
      downloads: 2189,
      views: 12450,
      format: 'PDF',
      size: '1.8 MB',
      hasAnswerKey: true,
      hasSolutions: true,
      topics: ['SQL', 'Normalization', 'Transactions', 'Query Optimization'],
      avgScore: 82,
      passRate: 91,
      timeLimit: '150 minutes'
    },
    {
      id: 3,
      title: 'Machine Learning Theory & Applications Final',
      subject: 'Artificial Intelligence',
      category: 'AI/ML',
      year: '2024',
      semester: 'Fall',
      duration: '4 hours',
      marks: 150,
      difficulty: 'Expert',
      university: 'Carnegie Mellon',
      instructor: 'Dr. Sarah Kim',
      downloads: 3234,
      views: 18760,
      format: 'PDF',
      size: '3.2 MB',
      hasAnswerKey: false,
      hasSolutions: true,
      topics: ['Supervised Learning', 'Neural Networks', 'Deep Learning', 'Model Evaluation'],
      avgScore: 71,
      passRate: 76,
      timeLimit: '240 minutes'
    }
  ];

  const referenceBooks = [
    {
      id: 1,
      title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
      author: 'Robert C. Martin',
      category: 'Programming',
      pages: 464,
      rating: 4.9,
      published: '2008',
      publisher: 'Prentice Hall',
      language: 'English',
      available: true,
      format: 'PDF',
      size: '15.2 MB',
      isbn: '978-0132350884',
      edition: '1st Edition',
      price: 'Free',
      description: 'A comprehensive guide to writing clean, maintainable code with practical examples and best practices.',
      topics: ['Code Quality', 'Refactoring', 'Testing', 'Design Patterns'],
      readingTime: '12 hours',
      difficulty: 'Intermediate'
    },
    {
      id: 2,
      title: 'Introduction to Algorithms (CLRS)',
      author: 'Thomas H. Cormen, Charles E. Leiserson',
      category: 'Computer Science',
      pages: 1312,
      rating: 4.8,
      published: '2009',
      publisher: 'MIT Press',
      language: 'English',
      available: true,
      format: 'PDF',
      size: '42.8 MB',
      isbn: '978-0262033848',
      edition: '3rd Edition',
      price: 'Premium',
      description: 'The definitive guide to algorithms and data structures used in computer science courses worldwide.',
      topics: ['Algorithms', 'Data Structures', 'Complexity Analysis', 'Graph Theory'],
      readingTime: '40 hours',
      difficulty: 'Advanced'
    },
    {
      id: 3,
      title: 'Artificial Intelligence: A Modern Approach',
      author: 'Stuart Russell, Peter Norvig',
      category: 'AI/ML',
      pages: 1152,
      rating: 4.7,
      published: '2020',
      publisher: 'Pearson',
      language: 'English',
      available: true,
      format: 'PDF',
      size: '38.5 MB',
      isbn: '978-0134610993',
      edition: '4th Edition',
      price: 'Premium',
      description: 'Comprehensive introduction to AI covering machine learning, natural language processing, and robotics.',
      topics: ['Machine Learning', 'Neural Networks', 'Natural Language Processing', 'Computer Vision'],
      readingTime: '35 hours',
      difficulty: 'Advanced'
    }
  ];

  const categories = [
    { id: 'all', name: 'All Categories', icon: Library, count: studyMaterials.length + examPapers.length + referenceBooks.length },
    { id: 'Programming', name: 'Programming', icon: Code, count: 8 },
    { id: 'Computer Science', name: 'Computer Science', icon: Cpu, count: 12 },
    { id: 'AI/ML', name: 'AI/ML', icon: Brain, count: 6 },
    { id: 'DevOps', name: 'DevOps', icon: Cloud, count: 4 },
    { id: 'Mathematics', name: 'Mathematics', icon: Calculator, count: 5 },
    { id: 'Physics', name: 'Physics', icon: Atom, count: 3 },
    { id: 'Chemistry', name: 'Chemistry', icon: FlaskConical, count: 2 }
  ];

  const difficultyColors = {
    'Beginner': 'bg-green-100 text-green-800 border-green-200',
    'Intermediate': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Advanced': 'bg-orange-100 text-orange-800 border-orange-200',
    'Expert': 'bg-red-100 text-red-800 border-red-200'
  };

  // Filter and sort logic
  const filteredMaterials = useMemo(() => {
    let materials = [];
    
    if (selectedTab === 'all' || selectedTab === 'notes') {
      materials.push(...studyMaterials.map(item => ({ ...item, contentType: 'note' })));
    }
    if (selectedTab === 'all' || selectedTab === 'papers') {
      materials.push(...examPapers.map(item => ({ ...item, contentType: 'paper' })));
    }
    if (selectedTab === 'all' || selectedTab === 'books') {
      materials.push(...referenceBooks.map(item => ({ ...item, contentType: 'book' })));
    }

    // Apply filters
    if (searchTerm) {
      materials = materials.filter(item =>
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.author?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedCategory !== 'all') {
      materials = materials.filter(item => item.category === selectedCategory);
    }

    // Apply sorting
    materials.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'downloads':
          return (b.downloads || 0) - (a.downloads || 0);
        case 'recent':
          return new Date(b.lastModified || b.published || 0) - new Date(a.lastModified || a.published || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return materials;
  }, [selectedTab, searchTerm, selectedCategory, sortBy]);

  const renderMaterialCard = (material) => {
    const isNote = material.contentType === 'note';
    const isPaper = material.contentType === 'paper';
    const isBook = material.contentType === 'book';

    return (
      <Card key={material.id} className="group bg-white border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="text-3xl flex-shrink-0">{material.thumbnail || '📚'}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 mb-1">
                  {material.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  by {material.author || material.instructor}
                  {material.authorType && (
                    <span className="ml-1 text-xs text-gray-500">({material.authorType})</span>
                  )}
                </p>
                
                {/* Enhanced metadata */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    {material.pages || material.duration} {material.pages ? 'pages' : ''}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {material.estimatedTime || material.timeLimit || 'Self-paced'}
                  </span>
                  {material.format && (
                    <span className="flex items-center gap-1">
                      <File className="w-3 h-3" />
                      {material.format}
                    </span>
                  )}
                </div>

                {/* Difficulty and Premium badges */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full border ${difficultyColors[material.difficulty]}`}>
                    {material.difficulty}
                  </span>
                  {material.isPremium && (
                    <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1">
                      <Star className="w-3 h-3" />
                      Premium
                    </span>
                  )}
                  {material.hasVideo && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                      <Video className="w-3 h-3" />
                      Video
                    </span>
                  )}
                  {material.hasAudio && (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                      <Headphones className="w-3 h-3" />
                      Audio
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{material.rating}</span>
              </div>
              <Button variant="ghost" size="sm">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* AI Summary for notes */}
          {isNote && material.aiSummary && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">AI Summary</span>
              </div>
              <p className="text-sm text-blue-700">{material.aiSummary}</p>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(material.tags || material.topics)?.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 hover:bg-gray-200 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
            {(material.tags || material.topics)?.length > 3 && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-500">
                +{(material.tags || material.topics).length - 3} more
              </span>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm mb-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Downloads:</span>
              <span className="font-medium text-gray-900 flex items-center gap-1">
                <Download className="w-3 h-3" />
                {material.downloads?.toLocaleString() || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Views:</span>
              <span className="font-medium text-gray-900 flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {material.views?.toLocaleString() || 'N/A'}
              </span>
            </div>
            {material.completionRate && (
              <div className="flex items-center justify-between col-span-2">
                <span className="text-gray-600">Completion Rate:</span>
                <span className="font-medium text-green-600">{material.completionRate}%</span>
              </div>
            )}
            {isPaper && material.avgScore && (
              <div className="flex items-center justify-between col-span-2">
                <span className="text-gray-600">Average Score:</span>
                <span className="font-medium text-blue-600">{material.avgScore}%</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <Button className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90 flex-1 text-sm`}>
              <Eye className="w-4 h-4 mr-2" />
              {isNote ? 'Study Now' : isPaper ? 'View Paper' : 'Read Book'}
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Bookmark className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={`min-h-screen ${theme.background} pt-16 py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${theme.gradient} flex items-center justify-center shadow-xl mb-4`}>
              <Library className="w-10 h-10 text-white" />
            </div>
            <h1 className={`text-5xl font-bold ${theme.textPrimary} mb-2`}>
              Digital Learning Library
            </h1>
            <p className={`text-xl ${theme.textSecondary} max-w-2xl mx-auto mb-6`}>
              Access premium educational content, interactive study materials, and comprehensive exam resources powered by AI
            </p>
            
            {/* Enhanced Search Bar */}
            <div className="max-w-4xl mx-auto">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search notes, papers, books, or ask AI anything..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 bg-white border-gray-200 text-lg rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2"
                  >
                    <Brain className="w-5 h-5 text-blue-500" />
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  className="h-14 px-6 rounded-xl border-gray-200"
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter className="w-5 h-5 mr-2" />
                  Filters
                </Button>
                <Button className={`h-14 px-8 bg-gradient-to-r ${theme.gradient} hover:opacity-90 rounded-xl`}>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Content
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter & Sort</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="downloads">Most Downloaded</option>
                    <option value="recent">Most Recent</option>
                    <option value="title">Alphabetical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">View Mode</label>
                  <div className="flex gap-2">
                    <Button 
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="flex-1"
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Grid
                    </Button>
                    <Button 
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="flex-1"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      List
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className={`${theme.cardBg} border ${theme.border} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${theme.accent1} mb-1`}>348</div>
              <div className={`text-xs ${theme.textSecondary}`}>Study Materials</div>
              <div className="text-xs text-green-600 mt-1">+12 this week</div>
            </CardContent>
          </Card>
          <Card className={`${theme.cardBg} border ${theme.border} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">156</div>
              <div className={`text-xs ${theme.textSecondary}`}>Exam Papers</div>
              <div className="text-xs text-green-600 mt-1">+8 this week</div>
            </CardContent>
          </Card>
          <Card className={`${theme.cardBg} border ${theme.border} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${theme.accent2} mb-1`}>892</div>
              <div className={`text-xs ${theme.textSecondary}`}>Reference Books</div>
              <div className="text-xs text-green-600 mt-1">+5 this week</div>
            </CardContent>
          </Card>
          <Card className={`${theme.cardBg} border ${theme.border} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1">12.8k</div>
              <div className={`text-xs ${theme.textSecondary}`}>Monthly Downloads</div>
              <div className="text-xs text-green-600 mt-1">+23% growth</div>
            </CardContent>
          </Card>
          <Card className={`${theme.cardBg} border ${theme.border} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">4.8</div>
              <div className={`text-xs ${theme.textSecondary}`}>Avg Rating</div>
              <div className="text-xs text-green-600 mt-1">+0.1 this month</div>
            </CardContent>
          </Card>
          <Card className={`${theme.cardBg} border ${theme.border} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">89%</div>
              <div className={`text-xs ${theme.textSecondary}`}>Success Rate</div>
              <div className="text-xs text-green-600 mt-1">+3% this month</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
              <TabsList className="grid w-full grid-cols-4 bg-gray-100 p-1 rounded-xl">
                <TabsTrigger value="all" className="flex items-center gap-2 text-sm font-medium rounded-lg">
                  <Library className="w-4 h-4" />
                  All Content
                </TabsTrigger>
                <TabsTrigger value="notes" className="flex items-center gap-2 text-sm font-medium rounded-lg">
                  <FileText className="w-4 h-4" />
                  Study Notes
                </TabsTrigger>
                <TabsTrigger value="papers" className="flex items-center gap-2 text-sm font-medium rounded-lg">
                  <GraduationCap className="w-4 h-4" />
                  Exam Papers
                </TabsTrigger>
                <TabsTrigger value="books" className="flex items-center gap-2 text-sm font-medium rounded-lg">
                  <Book className="w-4 h-4" />
                  Reference Books
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-6 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">All Learning Materials</h2>
                    <p className="text-gray-600">{filteredMaterials.length} resources found</p>
                  </div>
                </div>
                <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
                  {filteredMaterials.map(renderMaterialCard)}
                </div>
              </TabsContent>

              <TabsContent value="notes" className="space-y-6 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Study Notes</h2>
                    <p className="text-gray-600">Premium educational content with AI-powered insights</p>
                  </div>
                </div>
                <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
                  {filteredMaterials.filter(item => item.contentType === 'note').map(renderMaterialCard)}
                </div>
              </TabsContent>

              <TabsContent value="papers" className="space-y-6 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Exam Papers</h2>
                    <p className="text-gray-600">Practice with real exam papers from top universities</p>
                  </div>
                </div>
                <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
                  {filteredMaterials.filter(item => item.contentType === 'paper').map(renderMaterialCard)}
                </div>
              </TabsContent>

              <TabsContent value="books" className="space-y-6 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Reference Books</h2>
                    <p className="text-gray-600">Comprehensive textbooks and reference materials</p>
                  </div>
                </div>
                <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
                  {filteredMaterials.filter(item => item.contentType === 'book').map(renderMaterialCard)}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Enhanced Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Quick Categories */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Quick Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {categories.slice(1, 6).map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <div 
                      key={category.id}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedCategory === category.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="flex items-center gap-3">
                        <IconComponent className={`w-4 h-4 ${selectedCategory === category.id ? 'text-blue-600' : 'text-gray-500'}`} />
                        <span className={`text-sm font-medium ${selectedCategory === category.id ? 'text-blue-900' : 'text-gray-700'}`}>
                          {category.name}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        selectedCategory === category.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {category.count}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* AI Study Assistant */}
            <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-purple-900 text-lg flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI Study Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-purple-700">
                  Get personalized study recommendations and instant answers to your questions.
                </p>
                <div className="space-y-2">
                  <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Ask AI Anything
                  </Button>
                  <Button variant="outline" className="w-full border-purple-200 text-purple-700 hover:bg-purple-50">
                    <Lightbulb className="w-4 h-4 mr-2" />
                    Get Study Plan
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Learning Progress */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Learning Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">JavaScript Course</span>
                      <span className="text-gray-900 font-medium">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">React Patterns</span>
                      <span className="text-gray-900 font-medium">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600">Algorithms</span>
                      <span className="text-gray-900 font-medium">68%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-600 h-2 rounded-full" style={{ width: '68%' }}></div>
                    </div>
                  </div>
                </div>
                <Button variant="outline" className="w-full">
                  <Activity className="w-4 h-4 mr-2" />
                  View Full Report
                </Button>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button className={`w-full bg-gradient-to-r ${theme.gradient} hover:opacity-90`}>
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Content
                  </Button>
                  <Button variant="outline" className="w-full">
                    <BookMarked className="w-4 h-4 mr-2" />
                    My Bookmarks
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    My Downloads
                  </Button>
                  <Button variant="outline" className="w-full">
                    <Users className="w-4 h-4 mr-2" />
                    Study Groups
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                    <Download className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Downloaded React Notes</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Completed JS Course</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-purple-50 flex items-center justify-center">
                    <Star className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Rated ML Course</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLibraryPage;