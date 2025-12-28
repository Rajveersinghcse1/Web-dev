// Interview Question Generation Service using Gemini AI
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getFallbackQuestions } from "./fallbackQuestions";

const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.Gemini_API_Key || "";

if (!API_KEY) {
    console.error('❌ CRITICAL: Gemini API key not found in environment variables');
    console.error('Expected: NEXT_PUBLIC_GEMINI_API_KEY or Gemini_API_Key');
}

const genAI = new GoogleGenerativeAI(API_KEY);

export class InterviewQuestionGenerator {
    constructor() {
        if (!API_KEY) {
            console.warn('⚠️ No Gemini API key - will use fallback questions only');
        }
        this.model = API_KEY ? genAI.getGenerativeModel({ model: "gemini-2.5-flash" }) : null;
        this.hasAPIKey = !!API_KEY;
        console.log('✓ InterviewQuestionGenerator initialized');
    }

    /**
     * Generate exactly 10 interview questions for a given topic
     * @param {string} topic - The interview topic
     * @returns {Promise<Array>} Array of 10 questions with metadata
     */
    async generateQuestions(topic) {
        if (!topic || topic.trim().length < 3) {
            throw new Error("Topic must be at least 3 characters long");
        }

        console.log(`🔄 Generating questions for topic: "${topic}"`);
        
        // If no API key, use fallback immediately
        if (!this.hasAPIKey) {
            console.log('⚠️ No API key - using fallback questions');
            return getFallbackQuestions(topic);
        }

        const startTime = Date.now();

        const prompt = `You are an expert technical interviewer. Generate exactly 10 unique, high-quality interview questions for the topic: "${topic}".

Requirements:
1. Questions must be progressively difficult (3 easy, 4 medium, 3 hard)
2. All questions must be relevant to ${topic}
3. No duplicate or similar questions
4. Questions should be clear and specific
5. Mix conceptual and practical questions
6. Include questions that test both breadth and depth of knowledge

Return the response as a JSON array with this exact structure:
[
  {
    "questionId": "q1",
    "questionText": "The actual question text",
    "difficulty": "easy",
    "source": "Common interview question"
  }
]

IMPORTANT: Return ONLY the JSON array, no additional text or markdown formatting.`;

        let attempts = 0;
        const maxAttempts = 3;
        const delays = [1000, 2000, 4000]; // Exponential backoff

        while (attempts < maxAttempts) {
            try {
                console.log(`📡 Gemini API: Request attempt ${attempts + 1}/${maxAttempts}`);
                const result = await this.model.generateContent(prompt);
                const response = await result.response;
                let text = response.text();

                // Clean up the response
                text = text.trim();
                
                // Remove markdown code blocks if present
                if (text.startsWith("```json")) {
                    text = text.substring(7);
                }
                if (text.startsWith("```")) {
                    text = text.substring(3);
                }
                if (text.endsWith("```")) {
                    text = text.substring(0, text.length - 3);
                }
                text = text.trim();

                // Parse JSON
                const questions = JSON.parse(text);

                // Validate questions
                if (!Array.isArray(questions)) {
                    throw new Error("Response is not an array");
                }

                if (questions.length !== 10) {
                    throw new Error(`Expected 10 questions, got ${questions.length}`);
                }

                // Validate each question structure
                for (let i = 0; i < questions.length; i++) {
                    const q = questions[i];
                    if (!q.questionId || !q.questionText || !q.difficulty) {
                        throw new Error(`Invalid question structure at index ${i}`);
                    }
                    if (!['easy', 'medium', 'hard'].includes(q.difficulty.toLowerCase())) {
                        throw new Error(`Invalid difficulty level at index ${i}`);
                    }
                }

                // Ensure unique questions
                const uniqueTexts = new Set(questions.map(q => q.questionText.toLowerCase()));
                if (uniqueTexts.size !== 10) {
                    throw new Error("Duplicate questions detected");
                }

                const duration = Date.now() - startTime;
                console.log(`✅ Gemini API: Successfully generated 10 questions for topic: "${topic}" in ${duration}ms`);
                console.log(`📊 Gemini API: Response validated - 10 unique questions with proper structure`);
                
                // Log question summary for verification
                const difficulties = questions.reduce((acc, q) => {
                    acc[q.difficulty] = (acc[q.difficulty] || 0) + 1;
                    return acc;
                }, {});
                console.log(`📊 Gemini API: Question distribution:`, difficulties);
                
                return questions;

            } catch (error) {
                attempts++;
                console.error(`❌ Gemini API: Attempt ${attempts}/${maxAttempts} failed:`, error.message);

                if (attempts >= maxAttempts) {
                    console.error(`❌ Gemini API: All attempts failed for topic: "${topic}"`);
                    console.warn(`⚠️ Using fallback questions for: "${topic}"`);
                    return getFallbackQuestions(topic);
                }

                // Exponential backoff delay
                const delay = delays[attempts - 1];
                console.log(`⏳ Gemini API: Retrying in ${delay}ms...`);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
        
        // Fallback (should not reach here, but safety net)
        return getFallbackQuestions(topic);
    }

    /**
     * Validate if a topic is meaningful
     * @param {string} topic - The topic to validate
     * @returns {boolean} Whether the topic is valid
     */
    isValidTopic(topic) {
        if (!topic || typeof topic !== 'string') {
            return false;
        }

        const trimmed = topic.trim();

        // Check minimum length
        if (trimmed.length < 3) {
            return false;
        }

        // Check for vague inputs
        const invalidPatterns = [
            /^test$/i,
            /^abc$/i,
            /^anything$/i,
            /^something$/i,
            /^xxx$/i,
            /^aaa$/i,
            /^111$/i,
            /^\d+$/,  // Only numbers
            /^[^a-zA-Z0-9]+$/,  // Only special characters
        ];

        for (const pattern of invalidPatterns) {
            if (pattern.test(trimmed)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Get topic validation error message
     * @param {string} topic - The topic to validate
     * @returns {string|null} Error message or null if valid
     */
    getValidationError(topic) {
        if (!topic || typeof topic !== 'string') {
            return "Topic is required";
        }

        const trimmed = topic.trim();

        if (trimmed.length < 3) {
            return "Topic must be at least 3 characters long";
        }

        if (!this.isValidTopic(topic)) {
            return "Please provide a meaningful interview topic (e.g., 'Python Basics', 'React Hooks', 'Data Structures')";
        }

        return null;
    }
}

export default InterviewQuestionGenerator;
