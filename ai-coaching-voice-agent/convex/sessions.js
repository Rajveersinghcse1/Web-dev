import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Sessions Table - Stores learning session data
 * 
 * Tracks all sessions from the new learning modules:
 * - Mock Interview
 * - Lecture on Topic
 * - Q&A Prep
 * - Language Skill
 * - Meditation
 */

// Create a new session record
export const create = mutation({
  args: {
    userId: v.id("users"),
    sessionId: v.string(),
    type: v.string(),
    config: v.any(),
    startTime: v.number(),
  },
  handler: async (ctx, args) => {
    const sessionRecord = {
      userId: args.userId,
      sessionId: args.sessionId,
      type: args.type,
      config: args.config,
      startTime: args.startTime,
      endTime: null,
      status: 'active',
      memory: {},
      createdAt: Date.now(),
    };

    const id = await ctx.db.insert("sessions", sessionRecord);
    return id;
  },
});

// Save session data on completion
export const save = mutation({
  args: {
    userId: v.id("users"),
    sessionId: v.string(),
    type: v.string(),
    memory: v.any(),
    startTime: v.number(),
    endTime: v.number(),
    completionStatus: v.string(),
    metadata: v.optional(v.any()),
  },
  handler: async (ctx, args) => {
    // Check if session already exists
    const existingSession = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (existingSession) {
      // Update existing session
      await ctx.db.patch(existingSession._id, {
        endTime: args.endTime,
        status: args.completionStatus,
        memory: args.memory,
        metadata: args.metadata,
        updatedAt: Date.now(),
      });
      return existingSession._id;
    } else {
      // Create new session record
      const sessionRecord = {
        userId: args.userId,
        sessionId: args.sessionId,
        type: args.type,
        startTime: args.startTime,
        endTime: args.endTime,
        status: args.completionStatus,
        memory: args.memory,
        metadata: args.metadata,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      const id = await ctx.db.insert("sessions", sessionRecord);
      return id;
    }
  },
});

// Get user's session history
export const getHistory = query({
  args: {
    userId: v.id("users"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 20;
    
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(limit);

    return sessions;
  },
});

// Get specific session by ID
export const getById = query({
  args: {
    sessionId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    return session;
  },
});

// Get sessions by type
export const getByType = query({
  args: {
    userId: v.id("users"),
    type: v.string(),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const sessions = await ctx.db
      .query("sessions")
      .withIndex("by_user_type", (q) => 
        q.eq("userId", args.userId).eq("type", args.type)
      )
      .order("desc")
      .take(limit);

    return sessions;
  },
});

// Get session statistics
export const getStats = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const allSessions = await ctx.db
      .query("sessions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .collect();

    const stats = {
      total: allSessions.length,
      byType: {},
      completed: 0,
      totalTime: 0,
    };

    allSessions.forEach(session => {
      // Count by type
      if (!stats.byType[session.type]) {
        stats.byType[session.type] = 0;
      }
      stats.byType[session.type]++;

      // Count completed
      if (session.status === 'completed') {
        stats.completed++;
      }

      // Calculate total time
      if (session.endTime && session.startTime) {
        stats.totalTime += (session.endTime - session.startTime);
      }
    });

    return stats;
  },
});

// Delete session
export const deleteSession = mutation({
  args: {
    sessionId: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_session_id", (q) => q.eq("sessionId", args.sessionId))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.userId !== args.userId) {
      throw new Error("Unauthorized: Not your session");
    }

    await ctx.db.delete(session._id);
    return { success: true };
  },
});
