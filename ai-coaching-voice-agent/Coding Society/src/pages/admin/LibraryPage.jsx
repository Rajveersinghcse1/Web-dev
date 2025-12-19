import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
    Book, 
    Plus, 
    Search, 
    Filter, 
    Edit, 
    Trash2, 
    Eye, 
    Upload, 
    Download, 
    FileText, 
    Video, 
    Image, 
    Code,
    Save,
    X,
    ChevronDown,
    Star,
    Clock,
    User,
    MoreHorizontal,
    Heart,
    Share2,
    BookOpen
} from 'lucide-react';

const LibraryPage = () => {
    const [contents, setContents] = useState([]);
    const [filteredContents, setFilteredContents] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedType, setSelectedType] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // create, edit, view
    const [currentContent, setCurrentContent] = useState(null);
    const [loading, setLoading] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // grid or list
    const [selectedFiles, setSelectedFiles] = useState([]);

    const categories = ['All', 'Programming', 'Web Development', 'Mobile Dev', 'AI/ML', 'Database', 'DevOps', 'UI/UX'];
    const contentTypes = ['All', 'Article', 'Video', 'PDF', 'Code', 'Tutorial', 'Documentation'];
    const difficulties = ['Beginner', 'Intermediate', 'Advanced', 'Expert'];

    useEffect(() => {
        fetchContents();
    }, []);

    useEffect(() => {
        filterContents();
    }, [searchQuery, selectedCategory, selectedType, contents]);

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchContents = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/v1/admin/library', getAuthHeader());
            if (response.data.success) {
                setContents(response.data.data.content);
            }
        } catch (error) {
            console.error('Error fetching contents:', error);
            toast.error('Failed to fetch library content');
        } finally {
            setLoading(false);
        }
    };

    const filterContents = () => {
        let filtered = contents;

        if (searchQuery) {
            filtered = filtered.filter(content =>
                content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                content.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                content.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        if (selectedCategory !== 'All') {
            filtered = filtered.filter(content => content.category === selectedCategory);
        }

        if (selectedType !== 'All') {
            filtered = filtered.filter(content => content.type === selectedType);
        }

        setFilteredContents(filtered);
    };

    const handleCreate = () => {
        setCurrentContent({
            title: '',
            description: '',
            category: 'Programming',
            type: 'Article',
            difficulty: 'Beginner',
            tags: [],
            status: 'published'
        });
        setSelectedFiles([]);
        setModalMode('create');
        setShowModal(true);
    };

    const handleEdit = (content) => {
        setCurrentContent({ ...content });
        setSelectedFiles([]);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleView = (content) => {
        setCurrentContent(content);
        setModalMode('view');
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this content?')) {
            try {
                await axios.delete(`http://localhost:5000/api/v1/admin/library/${id}`, getAuthHeader());
                setContents(prev => prev.filter(content => content._id !== id));
                toast.success('Content deleted successfully');
            } catch (error) {
                console.error('Error deleting content:', error);
                toast.error('Failed to delete content');
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
            formData.append('title', currentContent.title);
            formData.append('description', currentContent.description);
            formData.append('category', currentContent.category);
            formData.append('type', currentContent.type);
            formData.append('difficulty', currentContent.difficulty);
            formData.append('status', currentContent.status || 'published');
            
            if (currentContent.tags && Array.isArray(currentContent.tags)) {
                formData.append('tags', currentContent.tags.join(','));
            }

            selectedFiles.forEach(file => {
                formData.append('files', file);
            });

            if (modalMode === 'create') {
                const response = await axios.post(
                    'http://localhost:5000/api/v1/admin/library', 
                    formData, 
                    {
                        headers: {
                            ...getAuthHeader().headers,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                if (response.data.success) {
                    setContents(prev => [response.data.data, ...prev]);
                    toast.success('Content created successfully');
                }
            } else if (modalMode === 'edit') {
                const response = await axios.put(
                    `http://localhost:5000/api/v1/admin/library/${currentContent._id}`, 
                    formData,
                    {
                        headers: {
                            ...getAuthHeader().headers,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );
                if (response.data.success) {
                    setContents(prev =>
                        prev.map(content =>
                            content._id === currentContent._id ? response.data.data : content
                        )
                    );
                    toast.success('Content updated successfully');
                }
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error saving content:', error);
            toast.error(error.response?.data?.message || 'Failed to save content');
        } finally {
            setLoading(false);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Video': return <Video className="w-4 h-4" />;
            case 'PDF': return <FileText className="w-4 h-4" />;
            case 'Code': return <Code className="w-4 h-4" />;
            case 'Image': return <Image className="w-4 h-4" />;
            default: return <FileText className="w-4 h-4" />;
        }
    };

    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case 'Beginner': return 'bg-green-100 text-green-800';
            case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
            case 'Advanced': return 'bg-orange-100 text-orange-800';
            case 'Expert': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Published': return 'bg-green-100 text-green-800 border-green-200';
            case 'Draft': return 'bg-gray-100 text-gray-800 border-gray-200';
            case 'Review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'Archived': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-6 mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-purple-500 to-blue-600 p-3 rounded-xl">
                                <Book className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Library Management</h1>
                                <p className="text-gray-600">Manage educational content and resources</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCreate}
                            className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Content</span>
                        </motion.button>
                    </div>

                    {/* Filters and Stats */}
                    <div className="space-y-4">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4 rounded-xl text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100 text-sm">Total Content</p>
                                        <p className="text-2xl font-bold">{contents.length}</p>
                                    </div>
                                    <BookOpen className="w-8 h-8 text-blue-200" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 p-4 rounded-xl text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100 text-sm">Published</p>
                                        <p className="text-2xl font-bold">{contents.filter(c => c.status === 'published').length}</p>
                                    </div>
                                    <Star className="w-8 h-8 text-green-200" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 p-4 rounded-xl text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100 text-sm">Total Views</p>
                                        <p className="text-2xl font-bold">{contents.reduce((sum, c) => sum + c.views, 0).toLocaleString()}</p>
                                    </div>
                                    <Eye className="w-8 h-8 text-purple-200" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 p-4 rounded-xl text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-100 text-sm">Downloads</p>
                                        <p className="text-2xl font-bold">{contents.reduce((sum, c) => sum + c.downloads, 0)}</p>
                                    </div>
                                    <Download className="w-8 h-8 text-orange-200" />
                                </div>
                            </div>
                        </div>

                        {/* Search and Filters */}
                        <div className="flex flex-wrap gap-4 items-center justify-between">
                            <div className="flex flex-wrap gap-4 flex-1">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                    <input
                                        type="text"
                                        placeholder="Search content..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent w-80"
                                    />
                                </div>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    {categories.map(category => (
                                        <option key={category} value={category}>{category}</option>
                                    ))}
                                </select>
                                <select
                                    value={selectedType}
                                    onChange={(e) => setSelectedType(e.target.value)}
                                    className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                >
                                    {contentTypes.map(type => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                                <span className="text-sm text-gray-600">View:</span>
                                <div className="flex border border-gray-200 rounded-lg overflow-hidden">
                                    <button
                                        onClick={() => setViewMode('grid')}
                                        className={`p-2 ${viewMode === 'grid' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                                            <div className="bg-current rounded-sm"></div>
                                            <div className="bg-current rounded-sm"></div>
                                            <div className="bg-current rounded-sm"></div>
                                            <div className="bg-current rounded-sm"></div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setViewMode('list')}
                                        className={`p-2 ${viewMode === 'list' ? 'bg-purple-100 text-purple-600' : 'text-gray-600 hover:bg-gray-50'}`}
                                    >
                                        <div className="w-4 h-4 flex flex-col gap-1">
                                            <div className="bg-current h-0.5 rounded"></div>
                                            <div className="bg-current h-0.5 rounded"></div>
                                            <div className="bg-current h-0.5 rounded"></div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Content Grid/List */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600"></div>
                    </div>
                ) : (
                    <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}`}>
                        <AnimatePresence>
                            {filteredContents.map((content, index) => (
                                viewMode === 'grid' ? (
                                    <motion.div
                                        key={content._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                                    >
                                        <div className="relative">
                                            <img 
                                                src={content.thumbnailUrl || '/api/placeholder/300/200'} 
                                                alt={content.title}
                                                className="w-full h-48 object-cover bg-gradient-to-br from-purple-400 to-blue-500"
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                    e.target.nextSibling.style.display = 'flex';
                                                }}
                                            />
                                        <div className="w-full h-48 bg-gradient-to-br from-purple-400 to-blue-500 hidden items-center justify-center">
                                            <div className="text-white">
                                                {getTypeIcon(content.type)}
                                            </div>
                                        </div>
                                        <div className="absolute top-4 left-4 flex items-center space-x-2">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(content.difficulty)}`}>
                                                {content.difficulty}
                                            </span>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(content.status)}`}>
                                                {content.status}
                                            </span>
                                        </div>
                                        <div className="absolute top-4 right-4">
                                            <div className="bg-white/90 backdrop-blur-sm rounded-lg p-2">
                                                <div className="flex items-center space-x-1">
                                                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                    <span className="text-sm font-semibold">{content.rating}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="flex space-x-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    onClick={() => handleView(content)}
                                                    className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-blue-600 rounded-lg transition-colors shadow-lg"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-red-500 rounded-lg transition-colors shadow-lg"
                                                >
                                                    <Heart className="w-4 h-4" />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.9 }}
                                                    className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 hover:text-green-500 rounded-lg transition-colors shadow-lg"
                                                >
                                                    <Share2 className="w-4 h-4" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6">
                                        <div className="flex items-center space-x-2 mb-3">
                                            <div className="flex items-center space-x-2 text-purple-600">
                                                {getTypeIcon(content.type)}
                                                <span className="text-sm font-medium">{content.type}</span>
                                            </div>
                                            <span className="text-sm text-gray-400">•</span>
                                            <span className="text-sm text-gray-600">{content.category}</span>
                                            <span className="text-sm text-gray-400">•</span>
                                            <div className="flex items-center space-x-1">
                                                <Clock className="w-3 h-3 text-gray-400" />
                                                <span className="text-sm text-gray-500">{content.readTime}</span>
                                            </div>
                                        </div>
                                        
                                        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-purple-600 transition-colors">
                                            {content.title}
                                        </h3>
                                        
                                        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                                            {content.description}
                                        </p>
                                        
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {content.tags?.slice(0, 3).map(tag => (
                                                <span key={tag} className="px-2 py-1 bg-gradient-to-r from-purple-100 to-blue-100 text-purple-700 rounded-lg text-xs font-medium border border-purple-200">
                                                    {tag}
                                                </span>
                                            ))}
                                            {content.tags?.length > 3 && (
                                                <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                                                    +{content.tags.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                        
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                <div className="flex items-center space-x-1">
                                                    <Eye className="w-4 h-4" />
                                                    <span>{content.views?.toLocaleString()}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Heart className="w-4 h-4" />
                                                    <span>{content.likes}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <Download className="w-4 h-4" />
                                                    <span>{content.downloads}</span>
                                                </div>
                                            </div>
                                            <span className="text-xs text-gray-400 font-medium">{content.fileSize}</span>
                                        </div>
                                        
                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex items-center space-x-3">
                                                <img 
                                                    src={content.uploadedBy?.profile?.avatar || '/api/placeholder/32/32'} 
                                                    alt={content.uploadedBy?.username || 'User'}
                                                    className="w-8 h-8 rounded-full object-cover"
                                                />
                                                <div>
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {content.uploadedBy?.profile?.firstName 
                                                            ? `${content.uploadedBy.profile.firstName} ${content.uploadedBy.profile.lastName || ''}`
                                                            : (content.uploadedBy?.username || 'Unknown Author')}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(content.updatedAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex space-x-1">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleEdit(content)}
                                                    className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-all duration-200"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => handleDelete(content._id)}
                                                    className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </motion.button>
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-all duration-200"
                                                >
                                                    <MoreHorizontal className="w-4 h-4" />
                                                </motion.button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                                ) : (
                                    // List View
                                    <motion.div
                                        key={content._id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 p-6"
                                    >
                                        <div className="flex items-center space-x-6">
                                            <div className="flex-shrink-0">
                                                <img 
                                                    src={content.thumbnailUrl || '/api/placeholder/300/200'} 
                                                    alt={content.title}
                                                    className="w-24 h-24 object-cover rounded-lg bg-gradient-to-br from-purple-400 to-blue-500"
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                        e.target.nextSibling.style.display = 'flex';
                                                    }}
                                                />
                                                <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-blue-500 hidden items-center justify-center rounded-lg">
                                                    <div className="text-white">
                                                        {getTypeIcon(content.type)}
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-2">
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getDifficultyColor(content.difficulty)}`}>
                                                        {content.difficulty}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getStatusColor(content.status)}`}>
                                                        {content.status}
                                                    </span>
                                                    <div className="flex items-center space-x-1 text-purple-600">
                                                        {getTypeIcon(content.type)}
                                                        <span className="text-sm">{content.type}</span>
                                                    </div>
                                                </div>
                                                
                                                <h3 className="text-xl font-bold text-gray-900 mb-2 truncate">
                                                    {content.title}
                                                </h3>
                                                
                                                <p className="text-gray-600 mb-3 line-clamp-2">
                                                    {content.description}
                                                </p>
                                                
                                                <div className="flex flex-wrap gap-2 mb-3">
                                                    {content.tags?.slice(0, 4).map(tag => (
                                                        <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                                                            {tag}
                                                        </span>
                                                    ))}
                                                </div>
                                                
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                                                        <div className="flex items-center space-x-1">
                                                            <User className="w-4 h-4" />
                                                            <span>{content.uploadedBy?.username || 'Unknown'}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Eye className="w-4 h-4" />
                                                            <span>{content.views?.toLocaleString()}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                            <span>{content.rating}</span>
                                                        </div>
                                                        <div className="flex items-center space-x-1">
                                                            <Clock className="w-4 h-4" />
                                                            <span>{content.readTime}</span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex space-x-2">
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleView(content)}
                                                            className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleEdit(content)}
                                                            className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                        </motion.button>
                                                        <motion.button
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                            onClick={() => handleDelete(content._id)}
                                                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </motion.button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
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
                                className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="p-6 border-b border-gray-200">
                                    <div className="flex items-center justify-between">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {modalMode === 'create' ? 'Add New Content' : 
                                             modalMode === 'edit' ? 'Edit Content' : 'View Content'}
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
                                                Title *
                                            </label>
                                            <input
                                                type="text"
                                                value={currentContent?.title || ''}
                                                onChange={(e) => setCurrentContent(prev => ({ ...prev, title: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                                                placeholder="Enter content title"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Category *
                                            </label>
                                            <select
                                                value={currentContent?.category || ''}
                                                onChange={(e) => setCurrentContent(prev => ({ ...prev, category: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                                            >
                                                {categories.slice(1).map(category => (
                                                    <option key={category} value={category}>{category}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Content Type *
                                            </label>
                                            <select
                                                value={currentContent?.type || ''}
                                                onChange={(e) => setCurrentContent(prev => ({ ...prev, type: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                                            >
                                                {contentTypes.slice(1).map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Difficulty Level *
                                            </label>
                                            <select
                                                value={currentContent?.difficulty || ''}
                                                onChange={(e) => setCurrentContent(prev => ({ ...prev, difficulty: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                                            >
                                                {difficulties.map(difficulty => (
                                                    <option key={difficulty} value={difficulty}>{difficulty}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            value={currentContent?.description || ''}
                                            onChange={(e) => setCurrentContent(prev => ({ ...prev, description: e.target.value }))}
                                            disabled={modalMode === 'view'}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent disabled:bg-gray-50"
                                            placeholder="Enter content description"
                                        />
                                    </div>
                                    
                                    {modalMode !== 'view' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Upload File
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-400 transition-colors">
                                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    id="file-upload"
                                                    multiple
                                                    accept=".pdf,.doc,.docx,.mp4,.avi,.jpg,.jpeg,.png,.zip"
                                                    onChange={handleFileChange}
                                                />
                                                <label
                                                    htmlFor="file-upload"
                                                    className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-lg cursor-pointer hover:bg-purple-200 transition-colors"
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
                                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold flex items-center space-x-2 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                                        >
                                            <Save className="w-5 h-5" />
                                            <span>{loading ? 'Saving...' : 'Save Content'}</span>
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

export default LibraryPage;