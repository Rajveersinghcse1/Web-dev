import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, EyeOff, Mail, Lock, User, ArrowLeft, Github, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const LoginModal = ({ isOpen, onClose, onSwitchToRegister, onLoginSuccess }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  // Refs for focus management
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

  // Focus trap functionality
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }
    
    if (e.key === 'Tab' && modalRef.current) {
      const focusableElements = modalRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      );
      
      const focusableArray = Array.from(focusableElements);
      const firstElement = focusableArray[0];
      const lastElement = focusableArray[focusableArray.length - 1];
      
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
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
      
      // Add keydown listener immediately
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Basic validation
    if (!email.trim()) {
      setError('Email is required');
      setIsLoading(false);
      return;
    }
    
    if (!password) {
      setError('Password is required');
      setIsLoading(false);
      return;
    }

    try {
      const result = await login({ email: email.trim(), password });
      
      console.log('Login result:', result);
      
      if (result.success) {
        // Clear form on successful login
        setEmail('');
        setPassword('');
        setRememberMe(false);
        setError('');
        
        // Call the success handler from parent to redirect to dashboard
        if (onLoginSuccess) {
          onLoginSuccess();
        }
      } else {
        // Handle login error
        const errorMessage = result.error || 'Invalid email or password. Please try again.';
        setError(errorMessage);
        console.error('Login failed:', errorMessage);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setError('');

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));

    setForgotLoading(false);
    setForgotSuccess(true);
    
    // Reset form after 3 seconds
    setTimeout(() => {
      setForgotSuccess(false);
      setShowForgotPassword(false);
      setForgotEmail('');
    }, 3000);
  };

  const resetForgotPassword = () => {
    setShowForgotPassword(false);
    setForgotEmail('');
    setForgotSuccess(false);
    setError('');
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-auto"
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        animation: isOpen ? 'fadeIn 0.3s ease-out' : 'fadeOut 0.3s ease-in',
        minHeight: '100vh'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-modal-title"
      aria-describedby="login-modal-description"
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
          relative w-full max-w-sm sm:max-w-md mx-auto my-auto
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
        <div className="
          bg-white border border-gray-200 
          shadow-2xl rounded-2xl overflow-hidden
        ">
          {/* Header */}
          <div className="relative text-center pb-6 pt-8 px-6 bg-gradient-to-br from-blue-50 to-purple-50">
            <button
              onClick={onClose}
              className="
                absolute right-4 top-4 p-2 rounded-full 
                hover:bg-white/60 focus:bg-white/60 
                transition-all duration-200 
                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                group z-10
              "
              aria-label="Close login modal"
            >
              <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            
            <h2 
              id="login-modal-title"
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              {showForgotPassword ? 'Reset Password' : 'Welcome Back'}
            </h2>
            
            <p 
              id="login-modal-description"
              className="text-gray-600 text-sm"
            >
              {showForgotPassword 
                ? 'Enter your email to receive a reset link' 
                : 'Sign in to access your coding dashboard'
              }
            </p>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {!showForgotPassword ? (
              <>
                {/* Login Form */}
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  {/* Email Field */}
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="
                          w-full pl-10 pr-4 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 
                          rounded-lg text-base transition-all duration-200 bg-gray-50
                        "
                        placeholder="Enter your email"
                        required
                      />
                    </div>
                  </div>

                  {/* Password Field */}
                  <div className="space-y-2">
                    <label htmlFor="password" className="text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="
                          w-full pl-10 pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 
                          rounded-lg text-base transition-all duration-200 bg-gray-50
                        "
                        placeholder="Enter your password"
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
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700 cursor-pointer">
                        Remember me
                      </label>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="
                        text-sm text-blue-600 hover:text-blue-700 font-medium 
                        transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded
                      "
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
                      {error}
                    </div>
                  )}

                  {/* Demo Credentials */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-semibold text-blue-800">Demo Credentials:</h4>
                      <button
                        type="button"
                        onClick={() => {
                          setEmail('admin@rock.com');
                          setPassword('admin123');
                        }}
                        className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors"
                      >
                        Fill Form
                      </button>
                    </div>
                    <p className="text-xs text-blue-700 mb-1">Email: admin@rock.com</p>
                    <p className="text-xs text-blue-700">Password: admin123</p>
                  </div>

                  {/* Submit Button */}
                  <button
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
                        Signing In...
                      </div>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                </form>

                {/* Social Login */}
                <div className="mt-6">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-4 bg-white/90 text-gray-500 font-medium">Or continue with</span>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      className="
                        h-11 border border-gray-300 bg-white/80 hover:bg-gray-50 hover:border-blue-300 
                        transition-all duration-200 rounded-lg flex items-center justify-center gap-2
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      "
                    >
                      <Github className="w-5 h-5" />
                      GitHub
                    </button>
                    <button
                      type="button"
                      className="
                        h-11 border border-gray-300 bg-white/80 hover:bg-gray-50 hover:border-blue-300 
                        transition-all duration-200 rounded-lg flex items-center justify-center gap-2
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                      "
                    >
                      <Chrome className="w-5 h-5" />
                      Google
                    </button>
                  </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={onSwitchToRegister}
                      className="
                        text-blue-600 hover:text-blue-700 font-semibold 
                        transition-colors duration-200
                        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded
                      "
                    >
                      Sign up
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* Forgot Password Form */}
                {!forgotSuccess ? (
                  <form onSubmit={handleForgotPassword} className="space-y-5" noValidate>
                    <div className="space-y-2">
                      <label htmlFor="forgot-email" className="text-sm font-medium text-gray-700">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          id="forgot-email"
                          type="email"
                          value={forgotEmail}
                          onChange={(e) => setForgotEmail(e.target.value)}
                          className="
                            w-full pl-10 pr-4 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 
                            rounded-lg text-base transition-all duration-200 bg-gray-50
                          "
                          placeholder="Enter your email"
                          required
                        />
                      </div>
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
                        {error}
                      </div>
                    )}

                    <button
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
                      disabled={forgotLoading}
                    >
                      {forgotLoading ? (
                        <div className="flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Sending...
                        </div>
                      ) : (
                        'Send Reset Link'
                      )}
                    </button>
                  </form>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Check your email</h3>
                    <p className="text-gray-600 text-sm">
                      We've sent a password reset link to {forgotEmail}
                    </p>
                  </div>
                )}

                {/* Back to Login */}
                <div className="text-center mt-6 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForgotPassword}
                    className="
                      flex items-center justify-center text-sm text-blue-600 hover:text-blue-700 
                      font-medium mx-auto transition-colors duration-200 gap-1
                      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded
                    "
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Back to sign in
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
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

export default LoginModal;