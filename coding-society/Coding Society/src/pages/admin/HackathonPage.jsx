import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Code, 
    Plus, 
    Search, 
    Filter, 
    Edit, 
    Trash2, 
    Eye, 
    Upload, 
    Download, 
    Trophy, 
    Calendar, 
    Users,
    Save,
    X,
    ChevronDown,
    Star,
    Clock,
    User,
    MapPin,
    DollarSign,
    Award,
    ExternalLink,
    Zap,
    Target
} from 'lucide-react';

const HackathonPage = () => {
    const [hackathons, setHackathons] = useState([]);
    const [filteredHackathons, setFilteredHackathons] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('All');
    const [selectedType, setSelectedType] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentHackathon, setCurrentHackathon] = useState(null);
    const [loading, setLoading] = useState(false);

    const statuses = ['All', 'Upcoming', 'Registration Open', 'In Progress', 'Judging', 'Completed', 'Cancelled'];
    const types = ['All', 'Online', 'Offline', 'Hybrid'];
    const themes = ['AI/ML', 'Web Development', 'Mobile Apps', 'Blockchain', 'IoT', 'Gaming', 'FinTech', 'HealthTech', 'Open Innovation'];
    const durations = ['24 Hours', '48 Hours', '72 Hours', '1 Week', 'Other'];

    // Mock data
    const mockHackathons = [
        {
            id: '1',
            title: 'AI Innovation Challenge 2024',
            description: 'Build the next generation of AI-powered applications that solve real-world problems. Focus on machine learning, natural language processing, and computer vision.',
            theme: 'AI/ML',
            status: 'Registration Open',
            type: 'Hybrid',
            startDate: '2024-03-15',
            endDate: '2024-03-17',
            registrationDeadline: '2024-03-10',
            duration: '48 Hours',
            location: 'San Francisco, CA + Online',
            maxParticipants: 500,
            currentRegistrations: 342,
            prizePool: 50000,
            organizer: 'TechCorp Inc.',
            sponsors: ['Google', 'Microsoft', 'OpenAI'],
            technologies: ['Python', 'TensorFlow', 'PyTorch', 'React', 'Node.js'],
            judges: ['Dr. Sarah Chen', 'Alex Rodriguez', 'Maria Kumar'],
            website: 'https://ai-hack-2024.com',
            registrationUrl: 'https://ai-hack-2024.com/register',
            rating: 4.8,
            reviews: 156,
            imageUrl: '/images/ai-hackathon.jpg',
            requirements: ['Team size: 2-4 members', 'Open to all skill levels', 'Valid ID required'],
            prizes: [
                { position: '1st Place', amount: 25000, description: 'Grand Prize + Mentorship' },
                { position: '2nd Place', amount: 15000, description: 'Runner-up + Internship' },
                { position: '3rd Place', amount: 10000, description: 'Third Place + Resources' }
            ],
            schedule: [
                { time: '09:00', event: 'Registration & Welcome' },
                { time: '10:00', event: 'Opening Ceremony' },
                { time: '11:00', event: 'Hacking Begins' },
                { time: '18:00', event: 'Dinner & Networking' }
            ]
        },
        {
            id: '2',
            title: 'Green Tech Solutions Hackathon',
            description: 'Create innovative solutions for environmental challenges using technology. Focus on sustainability, renewable energy, and climate change.',
            theme: 'Open Innovation',
            status: 'Upcoming',
            type: 'Online',
            startDate: '2024-04-20',
            endDate: '2024-04-21',
            registrationDeadline: '2024-04-15',
            duration: '24 Hours',
            location: 'Global - Online Event',
            maxParticipants: 1000,
            currentRegistrations: 89,
            prizePool: 25000,
            organizer: 'EcoTech Foundation',
            sponsors: ['Tesla', 'Greenpeace', 'WWF'],
            technologies: ['IoT', 'Sensors', 'React', 'Python', 'Arduino'],
            judges: ['Prof. David Green', 'Lisa Environmental', 'John Sustainability'],
            website: 'https://greentech-hack.org',
            registrationUrl: 'https://greentech-hack.org/join',
            rating: 4.6,
            reviews: 89,
            imageUrl: '/images/green-hackathon.jpg',
            requirements: ['Individual or team participation', 'Sustainable focus required', 'Demo required'],
            prizes: [
                { position: '1st Place', amount: 15000, description: 'Best Environmental Impact' },
                { position: '2nd Place', amount: 7000, description: 'Most Innovative Solution' },
                { position: '3rd Place', amount: 3000, description: 'People\'s Choice Award' }
            ],
            schedule: [
                { time: '08:00', event: 'Virtual Kick-off' },
                { time: '09:00', event: 'Problem Statement Release' },
                { time: '12:00', event: 'Mentor Check-ins' },
                { time: '20:00', event: 'Final Presentations' }
            ]
        }
    ];

    useEffect(() => {
        fetchHackathons();
    }, []);

    useEffect(() => {
        filterHackathons();
    }, [searchQuery, selectedStatus, selectedType, hackathons]);

    const fetchHackathons = async () => {
        setLoading(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            setHackathons(mockHackathons);
        } catch (error) {
            console.error('Error fetching hackathons:', error);
        } finally {
            setLoading(false);
        }
    };

    const filterHackathons = () => {
        let filtered = hackathons;

        if (searchQuery) {
            filtered = filtered.filter(hackathon =>
                hackathon.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                hackathon.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                hackathon.theme.toLowerCase().includes(searchQuery.toLowerCase()) ||
                hackathon.technologies?.some(tech => tech.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        if (selectedStatus !== 'All') {
            filtered = filtered.filter(hackathon => hackathon.status === selectedStatus);
        }

        if (selectedType !== 'All') {
            filtered = filtered.filter(hackathon => hackathon.type === selectedType);
        }

        setFilteredHackathons(filtered);
    };

    const handleCreate = () => {
        setCurrentHackathon({
            title: '',
            description: '',
            theme: 'AI/ML',
            status: 'Upcoming',
            type: 'Online',
            startDate: '',
            endDate: '',
            registrationDeadline: '',
            duration: '24 Hours',
            location: '',
            maxParticipants: 100,
            currentRegistrations: 0,
            prizePool: 0,
            organizer: '',
            sponsors: [],
            technologies: [],
            judges: [],
            requirements: [],
            prizes: []
        });
        setModalMode('create');
        setShowModal(true);
    };

    const handleEdit = (hackathon) => {
        setCurrentHackathon({ ...hackathon });
        setModalMode('edit');
        setShowModal(true);
    };

    const handleView = (hackathon) => {
        setCurrentHackathon(hackathon);
        setModalMode('view');
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this hackathon?')) {
            setHackathons(prev => prev.filter(hackathon => hackathon.id !== id));
        }
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            if (modalMode === 'create') {
                const newHackathon = {
                    ...currentHackathon,
                    id: Date.now().toString(),
                    currentRegistrations: 0,
                    rating: 0,
                    reviews: 0
                };
                setHackathons(prev => [...prev, newHackathon]);
            } else if (modalMode === 'edit') {
                setHackathons(prev =>
                    prev.map(hackathon =>
                        hackathon.id === currentHackathon.id ? currentHackathon : hackathon
                    )
                );
            }
            setShowModal(false);
        } catch (error) {
            console.error('Error saving hackathon:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Upcoming': return 'bg-blue-100 text-blue-800';
            case 'Registration Open': return 'bg-green-100 text-green-800';
            case 'In Progress': return 'bg-yellow-100 text-yellow-800';
            case 'Judging': return 'bg-purple-100 text-purple-800';
            case 'Completed': return 'bg-gray-100 text-gray-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'Online': return <Zap className="w-4 h-4" />;
            case 'Offline': return <MapPin className="w-4 h-4" />;
            case 'Hybrid': return <Target className="w-4 h-4" />;
            default: return <Code className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-indigo-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-6 mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-3 rounded-xl">
                                <Code className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Hackathon Management</h1>
                                <p className="text-gray-600">Organize and manage coding competitions</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCreate}
                            className="bg-gradient-to-r from-cyan-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <Plus className="w-5 h-5" />
                            <span>New Hackathon</span>
                        </motion.button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search hackathons..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent w-80"
                            />
                        </div>
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        >
                            {statuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                        >
                            {types.map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </motion.div>

                {/* Hackathon Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-cyan-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <AnimatePresence>
                            {filteredHackathons.map((hackathon, index) => (
                                <motion.div
                                    key={hackathon.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="relative">
                                        <div className="h-48 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-t-2xl flex items-center justify-center">
                                            <div className="text-center text-white">
                                                <Code className="w-16 h-16 mx-auto mb-2" />
                                                <h3 className="text-xl font-bold">{hackathon.theme}</h3>
                                            </div>
                                        </div>
                                        <div className="absolute top-4 right-4 flex space-x-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(hackathon.status)}`}>
                                                {hackathon.status}
                                            </span>
                                            <div className="bg-white bg-opacity-90 p-2 rounded-full">
                                                {getTypeIcon(hackathon.type)}
                                            </div>
                                        </div>
                                        <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 px-3 py-1 rounded-full">
                                            <span className="text-sm font-semibold text-gray-900">{hackathon.duration}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-gray-900 mb-2">
                                            {hackathon.title}
                                        </h3>
                                        
                                        <p className="text-gray-600 mb-4 line-clamp-3">
                                            {hackathon.description}
                                        </p>
                                        
                                        {/* Event Details */}
                                        <div className="space-y-2 mb-4">
                                            <div className="flex items-center space-x-2 text-sm">
                                                <Calendar className="w-4 h-4 text-cyan-500" />
                                                <span className="text-gray-600">{hackathon.startDate} - {hackathon.endDate}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm">
                                                <MapPin className="w-4 h-4 text-cyan-500" />
                                                <span className="text-gray-600">{hackathon.location}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm">
                                                <Users className="w-4 h-4 text-cyan-500" />
                                                <span className="text-gray-600">
                                                    {hackathon.currentRegistrations}/{hackathon.maxParticipants} participants
                                                </span>
                                            </div>
                                        </div>
                                        
                                        {/* Registration Progress */}
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="text-sm font-medium text-gray-700">Registration Progress</span>
                                                <span className="text-sm text-gray-500">
                                                    {Math.round((hackathon.currentRegistrations / hackathon.maxParticipants) * 100)}%
                                                </span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div 
                                                    className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${(hackathon.currentRegistrations / hackathon.maxParticipants) * 100}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                        
                                        {/* Prize Pool */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-2">
                                                <Trophy className="w-5 h-5 text-yellow-500" />
                                                <span className="font-semibold text-lg text-gray-900">
                                                    ${hackathon.prizePool?.toLocaleString()}
                                                </span>
                                            </div>
                                            <div className="flex items-center space-x-1">
                                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                                <span className="text-sm font-semibold">{hackathon.rating}</span>
                                                <span className="text-sm text-gray-500">({hackathon.reviews})</span>
                                            </div>
                                        </div>
                                        
                                        {/* Technologies */}
                                        <div className="mb-4">
                                            <div className="flex flex-wrap gap-1">
                                                {hackathon.technologies?.slice(0, 4).map(tech => (
                                                    <span key={tech} className="px-2 py-1 bg-cyan-100 text-cyan-800 rounded-lg text-xs">
                                                        {tech}
                                                    </span>
                                                ))}
                                                {hackathon.technologies?.length > 4 && (
                                                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs">
                                                        +{hackathon.technologies.length - 4} more
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        
                                        {/* Sponsors */}
                                        <div className="mb-4">
                                            <div className="flex items-center space-x-2 mb-2">
                                                <Award className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm font-medium text-gray-700">Sponsors</span>
                                            </div>
                                            <div className="flex flex-wrap gap-1">
                                                {hackathon.sponsors?.map(sponsor => (
                                                    <span key={sponsor} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs">
                                                        {sponsor}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                        
                                        {/* Organizer */}
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center space-x-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <span className="text-sm text-gray-600">{hackathon.organizer}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                <Clock className="w-4 h-4" />
                                                <span>Reg. deadline: {hackathon.registrationDeadline}</span>
                                            </div>
                                        </div>
                                        
                                        {/* Actions */}
                                        <div className="flex items-center justify-between">
                                            <div className="flex space-x-2">
                                                {hackathon.website && (
                                                    <a
                                                        href={hackathon.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                )}
                                                {hackathon.registrationUrl && (
                                                    <a
                                                        href={hackathon.registrationUrl}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="px-3 py-1 bg-cyan-100 text-cyan-800 rounded-lg text-xs font-semibold hover:bg-cyan-200 transition-colors"
                                                    >
                                                        Register
                                                    </a>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleView(hackathon)}
                                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(hackathon)}
                                                    className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(hackathon.id)}
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
                                            {modalMode === 'create' ? 'Create New Hackathon' : 
                                             modalMode === 'edit' ? 'Edit Hackathon' : 'Hackathon Details'}
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
                                                Hackathon Title *
                                            </label>
                                            <input
                                                type="text"
                                                value={currentHackathon?.title || ''}
                                                onChange={(e) => setCurrentHackathon(prev => ({ ...prev, title: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-50"
                                                placeholder="Enter hackathon title"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Theme *
                                            </label>
                                            <select
                                                value={currentHackathon?.theme || ''}
                                                onChange={(e) => setCurrentHackathon(prev => ({ ...prev, theme: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-50"
                                            >
                                                {themes.map(theme => (
                                                    <option key={theme} value={theme}>{theme}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Status *
                                            </label>
                                            <select
                                                value={currentHackathon?.status || ''}
                                                onChange={(e) => setCurrentHackathon(prev => ({ ...prev, status: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-50"
                                            >
                                                {statuses.slice(1).map(status => (
                                                    <option key={status} value={status}>{status}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Event Type *
                                            </label>
                                            <select
                                                value={currentHackathon?.type || ''}
                                                onChange={(e) => setCurrentHackathon(prev => ({ ...prev, type: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-50"
                                            >
                                                {types.slice(1).map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Duration
                                            </label>
                                            <select
                                                value={currentHackathon?.duration || ''}
                                                onChange={(e) => setCurrentHackathon(prev => ({ ...prev, duration: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-50"
                                            >
                                                {durations.map(duration => (
                                                    <option key={duration} value={duration}>{duration}</option>
                                                ))}
                                            </select>
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Location *
                                            </label>
                                            <input
                                                type="text"
                                                value={currentHackathon?.location || ''}
                                                onChange={(e) => setCurrentHackathon(prev => ({ ...prev, location: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-50"
                                                placeholder="Enter location or 'Online'"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Start Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={currentHackathon?.startDate || ''}
                                                onChange={(e) => setCurrentHackathon(prev => ({ ...prev, startDate: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                End Date *
                                            </label>
                                            <input
                                                type="date"
                                                value={currentHackathon?.endDate || ''}
                                                onChange={(e) => setCurrentHackathon(prev => ({ ...prev, endDate: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Registration Deadline
                                            </label>
                                            <input
                                                type="date"
                                                value={currentHackathon?.registrationDeadline || ''}
                                                onChange={(e) => setCurrentHackathon(prev => ({ ...prev, registrationDeadline: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-50"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Max Participants
                                            </label>
                                            <input
                                                type="number"
                                                value={currentHackathon?.maxParticipants || 0}
                                                onChange={(e) => setCurrentHackathon(prev => ({ ...prev, maxParticipants: parseInt(e.target.value) }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-50"
                                                min="1"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Prize Pool ($)
                                            </label>
                                            <input
                                                type="number"
                                                value={currentHackathon?.prizePool || 0}
                                                onChange={(e) => setCurrentHackathon(prev => ({ ...prev, prizePool: parseFloat(e.target.value) }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-50"
                                                min="0"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Organizer *
                                            </label>
                                            <input
                                                type="text"
                                                value={currentHackathon?.organizer || ''}
                                                onChange={(e) => setCurrentHackathon(prev => ({ ...prev, organizer: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-50"
                                                placeholder="Organizing company/entity"
                                            />
                                        </div>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Description *
                                        </label>
                                        <textarea
                                            value={currentHackathon?.description || ''}
                                            onChange={(e) => setCurrentHackathon(prev => ({ ...prev, description: e.target.value }))}
                                            disabled={modalMode === 'view'}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-50"
                                            placeholder="Describe the hackathon, its goals, and what participants will build..."
                                        />
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Website URL
                                            </label>
                                            <input
                                                type="url"
                                                value={currentHackathon?.website || ''}
                                                onChange={(e) => setCurrentHackathon(prev => ({ ...prev, website: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-50"
                                                placeholder="https://hackathon-website.com"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Registration URL
                                            </label>
                                            <input
                                                type="url"
                                                value={currentHackathon?.registrationUrl || ''}
                                                onChange={(e) => setCurrentHackathon(prev => ({ ...prev, registrationUrl: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent disabled:bg-gray-50"
                                                placeholder="https://register.hackathon.com"
                                            />
                                        </div>
                                    </div>
                                    
                                    {modalMode !== 'view' && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Upload Event Images
                                            </label>
                                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-cyan-400 transition-colors">
                                                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                                <p className="text-gray-600 mb-2">Drag and drop images here, or click to browse</p>
                                                <input
                                                    type="file"
                                                    className="hidden"
                                                    id="file-upload"
                                                    multiple
                                                    accept=".jpg,.jpeg,.png,.gif"
                                                />
                                                <label
                                                    htmlFor="file-upload"
                                                    className="inline-block px-4 py-2 bg-cyan-100 text-cyan-700 rounded-lg cursor-pointer hover:bg-cyan-200 transition-colors"
                                                >
                                                    Choose Images
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
                                            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-xl font-semibold flex items-center space-x-2 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                                        >
                                            <Save className="w-5 h-5" />
                                            <span>{loading ? 'Saving...' : 'Save Hackathon'}</span>
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

export default HackathonPage;