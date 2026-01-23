import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Save a test result with enhanced analytics
export const saveTestResult = mutation({
  args: {
    userId: v.id("users"),
    subject: v.string(),
    totalQuestions: v.number(),
    attempted: v.number(),
    correct: v.number(),
    incorrect: v.number(),
    unanswered: v.number(),
    totalScore: v.number(),
    maxScore: v.number(),
    percentage: v.number(),
    timeTaken: v.number(), // in seconds
    questionAnalysis: v.array(
      v.object({
        questionId: v.number(),
        question: v.string(),
        userAnswer: v.union(v.string(), v.null()),
        correctAnswer: v.string(),
        isCorrect: v.boolean(),
        marks: v.number(),
        timeTaken: v.optional(v.number()),
        topic: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Calculate average time per question
    const averageTimePerQuestion = args.attempted > 0 
      ? Math.round(args.timeTaken / args.attempted) 
      : 0;

    // Compute topic-wise analysis from question data
    const topicMap = new Map<string, { attempted: number; correct: number }>();
    
    args.questionAnalysis.forEach(q => {
      if (q.topic) {
        const existing = topicMap.get(q.topic) || { attempted: 0, correct: 0 };
        topicMap.set(q.topic, {
          attempted: existing.attempted + 1,
          correct: existing.correct + (q.isCorrect ? 1 : 0),
        });
      }
    });

    const topicAnalysis = Array.from(topicMap.entries()).map(([topicName, stats]) => ({
      topicName,
      questionsAttempted: stats.attempted,
      correct: stats.correct,
      accuracy: stats.attempted > 0 
        ? Math.round((stats.correct / stats.attempted) * 100) 
        : 0,
    }));

    // Save the test result
    const resultId = await ctx.db.insert("testResults", {
      userId: args.userId,
      subject: args.subject,
      totalQuestions: args.totalQuestions,
      attempted: args.attempted,
      correct: args.correct,
      incorrect: args.incorrect,
      unanswered: args.unanswered,
      totalScore: args.totalScore,
      maxScore: args.maxScore,
      percentage: args.percentage,
      timeTaken: args.timeTaken,
      averageTimePerQuestion,
      topicAnalysis,
      questionAnalysis: args.questionAnalysis,
      createdAt: Date.now(),
    });

    // Update user stats (denormalization for performance)
    const user = await ctx.db.get(args.userId);
    if (user) {
      await ctx.db.patch(args.userId, {
        totalTests: user.totalTests + 1,
        totalQuestions: user.totalQuestions + args.totalQuestions,
        correctAnswers: user.correctAnswers + args.correct,
        totalTimeTaken: (user.totalTimeTaken || 0) + args.timeTaken,
        updatedAt: Date.now(),
      });
    }

    return resultId;
  },
});

// Get user's test history
export const getTestHistory = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("testResults")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(50);
  },
});

// Get recent test result
export const getRecentResult = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("testResults")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .first();
  },
});

// Get leaderboard (top performers)
export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const users = await ctx.db.query("users").collect();
    
    const sortedUsers = users
      .filter((u) => u.totalTests > 0)
      .map((user) => ({
        id: user._id,
        name: user.name || "Anonymous",
        avatarUrl: user.avatarUrl,
        totalTests: user.totalTests,
        totalQuestions: user.totalQuestions,
        correctAnswers: user.correctAnswers,
        accuracy: user.totalQuestions > 0
          ? Math.round((user.correctAnswers / user.totalQuestions) * 100)
          : 0,
      }))
      .sort((a, b) => b.accuracy - a.accuracy || b.totalTests - a.totalTests)
      .slice(0, args.limit || 10);

    return sortedUsers;
  },
});

// Get platform stats
export const getPlatformStats = query({
  handler: async (ctx) => {
    const users = await ctx.db.query("users").collect();
    const tests = await ctx.db.query("testResults").collect();

    const totalUsers = users.length;
    const totalTests = tests.length;
    const totalQuestions = tests.reduce((sum, t) => sum + t.totalQuestions, 0);
    const avgScore = tests.length > 0
      ? Math.round(tests.reduce((sum, t) => sum + t.percentage, 0) / tests.length)
      : 0;

    return {
      totalUsers,
      totalTests,
      totalQuestions,
      avgScore,
    };
  },
});

// Get progress graph data for a user (last N tests)
export const getProgressGraph = query({
  args: { 
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const tests = await ctx.db
      .query("testResults")
      .withIndex("by_user_date", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit || 10);

    return tests.reverse().map(test => ({
      date: test.createdAt,
      percentage: test.percentage,
      subject: test.subject,
      correct: test.correct,
      totalQuestions: test.totalQuestions,
    }));
  },
});

// Get topic-wise breakdown for a user (across all tests)
export const getTopicAnalysis = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tests = await ctx.db
      .query("testResults")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    // Aggregate topic data across all tests
    const topicMap = new Map<string, { attempted: number; correct: number }>();
    
    tests.forEach(test => {
      if (test.topicAnalysis) {
        test.topicAnalysis.forEach(topic => {
          const existing = topicMap.get(topic.topicName) || { attempted: 0, correct: 0 };
          topicMap.set(topic.topicName, {
            attempted: existing.attempted + topic.questionsAttempted,
            correct: existing.correct + topic.correct,
          });
        });
      }
    });

    return Array.from(topicMap.entries())
      .map(([topicName, stats]) => ({
        topicName,
        questionsAttempted: stats.attempted,
        correct: stats.correct,
        accuracy: stats.attempted > 0 
          ? Math.round((stats.correct / stats.attempted) * 100) 
          : 0,
      }))
      .sort((a, b) => b.questionsAttempted - a.questionsAttempted);
  },
});

// Get weak topics (accuracy < 50%)
export const getWeakTopics = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const tests = await ctx.db
      .query("testResults")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const topicMap = new Map<string, { attempted: number; correct: number }>();
    
    tests.forEach(test => {
      if (test.topicAnalysis) {
        test.topicAnalysis.forEach(topic => {
          const existing = topicMap.get(topic.topicName) || { attempted: 0, correct: 0 };
          topicMap.set(topic.topicName, {
            attempted: existing.attempted + topic.questionsAttempted,
            correct: existing.correct + topic.correct,
          });
        });
      }
    });

    return Array.from(topicMap.entries())
      .map(([topicName, stats]) => ({
        topicName,
        questionsAttempted: stats.attempted,
        correct: stats.correct,
        accuracy: stats.attempted > 0 
          ? Math.round((stats.correct / stats.attempted) * 100) 
          : 0,
      }))
      .filter(topic => topic.accuracy < 50 && topic.questionsAttempted >= 3)
      .sort((a, b) => a.accuracy - b.accuracy);
  },
});

// Get test details by ID
export const getTestDetails = query({
  args: { testId: v.id("testResults") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.testId);
  },
});
