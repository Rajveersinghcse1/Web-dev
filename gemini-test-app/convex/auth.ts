import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Validation helper functions
function validateEmail(email: string): { valid: boolean; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email.trim().length === 0) {
    return { valid: false, error: "Email is required" };
  }
  if (!emailRegex.test(email)) {
    return { valid: false, error: "Invalid email format" };
  }
  if (email.length > 255) {
    return { valid: false, error: "Email is too long (max 255 characters)" };
  }
  return { valid: true };
}

function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password || password.length === 0) {
    return { valid: false, error: "Password is required" };
  }
  if (password.length < 8) {
    return { valid: false, error: "Password must be at least 8 characters long" };
  }
  if (password.length > 128) {
    return { valid: false, error: "Password is too long (max 128 characters)" };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one uppercase letter" };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, error: "Password must contain at least one lowercase letter" };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, error: "Password must contain at least one number" };
  }
  return { valid: true };
}

function validateName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: "Name is required" };
  }
  if (name.length < 2) {
    return { valid: false, error: "Name must be at least 2 characters long" };
  }
  if (name.length > 100) {
    return { valid: false, error: "Name is too long (max 100 characters)" };
  }
  return { valid: true };
}

// Simple hash function for password (in production, use bcrypt on a server)
function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString(36) + str.length.toString(36);
}

// Sign up a new user
export const signUp = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate email
    const emailValidation = validateEmail(args.email);
    if (!emailValidation.valid) {
      throw new Error(emailValidation.error);
    }

    // Validate password
    const passwordValidation = validatePassword(args.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.error);
    }

    // Validate name
    const nameValidation = validateName(args.name);
    if (!nameValidation.valid) {
      throw new Error(nameValidation.error);
    }

    // Check if user already exists (prevent duplicates)
    const existing = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existing) {
      throw new Error("User with this email already exists");
    }

    // Create new user
    const userId = await ctx.db.insert("users", {
      email: args.email.toLowerCase(),
      passwordHash: simpleHash(args.password),
      name: args.name,
      role: "student", // Default role for new users
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(args.name)}`,
      totalTests: 0,
      totalQuestions: 0,
      correctAnswers: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { userId, success: true };
  },
});

// Sign in an existing user
export const signIn = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate email format
    const emailValidation = validateEmail(args.email);
    if (!emailValidation.valid) {
      throw new Error(emailValidation.error);
    }

    // Validate password is not empty
    if (!args.password || args.password.length === 0) {
      throw new Error("Password is required");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("Invalid email or password");
    }

    if (user.passwordHash !== simpleHash(args.password)) {
      throw new Error("Invalid email or password");
    }

    // Update last login
    await ctx.db.patch(user._id, {
      updatedAt: Date.now(),
    });

    return {
      userId: user._id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      success: true,
    };
  },
});

// Get user by ID
export const getUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return null;
    
    // Don't return password hash
    return {
      id: user._id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      totalTests: user.totalTests,
      totalQuestions: user.totalQuestions,
      correctAnswers: user.correctAnswers,
      createdAt: user.createdAt,
    };
  },
});

// Update user profile
export const updateProfile = mutation({
  args: {
    userId: v.id("users"),
    name: v.optional(v.string()),
    nickname: v.optional(v.string()),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Validate fields if provided
    if (args.name && args.name.trim().length > 0) {
      const nameValidation = validateName(args.name);
      if (!nameValidation.valid) {
        throw new Error(nameValidation.error);
      }
    }

    if (args.fullName && args.fullName.trim().length > 0) {
      const nameValidation = validateName(args.fullName);
      if (!nameValidation.valid) {
        throw new Error(`Full name: ${nameValidation.error}`);
      }
    }

    if (args.nickname && (args.nickname.length < 2 || args.nickname.length > 50)) {
      throw new Error("Nickname must be between 2 and 50 characters");
    }

    if (args.phone && args.phone.length > 20) {
      throw new Error("Phone number is too long (max 20 characters)");
    }

    if (args.location && args.location.length > 100) {
      throw new Error("Location is too long (max 100 characters)");
    }

    if (args.bio && args.bio.length > 500) {
      throw new Error("Bio is too long (max 500 characters)");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };
    if (args.name !== undefined) updates.name = args.name;
    if (args.nickname !== undefined) updates.nickname = args.nickname;
    if (args.fullName !== undefined) updates.fullName = args.fullName;
    if (args.phone !== undefined) updates.phone = args.phone;
    if (args.location !== undefined) updates.location = args.location;
    if (args.bio !== undefined) updates.bio = args.bio;
    if (args.avatarUrl !== undefined) updates.avatarUrl = args.avatarUrl;
    
    await ctx.db.patch(args.userId, updates);
    return { success: true };
  },
});
