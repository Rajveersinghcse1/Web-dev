'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * Voice Profiles System
 * Manages voice customization, accents, speeds, and AI personality traits
 */

// Voice Profile Store
export const useVoiceProfileStore = create(
  persist(
    (set, get) => ({
      // Current active profile
      activeProfile: null,
      
      // All saved profiles
      profiles: [],
      
      // Voice settings
      voiceSettings: {
        pitch: 1.0,        // 0.5 - 2.0
        speed: 1.0,        // 0.5 - 2.0
        volume: 1.0,       // 0.0 - 1.0
        accent: 'neutral', // neutral, british, american, australian, indian
        gender: 'neutral', // neutral, male, female
        age: 'adult',      // child, young, adult, senior
        emotion: 'neutral', // neutral, friendly, energetic, calm, professional
      },
      
      // AI personality traits
      aiPersonality: {
        formality: 0.5,      // 0 = casual, 1 = very formal
        enthusiasm: 0.5,     // 0 = calm, 1 = very enthusiastic
        encouragement: 0.7,  // 0 = neutral, 1 = very encouraging
        detail: 0.5,         // 0 = brief, 1 = very detailed
        humor: 0.3,          // 0 = serious, 1 = very humorous
        patience: 0.8,       // 0 = direct, 1 = very patient
      },
      
      // Voice preferences
      preferences: {
        useEmojis: true,
        useTechnicalTerms: false,
        useExamples: true,
        useAnalogies: true,
        repeatKeyPoints: true,
        askForFeedback: true,
      },
      
      // Actions
      setActiveProfile: (profileId) => {
        const profile = get().profiles.find(p => p.id === profileId);
        if (profile) {
          set({ 
            activeProfile: profile.id,
            voiceSettings: profile.voiceSettings,
            aiPersonality: profile.aiPersonality,
            preferences: profile.preferences,
          });
        }
      },
      
      createProfile: (name, description = '') => {
        const newProfile = {
          id: Date.now().toString(),
          name,
          description,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          voiceSettings: { ...get().voiceSettings },
          aiPersonality: { ...get().aiPersonality },
          preferences: { ...get().preferences },
          isCustom: true,
        };
        
        set(state => ({
          profiles: [...state.profiles, newProfile],
          activeProfile: newProfile.id,
        }));
        
        return newProfile;
      },
      
      updateProfile: (profileId, updates) => {
        set(state => ({
          profiles: state.profiles.map(p => 
            p.id === profileId 
              ? { ...p, ...updates, updatedAt: new Date().toISOString() }
              : p
          ),
        }));
      },
      
      deleteProfile: (profileId) => {
        set(state => ({
          profiles: state.profiles.filter(p => p.id !== profileId),
          activeProfile: state.activeProfile === profileId ? null : state.activeProfile,
        }));
      },
      
      updateVoiceSettings: (settings) => {
        set(state => ({
          voiceSettings: { ...state.voiceSettings, ...settings },
        }));
        
        // Update active profile if exists
        const activeProfile = get().activeProfile;
        if (activeProfile) {
          get().updateProfile(activeProfile, {
            voiceSettings: get().voiceSettings,
          });
        }
      },
      
      updateAIPersonality: (personality) => {
        set(state => ({
          aiPersonality: { ...state.aiPersonality, ...personality },
        }));
        
        const activeProfile = get().activeProfile;
        if (activeProfile) {
          get().updateProfile(activeProfile, {
            aiPersonality: get().aiPersonality,
          });
        }
      },
      
      updatePreferences: (prefs) => {
        set(state => ({
          preferences: { ...state.preferences, ...prefs },
        }));
        
        const activeProfile = get().activeProfile;
        if (activeProfile) {
          get().updateProfile(activeProfile, {
            preferences: get().preferences,
          });
        }
      },
      
      resetToDefaults: () => {
        set({
          voiceSettings: {
            pitch: 1.0,
            speed: 1.0,
            volume: 1.0,
            accent: 'neutral',
            gender: 'neutral',
            age: 'adult',
            emotion: 'neutral',
          },
          aiPersonality: {
            formality: 0.5,
            enthusiasm: 0.5,
            encouragement: 0.7,
            detail: 0.5,
            humor: 0.3,
            patience: 0.8,
          },
          preferences: {
            useEmojis: true,
            useTechnicalTerms: false,
            useExamples: true,
            useAnalogies: true,
            repeatKeyPoints: true,
            askForFeedback: true,
          },
        });
      },
      
      // Initialize default profiles
      initializeDefaultProfiles: () => {
        const defaults = [
          {
            id: 'professional',
            name: 'Professional',
            description: 'Formal and detailed coaching style',
            isCustom: false,
            createdAt: new Date().toISOString(),
            voiceSettings: {
              pitch: 1.0,
              speed: 0.9,
              volume: 1.0,
              accent: 'neutral',
              gender: 'neutral',
              age: 'adult',
              emotion: 'professional',
            },
            aiPersonality: {
              formality: 0.9,
              enthusiasm: 0.4,
              encouragement: 0.6,
              detail: 0.8,
              humor: 0.1,
              patience: 0.7,
            },
            preferences: {
              useEmojis: false,
              useTechnicalTerms: true,
              useExamples: true,
              useAnalogies: false,
              repeatKeyPoints: true,
              askForFeedback: true,
            },
          },
          {
            id: 'friendly',
            name: 'Friendly',
            description: 'Casual and encouraging coaching style',
            isCustom: false,
            createdAt: new Date().toISOString(),
            voiceSettings: {
              pitch: 1.1,
              speed: 1.0,
              volume: 1.0,
              accent: 'neutral',
              gender: 'neutral',
              age: 'young',
              emotion: 'friendly',
            },
            aiPersonality: {
              formality: 0.3,
              enthusiasm: 0.8,
              encouragement: 0.9,
              detail: 0.4,
              humor: 0.6,
              patience: 0.9,
            },
            preferences: {
              useEmojis: true,
              useTechnicalTerms: false,
              useExamples: true,
              useAnalogies: true,
              repeatKeyPoints: false,
              askForFeedback: true,
            },
          },
          {
            id: 'energetic',
            name: 'Energetic',
            description: 'High-energy motivational coaching',
            isCustom: false,
            createdAt: new Date().toISOString(),
            voiceSettings: {
              pitch: 1.2,
              speed: 1.1,
              volume: 1.0,
              accent: 'neutral',
              gender: 'neutral',
              age: 'young',
              emotion: 'energetic',
            },
            aiPersonality: {
              formality: 0.4,
              enthusiasm: 1.0,
              encouragement: 1.0,
              detail: 0.3,
              humor: 0.7,
              patience: 0.6,
            },
            preferences: {
              useEmojis: true,
              useTechnicalTerms: false,
              useExamples: true,
              useAnalogies: true,
              repeatKeyPoints: true,
              askForFeedback: true,
            },
          },
          {
            id: 'calm',
            name: 'Calm',
            description: 'Relaxed and patient coaching style',
            isCustom: false,
            createdAt: new Date().toISOString(),
            voiceSettings: {
              pitch: 0.9,
              speed: 0.8,
              volume: 0.9,
              accent: 'neutral',
              gender: 'neutral',
              age: 'adult',
              emotion: 'calm',
            },
            aiPersonality: {
              formality: 0.5,
              enthusiasm: 0.3,
              encouragement: 0.7,
              detail: 0.7,
              humor: 0.2,
              patience: 1.0,
            },
            preferences: {
              useEmojis: false,
              useTechnicalTerms: false,
              useExamples: true,
              useAnalogies: true,
              repeatKeyPoints: true,
              askForFeedback: true,
            },
          },
        ];
        
        // Only initialize if no profiles exist
        if (get().profiles.length === 0) {
          set({ profiles: defaults, activeProfile: 'friendly' });
        }
      },
    }),
    {
      name: 'voice-profiles',
    }
  )
);

