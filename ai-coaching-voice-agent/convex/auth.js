import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Simple password hashing (for production, use bcrypt or similar)
// Note: This is a basic implementation. For production, install bcryptjs package
function hashPassword(password) {
    // Using a simple hash for demonstration - in production use bcryptjs
    // For now, we'll use base64 encoding (NOT SECURE - use bcryptjs in production)
    return Buffer.from(password).toString('base64');
}

function verifyPassword(password, hash) {
    return hashPassword(password) === hash;
}

// Sign Up Mutation
export const signUp = mutation({
    args: {
        name: v.string(),
        email: v.string(),
        password: v.string()
    },
    handler: async (ctx, args) => {
        // Check if user already exists
        const existingUser = await ctx.db
            .query('users')
            .withIndex('by_email', q => q.eq('email', args.email))
            .first();

        if (existingUser) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const hashedPassword = hashPassword(args.password);

        // Create new user
        const userId = await ctx.db.insert('users', {
            name: args.name,
            email: args.email,
            password: hashedPassword,
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

        const user = await ctx.db.get(userId);
        
        // Return user data without password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
});

// Sign In Mutation
export const signIn = mutation({
    args: {
        email: v.string(),
        password: v.string()
    },
    handler: async (ctx, args) => {
        // Find user by email
        const user = await ctx.db
            .query('users')
            .withIndex('by_email', q => q.eq('email', args.email))
            .first();

        if (!user) {
            throw new Error('Invalid email or password');
        }

        // Check if user has a password (migrated from Stack Auth users might not have one)
        if (!user.password) {
            throw new Error('This account needs to be set up with a password. Please use password reset or contact support.');
        }

        // Verify password
        const isValidPassword = verifyPassword(args.password, user.password);
        
        if (!isValidPassword) {
            throw new Error('Invalid email or password');
        }

        // Return user data without password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
});

// Get current user (used after authentication)
export const getCurrentUser = query({
    args: {
        userId: v.id('users')
    },
    handler: async (ctx, args) => {
        const user = await ctx.db.get(args.userId);
        
        if (!user) {
            return null;
        }

        // Return user without password
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
});

// Update user profile
export const updateUserProfile = mutation({
    args: {
        userId: v.id('users'),
        name: v.optional(v.string()),
        image: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const { userId, ...updates } = args;
        
        await ctx.db.patch(userId, updates);
        
        const user = await ctx.db.get(userId);
        const { password, ...userWithoutPassword } = user;
        return userWithoutPassword;
    }
});
