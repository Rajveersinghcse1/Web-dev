import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Upload, 
  Search, 
  Filter, 
  Star, 
  Download, 
  Eye, 
  MessageCircle, 
  Calendar,
  User,
  FileText,
  Plus,
  TrendingUp,
  BookOpen,
  Award,
  Microscope,
  Share2,
  Bookmark
} from 'lucide-react';

const ResearchPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showUploadModal, setShowUploadModal] = useState(false);

  const researchPapers = [
    {
      id: 1,
      title: 'Optimizing React Performance with Advanced Memoization Techniques',
      authors: ['Dr. Sarah Chen', 'Prof. Michael Rodriguez'],
      abstract: 'This paper explores advanced memoization strategies in React applications, demonstrating how selective memoization can improve rendering performance by up to 40% in complex component trees.',
      category: 'Frontend Development',
      publishDate: '2024-01-15',
      downloads: 1250,
      views: 3420,
      rating: 4.8,
      comments: 23,
      tags: ['React', 'Performance', 'Memoization', 'Optimization'],
      pdfUrl: '#',
      featured: true
    },
    {
      id: 2,
      title: 'Machine Learning Model Interpretability in Production Systems',
      authors: ['Dr. Alex Kumar', 'Dr. Lisa Zhang', 'Prof. David Wilson'],
      abstract: 'A comprehensive study on implementing interpretable ML models in production environments, with focus on LIME and SHAP techniques for real-time decision explanations.',
      category: 'Machine Learning',
      publishDate: '2024-01-10',
      downloads: 890,
      views: 2156,
      rating: 4.6,
      comments: 17,
      tags: ['ML', 'Interpretability', 'LIME', 'SHAP', 'Production'],
      pdfUrl: '#'
    },
    {
      id: 3,
      title: 'Microservices Architecture Patterns for Scalable Web Applications',
      authors: ['Prof. Emma Johnson', 'Dr. Robert Lee'],
      abstract: 'Evaluation of different microservices patterns including Circuit Breaker, Saga, and CQRS for building resilient and scalable distributed systems.',
      category: 'Backend Development',
      publishDate: '2024-01-08',
      downloads: 756,
      views: 1890,
      rating: 4.5,
      comments: 12,
      tags: ['Microservices', 'Architecture', 'Scalability', 'Distributed Systems'],
      pdfUrl: '#'
    },
    {
      id: 4,
      title: 'Quantum Computing Applications in Cryptographic Security',
      authors: ['Dr. James Smith', 'Prof. Maria Garcia'],
      abstract: 'Investigation of quantum computing impact on current cryptographic methods and proposed quantum-resistant algorithms for future security implementations.',
      category: 'Computer Science',
      publishDate: '2024-01-05',
      downloads: 634,
      views: 1456,
      rating: 4.7,
      comments: 8,
      tags: ['Quantum Computing', 'Cryptography', 'Security', 'Algorithms'],
      pdfUrl: '#'
    },
    {
      id: 5,
      title: 'Automated Testing Strategies for AI/ML Pipelines',
      authors: ['Dr. Jennifer Brown', 'Dr. Thomas Anderson'],
      abstract: 'Framework for implementing comprehensive testing strategies in machine learning pipelines, including data validation, model testing, and infrastructure verification.',
      category: 'Machine Learning',
      publishDate: '2024-01-03',
      downloads: 567,
      views: 1234,
      rating: 4.4,
      comments: 15,
      tags: ['Testing', 'ML Pipelines', 'Automation', 'Quality Assurance'],
      pdfUrl: '#'
    }
  ];

  const categories = [
    'all',
    'Frontend Development',
    'Backend Development',
    'Machine Learning',
    'Computer Science',
    'Data Science',
    'DevOps',
    'Security'
  ];

  const stats = {
    totalPapers: 1247,
    totalDownloads: 45678,
    activeResearchers: 234,
    pendingReviews: 45
  };

  const filteredPapers = researchPapers.filter(paper => {
    const matchesSearch = paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         paper.authors.some(author => author.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         paper.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || paper.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const handleUpload = () => {
    setShowUploadModal(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-white rounded-2xl shadow-xl mb-6 ring-1 ring-slate-100">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center">
              <Microscope className="w-6 h-6 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4 tracking-tight">
            Research & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Innovation Hub</span>
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Discover cutting-edge research papers, share your innovations, 
            and collaborate with fellow researchers in the tech community.
          </p>

          {/* Enhanced Search Bar */}
          <div className="max-w-4xl mx-auto relative z-10">
            <div className="bg-white p-2 rounded-2xl shadow-xl ring-1 ring-slate-100 flex flex-col sm:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                <Input
                  type="text"
                  placeholder="Search papers, authors, or topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-12 bg-transparent border-none text-slate-900 placeholder:text-slate-400 focus:ring-0 text-base w-full"
                />
              </div>
              <div className="flex gap-2">
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="h-12 px-4 border-none bg-slate-50 rounded-xl text-slate-700 font-medium focus:ring-0 cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category === 'all' ? 'All Categories' : category}
                    </option>
                  ))}
                </select>
                <Button 
                  onClick={handleUpload} 
                  className="h-12 px-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl shadow-md transition-all duration-300"
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Paper
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {[
            { label: 'Research Papers', value: stats.totalPapers.toLocaleString(), icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Total Downloads', value: stats.totalDownloads.toLocaleString(), icon: Download, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Active Researchers', value: stats.activeResearchers, icon: User, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Pending Reviews', value: stats.pendingReviews, icon: Eye, color: 'text-orange-600', bg: 'bg-orange-50' }
          ].map((stat, index) => (
            <Card key={index} className="bg-white border-none shadow-lg rounded-2xl overflow-hidden hover:shadow-xl transition-shadow">
              <CardContent className="p-6 text-center">
                <div className={`w-12 h-12 mx-auto rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <stat.icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
                <div className="text-sm font-medium text-slate-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {filteredPapers.map((paper) => (
              <Card 
                key={paper.id} 
                className={`bg-white border-none shadow-lg hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden group ${
                  paper.featured ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
                }`}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3">
                        {paper.featured && (
                          <span className="px-3 py-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs rounded-full font-semibold shadow-sm">
                            Featured
                          </span>
                        )}
                        <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs rounded-full font-medium border border-purple-100">
                          {paper.category}
                        </span>
                      </div>
                      <CardTitle className="text-xl font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors cursor-pointer leading-tight">
                        {paper.title}
                      </CardTitle>
                      <div className="flex items-center gap-4 text-sm text-slate-500 mb-4">
                        <div className="flex items-center gap-1.5">
                          <User className="w-4 h-4 text-slate-400" />
                          <span className="font-medium text-slate-700">{paper.authors.join(', ')}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4 text-slate-400" />
                          <span>{new Date(paper.publishDate).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <CardDescription className="text-base text-slate-600 leading-relaxed mb-4">
                        {paper.abstract}
                      </CardDescription>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {paper.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs rounded-lg font-medium border border-slate-100"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="border-t border-slate-50 pt-4 bg-slate-50/30">
                  {/* Stats and Actions */}
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-6 text-sm text-slate-500 w-full sm:w-auto justify-between sm:justify-start">
                      <div className="flex items-center gap-1.5" title="Views">
                        <Eye className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">{paper.views.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Downloads">
                        <Download className="w-4 h-4 text-green-500" />
                        <span className="font-medium">{paper.downloads.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Rating">
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                        <span className="font-medium text-slate-700">{paper.rating}</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="Comments">
                        <MessageCircle className="w-4 h-4 text-purple-500" />
                        <span className="font-medium">{paper.comments}</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none border-slate-200 hover:bg-white hover:text-blue-600 rounded-xl">
                        <Bookmark className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1 sm:flex-none border-slate-200 hover:bg-white hover:text-blue-600 rounded-xl">
                        <FileText className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm" className="flex-1 sm:flex-none bg-slate-900 hover:bg-slate-800 text-white rounded-xl shadow-md">
                        <Download className="w-4 h-4 mr-2" />
                        PDF
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {filteredPapers.length === 0 && (
              <div className="text-center py-16 bg-white rounded-3xl shadow-sm border border-slate-100">
                <div className="w-20 h-20 mx-auto bg-slate-50 rounded-full flex items-center justify-center mb-4">
                  <BookOpen className="w-10 h-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No research papers found</h3>
                <p className="text-slate-500 mb-8 max-w-md mx-auto">
                  We couldn't find any papers matching your search criteria. Try adjusting your filters or search terms.
                </p>
                <Button 
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl px-8"
                >
                  Clear All Filters
                </Button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <Card className="bg-white border-none shadow-lg rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-slate-900 text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {['Machine Learning', 'React Performance', 'Quantum Computing', 'Microservices', 'Blockchain'].map((topic, index) => (
                    <div key={topic} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                      <span className="text-sm font-medium text-slate-700">{topic}</span>
                      <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                        #{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card className="bg-white border-none shadow-lg rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-slate-900 text-lg flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  Recent Reviews
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {[
                  { reviewer: 'Dr. Smith', paper: 'React Performance', rating: 5, comment: 'Excellent methodology and clear results.' },
                  { reviewer: 'Prof. Johnson', paper: 'ML Interpretability', rating: 4, comment: 'Good insights, minor statistical concerns.' },
                  { reviewer: 'Dr. Lee', paper: 'Quantum Security', rating: 5, comment: 'Groundbreaking research with practical applications.' }
                ].map((review, index) => (
                  <div key={index} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-bold text-slate-900">{review.reviewer}</span>
                      <div className="flex items-center">
                        {[...Array(review.rating)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs font-medium text-blue-600 mb-1 line-clamp-1">{review.paper}</p>
                    <p className="text-xs text-slate-500 italic">"{review.comment}"</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card className="bg-white border-none shadow-lg rounded-3xl overflow-hidden">
              <CardHeader className="bg-slate-50 border-b border-slate-100 pb-4">
                <CardTitle className="text-slate-900 text-lg flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {[
                  { name: 'Dr. Sarah Chen', papers: 12, citations: 156 },
                  { name: 'Prof. Michael Rodriguez', papers: 8, citations: 134 },
                  { name: 'Dr. Alex Kumar', papers: 6, citations: 98 }
                ].map((contributor, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-sm ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-slate-100 text-slate-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm">{contributor.name}</p>
                      <p className="text-xs text-slate-500 font-medium">
                        {contributor.papers} papers • {contributor.citations} citations
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Upload Modal (placeholder) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl transform transition-all scale-100">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                Upload Research Paper
              </h3>
              <p className="text-slate-500">
                Share your research with the community. This feature is coming soon!
              </p>
            </div>
            <div className="flex justify-center">
              <Button 
                onClick={() => setShowUploadModal(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-2 px-6 rounded-xl transition-colors"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResearchPage;
