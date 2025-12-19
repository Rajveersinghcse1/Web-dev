import { v } from "convex/values";
import { mutation } from "./_generated/server";

export const CreateUser = mutation({
    args: {
        name: v.string(),
        email: v.string()
    },
    handler: async (ctx, args) => {
        // Check if user already exists
        const userData = await ctx.db.query('users')
            .filter(q => q.eq(q.field('email'), args.email))
            .collect();
        
        // If not, add new user
        if (userData?.length === 0) {
            const data = {
                name: args.name,
                email: args.email,
                credits: 50000,
                // Initialize gamification fields
                level: 1,
                xp: 0,
                streak: 0,
                longestStreak: 0,
                totalSessions: 0,
                totalMinutes: 0,
                unlockedAchievements: [],
                lastActiveDate: new Date().toISOString(),
            };
            await ctx.db.insert('users', data);
            return data;
        }
        return userData[0];
    }
});

export const UpdateUserToken = mutation({
    args: {
        id: v.id('users'),
        credits: v.number()
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            credits: args.credits
        });
        return { success: true };
    }
});