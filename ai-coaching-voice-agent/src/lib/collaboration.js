'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Collaboration System
 * Real-time multi-user sessions, team coaching, and social features
 */

// Collaboration Store
export const useCollaborationStore = create(
  persist(
    (set, get) => ({
      // Current user's presence
      currentUser: null,
      
      // Active room
      activeRoom: null,
      
      // Room participants
      participants: [],
      
      // Team sessions
      teamSessions: [],
      
      // Active team session
      activeTeamSession: null,
      
      // Friends list
      friends: [],
      
      // Friend requests
      friendRequests: [],
      
      // Shared achievements
      sharedAchievements: [],
      
      // Real-time events
      events: [],
      
      // Actions
      setCurrentUser: (user) => {
        set({ currentUser: user });
      },
      
      joinRoom: (roomId, userName, avatar) => {
        const user = {
          id: Date.now().toString(),
          name: userName,
          avatar: avatar || '👤',
          joinedAt: new Date().toISOString(),
          status: 'active',
        };
        
        set({ 
          activeRoom: roomId,
          currentUser: user,
        });
        
        // Emit join event
        get().emitEvent({
          type: 'user_joined',
          userId: user.id,
          userName: user.name,
          roomId,
        });
        
        return user;
      },
      
      leaveRoom: () => {
        const { activeRoom, currentUser } = get();
        
        if (activeRoom && currentUser) {
          get().emitEvent({
            type: 'user_left',
            userId: currentUser.id,
            userName: currentUser.name,
            roomId: activeRoom,
          });
        }
        
        set({ 
          activeRoom: null,
          participants: [],
        });
      },
      
      updateParticipants: (participants) => {
        set({ participants });
      },
      
      addParticipant: (participant) => {
        set(state => ({
          participants: [...state.participants, participant],
        }));
      },
      
      removeParticipant: (participantId) => {
        set(state => ({
          participants: state.participants.filter(p => p.id !== participantId),
        }));
      },
      
      updateParticipantStatus: (participantId, status) => {
        set(state => ({
          participants: state.participants.map(p =>
            p.id === participantId ? { ...p, status } : p
          ),
        }));
      },
      
      // Team Sessions
      createTeamSession: (name, description, maxParticipants = 10) => {
        const session = {
          id: Date.now().toString(),
          name,
          description,
          maxParticipants,
          participants: [get().currentUser],
          createdAt: new Date().toISOString(),
          status: 'waiting', // waiting, active, completed
          topic: null,
          difficulty: 'medium',
          scores: {},
        };
        
        set(state => ({
          teamSessions: [...state.teamSessions, session],
          activeTeamSession: session.id,
        }));
        
        return session;
      },
      
      joinTeamSession: (sessionId) => {
        const { currentUser, teamSessions } = get();
        const session = teamSessions.find(s => s.id === sessionId);
        
        if (!session) return null;
        
        if (session.participants.length >= session.maxParticipants) {
          return { error: 'Session is full' };
        }
        
        set(state => ({
          teamSessions: state.teamSessions.map(s =>
            s.id === sessionId
              ? { ...s, participants: [...s.participants, currentUser] }
              : s
          ),
          activeTeamSession: sessionId,
        }));
        
        get().emitEvent({
          type: 'team_session_joined',
          sessionId,
          userId: currentUser.id,
          userName: currentUser.name,
        });
        
        return session;
      },
      
      leaveTeamSession: (sessionId) => {
        const { currentUser } = get();
        
        set(state => ({
          teamSessions: state.teamSessions.map(s =>
            s.id === sessionId
              ? { ...s, participants: s.participants.filter(p => p.id !== currentUser.id) }
              : s
          ),
          activeTeamSession: null,
        }));
        
        get().emitEvent({
          type: 'team_session_left',
          sessionId,
          userId: currentUser.id,
        });
      },
      
      updateTeamSessionScore: (sessionId, userId, score) => {
        set(state => ({
          teamSessions: state.teamSessions.map(s =>
            s.id === sessionId
              ? { ...s, scores: { ...s.scores, [userId]: score } }
              : s
          ),
        }));
        
        get().emitEvent({
          type: 'score_updated',
          sessionId,
          userId,
          score,
        });
      },
      
      startTeamSession: (sessionId, topic, difficulty) => {
        set(state => ({
          teamSessions: state.teamSessions.map(s =>
            s.id === sessionId
              ? { ...s, status: 'active', topic, difficulty, startedAt: new Date().toISOString() }
              : s
          ),
        }));
        
        get().emitEvent({
          type: 'team_session_started',
          sessionId,
          topic,
          difficulty,
        });
      },
      
      completeTeamSession: (sessionId) => {
        const session = get().teamSessions.find(s => s.id === sessionId);
        
        set(state => ({
          teamSessions: state.teamSessions.map(s =>
            s.id === sessionId
              ? { ...s, status: 'completed', completedAt: new Date().toISOString() }
              : s
          ),
        }));
        
        // Calculate winners
        const scores = session.scores;
        const winner = Object.entries(scores).reduce((a, b) => a[1] > b[1] ? a : b);
        
        get().emitEvent({
          type: 'team_session_completed',
          sessionId,
          winnerId: winner[0],
          scores,
        });
      },
      
      // Friends
      addFriend: (friendId, friendName, friendAvatar) => {
        const friend = {
          id: friendId,
          name: friendName,
          avatar: friendAvatar || '👤',
          addedAt: new Date().toISOString(),
          status: 'offline',
        };
        
        set(state => ({
          friends: [...state.friends, friend],
        }));
        
        return friend;
      },
      
      removeFriend: (friendId) => {
        set(state => ({
          friends: state.friends.filter(f => f.id !== friendId),
        }));
      },
      
      updateFriendStatus: (friendId, status) => {
        set(state => ({
          friends: state.friends.map(f =>
            f.id === friendId ? { ...f, status } : f
          ),
        }));
      },
      
      sendFriendRequest: (userId, userName) => {
        const request = {
          id: Date.now().toString(),
          fromId: get().currentUser.id,
          fromName: get().currentUser.name,
          toId: userId,
          toName: userName,
          status: 'pending',
          sentAt: new Date().toISOString(),
        };
        
        get().emitEvent({
          type: 'friend_request_sent',
          request,
        });
        
        return request;
      },
      
      acceptFriendRequest: (requestId) => {
        set(state => ({
          friendRequests: state.friendRequests.filter(r => r.id !== requestId),
        }));
        
        get().emitEvent({
          type: 'friend_request_accepted',
          requestId,
        });
      },
      
      rejectFriendRequest: (requestId) => {
        set(state => ({
          friendRequests: state.friendRequests.filter(r => r.id !== requestId),
        }));
        
        get().emitEvent({
          type: 'friend_request_rejected',
          requestId,
        });
      },
      
      // Social Sharing
      shareAchievement: (achievementId, achievementName, achievementIcon) => {
        const share = {
          id: Date.now().toString(),
          userId: get().currentUser.id,
          userName: get().currentUser.name,
          achievementId,
          achievementName,
          achievementIcon,
          sharedAt: new Date().toISOString(),
          likes: 0,
          comments: [],
        };
        
        set(state => ({
          sharedAchievements: [...state.sharedAchievements, share],
        }));
        
        get().emitEvent({
          type: 'achievement_shared',
          share,
        });
        
        return share;
      },
      
      likeSharedAchievement: (shareId) => {
        set(state => ({
          sharedAchievements: state.sharedAchievements.map(s =>
            s.id === shareId ? { ...s, likes: s.likes + 1 } : s
          ),
        }));
        
        get().emitEvent({
          type: 'achievement_liked',
          shareId,
        });
      },
      
      commentOnSharedAchievement: (shareId, comment) => {
        const commentObj = {
          id: Date.now().toString(),
          userId: get().currentUser.id,
          userName: get().currentUser.name,
          text: comment,
          timestamp: new Date().toISOString(),
        };
        
        set(state => ({
          sharedAchievements: state.sharedAchievements.map(s =>
            s.id === shareId 
              ? { ...s, comments: [...s.comments, commentObj] }
              : s
          ),
        }));
        
        get().emitEvent({
          type: 'achievement_commented',
          shareId,
          comment: commentObj,
        });
      },
      
      // Events
      emitEvent: (event) => {
        const eventObj = {
          ...event,
          id: Date.now().toString(),
          timestamp: new Date().toISOString(),
        };
        
        set(state => ({
          events: [...state.events, eventObj].slice(-100), // Keep last 100 events
        }));
        
        // In real app, emit to server via WebSocket
        console.log('Event emitted:', eventObj);
        
        return eventObj;
      },
      
      subscribeToEvents: (callback) => {
        // In real app, subscribe to WebSocket events
        // For now, just poll the events array
        const interval = setInterval(() => {
          const events = get().events;
          if (events.length > 0) {
            callback(events[events.length - 1]);
          }
        }, 1000);
        
        return () => clearInterval(interval);
      },
      
      // Presence
      updatePresence: (status, activity) => {
        if (get().currentUser) {
          set(state => ({
            currentUser: {
              ...state.currentUser,
              status,
              activity,
              lastActive: new Date().toISOString(),
            },
          }));
          
          get().emitEvent({
            type: 'presence_updated',
            userId: get().currentUser.id,
            status,
            activity,
          });
        }
      },
      
      // Invitations
      inviteToSession: (friendId, sessionId) => {
        const invitation = {
          id: Date.now().toString(),
          fromId: get().currentUser.id,
          fromName: get().currentUser.name,
          toId: friendId,
          sessionId,
          status: 'pending',
          sentAt: new Date().toISOString(),
        };
        
        get().emitEvent({
          type: 'session_invitation_sent',
          invitation,
        });
        
        return invitation;
      },
    }),
    {
      name: 'collaboration',
      partialize: (state) => ({
        friends: state.friends,
        teamSessions: state.teamSessions,
      }),
    }
  )
);

