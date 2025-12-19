import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { useMode } from '../context/ModeContext';
import studentService from '../services/studentService';
import {
  BookOpen,
  FileText,
  GraduationCap,
  Download,
  Upload,
  Search,
  Filter,
  Star,
  Share,
  Bookmark,
  BookMarked,
  Clock,
  Eye,
  MoreVertical,
  File,
  Target,
  Book,
  Layers,
  Brain,
  Lightbulb,
  RefreshCw,
  MessageSquare,
  BarChart3,
  Cpu,
  Cloud,
  Code,
  Calculator,
  Atom,
  FlaskConical,
  ChevronDown,
  Library,
  Video,
  Headphones,
  Zap,
  Activity,
  CheckCircle,
  Users,
  Server,
  Database,
  Globe,
  Terminal,
  Layout,
  Box,
  GitBranch,
  Monitor
} from 'lucide-react';

const StudyPage = () => {
  const { mode } = useMode();
  const isProfessional = mode === 'professional';
  
  const [selectedTab, setSelectedTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('rating');
  const [viewMode, setViewMode] = useState('grid');
  const [showFilters, setShowFilters] = useState(false);
  
  // State for dynamic data from admin panel
  const [libraryContent, setLibraryContent] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalStats, setTotalStats] = useState({
    studyMaterials: 0,
    examPapers: 0,
    referenceBooks: 0,
    monthlyDownloads: 0,
    avgRating: 0,
    successRate: 0
  });

  // Load library content from admin panel
  useEffect(() => {
    const loadLibraryContent = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await studentService.getLibraryContent();
        
        if (response.success && response.data) {
          setLibraryContent(response.data);
          
          // Calculate stats from real data
          const materials = response.data.length;
          const totalViews = response.data.reduce((sum, item) => sum + (item.views || 0), 0);
          const totalRatings = response.data.filter(item => item.rating).length;
          const avgRating = totalRatings > 0 
            ? response.data.reduce((sum, item) => sum + (item.rating || 0), 0) / totalRatings
            : 0;
          
          setTotalStats(prev => ({
            ...prev,
            studyMaterials: materials,
            monthlyDownloads: Math.floor(totalViews * 0.3), // Estimate downloads as 30% of views
            avgRating: Math.round(avgRating * 10) / 10
          }));
        }
      } catch (error) {
        console.error('Error loading library content:', error);
        setError('Failed to load library content. Please try again later.');
        
        // Use fallback data when admin panel is not available
        setLibraryContent([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadLibraryContent();
  }, []);

  // Helper function to get emoji based on category
  const getCategoryEmoji = (category) => {
    const emojiMap = {
      'Programming': '💻',
      'Computer Science': '🖥️',
      'AI/ML': '🤖',
      'Mathematics': '📊',
      'Physics': '🔬',
      'Chemistry': '⚗️',
      'Business': '💼',
      'Design': '🎨',
      'Language': '📚',
      'Frontend': '🎨',
      'Backend': '⚙️',
      'DevOps': '🚀',
      'System Design': '🏗️'
    };
    return emojiMap[category] || '📚';
  };

  // Fallback data for demonstration when no admin content exists
  const fallbackStudyMaterials = [
    {
      id: 1,
      title: 'Advanced JavaScript Fundamentals & ES6+',
      description: 'Comprehensive guide covering modern JavaScript features including async/await, destructuring, and modules.',
      subject: 'Web Development',
      type: 'Study Notes',
      category: 'Programming',
      difficulty: 'Intermediate',
      author: 'Dr. Sarah Johnson',
      rating: 4.9,
      views: 15680,
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['JavaScript', 'ES6', 'Programming', 'Web Dev', 'Frontend'],
      contentType: 'note',
      pages: 85,
      lastModified: '2 days ago',
      authorType: 'Professor',
      downloads: 2450,
      isPremium: false,
      hasVideo: true,
      hasAudio: false,
      aiSummary: 'Comprehensive guide covering modern JavaScript features including async/await, destructuring, and modules.',
      completionRate: 85,
      estimatedTime: '6 hours',
      prerequisites: ['Basic JavaScript', 'HTML/CSS'],
      learningOutcomes: ['Master ES6+ features', 'Understand async programming', 'Build modern web applications'],
      thumbnail: '🚀',
      size: '4.2 MB',
      format: 'PDF'
    },
    {
      id: 2,
      title: 'Data Structures & Algorithms Masterclass',
      description: 'Complete coverage of essential data structures and algorithms with practical implementations.',
      subject: 'Computer Science',
      type: 'Study Notes',
      category: 'Computer Science',
      difficulty: 'Advanced',
      author: 'Prof. Michael Chen',
      rating: 4.95,
      views: 23450,
      createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      tags: ['DSA', 'Algorithms', 'Computer Science', 'Problem Solving'],
      contentType: 'note',
      pages: 156,
      lastModified: '1 week ago',
      authorType: 'Professor',
      downloads: 5420,
      isPremium: true,
      hasVideo: true,
      hasAudio: true,
      aiSummary: 'Complete coverage of essential data structures and algorithms with practical implementations and complexity analysis.',
      completionRate: 75,
      estimatedTime: '12 hours',
      prerequisites: ['Programming Basics', 'Mathematics Fundamentals'],
      learningOutcomes: ['Analyze algorithmic complexity', 'Implement core data structures', 'Solve complex problems efficiently'],
      thumbnail: '📊',
      size: '8.7 MB',
      format: 'PDF'
    }
  ];

  // Professional Mode Data
  const professionalResources = [
    {
      id: 'p1',
      title: 'System Design Primer',
      description: 'Learn how to design large-scale systems. Prepare for the system design interview.',
      category: 'System Design',
      difficulty: 'Advanced',
      author: 'Donne Martin',
      rating: 5.0,
      views: 120000,
      tags: ['System Design', 'Architecture', 'Scalability'],
      contentType: 'guide',
      estimatedTime: '20 hours',
      thumbnail: <Server className="w-8 h-8 text-purple-500" />,
      isPremium: true
    },
    {
      id: 'p2',
      title: 'Clean Architecture Patterns',
      description: 'A practical guide to implementing Clean Architecture in modern web applications.',
      category: 'Architecture',
      difficulty: 'Intermediate',
      author: 'Robert C. Martin',
      rating: 4.8,
      views: 45000,
      tags: ['Architecture', 'Clean Code', 'Design Patterns'],
      contentType: 'guide',
      estimatedTime: '8 hours',
      thumbnail: <Layout className="w-8 h-8 text-blue-500" />,
      isPremium: false
    },
    {
      id: 'p3',
      title: 'Docker & Kubernetes Handbook',
      description: 'Master containerization and orchestration for production environments.',
      category: 'DevOps',
      difficulty: 'Advanced',
      author: 'Brendan Burns',
      rating: 4.9,
      views: 67000,
      tags: ['Docker', 'Kubernetes', 'DevOps', 'Cloud'],
      contentType: 'guide',
      estimatedTime: '15 hours',
      thumbnail: <Box className="w-8 h-8 text-blue-400" />,
      isPremium: true
    },
    {
      id: 'p4',
      title: 'Advanced React Patterns',
      description: 'Deep dive into compound components, render props, and custom hooks.',
      category: 'Frontend',
      difficulty: 'Advanced',
      author: 'Kent C. Dodds',
      rating: 4.9,
      views: 89000,
      tags: ['React', 'Frontend', 'JavaScript'],
      contentType: 'guide',
      estimatedTime: '10 hours',
      thumbnail: <Atom className="w-8 h-8 text-cyan-400" />,
      isPremium: false
    }
  ];

  // Convert admin content to component format or use fallback
  const studyMaterials = libraryContent.length > 0 ? libraryContent.map(item => ({
    ...item,
    contentType: 'note',
    pages: item.pages || Math.floor(Math.random() * 100) + 20,
    lastModified: studentService.formatDate(item.updatedAt || item.createdAt),
    authorType: 'Content Creator',
    downloads: Math.floor((item.views || 0) * 0.3),
    isPremium: false,
    hasVideo: item.hasVideo || false,
    hasAudio: item.hasAudio || false,
    aiSummary: item.description,
    completionRate: Math.floor(Math.random() * 40) + 60,
    estimatedTime: `${Math.floor(Math.random() * 8) + 2} hours`,
    prerequisites: item.prerequisites || [],
    learningOutcomes: item.learningOutcomes || [],
    thumbnail: getCategoryEmoji(item.category),
    size: `${(Math.random() * 8 + 1).toFixed(1)} MB`,
    format: 'PDF'
  })) : fallbackStudyMaterials;

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
      timeLimit: '180 minutes',
      contentType: 'paper'
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
      timeLimit: '150 minutes',
      contentType: 'paper'
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
      difficulty: 'Intermediate',
      contentType: 'book'
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
      difficulty: 'Advanced',
      contentType: 'book'
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
    
    if (isProfessional) {
      materials = [...professionalResources];
    } else {
      if (selectedTab === 'all' || selectedTab === 'notes') {
        materials.push(...studyMaterials.map(item => ({ ...item, contentType: 'note' })));
      }
      if (selectedTab === 'all' || selectedTab === 'papers') {
        materials.push(...examPapers.map(item => ({ ...item, contentType: 'paper' })));
      }
      if (selectedTab === 'all' || selectedTab === 'books') {
        materials.push(...referenceBooks.map(item => ({ ...item, contentType: 'book' })));
      }
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
  }, [selectedTab, searchTerm, selectedCategory, sortBy, studyMaterials, isProfessional]);

  const renderMaterialCard = (material) => {
    const isNote = material.contentType === 'note';
    const isPaper = material.contentType === 'paper';
    const isBook = material.contentType === 'book';
    const isGuide = material.contentType === 'guide';

    const handleViewClick = () => {
      console.log('Viewing:', material.title);
      
      if (isNote && material.fileUrl) {
        window.open(studentService.getFileUrl(material.fileUrl), '_blank');
      } else {
        alert(`Opening ${material.title}...`);
      }
    };

    const handleDownloadClick = (e) => {
      e.stopPropagation();
      console.log('Downloading:', material.title);
      
      if (isNote && material.fileUrl) {
        const link = document.createElement('a');
        link.href = studentService.getFileUrl(material.fileUrl);
        link.download = material.title;
        link.click();
      } else {
        alert(`Downloading ${material.title}...`);
      }
    };

    const handleBookmarkClick = (e) => {
      e.stopPropagation();
      console.log('Bookmarking:', material.title);
      alert(`${material.title} bookmarked!`);
    };

    const handleShareClick = (e) => {
      e.stopPropagation();
      console.log('Sharing:', material.title);
      alert(`Sharing ${material.title}...`);
    };

    return (
      <Card key={material.id} className={`group border transition-all duration-300 transform hover:-translate-y-1 cursor-pointer rounded-3xl overflow-hidden ${
        isProfessional 
          ? 'bg-slate-800 border-slate-700 hover:shadow-purple-900/20 hover:border-purple-500/50' 
          : 'bg-white border-gray-100 hover:shadow-xl hover:border-blue-300'
      }`} onClick={handleViewClick}>
        <CardHeader className={`pb-3 ${isProfessional ? 'bg-slate-900/50' : 'bg-gray-50/50'}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className={`text-3xl flex-shrink-0 p-2 rounded-xl shadow-sm ${
                isProfessional ? 'bg-slate-800' : 'bg-white'
              }`}>
                {typeof material.thumbnail === 'string' ? material.thumbnail : material.thumbnail || getCategoryEmoji(material.category)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className={`font-bold text-sm sm:text-base line-clamp-2 mb-1 ${
                  isProfessional ? 'text-white' : 'text-gray-900'
                }`}>
                  {material.title}
                </h3>
                <p className={`text-sm mb-2 ${
                  isProfessional ? 'text-slate-400' : 'text-gray-600'
                }`}>
                  by {material.author || material.instructor}
                  {material.authorType && (
                    <span className={`ml-1 text-xs ${
                      isProfessional ? 'text-slate-500' : 'text-gray-500'
                    }`}>({material.authorType})</span>
                  )}
                </p>
                
                {/* Enhanced metadata */}
                <div className={`flex flex-wrap items-center gap-3 text-xs mb-3 ${
                  isProfessional ? 'text-slate-500' : 'text-gray-500'
                }`}>
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
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg border ${
                isProfessional 
                  ? 'bg-yellow-500/10 border-yellow-500/20' 
                  : 'bg-yellow-50 border-yellow-100'
              }`}>
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className={`text-sm font-bold ${
                  isProfessional ? 'text-white' : 'text-gray-900'
                }`}>{material.rating || 'N/A'}</span>
              </div>
              <Button variant="ghost" size="sm" className={`${
                isProfessional ? 'text-slate-400 hover:text-white' : 'text-gray-400 hover:text-gray-900'
              }`} onClick={(e) => {
                e.stopPropagation();
                console.log('More options clicked for:', material.title);
                alert('More options menu would appear here!');
              }}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="pt-4">
          {/* AI Summary for notes */}
          {isNote && material.aiSummary && (
            <div className={`mb-4 p-3 rounded-xl border transition-colors ${
              isProfessional 
                ? 'bg-slate-900/50 border-slate-700' 
                : 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100'
            }`}>
              <div className="flex items-center gap-2 mb-2">
                <Brain className={`w-4 h-4 ${isProfessional ? 'text-purple-400' : 'text-blue-600'}`} />
                <span className={`text-sm font-bold ${isProfessional ? 'text-purple-300' : 'text-blue-800'}`}>AI Summary</span>
              </div>
              <p className={`text-sm line-clamp-2 ${isProfessional ? 'text-slate-400' : 'text-blue-800/80'}`}>{material.aiSummary}</p>
            </div>
          )}

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {(material.tags || material.topics)?.slice(0, 3).map((tag, index) => (
              <span 
                key={index} 
                className={`text-xs px-2 py-1 rounded-lg cursor-pointer transition-colors font-medium ${
                  isProfessional
                    ? 'bg-slate-700 text-slate-300 hover:bg-purple-500/20 hover:text-purple-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  setSearchTerm(tag);
                }}
              >
                {tag}
              </span>
            ))}
            {(material.tags || material.topics)?.length > 3 && (
              <span className={`text-xs px-2 py-1 rounded-lg border ${
                isProfessional
                  ? 'bg-slate-800 text-slate-500 border-slate-700'
                  : 'bg-gray-50 text-gray-500 border-gray-100'
              }`}>
                +{(material.tags || material.topics).length - 3} more
              </span>
            )}
          </div>

          {/* Stats */}
          <div className={`grid grid-cols-2 gap-4 text-sm mb-4 p-3 rounded-xl ${
            isProfessional ? 'bg-slate-900/50' : 'bg-gray-50/50'
          }`}>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isProfessional ? 'text-slate-500' : 'text-gray-500'}`}>Downloads</span>
              <span className={`font-bold flex items-center gap-1 text-xs ${
                isProfessional ? 'text-white' : 'text-gray-900'
              }`}>
                <Download className="w-3 h-3" />
                {material.downloads?.toLocaleString() || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className={`text-xs ${isProfessional ? 'text-slate-500' : 'text-gray-500'}`}>Views</span>
              <span className={`font-bold flex items-center gap-1 text-xs ${
                isProfessional ? 'text-white' : 'text-gray-900'
              }`}>
                <Eye className="w-3 h-3" />
                {material.views?.toLocaleString() || 'N/A'}
              </span>
            </div>
            {material.completionRate && (
              <div className={`flex items-center justify-between col-span-2 border-t pt-2 mt-1 ${
                isProfessional ? 'border-slate-700' : 'border-gray-100'
              }`}>
                <span className={`text-xs ${isProfessional ? 'text-slate-500' : 'text-gray-500'}`}>Completion Rate</span>
                <span className="font-bold text-green-600 text-xs">{material.completionRate}%</span>
              </div>
            )}
            {isPaper && material.avgScore && (
              <div className={`flex items-center justify-between col-span-2 border-t pt-2 mt-1 ${
                isProfessional ? 'border-slate-700' : 'border-gray-100'
              }`}>
                <span className={`text-xs ${isProfessional ? 'text-slate-500' : 'text-gray-500'}`}>Average Score</span>
                <span className="font-bold text-blue-600 text-xs">{material.avgScore}%</span>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <Button 
              className={`flex-1 text-sm text-white shadow-lg rounded-xl font-bold ${
                isProfessional
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-purple-500/20'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handleViewClick();
              }}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isNote ? 'Study Now' : isPaper ? 'View Paper' : isGuide ? 'Read Guide' : 'Read Book'}
            </Button>
            <Button variant="outline" size="sm" className={`rounded-xl ${
              isProfessional 
                ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                : 'border-gray-200 hover:bg-gray-50'
            }`} onClick={handleDownloadClick}>
              <Download className={`w-4 h-4 ${isProfessional ? 'text-slate-400' : 'text-gray-600'}`} />
            </Button>
            <Button variant="outline" size="sm" className={`rounded-xl ${
              isProfessional 
                ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                : 'border-gray-200 hover:bg-gray-50'
            }`} onClick={handleBookmarkClick}>
              <Bookmark className={`w-4 h-4 ${isProfessional ? 'text-slate-400' : 'text-gray-600'}`} />
            </Button>
            <Button variant="outline" size="sm" className={`rounded-xl ${
              isProfessional 
                ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                : 'border-gray-200 hover:bg-gray-50'
            }`} onClick={handleShareClick}>
              <Share className={`w-4 h-4 ${isProfessional ? 'text-slate-400' : 'text-gray-600'}`} />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen pt-24 pb-12 flex items-center justify-center ${
        isProfessional ? 'bg-slate-900' : 'bg-slate-50'
      }`}>
        <div className="text-center">
          <div className={`w-20 h-20 mx-auto rounded-2xl flex items-center justify-center shadow-xl mb-6 animate-pulse ${
            isProfessional ? 'bg-gradient-to-r from-pink-600 to-purple-600' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
          }`}>
            <RefreshCw className="w-10 h-10 text-white animate-spin" />
          </div>
          <h1 className={`text-3xl font-bold mb-2 ${
            isProfessional ? 'text-white' : 'text-gray-900'
          }`}>Loading Content...</h1>
          <p className={`text-lg ${
            isProfessional ? 'text-slate-400' : 'text-gray-600'
          }`}>Fetching the latest resources</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen font-sans pb-20 transition-colors duration-500 ${
      isProfessional ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      {/* Header Section */}
      <div className={`border-b pt-24 pb-12 px-4 sm:px-6 lg:px-8 transition-colors duration-500 ${
        isProfessional ? 'bg-slate-900 border-slate-800' : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto text-center">
          <div className={`inline-flex items-center justify-center p-3 rounded-2xl mb-6 shadow-inner ${
            isProfessional ? 'bg-purple-900/20' : 'bg-blue-100'
          }`}>
            {isProfessional ? (
              <Server className="w-8 h-8 text-purple-500" />
            ) : (
              <Library className="w-8 h-8 text-blue-600" />
            )}
          </div>
          <h1 className={`text-5xl font-extrabold mb-4 tracking-tight ${
            isProfessional ? 'text-white' : 'text-gray-900'
          }`}>
            {isProfessional ? 'Tech' : 'Digital'} <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
              isProfessional ? 'from-pink-500 via-purple-500 to-indigo-500' : 'from-blue-600 to-indigo-600'
            }`}>{isProfessional ? 'Resource Hub' : 'Learning Library'}</span>
          </h1>
          <p className={`text-xl max-w-2xl mx-auto mb-8 leading-relaxed ${
            isProfessional ? 'text-slate-400' : 'text-gray-600'
          }`}>
            {isProfessional 
              ? 'Access industry-standard documentation, architecture patterns, and system design guides.'
              : 'Access premium educational content, interactive study materials, and comprehensive exam resources powered by AI.'}
          </p>
            
          {/* Admin Content Status */}
          {libraryContent.length > 0 && !isProfessional && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-8 max-w-md mx-auto flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <p className="text-sm font-medium text-green-800">
                Showing {libraryContent.length} materials from admin panel
              </p>
            </div>
          )}
          
          {/* Enhanced Search Bar */}
          <div className={`max-w-4xl mx-auto p-2 rounded-2xl shadow-xl border ${
            isProfessional 
              ? 'bg-slate-800 border-slate-700' 
              : 'bg-white border-gray-100'
          }`}>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${
                  isProfessional ? 'text-slate-500' : 'text-gray-400'
                }`} />
                <Input
                  type="text"
                  placeholder={isProfessional ? "Search documentation, patterns, guides..." : "Search notes, papers, books..."}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={`pl-12 h-12 border-none text-lg rounded-xl focus:ring-0 ${
                    isProfessional 
                      ? 'bg-slate-900 text-white placeholder-slate-500' 
                      : 'bg-gray-50 text-gray-900 placeholder-gray-400'
                  }`}
                />
                <Button 
                  variant="ghost" 
                  size="sm"
                  className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-lg ${
                    isProfessional ? 'hover:bg-slate-700' : 'hover:bg-blue-50'
                  }`}
                  onClick={() => {
                    console.log('AI Search clicked with query:', searchTerm);
                    alert('AI-powered search would process your query: "' + searchTerm + '"');
                  }}
                >
                  <Brain className={`w-5 h-5 ${isProfessional ? 'text-purple-500' : 'text-blue-500'}`} />
                </Button>
              </div>
              <Button 
                variant="outline" 
                className={`h-12 px-6 rounded-xl font-medium ${
                  isProfessional 
                    ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                    : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter className="w-5 h-5 mr-2" />
                Filters
                <ChevronDown className={`w-4 h-4 ml-2 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
              <Button 
                className={`h-12 px-8 rounded-xl text-white font-bold shadow-lg ${
                  isProfessional
                    ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 shadow-purple-500/20'
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 shadow-blue-500/20'
                }`}
                onClick={() => {
                  console.log('Upload clicked');
                  alert('Upload content functionality would open here!');
                }}
              >
                <Upload className="w-5 h-5 mr-2" />
                Upload
              </Button>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className={`max-w-4xl mx-auto mt-4 rounded-2xl border p-6 shadow-xl text-left animate-in fade-in slide-in-from-top-4 ${
              isProfessional ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
            }`}>
              <h3 className={`text-lg font-bold mb-4 ${
                isProfessional ? 'text-white' : 'text-gray-900'
              }`}>Filter & Sort</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className={`block text-sm font-bold mb-2 ${
                    isProfessional ? 'text-slate-300' : 'text-gray-700'
                  }`}>Category</label>
                  <select 
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className={`w-full p-3 border-none rounded-xl font-medium focus:ring-2 ${
                      isProfessional 
                        ? 'bg-slate-900 text-white focus:ring-purple-500' 
                        : 'bg-gray-50 text-gray-900 focus:ring-blue-500'
                    }`}
                  >
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name} ({category.count})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 ${
                    isProfessional ? 'text-slate-300' : 'text-gray-700'
                  }`}>Sort By</label>
                  <select 
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className={`w-full p-3 border-none rounded-xl font-medium focus:ring-2 ${
                      isProfessional 
                        ? 'bg-slate-900 text-white focus:ring-purple-500' 
                        : 'bg-gray-50 text-gray-900 focus:ring-blue-500'
                    }`}
                  >
                    <option value="rating">Highest Rated</option>
                    <option value="downloads">Most Downloaded</option>
                    <option value="recent">Most Recent</option>
                    <option value="title">Alphabetical</option>
                  </select>
                </div>
                <div>
                  <label className={`block text-sm font-bold mb-2 ${
                    isProfessional ? 'text-slate-300' : 'text-gray-700'
                  }`}>View Mode</label>
                  <div className="flex gap-2">
                    <Button 
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className={`flex-1 h-11 rounded-xl font-bold ${
                        viewMode === 'grid' 
                          ? (isProfessional ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white')
                          : (isProfessional ? 'border-slate-600 text-slate-400' : 'border-gray-200 text-gray-600')
                      }`}
                    >
                      <Layers className="w-4 h-4 mr-2" />
                      Grid
                    </Button>
                    <Button 
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className={`flex-1 h-11 rounded-xl font-bold ${
                        viewMode === 'list' 
                          ? (isProfessional ? 'bg-purple-600 text-white' : 'bg-blue-600 text-white')
                          : (isProfessional ? 'border-slate-600 text-slate-400' : 'border-gray-200 text-gray-600')
                      }`}
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
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mb-12">
          {/* Stats Cards - Adapted for mode */}
          <Card className={`border shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl overflow-hidden group ${
            isProfessional ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
          }`}>
            <CardContent className="p-4 text-center relative">
              <div className={`absolute top-0 left-0 w-full h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ${
                isProfessional ? 'bg-pink-500' : 'bg-blue-500'
              }`}></div>
              <div className={`text-3xl font-extrabold mb-1 ${
                isProfessional ? 'text-white' : 'text-gray-900'
              }`}>{isProfessional ? '120+' : (totalStats.studyMaterials || studyMaterials.length)}</div>
              <div className={`text-xs font-bold uppercase tracking-wider ${
                isProfessional ? 'text-slate-400' : 'text-gray-500'
              }`}>{isProfessional ? 'Tech Guides' : 'Study Materials'}</div>
            </CardContent>
          </Card>
          {/* ... Add more stats cards similarly ... */}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
              <TabsList className={`grid w-full grid-cols-4 p-1 rounded-2xl border shadow-sm ${
                isProfessional ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
              }`}>
                <TabsTrigger value="all" className={`flex items-center gap-2 text-sm font-bold rounded-xl transition-all py-3 ${
                  isProfessional 
                    ? 'text-slate-400 data-[state=active]:bg-slate-700 data-[state=active]:text-white' 
                    : 'text-gray-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600'
                }`}>
                  <Library className="w-4 h-4" />
                  All Content
                </TabsTrigger>
                {isProfessional ? (
                  <>
                    <TabsTrigger value="docs" className="flex items-center gap-2 text-sm font-bold rounded-xl text-slate-400 data-[state=active]:bg-slate-700 data-[state=active]:text-white transition-all py-3">
                      <FileText className="w-4 h-4" />
                      Docs
                    </TabsTrigger>
                    <TabsTrigger value="patterns" className="flex items-center gap-2 text-sm font-bold rounded-xl text-slate-400 data-[state=active]:bg-slate-700 data-[state=active]:text-white transition-all py-3">
                      <Layout className="w-4 h-4" />
                      Patterns
                    </TabsTrigger>
                    <TabsTrigger value="system" className="flex items-center gap-2 text-sm font-bold rounded-xl text-slate-400 data-[state=active]:bg-slate-700 data-[state=active]:text-white transition-all py-3">
                      <Server className="w-4 h-4" />
                      System Design
                    </TabsTrigger>
                  </>
                ) : (
                  <>
                    <TabsTrigger value="notes" className="flex items-center gap-2 text-sm font-bold rounded-xl text-gray-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-all py-3">
                      <FileText className="w-4 h-4" />
                      Study Notes
                    </TabsTrigger>
                    <TabsTrigger value="papers" className="flex items-center gap-2 text-sm font-bold rounded-xl text-gray-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-all py-3">
                      <GraduationCap className="w-4 h-4" />
                      Exam Papers
                    </TabsTrigger>
                    <TabsTrigger value="books" className="flex items-center gap-2 text-sm font-bold rounded-xl text-gray-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600 transition-all py-3">
                      <Book className="w-4 h-4" />
                      Reference Books
                    </TabsTrigger>
                  </>
                )}
              </TabsList>

              <TabsContent value="all" className="space-y-6 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className={`text-2xl font-bold ${isProfessional ? 'text-white' : 'text-gray-900'}`}>
                      {isProfessional ? 'All Tech Resources' : 'All Learning Materials'}
                    </h2>
                    <p className={isProfessional ? 'text-slate-400' : 'text-gray-600'}>
                      {filteredMaterials.length} resources found
                    </p>
                  </div>
                </div>
                <div className={`grid grid-cols-1 ${viewMode === 'grid' ? 'md:grid-cols-2 xl:grid-cols-2' : 'md:grid-cols-1'} gap-6`}>
                  {filteredMaterials.map(renderMaterialCard)}
                </div>
              </TabsContent>

              {/* Add other TabContents based on mode if needed, or just rely on filtering */}
            </Tabs>
          </div>

          {/* Enhanced Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Quick Categories */}
            <Card className={`border shadow-xl rounded-3xl overflow-hidden ${
              isProfessional ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
            }`}>
              <CardHeader className={`border-b ${isProfessional ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50/50 border-gray-100'}`}>
                <CardTitle className={`text-lg font-bold flex items-center gap-2 ${
                  isProfessional ? 'text-white' : 'text-gray-900'
                }`}>
                  <Target className={`w-5 h-5 ${isProfessional ? 'text-purple-500' : 'text-blue-600'}`} />
                  Quick Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 p-6">
                {categories.slice(1, 6).map((category) => {
                  const IconComponent = category.icon;
                  return (
                    <div 
                      key={category.id}
                      className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedCategory === category.id 
                          ? (isProfessional ? 'bg-purple-500/20 border border-purple-500/50' : 'bg-blue-50 border border-blue-100 shadow-sm')
                          : (isProfessional ? 'hover:bg-slate-700 border border-transparent' : 'hover:bg-gray-50 border border-transparent')
                      }`}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          selectedCategory === category.id 
                            ? (isProfessional ? 'bg-slate-800 text-purple-400' : 'bg-white text-blue-600')
                            : (isProfessional ? 'bg-slate-900 text-slate-500' : 'bg-gray-100 text-gray-500')
                        }`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                        <span className={`text-sm font-bold ${
                          selectedCategory === category.id 
                            ? (isProfessional ? 'text-purple-300' : 'text-blue-900')
                            : (isProfessional ? 'text-slate-300' : 'text-gray-700')
                        }`}>
                          {category.name}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-lg font-bold ${
                        selectedCategory === category.id 
                          ? (isProfessional ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-100 text-blue-700')
                          : (isProfessional ? 'bg-slate-900 text-slate-500' : 'bg-gray-100 text-gray-600')
                      }`}>
                        {category.count}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* AI Study Assistant */}
            <Card className={`border-none shadow-xl rounded-3xl overflow-hidden text-white ${
              isProfessional 
                ? 'bg-gradient-to-br from-pink-600 to-purple-600' 
                : 'bg-gradient-to-br from-purple-600 to-pink-600'
            }`}>
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white text-lg font-bold flex items-center gap-2">
                  <Brain className="w-5 h-5" />
                  AI {isProfessional ? 'Tech' : 'Study'} Assistant
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <p className="text-sm text-purple-100 leading-relaxed">
                  {isProfessional 
                    ? 'Get architectural advice and code reviews using our advanced AI.'
                    : 'Get personalized study recommendations and instant answers to your questions using our advanced AI.'}
                </p>
                <div className="space-y-3">
                  <Button 
                    className="w-full bg-white text-purple-600 hover:bg-purple-50 font-bold rounded-xl shadow-lg"
                    onClick={() => {
                      console.log('AI Chat clicked');
                      alert('AI Assistant chat would open here!');
                    }}
                  >
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Ask AI Anything
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-white/30 text-white hover:bg-white/10 font-bold rounded-xl"
                    onClick={() => {
                      console.log('Plan clicked');
                      alert('AI Plan generator would open here!');
                    }}
                  >
                    <Lightbulb className="w-4 h-4 mr-2" />
                    {isProfessional ? 'Get Career Plan' : 'Get Study Plan'}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Learning Progress */}
            <Card className={`border shadow-xl rounded-3xl overflow-hidden ${
              isProfessional ? 'bg-slate-800 border-slate-700' : 'bg-white border-gray-100'
            }`}>
              <CardHeader className={`border-b ${isProfessional ? 'bg-slate-900/50 border-slate-700' : 'bg-gray-50/50 border-gray-100'}`}>
                <CardTitle className={`text-lg font-bold flex items-center gap-2 ${
                  isProfessional ? 'text-white' : 'text-gray-900'
                }`}>
                  <BarChart3 className="w-5 h-5 text-green-600" />
                  {isProfessional ? 'Skill Progress' : 'Learning Progress'}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className={`font-medium ${isProfessional ? 'text-slate-400' : 'text-gray-600'}`}>
                        {isProfessional ? 'System Design' : 'JavaScript Course'}
                      </span>
                      <span className={`font-bold ${isProfessional ? 'text-white' : 'text-gray-900'}`}>85%</span>
                    </div>
                    <div className={`w-full rounded-full h-2.5 overflow-hidden ${isProfessional ? 'bg-slate-700' : 'bg-gray-100'}`}>
                      <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  {/* Add more progress bars */}
                </div>
                
                <Button 
                  variant="outline" 
                  className={`w-full rounded-xl font-bold mt-4 ${
                    isProfessional 
                      ? 'border-slate-600 text-slate-300 hover:bg-slate-700' 
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => {
                    console.log('View Full Report clicked');
                    alert('Full Learning Progress Report would open here!');
                  }}
                >
                  <Activity className="w-4 h-4 mr-2" />
                  View Full Report
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudyPage;