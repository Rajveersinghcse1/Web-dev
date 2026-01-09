import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Question, TestSet } from '../types';

let genAI: GoogleGenerativeAI | null = null;

// Request queue management to prevent rate limiting
let lastRequestTime: number = 0;
const MIN_REQUEST_INTERVAL = 4000; // 4 seconds between requests (15 RPM = 4s interval)

export function initializeGemini(apiKey: string) {
    genAI = new GoogleGenerativeAI(apiKey);
    // Reset rate limit tracking when initializing with new key
    lastRequestTime = 0;
}

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Wait for rate limit cooldown if needed
async function waitForRateLimit(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;

    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
        const waitTime = MIN_REQUEST_INTERVAL - timeSinceLastRequest;
        console.log(`⏳ Rate limit protection: Waiting ${Math.ceil(waitTime / 1000)}s before making request...`);
        await delay(waitTime);
    }

    lastRequestTime = Date.now();
}

// Helper function to retry with exponential backoff - OPTIMIZED
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 10000
): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            // Wait for rate limit before each attempt
            await waitForRateLimit();
            return await fn();
        } catch (error: any) {
            lastError = error;

            if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('rate')) {
                if (attempt < maxRetries) {
                    // Exponential backoff: 10s, 20s, 40s
                    const waitTime = baseDelay * Math.pow(2, attempt);
                    console.log(`⏳ Rate limited. Waiting ${waitTime / 1000}s before retry ${attempt + 1}/${maxRetries}...`);
                    await delay(waitTime);
                } else {
                    // Check if it's quota exhaustion vs rate limiting
                    if (error.message?.includes('quota')) {
                        throw new Error('❌ API quota exhausted for today. Please try again tomorrow, or upgrade to a paid plan. Free tier: 1,500 requests/day.');
                    } else {
                        throw new Error('⏰ Rate limit exceeded. Please wait 60 seconds and try again. Free tier allows 15 requests per minute.');
                    }
                }
            } else {
                throw error;
            }
        }
    }

    throw lastError || new Error('Max retries exceeded');
}

// Generate set IDs dynamically (A, B, C, D, E, ...)
function getSetId(index: number): string {
    return String.fromCharCode(65 + index); // A=65, B=66, etc.
}

