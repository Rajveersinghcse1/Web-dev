import { query, mutation, internalMutation } from "./_generated/server";
import { v } from "convex/values";

/**
 * List all achievements, ordered by display order
 */
export const list = query({
    args: {},
    handler: async (ctx) => {
        return await ctx.db.query("achievements")
            .collect();
    },
});

/**
 * List achievements grouped by category
 */
export const listByCategory = query({
    args: { category: v.string() },
    handler: async (ctx, args) => {
        return await ctx.db.query("achievements")
            .withIndex("by_category", (q) => q.eq("category", args.category))
            .collect();
    },
});

/**
 * Unlock an achievement for a user
 */
export const unlock = mutation({
    args: {
        achievementId: v.string(),
        userId: v.id("users")
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        if (!user) throw new Error("User not found");

        const achievement = await ctx.db.query("achievements")
            .withIndex("by_id", (q) => q.eq("id", args.achievementId))
            .first();

        if (!achievement) throw new Error("Achievement not found");

        const unlocked = user.unlockedAchievements || [];
        if (unlocked.includes(args.achievementId)) {
            return { success: false, message: "Already unlocked" };
        }

        // Check prerequisites if any
        if (achievement.prerequisites && achievement.prerequisites.length > 0) {
            const missingPrereqs = achievement.prerequisites.filter(
                pre => !unlocked.includes(pre)
            );
            if (missingPrereqs.length > 0) {
                throw new Error(`Prerequisites not met: ${missingPrereqs.join(", ")}`);
            }
        }

        // Unlock
        await ctx.db.patch(args.userId, {
            unlockedAchievements: [...unlocked, args.achievementId],
            xp: (user.xp || 0) + achievement.xpReward
        });

        return { success: true, achievement };
    },
});

/**
 * Seed achievements from the provided list (called once or on update)
 */
export const seed = mutation({
    args: {
        achievements: v.array(v.object({
            id: v.string(),
            name: v.string(),
            description: v.string(),
            icon: v.string(),
            category: v.string(),
            rarity: v.string(),
            xpReward: v.number(),
            // Optional new fields
            level: v.optional(v.number()),
            order: v.optional(v.number()),
            prerequisites: v.optional(v.array(v.string())),
            totalSteps: v.optional(v.number()),
            condition: v.optional(v.string())
        }))
    },
    handler: async (ctx, args) => {
        let count = 0;
        for (const ach of args.achievements) {
            const existing = await ctx.db.query("achievements")
                .withIndex("by_id", (q) => q.eq("id", ach.id))
                .first();

            if (existing) {
                // Update existing to ensure schema is fresh
                await ctx.db.patch(existing._id, ach);
            } else {
                await ctx.db.insert("achievements", ach);
                count++;
            }
        }
        return `Seeded/Updated ${args.achievements.length} achievements. Created ${count} new.`;
    },
});

import { ACHIEVEMENT_DATA } from "./seed_achievements_data";

export const seedDefaults = mutation({
    args: {},
    handler: async (ctx) => {
        let count = 0;
        for (const ach of ACHIEVEMENT_DATA) {
            const existing = await ctx.db.query("achievements")
                .withIndex("by_id", (q) => q.eq("id", ach.id))
                .first();

            if (existing) {
                await ctx.db.patch(existing._id, ach);
            } else {
                await ctx.db.insert("achievements", ach);
                count++;
            }
        }
        return `Seeded default achievements. Created ${count} new, updated rest.`;
    }
});
