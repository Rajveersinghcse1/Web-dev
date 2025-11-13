import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { 
  X, 
  Mail, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  ArrowLeft,
  Github,
  Chrome
} from 'lucide-react';
import { authService } from '../services/authService';

const AuthModal = ({ isOpen, onClose, onAuthSuccess, initialMode = 'signin' }) => {
  const [authMode, setAuthMode] = useState(initialMode); // 'signin', 'signup', 'forgot'
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Refs for focus management
  const modalRef = useRef(null);
  const firstFocusableRef = useRef(null);
  const lastFocusableRef = useRef(null);
  const triggerRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (authMode !== 'forgot') {
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }
      
      if (authMode === 'signup') {
        if (!formData.name) {
          newErrors.name = 'Name is required';
        }
        if (!formData.confirmPassword) {
          newErrors.confirmPassword = 'Please confirm your password';
        } else if (formData.password !== formData.confirmPassword) {
          newErrors.confirmPassword = 'Passwords do not match';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    try {
      let result;
      
      if (authMode === 'signin') {
        // Login user
        result = await authService.login({
          email: formData.email,
          password: formData.password
        });
      } else if (authMode === 'signup') {
        // Register user
        result = await authService.register({
          name: formData.name,
          email: formData.email,
          password: formData.password
        });
      } else if (authMode === 'forgot') {
        // Forgot password
        result = await authService.forgotPassword({
          email: formData.email
        });
      }
      
      if (result.success) {
        if (onAuthSuccess) {
          onAuthSuccess(result.user, authMode);
        }
        onClose();
      } else {
        setErrors({ submit: result.error || 'Authentication failed. Please try again.' });
      }
    } catch (error) {
      console.error('Auth error:', error);
      setErrors({ submit: 'Network error occurred. Please check your connection.' });
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      name: ''
    });
    setShowPassword(false);
    setShowConfirmPassword(false);
    setRememberMe(false);
    setErrors({});
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    resetForm();
  };

  // Focus trap functionality
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    
    if (e.key === 'Tab') {
      const focusableElements = modalRef.current?.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      
      if (focusableElements && focusableElements.length > 0) {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    }
  }, [onClose]);

  // Handle modal open/close effects
  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      triggerRef.current = document.activeElement;
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Focus first element after animation
      setTimeout(() => {
        const firstFocusable = modalRef.current?.querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (firstFocusable) {
          firstFocusable.focus();
        }
      }, 200);
      
      // Add keydown listener
      document.addEventListener('keydown', handleKeyDown);
    } else {
      // Restore body scroll
      document.body.style.overflow = 'unset';
      
      // Return focus to trigger element
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
      
      // Remove keydown listener
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-auto"
      style={{ 
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        animation: isOpen ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.3s ease-in',
        minHeight: '100vh',
        minHeight: '100dvh'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      aria-describedby="modal-description"
    >
      {/* Backdrop - Click to close */}
      <div 
        className="absolute inset-0 cursor-pointer"
        onClick={onClose}
        aria-label="Close modal"
      />
      
      {/* Modal Container */}
      <div 
        ref={modalRef}
        className={`
          relative w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto my-auto
          transform transition-all duration-300 ease-out
          max-h-[calc(100vh-2rem)] sm:max-h-[calc(100vh-3rem)] md:max-h-[calc(100vh-4rem)]
          overflow-y-auto overflow-x-hidden
          ${isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
        `}
        style={{
          animation: isOpen ? 'modalSlideIn 0.3s ease-out' : 'modalSlideOut 0.3s ease-in',
          scrollbarWidth: 'thin',
          scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent'
        }}
      >
        <Card className="
          bg-white/90 backdrop-blur-lg border border-white/20 
          shadow-2xl shadow-black/10 rounded-2xl overflow-hidden
          ring-1 ring-black/5
        ">
          {/* Header */}
          <CardHeader className="relative text-center pb-6 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
            <button
              ref={firstFocusableRef}
              onClick={onClose}
              className="
                absolute right-4 top-4 p-2 rounded-full 
                hover:bg-white/60 focus:bg-white/60 
                transition-all duration-200 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                group z-10
              "
              aria-label="Close authentication modal"
            >
              <X className="w-5 h-5 text-gray-500 group-hover:text-gray-700 group-focus:text-gray-700" />
            </button>
            
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            
            <CardTitle 
              id="modal-title"
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              {authMode === 'signin' && 'Welcome Back'}
              {authMode === 'signup' && 'Join Coding Society'}
              {authMode === 'forgot' && 'Reset Password'}
            </CardTitle>
            
            <CardDescription 
              id="modal-description"
              className="text-gray-600 text-sm px-2"
            >
              {authMode === 'signin' && 'Sign in to access your coding dashboard'}
              {authMode === 'signup' && 'Create your account and start your coding journey'}
              {authMode === 'forgot' && 'Enter your email to receive a reset link'}
            </CardDescription>
          </CardHeader>

          {/* Content */}
          <CardContent className="space-y-6 p-6 sm:p-8">
            {errors.submit && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Name Field - Only for signup */}
              {authMode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`
                        pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 
                        rounded-lg text-base transition-all duration-200
                        ${errors.name ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                      `}
                      aria-describedby={errors.name ? 'name-error' : undefined}
                      aria-invalid={errors.name ? 'true' : 'false'}
                      required
                    />
                  </div>
                  {errors.name && (
                    <p id="name-error" className="text-red-600 text-sm" role="alert">
                      {errors.name}
                    </p>
                  )}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`
                      pl-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 
                      rounded-lg text-base transition-all duration-200
                      ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                    `}
                    aria-describedby={errors.email ? 'email-error' : undefined}
                    aria-invalid={errors.email ? 'true' : 'false'}
                    required
                  />
                </div>
                {errors.email && (
                  <p id="email-error" className="text-red-600 text-sm" role="alert">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password Field - Not for forgot password */}
              {authMode !== 'forgot' && (
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleInputChange}
                      className={`
                        pl-10 pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 
                        rounded-lg text-base transition-all duration-200
                        ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                      `}
                      aria-describedby={errors.password ? 'password-error' : undefined}
                      aria-invalid={errors.password ? 'true' : 'false'}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="
                        absolute right-3 top-1/2 transform -translate-y-1/2 
                        text-gray-400 hover:text-gray-600 focus:text-gray-600
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 rounded
                        transition-colors duration-200
                      "
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="password-error" className="text-red-600 text-sm" role="alert">
                      {errors.password}
                    </p>
                  )}
                </div>
              )}

              {/* Confirm Password Field - Only for signup */}
              {authMode === 'signup' && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className={`
                        pl-10 pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 
                        rounded-lg text-base transition-all duration-200
                        ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                      `}
                      aria-describedby={errors.confirmPassword ? 'confirm-password-error' : undefined}
                      aria-invalid={errors.confirmPassword ? 'true' : 'false'}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="
                        absolute right-3 top-1/2 transform -translate-y-1/2 
                        text-gray-400 hover:text-gray-600 focus:text-gray-600
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 rounded
                        transition-colors duration-200
                      "
                      aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p id="confirm-password-error" className="text-red-600 text-sm" role="alert">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>
              )}

              {/* Remember Me - Only for signin */}
              {authMode === 'signin' && (
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="
                      h-4 w-4 text-blue-600 border-gray-300 rounded 
                      focus:ring-blue-500 focus:ring-2 focus:ring-offset-0
                    "
                  />
                  <Label htmlFor="remember-me" className="ml-2 text-sm text-gray-700 cursor-pointer">
                    Remember me
                  </Label>
                </div>
              )}

              {/* Demo Credentials - Only for signin */}
              {authMode === 'signin' && (
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-4 space-y-3">
                  <div className="text-sm font-medium text-gray-700 mb-2">
                    🚀 Demo Credentials
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-blue-100">
                      <div className="text-xs font-semibold text-blue-700 mb-1 uppercase tracking-wide">
                        User Account
                      </div>
                      <div className="text-sm text-gray-600 font-mono space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-blue-500" />
                          <span className="text-xs">user@codingsociety.com</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lock className="w-3 h-3 text-blue-500" />
                          <span className="text-xs">user123</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            email: 'user@codingsociety.com',
                            password: 'user123'
                          }));
                        }}
                        className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                      >
                        Use Credentials
                      </button>
                    </div>
                    
                    <div className="bg-white/70 backdrop-blur-sm rounded-lg p-3 border border-purple-100">
                      <div className="text-xs font-semibold text-purple-700 mb-1 uppercase tracking-wide">
                        Admin Account
                      </div>
                      <div className="text-sm text-gray-600 font-mono space-y-1">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3 h-3 text-purple-500" />
                          <span className="text-xs">admin@codingsociety.com</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Lock className="w-3 h-3 text-purple-500" />
                          <span className="text-xs">admin123</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setFormData(prev => ({
                            ...prev,
                            email: 'admin@codingsociety.com',
                            password: 'admin123'
                          }));
                        }}
                        className="mt-2 text-xs text-purple-600 hover:text-purple-700 font-medium transition-colors"
                      >
                        Use Credentials
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 italic text-center">
                    Click "Use Credentials" to auto-fill the form
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="
                  w-full h-11 bg-gradient-to-r from-blue-600 to-purple-600 
                  hover:from-blue-700 hover:to-purple-700 
                  text-white font-medium text-base rounded-lg 
                  transition-all duration-300 transform hover:scale-[1.02] 
                  shadow-lg hover:shadow-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
                "
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  <>
                    {authMode === 'signin' && 'Sign In'}
                    {authMode === 'signup' && 'Create Account'}
                    {authMode === 'forgot' && 'Send Reset Link'}
                  </>
                )}
              </Button>
            </form>

            {/* Social Login - Not for forgot password */}
            {authMode !== 'forgot' && (
              <>
                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-4 bg-white/90 text-gray-500 font-medium">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    className="
                      h-11 border-gray-300 hover:bg-gray-50 hover:border-blue-300 
                      transition-all duration-200 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    "
                    onClick={() => {}}
                  >
                    <Github className="w-5 h-5 mr-2" />
                    GitHub
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="
                      h-11 border-gray-300 hover:bg-gray-50 hover:border-blue-300 
                      transition-all duration-200 rounded-lg
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                    "
                    onClick={() => {}}
                  >
                    <Chrome className="w-5 h-5 mr-2" />
                    Google
                  </Button>
                </div>
              </>
            )}

            {/* Footer Links */}
            <div className="text-center space-y-4 pt-4 border-t border-gray-200">
              {authMode === 'signin' && (
                <>
                  <button
                    type="button"
                    onClick={() => switchMode('forgot')}
                    className="
                      text-sm text-blue-600 hover:text-blue-700 font-medium 
                      transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded
                    "
                  >
                    Forgot your password?
                  </button>
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => switchMode('signup')}
                      className="
                        text-blue-600 hover:text-blue-700 font-semibold 
                        transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded
                      "
                    >
                      Sign up
                    </button>
                  </p>
                </>
              )}

              {authMode === 'signup' && (
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('signin')}
                    className="
                      text-blue-600 hover:text-blue-700 font-semibold 
                      transition-colors duration-200
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded
                    "
                  >
                    Sign in
                  </button>
                </p>
              )}

              {authMode === 'forgot' && (
                <button
                  ref={lastFocusableRef}
                  type="button"
                  onClick={() => switchMode('signin')}
                  className="
                    flex items-center justify-center text-sm text-blue-600 hover:text-blue-700 
                    font-medium mx-auto transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded
                  "
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Back to sign in
                </button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        
        @keyframes modalSlideIn {
          from { 
            opacity: 0; 
            transform: scale(0.95) translateY(-10px); 
          }
          to { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
        }
        
        @keyframes modalSlideOut {
          from { 
            opacity: 1; 
            transform: scale(1) translateY(0); 
          }
          to { 
            opacity: 0; 
            transform: scale(0.95) translateY(-10px); 
          }
        }
      `}</style>
    </div>
  );
};
export default AuthModal;