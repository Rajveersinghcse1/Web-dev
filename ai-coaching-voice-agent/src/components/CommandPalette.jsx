/**
 * 🎯 COMMAND PALETTE
 * 
 * Spotlight-style command palette for quick actions:
 * - Fuzzy search for commands
 * - Keyboard navigation
 * - Recent commands
 * - Quick session launch
 * - Navigation shortcuts
 * - Theme switching
 * 
 * Trigger: Ctrl+K or Cmd+K
 */

'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Search, Home, MessageSquare, BarChart3, Award, 
  Moon, Sun, Download, Settings, HelpCircle,
  Zap, Clock, TrendingUp, Users, FileText,
  ArrowRight, Command, X
} from 'lucide-react';
import { useUIStore, useProgressStore, useAnalyticsStore } from '@/store';
import { useTheme } from 'next-themes';

// Command definitions
const COMMANDS = [
  // Navigation
  { id: 'nav-dashboard', label: 'Go to Dashboard', icon: Home, action: 'navigate', target: '/dashboard', category: 'Navigation', keywords: ['home', 'main'] },
  { id: 'nav-history', label: 'View Session History', icon: Clock, action: 'navigate', target: '/dashboard?tab=history', category: 'Navigation', keywords: ['past', 'previous'] },
  { id: 'nav-achievements', label: 'View Achievements', icon: Award, action: 'navigate', target: '/dashboard?tab=achievements', category: 'Navigation', keywords: ['badges', 'rewards'] },
  { id: 'nav-analytics', label: 'View Analytics', icon: BarChart3, action: 'navigate', target: '/dashboard?tab=analytics', category: 'Navigation', keywords: ['stats', 'charts'] },
  
  // Quick Actions
  { id: 'action-new-session', label: 'Start New Session', icon: Zap, action: 'custom', target: 'newSession', category: 'Actions', keywords: ['begin', 'create', 'launch'] },
  { id: 'action-export', label: 'Export Session Data', icon: Download, action: 'custom', target: 'exportData', category: 'Actions', keywords: ['download', 'save'] },
  { id: 'action-refresh', label: 'Refresh Dashboard', icon: TrendingUp, action: 'custom', target: 'refresh', category: 'Actions', keywords: ['reload', 'update'] },
  
  // Theme
  { id: 'theme-light', label: 'Switch to Light Theme', icon: Sun, action: 'theme', target: 'light', category: 'Appearance', keywords: ['bright', 'day'] },
  { id: 'theme-dark', label: 'Switch to Dark Theme', icon: Moon, action: 'theme', target: 'dark', category: 'Appearance', keywords: ['night', 'black'] },
  { id: 'theme-system', label: 'Use System Theme', icon: Settings, action: 'theme', target: 'system', category: 'Appearance', keywords: ['auto', 'default'] },
  
  // Help
  { id: 'help-shortcuts', label: 'View Keyboard Shortcuts', icon: Command, action: 'modal', target: 'shortcuts', category: 'Help', keywords: ['keys', 'hotkeys'] },
  { id: 'help-guide', label: 'Show Getting Started', icon: HelpCircle, action: 'modal', target: 'guide', category: 'Help', keywords: ['tutorial', 'intro'] },
  { id: 'help-docs', label: 'View Documentation', icon: FileText, action: 'navigate', target: '/docs', category: 'Help', keywords: ['manual', 'reference'] },
];

// Session preset commands (dynamically added)
const SESSION_PRESETS = [
  { id: 'session-lecture', label: 'Quick Lecture Session', topic: 'Artificial Intelligence', expert: 'AI Expert', mode: 'lecture' },
  { id: 'session-interview', label: 'Quick Interview Practice', topic: 'System Design', expert: 'Senior Engineer', mode: 'interview' },
  { id: 'session-debate', label: 'Quick Debate Session', topic: 'Technology Ethics', expert: 'Ethicist', mode: 'debate' },
];

