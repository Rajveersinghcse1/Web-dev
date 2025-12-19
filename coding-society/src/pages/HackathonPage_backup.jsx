import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { useMode } from '../context/ModeContext';
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
  Play
} from 'lucide-react';

const HackathonPage = () => {
  const { getCurrentTheme, currentMode, MODES } = useMode();
  const theme = getCurrentTheme();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('hackathons');

  const hackathons = [
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
    },
    {
      id: 3,
      title: 'FinTech Revolution 2024',
      organizer: 'JPMorgan Chase & Stripe',
      logo: '💰',
      location: 'New York, NY',
      type: 'In-person',
      duration: '48 hours',
      prize_pool: '$80,000',
      start_date: 'Apr 5, 2024',
      end_date: 'Apr 7, 2024',
      registration_deadline: 'Apr 1, 2024',
      participants: 1200,
      max_participants: 1500,
      teams_registered: 300,
      difficulty: 'Advanced',
      themes: ['Blockchain', 'DeFi', 'Payment Systems', 'Financial Inclusion'],
      description: 'Revolutionize the financial industry with cutting-edge technology solutions.',
      requirements: ['Financial domain knowledge', 'Blockchain experience preferred', 'Team of 2-4'],
      prizes: [
        { place: '1st', amount: '$45,000', description: 'FinTech Innovator' },
        { place: '2nd', amount: '$20,000', description: 'Banking Disruptor' },
        { place: '3rd', amount: '$10,000', description: 'Payment Pioneer' },
        { place: 'Special', amount: '$5,000', description: 'Best Security Solution' }
      ],
      sponsors: ['JPMorgan', 'Stripe', 'Coinbase', 'Visa'],
      featured: false,
      status: 'registration_open'
    },
    {
      id: 4,
      title: 'Healthcare Innovation Challenge',
      organizer: 'Mayo Clinic & IBM',
      logo: '🏥',
      location: 'Boston, MA',
      type: 'Virtual',
      duration: '60 hours',
      prize_pool: '$60,000',
      start_date: 'Apr 12, 2024',
      end_date: 'Apr 15, 2024',
      registration_deadline: 'Apr 8, 2024',
      participants: 950,
      max_participants: 1200,
      teams_registered: 238,
      difficulty: 'Intermediate',
      themes: ['Digital Health', 'Medical AI', 'Telemedicine', 'Health Analytics'],
      description: 'Create innovative healthcare solutions that improve patient outcomes and accessibility.',
      requirements: ['Healthcare interest', 'Technical background', 'Team of 2-5 members'],
      prizes: [
        { place: '1st', amount: '$30,000', description: 'Health Innovation Award' },
        { place: '2nd', amount: '$15,000', description: 'Medical Tech Excellence' },
        { place: '3rd', amount: '$8,000', description: 'Patient Care Innovation' },
        { place: 'Special', amount: '$7,000', description: 'Best Accessibility Solution' }
      ],
      sponsors: ['Mayo Clinic', 'IBM Watson', 'Philips Healthcare', 'Johnson & Johnson'],
      featured: false,
      status: 'registration_open'
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
    },
    {
      id: 3,
      hackathon: 'FinTech Revolution 2023',
      team_name: 'CryptoBuilders',
      project: 'MicroLend - P2P Lending Platform',
      members: ['Jennifer Lopez', 'Michael Chang', 'Robert Smith', 'Anna Lee'],
      prize: '$45,000',
      description: 'Blockchain-based peer-to-peer lending platform with smart contracts and risk assessment.',
      tech_stack: ['Solidity', 'Web3.js', 'React', 'Node.js', 'IPFS'],
      github: 'https://github.com/cryptobuilders/microlend',
      demo: 'https://microlend.finance'
    }
  ];

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
    },
    {
      id: 4,
      title: 'Code Starter Kits',
      type: 'Code',
      icon: '💻',
      description: 'Boilerplate code for common hackathon tech stacks',
      downloads: '40K+',
      rating: 4.6,
      access: 'Free'
    }
  ];

  const HackathonCard = ({ hackathon }) => (
    <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder} hover:shadow-lg transition-all duration-300 ${hackathon.featured ? 'ring-2 ring-yellow-400' : ''}`}>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 flex items-center justify-center text-2xl">
              {hackathon.logo}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className={`font-bold text-lg ${theme.textPrimary} ${theme.darkTextPrimary}`}>
                  {hackathon.title}
                </h3>
                {hackathon.featured && (
                  <div className="flex items-center space-x-1 bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-medium">
                    <Star className="w-3 h-3" />
                    <span>Featured</span>
                  </div>
                )}
              </div>
              <p className={`font-medium text-blue-600 dark:text-blue-400`}>{hackathon.organizer}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{hackathon.location}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="w-4 h-4" />
                  <span>{hackathon.duration}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <span>{hackathon.type}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="hover:text-red-500">
              <Heart className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="sm" className="hover:text-blue-500">
              <Share className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {/* Prize and Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-green-600 font-semibold text-lg">
              <Trophy className="w-5 h-5" />
              <span>{hackathon.prize_pool}</span>
            </div>
            <div className="text-sm text-gray-500 text-right">
              <div>{hackathon.participants} / {hackathon.max_participants} participants</div>
              <div className="text-blue-600 font-medium">{hackathon.teams_registered} teams registered</div>
            </div>
          </div>

          {/* Description */}
          <p className={`${theme.textPrimary} ${theme.darkTextPrimary} text-sm leading-relaxed`}>
            {hackathon.description}
          </p>

          {/* Themes */}
          <div>
            <h4 className={`font-medium ${theme.textPrimary} ${theme.darkTextPrimary} mb-2 text-sm`}>Themes:</h4>
            <div className="flex flex-wrap gap-2">
              {hackathon.themes.map((theme_item, index) => (
                <span
                  key={index}
                  className={`text-xs px-2 py-1 rounded-full bg-gradient-to-r ${theme.gradient} text-white font-medium`}
                >
                  {theme_item}
                </span>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Start Date: </span>
              <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium`}>{hackathon.start_date}</span>
            </div>
            <div>
              <span className="text-gray-500">End Date: </span>
              <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium`}>{hackathon.end_date}</span>
            </div>
            <div>
              <span className="text-gray-500">Registration: </span>
              <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium text-red-600`}>{hackathon.registration_deadline}</span>
            </div>
            <div>
              <span className="text-gray-500">Difficulty: </span>
              <span className={`${theme.textPrimary} ${theme.darkTextPrimary} font-medium`}>{hackathon.difficulty}</span>
            </div>
          </div>

          {/* Prize Breakdown */}
          <div>
            <h4 className={`font-medium ${theme.textPrimary} ${theme.darkTextPrimary} mb-2 text-sm`}>Prizes:</h4>
            <div className="grid grid-cols-2 gap-2">
              {hackathon.prizes.map((prize, index) => (
                <div key={index} className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded">
                  <span className="font-medium text-green-600">{prize.place}: {prize.amount}</span>
                  <div className="text-gray-600 dark:text-gray-400">{prize.description}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Sponsors */}
          <div>
            <h4 className={`font-medium ${theme.textPrimary} ${theme.darkTextPrimary} mb-2 text-sm`}>Sponsors:</h4>
            <div className="flex flex-wrap gap-2">
              {hackathon.sponsors.map((sponsor, index) => (
                <span key={index} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                  {sponsor}
                </span>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button className={`bg-gradient-to-r ${theme.gradient} hover:opacity-90 flex-1`}>
              Register Now
            </Button>
            <Button variant="outline" size="sm">
              <ExternalLink className="w-4 h-4 mr-2" />
              Details
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
            Hackathon Hub
          </h1>
          <p className={`text-xl ${theme.textSecondary} ${theme.darkTextSecondary} mb-6`}>
            Compete, innovate, and build the future with the world's best developers
          </p>
          
          {/* Search and Filters */}
          <div className="flex flex-col lg:flex-row space-y-4 lg:space-y-0 lg:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                type="text"
                placeholder="Search hackathons by theme, location, or organizer..."
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

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder}`}>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">250+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Active Hackathons</div>
              <div className="text-xs text-green-600 mt-1">+25% this month</div>
            </CardContent>
          </Card>
          <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder}`}>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">$2.5M</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Total Prize Pool</div>
              <div className="text-xs text-green-600 mt-1">Across all events</div>
            </CardContent>
          </Card>
          <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder}`}>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">15K+</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Participants</div>
              <div className="text-xs text-purple-600 mt-1">Global community</div>
            </CardContent>
          </Card>
          <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder}`}>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">3.8K</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">Projects Built</div>
              <div className="text-xs text-orange-600 mt-1">This year</div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab} className="mb-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hackathons" className="flex items-center space-x-2">
              <Code className="w-4 h-4" />
              <span>Hackathons</span>
            </TabsTrigger>
            <TabsTrigger value="winners" className="flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Past Winners</span>
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center space-x-2">
              <FileText className="w-4 h-4" />
              <span>Resources</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="flex items-center space-x-2">
              <Award className="w-4 h-4" />
              <span>Leaderboard</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="hackathons" className="space-y-6 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {hackathons.map((hackathon) => (
                <HackathonCard key={hackathon.id} hackathon={hackathon} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="winners" className="space-y-6 mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {past_winners.map((winner) => (
                <Card key={winner.id} className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder}`}>
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center text-2xl mx-auto mb-3">
                        🏆
                      </div>
                      <h3 className={`font-bold ${theme.textPrimary} ${theme.darkTextPrimary} mb-1`}>
                        {winner.project}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">by {winner.team_name}</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400">{winner.hackathon}</p>
                      <div className="text-lg font-bold text-green-600 mt-2">{winner.prize}</div>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                      {winner.description}
                    </p>

                    <div className="mb-4">
                      <h4 className={`font-medium ${theme.textPrimary} ${theme.darkTextPrimary} mb-2 text-sm`}>Team:</h4>
                      <div className="flex flex-wrap gap-1">
                        {winner.members.map((member, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded">
                            {member}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className={`font-medium ${theme.textPrimary} ${theme.darkTextPrimary} mb-2 text-sm`}>Tech Stack:</h4>
                      <div className="flex flex-wrap gap-1">
                        {winner.tech_stack.map((tech, index) => (
                          <span key={index} className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Demo
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <GitBranch className="w-4 h-4 mr-1" />
                        Code
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="resources" className="space-y-6 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {resources.map((resource) => (
                <Card key={resource.id} className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder} hover:shadow-lg transition-shadow`}>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-3">{resource.icon}</div>
                    <h3 className={`font-bold ${theme.textPrimary} ${theme.darkTextPrimary} mb-2`}>
                      {resource.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{resource.description}</p>
                    
                    <div className="flex items-center justify-center space-x-2 mb-4">
                      <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      <span className="text-sm font-medium">{resource.rating}</span>
                      <span className="text-sm text-gray-500">
                        ({resource.downloads || resource.users})
                      </span>
                    </div>

                    <Button 
                      className={`w-full ${resource.access === 'Free' ? `bg-gradient-to-r ${theme.gradient}` : 'bg-gradient-to-r from-purple-500 to-pink-600'} hover:opacity-90`}
                      size="sm"
                    >
                      {resource.access === 'Free' ? 'Get Free' : 'Get Premium'}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="leaderboard" className="space-y-6 mt-8">
            <Card className={`${theme.cardBg} ${theme.darkCardBg} border ${theme.border} ${theme.darkBorder}`}>
              <CardHeader>
                <CardTitle className={`${theme.textPrimary} ${theme.darkTextPrimary}`}>
                  Top Hackathon Champions
                </CardTitle>
                <CardDescription>
                  Leading developers by hackathon wins and total prize money
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {past_winners.slice(0, 10).map((winner, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="text-lg font-bold text-gray-400">#{index + 1}</div>
                        <div>
                          <div className={`font-medium ${theme.textPrimary} ${theme.darkTextPrimary}`}>
                            {winner.team_name}
                          </div>
                          <div className="text-sm text-gray-500">{winner.project}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-green-600">{winner.prize}</div>
                        <div className="text-xs text-gray-500">Latest win</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default HackathonPage;
