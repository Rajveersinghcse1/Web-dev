import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext();

// Export AuthContext for direct access if needed
export { AuthContext };

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for existing authentication
    const initializeAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          const userData = authService.getUser();
          setUser(userData);
          
          // Only verify token with backend if it's not a demo token
          const token = authService.getToken();
          if (token && !token.includes('demo_')) {
            await getCurrentUser();
          } else {
            setIsLoading(false);
          }
        } else {
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setIsLoading(false);
      }
    };

    initializeAuth();

    // Listen for auth token expiration
    const handleTokenExpired = () => {
      console.log('🚪 Token expired, logging out user');
      setUser(null);
      // Clear any stored auth data
      authService.logout();
    };

    window.addEventListener('authTokenExpired', handleTokenExpired);
    
    return () => {
      window.removeEventListener('authTokenExpired', handleTokenExpired);
    };
  }, []);

  const getCurrentUser = async () => {
    try {
      const token = authService.getToken();
      
      // Skip backend verification for demo tokens
      if (token && token.includes('demo_')) {
        setIsLoading(false);
        return;
      }

      const result = await authService.getCurrentUser();
      if (result.success) {
        setUser(result.user);
      } else {
        // Invalid token or error - but don't logout if it's a demo session
        if (!token || !token.includes('demo_')) {
          console.log('🚪 Token validation failed, logging out');
          setUser(null);
          authService.logout();
        }
      }
    } catch (error) {
      console.error('Failed to get current user:', error);
      // Only logout if it's not a demo token
      const token = authService.getToken();
      if (!token || !token.includes('demo_')) {
        setUser(null);
        authService.logout();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    setIsLoading(true);
    try {
      const result = await authService.login(credentials);
      
      if (result.success) {
        setUser(result.user);
        return result;
      } else {
        return result;
      }
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error.message || 'Login failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const result = await authService.register(userData);
      
      if (result.success) {
        setUser(result.user);
        return result;
      } else {
        return result;
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.message || 'Registration failed'
      };
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email) => {
    try {
      const result = await authService.forgotPassword(email);
      return result;
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: error.message || 'Password reset request failed'
      };
    }
  };

  const resetPassword = async (token, password) => {
    try {
      const result = await authService.resetPassword(token, password);
      
      if (result.success) {
        setUser(result.user);
      }
      
      return result;
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.message || 'Password reset failed'
      };
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const result = await authService.updateProfile(profileData);
      
      if (result.success) {
        setUser(result.user);
      }
      
      return result;
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.message || 'Profile update failed'
      };
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    try {
      const result = await authService.changePassword(currentPassword, newPassword);
      return result;
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: error.message || 'Password change failed'
      };
    }
  };

  // Computed properties for authentication and roles
  const isAuthenticated = !!user;
  const isAdmin = user?.role === 'ADMIN';
  const isUser = user?.role === 'USER';
  const userRole = user?.role || null;

  // Role checking functions
  const hasPermission = (permission) => {
    return user?.permissions?.[permission] === true;
  };

  const checkAdminAccess = () => {
    return isAdmin;
  };

  const checkUserAccess = () => {
    return isUser || isAdmin; // Admin can also access user areas
  };

  const getDemoCredentials = () => {
    return authService.getDemoCredentials();
  };

  const value = {
    // User state
    user,
    isLoading,
    isAuthenticated,
    
    // Role state
    isAdmin,
    isUser,
    userRole,
    
    // Auth methods
    login,
    register,
    logout,
    forgotPassword,
    resetPassword,
    updateProfile,
    changePassword,
    getCurrentUser,
    
    // Role checking methods
    hasPermission,
    checkAdminAccess,
    checkUserAccess,
    getDemoCredentials
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};