import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bell, 
  BellOff, 
  Heart, 
  MessageCircle, 
  UserPlus, 
  Share2, 
  Trophy, 
  Target,
  X,
  Check,
  Clock,
  Filter,
  MoreHorizontal,
  Trash2,
  MarkAsUnread,
  Archive
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { useNotifications } from '../context/NotificationContext';

const NOTIFICATION_TYPES = {
  like: { icon: Heart, color: 'text-red-500', bgColor: 'bg-red-100' },
  comment: { icon: MessageCircle, color: 'text-blue-500', bgColor: 'bg-blue-100' },
  follow: { icon: UserPlus, color: 'text-green-500', bgColor: 'bg-green-100' },
  share: { icon: Share2, color: 'text-purple-500', bgColor: 'bg-purple-100' },
  achievement: { icon: Trophy, color: 'text-yellow-500', bgColor: 'bg-yellow-100' },
  quest: { icon: Target, color: 'text-indigo-500', bgColor: 'bg-indigo-100' },
};

const NotificationItem = ({ notification, onMarkAsRead, onDelete, onArchive }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showActions, setShowActions] = useState(false);
  
  const notificationType = NOTIFICATION_TYPES[notification.type] || NOTIFICATION_TYPES.like;
  const Icon = notificationType.icon;

  const formatTimeAgo = (date) => {
    const now = new Date();
    const notificationDate = new Date(date);
    const diffInMinutes = Math.floor((now - notificationDate) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return notificationDate.toLocaleDateString();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`relative p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors duration-200 ${
        !notification.read ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setShowActions(false);
      }}
    >
      <div className="flex items-start space-x-3">
        {/* Notification Icon */}
        <div className={`w-10 h-10 rounded-full ${notificationType.bgColor} flex items-center justify-center flex-shrink-0`}>
          <Icon className={`w-5 h-5 ${notificationType.color}`} />
        </div>

        {/* Notification Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              {/* User Avatar and Name */}
              {notification.fromUser && (
                <div className="flex items-center space-x-2 mb-1">
                  <img
                    src={notification.fromUser.avatar || '/default-avatar.png'}
                    alt={notification.fromUser.username}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <span className="font-medium text-gray-900 text-sm">
                    {notification.fromUser.username}
                  </span>
                  {notification.fromUser.verified && (
                    <Check className="w-3 h-3 text-blue-500" />
                  )}
                </div>
              )}

              {/* Notification Message */}
              <p className="text-gray-800 text-sm leading-relaxed">
                {notification.message}
              </p>

              {/* Post Preview (if applicable) */}
              {notification.postPreview && (
                <div className="mt-2 p-2 bg-gray-100 rounded-lg">
                  <p className="text-xs text-gray-600 line-clamp-2">
                    {notification.postPreview}
                  </p>
                </div>
              )}

              {/* Timestamp */}
              <div className="flex items-center space-x-2 mt-2">
                <Clock className="w-3 h-3 text-gray-400" />
                <span className="text-xs text-gray-500">
                  {formatTimeAgo(notification.createdAt)}
                </span>
                {!notification.read && (
                  <Badge variant="secondary" className="text-xs px-2 py-0">
                    New
                  </Badge>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-1">
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center space-x-1"
                >
                  {!notification.read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onMarkAsRead(notification._id)}
                      className="p-1 h-6 w-6"
                      title="Mark as read"
                    >
                      <Check className="w-3 h-3" />
                    </Button>
                  )}
                  
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowActions(!showActions)}
                    className="p-1 h-6 w-6"
                  >
                    <MoreHorizontal className="w-3 h-3" />
                  </Button>
                </motion.div>
              )}

              {/* Unread Indicator */}
              {!notification.read && !isHovered && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </div>
          </div>

          {/* Extended Actions Menu */}
          <AnimatePresence>
            {showActions && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-4 top-12 bg-white border border-gray-200 rounded-lg shadow-lg z-10 py-1"
              >
                {!notification.read && (
                  <button
                    onClick={() => onMarkAsRead(notification._id)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                  >
                    <Check className="w-3 h-3" />
                    <span>Mark as read</span>
                  </button>
                )}
                <button
                  onClick={() => onArchive(notification._id)}
                  className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center space-x-2"
                >
                  <Archive className="w-3 h-3" />
                  <span>Archive</span>
                </button>
                <button
                  onClick={() => onDelete(notification._id)}
                  className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center space-x-2"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

const NotificationCenter = ({ isOpen, onClose }) => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, unread, mentions
  const [enabledTypes, setEnabledTypes] = useState({
    likes: true,
    comments: true,
    follows: true,
    shares: true,
    achievements: true,
    quests: true
  });

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.read;
    if (filter === 'mentions') return notification.type === 'mention';
    return true;
  });

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/notifications`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => 
            notification._id === notificationId 
              ? { ...notification, read: true }
              : notification
          )
        );
      }
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/notifications/read-all`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.map(notification => ({ ...notification, read: true }))
        );
      }
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDelete = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/notifications/${notificationId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notification => notification._id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  };

  const handleArchive = async (notificationId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/v1/notifications/${notificationId}/archive`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setNotifications(prev => 
          prev.filter(notification => notification._id !== notificationId)
        );
      }
    } catch (error) {
      console.error('Failed to archive notification:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 pt-20"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: -20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: -20 }}
        className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[80vh] mx-4 overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-3">
            <Bell className="w-5 h-5 text-gray-700" />
            <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-blue-100 text-blue-600">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleMarkAllAsRead}
                className="text-xs"
              >
                Mark all read
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={onClose} className="p-1">
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-1 p-3 border-b border-gray-200 bg-gray-50">
          <Filter className="w-4 h-4 text-gray-500" />
          {['all', 'unread', 'mentions'].map((filterType) => (
            <Button
              key={filterType}
              size="sm"
              variant={filter === filterType ? 'default' : 'ghost'}
              onClick={() => setFilter(filterType)}
              className="text-xs capitalize"
            >
              {filterType}
            </Button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No notifications</h3>
              <p className="text-gray-500">
                {filter === 'unread' ? 'All caught up!' : 'You\'ll see notifications here when you get them.'}
              </p>
            </div>
          ) : (
            <div>
              <AnimatePresence>
                {filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification._id}
                    notification={notification}
                    onMarkAsRead={handleMarkAsRead}
                    onDelete={handleDelete}
                    onArchive={handleArchive}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Settings Footer */}
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-gray-600 hover:text-gray-900"
            onClick={() => {
              // Open notification settings
              console.log('Open notification settings');
            }}
          >
            <BellOff className="w-4 h-4 mr-2" />
            Notification Settings
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NotificationCenter;