import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Get or create a direct conversation between two users
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
    });
  },
});

// Get all conversations for a user, enriched with other participant and last message
export const getUserConversations = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const allConvs = await ctx.db.query("conversations").collect();
    const userConvs = allConvs.filter((c) => c.participants.includes(args.userId));
    userConvs.sort((a, b) => b.updatedAt - a.updatedAt);

    return await Promise.all(
      userConvs.map(async (conv) => {
        const otherParticipantId = conv.participants.find((id) => id !== args.userId);
        const otherUser = otherParticipantId ? await ctx.db.get(otherParticipantId) : null;
        const lastMessage = conv.lastMessageId ? await ctx.db.get(conv.lastMessageId) : null;
        return { ...conv, otherUser, lastMessage };
      })
    );
  },
});