/**
 * Session Control Component
 * 
 * Provides centralized session management UI
 * Shows session status, timer, and controls
 */

"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, X, AlertTriangle, CheckCircle, Loader2 
} from 'lucide-react';
import sessionManager, { SessionState } from '@/lib/sessionManager';

export function SessionStatusBadge({ sessionId, status, type }) {
  const getStatusColor = () => {
    switch (status) {
      case SessionState.IDLE:
        return 'bg-gray-500';
      case SessionState.INITIALIZING:
        return 'bg-yellow-500 animate-pulse';
      case SessionState.ACTIVE:
        return 'bg-green-500';
      case SessionState.TERMINATING:
        return 'bg-orange-500 animate-pulse';
      case SessionState.DESTROYED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case SessionState.IDLE:
        return 'No Session';
      case SessionState.INITIALIZING:
        return 'Initializing...';
      case SessionState.ACTIVE:
        return 'Active';
      case SessionState.TERMINATING:
        return 'Ending...';
      case SessionState.DESTROYED:
        return 'Ended';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="flex items-center gap-2 text-sm">
      <div className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
      <span className="font-medium text-gray-700 dark:text-gray-300">
        {getStatusText()}
      </span>
      {sessionId && (
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ID: {sessionId.slice(-6)}
        </span>
      )}
    </div>
  );
}

export function SessionTimer({ startTime }) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startTime) return;

    const interval = setInterval(() => {
      setElapsed(Date.now() - startTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [startTime]);

  const formatTime = (ms) => {
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / (1000 * 60)) % 60);
    const hours = Math.floor(ms / (1000 * 60 * 60));

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
      <Clock className="w-4 h-4" />
      <span className="font-mono">{formatTime(elapsed)}</span>
    </div>
  );
}

export function EndSessionButton({ 
  sessionId, 
  onEnd, 
  confirmMessage = 'Are you sure you want to end this session? Unsaved data will be lost.',
  className = '',
  variant = 'danger'
}) {
  const [isEnding, setIsEnding] = useState(false);

  const handleEnd = async () => {
    if (!sessionId) {
      console.warn('[SessionControl] No session ID provided');
      return;
    }

    // Get current session
    const currentSession = sessionManager.getCurrentSession();
    if (!currentSession || currentSession.id !== sessionId) {
      console.error('[SessionControl] Session ID mismatch or no active session');
      onEnd?.('no_session');
      return;
    }

    // Confirm before ending
    const confirmed = window.confirm(confirmMessage);
    if (!confirmed) {
      return;
    }

    setIsEnding(true);

    try {
      // End session through session manager
      const ended = sessionManager.endSession(sessionId, 'user_requested');
      
      if (ended) {
        console.log('[SessionControl] Session ended successfully');
        onEnd?.('success', sessionId);
      } else {
        console.error('[SessionControl] Failed to end session');
        onEnd?.('error', sessionId);
      }
    } catch (error) {
      console.error('[SessionControl] Error ending session:', error);
      onEnd?.('error', sessionId);
    } finally {
      setIsEnding(false);
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'danger':
        return 'bg-red-600 hover:bg-red-700 text-white';
      case 'warning':
        return 'bg-orange-500 hover:bg-orange-600 text-white';
      case 'default':
        return 'bg-gray-600 hover:bg-gray-700 text-white';
      default:
        return 'bg-red-600 hover:bg-red-700 text-white';
    }
  };

  return (
    <button
      onClick={handleEnd}
      disabled={isEnding || !sessionId}
      className={`
        px-4 py-2 rounded-lg font-medium transition-all 
        flex items-center gap-2 
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getVariantClasses()}
        ${className}
      `}
    >
      {isEnding ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Ending...
        </>
      ) : (
        <>
          <X className="w-4 h-4" />
          End Session
        </>
      )}
    </button>
  );
}

export function SessionInfoPanel({ session }) {
  if (!session) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
        <p className="text-sm text-gray-500 dark:text-gray-400">No active session</p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg p-4 border border-purple-200 dark:border-purple-800"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <SessionStatusBadge 
            sessionId={session.id}
            status={session.status}
            type={session.type}
          />
          <SessionTimer startTime={session.startTime} />
        </div>
        {session.status === SessionState.ACTIVE && (
          <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
            <CheckCircle className="w-4 h-4" />
            <span>Recording</span>
          </div>
        )}
      </div>

      <div className="text-sm text-gray-600 dark:text-gray-400">
        <p className="font-medium mb-1">Session Type: {session.type}</p>
        {session.config && (
          <div className="text-xs space-y-1 mt-2">
            {Object.entries(session.config).slice(0, 3).map(([key, value]) => (
              <p key={key}>
                <span className="text-gray-500">{key}:</span>{' '}
                <span className="text-gray-700 dark:text-gray-300">{value}</span>
              </p>
            ))}
          </div>
        )}
      </div>

      {session.metadata?.errorLog?.length > 0 && (
        <div className="mt-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded p-2">
          <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span className="font-medium">
              {session.metadata.errorLog.length} error(s) logged
            </span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default {
  SessionStatusBadge,
  SessionTimer,
  EndSessionButton,
  SessionInfoPanel
};
