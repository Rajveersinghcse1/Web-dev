// Question Types
export type QuestionType = 'mcq' | 'fill';

export interface Question {
    id: number;
    type: QuestionType;
    question: string;
    options?: string[]; // Only for MCQ
    correctAnswer: string;
    marks: number;
    topic?: string; // Topic categorization
}

export interface UserAnswer {
    questionId: number;
    answer: string | null;
    isMarkedForReview: boolean;
}

export type QuestionStatus = 'not-visited' | 'not-answered' | 'answered' | 'marked-for-review';

export interface TestSet {
    setId: 'A' | 'B' | 'C';
    questions: Question[];
}

export interface TestConfig {
    subject: string;
    totalQuestions: number;
    timePerQuestion: number; // in seconds
    positiveMarks: number;
    negativeMarks: number;
}

export interface TestResult {
    totalQuestions: number;
    attempted: number;
    correct: number;
    incorrect: number;
    unanswered: number;
    totalScore: number;
    maxScore: number;
    positiveMarks: number;
    negativeMarks: number;
    percentage: number;
    questionAnalysis: QuestionAnalysis[];
}

export interface QuestionAnalysis {
    questionId: number;
    question: string;
    userAnswer: string | null;
    correctAnswer: string;
    isCorrect: boolean;
    marks: number;
    timeTaken?: number; // Time spent on this question in seconds
    topic?: string; // Topic categorization
}

// Topic-wise analytics
export interface TopicAnalysis {
    topicName: string;
    questionsAttempted: number;
    correct: number;
    accuracy: number;
}

// Progress graph data point
export interface ProgressDataPoint {
    date: number;
    percentage: number;
    subject: string;
    correct: number;
    totalQuestions: number;
}

// Leaderboard entry
export interface LeaderboardEntry {
    id: string;
    name: string;
    avatarUrl?: string;
    totalTests: number;
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
}

export type TestPhase = 'chat' | 'loading' | 'test' | 'result';
