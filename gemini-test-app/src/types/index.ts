// Question Types
export type QuestionType = 'mcq' | 'fill';

export interface Question {
    id: number;
    type: QuestionType;
    question: string;
    options?: string[]; // Only for MCQ
    correctAnswer: string;
    marks: number;
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
}

export type TestPhase = 'chat' | 'loading' | 'test' | 'result';
