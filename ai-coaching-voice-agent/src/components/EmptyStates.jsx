"use client";
import { motion } from 'framer-motion';
import {
  Inbox,
  MessageSquare,
  Award,
  BarChart3,
  BookOpen,
  Sparkles,
  Search,
  Filter,
  FileText,
  Clock,
  Star,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';

const IconWrapper = ({ children, gradient }) => (
  <motion.div
    initial={{ scale: 0 }}
    animate={{ scale: 1 }}
    transition={{ type: "spring", duration: 0.6 }}
    className={`inline-flex p-4 rounded-2xl bg-linear-to-br ${gradient} mb-4`}
  >
    {children}
  </motion.div>
);

// Generic Empty State
export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionLabel,
  onAction,
  gradient = "from-white/10 to-white/5"
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center text-center p-8 md:p-12"
    >
      <IconWrapper gradient={gradient}>
        <Icon className="w-12 h-12 text-black" />
      </IconWrapper>
      
      <h3 className="text-xl font-bold text-black mb-2">
        {title}
      </h3>
      
      <p className="text-gray-800 max-w-md mb-6">
        {description}
      </p>

      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-linear-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-black border-none shadow-lg shadow-violet-500/20"
        >
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
}

// No Sessions Empty State
export function NoSessionsState({ onCreateSession }) {
  return (
    <EmptyState
      icon={MessageSquare}
      title="No Sessions Yet"
      description="Start your learning journey! Create your first coaching session to begin earning XP and unlocking achievements."
      actionLabel="Start Your First Session"
      onAction={onCreateSession}
      gradient="from-violet-500/20 to-pink-500/20"
    />
  );
}

// No Achievements Empty State
export function NoAchievementsState() {
  return (
    <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-300 p-8">
      <EmptyState
        icon={Award}
        title="No Achievements Unlocked"
        description="Complete sessions, build streaks, and explore different topics to start unlocking achievements!"
        gradient="from-amber-500/20 to-orange-500/20"
      />
      
      {/* Quick Tips */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-white rounded-xl border border-gray-300"
        >
          <Star className="w-6 h-6 text-purple-400 mb-2" />
          <h4 className="font-semibold text-black mb-1">First Steps</h4>
          <p className="text-sm text-gray-800">
            Complete your first session to unlock your first achievement
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 bg-white rounded-xl border border-gray-300"
        >
          <Zap className="w-6 h-6 text-blue-400 mb-2" />
          <h4 className="font-semibold text-black mb-1">Build Streaks</h4>
          <p className="text-sm text-gray-800">
            Practice daily to unlock streak achievements
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 bg-white rounded-xl border border-gray-300"
        >
          <BookOpen className="w-6 h-6 text-emerald-400 mb-2" />
          <h4 className="font-semibold text-black mb-1">Explore Topics</h4>
          <p className="text-sm text-gray-800">
            Try different coaching modes to unlock variety achievements
          </p>
        </motion.div>
      </div>
    </div>
  );
}

// No Analytics Empty State
export function NoAnalyticsState({ onCreateSession }) {
  return (
    <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-300 p-8">
      <EmptyState
        icon={BarChart3}
        title="No Analytics Yet"
        description="Complete your first session to start tracking your progress with beautiful charts and insights!"
        actionLabel="Create First Session"
        onAction={onCreateSession}
        gradient="from-blue-500/20 to-cyan-500/20"
      />
    </div>
  );
}

// No Search Results Empty State
export function NoSearchResultsState({ searchQuery, onClearSearch }) {
  return (
    <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-300 p-8">
      <EmptyState
        icon={Search}
        title="No Results Found"
        description={`We couldn't find any sessions matching "${searchQuery}". Try adjusting your search or filters.`}
        actionLabel="Clear Search"
        onAction={onClearSearch}
        gradient="from-white/10 to-white/5"
      />
    </div>
  );
}

// No History Empty State
export function NoHistoryState({ onCreateSession }) {
  return (
    <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-300 p-6">
      <EmptyState
        icon={Clock}
        title="No Session History"
        description="Your completed sessions will appear here. Start your first session to begin tracking your learning journey!"
        actionLabel="Start Learning"
        onAction={onCreateSession}
        gradient="from-indigo-500/20 to-purple-500/20"
      />
    </div>
  );
}

// No Feedback Empty State
export function NoFeedbackState() {
  return (
    <div className="bg-white backdrop-blur-xl rounded-2xl border border-gray-300 p-6">
      <EmptyState
        icon={FileText}
        title="No Feedback Yet"
        description="Complete a session and request feedback to see AI-generated insights and recommendations here."
        gradient="from-emerald-500/20 to-teal-500/20"
      />
    </div>
  );
}

// No Filters Match Empty State
export function NoFiltersMatchState({ onClearFilters }) {
  return (
    <EmptyState
      icon={Filter}
      title="No Matches"
      description="No sessions match your current filters. Try adjusting or clearing your filters to see more results."
      actionLabel="Clear Filters"
      onAction={onClearFilters}
      gradient="from-orange-500/20 to-red-500/20"
    />
  );
}

// Welcome State (First Time User)
export function WelcomeState({ onStart }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-linear-to-br from-violet-500/20 via-pink-500/20 to-orange-500/20 rounded-2xl border border-gray-300 p-8 md:p-12 backdrop-blur-xl"
    >
      <div className="text-center max-w-2xl mx-auto">
        <motion.div
          animate={{
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.1, 1, 1.1, 1]
          }}
          transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          className="inline-block mb-6"
        >
          <Sparkles className="w-20 h-20 text-violet-400" />
        </motion.div>

        <h1 className="text-3xl md:text-4xl font-bold text-black mb-4">
          Welcome to Your AI Coaching Platform! 🎉
        </h1>

        <p className="text-lg text-black mb-8">
          Start your learning journey with AI-powered coaching. Practice interviews, learn new skills,
          and earn XP while you grow!
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-white rounded-xl border border-gray-300">
            <MessageSquare className="w-8 h-8 text-violet-400 mx-auto mb-2" />
            <h3 className="font-semibold text-black mb-1">5 Coaching Modes</h3>
            <p className="text-sm text-gray-800">
              Lecture, Interview, Q&A, Language, Meditation
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-gray-300">
            <Award className="w-8 h-8 text-pink-400 mx-auto mb-2" />
            <h3 className="font-semibold text-black mb-1">40+ Achievements</h3>
            <p className="text-sm text-gray-800">
              Unlock badges as you learn and grow
            </p>
          </div>

          <div className="p-4 bg-white rounded-xl border border-gray-300">
            <BarChart3 className="w-8 h-8 text-blue-400 mx-auto mb-2" />
            <h3 className="font-semibold text-black mb-1">Track Progress</h3>
            <p className="text-sm text-gray-800">
              Visual analytics and insights
            </p>
          </div>
        </div>

        <Button
          onClick={onStart}
          size="lg"
          className="bg-linear-to-r from-violet-600 to-pink-600 hover:from-violet-500 hover:to-pink-500 text-black px-8 py-6 text-lg border-none shadow-lg shadow-violet-500/20"
        >
          <Sparkles className="w-5 h-5 mr-2" />
          Start Your First Session
        </Button>
      </div>
    </motion.div>
  );
}

export default EmptyState;
