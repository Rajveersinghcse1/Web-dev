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
  Lightbulb,
  Zap,
  Loader2,
  Save,
  Globe,
  Users,
  Lock,
  Star,
  Target,
  Rocket,
  Brain,
  Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const INNOVATION_CATEGORIES = [
  'Artificial Intelligence', 'Machine Learning', 'Blockchain', 'IoT', 'Cybersecurity',
  'Web Development', 'Mobile Apps', 'Data Science', 'Cloud Computing', 'DevOps',
  'Game Development', 'VR/AR', 'Robotics', 'Fintech', 'Healthtech', 'Edtech',
  'Green Technology', 'Social Impact', 'Hardware', 'Other'
];

const PROJECT_STAGES = [
  { value: 'idea', label: 'Idea/Concept', color: 'bg-purple-100 text-purple-700', icon: Lightbulb },
  { value: 'prototype', label: 'Prototype', color: 'bg-blue-100 text-blue-700', icon: Zap },
  { value: 'development', label: 'In Development', color: 'bg-yellow-100 text-yellow-700', icon: Target },
  { value: 'testing', label: 'Testing Phase', color: 'bg-orange-100 text-orange-700', icon: Brain },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-700', icon: Award }
];

const COLLABORATION_TYPES = [
  { value: 'open', label: 'Open Source', description: 'Anyone can contribute and use' },
  { value: 'collaborative', label: 'Seeking Collaborators', description: 'Looking for team members' },
  { value: 'showcase', label: 'Showcase Only', description: 'Displaying completed work' },
  { value: 'feedback', label: 'Seeking Feedback', description: 'Looking for suggestions and reviews' }
];

const PRIVACY_OPTIONS = [
  { value: 'public', label: 'Public', icon: Globe, description: 'Visible to everyone' },
  { value: 'community', label: 'Community', icon: Users, description: 'Visible to community members' },
  { value: 'private', label: 'Private', icon: Lock, description: 'Only visible to you' }
];

const InnovationUploadModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    problem: '',
    solution: '',
    category: 'Web Development',
    stage: 'idea',
    collaborationType: 'showcase',
    privacy: 'public',
    tags: [],
    teamMembers: '',
    techStack: '',
    demoUrl: '',
    repositoryUrl: ''
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
    if (!formData.title.trim() || !formData.description.trim()) {
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
      console.error('Failed to submit innovation project:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      title: '',
      description: '',
      problem: '',
      solution: '',
      category: 'Web Development',
      stage: 'idea',
      collaborationType: 'showcase',
      privacy: 'public',
      tags: [],
      teamMembers: '',
      techStack: '',
      demoUrl: '',
      repositoryUrl: ''
    });
    setTagInput('');
    setUploadedFiles([]);
  };

  if (!isOpen) return null;

  const canSubmit = formData.title.trim() && formData.description.trim();
  const currentStage = PROJECT_STAGES.find(stage => stage.value === formData.stage);

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
        className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Rocket className="w-5 h-5 mr-2 text-purple-600" />
            Share Your Innovation
          </h2>
          <Button variant="ghost" size="sm" onClick={onClose} className="p-2">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-140px)] overflow-y-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Basic Information */}
            <div className="lg:col-span-2 space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                  Project Information
                </h3>
                
                {/* Title */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Title *</label>
                  <Input
                    placeholder="Enter your innovative project title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    className="w-full"
                  />
                </div>

                {/* Description */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Project Description *</label>
                  <Textarea
                    placeholder="Describe your innovation project, its objectives, and key features..."
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    rows={4}
                    className="w-full resize-none"
                  />
                </div>

                {/* Problem & Solution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Problem Statement</label>
                    <Textarea
                      placeholder="What problem does this solve?"
                      value={formData.problem}
                      onChange={(e) => handleInputChange('problem', e.target.value)}
                      rows={3}
                      className="w-full resize-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Solution Approach</label>
                    <Textarea
                      placeholder="How does your solution address the problem?"
                      value={formData.solution}
                      onChange={(e) => handleInputChange('solution', e.target.value)}
                      rows={3}
                      className="w-full resize-none"
                    />
                  </div>
                </div>

                {/* Category and Stage */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={formData.category}
                      onChange={(e) => handleInputChange('category', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      {INNOVATION_CATEGORIES.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Project Stage</label>
                    <div className="space-y-2">
                      {PROJECT_STAGES.map((stage) => (
                        <label key={stage.value} className="flex items-center">
                          <input
                            type="radio"
                            name="stage"
                            value={stage.value}
                            checked={formData.stage === stage.value}
                            onChange={(e) => handleInputChange('stage', e.target.value)}
                            className="mr-2"
                          />
                          <stage.icon className="w-4 h-4 mr-2" />
                          <span className={`px-2 py-1 rounded text-sm ${stage.color}`}>
                            {stage.label}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Tech Stack and Team */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tech Stack</label>
                    <Input
                      placeholder="e.g., React, Node.js, MongoDB, AWS"
                      value={formData.techStack}
                      onChange={(e) => handleInputChange('techStack', e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Team Members</label>
                    <Input
                      placeholder="List team member names or roles"
                      value={formData.teamMembers}
                      onChange={(e) => handleInputChange('teamMembers', e.target.value)}
                    />
                  </div>
                </div>

                {/* URLs */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Demo URL</label>
                    <Input
                      placeholder="https://your-demo-url.com"
                      value={formData.demoUrl}
                      onChange={(e) => handleInputChange('demoUrl', e.target.value)}
                      type="url"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Repository URL</label>
                    <Input
                      placeholder="https://github.com/username/repo"
                      value={formData.repositoryUrl}
                      onChange={(e) => handleInputChange('repositoryUrl', e.target.value)}
                      type="url"
                    />
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
                            className="inline-flex items-center space-x-1 px-3 py-1 bg-purple-100 text-purple-600 rounded-full text-sm"
                          >
                            <span>#{tag}</span>
                            <button
                              onClick={() => handleTagRemove(tag)}
                              className="text-purple-400 hover:text-purple-600 transition-colors"
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

            {/* Right Column - Files and Settings */}
            <div className="space-y-6">
              {/* File Upload */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-500" />
                  Documentation
                </h3>
                <FileUploadComponent
                  type="pdf"
                  multiple={true}
                  maxFiles={5}
                  onUploadComplete={handleFileUploadComplete}
                  className="border-2 border-dashed border-gray-300 rounded-lg"
                >
                  <div className="space-y-3">
                    <FileText className="h-8 w-8 mx-auto text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Upload Project Files
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        Documentation, presentations, reports
                        <br />
                        PDF files • Max 20MB each
                      </p>
                    </div>
                  </div>
                </FileUploadComponent>
              </div>

              {/* Uploaded Files */}
              {uploadedFiles.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-3">Uploaded Files</h4>
                  <div className="space-y-2">
                    {uploadedFiles.map((file, index) => (
                      <div key={index} className="flex items-center p-2 bg-green-50 border border-green-200 rounded">
                        <FileText className="w-4 h-4 text-green-600 mr-2" />
                        <div className="flex-1">
                          <p className="text-xs font-medium text-gray-900 truncate">{file.originalName}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Collaboration Type */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Collaboration</h4>
                <div className="space-y-2">
                  {COLLABORATION_TYPES.map((type) => (
                    <label key={type.value} className="flex items-start p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="collaborationType"
                        value={type.value}
                        checked={formData.collaborationType === type.value}
                        onChange={(e) => handleInputChange('collaborationType', e.target.value)}
                        className="mt-1 mr-2"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{type.label}</p>
                        <p className="text-xs text-gray-500">{type.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Privacy Settings */}
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-3">Privacy</h4>
                <div className="space-y-2">
                  {PRIVACY_OPTIONS.map((option) => (
                    <label key={option.value} className="flex items-center p-2 border border-gray-200 rounded hover:bg-gray-50 cursor-pointer">
                      <input
                        type="radio"
                        name="privacy"
                        value={option.value}
                        checked={formData.privacy === option.value}
                        onChange={(e) => handleInputChange('privacy', e.target.value)}
                        className="mr-2"
                      />
                      <option.icon className="w-4 h-4 text-gray-500 mr-2" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{option.label}</p>
                        <p className="text-xs text-gray-500">{option.description}</p>
                      </div>
                    </label>
                  ))}
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
                <Star className="w-4 h-4 mr-1" />
                Ready to showcase your innovation!
              </span>
            ) : (
              <span>Please fill in the project title and description</span>
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
              className="min-w-[120px] bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <Rocket className="w-4 h-4 mr-2" />
                  Publish Project
                </>
              )}
            </Button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default InnovationUploadModal;