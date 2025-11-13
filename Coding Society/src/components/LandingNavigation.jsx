import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import LoginModal from './LoginModel';
import RegisterModal from './RegisterModel';
import { useNavigation } from '../context/NavigationContext';
import {
  Code2,
  Menu,
  X,
  ChevronDown,
  ArrowRight,
  Users,
  BookOpen,
  Trophy,
  Briefcase,
  Brain,
  Zap,
  Shield,
  Globe,
  Star,
  Play,
  Rocket,
  Heart,
  Coffee,
  Sparkles,
  UserCheck
} from 'lucide-react';

const LandingNavigation = () => {
  const navigate = useNavigate();
  const { setLandingNavigation } = useNavigation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  // Open login modal
  const openLoginModal = () => {
    setIsLoginModalOpen(true);
  };

  // Open register modal
  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
  };

  // Switch from login to register
  const switchToRegister = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(true);
  };

  // Switch from register to login
  const switchToLogin = () => {
    setIsRegisterModalOpen(false);
    setIsLoginModalOpen(true);
  };

  // Smooth scroll to section function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start',
        inline: 'nearest'
      });
      // Close mobile menu if open
      setIsMobileMenuOpen(false);
    }
  };

  // Handle compiler navigation
  const handleCompilerNavigation = () => {
    setLandingNavigation();
    setIsMobileMenuOpen(false);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      setScrolled(isScrolled);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location]);

  const services = [
    {
      name: 'AI Code Assistant',
      description: 'Intelligent coding support with real-time suggestions',
      icon: Brain,
      path: '/compiler',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      name: 'Learning Paths',
      description: 'Structured programming courses and tutorials',
      icon: BookOpen,
      path: '/study',
      color: 'from-green-500 to-emerald-500'
    },
    {
      name: 'Code Compiler',
      description: 'Multi-language online IDE and compiler',
      icon: Code2,
      path: '/compiler',
      color: 'from-purple-500 to-pink-500'
    },
    {
      name: 'Career Hub',
      description: 'Job opportunities and career guidance',
      icon: Briefcase,
      path: '/internships',
      color: 'from-orange-500 to-red-500'
    },
    {
      name: 'Hackathons',
      description: 'Competitive programming events',
      icon: Trophy,
      path: '/hackathons',
      color: 'from-indigo-500 to-blue-500'
    },
    {
      name: 'Community',
      description: 'Connect with developers worldwide',
      icon: Users,
      path: '/feed',
      color: 'from-yellow-500 to-orange-500'
    }
  ];

  const navigationItems = [
    { name: 'Home', path: '/', type: 'link', icon: Rocket },
    { name: 'Compiler', path: '/compiler', type: 'link', icon: Code2 },
    { name: 'Features', section: 'features', type: 'scroll', icon: Zap },
    { name: 'About', section: 'about', type: 'scroll', icon: Heart },
    { name: 'Contact', section: 'contact', type: 'scroll', icon: Coffee }
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200' 
        : 'bg-white/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-lg">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Coding Society
              </h1>
              <p className="text-xs text-gray-500 font-medium">Professional Coding Platform</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            {navigationItems.map((item) => (
              <div key={item.name} className="relative">
                {item.type === 'link' ? (
                  <Link
                    to={item.path}
                    onClick={item.path === '/compiler' ? handleCompilerNavigation : undefined}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 relative group rounded-lg hover:bg-blue-50 cursor-pointer"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    <span className="absolute -bottom-1 left-4 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-8"></span>
                  </Link>
                ) : (
                  <button
                    onClick={() => scrollToSection(item.section)}
                    className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-all duration-200 relative group rounded-lg hover:bg-blue-50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                    <span className="absolute -bottom-1 left-4 w-0 h-0.5 bg-blue-600 transition-all duration-300 group-hover:w-8"></span>
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={openLoginModal}
              data-login-trigger
              className="text-gray-700 hover:text-blue-600 hover:bg-blue-50 relative group transition-all duration-300 transform hover:scale-105 cursor-pointer bg-transparent border-none shadow-none"
            >
              <UserCheck className="w-4 h-4 mr-2 group-hover:animate-pulse" />
              Sign In
            </Button>
            <Button 
              onClick={openRegisterModal}
              data-register-trigger
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2 rounded-lg font-medium transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl relative group overflow-hidden cursor-pointer border-none"
            >
              <Rocket className="w-4 h-4 mr-2 group-hover:animate-bounce" />
              Get Started
              <Play className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              <div className="absolute top-0 -left-full h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 group-hover:left-full transition-all duration-700 transform skew-x-12"></div>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-10 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200 shadow-lg">
          <div className="px-4 py-6 space-y-4">
            {/* Navigation Links */}
            <div className="space-y-3">
              <Link
                to="/"
                className="block text-gray-700 hover:text-blue-600 font-medium py-2 cursor-pointer"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link
                to="/compiler"
                className="block text-gray-700 hover:text-blue-600 font-medium py-2 cursor-pointer"
                onClick={handleCompilerNavigation}
              >
                Compiler
              </Link>
              <button
                onClick={() => {
                  scrollToSection('features');
                  setIsMobileMenuOpen(false);
                }}
                className="block text-gray-700 hover:text-blue-600 font-medium py-2 w-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Features
              </button>
              <button
                onClick={() => {
                  scrollToSection('about');
                  setIsMobileMenuOpen(false);
                }}
                className="block text-gray-700 hover:text-blue-600 font-medium py-2 w-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                About
              </button>
              <button
                onClick={() => {
                  scrollToSection('contact');
                  setIsMobileMenuOpen(false);
                }}
                className="block text-gray-700 hover:text-blue-600 font-medium py-2 w-full text-left cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Contact
              </button>
            </div>

            {/* Services */}
            <div className="border-t border-gray-200 pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Services</h3>
              <div className="space-y-2">
                {services.slice(0, 4).map((service) => {
                  const IconComponent = service.icon;
                  return (
                    <Link
                      key={service.name}
                      to={service.path}
                      className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${service.color} flex items-center justify-center`}>
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{service.name}</h4>
                        <p className="text-sm text-gray-500">{service.description}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <Button 
                variant="outline" 
                onClick={() => {
                  openLoginModal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full group relative overflow-hidden transition-all duration-300 hover:scale-105 cursor-pointer bg-white border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600"
              >
                <UserCheck className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                Sign In
              </Button>
              <Button 
                onClick={() => {
                  openRegisterModal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white relative group overflow-hidden transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl cursor-pointer border-none"
              >
                <Rocket className="w-4 h-4 mr-2 group-hover:animate-bounce" />
                Get Started
                <Play className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform duration-300" />
                <div className="absolute top-0 -left-full h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 group-hover:left-full transition-all duration-700 transform skew-x-12"></div>
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal 
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSwitchToRegister={switchToRegister}
        onLoginSuccess={() => {
          // Handle successful authentication
          setIsLoginModalOpen(false);
          // Redirect to dashboard after successful login
          navigate('/dashboard');
        }}
      />

      {/* Register Modal */}
      <RegisterModal 
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSwitchToLogin={switchToLogin}
        onRegisterSuccess={() => {
          setIsRegisterModalOpen(false);
          // Redirect to dashboard after successful registration
          navigate('/dashboard');
        }}
      />
    </nav>
  );
};

export default LandingNavigation;