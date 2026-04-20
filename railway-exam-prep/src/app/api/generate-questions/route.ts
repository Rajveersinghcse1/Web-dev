import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request: NextRequest) {
    try {
        const { category, topic, difficulty, count = 10 } = await request.json();

        // Use Gemini 2.5 Flash model - simple configuration like notes route
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const difficultyLevel = difficulty === 'beginner' ? 'Easy' :
            difficulty === 'intermediate' ? 'Medium' :
                difficulty === 'advanced' ? 'Hard' : 'Mixed';

        const examCategory = category?.toUpperCase() || 'RAILWAY';

        const prompt = `You are an expert question generator for Indian Railway recruitment exams (NTPC, ALP, Group D, JE, TC, etc.).

Generate ${count} REAL MCQ questions that are MOST FREQUENTLY ASKED in Railway exams. Focus on questions from previous Railway exam papers (2018-2024).

Specifications:
- Exam Category: ${examCategory}
- Topics: ${topic || 'Mathematics, Reasoning, General Science, General Awareness'}
- Difficulty: ${difficultyLevel}

IMPORTANT: Return ONLY a valid JSON object, with no additional text or markdown code blocks. Use this exact format:

{"questions":[{"question":"Full question text here?","question_hi":"Question in Hindi","options":["Option A","Option B","Option C","Option D"],"options_hi":["विकल्प A","विकल्प B","विकल्प C","विकल्प D"],"correct":0,"explanation":"Detailed explanation","topic":"Topic Name","difficulty":"medium"}]}

Generate ${count} unique, educational questions that actually appear in Railway exams. Each question must have exactly 4 options with only one correct answer (index 0-3).`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();

        console.log('Gemini raw response (first 500 chars):', text.substring(0, 500));

        // Clean up the response - remove markdown code blocks
        text = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();

        // Find JSON object
        const jsonStart = text.indexOf('{');
        const jsonEnd = text.lastIndexOf('}');

        if (jsonStart === -1 || jsonEnd === -1) {
            console.error('No JSON found in response');
            return NextResponse.json({
                error: 'No valid JSON in response',
                rawResponse: text.substring(0, 300),
            }, { status: 422 });
        }

        text = text.substring(jsonStart, jsonEnd + 1);
        console.log('Extracted JSON (first 300 chars):', text.substring(0, 300));

        try {
            const parsed = JSON.parse(text);

            if (parsed.questions && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
                console.log('Successfully parsed', parsed.questions.length, 'questions');

                // Ensure proper format for all questions
                const formattedQuestions = parsed.questions.map((q: any, idx: number) => ({
                    question: q.question || '',
                    question_hi: q.question_hi || q.question || '',
                    options: Array.isArray(q.options) ? q.options : ['A', 'B', 'C', 'D'],
                    options_hi: Array.isArray(q.options_hi) ? q.options_hi : (q.options || ['A', 'B', 'C', 'D']),
                    correct: typeof q.correct === 'number' ? q.correct : 0,
                    explanation: q.explanation || 'Explanation not provided',
                    topic: q.topic || 'General',
                    difficulty: q.difficulty || 'medium'
                }));

                return NextResponse.json({ questions: formattedQuestions });
            }

            console.error('No questions in parsed response:', JSON.stringify(parsed).substring(0, 200));
            return NextResponse.json({
                error: 'No questions found in response',
                rawResponse: text.substring(0, 300),
            }, { status: 422 });

        } catch (parseError: any) {
            console.error('JSON parse error:', parseError?.message);
            console.error('Failed text:', text.substring(0, 500));
            return NextResponse.json({
                error: 'Failed to parse questions - invalid JSON',
                rawResponse: text.substring(0, 300),
            }, { status: 422 });
        }
    } catch (error: any) {
        console.error('Question generation error:', error?.message || error);
        return NextResponse.json(
            {
                error: 'Failed to generate questions',
                details: error?.message || 'Unknown error occurred'
            },
            { status: 500 }
        );
    }
}
