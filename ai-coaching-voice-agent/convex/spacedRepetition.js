import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==================== SM-2 ALGORITHM ====================
// SuperMemo-2 Algorithm for Spaced Repetition
function calculateNextReview(card, rating) {
  let { easeFactor, interval, repetitions } = card;

  // Rating: 0 (Blackout) to 5 (Perfect)
  
  if (rating >= 3) {
    // Correct response
    if (repetitions === 0) {
      interval = 1;
    } else if (repetitions === 1) {
      interval = 6;
    } else {
      interval = Math.round(interval * easeFactor);
    }
    repetitions += 1;
  } else {
    // Incorrect response
    repetitions = 0;
    interval = 1;
  }

  // Update Ease Factor
  // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
  easeFactor = easeFactor + (0.1 - (5 - rating) * (0.08 + (5 - rating) * 0.02));
  if (easeFactor < 1.3) easeFactor = 1.3;

  return { easeFactor, interval, repetitions };
}

// ==================== MUTATIONS & QUERIES ====================

export const createFlashcard = mutation({
  args: {
    front: v.string(),
    back: v.string(),
    topic: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();

    if (!user) throw new Error("User not found");

    await ctx.db.insert("flashcards", {
      userId: user._id,
      front: args.front,
      back: args.back,
      topic: args.topic,
      easeFactor: 2.5,
      interval: 0,
      repetitions: 0,
      nextReview: Date.now(), // Available immediately
      status: "new",
      createdAt: Date.now(),
    });
  },
});

export const getDueFlashcards = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();

    if (!user) return [];

    const now = Date.now();

    // Get cards where nextReview <= now
    // Note: Complex filtering is better done in memory for small datasets 
    // or with specific index ranges for large ones.
    const allCards = await ctx.db
      .query("flashcards")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    return allCards.filter(card => card.nextReview <= now);
  },
});

export const processReview = mutation({
  args: {
    cardId: v.id("flashcards"),
    rating: v.number(), // 0-5
  },
  handler: async (ctx, args) => {
    const card = await ctx.db.get(args.cardId);
    if (!card) throw new Error("Card not found");

    const { easeFactor, interval, repetitions } = calculateNextReview(card, args.rating);

    const nextReviewDate = Date.now() + (interval * 24 * 60 * 60 * 1000);

    await ctx.db.patch(args.cardId, {
      easeFactor,
      interval,
      repetitions,
      nextReview: nextReviewDate,
      lastReview: Date.now(),
      status: args.rating >= 4 ? "mastered" : "review",
    });
  },
});

export const getStats = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return { total: 0, due: 0, mastered: 0 };

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();

    if (!user) return { total: 0, due: 0, mastered: 0 };

    const cards = await ctx.db
      .query("flashcards")
      .withIndex("by_user", (q) => q.eq("userId", user._id))
      .collect();

    const now = Date.now();
    
    return {
      total: cards.length,
      due: cards.filter(c => c.nextReview <= now).length,
      mastered: cards.filter(c => c.status === "mastered").length,
    };
  },
});
