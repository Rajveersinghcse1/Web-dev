import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

// Generate a random 6-character code
function generateCode() {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
}

// ==================== QUERIES ====================

/**
 * Get all public tests
 */
export const getPublicTests = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("communityTests")
            .withIndex("by_visibility", q => q.eq("visibility", "public"))
            .filter(q => q.eq(q.field("status"), "active"))
            .order("desc")
            .take(50);
    }
});

/**
 * Get tests created by a user
 */
export const getMyTests = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.query("communityTests")
            .withIndex("by_creator", q => q.eq("creatorId", args.userId))
            .order("desc")
            .collect();
    }
});

/**
 * Get test by code
 */
export const getTestByCode = query({
    args: { code: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db.query("communityTests")
            .withIndex("by_code", q => q.eq("code", args.code.toUpperCase()))
            .first();
    }
});

/**
 * Get test questions
 */
export const getTestQuestions = query({
    args: { testId: v.string() },
    handler: async (ctx, args) => {
        const questions = await ctx.db.query("communityTestQuestions")
            .withIndex("by_test", q => q.eq("testId", args.testId))
            .collect();
        return questions.sort((a, b) => a.questionIndex - b.questionIndex);
    }
});

/**
 * Get test leaderboard
 */
export const getTestLeaderboard = query({
    args: { testId: v.string() },
    handler: async (ctx, args) => {
        const results = await ctx.db.query("communityTestResults")
            .withIndex("by_test", q => q.eq("testId", args.testId))
            .filter(q => q.eq(q.field("status"), "completed"))
            .collect();

        return results
            .sort((a, b) => b.score - a.score || a.timeTaken - b.timeTaken)
            .slice(0, 20);
    }
});

/**
 * Get user's test results
 */
export const getMyTestResults = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        return await ctx.db.query("communityTestResults")
            .withIndex("by_participant", q => q.eq("participantId", args.userId))
            .order("desc")
            .take(20);
    }
});

// ==================== MUTATIONS ====================

/**
 * Create a new community test
 */
