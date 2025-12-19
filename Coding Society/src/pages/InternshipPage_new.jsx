import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { useMode } from '../context/ModeContext';
import internshipService from '../services/internshipService';
import {
  GraduationCap,
  MapPin,
  Clock,
  DollarSign,
  Users,
  Building,
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
  Calendar,
  Globe,
  Mail,
  Phone,
  Linkedin,
  Github,
  Twitter,
  Plus,
  Target,
  Zap,
  Trophy,
  BookOpen,
  Code,
  Palette,
  Database,
  Shield,
  Smartphone,
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
  Video,
  PlayCircle,
  UserCheck,
  Briefcase,
  PieChart,
  BarChart3,
  LineChart,
  Layers,
  Cpu,
  Wifi,
  Camera,
  Mic,
  RefreshCw
} from 'lucide-react';

const InternshipPage = () => {
  const { getCurrentTheme, currentMode, MODES } = useMode();
  const theme = getCurrentTheme();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('internships');
  const [selectedFilter, setSelectedFilter] = useState('all');
  
  // State for dynamic data from admin panel
  const [internships, setInternships] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({
    totalInternships: 0,
    openPositions: 0,
    companies: 0,
    avgStipend: 0
  });

  // Load internships from admin panel
  useEffect(() => {
    const loadInternships = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await internshipService.getInternships();
        
        if (response.success && response.data) {
          setInternships(response.data);
          
          // Calculate stats from real data
          const openInternships = response.data.filter(i => i.status === 'open').length;
          const uniqueCompanies = new Set(response.data.map(i => i.company)).size;
          const avgStipend = response.data.reduce((sum, i) => sum + (i.stipend || 0), 0) / response.data.length;
          
          setStats({
            totalInternships: response.data.length,
            openPositions: openInternships,
            companies: uniqueCompanies,
            avgStipend: Math.round(avgStipend)
          });
        }
      } catch (error) {
        console.error('Error loading internships:', error);
        setError('Failed to load internships. Showing demo content.');
        
        // Use fallback data when admin panel is not available
        setInternships([]);
        setStats({ totalInternships: 235, openPositions: 156, companies: 85, avgStipend: 7200 });
      } finally {
        setIsLoading(false);
      }
    };

    loadInternships();
  }, []);

  // Fallback data for demonstration
  const fallbackInternships = [
    {
      id: 1,
      title: 'Software Engineering Intern',
      company: 'Google',
      logo: '🟡',
      location: 'Mountain View, CA',
      duration: '12 weeks',
      stipend: '$8,500/month',
      posted: '2 days ago',
      applicants: 1250,
      spots: 50,
      skills: ['Python', 'Java', 'React', 'Machine Learning', 'System Design'],
      description: 'Work on cutting-edge projects that impact billions of users. Collaborate with world-class engineers and contribute to products like Search, YouTube, and Cloud.',
      requirements: ['CS or related major', '3.5+ GPA', 'Strong coding skills', 'Previous internship preferred'],
      featured: true,
      remote: false,
      level: 'Intermediate',
      team: 'Core Engineering',
      benefits: ['Housing stipend', 'Free meals', 'Mentorship', 'Full-time offer potential'],
      application_deadline: 'Mar 15, 2024',
      start_date: 'Jun 1, 2024',
      status: 'open',
      type: 'Paid'
    },
    {
      id: 2,
      title: 'Product Management Intern',
      company: 'Meta',
      logo: '🔵',
      location: 'Menlo Park, CA',
      duration: '10 weeks',
      stipend: '$7,800/month',
      posted: '1 day ago',
      applicants: 890,
      spots: 25,
      skills: ['Product Strategy', 'Data Analysis', 'User Research', 'SQL', 'A/B Testing'],
      description: 'Shape the future of social technology by working on products used by billions. Learn from experienced PMs and drive real product decisions.',
      requirements: ['Business/CS background', 'Analytical skills', 'Leadership experience', 'Passion for technology'],
      featured: true,
      remote: false,
      level: 'Intermediate',
      team: 'Facebook App',
      benefits: ['Housing stipend', 'Transportation', 'Networking events', 'Return offer opportunity'],
      application_deadline: 'Mar 20, 2024',
      start_date: 'Jun 15, 2024',
      status: 'open',
      type: 'Paid'
    }
  ];

  // Convert admin data to component format or use fallback
  const processedInternships = internships.length > 0 ? internships.map(internship => ({
    id: internship._id || internship.id,
    title: internship.title,
    company: internship.company,
    logo: getCompanyLogo(internship.company),
    location: internship.location || 'Remote',
    duration: internship.duration || 'Not specified',
    stipend: internship.stipend ? `$${internship.stipend.amount}/${internship.stipend.frequency}` : 'Unpaid',
    posted: internshipService.formatDate(internship.createdAt),
    applicants: internship.applications?.length || Math.floor(Math.random() * 100), // Use real count if available
    spots: internship.openings?.total || Math.floor(Math.random() * 50) + 5,
    skills: internship.skills?.required?.map(s => s.name) || [],
    description: internship.description,
    requirements: internship.requirements?.map(r => r.description) || [],
    featured: internship.featured || false,
    remote: internship.location?.type === 'remote' || false,
    level: internship.level || 'Intermediate',
    team: internship.department || 'General',
    benefits: internship.benefits?.map(b => b.description) || [],
    application_deadline: internshipService.formatDate(internship.application?.deadline),
    start_date: internshipService.formatDate(internship.application?.startDate),
    status: internship.status || 'open',
    type: internship.type || 'Paid',
    mentorPhone: internship.mentor?.phone, // Include mentor phone from admin panel
    applicationUrl: internship.application?.url,
    fileUrl: internship.fileUrl // Include file URL for additional documents
  })) : fallbackInternships;

  // Helper function to get company logos
  function getCompanyLogo(company) {
    const logoMap = {
      'Google': '🟡',
      'Meta': '🔵',
      'Apple': '🍎',
      'Microsoft': '🔷',
      'Amazon': '📦',
      'Netflix': '🔴',
      'Spotify': '🟢',
      'Tesla': '⚡',
      'Uber': '🚗',
      'Twitter': '🐦'
    };
    return logoMap[company] || '🏢';
  }

  function getTypeColor(type) {
    const colorMap = {
      'Paid': 'bg-green-100 text-green-800',
      'Unpaid': 'bg-gray-100 text-gray-800',
      'Research': 'bg-purple-100 text-purple-800',
      'Part-time': 'bg-blue-100 text-blue-800'
    };
    return colorMap[type] || 'bg-gray-100 text-gray-800';
  }

  function getLevelColor(level) {
    const colorMap = {
      'Entry Level': 'bg-green-100 text-green-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Advanced': 'bg-red-100 text-red-800'
    };
    return colorMap[level] || 'bg-gray-100 text-gray-800';
  }

  // Static data for programs and resources
  const programs = [
    {
      id: 1,
      name: 'Google STEP Internship',
      company: 'Google',
      logo: '🟡',
      type: 'First/Second Year Students',
      duration: '10-12 weeks',
      focus: 'Software Engineering',
      participants: 150,
      acceptance_rate: '3%',
      description: 'A development opportunity for students with a passion for computer science, especially those from historically underrepresented groups.',
      benefits: ['Coding training', 'Professional development', 'Mentorship', 'Networking']
    },
    {
      id: 2,
      name: 'Microsoft Explore Program',
      company: 'Microsoft',
      logo: '🔵',
      type: 'First/Second Year Students',
      duration: '12 weeks',
      focus: 'Engineering & PM',
      participants: 200,
      acceptance_rate: '5%',
      description: 'A 12-week summer internship program specifically designed for first and second-year college students.',
      benefits: ['Skills development', 'Project ownership', 'Mentorship', 'Return offer potential']
    },
    {
      id: 3,
      name: 'Facebook University',
      company: 'Meta',
      logo: '🔵',
      type: 'Underrepresented Students',
      duration: '8 weeks',
      focus: 'Engineering',
      participants: 100,
      acceptance_rate: '4%',
      description: 'A hands-on program designed to provide mobile development experience to underrepresented students.',
      benefits: ['Mobile development', 'Diversity focus', 'Industry exposure', 'Community building']
    }
  ];

  const resources = [
    {
      id: 1,
      title: 'Resume Builder for Internships',
      type: 'Tool',
      icon: '📝',
      description: 'Create a compelling resume tailored for internship applications',
      users: '50K+',
      rating: 4.8,
      access: 'Free'
    },
    {
      id: 2,
      title: 'Technical Interview Prep',
      type: 'Course',
      icon: '💻',
      description: 'Master coding interviews with practice problems and solutions',
      users: '25K+',
      rating: 4.9,
      access: 'Premium'
    },
    {
      id: 3,
      title: 'Internship Application Tracker',
      type: 'Tool',
      icon: '📊',
      description: 'Keep track of your applications, deadlines, and follow-ups',
      users: '30K+',
      rating: 4.7,
      access: 'Free'
    }
  ];

  const success_stories = [
    {
      id: 1,
      name: 'Sarah Chen',
      avatar: '👩‍💻',
      internship: 'Google Software Engineering Intern',
      outcome: 'Full-time offer at Google',
      story: 'Started as a STEP intern and worked my way up to a full SWE internship. The mentorship and project experience were incredible!',
      year: '2023'
    },
    {
      id: 2,
      name: 'Michael Rodriguez',
      avatar: '👨‍💼',
      internship: 'Meta Product Management Intern',
      outcome: 'Return offer + MBA sponsorship',
      story: 'The internship taught me how to think like a product manager. Working on real features used by millions was amazing!',
      year: '2023'
    }
  ];

  // Filter internships
  const filteredInternships = useMemo(() => {
    let filtered = [...processedInternships];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(internship =>
        internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        internship.skills.some(skill => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by type
    if (selectedFilter !== 'all') {
      if (selectedFilter === 'remote') {
        filtered = filtered.filter(i => i.remote);
      } else if (selectedFilter === 'paid') {
        filtered = filtered.filter(i => i.type === 'Paid');
      } else if (selectedFilter === 'featured') {
        filtered = filtered.filter(i => i.featured);
      }
    }

    // Sort by featured first, then by posted date
    filtered.sort((a, b) => {
      if (a.featured && !b.featured) return -1;
      if (!a.featured && b.featured) return 1;
      return new Date(b.posted) - new Date(a.posted);
    });

    return filtered;
  }, [processedInternships, searchTerm, selectedFilter]);

  const renderInternshipCard = (internship) => {
    const handleApplyClick = (e) => {
      e.stopPropagation();
      console.log('Applying to:', internship.title);
      
      if (internship.applicationUrl) {
        window.open(internship.applicationUrl, '_blank');
      } else {
        alert(`Applying to ${internship.title} at ${internship.company}...`);
      }
    };

    const handleViewDetails = () => {
      console.log('Viewing details for:', internship.title);
      
      if (internship.fileUrl) {
        window.open(studentService.getFileUrl(internship.fileUrl), '_blank');
      } else {
        alert(`Opening details for ${internship.title}...`);
      }
    };

    const handleBookmarkClick = (e) => {
      e.stopPropagation();
      console.log('Bookmarking:', internship.title);
      alert(`${internship.title} bookmarked!`);
    };

    const handleShareClick = (e) => {
      e.stopPropagation();
      console.log('Sharing:', internship.title);
      alert(`Sharing ${internship.title}...`);
    };

    return (
      <Card 
        key={internship.id} 
        className={`group bg-white border border-gray-200 hover:shadow-xl hover:border-blue-300 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
          internship.featured ? 'ring-2 ring-blue-400 ring-opacity-50' : ''
        }`}
        onClick={handleViewDetails}
      >
        <CardHeader className="pb-3">
          {/* Featured badge */}
          {internship.featured && (
            <div className="absolute -top-2 -right-2 bg-gradient-to-r from-blue-400 to-purple-500 text-white text-xs px-3 py-1 rounded-full font-semibold shadow-lg z-10">
              ⭐ Featured
            </div>
          )}

          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="text-3xl">{internship.logo}</div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900 text-sm sm:text-base line-clamp-2 mb-1">
                  {internship.title}
                </h3>
                <p className="text-sm text-gray-700 mb-2 font-medium">
                  {internship.company}
                </p>
                
                {/* Key details */}
                <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {internship.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {internship.duration}
                  </span>
                  <span className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {internship.stipend}
                  </span>
                  {internship.mentorPhone && (
                    <span className="flex items-center gap-1 text-green-600">
                      <Phone className="w-3 h-3" />
                      {internship.mentorPhone}
                    </span>
                  )}
                </div>

                {/* Badges */}
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${getTypeColor(internship.type)}`}>
                    {internship.type}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full ${getLevelColor(internship.level)}`}>
                    {internship.level}
                  </span>
                  {internship.remote && (
                    <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800">
                      Remote
                    </span>
                  )}
                  {internship.fileUrl && (
                    <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-800 flex items-center gap-1">
                      <FileText className="w-3 h-3" />
                      Details
                    </span>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-2">
              <span className="text-xs text-gray-500">{internship.posted}</span>
              <div className="flex items-center space-x-1">
                <Users className="w-4 h-4 text-gray-400" />
                <span className="text-sm text-gray-600">{internship.spots} spots</span>
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Description */}
          <p className="text-sm text-gray-700 mb-4 line-clamp-3">
            {internship.description}
          </p>

          {/* Skills Required */}
          {internship.skills.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Skills Required:</h4>
              <div className="flex flex-wrap gap-1">
                {internship.skills.slice(0, 5).map((skill, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-blue-50 text-blue-700 rounded-full">
                    {skill}
                  </span>
                ))}
                {internship.skills.length > 5 && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    +{internship.skills.length - 5} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Benefits */}
          {internship.benefits.length > 0 && (
            <div className="mb-4">
              <h4 className="text-xs font-semibold text-gray-600 mb-2">Benefits:</h4>
              <div className="flex flex-wrap gap-1">
                {internship.benefits.slice(0, 3).map((benefit, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-green-50 text-green-700 rounded-full">
                    {benefit}
                  </span>
                ))}
                {internship.benefits.length > 3 && (
                  <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                    +{internship.benefits.length - 3} more
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Application Stats */}
          <div className="grid grid-cols-3 gap-4 text-sm mb-4">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-blue-500">
                <Users className="w-3 h-3" />
                <span className="font-medium">{internship.applicants}</span>
              </div>
              <span className="text-xs text-gray-600">Applicants</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-green-500">
                <Target className="w-3 h-3" />
                <span className="font-medium">{internship.spots}</span>
              </div>
              <span className="text-xs text-gray-600">Openings</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-orange-500">
                <Calendar className="w-3 h-3" />
                <span className="font-medium">{internship.application_deadline}</span>
              </div>
              <span className="text-xs text-gray-600">Deadline</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2">
            <Button 
              className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90 flex-1 text-sm text-white`}
              onClick={handleApplyClick}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Apply Now
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
            <h1 className={`text-3xl font-bold ${theme.textPrimary} mb-2`}>Loading Internships...</h1>
            <p className={`text-lg ${theme.textSecondary}`}>Fetching the latest opportunities</p>
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
              <Briefcase className="w-10 h-10 text-white" />
            </div>
            <h1 className={`text-5xl font-bold ${theme.textPrimary} mb-2`}>
              Internship Portal
            </h1>
            <p className={`text-xl ${theme.textSecondary} max-w-2xl mx-auto mb-6`}>
              Discover amazing internship opportunities, connect with top companies, and launch your career
            </p>
            
            {/* Admin Content Status */}
            {internships.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-6 max-w-md mx-auto">
                <p className="text-sm text-green-800">
                  💼 Showing {internships.length} internships from admin panel
                </p>
              </div>
            )}
            
            {error && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-6 max-w-md mx-auto">
                <p className="text-sm text-yellow-800">
                  ⚠️ Admin content unavailable, showing demo internships
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
                    placeholder="Search internships by title, company, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 bg-white border-gray-200 text-lg rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div className="flex gap-2">
                  <select 
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="h-14 px-4 border border-gray-200 rounded-xl bg-white text-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Internships</option>
                    <option value="featured">Featured</option>
                    <option value="remote">Remote</option>
                    <option value="paid">Paid Only</option>
                  </select>
                  <Button 
                    className={`h-14 px-8 bg-gradient-to-r ${theme.gradient} hover:opacity-90 rounded-xl text-white`}
                    onClick={() => {
                      console.log('Post Internship clicked');
                      alert('Post Internship modal would open here!');
                    }}
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    Post Internship
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
              <div className={`text-2xl font-bold ${theme.accent1} mb-1`}>{stats.totalInternships}</div>
              <div className={`text-xs ${theme.textSecondary}`}>Total Internships</div>
              <div className="text-xs text-green-600 mt-1">+25 this week</div>
            </CardContent>
          </Card>
          <Card className={`${theme.cardBg} border ${theme.border} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600 mb-1">{stats.openPositions}</div>
              <div className={`text-xs ${theme.textSecondary}`}>Open Positions</div>
              <div className="text-xs text-green-600 mt-1">+18 this week</div>
            </CardContent>
          </Card>
          <Card className={`${theme.cardBg} border ${theme.border} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 mb-1">{stats.companies}</div>
              <div className={`text-xs ${theme.textSecondary}`}>Companies</div>
              <div className="text-xs text-green-600 mt-1">+7 this month</div>
            </CardContent>
          </Card>
          <Card className={`${theme.cardBg} border ${theme.border} shadow-sm hover:shadow-md transition-shadow`}>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 mb-1">${stats.avgStipend}</div>
              <div className={`text-xs ${theme.textSecondary}`}>Avg Stipend</div>
              <div className="text-xs text-green-600 mt-1">+5% this year</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-3">
            <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
              <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-gray-50 to-gray-100 p-1 rounded-xl border border-gray-200">
                <TabsTrigger value="internships" className="flex items-center gap-2 text-sm font-medium rounded-lg text-gray-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all">
                  <Briefcase className="w-4 h-4" />
                  Internships
                </TabsTrigger>
                <TabsTrigger value="programs" className="flex items-center gap-2 text-sm font-medium rounded-lg text-gray-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all">
                  <GraduationCap className="w-4 h-4" />
                  Programs
                </TabsTrigger>
                <TabsTrigger value="resources" className="flex items-center gap-2 text-sm font-medium rounded-lg text-gray-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all">
                  <BookOpen className="w-4 h-4" />
                  Resources
                </TabsTrigger>
                <TabsTrigger value="success" className="flex items-center gap-2 text-sm font-medium rounded-lg text-gray-700 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm transition-all">
                  <Trophy className="w-4 h-4" />
                  Success Stories
                </TabsTrigger>
              </TabsList>

              <TabsContent value="internships" className="space-y-6 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Available Internships</h2>
                    <p className="text-gray-600">{filteredInternships.length} opportunities found</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {filteredInternships.map(renderInternshipCard)}
                </div>

                {filteredInternships.length === 0 && (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Search className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No internships found</h3>
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

              <TabsContent value="programs" className="space-y-6 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Special Programs</h2>
                    <p className="text-gray-600">Exclusive internship programs for students</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 gap-6">
                  {programs.map((program) => (
                    <Card key={program.id} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="text-4xl">{program.logo}</div>
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">{program.name}</h3>
                            <p className="text-gray-600 mb-4">{program.description}</p>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                              <div className="text-center">
                                <div className="text-lg font-bold text-blue-600">{program.participants}</div>
                                <div className="text-xs text-gray-600">Participants</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-green-600">{program.acceptance_rate}</div>
                                <div className="text-xs text-gray-600">Acceptance Rate</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-purple-600">{program.duration}</div>
                                <div className="text-xs text-gray-600">Duration</div>
                              </div>
                              <div className="text-center">
                                <div className="text-lg font-bold text-orange-600">{program.focus}</div>
                                <div className="text-xs text-gray-600">Focus Area</div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2 mb-4">
                              {program.benefits.map((benefit, index) => (
                                <span key={index} className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                                  {benefit}
                                </span>
                              ))}
                            </div>

                            <Button className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90 text-white`}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Learn More
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="resources" className="space-y-6 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Career Resources</h2>
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
                          <span className="text-gray-500">{resource.users} users</span>
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

              <TabsContent value="success" className="space-y-6 mt-8">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">Success Stories</h2>
                    <p className="text-gray-600">Real stories from successful interns</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {success_stories.map((story) => (
                    <Card key={story.id} className="bg-white border border-gray-200 hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start space-x-4">
                          <div className="text-3xl">{story.avatar}</div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-gray-900 mb-1">{story.name}</h3>
                            <p className="text-sm text-blue-600 mb-2">{story.internship}</p>
                            <p className="text-sm font-semibold text-green-600 mb-3">{story.outcome}</p>
                            <p className="text-sm text-gray-700 italic mb-3">"{story.story}"</p>
                            <span className="text-xs text-gray-500">Class of {story.year}</span>
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
            {/* Application Stats */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Application Trends
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Applications</span>
                  <span className="text-sm font-bold text-blue-600">127</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Success Rate</span>
                  <span className="text-sm font-bold text-green-600">23%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Response Time</span>
                  <span className="text-sm font-bold text-orange-600">2-3 weeks</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Peak Season</span>
                  <span className="text-sm font-bold text-purple-600">Jan-Mar</span>
                </div>
              </CardContent>
            </Card>

            {/* Quick Apply */}
            <Card className="bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-blue-900 text-lg flex items-center gap-2">
                  <Rocket className="w-5 h-5" />
                  Quick Apply
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-blue-700">
                  Upload your resume and apply to multiple internships with one click.
                </p>
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  onClick={() => {
                    console.log('Quick Apply clicked');
                    alert('Quick Apply feature would open here!');
                  }}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Resume
                </Button>
              </CardContent>
            </Card>

            {/* Featured Companies */}
            <Card className="bg-white border border-gray-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-gray-900 text-lg flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Featured Companies
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🟡</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Google</p>
                    <p className="text-xs text-gray-500">15 open positions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🔵</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Meta</p>
                    <p className="text-xs text-gray-500">8 open positions</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">🍎</div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Apple</p>
                    <p className="text-xs text-gray-500">12 open positions</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Deadline Alerts */}
            <Card className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-200 shadow-sm">
              <CardHeader>
                <CardTitle className="text-red-900 text-lg flex items-center gap-2">
                  <AlertCircle className="w-5 h-5" />
                  Upcoming Deadlines
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-red-700">Google SWE</span>
                  <span className="text-xs text-red-600 font-medium">2 days left</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-orange-700">Meta PM</span>
                  <span className="text-xs text-orange-600 font-medium">1 week left</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-yellow-700">Apple Design</span>
                  <span className="text-xs text-yellow-600 font-medium">2 weeks left</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InternshipPage;