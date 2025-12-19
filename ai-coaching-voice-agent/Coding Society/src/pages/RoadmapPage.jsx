import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  Circle, 
  Lock,
  Clock,
  Users,
  Brain,
  Sparkles,
  Trophy,
  Target,
  Zap,
  BookOpen,
  GraduationCap,
  Briefcase,
  Code,
  Star
} from 'lucide-react';
import { useMode } from '../context/ModeContext';

const ACADEMIC_ROADMAP = [
  {
    id: 'sem1',
    title: 'Semester 1: Foundations',
    description: 'Core computer science concepts and programming basics',
    color: 'bg-blue-600',
    gradient: 'from-blue-500 to-blue-600',
    icon: <BookOpen className="w-6 h-6 text-white" />,
    progress: 100,
    totalItems: 5,
    items: [
      { id: 'cs101', title: 'Intro to Computer Science', duration: '16 weeks', difficulty: 'Beginner', locked: false },
      { id: 'math101', title: 'Calculus I', duration: '16 weeks', difficulty: 'Intermediate', locked: false },
      { id: 'prog101', title: 'Programming Fundamentals (C++)', duration: '16 weeks', difficulty: 'Beginner', locked: false },
      { id: 'eng101', title: 'Technical Writing', duration: '16 weeks', difficulty: 'Beginner', locked: false },
      { id: 'lab101', title: 'Computer Lab I', duration: '16 weeks', difficulty: 'Beginner', locked: false }
    ]
  },
  {
    id: 'sem2',
    title: 'Semester 2: Data Structures',
    description: 'Advanced programming and data organization',
    color: 'bg-indigo-600',
    gradient: 'from-indigo-500 to-indigo-600',
    icon: <Code className="w-6 h-6 text-white" />,
    progress: 40,
    totalItems: 5,
    items: [
      { id: 'cs102', title: 'Data Structures & Algorithms', duration: '16 weeks', difficulty: 'Advanced', locked: false },
      { id: 'math102', title: 'Discrete Mathematics', duration: '16 weeks', difficulty: 'Advanced', locked: false },
      { id: 'prog102', title: 'Object Oriented Programming (Java)', duration: '16 weeks', difficulty: 'Intermediate', locked: false },
      { id: 'phy101', title: 'Physics for CS', duration: '16 weeks', difficulty: 'Intermediate', locked: true },
      { id: 'lab102', title: 'Computer Lab II', duration: '16 weeks', difficulty: 'Intermediate', locked: true }
    ]
  },
  {
    id: 'sem3',
    title: 'Semester 3: Systems',
    description: 'Computer architecture and operating systems',
    color: 'bg-violet-600',
    gradient: 'from-violet-500 to-violet-600',
    icon: <Zap className="w-6 h-6 text-white" />,
    progress: 0,
    totalItems: 5,
    items: [
      { id: 'cs201', title: 'Computer Architecture', duration: '16 weeks', difficulty: 'Advanced', locked: true },
      { id: 'cs202', title: 'Operating Systems', duration: '16 weeks', difficulty: 'Advanced', locked: true },
      { id: 'db101', title: 'Database Management Systems', duration: '16 weeks', difficulty: 'Intermediate', locked: true },
      { id: 'math201', title: 'Linear Algebra', duration: '16 weeks', difficulty: 'Advanced', locked: true },
      { id: 'web101', title: 'Web Technologies', duration: '16 weeks', difficulty: 'Intermediate', locked: true }
    ]
  }
];

const PROFESSIONAL_ROADMAP = [
  {
    id: 'frontend',
    title: 'Frontend Engineering',
    description: 'Master modern frontend technologies and build amazing user interfaces',
    color: 'bg-pink-600',
    gradient: 'from-pink-500 to-rose-500',
    icon: <Zap className="w-6 h-6 text-white" />,
    progress: 25,
    totalItems: 12,
    items: [
      { id: 'html-basics', title: 'HTML Fundamentals', duration: '2 weeks', difficulty: 'Beginner', locked: false },
      { id: 'css-basics', title: 'CSS & Responsive Design', duration: '3 weeks', difficulty: 'Beginner', locked: false },
      { id: 'javascript-fundamentals', title: 'JavaScript Fundamentals', duration: '4 weeks', difficulty: 'Beginner', locked: false },
      { id: 'react-basics', title: 'React Fundamentals', duration: '4 weeks', difficulty: 'Intermediate', locked: false },
      { id: 'react-advanced', title: 'Advanced React Patterns', duration: '3 weeks', difficulty: 'Advanced', locked: true },
      { id: 'typescript', title: 'TypeScript for React', duration: '2 weeks', difficulty: 'Intermediate', locked: true },
      { id: 'state-management', title: 'State Management', duration: '2 weeks', difficulty: 'Advanced', locked: true },
      { id: 'testing', title: 'Frontend Testing', duration: '2 weeks', difficulty: 'Intermediate', locked: true },
      { id: 'performance', title: 'Performance Optimization', duration: '1 week', difficulty: 'Advanced', locked: true },
      { id: 'bundlers', title: 'Build Tools & Bundlers', duration: '1 week', difficulty: 'Intermediate', locked: true },
      { id: 'pwa', title: 'Progressive Web Apps', duration: '2 weeks', difficulty: 'Advanced', locked: true },
      { id: 'deployment', title: 'Frontend Deployment', duration: '1 week', difficulty: 'Intermediate', locked: true }
    ]
  },
  {
    id: 'backend',
    title: 'Backend Engineering',
    description: 'Learn server-side programming and database management',
    color: 'bg-purple-600',
    gradient: 'from-purple-500 to-indigo-500',
    icon: <Target className="w-6 h-6 text-white" />,
    progress: 10,
    totalItems: 10,
    items: [
      { id: 'nodejs-basics', title: 'Node.js Fundamentals', duration: '3 weeks', difficulty: 'Beginner', locked: false },
      { id: 'express', title: 'Express.js Framework', duration: '2 weeks', difficulty: 'Beginner', locked: false },
      { id: 'databases', title: 'Database Design (SQL/NoSQL)', duration: '4 weeks', difficulty: 'Intermediate', locked: true },
      { id: 'auth', title: 'Authentication & Authorization', duration: '2 weeks', difficulty: 'Intermediate', locked: true },
      { id: 'apis', title: 'RESTful APIs & GraphQL', duration: '3 weeks', difficulty: 'Intermediate', locked: true },
      { id: 'microservices', title: 'Microservices Architecture', duration: '3 weeks', difficulty: 'Advanced', locked: true },
      { id: 'caching', title: 'Caching Strategies', duration: '1 week', difficulty: 'Intermediate', locked: true },
      { id: 'docker', title: 'Containerization with Docker', duration: '2 weeks', difficulty: 'Intermediate', locked: true },
      { id: 'cloud', title: 'Cloud Deployment (AWS/Azure)', duration: '3 weeks', difficulty: 'Advanced', locked: true },
      { id: 'monitoring', title: 'Monitoring & Logging', duration: '1 week', difficulty: 'Advanced', locked: true }
    ]
  },
  {
    id: 'aiml',
    title: 'AI & Machine Learning',
    description: 'Dive into artificial intelligence and machine learning',
    color: 'bg-fuchsia-600',
    gradient: 'from-fuchsia-500 to-purple-600',
    icon: <Brain className="w-6 h-6 text-white" />,
    progress: 5,
    totalItems: 9,
    items: [
      { id: 'python-ai', title: 'Python for AI/ML', duration: '3 weeks', difficulty: 'Beginner', locked: false },
      { id: 'numpy-pandas', title: 'NumPy & Pandas', duration: '2 weeks', difficulty: 'Beginner', locked: false },
      { id: 'statistics', title: 'Statistics & Probability', duration: '3 weeks', difficulty: 'Intermediate', locked: true },
      { id: 'ml-algorithms', title: 'Machine Learning Algorithms', duration: '4 weeks', difficulty: 'Intermediate', locked: true },
      { id: 'deep-learning', title: 'Deep Learning with TensorFlow', duration: '5 weeks', difficulty: 'Advanced', locked: true },
      { id: 'nlp', title: 'Natural Language Processing', duration: '3 weeks', difficulty: 'Advanced', locked: true },
      { id: 'computer-vision', title: 'Computer Vision', duration: '3 weeks', difficulty: 'Advanced', locked: true },
      { id: 'deployment-ml', title: 'ML Model Deployment', duration: '2 weeks', difficulty: 'Advanced', locked: true },
      { id: 'mlops', title: 'MLOps & Model Monitoring', duration: '2 weeks', difficulty: 'Advanced', locked: true }
    ]
  }
];

