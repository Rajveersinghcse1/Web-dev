import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Question, UserAnswer, TestSet, TestResult, TestPhase, QuestionAnalysis } from '../types';

interface DynamicSetAnswers {
    [key: string]: UserAnswer[];
}

interface DynamicSetVisited {
    [key: string]: Set<number>;
}

interface QuestionTimeRecord {
    questionId: number;
    setId: string;
    timeTaken: number; // in seconds
}

interface UserTestConfig {
    questionsPerSet: number;
    timePerQuestion: number;
    numSets: number;
    positiveMarks: number;
    negativeMarks: number;
}

interface TestContextType {
    // State
    phase: TestPhase;
    subject: string;
    testSets: TestSet[];
    currentSetIndex: number;
    currentQuestionIndex: number;
    allSetAnswers: DynamicSetAnswers;
    result: TestResult | null;
    isLoading: boolean;
    error: string | null;
    testConfig: UserTestConfig;
    questionTimes: QuestionTimeRecord[];

    // Actions
    setSubject: (subject: string) => void;
    setTestSets: (sets: TestSet[]) => void;
    setCurrentSetIndex: (index: number) => void;
    setCurrentQuestionIndex: (index: number) => void;
    setAnswer: (questionId: number, answer: string) => void;
    toggleMarkForReview: (questionId: number) => void;
    setPhase: (phase: TestPhase) => void;
    setIsLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
    setTestConfig: (config: Partial<UserTestConfig>) => void;
    calculateCombinedResult: () => void;
    resetTest: () => void;
    getCurrentQuestions: () => Question[];
    getCurrentSetId: () => string;
    getQuestionStatus: (questionId: number) => 'not-visited' | 'not-answered' | 'answered' | 'marked-for-review';
    getSetProgress: (setIndex: number) => { answered: number; total: number };
    getTotalProgress: () => { answered: number; total: number };
    goToNextSet: () => boolean;
    goToPreviousSet: () => boolean;
    recordQuestionTime: () => void;
    startQuestionTimer: () => void;
}

const TestContext = createContext<TestContextType | null>(null);

const DEFAULT_CONFIG: UserTestConfig = {
    questionsPerSet: 20,
    timePerQuestion: 60,
    numSets: 3,
    positiveMarks: 4,
    negativeMarks: 1,
};

