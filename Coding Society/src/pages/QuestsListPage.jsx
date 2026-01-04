import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  Search, 
  Filter, 
  Trophy, 
  Clock, 
  Target,
  Star,
  CheckCircle,
  Lock,
  Zap,
  Code,
  BookOpen,
  Award,
  TrendingUp,
  Users,
  Sparkles,
  Play
} from 'lucide-react';

/**
 * Modern Quests List Page
 * Browse, filter, and search through story-driven coding quests
 */

const QuestsListPage = () => {
  const navigate = useNavigate();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    difficulty: 'all',
    category: 'all',
    status: 'all',
    search: ''
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalQuests: 0
  });

  // Fetch quests from API
  useEffect(() => {
    fetchQuests();
  }, [filters.difficulty, filters.category, filters.status, pagination.currentPage]);

  const fetchQuests = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.currentPage,
        limit: 12
      });

      if (filters.difficulty !== 'all') params.append('difficulty', filters.difficulty);
      if (filters.category !== 'all') params.append('category', filters.category);

      const response = await fetch(`http://localhost:5000/api/v1/quests?${params}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setQuests(data.data.quests);
        setPagination(data.data.pagination);
      }
    } catch (error) {
      console.error('Failed to fetch quests:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter by search query (client-side)
  const filteredQuests = quests.filter(quest => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      return (
        quest.title.toLowerCase().includes(searchLower) ||
        quest.description.toLowerCase().includes(searchLower) ||
        quest.category.toLowerCase().includes(searchLower)
      );
    }
    if (filters.status !== 'all') {
      return quest.userStatus === filters.status;
    }
    return true;
  });

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-700 border-green-300',
      intermediate: 'bg-yellow-100 text-yellow-700 border-yellow-300',
      advanced: 'bg-orange-100 text-orange-700 border-orange-300',
      expert: 'bg-red-100 text-red-700 border-red-300'
    };
    return colors[difficulty] || colors.beginner;
  };

  const getCategoryIcon = (category) => {
    const icons = {
      frontend: <Code className="w-4 h-4" />,
      backend: <Target className="w-4 h-4" />,
      algorithms: <Zap className="w-4 h-4" />,
      ai: <Sparkles className="w-4 h-4" />,
      mobile: <Users className="w-4 h-4" />,
      general: <BookOpen className="w-4 h-4" />
    };
    return icons[category] || icons.general;
  };

  const getStatusBadge = (status) => {
    if (status === 'completed') {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-medium">
          <CheckCircle className="w-3 h-3" />
          Completed
        </div>
      );
    } else if (status === 'in_progress') {
      return (
        <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
          <Play className="w-3 h-3" />
          In Progress
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-2xl">
              <Trophy className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-4xl font-bold mb-2">Story-Driven Quests</h1>
              <p className="text-blue-100 text-lg">Embark on epic coding adventures with narrative-driven challenges</p>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-4 mt-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Target className="w-4 h-4" />
                <span className="text-sm opacity-90">Total Quests</span>
              </div>
              <div className="text-2xl font-bold">{pagination.totalQuests}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm opacity-90">Completed</span>
              </div>
              <div className="text-2xl font-bold">
                {quests.filter(q => q.userStatus === 'completed').length}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4" />
                <span className="text-sm opacity-90">XP Earned</span>
              </div>
              <div className="text-2xl font-bold">
                {quests.filter(q => q.userStatus === 'completed').reduce((sum, q) => sum + (q.rewards?.xp || 0), 0)}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters Section */}
        <Card className="mb-6 border-2 shadow-lg">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Search */}
              <div className="lg:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Search Quests</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by title, description..."
                    value={filters.search}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Difficulty Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Difficulty</label>
                <select
                  value={filters.difficulty}
                  onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Levels</option>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Categories</option>
                  <option value="frontend">Frontend</option>
                  <option value="backend">Backend</option>
                  <option value="algorithms">Algorithms</option>
                  <option value="ai">AI/ML</option>
                  <option value="mobile">Mobile</option>
                  <option value="general">General</option>
                </select>
              </div>

              {/* Status Filter */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                >
                  <option value="all">All Status</option>
                  <option value="available">Available</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          </div>
        )}

        {/* Quests Grid */}
        {!loading && (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {filteredQuests.map((quest) => (
                <Card
                  key={quest._id}
                  className="group cursor-pointer border-2 hover:border-blue-400 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                  onClick={() => navigate(`/quests/${quest._id}`)}
                >
                  {/* Header with gradient */}
                  <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                  
                  <CardHeader className="pb-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`px-3 py-1 rounded-lg border-2 font-semibold text-xs uppercase ${getDifficultyColor(quest.difficulty)}`}>
                        {quest.difficulty}
                      </div>
                      {getStatusBadge(quest.userStatus)}
                    </div>

                    <CardTitle className="text-xl group-hover:text-blue-600 transition-colors line-clamp-2">
                      {quest.title}
                    </CardTitle>

                    <p className="text-gray-600 text-sm line-clamp-3 mt-2">
                      {quest.description}
                    </p>
                  </CardHeader>

                  <CardContent>
                    {/* Quest Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      <div className="text-center p-2 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                        <div className="flex items-center justify-center gap-1 text-yellow-600 font-bold text-sm">
                          <Star className="w-3 h-3 fill-yellow-500" />
                          {quest.rewards?.xp || 0}
                        </div>
                        <div className="text-[10px] text-gray-600 mt-0.5">XP</div>
                      </div>
                      <div className="text-center p-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg border border-blue-200">
                        <div className="flex items-center justify-center gap-1 text-blue-600 font-bold text-sm">
                          <Clock className="w-3 h-3" />
                          {quest.estimatedTime || '30m'}
                        </div>
                        <div className="text-[10px] text-gray-600 mt-0.5">Time</div>
                      </div>
                      <div className="text-center p-2 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border border-green-200">
                        <div className="flex items-center justify-center gap-1 text-green-600 font-bold text-sm">
                          <TrendingUp className="w-3 h-3" />
                          {quest.completionRate || 0}%
                        </div>
                        <div className="text-[10px] text-gray-600 mt-0.5">Success</div>
                      </div>
                    </div>

                    {/* Category and Language */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <div className="flex items-center gap-1.5 text-gray-600">
                        {getCategoryIcon(quest.category)}
                        <span className="text-xs font-medium capitalize">{quest.category}</span>
                      </div>
                      <div className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-mono">
                        {quest.programmingLanguage || 'Multiple'}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Button className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold group-hover:shadow-lg transition-all">
                      {quest.userStatus === 'completed' ? 'Review Quest' : quest.userStatus === 'in_progress' ? 'Continue Quest' : 'Start Quest'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Empty State */}
            {filteredQuests.length === 0 && (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-12 h-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No quests found</h3>
                <p className="text-gray-600 mb-6">Try adjusting your filters or search query</p>
                <Button 
                  onClick={() => setFilters({ difficulty: 'all', category: 'all', status: 'all', search: '' })}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Clear All Filters
                </Button>
              </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <Button
                  disabled={!pagination.hasPrev}
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage - 1 })}
                  variant="outline"
                  className="border-2"
                >
                  Previous
                </Button>
                <div className="flex items-center gap-2">
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      onClick={() => setPagination({ ...pagination, currentPage: page })}
                      variant={page === pagination.currentPage ? 'default' : 'outline'}
                      className={page === pagination.currentPage ? 'bg-blue-600' : 'border-2'}
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                <Button
                  disabled={!pagination.hasNext}
                  onClick={() => setPagination({ ...pagination, currentPage: pagination.currentPage + 1 })}
                  variant="outline"
                  className="border-2"
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default QuestsListPage;