/**
 * Real-time Sync Utilities
 */

export class RealtimeSync {
  constructor() {
    this.ws = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.listeners = new Map();
  }
  
  connect(url, userId) {
    if (typeof window === 'undefined') return;
    
    try {
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Send auth
        this.send({
          type: 'auth',
          userId,
        });
      };
      
      this.ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.reconnect(url, userId);
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to connect:', error);
    }
  }
  
  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }
  
  reconnect(url, userId) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      setTimeout(() => {
        console.log(`Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect(url, userId);
      }, 2000 * this.reconnectAttempts);
    }
  }
  
  send(data) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }
  
  handleMessage(data) {
    const listeners = this.listeners.get(data.type) || [];
    listeners.forEach(callback => callback(data));
  }
  
  on(eventType, callback) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    this.listeners.get(eventType).push(callback);
    
    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(eventType);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }
  
  emit(eventType, data) {
    this.send({
      type: eventType,
      ...data,
    });
  }
}

// Singleton instance
export const realtimeSync = typeof window !== 'undefined' ? new RealtimeSync() : null;

/**
 * Presence System
 */

export const PresenceStatus = {
  ONLINE: 'online',
  AWAY: 'away',
  BUSY: 'busy',
  OFFLINE: 'offline',
};

export const updatePresence = (status, activity = null) => {
  const store = useCollaborationStore.getState();
  store.updatePresence(status, activity);
  
  if (realtimeSync) {
    realtimeSync.emit('presence', { status, activity });
  }
};

// Auto-update presence based on activity
export const startPresenceTracking = () => {
  if (typeof window === 'undefined') return;
  
  let idleTimer;
  const idleTimeout = 5 * 60 * 1000; // 5 minutes
  
  const resetIdleTimer = () => {
    clearTimeout(idleTimer);
    updatePresence(PresenceStatus.ONLINE);
    
    idleTimer = setTimeout(() => {
      updatePresence(PresenceStatus.AWAY);
    }, idleTimeout);
  };
  
  // Track user activity
  ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
    window.addEventListener(event, resetIdleTimer, { passive: true });
  });
  
  // Initial state
  resetIdleTimer();
  
  // Cleanup
  return () => {
    clearTimeout(idleTimer);
    ['mousedown', 'keydown', 'scroll', 'touchstart'].forEach(event => {
      window.removeEventListener(event, resetIdleTimer);
    });
  };
};

/**
 * React Hooks
 */

// Use participants in current room
export const useParticipants = () => {
  return useCollaborationStore(state => state.participants);
};

// Use friends list
export const useFriends = () => {
  return useCollaborationStore(state => state.friends);
};

// Use active team session
export const useActiveTeamSession = () => {
  const activeId = useCollaborationStore(state => state.activeTeamSession);
  const sessions = useCollaborationStore(state => state.teamSessions);
  return sessions.find(s => s.id === activeId) || null;
};

// Use shared achievements feed
export const useSharedAchievements = () => {
  return useCollaborationStore(state => state.sharedAchievements);
};

// Use current user
export const useCurrentUser = () => {
  return useCollaborationStore(state => state.currentUser);
};