export function TestProvider({ children }: { children: ReactNode }) {
    const [phase, setPhase] = useState<TestPhase>('chat');
    const [subject, setSubject] = useState<string>('');
    const [testSets, setTestSets] = useState<TestSet[]>([]);
    const [currentSetIndex, setCurrentSetIndex] = useState<number>(0);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
    const [allSetAnswers, setAllSetAnswers] = useState<DynamicSetAnswers>({});
    const [result, setResult] = useState<TestResult | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [testConfig, setTestConfigState] = useState<UserTestConfig>(DEFAULT_CONFIG);
    const [visitedQuestions, setVisitedQuestions] = useState<DynamicSetVisited>({});
    const [questionTimes, setQuestionTimes] = useState<QuestionTimeRecord[]>([]);

    // Timer ref to track when question started
    const questionStartTime = useRef<number>(Date.now());

    const getCurrentSetId = useCallback((): string => {
        return testSets[currentSetIndex]?.setId || 'A';
    }, [testSets, currentSetIndex]);

    const getCurrentQuestions = useCallback((): Question[] => {
        return testSets[currentSetIndex]?.questions || [];
    }, [testSets, currentSetIndex]);

    const setTestConfig = useCallback((config: Partial<UserTestConfig>) => {
        setTestConfigState(prev => ({ ...prev, ...config }));
    }, []);

    const startQuestionTimer = useCallback(() => {
        questionStartTime.current = Date.now();
    }, []);

    const recordQuestionTime = useCallback(() => {
        const timeTaken = Math.round((Date.now() - questionStartTime.current) / 1000);
        const setId = getCurrentSetId();
        const questions = getCurrentQuestions();
        const questionId = questions[currentQuestionIndex]?.id;

        if (questionId) {
            setQuestionTimes(prev => {
                // Check if already recorded for this question
                const existing = prev.find(t => t.questionId === questionId && t.setId === setId);
                if (existing) {
                    // Update time if revisited
                    return prev.map(t =>
                        t.questionId === questionId && t.setId === setId
                            ? { ...t, timeTaken: t.timeTaken + timeTaken }
                            : t
                    );
                }
                return [...prev, { questionId, setId, timeTaken }];
            });
        }
        // Reset timer for next question
        questionStartTime.current = Date.now();
    }, [getCurrentSetId, getCurrentQuestions, currentQuestionIndex]);

    const setAnswer = useCallback((questionId: number, answer: string) => {
        const setId = getCurrentSetId();
        setAllSetAnswers(prev => {
            const currentAnswers = prev[setId] || [];
            const existing = currentAnswers.find(a => a.questionId === questionId);
            if (existing) {
                return {
                    ...prev,
                    [setId]: currentAnswers.map(a =>
                        a.questionId === questionId ? { ...a, answer } : a
                    )
                };
            }
            return {
                ...prev,
                [setId]: [...currentAnswers, { questionId, answer, isMarkedForReview: false }]
            };
        });
        setVisitedQuestions(prev => {
            const currentVisited = prev[setId] || new Set();
            return {
                ...prev,
                [setId]: new Set(currentVisited).add(questionId)
            };
        });
    }, [getCurrentSetId]);

    const toggleMarkForReview = useCallback((questionId: number) => {
        const setId = getCurrentSetId();
        setAllSetAnswers(prev => {
            const currentAnswers = prev[setId] || [];
            const existing = currentAnswers.find(a => a.questionId === questionId);
            if (existing) {
                return {
                    ...prev,
                    [setId]: currentAnswers.map(a =>
                        a.questionId === questionId ? { ...a, isMarkedForReview: !a.isMarkedForReview } : a
                    )
                };
            }
            return {
                ...prev,
                [setId]: [...currentAnswers, { questionId, answer: null, isMarkedForReview: true }]
            };
        });
    }, [getCurrentSetId]);

    const getQuestionStatus = useCallback((questionId: number): 'not-visited' | 'not-answered' | 'answered' | 'marked-for-review' => {
        const setId = getCurrentSetId();
        const answers = allSetAnswers[setId] || [];
        const visited = visitedQuestions[setId] || new Set();
        const answer = answers.find(a => a.questionId === questionId);
        if (answer?.isMarkedForReview) return 'marked-for-review';
        if (answer?.answer) return 'answered';
        if (visited.has(questionId)) return 'not-answered';
        return 'not-visited';
    }, [allSetAnswers, getCurrentSetId, visitedQuestions]);

    const getSetProgress = useCallback((setIndex: number): { answered: number; total: number } => {
        const set = testSets[setIndex];
        if (!set) return { answered: 0, total: 0 };
        const answers = allSetAnswers[set.setId] || [];
        const answered = answers.filter(a => a.answer !== null && a.answer !== '').length;
        return { answered, total: set.questions.length };
    }, [allSetAnswers, testSets]);

    const getTotalProgress = useCallback((): { answered: number; total: number } => {
        let totalAnswered = 0;
        let totalQuestions = 0;
        testSets.forEach((_, index) => {
            const progress = getSetProgress(index);
            totalAnswered += progress.answered;
            totalQuestions += progress.total;
        });
        return { answered: totalAnswered, total: totalQuestions };
    }, [getSetProgress, testSets]);

    const goToNextSet = useCallback((): boolean => {
        if (currentSetIndex < testSets.length - 1) {
            recordQuestionTime();
            setCurrentSetIndex(prev => prev + 1);
            setCurrentQuestionIndex(0);
            startQuestionTimer();
            return true;
        }
        return false;
    }, [currentSetIndex, testSets.length, recordQuestionTime, startQuestionTimer]);

    const goToPreviousSet = useCallback((): boolean => {
        if (currentSetIndex > 0) {
            recordQuestionTime();
            setCurrentSetIndex(prev => prev - 1);
            setCurrentQuestionIndex(0);
            startQuestionTimer();
            return true;
        }
        return false;
    }, [currentSetIndex, recordQuestionTime, startQuestionTimer]);

    const calculateCombinedResult = useCallback(() => {
        // Record time for current question before submitting
        recordQuestionTime();

        let totalCorrect = 0;
        let totalIncorrect = 0;
        let totalUnanswered = 0;
        const allQuestionAnalysis: QuestionAnalysis[] = [];

        testSets.forEach((set, setIndex) => {
            const answers = allSetAnswers[set.setId] || [];

            set.questions.forEach((question, qIndex) => {
                const userAnswer = answers.find(a => a.questionId === question.id);
                const timeRecord = questionTimes.find(t => t.questionId === question.id && t.setId === set.setId);
                let isCorrect = false;

                if (!userAnswer?.answer) {
                    totalUnanswered++;
                } else {
                    if (question.type === 'mcq') {
                        isCorrect = userAnswer.answer === question.correctAnswer;
                    } else {
                        isCorrect = userAnswer.answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
                    }

                    if (isCorrect) {
                        totalCorrect++;
                    } else {
                        totalIncorrect++;
                    }
                }

                allQuestionAnalysis.push({
                    questionId: question.id + (setIndex * 100),
                    question: `[Set ${set.setId} - Q${qIndex + 1}] ${question.question}`,
                    userAnswer: userAnswer?.answer || null,
                    correctAnswer: question.correctAnswer,
                    isCorrect,
                    marks: isCorrect ? testConfig.positiveMarks : (userAnswer?.answer ? -testConfig.negativeMarks : 0),
                    timeTaken: timeRecord?.timeTaken || 0,
                });
            });
        });

        const totalQuestions = allQuestionAnalysis.length;
        const positiveMarks = totalCorrect * testConfig.positiveMarks;
        const negativeMarks = totalIncorrect * testConfig.negativeMarks;
        const totalScore = positiveMarks - negativeMarks;
        const maxScore = totalQuestions * testConfig.positiveMarks;

        setResult({
            totalQuestions,
            attempted: totalCorrect + totalIncorrect,
            correct: totalCorrect,
            incorrect: totalIncorrect,
            unanswered: totalUnanswered,
            totalScore,
            maxScore,
            positiveMarks,
            negativeMarks,
            percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
            questionAnalysis: allQuestionAnalysis,
        });

        setPhase('result');
    }, [testSets, allSetAnswers, testConfig, questionTimes, recordQuestionTime]);

    const resetTest = useCallback(() => {
        setPhase('chat');
        setSubject('');
        setTestSets([]);
        setCurrentSetIndex(0);
        setCurrentQuestionIndex(0);
        setAllSetAnswers({});
        setResult(null);
        setIsLoading(false);
        setError(null);
        setVisitedQuestions({});
        setTestConfigState(DEFAULT_CONFIG);
        setQuestionTimes([]);
    }, []);

    const value: TestContextType = {
        phase,
        subject,
        testSets,
        currentSetIndex,
        currentQuestionIndex,
        allSetAnswers,
        result,
        isLoading,
        error,
        testConfig,
        questionTimes,
        setSubject,
        setTestSets,
        setCurrentSetIndex,
        setCurrentQuestionIndex,
        setAnswer,
        toggleMarkForReview,
        setPhase,
        setIsLoading,
        setError,
        setTestConfig,
        calculateCombinedResult,
        resetTest,
        getCurrentQuestions,
        getCurrentSetId,
        getQuestionStatus,
        getSetProgress,
        getTotalProgress,
        goToNextSet,
        goToPreviousSet,
        recordQuestionTime,
        startQuestionTimer,
    };

    return (
        <TestContext.Provider value={value}>
            {children}
        </TestContext.Provider>
    );
}

export function useTest() {
    const context = useContext(TestContext);
    if (!context) {
        throw new Error('useTest must be used within a TestProvider');
    }
    return context;
}
