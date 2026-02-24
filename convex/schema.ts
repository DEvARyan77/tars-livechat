import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    avatarUrl: v.optional(v.string()),
  }).index("by_clerkId", ["clerkId"]),

  conversations: defineTable({
    participants: v.array(v.id("users")), // sorted array of user IDs (always two for direct)
    lastMessageId: v.optional(v.id("messages")),
    updatedAt: v.number(), // timestamp for sorting
  }).index("by_participants", ["participants"]),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    content: v.string(),
    timestamp: v.number(),
    deleted: v.boolean(),
  }).index("by_conversation", ["conversationId"]),
});