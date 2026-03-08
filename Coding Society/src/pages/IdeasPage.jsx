import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import studentService from '../services/studentService';
import {
  Lightbulb, Plus, Heart, MessageSquare, Share, Code, Atom, Calculator, Globe, Cpu, Zap,
  Target, Users, Search, TrendingUp, Award, Eye, Bookmark, Brain,
  Rocket, Sparkles, DollarSign, MoreVertical, RefreshCw,
  FileText, Phone, ArrowRight, AlertCircle, Star
} from 'lucide-react';

const IdeasPage = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [animatedStats, setAnimatedStats] = useState({ ideas: 0, projects: 0, contributors: 0, completed: 0 });

  // State for dynamic data from admin panel
  const [innovationProjects, setInnovationProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load innovation projects from admin panel
  useEffect(() => {
    const loadInnovationProjects = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await studentService.getInnovationProjects();

        if (response.success && response.data) {
          const projectsData = response.data.projects || [];
          setInnovationProjects(projectsData);

          // Calculate stats from real data
          const activeProjects = projectsData.filter(p => p.status === 'in_progress').length;
          const completedProjects = projectsData.filter(p => p.status === 'completed').length;
          const totalContributors = new Set(projectsData.flatMap(p => p.collaborators || [])).size;

          setAnimatedStats({
            ideas: projectsData.length,
            projects: activeProjects,
            contributors: totalContributors,
            completed: completedProjects
          });
        }
      } catch (error) {
        console.error('Error loading innovation projects:', error);
        setError('Failed to load innovation projects. Showing demo content.');

        // Use fallback data when admin panel is not available
        setInnovationProjects([]);
        setAnimatedStats({ ideas: 247, projects: 89, contributors: 156, completed: 23 });
      } finally {
        setIsLoading(false);
      }
    };

    loadInnovationProjects();
  }, []);

  // Enhanced categories with dynamic counts
  const categories = [
    {
      id: 'all',
      label: 'All Ideas',
      icon: Lightbulb,
      color: 'from-yellow-400 to-orange-500',
      count: innovationProjects.length || 247,
      description: 'Explore all innovative ideas across disciplines',
      trending: true
    },
    {
      id: 'computer-science',
      label: 'Computer Science',
      icon: Code,
      color: 'from-blue-500 to-indigo-600',
      count: innovationProjects.filter(p => p.category === 'Computer Science').length || 89,
      description: 'AI, Machine Learning, Software Development',
      trending: true
    },
    {
      id: 'electrical',
      label: 'Electrical Engineering',
      icon: Zap,
      color: 'from-yellow-500 to-red-500',
      count: innovationProjects.filter(p => p.category === 'Electrical Engineering').length || 45,
      description: 'IoT, Renewable Energy, Smart Systems',
      trending: false
    },
    {
      id: 'mechanical',
      label: 'Mechanical Engineering',
      icon: Cpu,
      color: 'from-gray-500 to-gray-700',
      count: innovationProjects.filter(p => p.category === 'Mechanical Engineering').length || 38,
      description: 'Robotics, Automation, Manufacturing',
      trending: true
    },
    {
      id: 'civil',
      label: 'Civil Engineering',
      icon: Globe,
      color: 'from-green-500 to-teal-600',
      count: innovationProjects.filter(p => p.category === 'Civil Engineering').length || 32,
      description: 'Smart Cities, Infrastructure, Sustainability',
      trending: false
    },
    {
      id: 'mathematics',
      label: 'Mathematics',
      icon: Calculator,
      color: 'from-purple-500 to-pink-600',
      count: innovationProjects.filter(p => p.category === 'Mathematics').length || 28,
      description: 'Algorithms, Data Science, Optimization',
      trending: false
    },
    {
      id: 'physics',
      label: 'Physics',
      icon: Atom,
      color: 'from-cyan-500 to-blue-600',
      count: innovationProjects.filter(p => p.category === 'Physics').length || 15,
      description: 'Quantum Computing, Nanotechnology, Research',
      trending: true
    }
  ];

  // Convert admin innovation data to component format or use fallback
  const fallbackIdeas = [
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
      completedMilestones: 5,
      tags: ['AI', 'AR', 'Mobile Development', 'Navigation'],
      featured: true
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
      status: 'planning',
      progress: 25,
      funding: '$12,000',
      teamSize: 4,
      skills: ['IoT', 'Machine Learning', 'Data Analytics'],
      collaborators: [
        { name: 'Mike Chen', avatar: '👨‍🔬', role: 'Data Scientist' }
      ],
      milestones: 6,
      completedMilestones: 2,
      tags: ['IoT', 'Energy', 'Sustainability', 'Dashboard'],
      featured: false
    }
  ];

  // Convert admin data to component format
  const ideas = innovationProjects.length > 0 ? innovationProjects.map(project => ({
    id: project._id || project.id,
    title: project.title,
    description: project.description,
    category: project.category?.toLowerCase().replace(/\s+/g, '-') || 'computer-science',
    author: project.mentor?.name || project.author || 'Anonymous',
    avatar: getRandomAvatar(),
    likes: project.views || Math.floor(Math.random() * 200),
    comments: Math.floor(Math.random() * 50),
    views: project.views || Math.floor(Math.random() * 2000),
    timeAgo: studentService.formatDate(project.createdAt),
    difficulty: project.difficulty || 'Intermediate',
    status: project.status || 'planning',
    progress: getProgressFromStatus(project.status),
    funding: project.budget || `$${(Math.random() * 20000 + 5000).toFixed(0)}`,
    teamSize: project.teamMembers?.length || Math.floor(Math.random() * 8) + 2,
    skills: project.requiredSkills || [],
    collaborators: project.teamMembers?.map(member => ({
      name: member.name || member,
      avatar: getRandomAvatar(),
      role: member.role || 'Team Member'
    })) || [],
    milestones: project.deliverables?.length || Math.floor(Math.random() * 10) + 3,
    completedMilestones: Math.floor((project.deliverables?.length || 5) * (getProgressFromStatus(project.status) / 100)),
    tags: project.tags || [],
    featured: project.featured || false,
    mentorPhone: project.mentor?.phone, // Include mentor phone from admin panel
    projectFile: project.fileUrl, // Include project file URL
    timeline: project.timeline,
    category_display: project.category
  })) : fallbackIdeas;

  // Helper functions
  function getRandomAvatar() {
    const avatars = ['👨‍💻', '👩‍💻', '👨‍🔬', '👩‍🔬', '👨‍🎨', '👩‍🎨', '👨‍💼', '👩‍💼'];
    return avatars[Math.floor(Math.random() * avatars.length)];
  }

  function getProgressFromStatus(status) {
    const progressMap = {
      'planning': 25,
      'in_progress': 65,
      'completed': 100,
      'on_hold': 40
    };
    return progressMap[status] || 25;
  }

  function getStatusColor(status) {
    const colorMap = {
      'planning': 'bg-yellow-100 text-yellow-800',
      'in_progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'on_hold': 'bg-gray-100 text-gray-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  }

  function getStatusLabel(status) {
    const labelMap = {
      'planning': 'Planning',
      'in_progress': 'In Progress',
      'completed': 'Completed',
      'on_hold': 'On Hold'
    };
    return labelMap[status] || 'Planning';
  }

  // Filter and search logic
  const filteredIdeas = useMemo(() => {
    let filtered = [...ideas];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(idea => idea.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(idea =>
        idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        idea.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
        idea.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Sort by featured first, then by likes
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return b.likes - a.likes;
    });

    return filtered;
  }, [ideas, selectedCategory, searchTerm]);

  const renderIdeaCard = (idea) => {
    const handleViewClick = () => {
      console.log('Viewing idea:', idea.title);

      if (idea.projectFile) {
        // Open admin-managed project file
        window.open(studentService.getFileUrl(idea.projectFile), '_blank');
      } else {
        alert(`Opening ${idea.title} details...`);
      }
    };

    const handleLikeClick = (e) => {
      e.stopPropagation();
      console.log('Liked:', idea.title);
      alert(`Liked ${idea.title}!`);
    };

    const handleShareClick = (e) => {
      e.stopPropagation();
      console.log('Sharing:', idea.title);
      alert(`Sharing ${idea.title}...`);
    };

    const handleJoinClick = (e) => {
      e.stopPropagation();
      console.log('Joining project:', idea.title);
      alert(`Requesting to join ${idea.title}...`);
    };

    return (
      <Card
        key={idea.id}
        className={`group bg-white border-none shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer rounded-2xl overflow-hidden max-h-[450px] flex flex-col ${idea.featured ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
          }`}
        onClick={handleViewClick}
      >
        <CardHeader className="pb-2 relative">
          {/* Featured badge */}
          {idea.featured && (
            <div className="absolute top-4 right-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg z-10">
              ⭐ Featured
            </div>
          )}

          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="text-2xl bg-slate-50 p-2 rounded-xl">{idea.avatar}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-base line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">
                  {idea.title}
                </h3>
                <p className="text-xs text-slate-500 mb-2">
                  by {idea.author}
                </p>

                {/* Status and Progress */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusColor(idea.status)}`}>
                    {getStatusLabel(idea.status)}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">{idea.progress}% complete</span>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${idea.progress}%` }}
                  ></div>
                </div>

                {/* Project metadata */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mb-2">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    {idea.teamSize} members
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Target className="w-3.5 h-3.5" />
                    {idea.milestones} milestones
                  </span>
                  <span className="flex items-center gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    {idea.funding}
                  </span>
                  {idea.mentorPhone && (
                    <span className="flex items-center gap-1.5 text-green-600 font-medium">
                      <Phone className="w-3.5 h-3.5" />
                      Mentor: {idea.mentorPhone}
                    </span>
                  )}
                </div>

                {/* Difficulty badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${idea.difficulty === 'Beginner' ? 'bg-green-50 text-green-700 border-green-200' :
                    idea.difficulty === 'Intermediate' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                      'bg-red-50 text-red-700 border-red-200'
                    }`}>
                    {idea.difficulty}
                  </span>
                  {idea.projectFile && (
                    <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1 font-medium">
                      <FileText className="w-3 h-3" />
                      Project File
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-end space-y-2">
              <div className="flex items-center space-x-1 bg-red-50 px-2 py-1 rounded-full">
                <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
                <span className="text-xs font-bold text-red-600">{idea.likes}</span>
              </div>
              <Button variant="ghost" size="sm" className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full h-8 w-8 p-0" onClick={(e) => {
                e.stopPropagation();
                console.log('More options clicked for:', idea.title);
                alert('More options menu would appear here!');
              }}>
                <MoreVertical className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col overflow-hidden">
          {/* Description */}
          <p className="text-xs text-slate-600 mb-3 line-clamp-2 leading-relaxed">
            {idea.description}
          </p>



          {/* Tags */}
          {idea.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-3">
              {idea.tags.slice(0, 3).map((tag, index) => (
                <span
                  key={index}
                  className="text-xs px-2.5 py-1 rounded-full bg-slate-50 text-slate-500 hover:bg-blue-50 hover:text-blue-600 cursor-pointer transition-colors border border-slate-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSearchTerm(tag);
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}



          {/* Stats */}
          <div className="grid grid-cols-3 gap-2 text-sm mb-3 py-2 border-t border-slate-100 mt-auto">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-slate-700 mb-1">
                <Heart className="w-4 h-4 text-red-500" />
                <span className="font-bold">{idea.likes}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Likes</span>
            </div>
            <div className="text-center border-l border-slate-100">
              <div className="flex items-center justify-center gap-1.5 text-slate-700 mb-1">
                <MessageSquare className="w-4 h-4 text-blue-500" />
                <span className="font-bold">{idea.comments}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Comments</span>
            </div>
            <div className="text-center border-l border-slate-100">
              <div className="flex items-center justify-center gap-1.5 text-slate-700 mb-1">
                <Eye className="w-4 h-4 text-indigo-500" />
                <span className="font-bold">{idea.views}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">Views</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm transition-all duration-300 flex-1 rounded-xl h-8 text-xs"
              onClick={handleJoinClick}
            >
              <Users className="w-4 h-4 mr-2" />
              Join Project
            </Button>
            <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50 hover:text-red-600 rounded-xl h-8 w-8 p-0" onClick={handleLikeClick}>
              <Heart className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50 hover:text-blue-600 rounded-xl h-8 w-8 p-0" onClick={handleShareClick}>
              <Share className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="sm" className="border-slate-200 hover:bg-slate-50 hover:text-yellow-600 rounded-xl h-8 w-8 p-0" onClick={(e) => {
              e.stopPropagation();
              console.log('Bookmarking:', idea.title);
              alert(`${idea.title} bookmarked!`);
            }}>
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-12 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-xl mb-6 animate-pulse">
            <RefreshCw className="w-8 h-8 text-white animate-spin" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Loading Innovation Projects...</h1>
          <p className="text-slate-500">Fetching the latest ideas from the community</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header - Single Row Layout */}
        <div className="mb-8">
          <div className="flex items-center justify-between gap-6 mb-6">
            {/* Left: Icon, Title, Description */}
            <div className="flex items-center gap-4 flex-1">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <Lightbulb className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">
                  Innovation <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Hub</span>
                </h1>
                <p className="text-sm text-slate-600">
                  Discover groundbreaking ideas, collaborate on cutting-edge projects, and transform innovation into reality.
                </p>
                {/* Demo Mode Badge */}
                {error && (
                  <div className="inline-flex items-center gap-2 bg-yellow-50 border border-yellow-100 rounded-full px-3 py-1 mt-2">
                    <AlertCircle className="w-3 h-3 text-yellow-600" />
                    <p className="text-xs font-medium text-yellow-700">Demo Mode</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Search and Submit Idea */}
            <div className="flex items-center gap-3">
              <div className="relative w-96">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search innovation projects, skills, or ideas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-white border-slate-300 text-slate-900 placeholder:text-slate-500 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
                />
              </div>
              <Button
                className="h-12 px-6 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md transition-all duration-300 whitespace-nowrap"
                onClick={() => {
                  console.log('Submit Idea clicked');
                  alert('Submit Innovation Idea modal would open here!');
                }}
              >
                <Plus className="w-5 h-5 mr-2" />
                Submit Idea
              </Button>
            </div>
          </div>

          {/* Compact Stats - Right below search */}
          <div className="grid grid-cols-4 gap-3 mt-4">
            {[
              { label: 'Total Ideas', value: animatedStats.ideas, change: '+12', color: 'text-blue-600', bg: 'bg-blue-50' },
              { label: 'Active Projects', value: animatedStats.projects, change: '+8', color: 'text-indigo-600', bg: 'bg-indigo-50' },
              { label: 'Contributors', value: animatedStats.contributors, change: '+23', color: 'text-purple-600', bg: 'bg-purple-50' },
              { label: 'Completed', value: animatedStats.completed, change: '+5', color: 'text-green-600', bg: 'bg-green-50' }
            ].map((stat, index) => (
              <Card key={index} className="bg-white border-none shadow-sm rounded-xl overflow-hidden">
                <CardContent className="p-3 text-center">
                  <div className={`text-2xl font-bold ${stat.color} mb-0.5`}>{stat.value}</div>
                  <div className="text-xs font-medium text-slate-600">{stat.label}</div>
                  <div className="text-[10px] text-green-600 mt-1 font-medium">{stat.change}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>



        <div>
          {/* Main Content - Full Width */}
          <div>
            {/* Category Filter */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">Browse by Category</h2>
                <Button variant="ghost" className="text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                  View All Categories <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const isSelected = selectedCategory === category.id;
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`relative p-4 rounded-2xl text-left transition-all duration-300 group ${isSelected
                        ? 'bg-white shadow-lg ring-2 ring-blue-600 scale-105 z-10'
                        : 'bg-white shadow-sm hover:shadow-md hover:scale-105 border border-slate-100'
                        }`}
                    >
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-r ${category.color} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      <h3 className={`font-bold text-sm mb-1 ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>
                        {category.label}
                      </h3>
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-medium ${isSelected ? 'text-blue-600' : 'text-slate-500'}`}>
                          {category.count} ideas
                        </span>
                        {category.trending && (
                          <Sparkles className="w-3 h-3 text-yellow-500" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ideas Grid */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Innovation Projects</h2>
                  <p className="text-slate-500 text-sm mt-1">Found {filteredIdeas.length} projects matching your criteria</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-lg border-slate-200 text-slate-600">
                    Most Popular
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-lg border-slate-200 text-slate-600">
                    Newest
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIdeas.map(renderIdeaCard)}
              </div>

              {filteredIdeas.length === 0 && (
                <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-slate-100">
                  <div className="w-20 h-20 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Search className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">No projects found</h3>
                  <p className="text-slate-500 mb-8 max-w-md mx-auto">
                    We couldn't find any projects matching your search criteria. Try adjusting your filters or search terms.
                  </p>
                  <Button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCategory('all');
                    }}
                    className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-8"
                  >
                    Clear All Filters
                  </Button>
                </div>
              )}
            </div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default IdeasPage;