// OPTIMIZED: Generate all sets in a single API call
export async function generateQuestions(
    subject: string,
    questionsPerSet: number = 20,
    numSets: number = 3
): Promise<TestSet[]> {
    if (!genAI) {
        throw new Error('Gemini API not initialized. Please provide API key.');
    }

    // Validate configuration to prevent excessive API usage
    const totalQuestions = questionsPerSet * numSets;
    if (totalQuestions > 150) {
        throw new Error('Too many questions requested. Please reduce the number of sets or questions per set (max 150 total).');
    }

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            topK: 40,
        }
    });

    // Calculate MCQ vs Fill distribution
    const mcqCount = Math.ceil(questionsPerSet * 0.75);
    const fillCount = questionsPerSet - mcqCount;

    // Generate set labels
    const setLabels = Array.from({ length: numSets }, (_, i) => getSetId(i));

    // SINGLE API CALL for all sets
    const prompt = `
You are an expert competitive exam question creator with 20+ years of experience in Indian government job exams.

## TASK
Generate ${numSets} complete test sets for: "${subject}"
Each set must have exactly ${questionsPerSet} questions.

## QUESTION DISTRIBUTION (per set)
- ${mcqCount} Multiple Choice Questions (MCQ) with exactly 4 options
- ${fillCount} Fill in the Blank questions

## REQUIREMENTS

### MCQ REQUIREMENTS
1. All 4 options must be plausible and distinct
2. correctAnswer must be exactly "A", "B", "C", or "D"
3. No "All of the above" or "None of the above"

### FILL IN THE BLANK REQUIREMENTS
1. Use _____ to indicate the blank
2. Single word or short phrase answer (max 3 words)

### DIFFICULTY (per set)
- 30% Easy (direct recall)
- 50% Medium (application)
- 20% Hard (analytical)

### CRITICAL: UNIQUENESS
Each set must cover DIFFERENT topics/concepts. No question should be similar across sets.
Set A, B, C should test different areas of ${subject}.

## OUTPUT FORMAT
Return ONLY a valid JSON object with NO markdown, NO code blocks, NO explanations.

Structure:
{
  "sets": [
    {
      "setId": "A",
      "questions": [
        {"type":"mcq","question":"Question text?","options":["Option A","Option B","Option C","Option D"],"correctAnswer":"A"},
        {"type":"fill","question":"The _____ is important.","correctAnswer":"Answer"}
      ]
    },
    {
      "setId": "B",
      "questions": [...]
    }
  ]
}

Generate ${numSets} sets (${setLabels.join(', ')}) with ${questionsPerSet} questions each now:
`;

    const generateAllSets = async (): Promise<TestSet[]> => {
        console.log(`🚀 Generating ${numSets} sets with ${questionsPerSet} questions each in a single API call...`);

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();

        let cleanedResponse = responseText.trim();

        // Remove code blocks
        cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '');
        cleanedResponse = cleanedResponse.replace(/^```\s*/i, '');
        cleanedResponse = cleanedResponse.replace(/\s*```$/i, '');
        cleanedResponse = cleanedResponse.trim();

        // Extract JSON object
        const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            cleanedResponse = jsonMatch[0];
        }

        const parsed = JSON.parse(cleanedResponse);

        // Handle both formats: {sets: [...]} or direct array
        const setsData = parsed.sets || parsed;

        if (!Array.isArray(setsData)) {
            throw new Error('Invalid response format from API');
        }

        // Process and validate each set
        const processedSets: TestSet[] = setsData.slice(0, numSets).map((set: any, setIndex: number) => {
            const setId = getSetId(setIndex) as 'A' | 'B' | 'C';

            if (!Array.isArray(set.questions)) {
                throw new Error(`Invalid questions format for set ${setId}`);
            }

            const formattedQuestions: Question[] = set.questions
                .filter((q: any) => q && q.type && q.question && q.correctAnswer)
                .slice(0, questionsPerSet)
                .map((q: any, index: number) => ({
                    id: index + 1,
                    type: q.type === 'mcq' ? 'mcq' : 'fill',
                    question: q.question.trim(),
                    options: q.type === 'mcq' && Array.isArray(q.options)
                        ? q.options.slice(0, 4).map((opt: string) => String(opt).trim())
                        : undefined,
                    correctAnswer: String(q.correctAnswer).trim(),
                    marks: 4,
                }));

            if (formattedQuestions.length < questionsPerSet) {
                console.warn(`⚠️ Set ${setId}: Only got ${formattedQuestions.length}/${questionsPerSet} questions`);
            }

            return {
                setId,
                questions: formattedQuestions,
            };
        });

        if (processedSets.length < numSets) {
            console.warn(`⚠️ Only generated ${processedSets.length}/${numSets} sets`);
        }

        console.log(`✅ Successfully generated ${processedSets.length} sets!`);
        return processedSets;
    };

    try {
        return await retryWithBackoff(generateAllSets, 3, 10000);
    } catch (error: any) {
        console.error('❌ Error generating questions:', error);

        // Provide user-friendly error messages
        if (error.message?.includes('quota') && error.message?.includes('exhausted')) {
            throw error; // Already has good message from retry logic
        } else if (error.message?.includes('429') || error.message?.includes('quota') || error.message?.includes('rate')) {
            throw new Error('⏰ Rate limit exceeded. Your API key has hit the free tier limit. Please wait 60 seconds and try again, or use a different API key. Free tier: 15 requests/minute.');
        } else if (error.message?.includes('API key') || error.message?.includes('API_KEY')) {
            throw new Error('🔑 Invalid API key. Please check your Gemini API key and try again. Get one at: https://aistudio.google.com/apikey');
        } else if (error.message?.includes('Invalid response')) {
            throw new Error('⚠️ Failed to parse AI response. Please try again.');
        } else {
            throw new Error(`❌ Failed to generate questions: ${error.message || 'Unknown error'}`);
        }
    }
}
