/**
 * Global Services for AI Coaching Voice Agent
 * =============================================
 * Version: 3.0.0
 * 
 * Features:
 * - Gemini 2.5 Flash as the ONLY AI model
 * - Advanced TTS with fallback chain
 * - Web Speech API for STT
 * - Error handling with retries
 * - Network status monitoring
 * - Conversation export (PDF)
 * - Session-aware context loading
 * - Automatic feedback regeneration
 */

import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { CoachingOptions } from "@/services/Options";
import { useVoiceProfileStore } from '@/lib/voiceProfiles';

// ==================== Configuration ====================

const getPythonTTSUrl = () => {
    if (typeof window !== 'undefined') {
        // If running in browser, try to use the same hostname
        const hostname = window.location.hostname;
        return `http://${hostname}:5000`;
    }
    return 'http://localhost:5000'; // Default for SSR
};

const CONFIG = {
    get PYTHON_TTS_URL() { return getPythonTTSUrl() },
    MAX_RETRIES: 3,
    RETRY_DELAY: 1000,
    TOKEN_CACHE_DURATION: 3600000, // 1 hour
    AI_TIMEOUT: 30000,
    TTS_TIMEOUT: 30000,
    MAX_CONTEXT_MESSAGES: 15, // Increased for better conversation tracking
    GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.Gemini_API_Key || 'AIzaSyAKwqIyU55FS7b6F_Y_htc8Rw4v18RyzvM'
};

// Initialize Gemini 2.5 Flash as the ONLY AI
const geminiAI = new GoogleGenerativeAI(CONFIG.GEMINI_API_KEY);

// ==================== Network Status ====================

let isOnline = typeof window !== 'undefined' ? navigator.onLine : true;
let pythonServerAvailable = null; // null = unknown, true/false = tested

if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        isOnline = true;
        console.log('🌐 Network: Online');
    });
    window.addEventListener('offline', () => {
        isOnline = false;
        console.log('📴 Network: Offline');
    });
}

export const getNetworkStatus = () => ({
    online: isOnline,
    pythonServer: pythonServerAvailable
});

// Check Python server availability
export const checkPythonServer = async () => {
    try {
        const response = await axios.get(`${CONFIG.PYTHON_TTS_URL}/health`, { timeout: 3000 });
        pythonServerAvailable = response.data?.status === 'healthy';
        return pythonServerAvailable;
    } catch {
        pythonServerAvailable = false;
        return false;
    }
};

// ==================== Utility Functions ====================

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const retryWithBackoff = async (fn, retries = CONFIG.MAX_RETRIES, delay = CONFIG.RETRY_DELAY) => {
    let lastError;
    for (let i = 0; i < retries; i++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;
            console.warn(`Attempt ${i + 1}/${retries} failed:`, error.message);
            if (i < retries - 1) {
                await wait(delay * Math.pow(2, i));
            }
        }
    }
    throw lastError;
};

// ==================== Token Management ====================

let cachedToken = null;
let tokenExpiry = null;

export const getToken = async (forceRefresh = false) => {
    // Return cached token if valid
    if (!forceRefresh && cachedToken && tokenExpiry && Date.now() < tokenExpiry - 300000) {
        console.log('✓ Using cached AssemblyAI token');
        return cachedToken;
    }

    try {
        const result = await retryWithBackoff(async () => {
            const response = await axios.get('/api/getToken', { timeout: 15000 });
            return response;
        });
        
        const tokenData = result.data;
        
        if (tokenData?.error) {
            throw new Error(tokenData.error);
        }
        
        let token = typeof tokenData === 'string' 
            ? tokenData 
            : tokenData?.token || tokenData;
        
        if (typeof token === 'object') {
            token = token.token || JSON.stringify(token);
        }
        
        if (!token || typeof token !== 'string' || token.length < 10) {
            throw new Error('Invalid token format');
        }
        
        cachedToken = token;
        tokenExpiry = Date.now() + CONFIG.TOKEN_CACHE_DURATION;
        
        console.log('✓ AssemblyAI token cached');
        return token;
    } catch (error) {
        cachedToken = null;
        tokenExpiry = null;
        throw new Error('Token fetch failed: ' + (error.message || 'Unknown error'));
    }
};

export const clearTokenCache = () => {
    cachedToken = null;
    tokenExpiry = null;
};

// ==================== Gemini 2.5 Flash AI ====================

// Available Gemini models (fallback chain)
const GEMINI_MODELS = [
    'gemini-2.5-flash',
   
];

