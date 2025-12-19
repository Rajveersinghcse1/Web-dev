/**
 * 📡 OFFLINE INDICATOR
 * 
 * Visual indicator for offline/online status:
 * - Real-time connection monitoring
 * - Toast notifications
 * - Reconnection detection
 * - Smooth animations
 */

'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WifiOff, Wifi, AlertCircle } from 'lucide-react';
import { useOfflineStatus } from '@/lib/pwaUtils';
import { useScreenReader } from '@/lib/accessibilityUtils';

export default function OfflineIndicator() {
  const { isOffline, wasOffline } = useOfflineStatus();
  const [showReconnected, setShowReconnected] = useState(false);
  const { announce } = useScreenReader();

  // Announce status changes to screen readers
  useEffect(() => {
    if (isOffline) {
      announce('You are currently offline. Some features may be limited.', 'polite');
    } else if (wasOffline) {
      announce('Connection restored. You are back online.', 'polite');
      setShowReconnected(true);
      
      // Hide reconnected message after 3 seconds
      const timer = setTimeout(() => {
        setShowReconnected(false);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [isOffline, wasOffline, announce]);

  return (
    <>
      {/* Offline Banner */}
      <AnimatePresence>
        {isOffline && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="fixed top-0 left-0 right-0 z-50 bg-yellow-500/20 border-b border-yellow-500/30 backdrop-blur-xl text-yellow-900 py-2 px-4 shadow-lg"
            role="alert"
            aria-live="assertive"
          >
            <div className="container mx-auto flex items-center justify-center gap-2">
              <WifiOff className="w-5 h-5" />
              <span className="font-medium">You're offline</span>
              <span className="hidden md:inline text-sm opacity-90">
                - Some features may be limited
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reconnected Toast */}
      <AnimatePresence>
        {showReconnected && !isOffline && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 50 }}
            className="fixed bottom-4 right-4 z-50 bg-emerald-500/20 border border-emerald-500/30 backdrop-blur-xl text-emerald-300 px-4 py-3 rounded-xl shadow-lg flex items-center gap-3"
            role="status"
            aria-live="polite"
          >
            <div className="p-1.5 bg-emerald-500/20 rounded-lg">
              <Wifi className="w-5 h-5" />
            </div>
            <div>
              <div className="font-semibold">Back Online</div>
              <div className="text-sm opacity-90">Connection restored</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// Compact status indicator for nav/header
export function ConnectionStatus() {
  const { isOffline } = useOfflineStatus();

  if (!isOffline) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-2 py-1 bg-yellow-500/10 border border-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium">
      <WifiOff className="w-3 h-3" />
      <span>Offline</span>
    </div>
  );
}
