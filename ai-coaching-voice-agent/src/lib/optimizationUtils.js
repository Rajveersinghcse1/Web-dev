/**
 * ⚡ OPTIMIZATION UTILITIES
 * 
 * Performance optimization helpers:
 * - Debounce & throttle
 * - Memoization utilities
 * - Lazy loading helpers
 * - Image optimization
 * - Virtual scrolling
 * - Bundle size optimization
 */

'use client';

import { useEffect, useRef, useCallback, useMemo, useState } from 'react';

// ============================================
// DEBOUNCE & THROTTLE
// ============================================

/**
 * Debounce a function call
 * Delays execution until after wait time has elapsed since last call
 */
export function useDebounce(value, delay = 500) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

/**
 * Debounced callback
 */
export function useDebouncedCallback(callback, delay = 500) {
  const timeoutRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  );
}

/**
 * Throttle a function call
 * Ensures function is called at most once per interval
 */
export function useThrottle(value, interval = 500) {
  const [throttledValue, setThrottledValue] = useState(value);
  const lastUpdated = useRef(Date.now());

  useEffect(() => {
    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdated.current;

    if (timeSinceLastUpdate >= interval) {
      setThrottledValue(value);
      lastUpdated.current = now;
    } else {
      const timeoutId = setTimeout(() => {
        setThrottledValue(value);
        lastUpdated.current = Date.now();
      }, interval - timeSinceLastUpdate);

      return () => clearTimeout(timeoutId);
    }
  }, [value, interval]);

  return throttledValue;
}

// ============================================
// INTERSECTION OBSERVER (Lazy Loading)
// ============================================

/**
 * Observe element visibility for lazy loading
 */
export function useIntersectionObserver(options = {}) {
  const {
    threshold = 0.1,
    root = null,
    rootMargin = '0px',
    freezeOnceVisible = false,
  } = options;

  const [entry, setEntry] = useState(null);
  const [node, setNode] = useState(null);
  const observer = useRef(null);

  const frozen = entry?.isIntersecting && freezeOnceVisible;

  useEffect(() => {
    if (!node || frozen) return;

    if (observer.current) observer.current.disconnect();

    observer.current = new IntersectionObserver(
      ([entry]) => setEntry(entry),
      { threshold, root, rootMargin }
    );

    observer.current.observe(node);

    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, [node, threshold, root, rootMargin, frozen]);

  return [setNode, entry];
}

/**
 * Lazy load component when visible
 */
export function useLazyLoad(ref, options = {}) {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef(null);

  useEffect(() => {
    if (!ref.current) return;

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.once) {
            observerRef.current?.disconnect();
          }
        }
      },
      {
        threshold: options.threshold || 0.1,
        rootMargin: options.rootMargin || '50px',
      }
    );

    observerRef.current.observe(ref.current);

    return () => observerRef.current?.disconnect();
  }, [ref, options.threshold, options.rootMargin, options.once]);

  return isVisible;
}

// ============================================
// MEMOIZATION
// ============================================

/**
 * Deep comparison memo
 */
export function useDeepMemo(factory, deps) {
  const ref = useRef({ deps: undefined, value: undefined });
  
  if (!ref.current.deps || !deepEqual(ref.current.deps, deps)) {
    ref.current.deps = deps;
    ref.current.value = factory();
  }
  
  return ref.current.value;
}

function deepEqual(a, b) {
  if (a === b) return true;
  if (a == null || b == null) return false;
  if (typeof a !== 'object' || typeof b !== 'object') return false;
  
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  
  if (keysA.length !== keysB.length) return false;
  
  return keysA.every(key => deepEqual(a[key], b[key]));
}

// ============================================
// PREVIOUS VALUE
// ============================================

/**
 * Store previous value
 */
export function usePrevious(value) {
  const ref = useRef();
  
  useEffect(() => {
    ref.current = value;
  }, [value]);
  
  return ref.current;
}

// ============================================
// MOUNTED STATE
// ============================================

/**
 * Track if component is mounted
 */
export function useIsMounted() {
  const isMounted = useRef(false);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  return useCallback(() => isMounted.current, []);
}

// ============================================
// MEDIA QUERY
// ============================================

/**
 * Responsive media query hook
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    
    const listener = () => setMatches(media.matches);
    media.addEventListener('change', listener);
    
    return () => media.removeEventListener('change', listener);
  }, [query, matches]);

  return matches;
}

// ============================================
// WINDOW SIZE
// ============================================

/**
 * Track window dimensions
 */
export function useWindowSize() {
  const [size, setSize] = useState({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  });

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

// ============================================
// LOCAL STORAGE
// ============================================

/**
 * Sync state with localStorage
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = useCallback(
    (value) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  return [storedValue, setValue];
}

// ============================================
// ASYNC OPERATIONS
// ============================================

/**
 * Handle async state
 */
export function useAsync(asyncFunction, immediate = true) {
  const [status, setStatus] = useState('idle');
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setStatus('pending');
      setValue(null);
      setError(null);

      try {
        const response = await asyncFunction(...args);
        setValue(response);
        setStatus('success');
        return response;
      } catch (error) {
        setError(error);
        setStatus('error');
        throw error;
      }
    },
    [asyncFunction]
  );

  useEffect(() => {
    if (immediate) {
      execute();
    }
  }, [execute, immediate]);

  return { execute, status, value, error };
}

// ============================================
// CLICK OUTSIDE
// ============================================

/**
 * Detect clicks outside element
 */
export function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };

    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);

    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

// ============================================
// COPY TO CLIPBOARD
// ============================================

/**
 * Copy text to clipboard
 */
export function useCopyToClipboard() {
  const [copiedText, setCopiedText] = useState(null);

  const copy = async (text) => {
    if (!navigator?.clipboard) {
      console.warn('Clipboard not supported');
      return false;
    }

    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(null), 2000);
      return true;
    } catch (error) {
      console.error('Copy failed:', error);
      setCopiedText(null);
      return false;
    }
  };

  return [copiedText, copy];
}

// ============================================
// EXPORTS
// ============================================

export default {
  useDebounce,
  useDebouncedCallback,
  useThrottle,
  useIntersectionObserver,
  useLazyLoad,
  useDeepMemo,
  usePrevious,
  useIsMounted,
  useMediaQuery,
  useWindowSize,
  useLocalStorage,
  useAsync,
  useClickOutside,
  useCopyToClipboard,
};
