import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import FeatureModal from '../components/FeatureModal';
import { 
  Code2, 
  Users, 
  Trophy, 
  Star, 
  ArrowRight,
  BookOpen,
  Briefcase,
  Brain,
  Zap,
  Shield,
  Globe,
  Rocket,
  Award,
  Target,
  CheckCircle,
  Quote,
  Github,
  Twitter,
  Linkedin,
  Sparkles,
  Play,
  ChevronDown,
  Monitor,
  Cpu,
  Database,
  TrendingUp,
  Calendar,
  FileText,
  Layers,
  GitBranch
} from 'lucide-react';

const HomePage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  const [currentTestimonial, setCurrentTestimonial] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Auth modals are handled by LandingNavigation component

  // Memoize testimonials to prevent unnecessary re-renders
  const testimonials = useMemo(() => [
    {
      name: 'Sarah Chen',
      role: 'Senior Software Engineer at Google',
      content: 'Coding Society transformed my career. The AI-powered learning paths and mentorship programs helped me land my dream job.',
      rating: 5,
      image: 'SC'
    },
    {
      name: 'Alex Rodriguez',
      role: 'Full Stack Developer at Microsoft',
      content: 'The hands-on projects and real-world coding experience made all the difference in my technical interviews.',
      rating: 5,
      image: 'AR'
    },
    {
      name: 'Maya Patel',
      role: 'Tech Lead at Spotify',
      content: 'Best investment I ever made. The community support and expert guidance accelerated my learning beyond expectations.',
      rating: 5,
      image: 'MP'
    }
  ], []);

  // Optimize testimonial navigation with useCallback
  const handleTestimonialChange = useCallback((index) => {
    setCurrentTestimonial(index);
  }, []);

  // Handle feature modal
  const handleFeatureExplore = useCallback((feature) => {
    setSelectedFeature(feature);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedFeature(null);
  }, []);

  // Authentication modal functions - trigger LandingNavigation modals via events
  const openRegisterModal = useCallback(() => {
    // Trigger click on LandingNavigation register button
    const registerButton = document.querySelector('[data-register-trigger]');
    if (registerButton) {
      registerButton.click();
    }
  }, []);

  const openLoginModal = useCallback(() => {
    // Trigger click on LandingNavigation login button
    const loginButton = document.querySelector('[data-login-trigger]');
    if (loginButton) {
      loginButton.click();
    }
  }, []);

  // Handle smooth scrolling to sections
  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
    }
  }, []);

  // Auto-rotating testimonials with error handling
  useEffect(() => {
    try {
      setIsLoading(false);
      const interval = setInterval(() => {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }, 5000);
      return () => clearInterval(interval);
    } catch (err) {
      setError('Failed to load testimonials');
      setIsLoading(false);
    }
  }, [testimonials.length]);

  // Handle keyboard navigation for accessibility
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length);
      } else if (e.key === 'ArrowRight') {
        setCurrentTestimonial((prev) => (prev + 1) % testimonials.length);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [testimonials.length]);

  // Handle modal keyboard navigation
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    window.addEventListener('keydown', handleEscapeKey);
    return () => window.removeEventListener('keydown', handleEscapeKey);
  }, [isModalOpen, closeModal]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading amazing content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  // Don't render anything for authenticated users while redirecting
  if (isAuthenticated) {
    return null;
  }

  return (
    <>
      {/* Schema.org structured data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Coding Society",
            "description": "Professional coding platform with AI-powered tools, expert mentorship, and comprehensive learning experiences.",
            "url": "https://coding-society.com",
            "logo": "https://coding-society.com/logo.png",
            "sameAs": [
              "https://twitter.com/codingsociety",
              "https://github.com/codingsociety",
              "https://linkedin.com/company/codingsociety"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer support",
              "email": "support@coding-society.com"
            }
          })
        }}
      />
      
      <div className="min-h-screen bg-white">
      
      {/* Hero Section */}
      <section id="home" className="relative min-h-screen flex items-center justify-center bg-white pt-16 overflow-hidden">
        {/* Modern Animated Background */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-blue-100/50 blur-3xl animate-blob mix-blend-multiply filter opacity-70"></div>
          <div className="absolute -top-[30%] -right-[10%] w-[70%] h-[70%] rounded-full bg-purple-100/50 blur-3xl animate-blob animation-delay-2000 mix-blend-multiply filter opacity-70"></div>
          <div className="absolute -bottom-[30%] left-[20%] w-[70%] h-[70%] rounded-full bg-pink-100/50 blur-3xl animate-blob animation-delay-4000 mix-blend-multiply filter opacity-70"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-12">
            {/* Trust Badge */}
            <div className="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-full mb-8 shadow-sm hover:shadow-md transition-all duration-300 cursor-default">
              <Sparkles className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-medium text-gray-600">Trusted by <span className="font-bold text-gray-900">10,000+</span> Developers Worldwide</span>
            </div>
            
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-extrabold mb-8 tracking-tight leading-[1.1]" role="banner" aria-label="Professional Coding Platform">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-blue-800 to-gray-900 animate-gradient-x">
                Professional
              </span>
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                Coding Platform
              </span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed font-light">
              Master coding with <span className="font-semibold text-gray-900">AI-powered tools</span>, expert mentorship, and industry-grade development environments.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center mb-20">
            {!isAuthenticated ? (
              <>
                <Button 
                  size="lg" 
                  className="group relative px-8 py-6 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300 overflow-hidden"
                  onClick={openRegisterModal}
                  aria-label="Start your free trial now"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <span className="relative flex items-center">
                    Start Free Trial
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                  </span>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="group px-8 py-6 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 hover:border-gray-300 rounded-2xl font-semibold text-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                  onClick={() => scrollToSection('features')}
                  aria-label="Watch platform demonstration video"
                >
                  <Play className="mr-2 w-5 h-5 fill-current" aria-hidden="true" />
                  Watch Demo
                </Button>
              </>
            ) : (
              <Button size="lg" className="group relative px-8 py-6 bg-gray-900 hover:bg-gray-800 text-white rounded-2xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300" asChild>
                <Link to="/feed" className="flex items-center">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            )}
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
            {[
              { icon: Users, label: 'Active Developers', value: '10k+', description: 'Global community' },
              { icon: Code2, label: 'Projects Built', value: '50k+', description: 'Successfully deployed' },
              { icon: Trophy, label: 'Success Rate', value: '95%', description: 'Job placement' },
              { icon: Star, label: 'Languages', value: '15+', description: 'Full support' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="group p-6 bg-white/50 backdrop-blur-sm border border-gray-100 rounded-2xl hover:bg-white hover:shadow-xl hover:border-blue-100 transition-all duration-300">
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:bg-blue-600 transition-all duration-300">
                    <Icon className="w-6 h-6 text-blue-600 group-hover:text-white transition-colors duration-300" />
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors duration-300">
                    {stat.value}
                  </div>
                  <div className="text-sm font-semibold text-gray-700 mb-1">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-gray-400 opacity-50" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4 sm:px-6 lg:px-8 bg-gray-50 relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#4F46E5 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-8">
              <Zap className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Comprehensive Platform</span>
            </div>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-8 tracking-tight">
              Everything You Need to 
              <span className="relative whitespace-nowrap ml-3">
                <span className="relative z-10 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">Excel</span>
                <svg className="absolute bottom-0 left-0 w-full h-3 -mb-1 text-blue-200 opacity-50 z-0" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" />
                </svg>
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed font-light">
              From AI-powered coding assistance to career acceleration programs, 
              we provide a complete ecosystem for your development journey.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Brain,
                title: 'AI Code Assistant',
                description: 'Advanced AI-powered coding companion with intelligent suggestions, real-time debugging, and automated code optimization.',
                color: 'bg-blue-500',
                features: ['Smart autocompletion', 'Bug detection', 'Code optimization'],
                link: '/compiler'
              },
              {
                icon: BookOpen,
                title: 'Interactive Learning',
                description: 'Structured learning paths with interactive courses, hands-on projects, and industry-recognized certifications.',
                color: 'bg-green-500',
                features: ['50+ courses', 'Project-based learning', 'Certificates'],
                link: '/study'
              },
              {
                icon: Monitor,
                title: 'Cloud IDE',
                description: 'Professional cloud-based development environment with multi-language support and collaborative features.',
                color: 'bg-purple-500',
                features: ['15+ languages', 'Real-time collaboration', 'Cloud deployment'],
                link: '/compiler'
              },
              {
                icon: Users,
                title: 'Developer Network',
                description: 'Connect with industry professionals, join coding communities, and participate in collaborative projects.',
                color: 'bg-orange-500',
                features: ['Professional networking', 'Code reviews', 'Mentorship'],
                link: '/feed'
              },
              {
                icon: Trophy,
                title: 'Competitions',
                description: 'Participate in coding competitions, hackathons, and challenges to showcase your skills and win prizes.',
                color: 'bg-yellow-500',
                features: ['Weekly challenges', 'Global competitions', 'Cash prizes'],
                link: '/hackathons'
              },
              {
                icon: Briefcase,
                title: 'Career Services',
                description: 'Job placement assistance, resume optimization, interview preparation, and direct connections with top companies.',
                color: 'bg-indigo-500',
                features: ['Job placement', 'Resume building', 'Interview prep'],
                link: '/career'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div key={index} className="group relative bg-white rounded-3xl p-8 shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 hover:-translate-y-2 overflow-hidden">
                  <div className={`absolute top-0 right-0 w-32 h-32 ${feature.color} opacity-[0.03] rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150 duration-700`}></div>
                  
                  <div className={`w-14 h-14 ${feature.color} bg-opacity-10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-7 h-7 ${feature.color.replace('bg-', 'text-')}`} />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {feature.description}
                  </p>
                  
                  <ul className="space-y-3 mb-8">
                    {feature.features.map((feat, idx) => (
                      <li key={idx} className="flex items-center text-sm text-gray-500">
                        <div className={`w-1.5 h-1.5 rounded-full ${feature.color} mr-3`}></div>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    variant="ghost"
                    className="w-full justify-between group-hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    onClick={() => handleFeatureExplore(feature)}
                  >
                    Explore Feature
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section id="services" className="py-32 px-4 sm:px-6 lg:px-8 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-20">
            <div className="space-y-8">
              <div className="inline-flex items-center px-4 py-2 bg-purple-50 border border-purple-100 rounded-full mb-4">
                <Rocket className="w-4 h-4 text-purple-600 mr-2" />
                <span className="text-sm font-semibold text-purple-700 uppercase tracking-wide">Advanced Services</span>
              </div>
              
              <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 leading-tight">
                Complete 
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-600"> Development Ecosystem</span>
              </h2>
              
              <p className="text-xl text-gray-600 leading-relaxed">
                Comprehensive tools and services designed to accelerate your coding journey from beginner to professional.
              </p>

              <div className="space-y-6">
                {[
                  {
                    icon: Cpu,
                    title: 'Advanced Code Compiler',
                    description: 'Multi-language compiler with real-time execution, debugging tools, and performance analytics.'
                  },
                  {
                    icon: Database,
                    title: 'Project Portfolio Builder',
                    description: 'Showcase your projects with interactive demos, code repositories, and professional presentations.'
                  },
                  {
                    icon: GitBranch,
                    title: 'Version Control Integration',
                    description: 'Seamless Git integration with collaborative coding, code reviews, and project management.'
                  },
                  {
                    icon: TrendingUp,
                    title: 'Career Analytics',
                    description: 'Track your progress with detailed analytics, skill assessments, and career roadmaps.'
                  }
                ].map((service, index) => {
                  const Icon = service.icon;
                  return (
                    <div key={index} className="flex items-start space-x-4 p-4 rounded-2xl hover:bg-gray-50 transition-colors duration-300">
                      <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-6 h-6 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 mb-1 text-lg">{service.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{service.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="relative lg:h-[600px]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-100 to-blue-100 rounded-3xl transform rotate-3 opacity-50"></div>
              <div className="absolute inset-0 bg-white rounded-3xl border border-gray-100 shadow-2xl p-8 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-6 h-full">
                  {[
                    { label: 'Weekly Challenges', value: '50+', icon: Calendar, color: 'bg-blue-50 text-blue-600' },
                    { label: 'Learning Modules', value: '200+', icon: FileText, color: 'bg-green-50 text-green-600' },
                    { label: 'Code Templates', value: '2k+', icon: Layers, color: 'bg-orange-50 text-orange-600' },
                    { label: 'Success Stories', value: '95%', icon: Award, color: 'bg-pink-50 text-pink-600' }
                  ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className={`rounded-2xl p-6 ${stat.color.split(' ')[0]} flex flex-col items-center justify-center text-center transition-transform hover:scale-105 duration-300`}>
                        <Icon className={`w-10 h-10 ${stat.color.split(' ')[1]} mb-4`} />
                        <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                        <div className="text-sm font-medium text-gray-600">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="about" className="py-32 px-4 sm:px-6 lg:px-8 bg-gray-900 text-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full mb-8">
              <Quote className="w-4 h-4 text-blue-400 mr-2" />
              <span className="text-sm font-semibold text-blue-100">Success Stories</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold mb-6">
              What Our 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400"> Developers</span> Say
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Join thousands of developers who have accelerated their careers with Coding Society
            </p>
          </div>

          <div className="max-w-5xl mx-auto">
            <div className="relative bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-12 shadow-2xl">
              <div className="flex flex-col md:flex-row items-center gap-12">
                <div className="w-32 h-32 flex-shrink-0">
                  <div className="w-full h-full rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1">
                    <div className="w-full h-full rounded-full bg-gray-800 flex items-center justify-center overflow-hidden">
                      <span className="text-3xl font-bold text-white">
                        {testimonials[currentTestimonial].image}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex-1 text-center md:text-left">
                  <div className="flex justify-center md:justify-start mb-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="text-2xl md:text-3xl font-light leading-relaxed mb-8 text-gray-100">
                    "{testimonials[currentTestimonial].content}"
                  </blockquote>
                  <div>
                    <h4 className="text-xl font-bold text-white mb-1">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-blue-400 font-medium">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-center mt-12 space-x-3">
                {testimonials.map((testimonial, index) => (
                  <button
                    key={index}
                    onClick={() => handleTestimonialChange(index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      index === currentTestimonial ? 'bg-blue-500 w-8' : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                    role="tab"
                    aria-selected={index === currentTestimonial}
                    aria-label={`View testimonial from ${testimonial.name}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 px-4 sm:px-6 lg:px-8 bg-white relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-4 py-2 bg-blue-50 border border-blue-100 rounded-full mb-8">
              <Star className="w-4 h-4 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-blue-700 uppercase tracking-wide">Flexible Pricing</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Choose Your 
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600"> Plan</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto font-light">
              Start free and upgrade as you grow. All plans include our core features with no hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: 'Starter',
                price: 'Free',
                period: 'Forever',
                description: 'Perfect for beginners getting started',
                features: [
                  'Access to basic courses',
                  'Community support',
                  'Code compiler access',
                  '5 projects limit',
                  'Basic AI assistance'
                ],
                cta: 'Get Started Free',
                popular: false,
                action: 'auth'
              },
              {
                name: 'Professional',
                price: '$29',
                period: 'per month',
                description: 'Everything you need to advance your career',
                features: [
                  'All Starter features',
                  'Unlimited projects',
                  'Advanced AI code assistant',
                  'Career services & mentorship',
                  'Priority support',
                  'Interview preparation',
                  'Resume optimization'
                ],
                cta: 'Start Free Trial',
                popular: true,
                action: 'auth'
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: 'pricing',
                description: 'Advanced features for teams and organizations',
                features: [
                  'All Professional features',
                  'Team management tools',
                  'Custom integrations',
                  'Dedicated support manager',
                  'SLA guarantee',
                  'Custom training programs',
                  'Analytics dashboard'
                ],
                cta: 'Contact Sales',
                popular: false,
                action: 'contact'
              }
            ].map((plan, index) => (
              <div key={index} className={`relative bg-white rounded-3xl p-8 transition-all duration-300 ${
                plan.popular 
                  ? 'border-2 border-blue-600 shadow-2xl scale-105 z-10' 
                  : 'border border-gray-200 hover:border-blue-300 hover:shadow-xl'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-5 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-full text-sm font-bold shadow-lg uppercase tracking-wider">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline justify-center mb-4">
                    <span className="text-5xl font-extrabold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-500 ml-2 font-medium">/{plan.period}</span>}
                  </div>
                  <p className="text-gray-600">{plan.description}</p>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start text-gray-600">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${plan.popular ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'}`}>
                        <CheckCircle className="w-3 h-3" />
                      </div>
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full py-6 rounded-xl font-bold text-lg transition-all duration-300 ${
                    plan.popular 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl' 
                      : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-blue-600 hover:text-blue-600'
                  }`}
                  onClick={() => {
                    if (plan.action === 'auth') {
                      openRegisterModal();
                    } else if (plan.action === 'contact') {
                      scrollToSection('contact');
                    }
                  }}
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-4 sm:px-6 lg:px-8 bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 via-purple-900/50 to-gray-900/50"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
        </div>
        
        <div className="relative z-10 max-w-5xl mx-auto text-center">
          <h2 className="text-5xl sm:text-6xl font-bold mb-8 text-white tracking-tight">
            Ready to Transform Your <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Coding Journey?</span>
          </h2>
          <p className="text-xl mb-12 text-gray-300 max-w-2xl mx-auto font-light leading-relaxed">
            Join thousands of developers who have accelerated their careers with our comprehensive platform. Start building your future today.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-gray-900 hover:bg-gray-50 px-10 py-6 rounded-2xl font-bold text-lg shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
              onClick={openRegisterModal}
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-gray-700 text-white hover:bg-gray-800 hover:border-gray-600 px-10 py-6 rounded-2xl font-bold text-lg transition-all duration-300"
              onClick={() => scrollToSection('contact')}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer id="contact" className="bg-white border-t border-gray-200 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Coding Society</h3>
              </div>
              <p className="text-gray-600 mb-6 leading-relaxed">
                Empowering the next generation of developers with cutting-edge AI tools, expert guidance, and comprehensive learning experiences.
              </p>
              <div className="flex space-x-4">
                {[Github, Twitter, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-all duration-300">
                    <Icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Platform</h3>
              <ul className="space-y-4">
                {[
                  { name: 'Code Compiler', link: '/compiler' },
                  { name: 'Learning Paths', link: '/study' },
                  { name: 'Hackathons', link: '/hackathons' },
                  { name: 'Code Challenges', link: '/quiz' },
                  { name: 'Portfolio Builder', link: '/portfolio' },
                  { name: 'Community', link: '/feed' }
                ].map((item, i) => (
                  <li key={i}>
                    <Link to={item.link} className="text-gray-600 hover:text-blue-600 transition-colors flex items-center group">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 mr-2 transition-opacity"></span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Services</h3>
              <ul className="space-y-4">
                {[
                  { name: 'Career Services', link: '/career' },
                  { name: 'Internships', link: '/internship' },
                  { name: 'AI Tools', link: '/ai-tools' },
                  { name: 'Research Hub', link: '/research' },
                  { name: 'Learning Roadmaps', link: '/roadmap' },
                  { name: 'Project Ideas', link: '/ideas' }
                ].map((item, i) => (
                  <li key={i}>
                    <Link to={item.link} className="text-gray-600 hover:text-blue-600 transition-colors flex items-center group">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 mr-2 transition-opacity"></span>
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="font-bold text-gray-900 mb-6 text-lg">Support</h3>
              <ul className="space-y-4">
                {[
                  { name: 'Help Center', link: '/help' },
                  { name: 'Contact Us', link: '#contact' },
                  { name: 'Documentation', link: '#docs' },
                  { name: 'API Reference', link: '#api' },
                  { name: 'System Status', link: '#status' },
                  { name: 'Blog', link: '#blog' }
                ].map((item, i) => (
                  <li key={i}>
                    {item.link.startsWith('#') ? (
                      <a href={item.link} className="text-gray-600 hover:text-blue-600 transition-colors flex items-center group">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 mr-2 transition-opacity"></span>
                        {item.name}
                      </a>
                    ) : (
                      <Link to={item.link} className="text-gray-600 hover:text-blue-600 transition-colors flex items-center group">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 opacity-0 group-hover:opacity-100 mr-2 transition-opacity"></span>
                        {item.name}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 text-sm">
              © 2025 Coding Society. All rights reserved.
            </p>
            <div className="flex space-x-6 text-sm mt-4 md:mt-0">
              <a href="#privacy" className="text-gray-500 hover:text-blue-600 transition-colors">Privacy Policy</a>
              <a href="#terms" className="text-gray-500 hover:text-blue-600 transition-colors">Terms of Service</a>
              <a href="#cookies" className="text-gray-500 hover:text-blue-600 transition-colors">Cookie Policy</a>
              <a href="#security" className="text-gray-500 hover:text-blue-600 transition-colors">Security</a>
            </div>
          </div>
        </div>
      </footer>
      </div>

      {/* Feature Detail Modal */}
      <FeatureModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        feature={selectedFeature}
      />
    </>
  );
};

export default HomePage;