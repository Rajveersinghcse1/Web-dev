import React, { createContext, useContext, useState, useCallback } from 'react';
import { useMode } from './ModeContext';
import { 
  CheckCircle, 
  AlertCircle, 
  XCircle, 
  Info, 
  X,
  AlertTriangle
} from 'lucide-react';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

const NOTIFICATION_TYPES = {
  success: {
    icon: CheckCircle,
    className: 'bg-green-500 text-white',
    borderClassName: 'border-green-600'
  },
  error: {
    icon: XCircle,
    className: 'bg-red-500 text-white',
    borderClassName: 'border-red-600'
  },
  warning: {
    icon: AlertTriangle,
    className: 'bg-yellow-500 text-white',
    borderClassName: 'border-yellow-600'
  },
  info: {
    icon: Info,
    className: 'bg-blue-500 text-white',
    borderClassName: 'border-blue-600'
  }
};

const NotificationItem = ({ notification, onRemove }) => {
  const { mode } = useMode();
  const typeConfig = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.info;
  const IconComponent = typeConfig.icon;

  return (
    <div
      className={`relative flex items-start space-x-3 p-4 rounded-lg shadow-lg border transition-all duration-300 transform hover:scale-105 ${
        mode === 'dark' 
          ? `bg-gray-800 border-gray-700 text-white` 
          : `bg-white border-gray-200 text-gray-900`
      } ${typeConfig.borderClassName}`}
      style={{
        animation: 'slideInRight 0.3s ease-out'
      }}
    >
      {/* Icon */}
      <div className={`flex-shrink-0 p-1 rounded-full ${typeConfig.className}`}>
        <IconComponent className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {notification.title && (
          <p className={`text-sm font-medium ${mode === 'dark' ? 'text-white' : 'text-gray-900'}`}>
            {notification.title}
          </p>
        )}
        <p className={`text-sm ${mode === 'dark' ? 'text-gray-300' : 'text-gray-600'} ${notification.title ? 'mt-1' : ''}`}>
          {notification.message}
        </p>
        {notification.details && (
          <div className={`mt-2 text-xs ${mode === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}>
            <details>
              <summary className="cursor-pointer">Show details</summary>
              <pre className="mt-1 whitespace-pre-wrap">{notification.details}</pre>
            </details>
          </div>
        )}
      </div>

      {/* Close Button */}
      <button
        onClick={() => onRemove(notification.id)}
        className={`flex-shrink-0 p-1 rounded-full transition-colors ${
          mode === 'dark' 
            ? 'text-gray-400 hover:text-white hover:bg-gray-700' 
            : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
        }`}
      >
        <X className="h-4 w-4" />
      </button>

      {/* Progress Bar (for auto-dismiss) */}
      {notification.duration && notification.duration > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-current opacity-30 transition-all duration-100"
          style={{
            width: `${((notification.duration - (Date.now() - notification.timestamp)) / notification.duration) * 100}%`
          }}
        />
      )}
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification = {
      id,
      timestamp: Date.now(),
      duration: notification.duration || 5000, // Default 5 seconds
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto-remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const removeAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = useCallback((message, options = {}) => {
    return addNotification({ ...options, message, type: 'success' });
  }, [addNotification]);

  const error = useCallback((message, options = {}) => {
    return addNotification({ ...options, message, type: 'error', duration: 8000 });
  }, [addNotification]);

  const warning = useCallback((message, options = {}) => {
    return addNotification({ ...options, message, type: 'warning', duration: 6000 });
  }, [addNotification]);

  const info = useCallback((message, options = {}) => {
    return addNotification({ ...options, message, type: 'info' });
  }, [addNotification]);

  const contextValue = {
    notifications,
    addNotification,
    removeNotification,
    removeAllNotifications,
    success,
    error,
    warning,
    info
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      
      {/* Notification Container */}
      <div className="fixed top-4 right-4 z-[9999] space-y-2 max-w-sm w-full pointer-events-none">
        {notifications.map(notification => (
          <div key={notification.id} className="pointer-events-auto">
            <NotificationItem
              notification={notification}
              onRemove={removeNotification}
            />
          </div>
        ))}
      </div>

      {/* Add CSS animation */}
      <style>{`
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
    </NotificationContext.Provider>
  );
};

export default NotificationContext;