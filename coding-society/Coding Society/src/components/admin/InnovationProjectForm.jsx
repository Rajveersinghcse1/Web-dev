/**
 * Innovation Project Form Component
 * Form for creating and editing innovation projects
 */

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  DocumentIcon,
  PhotoIcon,
  XMarkIcon,
  ArrowLeftIcon,
  CloudArrowUpIcon,
  UserPlusIcon,
  CalendarIcon
} from '@heroicons/react/24/outline';
import adminService from '../../services/adminService';

const InnovationProjectForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    type: 'concept',
    difficulty: '',
    tags: '',
    requirements: '',
    objectives: '',
    techStack: '',
    status: 'planning',
    timeline: {
      startDate: '',
      endDate: '',
      milestones: []
    }
  });

  const [collaborators, setCollaborators] = useState([]);
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [newCollaborator, setNewCollaborator] = useState({
    email: '',
    role: 'member',
    skills: ''
  });

  const categories = [
    { value: 'web_application', label: 'Web Application' },
    { value: 'mobile_app', label: 'Mobile App' },
    { value: 'ai_ml', label: 'AI/ML' },
    { value: 'blockchain', label: 'Blockchain' },
    { value: 'iot', label: 'IoT' },
    { value: 'cybersecurity', label: 'Cybersecurity' },
    { value: 'fintech', label: 'FinTech' },
    { value: 'healthtech', label: 'HealthTech' },
    { value: 'edtech', label: 'EdTech' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'social_impact', label: 'Social Impact' },
    { value: 'sustainability', label: 'Sustainability' },
    { value: 'productivity', label: 'Productivity' },
    { value: 'entertainment', label: 'Entertainment' },
    { value: 'other', label: 'Other' }
  ];

  const projectTypes = [
    { value: 'prototype', label: 'Prototype' },
    { value: 'mvp', label: 'MVP' },
    { value: 'full_product', label: 'Full Product' },
    { value: 'research', label: 'Research' },
    { value: 'concept', label: 'Concept' }
  ];

  const difficulties = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
    { value: 'expert', label: 'Expert' }
  ];

  const statuses = [
    { value: 'idea', label: 'Idea' },
    { value: 'planning', label: 'Planning' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'testing', label: 'Testing' },
    { value: 'completed', label: 'Completed' },
    { value: 'deployed', label: 'Deployed' },
    { value: 'maintenance', label: 'Maintenance' },
    { value: 'paused', label: 'Paused' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const collaboratorRoles = [
    { value: 'lead', label: 'Project Lead' },
    { value: 'developer', label: 'Developer' },
    { value: 'designer', label: 'Designer' },
    { value: 'tester', label: 'Tester' },
    { value: 'member', label: 'Team Member' }
  ];

  useEffect(() => {
    if (isEdit) {
      fetchProject();
    }
  }, [id, isEdit]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await adminService.getInnovationProjects({ id });
      
      if (response.success) {
        const project = response.data;
        setFormData({
          title: project.title || '',
          description: project.description || '',
          category: project.category || '',
          type: project.type || 'concept',
          difficulty: project.difficulty || '',
          tags: project.tags?.join(', ') || '',
          requirements: project.requirements?.join('\n') || '',
          objectives: project.objectives?.join('\n') || '',
          techStack: project.techStack ? Object.entries(project.techStack)
            .map(([key, values]) => `${key}: ${values.join(', ')}`)
            .join('\n') : '',
          status: project.status || 'planning',
          timeline: {
            startDate: project.timeline?.startDate ? new Date(project.timeline.startDate).toISOString().split('T')[0] : '',
            endDate: project.timeline?.endDate ? new Date(project.timeline.endDate).toISOString().split('T')[0] : '',
            milestones: project.milestones || []
          }
        });
        setCollaborators(project.collaborators || []);
        setExistingFiles(project.files || []);
      }
    } catch (err) {
      setError('Failed to fetch project details');
      console.error('Fetch project error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('timeline.')) {
      const timelineField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        timeline: {
          ...prev.timeline,
          [timelineField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles(prev => [...prev, ...selectedFiles]);
  };

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
      const droppedFiles = Array.from(e.dataTransfer.files);
      setFiles(prev => [...prev, ...droppedFiles]);
    }
  };

  const removeFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingFile = (index) => {
    setExistingFiles(prev => prev.filter((_, i) => i !== index));
  };

  const addCollaborator = () => {
    if (newCollaborator.email.trim()) {
      setCollaborators(prev => [...prev, {
        ...newCollaborator,
        skills: newCollaborator.skills.split(',').map(s => s.trim()).filter(s => s),
        joinedAt: new Date().toISOString()
      }]);
      setNewCollaborator({ email: '', role: 'member', skills: '' });
    }
  };

  const removeCollaborator = (index) => {
    setCollaborators(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = adminService.validateInnovationProject(formData);
    
    if (errors.length > 0) {
      setError(errors.join(', '));
      return false;
    }
    
    setError(null);
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setSaving(true);
      
      const submitData = adminService.createFormData({
        ...formData,
        collaborators: JSON.stringify(collaborators),
        timeline: JSON.stringify(formData.timeline),
        files: files,
        existingFiles: JSON.stringify(existingFiles)
      });

      if (isEdit) {
        await adminService.updateInnovationProject(id, submitData);
      } else {
        await adminService.createInnovationProject(submitData);
      }

      navigate('/admin/innovation');
    } catch (err) {
      setError(err.message || 'Failed to save project');
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="space-y-4">
            {[...Array(10)].map((_, i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigate('/admin/innovation')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Innovation Project' : 'Create Innovation Project'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEdit ? 'Update existing project' : 'Start a new collaborative project'}
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Project Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter project title"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Describe the innovation project"
              />
            </div>

            {/* Category */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select category</option>
                {categories.map(category => (
                  <option key={category.value} value={category.value}>
                    {category.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Project Type *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select project type</option>
                {projectTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label htmlFor="difficulty" className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level *
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={formData.difficulty}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select difficulty</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty.value} value={difficulty.value}>
                    {difficulty.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Project Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Tags */}
            <div className="md:col-span-2">
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                Tags
              </label>
              <input
                type="text"
                id="tags"
                name="tags"
                value={formData.tags}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter tags separated by commas"
              />
            </div>
          </div>
        </div>

        {/* Project Details */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Details</h3>
          
          <div className="space-y-6">
            {/* Requirements */}
            <div>
              <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                Requirements
              </label>
              <textarea
                id="requirements"
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter requirements separated by commas"
              />
            </div>

            {/* Objectives */}
            <div>
              <label htmlFor="objectives" className="block text-sm font-medium text-gray-700 mb-2">
                Learning Objectives
              </label>
              <textarea
                id="objectives"
                name="objectives"
                value={formData.objectives}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter learning objectives separated by commas"
              />
            </div>

            {/* Tech Stack */}
            <div>
              <label htmlFor="techStack" className="block text-sm font-medium text-gray-700 mb-2">
                Technology Stack
              </label>
              <input
                type="text"
                id="techStack"
                name="techStack"
                value={formData.techStack}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g., React, Node.js, MongoDB"
              />
            </div>

            {/* Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="timeline.startDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  Start Date
                </label>
                <input
                  type="date"
                  id="timeline.startDate"
                  name="timeline.startDate"
                  value={formData.timeline.startDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label htmlFor="timeline.endDate" className="block text-sm font-medium text-gray-700 mb-2">
                  <CalendarIcon className="h-4 w-4 inline mr-1" />
                  End Date
                </label>
                <input
                  type="date"
                  id="timeline.endDate"
                  name="timeline.endDate"
                  value={formData.timeline.endDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Collaborators */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Team Collaborators</h3>
          
          {/* Add Collaborator */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Collaborator</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="md:col-span-2">
                <input
                  type="email"
                  value={newCollaborator.email}
                  onChange={(e) => setNewCollaborator(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={newCollaborator.role}
                  onChange={(e) => setNewCollaborator(prev => ({ ...prev, role: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {collaboratorRoles.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button
                  type="button"
                  onClick={addCollaborator}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <UserPlusIcon className="h-4 w-4 mr-2" />
                  Add
                </button>
              </div>
            </div>
            <div className="mt-3">
              <input
                type="text"
                value={newCollaborator.skills}
                onChange={(e) => setNewCollaborator(prev => ({ ...prev, skills: e.target.value }))}
                placeholder="Skills (comma separated)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Collaborators List */}
          {collaborators.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Current Collaborators</h4>
              {collaborators.map((collaborator, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{collaborator.email}</p>
                    <p className="text-xs text-gray-600 capitalize">{collaborator.role}</p>
                    {collaborator.skills && collaborator.skills.length > 0 && (
                      <p className="text-xs text-blue-600">
                        Skills: {Array.isArray(collaborator.skills) ? collaborator.skills.join(', ') : collaborator.skills}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeCollaborator(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Project Files</h3>
          
          {/* Existing Files */}
          {existingFiles.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Current Files</h4>
              <div className="space-y-2">
                {existingFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <DocumentIcon className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.originalName}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeExistingFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* File Upload Area */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragActive 
                ? 'border-blue-400 bg-blue-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <CloudArrowUpIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <div className="space-y-2">
                <p className="text-sm text-gray-600">
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                    <span>Upload files</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <span className="text-gray-600"> or drag and drop</span>
                </p>
                <p className="text-xs text-gray-500">
                  Documents, images, and code files up to 10MB each
                </p>
              </div>
            </div>
          </div>

          {/* New Files Preview */}
          {files.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-3">New Files to Upload</h4>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {file.type.startsWith('image/') ? (
                        <PhotoIcon className="h-5 w-5 text-purple-600" />
                      ) : (
                        <DocumentIcon className="h-5 w-5 text-purple-600" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <XMarkIcon className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/innovation')}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {saving && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            )}
            <span>{saving ? 'Saving...' : (isEdit ? 'Update Project' : 'Create Project')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default InnovationProjectForm;