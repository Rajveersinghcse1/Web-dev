import { GoogleGenerativeAI } from '@google/generative-ai';
import type {
    Question,
    DifficultyLevel,
    ExamTrend,
    RepeatedQuestion,
    TopicImportance,
    TrendInsights
} from '@/types';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

// Check if Gemini is configured
export const isGeminiConfigured = () => {
    return process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key';
};

// Get Gemini model
const getModel = () => {
    return genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
};

// ==================== QUESTION GENERATION ====================

interface QuestionGenerationConfig {
    category: string;
    topics: string[];
    difficulty: DifficultyLevel;
    count: number;
    weakTopics?: string[];
    avoidPatterns?: string[];
    language: 'en' | 'hi' | 'both';
    useTrendData?: boolean;
    trendInsights?: TopicImportance[];
}

export const generateQuestions = async (config: QuestionGenerationConfig): Promise<Question[]> => {
    const model = getModel();

    const topicWeightage = config.trendInsights
        ? config.trendInsights.map(t => `${t.topic}: ${t.overall_importance}% importance`).join(', ')
        : config.topics.join(', ');

    const weakTopicFocus = config.weakTopics && config.weakTopics.length > 0
        ? `\nIMPORTANT: Include MORE questions from these weak topics: ${config.weakTopics.join(', ')}`
        : '';

    const prompt = `
You are an expert Railway exam question paper setter for Indian Railways recruitment exams.

Generate ${config.count} multiple choice questions for ${config.category} exam.

**Requirements:**
- Difficulty Level: ${config.difficulty}
- Topics to cover: ${topicWeightage}
${weakTopicFocus}
- Language: ${config.language === 'both' ? 'Provide both English and Hindi versions' : config.language}

**Difficulty Guidelines:**
- beginner: Basic factual questions, definitions, simple calculations
- intermediate: Application-based, multi-step problems
- advanced: Analysis, reasoning, tricky questions
- pro: Previous year level difficulty, time-pressure scenarios

**Question Format Requirements:**
- Each question must have exactly 4 options (A, B, C, D)
- Only ONE correct answer
- Include detailed explanation for the correct answer
- For Math: Include step-by-step solution
- For GK: Include relevant facts and context

**Railway Exam Specific Topics:**
- General Awareness: Indian Railways history, organization, achievements
- Current Affairs: Latest railway projects, policies, ministers
- Mathematics: Percentage, Profit-Loss, Time-Speed-Distance, Trains problems
- Reasoning: Coding-Decoding, Series, Analogies, Blood Relations
- General Science: Physics (mechanics, electricity), Chemistry, Biology

Return ONLY a valid JSON array with this exact structure:
[
  {
    "question_text": "Question in English",
    "question_text_hi": "Question in Hindi (if language is 'both' or 'hi')",
    "options": [
      {"id": 0, "text": "Option A", "text_hi": "Hindi Option A"},
      {"id": 1, "text": "Option B", "text_hi": "Hindi Option B"},
      {"id": 2, "text": "Option C", "text_hi": "Hindi Option C"},
      {"id": 3, "text": "Option D", "text_hi": "Hindi Option D"}
    ],
    "correct_option": 0,
    "explanation": "Detailed explanation in English",
    "explanation_hi": "Detailed explanation in Hindi",
    "topic": "Topic name",
    "difficulty": "${config.difficulty}"
  }
]

Generate exactly ${config.count} unique, exam-worthy questions now:
`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        // Extract JSON from response
        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) {
            throw new Error('Failed to parse question JSON');
        }

        const questions = JSON.parse(jsonMatch[0]);
        return questions.map((q: Partial<Question>, index: number) => ({
            ...q,
            id: `ai_${Date.now()}_${index}`,
            category_id: config.category,
            source: 'ai_generated' as const,
            created_at: new Date().toISOString(),
        }));
    } catch (error) {
        console.error('Error generating questions:', error);
        throw error;
    }
};

// ==================== EXAM TREND ANALYSIS ====================

