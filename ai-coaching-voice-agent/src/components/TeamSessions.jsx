'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Trophy, Target, Zap, Crown, Medal, Star,
  TrendingUp, Award, Flame, Check, X, Clock, Play, Plus, ArrowLeft, LogIn,
  Mic, MicOff, Video, VideoOff, MessageSquare, Send, Download, PhoneOff, Monitor,
  Keyboard, Radio
} from 'lucide-react';
import { useUser } from "@stackframe/stack";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from 'sonner';
import { useCollaborationStore, useActiveTeamSession } from '@/lib/collaboration'; // Keep for Widget compatibility if needed
import { useWebRTC } from '@/hooks/useWebRTC';
import { useSessionTracking } from '@/hooks/useSessionTracking';

export default function TeamSessions() {
  const user = useUser();
  const [view, setView] = useState('landing'); // landing, create, join, active, details
  const [sessionId, setSessionId] = useState(null);
  const [selectedHistorySession, setSelectedHistorySession] = useState(null);

  const activeSession = useQuery(api.teamSessions.get, sessionId ? { sessionId } : "skip");
  const history = useQuery(api.teamSessions.getHistory, user ? { userId: user.id } : "skip");

  // If we have a session ID and data is loaded, show active view
  if (sessionId && activeSession) {
    return (
      <ActiveSessionView 
        session={activeSession} 
        currentUser={user} 
        onLeave={() => setSessionId(null)} 
      />
    );
  }

  const handleViewHistory = (session) => {
    setSelectedHistorySession(session);
    setView('details');
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold flex items-center gap-3 text-black">
            <div className="p-2 bg-violet-500/20 rounded-xl border border-violet-500/30 backdrop-blur-sm">
              <Users className="w-6 h-6 text-violet-400" />
            </div>
            Team Sessions
          </h2>
          <p className="text-gray-800 mt-2 text-lg">
            Collaborate and learn together in real-time multiplayer sessions
          </p>
        </div>
        
        {view !== 'landing' && (
          <button 
            onClick={() => setView('landing')}
            className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {view === 'landing' && (
          <motion.div
            key="landing"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="max-w-4xl mx-auto mt-12 space-y-12"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <OptionCard 
                title="Create Session" 
                description="Start a new team session and invite others to join."
                icon={Plus}
                color="violet"
                onClick={() => setView('create')}
              />
              <OptionCard 
                title="Join Session" 
                description="Enter a code to join an existing team session."
                icon={LogIn}
                color="fuchsia"
                onClick={() => setView('join')}
              />
            </div>

            {/* History Section */}
            {history && history.length > 0 && (
               <div className="bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                  <h3 className="text-xl font-bold mb-6 flex items-center gap-2 text-gray-900">
                    <Clock className="w-5 h-5 text-gray-500" />
                    Recent Sessions
                  </h3>
                  <div className="space-y-4">
                    {history.map(session => (
                      <div 
                        key={session._id} 
                        onClick={() => handleViewHistory(session)}
                        className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-100 cursor-pointer group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold shrink-0 group-hover:scale-110 transition-transform">
                            {session.topic ? session.topic[0].toUpperCase() : 'S'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900 group-hover:text-violet-700 transition-colors">{session.topic || 'Untitled Session'}</div>
                            <div className="text-sm text-gray-500">
                              {new Date(session.createdAt).toLocaleDateString()} • {session.participants.length} Participants
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                             session.status === 'completed' ? 'bg-green-100 text-green-700' :
                             session.status === 'active' ? 'bg-blue-100 text-blue-700' :
                             'bg-gray-100 text-gray-700'
                           }`}>
                             {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                           </span>
                           {session.status === 'active' && (
                             <button 
                               onClick={(e) => {
                                 e.stopPropagation();
                                 setSessionId(session._id);
                               }}
                               className="p-2 rounded-full bg-violet-100 text-violet-600 hover:bg-violet-200 transition-colors"
                               title="Rejoin Session"
                             >
                               <LogIn className="w-4 h-4" />
                             </button>
                           )}
                        </div>
                      </div>
                    ))}
                  </div>
               </div>
            )}
          </motion.div>
        )}

        {view === 'create' && (
          <motion.div
            key="create"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
          >
            <CreateSessionView 
              user={user} 
              onCreated={(id) => setSessionId(id)} 
            />
          </motion.div>
        )}

        {view === 'join' && (
          <motion.div
            key="join"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <JoinSessionView 
              user={user} 
              onJoined={(id) => setSessionId(id)} 
            />
          </motion.div>
        )}

        {view === 'details' && selectedHistorySession && (
          <motion.div
            key="details"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <SessionDetailsView session={selectedHistorySession} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SessionDetailsView({ session }) {
  const messages = useQuery(api.messages.list, { sessionId: session._id });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
      {/* Left Column: Chat History */}
      <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-bold text-gray-900">{session.topic}</h3>
            <p className="text-sm text-gray-500">
              {new Date(session.createdAt).toLocaleDateString()} • {new Date(session.createdAt).toLocaleTimeString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-violet-100 text-violet-700 rounded-full text-xs font-bold">
              {messages ? messages.length : 0} Messages
            </span>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30">
          {!messages ? (
            <div className="flex items-center justify-center h-full text-gray-400">
              Loading conversation...
            </div>
          ) : messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <MessageSquare className="w-8 h-8 opacity-20" />
              <p>No messages in this session</p>
            </div>
          ) : (
            messages.map((msg) => (
              <div key={msg._id} className={`flex gap-3 ${msg.type === 'system' ? 'justify-center' : ''}`}>
                {msg.type !== 'system' && (
                  <div className="w-8 h-8 rounded-full bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm">
                    {msg.userName[0]}
                  </div>
                )}
                <div className={`max-w-[80%] ${msg.type === 'system' ? 'text-center w-full' : ''}`}>
                  {msg.type !== 'system' && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-700">{msg.userName}</span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  <div className={`
                    p-3 rounded-2xl text-sm shadow-sm
                    ${msg.type === 'system' 
                      ? 'bg-gray-100 text-gray-500 text-xs py-1 px-3 rounded-full inline-block' 
                      : 'bg-white text-gray-800 border border-gray-100'
                    }
                  `}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Column: Participants & Stats */}
      <div className="space-y-6">
        {/* Participants Card */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-6">
          <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-500" />
            Participants ({session.participants.length})
          </h4>
          <div className="space-y-3 max-h-[200px] overflow-y-auto pr-2">
            {session.participants.map((p) => (
              <div key={p.userId} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-colors">
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-bold text-xs">
                  {p.avatar ? <img src={p.avatar} alt={p.name} className="w-full h-full rounded-full object-cover" /> : p.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 truncate">{p.name}</div>
                  <div className="text-xs text-gray-500">Score: {p.score || 0}</div>
                </div>
                {p.userId === session.hostId && (
                  <Crown className="w-4 h-4 text-yellow-500" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Stats Card */}
        <div className="bg-linear-to-br from-violet-500 to-fuchsia-600 rounded-3xl shadow-xl p-6 text-white">
          <h4 className="text-lg font-bold mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-white/80" />
            Session Stats
          </h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
              <div className="text-xs text-white/70 mb-1">Status</div>
              <div className="text-lg font-bold capitalize">{session.status}</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3">
              <div className="text-xs text-white/70 mb-1">Duration</div>
              <div className="text-lg font-bold">
                {session.status === 'completed' ? '45m' : 'Active'}
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-3 col-span-2">
              <div className="text-xs text-white/70 mb-1">Engagement Score</div>
              <div className="flex items-end gap-2">
                <div className="text-2xl font-bold">92%</div>
                <div className="text-xs text-white/70 mb-1">Excellent</div>
              </div>
              <div className="w-full bg-black/20 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-white h-full rounded-full" style={{ width: '92%' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionCard({ title, description, icon: Icon, color, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex flex-col items-center text-center p-8 rounded-3xl border-2 transition-all duration-300 w-full
        ${color === 'violet' 
          ? 'border-violet-100 bg-violet-50 hover:border-violet-500 hover:shadow-xl hover:shadow-violet-500/10' 
          : 'border-fuchsia-100 bg-fuchsia-50 hover:border-fuchsia-500 hover:shadow-xl hover:shadow-fuchsia-500/10'
        }
      `}
    >
      <div className={`
        w-20 h-20 rounded-full flex items-center justify-center mb-6
        ${color === 'violet' ? 'bg-violet-100 text-violet-600' : 'bg-fuchsia-100 text-fuchsia-600'}
      `}>
        <Icon className="w-10 h-10" />
      </div>
      <h3 className="text-2xl font-bold text-black mb-3">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </button>
  );
}

function CreateSessionView({ user, onCreated }) {
  const createSession = useMutation(api.teamSessions.create);
  const [topic, setTopic] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;
    
    setIsSubmitting(true);
    try {
      const { sessionId } = await createSession({
        topic,
        maxParticipants: parseInt(maxParticipants),
        hostName: user?.displayName || 'Anonymous',
        hostId: user?.id || 'anonymous',
        hostAvatar: user?.profileImageUrl,
      });
      onCreated(sessionId);
      toast.success('Session created successfully!');
    } catch (error) {
      toast.error('Failed to create session');
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
      <h3 className="text-2xl font-bold text-black mb-6">Create New Session</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Topic</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g., Leadership Skills"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-black"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Max Participants</label>
          <input
            type="number"
            min="2"
            max="10"
            value={maxParticipants}
            onChange={(e) => setMaxParticipants(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none transition-all text-black"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-violet-600 text-white rounded-xl font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Lobby'}
        </button>
      </form>
    </div>
  );
}

function JoinSessionView({ user, onJoined }) {
  const joinSession = useMutation(api.teamSessions.join);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (code.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }

    setIsSubmitting(true);
    try {
      const { sessionId } = await joinSession({
        code,
        userId: user?.id || 'anonymous',
        name: user?.displayName || 'Anonymous',
        avatar: user?.profileImageUrl,
      });
      onJoined(sessionId);
      toast.success('Joined session successfully!');
    } catch (error) {
      toast.error(error.message || 'Failed to join session');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
      <h3 className="text-2xl font-bold text-black mb-6">Join Session</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Session Code</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            maxLength={6}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-fuchsia-500 focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest font-mono text-black"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-fuchsia-600 text-white rounded-xl font-semibold hover:bg-fuchsia-700 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Joining...' : 'Join Session'}
        </button>
      </form>
    </div>
  );
}

function ActiveSessionView({ session, currentUser, onLeave }) {
  const startSession = useMutation(api.sessionControls.startSession);
  const leaveSession = useMutation(api.teamSessions.leave);
  const { trackSessionComplete } = useSessionTracking();
  // Fetch messages here to calculate stats for XP/Analytics
  const messages = useQuery(api.messages.list, { sessionId: session._id });

  const isHost = session.hostId === currentUser?.id;
  const canStart = isHost && session.participants.length > 1;

  const handleStart = async () => {
    if (!canStart) return;
    await startSession({ sessionId: session._id });
    toast.success('Session started!');
  };

  const handleLeave = async () => {
    // Track stats if leaving an active session
    if (session.status === 'active') {
      const durationMinutes = Math.max(1, Math.round((Date.now() - session.createdAt) / 60000));
      const myMessages = messages ? messages.filter(m => m.userId === currentUser?.id).length : 0;
      
      trackSessionComplete({
        mode: 'Team Session',
        topic: session.topic,
        durationMinutes,
        messageCount: myMessages
      });
    }

    await leaveSession({ sessionId: session._id, userId: currentUser?.id || 'anonymous' });
    onLeave();
  };

  const handleCompleteExit = () => {
    // Track stats when exiting a completed session
    const durationMinutes = Math.max(1, Math.round((Date.now() - session.createdAt) / 60000));
    const myMessages = messages ? messages.filter(m => m.userId === currentUser?.id).length : 0;
    
    trackSessionComplete({
      mode: 'Team Session',
      topic: session.topic,
      durationMinutes,
      messageCount: myMessages
    });
    
    onLeave();
  };

  if (session.status === 'active') {
    return (
      <LiveSessionInterface 
        session={session} 
        currentUser={currentUser} 
        onLeave={handleLeave} 
      />
    );
  }

  if (session.status === 'completed') {
    return (
      <div className="max-w-2xl mx-auto bg-white p-12 rounded-3xl shadow-xl border border-gray-200 text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Check className="w-12 h-12 text-emerald-600" />
        </div>
        <h2 className="text-3xl font-bold text-black mb-4">Session Completed</h2>
        <p className="text-gray-600 mb-8 text-lg">
          Thank you for participating in <span className="font-bold text-black">"{session.topic}"</span>.
        </p>
        <button
          onClick={handleCompleteExit}
          className="px-8 py-3 bg-violet-600 text-white font-bold rounded-xl hover:bg-violet-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="bg-white p-8 rounded-3xl shadow-xl border border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-start mb-8 gap-6">
          <div>
            <h2 className="text-3xl font-bold text-black mb-2">{session.topic}</h2>
            <div className="flex items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-sm font-medium uppercase ${
                session.status === 'active' ? 'bg-emerald-100 text-emerald-800 animate-pulse' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {session.status}
              </span>
              <span className="text-gray-500">Hosted by {session.participants.find(p => p.userId === session.hostId)?.name}</span>
            </div>
          </div>
          <div className="text-center bg-gray-50 p-4 rounded-xl border border-gray-200 w-full md:w-auto">
            <div className="text-sm text-gray-500 mb-1">Session Code</div>
            <div className="text-3xl font-mono font-bold text-violet-600 tracking-widest">{session.code}</div>
          </div>
        </div>

        {/* Waiting Room / Lobby */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {session.participants.filter(p => p.status !== 'left').map((participant) => (
            <div key={participant.userId} className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
              <div className="w-12 h-12 rounded-full bg-violet-100 flex items-center justify-center text-violet-600 font-bold text-xl overflow-hidden">
                {participant.avatar ? (
                  <img src={participant.avatar} alt={participant.name} className="w-full h-full object-cover" />
                ) : (
                  participant.name[0]
                )}
              </div>
              <div className="flex-1">
                <div className="font-bold text-black flex items-center gap-2">
                  {participant.name}
                  {participant.userId === currentUser?.id && (
                    <span className="text-[10px] bg-violet-100 text-violet-600 px-1.5 py-0.5 rounded font-bold">YOU</span>
                  )}
                </div>
                <div className="text-sm text-gray-500">Score: {participant.score}</div>
              </div>
              {participant.userId === session.hostId && (
                <Crown className="w-5 h-5 text-yellow-500" />
              )}
            </div>
          ))}
          
          {/* Empty Slots */}
          {Array.from({ length: Math.max(0, (session.maxParticipants || 4) - session.participants.filter(p => p.status !== 'left').length) }).map((_, i) => (
            <div key={`empty-${i}`} className="h-20 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-400 text-sm font-medium bg-gray-50/50">
              Waiting for player...
            </div>
          ))}
        </div>

        <div className="mt-8 flex justify-between items-center border-t border-gray-100 pt-6">
          <button
            onClick={handleLeave}
            className="px-6 py-3 bg-red-50 text-red-600 rounded-xl font-semibold hover:bg-red-100 transition-colors"
          >
            Leave Session
          </button>
          
          {isHost && session.status === 'waiting' && (
            <button
              onClick={handleStart}
              disabled={!canStart}
              className="px-8 py-3 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-lg hover:shadow-emerald-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <Play className="w-5 h-5 fill-current" />
              Start Live Session
            </button>
          )}
          
          {!isHost && session.status === 'waiting' && (
            <p className="text-gray-500 italic animate-pulse">Waiting for host to start...</p>
          )}
        </div>
      </div>
    </div>
  );
}

function LiveSessionInterface({ session, currentUser, onLeave }) {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [chatMode, setChatMode] = useState('text'); // 'text' | 'speech'
  const [audioLevel, setAudioLevel] = useState(0);
  const [remoteAudioLevel, setRemoteAudioLevel] = useState(0);
  
  const endSession = useMutation(api.sessionControls.endSession);
  const isHost = session.hostId === currentUser?.id;

  const { localStream, remoteStreams, toggleAudio, toggleVideo } = useWebRTC(
    session._id, 
    currentUser?.id, 
    session.participants
  );

  const messages = useQuery(api.messages.list, { sessionId: session._id }) || [];
  const sendMessage = useMutation(api.messages.send);
  
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Audio Level Detection (Local & Remote)
  useEffect(() => {
    if (!localStream) return;
    
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(localStream);
    analyser.fftSize = 256;
    source.connect(analyser);
    
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    // Remote Audio Analysis
    const remoteAnalysers = [];
    Object.values(remoteStreams).forEach(stream => {
      if (stream.getAudioTracks().length > 0) {
        const remoteSource = audioContext.createMediaStreamSource(stream);
        const remoteAnalyser = audioContext.createAnalyser();
        remoteAnalyser.fftSize = 256;
        remoteSource.connect(remoteAnalyser);
        // Connect to destination so we can still hear it!
        remoteSource.connect(audioContext.destination); 
        remoteAnalysers.push(remoteAnalyser);
      }
    });

    let animationId;
    
    const checkVolume = () => {
      // Check Local Volume
      analyser.getByteFrequencyData(dataArray);
      let sum = 0;
      for(let i = 0; i < dataArray.length; i++) sum += dataArray[i];
      const average = sum / dataArray.length;
      setAudioLevel(average);

      // Check Remote Volume (Max of all remote streams)
      let maxRemote = 0;
      const remoteDataArray = new Uint8Array(256);
      remoteAnalysers.forEach(ra => {
        ra.getByteFrequencyData(remoteDataArray);
        let rSum = 0;
        for(let i = 0; i < remoteDataArray.length; i++) rSum += remoteDataArray[i];
        const rAvg = rSum / remoteDataArray.length;
        if (rAvg > maxRemote) maxRemote = rAvg;
      });
      setRemoteAudioLevel(maxRemote);

      animationId = requestAnimationFrame(checkVolume);
    };
    
    checkVolume();
    
    return () => {
      cancelAnimationFrame(animationId);
      source.disconnect();
      // Clean up remote connections
      // Note: In a real app, we'd need to be careful not to disconnect the actual audio output
      // but createMediaStreamSource can sometimes hijack the stream. 
      // For this simple implementation, we rely on the component unmounting to clean up the context.
      audioContext.close();
    };
  }, [localStream, remoteStreams]);

  // Initialize Speech Recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition)) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript)
          .join('');
        
        if (event.results[0].isFinal) {
          // Traffic Logic: Only process if local volume is significant and remote volume is low
          const isSpeaking = audioLevel > 10; 
          const isRemoteQuiet = remoteAudioLevel < 10; // Threshold for remote silence

          if (chatMode === 'speech' && isSpeaking) {
            if (isRemoteQuiet) {
              sendMessage({
                sessionId: session._id,
                userId: currentUser?.id || 'anonymous',
                userName: currentUser?.displayName || 'Anonymous',
                content: transcript,
                type: 'chat'
              });
            } else {
              console.log("Blocked auto-send: Remote user is speaking");
              toast.warning("Message blocked: Someone else is speaking", { duration: 2000 });
            }
          } else if (chatMode === 'text') {
             sendMessage({
              sessionId: session._id,
              userId: currentUser?.id || 'anonymous',
              userName: currentUser?.displayName || 'Anonymous',
              content: transcript,
              type: 'transcript'
            });
          }
        }
      };

      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };
    }
  }, [session._id, currentUser, sendMessage, chatMode, audioLevel]);

  // Toggle recording based on chatMode
  useEffect(() => {
    if (chatMode === 'speech' && !isRecording) {
      recognitionRef.current?.start();
      setIsRecording(true);
    } else if (chatMode === 'text' && isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    }
  }, [chatMode]);

  const toggleRecording = () => {
    // Manual toggle overrides mode temporarily or switches mode?
    // Let's make the button switch the mode
    setChatMode(prev => prev === 'text' ? 'speech' : 'text');
  };

  const handleToggleMute = () => {
    const newState = !isMuted;
    setIsMuted(newState);
    toggleAudio(!newState);
  };

  const handleToggleVideo = () => {
    const newState = !isVideoOff;
    setIsVideoOff(newState);
    toggleVideo(!newState);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    await sendMessage({
      sessionId: session._id,
      userId: currentUser?.id || 'anonymous',
      userName: currentUser?.displayName || 'Anonymous',
      content: chatMessage,
      type: 'chat'
    });
    setChatMessage('');
  };

  const handleExport = () => {
    const text = messages.map(m => `[${new Date(m.timestamp).toLocaleTimeString()}] ${m.userName} (${m.type}): ${m.content}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `session-${session.code}-transcript.txt`;
    a.click();
  };

  const handleLeaveCall = async () => {
    // Explicitly stop all tracks
    if (localStream) {
      localStream.getTracks().forEach(track => {
        track.stop();
        track.enabled = false;
      });
    }
    onLeave();
  };

  const handleEndSession = async () => {
    if (confirm('Are you sure you want to end the session for everyone?')) {
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
      }
      await endSession({ sessionId: session._id });
    }
  };

  return (
    <div className="h-[calc(100vh-120px)] flex gap-6">
      {/* Main Content - Video Grid */}
      <div className="flex-1 flex flex-col gap-6">
        <div className="flex-1 bg-gray-900 rounded-3xl p-6 grid grid-cols-2 gap-4 overflow-y-auto relative">
          {session.participants.filter(p => p.status !== 'left').map((participant) => {
            const isMe = participant.userId === currentUser?.id;
            const stream = isMe ? localStream : remoteStreams[participant.userId];
            
            return (
              <div key={participant.userId} className="relative bg-gray-800 rounded-2xl overflow-hidden border border-gray-700 aspect-video">
                {/* Video Feed */}
                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                  {stream ? (
                    <VideoPlayer stream={stream} isMuted={isMe} />
                  ) : (
                    <div className="flex flex-col items-center">
                      {participant.avatar ? (
                        <img src={participant.avatar} alt={participant.name} className="w-24 h-24 rounded-full object-cover border-4 border-gray-700 mb-2" />
                      ) : (
                        <div className="w-24 h-24 rounded-full bg-violet-600 flex items-center justify-center text-3xl font-bold text-white mb-2">
                          {participant.name[0]}
                        </div>
                      )}
                      <span className="text-gray-400 text-sm animate-pulse">Connecting...</span>
                    </div>
                  )}
                </div>
                
                {/* Overlay Info */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-linear-to-t from-black/80 to-transparent flex justify-between items-end">
                  <div>
                    <div className="text-white font-bold flex items-center gap-2">
                      {participant.name}
                      {isMe && <span className="text-xs bg-violet-500 px-1.5 py-0.5 rounded">YOU</span>}
                    </div>
                    {participant.userId === session.hostId && <div className="text-xs text-yellow-400 flex items-center gap-1"><Crown className="w-3 h-3" /> Host</div>}
                  </div>
                  <div className="flex gap-2">
                    {/* Status Icons */}
                    {isMe && isMuted && <MicOff className="w-4 h-4 text-red-400" />}
                    {isMe && chatMode === 'speech' && (
                      <div className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${audioLevel > 10 ? 'bg-green-500 text-white' : 'bg-gray-600 text-gray-300'}`}>
                        <Mic className="w-3 h-3" />
                        {audioLevel > 10 ? 'Speaking' : 'Listening'}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-2xl shadow-lg border border-gray-200 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={handleToggleMute}
              className={`p-4 rounded-xl transition-all ${isMuted ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {isMuted ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
            <button 
              onClick={handleToggleVideo}
              className={`p-4 rounded-xl transition-all ${isVideoOff ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              title="Toggle Video"
            >
              {isVideoOff ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
            </button>
          </div>

          <div className="flex gap-4">
            {isHost && (
              <button 
                onClick={handleEndSession}
                className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black shadow-lg transition-all"
              >
                End Session
              </button>
            )}
            <button 
              onClick={handleLeaveCall}
              className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-lg hover:shadow-red-500/25 transition-all"
            >
              Leave Call
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar - Chat & Transcripts */}
      <div className="w-96 bg-white rounded-3xl shadow-xl border border-gray-200 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-violet-500" />
            Session Chat
          </h3>
          <div className="flex items-center gap-2">
             {/* Chat Mode Switcher */}
             <div className="flex bg-gray-100 p-1 rounded-lg">
                <button 
                  onClick={() => setChatMode('text')}
                  className={`p-1.5 rounded-md transition-all ${chatMode === 'text' ? 'bg-white shadow-sm text-violet-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Type Mode"
                >
                  <Keyboard className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setChatMode('speech')}
                  className={`p-1.5 rounded-md transition-all ${chatMode === 'speech' ? 'bg-white shadow-sm text-violet-600' : 'text-gray-500 hover:text-gray-700'}`}
                  title="Speech Mode (Auto-Send)"
                >
                  <Mic className="w-4 h-4" />
                </button>
             </div>
             <button onClick={handleExport} className="p-2 hover:bg-gray-200 rounded-lg text-gray-600" title="Export Transcript">
               <Download className="w-4 h-4" />
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => (
            <div key={msg._id} className={`flex flex-col ${msg.userId === currentUser?.id ? 'items-end' : 'items-start'}`}>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-gray-600">{msg.userName}</span>
                <span className="text-[10px] text-gray-400">{new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
              </div>
              <div className={`p-3 rounded-2xl max-w-[85%] ${
                msg.type === 'transcript' 
                  ? 'bg-gray-100 text-gray-600 italic border border-gray-200' 
                  : msg.userId === currentUser?.id 
                    ? 'bg-violet-600 text-white rounded-tr-none' 
                    : 'bg-gray-100 text-gray-800 rounded-tl-none'
              }`}>
                {msg.type === 'transcript' && <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Transcript</span>}
                {msg.content}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-gray-50">
          {chatMode === 'speech' ? (
            <div className="flex flex-col items-center justify-center py-4 gap-2 text-center">
               <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${audioLevel > 10 ? 'bg-violet-100 text-violet-600 scale-110' : 'bg-gray-100 text-gray-400'}`}>
                 <Mic className="w-6 h-6" />
               </div>
               <p className="text-sm font-medium text-gray-600">
                 {audioLevel > 10 ? 'Listening...' : 'Speak to send message'}
               </p>
               {remoteAudioLevel > 10 && (
                 <p className="text-xs text-orange-500 font-bold animate-pulse">
                   Someone else is speaking...
                 </p>
               )}
               <p className="text-xs text-gray-400">Auto-sends when you finish speaking</p>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none text-black"
              />
              <button 
                type="submit"
                disabled={!chatMessage.trim()}
                className="p-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 disabled:opacity-50 transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function VideoPlayer({ stream, isMuted = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted={isMuted}
      className="w-full h-full object-cover"
    />
  );
}

/**
 * Team Sessions Widget (for dashboard)
 * Kept for compatibility, but could be updated to use Convex too
 */
export function TeamSessionsWidget() {
  const sessions = useCollaborationStore(state => state.teamSessions);
  const activeSession = useActiveTeamSession();
  
  const activeSessions = sessions.filter(s => s.status !== 'completed');
  
  return (
    <div className="p-6 bg-white backdrop-blur-md rounded-2xl border border-gray-300 shadow-sm h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-lg flex items-center gap-2 text-black">
          <div className="p-2 bg-violet-500/20 rounded-lg border border-violet-500/30">
            <Users className="w-5 h-5 text-violet-400" />
          </div>
          Team Sessions
        </h3>
        <span className="px-2.5 py-0.5 bg-gray-100 text-gray-800 text-xs font-bold rounded-full border border-gray-300">
          {activeSessions.length} active
        </span>
      </div>
      
      <div className="flex-1">
        {activeSession ? (
          <div className="p-4 bg-linear-to-r from-violet-600 to-fuchsia-600 rounded-xl text-black shadow-lg border border-gray-300">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold bg-gray-200 px-2 py-0.5 rounded-full backdrop-blur-sm">YOUR SESSION</span>
              <span className="animate-pulse w-2 h-2 bg-emerald-400 rounded-full shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
            </div>
            <p className="font-bold text-lg mb-1">{activeSession.name}</p>
            <div className="flex items-center gap-2 text-sm text-black">
              <Users className="w-4 h-4" />
              <span>{activeSession.participants.length} players</span>
            </div>
          </div>
        ) : activeSessions.length > 0 ? (
          <div className="space-y-3">
            {activeSessions.slice(0, 3).map(session => (
              <div key={session.id} className="group p-4 bg-white rounded-xl transition-colors border border-gray-300 hover:border-violet-500/30 cursor-pointer">
                <div className="flex justify-between items-start mb-1">
                  <p className="font-bold text-black group-hover:text-violet-300 transition-colors">{session.name}</p>
                  <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">OPEN</span>
                </div>
                <p className="text-xs text-gray-700 flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  {session.participants.length}/{session.maxParticipants} players
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center py-8 text-gray-400">
            <Users className="w-12 h-12 mb-2 opacity-20" />
            <p className="text-sm">No active sessions</p>
          </div>
        )}
      </div>
    </div>
  );
}


