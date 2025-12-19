'use client';

import { create } from 'zustand';

/**
 * Natural Language Commands System
 * Parse and execute natural language user commands
 */

// Command Store
export const useCommandStore = create((set, get) => ({
  // Command history
  commandHistory: [],
  
  // Last executed command
  lastCommand: null,
  
  // Available commands registry
  commands: new Map(),
  
  // Actions
  registerCommand: (pattern, handler, description, examples) => {
    const commandId = Date.now().toString();
    get().commands.set(commandId, {
      id: commandId,
      pattern,
      handler,
      description,
      examples,
      usageCount: 0,
    });
  },
  
  parseCommand: async (input) => {
    const normalizedInput = input.toLowerCase().trim();
    
    // Try to match against registered patterns
    for (const [id, command] of get().commands) {
      const match = normalizedInput.match(command.pattern);
      if (match) {
        // Execute command
        const result = await command.handler(match, normalizedInput);
        
        // Update usage
        command.usageCount++;
        
        // Record in history
        set(state => ({
          commandHistory: [
            ...state.commandHistory,
            {
              id: Date.now().toString(),
              input,
              commandId: id,
              result,
              timestamp: new Date().toISOString(),
            },
          ].slice(-50),
          lastCommand: { input, result },
        }));
        
        return result;
      }
    }
    
    // No match found - use AI to interpret
    return await get().aiInterpret(normalizedInput);
  },
  
  aiInterpret: async (input) => {
    // Use AI to understand intent and execute
    const intent = get().detectIntent(input);
    
    switch (intent.type) {
      case 'start_session':
        return {
          action: 'navigate',
          path: '/dashboard',
          message: 'Starting a new session...',
        };
      
      case 'view_progress':
        return {
          action: 'navigate',
          path: '/dashboard?tab=analytics',
          message: 'Opening your progress dashboard...',
        };
      
      case 'change_topic':
        return {
          action: 'set_topic',
          topic: intent.params.topic,
          message: `Switching to ${intent.params.topic}...`,
        };
      
      case 'adjust_difficulty':
        return {
          action: 'set_difficulty',
          difficulty: intent.params.difficulty,
          message: `Adjusting difficulty to ${intent.params.difficulty}...`,
        };
      
      case 'unknown':
      default:
        return {
          action: 'none',
          message: 'I didn\'t understand that command. Try "help" to see available commands.',
        };
    }
  },
  
  detectIntent: (input) => {
    // Session management
    if (/^(start|begin|new|create)\s+(session|coaching|practice)/.test(input)) {
      return { type: 'start_session' };
    }
    
    if (/^(show|view|check|see)\s+(progress|stats|analytics|performance)/.test(input)) {
      return { type: 'view_progress' };
    }
    
    // Topic changes
    const topicMatch = input.match(/(?:change|switch|move|go)\s+(?:to|topic|subject)\s+(\w+)/);
    if (topicMatch) {
      return { type: 'change_topic', params: { topic: topicMatch[1] } };
    }
    
    // Difficulty adjustments
    const difficultyMatch = input.match(/(?:make|set|change)\s+(?:it\s+)?(?:to\s+)?(easier|harder|easy|medium|hard|difficult)/);
    if (difficultyMatch) {
      const diffMap = {
        easier: 'easy',
        easy: 'easy',
        harder: 'hard',
        hard: 'hard',
        difficult: 'hard',
        medium: 'medium',
      };
      return { type: 'adjust_difficulty', params: { difficulty: diffMap[difficultyMatch[1]] } };
    }
    
    // Achievements
    if (/(?:show|view|check|see)\s+(?:my\s+)?achievements/.test(input)) {
      return { type: 'view_achievements' };
    }
    
    // Help
    if (/^(help|commands|what can you do)/.test(input)) {
      return { type: 'show_help' };
    }
    
    return { type: 'unknown' };
  },
  
  getCommandSuggestions: (partialInput) => {
    const suggestions = [];
    const normalized = partialInput.toLowerCase();
    
    // Common command starters
    const starters = [
      { text: 'start new session', description: 'Begin a coaching session' },
      { text: 'show my progress', description: 'View analytics' },
      { text: 'change to leadership', description: 'Switch topic' },
      { text: 'make it easier', description: 'Reduce difficulty' },
      { text: 'make it harder', description: 'Increase difficulty' },
      { text: 'view achievements', description: 'See your badges' },
      { text: 'help', description: 'Show available commands' },
    ];
    
    starters.forEach(starter => {
      if (starter.text.startsWith(normalized) || normalized === '') {
        suggestions.push(starter);
      }
    });
    
    return suggestions.slice(0, 5);
  },
}));

