import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        image: v.optional(v.string()),
        credits: v.number(),
        subscriptionId: v.optional(v.string()),
        
        // Gamification & Progress
        level: v.optional(v.number()),
        xp: v.optional(v.number()),
        streak: v.optional(v.number()),
        lastActiveDate: v.optional(v.string()), // ISO date
        longestStreak: v.optional(v.number()),
        totalSessions: v.optional(v.number()),
        totalMinutes: v.optional(v.number()),
        unlockedAchievements: v.optional(v.array(v.string())), // Array of achievement IDs
    }).index("by_email", ["email"]),

    DiscussionRoom: defineTable({
        coachingOption: v.string(),
        topic: v.string(),
        expertName: v.string(),
        conversation: v.optional(v.any()),
        summery: v.optional(v.any()),
        uid: v.optional(v.id('users')),
        
        // Enhanced Session Data
        duration: v.optional(v.number()), // in seconds
        xpEarned: v.optional(v.number()),
        success: v.optional(v.boolean()), // For analytics
        createdAt: v.optional(v.number()),
    }),

    // Learning Paths
    learningPaths: defineTable({
        name: v.string(),
        description: v.string(),
        icon: v.string(),
        totalXp: v.number(),
        estimatedHours: v.number(),
        topics: v.array(v.object({
            id: v.string(),
            name: v.string(),
            difficulty: v.string(), // 'easy', 'medium', 'hard'
            xpReward: v.number(),
            order: v.number(),
        })),
    }),

    // User progress on learning paths
    userLearningProgress: defineTable({
        userId: v.id("users"),
        pathId: v.id("learningPaths"),
        progress: v.number(), // Percentage 0-100
        completedTopics: v.array(v.string()), // Array of topic IDs
        isActive: v.boolean(),
    }).index("by_user", ["userId"]),

    // Achievements
    achievements: defineTable({
        name: v.string(),
        description: v.string(),
        icon: v.string(),
        condition: v.string(), // e.g., "streak_7", "xp_1000"
        xpReward: v.number(),
    }),

    // Team Sessions
    teamSessions: defineTable({
        hostId: v.string(),
        code: v.string(),
        status: v.string(), // 'waiting', 'active', 'completed'
        topic: v.string(),
        maxParticipants: v.optional(v.number()), // Added maxParticipants
        participants: v.array(v.object({
            userId: v.string(),
            name: v.string(),
            avatar: v.optional(v.string()),
            score: v.number(),
            joinedAt: v.number(),
            status: v.optional(v.string()), // 'active', 'left'
        })),
        createdAt: v.number(),
    }).index("by_code", ["code"]),

    // Session Messages (Chat & Transcripts)
    messages: defineTable({
        sessionId: v.id("teamSessions"),
        userId: v.string(),
        userName: v.string(),
        content: v.string(),
        type: v.string(), // 'chat', 'transcript', 'system'
        timestamp: v.number(),
    })
    .index("by_session", ["sessionId"])
    .index("by_timestamp", ["timestamp"]),

    // WebRTC Signaling
    signals: defineTable({
        sessionId: v.id("teamSessions"),
        senderId: v.string(),
        receiverId: v.string(),
        type: v.string(), // 'offer', 'answer', 'candidate'
        payload: v.string(), // JSON string
        timestamp: v.number(),
    }).index("by_session_receiver", ["sessionId", "receiverId"]),

    // Social Features
    friendships: defineTable({
        requesterId: v.id("users"),
        receiverId: v.id("users"),
        status: v.string(), // 'pending', 'accepted', 'rejected'
        createdAt: v.number(),
    })
    .index("by_requester", ["requesterId"])
    .index("by_receiver", ["receiverId"])
    .index("by_status", ["status"])
    .index("by_users", ["requesterId", "receiverId"]), // For checking existing connection

    // Shared Content (Sessions/Achievements)
    sharedContent: defineTable({
        userId: v.id("users"),
        contentType: v.string(), // 'session', 'achievement'
        contentId: v.string(), // ID of the session or achievement
        title: v.string(),
        description: v.optional(v.string()),
        likes: v.number(),
        views: v.number(),
        createdAt: v.number(),
    }).index("by_user", ["userId"]),

    // Spaced Repetition (Flashcards)
    flashcards: defineTable({
        userId: v.id("users"),
        front: v.string(),
        back: v.string(),
        topic: v.string(),
        
        // SM-2 Algorithm Parameters
        easeFactor: v.number(), // Default 2.5
        interval: v.number(),   // Days
        repetitions: v.number(), // Consecutive successful reviews
        
        nextReview: v.number(), // Timestamp
        lastReview: v.optional(v.number()),
        
        status: v.string(), // 'new', 'learning', 'review', 'mastered'
        createdAt: v.number(),
    })
    .index("by_user", ["userId"])
    .index("by_next_review", ["userId", "nextReview"]), // For fetching due cards
});