import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Session name validation constants
const INVALID_CHARS_REGEX = /[<>:"/\\|?*\x00-\x1f]/g;
const MIN_TOPIC_LENGTH = 3;
const MAX_TOPIC_LENGTH = 200;

/**
 * Validate session/topic name
 */
const validateSessionName = (topic, existingTopics = []) => {
    // Check for blank or whitespace-only
    if (!topic || typeof topic !== 'string') {
        return { valid: false, error: 'Topic is required' };
    }
    
    const trimmedTopic = topic.trim();
    
    if (trimmedTopic.length === 0) {
        return { valid: false, error: 'Topic cannot be blank or whitespace only' };
    }
    
    // Check minimum length
    if (trimmedTopic.length < MIN_TOPIC_LENGTH) {
        return { valid: false, error: `Topic must be at least ${MIN_TOPIC_LENGTH} characters long` };
    }
    
    // Check maximum length
    if (trimmedTopic.length > MAX_TOPIC_LENGTH) {
        return { valid: false, error: `Topic must be less than ${MAX_TOPIC_LENGTH} characters` };
    }
    
    // Check for invalid characters
    if (INVALID_CHARS_REGEX.test(trimmedTopic)) {
        return { valid: false, error: 'Topic contains invalid characters. Avoid < > : " / \\ | ? *' };
    }
    
    // Check for duplicates (case-insensitive)
    const lowerTopic = trimmedTopic.toLowerCase();
    const isDuplicate = existingTopics.some(t => t.toLowerCase() === lowerTopic);
    if (isDuplicate) {
        return { valid: false, error: 'A session with this topic already exists. Please use a different name.' };
    }
    
    return { valid: true, sanitized: trimmedTopic };
};

export const CreateNewRoom = mutation({
    args: {
        coachingOption: v.string(),
        topic: v.string(),
        expertName: v.string(),
        uid: v.id('users')
    },
    handler: async (ctx, args) => {
        // Validate required fields
        if (!args.coachingOption) {
            throw new Error('Coaching option is required');
        }
        if (!args.expertName) {
            throw new Error('Expert name is required');
        }
        if (!args.uid) {
            throw new Error('User ID is required');
        }

        // Get existing topics for duplicate check
        const existingRooms = await ctx.db.query('DiscussionRoom')
            .filter(q => q.eq(q.field('uid'), args.uid))
            .collect();
        
        const existingTopics = existingRooms.map(room => room.topic);
        
        // Validate session name
        const validation = validateSessionName(args.topic, existingTopics);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        const result = await ctx.db.insert('DiscussionRoom', {
            coachingOption: args.coachingOption,
            topic: validation.sanitized,
            expertName: args.expertName,
            uid: args.uid,
            conversation: [],
            summery: null
        });

        return result;
    }
});

/**
 * Validate a session name before creation (client-side check)
 */
export const ValidateSessionName = query({
    args: {
        topic: v.string(),
        uid: v.id('users')
    },
    handler: async (ctx, args) => {
        // Get existing topics for duplicate check
        const existingRooms = await ctx.db.query('DiscussionRoom')
            .filter(q => q.eq(q.field('uid'), args.uid))
            .collect();
        
        const existingTopics = existingRooms.map(room => room.topic);
        
        return validateSessionName(args.topic, existingTopics);
    }
});

export const GetDiscussionRoomData = query({
    args: {
        id: v.id('DiscussionRoom')
    },
    handler: async (ctx, args) => {
        const result = await ctx.db.get(args.id);
        return result;
    }
});

export const UpdateConversation = mutation({
    args: {
        id: v.id('DiscussionRoom'),
        conversation: v.any()
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            conversation: args.conversation
        });
    }
});

export const UpdateSummery = mutation({
    args: {
        id: v.id('DiscussionRoom'),
        summery: v.any()
    },
    handler: async (ctx, args) => {
        await ctx.db.patch(args.id, {
            summery: args.summery
        });
    }
});

export const GetAllDiscussionRoom = query({
    args: {
        uid: v.id('users')
    },
    handler: async (ctx, args) => {
        const result = await ctx.db.query('DiscussionRoom')
            .filter(q => q.eq(q.field('uid'), args.uid))
            .order('desc')
            .collect();
        return result;
    }
});

// Delete a specific discussion room
export const DeleteDiscussionRoom = mutation({
    args: {
        id: v.id('DiscussionRoom'),
        uid: v.id('users')
    },
    handler: async (ctx, args) => {
        // Verify the room belongs to the user
        const room = await ctx.db.get(args.id);
        
        if (!room) {
            throw new Error('Discussion room not found');
        }
        
        if (room.uid !== args.uid) {
            throw new Error('Unauthorized: You can only delete your own sessions');
        }

        await ctx.db.delete(args.id);
        return { success: true, deletedId: args.id };
    }
});

// Get paginated discussion rooms
export const GetPaginatedDiscussionRooms = query({
    args: {
        uid: v.id('users'),
        limit: v.optional(v.number()),
        cursor: v.optional(v.string())
    },
    handler: async (ctx, args) => {
        const limit = args.limit || 10;
        
        let query = ctx.db.query('DiscussionRoom')
            .filter(q => q.eq(q.field('uid'), args.uid))
            .order('desc');
        
        const results = await query.take(limit + 1);
        
        const hasMore = results.length > limit;
        const items = hasMore ? results.slice(0, limit) : results;
        const nextCursor = hasMore && items.length > 0 ? items[items.length - 1]._id : null;
        
        return {
            items,
            hasMore,
            nextCursor
        };
    }
});