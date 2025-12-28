import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Send a message (chat or transcript)
export const send = mutation({
  args: {
    sessionId: v.id("teamSessions"),
    userId: v.string(),
    userName: v.string(),
    content: v.string(),
    type: v.string(), // 'chat' or 'transcript'
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("messages", {
      sessionId: args.sessionId,
      userId: args.userId,
      userName: args.userName,
      content: args.content,
      type: args.type,
      timestamp: Date.now(),
    });
  },
});

// Get messages for a session
export const list = query({
  args: { sessionId: v.id("teamSessions") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("messages")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("asc")
      .collect();
  },
});

// Send a WebRTC signal
export const sendSignal = mutation({
  args: {
    sessionId: v.id("teamSessions"),
    senderId: v.string(),
    receiverId: v.string(),
    type: v.string(),
    payload: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("signals", {
      sessionId: args.sessionId,
      senderId: args.senderId,
      receiverId: args.receiverId,
      type: args.type,
      payload: args.payload,
      timestamp: Date.now(),
    });
  },
});

// Get signals for a specific user in a session
export const getSignals = query({
  args: { 
    sessionId: v.id("teamSessions"),
    userId: v.string() 
  },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("signals")
      .withIndex("by_session_receiver", (q) => 
        q.eq("sessionId", args.sessionId).eq("receiverId", args.userId)
      )
      .collect();
  },
});

// Delete a specific signal
export const deleteSignal = mutation({
  args: { signalId: v.id("signals") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.signalId);
  },
});

// Clean up signals (optional, to keep DB clean)
export const clearSignals = mutation({
  args: { 
    sessionId: v.id("teamSessions"),
    userId: v.string() 
  },
  handler: async (ctx, args) => {
    const signals = await ctx.db
      .query("signals")
      .withIndex("by_session_receiver", (q) => 
        q.eq("sessionId", args.sessionId).eq("receiverId", args.userId)
      )
      .collect();
    
    for (const signal of signals) {
      await ctx.db.delete(signal._id);
    }
  },
});

// Get recent messages across all sessions (for analytics)
export const getRecent = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 5;
    return await ctx.db
      .query("messages")
      .withIndex("by_timestamp")
      .order("desc")
      .take(limit);
  },
});
