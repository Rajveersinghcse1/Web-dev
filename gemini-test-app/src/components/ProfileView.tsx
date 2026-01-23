import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { Layout } from './Layout';
import { 
  User, 
  Mail, 
  Calendar, 
  Trophy, 
  Target, 
  TrendingUp,
  BookOpen,
  Award,
  Edit2,
  Save,
  X,
  Phone,
  MapPin,
  Briefcase
} from 'lucide-react';

interface ProfileViewProps {
  onClose: () => void;
  onNavigate?: (view: string) => void;
}

export function ProfileView({ onNavigate }: ProfileViewProps) {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  const updateProfile = useMutation(api.auth.updateProfile);
  
  const userProfile = useQuery(api.users.getUserProfile, 
    user?.id ? { userId: user.id } : "skip"
  );

  const [editedProfile, setEditedProfile] = useState({
    nickname: userProfile?.nickname || '',
    email: userProfile?.email || user?.email || '',
    fullName: userProfile?.fullName || user?.name || '',
    phone: userProfile?.phone || '',
    location: userProfile?.location || '',
    bio: userProfile?.bio || ''
  });
  
  const userStats = useQuery(api.users.getUserStats, 
    user?.id ? { userId: user.id } : "skip"
  );

  const testHistory = useQuery(api.testResults.getTestHistory, 
    user?.id ? { userId: user.id } : "skip"
  );

  const formatDate = (timestamp: number | undefined) => {
    if (!timestamp) {
      return new Date().toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
    return new Date(timestamp).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getPerformanceLevel = () => {
    if (!userStats) return { level: 'Beginner', color: 'text-gray-600', bgColor: 'bg-gray-100' };
    const avgScore = userStats.averageScore || 0;
    
    if (avgScore >= 90) return { level: 'Expert', color: 'text-purple-600', bgColor: 'bg-purple-100' };
    if (avgScore >= 75) return { level: 'Advanced', color: 'text-emerald-600', bgColor: 'bg-emerald-100' };
    if (avgScore >= 60) return { level: 'Intermediate', color: 'text-blue-600', bgColor: 'bg-blue-100' };
    return { level: 'Beginner', color: 'text-yellow-600', bgColor: 'bg-yellow-100' };
  };

  const performanceLevel = getPerformanceLevel();

  // Calculate streak (consecutive days with tests)
  const calculateStreak = () => {
    if (!testHistory || testHistory.length === 0) return 0;
    
    let streak = 0;
    let currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    
    const sortedTests = [...testHistory].sort((a, b) => b.createdAt - a.createdAt);
    
    for (const test of sortedTests) {
      const testDate = new Date(test.createdAt);
      testDate.setHours(0, 0, 0, 0);
      
      const diffDays = Math.floor((currentDate.getTime() - testDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (diffDays === streak) {
        streak++;
        currentDate = testDate;
      } else if (diffDays > streak) {
        break;
      }
    }
    
    return streak;
  };

  const streak = calculateStreak();

  const handleSaveProfile = async () => {
    if (!user?.id) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      await updateProfile({
        userId: user.id,
        nickname: editedProfile.nickname || undefined,
        fullName: editedProfile.fullName || undefined,
        phone: editedProfile.phone || undefined,
        location: editedProfile.location || undefined,
        bio: editedProfile.bio || undefined,
      });
      
      setSaveSuccess(true);
      setIsEditing(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to save profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditedProfile({
      nickname: userProfile?.nickname || '',
      email: userProfile?.email || user?.email || '',
      fullName: userProfile?.fullName || user?.name || '',
      phone: userProfile?.phone || '',
      location: userProfile?.location || '',
      bio: userProfile?.bio || ''
    });
    setSaveError(null);
    setIsEditing(false);
  };

  return (
    <Layout activeTab="profile" onNavigate={onNavigate}>
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Success/Error Messages */}
        {saveSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-emerald-100 border border-emerald-300 rounded-lg text-emerald-800"
          >
            Profile updated successfully!
          </motion.div>
        )}
        {saveError && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800"
          >
            {saveError}
          </motion.div>
        )}

        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden mb-4"
        >
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-8 text-white relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32"></div>
            <div className="relative flex items-start justify-between">
              <div className="flex items-start gap-6">
                <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div className="flex-1">
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.fullName}
                      onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                      className="text-3xl font-bold mb-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-lg px-3 py-1 text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                      placeholder="Full Name"
                    />
                  ) : (
                    <h1 className="text-3xl font-bold mb-2">{user?.name || 'User'}</h1>
                  )}
                  <div className="flex items-center gap-2 mb-3">
                    <Mail className="w-4 h-4 text-emerald-100" />
                    <p className="text-emerald-100">{user?.email}</p>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 ${performanceLevel.bgColor} ${performanceLevel.color} rounded-full text-sm font-bold`}>
                    <Award className="w-4 h-4" />
                    {performanceLevel.level}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={handleSaveProfile}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-white text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <div className="w-4 h-4 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      disabled={isSaving}
                      className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg hover:bg-white/30 transition-colors font-medium"
                  >
                    <Edit2 className="w-4 h-4" />
                    Edit Profile
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <BookOpen className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{userStats?.totalTests || 0}</p>
              <p className="text-xs text-gray-600">Tests Taken</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Target className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{userStats?.averageScore?.toFixed(1) || 0}%</p>
              <p className="text-xs text-gray-600">Avg Score</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{userStats?.correctAnswers || 0}</p>
              <p className="text-xs text-gray-600">Correct Answers</p>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{streak}</p>
              <p className="text-xs text-gray-600">Day Streak</p>
            </div>
          </div>
        </motion.div>

        {/* Account Information */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mb-4"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-emerald-600" />
            Account Information
          </h2>
          <div className="space-y-3">
            {/* Nickname */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <User className="w-4 h-4" />
                Nickname
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.nickname}
                  onChange={(e) => setEditedProfile({ ...editedProfile, nickname: e.target.value })}
                  className="text-sm font-bold text-gray-900 bg-white border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter nickname"
                />
              ) : (
                <span className="text-sm font-bold text-gray-900">{editedProfile.nickname || 'Not set'}</span>
              )}
            </div>

            {/* Full Name */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.fullName}
                  onChange={(e) => setEditedProfile({ ...editedProfile, fullName: e.target.value })}
                  className="text-sm font-bold text-gray-900 bg-white border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter full name"
                />
              ) : (
                <span className="text-sm font-bold text-gray-900">{editedProfile.fullName || 'Not set'}</span>
              )}
            </div>

            {/* Email */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </span>
              <span className="text-sm font-bold text-gray-900">{editedProfile.email}</span>
            </div>

            {/* Phone */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </span>
              {isEditing ? (
                <input
                  type="tel"
                  value={editedProfile.phone}
                  onChange={(e) => setEditedProfile({ ...editedProfile, phone: e.target.value })}
                  className="text-sm font-bold text-gray-900 bg-white border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Enter phone number"
                />
              ) : (
                <span className="text-sm font-bold text-gray-900">{editedProfile.phone || 'Not set'}</span>
              )}
            </div>

            {/* Location */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </span>
              {isEditing ? (
                <input
                  type="text"
                  value={editedProfile.location}
                  onChange={(e) => setEditedProfile({ ...editedProfile, location: e.target.value })}
                  className="text-sm font-bold text-gray-900 bg-white border border-gray-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="City, Country"
                />
              ) : (
                <span className="text-sm font-bold text-gray-900">{editedProfile.location || 'Not set'}</span>
              )}
            </div>

            {/* Member Since */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Member Since
              </span>
              <span className="text-sm font-bold text-gray-900">
                {user?.createdAt ? formatDate(user.createdAt) : 'Unknown'}
              </span>
            </div>

            {/* Bio */}
            {isEditing && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <label className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-2">
                  <Briefcase className="w-4 h-4" />
                  Bio
                </label>
                <textarea
                  value={editedProfile.bio}
                  onChange={(e) => setEditedProfile({ ...editedProfile, bio: e.target.value })}
                  className="w-full text-sm text-gray-900 bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[80px]"
                  placeholder="Tell us about yourself..."
                />
              </div>
            )}
            {!isEditing && editedProfile.bio && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium text-gray-600 flex items-center gap-2 mb-1">
                  <Briefcase className="w-4 h-4" />
                  Bio
                </span>
                <p className="text-sm text-gray-900">{editedProfile.bio}</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
        >
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-600" />
            Recent Activity
          </h2>
          {testHistory && testHistory.length > 0 ? (
            <div className="space-y-3">
              {testHistory.slice(0, 5).map((test, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-emerald-50 transition-colors">
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{test.subject}</p>
                    <p className="text-xs text-gray-500">{formatDate(test.createdAt)}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-lg font-bold ${test.percentage >= 70 ? 'text-emerald-600' : test.percentage >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                      {test.percentage}%
                    </p>
                    <p className="text-xs text-gray-500">{test.correct}/{test.totalQuestions}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm">No activity yet</p>
              <p className="text-gray-400 text-xs">Take a test to see your activity</p>
            </div>
          )}
        </motion.div>
      </div>
    </Layout>
  );
}
