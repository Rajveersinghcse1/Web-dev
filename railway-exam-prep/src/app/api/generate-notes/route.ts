import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextRequest, NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyDKAGNJD08-C0V6Ll2_16LYEIRVjVfkmvA');

const notesPrompt = `You are an expert study material creator for Indian Railway recruitment exams (NTPC, ALP, Group D, JE, etc.).

Your task is to generate comprehensive, exam-focused study notes on the given topic.

Requirements:
1. Analyze previous year question patterns and include most frequently asked points
2. Use markdown formatting with proper headers (##, ###)
3. Include tables for structured data (zones, dates, statistics)
4. Add "Exam Tips" and "Quick Revision" sections
5. Use bullet points and numbered lists for clarity
6. Include mnemonics and memory tricks where helpful
7. Highlight important facts that are frequently asked in exams
8. Add recent updates and current affairs related to the topic
9. Structure content from basic to advanced
10. Include a "50 One-Liners" quick revision section at the end

Format each section clearly with proper spacing. Make the content comprehensive yet easy to memorize.`;

export async function POST(request: NextRequest) {
    try {
        const { exam, subject, topic } = await request.json();

        if (!subject) {
            return NextResponse.json(
                { error: 'Subject is required' },
                { status: 400 }
            );
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const prompt = `${notesPrompt}

Generate comprehensive study notes for:
- Exam: ${exam || 'Railway Exams (NTPC, ALP, Group D)'}
- Subject: ${subject}
${topic ? `- Specific Topic: ${topic}` : ''}

Create detailed, exam-focused notes that will help students score maximum marks. Include all important facts, figures, dates, and concepts that are frequently asked in Railway exams.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the response into sections
        const sections = text.split(/^## /gm).filter(Boolean).map((section, index) => {
            const lines = section.split('\n');
            const title = lines[0].trim();
            const content = lines.slice(1).join('\n').trim();
            return {
                title: index === 0 ? title : `## ${title}`,
                content: content || section,
            };
        });

        return NextResponse.json({
            title: `${subject} - Complete Study Notes`,
            lastUpdated: new Date().toLocaleDateString('en-IN'),
            readTime: `${Math.ceil(text.length / 1000)} min`,
            sections: sections.length > 0 ? sections : [{ title: 'Study Notes', content: text }],
            rawContent: text,
        });
    } catch (error) {
        console.error('Gemini API error:', error);
        return NextResponse.json(
            { error: 'Failed to generate notes' },
            { status: 500 }
        );
    }
}
