import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

    const categories = ['All', 'AI/ML', 'Blockchain', 'IoT', 'Web3', 'FinTech', 'HealthTech', 'EdTech', 'GreenTech', 'Other'];
    const statuses = ['All', 'Concept', 'In Development', 'Prototype', 'Testing', 'Launched', 'Paused'];
    const stages = ['Idea', 'Research', 'Development', 'Testing', 'Launch', 'Scaling'];

    // Mock data
    const mockInnovations = [
        {
            id: '1',
            title: 'AI-Powered Code Review Assistant',
            description: 'An intelligent system that automatically reviews code for bugs, security issues, and optimization opportunities using machine learning.',
            category: 'AI/ML',
            status: 'In Development',
            stage: 'Development',
            innovator: 'Alice Johnson',
            team: ['Alice Johnson', 'Bob Smith', 'Carol Davis'],
            startDate: '2024-01-15',
            expectedLaunch: '2024-06-30',
            progress: 65,
            budget: 50000,
            funding: 32500,
            rating: 4.7,
            votes: 156,
            views: 2340,
            tags: ['AI', 'Code Review', 'Machine Learning', 'DevTools'],
            imageUrl: '/images/ai-code-review.jpg',
            demoUrl: 'https://demo.ai-code-review.com',
            githubUrl: 'https://github.com/innovation/ai-code-review'
        },
        {
            id: '2',
            title: 'Sustainable Energy Management Platform',
            description: 'IoT-based platform for optimizing energy consumption in smart buildings using renewable energy sources.',
            category: 'GreenTech',
            status: 'Prototype',
            stage: 'Testing',
            innovator: 'David Wilson',
            team: ['David Wilson', 'Emma Brown', 'Frank Miller'],
            startDate: '2024-02-01',
            expectedLaunch: '2024-08-15',
            progress: 80,
            budget: 75000,
            funding: 60000,
            rating: 4.9,
            votes: 203,
            views: 1876,
            tags: ['IoT', 'Energy', 'Sustainability', 'Smart Buildings'],
            imageUrl: '/images/energy-platform.jpg',
            demoUrl: 'https://demo.energy-platform.com',
            githubUrl: 'https://github.com/innovation/energy-platform'
        }
    ];

    useEffect(() => {
        fetchInnovations();
    }, []);

    useEffect(() => {
        filterInnovations();
    }, [searchQuery, selectedCategory, selectedStatus, innovations]);

    const fetchInnovations = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setInnovations(mockInnovations);
        } catch (error) {
            console.error('Error fetching innovations:', error);
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
                innovation.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
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
            category: 'AI/ML',
            status: 'Concept',
            stage: 'Idea',
            innovator: '',
            team: [],
            startDate: '',
            expectedLaunch: '',
            progress: 0,
            budget: 0,
            funding: 0,
            tags: []
        });
        setModalMode('create');
        setShowModal(true);
    };

    const handleEdit = (innovation) => {
        setCurrentInnovation({ ...innovation });
        setModalMode('edit');
        setShowModal(true);
    };

    const handleView = (innovation) => {
        setCurrentInnovation(innovation);
        setModalMode('view');
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this innovation?')) {
            setInnovations(prev => prev.filter(innovation => innovation.id !== id));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (modalMode === 'create') {
                const newInnovation = {
                    ...currentInnovation,
                    id: Date.now().toString(),
                    rating: 0,
                    votes: 0,
                    views: 0
                };
                setInnovations(prev => [...prev, newInnovation]);
            } else if (modalMode === 'edit') {
                setInnovations(prev =>
                    prev.map(innovation =>
                        innovation.id === currentInnovation.id ? currentInnovation : innovation
                    )
                );
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error saving innovation:', error);
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
                                    key={innovation.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-3">
                                                {getCategoryIcon(innovation.category)}
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900">
                                                        {innovation.title}
                                                    </h3>
                                                    <div className="flex items-center space-x-2 mt-1">
                                                        <span className="text-sm text-gray-500">{innovation.category}</span>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(innovation.status)}`}>
                                                            {innovation.status}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="text-sm font-semibold">{innovation.rating}</span>
                                            </div>
                                        </div>
                                        
                                        <p className="text-gray-600 mb-4 line-clamp-3">
                                            {innovation.description}
                                        </p>
                                        
                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Progress</span>
                                                <span className="text-sm text-gray-500">{innovation.progress}%</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${innovation.progress}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        {/* Stats */}
                                        <div className="grid grid-cols-3 gap-4 mb-4">
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">${innovation.funding?.toLocaleString()}</div>
                                                <div className="text-xs text-gray-500">Funded</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{innovation.votes}</div>
                                                <div className="text-xs text-gray-500">Votes</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-lg font-bold text-gray-900">{innovation.views}</div>
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
                                                {innovation.team?.slice(0, 4).map((member, idx) => (
                                                    <div
                                                        key={idx}
                                                        className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-400 to-red-400 flex items-center justify-center text-white text-xs font-semibold border-2 border-white"
                                                    >
                                                        {member.split(' ').map(n => n[0]).join('')}
                                                    </div>
                                                ))}
                                                {innovation.team?.length > 4 && (
                                                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-semibold border-2 border-white">
                                                        +{innovation.team.length - 4}
                                                    </div>
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
                                                <span>Started: {innovation.startDate}</span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <TrendingUp className="w-4 h-4" />
                                                <span>Launch: {innovation.expectedLaunch}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Actions */}
                                        <div className="flex items-center justify-between">
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
                                                    onClick={() => handleDelete(innovation.id)}
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
                                                />
                                                <label
                                                    htmlFor="file-upload"
                                                    className="inline-block px-4 py-2 bg-orange-100 text-orange-700 rounded-lg cursor-pointer hover:bg-orange-200 transition-colors"
                                                >
                                                    Choose Files
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