import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    LayoutDashboard, 
    Book, 
    Lightbulb, 
    Code, 
    Users, 
    FileText, 
    Trophy, 
    Settings,
    Menu,
    X,
    BarChart3,
    TrendingUp,
    Star,
    Calendar,
    Eye
} from 'lucide-react';
import { LibraryPage, InnovationPage, HackathonPage } from './admin';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'library', label: 'Library Content', icon: Book },
        { id: 'innovation', label: 'Innovations', icon: Lightbulb },
        { id: 'hackathon', label: 'Hackathons', icon: Code },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'analytics', label: 'Analytics', icon: BarChart3 },
        { id: 'settings', label: 'Settings', icon: Settings }
    ];

    const stats = [
        { title: 'Total Content', value: '1,247', change: '+12%', icon: FileText, color: 'purple' },
        { title: 'Active Innovations', value: '89', change: '+8%', icon: Lightbulb, color: 'orange' },
        { title: 'Running Hackathons', value: '12', change: '+3%', icon: Code, color: 'cyan' },
        { title: 'Total Users', value: '15,620', change: '+15%', icon: Users, color: 'green' }
    ];

    const recentActivities = [
        { type: 'content', title: 'New React Tutorial Added', time: '2 hours ago', status: 'published' },
        { type: 'innovation', title: 'AI Code Assistant Updated', time: '4 hours ago', status: 'in-progress' },
        { type: 'hackathon', title: 'Green Tech Hackathon Registered', time: '1 day ago', status: 'upcoming' },
        { type: 'user', title: '50 New User Registrations', time: '2 days ago', status: 'completed' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'library':
                return <LibraryPage />;
            case 'innovation':
                return <InnovationPage />;
            case 'hackathon':
                return <HackathonPage />;
            case 'dashboard':
            default:
                return (
                    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-6">
                        <div className="max-w-7xl mx-auto">
                            {/* Header */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl shadow-xl p-6 mb-8"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
                                        <p className="text-gray-600">Manage your platform content and users</p>
                                    </div>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500">Welcome back,</p>
                                            <p className="font-semibold text-gray-900">Administrator</p>
                                        </div>
                                        <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
                                            <span className="text-white font-bold text-lg">A</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                {stats.map((stat, index) => (
                                    <motion.div
                                        key={stat.title}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.1 }}
                                        className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={`p-3 rounded-xl bg-gradient-to-r ${
                                                stat.color === 'purple' ? 'from-purple-500 to-purple-600' :
                                                stat.color === 'orange' ? 'from-orange-500 to-orange-600' :
                                                stat.color === 'cyan' ? 'from-cyan-500 to-cyan-600' :
                                                'from-green-500 to-green-600'
                                            }`}>
                                                <stat.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <span className={`text-sm font-semibold ${
                                                stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                                            }`}>
                                                {stat.change}
                                            </span>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                                            <p className="text-gray-600 font-medium">{stat.title}</p>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                                {/* Recent Activities */}
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.3 }}
                                    className="bg-white rounded-2xl shadow-lg p-6"
                                >
                                    <div className="flex items-center justify-between mb-6">
                                        <h2 className="text-xl font-bold text-gray-900">Recent Activities</h2>
                                        <button className="text-blue-600 hover:text-blue-700 font-semibold">
                                            View All
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {recentActivities.map((activity, index) => (
                                            <div key={index} className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
                                                <div className={`p-2 rounded-lg ${
                                                    activity.type === 'content' ? 'bg-purple-100 text-purple-600' :
                                                    activity.type === 'innovation' ? 'bg-orange-100 text-orange-600' :
                                                    activity.type === 'hackathon' ? 'bg-cyan-100 text-cyan-600' :
                                                    'bg-green-100 text-green-600'
                                                }`}>
                                                    {activity.type === 'content' && <Book className="w-4 h-4" />}
                                                    {activity.type === 'innovation' && <Lightbulb className="w-4 h-4" />}
                                                    {activity.type === 'hackathon' && <Code className="w-4 h-4" />}
                                                    {activity.type === 'user' && <Users className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-semibold text-gray-900">{activity.title}</p>
                                                    <p className="text-gray-500 text-sm">{activity.time}</p>
                                                </div>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    activity.status === 'published' ? 'bg-green-100 text-green-800' :
                                                    activity.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                                                    activity.status === 'upcoming' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-gray-100 text-gray-800'
                                                }`}>
                                                    {activity.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </motion.div>

                                {/* Quick Actions */}
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white rounded-2xl shadow-lg p-6"
                                >
                                    <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Actions</h2>
                                    <div className="grid grid-cols-2 gap-4">
                                        <button
                                            onClick={() => setActiveTab('library')}
                                            className="p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                                        >
                                            <Book className="w-5 h-5" />
                                            <span>Add Content</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('innovation')}
                                            className="p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                                        >
                                            <Lightbulb className="w-5 h-5" />
                                            <span>New Innovation</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('hackathon')}
                                            className="p-4 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
                                        >
                                            <Code className="w-5 h-5" />
                                            <span>Create Hackathon</span>
                                        </button>
                                        <button className="p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center space-x-2">
                                            <Users className="w-5 h-5" />
                                            <span>Manage Users</span>
                                        </button>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Analytics Chart Placeholder */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="bg-white rounded-2xl shadow-lg p-6"
                            >
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Platform Analytics</h2>
                                    <div className="flex space-x-2">
                                        <button className="px-4 py-2 bg-blue-100 text-blue-600 rounded-lg font-semibold">7D</button>
                                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold">30D</button>
                                        <button className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-semibold">90D</button>
                                    </div>
                                </div>
                                <div className="h-64 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl flex items-center justify-center">
                                    <div className="text-center">
                                        <TrendingUp className="w-16 h-16 text-blue-400 mx-auto mb-4" />
                                        <p className="text-gray-600 font-semibold">Analytics Chart</p>
                                        <p className="text-gray-500 text-sm">Interactive charts will be implemented here</p>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar */}
            <motion.div
                initial={{ x: -280 }}
                animate={{ x: sidebarOpen || window.innerWidth >= 1024 ? 0 : -280 }}
                className="fixed lg:static inset-y-0 left-0 z-50 w-280 bg-white shadow-xl lg:shadow-none"
            >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                            <LayoutDashboard className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Admin Panel</h1>
                            <p className="text-sm text-gray-500">Coding Society</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 text-gray-400 hover:text-gray-600"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 ${
                                activeTab === item.id
                                    ? 'bg-gradient-to-r from-purple-500 to-blue-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                            }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>
            </motion.div>

            {/* Main Content */}
            <div className="flex-1 lg:ml-0">
                {/* Mobile Header */}
                <div className="lg:hidden bg-white shadow-sm p-4 flex items-center justify-between">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="p-2 text-gray-600 hover:text-gray-900"
                    >
                        <Menu className="w-6 h-6" />
                    </button>
                    <h1 className="font-bold text-gray-900">Admin Dashboard</h1>
                    <div className="w-8 h-8"></div>
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderContent()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Overlay for mobile sidebar */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;