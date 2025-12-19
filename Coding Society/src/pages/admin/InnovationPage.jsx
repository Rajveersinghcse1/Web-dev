import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
    Lightbulb, 
    Plus, 
    Search, 
    Filter, 
    Edit, 
    Trash2, 
    Eye, 
    Upload, 
    Download, 
    Zap, 
    Rocket, 
    Star,
    Save,
    X,
    ChevronDown,
    Calendar,
    User,
    TrendingUp,
    Award,
    ExternalLink
} from 'lucide-react';

const InnovationPage = () => {
    const [innovations, setInnovations] = useState([]);
    const [filteredInnovations, setFilteredInnovations] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentInnovation, setCurrentInnovation] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const categories = ['All', 'web_application', 'mobile_app', 'ai_ml', 'blockchain', 'iot', 'cybersecurity', 'fintech', 'healthtech', 'edtech', 'gaming', 'social_impact', 'sustainability', 'productivity', 'entertainment', 'other'];
    const statuses = ['All', 'idea', 'planning', 'in_progress', 'testing', 'completed', 'deployed', 'maintenance', 'paused', 'cancelled'];
    const stages = ['Idea', 'Research', 'Development', 'Testing', 'Launch', 'Scaling'];
    const difficulties = ['beginner', 'intermediate', 'advanced', 'expert'];
    const types = ['prototype', 'mvp', 'full_product', 'research', 'concept'];

    useEffect(() => {
        fetchInnovations();
    }, []);

    useEffect(() => {
        filterInnovations();
    }, [searchQuery, selectedCategory, selectedStatus, innovations]);

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchInnovations = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/v1/admin/innovation', getAuthHeader());
            if (response.data.success) {
                setInnovations(response.data.data.projects);
            }
        } catch (error) {
            console.error('Error fetching innovations:', error);
            toast.error('Failed to fetch innovation projects');
        } finally {
            setLoading(false);
        }
    };

    const filterInnovations = () => {
        let filtered = innovations;

        if (searchQuery) {
            filtered = filtered.filter(innovation =>
                innovation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                innovation.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                innovation.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(innovation => innovation.category === selectedCategory);
        }

        if (selectedStatus !== 'All') {
            filtered = filtered.filter(innovation => innovation.status === selectedStatus);
        }

        setFilteredInnovations(filtered);
    };

    const handleCreate = () => {
        setCurrentInnovation({
            title: '',
            description: '',
            category: 'web_application',
            status: 'idea',
            stage: 'Idea',
            difficulty: 'intermediate',
            type: 'concept',
            tags: [],
            techStack: [],
            requirements: [],
            objectives: []
        });
        setSelectedFiles([]);
        setModalMode('create');
        setShowModal(true);
    };

    const handleEdit = (innovation) => {
        setCurrentInnovation({ ...innovation });
        setSelectedFiles([]);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleView = (innovation) => {
        setCurrentInnovation(innovation);
        setModalMode('view');
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this innovation project?')) {
            try {
                const response = await axios.delete(`http://localhost:5000/api/v1/admin/innovation/${id}`, getAuthHeader());
                if (response.data.success) {
                    setInnovations(prev => prev.filter(inv => inv._id !== id));
                    toast.success('Innovation project deleted successfully');
                }
            } catch (error) {
                console.error('Error deleting innovation:', error);
                toast.error('Failed to delete innovation project');
            }
        }
    };

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append('title', currentInnovation.title);
            formData.append('description', currentInnovation.description);
            formData.append('category', currentInnovation.category);
            formData.append('status', currentInnovation.status);
            formData.append('difficulty', currentInnovation.difficulty);
            formData.append('type', currentInnovation.type);
            
            if (currentInnovation.tags) formData.append('tags', Array.isArray(currentInnovation.tags) ? currentInnovation.tags.join(',') : currentInnovation.tags);
            if (currentInnovation.techStack) formData.append('techStack', Array.isArray(currentInnovation.techStack) ? currentInnovation.techStack.join(',') : currentInnovation.techStack);
            if (currentInnovation.requirements) formData.append('requirements', Array.isArray(currentInnovation.requirements) ? currentInnovation.requirements.join(',') : currentInnovation.requirements);
            if (currentInnovation.objectives) formData.append('objectives', Array.isArray(currentInnovation.objectives) ? currentInnovation.objectives.join(',') : currentInnovation.objectives);

            selectedFiles.forEach(file => {
                formData.append('files', file);
            });

            if (modalMode === 'create') {
                const response = await axios.post(
                    'http://localhost:5000/api/v1/admin/innovation',
                    formData,
                    {
                        headers: {
                            ...getAuthHeader().headers,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                if (response.data.success) {
                    setInnovations(prev => [response.data.data, ...prev]);
                    toast.success('Innovation project created successfully');
                }
            } else if (modalMode === 'edit') {
                const response = await axios.put(
                    `http://localhost:5000/api/v1/admin/innovation/${currentInnovation._id}`,
                    formData,
                    {
                        headers: {
                            ...getAuthHeader().headers,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                if (response.data.success) {
                    setInnovations(prev =>
                        prev.map(inv =>
                            inv._id === currentInnovation._id ? response.data.data : inv
                        )
                    );
                    toast.success('Innovation project updated successfully');
                }
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error saving innovation:', error);
            toast.error(error.response?.data?.message || 'Failed to save innovation project');
        } finally {
            setLoading(false);
        }
    };



    const getStatusColor = (status) => {
        switch (status) {
            case 'Concept': return 'bg-gray-100 text-gray-800';
            case 'In Development': return 'bg-blue-100 text-blue-800';
            case 'Prototype': return 'bg-yellow-100 text-yellow-800';
            case 'Testing': return 'bg-orange-100 text-orange-800';
            case 'Launched': return 'bg-green-100 text-green-800';
            case 'Paused': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getCategoryIcon = (category) => {
        switch (category) {
            case 'AI/ML': return <Zap className="w-4 h-4" />;
            case 'Blockchain': return <Star className="w-4 h-4" />;
            case 'IoT': return <Rocket className="w-4 h-4" />;
            default: return <Lightbulb className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-6 mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-orange-500 to-red-600 p-3 rounded-xl">
                                <Lightbulb className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Innovation Hub</h1>
                                <p className="text-gray-600">Manage breakthrough projects and ideas</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCreate}
                            className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <Plus className="w-5 h-5" />
                            <span>New Innovation</span>
                        </motion.button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search innovations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent w-80"
                            />
                        </div>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            {categories.map(category => (
                                <option key={category} value={category}>{category}</option>
                            ))}
                        </select>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                            {statuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>
                </motion.div>

                {/* Innovation Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <AnimatePresence>
                            {filteredInnovations.map((innovation, index) => (
                                <motion.div
                                    key={innovation._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                                >
                                    <div className="relative h-48 overflow-hidden">
                                        <img 
                                            src={innovation.imageUrl || '/api/placeholder/400/300'} 
                                            alt={innovation.title}
                                            className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                                            onError={(e) => {
                                                e.target.style.display = 'none';
                                                e.target.nextSibling.style.display = 'flex';
                                            }}
                                        />
                                        <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 hidden items-center justify-center">
                                            <Lightbulb className="w-12 h-12 text-white" />
                                        </div>
                                        <div className="absolute top-4 left-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm text-blue-600 shadow-lg`}>
                                                {innovation.category}
                                            </span>
                                        </div>
                                        <div className="absolute top-4 right-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-white/90 backdrop-blur-sm ${
                                                innovation.status === 'completed' ? 'text-green-600' : 'text-orange-600'
                                            } shadow-lg`}>
                                                {innovation.status}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                {getCategoryIcon(innovation.category)}
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                                        {innovation.title}
                                                    </h3>
                                                    <div className="flex items-center space-x-2">
                                                        <span className="text-sm text-gray-500">{innovation.category}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="text-sm font-semibold">{innovation.rating || '0.0'}</span>
                                            </div>
                                        </div>
                                        
                                        <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                                            {innovation.description}
                                        </p>
                                        
                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                                <span className="text-sm text-gray-500">{innovation.progress || 0}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                <div 
                                                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${innovation.progress || 0}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">${innovation.funding?.toLocaleString() || 0}</div>
                                                <div className="text-xs text-gray-500">Funded</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{innovation.votes || 0}</div>
                                                <div className="text-xs text-gray-500">Votes</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{innovation.views || 0}</div>
                                                <div className="text-xs text-gray-500">Views</div>
                                            </div>
                                        </div>
                                        
                                        {/* Team */}
                                        <div className="mb-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">Team</span>
                                            </div>
                                            <div className="flex -space-x-2">
                                                {innovation.collaborators?.slice(0, 4).map((member, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                                                        title={member.name}
                                                    >
                                                        {member.name ? member.name[0] : 'U'}
                                                    </div>
                                                ))}
                                                {innovation.collaborators?.length > 4 && (
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white">
                                                        +{innovation.collaborators.length - 4}
                                                    </div>
                                                )}
                                                {(!innovation.collaborators || innovation.collaborators.length === 0) && (
                                                    <span className="text-sm text-gray-400 ml-2">No team members</span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-1 mb-4">
                                            {innovation.tags?.slice(0, 4).map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-orange-100 text-orange-800 rounded-lg text-xs">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                        
                                        {/* Timeline */}
                                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                            <div className="flex items-center space-x-1">
                                                <Calendar className="w-4 h-4" />
                                                <span>Started: {innovation.startDate ? new Date(innovation.startDate).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <TrendingUp className="w-4 h-4" />
                                                <span>Launch: {innovation.expectedLaunch ? new Date(innovation.expectedLaunch).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Actions */}
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex space-x-2">
                                                {innovation.demoUrl && (
                                                    <a
                                                        href={innovation.demoUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {innovation.githubUrl && (
                                                    <a
                                                        href={innovation.githubUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                                                    >
                                                        <Award className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleView(innovation)}
                                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(innovation)}
                                                    className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(innovation._id)}
                                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {/* Modal */}
                <AnimatePresence>
                    {showModal && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
                            onClick={() => setShowModal(false)}
                        >
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.9, opacity: 0 }}
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {modalMode === 'create' ? 'Create New Innovation' : 
                                             modalMode === 'edit' ? 'Edit Innovation' : 'Innovation Details'}
                                        </h2>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
                                        >
                                            <X className="w-6 h-6" />
                                        </button>
                                    </div>
                                </div>
                                
                                <div className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Innovation Title *
                                            </label>
                                            <input
                                                type="text"
                                                value={currentInnovation?.title || ''}
                                                onChange={(e) => setCurrentInnovation(prev => ({ ...prev, title: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                                placeholder="Enter innovation title"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Category *
                                            </label>
                                            <select
                                                value={currentInnovation?.category || ''}
                                                onChange={(e) => setCurrentInnovation(prev => ({ ...prev, category: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            >
                                                {categories.slice(1).map(category => (
                                                    <option key={category} value={category}>{category}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status *
                                            </label>
                                            <select
                                                value={currentInnovation?.status || ''}
                                                onChange={(e) => setCurrentInnovation(prev => ({ ...prev, status: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            >
                                                {statuses.slice(1).map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Development Stage
                                            </label>
                                            <select
                                                value={currentInnovation?.stage || ''}
                                                onChange={(e) => setCurrentInnovation(prev => ({ ...prev, stage: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            >
                                                {stages.map(stage => (
                                                    <option key={stage} value={stage}>{stage}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Difficulty
                                            </label>
                                            <select
                                                value={currentInnovation?.difficulty || ''}
                                                onChange={(e) => setCurrentInnovation(prev => ({ ...prev, difficulty: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            >
                                                {difficulties.map(diff => (
                                                    <option key={diff} value={diff}>{diff}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Project Type
                                            </label>
                                            <select
                                                value={currentInnovation?.type || ''}
                                                onChange={(e) => setCurrentInnovation(prev => ({ ...prev, type: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            >
                                                {types.map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Lead Innovator *
                                            </label>
                                            <input
                                                type="text"
                                                value={currentInnovation?.innovator || ''}
                                                onChange={(e) => setCurrentInnovation(prev => ({ ...prev, innovator: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                                placeholder="Enter lead innovator name"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Progress (%)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                max="100"
                                                value={currentInnovation?.progress || 0}
                                                onChange={(e) => setCurrentInnovation(prev => ({ ...prev, progress: parseInt(e.target.value) }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Start Date
                                            </label>
                                            <input
                                                type="date"
                                                value={currentInnovation?.startDate || ''}
                                                onChange={(e) => setCurrentInnovation(prev => ({ ...prev, startDate: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Expected Launch
                                            </label>
                                            <input
                                                type="date"
                                                value={currentInnovation?.expectedLaunch || ''}
                                                onChange={(e) => setCurrentInnovation(prev => ({ ...prev, expectedLaunch: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Total Budget ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={currentInnovation?.budget || 0}
                                                onChange={(e) => setCurrentInnovation(prev => ({ ...prev, budget: parseFloat(e.target.value) }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                                placeholder="0"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Current Funding ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={currentInnovation?.funding || 0}
                                                onChange={(e) => setCurrentInnovation(prev => ({ ...prev, funding: parseFloat(e.target.value) }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                                placeholder="0"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            value={currentInnovation?.description || ''}
                                            onChange={(e) => setCurrentInnovation(prev => ({ ...prev, description: e.target.value }))}
                                            disabled={modalMode === 'view'}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                            placeholder="Describe your innovative idea..."
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Demo URL
                                            </label>
                                            <input
                                                type="url"
                                                value={currentInnovation?.demoUrl || ''}
                                                onChange={(e) => setCurrentInnovation(prev => ({ ...prev, demoUrl: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                                placeholder="https://demo.example.com"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                GitHub Repository
                                            </label>
                                            <input
                                                type="url"
                                                value={currentInnovation?.githubUrl || ''}
                                                onChange={(e) => setCurrentInnovation(prev => ({ ...prev, githubUrl: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:bg-gray-50"
                                                placeholder="https://github.com/username/repo"
                                            />
                                        </div>
                                    </div>
                                    
                                    {modalMode !== 'view' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Upload Images/Documents
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-orange-400 transition-colors">
                                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    id="file-upload"
                                                    multiple
                                                    accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,.ppt,.pptx"
                                                    onChange={handleFileChange}
                                                />
                                                <label
                                                    htmlFor="file-upload"
                                                    className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-lg cursor-pointer hover:bg-orange-200 transition-colors"
                                                >
                                                    {selectedFiles.length > 0 ? `${selectedFiles.length} files selected` : 'Choose Files'}
                                                </label>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                
                                {modalMode !== 'view' && (
                                    <div className="p-6 border-t border-gray-200 flex justify-end space-x-4">
                                        <button
                                            onClick={() => setShowModal(false)}
                                            className="px-6 py-3 text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-semibold flex items-center space-x-2 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                                        >
                                            <Save className="w-5 h-5" />
                                            <span>{loading ? 'Saving...' : 'Save Innovation'}</span>
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default InnovationPage;