/**
 * Initialize Default Commands
 */
export const initializeCommands = () => {
  const store = useCommandStore.getState();
  
  // Start session
  store.registerCommand(
    /^(start|begin|new)\s+(session|coaching)/,
    async (match) => ({
      action: 'navigate',
      path: '/dashboard',
      message: '🎯 Starting a new coaching session!',
    }),
    'Start a new coaching session',
    ['start session', 'begin coaching', 'new session']
  );
  
  // View progress
  store.registerCommand(
    /^(show|view|check)\s+(progress|stats|analytics)/,
    async (match) => ({
      action: 'navigate',
      path: '/dashboard?tab=analytics',
      message: '📊 Opening your progress dashboard...',
    }),
    'View your progress and analytics',
    ['show progress', 'view stats', 'check analytics']
  );
  
  // View achievements
  store.registerCommand(
    /^(show|view|check)\s+(achievements|badges|rewards)/,
    async (match) => ({
      action: 'navigate',
      path: '/dashboard?tab=achievements',
      message: '🏆 Opening your achievements...',
    }),
    'View your achievements and badges',
    ['show achievements', 'view badges', 'check rewards']
  );
  
  // Change difficulty
  store.registerCommand(
    /^(?:make|set)\s+(?:it\s+)?(easier|harder|easy|medium|hard)/,
    async (match) => {
      const diffMap = {
        easier: 'easy',
        easy: 'easy',
        harder: 'hard',
        hard: 'hard',
        medium: 'medium',
      };
      const difficulty = diffMap[match[1]];
      
      return {
        action: 'set_difficulty',
        difficulty,
        message: `⚡ Adjusting difficulty to ${difficulty}...`,
      };
    },
    'Adjust session difficulty',
    ['make it easier', 'make it harder', 'set to medium']
  );
  
  // Quick actions
  store.registerCommand(
    /^(pause|resume|stop|end)/,
    async (match) => ({
      action: 'session_control',
      control: match[1],
      message: `${match[1] === 'pause' ? '⏸️' : '⏹️'} ${match[1].charAt(0).toUpperCase() + match[1].slice(1)}ing session...`,
    }),
    'Control session playback',
    ['pause', 'resume', 'stop', 'end']
  );
  
  // Help command
  store.registerCommand(
    /^(help|commands|what can you do)/,
    async (match) => {
      const allCommands = Array.from(store.commands.values());
      const helpText = allCommands.map(cmd => 
        `• ${cmd.description}\n  Examples: ${cmd.examples.join(', ')}`
      ).join('\n\n');
      
      return {
        action: 'show_message',
        message: `📚 Available Commands:\n\n${helpText}`,
      };
    },
    'Show available commands',
    ['help', 'commands', 'what can you do']
  );
};

/**
 * Voice Command Integration
 */
export const processVoiceCommand = async (transcript) => {
  const store = useCommandStore.getState();
  
  // Check for wake word
  const normalized = transcript.toLowerCase();
  const wakeWords = ['hey coach', 'ok coach', 'coach'];
  
  let commandText = normalized;
  for (const wake of wakeWords) {
    if (normalized.startsWith(wake)) {
      commandText = normalized.replace(wake, '').trim();
      break;
    }
  }
  
  // Parse and execute
  return await store.parseCommand(commandText);
};

/**
 * Command Executor
 */