/**
 * Call Gemini API with model fallback
 * Includes anti-repetition logic to ensure varied responses
 */
const callGemini = async (systemPrompt, messages, maxTokens = 1024) => {
    let lastError = null;
    
    // Extract previous AI responses to avoid repetition
    const previousResponses = messages
        .filter(m => m.role === 'assistant')
        .slice(-3) // Last 3 AI responses
        .map(m => m.content.substring(0, 100))
        .join(' | ');
    
    // Enhanced anti-repetition instructions
    const enhancedPrompt = `${systemPrompt}

CRITICAL ANTI-REPETITION RULES:
- NEVER repeat the same question or statement you've already said
- ALWAYS vary your responses - use different words, examples, and approaches
- Track what you've already asked/said and ask something NEW each time
- If you've asked about X, move on to Y or go deeper into X
- Previous responses to avoid repeating: ${previousResponses || 'None yet'}
- Each response must add NEW value to the conversation`;
    
    for (const modelName of GEMINI_MODELS) {
        try {
            console.log(`Trying Gemini model: ${modelName}`);
            // systemInstruction MUST be in getGenerativeModel, not startChat
            const model = geminiAI.getGenerativeModel({ 
                model: modelName,
                systemInstruction: enhancedPrompt
            });
            
            // Convert messages to Gemini format
            const history = messages.map(msg => ({
                role: msg.role === 'assistant' ? 'model' : 'user',
                parts: [{ text: msg.content }]
            }));
            
            // Start chat with history (no systemInstruction here)
            const chat = model.startChat({
                history: history.length > 1 ? history.slice(0, -1) : [],
                generationConfig: {
                    maxOutputTokens: maxTokens,
                    temperature: 0.8, // Slightly higher for more variety
                    topP: 0.95,
                    topK: 40,
                },
            });
            
            // Send the last message
            const lastMessage = messages[messages.length - 1];
            const result = await chat.sendMessage(lastMessage?.content || 'Hello');
            const responseText = result.response.text();
            
            if (responseText) {
                console.log(`✓ Success with model: ${modelName}`);
                return responseText;
            }
        } catch (error) {
            console.warn(`Model ${modelName} failed:`, error.message);
            lastError = error;
        }
    }
    
    throw lastError || new Error('All Gemini models failed');
};

/**
 * Send message to AI and get response
 * GUARANTEED to return a valid response - never fails
 * Includes smart conversation tracking to prevent repetitive responses
 */