export default function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentCommands, setRecentCommands] = useState([]);
  
  const inputRef = useRef(null);
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { openModal, closeModal } = useUIStore();

  // Fuzzy search filtering
  const filteredCommands = useMemo(() => {
    if (!query.trim()) {
      // Show recent commands first, then all commands
      const recent = COMMANDS.filter(cmd => recentCommands.includes(cmd.id));
      const others = COMMANDS.filter(cmd => !recentCommands.includes(cmd.id));
      return [...recent, ...others].slice(0, 8);
    }

    const searchTerms = query.toLowerCase().split(' ');
    
    return COMMANDS
      .map(cmd => {
        const searchText = `${cmd.label} ${cmd.category} ${cmd.keywords?.join(' ')}`.toLowerCase();
        
        // Calculate match score
        let score = 0;
        searchTerms.forEach(term => {
          if (searchText.includes(term)) {
            score += term.length;
            // Bonus for label match
            if (cmd.label.toLowerCase().includes(term)) score += 10;
          }
        });
        
        return { ...cmd, score };
      })
      .filter(cmd => cmd.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 8);
  }, [query, recentCommands]);

  // Open/close handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ctrl+K or Cmd+K to open
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen(true);
      }
      
      // Escape to close
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev < filteredCommands.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => 
        prev > 0 ? prev - 1 : filteredCommands.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredCommands[selectedIndex]) {
        executeCommand(filteredCommands[selectedIndex]);
      }
    }
  };

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Execute command
  const executeCommand = (command) => {
    // Add to recent commands
    setRecentCommands(prev => {
      const updated = [command.id, ...prev.filter(id => id !== command.id)];
      return updated.slice(0, 5); // Keep last 5
    });

    // Execute action
    switch (command.action) {
      case 'navigate':
        router.push(command.target);
        break;
        
      case 'theme':
        setTheme(command.target);
        break;
        
      case 'modal':
        openModal(command.target);
        break;
        
      case 'custom':
        handleCustomAction(command.target);
        break;
    }

    // Close palette
    setIsOpen(false);
    setQuery('');
  };

  // Handle custom actions
  const handleCustomAction = (action) => {
    switch (action) {
      case 'newSession':
        router.push('/dashboard');
        // Could trigger new session modal here
        break;
        
      case 'exportData':
        // Trigger export functionality
        const data = {
          achievements: useProgressStore.getState(),
          sessions: useAnalyticsStore.getState().sessionHistory,
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `coaching-data-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        break;
        
      case 'refresh':
        window.location.reload();
        break;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] px-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsOpen(false)}
          className="absolute inset-0 bg-white backdrop-blur-sm"
        />

        {/* Command Palette */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          className="relative w-full max-w-2xl bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-300 overflow-hidden"
        >
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-300">
            <Search className="w-5 h-5 text-gray-700" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type a command or search..."
              className="flex-1 bg-transparent outline-none text-lg text-black placeholder-gray-400"
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-700" />
            </button>
          </div>

          {/* Commands List */}
          <div className="max-h-[400px] overflow-y-auto">
            {filteredCommands.length === 0 ? (
              <div className="px-4 py-8 text-center text-gray-700">
                No commands found for "{query}"
              </div>
            ) : (
              <div className="py-2">
                {filteredCommands.map((command, index) => {
                  const Icon = command.icon;
                  const isSelected = index === selectedIndex;
                  const isRecent = recentCommands.includes(command.id);

                  return (
                    <motion.button
                      key={command.id}
                      onClick={() => executeCommand(command)}
                      onMouseEnter={() => setSelectedIndex(index)}
                      className={`
                        w-full flex items-center gap-3 px-4 py-3 transition-colors text-left
                        ${isSelected 
                          ? 'bg-violet-500/20 border-l-2 border-violet-500' 
                          : 'hover:bg-white border-l-2 border-transparent'
                        }
                      `}
                      whileHover={{ x: 2 }}
                    >
                      {/* Icon */}
                      <div className={`
                        p-2 rounded-lg
                        ${isSelected 
                          ? 'bg-violet-500/20 text-violet-400' 
                          : 'bg-white text-gray-700'
                        }
                      `}>
                        <Icon className="w-4 h-4" />
                      </div>

                      {/* Label & Category */}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-black truncate">
                          {command.label}
                        </div>
                        <div className="text-sm text-gray-700">
                          {command.category}
                          {isRecent && ' • Recent'}
                        </div>
                      </div>

                      {/* Arrow */}
                      {isSelected && (
                        <ArrowRight className="w-4 h-4 text-violet-400" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer Hint */}
          <div className="px-4 py-3 bg-white border-t border-gray-300">
            <div className="flex items-center justify-between text-xs text-gray-700">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300">↑↓</kbd>
                  Navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300">↵</kbd>
                  Select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300">Esc</kbd>
                  Close
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Command className="w-3 h-3" />
                <span>+K to open</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Hook to control command palette from anywhere
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return { isOpen, open, close, toggle };
}

