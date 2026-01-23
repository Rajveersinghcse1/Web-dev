import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Create or update user profile
export const upsertUser = mutation({
  args: {
    stackAuthId: v.string(),
    email: v.string(),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_stack_auth_id", (q) => q.eq("stackAuthId", args.stackAuthId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, {
        email: args.email,
        name: args.name,
        avatarUrl: args.avatarUrl,
        updatedAt: Date.now(),
      });
      return existing._id;
    }

    return await ctx.db.insert("users", {
      stackAuthId: args.stackAuthId,
      email: args.email,
      name: args.name,
      avatarUrl: args.avatarUrl,
      role: "student", // Default role for new users
      totalTests: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      totalTimeTaken: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

// Get user by Stack Auth ID
export const getUserByStackAuthId = query({
  args: { stackAuthId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_stack_auth_id", (q) => q.eq("stackAuthId", args.stackAuthId))
      .first();
  },
});

// Get user statistics
export const getUserStats = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    const tests = await ctx.db
      .query("testResults")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const avgScore = tests.length > 0
      ? tests.reduce((sum, t) => sum + t.percentage, 0) / tests.length
      : 0;

    return {
      totalTests: user.totalTests,
      totalQuestions: user.totalQuestions,
      correctAnswers: user.correctAnswers,
      averageScore: Math.round(avgScore),
      accuracy: user.totalQuestions > 0
        ? Math.round((user.correctAnswers / user.totalQuestions) * 100)
        : 0,
    };
  },
});

// Get full user profile
export const getUserProfile = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;

    return {
      id: user._id,
      email: user.email,
      name: user.name,
      nickname: user.nickname,
      fullName: user.fullName,
      phone: user.phone,
      location: user.location,
      bio: user.bio,
      avatarUrl: user.avatarUrl,
      role: user.role, // Include role for admin checks
      totalTests: user.totalTests,
      totalQuestions: user.totalQuestions,
      correctAnswers: user.correctAnswers,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };
  },
});
