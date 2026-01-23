import { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { AuthModal } from './AuthModal';
import { 
  Brain, 
  Target, 
  Clock, 
  BarChart3, 
  CheckCircle2, 
  Sparkles,
  ChevronRight,
  Star,
  Users,
  BookOpen,
  Trophy,
  Zap,
  Shield,
  ArrowRight,
  Play
} from 'lucide-react';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export function LandingPage({ onGetStarted }: { onGetStarted: () => void }) {
  const { user, isLoading } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Questions',
      description: 'Gemini AI generates questions from real exam patterns, ensuring relevant and challenging practice.',
      color: 'from-purple-500 to-indigo-600'
    },
    {
      icon: Target,
      title: 'Exam-Specific Content',
      description: 'Practice for Railway, SSC, JEE, NEET, Banking, and UPSC with tailored question sets.',
      color: 'from-emerald-500 to-teal-600'
    },
    {
      icon: Clock,
      title: 'Timed Practice',
      description: 'Simulate real exam conditions with customizable time limits per question.',
      color: 'from-orange-500 to-red-500'
    },
    {
      icon: BarChart3,
      title: 'Detailed Analytics',
      description: 'Track your performance with comprehensive reports, time analysis, and progress tracking.',
      color: 'from-blue-500 to-cyan-500'
    }
  ];

  const examCategories = [
    { name: 'Railway Exams', icon: '🚂', exams: ['RRB ALP', 'Group D', 'NTPC', 'JE'], color: 'bg-blue-50 border-blue-200' },
    { name: 'SSC Exams', icon: '📝', exams: ['CGL', 'CHSL', 'MTS', 'CPO'], color: 'bg-purple-50 border-purple-200' },
    { name: 'Engineering', icon: '⚡', exams: ['JEE Main', 'JEE Advanced', 'GATE'], color: 'bg-yellow-50 border-yellow-200' },
    { name: 'Medical', icon: '🧬', exams: ['NEET UG', 'NEET PG', 'AIIMS'], color: 'bg-green-50 border-green-200' },
    { name: 'Banking', icon: '🏦', exams: ['IBPS PO', 'SBI Clerk', 'RBI Grade B'], color: 'bg-pink-50 border-pink-200' },
    { name: 'Civil Services', icon: '📚', exams: ['UPSC CSE', 'State PSC', 'IAS'], color: 'bg-orange-50 border-orange-200' },
  ];

  const testimonials = [
    {
      name: 'Priya Sharma',
      role: 'RRB ALP Aspirant',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
      content: 'Free Prep helped me crack my Railway exam! The AI questions were spot-on with actual exam patterns.',
      rating: 5
    },
    {
      name: 'Rahul Kumar',
      role: 'SSC CGL Qualified',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
      content: 'The time analysis feature helped me improve my speed significantly. Highly recommended!',
      rating: 5
    },
    {
      name: 'Ananya Singh',
      role: 'JEE Aspirant',
      image: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ananya',
      content: 'Unlimited practice tests for free? This is a game changer for students like me.',
      rating: 5
    }
  ];

  const stats = [
    { value: '50K+', label: 'Questions Generated', icon: BookOpen },
    { value: '10K+', label: 'Tests Completed', icon: CheckCircle2 },
    { value: '5K+', label: 'Happy Students', icon: Users },
    { value: '95%', label: 'Success Rate', icon: Trophy },
  ];

  const howItWorks = [
    { step: '01', title: 'Enter API Key', description: 'Get your free Gemini API key from Google AI Studio' },
    { step: '02', title: 'Choose Subject', description: 'Select your exam or topic from our wide range' },
    { step: '03', title: 'Configure Test', description: 'Set number of questions, time limit, and sets' },
    { step: '04', title: 'Start Practicing', description: 'Take the test and get instant detailed analysis' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-white overflow-x-hidden">
      {/* Auth Modal */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
        defaultMode={authMode}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <span className="text-white font-bold text-lg">FP</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Free Prep</h1>
                <p className="text-[10px] text-gray-500 -mt-1">AI Test Generator</p>
              </div>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">Features</a>
              <a href="#exams" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">Exams</a>
              <a href="#how-it-works" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">How it Works</a>
              <a href="#testimonials" className="text-sm font-medium text-gray-600 hover:text-emerald-600 transition-colors">Reviews</a>
            </div>

            <div className="flex items-center gap-3">
              {isLoading ? (
                <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
              ) : user ? (
                <button
                  onClick={onGetStarted}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-200 transition-all flex items-center gap-2"
                >
                  Go to Dashboard
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <>
                  <button
                    onClick={() => openAuth('signin')}
                    className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-emerald-600 transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => openAuth('signup')}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-emerald-200 transition-all"
                  >
                    Get Started Free
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -right-1/3 w-[800px] h-[800px] bg-gradient-to-br from-emerald-400/30 via-teal-400/20 to-cyan-400/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-1/2 -left-1/3 w-[800px] h-[800px] bg-gradient-to-tr from-purple-400/20 via-pink-400/15 to-rose-400/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
          <div className="absolute top-1/4 right-1/4 w-64 h-64 bg-gradient-to-br from-blue-400/20 to-indigo-400/10 rounded-full blur-2xl" />
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px]"></div>
        </div>
        
        <div className="max-w-7xl mx-auto relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Enhanced Badge */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-50 to-teal-50 backdrop-blur-sm border border-emerald-200/50 rounded-full text-sm font-semibold text-emerald-700 mb-8 shadow-lg shadow-emerald-100/50"
            >
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Powered by Google Gemini AI
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </motion.div>
            
            {/* Enhanced Heading */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-gray-900 mb-6 leading-[1.1] tracking-tight">
              Practice Smarter,
              <br />
              <span className="relative inline-block">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 animate-gradient">
                  Score Higher
                </span>
                <motion.div
                  className="absolute -bottom-2 left-0 right-0 h-3 bg-gradient-to-r from-emerald-400/30 to-teal-400/30 blur-sm"
                  animate={{ scaleX: [0.8, 1, 0.8] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl text-gray-600 mb-10 max-w-3xl mx-auto leading-relaxed font-medium">
              Generate unlimited practice tests for <span className="text-emerald-600 font-bold">Railway, SSC, JEE, NEET,</span> and more. 
              <br className="hidden sm:block" />
              AI creates questions from <span className="text-teal-600 font-bold">real exam patterns.</span>
            </p>

            {/* Enhanced CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => user ? onGetStarted() : openAuth('signup')}
                className="group relative px-10 py-5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 text-white rounded-2xl font-bold text-lg hover:shadow-2xl hover:shadow-emerald-300/50 transition-all flex items-center gap-3 overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                <Play className="w-5 h-5 relative z-10" />
                <span className="relative z-10">Start Free Practice</span>
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform relative z-10" />
              </motion.button>
              <motion.a
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href="#how-it-works"
                className="px-10 py-5 bg-white/80 backdrop-blur-sm border-2 border-gray-200 hover:border-emerald-400 text-gray-700 rounded-2xl font-semibold text-lg hover:shadow-xl transition-all flex items-center gap-2"
              >
                See How it Works
                <ArrowRight className="w-5 h-5" />
              </motion.a>
            </div>

            {/* Enhanced Trust Badges */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold text-gray-700">No credit card</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold text-gray-700">Unlimited tests</span>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200/50 shadow-sm"
              >
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <span className="font-semibold text-gray-700">Free forever</span>
              </motion.div>
            </div>
          </motion.div>

          {/* Enhanced Step-by-Step Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="mt-20 max-w-6xl mx-auto"
          >
            <div className="grid md:grid-cols-3 gap-6">
              {/* Step 1: API Key */}
              <motion.div
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition" />
                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 shadow-xl">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    1
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 mt-4">Enter your Gemini API Key</h3>
                  <div className="mb-4">
                    <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-600 font-mono">
                      AIza...
                    </div>
                  </div>
                  <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-sm text-emerald-600 font-semibold hover:text-emerald-700">
                    🔗 Get free API key from Google AI Studio
                  </a>
                </div>
              </motion.div>

              {/* Step 2: Choose Subject */}
              <motion.div
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-500 to-cyan-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition" />
                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 shadow-xl">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    2
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 mt-4">Choose your subject</h3>
                  <p className="text-sm text-gray-600 mb-4">e.g., Railway Group D General Science, SSC CGL Maths...</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { emoji: '🚂', text: 'Railway ALP' },
                      { emoji: '🧠', text: 'SSC CGL' },
                      { emoji: '⚡', text: 'JEE Physics' },
                      { emoji: '🧬', text: 'NEET Biology' },
                      { emoji: '🏦', text: 'Bank PO' },
                      { emoji: '📚', text: 'UPSC GK' }
                    ].map((item, i) => (
                      <div key={i} className="px-3 py-2 bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 text-xs font-semibold text-gray-700 hover:border-teal-400 transition cursor-pointer">
                        {item.emoji} {item.text}
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Step 3: Configure Test */}
              <motion.div
                whileHover={{ y: -5 }}
                className="relative group"
              >
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-3xl blur opacity-30 group-hover:opacity-60 transition" />
                <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 shadow-xl">
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    3
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 mt-4">Configure your test</h3>
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">📋 Sets</span>
                      <span className="px-3 py-1 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg text-sm font-bold text-cyan-700">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">❓ Questions/Set</span>
                      <span className="px-3 py-1 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg text-sm font-bold text-cyan-700">20</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">⏱️ Time/Question</span>
                      <span className="px-3 py-1 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg text-sm font-bold text-cyan-700">60s</span>
                    </div>
                  </div>
                  <div className="px-3 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl">
                    <p className="text-xs text-amber-800">💡 <span className="font-semibold">Tip:</span> Start with 1-2 sets for faster generation</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Summary Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="mt-8 relative"
            >
              <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl blur opacity-20" />
              <div className="relative bg-white/90 backdrop-blur-xl rounded-3xl p-8 border border-gray-200/50 shadow-2xl">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex items-center gap-6 flex-wrap justify-center md:justify-start">
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 mb-1">60</div>
                      <div className="text-sm text-gray-600">Questions</div>
                    </div>
                    <div className="w-px h-12 bg-gray-200" />
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 mb-1">60</div>
                      <div className="text-sm text-gray-600">Minutes</div>
                    </div>
                    <div className="w-px h-12 bg-gray-200" />
                    <div className="text-center">
                      <div className="text-4xl font-bold text-gray-900 mb-1">3</div>
                      <div className="text-sm text-gray-600">Sets</div>
                    </div>
                    <div className="w-px h-12 bg-gray-200" />
                    <div className="flex gap-3">
                      <div className="px-4 py-2 bg-green-50 rounded-xl border border-green-200">
                        <div className="text-sm font-bold text-green-700">+4</div>
                        <div className="text-xs text-green-600">Correct</div>
                      </div>
                      <div className="px-4 py-2 bg-red-50 rounded-xl border border-red-200">
                        <div className="text-sm font-bold text-red-700">-1</div>
                        <div className="text-xs text-red-600">Wrong</div>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => user ? onGetStarted() : openAuth('signup')}
                    className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-lg shadow-lg shadow-emerald-300/50 hover:shadow-xl hover:shadow-emerald-400/50 transition-all flex items-center gap-3 whitespace-nowrap"
                  >
                    🚀 Start Practice Test
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="mt-20 grid md:grid-cols-3 gap-6 max-w-5xl mx-auto"
          >
            <motion.div whileHover={{ scale: 1.05 }} className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">🎯 PYQ Based Questions</h4>
              <p className="text-sm text-gray-600">AI generates questions based on previous year exam patterns and most asked topics.</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Clock className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">⏱️ Time Tracking</h4>
              <p className="text-sm text-gray-600">Track how much time you spend on each question. Improve your speed with analytics.</p>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} className="text-center p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 shadow-lg">
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h4 className="text-lg font-bold text-gray-900 mb-2">📊 Detailed Analysis</h4>
              <p className="text-sm text-gray-600">Get comprehensive reports with charts, set-wise breakdown, and performance insights.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-emerald-500 to-teal-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-4 gap-8"
          >
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="w-7 h-7 text-white" />
                </div>
                <div className="text-4xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-emerald-100 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-50 border border-purple-200 rounded-full text-sm font-medium text-purple-700 mb-4">
              <Zap className="w-4 h-4" />
              Powerful Features
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Everything You Need to
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500"> Succeed</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI-powered platform provides all the tools you need to prepare for competitive exams effectively.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group bg-white rounded-3xl p-8 border border-gray-100 hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300"
              >
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-r ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg`}>
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Exam Categories */}
      <section id="exams" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-full text-sm font-medium text-blue-700 mb-4">
              <BookOpen className="w-4 h-4" />
              Wide Coverage
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Practice for
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-500"> Any Exam</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Our AI can generate questions for a wide variety of competitive exams and subjects.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {examCategories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`${category.color} border-2 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group`}
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{category.name}</h3>
                <div className="flex flex-wrap gap-2">
                  {category.exams.map((exam, i) => (
                    <span key={i} className="px-3 py-1 bg-white/80 rounded-lg text-sm text-gray-700 font-medium">
                      {exam}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 rounded-full text-sm font-medium text-emerald-700 mb-4">
              <Target className="w-4 h-4" />
              Simple Process
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Get Started in
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500"> 4 Steps</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Start practicing within minutes. No complicated setup required.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8">
            {howItWorks.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {index < 3 && (
                  <div className="hidden md:block absolute top-12 left-full w-full h-0.5 bg-gradient-to-r from-emerald-300 to-transparent" />
                )}
                <div className="text-6xl font-bold text-emerald-100 mb-4">{item.step}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-full text-sm font-medium text-yellow-700 mb-4">
              <Star className="w-4 h-4 fill-yellow-500" />
              Student Reviews
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Loved by
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 to-orange-500"> Thousands</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See what students say about their experience with Free Prep.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-gray-600 mb-6 leading-relaxed">"{testimonial.content}"</p>
                <div className="flex items-center gap-4">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full bg-gray-100"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-3xl p-12 text-center relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yIDItNCAyLTRzLTItMi00LTJjLTIgMC00IDItNCAyczIgNCA0IDRjMiAwIDItMiAyLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-30" />
            
            <div className="relative z-10">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to Start Practicing?
              </h2>
              <p className="text-emerald-100 text-lg mb-8 max-w-xl mx-auto">
                Join thousands of students who are already using Free Prep to ace their competitive exams.
              </p>
              <button
                onClick={() => user ? onGetStarted() : openAuth('signup')}
                className="px-8 py-4 bg-white text-emerald-600 rounded-2xl font-bold text-lg hover:shadow-xl transition-all inline-flex items-center gap-3"
              >
                Get Started Free
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">FP</span>
                </div>
                <div>
                  <h3 className="text-white font-bold">Free Prep</h3>
                  <p className="text-xs text-gray-500">AI Test Generator</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">
                AI-powered practice test platform for competitive exam preparation. Generate unlimited questions and improve your scores.
              </p>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Exams</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Railway Exams</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">SSC Exams</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">JEE/NEET</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Banking</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">How It Works</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Get API Key</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-emerald-400 transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">
              © {new Date().getFullYear()} Free Prep. All rights reserved.
            </p>
            <div className="flex items-center gap-2 text-sm">
              <span>Powered by</span>
              <span className="text-emerald-400 font-medium">Google Gemini AI</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
