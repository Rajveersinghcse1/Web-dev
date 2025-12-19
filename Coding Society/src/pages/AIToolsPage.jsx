import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
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
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Cpu,
  Wand2
} from 'lucide-react';

const AIToolsPage = () => {
  const [activeTab, setActiveTab] = useState('summarizer');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const aiTools = [
    {
      id: 'summarizer',
      title: 'Note Summarizer',
      description: 'AI-powered note summarization with key insights extraction',
      icon: FileText,
      category: 'study',
      features: ['PDF Upload', 'Smart Highlights', 'Key Points', 'Mind Maps'],
      bgGradient: 'from-blue-500 to-cyan-500',
      popular: true
    },
    {
      id: 'task-manager',
      title: 'Study Manager',
      description: 'Intelligent task management with deadline reminders',
      icon: Calendar,
      category: 'productivity',
      features: ['Smart Scheduling', 'Priority Matrix', 'Progress Tracking', 'Notifications'],
      bgGradient: 'from-purple-500 to-pink-500',
      popular: false
    },
    {
      id: 'video-downloader',
      title: 'Video Downloader',
      description: 'Download educational videos from YouTube and other platforms',
      icon: Download,
      category: 'utility',
      features: ['YouTube Support', 'Multiple Formats', 'Batch Download', 'Quality Selection'],
      bgGradient: 'from-red-500 to-orange-500',
      popular: true
    },
    {
      id: 'resume-builder',
      title: 'Resume Builder',
      description: 'AI-enhanced resume creation with industry templates',
      icon: User,
      category: 'career',
      features: ['ATS Optimization', 'Industry Templates', 'Skill Suggestions', 'Export Options'],
      bgGradient: 'from-green-500 to-teal-500',
      popular: true
    },
    {
      id: 'ai-tutor',
      title: 'AI Tutor',
      description: 'Personal AI tutor for doubt solving and explanations',
      icon: Brain,
      category: 'learning',
      features: ['24/7 Availability', 'Subject Expertise', 'Step-by-step Solutions', 'Visual Explanations'],
      bgGradient: 'from-indigo-500 to-purple-500',
      popular: true
    },
    {
      id: 'study-planner',
      title: 'Study Planner',
      description: 'Intelligent study schedule optimization',
      icon: Target,
      category: 'planning',
      features: ['Goal Setting', 'Time Blocking', 'Progress Analytics', 'Adaptive Scheduling'],
      bgGradient: 'from-yellow-500 to-orange-500',
      popular: false
    },
    {
      id: 'research-assistant',
      title: 'Research Assistant',
      description: 'AI-powered research and citation management',
      icon: Search,
      category: 'research',
      features: ['Paper Discovery', 'Citation Generation', 'Bibliography', 'Source Verification'],
      bgGradient: 'from-teal-500 to-blue-500',
      popular: false
    },
    {
      id: 'code-reviewer',
      title: 'Code Reviewer',
      description: 'Intelligent code analysis and improvement suggestions',
      icon: Code,
      category: 'programming',
      features: ['Bug Detection', 'Performance Tips', 'Best Practices', 'Security Audit'],
      bgGradient: 'from-gray-600 to-gray-800',
      popular: true
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

  const filteredTools = aiTools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = tool.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const ToolCard = ({ tool }) => (
    <Card className="group bg-white border border-gray-100 hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer rounded-3xl overflow-hidden h-full flex flex-col">
      <CardHeader className="pb-4 relative overflow-hidden">
        <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${tool.bgGradient} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
        
        <div className="flex items-start justify-between mb-4 relative z-10">
          <div className={`p-3 rounded-2xl bg-gradient-to-br ${tool.bgGradient} text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <tool.icon className="w-6 h-6" />
          </div>
          {tool.popular && (
            <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full flex items-center gap-1 border border-amber-200">
              <Sparkles className="w-3 h-3" />
              Popular
            </span>
          )}
        </div>
        
        <CardTitle className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {tool.title}
        </CardTitle>
        <CardDescription className="text-gray-600 line-clamp-2">
          {tool.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 flex flex-col justify-between pt-0">
        <div className="space-y-4 mb-6">
          <div className="flex flex-wrap gap-2">
            {tool.features.slice(0, 3).map((feature, index) => (
              <span
                key={index}
                className="text-xs px-2.5 py-1 rounded-lg bg-gray-50 text-gray-600 font-medium border border-gray-100 group-hover:border-blue-100 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-3 mt-auto">
          <Button className={`flex-1 bg-gradient-to-r ${tool.bgGradient} hover:opacity-90 text-white shadow-lg shadow-blue-500/20 rounded-xl font-bold group-hover:shadow-xl transition-all`}>
            <Zap className="w-4 h-4 mr-2" />
            Launch
          </Button>
          <Button variant="outline" size="icon" className="rounded-xl border-gray-200 hover:bg-gray-50 hover:text-blue-600">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const QuickActions = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
      {[
        { icon: Upload, label: 'Upload Notes', action: 'upload', color: 'text-blue-600', bg: 'bg-blue-50' },
        { icon: Video, label: 'Download Video', action: 'video', color: 'text-red-600', bg: 'bg-red-50' },
        { icon: Brain, label: 'Ask AI Tutor', action: 'tutor', color: 'text-purple-600', bg: 'bg-purple-50' },
        { icon: Target, label: 'Set Goal', action: 'goal', color: 'text-green-600', bg: 'bg-green-50' }
      ].map((action, index) => (
        <Button
          key={index}
          variant="outline"
          className="h-auto py-6 flex flex-col items-center space-y-3 bg-white border-gray-100 hover:border-blue-200 hover:shadow-lg transition-all duration-300 rounded-2xl group"
        >
          <div className={`p-3 rounded-xl ${action.bg} ${action.color} group-hover:scale-110 transition-transform duration-300`}>
            <action.icon className="w-6 h-6" />
          </div>
          <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">{action.label}</span>
        </Button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 rounded-2xl mb-6 shadow-inner">
            <Bot className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            AI-Powered <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Study Tools</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Supercharge your learning with cutting-edge AI tools designed to enhance your academic journey and boost productivity.
          </p>

          {/* Search and Filter */}
          <div className="max-w-4xl mx-auto bg-white p-2 rounded-2xl shadow-xl border border-gray-100">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search for AI tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-gray-50 border-none text-lg rounded-xl focus:ring-0 text-gray-900 placeholder-gray-400"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
                {categories.slice(0, 3).map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`h-12 px-4 rounded-xl font-medium whitespace-nowrap ${
                      selectedCategory === category.id 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <category.icon className="w-4 h-4 mr-2" />
                    {category.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Actions */}
        <QuickActions />

        {/* Featured Tool Spotlight */}
        <div className="mb-12">
          <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white overflow-hidden relative rounded-3xl shadow-2xl border-none">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            
            <CardContent className="relative z-10 p-8 md:p-12">
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-2xl space-y-6">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-sm font-bold text-blue-100">
                    <Sparkles className="w-4 h-4 text-yellow-300" />
                    New Feature Available
                  </div>
                  <h3 className="text-4xl font-extrabold text-white leading-tight">
                    Meet Your Personal <br/>
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-200 to-cyan-200">AI Tutor Pro</span>
                  </h3>
                  <p className="text-lg text-blue-100 leading-relaxed max-w-xl">
                    Get personalized explanations with voice interaction and visual diagrams. 
                    Now supporting 15+ programming languages and advanced mathematics.
                  </p>
                  <div className="flex flex-wrap gap-4">
                    <Button className="h-12 px-8 bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1">
                      <Mic className="w-5 h-5 mr-2" />
                      Try Voice Mode
                    </Button>
                    <Button variant="outline" className="h-12 px-8 border-white/30 text-white hover:bg-white/10 font-bold rounded-xl backdrop-blur-sm">
                      Learn More
                    </Button>
                  </div>
                </div>
                <div className="hidden lg:block relative">
                  <div className="absolute inset-0 bg-blue-500 blur-3xl opacity-30 rounded-full"></div>
                  <Bot className="w-64 h-64 text-white/90 drop-shadow-2xl relative z-10 animate-float" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories Filter (Full) */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={selectedCategory === category.id ? "default" : "outline"}
              onClick={() => setSelectedCategory(category.id)}
              className={`h-10 px-6 rounded-full font-medium transition-all ${
                selectedCategory === category.id 
                  ? 'bg-gray-900 text-white border-gray-900' 
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <category.icon className="w-4 h-4 mr-2" />
              {category.label}
            </Button>
          ))}
        </div>

        {/* AI Tools Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>

        {/* Usage Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white border border-gray-100 shadow-xl rounded-3xl overflow-hidden">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Your Productivity Impact
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-2 gap-8">
                <div className="text-center p-6 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="text-4xl font-extrabold text-blue-600 mb-2">127</div>
                  <div className="text-sm font-bold text-blue-800 uppercase tracking-wide">Notes Summarized</div>
                </div>
                <div className="text-center p-6 bg-purple-50 rounded-2xl border border-purple-100">
                  <div className="text-4xl font-extrabold text-purple-600 mb-2">45</div>
                  <div className="text-sm font-bold text-purple-800 uppercase tracking-wide">Videos Saved</div>
                </div>
                <div className="text-center p-6 bg-orange-50 rounded-2xl border border-orange-100">
                  <div className="text-4xl font-extrabold text-orange-600 mb-2">23</div>
                  <div className="text-sm font-bold text-orange-800 uppercase tracking-wide">Tutor Sessions</div>
                </div>
                <div className="text-center p-6 bg-green-50 rounded-2xl border border-green-100">
                  <div className="text-4xl font-extrabold text-green-600 mb-2">89%</div>
                  <div className="text-sm font-bold text-green-800 uppercase tracking-wide">Efficiency Boost</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border border-gray-100 shadow-xl rounded-3xl overflow-hidden flex flex-col">
            <CardHeader className="bg-gray-50/50 border-b border-gray-100">
              <CardTitle className="text-gray-900 flex items-center gap-2">
                <Wand2 className="w-5 h-5 text-purple-600" />
                Recommended for You
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1">
              <div className="divide-y divide-gray-100">
                {[
                  { title: 'Advanced Python Concepts', type: 'Course', time: '2h 15m', icon: Code, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { title: 'Machine Learning Basics', type: 'Article', time: '15m read', icon: Brain, color: 'text-purple-600', bg: 'bg-purple-50' },
                  { title: 'Study Schedule Optimization', type: 'Tool', time: 'Instant', icon: Calendar, color: 'text-orange-600', bg: 'bg-orange-50' }
                ].map((item, i) => (
                  <div key={i} className="p-6 flex items-center gap-4 hover:bg-gray-50 transition-colors cursor-pointer group">
                    <div className={`p-3 rounded-xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{item.title}</h4>
                      <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                        <span className="font-medium bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.type}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon" className="text-gray-400 group-hover:text-blue-600">
                      <ArrowRight className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100 text-center">
                <Button variant="link" className="text-blue-600 font-bold hover:text-blue-700">
                  View All Recommendations
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AIToolsPage;