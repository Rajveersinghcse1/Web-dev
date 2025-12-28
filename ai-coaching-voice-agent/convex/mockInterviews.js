import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper: Get authenticated user ID
const getAuthUserId = async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
        throw new Error("Unauthorized: Not authenticated");
    }
    return identity.subject;
};

// Helper: Verify session ownership
const verifySessionOwnership = async (ctx, sessionId, userId) => {
    const session = await ctx.db
        .query("mockInterviews")
        .withIndex("by_session", (q) => q.eq("sessionId", sessionId))
        .first();
    
    if (!session) {
        throw new Error("Session not found");
    }
    
    if (session.userId !== userId) {
        throw new Error("Forbidden: Not your session");
    }
    
    return session;
};

// Create a new mock interview session
export const createSession = mutation({
    args: {
        userId: v.id("users"),
        idempotencyKey: v.string(), // Client-generated UUID
        title: v.string(),
        topic: v.string(),
        interviewerImage: v.string(),
        interviewerName: v.string(),
        questions: v.array(v.object({
            questionId: v.string(),
            questionText: v.string(),
            difficulty: v.string(),
            source: v.optional(v.string()),
        })),
    },
    handler: async (ctx, args) => {
        // Verify authentication
        const authUserId = await getAuthUserId(ctx);
        
        // Check idempotency - prevent duplicate sessions
        const existing = await ctx.db
            .query("mockInterviews")
            .withIndex("by_idempotency", (q) => q.eq("idempotencyKey", args.idempotencyKey))
            .first();
        
        if (existing) {
            console.log("Duplicate session creation prevented:", args.idempotencyKey);
            return { interviewId: existing._id, sessionId: existing.sessionId };
        }
        
        // Check for existing active session
        const activeSession = await ctx.db
            .query("mockInterviews")
            .withIndex("by_user_status", (q) => 
                q.eq("userId", args.userId).eq("status", "in-progress")
            )
            .first();
        
        if (activeSession) {
            throw new Error("You have an active interview. Please complete or terminate it first.");
        }
        
        // Generate unique session ID using crypto
        const sessionId = `interview_${Date.now()}_${crypto.randomUUID().substring(0, 8)}`;
        
        const interviewId = await ctx.db.insert("mockInterviews", {
            userId: args.userId,
            sessionId,
            idempotencyKey: args.idempotencyKey,
            title: args.title,
            topic: args.topic,
            interviewerImage: args.interviewerImage,
            interviewerName: args.interviewerName,
            questions: args.questions,
            responses: [],
            status: "in-progress",
            currentQuestionIndex: 0,
            noResponseCount: 0,
            startedAt: Date.now(),
        });

        return { interviewId, sessionId };
    },
});

// Update response for a question (with atomic operations)
export const updateResponse = mutation({
    args: {
        sessionId: v.string(),
        questionId: v.string(),
        audioUrl: v.optional(v.string()),
        transcription: v.optional(v.string()),
        responseTime: v.optional(v.number()),
        answered: v.boolean(),
        grammarScore: v.optional(v.number()),
        fluencyScore: v.optional(v.number()),
        fillerWords: v.optional(v.number()),
        hesitationCount: v.optional(v.number()),
        clarityScore: v.optional(v.number()),
        relevanceScore: v.optional(v.number()),
        confidenceScore: v.optional(v.number()),
    },
    handler: async (ctx, args) => {
        // Verify authentication
        const authUserId = await getAuthUserId(ctx);
        
        // Verify ownership
        const interview = await verifySessionOwnership(ctx, args.sessionId, authUserId);

        // Check if response already exists (idempotency)
        const existingResponse = interview.responses.find(r => r.questionId === args.questionId);
        if (existingResponse && existingResponse.answered) {
            console.log("Response already exists for question:", args.questionId);
            return { success: true, noResponseCount: interview.noResponseCount || 0 };
        }

        // Server-side timeout validation
        const TIMEOUT_THRESHOLD = 30000; // 30 seconds
        if (interview.currentQuestionStartTime) {
            const elapsed = Date.now() - interview.currentQuestionStartTime;
            if (elapsed > TIMEOUT_THRESHOLD && args.answered) {
                throw new Error("Response submitted after timeout");
            }
        }

        const responses = [...interview.responses];
        const existingIndex = responses.findIndex(r => r.questionId === args.questionId);

        const responseData = {
            questionId: args.questionId,
            audioUrl: args.audioUrl,
            transcription: args.transcription,
            responseTime: args.responseTime,
            answered: args.answered,
            grammarScore: args.grammarScore,
            fluencyScore: args.fluencyScore,
            fillerWords: args.fillerWords,
            hesitationCount: args.hesitationCount,
            clarityScore: args.clarityScore,
            relevanceScore: args.relevanceScore,
            confidenceScore: args.confidenceScore,
        };

        if (existingIndex >= 0) {
            responses[existingIndex] = responseData;
        } else {
            responses.push(responseData);
        }

        // Update no-response count
        let noResponseCount = interview.noResponseCount || 0;
        if (!args.answered) {
            noResponseCount++;
        } else {
            noResponseCount = 0; // Reset on answered question
        }

        // Atomic update: responses + noResponseCount + advance question index
        const nextIndex = interview.currentQuestionIndex + 1;
        
        await ctx.db.patch(interview._id, {
            responses,
            noResponseCount,
            currentQuestionIndex: nextIndex,
            currentQuestionStartTime: undefined, // Clear timer
        });

        return { success: true, noResponseCount, nextIndex };
    },
});

