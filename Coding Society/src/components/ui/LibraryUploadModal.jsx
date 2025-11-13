import React, { useState, useCallback } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Card, CardContent } from '../ui/card';
import FileUploadComponent from '../ui/FileUploadComponent';
import { 
  X, 
  FileText, 
  Upload,
  Tag,
  User,
  BookOpen,
  GraduationCap,
  Loader2,
  Save,
  Globe,
  Users,
  Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
  'Programming', 'Web Development', 'Data Science', 'Mobile Development',
  'DevOps', 'Cybersecurity', 'AI/ML', 'Database', 'System Design',
  'Mathematics', 'Physics', 'Chemistry', 'Biology', 'Engineering',
  'Business', 'Design', 'Other'
];

const DIFFICULTY_LEVELS = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-700' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'advanced', label: 'Advanced', color: 'bg-red-100 text-red-700' }
];

const CONTENT_TYPES = [
  { value: 'notes', label: 'Study Notes', icon: FileText },
  { value: 'tutorial', label: 'Tutorial', icon: BookOpen },
  { value: 'reference', label: 'Reference', icon: GraduationCap },
  { value: 'assignment', label: 'Assignment', icon: User }
];

const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public', icon: Globe, description: 'Anyone can view and download' },
  { value: 'community', label: 'Community', icon: Users, description: 'Only community members can access' },
  { value: 'private', label: 'Private', icon: Lock, description: 'Only you can access' }
];

const LibraryUploadModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Programming',
    contentType: 'notes',
    difficulty: 'beginner',
    privacy: 'public',
    tags: [],
    subject: '',
    author: ''
  });
  
  const [tagInput, setTagInput] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const handleTagAdd = useCallback(() => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput('');
    }
  }, [tagInput, formData.tags]);

  const handleTagRemove = useCallback((tagToRemove) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  }, []);

  const handleFileUploadComplete = useCallback((files) => {
    setUploadedFiles(files);
  }, []);

  const handleSubmit = async () => {
    if (!formData.title.trim() || uploadedFiles.length === 0) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const submitData = {
        ...formData,
        files: uploadedFiles
      };
      
      await onSubmit(submitData);
      handleReset();
      onClose();
    } catch (error) {
      console.error('Failed to submit library content:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      category: 'Programming',
      contentType: 'notes',
      difficulty: 'beginner',
      privacy: 'public',
      tags: [],
      subject: '',
      author: ''
    });
    setTagInput('');
    setUploadedFiles([]);
  };

  if (!isOpen) return null;

  const canSubmit = formData.title.trim() && uploadedFiles.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Upload className="w-5 h-5 mr-2" />
            Upload Library Content
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - File Upload */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Upload Files</h3>
                <FileUploadComponent
                  type="pdf"
                  multiple={true}
                  maxFiles={10}
                  onUploadComplete={handleFileUploadComplete}
                  className="border-2 border-dashed border-gray-300 rounded-lg"
                >
                  <div className="space-y-3">
                    <FileText className="h-12 w-12 mx-auto text-gray-400" />
                    <div>
                      <p className="text-lg font-medium text-gray-900">
                        Upload PDF Files
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Drag and drop or click to select PDF files
                        <br />
                        Max size: 20MB per file • Max 10 files
                      </p>
                    </div>
                  </div>
                </FileUploadComponent>
              </div>

              {/* Uploaded Files Preview */}
              {uploadedFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Files</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                        <FileText className="w-5 h-5 text-green-600 mr-3" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                          <p className="text-xs text-gray-500">Successfully uploaded</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Metadata */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Content Details</h3>
                
                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                  <Input
                    placeholder="Enter a descriptive title for your content"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Textarea
                    placeholder="Provide a detailed description of the content, what students will learn, prerequisites, etc."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full resize-none"
                  />
                </div>

                {/* Category and Content Type */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                    <div className="grid grid-cols-2 gap-1">
                      {CONTENT_TYPES.map((type) => (
                        <button
                          key={type.value}
                          onClick={() => handleInputChange('contentType', type.value)}
                          className={`p-2 text-xs rounded transition-colors ${
                            formData.contentType === type.value
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          <type.icon className="w-3 h-3 mx-auto mb-1" />
                          <span>{type.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Subject and Author */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                    <Input
                      placeholder="e.g., Computer Science"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
                    <Input
                      placeholder="Content author name"
                      value={formData.author}
                      onChange={(e) => handleInputChange('author', e.target.value)}
                    />
                  </div>
                </div>

                {/* Difficulty Level */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Difficulty Level</label>
                  <div className="flex space-x-2">
                    {DIFFICULTY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        onClick={() => handleInputChange('difficulty', level.value)}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                          formData.difficulty === level.value
                            ? level.color
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Privacy</label>
                  <div className="space-y-2">
                    {PRIVACY_OPTIONS.map((option) => (
                      <label key={option.value} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name="privacy"
                          value={option.value}
                          checked={formData.privacy === option.value}
                          onChange={(e) => handleInputChange('privacy', e.target.value)}
                          className="mr-3"
                        />
                        <option.icon className="w-5 h-5 text-gray-500 mr-3" />
                        <div>
                          <p className="font-medium text-gray-900">{option.label}</p>
                          <p className="text-xs text-gray-500">{option.description}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                  <div className="flex space-x-2 mb-2">
                    <Input
                      placeholder="Add tags for better discoverability"
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
                    {formData.tags.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap gap-2"
                      >
                        {formData.tags.map((tag, index) => (
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
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {canSubmit ? (
              <span className="text-green-600 font-medium flex items-center">
                <FileText className="w-4 h-4 mr-1" />
                Ready to upload {uploadedFiles.length} file{uploadedFiles.length > 1 ? 's' : ''}
              </span>
            ) : (
              <span>Add a title and upload at least one PDF file</span>
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
                  Uploading...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Upload Content
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LibraryUploadModal;