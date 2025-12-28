/**
 * Session Module Configurations
 * 
 * Defines the contract for each learning module
 * NO free-form logic. NO shortcuts.
 */

import { SessionType } from './sessionManager';

/**
 * Mock Interview Configuration
 */
export const MockInterviewConfig = {
  type: SessionType.MOCK_INTERVIEW,
  
  requiredFields: [
    'title',
    'level',
    'aiCoach',
    'domain'
  ],
  
  levels: ['Beginner', 'Intermediate', 'Advanced'],
  
  aiCoaches: [
    { id: 'friendly', name: 'Friendly Coach', personality: 'Supportive and encouraging' },
    { id: 'strict', name: 'Strict Interviewer', personality: 'Direct and challenging' },
    { id: 'technical', name: 'Technical Expert', personality: 'Detailed and thorough' },
    { id: 'balanced', name: 'Balanced Coach', personality: 'Professional and fair' }
  ],
  
  domains: [
    'Frontend Development',
    'Backend Development',
    'Data Structures & Algorithms',
    'System Design',
    'HR & Behavioral',
    'Database & SQL',
    'DevOps & Cloud'
  ],
  
  questionCount: 10,
  
  initProcess: async (config) => {
    // Process 1: Generate questions (ASYNC)
    console.log('[MockInterview] Generating questions...');
    return {
      processType: 'async',
      task: 'generateQuestions',
      params: config
    };
  },
  
  cleanupActions: [
    'stopSpeechRecognition',
    'cancelPendingAI',
    'clearTempMemory'
  ]
};

/**
 * Lecture on Topic Configuration
 */
export const LectureConfig = {
  type: SessionType.LECTURE,
  
  requiredFields: [
    'topicTitle',
    'depthLevel',
    'teachingStyle',
    'durationTarget'
  ],
  
  depthLevels: ['Intro', 'Intermediate', 'Advanced'],
  
  teachingStyles: [
    { id: 'fast', name: 'Fast Overview', description: 'Quick summary of key points' },
    { id: 'detailed', name: 'Detailed Explanation', description: 'Comprehensive coverage' },
    { id: 'example-driven', name: 'Example-Driven', description: 'Learn through examples' }
  ],
  
  durationTargets: [
    { id: 'short', label: '5-10 minutes', duration: 10 },
    { id: 'medium', label: '10-20 minutes', duration: 20 },
    { id: 'long', label: '20-30 minutes', duration: 30 }
  ],
  
  initProcess: async (config) => {
    // Process 1: Generate lecture outline
    console.log('[Lecture] Generating outline...');
    return {
      processType: 'async',
      task: 'generateLectureOutline',
      params: config
    };
  },
  
  cleanupActions: [
    'stopAudio',
    'clearOutline'
  ]
};

/**
 * Q&A Prep Configuration
 */
export const QAPrepConfig = {
  type: SessionType.QA_PREP,
  
  requiredFields: [
    'topic',
    'difficulty',
    'mode'
  ],
  
  difficulties: ['Easy', 'Medium', 'Hard'],
  
  modes: [
    { id: 'explain-first', name: 'Explain First', description: 'Get explanation before attempting' },
    { id: 'ask-first', name: 'Ask First', description: 'Try answering before seeing explanation' },
    { id: 'mixed', name: 'Mixed Mode', description: 'Flexible learning approach' }
  ],
  
  questionCount: 15,
  
  initProcess: async (config) => {
    // Process 1: Generate question set
    console.log('[QAPrep] Generating questions...');
    return {
      processType: 'async',
      task: 'generateQASet',
      params: config
    };
  },
  
  cleanupActions: [
    'clearQuestions',
    'clearExplanations'
  ]
};

/**
 * Language Skill Configuration
 */
export const LanguageSkillConfig = {
  type: SessionType.LANGUAGE_SKILL,
  
  requiredFields: [
    'skillMode',
    'topic',
    'difficulty',
    'correctionStrictness'
  ],
  
  skillModes: [
    { id: 'speaking', name: 'Speaking Practice', requiresMic: true },
    { id: 'listening', name: 'Listening Comprehension', requiresMic: false },
    { id: 'vocabulary', name: 'Vocabulary Building', requiresMic: false },
    { id: 'grammar', name: 'Grammar Correction', requiresMic: true }
  ],
  
  difficulties: ['Beginner', 'Intermediate', 'Advanced'],
  
  correctionStrictnessLevels: [
    { id: 'low', name: 'Low', description: 'Focus on major errors only' },
    { id: 'medium', name: 'Medium', description: 'Balanced correction approach' },
    { id: 'high', name: 'High', description: 'Detailed correction of all errors' }
  ],
  
  initProcess: async (config) => {
    // Process 1: Prepare language exercise
    console.log('[LanguageSkill] Preparing exercise...');
    return {
      processType: 'async',
      task: 'prepareLanguageExercise',
      params: config
    };
  },
  
  cleanupActions: [
    'stopSpeechRecognition',
    'clearCorrections',
    'clearTranscript'
  ]
};

/**
 * Meditation Configuration
 */
export const MeditationConfig = {
  type: SessionType.MEDITATION,
  
  requiredFields: [
    'meditationType',
    'duration',
    'voiceStyle'
  ],
  
  meditationTypes: [
    { id: 'breathing', name: 'Breathing Exercise', pacing: 'slow' },
    { id: 'focus', name: 'Focus & Concentration', pacing: 'medium' },
    { id: 'sleep', name: 'Sleep Preparation', pacing: 'very-slow' },
    { id: 'stress-relief', name: 'Stress Relief', pacing: 'slow' }
  ],
  
  durations: [
    { id: 'short', label: '5 minutes', duration: 5 },
    { id: 'medium', label: '10 minutes', duration: 10 },
    { id: 'long', label: '15 minutes', duration: 15 }
  ],
  
  voiceStyles: [
    { id: 'soft', name: 'Soft & Gentle' },
    { id: 'neutral', name: 'Neutral & Calm' }
  ],
  
  initProcess: async (config) => {
    // Process 1: Generate meditation script (MUST be pre-generated)
    console.log('[Meditation] Generating script...');
    return {
      processType: 'async',
      task: 'generateMeditationScript',
      params: config
    };
  },
  
  cleanupActions: [
    'stopAudio',
    'clearScript'
  ],
  
  // ABSOLUTE RULE: No microphone during meditation
  disableMicrophone: true
};

/**
 * Get configuration for session type
 */
export function getSessionConfig(sessionType) {
  switch (sessionType) {
    case SessionType.MOCK_INTERVIEW:
      return MockInterviewConfig;
    case SessionType.LECTURE:
      return LectureConfig;
    case SessionType.QA_PREP:
      return QAPrepConfig;
    case SessionType.LANGUAGE_SKILL:
      return LanguageSkillConfig;
    case SessionType.MEDITATION:
      return MeditationConfig;
    default:
      console.error('[SessionConfig] Unknown session type:', sessionType);
      return null;
  }
}

/**
 * Validate configuration for session type
 */
export function validateSessionConfig(sessionType, config) {
  const sessionConfig = getSessionConfig(sessionType);
  if (!sessionConfig) return { valid: false, errors: ['Invalid session type'] };

  const errors = [];
  
  // Check required fields
  sessionConfig.requiredFields.forEach(field => {
    if (!config[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
}
