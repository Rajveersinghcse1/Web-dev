import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
import CreatePostModal from '../components/ui/CreatePostModal';
import AuthenticationOverlay from '../components/AuthenticationOverlay';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  Search,
  Filter,
  Plus,
  Code,
  Image,
  Video,
  FileText,
  MoreHorizontal,
  UserPlus,
  UserCheck,
  UserMinus,
  User,
  Send,
  MapPin,
  Globe,
  Users,
  Lock,
  Eye,
  EyeOff,
  Camera,
  Mic,
  Smile,
  Tag,
  X,
  ChevronDown,
  ChevronUp,
  Play,
  Pause,
  VolumeOff,
  Volume2,
  Maximize,
  Edit3,
  Trash2,
  Flag,
  Copy,
  Download,
  ExternalLink,
  Zap,
  Flame,
  ThumbsUp,
  ThumbsDown,
  Frown,
  Meh,
  TrendingUp,
  Hash,
  AtSign,
  Star,
  Award,
  Trophy,
  Target,
  Clock,
  Calendar,
  Bell,
  BellOff,
  Settings,
  RefreshCw,
  Upload,
  Link as LinkIcon,
  Paperclip,
  CheckCircle,
  AlertCircle,
  Info,
  Loader2,
  Link,
  Share,
  Mail,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Archive,
  Images,
  Bell as Notification,
  BookOpen,
  Briefcase,
  Coffee
} from 'lucide-react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { io } from 'socket.io-client';

// Enhanced sample posts with connection features
const SAMPLE_POSTS = [
  {
    _id: 'sample-1',
    author: {
      _id: 'user-1',
      username: 'Sarah Chen',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c988?w=150',
      title: 'Senior React Developer',
      company: 'TechFlow Inc',
      location: 'San Francisco, CA',
      verified: true,
      isOnline: true,
      connectionStatus: 'not-connected', // not-connected, pending, connected
      mutualConnections: 12
    },
    content: 'Just launched our new dashboard with real-time analytics! 🚀 The combination of React, TypeScript, and WebSocket made this project incredibly smooth. Love how modern web development tools make complex features so accessible.',
    type: 'text',
    category: 'achievement',
    tags: ['react', 'typescript', 'websocket', 'dashboard'],
    privacy: 'public',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800',
        filename: 'dashboard-preview.jpg'
      }
    ],
    createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
    likesCount: 47,
    commentsCount: 12,
    hasLiked: false,
    bookmarked: false,
    reactions: { like: 28, love: 8, celebrate: 11 },
    comments: [
      {
        _id: 'comment-1',
        author: { username: 'Mike Rodriguez', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
        content: 'This looks incredible! The real-time features must have been challenging to implement. Great work! 🔥',
        createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      },
      {
        _id: 'comment-2',
        author: { username: 'Emily Davis', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150' },
        content: 'Love the clean UI design. Are you using any specific charting library for the analytics?',
        createdAt: new Date(Date.now() - 5 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    _id: 'sample-2',
    author: {
      _id: 'user-2',
      username: 'Alex Kumar',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      title: 'Full Stack Engineer',
      company: 'InnovateLab',
      location: 'Austin, TX',
      verified: true,
      isOnline: false,
      connectionStatus: 'connected',
      mutualConnections: 8
    },
    content: 'Excited to share my latest open-source project! 🎉 Built a lightweight state management library for React that\'s only 2KB gzipped. Sometimes the best solutions are the simplest ones.\n\nKey features:\n✅ Zero dependencies\n✅ TypeScript support\n✅ DevTools integration\n✅ SSR compatible\n\nCheck it out and let me know what you think! Always open to feedback and contributions.',
    type: 'text',
    category: 'project',
    tags: ['opensource', 'react', 'typescript', 'statemanagement'],
    privacy: 'public',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
        filename: 'code-editor.jpg'
      }
    ],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    likesCount: 89,
    commentsCount: 23,
    hasLiked: true,
    bookmarked: true,
    reactions: { like: 45, love: 12, fire: 18, clap: 14 },
    comments: [
      {
        _id: 'comment-3',
        author: { username: 'David Park', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150' },
        content: 'This is exactly what I\'ve been looking for! The API looks super clean. Starring the repo right now ⭐',
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      }
    ]
  },
  {
    _id: 'sample-3',
    author: {
      _id: 'user-3',
      username: 'Lisa Thompson',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150',
      title: 'UX/UI Designer & Developer',
      company: 'DesignTech Studios',
      location: 'Seattle, WA',
      verified: false,
      isOnline: true,
      connectionStatus: 'pending',
      mutualConnections: 5
    },
    content: 'Design + Code = Magic ✨ Just finished prototyping this new component library with Figma and implementing it in React. The seamless workflow from design to code never gets old!',
    type: 'text',
    category: 'insight',
    tags: ['design', 'figma', 'components', 'ui'],
    privacy: 'public',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1611224923853-80b023f02d71?w=800',
        filename: 'design-system.jpg'
      }
    ],
    createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    likesCount: 34,
    commentsCount: 8,
    hasLiked: false,
    bookmarked: false,
    reactions: { like: 20, love: 8, wow: 6 },
    comments: []
  }
];

