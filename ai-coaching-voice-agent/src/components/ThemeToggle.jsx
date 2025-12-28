'use client';

import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Theme Toggle Button
 * Switch between light, dark, and system themes
 * Modernized with glassmorphism and advanced animations
 */

export default function ThemeToggle() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
    );
  }

  const themes = [
    { name: 'light', icon: Sun, label: 'Light' },
    { name: 'dark', icon: Moon, label: 'Dark' },
    { name: 'system', icon: Monitor, label: 'System' }
  ];

  const currentThemeIndex = themes.findIndex(t => t.name === theme);
  const nextIndex = (currentThemeIndex + 1) % themes.length;

  const cycleTheme = () => {
    setTheme(themes[nextIndex].name);
  };

  const CurrentIcon = themes[currentThemeIndex]?.icon || Sun;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={cycleTheme}
      className="relative p-2.5 rounded-xl bg-white backdrop-blur-md border border-gray-300 hover:border-gray-300 transition-all group overflow-hidden"
      aria-label={`Switch to ${themes[nextIndex].label} theme`}
      title={`Current: ${themes[currentThemeIndex]?.label} theme`}
    >
      <div className="absolute inset-0 bg-violet-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={theme}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.2 }}
          className="relative z-10"
        >
          <CurrentIcon className="w-5 h-5 text-black group-hover:text-violet-300 transition-colors" />
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}

