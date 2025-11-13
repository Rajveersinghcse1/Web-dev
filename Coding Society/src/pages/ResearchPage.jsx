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
  Award
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
    <div className="min-h-screen bg-blue-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Research & Innovation Hub
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Discover cutting-edge research papers, share your innovations, 
            and collaborate with fellow researchers in the tech community.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalPapers.toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Research Papers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{stats.totalDownloads.toLocaleString()}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Downloads</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">{stats.activeResearchers}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Researchers</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">{stats.pendingReviews}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Pending Reviews</div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Upload */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Search papers, authors, or topics..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-blue-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </option>
              ))}
            </select>
            <Button onClick={handleUpload} className="bg-blue-600 hover:bg-blue-700">
              <Upload className="w-4 h-4 mr-2" />
              Upload Paper
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="space-y-6">
              {filteredPapers.map((paper) => (
                <Card key={paper.id} className={`hover:shadow-lg transition-shadow duration-300 ${paper.featured ? 'ring-2 ring-blue-500 ring-opacity-50' : ''}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {paper.featured && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                              Featured
                            </span>
                          )}
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {paper.category}
                          </span>
                        </div>
                        <CardTitle className="text-xl mb-2 hover:text-blue-600 cursor-pointer">
                          {paper.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                          <User className="w-3 h-3" />
                          {paper.authors.join(', ')}
                          <span className="mx-2">•</span>
                          <Calendar className="w-3 h-3" />
                          {new Date(paper.publishDate).toLocaleDateString()}
                        </div>
                        <CardDescription className="text-base leading-relaxed mb-4">
                          {paper.abstract}
                        </CardDescription>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          {paper.tags.map((tag) => (
                            <span
                              key={tag}
                              className="px-2 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-xs rounded-full"
                            >
                              #{tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* Stats and Actions */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-400">
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {paper.views.toLocaleString()} views
                        </div>
                        <div className="flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          {paper.downloads.toLocaleString()} downloads
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-yellow-500" />
                          {paper.rating}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-4 h-4" />
                          {paper.comments} comments
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <FileText className="w-3 h-3 mr-1" />
                          Preview
                        </Button>
                        <Button size="sm">
                          <Download className="w-3 h-3 mr-1" />
                          Download PDF
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filteredPapers.length === 0 && (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-lg">
                  No research papers found matching your criteria.
                </p>
                <p className="text-gray-400 dark:text-gray-500 mt-2">
                  Try adjusting your search or category filter.
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Trending Topics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Trending Topics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['Machine Learning', 'React Performance', 'Quantum Computing', 'Microservices', 'Blockchain'].map((topic, index) => (
                    <div key={topic} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{topic}</span>
                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                        #{index + 1}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Reviews */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5 text-blue-500" />
                  Recent Reviews
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { reviewer: 'Dr. Smith', paper: 'React Performance', rating: 5, comment: 'Excellent methodology and clear results.' },
                    { reviewer: 'Prof. Johnson', paper: 'ML Interpretability', rating: 4, comment: 'Good insights, minor statistical concerns.' },
                    { reviewer: 'Dr. Lee', paper: 'Quantum Security', rating: 5, comment: 'Groundbreaking research with practical applications.' }
                  ].map((review, index) => (
                    <div key={index} className="border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{review.reviewer}</span>
                        <div className="flex items-center">
                          {[...Array(review.rating)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{review.paper}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Top Contributors */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-500" />
                  Top Contributors
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Dr. Sarah Chen', papers: 12, citations: 156 },
                    { name: 'Prof. Michael Rodriguez', papers: 8, citations: 134 },
                    { name: 'Dr. Alex Kumar', papers: 6, citations: 98 }
                  ].map((contributor, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-700' :
                        index === 1 ? 'bg-gray-100 text-gray-700' :
                        'bg-orange-100 text-orange-700'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 dark:text-white text-sm">{contributor.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {contributor.papers} papers • {contributor.citations} citations
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Upload Modal (placeholder) */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-blue-900 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Upload Research Paper
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Upload feature coming soon! This will allow researchers to submit their papers for peer review.
            </p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowUploadModal(false)}>
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
