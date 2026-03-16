import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
    users: defineTable({
        name: v.string(),
        email: v.string(),
        password: v.optional(v.string()), // Hashed password for authentication (optional for existing users)
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

        // Session Configuration
        title: v.optional(v.string()),
        level: v.optional(v.string()), // 'Beginner', 'Intermediate', 'Advanced', 'Expert'
        modelConfig: v.optional(v.object({
            model: v.string(),
            temperature: v.number(),
            topP: v.number(),
            topK: v.number(),
            maxOutputTokens: v.number()
        })),

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
    // Achievements
    achievements: defineTable({
        id: v.string(), // Unique identifier (e.g., "first_session")
        name: v.string(),
        description: v.string(),
        icon: v.string(), // Name of the icon to map on frontend
        category: v.string(),
        rarity: v.string(),

        // Progression Flow
        level: v.optional(v.number()), // For "Level by Level" flow
        order: v.optional(v.number()), // Display order

        // Step-by-Step Flow
        prerequisites: v.optional(v.array(v.string())), // IDs of achievements that must be unlocked first
        totalSteps: v.optional(v.number()), // For progress tracking (e.g. 5/10 sessions)

        xpReward: v.number(),
        condition: v.optional(v.string()) // "streak_7", "xp_1000" etc (legacy/helper)
    })
        .index("by_category", ["category"])
        .index("by_level", ["level"])
        .index("by_achievement_id", ["id"]),

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

    // Mock Interview Sessions
    mockInterviews: defineTable({
        userId: v.id("users"),
        sessionId: v.string(), // Unique session identifier
        idempotencyKey: v.optional(v.string()), // Prevent duplicate sessions

        // Setup Data
        title: v.string(),
        topic: v.string(),
        interviewerImage: v.string(), // interviewer persona (Dell.jpg, Lafi.jpg, Rajveer.jpg)
        interviewerName: v.string(),

        // Questions & Responses
        questions: v.array(v.object({
            questionId: v.string(),
            questionText: v.string(),
            difficulty: v.string(), // 'easy', 'medium', 'hard'
            source: v.optional(v.string()),
        })),

        responses: v.array(v.object({
            questionId: v.string(),
            audioUrl: v.optional(v.string()), // Storage URL
            transcription: v.optional(v.string()),
            responseTime: v.optional(v.number()), // seconds
            answered: v.boolean(),

            // Speech Analysis
            grammarScore: v.optional(v.number()),
            fluencyScore: v.optional(v.number()),
            fillerWords: v.optional(v.number()),
            hesitationCount: v.optional(v.number()),
            clarityScore: v.optional(v.number()),
            relevanceScore: v.optional(v.number()),
            confidenceScore: v.optional(v.number()),
        })),

        // Session Status
        status: v.string(), // 'in-progress', 'completed', 'terminated'
        currentQuestionIndex: v.optional(v.number()),
        noResponseCount: v.optional(v.number()), // Track consecutive no-responses
        currentQuestionStartTime: v.optional(v.number()), // Server-side timer validation

        // Final Evaluation
        evaluation: v.optional(v.object({
            overallScore: v.number(),
            grammarAccuracy: v.number(),
            fluencyScore: v.number(),
            hesitationFrequency: v.number(),
            avgResponseTime: v.number(),
            topicRelevance: v.number(),
            interviewReadiness: v.string(), // 'Ready', 'Needs Improvement', 'Not Ready'
            strengths: v.array(v.string()),
            weaknesses: v.array(v.string()),
            suggestions: v.array(v.string()),
            questionsAnswered: v.number(),
            questionsMissed: v.number(),
        })),

        // Timestamps
        startedAt: v.number(),
        completedAt: v.optional(v.number()),
        duration: v.optional(v.number()), // in seconds
    })
        .index("by_user", ["userId"])
        .index("by_session", ["sessionId"])
        .index("by_status", ["status"])
        .index("by_idempotency", ["idempotencyKey"])
        .index("by_user_status", ["userId", "status"]),

    // Learning Sessions (New Session-Based System)
    sessions: defineTable({
        userId: v.id("users"),
        sessionId: v.string(), // Unique session identifier from sessionManager
        type: v.string(), // 'mock_interview', 'lecture', 'qa_prep', 'language_skill', 'meditation'

        // Session Configuration
        config: v.any(), // Store session config (title, level, domain, etc.)

        // Session Data
        memory: v.any(), // Store session memory (questions, answers, transcripts, etc.)

        // Status & Timing
        status: v.string(), // 'active', 'completed', 'terminated', 'error'
        startTime: v.number(),
        endTime: v.optional(v.number()),
        duration: v.optional(v.number()), // in milliseconds

        // Metadata
        metadata: v.optional(v.any()), // Additional metadata (errors, retries, etc.)

        // Timestamps
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    })
        .index("by_user", ["userId"])
        .index("by_session_id", ["sessionId"])
        .index("by_user_type", ["userId", "type"])
        .index("by_status", ["status"]),

    // ==================== APTITUDE TRAINING SYSTEM ====================

    // Aptitude Levels - Defines each level's requirements and rewards
    aptitudeLevels: defineTable({
        level: v.number(),           // 1, 2, 3, 4, 5...
        name: v.string(),            // "Beginner", "Intermediate", "Advanced"
        description: v.string(),
        requiredCoins: v.number(),   // Coins needed to unlock this level
        questionsPerAttempt: v.number(), // How many questions per test
        timePerQuestion: v.number(), // Seconds allowed per question
        coinReward: v.number(),      // Coins earned per correct answer
        xpReward: v.number(),        // XP per correct answer
        passingScore: v.number(),    // Percentage to pass (e.g., 70)
        icon: v.string(),            // Icon name
        color: v.string(),           // Theme color for UI
    }).index("by_level", ["level"]),

    // Aptitude Questions - Question bank organized by level and category
    aptitudeQuestions: defineTable({
        questionId: v.string(),       // Unique ID
        level: v.number(),            // Which level this belongs to
        category: v.string(),         // "quantitative", "logical", "verbal", "technical", "hr"
        subcategory: v.optional(v.string()), // "percentages", "profit_loss", etc.
        type: v.string(),             // "mcq", "true_false"
        difficulty: v.string(),       // "easy", "medium", "hard"

        question: v.string(),         // The question text
        options: v.array(v.object({
            id: v.string(),
            text: v.string()
        })),
        correctAnswer: v.string(),    // ID of correct option
        explanation: v.string(),      // Explanation shown after answering

        tags: v.optional(v.array(v.string())),
        timesAnswered: v.optional(v.number()),
        timesCorrect: v.optional(v.number()),
    })
        .index("by_level", ["level"])
        .index("by_category", ["category"])
        .index("by_level_category", ["level", "category"])
        .index("by_question_id", ["questionId"]),

    // User Aptitude Progress - Tracks each user's overall progress
    userAptitudeProgress: defineTable({
        userId: v.id("users"),

        // Progress
        currentLevel: v.number(),     // Current highest unlocked level
        totalCoins: v.number(),       // All coins earned
        totalXp: v.number(),

        // Stats
        totalQuestionsAnswered: v.number(),
        totalCorrectAnswers: v.number(),
        totalTestsCompleted: v.number(),
        averageAccuracy: v.number(),  // Percentage
        averageTimePerQuestion: v.number(), // Seconds

        // Unlocks
        unlockedLevels: v.array(v.number()),
        badges: v.optional(v.array(v.string())),

        // Streak
        currentStreak: v.optional(v.number()),
        lastTestDate: v.optional(v.string()),

        createdAt: v.number(),
        updatedAt: v.number(),
    }).index("by_user", ["userId"]),

    // Question Attempts - Tracks individual question responses
    aptitudeAttempts: defineTable({
        userId: v.id("users"),
        sessionId: v.string(),        // Groups questions in one test session
        questionId: v.string(),
        level: v.number(),
        category: v.string(),

        selectedAnswer: v.string(),
        isCorrect: v.boolean(),
        timeTaken: v.number(),        // Seconds taken to answer
        coinsEarned: v.number(),
        xpEarned: v.number(),

        attemptedAt: v.number(),
    })
        .index("by_user", ["userId"])
        .index("by_session", ["sessionId"])
        .index("by_user_level", ["userId", "level"]),

    // Test Sessions - Tracks complete test sessions
    aptitudeTestSessions: defineTable({
        userId: v.id("users"),
        sessionId: v.string(),
        level: v.number(),

        // Results
        totalQuestions: v.number(),
        correctAnswers: v.number(),
        wrongAnswers: v.number(),
        skippedQuestions: v.number(),

        // Rewards
        coinsEarned: v.number(),
        xpEarned: v.number(),
        passed: v.boolean(),

        // Timing
        totalTime: v.number(),        // Total seconds
        averageTime: v.number(),      // Per question

        // Status
        status: v.string(),           // "in_progress", "completed", "abandoned"
        startedAt: v.number(),
        completedAt: v.optional(v.number()),
    })
        .index("by_user", ["userId"])
        .index("by_session_id", ["sessionId"])
        .index("by_user_level", ["userId", "level"]),

    // ==================== COMMUNITY TESTS ====================

    // Community Tests - User-created tests
    communityTests: defineTable({
        testId: v.string(),           // Unique ID
        code: v.string(),             // 6-char join code
        creatorId: v.id("users"),
        creatorName: v.optional(v.string()),

        // Test Info
        name: v.string(),
        description: v.string(),
        category: v.optional(v.string()), // "aptitude", "technical", "hr", etc.

        // Settings
        visibility: v.string(),       // "public" | "private"
        timePerQuestion: v.number(),  // Seconds per question
        shuffleQuestions: v.optional(v.boolean()),
        showAnswers: v.optional(v.boolean()), // Show answers after completion

        // Scheduling
        startsAt: v.optional(v.number()),  // 0 or null = immediate
        endsAt: v.optional(v.number()),    // 0 or null = never

        // Stats
        questionsCount: v.number(),
        participantsCount: v.optional(v.number()),
        avgScore: v.optional(v.number()),

        // Status
        status: v.string(),           // "draft" | "active" | "ended"
        createdAt: v.number(),
        updatedAt: v.optional(v.number()),
    })
        .index("by_code", ["code"])
        .index("by_creator", ["creatorId"])
        .index("by_visibility", ["visibility"])
        .index("by_status", ["status"]),

    // Community Test Questions
    communityTestQuestions: defineTable({
        testId: v.string(),
        questionIndex: v.number(),
        question: v.string(),
        options: v.array(v.object({
            id: v.string(),
            text: v.string()
        })),
        correctAnswer: v.string(),
        explanation: v.optional(v.string()),
        points: v.optional(v.number()),
    }).index("by_test", ["testId"]),

    // Community Test Participants/Results
    communityTestResults: defineTable({
        testId: v.string(),
        testCode: v.string(),
        participantId: v.id("users"),
        participantName: v.optional(v.string()),

        // Results
        score: v.number(),
        totalQuestions: v.number(),
        correctAnswers: v.number(),
        timeTaken: v.number(),         // Total seconds

        // Status
        status: v.string(),            // "in_progress" | "completed"
        startedAt: v.number(),
        completedAt: v.optional(v.number()),
    })
        .index("by_test", ["testId"])
        .index("by_participant", ["participantId"])
        .index("by_test_participant", ["testId", "participantId"]),
});