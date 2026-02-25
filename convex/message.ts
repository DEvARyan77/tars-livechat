import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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

export const list = query({
  args: { conversationId: v.id("conversations") },
  handler: async (ctx, args) => {
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_conversation", (q) =>
        q.eq("conversationId", args.conversationId),
      )
      .collect();
    return messages.sort((a, b) => a.timestamp - b.timestamp);
  },
});

export const deleteMessage = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) return;

    if (!message || message.senderId !== args.userId) {
      throw new Error("Unauthorized to delete this message");
    }

    await ctx.db.patch(args.messageId, {
      content: "This message was deleted",
      deleted: true,
    });
  },
});

export const hideMessageFromView = mutation({
  args: {
    messageId: v.id("messages"),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message) return;

    const hiddenBy = message.hiddenBy || [];
    if (!hiddenBy.includes(args.userId)) {
      await ctx.db.patch(args.messageId, {
        hiddenBy: [...hiddenBy, args.userId],
      });
    }
  },
});

export const toggleReaction = mutation({
  args: {
    messageId: v.id("messages"),
    emoji: v.string(),
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const message = await ctx.db.get(args.messageId);
    if (!message || message.deleted) return;

    const reactions = message.reactions || {};
    const usersWhoReacted = reactions[args.emoji] || [];

    if (usersWhoReacted.includes(args.userId)) {
      reactions[args.emoji] = usersWhoReacted.filter(
        (id) => id !== args.userId,
      );
      if (reactions[args.emoji].length === 0) delete reactions[args.emoji];
    } else {
      reactions[args.emoji] = [...usersWhoReacted, args.userId];
    }

    await ctx.db.patch(args.messageId, { reactions });
  },
});
