import React, { useEffect } from 'react';
import { X, ArrowRight, CheckCircle, Star, Users, Code, Trophy, Zap } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

const FeatureModal = ({ isOpen, onClose, feature }) => {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px';
    } else {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  if (!isOpen || !feature) return null;

  const getDetailedInfo = (title) => {
    const detailsMap = {
      'AI Code Assistant': {
        fullDescription: 'Transform your coding experience with our advanced AI-powered assistant that understands context, suggests optimizations, and helps debug complex issues in real-time.',
        benefits: [
          'Intelligent code completion with 95% accuracy',
          'Real-time bug detection and fixing suggestions',
          'Code optimization recommendations',
          'Multi-language support (Python, JavaScript, Java, C++, etc.)',
          'Context-aware documentation generation',
          'Automated code review and quality analysis'
        ],
        stats: [
          { label: 'Lines of Code Analyzed', value: '10M+' },
          { label: 'Bugs Prevented', value: '50K+' },
          { label: 'Time Saved', value: '40%' },
          { label: 'Accuracy Rate', value: '95%' }
        ],
        technologies: ['OpenAI Codex', 'GitHub Copilot', 'Custom ML Models', 'AST Analysis']
      },
      'Interactive Learning': {
        fullDescription: 'Master programming concepts through hands-on projects, interactive coding challenges, and personalized learning paths designed by industry experts.',
        benefits: [
          'Structured learning paths for all skill levels',
          'Interactive coding exercises with instant feedback',
          'Real-world project portfolio building',
          'Industry-recognized certifications',
          'Peer code reviews and collaboration',
          'Adaptive learning based on your progress'
        ],
        stats: [
          { label: 'Learning Modules', value: '200+' },
          { label: 'Students Enrolled', value: '15K+' },
          { label: 'Completion Rate', value: '85%' },
          { label: 'Job Success Rate', value: '92%' }
        ],
        technologies: ['React', 'Monaco Editor', 'WebAssembly', 'Docker Containers']
      },
      'Cloud IDE': {
        fullDescription: 'Access a fully-featured development environment from anywhere with our cloud-based IDE supporting 15+ programming languages and collaborative features.',
        benefits: [
          'No setup required - start coding instantly',
          'Real-time collaboration with team members',
          'Integrated version control with Git',
          'Auto-scaling compute resources',
          'Built-in debugging and profiling tools',
          'One-click deployment to cloud platforms'
        ],
        stats: [
          { label: 'Supported Languages', value: '15+' },
          { label: 'Monthly Active Users', value: '8K+' },
          { label: 'Uptime', value: '99.9%' },
          { label: 'Response Time', value: '<100ms' }
        ],
        technologies: ['VS Code Server', 'Kubernetes', 'WebSockets', 'Container Registry']
      },
      'Developer Network': {
        fullDescription: 'Connect with a global community of developers, participate in code reviews, find mentors, and collaborate on exciting projects.',
        benefits: [
          'Connect with 10,000+ active developers',
          'Join specialized communities by technology',
          'Participate in code review sessions',
          'Find mentors and mentees',
          'Collaborate on open-source projects',
          'Attend virtual meetups and workshops'
        ],
        stats: [
          { label: 'Active Members', value: '10K+' },
          { label: 'Code Reviews', value: '25K+' },
          { label: 'Mentorship Pairs', value: '2K+' },
          { label: 'Projects Shared', value: '5K+' }
        ],
        technologies: ['Real-time Chat', 'Video Conferencing', 'Git Integration', 'Project Sharing']
      },
      'Competitions & Hackathons': {
        fullDescription: 'Showcase your skills in weekly coding challenges, global competitions, and hackathons with cash prizes and career opportunities.',
        benefits: [
          'Weekly coding challenges for skill improvement',
          'Global competitions with industry recognition',
          'Cash prizes and career opportunities',
          'Team formation and collaboration tools',
          'Live leaderboards and rankings',
          'Professional portfolio enhancement'
        ],
        stats: [
          { label: 'Competitions Hosted', value: '150+' },
          { label: 'Total Prize Money', value: '$50K+' },
          { label: 'Participants', value: '12K+' },
          { label: 'Winner Success Rate', value: '88%' }
        ],
        technologies: ['Real-time Judging', 'Automated Testing', 'Live Streaming', 'Blockchain Verification']
      },
      'Career Services': {
        fullDescription: 'Accelerate your career with personalized job placement assistance, resume optimization, interview preparation, and direct connections to top tech companies.',
        benefits: [
          'Personalized career guidance and roadmaps',
          'AI-powered resume optimization',
          'Mock interview sessions with industry experts',
          'Direct connections to 500+ partner companies',
          'Salary negotiation support and guidance',
          'Continuous career growth tracking'
        ],
        stats: [
          { label: 'Job Placements', value: '3K+' },
          { label: 'Partner Companies', value: '500+' },
          { label: 'Average Salary Increase', value: '45%' },
          { label: 'Interview Success Rate', value: '78%' }
        ],
        technologies: ['AI Resume Parser', 'Video Interview Platform', 'ATS Integration', 'Career Analytics']
      }
    };

    return detailsMap[title] || {
      fullDescription: feature?.description || 'Detailed information coming soon.',
      benefits: feature?.features || [],
      stats: [],
      technologies: []
    };
  };

  const details = getDetailedInfo(feature.title);
  const Icon = feature.icon;

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 sm:p-6 md:p-8 z-50 overflow-auto animate-in fade-in duration-300" style={{ pointerEvents: 'auto', minHeight: '100dvh' }}>
      {/* Invisible backdrop for closing modal when clicking outside */}
      <div 
        className="absolute inset-0" 
        onClick={onClose}
        style={{ pointerEvents: 'auto' }}
      />
      
      <div className="relative bg-white rounded-2xl w-full max-w-sm sm:max-w-2xl lg:max-w-4xl mx-auto my-auto max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] md:max-h-[calc(100vh-4rem)] overflow-y-auto shadow-2xl border-2 border-blue-200 animate-in slide-in-from-bottom-4 duration-300" style={{ pointerEvents: 'auto', scrollbarWidth: 'thin', scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent' }}>
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center shadow-lg`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-900">{feature.title}</h2>
                <p className="text-gray-600 text-base">Comprehensive Platform Feature</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-3 hover:bg-blue-100 rounded-full transition-colors z-10"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-gray-600" />
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Description */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Overview</h3>
            <p className="text-gray-700 leading-relaxed text-base">
              {details.fullDescription}
            </p>
          </div>

          {/* Stats Grid */}
          {details.stats.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Statistics</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {details.stats.map((stat, index) => (
                  <Card key={index} className="text-center p-4 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="text-2xl font-bold text-blue-600 mb-1">{stat.value}</div>
                    <div className="text-sm text-gray-600">{stat.label}</div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Benefits */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Benefits</h3>
            <div className="grid md:grid-cols-2 gap-3">
              {details.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Technologies */}
          {details.technologies.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Technologies Used</h3>
              <div className="flex flex-wrap gap-2">
                {details.technologies.map((tech, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium border border-blue-200"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
            <Button 
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300"
              onClick={() => {
                window.open(feature.link, '_blank');
                onClose();
              }}
            >
              <Zap className="w-5 h-5 mr-2" />
              Try {feature.title}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 font-semibold py-3 rounded-xl bg-white hover:bg-blue-50 transition-all duration-300"
              onClick={onClose}
            >
              <Users className="w-5 h-5 mr-2" />
              Learn More
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureModal;