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
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-4 h-4 bg-blue-200 rounded-full animate-bounce delay-100"></div>
          <div className="absolute top-40 right-20 w-6 h-6 bg-purple-200 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-40 left-20 w-5 h-5 bg-cyan-200 rounded-full animate-bounce delay-500"></div>
          <div className="absolute bottom-20 right-10 w-3 h-3 bg-pink-200 rounded-full animate-bounce delay-700"></div>
          <div className="absolute top-1/2 left-1/4 w-2 h-2 bg-indigo-200 rounded-full animate-pulse"></div>
          <div className="absolute top-1/3 right-1/3 w-2 h-2 bg-green-200 rounded-full animate-pulse delay-200"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-8">
            {/* Trust Badge */}
            <div className="inline-flex items-center px-6 py-3 bg-white border border-blue-200 rounded-full mb-8 shadow-sm">
              <Sparkles className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-blue-700">🚀 Trusted by 10,000+ Developers Worldwide</span>
            </div>
            
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-tight" role="banner" aria-label="Professional Coding Platform">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-700 bg-clip-text text-transparent">
                Professional
              </span>
              <br />
              <span className="text-gray-900">Coding Platform</span>
            </h1>
            
            <p className="text-xl sm:text-2xl text-gray-600 mb-10 max-w-4xl mx-auto leading-relaxed">
              Master coding with AI-powered tools, expert mentorship, hands-on projects, and industry-grade development environments. Join the future of software development.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            {!isAuthenticated ? (
              <>
                <Button 
                  size="lg" 
                  className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer border-none"
                  onClick={openRegisterModal}
                  aria-label="Start your free trial now"
                >
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" aria-hidden="true" />
                </Button>
                <Button 
                  size="lg" 
                  className="group bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer border-none"
                  onClick={() => scrollToSection('features')}
                  aria-label="Watch platform demonstration video"
                >
                  <Play className="mr-2 w-5 h-5" aria-hidden="true" />
                  Watch Demo
                </Button>
              </>
            ) : (
              <Button size="lg" className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer border-none" asChild>
                <Link to="/feed">
                  Go to Dashboard
                  <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
            )}
          </div>

          {/* Enhanced Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-6xl mx-auto">
            {[
              { icon: Users, label: 'Active Developers', value: '10,000+', description: 'Global community' },
              { icon: Code2, label: 'Projects Built', value: '50,000+', description: 'Successfully deployed' },
              { icon: Trophy, label: 'Success Rate', value: '95%', description: 'Job placement' },
              { icon: Star, label: 'Languages', value: '15+', description: 'Supported languages' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center group">
                  <div className="w-16 h-16 bg-white border border-gray-200 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:border-blue-300 group-hover:shadow-lg transition-all duration-300">
                    <Icon className="w-7 h-7 text-blue-600" />
                  </div>
                  <div className="text-3xl sm:text-4xl font-bold text-gray-900 mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm font-medium text-gray-900 mb-1">{stat.label}</div>
                  <div className="text-xs text-gray-500">{stat.description}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-gray-400" />
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-white border border-blue-200 rounded-full mb-8 shadow-sm">
              <Zap className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-blue-700">Comprehensive Development Platform</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Everything You Need to 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Excel</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
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
                color: 'from-blue-500 to-cyan-500',
                features: ['Smart autocompletion', 'Bug detection', 'Code optimization'],
                link: '/compiler'
              },
              {
                icon: BookOpen,
                title: 'Interactive Learning',
                description: 'Structured learning paths with interactive courses, hands-on projects, and industry-recognized certifications.',
                color: 'from-green-500 to-emerald-500',
                features: ['50+ courses', 'Project-based learning', 'Certificates'],
                link: '/study'
              },
              {
                icon: Monitor,
                title: 'Cloud IDE',
                description: 'Professional cloud-based development environment with multi-language support and collaborative features.',
                color: 'from-purple-500 to-pink-500',
                features: ['15+ languages', 'Real-time collaboration', 'Cloud deployment'],
                link: '/compiler'
              },
              {
                icon: Users,
                title: 'Developer Network',
                description: 'Connect with industry professionals, join coding communities, and participate in collaborative projects.',
                color: 'from-orange-500 to-red-500',
                features: ['Professional networking', 'Code reviews', 'Mentorship'],
                link: '/feed'
              },
              {
                icon: Trophy,
                title: 'Competitions & Hackathons',
                description: 'Participate in coding competitions, hackathons, and challenges to showcase your skills and win prizes.',
                color: 'from-yellow-500 to-orange-500',
                features: ['Weekly challenges', 'Global competitions', 'Cash prizes'],
                link: '/hackathons'
              },
              {
                icon: Briefcase,
                title: 'Career Services',
                description: 'Job placement assistance, resume optimization, interview preparation, and direct connections with top companies.',
                color: 'from-indigo-500 to-blue-500',
                features: ['Job placement', 'Resume building', 'Interview prep'],
                link: '/career'
              }
            ].map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-200 bg-white">
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl font-bold text-gray-900 mb-2">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <CardDescription className="text-base leading-relaxed text-gray-600">
                      {feature.description}
                    </CardDescription>
                    <ul className="space-y-2">
                      {feature.features.map((feat, idx) => (
                        <li key={idx} className="flex items-center text-sm text-gray-600">
                          <CheckCircle className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                    <Button 
                      className="w-full mt-4 bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-300"
                      onClick={() => handleFeatureExplore(feature)}
                    >
                      Explore Now
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services Showcase */}
      <section id="services" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <div className="inline-flex items-center px-6 py-3 bg-white border border-purple-200 rounded-full mb-8 shadow-sm">
              <Rocket className="w-5 h-5 text-purple-600 mr-2" />
              <span className="text-sm font-semibold text-purple-700">Advanced Platform Services</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Complete 
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Development</span>
              <br />Ecosystem
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and services designed to accelerate your coding journey from beginner to professional.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <div className="space-y-8">
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
                  <div key={index} className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white border border-gray-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                      <Icon className="w-6 h-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-2">{service.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{service.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-8 border border-gray-200">
                <div className="grid grid-cols-2 gap-6">
                  {[
                    { label: 'Weekly Challenges', value: '50+', icon: Calendar },
                    { label: 'Learning Modules', value: '200+', icon: FileText },
                    { label: 'Code Templates', value: '2+', icon: Layers },
                    { label: 'Success Stories', value: '95%', icon: Award }
                  ].map((stat, index) => {
                    const Icon = stat.icon;
                    return (
                      <div key={index} className="bg-white rounded-xl p-6 border border-gray-200 text-center shadow-sm hover:shadow-md transition-shadow">
                        <Icon className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                        <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-600">{stat.label}</div>
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
      <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-white border border-green-200 rounded-full mb-8 shadow-sm">
              <Quote className="w-5 h-5 text-green-600 mr-2" />
              <span className="text-sm font-semibold text-green-700">Success Stories</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              What Our 
              <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Developers</span> Say
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Join thousands of developers who have accelerated their careers with Coding Society
            </p>
          </div>

          <div className="max-w-4xl mx-auto">
            <Card className="bg-white border border-gray-200 shadow-lg" role="region" aria-label="Customer testimonials">
              <CardContent className="p-8">
                <div className="flex items-center mb-6" role="img" aria-label={`${testimonials[currentTestimonial].rating} out of 5 stars`}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" aria-hidden="true" />
                  ))}
                </div>
                <blockquote className="text-xl text-gray-700 mb-6 leading-relaxed" cite={testimonials[currentTestimonial].name}>
                  "{testimonials[currentTestimonial].content}"
                </blockquote>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mr-4" role="img" aria-label={`Avatar for ${testimonials[currentTestimonial].name}`}>
                    <span className="text-white font-bold">
                      {testimonials[currentTestimonial].image}
                    </span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonials[currentTestimonial].name}</h4>
                    <p className="text-gray-600">{testimonials[currentTestimonial].role}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center mt-8 space-x-2" role="tablist" aria-label="Testimonial navigation">
              {testimonials.map((testimonial, index) => (
                <button
                  key={index}
                  onClick={() => handleTestimonialChange(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentTestimonial ? 'bg-blue-600' : 'bg-gray-300'
                  }`}
                  role="tab"
                  aria-selected={index === currentTestimonial}
                  aria-label={`View testimonial from ${testimonial.name}`}
                  tabIndex={index === currentTestimonial ? 0 : -1}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-white border border-blue-200 rounded-full mb-8 shadow-sm">
              <Star className="w-5 h-5 text-blue-600 mr-2" />
              <span className="text-sm font-semibold text-blue-700">Simple & Transparent Pricing</span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">
              Choose Your 
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> Plan</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Start free and upgrade as you grow. All plans include our core features with no hidden fees.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
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
              <Card key={index} className={`relative bg-white border-2 transition-all duration-300 hover:shadow-xl ${
                plan.popular ? 'border-blue-600 shadow-lg scale-105' : 'border-gray-200 hover:border-blue-300'
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-6">
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</CardTitle>
                  <div className="mb-2">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    {plan.period && <span className="text-gray-500 ml-1">/{plan.period}</span>}
                  </div>
                  <CardDescription className="text-gray-600">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-center text-gray-600">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-none' 
                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700'
                    } transition-all duration-300 cursor-pointer`}
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
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold mb-6">
            Ready to Transform Your Coding Journey?
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            Join thousands of developers who have accelerated their careers with our comprehensive platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer border-none"
              onClick={openRegisterModal}
            >
              Start Free Trial
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 cursor-pointer"
              onClick={() => scrollToSection('contact')}
            >
              Contact Sales
            </Button>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer id="contact" className="bg-white border-t border-gray-200 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Company Info */}
            <div className="lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Coding Society</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Empowering the next generation of developers with cutting-edge AI tools, expert guidance, and comprehensive learning experiences.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-blue-600 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Platform Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Platform</h3>
              <ul className="space-y-2">
                <li><Link to="/compiler" className="text-gray-600 hover:text-blue-600 transition-colors">Code Compiler</Link></li>
                <li><Link to="/study" className="text-gray-600 hover:text-blue-600 transition-colors">Learning Paths</Link></li>
                <li><Link to="/hackathons" className="text-gray-600 hover:text-blue-600 transition-colors">Hackathons</Link></li>
                <li><Link to="/quiz" className="text-gray-600 hover:text-blue-600 transition-colors">Code Challenges</Link></li>
                <li><Link to="/portfolio" className="text-gray-600 hover:text-blue-600 transition-colors">Portfolio Builder</Link></li>
                <li><Link to="/feed" className="text-gray-600 hover:text-blue-600 transition-colors">Community</Link></li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Services</h3>
              <ul className="space-y-2">
                <li><Link to="/career" className="text-gray-600 hover:text-blue-600 transition-colors">Career Services</Link></li>
                <li><Link to="/internship" className="text-gray-600 hover:text-blue-600 transition-colors">Internships</Link></li>
                <li><Link to="/ai-tools" className="text-gray-600 hover:text-blue-600 transition-colors">AI Tools</Link></li>
                <li><Link to="/research" className="text-gray-600 hover:text-blue-600 transition-colors">Research Hub</Link></li>
                <li><Link to="/roadmap" className="text-gray-600 hover:text-blue-600 transition-colors">Learning Roadmaps</Link></li>
                <li><Link to="/ideas" className="text-gray-600 hover:text-blue-600 transition-colors">Project Ideas</Link></li>
              </ul>
            </div>
            
            {/* Support */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link to="/help" className="text-gray-600 hover:text-blue-600 transition-colors">Help Center</Link></li>
                <li><a href="#contact" className="text-gray-600 hover:text-blue-600 transition-colors">Contact Us</a></li>
                <li><a href="#docs" className="text-gray-600 hover:text-blue-600 transition-colors">Documentation</a></li>
                <li><a href="#api" className="text-gray-600 hover:text-blue-600 transition-colors">API Reference</a></li>
                <li><a href="#status" className="text-gray-600 hover:text-blue-600 transition-colors">System Status</a></li>
                <li><a href="#blog" className="text-gray-600 hover:text-blue-600 transition-colors">Blog</a></li>
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