import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Helper to check if user is admin
async function isAdmin(ctx: any, userId: string) {
  const user = await ctx.db.get(userId);
  return user?.role === "admin";
}

// ============= USER MANAGEMENT =============

// Get all users (admin only)
export const getAllUsers = query({
  args: { adminId: v.id("users") },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.adminId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    const users = await ctx.db.query("users").collect();
    
    // Don't return password hashes
    return users.map(user => ({
      _id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      nickname: user.nickname,
      fullName: user.fullName,
      phone: user.phone,
      location: user.location,
      totalTests: user.totalTests,
      totalQuestions: user.totalQuestions,
      correctAnswers: user.correctAnswers,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  },
});

// Update user role (admin only)
export const updateUserRole = mutation({
  args: {
    adminId: v.id("users"),
    userId: v.id("users"),
    role: v.union(v.literal("student"), v.literal("admin")),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.adminId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.patch(args.userId, {
      role: args.role,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete user (admin only)
export const deleteUser = mutation({
  args: {
    adminId: v.id("users"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.adminId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Prevent deleting yourself
    if (args.adminId === args.userId) {
      throw new Error("Cannot delete your own account");
    }

    await ctx.db.delete(args.userId);
    return { success: true };
  },
});

// ============= TEST RESULTS MANAGEMENT =============

// Get all test results (admin only)
export const getAllTestResults = query({
  args: { adminId: v.id("users") },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.adminId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db.query("testResults").order("desc").collect();
  },
});

// Delete test result (admin only)
export const deleteTestResult = mutation({
  args: {
    adminId: v.id("users"),
    testResultId: v.id("testResults"),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.adminId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.delete(args.testResultId);
    return { success: true };
  },
});

// ============= CONTACT SUBMISSIONS MANAGEMENT =============

// Get all contact submissions (admin only)
export const getAllContactSubmissions = query({
  args: { adminId: v.id("users") },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.adminId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db.query("contactSubmissions").order("desc").collect();
  },
});

// Update contact submission status (admin only)
export const updateContactSubmissionStatus = mutation({
  args: {
    adminId: v.id("users"),
    submissionId: v.id("contactSubmissions"),
    status: v.union(
      v.literal("pending"),
      v.literal("replied"),
      v.literal("resolved")
    ),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.adminId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.patch(args.submissionId, {
      status: args.status,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

// Delete contact submission (admin only)
export const deleteContactSubmission = mutation({
  args: {
    adminId: v.id("users"),
    submissionId: v.id("contactSubmissions"),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.adminId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.delete(args.submissionId);
    return { success: true };
  },
});

// ============= NOTIFICATIONS MANAGEMENT =============

// Send notification to all users or specific user
export const sendNotification = mutation({
  args: {
    adminId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("info"),
      v.literal("success"),
      v.literal("warning"),
      v.literal("error")
    ),
    recipientId: v.optional(v.id("users")), // If null, send to all
    recipientRole: v.optional(v.union(v.literal("student"), v.literal("admin"))),
    expiresAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.adminId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    // Validate message length
    if (args.title.length < 3 || args.title.length > 100) {
      throw new Error("Title must be between 3 and 100 characters");
    }
    if (args.message.length < 10 || args.message.length > 500) {
      throw new Error("Message must be between 10 and 500 characters");
    }

    const notificationId = await ctx.db.insert("notifications", {
      title: args.title,
      message: args.message,
      type: args.type,
      recipientId: args.recipientId,
      recipientRole: args.recipientRole,
      sentBy: args.adminId,
      isRead: false,
      createdAt: Date.now(),
      expiresAt: args.expiresAt,
    });

    return { notificationId, success: true };
  },
});

// Get notifications for a user
export const getUserNotifications = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) return [];

    const now = Date.now();

    // Get notifications targeted to this specific user
    const userNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_recipient", (q) => q.eq("recipientId", args.userId))
      .filter((q) => 
        q.or(
          q.eq(q.field("expiresAt"), undefined),
          q.gt(q.field("expiresAt"), now)
        )
      )
      .order("desc")
      .collect();

    // Get notifications for all users (recipientId is null)
    const allUserNotifications = await ctx.db
      .query("notifications")
      .filter((q) => 
        q.and(
          q.eq(q.field("recipientId"), undefined),
          q.eq(q.field("recipientRole"), undefined),
          q.or(
            q.eq(q.field("expiresAt"), undefined),
            q.gt(q.field("expiresAt"), now)
          )
        )
      )
      .order("desc")
      .collect();

    // Get notifications for user's role
    const roleNotifications = await ctx.db
      .query("notifications")
      .withIndex("by_role", (q) => q.eq("recipientRole", user.role))
      .filter((q) => 
        q.or(
          q.eq(q.field("expiresAt"), undefined),
          q.gt(q.field("expiresAt"), now)
        )
      )
      .order("desc")
      .collect();

    // Combine and deduplicate
    const allNotifications = [...userNotifications, ...allUserNotifications, ...roleNotifications];
    const uniqueNotifications = Array.from(
      new Map(allNotifications.map(n => [n._id, n])).values()
    );

    return uniqueNotifications.sort((a, b) => b.createdAt - a.createdAt);
  },
});

// Mark notification as read
export const markNotificationAsRead = mutation({
  args: {
    userId: v.id("users"),
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const notification = await ctx.db.get(args.notificationId);
    if (!notification) {
      throw new Error("Notification not found");
    }

    // Verify user can mark this notification as read
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    const canRead = 
      notification.recipientId === args.userId ||
      notification.recipientId === undefined ||
      notification.recipientRole === user.role;

    if (!canRead) {
      throw new Error("Unauthorized to mark this notification as read");
    }

    await ctx.db.patch(args.notificationId, {
      isRead: true,
      readAt: Date.now(),
    });

    return { success: true };
  },
});

// Get all notifications (admin only)
export const getAllNotifications = query({
  args: { adminId: v.id("users") },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.adminId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    return await ctx.db.query("notifications").order("desc").collect();
  },
});

// Delete notification (admin only)
export const deleteNotification = mutation({
  args: {
    adminId: v.id("users"),
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.adminId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    await ctx.db.delete(args.notificationId);
    return { success: true };
  },
});

// ============= STATISTICS =============

// Get platform statistics (admin only)
export const getPlatformStats = query({
  args: { adminId: v.id("users") },
  handler: async (ctx, args) => {
    if (!(await isAdmin(ctx, args.adminId))) {
      throw new Error("Unauthorized: Admin access required");
    }

    const users = await ctx.db.query("users").collect();
    const testResults = await ctx.db.query("testResults").collect();
    const contactSubmissions = await ctx.db.query("contactSubmissions").collect();

    const totalStudents = users.filter(u => u.role === "student").length;
    const totalAdmins = users.filter(u => u.role === "admin").length;
    const totalTests = testResults.length;
    const pendingContacts = contactSubmissions.filter(c => c.status === "pending").length;

    return {
      totalUsers: users.length,
      totalStudents,
      totalAdmins,
      totalTests,
      totalContacts: contactSubmissions.length,
      pendingContacts,
    };
  },
});
