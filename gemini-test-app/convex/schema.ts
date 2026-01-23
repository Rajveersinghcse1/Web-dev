import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    email: v.string(),
    passwordHash: v.optional(v.string()),
    name: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    stackAuthId: v.optional(v.string()),
    
    // Role-based access control
    role: v.optional(v.union(v.literal("student"), v.literal("admin"))),
    
    // Profile fields
    nickname: v.optional(v.string()),
    fullName: v.optional(v.string()),
    phone: v.optional(v.string()),
    location: v.optional(v.string()),
    bio: v.optional(v.string()),
    
    // Aggregated Statistics (denormalized for performance)
    totalTests: v.number(),
    totalQuestions: v.number(),
    correctAnswers: v.number(),
    totalTimeTaken: v.optional(v.number()), // Total time spent in seconds
    
    // Metadata
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_stack_auth_id", ["stackAuthId"])
    .index("by_role", ["role", "createdAt"]),

  testResults: defineTable({
    userId: v.id("users"),
    
    // Test Configuration
    subject: v.string(),
    totalQuestions: v.number(),
    
    // Performance Metrics
    attempted: v.number(),
    correct: v.number(),
    incorrect: v.number(),
    unanswered: v.number(),
    
    // Scoring
    totalScore: v.number(),
    maxScore: v.number(),
    percentage: v.number(),
    
    // Time Analytics
    timeTaken: v.number(),
    averageTimePerQuestion: v.optional(v.number()),
    
    // Topic-wise Analysis (precomputed for O(1) retrieval)
    topicAnalysis: v.optional(v.array(
      v.object({
        topicName: v.string(),
        questionsAttempted: v.number(),
        correct: v.number(),
        accuracy: v.number(),
      })
    )),
    
    // Question Details (embedded for quick access)
    questionAnalysis: v.array(
      v.object({
        questionId: v.number(),
        question: v.string(),
        userAnswer: v.union(v.string(), v.null()),
        correctAnswer: v.string(),
        isCorrect: v.boolean(),
        marks: v.number(),
        timeTaken: v.optional(v.number()),
        topic: v.optional(v.string()), // For topic-wise breakdown
      })
    ),
    
    // Metadata
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_date", ["userId", "createdAt"])
    .index("by_percentage", ["percentage"])
    .index("by_subject", ["subject", "createdAt"]),

  // Optional: Granular question tracking for advanced analytics
  questionAttempts: defineTable({
    userId: v.id("users"),
    testResultId: v.id("testResults"),
    
    // Question Details
    questionId: v.number(),
    question: v.string(),
    correctAnswer: v.string(),
    topic: v.string(),
    difficulty: v.optional(v.union(v.literal("easy"), v.literal("medium"), v.literal("hard"))),
    
    // Student Response
    userAnswer: v.union(v.string(), v.null()),
    isCorrect: v.boolean(),
    isSkipped: v.boolean(),
    
    // Time Tracking
    timeTaken: v.number(),
    
    // Metadata
    attemptedAt: v.number(),
  })
    .index("by_user_topic", ["userId", "topic"])
    .index("by_test", ["testResultId"])
    .index("by_difficulty", ["userId", "difficulty"]),

  // Master data: Topics
  topics: defineTable({
    name: v.string(),
    subject: v.string(),
    description: v.optional(v.string()),
    createdAt: v.number(),
  }).index("by_subject", ["subject"]),

  // Contact form submissions
  contactSubmissions: defineTable({
    name: v.string(),
    email: v.string(),
    subject: v.string(),
    message: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("replied"),
      v.literal("resolved")
    ),
    userId: v.optional(v.id("users")), // Optional: track logged-in users
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_status", ["status", "createdAt"])
    .index("by_user", ["userId", "createdAt"]),

  // Notifications system
  notifications: defineTable({
    title: v.string(),
    message: v.string(),
    type: v.union(
      v.literal("info"),
      v.literal("success"),
      v.literal("warning"),
      v.literal("error")
    ),
    // Target audience
    recipientId: v.optional(v.id("users")), // Specific user or null for all
    recipientRole: v.optional(v.union(v.literal("student"), v.literal("admin"))), // Target by role
    
    // Tracking
    sentBy: v.id("users"), // Admin who sent it
    isRead: v.boolean(),
    readAt: v.optional(v.number()),
    
    createdAt: v.number(),
    expiresAt: v.optional(v.number()), // Optional expiration
  })
    .index("by_recipient", ["recipientId", "createdAt"])
    .index("by_role", ["recipientRole", "createdAt"])
    .index("by_read_status", ["recipientId", "isRead", "createdAt"]),
});
