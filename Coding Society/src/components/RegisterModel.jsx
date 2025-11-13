import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Eye, EyeOff, Mail, Lock, User, Github, Chrome } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const RegisterModal = ({ isOpen, onClose, onSwitchToLogin, onRegisterSuccess }) => {
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'student',
    bio: '',
    location: '',
    favoriteLanguage: 'javascript'
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Refs for focus management
  const modalRef = useRef(null);
  const triggerRef = useRef(null);

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
      triggerRef.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      
      // Add keydown listener immediately
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
      
      if (triggerRef.current) {
        triggerRef.current.focus();
      }
      
      document.removeEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, handleKeyDown]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
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
    
    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    } else if (formData.fullName.trim().length < 2) {
      newErrors.fullName = 'Full name must be at least 2 characters';
    } else if (formData.fullName.trim().length > 50) {
      newErrors.fullName = 'Full name cannot exceed 50 characters';
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Role validation
    if (!formData.role) {
      newErrors.role = 'Please select a role';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setErrors({}); // Clear any previous errors
    
    try {
      const result = await register({
        name: formData.fullName,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        bio: formData.bio.trim() || undefined,
        location: formData.location.trim() || undefined,
        favoriteLanguage: formData.favoriteLanguage
      });
      
      console.log('Registration result:', result);
      
      if (result.success) {
        // Clear form on successful registration
        setFormData({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
          role: 'student',
          bio: '',
          location: '',
          favoriteLanguage: 'javascript'
        });
        setErrors({});
        
        // Call success handler to redirect to dashboard
        if (onRegisterSuccess) {
          onRegisterSuccess();
        } else if (onSwitchToLogin) {
          onSwitchToLogin();
        }
      } else {
        // Handle registration error
        const errorMessage = result.error || 'Registration failed. Please try again.';
        setErrors({ submit: errorMessage });
        console.error('Registration failed:', errorMessage);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors({ submit: 'Registration failed. Please check your connection and try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

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
      aria-labelledby="register-modal-title"
      aria-describedby="register-modal-description"
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
              aria-label="Close registration modal"
            >
              <svg className="w-5 h-5 text-gray-500 group-hover:text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            
            <h2 
              id="register-modal-title"
              className="text-2xl font-bold text-gray-900 mb-2"
            >
              Join Coding Society
            </h2>
            
            <p 
              id="register-modal-description"
              className="text-gray-600 text-sm"
            >
              Create your account and start your coding journey
            </p>
          </div>

          {/* Content */}
          <div className="p-6 sm:p-8">
            {errors.submit && (
              <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm" role="alert">
                {errors.submit}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Full Name Field */}
              <div className="space-y-2">
                <label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={formData.fullName}
                    onChange={handleChange}
                    className={`
                      w-full pl-10 pr-4 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 
                      rounded-lg text-base transition-all duration-200 bg-gray-50
                      ${errors.fullName ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                    `}
                    placeholder="Enter your full name"
                    aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                    aria-invalid={errors.fullName ? 'true' : 'false'}
                    required
                  />
                </div>
                {errors.fullName && (
                  <p id="fullName-error" className="text-red-600 text-sm" role="alert">
                    {errors.fullName}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`
                      w-full pl-10 pr-4 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 
                      rounded-lg text-base transition-all duration-200 bg-gray-50
                      ${errors.email ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                    `}
                    placeholder="Enter your email"
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

              {/* Password Field */}
              <div className="space-y-2">
                <label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    className={`
                      w-full pl-10 pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 
                      rounded-lg text-base transition-all duration-200 bg-gray-50
                      ${errors.password ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                    `}
                    placeholder="Enter your password"
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

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`
                      w-full pl-10 pr-10 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 
                      rounded-lg text-base transition-all duration-200 bg-gray-50
                      ${errors.confirmPassword ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                    `}
                    placeholder="Confirm your password"
                    aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
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
                  <p id="confirmPassword-error" className="text-red-600 text-sm" role="alert">
                    {errors.confirmPassword}
                  </p>
                )}
              </div>

              {/* Role Selection */}
              <div className="space-y-2">
                <label htmlFor="role" className="text-sm font-medium text-gray-700">
                  Account Type
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className={`
                      w-full pl-10 pr-4 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 
                      rounded-lg text-base transition-all duration-200 bg-gray-50 appearance-none
                      ${errors.role ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : ''}
                    `}
                    aria-describedby={errors.role ? 'role-error' : undefined}
                    aria-invalid={errors.role ? 'true' : 'false'}
                    required
                  >
                    <option value="student">Student</option>
                    <option value="instructor">Instructor</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
                {errors.role && (
                  <p id="role-error" className="text-red-600 text-sm" role="alert">
                    {errors.role}
                  </p>
                )}
              </div>

              {/* Bio Field (Optional) */}
              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium text-gray-700">
                  Bio <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-3 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleChange}
                    rows={3}
                    className="
                      w-full pl-10 pr-4 py-3 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 
                      rounded-lg text-base transition-all duration-200 bg-gray-50 resize-none
                    "
                    placeholder="Tell us a bit about yourself (optional)"
                  />
                </div>
              </div>

              {/* Location Field (Optional) */}
              <div className="space-y-2">
                <label htmlFor="location" className="text-sm font-medium text-gray-700">
                  Location <span className="text-gray-400 text-xs">(optional)</span>
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <input
                    id="location"
                    name="location"
                    type="text"
                    value={formData.location}
                    onChange={handleChange}
                    className="
                      w-full pl-10 pr-4 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 
                      rounded-lg text-base transition-all duration-200 bg-gray-50
                    "
                    placeholder="City, Country (optional)"
                  />
                </div>
              </div>

              {/* Favorite Programming Language */}
              <div className="space-y-2">
                <label htmlFor="favoriteLanguage" className="text-sm font-medium text-gray-700">
                  Favorite Programming Language
                </label>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  <select
                    id="favoriteLanguage"
                    name="favoriteLanguage"
                    value={formData.favoriteLanguage}
                    onChange={handleChange}
                    className="
                      w-full pl-10 pr-4 h-11 border-gray-300 focus:border-blue-500 focus:ring-blue-500/20 
                      rounded-lg text-base transition-all duration-200 bg-gray-50 appearance-none
                    "
                  >
                    <option value="javascript">JavaScript</option>
                    <option value="python">Python</option>
                    <option value="java">Java</option>
                    <option value="cpp">C++</option>
                    <option value="csharp">C#</option>
                    <option value="go">Go</option>
                    <option value="rust">Rust</option>
                    <option value="typescript">TypeScript</option>
                    <option value="php">PHP</option>
                    <option value="ruby">Ruby</option>
                    <option value="swift">Swift</option>
                    <option value="kotlin">Kotlin</option>
                    <option value="other">Other</option>
                  </select>
                  <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
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
                    Creating Account...
                  </div>
                ) : (
                  'Create Account'
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
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="
                    text-blue-600 hover:text-blue-700 font-semibold 
                    transition-colors duration-200
                    focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded
                  "
                >
                  Sign in
                </button>
              </p>
            </div>
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

export default RegisterModal;