/**
 * 📱 PWA INSTALL PROMPT
 * 
 * Beautiful install prompt for Progressive Web App:
 * - Detects installability
 * - Platform-specific instructions
 * - Dismissible notification
 * - Persistent state
 * - Success celebration
 */

'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Chrome, Apple, Monitor } from 'lucide-react';
import { useInstallPrompt } from '@/lib/pwaUtils';
import { useLocalStorage } from '@/lib/optimizationUtils';

export default function InstallPrompt() {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();
  const [isDismissed, setIsDismissed] = useLocalStorage('pwa-install-dismissed', false);
  const [showPrompt, setShowPrompt] = useState(false);
  const [platform, setPlatform] = useState('desktop');

  // Detect platform
  useEffect(() => {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform('ios');
    } else if (/android/.test(userAgent)) {
      setPlatform('android');
    } else if (/chrome/.test(userAgent)) {
      setPlatform('chrome');
    } else {
      setPlatform('desktop');
    }
  }, []);

  // Show prompt after delay if installable and not dismissed
  useEffect(() => {
    if (isInstallable && !isDismissed && !isInstalled) {
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 10000); // Show after 10 seconds

      return () => clearTimeout(timer);
    }
  }, [isInstallable, isDismissed, isInstalled]);

  const handleInstall = async () => {
    const { outcome } = await promptInstall();
    
    if (outcome === 'accepted') {
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    setIsDismissed(true);
  };

  // Don't show if already installed or dismissed
  if (isInstalled || !showPrompt) {
    return null;
  }

  // Platform-specific icons
  const PlatformIcon = {
    ios: Apple,
    android: Smartphone,
    chrome: Chrome,
    desktop: Monitor,
  }[platform];

  // Platform-specific instructions
  const instructions = {
    ios: 'Tap the Share button and select "Add to Home Screen"',
    android: 'Tap "Install" to add this app to your home screen',
    chrome: 'Click "Install" to use this app offline',
    desktop: 'Install this app for quick access and offline use',
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50"
      >
        <div className="bg-white backdrop-blur-xl rounded-2xl shadow-2xl border border-gray-300 overflow-hidden">
          {/* Header */}
          <div className="bg-linear-to-r from-violet-600 to-pink-600 p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gray-200 backdrop-blur-sm rounded-xl">
                  <Download className="w-6 h-6 text-black" />
                </div>
                <div className="text-black">
                  <h3 className="font-bold text-lg">Install App</h3>
                  <p className="text-sm text-black/90">Access faster, work offline</p>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="p-1 rounded-lg transition-colors"
                aria-label="Dismiss install prompt"
              >
                <X className="w-5 h-5 text-black" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Platform info */}
            <div className="flex items-start gap-3">
              <div className="p-2 bg-white rounded-lg shrink-0 border border-gray-300">
                <PlatformIcon className="w-5 h-5 text-black" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  {instructions[platform]}
                </p>
              </div>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-violet-500/10 rounded-lg border border-violet-500/20">
                <div className="text-2xl mb-1">⚡</div>
                <div className="text-xs text-gray-800">Faster</div>
              </div>
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <div className="text-2xl mb-1">📴</div>
                <div className="text-xs text-gray-800">Offline</div>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                <div className="text-2xl mb-1">🔔</div>
                <div className="text-xs text-gray-800">Notifications</div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              {platform !== 'ios' && (
                <button
                  onClick={handleInstall}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-500 text-black rounded-xl font-semibold transition-colors shadow-lg shadow-violet-500/20"
                >
                  <Download className="w-4 h-4" />
                  Install Now
                </button>
              )}
              <button
                onClick={handleDismiss}
                className="px-4 py-3 bg-white text-black rounded-xl font-medium transition-colors border border-gray-300"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// Compact install button for header/nav
export function InstallButton() {
  const { isInstallable, isInstalled, promptInstall } = useInstallPrompt();

  if (!isInstallable || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    await promptInstall();
  };

  return (
    <button
      onClick={handleInstall}
      className="flex items-center gap-2 px-3 py-1.5 bg-violet-500/20 text-violet-300 rounded-lg hover:bg-violet-500/30 transition-colors text-sm font-medium border border-violet-500/30"
      aria-label="Install app"
    >
      <Download className="w-4 h-4" />
      <span>Install</span>
    </button>
  );
}


