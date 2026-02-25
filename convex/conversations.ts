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
        let otherUser = null;

        if (!conv.isGroup) {
          const otherParticipantId = conv.participants.find(
            (id) => id !== args.userId,
          );

          const otherUserDoc = otherParticipantId
            ? await ctx.db.get(otherParticipantId)
            : null;

          otherUser = otherUserDoc
            ? {
                _id: otherUserDoc._id,
                clerkId: otherUserDoc.clerkId,
                name: otherUserDoc.name,
                avatarUrl: otherUserDoc.avatarUrl,
              }
            : null;
        }

        const recentMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .order("desc")
          .take(10);

        const lastMessageDoc = recentMessages.find(
          (msg) => !msg.hiddenBy?.includes(args.userId),
        );

        const lastMessage = lastMessageDoc
          ? {
              content: lastMessageDoc.content,
              timestamp: lastMessageDoc.timestamp,
              deleted: lastMessageDoc.deleted,
            }
          : null;

        const lastSeenMap = (conv.lastSeen as Record<string, number>) || {};
        const myLastSeen = lastSeenMap[args.userId] || 0;

        const unreadMessages = await ctx.db
          .query("messages")
          .withIndex("by_conversation", (q) => q.eq("conversationId", conv._id))
          .filter((q) => q.gt(q.field("timestamp"), myLastSeen))
          .filter((q) => q.neq(q.field("senderId"), args.userId))
          .collect();

        const unreadCount = unreadMessages.filter(
          (msg) => !msg.hiddenBy?.includes(args.userId),
        ).length;

        return {
          ...conv,
          otherUser,
          groupName: conv.name || null,
          memberCount: conv.participants.length,
          lastMessage,
          unreadCount,
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
    isTyping: v.boolean(),
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

export const createGroup = mutation({
  args: {
    name: v.string(),
    participantIds: v.array(v.id("users")),
    adminId: v.id("users"),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("conversations", {
      name: args.name,
      isGroup: true,
      participants: args.participantIds,
      admin: args.adminId,
      updatedAt: Date.now(),
      lastSeen: { [args.adminId]: Date.now() },
    });
  },
});
