import { motion } from 'framer-motion';
import { useState, type ReactNode } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from 'convex/react';
import { api } from '../../convex/_generated/api';
import {
  Menu,
  ChevronRight,
  UserCircle,
  Phone,
  Activity,
  History,
  LogOut,
  Bell,
  User,
  Briefcase,
  Shield
} from 'lucide-react';

interface LayoutProps {
  children: ReactNode;
  activeTab?: 'dashboard' | 'recent-tests' | 'profile' | 'contact' | 'admin';
  onStartTest?: () => void;
  onNavigate?: (tab: string) => void;
}

export function Layout({ children, activeTab = 'dashboard', onStartTest, onNavigate }: LayoutProps) {
  const { user, signOut } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarWidth, setSidebarWidth] = useState(280);
  // @ts-ignore - Used in resize handler
  const [isResizing, setIsResizing] = useState(false);

  // Get user profile to check role
  const userProfile = useQuery(api.users.getUserProfile, 
    user?.id ? { userId: user.id } : "skip"
  );

  const isAdmin = userProfile?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-50 to-emerald-50/20 relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/3 w-200 h-200 bg-gradient-to-br from-emerald-400/15 via-teal-400/10 to-cyan-400/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-1/2 -left-1/3 w-200 h-200 bg-gradient-to-tr from-purple-400/10 via-pink-400/5 to-rose-400/5 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
      </div>

      {/* Header */}
      <header className="relative z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 shadow-sm">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left Side - Menu Button & FP Free Prep Dashboard */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Menu className="w-6 h-6 text-gray-700" />
              </button>
              
              {!sidebarOpen && (
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                    <span className="text-white font-bold text-lg">FP</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">Free Prep</h1>
                    <p className="text-[10px] text-gray-500 -mt-1">Dashboard</p>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Right Side - Profile Info, Notifications */}
            <div className="flex items-center gap-3">
              {onStartTest && (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={onStartTest}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-xl font-bold hover:shadow-xl hover:shadow-emerald-300/50 transition-all flex items-center gap-2 text-sm"
                >
                  Start New Test
                  <ChevronRight className="w-4 h-4" />
                </motion.button>
              )}
              
              {/* Notification Button */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Bell className="w-6 h-6 text-gray-700" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                </button>

                {/* Notification Dropdown */}
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50"
                  >
                    <div className="p-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
                      <h3 className="font-bold text-gray-900">Notifications</h3>
                    </div>
                    <div className="max-h-96 overflow-y-auto">
                      <div className="p-4 space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">New Feature Available</p>
                            <p className="text-xs text-gray-600 mt-1">Check out our new practice mode</p>
                            <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-gray-300 rounded-full mt-2" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-gray-900">Test Reminder</p>
                            <p className="text-xs text-gray-600 mt-1">You haven't taken a test in 3 days</p>
                            <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* Profile Section */}
              <div className="flex items-center gap-3 pl-4 border-l border-gray-200">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-sm font-bold text-gray-900">
                    {user?.name || 'User'}
                  </p>
                  <div className="flex items-center gap-1">
                    {isAdmin ? (
                      <>
                        <Shield className="w-3 h-3 text-emerald-600" />
                        <p className="text-xs text-emerald-600 font-semibold">Admin</p>
                      </>
                    ) : (
                      <>
                        <Briefcase className="w-3 h-3 text-gray-500" />
                        <p className="text-xs text-gray-500">Student</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Resizable Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -sidebarWidth,
          opacity: sidebarOpen ? 1 : 0
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed left-0 top-0 bottom-0 bg-white shadow-2xl z-50 flex"
        style={{ 
          width: `${sidebarWidth}px`,
          pointerEvents: sidebarOpen ? 'auto' : 'none'
        }}
      >
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Sidebar Header */}
          <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                  <span className="text-white font-bold text-lg">FP</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Free Prep</h1>
                  <p className="text-[10px] text-gray-500 -mt-1">Dashboard</p>
                </div>
              </div>
              
              <button
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2 text-gray-700 hover:text-emerald-600 transition-colors group"
              >
                <div className="w-8 h-8 rounded-lg bg-white border border-gray-200 flex items-center justify-center group-hover:border-emerald-500 transition-colors shadow-sm">
                  <ChevronRight className="w-4 h-4 rotate-180" />
                </div>
                <span className="text-sm font-semibold">Back</span>
              </button>
            </div>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              <button
                onClick={() => {
                  onNavigate?.('profile');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-50 transition-colors group ${
                  activeTab === 'profile' ? 'bg-emerald-100' : ''
                }`}
              >
                <UserCircle className="w-5 h-5 text-gray-600 group-hover:text-emerald-600" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-600">My Profile</span>
              </button>

              <button
                onClick={() => {
                  onNavigate?.('contact');
                  setSidebarOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-emerald-50 transition-colors group ${
                  activeTab === 'contact' ? 'bg-emerald-100' : ''
                }`}
              >
                <Phone className="w-5 h-5 text-gray-600 group-hover:text-emerald-600" />
                <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-600">Contact Us</span>
              </button>

              <div className="pt-4 border-t border-gray-200 mt-4">
                <button
                  onClick={() => {
                    onNavigate?.('dashboard');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'dashboard' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <Activity className="w-5 h-5" />
                  <span className="text-sm font-medium">Dashboard</span>
                </button>

                <button
                  onClick={() => {
                    onNavigate?.('recent-tests');
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === 'recent-tests' 
                      ? 'bg-emerald-100 text-emerald-700' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <History className="w-5 h-5" />
                  <span className="text-sm font-medium">Recent Tests</span>
                </button>

                {/* Admin Control - Only visible to admins */}
                {isAdmin && (
                  <div className="pt-4 border-t border-gray-200 mt-4">
                    <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Admin</p>
                    <button
                      onClick={() => {
                        onNavigate?.('admin');
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                        activeTab === 'admin' 
                          ? 'bg-emerald-100 text-emerald-700' 
                          : 'hover:bg-emerald-50 text-gray-700 hover:text-emerald-700'
                      }`}
                    >
                      <Shield className="w-5 h-5" />
                      <span className="text-sm font-medium">Admin Control</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 bg-gray-50">
            <button
              onClick={signOut}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Resize Handle */}
        <div
          className="w-1 hover:w-2 bg-gray-200 hover:bg-emerald-500 cursor-col-resize transition-all"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsResizing(true);
            
            const handleMouseMove = (moveEvent: MouseEvent) => {
              const newWidth = moveEvent.clientX;
              if (newWidth >= 200 && newWidth <= 400) {
                setSidebarWidth(newWidth);
              }
            };

            const handleMouseUp = () => {
              setIsResizing(false);
              document.removeEventListener('mousemove', handleMouseMove);
              document.removeEventListener('mouseup', handleMouseUp);
            };

            document.addEventListener('mousemove', handleMouseMove);
            document.addEventListener('mouseup', handleMouseUp);
          }}
        />
      </motion.div>

      {/* Main Content Wrapper with dynamic margin */}
      <div 
        className="transition-all duration-300 ease-in-out"
        style={{ 
          marginLeft: sidebarOpen ? `${sidebarWidth}px` : '0px'
        }}
      >
        {children}
      </div>
    </div>
  );
}
