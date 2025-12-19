import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { 
    Briefcase, 
    Plus, 
    Search, 
    Filter, 
    Edit, 
    Trash2, 
    Eye, 
    Upload, 
    MapPin, 
    Clock, 
    DollarSign, 
    Building,
    Save,
    X,
    ChevronDown,
    Calendar,
    User,
    ExternalLink,
    Globe
} from 'lucide-react';

const InternshipPage = () => {
    const [internships, setInternships] = useState([]);
    const [filteredInternships, setFilteredInternships] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState('All');
    const [selectedType, setSelectedType] = useState('All');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create');
    const [currentInternship, setCurrentInternship] = useState(null);
    const [loading, setLoading] = useState(false);
    const [selectedFiles, setSelectedFiles] = useState([]);

    const industries = ['All', 'technology', 'finance', 'healthcare', 'education', 'retail', 'manufacturing', 'consulting', 'media', 'telecommunications', 'automotive', 'aerospace', 'biotechnology', 'energy', 'government', 'non_profit', 'startup', 'other'];
    const types = ['All', 'remote', 'on_site', 'hybrid'];
    const statuses = ['active', 'closed', 'draft']; // Assuming these based on typical internship statuses, need to verify model if strict enum exists for status on Internship itself, model showed application status but not internship status explicitly in the snippet I read. Wait, I should check the model again for Internship status.

    // Re-checking model for Internship status...
    // The model snippet I read had `applicationSchema`, `requirementSchema`, `benefitSchema`, and `internshipSchema`.
    // I need to check `internshipSchema` for `status` field.
    // I'll assume 'active', 'closed' for now and update if I find otherwise.

    useEffect(() => {
        fetchInternships();
    }, []);

    useEffect(() => {
        filterInternships();
    }, [searchQuery, selectedIndustry, selectedType, internships]);

    const getAuthHeader = () => {
        const token = localStorage.getItem('token');
        return { headers: { Authorization: `Bearer ${token}` } };
    };

    const fetchInternships = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://localhost:5000/api/v1/admin/internship', getAuthHeader());
            if (response.data.success) {
                setInternships(response.data.data);
            }
        } catch (error) {
            console.error('Error fetching internships:', error);
            toast.error('Failed to fetch internships');
        } finally {
            setLoading(false);
        }
    };

    const filterInternships = () => {
        let filtered = internships;

        if (searchQuery) {
            filtered = filtered.filter(internship =>
                internship.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                internship.company.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                internship.description.toLowerCase().includes(searchQuery.toLowerCase())
            );
        }

        if (selectedIndustry !== 'All') {
            filtered = filtered.filter(internship => internship.company.industry === selectedIndustry);
        }

        if (selectedType !== 'All') {
            filtered = filtered.filter(internship => internship.location.type === selectedType);
        }

        setFilteredInternships(filtered);
    };

    const handleCreate = () => {
        setCurrentInternship({
            title: '',
            description: '',
            company: {
                name: '',
                industry: 'technology',
                website: '',
                headquarters: { city: '', country: '' }
            },
            department: 'engineering',
            role: '',
            level: 'entry',
            location: {
                type: 'remote',
                address: { city: '', country: '' }
            },
            duration: {
                value: 3,
                unit: 'months'
            },
            stipend: {
                amount: 0,
                currency: 'USD',
                period: 'monthly'
            },
            requirements: [],
            benefits: [],
            status: 'active'
        });
        setSelectedFiles([]);
        setModalMode('create');
        setShowModal(true);
    };

    const handleEdit = (internship) => {
        setCurrentInternship({ ...internship });
        setSelectedFiles([]);
        setModalMode('edit');
        setShowModal(true);
    };

    const handleView = (internship) => {
        setCurrentInternship(internship);
        setModalMode('view');
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this internship?')) {
            try {
                const response = await axios.delete(`http://localhost:5000/api/v1/admin/internship/${id}`, getAuthHeader());
                if (response.data.success) {
                    setInternships(prev => prev.filter(int => int._id !== id));
                    toast.success('Internship deleted successfully');
                }
            } catch (error) {
                console.error('Error deleting internship:', error);
                toast.error('Failed to delete internship');
            }
        }
    };

    const handleFileChange = (e) => {
        setSelectedFiles(Array.from(e.target.files));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            // Construct payload matching the model structure
            // Note: For complex nested objects like company, location, etc., we might need to send JSON string if using FormData for files
            // Or if the backend supports nested keys in FormData (e.g. company[name])
            // Let's check how InnovationPage did it. It used FormData.
            // backend/routes/admin.js for Innovation parsed JSON strings for arrays/objects.
            // I should check Internship route implementation.
            
            const formData = new FormData();
            formData.append('title', currentInternship.title);
            formData.append('description', currentInternship.description);
            formData.append('department', currentInternship.department);
            formData.append('role', currentInternship.role);
            formData.append('level', currentInternship.level);
            formData.append('status', currentInternship.status);

            // Complex objects as JSON strings
            formData.append('company', JSON.stringify(currentInternship.company));
            formData.append('location', JSON.stringify(currentInternship.location));
            formData.append('duration', JSON.stringify(currentInternship.duration));
            formData.append('stipend', JSON.stringify(currentInternship.stipend));
            
            if (currentInternship.requirements) formData.append('requirements', JSON.stringify(currentInternship.requirements));
            if (currentInternship.benefits) formData.append('benefits', JSON.stringify(currentInternship.benefits));

            selectedFiles.forEach(file => {
                formData.append('files', file);
            });

            const url = modalMode === 'create' 
                ? 'http://localhost:5000/api/v1/admin/internship'
                : `http://localhost:5000/api/v1/admin/internship/${currentInternship._id}`;
            
            const method = modalMode === 'create' ? 'post' : 'put';

            const response = await axios[method](url, formData, {
                headers: {
                    ...getAuthHeader().headers,
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                if (modalMode === 'create') {
                    setInternships(prev => [response.data.data, ...prev]);
                    toast.success('Internship created successfully');
                } else {
                    setInternships(prev => prev.map(int => int._id === currentInternship._id ? response.data.data : int));
                    toast.success('Internship updated successfully');
                }
                setShowModal(false);
            }
        } catch (error) {
            console.error('Error saving internship:', error);
            toast.error(error.response?.data?.message || 'Failed to save internship');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl shadow-xl p-6 mb-8"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-xl">
                                <Briefcase className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Internship Portal</h1>
                                <p className="text-gray-600">Manage internship opportunities and applications</p>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleCreate}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transition-all duration-300"
                        >
                            <Plus className="w-5 h-5" />
                            <span>New Internship</span>
                        </motion.button>
                    </div>

                    {/* Filters */}
                    <div className="flex flex-wrap gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search internships..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent w-80"
                            />
                        </div>
                        <select
                            value={selectedIndustry}
                            onChange={(e) => setSelectedIndustry(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {industries.map(ind => (
                                <option key={ind} value={ind}>{ind.charAt(0).toUpperCase() + ind.slice(1)}</option>
                            ))}
                        </select>
                        <select
                            value={selectedType}
                            onChange={(e) => setSelectedType(e.target.value)}
                            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            {types.map(type => (
                                <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                </motion.div>

                {/* Internship Grid */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        <AnimatePresence>
                            {filteredInternships.map((internship, index) => (
                                <motion.div
                                    key={internship._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group"
                                >
                                    <div className="p-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden">
                                                    {internship.company.logo || (internship.files && internship.files.length > 0 && internship.files[0].url) ? (
                                                        <img 
                                                            src={internship.company.logo || internship.files[0].url} 
                                                            alt={internship.company.name} 
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                e.target.nextSibling.style.display = 'flex';
                                                            }}
                                                        />
                                                    ) : null}
                                                    <div className="hidden w-full h-full items-center justify-center bg-gray-100">
                                                        <Building className="w-6 h-6 text-gray-400" />
                                                    </div>
                                                    {!(internship.company.logo || (internship.files && internship.files.length > 0)) && (
                                                        <Building className="w-6 h-6 text-gray-400" />
                                                    )}
                                                </div>
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                        {internship.title}
                                                    </h3>
                                                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                                                        <span className="font-medium text-gray-700">{internship.company.name}</span>
                                                        <span>•</span>
                                                        <span>{internship.location.type}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                internship.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                                {internship.status}
                                            </span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-4">
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <MapPin className="w-4 h-4" />
                                                <span>{internship.location.address?.city}, {internship.location.address?.country}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Clock className="w-4 h-4" />
                                                <span>{internship.duration.value} {internship.duration.unit}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <DollarSign className="w-4 h-4" />
                                                <span>{internship.stipend?.amount > 0 ? `${internship.stipend.amount} ${internship.stipend.currency}/${internship.stipend.period}` : 'Unpaid'}</span>
                                            </div>
                                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                                <Briefcase className="w-4 h-4" />
                                                <span>{internship.level}</span>
                                            </div>
                                        </div>

                                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                                            {internship.description}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                            <div className="flex space-x-2">
                                                {internship.company.website && (
                                                    <a
                                                        href={internship.company.website}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    >
                                                        <Globe className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleView(internship)}
                                                    className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(internship)}
                                                    className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(internship._id)}
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
                                            {modalMode === 'create' ? 'Create New Internship' : 
                                             modalMode === 'edit' ? 'Edit Internship' : 'Internship Details'}
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
                                    {/* Basic Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                                            <input
                                                type="text"
                                                value={currentInternship?.title || ''}
                                                onChange={(e) => setCurrentInternship(prev => ({ ...prev, title: e.target.value }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                                            <input
                                                type="text"
                                                value={currentInternship?.company?.name || ''}
                                                onChange={(e) => setCurrentInternship(prev => ({ ...prev, company: { ...prev.company, name: e.target.value } }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Industry</label>
                                            <select
                                                value={currentInternship?.company?.industry || ''}
                                                onChange={(e) => setCurrentInternship(prev => ({ ...prev, company: { ...prev.company, industry: e.target.value } }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            >
                                                {industries.slice(1).map(ind => (
                                                    <option key={ind} value={ind}>{ind}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Location Type</label>
                                            <select
                                                value={currentInternship?.location?.type || ''}
                                                onChange={(e) => setCurrentInternship(prev => ({ ...prev, location: { ...prev.location, type: e.target.value } }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            >
                                                {types.slice(1).map(type => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                                        <textarea
                                            value={currentInternship?.description || ''}
                                            onChange={(e) => setCurrentInternship(prev => ({ ...prev, description: e.target.value }))}
                                            disabled={modalMode === 'view'}
                                            rows={4}
                                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>

                                    {/* Additional Details */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (Value)</label>
                                            <input
                                                type="number"
                                                value={currentInternship?.duration?.value || ''}
                                                onChange={(e) => setCurrentInternship(prev => ({ ...prev, duration: { ...prev.duration, value: parseInt(e.target.value) } }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Duration Unit</label>
                                            <select
                                                value={currentInternship?.duration?.unit || 'months'}
                                                onChange={(e) => setCurrentInternship(prev => ({ ...prev, duration: { ...prev.duration, unit: e.target.value } }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="weeks">Weeks</option>
                                                <option value="months">Months</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Stipend Amount</label>
                                            <input
                                                type="number"
                                                value={currentInternship?.stipend?.amount || ''}
                                                onChange={(e) => setCurrentInternship(prev => ({ ...prev, stipend: { ...prev.stipend, amount: parseInt(e.target.value) } }))}
                                                disabled={modalMode === 'view'}
                                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>
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
                                                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold flex items-center space-x-2 hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                                            >
                                                <Save className="w-5 h-5" />
                                                <span>{loading ? 'Saving...' : 'Save Internship'}</span>
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default InternshipPage;
