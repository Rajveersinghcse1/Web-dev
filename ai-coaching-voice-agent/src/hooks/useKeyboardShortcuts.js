/**
 * 🎹 KEYBOARD SHORTCUTS HOOK
 * 
 * Comprehensive keyboard shortcut system with:
 * - Global shortcuts (accessible anywhere)
 * - Context-aware shortcuts (page-specific)
 * - Command palette integration
 * - Visual feedback
 * - Customizable bindings
 * 
 * Usage:
 * ```jsx
 * const { registerShortcut, unregisterShortcut } = useKeyboardShortcuts();
 * 
 * useEffect(() => {
 *   registerShortcut('ctrl+k', () => console.log('Command palette'));
 *   return () => unregisterShortcut('ctrl+k');
 * }, []);
 * ```
 */

'use client';

import { useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUIStore } from '@/store';

// Keyboard shortcut definitions
export const SHORTCUTS = {
  // Navigation shortcuts
  DASHBOARD: { key: 'ctrl+h', label: 'Go to Dashboard', action: 'navigate', target: '/dashboard' },
  NEW_SESSION: { key: 'ctrl+n', label: 'New Session', action: 'navigate', target: '/dashboard' },
  HISTORY: { key: 'ctrl+shift+h', label: 'View History', action: 'custom', target: 'toggleHistory' },
  
  // UI shortcuts
  COMMAND_PALETTE: { key: 'ctrl+k', label: 'Open Command Palette', action: 'modal', target: 'commandPalette' },
  SEARCH: { key: 'ctrl+/', label: 'Focus Search', action: 'custom', target: 'focusSearch' },
  THEME_TOGGLE: { key: 'ctrl+shift+t', label: 'Toggle Theme', action: 'custom', target: 'toggleTheme' },
  
  // Session shortcuts
  START_SESSION: { key: 'ctrl+enter', label: 'Start Session', action: 'custom', target: 'startSession' },
  END_SESSION: { key: 'ctrl+shift+e', label: 'End Session', action: 'custom', target: 'endSession' },
  MUTE_TOGGLE: { key: 'ctrl+m', label: 'Toggle Mute', action: 'custom', target: 'toggleMute' },
  
  // Data shortcuts
  EXPORT_DATA: { key: 'ctrl+shift+d', label: 'Export Data', action: 'custom', target: 'exportData' },
  REFRESH: { key: 'ctrl+r', label: 'Refresh Data', action: 'custom', target: 'refresh' },
  
  // Accessibility
  SKIP_TO_CONTENT: { key: 'ctrl+shift+s', label: 'Skip to Main Content', action: 'custom', target: 'skipToContent' },
  HELP: { key: 'ctrl+shift+?', label: 'Show Help', action: 'modal', target: 'help' },
};

// Normalize keyboard event to shortcut string
const normalizeShortcut = (event) => {
  const keys = [];
  
  if (event.ctrlKey || event.metaKey) keys.push('ctrl');
  if (event.altKey) keys.push('alt');
  if (event.shiftKey) keys.push('shift');
  
  const key = event.key.toLowerCase();
  if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
    keys.push(key === ' ' ? 'space' : key);
  }
  
  return keys.join('+');
};

// Check if element is editable
const isEditableElement = (element) => {
  const tagName = element.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    element.isContentEditable
  );
};

