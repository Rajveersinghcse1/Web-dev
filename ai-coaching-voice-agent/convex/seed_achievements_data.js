export const ACHIEVEMENT_DATA = [
    // Getting Started
    {
        id: 'first_session',
        name: 'First Steps',
        description: 'Complete your first coaching session',
        icon: 'Sparkles',
        xpReward: 50,
        rarity: 'common',
        category: 'getting_started',
        level: 1,
        order: 1,
        totalSteps: 1
    },
    {
        id: 'profile_complete',
        name: 'All Set Up',
        description: 'Complete your profile setup',
        icon: 'Star',
        xpReward: 30,
        rarity: 'common',
        category: 'getting_started',
        level: 1,
        order: 2,
        totalSteps: 1
    },

    // Sessions
    {
        id: 'session_5',
        name: 'Getting Started',
        description: 'Complete 5 sessions',
        icon: 'BookOpen',
        xpReward: 100,
        rarity: 'common',
        category: 'sessions',
        level: 2,
        order: 3,
        totalSteps: 5,
        prerequisites: ['first_session']
    },
    {
        id: 'session_10',
        name: 'Dedicated Learner',
        description: 'Complete 10 sessions',
        icon: 'Brain',
        xpReward: 200,
        rarity: 'uncommon',
        category: 'sessions',
        level: 3,
        order: 4,
        totalSteps: 10,
        prerequisites: ['session_5']
    },
    {
        id: 'session_25',
        name: 'Knowledge Seeker',
        description: 'Complete 25 sessions',
        icon: 'Target',
        xpReward: 500,
        rarity: 'rare',
        category: 'sessions',
        level: 5,
        order: 5,
        totalSteps: 25,
        prerequisites: ['session_10']
    },
    {
        id: 'session_50',
        name: 'Learning Master',
        description: 'Complete 50 sessions',
        icon: 'Trophy',
        xpReward: 1000,
        rarity: 'epic',
        category: 'sessions',
        level: 8,
        order: 6,
        totalSteps: 50,
        prerequisites: ['session_25']
    },
    {
        id: 'session_100',
        name: 'Century Club',
        description: 'Complete 100 sessions',
        icon: 'Crown',
        xpReward: 2500,
        rarity: 'legendary',
        category: 'sessions',
        level: 10,
        order: 7,
        totalSteps: 100,
        prerequisites: ['session_50']
    },

    // Streaks
    {
        id: 'streak_3',
        name: 'On Fire',
        description: '3-day learning streak',
        icon: 'Flame',
        xpReward: 75,
        rarity: 'common',
        category: 'streaks',
        level: 2,
        order: 8,
        totalSteps: 3
    },
    {
        id: 'streak_7',
        name: 'Week Warrior',
        description: '7-day learning streak',
        icon: 'Flame',
        xpReward: 200,
        rarity: 'uncommon',
        category: 'streaks',
        level: 4,
        order: 9,
        totalSteps: 7,
        prerequisites: ['streak_3']
    },
    {
        id: 'streak_30',
        name: 'Monthly Dedication',
        description: '30-day learning streak',
        icon: 'Flame',
        xpReward: 1000,
        rarity: 'epic',
        category: 'streaks',
        level: 7,
        order: 10,
        totalSteps: 30,
        prerequisites: ['streak_7']
    },
    {
        id: 'streak_100',
        name: 'Unstoppable',
        description: '100-day learning streak',
        icon: 'Flame',
        xpReward: 5000,
        rarity: 'legendary',
        category: 'streaks',
        level: 10,
        order: 11,
        totalSteps: 100,
        prerequisites: ['streak_30']
    },

    // Time
    {
        id: 'hour_1',
        name: 'Time Invested',
        description: 'Spend 1 hour learning',
        icon: 'Clock',
        xpReward: 100,
        rarity: 'common',
        category: 'time',
        level: 1,
        order: 12,
        totalSteps: 1
    },
    {
        id: 'hour_10',
        name: 'Committed Student',
        description: 'Spend 10 hours learning',
        icon: 'Clock',
        xpReward: 500,
        rarity: 'uncommon',
        category: 'time',
        level: 3,
        order: 13,
        totalSteps: 10,
        prerequisites: ['hour_1']
    },
    {
        id: 'hour_50',
        name: 'Time Master',
        description: 'Spend 50 hours learning',
        icon: 'Clock',
        xpReward: 2000,
        rarity: 'rare',
        category: 'time',
        level: 6,
        order: 14,
        totalSteps: 50,
        prerequisites: ['hour_10']
    },
    {
        id: 'hour_100',
        name: 'Learning Legend',
        description: 'Spend 100 hours learning',
        icon: 'Clock',
        xpReward: 5000,
        rarity: 'legendary',
        category: 'time',
        level: 9,
        order: 15,
        totalSteps: 100,
        prerequisites: ['hour_50']
    },

    // Topics
    {
        id: 'multi_topic_3',
        name: 'Curious Mind',
        description: 'Learn 3 different topics',
        icon: 'Brain',
        xpReward: 150,
        rarity: 'common',
        category: 'topics',
        level: 2,
        order: 16,
        totalSteps: 3
    },
    {
        id: 'multi_topic_10',
        name: 'Renaissance Person',
        description: 'Learn 10 different topics',
        icon: 'Brain',
        xpReward: 500,
        rarity: 'uncommon',
        category: 'topics',
        level: 4,
        order: 17,
        totalSteps: 10,
        prerequisites: ['multi_topic_3']
    },
    {
        id: 'multi_topic_25',
        name: 'Jack of All Trades',
        description: 'Learn 25 different topics',
        icon: 'Brain',
        xpReward: 1500,
        rarity: 'rare',
        category: 'topics',
        level: 7,
        order: 18,
        totalSteps: 25,
        prerequisites: ['multi_topic_10']
    },

    // Engagement
    {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Complete a session before 8 AM',
        icon: 'Zap',
        xpReward: 100,
        rarity: 'uncommon',
        category: 'engagement',
        level: 2,
        order: 19
    },
    {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Complete a session after 10 PM',
        icon: 'Zap',
        xpReward: 100,
        rarity: 'uncommon',
        category: 'engagement',
        level: 2,
        order: 20
    },
    {
        id: 'marathon',
        name: 'Marathon Runner',
        description: 'Complete 5 sessions in one day',
        icon: 'Rocket',
        xpReward: 300,
        rarity: 'rare',
        category: 'engagement',
        level: 5,
        order: 21,
        totalSteps: 5
    },
    {
        id: 'perfect_week',
        name: 'Perfect Week',
        description: 'Complete at least one session every day for a week',
        icon: 'Star',
        xpReward: 500,
        rarity: 'epic',
        category: 'engagement',
        level: 6,
        order: 22,
        totalSteps: 7
    },

    // Quality
    {
        id: 'feedback_master',
        name: 'Feedback Seeker',
        description: 'View feedback for 10 sessions',
        icon: 'MessageSquare',
        xpReward: 200,
        rarity: 'common',
        category: 'quality',
        level: 3,
        order: 23,
        totalSteps: 10
    },
    {
        id: 'improvement_king',
        name: 'Always Improving',
        description: 'Show improvement across 5 consecutive sessions',
        icon: 'TrendingUp',
        xpReward: 400,
        rarity: 'rare',
        category: 'quality',
        level: 4,
        order: 24,
        totalSteps: 5
    },

    // Levels
    {
        id: 'level_10',
        name: 'Rising Star',
        description: 'Reach level 10',
        icon: 'Star',
        xpReward: 500,
        rarity: 'uncommon',
        category: 'levels',
        level: 10,
        order: 25,
        totalSteps: 10
    },
    {
        id: 'level_25',
        name: 'Expert Learner',
        description: 'Reach level 25',
        icon: 'Award',
        xpReward: 1500,
        rarity: 'rare',
        category: 'levels',
        level: 25,
        order: 26,
        totalSteps: 25,
        prerequisites: ['level_10']
    },
    {
        id: 'level_50',
        name: 'Grand Master',
        description: 'Reach level 50',
        icon: 'Crown',
        xpReward: 5000,
        rarity: 'legendary',
        category: 'levels',
        level: 50,
        order: 27,
        totalSteps: 50,
        prerequisites: ['level_25']
    },

    // Social
    {
        id: 'first_share',
        name: 'Sharing is Caring',
        description: 'Share your progress for the first time',
        icon: 'Heart',
        xpReward: 100,
        rarity: 'common',
        category: 'social',
        level: 1,
        order: 28
    },
    {
        id: 'top_10_leaderboard',
        name: 'Top 10',
        description: 'Reach the top 10 on the leaderboard',
        icon: 'Medal',
        xpReward: 1000,
        rarity: 'epic',
        category: 'social',
        level: 8,
        order: 29
    }
];
