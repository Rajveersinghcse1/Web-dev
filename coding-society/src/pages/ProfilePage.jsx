import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  Mail, 
  Calendar, 
  MapPin, 
  Link, 
  Github, 
  Twitter, 
  Edit3,
  Settings,
  BookOpen,
  Users,
  Heart,
  MessageCircle,
  Code,
  Trophy,
  Star,
  Camera,
  Save,
  X,
  UserPlus,
  UserCheck,
  MessageSquare,
  Briefcase,
  GraduationCap,
  Eye,
  MoreHorizontal,
  Phone,
  Globe,
  Shield,
  Award,
  Clock,
  Plus,
  Share2,
  Download,
  Activity,
  Terminal,
  GitCommit,
  Cpu,
  Flame,
  Zap,
  Linkedin,
  FileText,
  CheckCircle,
  ExternalLink
} from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: 'Passionate full-stack developer who loves to learn and share knowledge with the community.',
    location: 'San Francisco, CA',
    website: 'https://johndoe.dev',
    github: 'https://github.com/johndoe',
    twitter: 'https://twitter.com/johndoe',
    linkedin: 'https://linkedin.com/in/johndoe',
    phone: '+1 (555) 123-4567',
    company: 'Tech Innovations Inc.',
    position: 'Senior Full Stack Developer',
    education: 'Computer Science, Stanford University',
    skills: ['React', 'Node.js', 'Python', 'TypeScript', 'AWS', 'MongoDB'],
    experience: '5+ years',
    joinDate: 'January 2024',
    availability: 'Open to opportunities',
    resumeLink: '#'
  });

  const [connections, setConnections] = useState([]);
  const [suggestedConnections, setSuggestedConnections] = useState([]);

  const stats = {
    rank: 1250,
    problemsSolved: 142,
    streak: 15,
    xp: 15400,
    contributions: 892
  };

  // Mock connections data
  useEffect(() => {
    // Simulate fetching connections data
    setConnections([
      {
        id: 1,
        name: 'Sarah Chen',
        position: 'Frontend Developer',
        company: 'Google',
        avatar: '/api/placeholder/40/40',
        mutualConnections: 15,
        isFollowing: true
      },
      {
        id: 2,
        name: 'Alex Rodriguez',
        position: 'Backend Engineer',
        company: 'Microsoft',
        avatar: '/api/placeholder/40/40',
        mutualConnections: 8,
        isFollowing: true
      },
      {
        id: 3,
        name: 'Emily Johnson',
        position: 'UX Designer',
        company: 'Apple',
        avatar: '/api/placeholder/40/40',
        mutualConnections: 23,
        isFollowing: false
      }
    ]);

    setSuggestedConnections([
      {
        id: 4,
        name: 'David Park',
        position: 'DevOps Engineer',
        company: 'Amazon',
        avatar: '/api/placeholder/40/40',
        mutualConnections: 5,
        isFollowing: false
      },
      {
        id: 5,
        name: 'Lisa Wang',
        position: 'Data Scientist',
        company: 'Netflix',
        avatar: '/api/placeholder/40/40',
        mutualConnections: 12,
        isFollowing: false
      }
    ]);
  }, []);

  const userPosts = [
    {
      id: 1,
      content: 'Just deployed my React app with TypeScript! The type safety really helps catch errors early.',
      timestamp: '2 hours ago',
      likes: 23,
      comments: 5,
      tags: ['React', 'TypeScript']
    },
    {
      id: 2,
      content: 'Working on a new machine learning project. Excited to share the results soon!',
      timestamp: '1 day ago',
      likes: 45,
      comments: 12,
      tags: ['MachineLearning', 'Python']
    },
    {
      id: 3,
      content: 'Best practices for Node.js performance optimization. Thread pools and caching are game changers.',
      timestamp: '3 days ago',
      likes: 67,
      comments: 23,
      tags: ['Node.js', 'Performance']
    }
  ];

  const achievements = [
    { name: 'First Post', description: 'Published your first post', icon: '🎉', earned: true },
    { name: 'Code Master', description: 'Shared 10 code snippets', icon: '💻', earned: true },
    { name: 'Community Helper', description: 'Helped 50 community members', icon: '🤝', earned: true },
    { name: 'Rising Star', description: 'Received 100 likes', icon: '⭐', earned: false },
    { name: 'Mentor', description: 'Mentored 5 developers', icon: '👨‍🏫', earned: false },
    { name: 'Innovator', description: 'Published a research paper', icon: '🚀', earned: false }
  ];

  const handleSaveProfile = () => {
    // In a real app, this would update the user profile via API
    setIsEditing(false);
  };

  const handleInputChange = (field, value) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFollowUser = (userId) => {
    // Update connection status
    setConnections(prev => 
      prev.map(conn => 
        conn.id === userId 
          ? { ...conn, isFollowing: !conn.isFollowing }
          : conn
      )
    );
    
    setSuggestedConnections(prev => 
      prev.map(conn => 
        conn.id === userId 
          ? { ...conn, isFollowing: !conn.isFollowing }
          : conn
      )
    );
  };

  const ConnectionCard = ({ person, showMutual = true }) => (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-md transition-all duration-300 group">
      <div className="flex items-start gap-4">
        <div className="relative">
          <img
            src={person.avatar}
            alt={person.name}
            className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm"
          />
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
            {person.name}
          </h3>
          <p className="text-sm text-gray-600 truncate font-medium">
            {person.position}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {person.company}
          </p>
          {showMutual && (
            <p className="text-xs text-blue-600 mt-1 font-medium flex items-center gap-1">
              <Users className="w-3 h-3" />
              {person.mutualConnections} mutual connections
            </p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <Button
            variant={person.isFollowing ? "outline" : "default"}
            size="sm"
            onClick={() => handleFollowUser(person.id)}
            className={`min-w-[90px] rounded-xl text-xs font-semibold transition-all duration-300 ${
              person.isFollowing 
                ? "border-gray-200 text-gray-700 hover:bg-red-50 hover:text-red-600 hover:border-red-200" 
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-500/20"
            }`}
          >
            {person.isFollowing ? (
              <>
                <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                Following
              </>
            ) : (
              <>
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Follow
              </>
            )}
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="rounded-xl border-gray-200 hover:bg-gray-50 text-gray-600"
          >
            <MessageSquare className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Profile Header */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden mb-8">
          <div className="relative h-64 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-6 right-6 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 rounded-xl transition-all duration-300"
            >
              <Camera className="w-4 h-4 mr-2" />
              Change Cover
            </Button>
          </div>
          
          <div className="relative px-8 pb-8">
            <div className="flex flex-col lg:flex-row lg:items-end lg:gap-8">
              {/* Avatar */}
              <div className="relative -mt-20 mb-6 lg:mb-0 flex-shrink-0">
                <div className="w-40 h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center relative group">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <User className="w-20 h-20 text-white" />
                  )}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center cursor-pointer">
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full"></div>
              </div>

              {/* Profile Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="mb-4 space-y-3 max-w-md">
                        <div>
                          <Label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Display Name</Label>
                          <Input 
                            value={profileData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className="text-xl font-bold h-10 border-gray-300 focus:border-blue-500 mt-1"
                            placeholder="Your Name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Position</Label>
                            <Input 
                              value={profileData.position}
                              onChange={(e) => handleInputChange('position', e.target.value)}
                              placeholder="Position"
                              className="h-9 text-sm mt-1"
                            />
                          </div>
                          <div>
                            <Label className="text-xs text-gray-500 uppercase font-bold tracking-wider">Company</Label>
                            <Input 
                              value={profileData.company}
                              onChange={(e) => handleInputChange('company', e.target.value)}
                              placeholder="Company"
                              className="h-9 text-sm mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h1 className="text-3xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                          {profileData.name}
                          {profileData.rank < 5000 && (
                            <CheckCircle className="w-6 h-6 text-blue-500 fill-blue-50" />
                          )}
                        </h1>
                        <p className="text-lg text-gray-600 font-medium mb-2 flex items-center gap-2">
                          {profileData.position} at {profileData.company}
                        </p>
                      </>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        <Shield className="w-3.5 h-3.5 mr-1.5" />
                        {user?.role === 'student' ? 'Student Developer' : 
                         user?.role === 'admin' ? 'Platform Admin' : 'Professional'}
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-100">
                        <Award className="w-3.5 h-3.5 mr-1.5" />
                        {profileData.experience} Experience
                      </span>
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-100">
                        <MapPin className="w-3.5 h-3.5 mr-1.5" />
                        {profileData.location}
                      </span>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex items-center gap-3">
                    {!isEditing ? (
                      <>
                        <Button 
                          variant="outline"
                          className="rounded-xl border-gray-200 hover:bg-gray-50 text-gray-700 transition-colors"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Resume
                        </Button>
                        <Button 
                          onClick={() => setIsEditing(true)}
                          className="bg-gray-900 text-white hover:bg-gray-800 rounded-xl px-5 shadow-lg shadow-gray-900/20 transition-all duration-300"
                        >
                          <Edit3 className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                        <Button variant="outline" className="rounded-xl border-gray-200 hover:bg-gray-50 hover:text-blue-600 transition-colors">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Message
                        </Button>
                        <Button variant="outline" className="rounded-xl border-gray-200 hover:bg-gray-50 w-10 p-0 flex items-center justify-center">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          onClick={handleSaveProfile}
                          className="bg-blue-600 text-white hover:bg-blue-700 rounded-xl px-5 shadow-lg shadow-blue-600/20 transition-all duration-300"
                        >
                          <Save className="w-4 h-4 mr-2" />
                          Save Changes
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setIsEditing(false)}
                          className="rounded-xl border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                        >
                          <X className="w-4 h-4 mr-2" />
                          Cancel
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Bio */}
                <div className="mt-4 max-w-3xl">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Label htmlFor="bio" className="text-sm font-semibold text-gray-700">Bio</Label>
                      <textarea
                        id="bio"
                        rows={3}
                        className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none resize-none text-sm"
                        value={profileData.bio}
                        onChange={(e) => handleInputChange('bio', e.target.value)}
                        placeholder="Tell us about yourself..."
                      />
                    </div>
                  ) : (
                    <p className="text-gray-600 leading-relaxed">
                      {profileData.bio}
                    </p>
                  )}
                </div>
                
                {/* Social Links */}
                <div className="flex items-center gap-4 mt-6 pt-6 border-t border-gray-100">
                  {isEditing ? (
                    <div className="flex flex-wrap gap-4 w-full">
                      <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                          <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            value={profileData.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                            placeholder="Website URL"
                            className="pl-9 rounded-xl border-gray-200"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                          <Github className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            value={profileData.github}
                            onChange={(e) => handleInputChange('github', e.target.value)}
                            placeholder="GitHub URL"
                            className="pl-9 rounded-xl border-gray-200"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                          <Twitter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            value={profileData.twitter}
                            onChange={(e) => handleInputChange('twitter', e.target.value)}
                            placeholder="Twitter URL"
                            className="pl-9 rounded-xl border-gray-200"
                          />
                        </div>
                      </div>
                      <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                          <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                          <Input
                            value={profileData.linkedin}
                            onChange={(e) => handleInputChange('linkedin', e.target.value)}
                            placeholder="LinkedIn URL"
                            className="pl-9 rounded-xl border-gray-200"
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {profileData.website && (
                        <a href={profileData.website} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 transition-colors text-sm font-medium group">
                          <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                            <Globe className="w-4 h-4" />
                          </div>
                          Website
                        </a>
                      )}
                      {profileData.github && (
                        <a href={profileData.github} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors text-sm font-medium group">
                          <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-gray-200 transition-colors">
                            <Github className="w-4 h-4" />
                          </div>
                          GitHub
                        </a>
                      )}
                      {profileData.twitter && (
                        <a href={profileData.twitter} className="flex items-center gap-2 text-gray-500 hover:text-blue-400 transition-colors text-sm font-medium group">
                          <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                            <Twitter className="w-4 h-4" />
                          </div>
                          Twitter
                        </a>
                      )}
                      {profileData.linkedin && (
                        <a href={profileData.linkedin} className="flex items-center gap-2 text-gray-500 hover:text-blue-700 transition-colors text-sm font-medium group">
                          <div className="p-2 bg-gray-50 rounded-lg group-hover:bg-blue-50 transition-colors">
                            <Linkedin className="w-4 h-4" />
                          </div>
                          LinkedIn
                        </a>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Global Rank', value: `#${stats.rank}`, icon: Trophy, color: 'text-yellow-600', bg: 'bg-yellow-50' },
            { label: 'Problems Solved', value: stats.problemsSolved, icon: Code, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Day Streak', value: stats.streak, icon: Flame, color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Total XP', value: stats.xp.toLocaleString(), icon: Zap, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Contributions', value: stats.contributions, icon: GitCommit, color: 'text-green-600', bg: 'bg-green-50' }
          ].map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md transition-all duration-300 group">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}>
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-0.5">
                {stat.value}
              </div>
              <div className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {stat.label}
              </div>
            </div>
          ))}
        </div>

        {/* Coding Activity & Languages */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Language Stats */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:col-span-1">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
              <Cpu className="w-5 h-5 text-blue-600" />
              Top Languages
            </h3>
            <div className="space-y-4">
              {[
                { name: 'JavaScript', percentage: 45, color: 'bg-yellow-400' },
                { name: 'Python', percentage: 30, color: 'bg-blue-500' },
                { name: 'TypeScript', percentage: 15, color: 'bg-blue-600' },
                { name: 'HTML/CSS', percentage: 10, color: 'bg-orange-500' }
              ].map((lang) => (
                <div key={lang.name}>
                  <div className="flex justify-between text-sm font-medium mb-1">
                    <span className="text-gray-700">{lang.name}</span>
                    <span className="text-gray-500">{lang.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div className={`${lang.color} h-2.5 rounded-full`} style={{ width: `${lang.percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contribution Graph */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Contribution Activity
              </h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 bg-gray-100 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-600 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-800 rounded-sm"></div>
                </div>
                <span>More</span>
              </div>
            </div>
            
            <div className="w-full overflow-x-auto pb-2">
              <div className="min-w-[700px]">
                <div className="flex gap-1">
                  {[...Array(52)].map((_, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1">
                      {[...Array(7)].map((_, dayIndex) => {
                        // Simulate contribution data
                        const intensity = Math.random() > 0.6 ? Math.floor(Math.random() * 5) : 0;
                        const colors = [
                          'bg-gray-100',
                          'bg-green-200',
                          'bg-green-400',
                          'bg-green-600',
                          'bg-green-800'
                        ];
                        return (
                          <div 
                            key={dayIndex} 
                            className={`w-3 h-3 rounded-sm ${colors[intensity]} hover:ring-2 hover:ring-gray-300 transition-all cursor-pointer`}
                            title={`${intensity} contributions on ${new Date().toDateString()}`}
                          ></div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-3 px-1 font-medium">
                  <span>Jan</span><span>Feb</span><span>Mar</span><span>Apr</span><span>May</span><span>Jun</span>
                  <span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span><span>Nov</span><span>Dec</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="posts" className="space-y-8">
          <TabsList className="bg-white p-1.5 rounded-2xl border border-gray-100 shadow-sm inline-flex h-auto w-full md:w-auto">
            <TabsTrigger 
              value="posts" 
              className="flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-medium data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Posts
            </TabsTrigger>
            <TabsTrigger 
              value="connections" 
              className="flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-medium data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
            >
              <Users className="w-4 h-4 mr-2" />
              Network
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className="flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-medium data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Achievements
            </TabsTrigger>
            <TabsTrigger 
              value="about" 
              className="flex-1 md:flex-none px-6 py-2.5 rounded-xl text-sm font-medium data-[state=active]:bg-gray-900 data-[state=active]:text-white data-[state=active]:shadow-md transition-all duration-300"
            >
              <User className="w-4 h-4 mr-2" />
              About
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6 focus:outline-none">
            {userPosts.map((post) => (
              <div key={post.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-all duration-300">
                <div className="flex items-start gap-4">
                  <img src={user?.avatar || '/default-avatar.png'} alt="" className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <h3 className="font-bold text-gray-900">{profileData.name}</h3>
                        <p className="text-xs text-gray-500">{post.timestamp}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="rounded-full w-8 h-8 p-0">
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </Button>
                    </div>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {post.content}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {post.tags.map((tag, tagIndex) => (
                        <span
                          key={tagIndex}
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-600 border border-blue-100"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-6 pt-4 border-t border-gray-50">
                      <button className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors group">
                        <div className="p-2 rounded-full group-hover:bg-red-50 transition-colors">
                          <Heart className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-sm">{post.likes}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-blue-500 transition-colors group">
                        <div className="p-2 rounded-full group-hover:bg-blue-50 transition-colors">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <span className="font-medium text-sm">{post.comments}</span>
                      </button>
                      <button className="flex items-center gap-2 text-gray-500 hover:text-green-500 transition-colors group ml-auto">
                        <div className="p-2 rounded-full group-hover:bg-green-50 transition-colors">
                          <Share2 className="w-5 h-5" />
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* Connections Tab */}
          <TabsContent value="connections" className="space-y-8 focus:outline-none">
            {/* Following Section */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Following ({connections.filter(c => c.isFollowing).length})
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {connections.filter(c => c.isFollowing).map((person) => (
                  <ConnectionCard key={person.id} person={person} />
                ))}
              </div>
            </div>

            {/* Suggested Connections */}
            <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-green-600" />
                  Suggested Connections
                </h3>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {suggestedConnections.map((person) => (
                  <ConnectionCard key={person.id} person={person} />
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="focus:outline-none">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement, index) => (
                <div 
                  key={index} 
                  className={`relative overflow-hidden rounded-3xl border p-6 transition-all duration-300 hover:shadow-lg group ${
                    achievement.earned 
                      ? 'bg-white border-gray-100' 
                      : 'bg-gray-50 border-gray-100 opacity-70'
                  }`}
                >
                  {achievement.earned && (
                    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-bl-full -mr-8 -mt-8 opacity-50 group-hover:scale-110 transition-transform duration-500"></div>
                  )}
                  <div className="relative z-10 flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-4 shadow-sm ${
                      achievement.earned ? 'bg-gradient-to-br from-yellow-50 to-orange-50' : 'bg-gray-100'
                    }`}>
                      {achievement.icon}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2">{achievement.name}</h3>
                    <p className="text-gray-500 text-sm mb-4 leading-relaxed">
                      {achievement.description}
                    </p>
                    {achievement.earned ? (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-700 border border-green-100">
                        <Trophy className="w-3 h-3 mr-1.5" />
                        Earned
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                        <Clock className="w-3 h-3 mr-1.5" />
                        In Progress
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="focus:outline-none">
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Professional Info */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  Professional Information
                </h3>
                <div className="space-y-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="education" className="text-sm font-semibold text-gray-700">Education</Label>
                        <Input
                          id="education"
                          value={profileData.education}
                          onChange={(e) => handleInputChange('education', e.target.value)}
                          className="mt-1 rounded-xl border-gray-200"
                          placeholder="University / College"
                        />
                      </div>
                      <div>
                        <Label htmlFor="experience" className="text-sm font-semibold text-gray-700">Experience</Label>
                        <Input
                          id="experience"
                          value={profileData.experience}
                          onChange={(e) => handleInputChange('experience', e.target.value)}
                          className="mt-1 rounded-xl border-gray-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="resume" className="text-sm font-semibold text-gray-700">Resume Link</Label>
                        <Input
                          id="resume"
                          value={profileData.resumeLink}
                          onChange={(e) => handleInputChange('resumeLink', e.target.value)}
                          className="mt-1 rounded-xl border-gray-200"
                          placeholder="Link to your resume"
                        />
                      </div>
                      <div>
                        <Label htmlFor="availability" className="text-sm font-semibold text-gray-700">Availability</Label>
                        <select
                          id="availability"
                          value={profileData.availability}
                          onChange={(e) => handleInputChange('availability', e.target.value)}
                          className="w-full mt-1 p-3 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        >
                          <option value="Open to opportunities">Open to opportunities</option>
                          <option value="Not looking">Not looking</option>
                          <option value="Freelance only">Freelance only</option>
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">Education</span>
                        <span className="text-gray-900 font-semibold text-right">{profileData.education}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">Experience</span>
                        <span className="text-gray-900 font-semibold">{profileData.experience}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">Availability</span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          {profileData.availability}
                        </span>
                      </div>
                      {profileData.resumeLink && profileData.resumeLink !== '#' && (
                        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                          <span className="font-medium text-gray-700">Resume</span>
                          <a 
                            href={profileData.resumeLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline font-medium flex items-center"
                          >
                            View Resume <ExternalLink className="w-3 h-3 ml-1" />
                          </a>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <Phone className="w-5 h-5 text-green-600" />
                  Contact Information
                </h3>
                <div className="space-y-6">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={profileData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className="mt-1 rounded-xl border-gray-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone" className="text-sm font-semibold text-gray-700">Phone</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className="mt-1 rounded-xl border-gray-200"
                        />
                      </div>
                      <div>
                        <Label htmlFor="location" className="text-sm font-semibold text-gray-700">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="mt-1 rounded-xl border-gray-200"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">Email</span>
                        <span className="text-gray-900 font-semibold">{profileData.email}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">Phone</span>
                        <span className="text-gray-900 font-semibold">{profileData.phone}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-gray-50 rounded-xl">
                        <span className="font-medium text-gray-700">Location</span>
                        <span className="text-gray-900 font-semibold">{profileData.location}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Skills */}
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8 lg:col-span-2">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                  <Code className="w-5 h-5 text-purple-600" />
                  Skills & Technologies
                </h3>
                <div className="flex flex-wrap gap-3">
                  {profileData.skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold bg-gray-50 text-gray-700 border border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-all duration-300 cursor-default"
                    >
                      {skill}
                    </span>
                  ))}
                  {isEditing && (
                    <Button variant="outline" className="rounded-xl border-dashed border-gray-300 text-gray-500 hover:text-blue-600 hover:border-blue-300">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Skill
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;