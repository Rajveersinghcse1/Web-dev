import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { 
  X, 
  Image, 
  Video, 
  Code, 
  FileText, 
  MapPin, 
  Globe, 
  Users, 
  UserPlus, 
  Lock, 
  Plus, 
  Trash2,
  Upload,
  Smile,
  Tag,
  BarChart3,
  Send,
  Eye,
  ChevronDown,
  Palette,
  Music
} from 'lucide-react';

const CONTENT_TYPES = [
  { id: 'text', label: 'Text Post', icon: FileText, color: 'bg-blue-500' },
  { id: 'image', label: 'Photo', icon: Image, color: 'bg-green-500' },
  { id: 'video', label: 'Video', icon: Video, color: 'bg-red-500' },
  { id: 'code', label: 'Code Snippet', icon: Code, color: 'bg-purple-500' },
  { id: 'poll', label: 'Poll', icon: BarChart3, color: 'bg-orange-500' },
  { id: 'article', label: 'Article', icon: FileText, color: 'bg-indigo-500' }
];

const PRIVACY_OPTIONS = [
  { 
    value: 'public', 
    icon: Globe, 
    label: 'Public', 
    description: 'Anyone on Coding Society can see this',
    color: 'text-blue-600 bg-blue-50'
  },
  { 
    value: 'followers', 
    icon: Users, 
    label: 'Followers', 
    description: 'Only people who follow you',
    color: 'text-green-600 bg-green-50'
  },
  { 
    value: 'friends', 
    icon: UserPlus, 
    label: 'Friends', 
    description: 'Only your friends can see this',
    color: 'text-orange-600 bg-orange-50'
  },
  { 
    value: 'private', 
    icon: Lock, 
    label: 'Only me', 
    description: 'Only you can see this post',
    color: 'text-red-600 bg-red-50'
  }
];

const PROGRAMMING_LANGUAGES = [
  'javascript', 'python', 'java', 'cpp', 'c', 'typescript', 'go', 'rust', 
  'php', 'ruby', 'kotlin', 'swift', 'html', 'css', 'sql', 'bash'
];

