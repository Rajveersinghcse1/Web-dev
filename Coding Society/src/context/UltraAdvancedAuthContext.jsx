import { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

// Enhanced Authentication Context with advanced features
const AuthContext = createContext();

// Authentication service configuration
const AUTH_CONFIG = {
  apiEndpoint: '/api/auth', // Backend API endpoint
  tokenKey: 'coding_society_token',
  refreshTokenKey: 'coding_society_refresh_token',
  userKey: 'coding_society_user',
  sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  refreshThreshold: 5 * 60 * 1000, // Refresh token 5 minutes before expiry
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutes lockout
};

// Password strength requirements
const PASSWORD_REQUIREMENTS = {
  minLength: 8,
  requireUppercase: true,
  requireLowercase: true,
  requireNumbers: true,
  requireSpecialChars: true,
  maxLength: 128,
  commonPatterns: [
    'password', '123456', 'qwerty', 'abc123', 'admin',
    'letmein', 'welcome', 'monkey', '1234567890'
  ]
};

/**
 * Ultra-Advanced Authentication Provider
 * Features:
 * - JWT token management with auto-refresh
 * - Multi-factor authentication support
 * - Biometric authentication (WebAuthn)
 * - Session management and security
 * - Password strength validation
 * - Rate limiting and brute force protection
 * - Social login integration
 * - Account lockout protection
 * - Security audit logging
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [refreshToken, setRefreshToken] = useState(null);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEnd, setLockoutEnd] = useState(null);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [mfaEnabled, setMfaEnabled] = useState(false);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [securityLogs, setSecurityLogs] = useState([]);

  /**
   * Initialize authentication state and check for existing session
   */
  useEffect(() => {
    initializeAuth();
    // Only check biometric support in secure contexts
    if (window.isSecureContext) {
      checkBiometricSupport();
    }
    setupTokenRefreshTimer();
    setupSessionMonitoring();
  }, []);

  /**
   * Initialize authentication from stored credentials
   */
  const initializeAuth = async () => {
    try {
      const storedToken = localStorage.getItem(AUTH_CONFIG.tokenKey);
      const storedRefreshToken = localStorage.getItem(AUTH_CONFIG.refreshTokenKey);
      const storedUser = localStorage.getItem(AUTH_CONFIG.userKey);

      if (storedToken && storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Validate token expiry
        if (isTokenValid(storedToken)) {
          setToken(storedToken);
          setRefreshToken(storedRefreshToken);
          setUser(userData);
          setIsAuthenticated(true);
          
          // Check MFA status
          await checkMfaStatus(userData.id);
          
          logSecurityEvent('session_restored', { userId: userData.id });
        } else {
          // Try to refresh token
          if (storedRefreshToken) {
            await refreshAuthToken(storedRefreshToken);
          } else {
            await logout();
          }
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      await logout();
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Check if WebAuthn biometric authentication is supported
   */
  const checkBiometricSupport = () => {
    try {
      const isSupported = window.isSecureContext && 
                         window.PublicKeyCredential && 
                         navigator.credentials && 
                         typeof navigator.credentials.create === 'function';
      setBiometricSupported(isSupported);
    } catch (error) {
      console.warn('Biometric support check failed:', error);
      setBiometricSupported(false);
    }
  };

  /**
   * Enhanced login with multiple authentication methods
   */
  const login = async (credentials, options = {}) => {
    const { email, password, mfaCode, biometric, rememberMe } = credentials;
    const { loginMethod = 'password' } = options;

    try {
      // Check account lockout
      if (isLocked && Date.now() < lockoutEnd) {
        const remainingTime = Math.ceil((lockoutEnd - Date.now()) / 60000);
        throw new Error(`Account locked. Try again in ${remainingTime} minutes.`);
      }

      setIsLoading(true);

      let authData;

      switch (loginMethod) {
        case 'password':
          authData = await passwordLogin(email, password, mfaCode);
          break;
        case 'biometric':
          authData = await biometricLogin(email);
          break;
        case 'social':
          authData = await socialLogin(options.provider);
          break;
        default:
          throw new Error('Invalid login method');
      }

      // Store authentication data
      await storeAuthData(authData, rememberMe);
      
      // Reset login attempts on successful login
      setLoginAttempts(0);
      setIsLocked(false);
      setLockoutEnd(null);
      
      // Log successful login
      logSecurityEvent('login_success', { 
        userId: authData.user.id, 
        method: loginMethod,
        ip: await getClientIP()
      });

      toast.success('Login successful!');
      return { success: true, user: authData.user };

    } catch (error) {
      await handleLoginFailure(error);
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Traditional password-based login
   */
  const passwordLogin = async (email, password, mfaCode) => {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }

    // Simulate API call (replace with real API)
    const response = await fetch(`${AUTH_CONFIG.apiEndpoint}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        password: await hashPassword(password),
        mfaCode,
        fingerprint: await generateDeviceFingerprint()
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login failed');
    }

    return response.json();
  };

  /**
   * Biometric authentication using WebAuthn
   */
  const biometricLogin = async (email) => {
    if (!biometricSupported) {
      throw new Error('Biometric authentication not supported');
    }

    try {
      // Get challenge from server
      const challengeResponse = await fetch(`${AUTH_CONFIG.apiEndpoint}/webauthn/challenge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const challenge = await challengeResponse.json();

      // Create assertion
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: new Uint8Array(challenge.challenge),
          allowCredentials: challenge.allowCredentials,
          userVerification: 'required'
        }
      });

      // Verify assertion with server
      const verifyResponse = await fetch(`${AUTH_CONFIG.apiEndpoint}/webauthn/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          assertion: {
            id: assertion.id,
            rawId: Array.from(new Uint8Array(assertion.rawId)),
            response: {
              authenticatorData: Array.from(new Uint8Array(assertion.response.authenticatorData)),
              clientDataJSON: Array.from(new Uint8Array(assertion.response.clientDataJSON)),
              signature: Array.from(new Uint8Array(assertion.response.signature))
            }
          }
        })
      });

      if (!verifyResponse.ok) {
        throw new Error('Biometric verification failed');
      }

      return verifyResponse.json();
    } catch (error) {
      throw new Error('Biometric login failed: ' + error.message);
    }
  };

  /**
   * Social login integration
   */
  const socialLogin = async (provider) => {
    const providers = {
      google: () => initiateGoogleLogin(),
      github: () => initiateGitHubLogin(),
      microsoft: () => initiateMicrosoftLogin(),
      discord: () => initiateDiscordLogin()
    };

    if (!providers[provider]) {
      throw new Error('Unsupported social login provider');
    }

    return providers[provider]();
  };

  /**
   * Enhanced registration with security features
   */
  const register = async (userData) => {
    const { email, password, confirmPassword, firstName, lastName, agreedToTerms } = userData;

    try {
      setIsLoading(true);

      // Validate inputs
      const validation = validateRegistrationData(userData);
      if (!validation.valid) {
        throw new Error(validation.message);
      }

      // Check password strength
      const passwordCheck = validatePasswordStrength(password);
      if (!passwordCheck.valid) {
        throw new Error('Password does not meet security requirements: ' + passwordCheck.message);
      }

      // Hash password
      const hashedPassword = await hashPassword(password);

      // Generate device fingerprint
      const deviceFingerprint = await generateDeviceFingerprint();

      // Register user
      const response = await fetch(`${AUTH_CONFIG.apiEndpoint}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password: hashedPassword,
          firstName,
          lastName,
          deviceFingerprint,
          registrationIP: await getClientIP()
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      const result = await response.json();
      
      logSecurityEvent('registration_success', { 
        userId: result.user.id,
        email: result.user.email 
      });

      toast.success('Registration successful! Please verify your email.');
      return { success: true, user: result.user };

    } catch (error) {
      logSecurityEvent('registration_failed', { email, error: error.message });
      return { success: false, error: error.message };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Setup biometric authentication
   */
  const setupBiometric = async () => {
    if (!biometricSupported || !user) {
      throw new Error('Biometric setup not available');
    }

    try {
      // Get registration challenge
      const challengeResponse = await fetch(`${AUTH_CONFIG.apiEndpoint}/webauthn/register/challenge`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId: user.id })
      });

      const challenge = await challengeResponse.json();

      // Create credential
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(challenge.challenge),
          rp: {
            name: 'Coding Society',
            id: window.location.hostname
          },
          user: {
            id: new Uint8Array(Buffer.from(user.id, 'utf8')),
            name: user.email,
            displayName: user.name
          },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
          authenticatorSelection: {
            authenticatorAttachment: 'platform',
            userVerification: 'required'
          }
        }
      });

      // Register credential with server
      const registerResponse = await fetch(`${AUTH_CONFIG.apiEndpoint}/webauthn/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          credential: {
            id: credential.id,
            rawId: Array.from(new Uint8Array(credential.rawId)),
            response: {
              attestationObject: Array.from(new Uint8Array(credential.response.attestationObject)),
              clientDataJSON: Array.from(new Uint8Array(credential.response.clientDataJSON))
            }
          }
        })
      });

      if (!registerResponse.ok) {
        throw new Error('Failed to register biometric credential');
      }

      toast.success('Biometric authentication setup successfully!');
      return true;
    } catch (error) {
      toast.error('Biometric setup failed: ' + error.message);
      return false;
    }
  };

  /**
   * Enable/disable multi-factor authentication
   */
  const toggleMFA = async (enable, method = 'totp') => {
    try {
      const response = await fetch(`${AUTH_CONFIG.apiEndpoint}/mfa/${enable ? 'enable' : 'disable'}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId: user.id,
          method
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update MFA settings');
      }

      const result = await response.json();
      setMfaEnabled(enable);
      
      logSecurityEvent(enable ? 'mfa_enabled' : 'mfa_disabled', { 
        userId: user.id,
        method 
      });

      return result;
    } catch (error) {
      throw new Error('MFA update failed: ' + error.message);
    }
  };

  /**
   * Secure logout with session cleanup
   */
  const logout = async () => {
    try {
      // Invalidate token on server
      if (token) {
        await fetch(`${AUTH_CONFIG.apiEndpoint}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }

      // Clear all stored data
      localStorage.removeItem(AUTH_CONFIG.tokenKey);
      localStorage.removeItem(AUTH_CONFIG.refreshTokenKey);
      localStorage.removeItem(AUTH_CONFIG.userKey);
      
      // Reset state
      setUser(null);
      setIsAuthenticated(false);
      setToken(null);
      setRefreshToken(null);
      setMfaEnabled(false);
      setSessionExpiry(null);

      logSecurityEvent('logout', { userId: user?.id });
      
      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  /**
   * Password strength validation
   */
  const validatePasswordStrength = (password) => {
    const errors = [];

    if (password.length < PASSWORD_REQUIREMENTS.minLength) {
      errors.push(`Minimum ${PASSWORD_REQUIREMENTS.minLength} characters required`);
    }

    if (password.length > PASSWORD_REQUIREMENTS.maxLength) {
      errors.push(`Maximum ${PASSWORD_REQUIREMENTS.maxLength} characters allowed`);
    }

    if (PASSWORD_REQUIREMENTS.requireUppercase && !/[A-Z]/.test(password)) {
      errors.push('At least one uppercase letter required');
    }

    if (PASSWORD_REQUIREMENTS.requireLowercase && !/[a-z]/.test(password)) {
      errors.push('At least one lowercase letter required');
    }

    if (PASSWORD_REQUIREMENTS.requireNumbers && !/\d/.test(password)) {
      errors.push('At least one number required');
    }

    if (PASSWORD_REQUIREMENTS.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      errors.push('At least one special character required');
    }

    // Check for common passwords
    const lowercasePassword = password.toLowerCase();
    for (const pattern of PASSWORD_REQUIREMENTS.commonPatterns) {
      if (lowercasePassword.includes(pattern)) {
        errors.push('Password contains common patterns');
        break;
      }
    }

    return {
      valid: errors.length === 0,
      message: errors.join(', '),
      strength: calculatePasswordStrength(password)
    };
  };

  /**
   * Calculate password strength score
   */
  const calculatePasswordStrength = (password) => {
    let score = 0;
    
    // Length bonus
    score += Math.min(password.length * 2, 20);
    
    // Character variety bonus
    if (/[a-z]/.test(password)) score += 5;
    if (/[A-Z]/.test(password)) score += 5;
    if (/\d/.test(password)) score += 5;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 10;
    
    // Complexity bonus
    const uniqueChars = new Set(password).size;
    score += uniqueChars * 2;
    
    // Pattern penalty
    if (/(.)\1{2,}/.test(password)) score -= 10; // Repeated characters
    if (/123|abc|qwe/i.test(password)) score -= 10; // Sequential patterns
    
    return Math.max(0, Math.min(100, score));
  };

  // Helper functions
  const isTokenValid = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  };

  const storeAuthData = async (authData, rememberMe) => {
    const storage = rememberMe ? localStorage : sessionStorage;
    
    storage.setItem(AUTH_CONFIG.tokenKey, authData.token);
    storage.setItem(AUTH_CONFIG.refreshTokenKey, authData.refreshToken);
    storage.setItem(AUTH_CONFIG.userKey, JSON.stringify(authData.user));
    
    setToken(authData.token);
    setRefreshToken(authData.refreshToken);
    setUser(authData.user);
    setIsAuthenticated(true);
    setSessionExpiry(Date.now() + AUTH_CONFIG.sessionTimeout);
  };

  const handleLoginFailure = async (error) => {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    
    if (newAttempts >= AUTH_CONFIG.maxLoginAttempts) {
      const lockEnd = Date.now() + AUTH_CONFIG.lockoutDuration;
      setIsLocked(true);
      setLockoutEnd(lockEnd);
      
      logSecurityEvent('account_locked', { 
        attempts: newAttempts,
        lockoutEnd: lockEnd 
      });
    }
    
    logSecurityEvent('login_failed', { 
      error: error.message,
      attempts: newAttempts 
    });
    
    toast.error(error.message);
  };

  const logSecurityEvent = (event, data) => {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      event,
      data,
      userAgent: navigator.userAgent,
      ip: 'xxx.xxx.xxx.xxx' // Will be filled by backend
    };
    
    setSecurityLogs(prev => [logEntry, ...prev.slice(0, 99)]); // Keep last 100 logs
    
    // Send to server for permanent storage
    fetch(`${AUTH_CONFIG.apiEndpoint}/security-log`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logEntry)
    }).catch(console.error);
  };

  // Utility functions (simplified for demo)
  const hashPassword = async (password) => {
    // In real implementation, use proper hashing
    const encoder = new TextEncoder();
    const data = encoder.encode(password + 'salt');
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const generateDeviceFingerprint = async () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    ctx.textBaseline = 'top';
    ctx.font = '14px Arial';
    ctx.fillText('Device fingerprint', 2, 2);
    
    const fingerprint = {
      canvas: canvas.toDataURL(),
      screen: `${screen.width}x${screen.height}`,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      doNotTrack: navigator.doNotTrack
    };
    
    return btoa(JSON.stringify(fingerprint));
  };

  const getClientIP = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch {
      return 'unknown';
    }
  };

  const validateRegistrationData = (data) => {
    if (!data.email || !data.password || !data.confirmPassword) {
      return { valid: false, message: 'All fields are required' };
    }
    
    if (data.password !== data.confirmPassword) {
      return { valid: false, message: 'Passwords do not match' };
    }
    
    if (!data.agreedToTerms) {
      return { valid: false, message: 'You must agree to the terms and conditions' };
    }
    
    return { valid: true };
  };

  // Timer and monitoring functions
  const setupTokenRefreshTimer = () => {
    setInterval(() => {
      if (token && isTokenValid(token)) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const expiryTime = payload.exp * 1000;
        const currentTime = Date.now();
        
        // Refresh token if it expires within threshold
        if (expiryTime - currentTime < AUTH_CONFIG.refreshThreshold) {
          refreshAuthToken(refreshToken);
        }
      }
    }, 60000); // Check every minute
  };

  const setupSessionMonitoring = () => {
    // Monitor for suspicious activity
    let lastActivity = Date.now();
    
    const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    
    activityEvents.forEach(event => {
      document.addEventListener(event, () => {
        lastActivity = Date.now();
      });
    });
    
    // Check for session timeout
    setInterval(() => {
      if (isAuthenticated && Date.now() - lastActivity > AUTH_CONFIG.sessionTimeout) {
        logSecurityEvent('session_timeout', { lastActivity });
        logout();
      }
    }, 300000); // Check every 5 minutes
  };

  const refreshAuthToken = async (refreshToken) => {
    try {
      const response = await fetch(`${AUTH_CONFIG.apiEndpoint}/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });
      
      if (response.ok) {
        const data = await response.json();
        setToken(data.token);
        localStorage.setItem(AUTH_CONFIG.tokenKey, data.token);
      } else {
        await logout();
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      await logout();
    }
  };

  const checkMfaStatus = async (userId) => {
    try {
      const response = await fetch(`${AUTH_CONFIG.apiEndpoint}/mfa/status/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMfaEnabled(data.enabled);
      }
    } catch (error) {
      console.error('MFA status check failed:', error);
    }
  };

  // Social login implementations (simplified)
  const initiateGoogleLogin = () => {
    // Implement Google OAuth flow
    window.location.href = `${AUTH_CONFIG.apiEndpoint}/oauth/google`;
  };

  const initiateGitHubLogin = () => {
    // Implement GitHub OAuth flow
    window.location.href = `${AUTH_CONFIG.apiEndpoint}/oauth/github`;
  };

  const initiateMicrosoftLogin = () => {
    // Implement Microsoft OAuth flow
    window.location.href = `${AUTH_CONFIG.apiEndpoint}/oauth/microsoft`;
  };

  const initiateDiscordLogin = () => {
    // Implement Discord OAuth flow
    window.location.href = `${AUTH_CONFIG.apiEndpoint}/oauth/discord`;
  };

  const value = {
    // State
    user,
    isAuthenticated,
    isLoading,
    mfaEnabled,
    biometricSupported,
    securityLogs,
    isLocked,
    lockoutEnd,
    
    // Methods
    login,
    register,
    logout,
    setupBiometric,
    toggleMFA,
    validatePasswordStrength,
    
    // Utilities
    refreshAuthToken,
    logSecurityEvent
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;