import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Validation functions
function validateContactName(name: string): { valid: boolean; error?: string } {
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

function validateContactEmail(email: string): { valid: boolean; error?: string } {
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

function validateSubject(subject: string): { valid: boolean; error?: string } {
  if (!subject || subject.trim().length === 0) {
    return { valid: false, error: "Subject is required" };
  }
  if (subject.length < 3) {
    return { valid: false, error: "Subject must be at least 3 characters long" };
  }
  if (subject.length > 200) {
    return { valid: false, error: "Subject is too long (max 200 characters)" };
  }
  return { valid: true };
}

function validateMessage(message: string): { valid: boolean; error?: string } {
  if (!message || message.trim().length === 0) {
    return { valid: false, error: "Message is required" };
  }
  if (message.length < 10) {
    return { valid: false, error: "Message must be at least 10 characters long" };
  }
  if (message.length > 2000) {
    return { valid: false, error: "Message is too long (max 2000 characters)" };
  }
  return { valid: true };
}

// Submit a contact form
export const submitContactForm = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    userId: v.optional(v.id("users")),
  },
  handler: async (ctx, args) => {
    // Validate all fields
    const nameValidation = validateContactName(args.name);
    if (!nameValidation.valid) {
      throw new Error(nameValidation.error);
    }

    const emailValidation = validateContactEmail(args.email);
    if (!emailValidation.valid) {
      throw new Error(emailValidation.error);
    }

    const subjectValidation = validateSubject(args.subject);
    if (!subjectValidation.valid) {
      throw new Error(subjectValidation.error);
    }

    const messageValidation = validateMessage(args.message);
    if (!messageValidation.valid) {
      throw new Error(messageValidation.error);
    }

    // Check for duplicate submissions (same email, subject within last hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    const recentSubmissions = await ctx.db
      .query("contactSubmissions")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .filter((q) => q.gte(q.field("createdAt"), oneHourAgo))
      .collect();

    const duplicateSubmission = recentSubmissions.find(
      (sub) => sub.subject.toLowerCase() === args.subject.toLowerCase()
    );

    if (duplicateSubmission) {
      throw new Error("You have already submitted a similar message recently. Please wait before submitting again.");
    }

    // Create contact submission
    const submissionId = await ctx.db.insert("contactSubmissions", {
      name: args.name.trim(),
      email: args.email.toLowerCase().trim(),
      subject: args.subject.trim(),
      message: args.message.trim(),
      status: "pending",
      userId: args.userId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    return { 
      submissionId, 
      success: true,
      message: "Your message has been submitted successfully!"
    };
  },
});

// Get user's contact submissions
export const getUserContactSubmissions = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contactSubmissions")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Get all contact submissions (admin only)
export const getAllContactSubmissions = query({
  args: { 
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("replied"),
      v.literal("resolved")
    ))
  },
  handler: async (ctx, args) => {
    if (args.status !== undefined) {
      return await ctx.db
        .query("contactSubmissions")
        .withIndex("by_status", (q) => q.eq("status", args.status as "pending" | "replied" | "resolved"))
        .order("desc")
        .collect();
    }
    
    return await ctx.db
      .query("contactSubmissions")
      .order("desc")
      .collect();
  },
});

// Update contact submission status
export const updateContactStatus = mutation({
  args: {
    submissionId: v.id("contactSubmissions"),
    status: v.union(
      v.literal("pending"),
      v.literal("replied"),
      v.literal("resolved")
    ),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.submissionId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
