import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const startSession = mutation({
  args: { sessionId: v.id("teamSessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, { status: "active" });
  },
});

export const endSession = mutation({
  args: { sessionId: v.id("teamSessions") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.sessionId, { status: "completed" });
  },
});
