/**
 * Hackathon Form Component
 * Form for creating and editing hackathon events
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
  CalendarIcon,
  TrophyIcon,
  UserGroupIcon,
  GiftIcon,
  MapPinIcon
} from '@heroicons/react/24/outline';
import adminService from '../../services/adminService';

const HackathonForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    theme: '',
    location: '',
    venue: '',
    eventFormat: 'hybrid',
    type: 'general',
    maxParticipants: '',
    maxTeamSize: '',
    status: 'upcoming',
    registrationStartDate: '',
    registrationEndDate: '',
    eventStartDate: '',
    eventEndDate: '',
    requirements: '',
    rules: '',
    schedule: '',
    submissionGuidelines: '',
    judgingCriteria: ''
  });

  const [prizes, setPrizes] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [teams, setTeams] = useState([]);
  const [files, setFiles] = useState([]);
  const [existingFiles, setExistingFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [newPrize, setNewPrize] = useState({ position: '', amount: '', description: '' });
  const [newSponsor, setNewSponsor] = useState({ name: '', logo: '', website: '', tier: 'bronze' });

  const eventFormats = [
    { value: 'virtual', label: 'Virtual (Online)' },
    { value: 'in_person', label: 'In Person (Offline)' },
    { value: 'hybrid', label: 'Hybrid' }
  ];

  const hackathonTypes = [
    { value: 'general', label: 'General' },
    { value: 'ai_ml', label: 'AI/ML' },
    { value: 'web_development', label: 'Web Development' },
    { value: 'mobile_development', label: 'Mobile Development' },
    { value: 'blockchain', label: 'Blockchain' },
    { value: 'cybersecurity', label: 'Cybersecurity' },
    { value: 'fintech', label: 'FinTech' },
    { value: 'healthtech', label: 'HealthTech' },
    { value: 'edtech', label: 'EdTech' },
    { value: 'gaming', label: 'Gaming' },
    { value: 'social_good', label: 'Social Good' },
    { value: 'sustainability', label: 'Sustainability' },
    { value: 'iot', label: 'IoT' },
    { value: 'ar_vr', label: 'AR/VR' },
    { value: 'data_science', label: 'Data Science' },
    { value: 'other', label: 'Other' }
  ];

  const statuses = [
    { value: 'upcoming', label: 'Upcoming' },
    { value: 'registration_open', label: 'Registration Open' },
    { value: 'registration_closed', label: 'Registration Closed' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'judging', label: 'Judging Phase' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  const sponsorTiers = [
    { value: 'platinum', label: 'Platinum' },
    { value: 'gold', label: 'Gold' },
    { value: 'silver', label: 'Silver' },
    { value: 'bronze', label: 'Bronze' }
  ];

  useEffect(() => {
    if (isEdit) {
      fetchHackathon();
    }
  }, [id, isEdit]);

  const fetchHackathon = async () => {
    try {
      setLoading(true);
      const response = await adminService.getHackathons({ id });
      const hackathon = response.data.hackathons[0];
      
      if (hackathon) {
        setFormData({
          title: hackathon.title || '',
          description: hackathon.description || '',
          theme: hackathon.themes?.[0] || hackathon.theme || '',
          location: hackathon.location?.venue?.address?.city || '',
          venue: hackathon.location?.venue?.name || '',
          eventFormat: hackathon.eventFormat || 'hybrid',
          type: hackathon.type || 'general',
          maxParticipants: hackathon.maxParticipants || '',
          maxTeamSize: hackathon.maxTeamSize || '',
          status: hackathon.status || 'upcoming',
          registrationStartDate: hackathon.registrationStartDate ? new Date(hackathon.registrationStartDate).toISOString().slice(0, 16) : '',
          registrationEndDate: hackathon.registrationEndDate ? new Date(hackathon.registrationEndDate).toISOString().slice(0, 16) : '',
          eventStartDate: hackathon.startDate ? new Date(hackathon.startDate).toISOString().slice(0, 16) : '',
          eventEndDate: hackathon.endDate ? new Date(hackathon.endDate).toISOString().slice(0, 16) : '',
          requirements: hackathon.requirements?.join('\n') || '',
          rules: hackathon.rules?.join('\n') || '',
          schedule: hackathon.schedule ? JSON.stringify(hackathon.schedule, null, 2) : '',
          submissionGuidelines: hackathon.submissionGuidelines || '',
          judgingCriteria: hackathon.judgingCriteria ? JSON.stringify(hackathon.judgingCriteria, null, 2) : ''
        });
        setPrizes(hackathon.prizes || []);
        setSponsors(hackathon.sponsors || []);
        setParticipants(hackathon.participants || []);
        setTeams(hackathon.teams || []);
        setExistingFiles(hackathon.files || []);
      }
    } catch (err) {
      setError('Failed to fetch hackathon details');
      console.error('Fetch hackathon error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

  const addPrize = () => {
    if (newPrize.position.trim() && newPrize.amount.trim()) {
      setPrizes(prev => [...prev, { ...newPrize }]);
      setNewPrize({ position: '', amount: '', description: '' });
    }
  };

  const removePrize = (index) => {
    setPrizes(prev => prev.filter((_, i) => i !== index));
  };

  const addSponsor = () => {
    if (newSponsor.name.trim()) {
      setSponsors(prev => [...prev, { ...newSponsor }]);
      setNewSponsor({ name: '', logo: '', website: '', tier: 'bronze' });
    }
  };

  const removeSponsor = (index) => {
    setSponsors(prev => prev.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    const errors = adminService.validateHackathon(formData);
    
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
        prizes: JSON.stringify(prizes),
        sponsors: JSON.stringify(sponsors),
        participants: JSON.stringify(participants),
        teams: JSON.stringify(teams),
        files: files.length > 0 ? files : undefined,
        existingFiles: JSON.stringify(existingFiles)
      });

      if (isEdit) {
        await adminService.updateHackathon(id, submitData);
      } else {
        await adminService.createHackathon(submitData);
      }

      navigate('/admin/hackathon');
    } catch (err) {
      setError(err.message || 'Failed to save hackathon');
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
            {[...Array(15)].map((_, i) => (
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
            onClick={() => navigate('/admin/hackathon')}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Edit Hackathon' : 'Create Hackathon'}
            </h1>
            <p className="text-gray-600 mt-1">
              {isEdit ? 'Update hackathon event' : 'Create a new hackathon event'}
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
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Event Information</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Title */}
            <div className="md:col-span-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Hackathon Title *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Tech Innovation Hackathon 2025"
              />
            </div>

            {/* Theme */}
            <div>
              <label htmlFor="theme" className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <input
                type="text"
                id="theme"
                name="theme"
                value={formData.theme}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Sustainable Technology, AI for Good"
              />
            </div>

            {/* Event Format */}
            <div>
              <label htmlFor="eventFormat" className="block text-sm font-medium text-gray-700 mb-2">
                Event Format *
              </label>
              <select
                id="eventFormat"
                name="eventFormat"
                value={formData.eventFormat}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {eventFormats.map(format => (
                  <option key={format.value} value={format.value}>
                    {format.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Category (Type) */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                Category *
              </label>
              <select
                id="type"
                name="type"
                value={formData.type}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {hackathonTypes.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Location */}
            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                <MapPinIcon className="h-4 w-4 inline mr-1" />
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="City, State or Online"
              />
            </div>

            {/* Venue */}
            <div>
              <label htmlFor="venue" className="block text-sm font-medium text-gray-700 mb-2">
                Venue
              </label>
              <input
                type="text"
                id="venue"
                name="venue"
                value={formData.venue}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Specific venue name or platform"
              />
            </div>

            {/* Max Participants */}
            <div>
              <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                <UserGroupIcon className="h-4 w-4 inline mr-1" />
                Max Participants
              </label>
              <input
                type="number"
                id="maxParticipants"
                name="maxParticipants"
                value={formData.maxParticipants}
                onChange={handleInputChange}
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 500"
              />
            </div>

            {/* Max Team Size */}
            <div>
              <label htmlFor="maxTeamSize" className="block text-sm font-medium text-gray-700 mb-2">
                Max Team Size
              </label>
              <input
                type="number"
                id="maxTeamSize"
                name="maxTeamSize"
                value={formData.maxTeamSize}
                onChange={handleInputChange}
                min="1"
                max="10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., 4"
              />
            </div>

            {/* Status */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {statuses.map(status => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Describe the hackathon event"
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Important Dates</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="registrationStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Registration Start Date *
              </label>
              <input
                type="datetime-local"
                id="registrationStartDate"
                name="registrationStartDate"
                value={formData.registrationStartDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="registrationEndDate" className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Registration End Date *
              </label>
              <input
                type="datetime-local"
                id="registrationEndDate"
                name="registrationEndDate"
                value={formData.registrationEndDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="eventStartDate" className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Event Start Date *
              </label>
              <input
                type="datetime-local"
                id="eventStartDate"
                name="eventStartDate"
                value={formData.eventStartDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="eventEndDate" className="block text-sm font-medium text-gray-700 mb-2">
                <CalendarIcon className="h-4 w-4 inline mr-1" />
                Event End Date *
              </label>
              <input
                type="datetime-local"
                id="eventEndDate"
                name="eventEndDate"
                value={formData.eventEndDate}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Prizes */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Prize Information</h3>
          
          {/* Add Prize */}
          <div className="mb-6 p-4 bg-purple-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Prize</h4>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <input
                  type="text"
                  value={newPrize.position}
                  onChange={(e) => setNewPrize(prev => ({ ...prev, position: e.target.value }))}
                  placeholder="Position (e.g., 1st Place)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newPrize.amount}
                  onChange={(e) => setNewPrize(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="Prize amount (e.g., $5000)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="text"
                  value={newPrize.description}
                  onChange={(e) => setNewPrize(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Description (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <button
                  type="button"
                  onClick={addPrize}
                  className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center justify-center"
                >
                  <TrophyIcon className="h-4 w-4 mr-2" />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Prizes List */}
          {prizes.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Current Prizes</h4>
              {prizes.map((prize, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{prize.position}</p>
                    <p className="text-sm text-green-600 font-medium">{prize.amount}</p>
                    {prize.description && (
                      <p className="text-xs text-gray-600">{prize.description}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removePrize(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sponsors */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Sponsors</h3>
          
          {/* Add Sponsor */}
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Add New Sponsor</h4>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <input
                  type="text"
                  value={newSponsor.name}
                  onChange={(e) => setNewSponsor(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Sponsor name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="url"
                  value={newSponsor.logo}
                  onChange={(e) => setNewSponsor(prev => ({ ...prev, logo: e.target.value }))}
                  placeholder="Logo URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <input
                  type="url"
                  value={newSponsor.website}
                  onChange={(e) => setNewSponsor(prev => ({ ...prev, website: e.target.value }))}
                  placeholder="Website URL"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <select
                  value={newSponsor.tier}
                  onChange={(e) => setNewSponsor(prev => ({ ...prev, tier: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {sponsorTiers.map(tier => (
                    <option key={tier.value} value={tier.value}>
                      {tier.label}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <button
                  type="button"
                  onClick={addSponsor}
                  className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                >
                  <GiftIcon className="h-4 w-4 mr-2" />
                  Add
                </button>
              </div>
            </div>
          </div>

          {/* Sponsors List */}
          {sponsors.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-gray-700">Current Sponsors</h4>
              {sponsors.map((sponsor, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{sponsor.name}</p>
                    <p className="text-xs text-blue-600 capitalize">{sponsor.tier}</p>
                    {sponsor.website && (
                      <a href={sponsor.website} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">
                        Visit Website
                      </a>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => removeSponsor(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Rules & Guidelines */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Rules & Guidelines</h3>
          
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter requirements separated by commas"
              />
            </div>

            {/* Rules */}
            <div>
              <label htmlFor="rules" className="block text-sm font-medium text-gray-700 mb-2">
                Rules
              </label>
              <textarea
                id="rules"
                name="rules"
                value={formData.rules}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Enter rules separated by commas"
              />
            </div>

            {/* Schedule */}
            <div>
              <label htmlFor="schedule" className="block text-sm font-medium text-gray-700 mb-2">
                Event Schedule
              </label>
              <textarea
                id="schedule"
                name="schedule"
                value={formData.schedule}
                onChange={handleInputChange}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Detailed event schedule and timeline"
              />
            </div>

            {/* Submission Guidelines */}
            <div>
              <label htmlFor="submissionGuidelines" className="block text-sm font-medium text-gray-700 mb-2">
                Submission Guidelines
              </label>
              <textarea
                id="submissionGuidelines"
                name="submissionGuidelines"
                value={formData.submissionGuidelines}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Guidelines for project submissions"
              />
            </div>

            {/* Judging Criteria */}
            <div>
              <label htmlFor="judgingCriteria" className="block text-sm font-medium text-gray-700 mb-2">
                Judging Criteria
              </label>
              <input
                type="text"
                id="judgingCriteria"
                name="judgingCriteria"
                value={formData.judgingCriteria}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="e.g., Innovation, Technical Implementation, Presentation"
              />
            </div>
          </div>
        </div>

        {/* File Upload */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-6">Event Materials</h3>
          
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
                ? 'border-purple-400 bg-purple-50' 
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
                  <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-purple-600 hover:text-purple-500">
                    <span>Upload files</span>
                    <input
                      id="file-upload"
                      name="file-upload"
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.ppt,.pptx"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                  <span className="text-gray-600"> or drag and drop</span>
                </p>
                <p className="text-xs text-gray-500">
                  Event materials, presentations, and resources up to 10MB each
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

        {/* Participants & Teams Summary (for edit mode) */}
        {isEdit && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Current Registration</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="text-sm text-gray-600">
                <h4 className="font-medium text-gray-900 mb-2">Participants</h4>
                <p>{participants.length} total registered</p>
                <p>{participants.filter(p => p.status === 'confirmed').length} confirmed</p>
                <p>{participants.filter(p => p.status === 'pending').length} pending confirmation</p>
              </div>
              <div className="text-sm text-gray-600">
                <h4 className="font-medium text-gray-900 mb-2">Teams</h4>
                <p>{teams.length} teams formed</p>
                <p>{teams.filter(t => t.status === 'active').length} active teams</p>
                <p>{teams.reduce((sum, t) => sum + t.members.length, 0)} total team members</p>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex items-center justify-end space-x-4 pt-6">
          <button
            type="button"
            onClick={() => navigate('/admin/hackathon')}
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
            <span>{saving ? 'Saving...' : (isEdit ? 'Update Hackathon' : 'Create Hackathon')}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default HackathonForm;