export const executeCommand = async (result, router) => {
  if (!result) return;
  
  switch (result.action) {
    case 'navigate':
      if (router) {
        router.push(result.path);
      }
      break;
    
    case 'set_difficulty':
      // Emit event for difficulty change
      window.dispatchEvent(new CustomEvent('difficulty-change', {
        detail: { difficulty: result.difficulty },
      }));
      break;
    
    case 'set_topic':
      // Emit event for topic change
      window.dispatchEvent(new CustomEvent('topic-change', {
        detail: { topic: result.topic },
      }));
      break;
    
    case 'session_control':
      // Emit event for session control
      window.dispatchEvent(new CustomEvent('session-control', {
        detail: { action: result.control },
      }));
      break;
    
    case 'show_message':
      // Show toast notification
      window.dispatchEvent(new CustomEvent('show-toast', {
        detail: { message: result.message },
      }));
      break;
    
    default:
      console.log('Unknown action:', result.action);
  }
  
  return result.message;
};

/**
 * Smart Suggestions based on context
 */
export const getContextualSuggestions = (context) => {
  const suggestions = [];
  
  // Based on page
  if (context.page === 'dashboard') {
    suggestions.push(
      { command: 'start new session', icon: '🎯', priority: 'high' },
      { command: 'view progress', icon: '📊', priority: 'medium' },
      { command: 'show achievements', icon: '🏆', priority: 'medium' }
    );
  }
  
  // Based on time of day
  const hour = new Date().getHours();
  if (hour < 12) {
    suggestions.push({ command: 'start morning session', icon: '☀️', priority: 'high' });
  } else if (hour > 20) {
    suggestions.push({ command: 'start evening review', icon: '🌙', priority: 'high' });
  }
  
  // Based on streak
  if (context.streak > 0) {
    suggestions.push({ command: 'maintain streak', icon: '🔥', priority: 'high' });
  }
  
  // Based on performance
  if (context.recentSuccessRate < 0.5) {
    suggestions.push({ command: 'make it easier', icon: '⚡', priority: 'high' });
  } else if (context.recentSuccessRate > 0.8) {
    suggestions.push({ command: 'increase challenge', icon: '💪', priority: 'medium' });
  }
  
  return suggestions.sort((a, b) => {
    const priority = { high: 3, medium: 2, low: 1 };
    return priority[b.priority] - priority[a.priority];
  });
};

/**
 * Natural Language Query Parser
 */
export const parseNaturalQuery = (query) => {
  const normalized = query.toLowerCase();
  
  // Extract entities
  const entities = {
    topics: [],
    timeframe: null,
    metrics: [],
    comparison: null,
  };
  
  // Topics
  const topics = ['communication', 'leadership', 'time-management', 'problem-solving', 'creativity'];
  topics.forEach(topic => {
    if (normalized.includes(topic) || normalized.includes(topic.replace('-', ' '))) {
      entities.topics.push(topic);
    }
  });
  
  // Timeframes
  if (/last\s+week/.test(normalized)) entities.timeframe = 'last-week';
  else if (/this\s+week/.test(normalized)) entities.timeframe = 'this-week';
  else if (/last\s+month/.test(normalized)) entities.timeframe = 'last-month';
  else if (/today/.test(normalized)) entities.timeframe = 'today';
  
  // Metrics
  const metricKeywords = {
    progress: ['progress', 'improvement', 'growth'],
    performance: ['performance', 'success', 'score'],
    time: ['time', 'duration', 'spent'],
    streak: ['streak', 'consistency'],
  };
  
  Object.entries(metricKeywords).forEach(([metric, keywords]) => {
    if (keywords.some(kw => normalized.includes(kw))) {
      entities.metrics.push(metric);
    }
  });
  
  // Comparison
  if (/compare|versus|vs|better|worse/.test(normalized)) {
    entities.comparison = true;
  }
  
  return {
    query,
    entities,
    intent: detectQueryIntent(entities, normalized),
  };
};

const detectQueryIntent = (entities, query) => {
  if (entities.metrics.includes('progress')) return 'view-progress';
  if (entities.metrics.includes('performance')) return 'view-performance';
  if (entities.comparison) return 'compare-performance';
  if (entities.topics.length > 0) return 'topic-analysis';
  if (entities.timeframe) return 'time-analysis';
  
  return 'general-query';
};

/**
 * React Hooks
 */

// Use command parser
export const useCommandParser = () => {
  const parseCommand = useCommandStore(state => state.parseCommand);
  return { parseCommand };
};

// Get command history
export const useCommandHistory = () => {
  return useCommandStore(state => state.commandHistory);
};

// Get last command
export const useLastCommand = () => {
  return useCommandStore(state => state.lastCommand);
};
