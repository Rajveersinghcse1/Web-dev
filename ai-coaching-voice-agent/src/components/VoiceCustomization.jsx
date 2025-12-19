'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Volume2, Mic, Settings, User, Sparkles, Save, RotateCcw,
  Play, Pause, Download, Upload, Trash2, Copy, Check, X, Plus,
  Activity, Zap, MessageSquare, Brain, Gauge
} from 'lucide-react';
import { 
  useVoiceProfileStore, 
  useActiveProfile,
  exportProfile,
  importProfile 
} from '@/lib/voiceProfiles';
import { toast } from 'sonner';

/**
 * Voice Customization UI
 * Complete interface for managing voice profiles and settings
 * Modernized with glassmorphism and advanced animations
 */

export default function VoiceCustomization() {
  const [activeTab, setActiveTab] = useState('profiles');
  
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-black flex items-center gap-3">
            <div className="p-2 bg-violet-500/20 rounded-xl border border-violet-500/30 backdrop-blur-sm">
              <Volume2 className="w-8 h-8 text-violet-400" />
            </div>
            Voice Customization
          </h2>
          <p className="text-gray-800 mt-2 ml-1">
            Personalize your AI coach's voice and personality
          </p>
        </div>
      </div>
      
      {/* Tabs */}
      <div className="flex gap-2 p-1 bg-white backdrop-blur-sm rounded-xl border border-gray-300 w-fit">
        <TabButton
          active={activeTab === 'profiles'}
          onClick={() => setActiveTab('profiles')}
          icon={<User className="w-4 h-4" />}
          label="Profiles"
        />
        <TabButton
          active={activeTab === 'voice'}
          onClick={() => setActiveTab('voice')}
          icon={<Volume2 className="w-4 h-4" />}
          label="Voice Settings"
        />
        <TabButton
          active={activeTab === 'personality'}
          onClick={() => setActiveTab('personality')}
          icon={<Sparkles className="w-4 h-4" />}
          label="AI Personality"
        />
        <TabButton
          active={activeTab === 'preferences'}
          onClick={() => setActiveTab('preferences')}
          icon={<Settings className="w-4 h-4" />}
          label="Preferences"
        />
      </div>
      
      {/* Content */}
      <motion.div 
        layout
        className="min-h-[500px] bg-white backdrop-blur-xl rounded-3xl border border-gray-300 p-6 relative overflow-hidden"
      >
        {/* Background Decoration */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-violet-500/5 rounded-full blur-3xl -mr-48 -mt-48 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl -ml-48 -mb-48 pointer-events-none" />

        <AnimatePresence mode="wait">
          {activeTab === 'profiles' && (
            <motion.div
              key="profiles"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ProfilesTab />
            </motion.div>
          )}
          {activeTab === 'voice' && (
            <motion.div
              key="voice"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <VoiceSettingsTab />
            </motion.div>
          )}
          {activeTab === 'personality' && (
            <motion.div
              key="personality"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <PersonalityTab />
            </motion.div>
          )}
          {activeTab === 'preferences' && (
            <motion.div
              key="preferences"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <PreferencesTab />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }) {
  return (
    <button
      onClick={onClick}
      className={`
        flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all text-sm font-medium relative
        ${active
          ? 'text-black bg-gray-100 shadow-sm'
          : 'text-gray-800 hover:text-black hover:bg-white'
        }
      `}
    >
      {active && (
        <motion.div
          layoutId="activeTab"
          className="absolute inset-0 bg-gray-100 rounded-lg"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="relative z-10 flex items-center gap-2">
        {icon}
        {label}
      </span>
    </button>
  );
}

/**
 * Profiles Tab
 */
function ProfilesTab() {
  const profiles = useVoiceProfileStore(state => state.profiles);
  const activeProfileId = useVoiceProfileStore(state => state.activeProfile);
  const setActiveProfile = useVoiceProfileStore(state => state.setActiveProfile);
  const createProfile = useVoiceProfileStore(state => state.createProfile);
  const deleteProfile = useVoiceProfileStore(state => state.deleteProfile);
  const initializeDefaultProfiles = useVoiceProfileStore(state => state.initializeDefaultProfiles);
  
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  
  useEffect(() => {
    initializeDefaultProfiles();
  }, []);
  
  return (
    <div className="space-y-6 relative z-10">
      {/* Active Profile */}
      {activeProfileId && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-6 bg-violet-500/10 rounded-2xl border border-violet-500/30 backdrop-blur-md relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-linear-to-r from-violet-500/5 to-indigo-500/5" />
          <div className="flex items-center justify-between relative z-10">
            <div>
              <p className="text-sm font-bold text-violet-300 uppercase tracking-wider mb-1">
                Active Profile
              </p>
              <p className="text-2xl font-bold text-black">
                {profiles.find(p => p.id === activeProfileId)?.name}
              </p>
            </div>
            <div className="w-12 h-12 bg-violet-500 rounded-full flex items-center justify-center text-black shadow-[0_0_15px_rgba(139,92,246,0.5)]">
              <Check className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      )}
      
      {/* Create New Profile */}
      <motion.button
        whileHover={{ scale: 1.01, backgroundColor: 'rgba(255,255,255,0.05)' }}
        whileTap={{ scale: 0.99 }}
        onClick={() => setShowCreateDialog(true)}
        className="w-full p-4 border border-dashed border-gray-300 rounded-2xl hover:border-violet-500/50 transition-all group"
      >
        <div className="flex items-center justify-center gap-2 text-gray-800 group-hover:text-violet-300">
          <div className="p-2 bg-white rounded-full transition-colors">
            <Plus className="w-5 h-5" />
          </div>
          <span className="font-medium">Create New Profile</span>
        </div>
      </motion.button>
      
      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {profiles.map((profile, index) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isActive={activeProfileId === profile.id}
            onActivate={() => setActiveProfile(profile.id)}
            onDelete={() => {
              if (confirm(`Delete profile "${profile.name}"?`)) {
                deleteProfile(profile.id);
                toast.success('Profile deleted');
              }
            }}
            delay={index * 0.1}
          />
        ))}
      </div>
      
      {/* Create Dialog */}
      <AnimatePresence>
        {showCreateDialog && (
          <CreateProfileDialog
            onClose={() => setShowCreateDialog(false)}
            onCreate={(name, description) => {
              createProfile(name, description);
              setShowCreateDialog(false);
              toast.success('Profile created!');
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function ProfileCard({ profile, isActive, onActivate, onDelete, delay }) {
  const [copied, setCopied] = useState(false);
  
  const handleExport = () => {
    const data = exportProfile(profile);
    navigator.clipboard.writeText(data);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success('Profile exported to clipboard!');
  };
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay }}
      whileHover={{ scale: 1.02, y: -2 }}
      className={`
        p-5 rounded-2xl border transition-all relative overflow-hidden group
        ${isActive
          ? 'border-violet-500/50 bg-violet-500/10 shadow-[0_0_20px_rgba(139,92,246,0.1)]'
          : 'border-gray-300 bg-white hover:border-gray-300'
        }
      `}
    >
      <div className="flex items-start justify-between mb-4 relative z-10">
        <div className="flex-1">
          <h3 className="font-bold text-black text-lg">{profile.name}</h3>
          {profile.description && (
            <p className="text-sm text-gray-800 mt-1 line-clamp-1">
              {profile.description}
            </p>
          )}
        </div>
        {!profile.isCustom && (
          <span className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs font-bold rounded-lg border border-blue-500/30">
            DEFAULT
          </span>
        )}
      </div>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4 relative z-10">
        <div className="text-center p-2 bg-white rounded-xl border border-gray-300">
          <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Pitch</p>
          <p className="font-bold text-black">{profile.voiceSettings.pitch}x</p>
        </div>
        <div className="text-center p-2 bg-white rounded-xl border border-gray-300">
          <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Speed</p>
          <p className="font-bold text-black">{profile.voiceSettings.speed}x</p>
        </div>
        <div className="text-center p-2 bg-white rounded-xl border border-gray-300">
          <p className="text-[10px] font-bold text-gray-700 uppercase tracking-wider mb-1">Emotion</p>
          <p className="font-bold text-xs text-black truncate px-1">{profile.voiceSettings.emotion}</p>
        </div>
      </div>
      
      {/* Actions */}
      <div className="flex gap-2 relative z-10">
        {!isActive && (
          <button
            onClick={onActivate}
            className="flex-1 px-3 py-2 bg-violet-600 text-black rounded-xl hover:bg-violet-500 transition-colors flex items-center justify-center gap-2 text-sm font-bold shadow-lg shadow-violet-500/20"
          >
            <Check className="w-4 h-4" />
            Activate
          </button>
        )}
        <button
          onClick={handleExport}
          className="px-3 py-2 bg-white text-gray-800 rounded-xl hover:text-black transition-colors border border-gray-300"
          title="Export profile"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
        </button>
        {profile.isCustom && (
          <button
            onClick={onDelete}
            className="px-3 py-2 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-colors border border-red-500/20"
            title="Delete profile"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </motion.div>
  );
}

function CreateProfileDialog({ onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  
  return (
    <div className="fixed inset-0 bg-white backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="bg-white border border-gray-300 rounded-3xl p-6 max-w-md w-full shadow-2xl relative overflow-hidden"
      >
        {/* Background Gradients */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="flex items-center justify-between mb-6 relative z-10">
          <h3 className="text-xl font-bold text-black">Create New Profile</h3>
          <button onClick={onClose} className="p-1 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-800" />
          </button>
        </div>
        
        <div className="space-y-4 relative z-10">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Profile Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Motivational Coach"
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all"
              autoFocus
            />
          </div>
          
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">Description (optional)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe this profile..."
              rows={3}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50 transition-all resize-none"
            />
          </div>
        </div>
        
        <div className="flex gap-3 mt-8 relative z-10">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 bg-white text-black rounded-xl transition-colors font-medium"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (name.trim()) onCreate(name, description);
              else toast.error('Please enter a profile name');
            }}
            className="flex-1 px-4 py-2.5 bg-violet-600 text-black rounded-xl hover:bg-violet-500 transition-colors font-bold shadow-lg shadow-violet-500/20"
          >
            Create Profile
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function VoiceSettingsTab() {
  const voiceSettings = useVoiceProfileStore(state => state.voiceSettings);
  const updateVoiceSettings = useVoiceProfileStore(state => state.updateVoiceSettings);
  
  const handleChange = (key, value) => {
    updateVoiceSettings({ [key]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Pitch & Speed */}
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-black mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-violet-500" />
            Voice Dynamics
          </h3>
          
          <div className="space-y-8">
            <div>
              <div className="flex justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Pitch</label>
                <span className="text-sm font-bold text-violet-600">{voiceSettings.pitch}x</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1" 
                value={voiceSettings.pitch}
                onChange={(e) => handleChange('pitch', parseFloat(e.target.value))}
                className="w-full accent-violet-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
                <span>Deep</span>
                <span>High</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">Speed</label>
                <span className="text-sm font-bold text-violet-600">{voiceSettings.speed}x</span>
              </div>
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1" 
                value={voiceSettings.speed}
                onChange={(e) => handleChange('speed', parseFloat(e.target.value))}
                className="w-full accent-violet-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
                <span>Slow</span>
                <span>Fast</span>
              </div>
            </div>
          </div>
        </div>

        {/* Emotion & Style */}
        <div className="bg-white/50 backdrop-blur-sm p-6 rounded-2xl border border-gray-200 shadow-sm">
          <h3 className="font-bold text-black mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-500" />
            Emotion & Style
          </h3>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Emotion</label>
              <div className="grid grid-cols-2 gap-3">
                {['neutral', 'friendly', 'energetic', 'calm', 'professional'].map((emotion) => (
                  <button
                    key={emotion}
                    onClick={() => handleChange('emotion', emotion)}
                    className={`
                      px-3 py-2.5 rounded-xl text-sm font-medium transition-all capitalize border
                      ${voiceSettings.emotion === emotion
                        ? 'bg-violet-100 text-violet-700 border-violet-200 shadow-sm'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-violet-300 hover:text-violet-600'
                      }
                    `}
                  >
                    {emotion}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PersonalityTab() {
  const aiPersonality = useVoiceProfileStore(state => state.aiPersonality);
  const updateAIPersonality = useVoiceProfileStore(state => state.updateAIPersonality);
  
  const handleChange = (key, value) => {
    updateAIPersonality({ [key]: value });
  };

  const traits = [
    { key: 'formality', label: 'Formality', min: 'Casual', max: 'Formal', icon: User },
    { key: 'enthusiasm', label: 'Enthusiasm', min: 'Calm', max: 'Excited', icon: Zap },
    { key: 'encouragement', label: 'Encouragement', min: 'Neutral', max: 'Supportive', icon: Sparkles },
    { key: 'detail', label: 'Detail Level', min: 'Brief', max: 'Detailed', icon: MessageSquare },
    { key: 'humor', label: 'Humor', min: 'Serious', max: 'Funny', icon: Brain },
    { key: 'patience', label: 'Patience', min: 'Direct', max: 'Patient', icon: Gauge },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {traits.map((trait) => (
        <div key={trait.key} className="bg-white/50 backdrop-blur-sm p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-violet-200 transition-colors">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-violet-100 rounded-lg text-violet-600">
              <trait.icon className="w-4 h-4" />
            </div>
            <span className="font-bold text-black">{trait.label}</span>
            <span className="ml-auto text-xs font-mono text-violet-500 bg-violet-50 px-2 py-1 rounded-md">
              {Math.round(aiPersonality[trait.key] * 100)}%
            </span>
          </div>
          
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.1" 
            value={aiPersonality[trait.key]}
            onChange={(e) => handleChange(trait.key, parseFloat(e.target.value))}
            className="w-full accent-violet-600 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          
          <div className="flex justify-between mt-2 text-xs text-gray-500 font-medium">
            <span>{trait.min}</span>
            <span>{trait.max}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

function PreferencesTab() {
  const preferences = useVoiceProfileStore(state => state.preferences);
  const updatePreferences = useVoiceProfileStore(state => state.updatePreferences);
  
  const toggle = (key) => {
    updatePreferences({ [key]: !preferences[key] });
  };

  const options = [
    { key: 'useEmojis', label: 'Use Emojis in Text', desc: 'Add relevant emojis to messages' },
    { key: 'useTechnicalTerms', label: 'Technical Terminology', desc: 'Use industry-standard jargon' },
    { key: 'useExamples', label: 'Provide Examples', desc: 'Always give real-world examples' },
    { key: 'useAnalogies', label: 'Use Analogies', desc: 'Explain complex concepts with analogies' },
    { key: 'repeatKeyPoints', label: 'Repeat Key Points', desc: 'Summarize important takeaways' },
    { key: 'askForFeedback', label: 'Ask for Feedback', desc: 'Check if you understood correctly' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {options.map((opt) => (
        <button
          key={opt.key}
          onClick={() => toggle(opt.key)}
          className={`
            flex items-start gap-4 p-4 rounded-2xl border text-left transition-all group
            ${preferences[opt.key]
              ? 'bg-violet-50 border-violet-200 shadow-sm'
              : 'bg-white border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <div className={`
            mt-1 w-5 h-5 rounded-full border flex items-center justify-center transition-colors
            ${preferences[opt.key]
              ? 'bg-violet-600 border-violet-600'
              : 'bg-white border-gray-300 group-hover:border-gray-400'
            }
          `}>
            {preferences[opt.key] && <Check className="w-3 h-3 text-white" />}
          </div>
          
          <div>
            <h4 className={`font-bold ${preferences[opt.key] ? 'text-violet-900' : 'text-black'}`}>
              {opt.label}
            </h4>
            <p className="text-sm text-gray-500 mt-1">
              {opt.desc}
            </p>
          </div>
        </button>
      ))}
    </div>
  );
}