/**
 * Voice Profile Utilities
 */

// Get personality-adjusted prompt prefix
export const getPersonalityPrompt = (personality, preferences) => {
  const traits = [];
  
  // Formality
  if (personality.formality > 0.7) traits.push('Be very formal and professional');
  else if (personality.formality < 0.3) traits.push('Be casual and conversational');
  
  // Enthusiasm
  if (personality.enthusiasm > 0.7) traits.push('Show high energy and excitement');
  else if (personality.enthusiasm < 0.3) traits.push('Maintain a calm and measured tone');
  
  // Encouragement
  if (personality.encouragement > 0.7) traits.push('Be very encouraging and supportive');
  else if (personality.encouragement < 0.3) traits.push('Be neutral and objective');
  
  // Detail level
  if (personality.detail > 0.7) traits.push('Provide detailed explanations');
  else if (personality.detail < 0.3) traits.push('Keep responses brief and concise');
  
  // Humor
  if (personality.humor > 0.5) traits.push('Use appropriate humor when possible');
  
  // Patience
  if (personality.patience > 0.7) traits.push('Be very patient and thorough');
  
  // Preferences
  const prefTraits = [];
  if (preferences.useEmojis) prefTraits.push('use emojis');
  if (preferences.useTechnicalTerms) prefTraits.push('use technical terminology');
  if (preferences.useExamples) prefTraits.push('provide examples');
  if (preferences.useAnalogies) prefTraits.push('use analogies');
  if (preferences.repeatKeyPoints) prefTraits.push('repeat key points for clarity');
  
  let prompt = 'You are an AI coaching assistant. ';
  if (traits.length > 0) {
    prompt += traits.join('. ') + '. ';
  }
  if (prefTraits.length > 0) {
    prompt += 'Please ' + prefTraits.join(', ') + '.';
  }
  
  return prompt;
};

