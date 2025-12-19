/**
 * ♿ ACCESSIBILITY UTILITIES
 * 
 * Comprehensive accessibility helpers:
 * - Screen reader announcements
 * - Focus management
 * - Keyboard navigation
 * - ARIA live regions
 * - Skip links
 * - High contrast mode detection
 * 
 * WCAG 2.1 Level AA compliant
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';

// ============================================
// SCREEN READER ANNOUNCEMENTS
// ============================================

/**
 * Announce messages to screen readers
 * Creates live region for dynamic content announcements
 */
export function useScreenReader() {
  const liveRegionRef = useRef(null);

  useEffect(() => {
    // Create live region if it doesn't exist
    if (!liveRegionRef.current) {
      const region = document.createElement('div');
      region.id = 'sr-live-region';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only';
      region.style.cssText = `
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      `;
      document.body.appendChild(region);
      liveRegionRef.current = region;
    }

    return () => {
      if (liveRegionRef.current && liveRegionRef.current.parentNode === document.body) {
        document.body.removeChild(liveRegionRef.current);
        liveRegionRef.current = null;
      }
    };
  }, []);

  const announce = useCallback((message, priority = 'polite') => {
    if (liveRegionRef.current) {
      // Clear previous message
      liveRegionRef.current.textContent = '';
      
      // Set priority (polite or assertive)
      liveRegionRef.current.setAttribute('aria-live', priority);
      
      // Announce new message after small delay
      setTimeout(() => {
        if (liveRegionRef.current) {
          liveRegionRef.current.textContent = message;
        }
      }, 100);
    }
  }, []);

  return { announce };
}

// ============================================
// FOCUS MANAGEMENT
// ============================================

/**
 * Focus trap for modals and dialogs
 * Keeps focus within container
 */
export function useFocusTrap(enabled = true) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!enabled || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleTabKey);
    
    // Focus first element when trap is activated
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [enabled]);

  return containerRef;
}

/**
 * Restore focus when component unmounts
 */
export function useFocusReturn() {
  const previousFocusRef = useRef(null);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;

    return () => {
      // Restore focus when component unmounts
      if (previousFocusRef.current instanceof HTMLElement) {
        previousFocusRef.current.focus();
      }
    };
  }, []);
}

/**
 * Focus management utilities
 */
export function useFocusManager() {
  const focusElement = useCallback((selector) => {
    const element = document.querySelector(selector);
    if (element instanceof HTMLElement) {
      element.focus();
    }
  }, []);

  const focusFirstError = useCallback(() => {
    const errorElement = document.querySelector('[aria-invalid="true"]');
    if (errorElement instanceof HTMLElement) {
      errorElement.focus();
    }
  }, []);

  const moveFocusTo = useCallback((element) => {
    if (element instanceof HTMLElement) {
      element.focus();
    }
  }, []);

  return { focusElement, focusFirstError, moveFocusTo };
}

// ============================================
// SKIP LINKS
// ============================================

/**
 * Skip to main content link
 */
export function SkipLink({ targetId = 'main-content' }) {
  return (
    <a
      href={`#${targetId}`}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-purple-600 focus:text-black focus:rounded-lg focus:shadow-lg"
    >
      Skip to main content
    </a>
  );
}

// ============================================
// ARIA UTILITIES
// ============================================

/**
 * Generate unique IDs for ARIA attributes
 */
export function useAriaId(prefix = 'aria') {
  const idRef = useRef(`${prefix}-${Math.random().toString(36).substr(2, 9)}`);
  return idRef.current;
}

/**
 * ARIA live region hook
 */
