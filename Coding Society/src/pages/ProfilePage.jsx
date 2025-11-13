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
  Clock
} from 'lucide-react';

const ProfilePage = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
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
    joinDate: 'January 2024'
  });

  const [connections, setConnections] = useState([]);
  const [suggestedConnections, setSuggestedConnections] = useState([]);

  const stats = {
    posts: 47,
    followers: 1234,
    following: 567,
    likes: 3456,
    connections: 892
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
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <img
            src={person.avatar}
            alt={person.name}
            className="w-12 h-12 rounded-full object-cover"
          />
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {person.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
              {person.position}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 truncate">
              {person.company}
            </p>
            {showMutual && (
              <p className="text-xs text-gray-400 mt-1">
                {person.mutualConnections} mutual connections
              </p>
            )}
          </div>
          <div className="flex flex-col space-y-2">
            <Button
              variant={person.isFollowing ? "outline" : "default"}
              size="sm"
              onClick={() => handleFollowUser(person.id)}
              className="min-w-[80px]"
            >
              {person.isFollowing ? (
                <>
                  <UserCheck className="w-4 h-4 mr-1" />
                  Following
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-1" />
                  Follow
                </>
              )}
            </Button>
            <Button variant="outline" size="sm">
              <MessageSquare className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-slate-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Profile Header */}
        <Card className="mb-8 overflow-hidden shadow-lg">
          <div className="relative">
            {/* Enhanced Cover Image with gradient overlay */}
            <div className="h-64 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative">
              <div className="absolute inset-0 bg-black bg-opacity-20"></div>
              <Button
                variant="outline"
                size="sm"
                className="absolute top-4 right-4 bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Camera className="w-4 h-4 mr-2" />
                Change Cover
              </Button>
            </div>
            
            {/* Enhanced Profile Info Section */}
            <div className="relative px-6 pb-6">
              <div className="flex flex-col lg:flex-row lg:items-end lg:space-x-6">
                {/* Enhanced Avatar with upload functionality */}
                <div className="relative -mt-16 mb-4 lg:mb-0">
                  <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    {user?.avatar ? (
                      <img
                        src={user.avatar}
                        alt={user.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-white" />
                    )}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full w-10 h-10 p-0 bg-white shadow-md"
                  >
                    <Camera className="w-4 h-4" />
                  </Button>
                </div>

                {/* Enhanced Profile Details */}
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {profileData.name}
                      </h1>
                      <p className="text-lg text-gray-600 dark:text-gray-300 font-medium">
                        {profileData.position}
                      </p>
                      <p className="text-gray-500 dark:text-gray-400">
                        {profileData.company}
                      </p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          <Shield className="w-3 h-3 mr-1" />
                          {user?.role === 'student' ? 'Student Developer' : 
                           user?.role === 'admin' ? 'Platform Admin' : 'Professional'}
                        </span>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <Award className="w-3 h-3 mr-1" />
                          {profileData.experience} Experience
                        </span>
                      </div>
                    </div>
                    
                    {/* Enhanced Action Buttons */}
                    <div className="flex gap-3 mt-4 lg:mt-0">
                      {!isEditing ? (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setIsEditing(true)}
                          >
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit Profile
                          </Button>
                          <Button variant="outline" size="sm">
                            <MessageCircle className="w-4 h-4 mr-2" />
                            Message
                          </Button>
                          <Button variant="outline" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={handleSaveProfile}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setIsEditing(false)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Enhanced Bio Section */}
                  <div className="mt-4">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="bio">Bio</Label>
                          <textarea
                            id="bio"
                            rows={3}
                            className="w-full mt-1 p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            value={profileData.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            placeholder="Tell us about yourself..."
                          />
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300 max-w-3xl leading-relaxed">
                        {profileData.bio}
                      </p>
                    )}
                  </div>
                  
                  {/* Enhanced Meta Info */}
                  <div className="flex flex-wrap gap-6 mt-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <MapPin className="w-4 h-4" />
                      {isEditing ? (
                        <Input
                          value={profileData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                          className="h-6 text-sm border-0 bg-transparent p-0 focus:ring-0"
                        />
                      ) : (
                        profileData.location
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Briefcase className="w-4 h-4" />
                      {isEditing ? (
                        <Input
                          value={profileData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                          className="h-6 text-sm border-0 bg-transparent p-0 focus:ring-0"
                        />
                      ) : (
                        profileData.company
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <GraduationCap className="w-4 h-4" />
                      {isEditing ? (
                        <Input
                          value={profileData.education}
                          onChange={(e) => handleInputChange('education', e.target.value)}
                          className="h-6 text-sm border-0 bg-transparent p-0 focus:ring-0"
                        />
                      ) : (
                        profileData.education
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                      <Calendar className="w-4 h-4" />
                      Joined {profileData.joinDate}
                    </div>
                  </div>
                  
                  {/* Enhanced Social Links */}
                  <div className="flex gap-4 mt-4">
                    {isEditing ? (
                      <div className="flex gap-4 flex-wrap">
                        <div className="flex items-center gap-2">
                          <Globe className="w-4 h-4 text-gray-500" />
                          <Input
                            value={profileData.website}
                            onChange={(e) => handleInputChange('website', e.target.value)}
                            placeholder="Website URL"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Github className="w-4 h-4 text-gray-500" />
                          <Input
                            value={profileData.github}
                            onChange={(e) => handleInputChange('github', e.target.value)}
                            placeholder="GitHub URL"
                            className="h-8 text-sm"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <Twitter className="w-4 h-4 text-gray-500" />
                          <Input
                            value={profileData.twitter}
                            onChange={(e) => handleInputChange('twitter', e.target.value)}
                            placeholder="Twitter URL"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <>
                        {profileData.website && (
                          <a
                            href={profileData.website}
                            className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                          >
                            <Globe className="w-5 h-5" />
                          </a>
                        )}
                        {profileData.github && (
                          <a
                            href={profileData.github}
                            className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
                          >
                            <Github className="w-5 h-5" />
                          </a>
                        )}
                        {profileData.twitter && (
                          <a
                            href={profileData.twitter}
                            className="text-gray-600 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
                          >
                            <Twitter className="w-5 h-5" />
                          </a>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { label: 'Posts', value: stats.posts, icon: BookOpen, color: 'text-blue-600' },
            { label: 'Followers', value: stats.followers, icon: Users, color: 'text-green-600' },
            { label: 'Following', value: stats.following, icon: UserPlus, color: 'text-purple-600' },
            { label: 'Likes', value: stats.likes, icon: Heart, color: 'text-red-600' },
            { label: 'Connections', value: stats.connections, icon: Users, color: 'text-indigo-600' }
          ].map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-4 text-center">
                <stat.icon className={`w-6 h-6 mx-auto mb-2 ${stat.color}`} />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  {stat.label}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Content Tabs */}
        <Tabs defaultValue="posts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="posts" className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              Posts
            </TabsTrigger>
            <TabsTrigger value="connections" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Connections
            </TabsTrigger>
            <TabsTrigger value="achievements" className="flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              Achievements
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <User className="w-4 h-4" />
              About
            </TabsTrigger>
          </TabsList>

          {/* Posts Tab */}
          <TabsContent value="posts" className="space-y-6">
            {userPosts.map((post) => (
              <Card key={post.id} className="hover:shadow-md transition-shadow duration-200">
                <CardContent className="p-6">
                  <p className="text-gray-800 dark:text-gray-200 mb-4 leading-relaxed">
                    {post.content}
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag, tagIndex) => (
                      <span
                        key={tagIndex}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <span>{post.timestamp}</span>
                    <div className="flex items-center gap-4">
                      <button className="flex items-center gap-1 hover:text-red-500 transition-colors">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </button>
                      <button className="flex items-center gap-1 hover:text-blue-500 transition-colors">
                        <MessageCircle className="w-4 h-4" />
                        {post.comments}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* NEW: Connections Tab */}
          <TabsContent value="connections" className="space-y-6">
            {/* Following Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Following ({connections.filter(c => c.isFollowing).length})
                </CardTitle>
                <CardDescription>
                  People you're following and connected with
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {connections.filter(c => c.isFollowing).map((person) => (
                    <ConnectionCard key={person.id} person={person} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Suggested Connections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5" />
                  Suggested Connections
                </CardTitle>
                <CardDescription>
                  People you may know based on your network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  {suggestedConnections.map((person) => (
                    <ConnectionCard key={person.id} person={person} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* All Connections */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  All Connections ({connections.length})
                </CardTitle>
                <CardDescription>
                  Your professional network
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {connections.map((person) => (
                    <ConnectionCard key={person.id} person={person} showMutual={false} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement, index) => (
                <Card key={index} className={`transition-all duration-200 ${achievement.earned ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200' : 'opacity-60'}`}>
                  <CardContent className="p-6 text-center">
                    <div className="text-4xl mb-4">{achievement.icon}</div>
                    <h3 className="font-semibold text-lg mb-2">{achievement.name}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                      {achievement.description}
                    </p>
                    {achievement.earned ? (
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Trophy className="w-3 h-3 mr-1" />
                        Earned
                      </div>
                    ) : (
                      <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                        <Clock className="w-3 h-3 mr-1" />
                        In Progress
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Professional Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5" />
                    Professional Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="position">Position</Label>
                        <Input
                          id="position"
                          value={profileData.position}
                          onChange={(e) => handleInputChange('position', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="company">Company</Label>
                        <Input
                          id="company"
                          value={profileData.company}
                          onChange={(e) => handleInputChange('company', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="experience">Experience</Label>
                        <Input
                          id="experience"
                          value={profileData.experience}
                          onChange={(e) => handleInputChange('experience', e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Position:</span>
                        <span className="text-gray-600">{profileData.position}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Company:</span>
                        <span className="text-gray-600">{profileData.company}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Experience:</span>
                        <span className="text-gray-600">{profileData.experience}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Contact Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Phone className="w-5 h-5" />
                    Contact Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={user?.email || ''}
                          disabled
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={profileData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                        />
                      </div>
                      <div>
                        <Label htmlFor="location">Location</Label>
                        <Input
                          id="location"
                          value={profileData.location}
                          onChange={(e) => handleInputChange('location', e.target.value)}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="font-medium">Email:</span>
                        <span className="text-gray-600">{user?.email}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Phone:</span>
                        <span className="text-gray-600">{profileData.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium">Location:</span>
                        <span className="text-gray-600">{profileData.location}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Skills */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Skills & Technologies
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {profileData.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProfilePage;