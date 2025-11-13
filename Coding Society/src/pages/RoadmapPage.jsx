import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { 
  ChevronDown, 
  ChevronRight, 
  CheckCircle, 
  Circle, 
  Lock,
  Star,
  Clock,
  Users,
  Brain,
  Sparkles
} from 'lucide-react';

const RoadmapPage = () => {
  const [expandedSections, setExpandedSections] = useState(['frontend']);
  const [completedItems, setCompletedItems] = useState(['html-basics', 'css-basics']);

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

  const roadmapData = [
    {
      id: 'frontend',
      title: 'Frontend Development',
      description: 'Master modern frontend technologies and build amazing user interfaces',
      color: 'bg-blue-500',
      progress: 25,
      totalItems: 12,
      items: [
        { id: 'html-basics', title: 'HTML Fundamentals', duration: '2 weeks', difficulty: 'Beginner', locked: false },
        { id: 'css-basics', title: 'CSS & Responsive Design', duration: '3 weeks', difficulty: 'Beginner', locked: false },
        { id: 'javascript-fundamentals', title: 'JavaScript Fundamentals', duration: '4 weeks', difficulty: 'Beginner', locked: false },
        { id: 'react-basics', title: 'React Fundamentals', duration: '4 weeks', difficulty: 'Intermediate', locked: false },
        { id: 'react-advanced', title: 'Advanced React Patterns', duration: '3 weeks', difficulty: 'Advanced', locked: true },
        { id: 'typescript', title: 'TypeScript for React', duration: '2 weeks', difficulty: 'Intermediate', locked: true },
        { id: 'state-management', title: 'State Management (Redux/Zustand)', duration: '2 weeks', difficulty: 'Advanced', locked: true },
        { id: 'testing', title: 'Frontend Testing', duration: '2 weeks', difficulty: 'Intermediate', locked: true },
        { id: 'performance', title: 'Performance Optimization', duration: '1 week', difficulty: 'Advanced', locked: true },
        { id: 'bundlers', title: 'Build Tools & Bundlers', duration: '1 week', difficulty: 'Intermediate', locked: true },
        { id: 'pwa', title: 'Progressive Web Apps', duration: '2 weeks', difficulty: 'Advanced', locked: true },
        { id: 'deployment', title: 'Frontend Deployment', duration: '1 week', difficulty: 'Intermediate', locked: true }
      ]
    },
    {
      id: 'backend',
      title: 'Backend Development',
      description: 'Learn server-side programming and database management',
      color: 'bg-green-500',
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
      color: 'bg-purple-500',
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
    },
    {
      id: 'devops',
      title: 'DevOps & Cloud',
      description: 'Master deployment, infrastructure, and cloud technologies',
      color: 'bg-orange-500',
      progress: 0,
      totalItems: 8,
      items: [
        { id: 'linux', title: 'Linux Command Line', duration: '2 weeks', difficulty: 'Beginner', locked: false },
        { id: 'git-advanced', title: 'Advanced Git & GitHub', duration: '1 week', difficulty: 'Beginner', locked: false },
        { id: 'ci-cd', title: 'CI/CD Pipelines', duration: '2 weeks', difficulty: 'Intermediate', locked: true },
        { id: 'infrastructure', title: 'Infrastructure as Code', duration: '3 weeks', difficulty: 'Intermediate', locked: true },
        { id: 'kubernetes', title: 'Kubernetes Orchestration', duration: '4 weeks', difficulty: 'Advanced', locked: true },
        { id: 'monitoring-devops', title: 'Monitoring & Alerting', duration: '2 weeks', difficulty: 'Intermediate', locked: true },
        { id: 'security', title: 'Security Best Practices', duration: '2 weeks', difficulty: 'Advanced', locked: true },
        { id: 'scaling', title: 'Scaling & Load Balancing', duration: '2 weeks', difficulty: 'Advanced', locked: true }
      ]
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'Advanced': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-indigo-50 pt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Learning Roadmap
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Follow structured learning paths designed by industry experts. 
            Track your progress and unlock new skills step by step.
          </p>
        </div>

        {/* AI Suggestion Box */}
        <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  AI Learning Assistant
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                </h3>
                <p className="text-gray-700 dark:text-gray-300 mb-4">
                  Based on your current progress, I recommend focusing on <strong>JavaScript Fundamentals</strong> next. 
                  You've completed the HTML and CSS basics, so you're ready to add interactivity to your web pages!
                </p>
                <div className="flex gap-2">
                  <Button size="sm">
                    Start JavaScript
                  </Button>
                  <Button variant="outline" size="sm">
                    Get More Suggestions
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Roadmap Sections */}
        <div className="space-y-6">
          {roadmapData.map((section) => {
            const isExpanded = expandedSections.includes(section.id);
            const completedInSection = section.items.filter(item => 
              completedItems.includes(item.id)
            ).length;

            return (
              <Card key={section.id} className="overflow-hidden">
                <CardHeader
                  className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 ${section.color} rounded-lg flex items-center justify-center`}>
                        {isExpanded ? (
                          <ChevronDown className="w-6 h-6 text-white" />
                        ) : (
                          <ChevronRight className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div>
                        <CardTitle className="text-xl">{section.title}</CardTitle>
                        <CardDescription className="mt-1">
                          {section.description}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                        {completedInSection} / {section.totalItems} completed
                      </div>
                      <div className="w-32 bg-indigo-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${section.color}`}
                          style={{ width: `${(completedInSection / section.totalItems) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="grid gap-4">
                      {section.items.map((item, index) => {
                        const isCompleted = completedItems.includes(item.id);
                        const isLocked = item.locked;

                        return (
                          <div
                            key={item.id}
                            className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${
                              isLocked 
                                ? 'bg-gray-50 dark:bg-gray-800 opacity-60' 
                                : isCompleted 
                                  ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                  : 'bg-white dark:bg-gray-900 hover:shadow-md border-gray-200 dark:border-gray-700'
                            }`}
                          >
                            <button
                              onClick={() => !isLocked && toggleCompletion(item.id)}
                              disabled={isLocked}
                              className="flex-shrink-0"
                            >
                              {isLocked ? (
                                <Lock className="w-5 h-5 text-gray-400" />
                              ) : isCompleted ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : (
                                <Circle className="w-5 h-5 text-gray-400 hover:text-blue-600" />
                              )}
                            </button>

                            <div className="flex-1">
                              <h4 className={`font-medium ${isLocked ? 'text-gray-400' : 'text-gray-900 dark:text-white'}`}>
                                {item.title}
                              </h4>
                              <div className="flex items-center gap-4 mt-1">
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(item.difficulty)}`}>
                                  {item.difficulty}
                                </span>
                                <span className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                  <Clock className="w-3 h-3" />
                                  {item.duration}
                                </span>
                              </div>
                            </div>

                            <div className="flex gap-2">
                              {!isLocked && (
                                <>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex items-center gap-1"
                                  >
                                    <Users className="w-3 h-3" />
                                    Join Study Group
                                  </Button>
                                  <Button size="sm">
                                    {isCompleted ? 'Review' : 'Start Learning'}
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Progress Summary */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Your Learning Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {roadmapData.map((section) => {
                const completedInSection = section.items.filter(item => 
                  completedItems.includes(item.id)
                ).length;
                const progressPercent = (completedInSection / section.totalItems) * 100;

                return (
                  <div key={section.id} className="text-center">
                    <div className={`w-16 h-16 mx-auto mb-3 ${section.color} rounded-full flex items-center justify-center`}>
                      <span className="text-white font-bold text-lg">
                        {Math.round(progressPercent)}%
                      </span>
                    </div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-1">
                      {section.title}
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {completedInSection} of {section.totalItems} topics
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoadmapPage;
