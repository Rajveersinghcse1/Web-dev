// ============================================================================
// FIX 4: Unified Validation Helper
// ============================================================================
// Location: src/lib/validationHelpers.js (NEW FILE)
// 
// Centralized validation logic for consistent error messaging
// ============================================================================

import { toast } from 'sonner';

/**
 * Validation result object
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {string} error - Error message if validation failed
 * @property {string} errorType - Type of error (auth, credits, input, network)
 */

/**
 * Validates user authentication and account readiness
 * @param {Object} userData - User data from UserContext
 * @param {boolean} isReady - Ready state from UserContext
 * @param {boolean} isLoading - Loading state from UserContext
 * @returns {ValidationResult}
 */
export function validateUserAuth(userData, isReady, isLoading) {
  // Check if still loading
  if (isLoading || !isReady) {
    return {
      isValid: false,
      error: 'Your account is still loading. Please wait a moment.',
      errorType: 'auth',
      action: 'wait'
    };
  }

  // Check if user data exists
  if (!userData) {
    return {
      isValid: false,
      error: 'Not logged in. Please sign in to continue.',
      errorType: 'auth',
      action: 'login'
    };
  }

  // Check if user has valid ID
  if (!userData._id) {
    return {
      isValid: false,
      error: 'Session expired. Please refresh the page and log in again.',
      errorType: 'auth',
      action: 'refresh'
    };
  }

  return {
    isValid: true,
    error: null,
    errorType: null,
    action: null
  };
}

/**
 * Validates user has sufficient credits
 * @param {Object} userData - User data from UserContext
 * @param {number} requiredCredits - Minimum credits required
 * @returns {ValidationResult}
 */
export function validateUserCredits(userData, requiredCredits = 100) {
  if (!userData) {
    return {
      isValid: false,
      error: 'User data not available. Please try again.',
      errorType: 'auth',
      action: 'retry'
    };
  }

  // Check if credits field exists
  if (userData.credits === undefined || userData.credits === null) {
    return {
      isValid: false,
      error: 'Unable to verify credits. Please refresh the page.',
      errorType: 'credits',
      action: 'refresh'
    };
  }

  // Check if sufficient credits
  const currentCredits = Number(userData.credits);
  if (isNaN(currentCredits) || currentCredits < requiredCredits) {
    return {
      isValid: false,
      error: `Insufficient credits. You have ${currentCredits} but need ${requiredCredits}.`,
      errorType: 'credits',
      action: 'upgrade',
      details: {
        current: currentCredits,
        required: requiredCredits
      }
    };
  }

  return {
    isValid: true,
    error: null,
    errorType: null,
    action: null
  };
}

/**
 * Validates input text fields
 * @param {string} input - Input text to validate
 * @param {Object} options - Validation options
 * @param {number} options.minLength - Minimum length required
 * @param {number} options.maxLength - Maximum length allowed
 * @param {string} options.fieldName - Name of field for error message
 * @returns {ValidationResult}
 */
export function validateInput(input, options = {}) {
  const {
    minLength = 3,
    maxLength = 500,
    fieldName = 'Input'
  } = options;

  if (!input || typeof input !== 'string') {
    return {
      isValid: false,
      error: `${fieldName} is required.`,
      errorType: 'input',
      action: 'fix'
    };
  }

  const trimmed = input.trim();

  if (trimmed.length < minLength) {
    return {
      isValid: false,
      error: `${fieldName} must be at least ${minLength} characters.`,
      errorType: 'input',
      action: 'fix'
    };
  }

  if (trimmed.length > maxLength) {
    return {
      isValid: false,
      error: `${fieldName} must be no more than ${maxLength} characters.`,
      errorType: 'input',
      action: 'fix'
    };
  }

  return {
    isValid: true,
    error: null,
    errorType: null,
    action: null
  };
}

/**
 * Validates selection from a list
 * @param {any} selection - Selected item
 * @param {string} fieldName - Name of field for error message
 * @returns {ValidationResult}
 */
export function validateSelection(selection, fieldName = 'Selection') {
  if (!selection) {
    return {
      isValid: false,
      error: `Please select a ${fieldName.toLowerCase()}.`,
      errorType: 'input',
      action: 'fix'
    };
  }

  return {
    isValid: true,
    error: null,
    errorType: null,
    action: null
  };
}

/**
 * Validates all required fields for session creation
 * @param {Object} userData - User data from UserContext
 * @param {boolean} isReady - Ready state from UserContext
 * @param {boolean} isLoading - Loading state from UserContext
 * @param {string} topic - Topic input
 * @param {string} expertName - Selected expert
 * @param {number} sessionCost - Cost of session in credits
 * @returns {ValidationResult}
 */
export function validateSessionCreation(userData, isReady, isLoading, topic, expertName, sessionCost = 100) {
  // Check auth first
  const authValidation = validateUserAuth(userData, isReady, isLoading);
  if (!authValidation.isValid) {
    return authValidation;
  }

  // Check credits
  const creditsValidation = validateUserCredits(userData, sessionCost);
  if (!creditsValidation.isValid) {
    return creditsValidation;
  }

  // Check topic
  const topicValidation = validateInput(topic, {
    minLength: 3,
    maxLength: 200,
    fieldName: 'Topic'
  });
  if (!topicValidation.isValid) {
    return topicValidation;
  }

  // Check expert selection
  const expertValidation = validateSelection(expertName, 'AI coach');
  if (!expertValidation.isValid) {
    return expertValidation;
  }

  return {
    isValid: true,
    error: null,
    errorType: null,
    action: null
  };
}

/**
 * Shows appropriate toast message based on validation result
 * @param {ValidationResult} validation - Validation result object
 * @returns {void}
 */
export function showValidationError(validation) {
  if (validation.isValid) return;

  switch (validation.errorType) {
    case 'auth':
      toast.error(validation.error, {
        description: getAuthActionMessage(validation.action),
        duration: 5000
      });
      break;
    
    case 'credits':
      toast.error(validation.error, {
        description: 'Upgrade your plan to continue.',
        duration: 5000
      });
      break;
    
    case 'input':
      toast.error(validation.error, {
        duration: 3000
      });
      break;
    
    default:
      toast.error(validation.error, {
        duration: 4000
      });
  }
}

/**
 * Gets user-friendly action message based on error action
 * @param {string} action - Action type
 * @returns {string}
 */
function getAuthActionMessage(action) {
  switch (action) {
    case 'wait':
      return 'Please wait a moment for your account to finish loading.';
    case 'login':
      return 'Please sign in to access this feature.';
    case 'refresh':
      return 'Please refresh the page or log in again.';
    case 'retry':
      return 'Please try again in a moment.';
    default:
      return '';
  }
}

/**
 * Performs all validations and shows error if any fail
 * @param {Object} userData - User data from UserContext
 * @param {boolean} isReady - Ready state from UserContext
 * @param {boolean} isLoading - Loading state from UserContext
 * @param {string} topic - Topic input
 * @param {string} expertName - Selected expert
 * @param {number} sessionCost - Cost of session in credits
 * @returns {boolean} - True if all validations pass
 */
export function validateAndShow(userData, isReady, isLoading, topic, expertName, sessionCost = 100) {
  const validation = validateSessionCreation(userData, isReady, isLoading, topic, expertName, sessionCost);
  
  if (!validation.isValid) {
    showValidationError(validation);
    return false;
  }
  
  return true;
}
