import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// ==================== QUERIES ====================

/**
 * Get all levels
 */
export const getLevels = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("aptitudeLevels").collect();
    }
});

/**
 * Get user's aptitude progress
 */
export const getUserProgress = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const progress = await ctx.db.query("userAptitudeProgress")
            .withIndex("by_user", q => q.eq("userId", args.userId))
            .first();

        if (!progress) {
            // Return default progress for new users
            return {
                currentLevel: 1,
                totalCoins: 0,
                totalXp: 0,
                totalQuestionsAnswered: 0,
                totalCorrectAnswers: 0,
                totalTestsCompleted: 0,
                averageAccuracy: 0,
                averageTimePerQuestion: 0,
                unlockedLevels: [1],
                badges: [],
                isNew: true
            };
        }
        return progress;
    }
});

/**
 * Get questions for a specific level (randomized)
 */
export const getQuestionsForLevel = query({
    args: {
        level: v.number(),
        count: v.optional(v.number())
    },
    handler: async (ctx, args) => {
        const questions = await ctx.db.query("aptitudeQuestions")
            .withIndex("by_level", q => q.eq("level", args.level))
            .collect();

        // Shuffle and limit
        const shuffled = questions.sort(() => Math.random() - 0.5);
        const count = args.count || 10;
        return shuffled.slice(0, count);
    }
});

/**
 * Get level details
 */
export const getLevelDetails = query({
    args: { level: v.number() },
    handler: async (ctx, args) => {
        return await ctx.db.query("aptitudeLevels")
            .withIndex("by_level", q => q.eq("level", args.level))
            .first();
    }
});

/**
 * Get user's test history
 */
export const getTestHistory = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.query("aptitudeTestSessions")
            .withIndex("by_user", q => q.eq("userId", args.userId))
            .order("desc")
            .take(20);
    }
});

// ==================== MUTATIONS ====================

/**
 * Initialize user progress (called on first visit)
 */
export const initializeProgress = mutation({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const existing = await ctx.db.query("userAptitudeProgress")
            .withIndex("by_user", q => q.eq("userId", args.userId))
            .first();

        if (existing) return existing._id;

        const now = Date.now();
        return await ctx.db.insert("userAptitudeProgress", {
            userId: args.userId,
            currentLevel: 1,
            totalCoins: 0,
            totalXp: 0,
            totalQuestionsAnswered: 0,
            totalCorrectAnswers: 0,
            totalTestsCompleted: 0,
            averageAccuracy: 0,
            averageTimePerQuestion: 0,
            unlockedLevels: [1],
            badges: [],
            currentStreak: 0,
            createdAt: now,
            updatedAt: now
        });
    }
});

/**
 * Start a new test session
 */