// Update current question index and start timer
export const updateQuestionIndex = mutation({
    args: {
        sessionId: v.string(),
        index: v.number(),
    },
    handler: async (ctx, args) => {
        // Verify authentication
        const authUserId = await getAuthUserId(ctx);
        
        // Verify ownership
        const interview = await verifySessionOwnership(ctx, args.sessionId, authUserId);

        await ctx.db.patch(interview._id, {
            currentQuestionIndex: args.index,
            currentQuestionStartTime: Date.now(), // Start server-side timer
        });

        return { success: true };
    },
});

// Complete interview session with evaluation
export const completeSession = mutation({
    args: {
        sessionId: v.string(),
        status: v.string(), // 'completed' or 'terminated'
        evaluation: v.object({
            overallScore: v.number(),
            grammarAccuracy: v.number(),
            fluencyScore: v.number(),
            hesitationFrequency: v.number(),
            avgResponseTime: v.number(),
            topicRelevance: v.number(),
            interviewReadiness: v.string(),
            strengths: v.array(v.string()),
            weaknesses: v.array(v.string()),
            suggestions: v.array(v.string()),
            questionsAnswered: v.number(),
            questionsMissed: v.number(),
        }),
    },
    handler: async (ctx, args) => {
        // Verify authentication
        const authUserId = await getAuthUserId(ctx);
        
        // Verify ownership
        const interview = await verifySessionOwnership(ctx, args.sessionId, authUserId);

        const duration = Math.floor((Date.now() - interview.startedAt) / 1000);

        await ctx.db.patch(interview._id, {
            status: args.status,
            evaluation: args.evaluation,
            completedAt: Date.now(),
            duration,
        });

        return { success: true };
    },
});

// Get interview session by ID
export const getSession = query({
    args: { sessionId: v.string() },
    handler: async (ctx, args) => {
        const interview = await ctx.db
            .query("mockInterviews")
            .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
            .first();

        return interview;
    },
});

// Get all interviews for a user
export const getUserInterviews = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        // Verify authentication
        const authUserId = await getAuthUserId(ctx);
        
        // Only allow users to fetch their own interviews
        if (args.userId !== authUserId) {
            throw new Error("Forbidden: Cannot access other user's interviews");
        }
        
        const interviews = await ctx.db
            .query("mockInterviews")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .collect();

        return interviews.sort((a, b) => b.startedAt - a.startedAt);
    },
});

// Get active session for user (for crash recovery)
export const getActiveSession = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        // Verify authentication
        const authUserId = await getAuthUserId(ctx);
        
        // Only allow users to fetch their own sessions
        if (args.userId !== authUserId) {
            throw new Error("Forbidden: Cannot access other user's sessions");
        }
        
        const activeSession = await ctx.db
            .query("mockInterviews")
            .withIndex("by_user_status", (q) => 
                q.eq("userId", args.userId).eq("status", "in-progress")
            )
            .first();

        return activeSession;
    },
});

// Get latest interview for a user
export const getLatestInterview = query({
    args: { userId: v.id("users") },
    handler: async (ctx, args) => {
        const interviews = await ctx.db
            .query("mockInterviews")
            .withIndex("by_user", (q) => q.eq("userId", args.userId))
            .order("desc")
            .take(1);

        return interviews[0] || null;
    },
});