// Ultra-Advanced emoji reaction system (keeping for compatibility)
const LINKEDIN_REACTIONS = {
  like: { icon: ThumbsUp, emoji: '👍', label: 'Like', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  love: { icon: Heart, emoji: '❤️', label: 'Love', color: 'text-red-600', bgColor: 'bg-red-50' },
  insightful: { icon: Star, emoji: '�', label: 'Insightful', color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  celebrate: { icon: Trophy, emoji: '🎉', label: 'Celebrate', color: 'text-green-600', bgColor: 'bg-green-50' },
  support: { icon: Heart, emoji: '🤝', label: 'Support', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  curious: { icon: Target, emoji: '🤔', label: 'Curious', color: 'text-orange-600', bgColor: 'bg-orange-50' }
};

const EMOJI_REACTIONS = {
  like: { emoji: '👍', label: 'Like', color: 'text-blue-600', bgColor: 'bg-blue-50', hoverColor: 'hover:bg-blue-100' },
  love: { emoji: '❤️', label: 'Love', color: 'text-red-600', bgColor: 'bg-red-50', hoverColor: 'hover:bg-red-100' },
  laugh: { emoji: '😂', label: 'Laugh', color: 'text-yellow-600', bgColor: 'bg-yellow-50', hoverColor: 'hover:bg-yellow-100' },
  wow: { emoji: '😮', label: 'Wow', color: 'text-purple-600', bgColor: 'bg-purple-50', hoverColor: 'hover:bg-purple-100' },
  sad: { emoji: '😢', label: 'Sad', color: 'text-gray-600', bgColor: 'bg-gray-50', hoverColor: 'hover:bg-gray-100' },
  angry: { emoji: '😠', label: 'Angry', color: 'text-red-700', bgColor: 'bg-red-100', hoverColor: 'hover:bg-red-200' },
  celebrate: { emoji: '🎉', label: 'Celebrate', color: 'text-green-600', bgColor: 'bg-green-50', hoverColor: 'hover:bg-green-100' },
  fire: { emoji: '🔥', label: 'Fire', color: 'text-orange-600', bgColor: 'bg-orange-50', hoverColor: 'hover:bg-orange-100' },
  clap: { emoji: '👏', label: 'Clap', color: 'text-blue-700', bgColor: 'bg-blue-100', hoverColor: 'hover:bg-blue-200' },
  thinking: { emoji: '🤔', label: 'Thinking', color: 'text-yellow-700', bgColor: 'bg-yellow-100', hoverColor: 'hover:bg-yellow-200' }
};

// Professional post categories
const POST_CATEGORIES = {
  achievement: { label: 'Achievement', icon: Trophy, color: 'bg-gradient-to-r from-yellow-400 to-orange-500' },
  insight: { label: 'Industry Insight', icon: Star, color: 'bg-gradient-to-r from-blue-400 to-purple-500' },
  career: { label: 'Career Update', icon: TrendingUp, color: 'bg-gradient-to-r from-green-400 to-blue-500' },
  learning: { label: 'Learning', icon: Award, color: 'bg-gradient-to-r from-purple-400 to-pink-500' },
  project: { label: 'Project Showcase', icon: Code, color: 'bg-gradient-to-r from-indigo-400 to-cyan-500' },
  networking: { label: 'Networking', icon: Users, color: 'bg-gradient-to-r from-pink-400 to-red-500' }
};

const PRIVACY_OPTIONS = [
  { value: 'public', icon: Globe, label: 'Public', description: 'Anyone can see this post' },
  { value: 'followers', icon: Users, label: 'Followers', description: 'Only your followers can see this' },
  { value: 'friends', icon: UserPlus, label: 'Friends', description: 'Only friends can see this' },
  { value: 'private', icon: Lock, label: 'Only me', description: 'Only you can see this post' }
];

const POST_TYPES = [
  { id: 'text', label: 'Text', icon: FileText, color: 'bg-blue-500' },
  { id: 'image', label: 'Photo', icon: Image, color: 'bg-green-500' },
  { id: 'video', label: 'Video', icon: Video, color: 'bg-red-500' },
  { id: 'code', label: 'Code', icon: Code, color: 'bg-purple-500' },
  { id: 'link', label: 'Link', icon: LinkIcon, color: 'bg-orange-500' },
  { id: 'poll', label: 'Poll', icon: Target, color: 'bg-pink-500' }
];

const FEED_FILTERS = [
  { id: 'all', label: 'All Posts', icon: Globe },
  { id: 'following', label: 'Following', icon: Users },
  { id: 'bookmarked', label: 'Bookmarked', icon: Bookmark },
  { id: 'code', label: 'Code', icon: Code },
  { id: 'media', label: 'Media', icon: Image }
];

// Skeleton loading component
const PostSkeleton = () => (
  <Card className="mb-6 overflow-hidden">
    <CardHeader className="pb-4">
      <div className="flex items-start space-x-4">
        <div className="w-12 h-12 bg-gray-300 rounded-full animate-pulse"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-300 rounded w-1/4 mb-2 animate-pulse"></div>
          <div className="h-3 bg-gray-300 rounded w-1/6 animate-pulse"></div>
        </div>
      </div>
    </CardHeader>
    <CardContent>
      <div className="space-y-3">
        <div className="h-4 bg-gray-300 rounded animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6 animate-pulse"></div>
        <div className="h-4 bg-gray-300 rounded w-4/6 animate-pulse"></div>
        <div className="h-48 bg-gray-300 rounded-lg animate-pulse"></div>
      </div>
    </CardContent>
  </Card>
);

// Enhanced Post Component
const EnhancedPost = ({ 
  post, 
  onReact, 
  onComment, 
  onShare, 
  onBookmark, 
  onDelete, 
  currentUser,
  onConnect,
  onDisconnect,
  onViewProfile,
  onMessageUser,
  pendingConnections = new Set()
}) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isBookmarked, setIsBookmarked] = useState(post.bookmarked || false);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState(post.userReaction || null);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isLiked, setIsLiked] = useState(post.hasLiked || false);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
  const [showFullImage, setShowFullImage] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showInsights, setShowInsights] = useState(false);
  const [showNetworkActivity, setShowNetworkActivity] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showReadMore, setShowReadMore] = useState(false);
  const ref = useRef();
  const optionsRef = useRef();
  const isInView = useInView(ref, { once: true, margin: "0px 0px -100px 0px" });

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowOptionsMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleReaction = useCallback((reactionType) => {
    const wasLiked = isLiked;
    setIsLiked(!wasLiked);
    setLikesCount(prev => wasLiked ? prev - 1 : prev + 1);
    setSelectedReaction(selectedReaction === reactionType ? null : reactionType);
    onReact(post._id, reactionType);
    setShowReactions(false);
  }, [selectedReaction, onReact, post._id, isLiked]);

  const handleDoubleClick = useCallback(() => {
    if (!isLiked) {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
      onReact(post._id, 'like');
    }
  }, [isLiked, onReact, post._id]);

  const handleComment = useCallback(() => {
    if (newComment.trim()) {
      onComment(post._id, newComment);
      setNewComment('');
    }
  }, [newComment, onComment, post._id]);

  const handleFollow = useCallback(() => {
    setIsFollowing(!isFollowing);
    // Add API call here for follow/unfollow
  }, [isFollowing]);

  const formatTimeAgo = (date) => {
    const now = new Date();
    const postDate = new Date(date);
    const diffInMinutes = Math.floor((now - postDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const handleMediaNavigation = useCallback((direction) => {
    if (direction === 'next' && currentMediaIndex < post.media.length - 1) {
      setCurrentMediaIndex(currentMediaIndex + 1);
    } else if (direction === 'prev' && currentMediaIndex > 0) {
      setCurrentMediaIndex(currentMediaIndex - 1);
    }
  }, [currentMediaIndex, post.media]);

  const copyPostLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
    // Use notification system - will be passed from parent
    setShowOptionsMenu(false);
  };

  const handleConnect = useCallback(() => {
    setIsConnected(!isConnected);
    // Add API call for connection request
  }, [isConnected]);

  const handleEndorse = useCallback(() => {
    // Add endorsement functionality
    console.log('Endorsing user skills');
  }, []);

  const handleRecommend = useCallback(() => {
    // Add recommendation functionality
    console.log('Recommending user');
  }, []);

  const formatEngagementText = (count, type) => {
    if (count === 0) return '';
    if (count === 1) return `1 ${type}`;
    if (count < 1000) return `${count} ${type}s`;
    if (count < 1000000) return `${(count / 1000).toFixed(1)}K ${type}s`;
    return `${(count / 1000000).toFixed(1)}M ${type}s`;
  };

  const getPostCategory = () => {
    return POST_CATEGORIES[post.category] || POST_CATEGORIES.insight;
  };

  const truncateContent = (content, maxLength = 300) => {
    if (content.length <= maxLength) return content;
    return showReadMore ? content : content.substring(0, maxLength) + '...';
  };

  return (
    <>
      <motion.div
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-6"
      >
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white rounded-xl">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              {/* Professional Profile Section */}
              <div className="flex items-start space-x-4 flex-1">
                <div className="relative">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 p-0.5">
                    <img
                      src={post.author?.avatar || '/default-avatar.png'}
                      alt={post.author?.username}
                      className="w-full h-full rounded-full object-cover bg-white"
                    />
                  </div>
                  {post.author?.isOnline && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full">
                      <div className="w-full h-full bg-green-400 rounded-full animate-pulse"></div>
                    </div>
                  )}
                  {post.author?.verified && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  {/* User Info Header */}
                  <div className="flex items-center space-x-2 mb-1">
                    <button 
                      onClick={() => onViewProfile?.(post.author?._id)}
                      className="group"
                    >
                      <h3 className="font-bold text-gray-900 hover:text-blue-600 transition-colors group-hover:underline">
                        {post.author?.username || 'Anonymous'}
                      </h3>
                    </button>
                    <div className="flex items-center space-x-1">
                      {post.author?.verified && (
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      )}
                    </div>
                  </div>
                  
                  {/* Professional Title & Company */}
                  {post.author?.title && (
                    <div className="flex items-center space-x-2 mb-1">
                      <Briefcase className="w-3 h-3 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">{post.author.title}</span>
                      {post.author?.company && (
                        <>
                          <span className="text-gray-400">at</span>
                          <span className="text-sm font-medium text-blue-600">{post.author.company}</span>
                        </>
                      )}
                    </div>
                  )}

                  {/* Location & Other Info */}
                  <div className="flex items-center space-x-3 text-xs text-gray-500 mb-2">
                    {post.author?.location && (
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3" />
                        <span>{post.author.location}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{formatTimeAgo(post.createdAt)}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {PRIVACY_OPTIONS.find(option => option.value === post.privacy)?.icon && 
                        React.createElement(PRIVACY_OPTIONS.find(option => option.value === post.privacy).icon, 
                          { className: "w-3 h-3" }
                        )
                      }
                      <span className="capitalize">{post.privacy}</span>
                    </div>
                  </div>

                  {/* Post Category Badge */}
                  {getPostCategory() && (
                    <div className="flex items-center space-x-2">
                      <div className={`inline-flex items-center space-x-1 px-2 py-1 text-xs rounded-full text-white ${getPostCategory().color}`}>
                        {React.createElement(getPostCategory().icon, { className: "w-3 h-3" })}
                        <span>{getPostCategory().label}</span>
                      </div>
                      
                      {/* Mutual Connections Info */}
                      {post.author?.mutualConnections > 0 && (
                        <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                          <Users className="w-3 h-3" />
                          <span>{post.author.mutualConnections} mutual connections</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Menu */}
              <div className="relative" ref={optionsRef}>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="p-2 hover:bg-gray-100 rounded-full"
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                >
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
                
                {/* Options Menu */}
                <AnimatePresence>
                  {showOptionsMenu && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-10 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-20"
                    >
                      {currentUser?._id === post.author?._id ? (
                        <>
                          <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2">
                            <Edit3 className="w-4 h-4" />
                            <span>Edit post</span>
                          </button>
                          <button 
                            onClick={() => {
                              onDelete(post._id);
                              setShowOptionsMenu(false);
                            }}
                            className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2 text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Delete post</span>
                          </button>
                        </>
                      ) : (
                        <>
                          <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2">
                            <Flag className="w-4 h-4" />
                            <span>Report post</span>
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2">
                            <EyeOff className="w-4 h-4" />
                            <span>Hide post</span>
                          </button>
                          <button className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2">
                            <UserMinus className="w-4 h-4" />
                            <span>Unfollow {post.author?.username}</span>
                          </button>
                        </>
                      )}
                      <div className="border-t border-gray-100 my-1"></div>
                      <button 
                        onClick={copyPostLink}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Link className="w-4 h-4" />
                        <span>Copy link</span>
                      </button>
                      <button 
                        onClick={() => setShowShareModal(true)}
                        className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center space-x-2"
                      >
                        <Share className="w-4 h-4" />
                        <span>Share via...</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </CardHeader>

        <CardContent className="pt-3">
          {/* LinkedIn-style Post Content */}
          <div className="px-4">
            {/* Post Title/Summary (if exists) */}
            {post.title && (
              <h2 className="text-lg font-semibold text-gray-900 mb-3 leading-tight">
                {post.title}
              </h2>
            )}
            
            {/* Main Content with Read More */}
            <div className="text-gray-800 leading-relaxed">
              <p className="whitespace-pre-wrap">
                {truncateContent(post.content, 300)}
              </p>
              
              {post.content && post.content.length > 300 && (
                <button
                  onClick={() => setShowReadMore(!showReadMore)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm mt-2"
                >
                  {showReadMore ? 'See less' : 'See more'}
                </button>
              )}
            </div>

            {/* Professional Skills/Technologies Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag, index) => (
                  <motion.span
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full hover:bg-blue-100 cursor-pointer transition-colors border border-blue-200"
                  >
                    #{tag}
                  </motion.span>
                ))}
              </div>
            )}

            {/* Code Language Badge (for code posts) */}
            {post.codeLanguage && (
              <div className="mt-3">
                <span className="px-3 py-1 bg-gray-900 text-white text-sm font-mono rounded-full">
                  {post.codeLanguage}
                </span>
              </div>
            )}

            {/* Professional Achievements/Metrics */}
            {post.achievements && (
              <div className="flex items-center space-x-4 mt-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                <Trophy className="w-5 h-5 text-yellow-600" />
                <div className="text-sm">
                  <span className="font-medium text-gray-900">Achievement Unlocked: </span>
                  <span className="text-gray-700">{post.achievements}</span>
                </div>
              </div>
            )}
          </div>

          {/* Ultra-Advanced Media Carousel */}
          {post.media && post.media.length > 0 && (
            <div className="relative -mx-6">
              <div className="relative overflow-hidden">
                <div 
                  className="flex transition-transform duration-300 ease-in-out"
                  style={{ transform: `translateX(-${currentMediaIndex * 100}%)` }}
                >
                  {post.media.map((media, index) => (
                    <div 
                      key={index} 
                      className="w-full flex-shrink-0 relative"
                      onDoubleClick={handleDoubleClick}
                    >
                      {media.type === 'image' && (
                        <div className="relative">
                          <img
                            src={media.url}
                            alt="Post media"
                            className="w-full h-auto max-h-[500px] object-cover cursor-pointer"
                            onClick={() => setShowFullImage(true)}
                          />
                          {/* Double-click heart animation */}
                          <motion.div
                            key={isLiked ? 'liked' : 'not-liked'}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={isLiked ? { scale: [0, 1.2, 1], opacity: [0, 1, 0] } : {}}
                            transition={{ duration: 0.6 }}
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                          >
                            <Heart className="w-24 h-24 text-white fill-red-500" />
                          </motion.div>
                        </div>
                      )}
                      {media.type === 'video' && (
                        <div className="relative">
                          <video
                            src={media.url}
                            controls
                            className="w-full h-auto max-h-[500px] object-cover"
                            onDoubleClick={handleDoubleClick}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Navigation arrows for multiple media */}
                {post.media.length > 1 && (
                  <>
                    {currentMediaIndex > 0 && (
                      <button
                        onClick={() => handleMediaNavigation('prev')}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all z-10"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    )}
                    {currentMediaIndex < post.media.length - 1 && (
                      <button
                        onClick={() => handleMediaNavigation('next')}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all z-10"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    )}
                    
                    {/* Media indicators */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
                      {post.media.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentMediaIndex(index)}
                          className={`w-2 h-2 rounded-full transition-all ${
                            index === currentMediaIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Code Block */}
          {post.type === 'code' && post.codeSnippet && (
            <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm">
                  {post.codeSnippet.language || 'code'}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigator.clipboard.writeText(post.codeSnippet.code)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <pre className="text-green-400 text-sm overflow-x-auto">
                <code>{post.codeSnippet.code}</code>
              </pre>
            </div>
          )}

          {/* Separate Connection Actions Section */}
          {currentUser?._id !== post.author?._id && (
            <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-purple-50 border-t border-blue-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  {/* Connection Status Button */}
                  {(() => {
                    const connectionStatus = post.author?.connectionStatus || 'not-connected';
                    const isPending = pendingConnections.has(post.author?._id);
                    
                    switch (connectionStatus) {
                      case 'connected':
                        return (
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center space-x-2 text-green-600 bg-green-100 px-3 py-1 rounded-full">
                              <UserCheck className="w-4 h-4" />
                              <span className="text-sm font-medium">Connected</span>
                            </div>
                            <button
                              onClick={() => onDisconnect?.(post.author?._id)}
                              className="text-gray-500 hover:text-red-600 text-sm font-medium transition-colors"
                            >
                              Disconnect
                            </button>
                          </div>
                        );
                      case 'pending':
                        return (
                          <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-100 px-3 py-1 rounded-full">
                            <Clock className="w-4 h-4" />
                            <span className="text-sm font-medium">Request Pending</span>
                          </div>
                        );
                      default:
                        return (
                          <button
                            onClick={() => onConnect?.(post.author?._id)}
                            disabled={isPending}
                            className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                              isPending 
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                                : 'bg-blue-600 text-white hover:bg-blue-700 hover:shadow-md'
                            }`}
                          >
                            <UserPlus className="w-4 h-4" />
                            <span>{isPending ? 'Connecting...' : 'Connect'}</span>
                          </button>
                        );
                    }
                  })()}
                </div>
                
                {/* Additional Professional Actions */}
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => onViewProfile?.(post.author?._id)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span>View Profile</span>
                  </button>
                  <button
                    onClick={() => onMessageUser?.(post.author?._id)}
                    className="flex items-center space-x-1 text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Message</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* LinkedIn-style Professional Engagement */}
          <div className="px-4 py-2">
            {/* Reaction Summary with Professional Icons */}
            {(likesCount > 0 || (post.reactions && Object.keys(post.reactions).length > 0)) && (
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  {/* Reaction Icons */}
                  <div className="flex -space-x-1">
                    {post.reactions && Object.entries(post.reactions).slice(0, 3).map(([type, count]) => {
                      if (count > 0) {
                        const reaction = EMOJI_REACTIONS[type] || EMOJI_REACTIONS.like;
                        return (
                          <div
                            key={type}
                            className={`w-6 h-6 rounded-full ${reaction.bgColor} border-2 border-white flex items-center justify-center text-xs`}
                          >
                            {reaction.emoji}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                  
                  {/* Engagement Text */}
                  <button 
                    className="text-sm text-gray-700 hover:text-blue-600 hover:underline transition-colors"
                    onClick={() => setShowInsights(!showInsights)}
                  >
                    {formatEngagementText(likesCount, 'reaction')}
                    {post.impressions && (
                      <span className="text-gray-500"> • {post.impressions.toLocaleString()} impressions</span>
                    )}
                  </button>
                </div>

                {/* Professional Metrics */}
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  {post.commentsCount > 0 && (
                    <button 
                      className="hover:text-blue-600 transition-colors"
                      onClick={() => setShowComments(!showComments)}
                    >
                      {formatEngagementText(post.commentsCount, 'comment')}
                    </button>
                  )}
                  {post.sharesCount > 0 && (
                    <span>{formatEngagementText(post.sharesCount, 'share')}</span>
                  )}
                </div>
              </div>
            )}

            {/* Professional Insights (LinkedIn-style) */}
            <AnimatePresence>
              {showInsights && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200"
                >
                  <div className="flex items-center space-x-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-sm text-gray-900">Post Performance</span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{post.views || '247'}</div>
                      <div className="text-gray-600">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{post.engagementRate || '8.3%'}</div>
                      <div className="text-gray-600">Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="font-semibold text-gray-900">{post.clicks || '15'}</div>
                      <div className="text-gray-600">Clicks</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* LinkedIn-style Professional Action Bar */}
          <div className="px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1">
                {/* Like Button with Professional Styling */}
                <div className="relative">
                  <button
                    onClick={() => handleReaction('like')}
                    onMouseEnter={() => setShowReactions(true)}
                    onMouseLeave={() => setShowReactions(false)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 hover:bg-gray-50 font-medium text-sm ${
                      isLiked ? 'text-blue-600' : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    <motion.div
                      animate={{ scale: isLiked ? [1, 1.15, 1] : 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ThumbsUp className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                    </motion.div>
                    <span>Like</span>
                  </button>

                  {/* LinkedIn-style Reaction Picker */}
                  <AnimatePresence>
                    {showReactions && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-xl p-2 flex space-x-1 z-20"
                        onMouseEnter={() => setShowReactions(true)}
                        onMouseLeave={() => setShowReactions(false)}
                      >
                        {Object.entries(EMOJI_REACTIONS).map(([type, reaction]) => (
                          <motion.button
                            key={type}
                            whileHover={{ scale: 1.2, y: -5 }}
                            whileTap={{ scale: 1.1 }}
                            onClick={() => handleReaction(type)}
                            className={`flex flex-col items-center p-2 rounded-xl hover:${reaction.bgColor} transition-all duration-200 group`}
                            title={reaction.label}
                          >
                            <span className="text-2xl mb-1">{reaction.emoji}</span>
                            <span className={`text-xs font-medium ${reaction.color} opacity-0 group-hover:opacity-100 transition-opacity`}>
                              {reaction.label}
                            </span>
                          </motion.button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Comment Button */}
                <button
                  onClick={() => setShowComments(!showComments)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-gray-700 hover:text-blue-600 hover:bg-gray-50 font-medium text-sm"
                >
                  <MessageCircle className="w-5 h-5" />
                  <span>Comment</span>
                </button>

                {/* Share Button */}
                <button
                  onClick={() => setShowShareModal(true)}
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-gray-700 hover:text-green-600 hover:bg-gray-50 font-medium text-sm"
                >
                  <Share2 className="w-5 h-5" />
                  <span>Share</span>
                </button>

                {/* Send/Message Button (LinkedIn feature) */}
                <button
                  className="flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 text-gray-700 hover:text-purple-600 hover:bg-gray-50 font-medium text-sm"
                >
                  <Send className="w-5 h-5" />
                  <span>Send</span>
                </button>
              </div>

              <div className="flex items-center space-x-2">
                {/* Save Button */}
                <button
                  onClick={() => {
                    setIsBookmarked(!isBookmarked);
                    onBookmark(post._id);
                  }}
                  className={`p-2 rounded-lg transition-all duration-200 hover:bg-gray-50 ${
                    isBookmarked ? 'text-yellow-600' : 'text-gray-700 hover:text-yellow-600'
                  }`}
                  title={isBookmarked ? 'Remove from saved' : 'Save post'}
                >
                  <Bookmark className={`w-5 h-5 ${isBookmarked ? 'fill-current' : ''}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Comments Section */}
          <div className="px-4">
            {/* Enhanced Comment Input - Only show when comments are toggled */}
            <AnimatePresence>
              {showComments && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="border-t border-gray-100 pt-3"
                >
                  <div className="flex items-start space-x-3 pb-3">
                    <img
                      src={currentUser?.avatar || '/default-avatar.png'}
                      alt="Your avatar"
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="bg-gray-50 rounded-lg p-3 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all">
                        <textarea
                          placeholder="Write a thoughtful comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleComment();
                            }
                          }}
                          className="w-full resize-none border-none outline-none text-sm placeholder-gray-400 bg-transparent"
                          rows={2}
                          style={{
                            minHeight: '40px',
                            maxHeight: '120px'
                          }}
                        />
                        {newComment.trim() && (
                          <div className="flex justify-between items-center mt-2 pt-2 border-t border-gray-200">
                            <div className="flex items-center space-x-2">
                              <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <Smile className="w-4 h-4" />
                              </button>
                              <button className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100">
                                <Image className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              onClick={handleComment}
                              className="bg-blue-600 text-white px-4 py-1.5 rounded-full font-medium text-sm hover:bg-blue-700 transition-colors"
                            >
                              Comment
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Comments List */}
            <AnimatePresence>
              {showComments && post.comments && post.comments.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="space-y-3 pb-3"
                >
                  {post.comments.map((comment, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex space-x-3 group"
                    >
                      <img
                        src={comment.author?.avatar || '/default-avatar.png'}
                        alt={comment.author?.username}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-start space-x-2">
                          <div className="flex-1">
                            <div className="inline-block">
                              <span className="font-medium text-sm text-gray-900 mr-2">
                                {comment.author?.username}
                              </span>
                              <span className="text-sm text-gray-800">{comment.content}</span>
                            </div>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-xs text-gray-500">
                                {formatTimeAgo(comment.createdAt)}
                              </span>
                              <button className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                                Like
                              </button>
                              <button className="text-xs text-gray-500 hover:text-gray-700 font-medium">
                                Reply
                              </button>
                            </div>
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-1 hover:bg-gray-100 rounded">
                              <Heart className="w-3 h-3 text-gray-400" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </motion.div>

    {/* Enhanced Share Modal */}
    {showShareModal && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-transparent flex items-center justify-center z-50"
        onClick={() => setShowShareModal(false)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white p-6 rounded-lg max-w-md w-full mx-4"
          onClick={e => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold">Share this post</h3>
            <button
              onClick={() => setShowShareModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-2">
            <button 
              onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}/post/${post._id}`);
                success('Link copied to clipboard!');
                setShowShareModal(false);
              }}
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Copy className="w-5 h-5 text-blue-600" />
              <div className="text-left">
                <div className="font-medium">Copy link</div>
                <div className="text-sm text-gray-500">Share via any platform</div>
              </div>
            </button>
            <button 
              onClick={() => {
                const subject = `Check out this post from ${post.author?.username}`;
                const body = `${post.content}\n\nView full post: ${window.location.origin}/post/${post._id}`;
                window.open(`mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`);
                setShowShareModal(false);
              }}
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Mail className="w-5 h-5 text-green-600" />
              <div className="text-left">
                <div className="font-medium">Share via email</div>
                <div className="text-sm text-gray-500">Send to contacts</div>
              </div>
            </button>
            <button 
              onClick={() => {
                const text = `${post.content} - ${window.location.origin}/post/${post._id}`;
                if (navigator.share) {
                  navigator.share({
                    title: 'Coding Society Post',
                    text: text,
                    url: `${window.location.origin}/post/${post._id}`
                  });
                } else {
                  navigator.clipboard.writeText(text);
                  success('Post content copied!');
                }
                setShowShareModal(false);
              }}
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Send className="w-5 h-5 text-purple-600" />
              <div className="text-left">
                <div className="font-medium">Send message</div>
                <div className="text-sm text-gray-500">Share directly</div>
              </div>
            </button>
            <button 
              onClick={() => {
                const twitterText = `Check out this amazing post: ${post.content.substring(0, 200)}${post.content.length > 200 ? '...' : ''} ${window.location.origin}/post/${post._id}`;
                window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(twitterText)}`);
                setShowShareModal(false);
              }}
              className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <ExternalLink className="w-5 h-5 text-blue-400" />
              <div className="text-left">
                <div className="font-medium">Share on Twitter</div>
                <div className="text-sm text-gray-500">Post to timeline</div>
              </div>
            </button>
          </div>
        </motion.div>
      </motion.div>
    )}

    {/* Full Screen Image Modal */}
    {showFullImage && (
      <div className="fixed inset-0 bg-transparent flex items-center justify-center z-50">
        <div className="relative max-w-4xl max-h-full">
          <img
            src={post.media[currentMediaIndex]?.url}
            alt="Full size"
            className="max-w-full max-h-full object-contain"
          />
          <button
            onClick={() => setShowFullImage(false)}
            className="absolute top-4 right-4 text-white hover:text-gray-300"
          >
            <X className="w-8 h-8" />
          </button>
        </div>
      </div>
    )}
    </>
  );
};



// Main Feed Component
const UltraAdvancedFeedPage = () => {
  // State management
  const [posts, setPosts] = useState([]);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [selectedTags, setSelectedTags] = useState([]);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showAuthOverlay, setShowAuthOverlay] = useState(false);
  
  // Connection management state
  const [connections, setConnections] = useState(new Map());
  const [pendingConnections, setPendingConnections] = useState(new Set());
  const [showConnectionModal, setShowConnectionModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Ultra-Advanced Settings State
  const [showSettings, setShowSettings] = useState(false);
  const [showSavedPosts, setShowSavedPosts] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showGallery, setShowGallery] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  const { user } = useAuth();
  const { success, error: notifyError, warning } = useNotifications();
  const navigate = useNavigate();
  const socketRef = useRef(null);
  const loadMoreRef = useRef();
  const isLoadMoreInView = useInView(loadMoreRef);

  // Initialize socket connection for real-time updates
  useEffect(() => {
    if (user) {
      const token = localStorage.getItem('authToken');
      if (token) {
        try {
          socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
            auth: {
              token: token
            },
            transports: ['websocket', 'polling'],
            timeout: 10000,
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000
          });

          // Socket event listeners
          socketRef.current.on('connect', () => {
            console.log('Socket connected successfully');
          });

          socketRef.current.on('connect_error', (error) => {
            console.warn('Socket connection error:', error);
            // Don't show error notifications for socket connection issues
          });

          socketRef.current.on('disconnect', (reason) => {
            console.log('Socket disconnected:', reason);
          });

          socketRef.current.on('newPost', (post) => {
            setPosts(prev => [post, ...prev]);
            success(`New post from ${post.author?.username}!`);
          });

          socketRef.current.on('postUpdated', (updatedPost) => {
            setPosts(prev => 
              prev.map(post => 
                post._id === updatedPost._id ? updatedPost : post
              )
            );
          });

          socketRef.current.on('postDeleted', (postId) => {
            setPosts(prev => prev.filter(post => post._id !== postId));
          });
        } catch (error) {
          console.error('Failed to initialize socket:', error);
        }
      }

      return () => {
        if (socketRef.current) {
          socketRef.current.disconnect();
          socketRef.current = null;
        }
      };
    }
  }, [user, success]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    if (!autoRefresh || !user) return;
    
    const interval = setInterval(() => {
      if (!loading && !isLoadingMore) {
        fetchPosts(1, false);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh, user, loading, isLoadingMore]);

  // Fetch posts with pagination
  const fetchPosts = useCallback(async (page = 1, append = false) => {
    try {
      if (page === 1) setLoading(true);
      else setIsLoadingMore(true);
      
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setError('Please log in to view posts');
        setLoading(false);
        setIsLoadingMore(false);
        return;
      }
      
      const queryParams = new URLSearchParams({
        page,
        limit: 10,
        sort: '-createdAt',
        ...(selectedFilter !== 'all' && { filter: selectedFilter }),
        ...(selectedTags.length > 0 && { tags: selectedTags.join(',') }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/feed?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        const newPosts = data.posts || [];
        
        if (append) {
          setPosts(prev => [...prev, ...newPosts]);
        } else {
          setPosts(newPosts);
        }
        
        setHasNextPage(data.hasNextPage || false);
        setCurrentPage(data.currentPage || page);
      } else if (response.status === 401) {
        // Handle authentication error
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
        setError('Please log in to view posts');
        setShowAuthOverlay(true);
        notifyError('Authentication expired. Please log in again.');
        return;
      } else {
        throw new Error('Failed to fetch posts');
      }
    } catch (err) {
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        console.warn('Connection error - Using sample data:', err);
        // Use sample data when server is offline
        if (append) {
          setPosts(prev => [...prev]);
        } else {
          setPosts(SAMPLE_POSTS);
        }
        setHasNextPage(false);
        setError(null); // Clear error and show sample posts instead
      } else {
        // Even for other errors, show sample posts instead of error
        setPosts(SAMPLE_POSTS);
        setError(null);
        console.warn('Failed to load posts, using sample data:', err);
      }
      // Don't show error notifications for connection issues to avoid spam
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
      setRefreshing(false);
    }
  }, [selectedFilter, selectedTags, searchQuery, notifyError]);

  // Fetch stories
  const fetchStories = useCallback(async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        console.warn('No authentication token found for stories');
        return;
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/stories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStories(data.stories || []);
      } else if (response.status === 401) {
        // Handle authentication error for stories
        console.warn('Authentication failed for stories');
        localStorage.removeItem('authToken');
        localStorage.removeItem('user');
      } else {
        console.warn('Failed to fetch stories:', response.status);
      }
    } catch (err) {
      console.error('Fetch stories error:', err);
    }
  }, []);

  // Load more posts when scrolling
  useEffect(() => {
    if (isLoadMoreInView && hasNextPage && !isLoadingMore && !loading) {
      fetchPosts(currentPage + 1, true);
    }
  }, [isLoadMoreInView, hasNextPage, isLoadingMore, loading, currentPage, fetchPosts]);

  // Load data on mount and filter changes
  useEffect(() => {
    if (user) {
      fetchPosts(1, false);
      fetchStories();
    }
  }, [user, selectedFilter, selectedTags, searchQuery]);

  // Handle post creation
  const handleCreatePost = async (postData) => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setShowAuthOverlay(true);
        notifyError('Please log in to create posts');
        return;
      }

      // Validate required fields
      if (!postData.content?.trim()) {
        notifyError('Post content is required');
        return;
      }
      
      // Create FormData to handle file uploads properly
      const formData = new FormData();
      
      // Add basic post data
      if (postData.title?.trim()) formData.append('title', postData.title.trim());
      formData.append('content', postData.content.trim());
      formData.append('type', postData.type || 'text');
      if (postData.category?.trim()) formData.append('category', postData.category.trim());
      if (postData.tags && postData.tags.length > 0) {
        formData.append('tags', postData.tags.join(','));
      }
      formData.append('privacy', postData.privacy || 'public');
      if (postData.codeLanguage?.trim()) formData.append('codeLanguage', postData.codeLanguage.trim());
      
      // Handle poll data
      if (postData.type === 'poll' && postData.poll?.options?.length > 0) {
        formData.append('pollOptions', JSON.stringify(postData.poll.options));
      }
      
      // Handle file uploads if any
      if (postData.media && postData.media.length > 0) {
        postData.media.forEach(file => {
          formData.append('files', file);
        });
      }

      console.log('Making request to:', `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/feed`);
      console.log('With token:', token ? 'Present' : 'Missing');

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/feed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type for FormData - let browser set it with boundary
        },
        body: formData
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log('Success response:', data);
        setPosts(prev => [data.post, ...prev]);
        success('Post created successfully!');
      } else {
        let errorMessage = 'Failed to create post';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
          console.error('Error response:', errorData);
        } catch (parseError) {
          console.error('Failed to parse error response:', parseError);
          errorMessage = `Server error (${response.status})`;
        }
        throw new Error(errorMessage);
      }
    } catch (err) {
      console.error('Post creation error:', err);
      if (err.name === 'TypeError' && err.message.includes('Failed to fetch')) {
        notifyError('Unable to connect to server. Please check if the backend is running.');
      } else {
        notifyError(`Failed to create post: ${err.message}`);
      }
    }
  };

  // Handle post reactions
  const handleReact = useCallback(async (postId, reactionType) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/feed/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reactionType })
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(prev => 
          prev.map(post => 
            post._id === postId ? { ...post, reactions: data.reactions, userReaction: data.userReaction } : post
          )
        );
      }
    } catch (err) {
      console.error('React error:', err);
    }
  }, []);

  // Handle comments
  const handleComment = useCallback(async (postId, content) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/feed/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ content })
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(prev => 
          prev.map(post => 
            post._id === postId ? { ...post, comments: data.comments, commentsCount: data.commentsCount } : post
          )
        );
      }
    } catch (err) {
      console.error('Comment error:', err);
    }
  }, []);

  // Handle share
  const handleShare = useCallback(async (postId) => {
    try {
      await navigator.share({
        title: 'Check out this post!',
        url: `${window.location.origin}/post/${postId}`
      });
    } catch (err) {
      // Fallback to clipboard
      navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`);
      success('Link copied to clipboard!');
    }
  }, [success]);

  // Handle bookmark
  const handleBookmark = useCallback(async (postId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/feed/${postId}/bookmark`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        success('Post bookmarked!');
      }
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  }, [success]);

  // Connection Management Functions
  const handleConnect = useCallback(async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      setPendingConnections(prev => new Set([...prev, userId]));
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/follow/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update connection status in posts
        setPosts(prev => prev.map(post => 
          post.author._id === userId 
            ? { ...post, author: { ...post.author, connectionStatus: 'pending' } }
            : post
        ));
        
        success(data.message || 'Connection request sent!');
      } else {
        throw new Error('Failed to send connection request');
      }
    } catch (err) {
      console.error('Connection error:', err);
      notifyError('Failed to send connection request');
    } finally {
      setPendingConnections(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    }
  }, [success, notifyError]);

  const handleDisconnect = useCallback(async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/follow/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update connection status in posts
        setPosts(prev => prev.map(post => 
          post.author._id === userId 
            ? { ...post, author: { ...post.author, connectionStatus: 'not-connected' } }
            : post
        ));
        
        success(data.message || 'Connection removed');
      } else {
        throw new Error('Failed to remove connection');
      }
    } catch (err) {
      console.error('Disconnect error:', err);
      notifyError('Failed to remove connection');
    }
  }, [success, notifyError]);

  const handleViewProfile = useCallback((userId) => {
    navigate(`/profile/${userId}`);
  }, [navigate]);

  const handleMessageUser = useCallback((userId) => {
    // Future implementation for messaging
    success('Messaging feature coming soon!');
  }, [success]);

  // Handle post deletion
  const handleDelete = useCallback(async (postId) => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/feed/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setPosts(prev => prev.filter(post => post._id !== postId));
        success('Post deleted successfully!');
      }
    } catch (err) {
      notifyError('Failed to delete post');
      console.error('Delete error:', err);
    }
  }, [success, notifyError]);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPosts(1, false);
  }, [fetchPosts]);

  // Handle tag selection
  const handleTagSelect = useCallback((tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  }, []);

  // Handle search with debouncing
  const debouncedSearch = useMemo(() => {
    let timeoutId;
    return (query) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSearchQuery(query);
      }, 500);
    };
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 relative">
        <div className="text-center py-8">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Authentication Required</h2>
            <p className="text-gray-600 mb-4">Please log in to view the feed</p>
            <button
              onClick={() => setShowAuthOverlay(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
            >
              Login
            </button>
          </div>
        </div>
        
        {/* Authentication Overlay */}
        {showAuthOverlay && (
          <AuthenticationOverlay
            onAuthenticated={(token, userData) => {
              localStorage.setItem('authToken', token);
              localStorage.setItem('user', JSON.stringify(userData));
              // The auth context should pick this up and re-render
              window.location.reload();
            }}
            onClose={() => setShowAuthOverlay(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 relative">
      {/* No dark overlay - let feed show as background */}
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Search Box instead of Feed text */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="Search posts, people, topics..."
                  onChange={(e) => debouncedSearch(e.target.value)}
                  className="pl-10 py-3 bg-gray-50 border-gray-200 focus:bg-white text-lg"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                onClick={() => setShowCreatePost(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="w-4 h-4" />
                <span>Create Post</span>
              </Button>
              
              {/* Settings Button */}
              <div className="relative">
                <Button
                  onClick={() => setShowSettings(!showSettings)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                </Button>
                
                {/* Settings Dropdown */}
                <AnimatePresence>
                  {showSettings && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute right-0 top-12 w-64 bg-white border border-gray-200 rounded-lg shadow-lg py-2 z-50"
                    >
                      <button 
                        onClick={() => {
                          setShowSavedPosts(true);
                          setShowSettings(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center space-x-3"
                      >
                        <Bookmark className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-medium">Saved Posts</div>
                          <div className="text-gray-500 text-xs">View your saved posts</div>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => {
                          setShowNotifications(true);
                          setShowSettings(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center space-x-3"
                      >
                        <Bell className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-medium">Notifications</div>
                          <div className="text-gray-500 text-xs">Manage your notifications</div>
                        </div>
                      </button>
                      
                      <button 
                        onClick={() => {
                          setShowGallery(true);
                          setShowSettings(false);
                        }}
                        className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 flex items-center space-x-3"
                      >
                        <Image className="w-5 h-5 text-gray-600" />
                        <div>
                          <div className="font-medium">Gallery</div>
                          <div className="text-gray-500 text-xs">View, edit & delete your posts</div>
                        </div>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Clean */}
          <div className="lg:col-span-1 space-y-6">
            {/* People You May Know */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span>People You May Know</span>
              </h3>
              <div className="space-y-3">
                {[
                  {
                    id: 'suggest-1',
                    name: 'Emma Wilson',
                    title: 'Product Designer',
                    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150',
                    mutualConnections: 8,
                    company: 'Design Studio'
                  },
                  {
                    id: 'suggest-2',
                    name: 'James Chen',
                    title: 'Backend Developer',
                    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
                    mutualConnections: 12,
                    company: 'TechCorp'
                  },
                  {
                    id: 'suggest-3',
                    name: 'Maya Patel',
                    title: 'Data Scientist',
                    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b332c988?w=150',
                    mutualConnections: 5,
                    company: 'AI Labs'
                  }
                ].map((person) => (
                  <motion.div
                    key={person.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <img
                      src={person.avatar}
                      alt={person.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{person.name}</p>
                      <p className="text-xs text-gray-500 truncate">{person.title}</p>
                      <p className="text-xs text-gray-400">{person.mutualConnections} mutual</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleConnect(person.id)}
                      className="text-xs px-3 py-1 border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <UserPlus className="w-3 h-3 mr-1" />
                      Connect
                    </Button>
                  </motion.div>
                ))}
                <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium pt-2">
                  See all suggestions
                </button>
              </div>
            </Card>

            {/* Trending Topics */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span>Trending Topics</span>
              </h3>
              <div className="space-y-2">
                {[
                  { tag: 'React19', posts: 1247 },
                  { tag: 'WebDevelopment', posts: 892 },
                  { tag: 'TypeScript', posts: 654 },
                  { tag: 'AI', posts: 543 },
                  { tag: 'JavaScript', posts: 421 }
                ].map((topic, index) => (
                  <motion.button
                    key={topic.tag}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => handleTagSelect(topic.tag)}
                    className="w-full text-left p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-900">#{topic.tag}</span>
                      <span className="text-xs text-gray-500">{topic.posts} posts</span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </Card>

            {/* Quick Actions */}
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => setShowCreatePost(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Post
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => navigate('/profile')}
                >
                  <User className="w-4 h-4 mr-2" />
                  View Profile
                </Button>
                <Button
                  variant="outline"
                  className="w-full justify-start text-sm"
                  onClick={() => setShowSavedPosts(true)}
                >
                  <Bookmark className="w-4 h-4 mr-2" />
                  Saved Posts
                </Button>
              </div>
            </Card>

            {/* Selected Tags */}
            {selectedTags.length > 0 && (
              <Card className="p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Active Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedTags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
                    >
                      <span>#{tag}</span>
                      <button
                        onClick={() => handleTagSelect(tag)}
                        className="text-blue-400 hover:text-blue-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Stories (if available) */}
            {stories.length > 0 && (
              <Card className="mb-6 p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Stories</h3>
                <div className="flex space-x-4 overflow-x-auto pb-2">
                  {stories.map((story, index) => (
                    <div key={index} className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 p-1">
                        <img
                          src={story.author?.avatar || '/default-avatar.png'}
                          alt={story.author?.username}
                          className="w-full h-full rounded-full object-cover border-2 border-white"
                        />
                      </div>
                      <p className="text-xs text-center mt-2 max-w-[64px] truncate">
                        {story.author?.username}
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Demo Mode Indicator - Only show if we have sample posts and no real connection */}
            {posts === SAMPLE_POSTS && (
              <Card className="mb-6 p-4 border-blue-200 bg-blue-50">
                <div className="flex items-center space-x-3">
                  <Info className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-blue-800 text-sm">
                      <strong>Demo Mode:</strong> Backend server is offline. Showing sample posts.
                    </p>
                  </div>
                  <Button 
                    onClick={() => fetchPosts(1, false)} 
                    variant="outline" 
                    size="sm" 
                    className="text-blue-600 border-blue-300 hover:bg-blue-100"
                  >
                    Retry Connection
                  </Button>
                </div>
              </Card>
            )}

            {/* Loading State */}
            {loading && posts.length === 0 && (
              <div className="space-y-6">
                {[...Array(3)].map((_, index) => (
                  <PostSkeleton key={index} />
                ))}
              </div>
            )}

            {/* Posts */}
            {posts.length > 0 && (
              <div className="space-y-6">
                {posts.map((post) => (
                  <EnhancedPost
                    key={post._id}
                    post={post}
                    onReact={handleReact}
                    onComment={handleComment}
                    onShare={handleShare}
                    onBookmark={handleBookmark}
                    onDelete={handleDelete}
                    onConnect={handleConnect}
                    onDisconnect={handleDisconnect}
                    onViewProfile={handleViewProfile}
                    onMessageUser={handleMessageUser}
                    pendingConnections={pendingConnections}
                    currentUser={user}
                  />
                ))}

                {/* Load More Trigger */}
                {hasNextPage && (
                  <div ref={loadMoreRef} className="flex justify-center py-8">
                    {isLoadingMore ? (
                      <div className="flex items-center space-x-2 text-gray-600">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading more posts...</span>
                      </div>
                    ) : (
                      <div className="text-gray-400">Scroll for more posts</div>
                    )}
                  </div>
                )}

                {/* End of Posts */}
                {!hasNextPage && posts.length > 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="w-8 h-8 mx-auto mb-2" />
                    <p>You've reached the end of the feed!</p>
                  </div>
                )}
              </div>
            )}

            {/* Empty State */}
            {!loading && posts.length === 0 && !error && (
              <Card className="p-12 text-center">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <MessageCircle className="w-12 h-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No posts yet</h3>
                  <p className="text-gray-600 mb-6">
                    Be the first to share something with the community!
                  </p>
                  <Button 
                    onClick={() => setShowCreatePost(true)}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    Create Your First Post
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Create Post Modal */}
      <AnimatePresence>
        {showCreatePost && (
          <CreatePostModal
            isOpen={showCreatePost}
            onClose={() => setShowCreatePost(false)}
            onSubmit={handleCreatePost}
            currentUser={user}
          />
        )}
      </AnimatePresence>

      {/* Saved Posts Modal */}
      <AnimatePresence>
        {showSavedPosts && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-transparent flex items-center justify-center z-50"
            onClick={() => setShowSavedPosts(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bookmark className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-semibold">Saved Posts</h2>
                  </div>
                  <button
                    onClick={() => setShowSavedPosts(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="text-center py-12">
                  <Bookmark className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No saved posts yet</h3>
                  <p className="text-gray-500">Posts you save will appear here for easy access later.</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Notifications Modal */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-transparent flex items-center justify-center z-50"
            onClick={() => setShowNotifications(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-semibold">Notifications</h2>
                  </div>
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm"><strong>John Doe</strong> liked your post</p>
                      <p className="text-xs text-gray-500">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm"><strong>Jane Smith</strong> commented on your post</p>
                      <p className="text-xs text-gray-500">1 hour ago</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                    <div className="flex-1">
                      <p className="text-sm"><strong>Mike Johnson</strong> started following you</p>
                      <p className="text-xs text-gray-500">3 hours ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Modal */}
      <AnimatePresence>
        {showGallery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-transparent flex items-center justify-center z-50"
            onClick={() => setShowGallery(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-hidden"
              onClick={e => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Image className="w-6 h-6 text-blue-600" />
                    <h2 className="text-xl font-semibold">Your Gallery</h2>
                  </div>
                  <button
                    onClick={() => setShowGallery(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {posts.filter(post => post.author?._id === user?._id).map((post) => (
                    <div key={post._id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="text-sm text-gray-800 line-clamp-2">{post.content}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {new Date(post.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex space-x-1 ml-2">
                          <button className="p-1 text-gray-400 hover:text-blue-600">
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button className="p-1 text-gray-400 hover:text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      {post.media && post.media.length > 0 && (
                        <div className="grid grid-cols-2 gap-1">
                          {post.media.slice(0, 4).map((media, index) => (
                            <div key={index} className="aspect-square bg-gray-200 rounded overflow-hidden">
                              {media.type === 'image' && (
                                <img
                                  src={media.url}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                {posts.filter(post => post.author?._id === user?._id).length === 0 && (
                  <div className="text-center py-12">
                    <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No posts yet</h3>
                    <p className="text-gray-500">Your posts will appear here. Start creating!</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Authentication Overlay */}
      {showAuthOverlay && (
        <AuthenticationOverlay
          onAuthenticated={(token, userData) => {
            localStorage.setItem('authToken', token);
            localStorage.setItem('user', JSON.stringify(userData));
            setError(null);
            setShowAuthOverlay(false);
            // Refresh the feed
            fetchPosts(1, false);
          }}
          onClose={() => setShowAuthOverlay(false)}
        />
      )}
    </div>
  );
};

export default UltraAdvancedFeedPage;