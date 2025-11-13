import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { useMode } from '../context/ModeContext';
import {
  Briefcase,
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
  ThumbsUp
} from 'lucide-react';

const CareerPage = () => {
  const { getCurrentTheme, currentMode, MODES } = useMode();
  const theme = getCurrentTheme();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('jobs');
  const [savedJobs, setSavedJobs] = useState([]);

  const jobs = [
    {
      id: 1,
      title: 'Senior Full Stack Engineer',
      company: 'Google',
      logo: '🟡',
      location: 'Mountain View, CA',
      type: 'Full-time',
      salary: '$180,000 - $250,000',
      posted: '2 days ago',
      applicants: 156,
      skills: ['React', 'Node.js', 'TypeScript', 'GraphQL', 'AWS'],
      description: 'Join our world-class engineering team to build products used by billions of users. You\'ll work on cutting-edge technologies and solve complex scalability challenges.',
      featured: true,
      remote: true,
      experience: '5+ years',
      company_size: '10,000+',
      benefits: ['Health Insurance', 'Stock Options', 'Unlimited PTO', 'Learning Budget']
    },
    {
      id: 2,
      title: 'Product Manager - AI/ML',
      company: 'Microsoft',
      logo: '🔵',
      location: 'Seattle, WA',
      type: 'Full-time',
      salary: '$160,000 - $220,000',
      posted: '1 day ago',
      applicants: 89,
      skills: ['Product Strategy', 'AI/ML', 'Data Analysis', 'User Research'],
      description: 'Lead the product strategy for our AI-powered developer tools. Drive innovation and collaborate with engineering teams to deliver exceptional user experiences.',
      featured: false,
      remote: false,
      experience: '3+ years',
      company_size: '1,000+',
      benefits: ['Health Insurance', 'Stock Options', 'Flexible Hours', 'Remote Work']
    },
    {
      id: 3,
      title: 'Frontend Developer Intern',
      company: 'Spotify',
      logo: '🟢',
      location: 'New York, NY',
      type: 'Internship',
      salary: '$8,000/month',
      posted: '3 hours ago',
      applicants: 234,
      skills: ['React', 'JavaScript', 'CSS', 'HTML', 'Git'],
      description: 'Join our frontend team to work on the next generation of music streaming experiences. Perfect opportunity for students to gain real-world experience.',
      featured: true,
      remote: true,
      experience: 'Entry Level',
      company_size: '5,000+',
      benefits: ['Mentorship', 'Learning Budget', 'Free Spotify Premium', 'Networking Events']
    },
    {
      id: 4,
      title: 'Data Scientist',
      company: 'Netflix',
      logo: '🔴',
      location: 'Los Gatos, CA',
      type: 'Full-time',
      salary: '$140,000 - $200,000',
      posted: '1 week ago',
      applicants: 67,
      skills: ['Python', 'Machine Learning', 'SQL', 'TensorFlow', 'Statistics'],
      description: 'Help personalize entertainment for 200+ million members worldwide. Use machine learning to improve content recommendations and user engagement.',
      featured: false,
      remote: true,
      experience: '2+ years',
      company_size: '10,000+',
      benefits: ['Health Insurance', 'Stock Options', 'Unlimited PTO', 'Free Netflix']
    }
  ];

  const companies = [
    {
      id: 1,
      name: 'Google',
      logo: '🟡',
      industry: 'Technology',
      size: '100,000+',
      location: 'Mountain View, CA',
      rating: 4.5,
      openJobs: 245,
      description: 'Organize the world\'s information and make it universally accessible and useful.',
      benefits: ['Competitive salary', 'Stock options', 'Free food', 'Learning budget'],
      culture: ['Innovation', 'Collaboration', 'Impact', 'Inclusion']
    },
    {
      id: 2,
      name: 'Meta',
      logo: '🔵',
      industry: 'Social Media',
      size: '50,000+',
      location: 'Menlo Park, CA',
      rating: 4.2,
      openJobs: 189,
      description: 'Connect people and build communities to bring the world closer together.',
      benefits: ['Health insurance', 'Parental leave', 'Wellness programs', 'Career development'],
      culture: ['Move fast', 'Be bold', 'Focus on impact', 'Be open']
    },
    {
      id: 3,
      name: 'Apple',
      logo: '🍎',
      industry: 'Consumer Electronics',
      size: '150,000+',
      location: 'Cupertino, CA',
      rating: 4.3,
      openJobs: 156,
      description: 'Design and create products that enrich people\'s lives.',
      benefits: ['Stock purchase plan', 'Product discounts', 'Health benefits', 'Education support'],
      culture: ['Excellence', 'Innovation', 'Privacy', 'Accessibility']
    }
  ];

  const mentors = [
    {
      id: 1,
      name: 'Sarah Chen',
      title: 'Senior Engineering Manager at Google',
      avatar: '👩‍💻',
      experience: '12 years',
      specialties: ['Technical Leadership', 'Career Growth', 'System Design'],
      rating: 4.9,
      sessions: 156,
      price: '$150/hour',
      available: true,
      bio: 'Helping engineers level up their careers and technical skills. Former startup founder with expertise in scaling teams and products.'
    },
    {
      id: 2,
      name: 'Marcus Rodriguez',
      title: 'Product Director at Microsoft',
      avatar: '👨‍💼',
      experience: '10 years',
      specialties: ['Product Strategy', 'Leadership', 'AI/ML Products'],
      rating: 4.8,
      sessions: 203,
      price: '$120/hour',
      available: false,
      bio: 'Product leader with experience launching products used by millions. Passionate about helping PMs navigate complex product decisions.'
    },
    {
      id: 3,
      name: 'Emily Johnson',
      title: 'Design Lead at Airbnb',
      avatar: '👩‍🎨',
      experience: '8 years',
      specialties: ['UX Design', 'Design Systems', 'User Research'],
      rating: 4.9,
      sessions: 89,
      price: '$100/hour',
      available: true,
      bio: 'Award-winning designer helping others create user-centered products. Expert in design thinking and prototyping methodologies.'
    }
  ];

  const events = [
    {
      id: 1,
      title: 'Tech Career Fair 2024',
      date: 'Mar 15, 2024',
      time: '10:00 AM - 4:00 PM',
      location: 'San Francisco Convention Center',
      type: 'In-person',
      companies: ['Google', 'Meta', 'Apple', 'Netflix', 'Spotify'],
      attendees: 2500,
      price: 'Free',
      description: 'Connect with top tech companies and explore career opportunities. Network with recruiters and hiring managers.',
      image: 'https://via.placeholder.com/300x200?text=Tech+Career+Fair'
    },
    {
      id: 2,
      title: 'AI/ML Career Workshop',
      date: 'Mar 20, 2024',
      time: '2:00 PM - 5:00 PM',
      location: 'Virtual Event',
      type: 'Online',
      companies: ['OpenAI', 'DeepMind', 'Anthropic'],
      attendees: 500,
      price: '$25',
      description: 'Learn about career paths in AI/ML from industry experts. Interactive workshops and Q&A sessions.',
      image: 'https://via.placeholder.com/300x200?text=AI+Workshop'
    },
    {
      id: 3,
      title: 'Startup Networking Night',
      date: 'Mar 25, 2024',
      time: '6:00 PM - 9:00 PM',
      location: 'Startup Hub, Austin',
      type: 'In-person',
      companies: ['Y Combinator', 'Techstars', 'Various Startups'],
      attendees: 150,
      price: '$15',
      description: 'Meet startup founders and early-stage companies. Perfect for those interested in startup culture.',
      image: 'https://via.placeholder.com/300x200?text=Startup+Night'
    }
  ];

  const JobCard = ({ job }) => (
    <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder} hover:shadow-lg transition-all duration-300 ${job.featured ? 'ring-2 ring-yellow-400' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
              {job.logo}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`font-bold text-lg ${theme.textPrimary} ${theme.darkTextPrimary}`}>
                  {job.title}
                </h3>
                {job.featured && (
                  <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    <Star className="w-3 h-3" />
                    <span>Featured</span>
                  </div>
                )}
              </div>
              <p className={`font-medium text-blue-600 dark:text-blue-400`}>{job.company}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{job.type}</span>
                </div>
                {job.remote && (
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
          {/* Salary and Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-green-600 font-semibold">
              <DollarSign className="w-4 h-4" />
              <span>{job.salary}</span>
            </div>
            <div className="text-sm text-gray-500">
              {job.applicants} applicants • {job.posted}
            </div>
          </div>

          {/* Description */}
          <p className={`${theme.textPrimary} ${theme.darkTextPrimary} text-sm leading-relaxed`}>
            {job.description}
          </p>

          {/* Skills */}
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <span
                key={index}
                className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${theme.gradient} text-white font-medium`}
              >
                {skill}
              </span>
            ))}
          </div>

          {/* Job Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Experience: </span>
              <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium`}>{job.experience}</span>
            </div>
            <div>
              <span className="text-gray-500">Company Size: </span>
              <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium`}>{job.company_size}</span>
            </div>
          </div>

          {/* Benefits */}
          <div>
            <h4 className={`font-medium ${theme.textPrimary} ${theme.darkTextPrimary} mb-2 text-sm`}>Benefits:</h4>
            <div className="flex flex-wrap gap-2">
              {job.benefits.map((benefit, index) => (
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
              View Details
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const CompanyCard = ({ company }) => (
    <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder} hover:shadow-lg transition-all duration-300`}>
      <CardContent className="p-6">
        <div className="flex items-start space-x-4">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-gray-400 to-gray-600 flex items-center justify-center text-2xl">
            {company.logo}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-bold text-lg ${theme.textPrimary} ${theme.darkTextPrimary}`}>
                {company.name}
              </h3>
              <div className="flex items-center space-x-1">
                <Star className="w-4 h-4 text-yellow-500 fill-current" />
                <span className="text-sm font-medium">{company.rating}</span>
              </div>
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{company.description}</p>
            
            <div className="grid grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <span className="text-gray-500">Industry: </span>
                <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium`}>{company.industry}</span>
              </div>
              <div>
                <span className="text-gray-500">Size: </span>
                <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium`}>{company.size}</span>
              </div>
              <div>
                <span className="text-gray-500">Location: </span>
                <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium`}>{company.location}</span>
              </div>
              <div>
                <span className="text-gray-500">Open Jobs: </span>
                <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium text-green-600`}>{company.openJobs}</span>
              </div>
            </div>

            <div className="mb-4">
              <h4 className={`font-medium ${theme.textPrimary} ${theme.darkTextPrimary} mb-2 text-sm`}>Culture:</h4>
              <div className="flex flex-wrap gap-2">
                {company.culture.map((value, index) => (
                  <span key={index} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                    {value}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <Button className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90`} size="sm">
                View Jobs
              </Button>
              <Button variant="outline" size="sm">
                Follow
              </Button>
            </div>
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
            Career Center
          </h1>
          <p className={`text-xl ${theme.textSecondary} ${theme.darkTextSecondary} mb-6`}>
            Discover opportunities, connect with mentors, and advance your career
          </p>
          
          {/* Search Bar */}
          <div className="flex space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search jobs, companies, or skills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
            <Button variant="outline" className="h-12">
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="jobs" className="flex items-center space-x-2">
              <Briefcase className="w-4 h-4" />
              <span>Jobs</span>
            </TabsTrigger>
            <TabsTrigger value="companies" className="flex items-center space-x-2">
              <Building className="w-4 h-4" />
              <span>Companies</span>
            </TabsTrigger>
            <TabsTrigger value="mentors" className="flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Mentors</span>
            </TabsTrigger>
            <TabsTrigger value="events" className="flex items-center space-x-2">
              <Calendar className="w-4 h-4" />
              <span>Events</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="jobs" className="space-y-6 mt-8">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder}`}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">2,459</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Active Jobs</div>
                </CardContent>
              </Card>
              <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder}`}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">156</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">New This Week</div>
                </CardContent>
              </Card>
              <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder}`}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">89%</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Response Rate</div>
                </CardContent>
              </Card>
              <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder}`}>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">$145K</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">Avg. Salary</div>
                </CardContent>
              </Card>
            </div>

            {/* Job Listings */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="companies" className="space-y-6 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {companies.map((company) => (
                <CompanyCard key={company.id} company={company} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="mentors" className="space-y-6 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {mentors.map((mentor) => (
                <Card key={mentor.id} className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder}`}>
                  <CardContent className="p-6 text-center">
                    <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-3xl mx-auto mb-4">
                      {mentor.avatar}
                    </div>
                    <h3 className={`font-bold ${theme.textPrimary} ${theme.darkTextPrimary} mb-1`}>
                      {mentor.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{mentor.title}</p>
                    <div className="flex items-center justify-center space-x-1 mb-3">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{mentor.rating}</span>
                      <span className="text-sm text-gray-500">({mentor.sessions} sessions)</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{mentor.bio}</p>
                    <div className="space-y-2 mb-4">
                      {mentor.specialties.map((specialty, index) => (
                        <span key={index} className="inline-block text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded mr-1">
                          {specialty}
                        </span>
                      ))}
                    </div>
                    <div className="text-lg font-bold text-green-600 mb-4">{mentor.price}</div>
                    <Button 
                      className={`w-full ${mentor.available ? `bg-gradient-to-r ${theme.gradient}` : 'bg-gray-400'}`}
                      disabled={!mentor.available}
                    >
                      {mentor.available ? 'Book Session' : 'Unavailable'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="events" className="space-y-6 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Card key={event.id} className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder}`}>
                  <div className="aspect-video bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-lg flex items-center justify-center text-white text-xl font-bold">
                    📅 {event.title}
                  </div>
                  <CardContent className="p-6">
                    <h3 className={`font-bold ${theme.textPrimary} ${theme.darkTextPrimary} mb-2`}>
                      {event.title}
                    </h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4" />
                        <span>{event.date} • {event.time}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4" />
                        <span>{event.location}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4" />
                        <span>{event.attendees} attendees</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{event.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-green-600">{event.price}</span>
                      <Button className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90`}>
                        Register
                      </Button>
                    </div>
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

export default CareerPage;
