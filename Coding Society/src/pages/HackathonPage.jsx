import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import studentService from '../services/studentService';
import {
  Trophy,
  Users,
  Calendar,
  MapPin,
  Clock,
  Search,
  Star,
  Share,
  Bookmark,
  ExternalLink,
  TrendingUp,
  Award,
  Globe,
  Rocket,
  CheckCircle,
  FileText,
  Building,
  Plus,
  Phone,
  Filter,
  GitBranch,
  Zap,
  Target,
  Layout
} from 'lucide-react';

const HackathonPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('hackathons');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // State for dynamic data from admin panel
  const [hackathons, setHackathons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalHackathons: 0,
    activeEvents: 0,
    totalPrizePool: 0,
    participants: 0
  });

  // Load hackathons from admin panel
  useEffect(() => {
    const loadHackathons = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await studentService.getHackathons();
        
        if (response.success && response.data) {
          const hackathonsData = response.data.hackathons || [];
          setHackathons(hackathonsData);
          
          // Calculate stats from real data
          const activeEvents = hackathonsData.filter(h => 
            h.status === 'registration_open' || h.status === 'in_progress'
          ).length;
          
          const totalPrizePool = hackathonsData.reduce((sum, h) => {
            if (h.prizePool && typeof h.prizePool === 'string') {
              const amount = parseInt(h.prizePool.replace(/[^0-9]/g, ''));
              return sum + (amount || 0);
            }
            return sum + (h.prizePool || 0);
          }, 0);
          
          const totalParticipants = hackathonsData.reduce((sum, h) => sum + (h.maxParticipants || 0), 0);
          
          setStats({
            totalHackathons: hackathonsData.length,
            activeEvents,
            totalPrizePool,
            participants: totalParticipants
          });
        }
      } catch (error) {
        console.error('Error loading hackathons:', error);
        setError('Failed to load hackathons. Showing demo content.');
        
        // Use fallback data when admin panel is not available
        setHackathons([]);
        setStats({ totalHackathons: 156, activeEvents: 23, totalPrizePool: 850000, participants: 12500 });
      } finally {
        setIsLoading(false);
      }
    };

    loadHackathons();
  }, []);

  // Fallback data for demonstration
  const fallbackHackathons = [
    {
      id: 1,
      title: 'AI Innovation Challenge 2024',
      organizer: 'Google & DeepMind',
      logo: '🤖',
      location: 'San Francisco, CA',
      type: 'In-person',
      duration: '48 hours',
      prize_pool: '$100,000',
      start_date: 'Mar 15, 2024',
      end_date: 'Mar 17, 2024',
      registration_deadline: 'Mar 10, 2024',
      participants: 2500,
      max_participants: 3000,
      teams_registered: 625,
      difficulty: 'Advanced',
      themes: ['Artificial Intelligence', 'Machine Learning', 'Computer Vision', 'NLP'],
      description: 'Build innovative AI solutions that can solve real-world problems. Focus on ethical AI, accessibility, and social impact.',
      requirements: ['AI/ML experience', 'Team of 2-4 members', 'Original code only'],
      prizes: [
        { place: '1st', amount: '$50,000', description: 'Grand Prize Winner' },
        { place: '2nd', amount: '$25,000', description: 'Runner-up' },
        { place: '3rd', amount: '$15,000', description: 'Third Place' },
        { place: 'Special', amount: '$10,000', description: 'Best Social Impact' }
      ],
      sponsors: ['Google', 'NVIDIA', 'Microsoft', 'AWS'],
      featured: true,
      status: 'registration_open'
    },
    {
      id: 2,
      title: 'Climate Tech Hackathon',
      organizer: 'Tesla & Climate Foundation',
      logo: '🌱',
      location: 'Austin, TX',
      type: 'Hybrid',
      duration: '72 hours',
      prize_pool: '$75,000',
      start_date: 'Mar 22, 2024',
      end_date: 'Mar 25, 2024',
      registration_deadline: 'Mar 18, 2024',
      participants: 1800,
      max_participants: 2000,
      teams_registered: 450,
      difficulty: 'Intermediate',
      themes: ['Clean Energy', 'Sustainability', 'Climate Monitoring', 'Green Tech'],
      description: 'Develop technology solutions to combat climate change and promote environmental sustainability.',
      requirements: ['Passion for environment', 'Technical skills', 'Team of 3-5 members'],
      prizes: [
        { place: '1st', amount: '$40,000', description: 'Climate Champion' },
        { place: '2nd', amount: '$20,000', description: 'Eco Innovator' },
        { place: '3rd', amount: '$10,000', description: 'Green Pioneer' },
        { place: 'Special', amount: '$5,000', description: 'Most Scalable Solution' }
      ],
      sponsors: ['Tesla', 'Greenpeace', 'UN Climate', 'Solar City'],
      featured: true,
      status: 'registration_open'
    }
  ];

  // Convert admin data to component format or use fallback
  const processedHackathons = hackathons.length > 0 ? hackathons.map(hackathon => ({
    id: hackathon._id || hackathon.id,
    title: hackathon.title,
    organizer: hackathon.organizer || 'Event Organizer',
    logo: getEventLogo(hackathon.type),
    location: hackathon.location || 'TBD',
    type: hackathon.eventFormat || hackathon.type || 'Hybrid',
    duration: hackathon.duration || '48 hours',
    prize_pool: hackathon.prizePool || '$0',
    start_date: studentService.formatDate(hackathon.startDate),
    end_date: studentService.formatDate(hackathon.endDate),
    registration_deadline: studentService.formatDate(hackathon.registrationEndDate),
    participants: hackathon.currentParticipants || Math.floor(Math.random() * 2000) + 500,
    max_participants: hackathon.maxParticipants || 3000,
    teams_registered: Math.floor((hackathon.currentParticipants || 1000) / 4),
    difficulty: hackathon.difficulty || 'Intermediate',
    themes: hackathon.themes || hackathon.tags || [],
    description: hackathon.description,
    requirements: hackathon.requirements || [],
    prizes: hackathon.prizes || generateDefaultPrizes(hackathon.prizePool),
    sponsors: hackathon.sponsors || [],
    featured: hackathon.featured || false,
    status: hackathon.status || 'upcoming',
    mentorPhone: hackathon.mentor?.phone, // Include mentor phone from admin panel
    registrationUrl: hackathon.registrationUrl,
    eventDetails: hackathon.fileUrl, // Include event details file
    schedule: hackathon.schedule
  })) : fallbackHackathons;

  // Helper functions
  function getEventLogo(type) {
    const logoMap = {
      'AI/Tech': '🤖',
      'Climate': '🌱',
      'FinTech': '💰',
      'Healthcare': '🏥',
      'Education': '📚',
      'Gaming': '🎮',
      'Security': '🔒',
      'IoT': '🌐'
    };
    return logoMap[type] || '🚀';
  }

  function generateDefaultPrizes(prizePool) {
    if (!prizePool) return [];
    
    const total = typeof prizePool === 'string' 
      ? parseInt(prizePool.replace(/[^0-9]/g, '')) 
      : prizePool;
    
    if (total === 0) return [];
    
    return [
      { place: '1st', amount: `$${Math.floor(total * 0.5).toLocaleString()}`, description: 'First Place' },
      { place: '2nd', amount: `$${Math.floor(total * 0.3).toLocaleString()}`, description: 'Second Place' },
      { place: '3rd', amount: `$${Math.floor(total * 0.2).toLocaleString()}`, description: 'Third Place' }
    ];
  }

  function getStatusColor(status) {
    const colorMap = {
      'upcoming': 'bg-blue-100 text-blue-800',
      'registration_open': 'bg-emerald-100 text-emerald-800',
      'in_progress': 'bg-orange-100 text-orange-800',
      'judging': 'bg-purple-100 text-purple-800',
      'completed': 'bg-gray-100 text-gray-800'
    };
    return colorMap[status] || 'bg-gray-100 text-gray-800';
  }

  function getStatusLabel(status) {
    const labelMap = {
      'upcoming': 'Upcoming',
      'registration_open': 'Registration Open',
      'in_progress': 'In Progress',
      'judging': 'Judging',
      'completed': 'Completed'
    };
    return labelMap[status] || 'Unknown';
  }

  function getDifficultyColor(difficulty) {
    const colorMap = {
      'Beginner': 'bg-emerald-100 text-emerald-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Advanced': 'bg-red-100 text-red-800'
    };
    return colorMap[difficulty] || 'bg-gray-100 text-gray-800';
  }

  // Static data for resources and past winners
  const resources = [
    {
      id: 1,
      title: 'Hackathon Preparation Guide',
      type: 'Guide',
      icon: '📚',
      description: 'Complete guide to preparing for and winning hackathons',
      downloads: '25K+',
      rating: 4.9,
      access: 'Free'
    },
    {
      id: 2,
      title: 'Team Formation Tool',
      type: 'Tool',
      icon: '👥',
      description: 'Find teammates with complementary skills for your hackathon',
      users: '15K+',
      rating: 4.7,
      access: 'Free'
    },
    {
      id: 3,
      title: 'Pitch Deck Templates',
      type: 'Templates',
      icon: '🎯',
      description: 'Professional templates for hackathon presentations',
      downloads: '30K+',
      rating: 4.8,
      access: 'Premium'
    }
  ];

  const past_winners = [
    {
      id: 1,
      hackathon: 'AI Innovation Challenge 2023',
      team_name: 'Neural Pioneers',
      project: 'EduAI - Personalized Learning Assistant',
      members: ['Sarah Chen', 'Marcus Rodriguez', 'Emily Kim', 'David Park'],
      prize: '$50,000',
      description: 'An AI-powered educational platform that adapts to individual learning styles and provides personalized recommendations.',
      tech_stack: ['Python', 'TensorFlow', 'React', 'Node.js', 'MongoDB'],
      github: 'https://github.com/neural-pioneers/eduai',
      demo: 'https://eduai-demo.com'
    },
    {
      id: 2,
      hackathon: 'Climate Tech Hackathon 2023',
      team_name: 'Green Innovators',
      project: 'CarbonTrack - Smart Emission Monitor',
      members: ['Alex Johnson', 'Lisa Wang', 'Tom Wilson'],
      prize: '$40,000',
      description: 'IoT-based system for real-time carbon emission tracking and optimization for businesses.',
      tech_stack: ['IoT', 'Python', 'AWS', 'React Native', 'PostgreSQL'],
      github: 'https://github.com/green-innovators/carbontrack',
      demo: 'https://carbontrack.eco'
    }
  ];

  // Filter hackathons
  const filteredHackathons = useMemo(() => {
    let filtered = [...processedHackathons];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(hackathon =>
        hackathon.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hackathon.organizer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hackathon.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        hackathon.themes.some(theme => theme.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status/type
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'open') {
        filtered = filtered.filter(h => h.status === 'registration_open');
      } else if (selectedFilter === 'upcoming') {
        filtered = filtered.filter(h => h.status === 'upcoming');
      } else if (selectedFilter === 'featured') {
        filtered = filtered.filter(h => h.featured);
      }
    }

    // Sort by featured first, then by start date
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.start_date) - new Date(a.start_date);
    });

    return filtered;
  }, [processedHackathons, searchTerm, selectedFilter]);

  const renderHackathonCard = (hackathon) => {
    const handleRegisterClick = (e) => {
      e.stopPropagation();
      if (hackathon.registrationUrl) {
        window.open(hackathon.registrationUrl, '_blank');
      } else {
        alert(`Registering for ${hackathon.title}...`);
      }
    };

    const handleViewDetails = () => {
      if (hackathon.eventDetails) {
        window.open(studentService.getFileUrl(hackathon.eventDetails), '_blank');
      } else {
        alert(`Opening details for ${hackathon.title}...`);
      }
    };

    return (
      <div 
        key={hackathon.id} 
        className={`group bg-white rounded-3xl border border-gray-100 shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer overflow-hidden ${
          hackathon.featured ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
        }`}
        onClick={handleViewDetails}
      >
        <div className="p-6">
          {/* Featured badge */}
          {hackathon.featured && (
            <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-4 py-1 rounded-bl-2xl font-bold shadow-sm z-10">
              ⭐ Featured
            </div>
          )}

          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4 flex-1">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-3xl shadow-lg shadow-purple-500/20 text-white">
                {hackathon.logo}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-xl mb-1 group-hover:text-purple-600 transition-colors">
                  {hackathon.title}
                </h3>
                <p className="text-sm text-purple-600 font-bold mb-2">
                  {hackathon.organizer}
                </p>
                
                {/* Key details */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 mb-3">
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                    <MapPin className="w-3 h-3" />
                    {hackathon.location}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                    <Clock className="w-3 h-3" />
                    {hackathon.duration}
                  </span>
                  <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg">
                    <Globe className="w-3 h-3" />
                    {hackathon.type}
                  </span>
                  {hackathon.mentorPhone && (
                    <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 px-2 py-1 rounded-lg">
                      <Phone className="w-3 h-3" />
                      {hackathon.mentorPhone}
                    </span>
                  )}
                </div>

                {/* Status and Difficulty badges */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${getStatusColor(hackathon.status)}`}>
                    {getStatusLabel(hackathon.status)}
                  </span>
                  <span className={`text-xs px-3 py-1 rounded-full font-bold ${getDifficultyColor(hackathon.difficulty)}`}>
                    {hackathon.difficulty}
                  </span>
                </div>

                {/* Prize Pool */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-xl">
                    <Trophy className="w-4 h-4" />
                    <span className="font-bold text-lg">{hackathon.prize_pool}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-medium">total prizes</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-lg">Deadline: {hackathon.registration_deadline}</span>
              <div className="flex items-center space-x-1 bg-gray-50 px-2 py-1 rounded-lg">
                <Users className="w-3 h-3 text-gray-400" />
                <span className="text-xs font-bold text-gray-600">
                  {hackathon.participants}/{hackathon.max_participants}
                </span>
              </div>
            </div>
          </div>
        
          {/* Description */}
          <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">
            {hackathon.description}
          </p>

          {/* Themes/Tags */}
          {hackathon.themes.length > 0 && (
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                {hackathon.themes.slice(0, 4).map((theme, index) => (
                  <span key={index} className="text-xs px-3 py-1 bg-purple-50 text-purple-700 rounded-full font-medium border border-purple-100">
                    {theme}
                  </span>
                ))}
                {hackathon.themes.length > 4 && (
                  <span className="text-xs px-3 py-1 bg-gray-50 text-gray-500 rounded-full font-medium border border-gray-100">
                    +{hackathon.themes.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-gray-50">
            <Button 
              className={`flex-1 rounded-xl font-bold shadow-lg shadow-purple-500/20 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white`}
              onClick={handleRegisterClick}
              disabled={hackathon.status === 'completed' || hackathon.status === 'in_progress'}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {hackathon.status === 'registration_open' ? 'Register Now' : 
               hackathon.status === 'upcoming' ? 'Coming Soon' : 
               hackathon.status === 'in_progress' ? 'In Progress' : 'View Results'}
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900" onClick={(e) => { e.stopPropagation(); alert('Bookmarked!'); }}>
              <Bookmark className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-900" onClick={(e) => { e.stopPropagation(); alert('Shared!'); }}>
              <Share className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-20">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center justify-center p-3 bg-purple-100 rounded-2xl mb-6 shadow-inner">
            <Trophy className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            Hackathon <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Arena</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8 leading-relaxed">
            Compete in elite hackathons, win amazing prizes, and showcase your innovation to the world.
          </p>
          
          {/* Search & Filter Bar */}
          <div className="max-w-3xl mx-auto bg-white p-2 rounded-2xl shadow-xl border border-gray-100 flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search hackathons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 h-12 bg-gray-50 border-none rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-purple-500/20 focus:bg-white transition-all outline-none"
              />
            </div>
            <div className="flex gap-2">
              <select 
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value)}
                className="h-12 px-4 bg-gray-50 border-none rounded-xl text-gray-700 font-medium focus:ring-2 focus:ring-purple-500/20 outline-none cursor-pointer hover:bg-gray-100 transition-colors"
              >
                <option value="all">All Events</option>
                <option value="open">Registration Open</option>
                <option value="upcoming">Upcoming</option>
                <option value="featured">Featured</option>
              </select>
              <Button 
                className="h-12 px-6 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 shadow-lg shadow-gray-900/20"
                onClick={() => alert('Host Hackathon modal would open here!')}
              >
                <Plus className="w-5 h-5 mr-2" />
                Host
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {[
            { label: 'Total Events', value: stats.totalHackathons, icon: Trophy, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Active Now', value: stats.activeEvents, icon: Zap, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Prize Pool', value: `$${(stats.totalPrizePool / 1000).toFixed(0)}k`, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Participants', value: `${(stats.participants / 1000).toFixed(1)}k`, icon: Users, color: 'text-orange-600', bg: 'bg-orange-50' }
          ].map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xl flex items-center gap-4 hover:scale-105 transition-transform duration-300">
              <div className={`w-12 h-12 rounded-2xl ${stat.bg} flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div>
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{stat.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            {/* Custom Tabs */}
            <div className="flex items-center gap-2 mb-8 bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm w-fit">
              {[
                { id: 'hackathons', label: 'Hackathons', icon: Trophy },
                { id: 'resources', label: 'Resources', icon: FileText },
                { id: 'winners', label: 'Hall of Fame', icon: Award }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setSelectedTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold transition-all ${
                    selectedTab === tab.id
                      ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </div>

            {selectedTab === 'hackathons' && (
              <div className="space-y-8">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-gray-900">Live Hackathons</h2>
                  <span className="px-4 py-1.5 bg-gray-100 text-gray-600 rounded-full text-sm font-bold">
                    {filteredHackathons.length} events found
                  </span>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {filteredHackathons.map(renderHackathonCard)}
                </div>

                {filteredHackathons.length === 0 && (
                  <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 shadow-xl">
                    <div className="w-20 h-20 mx-auto bg-gray-50 rounded-full flex items-center justify-center mb-6">
                      <Search className="w-10 h-10 text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No hackathons found</h3>
                    <p className="text-gray-500 mb-8">Try adjusting your search terms or filters</p>
                    <Button 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedFilter('all');
                      }}
                      className="bg-purple-600 text-white rounded-xl px-8 py-3 font-bold hover:bg-purple-700"
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </div>
            )}

            {selectedTab === 'resources' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900">Hackathon Resources</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map((resource) => (
                    <div key={resource.id} className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 hover:shadow-2xl transition-all duration-300 group cursor-pointer">
                      <div className="text-4xl mb-6 bg-gray-50 w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">{resource.icon}</div>
                      <h3 className="text-xl font-bold text-gray-900 mb-2">{resource.title}</h3>
                      <p className="text-sm text-gray-500 mb-6 leading-relaxed">{resource.description}</p>
                      
                      <div className="flex items-center justify-between text-sm mb-6">
                        <span className="text-gray-400 font-medium">{resource.downloads || resource.users}</span>
                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          <span className="font-bold text-yellow-700">{resource.rating}</span>
                        </div>
                      </div>

                      <Button 
                        className={`w-full rounded-xl font-bold ${
                          resource.access === 'Free' 
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-100' 
                            : 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg shadow-purple-600/20'
                        }`}
                      >
                        {resource.access === 'Free' ? 'Free Access' : 'Premium'}
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selectedTab === 'winners' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-gray-900">Hall of Fame</h2>
                <div className="grid grid-cols-1 gap-6">
                  {past_winners.map((winner) => (
                    <div key={winner.id} className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-3xl border border-amber-100 shadow-xl p-8 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Trophy className="w-64 h-64 text-amber-500" />
                      </div>
                      
                      <div className="relative z-10 flex flex-col md:flex-row gap-8">
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-4xl shadow-lg shadow-amber-500/20 flex-shrink-0">
                          🏆
                        </div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">{winner.project}</h3>
                            <span className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-bold border border-amber-200">
                              {winner.prize}
                            </span>
                          </div>
                          <p className="text-lg text-orange-600 font-bold mb-2">{winner.team_name}</p>
                          <p className="text-sm text-gray-500 font-medium mb-4 uppercase tracking-wide">{winner.hackathon}</p>
                          <p className="text-gray-700 mb-6 leading-relaxed max-w-2xl">{winner.description}</p>
                          
                          <div className="flex flex-wrap gap-2 mb-6">
                            {winner.tech_stack.map((tech, index) => (
                              <span key={index} className="text-xs px-3 py-1 bg-white/80 text-gray-700 rounded-full font-medium border border-white/50">
                                {tech}
                              </span>
                            ))}
                          </div>

                          <div className="flex gap-3">
                            <Button 
                              variant="outline" 
                              className="rounded-xl border-amber-200 bg-white/50 hover:bg-white text-amber-900"
                              onClick={() => window.open(winner.github, '_blank')}
                            >
                              <GitBranch className="w-4 h-4 mr-2" />
                              GitHub
                            </Button>
                            <Button 
                              className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white border-none shadow-lg shadow-amber-500/20"
                              onClick={() => window.open(winner.demo, '_blank')}
                            >
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Live Demo
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Registration Timeline */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                <Clock className="w-5 h-5 text-purple-600" />
                Timeline
              </h3>
              <div className="space-y-4">
                {[
                  { name: 'AI Challenge', time: '2 days left', color: 'text-red-500' },
                  { name: 'Climate Tech', time: '1 week left', color: 'text-orange-500' },
                  { name: 'FinTech Revolution', time: '3 weeks left', color: 'text-emerald-500' }
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-medium text-gray-700">{item.name}</span>
                    <span className={`text-xs font-bold ${item.color}`}>{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Formation */}
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl shadow-xl p-6 text-white relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Users className="w-32 h-32" />
              </div>
              <h3 className="text-lg font-bold flex items-center gap-2 mb-4 relative z-10">
                <Users className="w-5 h-5" />
                Find Your Team
              </h3>
              <p className="text-blue-100 text-sm mb-6 relative z-10 leading-relaxed">
                Connect with like-minded hackers and form winning teams for upcoming events.
              </p>
              <Button 
                className="w-full bg-white text-blue-600 hover:bg-blue-50 font-bold rounded-xl shadow-lg relative z-10"
                onClick={() => alert('Team formation tool would open here!')}
              >
                Find Teammates
              </Button>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                <Rocket className="w-5 h-5 text-purple-600" />
                Quick Actions
              </h3>
              <div className="space-y-3">
                <Button 
                  className="w-full bg-gray-900 text-white hover:bg-gray-800 rounded-xl font-bold justify-start h-12"
                  onClick={() => alert('Host Hackathon modal would open here!')}
                >
                  <Trophy className="w-4 h-4 mr-3" />
                  Host Event
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold justify-start h-12"
                  onClick={() => alert('My Events page would open here!')}
                >
                  <Calendar className="w-4 h-4 mr-3" />
                  My Events
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl font-bold justify-start h-12"
                  onClick={() => alert('Submit Project modal would open here!')}
                >
                  <Layout className="w-4 h-4 mr-3" />
                  Submit Project
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonPage;