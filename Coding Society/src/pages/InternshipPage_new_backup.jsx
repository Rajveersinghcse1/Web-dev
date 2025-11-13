import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { useMode } from '../context/ModeContext';
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
  Mic
} from 'lucide-react';

const InternshipPage = () => {
  const { getCurrentTheme, currentMode, MODES } = useMode();
  const theme = getCurrentTheme();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('internships');
  const [selectedFilter, setSelectedFilter] = useState('all');

  const internships = [
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
      start_date: 'Jun 1, 2024'
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
      start_date: 'Jun 15, 2024'
    },
    {
      id: 3,
      title: 'UX Design Intern',
      company: 'Apple',
      logo: '🍎',
      location: 'Cupertino, CA',
      duration: '12 weeks',
      stipend: '$6,500/month',
      posted: '3 hours ago',
      applicants: 456,
      spots: 15,
      skills: ['Figma', 'Prototyping', 'User Research', 'Visual Design', 'Interaction Design'],
      description: 'Create intuitive and beautiful user experiences for Apple products. Work with design teams on next-generation interfaces and interactions.',
      requirements: ['Design portfolio', 'Proficiency in design tools', 'User-centered design thinking', 'Attention to detail'],
      featured: false,
      remote: false,
      level: 'Entry Level',
      team: 'Human Interface',
      benefits: ['Product discounts', 'Wellness programs', 'Design workshops', 'Portfolio development'],
      application_deadline: 'Mar 25, 2024',
      start_date: 'Jun 10, 2024'
    },
    {
      id: 4,
      title: 'Data Science Intern',
      company: 'Netflix',
      logo: '🔴',
      location: 'Los Gatos, CA',
      duration: '14 weeks',
      stipend: '$7,200/month',
      posted: '1 week ago',
      applicants: 623,
      spots: 20,
      skills: ['Python', 'R', 'SQL', 'Machine Learning', 'Statistics', 'Tableau'],
      description: 'Analyze data to improve content recommendations and user engagement. Work with large-scale datasets and cutting-edge ML algorithms.',
      requirements: ['Statistics/Data Science background', 'Programming skills', 'Machine learning knowledge', 'Communication skills'],
      featured: false,
      remote: true,
      level: 'Intermediate',
      team: 'Data Science & Engineering',
      benefits: ['Free Netflix', 'Flexible hours', 'Research publications', 'Conference attendance'],
      application_deadline: 'Mar 30, 2024',
      start_date: 'Jun 5, 2024'
    },
    {
      id: 5,
      title: 'Frontend Developer Intern',
      company: 'Spotify',
      logo: '🟢',
      location: 'New York, NY',
      duration: '10 weeks',
      stipend: '$6,800/month',
      posted: '5 days ago',
      applicants: 789,
      spots: 12,
      skills: ['React', 'TypeScript', 'CSS', 'JavaScript', 'Testing', 'Git'],
      description: 'Build the future of music streaming interfaces. Contribute to web and mobile applications used by millions of music lovers worldwide.',
      requirements: ['Web development experience', 'React knowledge', 'Portfolio projects', 'Passion for music'],
      featured: true,
      remote: true,
      level: 'Entry Level',
      team: 'Web Platform',
      benefits: ['Free Spotify Premium', 'Music industry events', 'Flexible work', 'Learning budget'],
      application_deadline: 'Apr 1, 2024',
      start_date: 'Jun 20, 2024'
    }
  ];

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
    },
    {
      id: 4,
      title: 'Portfolio Development Guide',
      type: 'Course',
      icon: '🎨',
      description: 'Build an impressive portfolio that stands out to recruiters',
      users: '15K+',
      rating: 4.6,
      access: 'Free'
    },
    {
      id: 5,
      title: 'Networking Strategies',
      type: 'Workshop',
      icon: '🤝',
      description: 'Learn how to effectively network and make professional connections',
      users: '12K+',
      rating: 4.8,
      access: 'Premium'
    },
    {
      id: 6,
      title: 'Salary Negotiation for Interns',
      type: 'Guide',
      icon: '💰',
      description: 'Tips and strategies for negotiating internship compensation',
      users: '8K+',
      rating: 4.5,
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
      tips: ['Focus on data structures', 'Practice system design', 'Build side projects', 'Network with other interns'],
      timeline: 'Sophomore → STEP → SWE Intern → Full-time SWE'
    },
    {
      id: 2,
      name: 'Marcus Johnson',
      avatar: '👨‍💼',
      internship: 'Meta Product Management Intern',
      outcome: 'Return offer + Graduate APM',
      story: 'Learned to think like a product manager through real projects. My mentor helped me understand user needs and business metrics.',
      tips: ['Learn SQL and analytics', 'Practice case studies', 'Understand user psychology', 'Build product sense'],
      timeline: 'Junior → PM Intern → APM Program'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      avatar: '👩‍🎨',
      internship: 'Apple UX Design Intern',
      outcome: 'Full-time UX Designer',
      story: 'Got to work on actual Apple products and learned about design at scale. The attention to detail and user focus was amazing.',
      tips: ['Build a strong portfolio', 'Practice design thinking', 'Learn prototyping tools', 'Study Apple\'s design principles'],
      timeline: 'Senior → Design Intern → Full-time Designer'
    }
  ];

  const InternshipCard = ({ internship }) => (
    <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder} hover:shadow-lg transition-all duration-300 ${internship.featured ? 'ring-2 ring-yellow-400' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
              {internship.logo}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`font-bold text-lg ${theme.textPrimary} ${theme.darkTextPrimary}`}>
                  {internship.title}
                </h3>
                {internship.featured && (
                  <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    <Star className="w-3 h-3" />
                    <span>Featured</span>
                  </div>
                )}
              </div>
              <p className={`font-medium text-blue-600 dark:text-blue-400`}>{internship.company}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{internship.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{internship.duration}</span>
                </div>
                {internship.remote && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Globe className="w-4 h-4" />
                    <span>Remote</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="hover:text-red-500">
              <Heart className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-blue-500">
              <Bookmark className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Stipend and Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-green-600 font-semibold text-lg">
              <DollarSign className="w-5 h-5" />
              <span>{internship.stipend}</span>
            </div>
            <div className="text-sm text-gray-500 text-right">
              <div>{internship.applicants} applicants</div>
              <div className="text-green-600 font-medium">{internship.spots} spots available</div>
            </div>
          </div>

          {/* Description */}
          <p className={`${theme.textPrimary} ${theme.darkTextPrimary} text-sm leading-relaxed`}>
            {internship.description}
          </p>

          {/* Skills */}
          <div>
            <h4 className={`font-medium ${theme.textPrimary} ${theme.darkTextPrimary} mb-2 text-sm`}>Required Skills:</h4>
            <div className="flex flex-wrap gap-2">
              {internship.skills.map((skill, index) => (
                <span
                  key={index}
                  className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${theme.gradient} text-white font-medium`}
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Requirements */}
          <div>
            <h4 className={`font-medium ${theme.textPrimary} ${theme.darkTextPrimary} mb-2 text-sm`}>Requirements:</h4>
            <ul className="space-y-1">
              {internship.requirements.map((req, index) => (
                <li key={index} className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                  <span>{req}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Internship Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Level: </span>
              <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium`}>{internship.level}</span>
            </div>
            <div>
              <span className="text-gray-500">Team: </span>
              <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium`}>{internship.team}</span>
            </div>
            <div>
              <span className="text-gray-500">Start Date: </span>
              <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium`}>{internship.start_date}</span>
            </div>
            <div>
              <span className="text-gray-500">Deadline: </span>
              <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium text-red-600`}>{internship.application_deadline}</span>
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h4 className={`font-medium ${theme.textPrimary} ${theme.darkTextPrimary} mb-2 text-sm`}>Benefits:</h4>
            <div className="flex flex-wrap gap-2">
              {internship.benefits.map((benefit, index) => (
                <span key={index} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                  {benefit}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90 flex-1`}>
              Apply Now
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Details
            </Button>
            <Button variant="outline" size="sm">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className={`min-h-screen ${theme.background} ${theme.darkBackground} pt-16 py-8`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className={`text-4xl font-bold ${theme.textPrimary} ${theme.darkTextPrimary} mb-4`}>
            Internship Hub
          </h1>
          <p className={`text-xl ${theme.textSecondary} ${theme.darkTextSecondary} mb-6`}>
            Launch your career with top-tier internship opportunities
          </p>
          
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search internships by company, role, or skill..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <div className="flex space-x-2">
              <select 
                value={selectedFilter} 
                onChange={(e) => setSelectedFilter(e.target.value)}
                className={`px-4 py-3 border ${theme.border} ${theme.darkBorder} rounded-lg ${theme.cardBg} ${theme.darkCardBg} ${theme.textPrimary} ${theme.darkTextPrimary}`}
              >
                <option value="all">All Types</option>
                <option value="engineering">Engineering</option>
                <option value="product">Product</option>
                <option value="design">Design</option>
                <option value="data">Data Science</option>
              </select>
              <Button variant="outline" className="h-12">
                <Filter className="w-4 h-4 mr-2" />
                More Filters
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder}`}>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">1,250+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Internships</div>
              <div className="text-xs text-green-600 mt-1">+15% this week</div>
            </CardContent>
          </Card>
          <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder}`}>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">89%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Placement Rate</div>
              <div className="text-xs text-green-600 mt-1">Above average</div>
            </CardContent>
          </Card>
          <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder}`}>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">$7.2K</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Monthly Stipend</div>
              <div className="text-xs text-purple-600 mt-1">Top companies</div>
            </CardContent>
          </Card>
          <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder}`}>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">76%</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Return Offer Rate</div>
              <div className="text-xs text-orange-600 mt-1">Full-time conversion</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="internships" className="flex items-center space-x-2">
              <GraduationCap className="w-4 h-4" />
              <span>Internships</span>
            </TabsTrigger>
            <TabsTrigger value="programs" className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Special Programs</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center space-x-2">
              <BookOpen className="w-4 h-4" />
              <span>Resources</span>
            </TabsTrigger>
            <TabsTrigger value="success" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Success Stories</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="internships" className="space-y-6 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {internships.map((internship) => (
                <InternshipCard key={internship.id} internship={internship} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="programs" className="space-y-6 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {programs.map((program) => (
                <Card key={program.id} className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder}`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 flex items-center justify-center text-2xl">
                        {program.logo}
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg ${theme.textPrimary} ${theme.darkTextPrimary}`}>
                          {program.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{program.company}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Target:</span>
                        <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium`}>{program.type}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Duration:</span>
                        <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium`}>{program.duration}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Focus:</span>
                        <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium`}>{program.focus}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Participants:</span>
                        <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium`}>{program.participants}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Acceptance Rate:</span>
                        <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium text-red-600`}>{program.acceptance_rate}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{program.description}</p>

                    <div className="mb-4">
                      <h4 className={`font-medium ${theme.textPrimary} ${theme.darkTextPrimary} mb-2 text-sm`}>Program Benefits:</h4>
                      <div className="flex flex-wrap gap-2">
                        {program.benefits.map((benefit, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button className={`w-full bg-gradient-to-r ${theme.gradient} hover:opacity-90`}>
                      Learn More
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {resources.map((resource) => (
                <Card key={resource.id} className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder} hover:shadow-lg transition-shadow`}>
                  <CardContent className="p-6">
                    <div className="flex items-start space-x-4 mb-4">
                      <div className="text-3xl">{resource.icon}</div>
                      <div className="flex-1">
                        <h3 className={`font-bold ${theme.textPrimary} ${theme.darkTextPrimary} mb-1`}>
                          {resource.title}
                        </h3>
                        <div className="flex items-center space-x-2 mb-2">
                          <span className={`text-xs px-2 py-1 rounded ${resource.type === 'Course' ? 'bg-blue-100 text-blue-800' : resource.type === 'Tool' ? 'bg-green-100 text-green-800' : 'bg-purple-100 text-purple-800'}`}>
                            {resource.type}
                          </span>
                          <span className={`text-xs font-medium ${resource.access === 'Free' ? 'text-green-600' : 'text-purple-600'}`}>
                            {resource.access}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{resource.description}</p>
                    
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                        <span className="text-sm font-medium">{resource.rating}</span>
                      </div>
                      <div className="text-sm text-gray-500">{resource.users} users</div>
                    </div>

                    <Button 
                      className={`w-full ${resource.access === 'Free' ? `bg-gradient-to-r ${theme.gradient}` : 'bg-gradient-to-r from-purple-500 to-pink-600'} hover:opacity-90`}
                    >
                      {resource.access === 'Free' ? 'Access Free' : 'Get Premium'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="success" className="space-y-6 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {success_stories.map((story) => (
                <Card key={story.id} className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder}`}>
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-r from-green-500 to-blue-600 flex items-center justify-center text-3xl mx-auto mb-3">
                        {story.avatar}
                      </div>
                      <h3 className={`font-bold ${theme.textPrimary} ${theme.darkTextPrimary} mb-1`}>
                        {story.name}
                      </h3>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mb-1">{story.internship}</p>
                      <div className="flex items-center justify-center space-x-1 text-green-600 font-medium text-sm">
                        <CheckCircle className="w-4 h-4" />
                        <span>{story.outcome}</span>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 italic">
                      "{story.story}"
                    </p>

                    <div className="mb-4">
                      <h4 className={`font-medium ${theme.textPrimary} ${theme.darkTextPrimary} mb-2 text-sm`}>Timeline:</h4>
                      <p className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 p-2 rounded">
                        {story.timeline}
                      </p>
                    </div>

                    <div className="mb-4">
                      <h4 className={`font-medium ${theme.textPrimary} ${theme.darkTextPrimary} mb-2 text-sm`}>Top Tips:</h4>
                      <ul className="space-y-1">
                        {story.tips.map((tip, index) => (
                          <li key={index} className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                            <div className="w-1 h-1 bg-blue-500 rounded-full"></div>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <Button variant="outline" className="w-full">
                      Read Full Story
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default InternshipPage;