// Apply voice settings to speech synthesis
export const applyVoiceSettings = (utterance, settings) => {
  if (!utterance) return;
  
  utterance.pitch = settings.pitch;
  utterance.rate = settings.speed;
  utterance.volume = settings.volume;
  
  // Try to find voice matching accent/gender/age
  const voices = window.speechSynthesis?.getVoices() || [];
  
  const findVoice = () => {
    // Priority: accent > gender > age
    const accentMap = {
      neutral: ['en-US', 'en'],
      british: ['en-GB'],
      american: ['en-US'],
      australian: ['en-AU'],
      indian: ['en-IN'],
    };
    
    const targetLocales = accentMap[settings.accent] || ['en-US'];
    
    // Try to match accent
    for (const locale of targetLocales) {
      const voice = voices.find(v => v.lang.startsWith(locale));
      if (voice) return voice;
    }
    
    // Fallback to any English voice
    return voices.find(v => v.lang.startsWith('en')) || voices[0];
  };
  
  const voice = findVoice();
  if (voice) {
    utterance.voice = voice;
  }
  
  return utterance;
};

// Get profile stats
export const getProfileStats = (profileId, sessions = []) => {
  const profileSessions = sessions.filter(s => s.profileId === profileId);
  
  return {
    totalSessions: profileSessions.length,
    totalDuration: profileSessions.reduce((acc, s) => acc + (s.duration || 0), 0),
    averageRating: profileSessions.length > 0
      ? profileSessions.reduce((acc, s) => acc + (s.rating || 0), 0) / profileSessions.length
      : 0,
    lastUsed: profileSessions.length > 0
      ? Math.max(...profileSessions.map(s => new Date(s.createdAt).getTime()))
      : null,
  };
};

// Compare two profiles
export const compareProfiles = (profile1, profile2) => {
  const differences = {
    voice: {},
    personality: {},
    preferences: {},
  };
  
  // Voice settings
  Object.keys(profile1.voiceSettings).forEach(key => {
    if (profile1.voiceSettings[key] !== profile2.voiceSettings[key]) {
      differences.voice[key] = {
        profile1: profile1.voiceSettings[key],
        profile2: profile2.voiceSettings[key],
      };
    }
  });
  
  // Personality
  Object.keys(profile1.aiPersonality).forEach(key => {
    if (profile1.aiPersonality[key] !== profile2.aiPersonality[key]) {
      differences.personality[key] = {
        profile1: profile1.aiPersonality[key],
        profile2: profile2.aiPersonality[key],
      };
    }
  });
  
  // Preferences
  Object.keys(profile1.preferences).forEach(key => {
    if (profile1.preferences[key] !== profile2.preferences[key]) {
      differences.preferences[key] = {
        profile1: profile1.preferences[key],
        profile2: profile2.preferences[key],
      };
    }
  });
  
  return differences;
};

// Export profile to JSON
export const exportProfile = (profile) => {
  const exportData = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    profile: {
      name: profile.name,
      description: profile.description,
      voiceSettings: profile.voiceSettings,
      aiPersonality: profile.aiPersonality,
      preferences: profile.preferences,
    },
  };
  
  return JSON.stringify(exportData, null, 2);
};

// Import profile from JSON
export const importProfile = (jsonString) => {
  try {
    const data = JSON.parse(jsonString);
    
    if (!data.version || !data.profile) {
      throw new Error('Invalid profile format');
    }
    
    return {
      id: Date.now().toString(),
      name: data.profile.name + ' (Imported)',
      description: data.profile.description,
      voiceSettings: data.profile.voiceSettings,
      aiPersonality: data.profile.aiPersonality,
      preferences: data.profile.preferences,
      isCustom: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  } catch (error) {
    console.error('Failed to import profile:', error);
    return null;
  }
};

/**
 * React Hooks
 */

// Hook to use active profile
export const useActiveProfile = () => {
  const activeProfileId = useVoiceProfileStore(state => state.activeProfile);
  const profiles = useVoiceProfileStore(state => state.profiles);
  
  return profiles.find(p => p.id === activeProfileId) || null;
};

// Hook to get personality prompt
export const usePersonalityPrompt = () => {
  const personality = useVoiceProfileStore(state => state.aiPersonality);
  const preferences = useVoiceProfileStore(state => state.preferences);
  
  return getPersonalityPrompt(personality, preferences);
};

// Hook to apply voice to utterance
export const useVoiceUtterance = () => {
  const settings = useVoiceProfileStore(state => state.voiceSettings);
  
  return (text) => {
    const utterance = new SpeechSynthesisUtterance(text);
    return applyVoiceSettings(utterance, settings);
  };
};