export const analyzeExamTrends = async (
    category: string,
    pyqData: { year: number; topic: string; count: number }[]
): Promise<ExamTrend> => {
    const model = getModel();

    const prompt = `
Analyze the following Previous Year Question (PYQ) data for ${category} Railway exam:

${JSON.stringify(pyqData, null, 2)}

Based on this historical data, provide a comprehensive trend analysis:

1. **Topic Distribution Trends**: Which topics are increasing/decreasing in frequency?
2. **Predicted Next Year Distribution**: Based on trends, predict topic-wise question count
3. **Difficulty Trends**: How has the difficulty level changed over years?
4. **Expected Cutoff**: Based on difficulty trends, predict cutoff scores

Return ONLY valid JSON with this structure:
{
  "category": "${category}",
  "year": 2025,
  "topic_distribution": [
    {
      "topic": "Topic Name",
      "question_count": 10,
      "percentage": 20,
      "trend": "increasing",
      "predicted_next_year": 12
    }
  ],
  "difficulty_trend": [
    {"level": "beginner", "percentage": 30},
    {"level": "intermediate", "percentage": 45},
    {"level": "advanced", "percentage": 20},
    {"level": "pro", "percentage": 5}
  ],
  "average_cutoff": 65
}
`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Failed to parse trend JSON');

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Error analyzing trends:', error);
        throw error;
    }
};

// ==================== REPEATED QUESTION DETECTION ====================

export const findRepeatedQuestions = async (
    category: string,
    questions: { id: string; text: string; year: string; topic: string }[]
): Promise<RepeatedQuestion[]> => {
    const model = getModel();

    const prompt = `
Analyze these questions from ${category} Railway exams and identify repeated or similar questions:

${JSON.stringify(questions.slice(0, 100), null, 2)}

Group questions that are:
1. **Exact repeats**: Same question asked in different years
2. **Semantic repeats**: Same concept with different numbers/names
3. **Pattern-based**: Similar structure, different facts

Calculate the probability of each pattern reappearing in the next exam.

Return ONLY valid JSON array:
[
  {
    "question_pattern": "Core question template",
    "variations": ["Variation 1", "Variation 2"],
    "appeared_in": ["NTPC 2022 Shift 1", "NTPC 2021 Shift 3"],
    "frequency": 4,
    "last_appeared": "2024",
    "probability_next_exam": 75,
    "topic_tags": ["Topic1", "Topic2"]
  }
]
`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('Failed to parse repeated questions JSON');

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Error finding repeated questions:', error);
        throw error;
    }
};

// ==================== TOPIC IMPORTANCE SCORING ====================

export const calculateTopicImportance = async (
    category: string,
    historicalData: { topic: string; count: number; years: number[] }[],
    userPerformance?: { topic: string; accuracy: number }[]
): Promise<TopicImportance[]> => {
    const model = getModel();

    const prompt = `
Calculate importance scores for ${category} Railway exam topics:

**Historical Question Frequency:**
${JSON.stringify(historicalData, null, 2)}

${userPerformance ? `**User Performance:**
${JSON.stringify(userPerformance, null, 2)}` : ''}

For each topic, calculate:
1. **Historical Weight** (0-100): Based on PYQ frequency
2. **Trend Weight** (0-100): Is it increasing/decreasing?
3. **Difficulty Weight** (0-100): How hard are questions from this topic?
4. **Overall Importance** (0-100): Combined weighted score

Also provide:
- Priority level (critical/high/medium/low)
- Recommended study hours
- Must-know facts for this topic
- Frequently asked question patterns

Return ONLY valid JSON array:
[
  {
    "topic": "Topic Name",
    "subtopics": ["Subtopic 1", "Subtopic 2"],
    "historical_weight": 80,
    "trend_weight": 70,
    "difficulty_weight": 60,
    "overall_importance": 75,
    "recommended_questions": 15,
    "study_hours": 8,
    "priority": "critical",
    "must_know_facts": ["Fact 1", "Fact 2"],
    "frequently_asked": ["Pattern 1", "Pattern 2"]
  }
]
`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('Failed to parse importance JSON');

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Error calculating topic importance:', error);
        throw error;
    }
};

// ==================== PERSONALIZED INSIGHTS ====================

export const generateTrendInsights = async (
    category: string,
    trends: ExamTrend,
    userWeakAreas: { topic: string; weakness_score: number }[]
): Promise<TrendInsights> => {
    const model = getModel();

    const prompt = `
Generate personalized study insights for ${category} Railway exam preparation:

**Exam Trends:**
${JSON.stringify(trends, null, 2)}

**User's Weak Areas:**
${JSON.stringify(userWeakAreas, null, 2)}

Provide actionable insights:

1. **Hot Topics**: Topics with highest importance + user weakness
2. **Predicted Paper**: Expected question distribution for next exam
3. **Study Priority**: Personalized study plan based on weakness
4. **Must Revise**: High-probability questions to memorize

Return ONLY valid JSON:
{
  "hot_topics": [
    {"name": "Topic", "reason": "Why important", "importance_score": 90}
  ],
  "predicted_paper": {
    "topic_breakdown": [{"topic": "Topic", "questions": 10, "percentage": 20}],
    "expected_difficulty": "Moderate",
    "expected_cutoff": 65
  },
  "study_priority": [
    {"topic": "Topic", "current_mastery": 40, "target_mastery": 80, "hours_needed": 10}
  ],
  "must_revise": ["Question pattern 1", "Question pattern 2"]
}
`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const jsonMatch = response.match(/\{[\s\S]*\}/);
        if (!jsonMatch) throw new Error('Failed to parse insights JSON');

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Error generating insights:', error);
        throw error;
    }
};

// ==================== EXPLANATION GENERATOR ====================

export const generateExplanation = async (
    question: Question,
    selectedOption: number,
    language: 'en' | 'hi'
): Promise<string> => {
    const model = getModel();

    const isCorrect = selectedOption === question.correct_option;
    const languageText = language === 'hi' ? 'Hindi' : 'English';

    const prompt = `
Generate a detailed explanation for this Railway exam question in ${languageText}:

**Question:** ${language === 'hi' ? question.question_text_hi : question.question_text}
**Options:** ${question.options.map(o => `${o.id + 1}. ${language === 'hi' ? o.text_hi : o.text}`).join('\n')}
**User Selected:** Option ${selectedOption + 1}
**Correct Answer:** Option ${question.correct_option + 1}
**User was ${isCorrect ? 'CORRECT' : 'WRONG'}**

Provide:
1. Why the correct answer is correct
2. ${isCorrect ? 'Reinforce the concept' : 'Why the user\'s answer was wrong'}
3. Key facts to remember
4. Similar question patterns to practice

Keep it concise but comprehensive. Use simple language.
`;

    try {
        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error('Error generating explanation:', error);
        return question.explanation || 'Explanation not available.';
    }
};

// ==================== SMART TEST GENERATION ====================

interface SmartTestConfig {
    mode: 'exam_simulation' | 'high_probability' | 'weak_areas' | 'balanced';
    category: string;
    questionCount: number;
    difficulty: DifficultyLevel;
    topicImportance: TopicImportance[];
    repeatedQuestions: RepeatedQuestion[];
    userWeakAreas: { topic: string; score: number }[];
}

export const generateSmartTestDistribution = async (
    config: SmartTestConfig
): Promise<{ topic: string; count: number; priority: string }[]> => {
    const model = getModel();

    const prompt = `
Create an optimal question distribution for a ${config.mode} test:

**Mode:** ${config.mode}
- exam_simulation: Match actual exam pattern exactly
- high_probability: Focus on frequently repeated questions
- weak_areas: Prioritize user's weak topics
- balanced: Mix of all strategies

**Configuration:**
- Category: ${config.category}
- Total Questions: ${config.questionCount}
- Difficulty: ${config.difficulty}

**Topic Importance Scores:**
${JSON.stringify(config.topicImportance.slice(0, 10), null, 2)}

**High-Probability Topics (from repeated questions):**
${JSON.stringify(config.repeatedQuestions.slice(0, 10).map(r => r.topic_tags), null, 2)}

**User's Weak Areas:**
${JSON.stringify(config.userWeakAreas, null, 2)}

Calculate the optimal number of questions per topic.

Return ONLY valid JSON array:
[
  {"topic": "Topic Name", "count": 10, "priority": "critical"}
]

The sum of all counts must equal ${config.questionCount}.
`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('Failed to parse distribution JSON');

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Error generating smart distribution:', error);
        throw error;
    }
};

// ==================== IMPROVEMENT TIPS ====================

export const generateImprovementTips = async (
    category: string,
    examResult: {
        score: number;
        topicAnalysis: { topic: string; accuracy: number; avgTime: number }[];
    }
): Promise<string[]> => {
    const model = getModel();

    const prompt = `
Analyze this ${category} Railway exam result and provide actionable improvement tips:

**Overall Score:** ${examResult.score}%

**Topic-wise Performance:**
${JSON.stringify(examResult.topicAnalysis, null, 2)}

Provide 5-7 specific, actionable tips to improve:
1. Focus on topics with low accuracy
2. Time management suggestions
3. Study strategy recommendations
4. Resource recommendations
5. Practice patterns

Return ONLY a JSON array of tip strings:
["Tip 1", "Tip 2", ...]
`;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();

        const jsonMatch = response.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error('Failed to parse tips JSON');

        return JSON.parse(jsonMatch[0]);
    } catch (error) {
        console.error('Error generating tips:', error);
        return ['Review your weak topics', 'Practice more mock tests', 'Focus on time management'];
    }
};