const CreatePostModal = ({ isOpen, onClose, onSubmit, user }) => {
  const [formData, setFormData] = useState({
    content: '',
    type: 'text',
    privacy: 'public',
    tags: [],
    location: null,
    media: [],
    codeSnippet: {
      language: 'javascript',
      code: '',
      title: '',
      description: ''
    },
    poll: {
      question: '',
      options: ['', ''],
      allowMultiple: false,
      expiresIn: 24
    }
  });

  const [currentTag, setCurrentTag] = useState('');
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fileInputRef = useRef(null);
  const textareaRef = useRef(null);

  // Handle form submission
  const handleSubmit = async () => {
    if (!formData.content.trim() && formData.media.length === 0 && !formData.codeSnippet.code) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        content: '',
        type: 'text',
        privacy: 'public',
        tags: [],
        location: null,
        media: [],
        codeSnippet: {
          language: 'javascript',
          code: '',
          title: '',
          description: ''
        },
        poll: {
          question: '',
          options: ['', ''],
          allowMultiple: false,
          expiresIn: 24
        }
      });
      setPreviewUrls([]);
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle file uploads
  const handleFileSelect = (files) => {
    const fileArray = Array.from(files);
    const newPreviewUrls = [];

    fileArray.forEach(file => {
      if (file.type.startsWith('image/') || file.type.startsWith('video/')) {
        const url = URL.createObjectURL(file);
        newPreviewUrls.push({ file, url, type: file.type.startsWith('image/') ? 'image' : 'video' });
      }
    });

    setFormData(prev => ({
      ...prev,
      media: [...prev.media, ...fileArray]
    }));
    setPreviewUrls(prev => [...prev, ...newPreviewUrls]);
  };

  // Handle drag and drop
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  // Add tag
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  // Remove media
  const removeMedia = (index) => {
    setFormData(prev => ({
      ...prev,
      media: prev.media.filter((_, i) => i !== index)
    }));
    setPreviewUrls(prev => {
      const newUrls = prev.filter((_, i) => i !== index);
      // Revoke the URL to free memory
      if (prev[index]) {
        URL.revokeObjectURL(prev[index].url);
      }
      return newUrls;
    });
  };

  // Add poll option
  const addPollOption = () => {
    if (formData.poll.options.length < 6) {
      setFormData(prev => ({
        ...prev,
        poll: {
          ...prev.poll,
          options: [...prev.poll.options, '']
        }
      }));
    }
  };

  // Remove poll option
  const removePollOption = (index) => {
    if (formData.poll.options.length > 2) {
      setFormData(prev => ({
        ...prev,
        poll: {
          ...prev.poll,
          options: prev.poll.options.filter((_, i) => i !== index)
        }
      }));
    }
  };

  if (!isOpen) return null;

  const selectedPrivacy = PRIVACY_OPTIONS.find(option => option.value === formData.privacy);
  const PrivacyIcon = selectedPrivacy?.icon || Globe;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          <Card className="border-0 shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl font-semibold">Create Post</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
              
              {/* Content Type Selector */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {CONTENT_TYPES.map((type) => {
                  const IconComponent = type.icon;
                  return (
                    <Button
                      key={type.id}
                      variant={formData.type === type.id ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, type: type.id }))}
                      className="flex-shrink-0"
                    >
                      <IconComponent className="w-4 h-4 mr-2" />
                      {type.label}
                    </Button>
                  );
                })}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* User Info */}
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.username}`}
                  alt={user?.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{user?.name}</h4>
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowPrivacyDropdown(!showPrivacyDropdown)}
                      className={`h-6 px-2 text-xs ${selectedPrivacy?.color}`}
                    >
                      <PrivacyIcon className="w-3 h-3 mr-1" />
                      {selectedPrivacy?.label}
                      <ChevronDown className="w-3 h-3 ml-1" />
                    </Button>
                    
                    {showPrivacyDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-64">
                        {PRIVACY_OPTIONS.map((option) => {
                          const OptionIcon = option.icon;
                          return (
                            <button
                              key={option.value}
                              onClick={() => {
                                setFormData(prev => ({ ...prev, privacy: option.value }));
                                setShowPrivacyDropdown(false);
                              }}
                              className="w-full text-left p-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
                            >
                              <div className="flex items-start gap-3">
                                <div className={`p-2 rounded-full ${option.color}`}>
                                  <OptionIcon className="w-4 h-4" />
                                </div>
                                <div>
                                  <div className="font-medium text-gray-900">{option.label}</div>
                                  <div className="text-sm text-gray-500">{option.description}</div>
                                </div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <Textarea
                ref={textareaRef}
                placeholder="What's on your mind? Share your coding journey, insights, or ask questions..."
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="min-h-32 border-0 text-lg placeholder:text-gray-400 resize-none focus:ring-0"
                style={{ boxShadow: 'none' }}
              />

              {/* Code Snippet Editor */}
              {formData.type === 'code' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Language
                      </label>
                      <select
                        value={formData.codeSnippet.language}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          codeSnippet: { ...prev.codeSnippet, language: e.target.value }
                        }))}
                        className="w-full p-2 border border-gray-300 rounded-md"
                      >
                        {PROGRAMMING_LANGUAGES.map(lang => (
                          <option key={lang} value={lang}>{lang}</option>
                        ))}
                      </select>
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title (optional)
                      </label>
                      <Input
                        placeholder="Code snippet title"
                        value={formData.codeSnippet.title}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          codeSnippet: { ...prev.codeSnippet, title: e.target.value }
                        }))}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Code
                    </label>
                    <Textarea
                      placeholder="Paste your code here..."
                      value={formData.codeSnippet.code}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        codeSnippet: { ...prev.codeSnippet, code: e.target.value }
                      }))}
                      className="font-mono text-sm"
                      rows={10}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description (optional)
                    </label>
                    <Input
                      placeholder="What does this code do?"
                      value={formData.codeSnippet.description}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        codeSnippet: { ...prev.codeSnippet, description: e.target.value }
                      }))}
                    />
                  </div>
                </div>
              )}

              {/* Poll Creator */}
              {formData.type === 'poll' && (
                <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Poll Question
                    </label>
                    <Input
                      placeholder="Ask your question..."
                      value={formData.poll.question}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        poll: { ...prev.poll, question: e.target.value }
                      }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Options
                    </label>
                    {formData.poll.options.map((option, index) => (
                      <div key={index} className="flex gap-2 mb-2">
                        <Input
                          placeholder={`Option ${index + 1}`}
                          value={option}
                          onChange={(e) => {
                            const newOptions = [...formData.poll.options];
                            newOptions[index] = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              poll: { ...prev.poll, options: newOptions }
                            }));
                          }}
                          className="flex-1"
                        />
                        {formData.poll.options.length > 2 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removePollOption(index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    
                    {formData.poll.options.length < 6 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addPollOption}
                        className="w-full"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Option
                      </Button>
                    )}
                  </div>

                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.poll.allowMultiple}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          poll: { ...prev.poll, allowMultiple: e.target.checked }
                        }))}
                        className="rounded"
                      />
                      <span className="text-sm">Allow multiple selections</span>
                    </label>
                    
                    <div className="flex items-center gap-2">
                      <label className="text-sm">Expires in:</label>
                      <select
                        value={formData.poll.expiresIn}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          poll: { ...prev.poll, expiresIn: parseInt(e.target.value) }
                        }))}
                        className="p-1 border border-gray-300 rounded text-sm"
                      >
                        <option value={1}>1 hour</option>
                        <option value={6}>6 hours</option>
                        <option value={12}>12 hours</option>
                        <option value={24}>1 day</option>
                        <option value={168}>1 week</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Media Upload */}
              {(formData.type === 'image' || formData.type === 'video' || formData.type === 'text') && (
                <div>
                  {/* Media Preview */}
                  {previewUrls.length > 0 && (
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {previewUrls.map((preview, index) => (
                        <div key={index} className="relative group">
                          {preview.type === 'image' ? (
                            <img
                              src={preview.url}
                              alt="Preview"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ) : (
                            <video
                              src={preview.url}
                              className="w-full h-32 object-cover rounded-lg"
                              controls
                            />
                          )}
                          <button
                            onClick={() => removeMedia(index)}
                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload Area */}
                  <div
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                      dragActive 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-600 mb-2">
                      Drag and drop your files here, or{' '}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="text-blue-500 hover:text-blue-600 font-medium"
                      >
                        browse
                      </button>
                    </p>
                    <p className="text-sm text-gray-400">
                      Supports images, videos, documents (Max 50MB)
                    </p>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf,.txt"
                      onChange={(e) => handleFileSelect(e.target.files)}
                      className="hidden"
                    />
                  </div>
                </div>
              )}

              {/* Tags */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tags
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                    >
                      #{tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:bg-blue-200 rounded-full p-0.5"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addTag}
                    disabled={!currentTag.trim()}
                  >
                    <Tag className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <MapPin className="w-4 h-4 mr-2" />
                    Location
                  </Button>
                  <Button variant="ghost" size="sm" className="text-gray-500">
                    <Smile className="w-4 h-4 mr-2" />
                    Mood
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button variant="outline" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || (!formData.content.trim() && formData.media.length === 0 && !formData.codeSnippet.code && !formData.poll.question)}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                  >
                    {isSubmitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    Post
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default CreatePostModal;