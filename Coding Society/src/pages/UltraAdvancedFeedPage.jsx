import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';
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
  Meh
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { io } from 'socket.io-client';

const REACTION_EMOJIS = {
  like: { icon: ThumbsUp, emoji: '👍', label: 'Like' },
  love: { icon: Heart, emoji: '❤️', label: 'Love' },
  laugh: { icon: Smile, emoji: '😂', label: 'Laugh' },
  wow: { icon: Zap, emoji: '😮', label: 'Wow' },
  sad: { icon: Frown, emoji: '😢', label: 'Sad' },
  angry: { icon: Meh, emoji: '😡', label: 'Angry' }
};

const PRIVACY_OPTIONS = [
  { value: 'public', icon: Globe, label: 'Public', description: 'Anyone can see this post' },
  { value: 'followers', icon: Users, label: 'Followers', description: 'Only your followers can see this' },
  { value: 'friends', icon: UserPlus, label: 'Friends', description: 'Only friends can see this' },
  { value: 'private', icon: Lock, label: 'Only me', description: 'Only you can see this post' }
];

const POST_TYPES = [
  { id: 'text', label: 'Text', icon: FileText },
  { id: 'image', label: 'Photo', icon: Image },
  { id: 'video', label: 'Video', icon: Video },
  { id: 'code', label: 'Code', icon: Code }
];

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
  const [newPost, setNewPost] = useState({
    content: '',
    type: 'text',
    privacy: 'public',
    tags: [],
    media: []
  });

  const { user } = useAuth();
  const { success, error: notifyError, warning } = useNotifications();
  const socketRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    if (user) {
      socketRef.current = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
        auth: {
          token: localStorage.getItem('token')
        }
      });

      // Socket event listeners
      socketRef.current.on('newPost', (post) => {
        setPosts(prev => [post, ...prev]);
      });

      socketRef.current.on('postUpdated', (updatedPost) => {
        setPosts(prev => 
          prev.map(post => 
            post._id === updatedPost._id ? updatedPost : post
          )
        );
      });

      return () => {
        socketRef.current?.disconnect();
      };
    }
  }, [user]);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const queryParams = new URLSearchParams({
        limit: 20,
        sort: '-createdAt',
        ...(selectedFilter !== 'all' && { type: selectedFilter }),
        ...(selectedTags.length > 0 && { tags: selectedTags.join(',') }),
        ...(searchQuery && { search: searchQuery })
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/feed?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(data.posts || []);
      } else {
        throw new Error('Failed to fetch posts');
      }
    } catch (err) {
      setError('Failed to load posts');
      notifyError('Failed to load posts');
      console.error('Fetch posts error:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedFilter, selectedTags, searchQuery, notifyError]);

  // Fetch stories
  const fetchStories = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/stories`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStories(data.stories || []);
      }
    } catch (err) {
      console.error('Fetch stories error:', err);
    }
  }, []);

  // Load data on mount
  useEffect(() => {
    if (user) {
      fetchPosts();
      fetchStories();
    }
  }, [user, fetchPosts, fetchStories]);

  // Handle post creation
  const handleCreatePost = async () => {
    if (!newPost.content.trim() && newPost.media.length === 0) {
      warning('Please add some content or media');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const formData = new FormData();
      
      formData.append('content', newPost.content);
      formData.append('type', newPost.type);
      formData.append('privacy', newPost.privacy);
      formData.append('tags', JSON.stringify(newPost.tags));

      newPost.media.forEach(file => {
        formData.append('media', file);
      });

      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/feed`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(prev => [data.post, ...prev]);
        setNewPost({
          content: '',
          type: 'text',
          privacy: 'public',
          tags: [],
          media: []
        });
        setShowCreatePost(false);
        success('Post created successfully!');
      } else {
        throw new Error('Failed to create post');
      }
    } catch (err) {
      notifyError('Failed to create post');
      console.error('Post creation error:', err);
    }
  };

  // Handle file upload
  const handleFileUpload = (files) => {
    const fileArray = Array.from(files);
    setNewPost(prev => ({
      ...prev,
      media: [...prev.media, ...fileArray]
    }));
  };

  // Handle reaction
  const handleReaction = async (postId, reaction) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/feed/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reaction })
      });

      if (response.ok) {
        const data = await response.json();
        setPosts(prev => 
          prev.map(post => 
            post._id === postId ? data.post : post
          )
        );
      }
    } catch (err) {
      console.error('Reaction error:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Feed</h1>
          <p className="text-gray-600">Share your coding journey with the community</p>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search posts, users, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setShowCreatePost(true)}
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Post
            </Button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'text', 'image', 'video', 'code'].map((filter) => (
              <Button
                key={filter}
                variant={selectedFilter === filter ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter(filter)}
                className="flex-shrink-0 capitalize"
              >
                {filter}
              </Button>
            ))}
          </div>
        </div>

        {/* Stories Section */}
        {stories.length > 0 && (
          <div className="mb-6">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {stories.map((story) => (
                <div key={story._id} className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-0.5">
                    <img
                      src={story.user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${story.user.username}`}
                      alt={story.user.name}
                      className="w-full h-full rounded-full object-cover bg-white p-0.5"
                    />
                  </div>
                  <p className="text-xs text-center mt-1 max-w-16 truncate">{story.user.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No posts yet</h3>
              <p className="text-gray-600 mb-4">Be the first to share something with the community!</p>
              <Button onClick={() => setShowCreatePost(true)} className="bg-blue-500 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Post
              </Button>
            </Card>
          ) : (
            posts.map((post) => (
              <motion.div
                key={post._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
              >
                {/* Post Header */}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={post.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${post.author?.username}`}
                      alt={post.author?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold text-gray-900">{post.author?.name}</h4>
                      <p className="text-sm text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </div>

                {/* Post Content */}
                <div className="px-4 pb-4">
                  <p className="text-gray-900 mb-3">{post.content}</p>
                  
                  {/* Media */}
                  {post.media && post.media.length > 0 && (
                    <div className="mb-4">
                      {post.media.map((mediaUrl, index) => (
                        <img
                          key={index}
                          src={mediaUrl}
                          alt="Post media"
                          className="w-full max-h-96 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  )}

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                      {post.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Post Actions */}
                <div className="px-4 py-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleReaction(post._id, 'like')}
                      className="text-gray-600 hover:text-red-500"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      {post.reactions?.like?.length || 0}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.comments?.length || 0}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600">
                      <Share2 className="w-4 h-4 mr-1" />
                      Share
                    </Button>
                  </div>
                  <Button variant="ghost" size="sm" className="text-gray-600">
                    <Bookmark className="w-4 h-4" />
                  </Button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Create Post Modal */}
        <AnimatePresence>
          {showCreatePost && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={(e) => e.target === e.currentTarget && setShowCreatePost(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="w-full max-w-lg bg-white rounded-lg shadow-xl"
              >
                <div className="p-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Create Post</h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowCreatePost(false)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 space-y-4">
                  {/* User Info */}
                  <div className="flex items-center gap-3">
                    <img
                      src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                      alt={user?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-semibold">{user?.name}</h4>
                      <select
                        value={newPost.privacy}
                        onChange={(e) => setNewPost(prev => ({ ...prev, privacy: e.target.value }))}
                        className="text-sm text-gray-600 border-none bg-transparent focus:outline-none"
                      >
                        {PRIVACY_OPTIONS.map(option => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Content */}
                  <Textarea
                    placeholder="What's on your mind?"
                    value={newPost.content}
                    onChange={(e) => setNewPost(prev => ({ ...prev, content: e.target.value }))}
                    className="min-h-32 border-0 text-lg placeholder:text-gray-400 resize-none focus:ring-0"
                    style={{ boxShadow: 'none' }}
                  />

                  {/* Media Upload */}
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600">Click to upload images or videos</p>
                    </label>
                  </div>

                  {/* Media Preview */}
                  {newPost.media.length > 0 && (
                    <div className="grid grid-cols-3 gap-2">
                      {newPost.media.map((file, index) => (
                        <div key={index} className="relative">
                          <img
                            src={URL.createObjectURL(file)}
                            alt="Preview"
                            className="w-full h-20 object-cover rounded"
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setNewPost(prev => ({
                                ...prev,
                                media: prev.media.filter((_, i) => i !== index)
                              }));
                            }}
                            className="absolute top-1 right-1 bg-red-500 text-white hover:bg-red-600 p-1 h-6 w-6"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="p-4 border-t border-gray-200 flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowCreatePost(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreatePost}
                    disabled={!newPost.content.trim() && newPost.media.length === 0}
                    className="bg-blue-500 text-white hover:bg-blue-600"
                  >
                    Post
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default UltraAdvancedFeedPage;