import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    topic: v.string(),
    maxParticipants: v.number(), // Added maxParticipants
    hostName: v.string(),
    hostId: v.string(),
    hostAvatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    const sessionId = await ctx.db.insert("teamSessions", {
      hostId: args.hostId,
      code: code,
      status: "waiting",
      topic: args.topic,
      maxParticipants: args.maxParticipants, // Store it
      participants: [{
        userId: args.hostId,
        name: args.hostName,
        avatar: args.hostAvatar,
        score: 0,
        joinedAt: Date.now(),
        status: 'active',
      }],
      createdAt: Date.now(),
    });

    return { sessionId, code };
  },
});

export const join = mutation({
  args: {
    code: v.string(),
    userId: v.string(),
    name: v.string(),
    avatar: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db
      .query("teamSessions")
      .withIndex("by_code", (q) => q.eq("code", args.code))
      .first();

    if (!session) {
      throw new Error("Session not found");
    }

    if (session.status === "completed") {
      throw new Error("Session is completed");
    }

    const existingParticipantIndex = session.participants.findIndex(p => p.userId === args.userId);
    
    if (existingParticipantIndex !== -1) {
      // User exists, update status to active if needed
      const updatedParticipants = [...session.participants];
      updatedParticipants[existingParticipantIndex] = {
        ...updatedParticipants[existingParticipantIndex],
        status: 'active',
        joinedAt: Date.now() // Update join time? Or keep original? Let's update to show recent activity
      };
      
      await ctx.db.patch(session._id, { participants: updatedParticipants });
      return { sessionId: session._id };
    }

    await ctx.db.patch(session._id, {
      participants: [
        ...session.participants,
        {
          userId: args.userId,
          name: args.name,
          avatar: args.avatar,
          score: 0,
          joinedAt: Date.now(),
          status: 'active',
        },
      ],
    });

    return { sessionId: session._id };
  },
});

export const get = query({
  args: { sessionId: v.optional(v.id("teamSessions")) },
  handler: async (ctx, args) => {
    if (!args.sessionId) return null;
    return await ctx.db.get(args.sessionId);
  },
});

export const leave = mutation({
  args: {
    sessionId: v.id("teamSessions"),
    userId: v.string(),
  },
  handler: async (ctx, args) => {
    const session = await ctx.db.get(args.sessionId);
    if (!session) return;

    // Instead of removing, mark as 'left'
    const updatedParticipants = session.participants.map(p => 
      p.userId === args.userId ? { ...p, status: 'left' } : p
    );
    
    await ctx.db.patch(args.sessionId, {
      participants: updatedParticipants,
    });
  },
});

export const getHistory = query({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const sessions = await ctx.db
      .query("teamSessions")
      .order("desc")
      .collect();

    // Filter sessions where the user was a participant
    return sessions.filter(session => 
      session.participants.some(p => p.userId === args.userId)
    ).slice(0, 10); // Return last 10 sessions
  },
});
