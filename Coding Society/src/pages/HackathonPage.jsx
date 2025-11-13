import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { useMode } from '../context/ModeContext';
import studentService from '../services/studentService';
import {
  Trophy,
  Users,
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Search,
  Filter,
  Star,
  Heart,
  Share,
  Bookmark,
  ExternalLink,
  TrendingUp,
  Award,
  ChevronRight,
  Globe,
  Code,
  Brain,
  Lightbulb,
  Rocket,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  FileText,
  Download,
  Upload,
  Eye,
  MessageSquare,
  ThumbsUp,
  Target,
  Zap,
  Timer,
  Cpu,
  Database,
  Smartphone,
  Monitor,
  Wifi,
  GitBranch,
  Package,
  Play,
  RefreshCw,
  Plus,
  Phone,
  Building
} from 'lucide-react';

const HackathonPage = () => {
  const { getCurrentTheme, currentMode, MODES } = useMode();
  const theme = getCurrentTheme();
  
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
          setHackathons(response.data);
          
          // Calculate stats from real data
          const activeEvents = response.data.filter(h => 
            h.status === 'registration_open' || h.status === 'in_progress'
          ).length;
          
          const totalPrizePool = response.data.reduce((sum, h) => {
            if (h.prizePool && typeof h.prizePool === 'string') {
              const amount = parseInt(h.prizePool.replace(/[^0-9]/g, ''));
              return sum + (amount || 0);
            }
            return sum + (h.prizePool || 0);
          }, 0);
          
          const totalParticipants = response.data.reduce((sum, h) => sum + (h.maxParticipants || 0), 0);
          
          setStats({
            totalHackathons: response.data.length,
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
      'registration_open': 'bg-green-100 text-green-800',
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
      'Beginner': 'bg-green-100 text-green-800',
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
      console.log('Registering for:', hackathon.title);
      
      if (hackathon.registrationUrl) {
        window.open(hackathon.registrationUrl, '_blank');
      } else {
        alert(`Registering for ${hackathon.title}...`);
      }
    };

    const handleViewDetails = () => {
      console.log('Viewing details for:', hackathon.title);
      
      if (hackathon.eventDetails) {
        window.open(studentService.getFileUrl(hackathon.eventDetails), '_blank');
      } else {
        alert(`Opening details for ${hackathon.title}...`);
      }
    };

    const handleBookmarkClick = (e) => {
      e.stopPropagation();
      console.log('Bookmarking:', hackathon.title);
      alert(`${hackathon.title} bookmarked!`);
    };

    const handleShareClick = (e) => {
      e.stopPropagation();
      console.log('Sharing:', hackathon.title);
      alert(`Sharing ${hackathon.title}...`);
    };

    return (
      <Card 
        key={hackathon.id} 
        className={`group bg-white border border-gray-200 hover:shadow-xl hover:border-purple-300 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
          hackathon.featured ? 'ring-2 ring-yellow-400 ring-opacity-50' : ''
        }`}
        onClick={handleViewDetails}
      >
        <CardHeader className="pb-4">
          {/* Featured badge */}
          {hackathon.featured && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg z-10">
              ⭐ Featured
            </div>
          )}

          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4 flex-1">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-2xl shadow-lg">
                {hackathon.logo}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-lg mb-1">
                  {hackathon.title}
                </h3>
                <p className="text-sm text-purple-600 font-medium mb-2">
                  {hackathon.organizer}
                </p>
                
                {/* Key details */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {hackathon.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {hackathon.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {hackathon.type}
                  </span>
                  {hackathon.mentorPhone && (
                    <span className="flex items-center gap-1 text-green-600">
                      <Phone className="w-3 h-3" />
                      {hackathon.mentorPhone}
                    </span>
                  )}
                </div>

                {/* Status and Difficulty badges */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(hackathon.status)}`}>
                    {getStatusLabel(hackathon.status)}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getDifficultyColor(hackathon.difficulty)}`}>
                    {hackathon.difficulty}
                  </span>
                  {hackathon.eventDetails && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Details
                    </span>
                  )}
                </div>

                {/* Prize Pool */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-1 text-green-600">
                    <Trophy className="w-4 h-4" />
                    <span className="font-bold text-lg">{hackathon.prize_pool}</span>
                  </div>
                  <span className="text-xs text-gray-600">total prizes</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <span className="text-xs text-gray-500">Deadline: {hackathon.registration_deadline}</span>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {hackathon.participants}/{hackathon.max_participants}
                </span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Description */}
          <p className="text-sm text-gray-700 mb-4 line-clamp-3">
            {hackathon.description}
          </p>

          {/* Themes/Tags */}
          {hackathon.themes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Themes:</h4>
              <div className="flex flex-wrap gap-1">
                {hackathon.themes.slice(0, 4).map((theme, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded-full">
                    {theme}
                  </span>
                ))}
                {hackathon.themes.length > 4 && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    +{hackathon.themes.length - 4} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Prizes Breakdown */}
          {hackathon.prizes.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Prize Breakdown:</h4>
              <div className="grid grid-cols-2 gap-2">
                {hackathon.prizes.slice(0, 4).map((prize, index) => (
                  <div key={index} className="text-xs bg-yellow-50 text-yellow-800 px-2 py-1 rounded">
                    <span className="font-semibold">{prize.place}:</span> {prize.amount}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sponsors */}
          {hackathon.sponsors.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Sponsors:</h4>
              <div className="flex flex-wrap gap-1">
                {hackathon.sponsors.slice(0, 3).map((sponsor, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-gray-50 text-gray-700 rounded-full flex items-center gap-1">
                    <Building className="w-3 h-3" />
                    {sponsor}
                  </span>
                ))}
                {hackathon.sponsors.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    +{hackathon.sponsors.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Event Stats */}
          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-purple-500">
                <Users className="w-3 h-3" />
                <span className="font-medium">{hackathon.participants}</span>
              </div>
              <span className="text-xs text-gray-600">Registered</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-500">
                <Users className="w-3 h-3" />
                <span className="font-medium">{hackathon.teams_registered}</span>
              </div>
              <span className="text-xs text-gray-600">Teams</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-500">
                <Calendar className="w-3 h-3" />
                <span className="font-medium">{hackathon.start_date}</span>
              </div>
              <span className="text-xs text-gray-600">Starts</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <Button 
              className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90 flex-1 text-sm text-white`}
              onClick={handleRegisterClick}
              disabled={hackathon.status === 'completed' || hackathon.status === 'in_progress'}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              {hackathon.status === 'registration_open' ? 'Register Now' : 
               hackathon.status === 'upcoming' ? 'Coming Soon' : 
               hackathon.status === 'in_progress' ? 'In Progress' : 'View Results'}
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50" onClick={handleBookmarkClick}>
              <Bookmark className="w-4 h-4 text-gray-600" />
            </Button>
            <Button variant="outline" size="sm" className="border-gray-300 hover:bg-gray-50" onClick={handleShareClick}>
              <Share className="w-4 h-4 text-gray-600" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className={`min-h-screen ${theme.background} pt-16 py-8`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${theme.gradient} flex items-center justify-center shadow-xl mb-4`}>
              <RefreshCw className="w-10 h-10 text-white animate-spin" />
            </div>
            <h1 className={`text-3xl font-bold ${theme.textPrimary} mb-2`}>Loading Hackathons...</h1>
            <p className={`text-lg ${theme.textSecondary}`}>Fetching the latest events</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme.background} pt-16 py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="text-center mb-8">
            <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-r ${theme.gradient} flex items-center justify-center shadow-xl mb-4`}>
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <h1 className={`text-5xl font-bold ${theme.textPrimary} mb-2`}>
              Hackathon Arena
            </h1>
            <p className={`text-xl ${theme.textSecondary} max-w-2xl mx-auto mb-6`}>
              Compete in elite hackathons, win amazing prizes, and showcase your innovation to the world
            </p>
            
            {/* Admin Content Status */}
            {hackathons.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 max-w-md mx-auto">
                <p className="text-sm text-green-800">
                  🏆 Showing {hackathons.length} hackathons from admin panel
                </p>
              </div>
            )}
            
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 max-w-md mx-auto">
                <p className="text-sm text-yellow-800">
                  ⚠️ Admin content unavailable, showing demo hackathons
                </p>
              </div>
            )}

            {/* Enhanced Search Bar */}
            <div className="max-w-4xl mx-auto mb-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <Input
                    type="text"
                    placeholder="Search hackathons by title, organizer, or themes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 bg-white border-gray-200 text-lg rounded-xl shadow-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <select 
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="h-14 px-4 border border-gray-200 rounded-xl bg-white text-gray-700 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="all">All Events</option>
                    <option value="open">Registration Open</option>
                    <option value="upcoming">Upcoming</option>
                    <option value="featured">Featured</option>
                  </select>
                  <Button 
                    className={`h-14 px-8 bg-gradient-to-r ${theme.gradient} hover:opacity-90 rounded-xl text-white`}
                    onClick={() => {
                      console.log('Host Hackathon clicked');
                      alert('Host Hackathon modal would open here!');
                    }}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Host Event
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Dashboard */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className={`${theme.cardBg} border ${theme.border} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-4 text-center">
              <div className={`text-2xl font-bold ${theme.accent1} mb-1`}>{stats.totalHackathons}</div>
              <div className={`text-xs ${theme.textSecondary}`}>Total Events</div>
              <div className="text-xs text-green-600 mt-1">+8 this month</div>
            </CardContent>
          </Card>
          <Card className={`${theme.cardBg} border ${theme.border} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{stats.activeEvents}</div>
              <div className={`text-xs ${theme.textSecondary}`}>Active Events</div>
              <div className="text-xs text-green-600 mt-1">+5 this week</div>
            </CardContent>
          </Card>
          <Card className={`${theme.cardBg} border ${theme.border} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                ${(stats.totalPrizePool / 1000).toFixed(0)}k
              </div>
              <div className={`text-xs ${theme.textSecondary}`}>Total Prizes</div>
              <div className="text-xs text-green-600 mt-1">+15% this year</div>
            </CardContent>
          </Card>
          <Card className={`${theme.cardBg} border ${theme.border} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {(stats.participants / 1000).toFixed(1)}k
              </div>
              <div className={`text-xs ${theme.textSecondary}`}>Participants</div>
              <div className="text-xs text-green-600 mt-1">+28% growth</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
              <TabsList className="grid w-full grid-cols-3 bg-gradient-to-r from-gray-50 to-gray-100 p-1 rounded-xl border border-gray-200">
                <TabsTrigger value="hackathons" className="flex items-center gap-2 text-sm font-medium rounded-lg text-gray-700 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm transition-all">
                  <Trophy className="w-4 h-4" />
                  Hackathons
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center gap-2 text-sm font-medium rounded-lg text-gray-700 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm transition-all">
                  <FileText className="w-4 h-4" />
                  Resources
                </TabsTrigger>
                <TabsTrigger value="winners" className="flex items-center gap-2 text-sm font-medium rounded-lg text-gray-700 data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm transition-all">
                  <Award className="w-4 h-4" />
                  Past Winners
                </TabsTrigger>
              </TabsList>

              <TabsContent value="hackathons" className="space-y-6 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Live Hackathons</h2>
                    <p className="text-gray-600">{filteredHackathons.length} events found</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredHackathons.map(renderHackathonCard)}
                </div>

                {filteredHackathons.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No hackathons found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your search terms or filters</p>
                    <Button 
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedFilter('all');
                      }}
                      className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90 text-white`}
                    >
                      Clear Filters
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="resources" className="space-y-6 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hackathon Resources</h2>
                    <p className="text-gray-600">Tools and guides to help you succeed</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {resources.map((resource) => (
                    <Card key={resource.id} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer">
                      <CardContent className="p-6 text-center">
                        <div className="text-4xl mb-4">{resource.icon}</div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{resource.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{resource.description}</p>
                        
                        <div className="flex items-center justify-between text-sm mb-4">
                          <span className="text-gray-500">{resource.downloads || resource.users}</span>
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-current" />
                            <span className="font-medium">{resource.rating}</span>
                          </div>
                        </div>

                        <Button 
                          className={`w-full ${resource.access === 'Free' ? 'bg-green-600 hover:bg-green-700' : `bg-gradient-to-r ${theme.gradient} hover:opacity-90`} text-white`}
                        >
                          {resource.access === 'Free' ? 'Free Access' : 'Premium'}
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="winners" className="space-y-6 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Hall of Fame</h2>
                    <p className="text-gray-600">Celebrating our champion teams</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {past_winners.map((winner) => (
                    <Card key={winner.id} className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-2xl">
                            🏆
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-xl font-bold text-gray-900">{winner.project}</h3>
                              <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                                {winner.prize}
                              </span>
                            </div>
                            <p className="text-sm text-orange-600 font-semibold mb-1">{winner.team_name}</p>
                            <p className="text-sm text-gray-600 mb-3">{winner.hackathon}</p>
                            <p className="text-sm text-gray-700 mb-4">{winner.description}</p>
                            
                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="text-xs font-semibold text-gray-600">Team:</span>
                              {winner.members.map((member, index) => (
                                <span key={index} className="text-xs px-2 py-1 bg-white text-gray-700 rounded-full">
                                  {member}
                                </span>
                              ))}
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                              <span className="text-xs font-semibold text-gray-600">Tech Stack:</span>
                              {winner.tech_stack.map((tech, index) => (
                                <span key={index} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                  {tech}
                                </span>
                              ))}
                            </div>

                            <div className="flex gap-3">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(winner.github, '_blank')}
                              >
                                <GitBranch className="w-4 h-4 mr-2" />
                                GitHub
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => window.open(winner.demo, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Live Demo
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Enhanced Sidebar */}
          <div className="xl:col-span-1 space-y-6">
            {/* Registration Timeline */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Registration Timeline
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">AI Challenge</span>
                  <span className="text-xs text-red-600 font-medium">2 days left</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Climate Tech</span>
                  <span className="text-xs text-orange-600 font-medium">1 week left</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">FinTech Revolution</span>
                  <span className="text-xs text-green-600 font-medium">3 weeks left</span>
                </div>
              </CardContent>
            </Card>

            {/* Team Formation */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-blue-900 text-lg flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Find Your Team
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-blue-700">
                  Connect with like-minded hackers and form winning teams.
                </p>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    console.log('Find Team clicked');
                    alert('Team formation tool would open here!');
                  }}
                >
                  <Users className="w-4 h-4 mr-2" />
                  Find Teammates
                </Button>
              </CardContent>
            </Card>

            {/* Prize Pool Stats */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Prize Pool Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Largest Prize</span>
                  <span className="text-sm font-bold text-green-600">$100k</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Prize</span>
                  <span className="text-sm font-bold text-blue-600">$45k</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Total This Month</span>
                  <span className="text-sm font-bold text-purple-600">$850k</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-sm font-bold text-orange-600">15%</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Button 
                    className={`w-full bg-gradient-to-r ${theme.gradient} hover:opacity-90 text-white`}
                    onClick={() => {
                      console.log('Host Event clicked');
                      alert('Host Hackathon modal would open here!');
                    }}
                  >
                    <Trophy className="w-4 h-4 mr-2" />
                    Host Event
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      console.log('My Events clicked');
                      alert('My Events page would open here!');
                    }}
                  >
                    <Calendar className="w-4 h-4 mr-2" />
                    My Events
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full border-gray-200 text-gray-700 hover:bg-gray-50"
                    onClick={() => {
                      console.log('Submit Project clicked');
                      alert('Submit Project modal would open here!');
                    }}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Submit Project
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HackathonPage;