// ============================================================================
// FIX 6: Network Resilience Service
// ============================================================================
// Location: src/lib/networkResilience.js (NEW FILE)
// 
// Provides retry, timeout, and fallback utilities for all API calls
// ============================================================================

/**
 * Configuration for network resilience
 */
export const NetworkConfig = {
  DEFAULT_TIMEOUT: 10000, // 10 seconds
  AI_TIMEOUT: 30000, // 30 seconds for AI operations
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000, // Base delay in ms
  BACKOFF_MULTIPLIER: 2 // Exponential backoff multiplier
};

/**
 * Error types for categorization
 */
export const ErrorTypes = {
  NETWORK: 'network',
  TIMEOUT: 'timeout',
  AUTH: 'auth',
  VALIDATION: 'validation',
  SERVER: 'server',
  UNKNOWN: 'unknown'
};

/**
 * Categorizes errors for better handling
 * @param {Error} error - Error object
 * @returns {string} Error type
 */
export function categorizeError(error) {
  const message = error?.message?.toLowerCase() || '';
  
  if (message.includes('network') || message.includes('fetch failed') || message.includes('econnrefused')) {
    return ErrorTypes.NETWORK;
  }
  
  if (message.includes('timeout') || message.includes('aborted')) {
    return ErrorTypes.TIMEOUT;
  }
  
  if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
    return ErrorTypes.AUTH;
  }
  
  if (message.includes('validation') || message.includes('invalid')) {
    return ErrorTypes.VALIDATION;
  }
  
  if (message.includes('500') || message.includes('server error')) {
    return ErrorTypes.SERVER;
  }
  
  return ErrorTypes.UNKNOWN;
}

/**
 * Checks if an error is transient (should retry)
 * @param {Error} error - Error object
 * @returns {boolean}
 */
export function isTransientError(error) {
  const type = categorizeError(error);
  return type === ErrorTypes.NETWORK || type === ErrorTypes.TIMEOUT || type === ErrorTypes.SERVER;
}

/**
 * Gets user-friendly error message
 * @param {Error} error - Error object
 * @returns {string}
 */
export function getUserFriendlyMessage(error) {
  const type = categorizeError(error);
  
  switch (type) {
    case ErrorTypes.NETWORK:
      return 'Network error. Please check your connection and try again.';
    case ErrorTypes.TIMEOUT:
      return 'Request timed out. Please try again.';
    case ErrorTypes.AUTH:
      return 'Session expired. Please refresh the page and log in again.';
    case ErrorTypes.VALIDATION:
      return 'Invalid input. Please check your data and try again.';
    case ErrorTypes.SERVER:
      return 'Server error. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

/**
 * Wraps a promise with timeout
 * @param {Promise} promise - Promise to wrap
 * @param {number} timeoutMs - Timeout in milliseconds
 * @returns {Promise}
 */
export function withTimeout(promise, timeoutMs = NetworkConfig.DEFAULT_TIMEOUT) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Operation timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    promise
      .then(result => {
        clearTimeout(timeoutId);
        resolve(result);
      })
      .catch(error => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

/**
 * Retries a function with exponential backoff
 * @param {Function} fn - Async function to retry
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries
 * @param {number} options.delay - Initial delay in ms
 * @param {number} options.backoffMultiplier - Multiplier for exponential backoff
 * @param {Function} options.shouldRetry - Function to determine if should retry
 * @returns {Promise}
 */
export async function withRetry(fn, options = {}) {
  const {
    maxRetries = NetworkConfig.MAX_RETRIES,
    delay = NetworkConfig.RETRY_DELAY,
    backoffMultiplier = NetworkConfig.BACKOFF_MULTIPLIER,
    shouldRetry = isTransientError
  } = options;

  let lastError;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const result = await fn(attempt);
      return result;
    } catch (error) {
      lastError = error;
      
      console.error(`[NetworkResilience] Attempt ${attempt + 1}/${maxRetries + 1} failed:`, error.message);

      // Check if should retry
      if (attempt < maxRetries && shouldRetry(error)) {
        const waitTime = delay * Math.pow(backoffMultiplier, attempt);
        console.log(`[NetworkResilience] Retrying in ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        break;
      }
    }
  }

  throw lastError;
}

/**
 * Combines timeout and retry for resilient API calls
 * @param {Function} fn - Async function to execute
 * @param {Object} options - Options object
 * @param {number} options.timeout - Timeout in ms
 * @param {number} options.maxRetries - Maximum retries
 * @param {Function} options.fallback - Fallback function if all retries fail
 * @returns {Promise}
 */
export async function resilientCall(fn, options = {}) {
  const {
    timeout = NetworkConfig.DEFAULT_TIMEOUT,
    maxRetries = NetworkConfig.MAX_RETRIES,
    fallback = null
  } = options;

  try {
    return await withRetry(
      async (attempt) => {
        console.log(`[NetworkResilience] Executing call (attempt ${attempt + 1})`);
        return await withTimeout(fn(), timeout);
      },
      { maxRetries }
    );
  } catch (error) {
    console.error('[NetworkResilience] All attempts failed:', error);
    
    // Try fallback if provided
    if (fallback && typeof fallback === 'function') {
      console.log('[NetworkResilience] Using fallback');
      return await fallback(error);
    }
    
    // Enhance error with user-friendly message
    error.userMessage = getUserFriendlyMessage(error);
    error.errorType = categorizeError(error);
    throw error;
  }
}

/**
 * Creates a resilient version of an async function
 * @param {Function} fn - Async function to make resilient
 * @param {Object} defaultOptions - Default options
 * @returns {Function}
 */
export function makeResilient(fn, defaultOptions = {}) {
  return async (...args) => {
    return resilientCall(
      () => fn(...args),
      defaultOptions
    );
  };
}

/**
 * Batch multiple resilient calls with Promise.allSettled
 * @param {Array<Function>} calls - Array of async functions
 * @param {Object} options - Options for each call
 * @returns {Promise<Array>}
 */
export async function batchResilientCalls(calls, options = {}) {
  const promises = calls.map(call => 
    resilientCall(call, options).catch(error => ({
      error: true,
      message: error.userMessage || error.message,
      type: error.errorType
    }))
  );

  return Promise.all(promises);
}

/**
 * Network status tracker
 */
export class NetworkStatusTracker {
  constructor() {
    this.isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
    this.listeners = [];

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.setStatus(true));
      window.addEventListener('offline', () => this.setStatus(false));
    }
  }

  setStatus(online) {
    const changed = this.isOnline !== online;
    this.isOnline = online;
    
    if (changed) {
      console.log(`[NetworkStatusTracker] Network ${online ? 'online' : 'offline'}`);
      this.listeners.forEach(listener => listener(online));
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  getStatus() {
    return this.isOnline;
  }
}

// Singleton instance
export const networkStatus = typeof window !== 'undefined' 
  ? new NetworkStatusTracker() 
  : null;

/**
 * Hook-friendly wrapper for network status
 * @returns {boolean}
 */
export function useNetworkStatus() {
  if (typeof window === 'undefined') return true;
  return networkStatus?.getStatus() ?? true;
}
