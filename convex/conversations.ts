import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getOrCreateDirectConversation = mutation({
  args: {
    currentUserId: v.id("users"),
    otherUserId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const participants = [args.currentUserId, args.otherUserId].sort();
    const existing = await ctx.db
      .query("conversations")
      .withIndex("by_participants", (q) => q.eq("participants", participants))
      .first();
    if (existing) return existing._id;

    const now = Date.now();
    return await ctx.db.insert("conversations", {
      participants,
      updatedAt: now,
      lastSeen: {},
    });
  },
});

export const getUserConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const allConvs = await ctx.db.query("conversations").collect();
    const userConvs = allConvs.filter((c) =>
      c.participants.includes(args.userId),
    );
    userConvs.sort((a, b) => b.updatedAt - a.updatedAt);

    return await Promise.all(
      userConvs.map(async (conv) => {
        const otherParticipantId = conv.participants.find(
          (id: string) => id !== args.userId,
        );
        const otherUser = otherParticipantId
          ? await ctx.db.get(otherParticipantId)
          : null;
        const lastMessage = conv.lastMessageId
          ? await ctx.db.get(conv.lastMessageId)
          : null;

        const lastSeenMap = conv.lastSeen || {};
        const myLastSeen = lastSeenMap[args.userId] || 0;

        const unreadMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .filter((q) => q.gt(q.field("timestamp"), myLastSeen))
          .filter((q) => q.neq(q.field("senderId"), args.userId))
          .collect();

        return {
          ...conv,
          otherUser,
          lastMessage,
          unreadCount: unreadMessages.length,
        };
      }),
    );
  },
});

export const markAsRead = mutation({
  args: { conversationId: v.id("conversations"), userId: v.id("users") },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return;
    const lastSeen = conv.lastSeen || {};
    lastSeen[args.userId] = Date.now();
    await ctx.db.patch(args.conversationId, { lastSeen });
  },
});

export const updateTypingStatus = mutation({
  args: { 
    conversationId: v.id("conversations"), 
    userId: v.id("users"),
    isTyping: v.boolean() 
  },
  handler: async (ctx, args) => {
    const conv = await ctx.db.get(args.conversationId);
    if (!conv) return;

    const typingIndicators = conv.typingIndicators || {};
    
    if (args.isTyping) {
      typingIndicators[args.userId] = Date.now();
    } else {
      delete typingIndicators[args.userId];
    }

    await ctx.db.patch(args.conversationId, { typingIndicators });
  },
});

export const getConversation = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.conversationId);
  },
});