export const startTestSession = mutation({
    args: {
        userId: v.id("users"),
        level: v.number()
    },
    handler: async (ctx, args) => {
        const sessionId = `test_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        const levelDetails = await ctx.db.query("aptitudeLevels")
            .withIndex("by_level", q => q.eq("level", args.level))
            .first();

        await ctx.db.insert("aptitudeTestSessions", {
            userId: args.userId,
            sessionId,
            level: args.level,
            totalQuestions: levelDetails?.questionsPerAttempt || 10,
            correctAnswers: 0,
            wrongAnswers: 0,
            skippedQuestions: 0,
            coinsEarned: 0,
            xpEarned: 0,
            passed: false,
            totalTime: 0,
            averageTime: 0,
            status: "in_progress",
            startedAt: Date.now()
        });

        return sessionId;
    }
});

/**
 * Submit answer for a question
 */
export const submitAnswer = mutation({
    args: {
        userId: v.id("users"),
        sessionId: v.string(),
        questionId: v.string(),
        selectedAnswer: v.string(),
        timeTaken: v.number()
    },
    handler: async (ctx, args) => {
        // Get the question to check answer
        const question = await ctx.db.query("aptitudeQuestions")
            .withIndex("by_question_id", q => q.eq("questionId", args.questionId))
            .first();

        if (!question) throw new Error("Question not found");

        const isCorrect = question.correctAnswer === args.selectedAnswer;

        // Get level details for rewards
        const levelDetails = await ctx.db.query("aptitudeLevels")
            .withIndex("by_level", q => q.eq("level", question.level))
            .first();

        const coinsEarned = isCorrect ? (levelDetails?.coinReward || 10) : 0;
        const xpEarned = isCorrect ? (levelDetails?.xpReward || 5) : 0;

        // Record the attempt
        await ctx.db.insert("aptitudeAttempts", {
            userId: args.userId,
            sessionId: args.sessionId,
            questionId: args.questionId,
            level: question.level,
            category: question.category,
            selectedAnswer: args.selectedAnswer,
            isCorrect,
            timeTaken: args.timeTaken,
            coinsEarned,
            xpEarned,
            attemptedAt: Date.now()
        });

        // Update session stats
        const session = await ctx.db.query("aptitudeTestSessions")
            .withIndex("by_session_id", q => q.eq("sessionId", args.sessionId))
            .first();

        if (session) {
            await ctx.db.patch(session._id, {
                correctAnswers: session.correctAnswers + (isCorrect ? 1 : 0),
                wrongAnswers: session.wrongAnswers + (isCorrect ? 0 : 1),
                coinsEarned: session.coinsEarned + coinsEarned,
                xpEarned: session.xpEarned + xpEarned,
                totalTime: session.totalTime + args.timeTaken
            });
        }

        // Update user progress
        const progress = await ctx.db.query("userAptitudeProgress")
            .withIndex("by_user", q => q.eq("userId", args.userId))
            .first();

        if (progress) {
            const newTotal = progress.totalQuestionsAnswered + 1;
            const newCorrect = progress.totalCorrectAnswers + (isCorrect ? 1 : 0);
            await ctx.db.patch(progress._id, {
                totalCoins: progress.totalCoins + coinsEarned,
                totalXp: progress.totalXp + xpEarned,
                totalQuestionsAnswered: newTotal,
                totalCorrectAnswers: newCorrect,
                averageAccuracy: Math.round((newCorrect / newTotal) * 100),
                updatedAt: Date.now()
            });
        }

        return {
            isCorrect,
            correctAnswer: question.correctAnswer,
            explanation: question.explanation,
            coinsEarned,
            xpEarned
        };
    }
});

/**
 * Complete a test session
 */
export const completeTestSession = mutation({
    args: {
        userId: v.id("users"),
        sessionId: v.string()
    },
    handler: async (ctx, args) => {
        const session = await ctx.db.query("aptitudeTestSessions")
            .withIndex("by_session_id", q => q.eq("sessionId", args.sessionId))
            .first();

        if (!session) throw new Error("Session not found");

        const levelDetails = await ctx.db.query("aptitudeLevels")
            .withIndex("by_level", q => q.eq("level", session.level))
            .first();

        const accuracy = session.totalQuestions > 0
            ? (session.correctAnswers / session.totalQuestions) * 100
            : 0;
        const passed = accuracy >= (levelDetails?.passingScore || 70);
        const avgTime = session.totalQuestions > 0
            ? session.totalTime / session.totalQuestions
            : 0;

        await ctx.db.patch(session._id, {
            status: "completed",
            passed,
            averageTime: avgTime,
            skippedQuestions: session.totalQuestions - session.correctAnswers - session.wrongAnswers,
            completedAt: Date.now()
        });

        // Update user progress
        const progress = await ctx.db.query("userAptitudeProgress")
            .withIndex("by_user", q => q.eq("userId", args.userId))
            .first();

        if (progress) {
            const updates = {
                totalTestsCompleted: progress.totalTestsCompleted + 1,
                updatedAt: Date.now()
            };

            // Check if user can unlock next level
            if (passed && !progress.unlockedLevels.includes(session.level + 1)) {
                const nextLevel = await ctx.db.query("aptitudeLevels")
                    .withIndex("by_level", q => q.eq("level", session.level + 1))
                    .first();

                if (nextLevel && progress.totalCoins >= nextLevel.requiredCoins) {
                    updates.unlockedLevels = [...progress.unlockedLevels, session.level + 1];
                    updates.currentLevel = session.level + 1;
                }
            }

            await ctx.db.patch(progress._id, updates);
        }

        return {
            passed,
            accuracy: Math.round(accuracy),
            coinsEarned: session.coinsEarned,
            xpEarned: session.xpEarned,
            correctAnswers: session.correctAnswers,
            totalQuestions: session.totalQuestions
        };
    }
});

/**
 * Unlock a level with coins
 */
export const unlockLevel = mutation({
    args: {
        userId: v.id("users"),
        level: v.number()
    },
    handler: async (ctx, args) => {
        const progress = await ctx.db.query("userAptitudeProgress")
            .withIndex("by_user", q => q.eq("userId", args.userId))
            .first();

        if (!progress) throw new Error("Progress not found");
        if (progress.unlockedLevels.includes(args.level)) {
            return { success: true, message: "Already unlocked" };
        }

        const levelDetails = await ctx.db.query("aptitudeLevels")
            .withIndex("by_level", q => q.eq("level", args.level))
            .first();

        if (!levelDetails) throw new Error("Level not found");
        if (progress.totalCoins < levelDetails.requiredCoins) {
            return { success: false, message: "Not enough coins" };
        }

        await ctx.db.patch(progress._id, {
            totalCoins: progress.totalCoins - levelDetails.requiredCoins,
            unlockedLevels: [...progress.unlockedLevels, args.level],
            updatedAt: Date.now()
        });

        return { success: true, message: "Level unlocked!" };
    }
});

// ==================== SEED DATA ====================

export const seedLevels = mutation({
    args: {},
    handler: async (ctx) => {
        const levels = [
            { level: 1, name: "Beginner", description: "Start your journey with basic aptitude questions", requiredCoins: 0, questionsPerAttempt: 5, timePerQuestion: 60, coinReward: 10, xpReward: 5, passingScore: 60, icon: "Sparkles", color: "emerald" },
            { level: 2, name: "Foundation", description: "Build your foundation with slightly harder questions", requiredCoins: 50, questionsPerAttempt: 8, timePerQuestion: 55, coinReward: 15, xpReward: 8, passingScore: 65, icon: "BookOpen", color: "blue" },
            { level: 3, name: "Intermediate", description: "Challenge yourself with intermediate problems", requiredCoins: 150, questionsPerAttempt: 10, timePerQuestion: 50, coinReward: 20, xpReward: 10, passingScore: 70, icon: "Target", color: "violet" },
            { level: 4, name: "Advanced", description: "Test your skills with advanced questions", requiredCoins: 300, questionsPerAttempt: 12, timePerQuestion: 45, coinReward: 25, xpReward: 15, passingScore: 70, icon: "Flame", color: "orange" },
            { level: 5, name: "Expert", description: "Prove your expertise with tough problems", requiredCoins: 500, questionsPerAttempt: 15, timePerQuestion: 40, coinReward: 30, xpReward: 20, passingScore: 75, icon: "Crown", color: "amber" },
            { level: 6, name: "Master", description: "Master-level challenges for the best", requiredCoins: 800, questionsPerAttempt: 20, timePerQuestion: 35, coinReward: 40, xpReward: 25, passingScore: 80, icon: "Trophy", color: "red" }
        ];

        for (const lvl of levels) {
            const existing = await ctx.db.query("aptitudeLevels")
                .withIndex("by_level", q => q.eq("level", lvl.level))
                .first();
            if (!existing) {
                await ctx.db.insert("aptitudeLevels", lvl);
            }
        }
        return "Levels seeded!";
    }
});

export const seedQuestions = mutation({
    args: {},
    handler: async (ctx) => {
        const questions = [
            // Level 1 - Beginner
            { questionId: "q1_1", level: 1, category: "quantitative", type: "mcq", difficulty: "easy", question: "What is 25% of 80?", options: [{ id: "a", text: "15" }, { id: "b", text: "20" }, { id: "c", text: "25" }, { id: "d", text: "30" }], correctAnswer: "b", explanation: "25% of 80 = (25/100) × 80 = 20" },
            { questionId: "q1_2", level: 1, category: "quantitative", type: "mcq", difficulty: "easy", question: "If a train travels 60 km in 1 hour, how far will it travel in 3 hours?", options: [{ id: "a", text: "120 km" }, { id: "b", text: "150 km" }, { id: "c", text: "180 km" }, { id: "d", text: "200 km" }], correctAnswer: "c", explanation: "Distance = Speed × Time = 60 × 3 = 180 km" },
            { questionId: "q1_3", level: 1, category: "logical", type: "mcq", difficulty: "easy", question: "Complete the series: 2, 4, 8, 16, ?", options: [{ id: "a", text: "20" }, { id: "b", text: "24" }, { id: "c", text: "32" }, { id: "d", text: "36" }], correctAnswer: "c", explanation: "Each number is multiplied by 2. 16 × 2 = 32" },
            { questionId: "q1_4", level: 1, category: "logical", type: "mcq", difficulty: "easy", question: "Which number comes next: 5, 10, 15, 20, ?", options: [{ id: "a", text: "22" }, { id: "b", text: "25" }, { id: "c", text: "30" }, { id: "d", text: "35" }], correctAnswer: "b", explanation: "Pattern adds 5 each time. 20 + 5 = 25" },
            { questionId: "q1_5", level: 1, category: "verbal", type: "mcq", difficulty: "easy", question: "Choose the synonym of 'HAPPY':", options: [{ id: "a", text: "Sad" }, { id: "b", text: "Joyful" }, { id: "c", text: "Angry" }, { id: "d", text: "Tired" }], correctAnswer: "b", explanation: "Joyful means feeling or expressing great happiness." },

            // Level 2 - Foundation
            { questionId: "q2_1", level: 2, category: "quantitative", type: "mcq", difficulty: "easy", question: "A shopkeeper sells an item for ₹450 at 25% profit. What was the cost price?", options: [{ id: "a", text: "₹320" }, { id: "b", text: "₹360" }, { id: "c", text: "₹380" }, { id: "d", text: "₹400" }], correctAnswer: "b", explanation: "CP = SP / 1.25 = 450 / 1.25 = ₹360" },
            { questionId: "q2_2", level: 2, category: "quantitative", type: "mcq", difficulty: "medium", question: "The ratio of boys to girls in a class is 3:2. If there are 30 boys, how many girls are there?", options: [{ id: "a", text: "15" }, { id: "b", text: "20" }, { id: "c", text: "25" }, { id: "d", text: "18" }], correctAnswer: "b", explanation: "3:2 means for every 3 boys, 2 girls. 30/3 = 10 units, so girls = 10 × 2 = 20" },
            { questionId: "q2_3", level: 2, category: "logical", type: "mcq", difficulty: "medium", question: "If APPLE is coded as ELPPA, how is MANGO coded?", options: [{ id: "a", text: "OGNAM" }, { id: "b", text: "MANOG" }, { id: "c", text: "GNAMO" }, { id: "d", text: "NAMGO" }], correctAnswer: "a", explanation: "The word is reversed. MANGO → OGNAM" },
            { questionId: "q2_4", level: 2, category: "verbal", type: "mcq", difficulty: "easy", question: "Choose the antonym of 'ANCIENT':", options: [{ id: "a", text: "Old" }, { id: "b", text: "Historic" }, { id: "c", text: "Modern" }, { id: "d", text: "Traditional" }], correctAnswer: "c", explanation: "Modern is the opposite of ancient." },
            { questionId: "q2_5", level: 2, category: "technical", type: "mcq", difficulty: "easy", question: "What does HTML stand for?", options: [{ id: "a", text: "Hyper Text Markup Language" }, { id: "b", text: "High Tech Modern Language" }, { id: "c", text: "Hyper Transfer Markup Language" }, { id: "d", text: "Home Tool Markup Language" }], correctAnswer: "a", explanation: "HTML = Hyper Text Markup Language" },

            // Level 3 - Intermediate
            { questionId: "q3_1", level: 3, category: "quantitative", type: "mcq", difficulty: "medium", question: "A sum of ₹5000 becomes ₹6050 in 2 years at simple interest. What is the rate of interest?", options: [{ id: "a", text: "10.5%" }, { id: "b", text: "11%" }, { id: "c", text: "10%" }, { id: "d", text: "12%" }], correctAnswer: "a", explanation: "SI = 6050-5000 = 1050. R = (SI × 100)/(P × T) = (1050 × 100)/(5000 × 2) = 10.5%" },
            { questionId: "q3_2", level: 3, category: "quantitative", type: "mcq", difficulty: "medium", question: "If 8 workers can complete a job in 12 days, how many days will 6 workers take?", options: [{ id: "a", text: "14 days" }, { id: "b", text: "16 days" }, { id: "c", text: "18 days" }, { id: "d", text: "20 days" }], correctAnswer: "b", explanation: "Workers × Days = constant. 8 × 12 = 6 × x, so x = 96/6 = 16 days" },
            { questionId: "q3_3", level: 3, category: "logical", type: "mcq", difficulty: "medium", question: "In a certain code, COMPUTER is written as RFUVQNPC. How will MEDICINE be written?", options: [{ id: "a", text: "MFEJDJOF" }, { id: "b", text: "FDEJNMDI" }, { id: "c", text: "ENICIDED" }, { id: "d", text: "ENDJDJEM" }], correctAnswer: "d", explanation: "Each letter moves +1, -1 alternating pattern." },
            { questionId: "q3_4", level: 3, category: "hr", type: "mcq", difficulty: "medium", question: "What is your greatest weakness? (Best answer approach)", options: [{ id: "a", text: "I have no weaknesses" }, { id: "b", text: "Mention a real weakness and how you're improving it" }, { id: "c", text: "Say you work too hard" }, { id: "d", text: "Avoid answering" }], correctAnswer: "b", explanation: "Best approach is to be honest about a weakness and show self-improvement." },
            { questionId: "q3_5", level: 3, category: "technical", type: "mcq", difficulty: "medium", question: "What is the time complexity of binary search?", options: [{ id: "a", text: "O(n)" }, { id: "b", text: "O(n²)" }, { id: "c", text: "O(log n)" }, { id: "d", text: "O(1)" }], correctAnswer: "c", explanation: "Binary search divides the search space in half each time, giving O(log n)." },

            // Level 4 - Advanced
            { questionId: "q4_1", level: 4, category: "quantitative", type: "mcq", difficulty: "hard", question: "A boat can travel 20 km upstream in 4 hours and 24 km downstream in 3 hours. What is the speed of the stream?", options: [{ id: "a", text: "1.5 km/hr" }, { id: "b", text: "2 km/hr" }, { id: "c", text: "1 km/hr" }, { id: "d", text: "2.5 km/hr" }], correctAnswer: "c", explanation: "Upstream speed = 5 km/hr, Downstream = 8 km/hr. Stream = (8-5)/2 = 1.5 km/hr" },
            { questionId: "q4_2", level: 4, category: "logical", type: "mcq", difficulty: "hard", question: "A is B's sister. C is B's mother. D is C's father. E is D's mother. How is A related to D?", options: [{ id: "a", text: "Granddaughter" }, { id: "b", text: "Grandmother" }, { id: "c", text: "Daughter" }, { id: "d", text: "Grandfather" }], correctAnswer: "a", explanation: "A → B's sister → C's daughter → D's granddaughter" },
            { questionId: "q4_3", level: 4, category: "technical", type: "mcq", difficulty: "hard", question: "Which data structure uses LIFO (Last In First Out)?", options: [{ id: "a", text: "Queue" }, { id: "b", text: "Stack" }, { id: "c", text: "Array" }, { id: "d", text: "Linked List" }], correctAnswer: "b", explanation: "Stack follows LIFO - the last element added is the first to be removed." },
            { questionId: "q4_4", level: 4, category: "hr", type: "mcq", difficulty: "medium", question: "Why do you want to join our company?", options: [{ id: "a", text: "For the salary" }, { id: "b", text: "Research the company and give specific reasons" }, { id: "c", text: "I need a job" }, { id: "d", text: "My friend works here" }], correctAnswer: "b", explanation: "Research the company and mention specific things that attract you." },
            { questionId: "q4_5", level: 4, category: "quantitative", type: "mcq", difficulty: "hard", question: "The compound interest on ₹10000 for 2 years at 10% per annum is:", options: [{ id: "a", text: "₹2000" }, { id: "b", text: "₹2100" }, { id: "c", text: "₹2200" }, { id: "d", text: "₹2050" }], correctAnswer: "b", explanation: "CI = P(1+R)^T - P = 10000(1.1)² - 10000 = 12100 - 10000 = ₹2100" }
        ];

        for (const q of questions) {
            const existing = await ctx.db.query("aptitudeQuestions")
                .withIndex("by_question_id", qb => qb.eq("questionId", q.questionId))
                .first();
            if (!existing) {
                await ctx.db.insert("aptitudeQuestions", q);
            }
        }
        return `Seeded ${questions.length} questions!`;
    }
});
