/**
 * Challenges List Page
 * Browse and filter coding challenges
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, Code2, Clock, Trophy, 
  TrendingUp, CheckCircle2, Lock, Loader2 
} from 'lucide-react';

const DIFFICULTY_COLORS = {
  'Easy': 'text-green-600 bg-green-50 border-green-200',
  'Medium': 'text-yellow-600 bg-yellow-50 border-yellow-200',
  'Hard': 'text-red-600 bg-red-50 border-red-200'
};

const CATEGORIES = [
  'All',
  'Array',
  'String',
  'LinkedList',
  'Tree',
  'Graph',
  'DynamicProgramming',
  'Sorting',
  'Searching',
  'Stack',
  'Queue',
  'Hashing',
  'Math'
];

const ChallengesListPage = () => {
  const navigate = useNavigate();

  // State
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('createdAt');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Fetch challenges
  useEffect(() => {
    fetchChallenges();
  }, [currentPage, selectedDifficulty, selectedCategory, sortBy, searchQuery]);

  const fetchChallenges = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage,
        limit: 20,
        sortBy,
        order: 'desc'
      });

      if (selectedDifficulty) params.append('difficulty', selectedDifficulty);
      if (selectedCategory !== 'All') params.append('category', selectedCategory);
      if (searchQuery) params.append('search', searchQuery);

      const token = localStorage.getItem('token');
      const response = await fetch(`/api/v1/challenges?${params}`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });

      if (!response.ok) throw new Error('Failed to fetch challenges');

      const data = await response.json();
      setChallenges(data.data.challenges);
      setTotalPages(data.data.pagination.totalPages);
      setHasMore(data.data.pagination.hasMore);

    } catch (error) {
      console.error('Error fetching challenges:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChallengeClick = (slug) => {
    navigate(`/challenges/${slug}`);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchChallenges();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Code2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Coding Challenges</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Trophy className="w-4 h-4" />
              <span>{challenges.length} Problems</span>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search */}
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search problems by title, ID, or tags..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </form>

            {/* Difficulty Filter */}
            <select
              value={selectedDifficulty}
              onChange={(e) => {
                setSelectedDifficulty(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="createdAt">Newest</option>
              <option value="statistics.acceptanceRate">Acceptance Rate</option>
              <option value="statistics.totalAttempts">Most Attempted</option>
            </select>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 mt-3 overflow-x-auto pb-2">
            {CATEGORIES.map(category => (
              <button
                key={category}
                onClick={() => {
                  setSelectedCategory(category);
                  setCurrentPage(1);
                }}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          </div>
        ) : challenges.length === 0 ? (
          <div className="text-center py-12">
            <Code2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No challenges found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        ) : (
          <>
            {/* Challenges Grid */}
            <div className="space-y-3">
              {challenges.map(challenge => (
                <ChallengeCard
                  key={challenge._id}
                  challenge={challenge}
                  onClick={() => handleChallengeClick(challenge.slug)}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-8">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={!hasMore}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// CHALLENGE CARD COMPONENT
// ============================================================================

const ChallengeCard = ({ challenge, onClick }) => {
  const acceptanceRate = challenge.statistics?.acceptanceRate || 0;
  const isSolved = challenge.isSolved || false;

  return (
    <div
      onClick={onClick}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between">
        {/* Left: Problem Info */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            {/* Status Icon */}
            {isSolved ? (
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
            )}

            {/* Problem ID */}
            <span className="text-sm font-mono text-gray-500">
              {challenge.problemId}
            </span>

            {/* Title */}
            <h3 className="text-base font-semibold text-gray-900 hover:text-blue-600">
              {challenge.title}
            </h3>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-2 flex-wrap ml-8">
            <span className={`px-2 py-1 text-xs font-medium rounded border ${DIFFICULTY_COLORS[challenge.difficulty]}`}>
              {challenge.difficulty}
            </span>
            <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-700">
              {challenge.category}
            </span>
            {challenge.tags?.slice(0, 2).map(tag => (
              <span key={tag} className="px-2 py-1 text-xs rounded bg-blue-50 text-blue-700">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Right: Stats */}
        <div className="flex items-center gap-6 ml-4">
          {/* Acceptance Rate */}
          <div className="text-center">
            <div className="text-sm font-semibold text-gray-900">
              {acceptanceRate.toFixed(1)}%
            </div>
            <div className="text-xs text-gray-500">Acceptance</div>
          </div>

          {/* Difficulty Indicator */}
          <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-gray-50">
            {challenge.difficulty === 'Easy' && (
              <div className="w-2 h-8 bg-green-500 rounded-full" />
            )}
            {challenge.difficulty === 'Medium' && (
              <div className="flex gap-0.5">
                <div className="w-1.5 h-8 bg-yellow-500 rounded-full" />
                <div className="w-1.5 h-6 bg-yellow-500 rounded-full mt-2" />
              </div>
            )}
            {challenge.difficulty === 'Hard' && (
              <div className="flex gap-0.5">
                <div className="w-1 h-8 bg-red-500 rounded-full" />
                <div className="w-1 h-6 bg-red-500 rounded-full mt-2" />
                <div className="w-1 h-4 bg-red-500 rounded-full mt-4" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChallengesListPage;
