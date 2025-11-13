import React, { useState, useRef, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import FileUploadComponent from '../ui/FileUploadComponent';
import { 
  X, 
  Code, 
  Image, 
  Video, 
  FileText, 
  Users, 
  Lock, 
  Globe, 
  Tag,
  Send,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const POST_TYPES = [
  { id: 'text', label: 'Text', icon: FileText, color: 'bg-blue-500' },
  { id: 'image', label: 'Image', icon: Image, color: 'bg-green-500' },
  { id: 'video', label: 'Video', icon: Video, color: 'bg-purple-500' },
  { id: 'code', label: 'Code', icon: Code, color: 'bg-gray-800' }
];

const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public', icon: Globe },
  { value: 'friends', label: 'Friends', icon: Users },
  { value: 'private', label: 'Private', icon: Lock }
];

const PROGRAMMING_LANGUAGES = [
  'javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'php', 'ruby',
  'go', 'rust', 'swift', 'kotlin', 'typescript', 'html', 'css', 'sql',
  'bash', 'powershell', 'dockerfile', 'yaml', 'json', 'xml'
];

const CreatePostModal = ({ isOpen, onClose, onSubmit, currentUser }) => {
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('text');
  const [privacy, setPrivacy] = useState('public');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [codeSnippet, setCodeSnippet] = useState({ code: '', language: 'javascript' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadProgress, setUploadProgress] = useState({});

  const handleSubmit = async () => {
    if (!content.trim() && uploadedFiles.length === 0 && postType !== 'code') {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const postData = {
        content,
        type: postType,
        privacy,
        tags,
        media: uploadedFiles,
        ...(postType === 'code' && { codeSnippet })
      };

      await onSubmit(postData);
      handleReset();
      onClose();
    } catch (error) {
      console.error('Failed to create post:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setContent('');
    setPostType('text');
    setPrivacy('public');
    setTags([]);
    setTagInput('');
    setCodeSnippet({ code: '', language: 'javascript' });
    setUploadedFiles([]);
    setUploadProgress({});
  };

  const handleTagAdd = useCallback(() => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags(prev => [...prev, tagInput.trim()]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const handleTagRemove = useCallback((tagToRemove) => {
    setTags(prev => prev.filter(tag => tag !== tagToRemove));
  }, []);

  const handleFileUploadComplete = useCallback((files) => {
    setUploadedFiles(prev => [...prev, ...files]);
  }, []);

  const handleUploadProgress = useCallback((fileId, progress) => {
    setUploadProgress(prev => ({
      ...prev,
      [fileId]: progress
    }));
  }, []);

  const removeUploadedFile = useCallback((fileIndex) => {
    setUploadedFiles(prev => prev.filter((_, index) => index !== fileIndex));
  }, []);

  if (!isOpen) return null;

  const canSubmit = content.trim() || uploadedFiles.length > 0 || (postType === 'code' && codeSnippet.code.trim());

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-transparent flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Post</h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto space-y-6">
          {/* User Info & Privacy */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <img
                src={currentUser?.avatar || '/default-avatar.png'}
                alt="Your avatar"
                className="w-12 h-12 rounded-full object-cover"
              />
              <div>
                <h3 className="font-medium text-gray-900">{currentUser?.username}</h3>
                <p className="text-sm text-gray-500">Share with your community</p>
              </div>
            </div>
            
            {/* Privacy Options */}
            <div className="flex items-center space-x-2">
              {PRIVACY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setPrivacy(option.value)}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full text-sm transition-colors duration-200 ${
                    privacy === option.value
                      ? 'bg-blue-100 text-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <option.icon className="w-3 h-3" />
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Post Type Selector */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Post Type</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {POST_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setPostType(type.id)}
                  className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 ${
                    postType === type.id
                      ? `${type.color} text-white shadow-lg transform scale-105`
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
                  }`}
                >
                  <type.icon className="w-4 h-4" />
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content Input */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Content</label>
            <Textarea
              placeholder={
                postType === 'code' 
                  ? "Describe your code solution..."
                  : postType === 'image'
                  ? "Add a caption to your image..."
                  : postType === 'video'
                  ? "Tell us about your video..."
                  : "What's on your mind? Share your thoughts, ideas, or questions..."
              }
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full resize-none"
            />
          </div>

          {/* Code Snippet (if code post type) */}
          <AnimatePresence>
            {postType === 'code' && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <div className="flex items-center space-x-3">
                  <label className="text-sm font-medium text-gray-700">Language:</label>
                  <select
                    value={codeSnippet.language}
                    onChange={(e) => setCodeSnippet({...codeSnippet, language: e.target.value})}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    {PROGRAMMING_LANGUAGES.map(lang => (
                      <option key={lang} value={lang}>
                        {lang.charAt(0).toUpperCase() + lang.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                <Textarea
                  placeholder="Paste your code here..."
                  value={codeSnippet.code}
                  onChange={(e) => setCodeSnippet({...codeSnippet, code: e.target.value})}
                  rows={8}
                  className="font-mono text-sm bg-gray-50"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Media Upload */}
          <AnimatePresence>
            {(postType === 'image' || postType === 'video') && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <label className="text-sm font-medium text-gray-700">
                  {postType === 'image' ? 'Upload Images' : 'Upload Videos'}
                </label>
                <FileUploadComponent
                  type={postType}
                  multiple={true}
                  maxFiles={postType === 'image' ? 5 : 2}
                  onUploadComplete={handleFileUploadComplete}
                  onUploadProgress={handleUploadProgress}
                  className="border-2 border-dashed border-gray-300 rounded-lg"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Uploaded Files Preview */}
          <AnimatePresence>
            {uploadedFiles.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3"
              >
                <label className="text-sm font-medium text-gray-700">Uploaded Files</label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {uploadedFiles.map((file, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative group"
                    >
                      <Card className="overflow-hidden">
                        <CardContent className="p-3">
                          <div className="aspect-square bg-gray-100 rounded flex items-center justify-center mb-2">
                            {file.url && postType === 'image' ? (
                              <img 
                                src={file.url} 
                                alt={file.originalName}
                                className="w-full h-full object-cover rounded"
                              />
                            ) : (
                              <div className="text-center">
                                {postType === 'video' ? (
                                  <Video className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                ) : (
                                  <Image className="w-8 h-8 text-gray-400 mx-auto mb-1" />
                                )}
                                <p className="text-xs text-gray-500 truncate">
                                  {file.originalName}
                                </p>
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 text-center truncate">
                            {file.originalName}
                          </p>
                        </CardContent>
                      </Card>
                      <button
                        onClick={() => removeUploadedFile(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Tags */}
          <div className="space-y-3">
            <label className="text-sm font-medium text-gray-700">Tags</label>
            <div className="flex space-x-2">
              <Input
                placeholder="Add a tag (e.g., javascript, tutorial, help)..."
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleTagAdd())}
                className="flex-1"
              />
              <Button type="button" onClick={handleTagAdd} size="sm" variant="outline">
                <Tag className="w-4 h-4" />
              </Button>
            </div>
            <AnimatePresence>
              {tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="flex flex-wrap gap-2"
                >
                  {tags.map((tag, index) => (
                    <motion.span
                      key={tag}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      className="inline-flex items-center space-x-1 px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm"
                    >
                      <span>#{tag}</span>
                      <button
                        onClick={() => handleTagRemove(tag)}
                        className="text-blue-400 hover:text-blue-600 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </motion.span>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {canSubmit ? (
              <span className="text-green-600 font-medium">Ready to post!</span>
            ) : (
              <span>Add some content to share with your community</span>
            )}
          </div>
          
          <div className="flex space-x-3">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Post
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default CreatePostModal;