import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// ==================== LEADERBOARD ====================

export const getGlobalLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    // Get top users by XP
    // Note: In a real production app with millions of users, 
    // we would use a dedicated leaderboard table or Redis.
    // For this scale, querying the users table is fine.
    const topUsers = await ctx.db
      .query("users")
      .withIndex("by_email") // We don't have an XP index yet, so this will scan. 
      // TODO: Add index on XP for performance
      .collect();

    // Sort in memory for now (Convex sort support depends on index)
    const sortedUsers = topUsers
      .sort((a, b) => (b.xp || 0) - (a.xp || 0))
      .slice(0, limit)
      .map(user => ({
        _id: user._id,
        name: user.name,
        image: user.image,
        xp: user.xp || 0,
        level: user.level || 1,
        streak: user.streak || 0,
      }));

    return sortedUsers;
  },
});

// ==================== FRIENDS ====================

export const sendFriendRequest = mutation({
  args: { receiverId: v.id("users") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();
      
    if (!user) throw new Error("User not found");
    
    if (user._id === args.receiverId) throw new Error("Cannot friend yourself");

    // Check if request already exists
    const existing = await ctx.db
      .query("friendships")
      .withIndex("by_users", (q) => 
        q.eq("requesterId", user._id).eq("receiverId", args.receiverId)
      )
      .unique();

    if (existing) throw new Error("Request already sent");

    await ctx.db.insert("friendships", {
      requesterId: user._id,
      receiverId: args.receiverId,
      status: "pending",
      createdAt: Date.now(),
    });
  },
});

export const acceptFriendRequest = mutation({
  args: { friendshipId: v.id("friendships") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const friendship = await ctx.db.get(args.friendshipId);
    if (!friendship) throw new Error("Friendship not found");

    // Verify the current user is the receiver
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();

    if (!user || user._id !== friendship.receiverId) {
      throw new Error("Unauthorized");
    }

    await ctx.db.patch(args.friendshipId, {
      status: "accepted",
    });
  },
});

export const getFriends = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();

    if (!user) return [];

    // Get friendships where user is requester OR receiver
    const sent = await ctx.db
      .query("friendships")
      .withIndex("by_requester", (q) => q.eq("requesterId", user._id))
      .collect();

    const received = await ctx.db
      .query("friendships")
      .withIndex("by_receiver", (q) => q.eq("receiverId", user._id))
      .collect();

    const allFriendships = [...sent, ...received].filter(f => f.status === "accepted");

    // Fetch friend details
    const friends = await Promise.all(
      allFriendships.map(async (f) => {
        const friendId = f.requesterId === user._id ? f.receiverId : f.requesterId;
        const friendData = await ctx.db.get(friendId);
        return {
          _id: friendData._id,
          name: friendData.name,
          image: friendData.image,
          xp: friendData.xp || 0,
          level: friendData.level || 1,
          status: "online", // Placeholder for presence
        };
      })
    );

    return friends;
  },
});

// ==================== SHARING ====================

export const shareAchievement = mutation({
  args: { achievementId: v.string(), title: v.string() },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", identity.email))
      .unique();

    await ctx.db.insert("sharedContent", {
      userId: user._id,
      contentType: "achievement",
      contentId: args.achievementId,
      title: args.title,
      likes: 0,
      views: 0,
      createdAt: Date.now(),
    });
  },
});
