import { create } from 'zustand';
import type { Question, UserAnswer, ExamSession, ExamConfig, DifficultyLevel } from '@/types';

interface ExamStore {
    // Session State
    session: ExamSession | null;
    questions: Question[];
    answers: Map<string, UserAnswer>;
    currentQuestionIndex: number;
    timeRemaining: number;
    isTimerRunning: boolean;
    language: 'en' | 'hi';
    isSubmitting: boolean;
    examConfig: ExamConfig | null;

    // Actions
    initExam: (session: ExamSession, questions: Question[], config: ExamConfig) => void;
    setCurrentQuestion: (index: number) => void;
    nextQuestion: () => void;
    prevQuestion: () => void;
    selectAnswer: (questionId: string, optionIndex: number) => void;
    clearAnswer: (questionId: string) => void;
    markForReview: (questionId: string) => void;
    unmarkForReview: (questionId: string) => void;
    updateTime: (seconds: number) => void;
    decrementTime: () => void;
    toggleTimer: (running: boolean) => void;
    setLanguage: (lang: 'en' | 'hi') => void;
    submitExam: () => void;
    resetExam: () => void;

    // Computed
    getAnswer: (questionId: string) => UserAnswer | undefined;
    getAnswerStatus: (questionId: string) => string;
    getStats: () => { answered: number; marked: number; notVisited: number; skipped: number; notAnswered: number; markedForReview: number };
}

const createInitialAnswer = (questionId: string, questionNumber: number): UserAnswer => ({
    id: `answer_${Date.now()}_${questionNumber}`,
    session_id: '',
    question_id: questionId,
    question_number: questionNumber,
    selected_option: undefined,
    is_correct: undefined,
    time_spent_seconds: 0,
    status: 'not_visited',
});

