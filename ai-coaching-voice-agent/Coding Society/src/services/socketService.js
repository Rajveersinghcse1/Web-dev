/**
 * Socket.io Service for Real-time Features
 * Handles real-time communication with the backend
 */

import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
    this.listeners = new Map();
  }

  /**
   * Connect to Socket.io server
   */
  connect(token) {
    if (this.socket) {
      this.disconnect();
    }

    this.socket = io(SOCKET_URL, {
      auth: {
        token: token
      },
      autoConnect: true,
    });

    this.setupEventListeners();
    return this.socket;
  }

  /**
   * Disconnect from Socket.io server
   */
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  /**
   * Setup default event listeners
   */
  setupEventListeners() {
    if (!this.socket) return;

    this.socket.on('connect', () => {
      console.log('✅ Connected to server');
      this.connected = true;
      this.emit('connection_status', { connected: true });
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      this.connected = false;
      this.emit('connection_status', { connected: false, reason });
    });

    this.socket.on('error', (error) => {
      console.error('🔥 Socket error:', error);
      this.emit('socket_error', error);
    });

    // Game-specific events
    this.socket.on('level_up', (data) => {
      console.log('🎉 Level up!', data);
      this.emit('level_up', data);
    });

    this.socket.on('achievement_unlocked', (data) => {
      console.log('🏆 Achievement unlocked!', data);
      this.emit('achievement_unlocked', data);
    });

    this.socket.on('quest_completed', (data) => {
      console.log('✅ Quest completed!', data);
      this.emit('quest_completed', data);
    });

    this.socket.on('battle_invite', (data) => {
      console.log('⚔️ Battle invite received!', data);
      this.emit('battle_invite', data);
    });

    this.socket.on('battle_update', (data) => {
      console.log('⚔️ Battle update:', data);
      this.emit('battle_update', data);
    });

    this.socket.on('leaderboard_update', (data) => {
      console.log('📊 Leaderboard updated:', data);
      this.emit('leaderboard_update', data);
    });

    this.socket.on('notification', (data) => {
      console.log('🔔 Notification:', data);
      this.emit('notification', data);
    });
  }

  /**
   * Check if connected
   */
  isConnected() {
    return this.connected && this.socket && this.socket.connected;
  }

  /**
   * Emit event to server
   */
  send(event, data) {
    if (this.socket && this.isConnected()) {
      this.socket.emit(event, data);
    } else {
      console.warn('⚠️ Socket not connected. Cannot send:', event);
    }
  }

  /**
   * Listen for events
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push(callback);

    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  /**
   * Remove event listener
   */
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }

    if (this.listeners.has(event)) {
      const callbacks = this.listeners.get(event);
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  /**
   * Emit to local listeners
   */
  emit(event, data) {
    if (this.listeners.has(event)) {
      this.listeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in socket listener:', error);
        }
      });
    }
  }

  /**
   * Join a room
   */
  joinRoom(roomName) {
    this.send('join_room', { room: roomName });
  }

  /**
   * Leave a room
   */
  leaveRoom(roomName) {
    this.send('leave_room', { room: roomName });
  }

  /**
   * Game-specific methods
   */
  
  // Quest progress updates
  updateQuestProgress(questId, progress) {
    this.send('quest_progress', { questId, progress });
  }

  // Battle arena
  joinBattleRoom(battleId) {
    this.joinRoom(`battle_${battleId}`);
  }

  leaveBattleRoom(battleId) {
    this.leaveRoom(`battle_${battleId}`);
  }

  submitBattleSolution(battleId, solution) {
    this.send('battle_solution', { battleId, solution });
  }

  // Leaderboard updates
  joinLeaderboardRoom() {
    this.joinRoom('leaderboard');
  }

  leaveLeaderboardRoom() {
    this.leaveRoom('leaderboard');
  }

  // Chat and social features
  sendMessage(roomName, message) {
    this.send('chat_message', { room: roomName, message });
  }

  // User presence
  updateUserStatus(status) {
    this.send('user_status', { status });
  }

  // Notifications
  markNotificationRead(notificationId) {
    this.send('notification_read', { notificationId });
  }
}

// Create singleton instance
const socketService = new SocketService();

export default socketService;