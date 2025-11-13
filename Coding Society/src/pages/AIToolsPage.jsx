import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useMode } from '../context/ModeContext';
import {
  Bot,
  FileText,
  Calendar,
  Download,
  User,
  Brain,
  MessageSquare,
  Zap,
  Lightbulb,
  BookOpen,
  Target,
  Clock,
  TrendingUp,
  Upload,
  Video,
  Mic,
  Image,
  Code,
  Globe,
  Search,
  Bookmark,
  Bell,
  Settings,
  Sparkles
} from 'lucide-react';

const AIToolsPage = () => {
  const { getCurrentTheme, currentMode, MODES } = useMode();
  const theme = getCurrentTheme();
  
  const [activeTab, setActiveTab] = useState('summarizer');

  const aiTools = [
    {
      id: 'summarizer',
      title: 'Note Summarizer',
      description: 'AI-powered note summarization with key insights extraction',
      icon: FileText,
      category: 'study',
      features: ['PDF Upload', 'Smart Highlights', 'Key Points', 'Mind Maps'],
      bgGradient: 'from-blue-500 to-cyan-500'
    },
    {
      id: 'task-manager',
      title: 'Study Manager',
      description: 'Intelligent task management with deadline reminders',
      icon: Calendar,
      category: 'productivity',
      features: ['Smart Scheduling', 'Priority Matrix', 'Progress Tracking', 'Notifications'],
      bgGradient: 'from-purple-500 to-pink-500'
    },
    {
      id: 'video-downloader',
      title: 'Video Downloader',
      description: 'Download educational videos from YouTube and other platforms',
      icon: Download,
      category: 'utility',
      features: ['YouTube Support', 'Multiple Formats', 'Batch Download', 'Quality Selection'],
      bgGradient: 'from-red-500 to-orange-500'
    },
    {
      id: 'resume-builder',
      title: 'Resume Builder',
      description: 'AI-enhanced resume creation with industry templates',
      icon: User,
      category: 'career',
      features: ['ATS Optimization', 'Industry Templates', 'Skill Suggestions', 'Export Options'],
      bgGradient: 'from-green-500 to-teal-500'
    },
    {
      id: 'ai-tutor',
      title: 'AI Tutor',
      description: 'Personal AI tutor for doubt solving and explanations',
      icon: Brain,
      category: 'learning',
      features: ['24/7 Availability', 'Subject Expertise', 'Step-by-step Solutions', 'Visual Explanations'],
      bgGradient: 'from-indigo-500 to-purple-500'
    },
    {
      id: 'study-planner',
      title: 'Study Planner',
      description: 'Intelligent study schedule optimization',
      icon: Target,
      category: 'planning',
      features: ['Goal Setting', 'Time Blocking', 'Progress Analytics', 'Adaptive Scheduling'],
      bgGradient: 'from-yellow-500 to-orange-500'
    },
    {
      id: 'research-assistant',
      title: 'Research Assistant',
      description: 'AI-powered research and citation management',
      icon: Search,
      category: 'research',
      features: ['Paper Discovery', 'Citation Generation', 'Bibliography', 'Source Verification'],
      bgGradient: 'from-teal-500 to-blue-500'
    },
    {
      id: 'code-reviewer',
      title: 'Code Reviewer',
      description: 'Intelligent code analysis and improvement suggestions',
      icon: Code,
      category: 'programming',
      features: ['Bug Detection', 'Performance Tips', 'Best Practices', 'Security Audit'],
      bgGradient: 'from-gray-600 to-gray-800'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Tools', icon: Sparkles },
    { id: 'study', label: 'Study', icon: BookOpen },
    { id: 'productivity', label: 'Productivity', icon: Zap },
    { id: 'career', label: 'Career', icon: TrendingUp },
    { id: 'learning', label: 'Learning', icon: Brain },
    { id: 'utility', label: 'Utility', icon: Settings }
  ];

  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredTools = aiTools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const ToolCard = ({ tool }) => (
    <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder} hover:shadow-xl transition-all duration-300 transform hover:scale-105 group cursor-pointer`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${tool.bgGradient} text-white group-hover:scale-110 transition-transform`}>
            <tool.icon className="w-6 h-6" />
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
        <CardTitle className={`${theme.textPrimary} ${theme.darkTextPrimary} text-lg`}>
          {tool.title}
        </CardTitle>
        <CardDescription className="text-gray-600 dark:text-gray-400">
          {tool.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {tool.features.map((feature, index) => (
              <span
                key={index}
                className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${theme.gradient} text-white font-medium`}
              >
                {feature}
              </span>
            ))}
          </div>
          <div className="flex space-x-2">
            <Button className={`flex-1 bg-gradient-to-r ${tool.bgGradient} hover:opacity-90 text-white`}>
              <Zap className="w-4 h-4 mr-2" />
              Launch Tool
            </Button>
            <Button variant="outline" size="icon">
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const QuickActions = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
      {[
        { icon: Upload, label: 'Upload Notes', action: 'upload' },
        { icon: Video, label: 'Download Video', action: 'video' },
        { icon: Brain, label: 'Ask AI Tutor', action: 'tutor' },
        { icon: Target, label: 'Set Goal', action: 'goal' }
      ].map((action, index) => (
        <Button
          key={index}
          variant="outline"
          className={`p-6 h-auto flex flex-col items-center space-y-2 hover:bg-gradient-to-r hover:${theme.gradient} hover:text-white hover:border-transparent transition-all duration-300`}
        >
          <action.icon className="w-6 h-6" />
          <span className="text-sm font-medium">{action.label}</span>
        </Button>
      ))}
    </div>
  );

  return (
    <div className={`min-h-screen ${theme.background} ${theme.darkBackground} pt-16 py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className={`text-4xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary} mb-4`}>
            🤖 AI-Powered Study Tools
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Supercharge your learning with cutting-edge AI tools designed to enhance your academic journey
          </p>
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Search and Filter */}
        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search AI tools..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-3 border ${theme.border} ${theme.darkBorder} rounded-xl ${theme.cardBg} ${theme.darkCardBg} ${theme.textPrimary} ${theme.darkTextPrimary} focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
            />
          </div>
          <div className="flex space-x-2 overflow-x-auto">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant={selectedCategory === category.id ? "default" : "outline"}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 whitespace-nowrap ${
                  selectedCategory === category.id ? `bg-gradient-to-r ${theme.gradient}` : ''
                }`}
              >
                <category.icon className="w-4 h-4" />
                <span>{category.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* AI Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {/* Usage Analytics */}
        <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder} mb-8`}>
          <CardHeader>
            <CardTitle className={`${theme.textPrimary} ${theme.darkTextPrimary} flex items-center`}>
              <TrendingUp className="w-5 h-5 mr-2" />
              Your AI Tools Usage
            </CardTitle>
            <CardDescription>Track your productivity with AI-powered insights</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className={`text-3xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary}`}>127</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Notes Summarized</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary}`}>45</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Videos Downloaded</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary}`}>23</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">AI Tutor Sessions</div>
              </div>
              <div className="text-center">
                <div className={`text-3xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary}`}>89%</div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Productivity Boost</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Featured Tool Spotlight */}
        <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder} bg-gradient-to-r ${theme.gradient} text-white overflow-hidden relative`}>
          <div className="absolute inset-0 bg-blue-900 bg-opacity-20"></div>
          <CardContent className="relative z-10 p-8">
            <div className="flex items-center justify-between">
              <div className="max-w-2xl">
                <h3 className="text-2xl font-bold mb-2">✨ AI Tutor Pro - New Feature!</h3>
                <p className="text-lg opacity-90 mb-4">
                  Get personalized explanations with voice interaction and visual diagrams. 
                  Now supporting 15+ programming languages and advanced mathematics.
                </p>
                <div className="flex space-x-4">
                  <Button className="bg-white text-gray-900 hover:bg-gray-100 shadow-md hover:shadow-lg transition-all duration-300">
                    <Mic className="w-4 h-4 mr-2" />
                    Try Voice Mode
                  </Button>
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-none shadow-md hover:shadow-lg transition-all duration-300">
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="hidden lg:block">
                <Bot className="w-32 h-32 opacity-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AIToolsPage;