export const AIModel = async (topic, coachingOption, conversationHistory, userProfile = null) => {
    const option = CoachingOptions.find((item) => item.name === coachingOption);
    
    // Track conversation statistics for smarter responses
    const messageCount = conversationHistory.length;
    const userMessages = conversationHistory.filter(m => m.role === 'user');
    const assistantMessages = conversationHistory.filter(m => m.role === 'assistant');
    const lastUserMessage = userMessages[userMessages.length - 1];
    
    // Fallback response generator based on context
    const generateFallbackResponse = () => {
        const userQuery = lastUserMessage?.content || topic;
        
        const fallbacks = {
            'Lecture on Topic': `(Professor Shweta): Great question about ${topic}! Let me explain this concept. ${topic} is a fundamental area that involves understanding core principles and their practical applications. What specific aspect would you like me to elaborate on?`,
            'Mock Interview': `(Jokey): That's an interesting response regarding ${topic}. Let me ask you a follow-up question: Can you describe a specific situation where you applied your knowledge of ${topic}? Please share concrete examples.`,
            'Ques Ans Prep': `(Coach Sarah): Let's continue preparing for ${topic}. Here's an important question to consider: What are the key concepts in ${topic} that you find most challenging? Let's work through them together.`,
            'Languages Skill': `(Tutor Alex): Good progress with ${topic}! Let's practice more. Can you try using the vocabulary we discussed in a complete sentence? I'll help you with pronunciation and grammar.`,
            'Meditation': `(Guide Maya): Take a deep breath in... and slowly exhale. As we continue our ${topic} meditation, let your mind settle into a calm, peaceful state. Focus on the gentle rhythm of your breathing.`
        };
        
        return fallbacks[coachingOption] || `Let's continue our discussion about ${topic}. What would you like to explore next?`;
    };

    // If offline, still provide a contextual response
    if (!isOnline) {
        return {
            role: 'assistant',
            content: generateFallbackResponse()
        };
    }

    if (!option) {
        return {
            role: 'assistant',
            content: generateFallbackResponse()
        };
    }

    // Create session-aware system prompt based on topic/title
    const sessionContext = getSessionContext(coachingOption, topic);
    
    // Get Voice Profile Settings (Personality & Preferences)
    const voiceStore = useVoiceProfileStore.getState();
    const personality = voiceStore.aiPersonality;
    const prefs = voiceStore.preferences;

    // Construct Personality Context
    const personalityContext = `

PERSONALITY CONFIGURATION:
- Formality Level: ${personality.formality} (0=Casual, 1=Formal)
- Enthusiasm Level: ${personality.enthusiasm} (0=Calm, 1=Excited)
- Encouragement Level: ${personality.encouragement} (0=Neutral, 1=Supportive)
- Detail Level: ${personality.detail} (0=Brief, 1=Detailed)
- Humor Level: ${personality.humor} (0=Serious, 1=Funny)
- Patience Level: ${personality.patience} (0=Direct, 1=Patient)

COMMUNICATION PREFERENCES:
- Use Emojis: ${prefs.useEmojis ? 'YES' : 'NO'}
- Use Technical Terms: ${prefs.useTechnicalTerms ? 'YES' : 'NO'}
- Provide Examples: ${prefs.useExamples ? 'YES' : 'NO'}
- Use Analogies: ${prefs.useAnalogies ? 'YES' : 'NO'}
- Repeat Key Points: ${prefs.repeatKeyPoints ? 'YES' : 'NO'}
- Ask for Feedback: ${prefs.askForFeedback ? 'YES' : 'NO'}

PERSONALITY INSTRUCTIONS:
- Adjust your tone to match the Formality (${personality.formality > 0.7 ? 'Very Formal' : personality.formality < 0.3 ? 'Very Casual' : 'Balanced'}) and Enthusiasm levels.
- ${prefs.useEmojis ? 'Include relevant emojis in your response to add expression.' : 'Do NOT use emojis.'}
- ${prefs.useTechnicalTerms ? 'Use industry-standard technical terminology where appropriate.' : 'Use simple, accessible language.'}
- ${prefs.useExamples ? 'Always provide a concrete real-world example to illustrate your point.' : ''}
- ${prefs.useAnalogies ? 'Use analogies to explain complex concepts.' : ''}
- ${personality.humor > 0.7 ? 'Feel free to use humor or light jokes where appropriate.' : 'Maintain a serious demeanor.'}
- ${personality.detail > 0.7 ? 'Provide comprehensive, detailed explanations.' : 'Keep responses concise and to the point.'}
`;

    // Add conversation state awareness
    let conversationState = `

CONVERSATION STATE:
- Message count: ${messageCount} (${userMessages.length} from user, ${assistantMessages.length} from AI)
- User's latest message: "${lastUserMessage?.content || 'Starting conversation'}"
- Session topic: "${topic}"
- Coaching type: "${coachingOption}"`;

    // Add User Profile Context if available
    if (userProfile) {
        conversationState += `

USER PROFILE CONTEXT:
- Level: ${userProfile.level}
- Learning Style: ${userProfile.learningStyle}
- Mastered Topics: ${userProfile.masteredTopics.join(', ') || 'None'}
- Difficult Topics: ${userProfile.difficultTopics.join(', ') || 'None'}
- Preferred Pace: ${userProfile.pacePreference}

ADAPTATION INSTRUCTIONS:
- Adjust complexity to match user level ${userProfile.level}
- If user struggles with ${userProfile.difficultTopics.join(', ')}, provide extra examples and simpler explanations
- Match the user's ${userProfile.learningStyle} learning style (e.g., if visual, describe diagrams; if practical, give exercises)
- Respect the user's preferred pace: ${userProfile.pacePreference}`;
    }

    conversationState += `

RESPONSE GUIDELINES:
- If this is the first message, introduce yourself and start the session appropriately
- If user just answered a question, acknowledge their answer, provide feedback, then move forward
- NEVER ask the same question twice - track what you've already asked
- Build on previous exchanges - reference what was discussed before
- If user seems stuck, offer hints or rephrase instead of repeating
- Keep responses focused and relevant to "${topic}"`;

    const systemPrompt = option.prompt.replace(/{user_topic}/g, topic) + sessionContext + personalityContext + conversationState;
    
    // Use more context for better continuity (last 15 messages)
    const contextMessages = conversationHistory.slice(-15);
    
    // Try multiple times with different strategies
    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            console.log(`🚀 AI attempt ${attempt + 1}/5...`);
            const response = await callGemini(systemPrompt, contextMessages);

            if (response && response.trim().length > 10) {
                console.log('✓ AI Response received');
                return {
                    role: 'assistant',
                    content: response
                };
            }
        } catch (error) {
            console.warn(`Attempt ${attempt + 1} failed:`, error.message);
            await wait(500 * (attempt + 1)); // Increasing delay
        }
    }

    // GUARANTEED fallback - never return an error
    console.log('Using intelligent fallback response');
    return {
        role: 'assistant',
        content: generateFallbackResponse()
    };
};

