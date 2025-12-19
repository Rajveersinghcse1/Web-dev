import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Progress } from '../components/ui/progress';
import { useMode } from '../context/ModeContext';
import {
  Lightbulb, Plus, Heart, MessageSquare, Share, Code, Atom, Calculator, Globe, Cpu, Zap,
  Target, Users, Clock, Star, Filter, Search, TrendingUp, Award, Eye, Bookmark, Brain,
  Rocket, Activity, Sparkles, Download, DollarSign, CheckCircle, MoreVertical, X
} from 'lucide-react';

const IdeasPage = () => {
  const { getCurrentTheme } = useMode();
  const theme = getCurrentTheme();
  
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddIdea, setShowAddIdea] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [animatedStats, setAnimatedStats] = useState({ ideas: 0, projects: 0, contributors: 0, completed: 0 });

  // Real-time stats
  const realStats = {
    totalIdeas: 247,
    activeProjects: 89,
    contributors: 156,
    completedProjects: 23,
    weeklyGrowth: 12.5,
    successRate: 78
  };

  // Enhanced categories with advanced metadata
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

  // Enhanced ideas data
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
      completedMilestones: 8,
      tags: ['Agriculture', 'Automation', 'IoT', 'Sustainability'],
      featured: true
    }
  ];

  // Animated stats counter effect
  useEffect(() => {
    const animateStats = () => {
      const duration = 2000;
      const steps = 60;
      const stepDuration = duration / steps;
      let currentStep = 0;

      const timer = setInterval(() => {
        if (currentStep <= steps) {
          const progress = currentStep / steps;
          setAnimatedStats({
            ideas: Math.floor(realStats.totalIdeas * progress),
            projects: Math.floor(realStats.activeProjects * progress),
            contributors: Math.floor(realStats.contributors * progress),
            completed: Math.floor(realStats.completedProjects * progress)
          });
          currentStep++;
        } else {
          clearInterval(timer);
        }
      }, stepDuration);
    };

    animateStats();
  }, []);

  // Advanced filtering logic
  const filteredIdeas = useMemo(() => {
    return ideas.filter(idea => {
      const matchesCategory = selectedCategory === 'all' || idea.category === selectedCategory;
      const matchesSearch = searchTerm === '' || idea.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           idea.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           idea.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchTerm, ideas]);

  // Enhanced Idea Card Component
  const IdeaCard = ({ idea }) => (
    <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder} hover:shadow-2xl transition-all duration-500 transform hover:scale-[1.02] group relative overflow-hidden ${idea.featured ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''}`}>
      {/* Featured Badge */}
      {idea.featured && (
        <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs font-bold py-1 px-3 rounded-bl-lg z-10">
          <Star className="w-3 h-3 inline mr-1" />
          Featured
        </div>
      )}
      
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className={`${theme.textPrimary} ${theme.darkTextPrimary} text-lg group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors cursor-pointer`}>
              {idea.title}
            </CardTitle>
            <CardDescription className="mt-2 text-gray-600 dark:text-gray-400 line-clamp-2">
              {idea.description}
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
        
        {/* Author and Meta Info */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-2">
            <span className="text-lg">{idea.avatar}</span>
            <div>
              <div className={`text-sm font-medium ${theme.textPrimary} ${theme.darkTextPrimary}`}>
                {idea.author}
              </div>
              <div className="text-xs text-gray-500">{idea.timeAgo}</div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full ${
              idea.difficulty === 'Advanced' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
              idea.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
              'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            }`}>
              {idea.difficulty}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full ${
              idea.status === 'development' ? 'bg-blue-100 text-blue-800' :
              idea.status === 'testing' ? 'bg-orange-100 text-orange-800' :
              idea.status === 'completed' ? 'bg-green-100 text-green-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {idea.status}
            </span>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-10">
        <div className="space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium">{idea.progress}%</span>
            </div>
            <Progress value={idea.progress} className="h-2" />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2">
            {idea.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="text-xs px-2 py-1 rounded-full bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-blue-100 hover:to-blue-200 hover:text-blue-800 cursor-pointer transition-colors">
                {tag}
              </span>
            ))}
            {idea.tags.length > 3 && (
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                +{idea.tags.length - 3}
              </span>
            )}
          </div>

          {/* Project Stats */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                Funding:
              </span>
              <span className="font-medium text-green-600">{idea.funding}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-1">
                <Users className="w-3 h-3" />
                Team:
              </span>
              <span className="font-medium">{idea.teamSize}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-1">
                <Target className="w-3 h-3" />
                Milestones:
              </span>
              <span className="font-medium">{idea.completedMilestones}/{idea.milestones}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 flex items-center gap-1">
                <Heart className="w-3 h-3" />
                Likes:
              </span>
              <span className="font-medium">{idea.likes}</span>
            </div>
          </div>

          {/* Collaborators */}
          <div className="space-y-2">
            <div className="text-sm font-medium text-gray-600">Team Members</div>
            <div className="flex -space-x-2">
              {idea.collaborators.map((collaborator, index) => (
                <div key={index} className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs border-2 border-white dark:border-gray-800" 
                     title={`${collaborator.name} - ${collaborator.role}`}>
                  {collaborator.avatar}
                </div>
              ))}
              <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-600 flex items-center justify-center text-xs border-2 border-white dark:border-gray-800 text-gray-500">
                +{Math.max(0, idea.teamSize - idea.collaborators.length)}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-2">
            <Button size="sm" className="flex-1">
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </Button>
            <Button variant="outline" size="sm" className="flex-1">
              <Users className="w-4 h-4 mr-2" />
              Join Team
            </Button>
            <Button variant="ghost" size="sm">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Feedback Modal Component
  const FeedbackModal = ({ onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md mx-4 transform transition-all">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Share Your Feedback</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Your Experience</label>
            <select className="w-full border rounded-lg px-3 py-2">
              <option>Excellent</option>
              <option>Good</option>
              <option>Average</option>
              <option>Poor</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Comments</label>
            <textarea 
              className="w-full border rounded-lg px-3 py-2 h-24 resize-none" 
              placeholder="Tell us what you think..."
            />
          </div>
          <div className="flex space-x-2">
            <Button className="flex-1">
              Submit Feedback
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.background} ${theme.darkBackground} pt-16 py-8 relative overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full opacity-10 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-green-400 to-blue-600 rounded-full opacity-10 animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-yellow-400 to-red-600 rounded-full opacity-5 animate-spin"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Ultra-Modern Hero Section */}
        <div className="text-center mb-12 relative">
          {/* Floating Particles Effect */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="absolute w-2 h-2 bg-blue-400 rounded-full opacity-30 animate-ping"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  animationDuration: `${2 + Math.random() * 2}s`
                }}
              />
            ))}
          </div>

          <div className="relative z-10">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 text-blue-800 dark:text-blue-200 text-sm font-medium mb-6 animate-pulse">
              <Sparkles className="w-4 h-4 mr-2" />
              New: AI-Powered Idea Matching Now Available
            </div>
            
            <h1 className={`text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-6 animate-pulse`}>
              🚀 Innovation Hub
            </h1>
            
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto mb-8 leading-relaxed">
              Discover, collaborate, and bring groundbreaking ideas to life across all engineering disciplines. 
              Connect with brilliant minds, access funding opportunities, and transform concepts into reality.
            </p>
            
            {/* Advanced Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <Button 
                size="lg"
                onClick={() => setShowAddIdea(true)}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Plus className="w-5 h-5 mr-2" />
                Submit Innovation
              </Button>
              
              <Button 
                size="lg"
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-8 py-3 rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-none"
              >
                <Brain className="w-5 h-5 mr-2" />
                AI Idea Generator
              </Button>
              
              <Button 
                size="lg"
                onClick={() => setShowFeedback(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-8 py-3 rounded-full transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl border-none"
              >
                <Users className="w-5 h-5 mr-2" />
                Find Collaborators
              </Button>
            </div>

            {/* Animated Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
              {[
                { label: 'Active Ideas', value: animatedStats.ideas, icon: Lightbulb, color: 'from-yellow-400 to-orange-500' },
                { label: 'Live Projects', value: animatedStats.projects, icon: Rocket, color: 'from-blue-400 to-indigo-500' },
                { label: 'Contributors', value: animatedStats.contributors, icon: Users, color: 'from-green-400 to-teal-500' },
                { label: 'Completed', value: animatedStats.completed, icon: CheckCircle, color: 'from-purple-400 to-pink-500' }
              ].map((stat, index) => (
                <div key={index} className="text-center group">
                  <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br ${stat.color} text-white mb-3 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <stat.icon className="w-8 h-8" />
                  </div>
                  <div className={`text-3xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary} mb-1`}>
                    {stat.value}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI-Powered Search Bar */}
        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              type="text"
              placeholder="Search ideas, technologies, or collaborators..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 pr-16 py-4 text-lg rounded-full border-2 focus:border-blue-500 transition-colors bg-white/80 backdrop-blur-sm"
            />
            <Button 
              variant="ghost" 
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-full bg-blue-100 hover:bg-blue-200 text-blue-600"
            >
              <Brain className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Enhanced Categories with Glassmorphism */}
        <div className="mb-12">
          <h2 className={`text-3xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary} mb-8 text-center`}>
            Explore by Discipline
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {categories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                variant="ghost"
                className={`flex flex-col items-center p-6 h-auto space-y-3 rounded-xl backdrop-blur-sm border-2 transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category.id 
                    ? `bg-gradient-to-br ${category.color} text-white shadow-xl border-white/30` 
                    : 'bg-white/70 dark:bg-gray-800/70 hover:bg-white/90 dark:hover:bg-gray-700/90 border-gray-200/50 hover:shadow-lg'
                }`}
              >
                <div className={`p-3 rounded-full ${selectedCategory === category.id ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'} transition-colors`}>
                  <category.icon className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <div className="font-medium text-sm leading-tight mb-1">
                    {category.label}
                  </div>
                  <div className={`text-xs opacity-80 ${selectedCategory === category.id ? '' : 'text-gray-600 dark:text-gray-400'}`}>
                    {category.count} ideas
                  </div>
                  {category.trending && (
                    <div className="inline-flex items-center gap-1 text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full mt-1">
                      <TrendingUp className="w-3 h-3" />
                      Trending
                    </div>
                  )}
                </div>
              </Button>
            ))}
          </div>
        </div>

        {/* Ideas Grid */}
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h2 className={`text-3xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary}`}>
              {selectedCategory === 'all' ? 'All Innovations' : categories.find(c => c.id === selectedCategory)?.label}
              <span className="ml-3 text-xl text-gray-500">({filteredIdeas.length})</span>
            </h2>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Share className="w-4 h-4" />
                Share
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {filteredIdeas.map((idea) => (
              <IdeaCard key={idea.id} idea={idea} />
            ))}
          </div>
        </div>

        {/* Featured Ideas Section */}
        <div className="mt-16">
          <div className="text-center mb-12">
            <h2 className={`text-3xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary} mb-4 flex items-center justify-center gap-3`}>
              <Star className="w-8 h-8 text-yellow-500" />
              Featured Innovations
              <Sparkles className="w-8 h-8 text-purple-500" />
            </h2>
            <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Handpicked groundbreaking ideas that are changing the world and inspiring the next generation of innovators.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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