export const useExamStore = create<ExamStore>((set, get) => ({
    // Initial State
    session: null,
    questions: [],
    answers: new Map(),
    currentQuestionIndex: 0,
    timeRemaining: 0,
    isTimerRunning: false,
    language: 'en',
    isSubmitting: false,
    examConfig: null,

    // Initialize exam
    initExam: (session, questions, config) => {
        const answersMap = new Map<string, UserAnswer>();
        questions.forEach((q, index) => {
            answersMap.set(q.id, createInitialAnswer(q.id, index + 1));
        });

        // Mark first question as visited
        const firstAnswer = answersMap.get(questions[0]?.id);
        if (firstAnswer) {
            firstAnswer.status = 'skipped'; // Visited but not answered
            answersMap.set(questions[0].id, firstAnswer);
        }

        set({
            session,
            questions,
            answers: answersMap,
            currentQuestionIndex: 0,
            timeRemaining: config.time_limit_minutes * 60,
            isTimerRunning: true,
            examConfig: config,
            isSubmitting: false,
        });
    },

    // Navigation
    setCurrentQuestion: (index) => {
        const { questions, answers } = get();
        if (index >= 0 && index < questions.length) {
            const question = questions[index];
            const answer = answers.get(question.id);

            // Mark as visited if not answered
            if (answer && answer.status === 'not_visited') {
                const updatedAnswers = new Map(answers);
                updatedAnswers.set(question.id, { ...answer, status: 'skipped' });
                set({ currentQuestionIndex: index, answers: updatedAnswers });
            } else {
                set({ currentQuestionIndex: index });
            }
        }
    },

    nextQuestion: () => {
        const { currentQuestionIndex, questions } = get();
        if (currentQuestionIndex < questions.length - 1) {
            get().setCurrentQuestion(currentQuestionIndex + 1);
        }
    },

    prevQuestion: () => {
        const { currentQuestionIndex } = get();
        if (currentQuestionIndex > 0) {
            get().setCurrentQuestion(currentQuestionIndex - 1);
        }
    },

    // Answer Management
    selectAnswer: (questionId, optionIndex) => {
        const { answers, questions } = get();
        const answer = answers.get(questionId);
        const question = questions.find(q => q.id === questionId);

        if (answer && question) {
            const isCorrect = optionIndex === question.correct_option;
            const newStatus = answer.status === 'marked_review' ? 'answered_marked' : 'answered';

            const updatedAnswers = new Map(answers);
            updatedAnswers.set(questionId, {
                ...answer,
                selected_option: optionIndex,
                is_correct: isCorrect,
                status: newStatus,
            });
            set({ answers: updatedAnswers });
        }
    },

    clearAnswer: (questionId) => {
        const { answers } = get();
        const answer = answers.get(questionId);

        if (answer) {
            const newStatus = answer.status === 'answered_marked' ? 'marked_review' : 'skipped';

            const updatedAnswers = new Map(answers);
            updatedAnswers.set(questionId, {
                ...answer,
                selected_option: undefined,
                is_correct: undefined,
                status: newStatus,
            });
            set({ answers: updatedAnswers });
        }
    },

    markForReview: (questionId) => {
        const { answers } = get();
        const answer = answers.get(questionId);

        if (answer) {
            const newStatus = answer.status === 'answered' ? 'answered_marked' : 'marked_review';

            const updatedAnswers = new Map(answers);
            updatedAnswers.set(questionId, { ...answer, status: newStatus });
            set({ answers: updatedAnswers });
        }
    },

    unmarkForReview: (questionId) => {
        const { answers } = get();
        const answer = answers.get(questionId);

        if (answer) {
            const newStatus = answer.status === 'answered_marked' ? 'answered' : 'skipped';

            const updatedAnswers = new Map(answers);
            updatedAnswers.set(questionId, { ...answer, status: newStatus });
            set({ answers: updatedAnswers });
        }
    },

    // Timer
    updateTime: (seconds) => set({ timeRemaining: seconds }),

    decrementTime: () => {
        const { timeRemaining, isTimerRunning } = get();
        if (isTimerRunning && timeRemaining > 0) {
            set({ timeRemaining: timeRemaining - 1 });
        }
    },

    toggleTimer: (running) => set({ isTimerRunning: running }),

    // Language
    setLanguage: (lang) => set({ language: lang }),

    // Submit
    submitExam: () => {
        set({ isSubmitting: true, isTimerRunning: false });
    },

    // Reset
    resetExam: () => {
        set({
            session: null,
            questions: [],
            answers: new Map(),
            currentQuestionIndex: 0,
            timeRemaining: 0,
            isTimerRunning: false,
            isSubmitting: false,
            examConfig: null,
        });
    },

    // Getters
    getAnswer: (questionId) => get().answers.get(questionId),

    getAnswerStatus: (questionId) => {
        const answer = get().answers.get(questionId);
        return answer?.status || 'not_visited';
    },

    getStats: () => {
        const { answers } = get();
        let answered = 0, marked = 0, notVisited = 0, skipped = 0;

        answers.forEach((answer) => {
            switch (answer.status) {
                case 'answered':
                    answered++;
                    break;
                case 'answered_marked':
                    answered++;
                    marked++;
                    break;
                case 'marked_review':
                    marked++;
                    break;
                case 'not_visited':
                    notVisited++;
                    break;
                case 'skipped':
                    skipped++;
                    break;
            }
        });

        const notAnswered = notVisited + skipped;
        const markedForReview = marked;

        return { answered, marked, notVisited, skipped, notAnswered, markedForReview };
    },
}));

// User store for auth and preferences
interface UserStore {
    user: {
        id: string;
        email: string;
        name: string;
        avatar?: string;
        level: string;
        xp: number;
        streak: number;
    } | null;
    isLoading: boolean;
    preferences: {
        theme: 'dark' | 'light';
        language: 'en' | 'hi';
        notifications: boolean;
    };
    setUser: (user: UserStore['user']) => void;
    clearUser: () => void;
    setPreference: <K extends keyof UserStore['preferences']>(key: K, value: UserStore['preferences'][K]) => void;
}

export const useUserStore = create<UserStore>((set) => ({
    user: null,
    isLoading: true,
    preferences: {
        theme: 'dark',
        language: 'en',
        notifications: true,
    },
    setUser: (user) => set({ user, isLoading: false }),
    clearUser: () => set({ user: null, isLoading: false }),
    setPreference: (key, value) =>
        set((state) => ({
            preferences: { ...state.preferences, [key]: value },
        })),
}));