/**
 * Get session-specific context based on coaching type and topic
 * Auto-tunes questions and responses based on session title
 */
const getSessionContext = (coachingOption, topic) => {
    const topicKeywords = topic.toLowerCase();
    
    const contexts = {
        'Lecture on Topic': `

IMPORTANT SESSION CONTEXT:
- Session Title: "${topic}"
- Your Role: "Professor Shweta", an expert lecturer teaching about "${topic}".
- Personality: Academic, patient, encouraging, and articulate. Speaks naturally like a real human teacher.
- You MUST tailor ALL explanations, examples, and questions specifically to "${topic}"
- Start by introducing yourself as Professor Shweta and asking what specific aspects of "${topic}" the student wants to learn.
- Use real-world examples related to "${topic}"
- Ask comprehension questions about "${topic}" concepts
- Build knowledge progressively from basics to advanced concepts of "${topic}"
- Always stay focused on "${topic}" - don't drift to unrelated subjects
- Engage in a two-way conversation, not a monologue.`,
        
        'Mock Interview': `

IMPORTANT SESSION CONTEXT:
- Session Title: "${topic}"
- Your Role: "Jokey", a professional senior recruiter/interviewer for "${topic}" position/subject.
- Personality: Professional, strict but fair, analytical, and direct. Speaks naturally like a real interviewer.
- You MUST ask interview questions specifically about "${topic}"
- Start by introducing yourself as Jokey and saying: "Let's begin the interview for ${topic}. Tell me about your experience with ${topic}."
- Ask technical questions related to "${topic}"
- Ask behavioral questions in context of "${topic}"
- Evaluate answers based on "${topic}" requirements
- Provide specific feedback on how to improve answers about "${topic}"
- Suggest commonly asked interview questions for "${topic}"
- Engage in a two-way conversation, probing deeper into answers.`,
        
        'Ques Ans Prep': `

IMPORTANT SESSION CONTEXT:
- Session Title: "${topic}"
- Your Role: "Coach Sarah", a study coach helping prepare for "${topic}" exam/quiz.
- Personality: Energetic, supportive, quizzical, and structured. Speaks naturally like a study buddy/coach.
- You MUST focus questions and answers specifically on "${topic}"
- Start by introducing yourself as Coach Sarah and asking: "What aspects of ${topic} do you need to prepare for?"
- Generate practice questions about "${topic}"
- Explain concepts related to "${topic}" clearly
- Create flashcard-style Q&A for "${topic}"
- Test understanding with progressively harder "${topic}" questions
- Identify weak areas in "${topic}" knowledge and address them
- Engage in a two-way conversation, adapting to the user's pace.`,
        
        'Languages Skill': `

IMPORTANT SESSION CONTEXT:
- Session Title: "${topic}"
- Your Role: "Tutor Alex", a language coach for "${topic}".
- Personality: Articulate, patient, culturally aware, and corrective. Speaks naturally with clear pronunciation.
- You MUST focus on "${topic}" language skills
- If "${topic}" is a language (English, Spanish, etc.), teach that language
- If "${topic}" is a subject, teach vocabulary related to that subject
- Practice conversation in context of "${topic}"
- Correct grammar and pronunciation for "${topic}" related vocabulary
- Teach common phrases and expressions for "${topic}"
- Start by introducing yourself as Tutor Alex and saying: "Let's practice ${topic}. What's your current level?"
- Engage in a two-way conversation, encouraging the user to speak more.`,
        
        'Meditation': `

IMPORTANT SESSION CONTEXT:
- Session Title: "${topic}"
- Your Role: "Guide Maya", a meditation guide focusing on "${topic}".
- Personality: Calm, soothing, soft-spoken, and mindful. Speaks naturally with a relaxing tone.
- You MUST tailor the meditation to "${topic}"
- If "${topic}" is stress/anxiety - focus on calming techniques
- If "${topic}" is focus/concentration - use mindfulness exercises
- If "${topic}" is sleep - guide relaxation for rest
- Customize breathing exercises for "${topic}" goals
- Use visualizations relevant to "${topic}"
- Start by introducing yourself as Guide Maya and saying: "Welcome to this ${topic} meditation session. Let's begin with deep breaths..."
- Engage in a guided session, pausing for user to follow instructions.`
    };
    
    return contexts[coachingOption] || `\n\nThis session is about "${topic}". Focus all questions and responses on this specific topic.`;
};

