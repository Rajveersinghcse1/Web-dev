/**
 * ⌨️ SHORTCUTS HELPER
 * 
 * Visual keyboard shortcuts overlay with:
 * - All available shortcuts displayed
 * - Category grouping
 * - Search/filter shortcuts
 * - Customization options
 * - Print reference sheet
 * 
 * Trigger: Ctrl+Shift+? or from help menu
 * Modernized with glassmorphism and advanced animations
 */

'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Keyboard, X, Search, Home, Zap, Moon, Clock,
  Command, Navigation, Eye, FileText, HelpCircle
} from 'lucide-react';
import { SHORTCUTS } from '@/hooks/useKeyboardShortcuts';

const SHORTCUT_CATEGORIES = {
  navigation: { label: 'Navigation', icon: Navigation, shortcuts: [] },
  ui: { label: 'UI Controls', icon: Eye, shortcuts: [] },
  session: { label: 'Session', icon: Clock, shortcuts: [] },
  data: { label: 'Data & Export', icon: FileText, shortcuts: [] },
  accessibility: { label: 'Accessibility', icon: HelpCircle, shortcuts: [] },
};

export default function ShortcutsHelper({ isOpen, onClose }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Organize shortcuts by category
  const categorizedShortcuts = useMemo(() => {
    const categories = { ...SHORTCUT_CATEGORIES };
    
    Object.entries(SHORTCUTS).forEach(([key, shortcut]) => {
      // Determine category based on shortcut key/label
      let category = 'ui';
      if (key.includes('NAV') || shortcut.label.includes('Go to')) {
        category = 'navigation';
      } else if (key.includes('SESSION') || key.includes('MUTE')) {
        category = 'session';
      } else if (key.includes('EXPORT') || key.includes('REFRESH')) {
        category = 'data';
      } else if (key.includes('SKIP') || key.includes('HELP')) {
        category = 'accessibility';
      }
      
      if (categories[category]) {
        categories[category].shortcuts.push({
          id: key,
          ...shortcut,
        });
      }
    });
    
    return categories;
  }, []);

  // Filter shortcuts
  const filteredShortcuts = useMemo(() => {
    let shortcuts = [];
    
    if (selectedCategory === 'all') {
      Object.values(categorizedShortcuts).forEach(cat => {
        shortcuts.push(...cat.shortcuts);
      });
    } else {
      shortcuts = categorizedShortcuts[selectedCategory]?.shortcuts || [];
    }
    
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      shortcuts = shortcuts.filter(s => 
        s.label.toLowerCase().includes(query) ||
        s.key.toLowerCase().includes(query)
      );
    }
    
    return shortcuts;
  }, [categorizedShortcuts, selectedCategory, searchQuery]);

  // Format keyboard shortcut for display
  const formatKey = (key) => {
    return key.split('+').map(k => {
      switch (k) {
        case 'ctrl': return '⌃';
        case 'alt': return '⌥';
        case 'shift': return '⇧';
        case 'enter': return '↵';
        default: return k.toUpperCase();
      }
    });
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-white backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl max-h-[85vh] bg-white border border-gray-300 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-300 bg-white">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-violet-500/20 rounded-xl border border-violet-500/30">
                <Keyboard className="w-6 h-6 text-violet-400" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-black">
                  Keyboard Shortcuts
                </h2>
                <p className="text-sm text-gray-800 mt-1">
                  Navigate faster with keyboard shortcuts
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl transition-colors text-gray-800 hover:text-black"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search & Filters */}
          <div className="p-6 space-y-4 border-b border-gray-300 bg-white">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-700" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shortcuts..."
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
              />
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors border ${
                  selectedCategory === 'all'
                    ? 'bg-violet-600 text-black border-violet-500'
                    : 'bg-white text-gray-800 border-gray-300 hover:text-black'
                }`}
              >
                All Shortcuts
              </button>
              {Object.entries(categorizedShortcuts).map(([key, category]) => {
                const Icon = category.icon;
                return (
                  <button
                    key={key}
                    onClick={() => setSelectedCategory(key)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors border ${
                      selectedCategory === key
                        ? 'bg-violet-600 text-black border-violet-500'
                        : 'bg-white text-gray-800 border-gray-300 hover:text-black'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{category.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Shortcuts List */}
          <div className="flex-1 overflow-y-auto p-6 bg-white">
            {filteredShortcuts.length === 0 ? (
              <div className="text-center py-12">
                <Keyboard className="w-16 h-16 text-black/10 mx-auto mb-4" />
                <p className="text-gray-700">
                  No shortcuts found
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredShortcuts.map((shortcut) => (
                  <motion.div
                    key={shortcut.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-300 hover:border-violet-500/30 transition-colors"
                  >
                    <span className="text-sm font-medium text-black/90">
                      {shortcut.label}
                    </span>
                    <div className="flex items-center gap-1">
                      {formatKey(shortcut.key).map((key, i) => (
                        <div key={i} className="flex items-center">
                          <kbd className="px-2 py-1 bg-white border border-gray-300 rounded-lg text-xs font-mono font-semibold text-black shadow-sm min-w-6 text-center">
                            {key}
                          </kbd>
                          {i < formatKey(shortcut.key).length - 1 && (
                            <span className="mx-1 text-gray-400">+</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-white border-t border-gray-300">
            <div className="flex items-center justify-between text-xs text-gray-700">
              <span>Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded border border-gray-300 text-gray-800">Ctrl+Shift+?</kbd> to toggle this dialog</span>
              <span>{filteredShortcuts.length} shortcuts</span>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

// Hook to control shortcuts helper
export function useShortcutsHelper() {
  const [isOpen, setIsOpen] = useState(false);

  const open = () => setIsOpen(true);
  const close = () => setIsOpen(false);
  const toggle = () => setIsOpen(prev => !prev);

  return { isOpen, open, close, toggle };
}