export function useKeyboardShortcuts(options = {}) {
  const {
    enabled = true,
    context = 'global', // 'global', 'dashboard', 'session'
    disableInInputs = true,
  } = options;
  
  const router = useRouter();
  const { openModal, closeModal } = useUIStore();
  const shortcutsRef = useRef(new Map());
  const actionsRef = useRef({});

  // Register custom action handlers
  const registerAction = useCallback((actionName, handler) => {
    actionsRef.current[actionName] = handler;
  }, []);

  // Unregister action handler
  const unregisterAction = useCallback((actionName) => {
    delete actionsRef.current[actionName];
  }, []);

  // Register a keyboard shortcut
  const registerShortcut = useCallback((shortcut, handler, options = {}) => {
    shortcutsRef.current.set(shortcut, {
      handler,
      context: options.context || 'global',
      description: options.description || '',
      preventDefault: options.preventDefault !== false,
    });
  }, []);

  // Unregister a keyboard shortcut
  const unregisterShortcut = useCallback((shortcut) => {
    shortcutsRef.current.delete(shortcut);
  }, []);

  // Handle shortcut execution
  const executeShortcut = useCallback((shortcut, event) => {
    const config = SHORTCUTS[Object.keys(SHORTCUTS).find(
      key => SHORTCUTS[key].key === shortcut
    )];
    
    if (!config) {
      // Check custom shortcuts
      const customShortcut = shortcutsRef.current.get(shortcut);
      if (customShortcut) {
        if (customShortcut.preventDefault) {
          event.preventDefault();
        }
        customShortcut.handler(event);
      }
      return;
    }

    event.preventDefault();

    // Execute based on action type
    switch (config.action) {
      case 'navigate':
        router.push(config.target);
        break;
        
      case 'modal':
        openModal(config.target);
        break;
        
      case 'custom':
        // Execute registered action handler
        const handler = actionsRef.current[config.target];
        if (handler) {
          handler(event);
        } else {
          console.warn(`No handler registered for action: ${config.target}`);
        }
        break;
        
      default:
        console.warn(`Unknown action type: ${config.action}`);
    }
  }, [router, openModal]);

  // Keyboard event handler
  const handleKeyDown = useCallback((event) => {
    if (!enabled) return;

    // Skip if in editable element (unless explicitly allowed)
    if (disableInInputs && isEditableElement(event.target)) {
      // Allow some shortcuts even in inputs (like Ctrl+K for command palette)
      const shortcut = normalizeShortcut(event);
      if (shortcut !== 'ctrl+k' && shortcut !== 'ctrl+/') {
        return;
      }
    }

    const shortcut = normalizeShortcut(event);
    
    // Check if shortcut is registered
    const customShortcut = shortcutsRef.current.get(shortcut);
    const globalShortcut = Object.values(SHORTCUTS).find(s => s.key === shortcut);
    
    if (customShortcut || globalShortcut) {
      executeShortcut(shortcut, event);
    }
  }, [enabled, disableInInputs, executeShortcut]);

  // Setup global keyboard listener
  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, handleKeyDown]);

  // Get all available shortcuts for current context
  const getAvailableShortcuts = useCallback(() => {
    const shortcuts = [];
    
    // Add global shortcuts
    Object.entries(SHORTCUTS).forEach(([key, config]) => {
      shortcuts.push({
        key,
        ...config,
      });
    });
    
    // Add custom shortcuts
    shortcutsRef.current.forEach((config, shortcut) => {
      if (config.context === 'global' || config.context === context) {
        shortcuts.push({
          key: shortcut,
          label: config.description,
          action: 'custom',
        });
      }
    });
    
    return shortcuts;
  }, [context]);

  return {
    registerShortcut,
    unregisterShortcut,
    registerAction,
    unregisterAction,
    getAvailableShortcuts,
    SHORTCUTS,
  };
}

// Hook for showing keyboard shortcut hints
export function useShortcutHints() {
  const { getAvailableShortcuts } = useKeyboardShortcuts();
  
  const getHintForAction = useCallback((actionName) => {
    const shortcuts = getAvailableShortcuts();
    const shortcut = shortcuts.find(s => s.target === actionName);
    return shortcut?.key || null;
  }, [getAvailableShortcuts]);
  
  const formatShortcut = useCallback((shortcut) => {
    if (!shortcut) return '';
    
    return shortcut
      .split('+')
      .map(key => {
        switch (key) {
          case 'ctrl': return '⌃';
          case 'alt': return '⌥';
          case 'shift': return '⇧';
          case 'enter': return '↵';
          default: return key.toUpperCase();
        }
      })
      .join('');
  }, []);
  
  return {
    getHintForAction,
    formatShortcut,
  };
}

// Custom hook for session-specific shortcuts
export function useSessionShortcuts(handlers = {}) {
  const { registerAction, unregisterAction } = useKeyboardShortcuts();
  
  useEffect(() => {
    // Register session-specific handlers
    if (handlers.startSession) registerAction('startSession', handlers.startSession);
    if (handlers.endSession) registerAction('endSession', handlers.endSession);
    if (handlers.toggleMute) registerAction('toggleMute', handlers.toggleMute);
    
    return () => {
      unregisterAction('startSession');
      unregisterAction('endSession');
      unregisterAction('toggleMute');
    };
  }, [registerAction, unregisterAction, handlers]);
}
