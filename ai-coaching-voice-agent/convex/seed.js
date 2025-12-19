import { mutation } from "./_generated/server";
import { v } from "convex/values";

export const seedData = mutation({
  args: {},
  handler: async (ctx) => {
    // 1. Seed Learning Paths
    const learningPaths = [
      {
        title: "Public Speaking Mastery",
        description: "Master the art of public speaking with confidence and clarity.",
        category: "Communication",
        difficulty: "Intermediate",
        totalModules: 5,
        estimatedHours: 10,
        topics: ["Voice Modulation", "Body Language", "Storytelling", "Stage Presence", "Q&A Handling"],
        thumbnail: "https://images.unsplash.com/photo-1475721027767-p4285600d5f3?w=800&q=80"
      },
      {
        title: "Tech Interview Prep",
        description: "Comprehensive preparation for technical interviews at top tech companies.",
        category: "Career",
        difficulty: "Advanced",
        totalModules: 8,
        estimatedHours: 20,
        topics: ["Data Structures", "Algorithms", "System Design", "Behavioral Questions", "Mock Interviews"],
        thumbnail: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=800&q=80"
      },
      {
        title: "Mindfulness & Meditation",
        description: "Learn to manage stress and improve focus through mindfulness.",
        category: "Wellness",
        difficulty: "Beginner",
        totalModules: 4,
        estimatedHours: 5,
        topics: ["Breathing Techniques", "Body Scan", "Mindful Walking", "Stress Reduction"],
        thumbnail: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80"
      }
    ];

    for (const path of learningPaths) {
      const existing = await ctx.db
        .query("learningPaths")
        .filter((q) => q.eq(q.field("title"), path.title))
        .first();
      
      if (!existing) {
        await ctx.db.insert("learningPaths", path);
      }
    }

    // 2. Seed Demo Analytics Data (Sessions)
    // Check if we have any sessions, if not, create some demo ones
    const existingSessions = await ctx.db.query("DiscussionRoom").take(1);
    
    if (existingSessions.length === 0) {
      const demoSessions = [];
      const now = Date.now();
      const dayMs = 24 * 60 * 60 * 1000;
      
      // Generate 20 sessions over the last 14 days
      for (let i = 0; i < 20; i++) {
        const daysAgo = Math.floor(Math.random() * 14);
        const duration = 5 + Math.floor(Math.random() * 25); // 5-30 mins
        const xp = duration * 10 + Math.floor(Math.random() * 50);
        const success = Math.random() > 0.2; // 80% success rate
        
        demoSessions.push({
          coachingOption: ["Public Speaking", "Interview Prep", "Debate", "Casual Chat"][Math.floor(Math.random() * 4)],
          topic: `Session ${i + 1}`,
          expertName: ["Coach Sarah", "Coach Mike", "Coach Emma"][Math.floor(Math.random() * 3)],
          duration: duration,
          xpEarned: xp,
          success: success,
          createdAt: now - (daysAgo * dayMs) - Math.floor(Math.random() * dayMs),
        });
      }
      
      for (const session of demoSessions) {
        await ctx.db.insert("DiscussionRoom", session);
      }
    }

    return "Database seeded successfully!";
  },
});
