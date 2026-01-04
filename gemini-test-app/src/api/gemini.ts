import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Question, TestSet } from '../types';

let genAI: GoogleGenerativeAI | null = null;

export function initializeGemini(apiKey: string) {
    genAI = new GoogleGenerativeAI(apiKey);
}

// Helper function to delay execution
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to retry with exponential backoff
async function retryWithBackoff<T>(
    fn: () => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 45000
): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error: any) {
            lastError = error;

            if (error.message?.includes('429') || error.message?.includes('quota')) {
                const waitTime = baseDelay * Math.pow(1.5, attempt);
                console.log(`Rate limited. Waiting ${waitTime / 1000}s before retry ${attempt + 1}/${maxRetries}...`);
                await delay(waitTime);
            } else {
                throw error;
            }
        }
    }

    throw lastError || new Error('Max retries exceeded');
}

// Store generated questions to check for duplicates
let allGeneratedQuestions: string[] = [];

// Generate set IDs dynamically (A, B, C, D, E, ...)
function getSetId(index: number): string {
    return String.fromCharCode(65 + index); // A=65, B=66, etc.
}

export async function generateQuestions(
    subject: string,
    questionsPerSet: number = 20,
    numSets: number = 3
): Promise<TestSet[]> {
    if (!genAI) {
        throw new Error('Gemini API not initialized. Please provide API key.');
    }

    // Reset duplicate tracking for new test
    allGeneratedQuestions = [];

    const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            topK: 40,
        }
    });

    const sets: TestSet[] = [];

    for (let i = 0; i < numSets; i++) {
        const setId = getSetId(i) as 'A' | 'B' | 'C';

        if (i > 0) {
            console.log(`Waiting 3 seconds before generating Set ${setId}...`);
            await delay(3000);
        }

        // Build list of already used questions for deduplication
        const previousQuestionsHint = allGeneratedQuestions.length > 0
            ? `\n\nALREADY USED QUESTIONS (DO NOT REPEAT ANY OF THESE):\n${allGeneratedQuestions.slice(-20).map((q, idx) => `${idx + 1}. ${q.substring(0, 80)}...`).join('\n')}`
            : '';

        // Calculate MCQ vs Fill distribution
        const mcqCount = Math.ceil(questionsPerSet * 0.75);
        const fillCount = questionsPerSet - mcqCount;

        const prompt = `
You are an expert competitive exam question creator with 20+ years of experience in Indian government job exams.

## TASK
Generate exactly ${questionsPerSet} examination questions for: "${subject}"

## QUESTION DISTRIBUTION
- ${mcqCount} Multiple Choice Questions (MCQ) with exactly 4 options A, B, C, D
- ${fillCount} Fill in the Blank questions

## REQUIREMENTS

### MCQ REQUIREMENTS
1. All 4 options must be plausible
2. correctAnswer must be exactly "A", "B", "C", or "D"
3. No "All of the above" or "None of the above"

### FILL IN THE BLANK REQUIREMENTS
1. Use _____ to indicate the blank
2. Single word or short phrase answer (max 3 words)

### DIFFICULTY
- 30% Easy (direct recall)
- 50% Medium (application)
- 20% Hard (analytical)

### DEDUPLICATION
This is SET ${setId} (Set ${i + 1} of ${numSets}).
Each question must be UNIQUE - different concept from other sets.
${previousQuestionsHint}

## OUTPUT FORMAT
Return ONLY a valid JSON array with NO markdown, NO code blocks.

For MCQ:
{"type":"mcq","question":"Question text?","options":["A text","B text","C text","D text"],"correctAnswer":"A"}

For Fill:
{"type":"fill","question":"The _____ is important.","correctAnswer":"Answer"}

Generate ${questionsPerSet} questions now:
`;

        const generateSet = async (): Promise<void> => {
            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            let cleanedResponse = responseText.trim();

            // Remove code blocks
            cleanedResponse = cleanedResponse.replace(/^```json\s*/i, '');
            cleanedResponse = cleanedResponse.replace(/^```\s*/i, '');
            cleanedResponse = cleanedResponse.replace(/\s*```$/i, '');
            cleanedResponse = cleanedResponse.trim();

            // Extract JSON array
            const jsonMatch = cleanedResponse.match(/\[[\s\S]*\]/);
            if (jsonMatch) {
                cleanedResponse = jsonMatch[0];
            }

            const questions = JSON.parse(cleanedResponse);

            // Filter duplicates and format
            const formattedQuestions: Question[] = questions
                .filter((q: any) => {
                    if (!q || !q.type || !q.question || !q.correctAnswer) return false;
                    const questionText = q.question.toLowerCase().trim();
                    const isDuplicate = allGeneratedQuestions.some(existing => {
                        const existingLower = existing.toLowerCase();
                        const words = questionText.split(' ').filter((w: string) => w.length > 4);
                        const overlap = words.filter((w: string) => existingLower.includes(w)).length;
                        return words.length > 0 && overlap / words.length > 0.6;
                    });
                    if (!isDuplicate) {
                        allGeneratedQuestions.push(questionText);
                    }
                    return !isDuplicate;
                })
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
                console.warn(`Set ${setId}: Only got ${formattedQuestions.length}/${questionsPerSet} questions`);
            }

            sets.push({
                setId,
                questions: formattedQuestions,
            });
        };

        try {
            await retryWithBackoff(generateSet, 2, 30000);
        } catch (error) {
            console.error(`Error generating set ${setId}:`, error);
            throw new Error(`Failed to generate Set ${setId}: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    return sets;
}