/**
 * Generate feedback and notes from conversation
 * GUARANTEED to return valid feedback - never fails
 */
export const AIModelToGenerateFeedbackAndNotes = async (coachingOption, conversation, retryCount = 0) => {
    const option = CoachingOptions.find((item) => item.name === coachingOption);
    
    // Generate intelligent fallback feedback from conversation context
    const generateFallbackFeedback = () => {
        const userMessages = conversation.filter(m => m.role === 'user');
        const assistantMessages = conversation.filter(m => m.role === 'assistant');
        const messageCount = conversation.length;
        const topicsDiscussed = userMessages.map(m => m.content.substring(0, 50)).join(', ');
        
        const feedbackTemplates = {
            'Lecture on Topic': `## 📚 Session Summary & Notes

### Key Points Covered
- Total exchanges: ${messageCount} messages
- Topics explored: ${topicsDiscussed.substring(0, 200)}...

### Learning Highlights
1. **Core Concepts**: You engaged with fundamental concepts during this session
2. **Questions Asked**: ${userMessages.length} questions were explored
3. **Explanations Provided**: ${assistantMessages.length} detailed explanations given

### Strengths Observed
- Active participation in the learning process
- Willingness to explore complex topics
- Good engagement with the material

### Recommendations for Further Study
1. Review the key concepts discussed today
2. Practice applying these concepts in real scenarios
3. Prepare follow-up questions for deeper understanding
4. Consider related topics that connect to today's learning

### Next Steps
- Revisit challenging concepts
- Apply learned knowledge practically
- Schedule a follow-up session for advanced topics`,

            'Mock Interview': `## 🎯 Interview Performance Feedback

### Session Overview
- Interview exchanges: ${messageCount} messages
- Questions covered: ${Math.floor(userMessages.length / 2)} interview questions

### Performance Analysis

#### Strengths Demonstrated
- Engaged actively with interview questions
- Showed willingness to elaborate on responses
- Maintained professional communication

#### Areas for Improvement
1. **STAR Method**: Structure answers using Situation, Task, Action, Result
2. **Specificity**: Include more concrete examples and metrics
3. **Confidence**: Practice delivering answers with assurance

### Key Interview Tips
1. Research the company thoroughly before interviews
2. Prepare 3-5 stories that showcase your skills
3. Practice answering common behavioral questions
4. Prepare thoughtful questions for the interviewer

### Recommended Practice
- Mock interview sessions focusing on weak areas
- Recording yourself to review body language
- Timing your responses (aim for 1-2 minutes per answer)`,

            'Ques Ans Prep': `## 📝 Study Session Summary

### Session Statistics
- Total Q&A exchanges: ${messageCount}
- Questions practiced: ${userMessages.length}

### Key Concepts Reviewed
${topicsDiscussed.substring(0, 300)}

### Study Progress
- **Concepts Covered**: Multiple key areas explored
- **Understanding Level**: Good engagement shown
- **Practice Completed**: Active Q&A participation

### Important Points to Remember
1. Review definitions and core concepts
2. Practice explaining concepts in your own words
3. Create flashcards for key terms
4. Test yourself regularly

### Exam Preparation Tips
1. Focus on understanding, not memorization
2. Practice past exam questions
3. Study in focused 25-minute sessions
4. Get adequate rest before the exam

### Next Steps
- Review today's material
- Practice weak areas
- Schedule another preparation session`,

            'Languages Skill': `## 🌍 Language Learning Progress

### Session Summary
- Practice exchanges: ${messageCount}
- Speaking/writing practice: Active participation

### Skills Practiced
- Vocabulary building
- Grammar application
- Conversational practice

### Progress Highlights
- Engaged with new vocabulary
- Practiced sentence construction
- Worked on communication skills

### Areas to Focus On
1. **Vocabulary**: Continue expanding word bank
2. **Grammar**: Practice common structures
3. **Pronunciation**: Listen and repeat exercises
4. **Fluency**: Regular conversation practice

### Practice Recommendations
1. Daily vocabulary review (10-15 new words)
2. Listen to native speakers (podcasts, videos)
3. Practice writing short paragraphs
4. Find conversation partners

### Keep Practicing!
Consistent daily practice leads to fluency.`,

            'Meditation': `## 🧘 Meditation Session Reflection

### Session Overview
- Duration: ${messageCount} guided exchanges
- Focus: Mindfulness and relaxation

### Techniques Practiced
- Deep breathing exercises
- Guided visualization
- Mindful awareness

### Benefits Observed
- Dedicated time for mental wellness
- Practice of calming techniques
- Focus on present-moment awareness

### Tips for Daily Practice
1. **Morning**: 5-10 minutes upon waking
2. **Midday**: Brief breathing exercises
3. **Evening**: Relaxation before sleep
4. **Anytime**: Mindful moments during stress

### Recommended Practices
1. Start with just 5 minutes daily
2. Find a quiet, comfortable space
3. Be patient with wandering thoughts
4. Use guided meditations when needed

### Continue Your Journey
Regular meditation builds lasting peace and clarity.`
        };
        
        return feedbackTemplates[coachingOption] || `## Session Feedback

### Summary
You completed a productive coaching session with ${messageCount} exchanges.

### Key Points
- Active participation throughout the session
- Engaged with the material presented
- Showed commitment to learning

### Recommendations
1. Review the concepts discussed
2. Practice applying what you learned
3. Schedule follow-up sessions as needed

### Next Steps
Continue building on today's progress with regular practice.`;
    };

    // If no conversation, return structured fallback
    if (!conversation || conversation.length === 0) {
        return { 
            role: 'assistant', 
            content: `## Session Notes

No detailed conversation was recorded for this session. Start a new session to generate comprehensive feedback and notes.`
        };
    }

    const summaryPrompt = option?.summeryPrompt || 
        'Based on the conversation above, provide comprehensive feedback and key notes.';

    const systemMessage = `You are an expert coach providing detailed, actionable feedback. ${summaryPrompt}

CRITICAL REQUIREMENTS - You MUST include ALL of these sections:
1. **Session Summary** - Overview of what was covered
2. **Key Points** - Main takeaways (minimum 3 points)
3. **Strengths Observed** - What went well (minimum 2 points)
4. **Areas for Improvement** - Constructive feedback (minimum 2 points)
5. **Actionable Recommendations** - Specific next steps (minimum 3 items)
6. **Additional Resources** - Suggested materials or practices

Use markdown formatting with headers, bullet points, and emphasis.
Your response MUST be at least 300 words.
NEVER return a short or empty response.`;

    // Try multiple times with increasing timeouts
    for (let attempt = 0; attempt < 5; attempt++) {
        try {
            console.log(`📝 Feedback generation attempt ${attempt + 1}/5...`);
            
            const allMessages = [
                ...conversation,
                { role: 'user', content: 'Please provide detailed, comprehensive feedback and notes based on our entire conversation. Include specific examples from our discussion.' }
            ];
            
            const response = await callGemini(systemMessage, allMessages, 2048);
            
            // Validate response quality
            if (response && response.trim().length >= 200) {
                console.log('✓ Feedback generated successfully');
                return { role: 'assistant', content: response };
            }
            
            console.warn(`Attempt ${attempt + 1}: Response too short (${response?.length || 0} chars)`);
        } catch (error) {
            console.warn(`Feedback attempt ${attempt + 1} failed:`, error.message);
            await wait(1000 * (attempt + 1));
        }
    }

    // GUARANTEED fallback - always returns valid feedback
    console.log('Using intelligent fallback feedback');
    return { role: 'assistant', content: generateFallbackFeedback() };
};

