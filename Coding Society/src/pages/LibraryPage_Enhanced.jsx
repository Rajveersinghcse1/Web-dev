import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
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
import studentService from '../services/studentService';

const EnhancedLibraryPage = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);

  // State for dynamic data
  const [libraryContent, setLibraryContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadLibraryContent = async () => {
      try {
        setIsLoading(true);
        const response = await studentService.getLibraryContent();
        if (response.success) {
          setLibraryContent(response.data.content);
        }
      } catch (err) {
        console.error("Failed to load library content", err);
      } finally {
        setIsLoading(false);
      }
    };
    loadLibraryContent();
  }, []);

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
      publisher: 'O\'Reilly Media',
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
      publisher: 'MIT Press',
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
      publisher: 'Packt Publishing',
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
      publisher: 'Springer',
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
      publisher: 'Manning Publications',
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

    // Add fetched content
    const mappedContent = libraryContent.map(item => ({
      id: item._id,
      title: item.title,
      subject: item.subject || item.category,
      type: item.type,
      category: item.category,
      author: item.uploadedBy?.username || 'Unknown',
      rating: item.metrics?.rating || 0,
      downloads: item.metrics?.downloads || 0,
      views: item.metrics?.views || 0,
      difficulty: item.difficulty || 'Intermediate',
      tags: item.tags || [],
      contentType: ['book', 'reference'].includes(item.type) ? 'book' : ['exam_paper', 'practice_problems'].includes(item.type) ? 'paper' : 'note',
      description: item.description,
      thumbnail: '📚',
      format: 'PDF',
      size: 'Unknown',
      lastModified: item.updatedAt,
      isPremium: false
    }));

    // Add mapped content based on tab
    if (selectedTab === 'all') {
      materials.push(...mappedContent);
    } else {
      if (selectedTab === 'notes') materials.push(...mappedContent.filter(i => i.contentType === 'note'));
      if (selectedTab === 'papers') materials.push(...mappedContent.filter(i => i.contentType === 'paper'));
      if (selectedTab === 'books') materials.push(...mappedContent.filter(i => i.contentType === 'book'));
    }

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
      <Card key={material.id} className="group bg-white border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden hover:border-blue-400 flex flex-col h-full max-h-[400px]">
        <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-white border-b border-slate-100">
          <div className="flex items-start gap-3">
            {/* Icon - Smaller */}
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl shadow-md">
                {material.thumbnail || '📚'}
              </div>
            </div>

            {/* Title, Writer, Publisher, Rating - Compact */}
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900 text-base line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors leading-tight">
                {material.title}
              </h3>

              {/* Writer & Publisher - Inline */}
              <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-slate-600 mb-1.5">
                <span><span className="font-semibold text-slate-700">Writer:</span> {material.author || material.instructor || 'Unknown'}</span>
                {(material.publisher || material.university) && (
                  <span><span className="font-semibold text-slate-700">Publisher:</span> {material.publisher || material.university}</span>
                )}
              </div>

              {/* Rating - Compact */}
              <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-md border border-yellow-200 w-fit">
                <Star className="w-3 h-3 text-yellow-600 fill-current" />
                <span className="text-xs font-bold text-slate-900">{material.rating || 'N/A'}</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-2 pb-3 flex-1 flex flex-col overflow-hidden">
          {/* Summary - Compact */}
          <div className="mb-2 p-2 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100">
            <p className="text-xs text-slate-700 leading-snug line-clamp-2">
              {material.aiSummary || material.description || 'No summary available.'}
            </p>
          </div>

          {/* Stats - Compact 3-Column Grid: Pages, Downloads, Views */}
          <div className="grid grid-cols-3 gap-1.5 mb-2">
            <div className="bg-slate-50 rounded-lg p-1.5 border border-slate-200 text-center">
              <p className="text-[10px] text-slate-600 mb-0.5">Pages</p>
              <p className="font-bold text-slate-900 text-xs">{material.pages || 'N/A'}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-1.5 border border-green-200 text-center">
              <p className="text-[10px] text-green-700 mb-0.5">Downloads</p>
              <p className="font-bold text-green-700 text-xs">{material.downloads?.toLocaleString() || '0'}</p>
            </div>
            <div className="bg-blue-50 rounded-lg p-1.5 border border-blue-200 text-center">
              <p className="text-[10px] text-blue-700 mb-0.5">Views</p>
              <p className="font-bold text-blue-700 text-xs">{material.views?.toLocaleString() || '0'}</p>
            </div>
          </div>

          {/* Action Buttons - Compact */}
          <div className="grid grid-cols-4 gap-1.5 mt-auto">
            <Button className="col-span-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-8 text-xs font-semibold shadow-md hover:shadow-lg transition-all duration-300 rounded-lg">
              <Eye className="w-3 h-3 mr-1" />
              Read
            </Button>
            <Button variant="outline" className="h-8 border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 rounded-lg text-xs font-medium px-2">
              <Download className="w-3 h-3 mr-0.5" />
              <span className="hidden sm:inline text-[10px]">Save</span>
            </Button>
            <Button variant="outline" className="h-8 border-slate-300 hover:bg-slate-50 hover:border-slate-400 text-slate-700 rounded-lg text-xs font-medium px-2">
              <Share className="w-3 h-3 mr-0.5" />
              <span className="hidden sm:inline text-[10px]">Share</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header - Single Row Layout */}
        <div className="mb-12">
          <div className="mb-8">
            {/* Title and Description in One Row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
                  <Library className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900">
                    Digital Learning Library
                  </h1>
                  <p className="text-base text-slate-600 mt-1">
                    Access premium educational content, interactive study materials, and comprehensive exam resources powered by AI.
                  </p>
                </div>
              </div>
            </div>

            {/* Search Bar and Filters in One Row */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  placeholder="Search notes, papers, books..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 text-base rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>
              <Button
                variant="outline"
                className="h-12 px-6 rounded-xl border-slate-300 hover:bg-slate-50 text-slate-700 shadow-sm"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </Button>
              <Button className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300">
                <Upload className="w-5 h-5 mr-2" />
                Upload
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-slate-200 p-6 mb-8 shadow-xl">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Filter & Sort</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Sort By</label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="w-full p-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="downloads">Most Downloaded</option>
                    <option value="recent">Most Recent</option>
                    <option value="title">Alphabetical</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">View Mode</label>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 rounded-xl ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'border-slate-200 text-slate-600'}`}
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Grid
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={`flex-1 rounded-xl ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'border-slate-200 text-slate-600'}`}
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
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-12">
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl group">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1 group-hover:scale-110 transition-transform">348</div>
              <div className="text-xs text-slate-600 font-medium">Study Materials</div>
              <div className="text-xs text-green-600 mt-1 font-medium">+12 this week</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl group">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1 group-hover:scale-110 transition-transform">156</div>
              <div className="text-xs text-slate-600 font-medium">Exam Papers</div>
              <div className="text-xs text-green-600 mt-1 font-medium">+8 this week</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl group">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1 group-hover:scale-110 transition-transform">892</div>
              <div className="text-xs text-slate-600 font-medium">Reference Books</div>
              <div className="text-xs text-green-600 mt-1 font-medium">+5 this week</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl group">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-orange-600 mb-1 group-hover:scale-110 transition-transform">12.8k</div>
              <div className="text-xs text-slate-600 font-medium">Monthly Downloads</div>
              <div className="text-xs text-green-600 mt-1 font-medium">+23% growth</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl group">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-pink-600 mb-1 group-hover:scale-110 transition-transform">4.8</div>
              <div className="text-xs text-slate-600 font-medium">Avg Rating</div>
              <div className="text-xs text-green-600 mt-1 font-medium">+0.1 this month</div>
            </CardContent>
          </Card>
          <Card className="bg-white/80 backdrop-blur-sm border-slate-200 shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl group">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-cyan-600 mb-1 group-hover:scale-110 transition-transform">89%</div>
              <div className="text-xs text-slate-600 font-medium">Success Rate</div>
              <div className="text-xs text-green-600 mt-1 font-medium">+3% this month</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content - Full Width */}
        <div>
          <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
            <TabsList className="inline-flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
              <TabsTrigger
                value="all"
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg bg-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-900 hover:bg-slate-50 transition-all duration-200"
              >
                <Library className="w-4 h-4" />
                All Content
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg bg-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-900 hover:bg-slate-50 transition-all duration-200"
              >
                <FileText className="w-4 h-4" />
                Study Notes
              </TabsTrigger>
              <TabsTrigger
                value="papers"
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg bg-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-900 hover:bg-slate-50 transition-all duration-200"
              >
                <GraduationCap className="w-4 h-4" />
                Exam Papers
              </TabsTrigger>
              <TabsTrigger
                value="books"
                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold rounded-lg bg-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-md text-slate-900 hover:bg-slate-50 transition-all duration-200"
              >
                <Book className="w-4 h-4" />
                Reference Books
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">All Learning Materials</h2>
                  <p className="text-slate-600">{filteredMaterials.length} resources found</p>
                </div>
              </div>
              <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1'} gap-6`}>
                {filteredMaterials.map(renderMaterialCard)}
              </div>
            </TabsContent>

            <TabsContent value="notes" className="space-y-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Study Notes</h2>
                  <p className="text-slate-600">Premium educational content with AI-powered insights</p>
                </div>
              </div>
              <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1'} gap-6`}>
                {filteredMaterials.filter(item => item.contentType === 'note').map(renderMaterialCard)}
              </div>
            </TabsContent>

            <TabsContent value="papers" className="space-y-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Exam Papers</h2>
                  <p className="text-slate-600">Practice with real exam papers from top universities</p>
                </div>
              </div>
              <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1'} gap-6`}>
                {filteredMaterials.filter(item => item.contentType === 'paper').map(renderMaterialCard)}
              </div>
            </TabsContent>

            <TabsContent value="books" className="space-y-6 mt-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Reference Books</h2>
                  <p className="text-slate-600">Comprehensive textbooks and reference materials</p>
                </div>
              </div>
              <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'md:grid-cols-2 lg:grid-cols-3' : 'md:grid-cols-1'} gap-6`}>
                {filteredMaterials.filter(item => item.contentType === 'book').map(renderMaterialCard)}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default EnhancedLibraryPage;