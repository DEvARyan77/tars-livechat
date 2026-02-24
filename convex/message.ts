import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Send a message
export const send = mutation({
  args: {
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const messageId = await ctx.db.insert("messages", {
      conversationId: args.conversationId,
      senderId: args.senderId,
      content: args.content,
      timestamp: now,
      deleted: false,
    });
    await ctx.db.patch(args.conversationId, {
      updatedAt: now,
      lastMessageId: messageId,
    });
    return messageId;
  },
});

// Get messages for a conversation (sorted ascending)
export const list = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
      .collect();
    return messages.sort((a, b) => a.timestamp - b.timestamp);
  },
});