export const createTest = mutation({
    args: {
        creatorId: v.id("users"),
        creatorName: v.string(),
        name: v.string(),
        description: v.string(),
        category: v.optional(v.string()),
        visibility: v.string(),
        timePerQuestion: v.number(),
        shuffleQuestions: v.optional(v.boolean()),
        showAnswers: v.optional(v.boolean()),
        startsAt: v.optional(v.number()),
        endsAt: v.optional(v.number()),
        questions: v.array(v.object({
            question: v.string(),
            options: v.array(v.object({
                id: v.string(),
                text: v.string()
            })),
            correctAnswer: v.string(),
            explanation: v.optional(v.string())
        }))
    },
    handler: async (ctx, args) => {
        // Generate unique code
        let code = generateCode();
        let existing = await ctx.db.query("communityTests")
            .withIndex("by_code", q => q.eq("code", code))
            .first();
        while (existing) {
            code = generateCode();
            existing = await ctx.db.query("communityTests")
                .withIndex("by_code", q => q.eq("code", code))
                .first();
        }

        const testId = `test_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const now = Date.now();

        // Create the test
        await ctx.db.insert("communityTests", {
            testId,
            code,
            creatorId: args.creatorId,
            creatorName: args.creatorName,
            name: args.name,
            description: args.description,
            category: args.category || "general",
            visibility: args.visibility,
            timePerQuestion: args.timePerQuestion,
            shuffleQuestions: args.shuffleQuestions ?? false,
            showAnswers: args.showAnswers ?? true,
            startsAt: args.startsAt || 0,
            endsAt: args.endsAt || 0,
            questionsCount: args.questions.length,
            participantsCount: 0,
            avgScore: 0,
            status: "active",
            createdAt: now,
            updatedAt: now
        });

        // Insert questions
        for (let i = 0; i < args.questions.length; i++) {
            const q = args.questions[i];
            await ctx.db.insert("communityTestQuestions", {
                testId,
                questionIndex: i,
                question: q.question,
                options: q.options,
                correctAnswer: q.correctAnswer,
                explanation: q.explanation || "",
                points: 1
            });
        }

        return { testId, code };
    }
});

/**
 * Join a test
 */
export const joinTest = mutation({
    args: {
        code: v.string(),
        participantId: v.id("users"),
        participantName: v.string()
    },
    handler: async (ctx, args) => {
        const test = await ctx.db.query("communityTests")
            .withIndex("by_code", q => q.eq("code", args.code.toUpperCase()))
            .first();

        if (!test) {
            return { success: false, error: "Test not found" };
        }

        if (test.status !== "active") {
            return { success: false, error: "Test is not active" };
        }

        // Check if already joined
        const existing = await ctx.db.query("communityTestResults")
            .withIndex("by_test_participant", q =>
                q.eq("testId", test.testId).eq("participantId", args.participantId))
            .first();

        if (existing) {
            return {
                success: true,
                testId: test.testId,
                alreadyJoined: true,
                resultId: existing._id
            };
        }

        // Create result entry
        const resultId = await ctx.db.insert("communityTestResults", {
            testId: test.testId,
            testCode: test.code,
            participantId: args.participantId,
            participantName: args.participantName,
            score: 0,
            totalQuestions: test.questionsCount,
            correctAnswers: 0,
            timeTaken: 0,
            status: "in_progress",
            startedAt: Date.now()
        });

        // Update participant count
        await ctx.db.patch(test._id, {
            participantsCount: (test.participantsCount || 0) + 1
        });

        return {
            success: true,
            testId: test.testId,
            resultId,
            test: {
                name: test.name,
                questionsCount: test.questionsCount,
                timePerQuestion: test.timePerQuestion
            }
        };
    }
});

/**
 * Submit test answer
 */
export const submitTestAnswer = mutation({
    args: {
        resultId: v.id("communityTestResults"),
        questionIndex: v.number(),
        isCorrect: v.boolean(),
        timeTaken: v.number()
    },
    handler: async (ctx, args) => {
        const result = await ctx.db.get(args.resultId);
        if (!result) throw new Error("Result not found");

        await ctx.db.patch(args.resultId, {
            correctAnswers: result.correctAnswers + (args.isCorrect ? 1 : 0),
            timeTaken: result.timeTaken + args.timeTaken
        });

        return { success: true };
    }
});

/**
 * Complete test
 */
export const completeTest = mutation({
    args: {
        resultId: v.id("communityTestResults")
    },
    handler: async (ctx, args) => {
        const result = await ctx.db.get(args.resultId);
        if (!result) throw new Error("Result not found");

        const score = result.totalQuestions > 0
            ? Math.round((result.correctAnswers / result.totalQuestions) * 100)
            : 0;

        await ctx.db.patch(args.resultId, {
            score,
            status: "completed",
            completedAt: Date.now()
        });

        // Update test average score
        const test = await ctx.db.query("communityTests")
            .filter(q => q.eq(q.field("testId"), result.testId))
            .first();

        if (test) {
            const allResults = await ctx.db.query("communityTestResults")
                .withIndex("by_test", q => q.eq("testId", result.testId))
                .filter(q => q.eq(q.field("status"), "completed"))
                .collect();

            const totalScore = allResults.reduce((sum, r) => sum + r.score, 0);
            const avgScore = allResults.length > 0 ? Math.round(totalScore / allResults.length) : 0;

            await ctx.db.patch(test._id, { avgScore });
        }

        return {
            success: true,
            score,
            correctAnswers: result.correctAnswers,
            totalQuestions: result.totalQuestions,
            timeTaken: result.timeTaken
        };
    }
});

/**
 * Delete a test (creator only)
 */
export const deleteTest = mutation({
    args: {
        testId: v.string(),
        userId: v.id("users")
    },
    handler: async (ctx, args) => {
        const test = await ctx.db.query("communityTests")
            .filter(q => q.eq(q.field("testId"), args.testId))
            .first();

        if (!test) return { success: false, error: "Test not found" };
        if (test.creatorId !== args.userId) {
            return { success: false, error: "Not authorized" };
        }

        // Delete questions
        const questions = await ctx.db.query("communityTestQuestions")
            .withIndex("by_test", q => q.eq("testId", args.testId))
            .collect();

        for (const q of questions) {
            await ctx.db.delete(q._id);
        }

        // Delete test
        await ctx.db.delete(test._id);

        return { success: true };
    }
});
