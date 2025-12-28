"use client";
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    GraduationCap, Users, ChevronRight, Sparkles, Trophy,
    Target, Brain, Zap, BookOpen
} from 'lucide-react';
import AptitudeTraining from '@/components/AptitudeTraining';
import CommunityTestCreator from '@/components/CommunityTestCreator';

// Tab Button Component
const TabButton = ({ active, onClick, icon: Icon, children, description }) => (
    <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex-1 p-6 rounded-2xl border-2 transition-all text-left ${active
                ? 'bg-gradient-to-br from-violet-500 to-purple-600 text-white border-violet-400 shadow-lg shadow-violet-200'
                : 'bg-white text-gray-700 border-gray-200 hover:border-violet-300 hover:shadow-md'
            }`}
    >
        <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${active ? 'bg-white/20' : 'bg-violet-100'
                }`}>
                <Icon className={`w-7 h-7 ${active ? 'text-white' : 'text-violet-600'}`} />
            </div>
            <div>
                <h3 className={`text-lg font-bold ${active ? 'text-white' : 'text-gray-900'}`}>
                    {children}
                </h3>
                <p className={`text-sm ${active ? 'text-white/80' : 'text-gray-500'}`}>
                    {description}
                </p>
            </div>
            <ChevronRight className={`ml-auto w-5 h-5 ${active ? 'text-white/60' : 'text-gray-400'}`} />
        </div>
    </motion.button>
);

export default function AchievementsPage() {
    const [activeTab, setActiveTab] = useState('training'); // 'training' | 'community'

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-violet-50/30 to-purple-50/20">
            {/* Hero Header */}
            <div className="bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 text-white">
                <div className="max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
                            <Trophy className="w-8 h-8" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">Placement Training Hub</h1>
                            <p className="text-violet-200">Master aptitude & ace your interviews</p>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-4 gap-4 mt-8">
                        {[
                            { icon: Brain, label: 'Practice Tests', value: '6 Levels' },
                            { icon: Target, label: 'Questions', value: '100+' },
                            { icon: Zap, label: 'XP System', value: 'Earn & Level Up' },
                            { icon: Users, label: 'Community', value: 'Create & Share' }
                        ].map((stat, i) => (
                            <div key={i} className="bg-white/10 backdrop-blur rounded-xl p-4">
                                <stat.icon className="w-5 h-5 text-violet-200 mb-2" />
                                <div className="text-2xl font-bold">{stat.value}</div>
                                <div className="text-sm text-violet-200">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Tab Selector */}
            <div className="max-w-7xl mx-auto px-6 -mt-6">
                <div className="flex gap-4">
                    <TabButton
                        active={activeTab === 'training'}
                        onClick={() => setActiveTab('training')}
                        icon={GraduationCap}
                        description="Level-by-level aptitude practice"
                    >
                        Aptitude Training
                    </TabButton>
                    <TabButton
                        active={activeTab === 'community'}
                        onClick={() => setActiveTab('community')}
                        icon={Users}
                        description="Create & share custom tests"
                    >
                        Community Tests
                    </TabButton>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto">
                <AnimatePresence mode="wait">
                    {activeTab === 'training' && (
                        <motion.div
                            key="training"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <AptitudeTraining />
                        </motion.div>
                    )}

                    {activeTab === 'community' && (
                        <motion.div
                            key="community"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CommunityTestCreator />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
