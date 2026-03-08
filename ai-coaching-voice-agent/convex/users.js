import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Get user by email (used for auth verification)
export const getUser = query({
    args: {
        email: v.string()
    },
    handler: async (ctx, args) => {
        return await ctx.db
            .query('users')
            .withIndex('by_email', q => q.eq('email', args.email))
            .first();
    }
});

// Get user by Convex _id
export const getUserById = query({
    args: {
        id: v.id('users')
    },
    handler: async (ctx, args) => {
        return await ctx.db.get(args.id);
    }
});

// Create or return existing user (upsert for auth flow)
export const CreateUser = mutation({
    args: {
        name: v.string(),
        email: v.string()
    },
    handler: async (ctx, args) => {
        // Use index for efficient lookup
        const existing = await ctx.db
            .query('users')
            .withIndex('by_email', q => q.eq('email', args.email))
            .first();

        if (existing) {
            return existing;
        }

        // Create new user with all fields initialized
        const userId = await ctx.db.insert('users', {
            name: args.name,
            email: args.email,
            credits: 50000,
            level: 1,
            xp: 0,
            streak: 0,
            longestStreak: 0,
            totalSessions: 0,
            totalMinutes: 0,
            unlockedAchievements: [],
            lastActiveDate: new Date().toISOString(),
        });

        return await ctx.db.get(userId);
    }
});

// Update user credits/tokens
export const UpdateUserToken = mutation({
    args: {
        id: v.id('users'),
        credits: v.number()
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, { credits: args.credits });
        return { success: true };
    }
});

// Update user profile (XP, level, streak, etc.)
export const updateProfile = mutation({
    args: {
        id: v.id('users'),
        xp: v.optional(v.number()),
        level: v.optional(v.number()),
        streak: v.optional(v.number()),
        longestStreak: v.optional(v.number()),
        totalSessions: v.optional(v.number()),
        totalMinutes: v.optional(v.number()),
        lastActiveDate: v.optional(v.string()),
        unlockedAchievements: v.optional(v.array(v.string())),
    },
    handler: async (ctx, args) => {
        const { id, ...updates } = args;
        // Remove undefined values
        const patch = Object.fromEntries(
            Object.entries(updates).filter(([, v]) => v !== undefined)
        );
        await ctx.db.patch(id, patch);
        return await ctx.db.get(id);
    }
});