const RoadmapPage = () => {
  const { mode } = useMode();
  const [expandedSections, setExpandedSections] = useState(['sem1', 'frontend']);
  const [completedItems, setCompletedItems] = useState(['html-basics', 'css-basics', 'cs101', 'math101', 'prog101', 'eng101', 'lab101']);

  const roadmapData = mode === 'professional' ? PROFESSIONAL_ROADMAP : ACADEMIC_ROADMAP;
  const isProfessional = mode === 'professional';

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const toggleCompletion = (itemId) => {
    setCompletedItems(prev => 
      prev.includes(itemId)
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-emerald-700 bg-emerald-50 border-emerald-200';
      case 'Intermediate': return 'text-amber-700 bg-amber-50 border-amber-200';
      case 'Advanced': return 'text-rose-700 bg-rose-50 border-rose-200';
      default: return 'text-gray-700 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className={`min-h-screen pt-24 pb-12 font-sans transition-colors duration-500 ${
      isProfessional ? 'bg-slate-900' : 'bg-slate-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 relative">
          <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[200px] blur-[100px] rounded-full pointer-events-none transition-colors duration-500 ${
            isProfessional ? 'bg-purple-500/20' : 'bg-blue-100/50'
          }`}></div>
          <h1 className={`relative text-5xl font-extrabold mb-6 tracking-tight transition-colors duration-300 ${
            isProfessional ? 'text-white' : 'text-gray-900'
          }`}>
            {isProfessional ? 'Career' : 'Academic'} <span className={`text-transparent bg-clip-text bg-gradient-to-r ${
              isProfessional ? 'from-pink-500 via-purple-500 to-indigo-500' : 'from-blue-600 via-indigo-600 to-purple-600'
            }`}>Roadmap</span>
          </h1>
          <p className={`relative text-xl max-w-3xl mx-auto leading-relaxed transition-colors duration-300 ${
            isProfessional ? 'text-slate-400' : 'text-gray-600'
          }`}>
            {isProfessional 
              ? 'Follow industry-standard learning paths designed to take you from junior to senior developer.'
              : 'Track your semester-wise progress, manage your GPA, and master your core computer science subjects.'}
          </p>
        </div>

        {/* AI Suggestion Box */}
        <div className={`mb-12 rounded-3xl border shadow-xl overflow-hidden relative group transition-all duration-300 ${
          isProfessional 
            ? 'bg-slate-800/50 border-slate-700 shadow-purple-900/20' 
            : 'bg-white border-gray-100 shadow-blue-900/5'
        }`}>
          <div className={`absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r ${
            isProfessional ? 'from-pink-500 via-purple-500 to-indigo-500' : 'from-blue-500 via-purple-500 to-pink-500'
          }`}></div>
          <div className="p-8 relative z-10">
            <div className="flex flex-col md:flex-row items-start gap-8">
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 group-hover:scale-105 transition-transform duration-300 ${
                isProfessional ? 'bg-gradient-to-br from-pink-500 to-purple-600 shadow-purple-500/20' : 'bg-gradient-to-br from-blue-500 to-purple-600 shadow-blue-500/20'
              }`}>
                <Brain className="w-10 h-10 text-white" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className={`text-2xl font-bold transition-colors duration-300 ${
                    isProfessional ? 'text-white' : 'text-gray-900'
                  }`}>
                    AI Learning Assistant
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1 ${
                    isProfessional 
                      ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' 
                      : 'bg-yellow-50 text-yellow-700 border-yellow-200'
                  }`}>
                    <Sparkles className="w-3 h-3" />
                    RECOMMENDED
                  </span>
                </div>
                <p className={`text-lg mb-8 leading-relaxed max-w-4xl transition-colors duration-300 ${
                  isProfessional ? 'text-slate-300' : 'text-gray-600'
                }`}>
                  {isProfessional
                    ? <span>Based on your progress, I recommend focusing on <strong className="text-white font-semibold">JavaScript Fundamentals</strong> next. You've completed the HTML and CSS basics!</span>
                    : <span>You're doing great in Semester 1! I recommend starting <strong className="text-gray-900 font-semibold">Data Structures</strong> early to get a head start on next semester.</span>
                  }
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button className={`rounded-xl px-8 py-6 text-base font-medium shadow-lg transition-all duration-300 hover:-translate-y-0.5 ${
                    isProfessional 
                      ? 'bg-white text-slate-900 hover:bg-slate-100 shadow-white/10' 
                      : 'bg-gray-900 text-white hover:bg-gray-800 shadow-gray-900/20'
                  }`}>
                    {isProfessional ? 'Start JavaScript' : 'Preview Data Structures'}
                  </Button>
                  <Button variant="outline" className={`rounded-xl px-8 py-6 text-base font-medium ${
                    isProfessional 
                      ? 'border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white' 
                      : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}>
                    Get More Suggestions
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Roadmap Sections */}
        <div className="space-y-8">
          {roadmapData.map((section) => {
            const isExpanded = expandedSections.includes(section.id);
            const completedInSection = section.items.filter(item => 
              completedItems.includes(item.id)
            ).length;
            const progressPercent = (completedInSection / section.totalItems) * 100;

            return (
              <div key={section.id} className={`rounded-3xl border shadow-sm overflow-hidden transition-all duration-300 hover:shadow-xl ${
                isProfessional 
                  ? 'bg-slate-800/50 border-slate-700 hover:shadow-purple-900/10' 
                  : 'bg-white border-gray-100 hover:shadow-gray-200/50'
              }`}>
                <div
                  className={`p-8 cursor-pointer transition-colors ${
                    isProfessional ? 'hover:bg-slate-800' : 'hover:bg-gray-50/50'
                  }`}
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div className="flex items-center gap-6">
                      <div className={`w-16 h-16 bg-gradient-to-br ${section.gradient} rounded-2xl flex items-center justify-center shadow-lg transform transition-transform duration-300 group-hover:scale-110 ${
                        isProfessional ? 'shadow-purple-900/20' : 'shadow-gray-200'
                      }`}>
                        {section.icon}
                      </div>
                      <div>
                        <h3 className={`text-2xl font-bold mb-2 transition-colors duration-300 ${
                          isProfessional ? 'text-white' : 'text-gray-900'
                        }`}>{section.title}</h3>
                        <p className={`text-base transition-colors duration-300 ${
                          isProfessional ? 'text-slate-400' : 'text-gray-600'
                        }`}>
                          {section.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-col items-end min-w-[240px]">
                      <div className="flex items-center justify-between w-full mb-3">
                        <span className={`text-sm font-semibold ${
                          isProfessional ? 'text-slate-400' : 'text-gray-700'
                        }`}>Progress</span>
                        <span className={`text-sm font-bold ${
                          isProfessional ? 'text-white' : 'text-gray-900'
                        }`}>{Math.round(progressPercent)}%</span>
                      </div>
                      <div className={`w-full rounded-full h-3 overflow-hidden ${
                        isProfessional ? 'bg-slate-700' : 'bg-gray-100'
                      }`}>
                        <div
                          className={`h-full rounded-full bg-gradient-to-r ${section.gradient} transition-all duration-1000 ease-out`}
                          style={{ width: `${progressPercent}%` }}
                        ></div>
                      </div>
                      <div className={`mt-2 text-xs font-medium ${
                        isProfessional ? 'text-slate-500' : 'text-gray-500'
                      }`}>
                        {completedInSection} of {section.totalItems} modules completed
                      </div>
                    </div>
                    <div className={`hidden md:block ${
                      isProfessional ? 'text-slate-500' : 'text-gray-400'
                    }`}>
                      {isExpanded ? (
                        <ChevronDown className="w-6 h-6" />
                      ) : (
                        <ChevronRight className="w-6 h-6" />
                      )}
                    </div>
                  </div>
                </div>

                {isExpanded && (
                  <div className={`border-t p-8 ${
                    isProfessional 
                      ? 'border-slate-700 bg-slate-900/30' 
                      : 'border-gray-100 bg-gray-50/30'
                  }`}>
                    <div className="grid gap-5">
                      {section.items.map((item, index) => {
                        const isCompleted = completedItems.includes(item.id);
                        const isLocked = item.locked;

                        return (
                          <div
                            key={item.id}
                            className={`flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-2xl border transition-all duration-300 ${
                              isProfessional
                                ? isLocked
                                  ? 'bg-slate-800/30 border-slate-800 opacity-50'
                                  : isCompleted
                                    ? 'bg-emerald-900/10 border-emerald-900/30'
                                    : 'bg-slate-800 border-slate-700 hover:border-pink-500/50 hover:shadow-lg hover:shadow-pink-500/5'
                                : isLocked 
                                  ? 'bg-gray-50 border-gray-100 opacity-70' 
                                  : isCompleted 
                                    ? 'bg-emerald-50/30 border-emerald-100'
                                    : 'bg-white border-gray-100 hover:shadow-lg hover:border-blue-200 hover:-translate-y-0.5'
                            }`}
                          >
                            <button
                              onClick={() => !isLocked && toggleCompletion(item.id)}
                              disabled={isLocked}
                              className="flex-shrink-0 focus:outline-none"
                            >
                              {isLocked ? (
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border ${
                                  isProfessional 
                                    ? 'bg-slate-800 border-slate-700' 
                                    : 'bg-gray-100 border-gray-200'
                                }`}>
                                  <Lock className={`w-5 h-5 ${
                                    isProfessional ? 'text-slate-600' : 'text-gray-400'
                                  }`} />
                                </div>
                              ) : isCompleted ? (
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border shadow-sm ${
                                  isProfessional
                                    ? 'bg-emerald-900/20 border-emerald-800'
                                    : 'bg-emerald-100 border-emerald-200'
                                }`}>
                                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                                </div>
                              ) : (
                                <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center transition-all duration-300 group ${
                                  isProfessional
                                    ? 'bg-slate-800 border-slate-600 hover:border-pink-500'
                                    : 'bg-white border-gray-200 hover:border-blue-500 hover:shadow-md'
                                }`}>
                                  <Circle className={`w-6 h-6 ${
                                    isProfessional 
                                      ? 'text-slate-600 group-hover:text-pink-500' 
                                      : 'text-gray-300 group-hover:text-blue-500'
                                  }`} />
                                </div>
                              )}
                            </button>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-3 mb-2">
                                <h4 className={`font-bold text-lg ${
                                  isLocked 
                                    ? (isProfessional ? 'text-slate-600' : 'text-gray-500')
                                    : (isProfessional ? 'text-white' : 'text-gray-900')
                                }`}>
                                  {item.title}
                                </h4>
                                {isLocked && (
                                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                    isProfessional
                                      ? 'bg-slate-800 text-slate-500 border-slate-700'
                                      : 'bg-gray-100 text-gray-500 border-gray-200'
                                  }`}>
                                    Locked
                                  </span>
                                )}
                              </div>
                              <div className="flex flex-wrap items-center gap-4">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${getDifficultyColor(item.difficulty)}`}>
                                  {item.difficulty}
                                </span>
                                <span className={`flex items-center gap-1.5 text-sm font-medium ${
                                  isProfessional ? 'text-slate-400' : 'text-gray-500'
                                }`}>
                                  <Clock className="w-4 h-4" />
                                  {item.duration}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mt-2 sm:mt-0">
                              {!isLocked && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className={`rounded-xl font-medium ${
                                      isProfessional
                                        ? 'text-slate-400 hover:text-pink-400 hover:bg-pink-500/10'
                                        : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                                    }`}
                                  >
                                    <Users className="w-4 h-4 mr-2" />
                                    Group
                                  </Button>
                                  <Button 
                                    size="sm"
                                    className={`${
                                      isCompleted 
                                        ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200' 
                                        : isProfessional
                                          ? 'bg-pink-600 hover:bg-pink-700 shadow-pink-900/20'
                                          : 'bg-blue-600 hover:bg-blue-700 shadow-blue-200'
                                    } text-white rounded-xl px-6 py-5 shadow-lg transition-all duration-300 font-medium`}
                                  >
                                    {isCompleted ? 'Review' : 'Start'}
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

            );
          })}
        </div>

        {/* Progress Summary */}
        <div className={`mt-10 rounded-3xl border shadow-sm p-8 ${
          isProfessional 
            ? 'bg-slate-800/50 border-slate-700' 
            : 'bg-white border-gray-100'
        }`}>
          <div className="flex items-center gap-3 mb-8">
            <div className={`p-3 rounded-xl ${
              isProfessional ? 'bg-yellow-500/10' : 'bg-yellow-50'
            }`}>
              <Star className="w-6 h-6 text-yellow-500" />
            </div>
            <h2 className={`text-2xl font-bold ${
              isProfessional ? 'text-white' : 'text-gray-900'
            }`}>Your Learning Progress</h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {roadmapData.map((section) => {
              const completedInSection = section.items.filter(item => 
                completedItems.includes(item.id)
              ).length;
              const progressPercent = (completedInSection / section.totalItems) * 100;

              return (
                <div key={section.id} className="text-center group">
                  <div className="relative w-24 h-24 mx-auto mb-4">
                    <div className={`absolute inset-0 rounded-full opacity-20 ${section.color} blur-lg group-hover:opacity-30 transition-opacity duration-300`}></div>
                    <div className={`relative w-full h-full rounded-full border-4 shadow-lg flex items-center justify-center ${section.color} ${
                      isProfessional ? 'border-slate-800' : 'border-white'
                    }`}>
                      <span className="text-white font-bold text-xl">
                        {Math.round(progressPercent)}%
                      </span>
                    </div>
                  </div>
                  <h4 className={`font-bold mb-1 ${
                    isProfessional ? 'text-white' : 'text-gray-900'
                  }`}>
                    {section.title}
                  </h4>
                  <p className={`text-sm font-medium ${
                    isProfessional ? 'text-slate-400' : 'text-gray-500'
                  }`}>
                    {completedInSection} of {section.totalItems} topics
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoadmapPage;