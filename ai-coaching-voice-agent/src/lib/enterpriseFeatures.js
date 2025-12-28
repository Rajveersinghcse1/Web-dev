/**
 * Enterprise Features Library
 * 
 * Provides:
 * - Admin dashboard utilities
 * - User management
 * - Audit logging
 * - GDPR compliance tools
 * - Rate limiting
 * - System monitoring
 * - White-label customization
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ==================== AUDIT LOGGING ====================

/**
 * Audit Log Entry
 */
export class AuditLogger {
  constructor(options = {}) {
    this.maxLogs = options.maxLogs || 1000;
    this.storageKey = options.storageKey || 'audit-logs';
    this.logs = this.loadLogs();
  }

  /**
   * Load logs from storage
   */
  loadLogs() {
    if (typeof window === 'undefined') return [];
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load audit logs:', error);
      return [];
    }
  }

  /**
   * Save logs to storage
   */
  saveLogs() {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Failed to save audit logs:', error);
    }
  }

  /**
   * Log an action
   */
  log(action, details = {}) {
    const entry = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      action,
      userId: details.userId || 'anonymous',
      userName: details.userName || 'Unknown',
      details: details.metadata || {},
      severity: details.severity || 'info', // info, warning, error, critical
      category: details.category || 'general', // general, auth, data, admin, system
      ipAddress: details.ipAddress || 'unknown',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
    };

    this.logs.unshift(entry);

    // Limit log size
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(0, this.maxLogs);
    }

    this.saveLogs();
    return entry;
  }

  /**
   * Get logs with filters
   */
  getLogs(filters = {}) {
    let filtered = [...this.logs];

    if (filters.userId) {
      filtered = filtered.filter(log => log.userId === filters.userId);
    }

    if (filters.category) {
      filtered = filtered.filter(log => log.category === filters.category);
    }

    if (filters.severity) {
      filtered = filtered.filter(log => log.severity === filters.severity);
    }

    if (filters.startDate) {
      filtered = filtered.filter(log => log.timestamp >= filters.startDate);
    }

    if (filters.endDate) {
      filtered = filtered.filter(log => log.timestamp <= filters.endDate);
    }

    if (filters.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(search) ||
        log.userName.toLowerCase().includes(search) ||
        JSON.stringify(log.details).toLowerCase().includes(search)
      );
    }

    return filtered;
  }

  /**
   * Clear all logs
   */
  clearLogs() {
    this.logs = [];
    this.saveLogs();
  }

  /**
   * Export logs as JSON
   */
  exportLogs(filters = {}) {
    const logs = this.getLogs(filters);
    return JSON.stringify(logs, null, 2);
  }
}

// ==================== RATE LIMITING ====================

/**
 * Rate Limiter
 * Prevents abuse by limiting requests per user/IP
 */
export class RateLimiter {
  constructor(options = {}) {
    this.windowMs = options.windowMs || 60000; // 1 minute
    this.maxRequests = options.maxRequests || 100;
    this.requests = new Map();
  }

  /**
   * Check if request is allowed
   */
  isAllowed(identifier) {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Remove old requests outside window
    const validRequests = userRequests.filter(
      timestamp => now - timestamp < this.windowMs
    );

    if (validRequests.length >= this.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetAt: validRequests[0] + this.windowMs,
        retryAfter: Math.ceil((validRequests[0] + this.windowMs - now) / 1000),
      };
    }

    validRequests.push(now);
    this.requests.set(identifier, validRequests);

    return {
      allowed: true,
      remaining: this.maxRequests - validRequests.length,
      resetAt: now + this.windowMs,
    };
  }

  /**
   * Reset rate limit for identifier
   */
  reset(identifier) {
    this.requests.delete(identifier);
  }

  /**
   * Clear all rate limits
   */
  clearAll() {
    this.requests.clear();
  }
}

// ==================== GDPR COMPLIANCE ====================

/**
 * GDPR Data Manager
 * Handles user data export, deletion, and consent
 */
export class GDPRManager {
  constructor() {
    this.consentKey = 'gdpr-consent';
    this.dataKeys = [
      'user-storage',
      'session-storage',
      'achievements-storage',
      'gamification-storage',
      'analytics-storage',
      'ml-storage',
      'collaboration-storage',
      'voice-profile-storage',
    ];
  }

  /**
   * Get user consent status
   */
  getConsent() {
    if (typeof window === 'undefined') return null;
    
    try {
      const stored = localStorage.getItem(this.consentKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      return null;
    }
  }

  /**
   * Set user consent
   */
  setConsent(consent) {
    if (typeof window === 'undefined') return;
    
    const consentData = {
      analytics: consent.analytics || false,
      marketing: consent.marketing || false,
      necessary: true, // Always true for app functionality
      timestamp: Date.now(),
      version: '1.0',
    };

    localStorage.setItem(this.consentKey, JSON.stringify(consentData));
    return consentData;
  }

  /**
   * Export all user data
   */
  exportUserData() {
    if (typeof window === 'undefined') return null;
    
    const userData = {};

    this.dataKeys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          userData[key] = JSON.parse(data);
        }
      } catch (error) {
        console.error(`Failed to export ${key}:`, error);
      }
    });

    return {
      exportDate: new Date().toISOString(),
      dataVersion: '1.0',
      data: userData,
    };
  }

  /**
   * Delete all user data
   */
  deleteUserData() {
    if (typeof window === 'undefined') return false;
    
    try {
      this.dataKeys.forEach(key => {
        localStorage.removeItem(key);
      });

      // Also clear consent
      localStorage.removeItem(this.consentKey);

      return true;
    } catch (error) {
      console.error('Failed to delete user data:', error);
      return false;
    }
  }

  /**
   * Anonymize user data (keep analytics but remove PII)
   */
  anonymizeUserData() {
    if (typeof window === 'undefined') return false;
    
    try {
      this.dataKeys.forEach(key => {
        const data = localStorage.getItem(key);
        if (data) {
          const parsed = JSON.parse(data);
          
          // Remove PII fields
          const anonymized = this.removePII(parsed);
          localStorage.setItem(key, JSON.stringify(anonymized));
        }
      });

      return true;
    } catch (error) {
      console.error('Failed to anonymize data:', error);
      return false;
    }
  }

  /**
   * Remove personally identifiable information
   */
  removePII(data) {
    if (typeof data !== 'object' || data === null) return data;

    const anonymized = Array.isArray(data) ? [] : {};
    const piiFields = ['name', 'email', 'phone', 'address', 'avatar', 'userName'];

    for (const key in data) {
      if (piiFields.includes(key)) {
        anonymized[key] = '[REDACTED]';
      } else if (typeof data[key] === 'object' && data[key] !== null) {
        anonymized[key] = this.removePII(data[key]);
      } else {
        anonymized[key] = data[key];
      }
    }

    return anonymized;
  }
}

// ==================== SYSTEM MONITORING ====================

/**
 * System Health Monitor
 * Tracks performance, errors, and system health
 */
export class SystemMonitor {
  constructor() {
    this.metrics = {
      pageLoads: 0,
      errors: [],
      performance: [],
      apiCalls: [],
      resourceUsage: [],
    };
    this.startTime = Date.now();
  }

  /**
   * Record page load
   */
  recordPageLoad(page) {
    this.metrics.pageLoads++;
    
    if (typeof window !== 'undefined' && window.performance) {
      const perfData = window.performance.timing;
      const loadTime = perfData.loadEventEnd - perfData.navigationStart;

      this.metrics.performance.push({
        timestamp: Date.now(),
        page,
        loadTime,
        domContentLoaded: perfData.domContentLoadedEventEnd - perfData.navigationStart,
        resourcesLoaded: perfData.loadEventEnd - perfData.domContentLoadedEventEnd,
      });

      // Keep last 100
      this.metrics.performance = this.metrics.performance.slice(-100);
    }
  }

  /**
   * Record error
   */
  recordError(error, context = {}) {
    this.metrics.errors.push({
      timestamp: Date.now(),
      message: error.message || 'Unknown error',
      stack: error.stack || '',
      context,
      severity: context.severity || 'error',
    });

    // Keep last 100
    this.metrics.errors = this.metrics.errors.slice(-100);
  }

  /**
   * Record API call
   */
  recordApiCall(endpoint, duration, status) {
    this.metrics.apiCalls.push({
      timestamp: Date.now(),
      endpoint,
      duration,
      status,
    });

    // Keep last 200
    this.metrics.apiCalls = this.metrics.apiCalls.slice(-200);
  }

  /**
   * Record resource usage
   */
  recordResourceUsage() {
    if (typeof window === 'undefined' || !window.performance || !window.performance.memory) {
      return;
    }

    this.metrics.resourceUsage.push({
      timestamp: Date.now(),
      memory: {
        usedJSHeapSize: window.performance.memory.usedJSHeapSize,
        totalJSHeapSize: window.performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: window.performance.memory.jsHeapSizeLimit,
      },
    });

    // Keep last 100
    this.metrics.resourceUsage = this.metrics.resourceUsage.slice(-100);
  }

  /**
   * Get system health report
   */
  getHealthReport() {
    const uptime = Date.now() - this.startTime;
    const errorRate = this.metrics.errors.length / this.metrics.pageLoads || 0;
    
    const avgLoadTime = this.metrics.performance.length > 0
      ? this.metrics.performance.reduce((sum, p) => sum + p.loadTime, 0) / this.metrics.performance.length
      : 0;

    const recentErrors = this.metrics.errors.slice(-10);
    const criticalErrors = this.metrics.errors.filter(e => e.severity === 'critical').length;

    return {
      status: criticalErrors > 0 ? 'critical' : errorRate > 0.05 ? 'warning' : 'healthy',
      uptime,
      pageLoads: this.metrics.pageLoads,
      totalErrors: this.metrics.errors.length,
      criticalErrors,
      errorRate: Math.round(errorRate * 100) / 100,
      avgLoadTime: Math.round(avgLoadTime),
      recentErrors,
      apiCallsCount: this.metrics.apiCalls.length,
      memoryUsage: this.metrics.resourceUsage.length > 0
        ? this.metrics.resourceUsage[this.metrics.resourceUsage.length - 1]
        : null,
    };
  }

  /**
   * Clear metrics
   */
  clearMetrics() {
    this.metrics = {
      pageLoads: 0,
      errors: [],
      performance: [],
      apiCalls: [],
      resourceUsage: [],
    };
  }
}

// ==================== WHITE-LABEL CUSTOMIZATION ====================

/**
 * White-Label Theme Manager
 * Allows customization of branding and theme
 */
export class WhiteLabelManager {
  constructor() {
    this.storageKey = 'white-label-config';
    this.config = this.loadConfig();
  }

  /**
   * Load configuration
   */
  loadConfig() {
    if (typeof window === 'undefined') return this.getDefaultConfig();
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? { ...this.getDefaultConfig(), ...JSON.parse(stored) } : this.getDefaultConfig();
    } catch (error) {
      return this.getDefaultConfig();
    }
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      branding: {
        appName: 'AI Coaching Voice Agent',
        companyName: 'Your Company',
        logo: '/logo.png',
        favicon: '/favicon.ico',
        tagline: 'Empowering growth through AI-powered coaching',
      },
      theme: {
        primaryColor: '#8B5CF6', // Purple
        secondaryColor: '#EC4899', // Pink
        accentColor: '#10B981', // Green
        backgroundColor: '#111827',
        textColor: '#F3F4F6',
      },
      features: {
        showBranding: true,
        showPoweredBy: false,
        customDomain: '',
        customEmailDomain: '',
      },
      contact: {
        supportEmail: 'support@example.com',
        website: 'https://example.com',
        phone: '',
      },
      legal: {
        privacyPolicyUrl: '/privacy',
        termsOfServiceUrl: '/terms',
        companyAddress: '',
      },
    };
  }

  /**
   * Update configuration
   */
  updateConfig(updates) {
    this.config = { ...this.config, ...updates };
    
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.storageKey, JSON.stringify(this.config));
    }

    return this.config;
  }

  /**
   * Apply theme to document
   */
  applyTheme() {
    if (typeof document === 'undefined') return;

    const { theme } = this.config;
    const root = document.documentElement;

    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--accent-color', theme.accentColor);
    root.style.setProperty('--bg-color', theme.backgroundColor);
    root.style.setProperty('--text-color', theme.textColor);
  }

  /**
   * Get configuration
   */
  getConfig() {
    return this.config;
  }

  /**
   * Reset to defaults
   */
  reset() {
    this.config = this.getDefaultConfig();
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.storageKey);
    }

    return this.config;
  }
}

// ==================== ENTERPRISE STORE ====================

export const useEnterpriseStore = create(
  persist(
    (set, get) => ({
      // Instances
      auditLogger: typeof window !== 'undefined' ? new AuditLogger() : null,
      rateLimiter: typeof window !== 'undefined' ? new RateLimiter() : null,
      gdprManager: typeof window !== 'undefined' ? new GDPRManager() : null,
      systemMonitor: typeof window !== 'undefined' ? new SystemMonitor() : null,
      whiteLabelManager: typeof window !== 'undefined' ? new WhiteLabelManager() : null,

      // Admin state
      adminMode: false,
      userManagement: {
        users: [],
        roles: ['user', 'admin', 'moderator'],
      },

      // System state
      systemHealth: null,
      maintenanceMode: false,

      // Actions
      
      /**
       * Toggle admin mode
       */
      toggleAdminMode: (password) => {
        // Simple password check (use proper auth in production)
        const isValid = password === 'admin123';
        
        if (isValid) {
          set({ adminMode: true });
          get().auditLogger?.log('Admin mode enabled', {
            category: 'admin',
            severity: 'warning',
          });
        }

        return isValid;
      },

      /**
       * Log audit event
       */
      logAudit: (action, details) => {
        const logger = get().auditLogger;
        return logger?.log(action, details);
      },

      /**
       * Check rate limit
       */
      checkRateLimit: (identifier) => {
        const limiter = get().rateLimiter;
        return limiter?.isAllowed(identifier);
      },

      /**
       * Export user data (GDPR)
       */
      exportUserData: () => {
        const manager = get().gdprManager;
        const data = manager?.exportUserData();
        
        get().logAudit('User data exported', {
          category: 'data',
          severity: 'info',
        });

        return data;
      },

      /**
       * Delete user data (GDPR)
       */
      deleteUserData: () => {
        const manager = get().gdprManager;
        const success = manager?.deleteUserData();
        
        if (success) {
          get().logAudit('User data deleted', {
            category: 'data',
            severity: 'warning',
          });
        }

        return success;
      },

      /**
       * Set GDPR consent
       */
      setGDPRConsent: (consent) => {
        const manager = get().gdprManager;
        const result = manager?.setConsent(consent);
        
        get().logAudit('GDPR consent updated', {
          category: 'data',
          severity: 'info',
          metadata: consent,
        });

        return result;
      },

      /**
       * Get system health
       */
      getSystemHealth: () => {
        const monitor = get().systemMonitor;
        const health = monitor?.getHealthReport();
        set({ systemHealth: health });
        return health;
      },

      /**
       * Record error
       */
      recordError: (error, context) => {
        const monitor = get().systemMonitor;
        monitor?.recordError(error, context);
        
        get().logAudit('Error recorded', {
          category: 'system',
          severity: 'error',
          metadata: { message: error.message, context },
        });
      },

      /**
       * Update white-label config
       */
      updateWhiteLabel: (config) => {
        const manager = get().whiteLabelManager;
        const updated = manager?.updateConfig(config);
        manager?.applyTheme();
        
        get().logAudit('White-label config updated', {
          category: 'admin',
          severity: 'info',
        });

        return updated;
      },

      /**
       * Toggle maintenance mode
       */
      toggleMaintenanceMode: (enabled) => {
        set({ maintenanceMode: enabled });
        
        get().logAudit(
          enabled ? 'Maintenance mode enabled' : 'Maintenance mode disabled',
          {
            category: 'admin',
            severity: 'warning',
          }
        );
      },
    }),
    {
      name: 'enterprise-storage',
      partialize: (state) => ({
        adminMode: state.adminMode,
        maintenanceMode: state.maintenanceMode,
      }),
    }
  )
);

// ==================== REACT HOOKS ====================

export const useAuditLogger = () =>
  useEnterpriseStore((state) => state.auditLogger);

export const useRateLimiter = () =>
  useEnterpriseStore((state) => state.rateLimiter);

export const useGDPRManager = () =>
  useEnterpriseStore((state) => state.gdprManager);

export const useSystemMonitor = () =>
  useEnterpriseStore((state) => state.systemMonitor);

export const useWhiteLabelManager = () =>
  useEnterpriseStore((state) => state.whiteLabelManager);

export const useEnterpriseActions = () =>
  useEnterpriseStore((state) => ({
    toggleAdminMode: state.toggleAdminMode,
    logAudit: state.logAudit,
    checkRateLimit: state.checkRateLimit,
    exportUserData: state.exportUserData,
    deleteUserData: state.deleteUserData,
    setGDPRConsent: state.setGDPRConsent,
    getSystemHealth: state.getSystemHealth,
    recordError: state.recordError,
    updateWhiteLabel: state.updateWhiteLabel,
    toggleMaintenanceMode: state.toggleMaintenanceMode,
  }));

export const useAdminMode = () =>
  useEnterpriseStore((state) => state.adminMode);

export const useMaintenanceMode = () =>
  useEnterpriseStore((state) => state.maintenanceMode);

// Export classes for direct usage
export {
  AuditLogger,
  RateLimiter,
  GDPRManager,
  SystemMonitor,
  WhiteLabelManager,
};
