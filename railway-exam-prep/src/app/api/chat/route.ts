import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

// Get API key from environment or use fallback
const API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyDKAGNJD08-C0V6Ll2_16LYEIRVjVfkmvA';

const systemPrompt = `You are RailwayPrep AI, an expert assistant for Railway exam preparation in India. You help students prepare for exams like RRB NTPC, ALP, Group D, JE, and other Railway recruitment exams.

Your responsibilities:
1. Answer questions about Railway exam syllabus, patterns, and preparation strategies
2. Explain concepts from Mathematics, Reasoning, General Knowledge, and Current Affairs
3. Provide information about Indian Railways - zones, history, projects, and current affairs
4. Give study tips, shortcuts, and exam strategies
5. Help with doubt solving in a friendly, encouraging manner

Guidelines:
- Use markdown formatting for better readability
- Include tables when presenting comparative or structured data
- Add emojis sparingly to make content engaging
- Highlight important points with bold text
- Include exam tips and mnemonics where relevant
- Be concise but comprehensive
- If asked about topics outside exam preparation, politely redirect to study topics
- Always encourage the student and maintain a positive tone

Remember: You are helping students achieve their dream of joining Indian Railways!`;

export async function POST(request: NextRequest) {
    try {
        const { message, history } = await request.json();

        if (!message) {
            return NextResponse.json(
                { error: 'Message is required' },
                { status: 400 }
            );
        }

        // Initialize Gemini
        const genAI = new GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        // Build conversation history
        const chatHistory = history?.map((msg: { role: string; content: string }) => ({
            role: msg.role === 'user' ? 'user' : 'model',
            parts: [{ text: msg.content }],
        })) || [];

        const chat = model.startChat({
            history: [
                {
                    role: 'user',
                    parts: [{ text: 'You are RailwayPrep AI assistant. Please follow these instructions for all responses: ' + systemPrompt }],
                },
                {
                    role: 'model',
                    parts: [{ text: 'I understand! I am RailwayPrep AI, your dedicated Railway exam preparation assistant. I\'m here to help you succeed in your Railway recruitment exams like NTPC, ALP, Group D, and more. Feel free to ask me anything about syllabus, concepts, study tips, or Indian Railways GK. Let\'s start your journey to success! 🚂' }],
                },
                ...chatHistory,
            ],
            generationConfig: {
                maxOutputTokens: 2048,
                temperature: 0.7,
            },
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        const text = response.text();

        return NextResponse.json({ response: text });
    } catch (error: any) {
        console.error('Gemini API error:', error);

        // Return more helpful error message
        let errorMessage = 'Failed to generate response';
        let errorDetails = '';

        if (error?.message) {
            errorDetails = error.message;
            if (error.message.includes('API_KEY') || error.message.includes('invalid')) {
                errorMessage = 'Invalid API key. Please check your Gemini API key configuration.';
            } else if (error.message.includes('quota') || error.message.includes('rate')) {
                errorMessage = 'API quota exceeded. Please try again later.';
            } else if (error.message.includes('not found') || error.message.includes('404')) {
                errorMessage = 'API model not found. The Gemini model may not be available.';
            }
        }

        return NextResponse.json(
            { error: errorMessage, details: errorDetails },
            { status: 500 }
        );
    }
}
