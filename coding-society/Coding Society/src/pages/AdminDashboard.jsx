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
    Eye,
    Search,
    Bell,
    ChevronLeft,
    ChevronRight,
    LogOut,
    Shield,
    TrendingDown,
    Activity,
    Plus,
    Zap
} from 'lucide-react';
import { LibraryPage, InnovationPage, HackathonPage, UserManagement, Analytics, AdminSettings } from './admin';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'library', label: 'Library Content', icon: Book },
        { id: 'innovation', label: 'Innovations', icon: Lightbulb },
        { id: 'hackathon', label: 'Hackathons', icon: Code },
        { id: 'users', label: 'User Management', icon: Users },
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
        { type: 'content', title: 'New React Tutorial Added', time: '2 hours ago', status: 'published', user: 'Sarah J.' },
        { type: 'innovation', title: 'AI Code Assistant Updated', time: '4 hours ago', status: 'in-progress', user: 'Mike T.' },
        { type: 'hackathon', title: 'Green Tech Hackathon Registered', time: '1 day ago', status: 'upcoming', user: 'System' },
        { type: 'user', title: '50 New User Registrations', time: '2 days ago', status: 'completed', user: 'System' }
    ];

    const renderContent = () => {
        switch (activeTab) {
            case 'library':
                return <LibraryPage />;
            case 'innovation':
                return <InnovationPage />;
            case 'hackathon':
                return <HackathonPage />;
            case 'users':
                return <UserManagement />;
            case 'analytics':
                return <Analytics />;
            case 'settings':
                return <AdminSettings />;
            case 'dashboard':
            default:
                return (
                    <div className="space-y-8">
                        {/* Welcome Section */}
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl shadow-xl p-8 text-white relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full -ml-10 -mb-10 blur-2xl"></div>
                            
                            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">Welcome back, Administrator</h1>
                                    <p className="text-slate-300 max-w-xl">
                                        Here's what's happening in your platform today. You have <span className="text-blue-400 font-bold">12 new notifications</span> and <span className="text-green-400 font-bold">5 pending approvals</span>.
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-semibold transition-all flex items-center gap-2">
                                        <FileText className="w-4 h-4" />
                                        <span>Reports</span>
                                    </button>
                                    <button className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-xl font-semibold shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        <span>Create New</span>
                                    </button>
                                </div>
                            </div>
                        </motion.div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {stats.map((stat, index) => (
                                <motion.div
                                    key={stat.title}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 p-6 border border-slate-100 group"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <div className={`p-3 rounded-2xl bg-gradient-to-br ${
                                            stat.color === 'purple' ? 'from-purple-500 to-purple-600 shadow-purple-200' :
                                            stat.color === 'orange' ? 'from-orange-500 to-orange-600 shadow-orange-200' :
                                            stat.color === 'cyan' ? 'from-cyan-500 to-cyan-600 shadow-cyan-200' :
                                            'from-green-500 to-green-600 shadow-green-200'
                                        } shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                            <stat.icon className="w-6 h-6 text-white" />
                                        </div>
                                        <span className={`flex items-center gap-1 text-sm font-bold ${
                                            stat.change.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                                        } px-2 py-1 rounded-lg`}>
                                            {stat.change.startsWith('+') ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                            {stat.change}
                                        </span>
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</h3>
                                        <p className="text-slate-500 font-medium text-sm uppercase tracking-wide">{stat.title}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Recent Activities */}
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.3 }}
                                className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
                            >
                                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-600" />
                                        Recent Activities
                                    </h2>
                                    <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-3 py-1 rounded-lg transition-colors">
                                        View All
                                    </button>
                                </div>
                                <div className="divide-y divide-slate-50">
                                    {recentActivities.map((activity, index) => (
                                        <div key={index} className="p-4 hover:bg-slate-50 transition-colors flex items-center gap-4">
                                            <div className={`p-3 rounded-xl flex-shrink-0 ${
                                                activity.type === 'content' ? 'bg-purple-50 text-purple-600' :
                                                activity.type === 'innovation' ? 'bg-orange-50 text-orange-600' :
                                                activity.type === 'hackathon' ? 'bg-cyan-50 text-cyan-600' :
                                                'bg-green-50 text-green-600'
                                            }`}>
                                                {activity.type === 'content' && <Book className="w-5 h-5" />}
                                                {activity.type === 'innovation' && <Lightbulb className="w-5 h-5" />}
                                                {activity.type === 'hackathon' && <Code className="w-5 h-5" />}
                                                {activity.type === 'user' && <Users className="w-5 h-5" />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-semibold text-slate-900 truncate">{activity.title}</p>
                                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                                    <span>{activity.user}</span>
                                                    <span>•</span>
                                                    <span>{activity.time}</span>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                                                activity.status === 'published' ? 'bg-green-100 text-green-700' :
                                                activity.status === 'in-progress' ? 'bg-yellow-100 text-yellow-700' :
                                                activity.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                                                'bg-slate-100 text-slate-700'
                                            }`}>
                                                {activity.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>

                            {/* Quick Actions & Analytics Preview */}
                            <div className="space-y-8">
                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6"
                                >
                                    <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                                        <Zap className="w-5 h-5 text-yellow-500" />
                                        Quick Actions
                                    </h2>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setActiveTab('library')}
                                            className="p-3 bg-slate-50 hover:bg-purple-50 hover:text-purple-600 text-slate-600 rounded-xl font-medium transition-all flex flex-col items-center justify-center gap-2 group border border-slate-100 hover:border-purple-200"
                                        >
                                            <Book className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs">Add Content</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('innovation')}
                                            className="p-3 bg-slate-50 hover:bg-orange-50 hover:text-orange-600 text-slate-600 rounded-xl font-medium transition-all flex flex-col items-center justify-center gap-2 group border border-slate-100 hover:border-orange-200"
                                        >
                                            <Lightbulb className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs">New Idea</span>
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('hackathon')}
                                            className="p-3 bg-slate-50 hover:bg-cyan-50 hover:text-cyan-600 text-slate-600 rounded-xl font-medium transition-all flex flex-col items-center justify-center gap-2 group border border-slate-100 hover:border-cyan-200"
                                        >
                                            <Code className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs">Hackathon</span>
                                        </button>
                                        <button 
                                            onClick={() => setActiveTab('users')}
                                            className="p-3 bg-slate-50 hover:bg-green-50 hover:text-green-600 text-slate-600 rounded-xl font-medium transition-all flex flex-col items-center justify-center gap-2 group border border-slate-100 hover:border-green-200"
                                        >
                                            <Users className="w-6 h-6 group-hover:scale-110 transition-transform" />
                                            <span className="text-xs">Users</span>
                                        </button>
                                    </div>
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.5 }}
                                    className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl shadow-xl p-6 text-white"
                                >
                                    <div className="flex items-center justify-between mb-4">
                                        <h2 className="font-bold text-lg">Platform Growth</h2>
                                        <TrendingUp className="w-5 h-5 text-blue-200" />
                                    </div>
                                    <div className="h-32 flex items-end justify-between gap-2 mb-4">
                                        {[40, 65, 45, 80, 55, 90, 75].map((h, i) => (
                                            <div key={i} className="w-full bg-white/20 rounded-t-lg relative group">
                                                <motion.div 
                                                    initial={{ height: 0 }}
                                                    animate={{ height: `${h}%` }}
                                                    transition={{ duration: 1, delay: i * 0.1 }}
                                                    className="absolute bottom-0 left-0 right-0 bg-white/90 rounded-t-lg group-hover:bg-white transition-colors"
                                                />
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs text-blue-100">
                                        <span>Mon</span>
                                        <span>Sun</span>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ 
                    width: sidebarCollapsed ? 80 : 280,
                    x: sidebarOpen || window.innerWidth >= 1024 ? 0 : -280 
                }}
                className={`fixed lg:static inset-y-0 left-0 z-50 bg-white shadow-2xl lg:shadow-none border-r border-slate-200 flex flex-col transition-all duration-300`}
            >
                {/* Sidebar Header */}
                <div className={`h-20 flex items-center ${sidebarCollapsed ? 'justify-center' : 'justify-between px-6'} border-b border-slate-100`}>
                    {!sidebarCollapsed && (
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-slate-900 leading-tight">Admin<br/><span className="text-blue-600">Panel</span></h1>
                            </div>
                        </div>
                    )}
                    {sidebarCollapsed && (
                        <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                            <Shield className="w-6 h-6 text-white" />
                        </div>
                    )}
                    
                    <button
                        onClick={() => window.innerWidth >= 1024 ? setSidebarCollapsed(!sidebarCollapsed) : setSidebarOpen(false)}
                        className={`p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors ${sidebarCollapsed ? 'hidden' : 'block'}`}
                    >
                        {window.innerWidth >= 1024 ? <ChevronLeft className="w-5 h-5" /> : <X className="w-5 h-5" />}
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (window.innerWidth < 1024) setSidebarOpen(false);
                            }}
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'px-4 space-x-3'} py-3 rounded-xl font-medium transition-all duration-200 group relative ${
                                activeTab === item.id
                                    ? 'bg-blue-50 text-blue-600'
                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                            }`}
                        >
                            <item.icon className={`w-5 h-5 ${activeTab === item.id ? 'text-blue-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                            {!sidebarCollapsed && <span>{item.label}</span>}
                            
                            {/* Active Indicator */}
                            {activeTab === item.id && (
                                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-600 rounded-l-full" />
                            )}

                            {/* Tooltip for collapsed state */}
                            {sidebarCollapsed && (
                                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50">
                                    {item.label}
                                </div>
                            )}
                        </button>
                    ))}
                </nav>

                {/* User Profile / Footer */}
                <div className="p-4 border-t border-slate-100">
                    <button className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} p-2 rounded-xl hover:bg-slate-50 transition-colors`}>
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm">
                            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Admin" alt="Admin" className="w-full h-full" />
                        </div>
                        {!sidebarCollapsed && (
                            <div className="flex-1 text-left">
                                <p className="text-sm font-bold text-slate-900">Admin User</p>
                                <p className="text-xs text-slate-500">admin@codingsociety.com</p>
                            </div>
                        )}
                        {!sidebarCollapsed && <LogOut className="w-4 h-4 text-slate-400" />}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content Wrapper */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Top Header */}
                <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        
                        {/* Search Bar */}
                        <div className="hidden md:flex items-center bg-slate-100 rounded-xl px-4 py-2.5 w-96 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                            <Search className="w-5 h-5 text-slate-400 mr-3" />
                            <input 
                                type="text" 
                                placeholder="Search content, users, or settings..." 
                                className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-xl transition-colors relative">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                        <button className="p-2.5 text-slate-500 hover:bg-slate-100 hover:text-blue-600 rounded-xl transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Scrollable Content Area */}
                <main className="flex-1 overflow-y-auto p-6 lg:p-8 scroll-smooth">
                    <div className="max-w-7xl mx-auto">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </main>
            </div>

            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
                <div
                    className="lg:hidden fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40"
                    onClick={() => setSidebarOpen(false)}
                />
            )}
        </div>
    );
};

export default AdminDashboard;