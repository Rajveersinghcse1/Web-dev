/**
 * Authentication Service for Coding Society Platform
 * Handles all authentication-related API calls
 */

import axios from 'axios';

// API Configuration
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor to include auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      // Redirect to login or emit event
      window.dispatchEvent(new CustomEvent('authTokenExpired'));
    }
    return Promise.reject(error);
  }
);

/**
 * Authentication Service Class
 */
class AuthService {
  // Predefined credentials for demo purposes
  static DEMO_CREDENTIALS = {
    user: {
      email: 'user@codingsociety.com',
      password: 'user123',
      userData: {
        id: 'user_001',
        name: 'Regular User',
        email: 'user@codingsociety.com',
        role: 'USER',
        avatar: '/images/user-avatar.jpg',
        profile: {
          firstName: 'Regular',
          lastName: 'User',
          bio: 'A coding enthusiast learning new technologies',
          skills: ['JavaScript', 'React', 'Node.js']
        },
        preferences: {
          theme: 'light',
          notifications: true
        },
        stats: {
          postsCount: 15,
          followersCount: 42,
          followingCount: 38
        },
        createdAt: '2024-01-15T10:30:00Z'
      }
    },
    admin: {
      email: 'admin@codingsociety.com',
      password: 'admin123',
      userData: {
        id: 'admin_001',
        name: 'System Administrator',
        email: 'admin@codingsociety.com',
        role: 'ADMIN',
        avatar: '/images/admin-avatar.jpg',
        profile: {
          firstName: 'System',
          lastName: 'Administrator',
          bio: 'Platform administrator managing content and users',
          skills: ['Full Stack', 'DevOps', 'System Design', 'Management']
        },
        permissions: {
          canManageUsers: true,
          canManageContent: true,
          canViewAnalytics: true,
          canManageSystem: true
        },
        preferences: {
          theme: 'dark',
          notifications: true
        },
        stats: {
          managedUsers: 1247,
          contentManaged: 3891,
          systemUptime: '99.9%'
        },
        createdAt: '2023-12-01T08:00:00Z'
      }
    }
  };

  /**
   * Login user with email and password (with role-based authentication)
   * @param {Object} credentials - User credentials
   * @param {string} credentials.email - User email
   * @param {string} credentials.password - User password
   * @returns {Promise<Object>} Login response
   */
  async login(credentials) {
    try {
      console.log('🚀 AuthService: Attempting login with:', { 
        email: credentials.email, 
        apiUrl: API_BASE_URL + '/auth/login' 
      });

      // Check demo credentials first (for demo purposes)
      const demoLogin = this.checkDemoCredentials(credentials);
      if (demoLogin.success) {
        console.log('✅ AuthService: Demo login successful');
        return demoLogin;
      }
      
      // If demo credentials don't match, try backend authentication
      const loginData = {
        identifier: credentials.email,
        password: credentials.password
      };
      
      const response = await api.post('/auth/login', loginData);
      
      console.log('📨 AuthService: Backend login response:', response.data);
      
      if (response.data.success) {
        // Store tokens and user data
        localStorage.setItem('authToken', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        console.log('✅ AuthService: Backend login successful, user stored');
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        };
      } else {
        console.log('❌ AuthService: Backend login failed -', response.data.message);
        return {
          success: false,
          error: response.data.message || 'Login failed'
        };
      }
    } catch (error) {
      console.error('🔥 AuthService: Login error:', error);
      
      // If backend is not available, show demo credentials info
      if (error.code === 'NETWORK_ERROR' || error.response?.status >= 500) {
        return {
          success: false,
          error: 'Backend server not available. Use demo credentials:\nUser: user@codingsociety.com / user123\nAdmin: admin@codingsociety.com / admin123'
        };
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Invalid credentials. Try demo accounts:\nUser: user@codingsociety.com / user123\nAdmin: admin@codingsociety.com / admin123'
      };
    }
  }

  /**
   * Check demo credentials for role-based authentication
   * @param {Object} credentials - Login credentials
   * @returns {Object} Authentication result
   */
  checkDemoCredentials(credentials) {
    const { email, password } = credentials;
    
    // Check user credentials
    if (email === AuthService.DEMO_CREDENTIALS.user.email && 
        password === AuthService.DEMO_CREDENTIALS.user.password) {
      
      const userData = AuthService.DEMO_CREDENTIALS.user.userData;
      
      // Store in localStorage for persistence
      localStorage.setItem('authToken', 'demo_user_token_' + Date.now());
      localStorage.setItem('user', JSON.stringify(userData));
      
      return {
        success: true,
        user: userData,
        token: 'demo_user_token',
        message: 'Welcome! Logged in as Regular User'
      };
    }
    
    // Check admin credentials
    if (email === AuthService.DEMO_CREDENTIALS.admin.email && 
        password === AuthService.DEMO_CREDENTIALS.admin.password) {
      
      const userData = AuthService.DEMO_CREDENTIALS.admin.userData;
      
      // Store in localStorage for persistence
      localStorage.setItem('authToken', 'demo_admin_token_' + Date.now());
      localStorage.setItem('user', JSON.stringify(userData));
      
      return {
        success: true,
        user: userData,
        token: 'demo_admin_token',
        message: 'Welcome! Logged in as System Administrator'
      };
    }
    
    return {
      success: false,
      error: 'Invalid credentials'
    };
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   * @param {string} userData.username - Username
   * @param {string} userData.email - Email address
   * @param {string} userData.password - Password
   * @param {string} [userData.firstName] - First name
   * @param {string} [userData.lastName] - Last name
   * @returns {Promise<Object>} Registration response
   */
  async register(userData) {
    try {
      console.log('🚀 AuthService: Attempting registration with:', { 
        name: userData.name, 
        email: userData.email,
        apiUrl: API_BASE_URL + '/auth/register' 
      });
      
      const response = await api.post('/auth/register', userData);
      
      console.log('📨 AuthService: Registration response:', response.data);
      
      if (response.data.success) {
        // Store tokens and user data
        localStorage.setItem('authToken', response.data.token);
        if (response.data.refreshToken) {
          localStorage.setItem('refreshToken', response.data.refreshToken);
        }
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        console.log('✅ AuthService: Registration successful, user stored');
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        };
      } else {
        console.log('❌ AuthService: Registration failed -', response.data.message);
        return {
          success: false,
          error: response.data.message || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('🔥 AuthService: Registration error:', error);
      console.error('🔥 Error response:', error.response?.data);
      return {
        success: false,
        error: error.response?.data?.message || 'Network error occurred'
      };
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email address
   * @returns {Promise<Object>} Forgot password response
   */
  async forgotPassword(email) {
    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      return {
        success: true,
        message: response.data.message,
        // Include reset token for development
        resetToken: response.data.resetToken,
        resetUrl: response.data.resetUrl
      };
    } catch (error) {
      console.error('Forgot password error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Network error occurred'
      };
    }
  }

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} password - New password
   * @returns {Promise<Object>} Reset password response
   */
  async resetPassword(token, password) {
    try {
      const response = await api.post(`/auth/reset-password/${token}`, { password });
      
      if (response.data.success) {
        // Store new tokens and user data
        localStorage.setItem('authToken', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return {
          success: true,
          user: response.data.user,
          token: response.data.token
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Password reset failed'
        };
      }
    } catch (error) {
      console.error('Reset password error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Network error occurred'
      };
    }
  }

  /**
   * Get current user profile
   * @returns {Promise<Object>} User profile response
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return {
          success: true,
          user: response.data.user
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Failed to get user profile'
        };
      }
    } catch (error) {
      console.error('Get current user error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Network error occurred'
      };
    }
  }

  /**
   * Update user profile
   * @param {Object} profileData - Profile data to update
   * @returns {Promise<Object>} Update profile response
   */
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      if (response.data.success) {
        // Update stored user data
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return {
          success: true,
          user: response.data.user
        };
      } else {
        return {
          success: false,
          error: response.data.message || 'Profile update failed'
        };
      }
    } catch (error) {
      console.error('Update profile error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Network error occurred'
      };
    }
  }

  /**
   * Change user password
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<Object>} Change password response
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await api.put('/auth/password', {
        currentPassword,
        newPassword
      });
      
      return {
        success: response.data.success,
        message: response.data.message
      };
    } catch (error) {
      console.error('Change password error:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Network error occurred'
      };
    }
  }

  /**
   * Logout user
   * @returns {Promise<Object>} Logout response
   */
  async logout() {
    try {
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear local storage regardless of API response
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return { success: true };
    }
  }

  /**
   * Refresh access token
   * @returns {Promise<Object>} Refresh token response
   */
  async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await api.post('/auth/refresh', { refreshToken });
      
      if (response.data.success) {
        localStorage.setItem('authToken', response.data.token);
        
        return {
          success: true,
          token: response.data.token
        };
      } else {
        throw new Error(response.data.message || 'Token refresh failed');
      }
    } catch (error) {
      console.error('Refresh token error:', error);
      // Clear all auth data on refresh failure
      localStorage.removeItem('authToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      
      return {
        success: false,
        error: error.message || 'Token refresh failed'
      };
    }
  }

  /**
   * Check if user is authenticated
   * @returns {boolean} Authentication status
   */
  isAuthenticated() {
    const token = localStorage.getItem('authToken');
    const user = localStorage.getItem('user');
    return !!(token && user);
  }

  /**
   * Get stored user data
   * @returns {Object|null} User data or null
   */
  getUser() {
    try {
      const userData = localStorage.getItem('user');
      if (!userData || userData === 'undefined' || userData === 'null') {
        return null;
      }
      return JSON.parse(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      // Clear invalid data
      localStorage.removeItem('user');
      return null;
    }
  }

  /**
   * Get stored auth token
   * @returns {string|null} Auth token or null
   */
  getToken() {
    return localStorage.getItem('authToken');
  }

  /**
   * Check if current user has admin role
   * @returns {boolean} Admin status
   */
  isAdmin() {
    const user = this.getUser();
    return user?.role === 'ADMIN';
  }

  /**
   * Check if current user has regular user role
   * @returns {boolean} User status
   */
  isUser() {
    const user = this.getUser();
    return user?.role === 'USER';
  }

  /**
   * Get current user role
   * @returns {string|null} User role (ADMIN, USER, or null)
   */
  getUserRole() {
    const user = this.getUser();
    return user?.role || null;
  }

  /**
   * Check if user has specific permission
   * @param {string} permission - Permission to check
   * @returns {boolean} Permission status
   */
  hasPermission(permission) {
    const user = this.getUser();
    return user?.permissions?.[permission] === true;
  }

  /**
   * Get demo credentials info
   * @returns {Object} Demo credentials information
   */
  getDemoCredentials() {
    return {
      user: {
        email: AuthService.DEMO_CREDENTIALS.user.email,
        password: AuthService.DEMO_CREDENTIALS.user.password,
        role: 'USER'
      },
      admin: {
        email: AuthService.DEMO_CREDENTIALS.admin.email,
        password: AuthService.DEMO_CREDENTIALS.admin.password,
        role: 'ADMIN'
      }
    };
  }

  /**
   * Logout user and clear all stored data
   */
  logout() {
    console.log('🚪 AuthService: Logging out user');
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  }
}

// Export singleton instance
export const authService = new AuthService();
export default authService;