/**
 * Generate auto-summary of conversation
 * GUARANTEED to return a valid summary - never fails
 */
export const generateAutoSummary = async (conversation, topic) => {
    // Generate fallback summary from conversation
    const generateFallbackSummary = () => {
        const messageCount = conversation?.length || 0;
        const userMessages = conversation?.filter(m => m.role === 'user') || [];
        
        if (messageCount === 0) {
            return `Session about "${topic}" - Ready to begin.`;
        }
        
        const keyPoints = userMessages
            .slice(-3)
            .map(m => m.content.substring(0, 30))
            .join(', ');
        
        return `Productive session on "${topic}" with ${messageCount} exchanges. Key discussion points included: ${keyPoints}. The session covered important concepts and provided valuable insights.`;
    };

    if (!conversation || conversation.length < 2) {
        return generateFallbackSummary();
    }

    const systemPrompt = `Create a brief 2-3 sentence summary of this coaching session about "${topic}". Focus on key points discussed and outcomes. Be specific and informative.`;

    // Try multiple times
    for (let attempt = 0; attempt < 3; attempt++) {
        try {
            const messages = [
                ...conversation.slice(-6),
                { role: 'user', content: 'Provide a brief summary of this session.' }
            ];
            const result = await callGemini(systemPrompt, messages, 256);
            
            if (result && result.trim().length > 20) {
                return result;
            }
        } catch (error) {
            console.warn(`Summary attempt ${attempt + 1} failed:`, error.message);
            await wait(500);
        }
    }

    // GUARANTEED fallback
    return generateFallbackSummary();
};