export function useAriaLive(message, priority = 'polite') {
  const [liveMessage, setLiveMessage] = useState('');

  useEffect(() => {
    if (message) {
      setLiveMessage(message);
      const timer = setTimeout(() => setLiveMessage(''), 1000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return {
    'role': 'status',
    'aria-live': priority,
    'aria-atomic': 'true',
    children: liveMessage,
  };
}

// ============================================
// KEYBOARD NAVIGATION
// ============================================

/**
 * Roving tabindex for keyboard navigation
 * Used in lists, menus, and toolbars
 */
export function useRovingTabIndex(itemsCount) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleKeyDown = useCallback((e, index) => {
    let newIndex = currentIndex;

    switch (e.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        e.preventDefault();
        newIndex = (currentIndex + 1) % itemsCount;
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        e.preventDefault();
        newIndex = (currentIndex - 1 + itemsCount) % itemsCount;
        break;
      case 'Home':
        e.preventDefault();
        newIndex = 0;
        break;
      case 'End':
        e.preventDefault();
        newIndex = itemsCount - 1;
        break;
    }

    if (newIndex !== currentIndex) {
      setCurrentIndex(newIndex);
    }
  }, [currentIndex, itemsCount]);

  const getTabIndex = useCallback((index) => {
    return index === currentIndex ? 0 : -1;
  }, [currentIndex]);

  return { handleKeyDown, getTabIndex, currentIndex, setCurrentIndex };
}

// ============================================
// HIGH CONTRAST MODE DETECTION
// ============================================

/**
 * Detect if user prefers high contrast
 */
export function useHighContrast() {
  const [isHighContrast, setIsHighContrast] = useState(false);

  useEffect(() => {
    const checkHighContrast = () => {
      // Check for Windows high contrast mode
      const isHighContrastMode = window.matchMedia('(prefers-contrast: high)').matches;
      setIsHighContrast(isHighContrastMode);
    };

    checkHighContrast();

    // Listen for changes
    const mediaQuery = window.matchMedia('(prefers-contrast: high)');
    const handler = () => checkHighContrast();
    
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return isHighContrast;
}

// ============================================
// REDUCED MOTION DETECTION
// ============================================

/**
 * Detect if user prefers reduced motion
 */
export function useReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = () => setPrefersReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
}

// ============================================
// ACCESSIBLE FORM UTILITIES
// ============================================

/**
 * Form field with built-in accessibility
 */
export function useAccessibleField(fieldId) {
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;

  const getFieldProps = (hasError, hasDescription) => ({
    id: fieldId,
    'aria-invalid': hasError ? 'true' : 'false',
    'aria-describedby': [
      hasError && errorId,
      hasDescription && descriptionId,
    ].filter(Boolean).join(' ') || undefined,
  });

  const getErrorProps = () => ({
    id: errorId,
    role: 'alert',
    'aria-live': 'polite',
  });

  const getDescriptionProps = () => ({
    id: descriptionId,
  });

  return { getFieldProps, getErrorProps, getDescriptionProps };
}

// ============================================
// VISUALLY HIDDEN UTILITY
// ============================================

/**
 * Screen reader only text
 */
export function VisuallyHidden({ children, as: Component = 'span', ...props }) {
  return (
    <Component
      {...props}
      style={{
        position: 'absolute',
        width: '1px',
        height: '1px',
        padding: 0,
        margin: '-1px',
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
      }}
    >
      {children}
    </Component>
  );
}

// ============================================
// ACCESSIBLE ICON BUTTON
// ============================================

/**
 * Icon button with proper label
 */
export function AccessibleIconButton({ 
  icon: Icon, 
  label, 
  onClick, 
  className = '',
  ...props 
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={className}
      {...props}
    >
      <Icon aria-hidden="true" />
      <VisuallyHidden>{label}</VisuallyHidden>
    </button>
  );
}

// ============================================
// EXPORTS
// ============================================

export default {
  useScreenReader,
  useFocusTrap,
  useFocusReturn,
  useFocusManager,
  useAriaId,
  useAriaLive,
  useRovingTabIndex,
  useHighContrast,
  useReducedMotion,
  useAccessibleField,
  SkipLink,
  VisuallyHidden,
  AccessibleIconButton,
};