/**
 * Get current AI provider status
 */
export const getAIProviderStatus = () => ({
    provider: 'Gemini 2.5 Flash',
    model: 'gemini-2.5-flash-preview-05-20'
});

// ==================== Text-to-Speech ====================

let currentAudio = null;
let isSpeaking = false;
let speechQueue = [];

export const getIsSpeaking = () => isSpeaking;

export const stopSpeaking = () => {
    // Stop audio element
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
    
    // Stop browser speech synthesis
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
    }
    
    // Clear queue
    speechQueue = [];
    isSpeaking = false;
};

/**
 * Convert text to speech with fallback chain:
 * 1. Python TTS Server (gTTS - natural voice)
 * 2. Browser Web Speech API (built-in)
 */
export const ConvertTextToSpeech = async (text, onStart, onEnd) => {
    if (!text || text.trim() === '') {
        if (onEnd) onEnd();
        return null;
    }

    stopSpeaking();
    isSpeaking = true;
    
    if (onStart) onStart();

    // Get voice settings
    const settings = useVoiceProfileStore.getState().voiceSettings;
    const speed = settings?.speed || 1.0;

    // Try Python TTS first (better quality)
    try {
        const response = await axios.post(`${CONFIG.PYTHON_TTS_URL}/api/tts`, {
            text: text,
            lang: 'en'
        }, {
            responseType: 'blob',
            timeout: CONFIG.TTS_TIMEOUT
        });

        pythonServerAvailable = true;

        const audioBlob = new Blob([response.data], { type: 'audio/mpeg' });
        const audioUrl = URL.createObjectURL(audioBlob);
        currentAudio = new Audio(audioUrl);
        
        // Apply speed setting
        currentAudio.playbackRate = speed;
        // Ensure pitch is preserved when changing speed (if supported)
        if (currentAudio.preservesPitch !== undefined) {
            currentAudio.preservesPitch = true;
        }
        
        return new Promise((resolve) => {
            currentAudio.onended = () => {
                URL.revokeObjectURL(audioUrl);
                currentAudio = null;
                isSpeaking = false;
                if (onEnd) onEnd();
                resolve(true);
            };
            
            currentAudio.onerror = (e) => {
                console.warn('Audio playback error, trying fallback:', e);
                URL.revokeObjectURL(audioUrl);
                currentAudio = null;
                // Try browser fallback
                browserTTS(text, onEnd).then(resolve);
            };
            
            currentAudio.play().catch((err) => {
                console.warn('Play error, trying fallback:', err);
                browserTTS(text, onEnd).then(resolve);
            });
        });
    } catch (error) {
        console.log('Python TTS unavailable, using browser fallback');
        pythonServerAvailable = false;
        return browserTTS(text, onEnd);
    }
};

/**
 * Browser-based TTS fallback
 */
const browserTTS = async (text, onEnd) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
        isSpeaking = false;
        if (onEnd) onEnd();
        return false;
    }

    const synth = window.speechSynthesis;
    synth.cancel();

    // Clean text for speech
    const cleanText = text
        .replace(/\*\*/g, '')
        .replace(/\*/g, '')
        .replace(/`/g, '')
        .replace(/#/g, '')
        .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
        .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    // Apply settings
    const settings = useVoiceProfileStore.getState().voiceSettings;
    utterance.rate = settings?.speed || 1.0;
    utterance.pitch = settings?.pitch || 1.0;
    utterance.volume = settings?.volume || 1.0;

    // Wait for voices to load
    let voices = synth.getVoices();
    if (voices.length === 0) {
        await new Promise(resolve => {
            synth.onvoiceschanged = () => {
                voices = synth.getVoices();
                resolve();
            };
            setTimeout(resolve, 500);
        });
        voices = synth.getVoices();
    }

    // Find best voice
    const preferredVoice = voices.find(v => 
        v.name.includes('Google US English') || 
        v.name.includes('Microsoft David') ||
        v.name.includes('Microsoft Zira') ||
        v.name.includes('Samantha') ||
        (v.lang.includes('en') && v.name.toLowerCase().includes('female'))
    ) || voices.find(v => v.lang.startsWith('en')) || voices[0];

    if (preferredVoice) {
        utterance.voice = preferredVoice;
    }

    return new Promise((resolve) => {
        utterance.onend = () => {
            isSpeaking = false;
            if (onEnd) onEnd();
            resolve(true);
        };
        
        utterance.onerror = (e) => {
            console.error('Speech synthesis error:', e);
            isSpeaking = false;
            if (onEnd) onEnd();
            resolve(false);
        };

        synth.speak(utterance);
    });
};

// ==================== PDF Export ====================

export const exportConversationPDF = async (conversation, topic, summary, coachingOption) => {
    // First try Python server
    if (pythonServerAvailable !== false) {
        try {
            const response = await axios.post(`${CONFIG.PYTHON_TTS_URL}/api/export/pdf`, {
                conversation,
                topic,
                summary,
                coachingOption
            }, {
                responseType: 'blob',
                timeout: 30000
            });

            // Download the PDF
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `coaching_session_${new Date().toISOString().slice(0,10)}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            return { success: true };
        } catch (error) {
            console.log('Server PDF export unavailable, generating client-side');
        }
    }

    // Client-side text export as fallback
    return exportConversationText(conversation, topic, summary, coachingOption);
};

/**
 * Fallback: Export conversation as formatted text
 */
export const exportConversationText = (conversation, topic, summary, coachingOption) => {
    let content = `AI COACHING SESSION TRANSCRIPT
================================
Topic: ${topic}
Type: ${coachingOption}
Date: ${new Date().toLocaleString()}
================================

CONVERSATION
------------
`;

    conversation.forEach(msg => {
        const role = msg.role === 'user' ? 'You' : 'AI Coach';
        content += `\n${role}:\n${msg.content}\n`;
    });

    if (summary) {
        content += `\n================================
SUMMARY & FEEDBACK
------------------
${summary}
`;
    }

    // Download as text file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `coaching_session_${new Date().toISOString().slice(0,10)}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    return { success: true, format: 'text' };
};

// ==================== Speech Recognition Helpers ====================

/**
 * Check if Web Speech API is available
 */
export const isSpeechRecognitionSupported = () => {
    if (typeof window === 'undefined') return false;
    return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};

/**
 * Create Web Speech Recognition instance
 * Fallback when AssemblyAI is not working
 */
export const createWebSpeechRecognition = (options = {}) => {
    if (!isSpeechRecognitionSupported()) {
        return null;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = options.continuous ?? true;
    recognition.interimResults = options.interimResults ?? true;
    recognition.lang = options.lang ?? 'en-US';
    recognition.maxAlternatives = 1;

    return recognition;
};

// ==================== Error Tracking ====================

const errorLog = [];

export const logError = (category, error, context = {}) => {
    const entry = {
        timestamp: new Date().toISOString(),
        category,
        message: error.message || error,
        context,
        stack: error.stack
    };
    
    errorLog.push(entry);
    
    // Keep only last 50 errors
    if (errorLog.length > 50) {
        errorLog.shift();
    }
    
    console.error(`[${category}]`, error);
};

export const getErrorLog = () => [...errorLog];

export const clearErrorLog = () => {
    errorLog.length = 0;
};

// ==================== Service Health Check ====================

export const checkAllServices = async () => {
    const results = {
        network: isOnline,
        pythonTTS: false,
        assemblyAI: false,
        gemini: false
    };

    // Check Python TTS
    results.pythonTTS = await checkPythonServer();

    // Check AssemblyAI
    try {
        const token = await getToken();
        results.assemblyAI = !!token;
    } catch {
        results.assemblyAI = false;
    }

    // Check Gemini AI (with model fallback)
    try {
        for (const modelName of GEMINI_MODELS) {
            try {
                const model = geminiAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hi");
                if (result.response.text()) {
                    results.gemini = true;
                    // console.log(`✓ Gemini connected using: ${modelName}`);
                    break;
                }
            } catch (e) {
                console.warn(`Model ${modelName} check failed:`, e.message);
            }
        }
    } catch {
        results.gemini = false;
    }

    return results;
};